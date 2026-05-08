import { apiClient } from "./client";
import { SQUAD_API_PATHS } from "./squad-endpoints";
import type { ApiEnvelope } from "@/lib/auth/types";
import type { Squad, SquadDetail, SquadList } from "@/lib/squads/types";

export type SquadCreatePayload = {
  name: string;
  description?: string;
  member_ids?: string[];
};

export type SquadUpdatePayload = Partial<{
  name: string;
  description: string;
}>;

export const squadsApi = {
  list: async (): Promise<ApiEnvelope<SquadList>> => {
    const { data } = await apiClient.get<ApiEnvelope<SquadList>>(
      SQUAD_API_PATHS.list,
    );
    return data;
  },

  get: async (id: string): Promise<ApiEnvelope<SquadDetail>> => {
    const { data } = await apiClient.get<ApiEnvelope<SquadDetail>>(
      SQUAD_API_PATHS.detail(id),
    );
    return data;
  },

  create: async (
    payload: SquadCreatePayload,
  ): Promise<ApiEnvelope<SquadDetail>> => {
    const { data } = await apiClient.post<ApiEnvelope<SquadDetail>>(
      SQUAD_API_PATHS.create,
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: SquadUpdatePayload,
  ): Promise<ApiEnvelope<SquadDetail>> => {
    const { data } = await apiClient.patch<ApiEnvelope<SquadDetail>>(
      SQUAD_API_PATHS.update(id),
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(SQUAD_API_PATHS.remove(id));
  },

  uploadAvatar: async (
    id: string,
    file: File,
  ): Promise<ApiEnvelope<SquadDetail>> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ApiEnvelope<SquadDetail>>(
      SQUAD_API_PATHS.uploadAvatar(id),
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  addMembers: async (
    id: string,
    userIds: string[],
  ): Promise<ApiEnvelope<SquadDetail>> => {
    const { data } = await apiClient.post<ApiEnvelope<SquadDetail>>(
      SQUAD_API_PATHS.addMembers(id),
      { user_ids: userIds },
    );
    return data;
  },

  removeMember: async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(SQUAD_API_PATHS.removeMember(id, userId));
  },
};

export type { Squad, SquadDetail, SquadList };
