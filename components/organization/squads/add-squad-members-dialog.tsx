"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { parseApiError, squadsApi } from "@/lib/api";

import { MemberPickerDialog } from "./member-picker-dialog";

export function AddSquadMembersDialog({
  open,
  onClose,
  squadId,
  existingMemberIds,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  squadId: string;
  existingMemberIds: string[];
  onAdded: () => void;
}) {
  const addMutation = useMutation({
    mutationFn: (userIds: string[]) => squadsApi.addMembers(squadId, userIds),
    onSuccess: () => {
      toast.success("Members added");
      onAdded();
      onClose();
    },
    onError: (error) =>
      toast.error("Couldn't add members", {
        description: parseApiError(error),
      }),
  });

  return (
    <MemberPickerDialog
      open={open}
      onClose={onClose}
      initialSelectedIds={[]}
      excludeIds={existingMemberIds}
      title="Add members to squad"
      confirmLabel="Add"
      isSubmitting={addMutation.isPending}
      onConfirm={(userIds) => {
        if (userIds.length === 0) {
          toast.info("Select at least one member");
          return;
        }
        addMutation.mutate(userIds);
      }}
    />
  );
}
