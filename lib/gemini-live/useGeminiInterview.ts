"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createGeminiAudioController, type GeminiAudioController } from "./audio";

export type GeminiAgentState =
  | "speaking"
  | "listening"
  | "thinking"
  | "connecting"
  | "idle"
  | null;

export type GeminiConnectionStatus = "idle" | "connecting" | "connected" | "ended";

export interface GeminiTranscriptEntry {
  role: "user" | "agent";
  text: string;
  receivedAt: number;
}

export interface GeminiEndedInfo {
  /** Server-provided reason (e.g. "agent_ended", "timeout") if any. */
  reason: string | null;
  /** WebSocket close code — useful for distinguishing tab-close vs network drop. */
  code?: number;
  /** Optional close reason string from the ws frame. */
  closeReason?: string;
}

export interface UseGeminiInterviewOptions {
  /** Absolute or relative WS URL returned by the `bootstrap` endpoint. */
  wsUrl: string | null;
  /** Only allow `start()` once the backend says the candidate can start. */
  canStart: boolean;
  /** Fired once per connection lifecycle; server provides the reason. */
  onEnded?: (info: GeminiEndedInfo) => void;
  /** Fired on unrecoverable errors. */
  onError?: (error: Error) => void;
}

export interface UseGeminiInterviewReturn {
  status: GeminiConnectionStatus;
  agentState: GeminiAgentState;
  transcript: GeminiTranscriptEntry[];
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

// The backend `bootstrap` endpoint always returns an absolute `ws://…` /
// `wss://…` URL with scheme + host resolved server-side (via the
// `GEMINI_WS_PUBLIC_URL` setting or `X-Forwarded-Proto` headers). We trust
// it verbatim and reject anything that isn't absolute.
function resolveWsUrl(raw: string | null): string | null {
  return raw && /^wss?:\/\//i.test(raw) ? raw : null;
}

/**
 * Owns the lifetime of one candidate voice session:
 *   HTTP bootstrap URL  ➜  native WebSocket  ➜  PCM16 audio both ways.
 *
 * The hook is tolerant of React 18 StrictMode double-invocation: `start` is
 * idempotent per active connection, and teardown is serialized via a guard
 * flag so we never close the same ws/audio twice.
 */
export function useGeminiInterview(
  opts: UseGeminiInterviewOptions,
): UseGeminiInterviewReturn {
  const { wsUrl, canStart, onEnded, onError } = opts;

  const [status, setStatus] = useState<GeminiConnectionStatus>("idle");
  const [agentState, setAgentState] = useState<GeminiAgentState>("idle");
  const [transcript, setTranscript] = useState<GeminiTranscriptEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<GeminiAudioController | null>(null);
  const tearingDownRef = useRef(false);
  const endedHandledRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);

  // Keep callbacks fresh without re-triggering start/stop memoization.
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stop = useCallback(async () => {
    if (tearingDownRef.current) return;
    tearingDownRef.current = true;
    try {
      const ws = wsRef.current;
      if (ws) {
        wsRef.current = null;
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "end" }));
          }
        } catch {
          /* ignore */
        }
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      }
      const audio = audioRef.current;
      if (audio) {
        audioRef.current = null;
        try {
          await audio.stop();
        } catch {
          /* ignore */
        }
      }
    } finally {
      tearingDownRef.current = false;
      setStatus((prev) => (prev === "ended" ? prev : "idle"));
      setAgentState((prev) => (prev === null ? null : "idle"));
    }
  }, []);

  const start = useCallback(async () => {
    if (!canStart) {
      onErrorRef.current?.(new Error("Interview session is not ready yet."));
      return;
    }
    const resolved = resolveWsUrl(wsUrl);
    if (!resolved) {
      onErrorRef.current?.(new Error("Missing interview session URL."));
      return;
    }
    if (wsRef.current || audioRef.current) {
      // Session already running — ignore duplicate start.
      return;
    }

    setStatus("connecting");
    setAgentState("connecting");
    setTranscript([]);
    endedHandledRef.current = false;

    const audio = createGeminiAudioController();
    audioRef.current = audio;

    let ws: WebSocket;
    try {
      ws = new WebSocket(resolved);
    } catch (err) {
      audioRef.current = null;
      setStatus("idle");
      setAgentState("idle");
      onErrorRef.current?.(err instanceof Error ? err : new Error("WebSocket open failed"));
      return;
    }
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = async () => {
      try {
        await audio.start((pcm16) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcm16);
          }
        });
        setStatus("connected");
        setAgentState("listening");
      } catch (err) {
        onErrorRef.current?.(err instanceof Error ? err : new Error("Microphone start failed"));
        await stop();
      }
    };

    ws.onmessage = (evt) => {
      if (typeof evt.data === "string") {
        handleControlFrame(evt.data);
        return;
      }
      if (evt.data instanceof ArrayBuffer) {
        audioRef.current?.playAudio(evt.data);
        return;
      }
      if (evt.data instanceof Blob) {
        // Safari sometimes delivers Blob even with binaryType="arraybuffer".
        void evt.data.arrayBuffer().then((buf) => audioRef.current?.playAudio(buf));
      }
    };

    ws.onerror = () => {
      onErrorRef.current?.(new Error("WebSocket error"));
    };

    ws.onclose = (evt) => {
      if (!endedHandledRef.current) {
        endedHandledRef.current = true;
        onEndedRef.current?.({
          reason: null,
          code: evt.code,
          closeReason: evt.reason,
        });
      }
      setStatus("ended");
      setAgentState(null);
      void stop();
    };

    function handleControlFrame(raw: string): void {
      let msg: { type?: string; role?: "user" | "agent"; text?: string; reason?: string };
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      switch (msg.type) {
        case "ready":
          break;
        case "speaking":
          setAgentState("speaking");
          break;
        case "listening":
          setAgentState("listening");
          break;
        case "thinking":
          setAgentState("thinking");
          break;
        case "interrupted":
          audioRef.current?.stopPlayback();
          setAgentState("listening");
          break;
        case "transcript":
          if (msg.role && msg.text) {
            const entry: GeminiTranscriptEntry = {
              role: msg.role,
              text: msg.text,
              receivedAt: Date.now(),
            };
            setTranscript((prev) => [...prev, entry]);
          }
          break;
        case "ended":
          if (!endedHandledRef.current) {
            endedHandledRef.current = true;
            onEndedRef.current?.({ reason: msg.reason ?? null });
          }
          setStatus("ended");
          setAgentState(null);
          break;
        case "error":
          onErrorRef.current?.(new Error(msg.text ?? "Agent error"));
          break;
      }
    }
  }, [canStart, wsUrl, stop]);

  // Teardown on unmount — fires after the component truly goes away.
  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return { status, agentState, transcript, start, stop };
}
