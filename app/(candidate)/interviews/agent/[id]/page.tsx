"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, CheckCircle2, Mic, PhoneOff } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// `Orb` pulls in `three` + `@react-three/fiber` (~1.7 MB). Lazy-load so the
// three.js chunk is deferred until after hydration.
const NewOrb = dynamic(
  () => import("@/components/ui/orb").then((m) => m.Orb),
  { ssr: false, loading: () => null },
);
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/ui/cn";
import { interviewsGeminiApi, type GeminiBootstrapData } from "@/lib/api/interviewsGemini";
import {
  useGeminiInterview,
  type GeminiAgentState,
  type GeminiEndedInfo,
} from "@/lib/gemini-live/useGeminiInterview";

function mapOrbState(state: GeminiAgentState): "talking" | "listening" | "thinking" | null {
  switch (state) {
    case "speaking":
      return "talking";
    case "listening":
      return "listening";
    case "thinking":
    case "connecting":
      return "thinking";
    case "idle":
    default:
      return null;
  }
}

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

export default function GeminiVoiceAgentPage({ params }: AgentPageProps) {
  const { id: candidateId } = use(params);

  const [countdownText, setCountdownText] = useState("");
  const [isFutureDate, setIsFutureDate] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["gemini-agent-data", candidateId],
    queryFn: async () => {
      const json = await interviewsGeminiApi.getBootstrap(candidateId);
      if (json?.error === "not_found" || json?.data == null) {
        throw new Error("Failed to load interview. Please try again.");
      }
      return json.data as GeminiBootstrapData;
    },
    enabled: !!candidateId,
    retry: false,
  });

  const interviewStatus: string | null = data?.status ?? null;
  const isLocked = interviewStatus === "completed" || interviewStatus === "rescheduled";

  const handleError = useCallback((err: Error) => {
    toast.error("Voice Agent Error", { description: err.message });
  }, []);

  const handleEnded = useCallback((info: GeminiEndedInfo) => {
    // Surface close context to the browser console so post-mortems on
    // "interview cut short" reports can distinguish user-initiated close
    // (1000/1001) from network drop (1006) from server-side close.
    // eslint-disable-next-line no-console
    console.info("[interview] session ended", info);
  }, []);

  const { status: connectionStatus, agentState, start, stop } = useGeminiInterview({
    wsUrl: data?.ws_url ?? null,
    canStart: Boolean(data?.can_start),
    onError: handleError,
    onEnded: handleEnded,
  });

  const isConnecting = connectionStatus === "connecting";
  const isConnected = connectionStatus === "connected";
  const hasEnded = connectionStatus === "ended";

  // Elapsed timer — starts ticking the moment the WS connects, freezes when
  // the interview ends so the candidate can see the final duration.
  useEffect(() => {
    if (!isConnected) return;
    const startedAt = Date.now();
    setElapsedSeconds(0);
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isConnected]);

  const elapsedText = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  // Guard against accidental tab close / reload / back-nav mid-interview.
  // The browser will show its generic "Leave site?" prompt; we can't
  // customize the text in modern browsers, but any prompt is better than
  // a silent disconnect that ends the session.
  useEffect(() => {
    if (!isConnected) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isConnected]);

  // Countdown until scheduled start (same behaviour as the Vapi page).
  useEffect(() => {
    if (!data?.schedule_date) {
      setIsFutureDate(false);
      return;
    }
    const target = new Date(data.schedule_date);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setIsFutureDate(false);
        refetch();
        return false;
      }
      setIsFutureDate(true);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownText(`${d}d ${h}h ${m}m ${s}s`);
      return true;
    };
    if (!tick()) return;
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [data?.schedule_date, refetch]);

  const buttonText = hasEnded
    ? "Interview Ended"
    : isConnected
      ? "End Interview"
      : isConnecting
        ? "Connecting..."
        : "Start Interview";

  const handleStartClick = () => {
    if (isLocked || hasEnded) return;
    if (isConnected) {
      void stop();
      return;
    }
    if (!data?.can_start) {
      toast.error("Not Ready", { description: "The interview session is not ready yet." });
      return;
    }
    setIsWarningOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Loading interview…</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--error-color)]/30 text-center flex flex-col items-center gap-4 shadow-xl">
          <AlertCircle className="h-12 w-12 text-[var(--error-color)]" />
          <h2 className="text-xl font-bold text-foreground">Failed to Load</h2>
          <p className="text-muted-foreground">
            The interview configuration could not be loaded. Please ensure your link is valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 sm:py-4 relative overflow-hidden selection:bg-[var(--primary-color)]/30">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-color-rgb),0.08),transparent_70%)]" />

      <div className="w-full max-w-[640px] flex flex-col items-center px-5 py-6 sm:px-8 sm:py-8 rounded-[28px] bg-[var(--surface-1)] border border-[var(--border-color-light)] dark:border-white/5 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[var(--primary-color)]/20">
            AI Voice Interview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1.5">
            ReechOut AI Assistant
          </h1>
          <p className="text-[13px] sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isFutureDate
              ? "Your interview is scheduled to begin shortly."
              : "When ready, click start and grant microphone access to begin."}
          </p>
        </div>

        {/* Orb (purely decorative — every layer is pointer-events-none so clicks pass to the button below) */}
        <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] mb-4 sm:mb-6 flex items-center justify-center pointer-events-none">
          {isConnected && (
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-color)]/20 animate-ping opacity-40 scale-[1.15] pointer-events-none" />
          )}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--border-color-light)] dark:border-white/5 shadow-inner opacity-20 pointer-events-none" />
          <div className="w-[85%] h-[85%] relative z-10 pointer-events-none">
            <NewOrb agentState={mapOrbState(agentState)} colors={["#611f69", "#a76abc"]} />
          </div>
        </div>

        {/* Interaction area */}
        <div className="flex flex-col items-center w-full max-w-sm">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-color-light)] dark:border-white/5 w-full text-center">
              {interviewStatus === "completed" ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-[var(--success-color)]" />
                  <span className="text-base font-bold text-foreground">Interview already completed</span>
                  <span className="text-xs text-muted-foreground">
                    Thanks for participating. You can close this window.
                  </span>
                </>
              ) : (
                <>
                  <CalendarClock className="w-7 h-7 text-[var(--warning-color)]" />
                  <span className="text-base font-bold text-foreground">Interview rescheduled</span>
                  <span className="text-xs text-muted-foreground">
                    Check your email for the updated invite link.
                  </span>
                </>
              )}
            </div>
          ) : isFutureDate ? (
            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-color-light)] dark:border-white/5 w-full text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Starts In</span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--primary-color)] tracking-tight tabular-nums">
                {countdownText}
              </span>
              <span className="text-xs text-muted-foreground">
                Please wait for the timer to complete to connect.
              </span>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleStartClick}
              disabled={hasEnded || isConnecting || (!isConnected && !data.can_start)}
              className={cn(
                "w-full h-14 rounded-xl text-base font-bold shadow-lg transition-all duration-300",
                isConnected
                  ? "bg-[var(--error-color)] hover:bg-[var(--error-color)]/90 text-white shadow-[var(--error-color)]/20"
                  : "bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color-hover)] hover:opacity-90 text-white shadow-[var(--primary-color)]/30",
              )}
            >
              {isConnecting ? (
                <span>{buttonText}</span>
              ) : isConnected ? (
                <span className="flex items-center gap-2.5">
                  <PhoneOff className="w-5 h-5" />
                  {buttonText}
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <Mic className="w-5 h-5" />
                  {buttonText}
                </span>
              )}
            </Button>
          )}

          {/* Status indicator — fixed height so layout doesn't jump when it appears */}
          <div className="h-6 mt-3 flex items-center justify-center gap-3">
            {isConnected && (
              <>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                      agentState === "speaking"
                        ? "bg-[var(--primary-color)] text-[var(--primary-color)] animate-pulse"
                        : agentState === "listening"
                          ? "bg-[var(--success-color)] text-[var(--success-color)]"
                          : "bg-[var(--warning-color)] text-[var(--warning-color)]",
                    )}
                  />
                  {agentState === "speaking"
                    ? "Agent is speaking…"
                    : agentState === "listening"
                      ? "Listening…"
                      : "Thinking…"}
                </div>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums animate-in fade-in">
                  {elapsedText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Important Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Once you start the interview, you cannot cancel it. Please ensure you are ready before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsWarningOpen(false);
                void start();
              }}
            >
              I Understand, Start Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
