"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Building2, Camera, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { orgsApi, parseApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  ORG_LOGO_ACCEPTED_TYPES,
  ORG_LOGO_MAX_BYTES,
  ORG_SIZE_OPTIONS,
  orgUpdateSchema,
  type OrgUpdateFormValues,
} from "@/lib/orgs/schemas";
import { canEditOrg } from "@/lib/orgs/permissions";
import { cn } from "@/lib/ui/cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function orgInitials(name: string | null | undefined): string {
  const parts = (name || "").trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0 || !parts[0]) return "";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export function OrgDetailsPanel() {
  const role = useAuthStore((s) => s.user?.current_org_role);
  const canEdit = canEditOrg(role);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: envelope, isLoading } = useQuery({
    queryKey: ["org", "me"],
    queryFn: () => orgsApi.getMe(),
  });
  const org = envelope?.data ?? null;

  const form = useForm<OrgUpdateFormValues>({
    resolver: zodResolver(orgUpdateSchema),
    defaultValues: {
      name: "",
      contact_email: "",
      website: "",
      description: "",
      industry: "",
      size: "",
      location: "",
      timezone: "",
      billing_email: "",
      phone: "",
      linkedin_url: "",
    },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name ?? "",
        contact_email: org.contact_email ?? "",
        website: org.website ?? "",
        description: org.description ?? "",
        industry: org.industry ?? "",
        size: org.size ?? "",
        location: org.location ?? "",
        timezone: org.timezone ?? "",
        billing_email: org.billing_email ?? "",
        phone: org.phone ?? "",
        linkedin_url: org.linkedin_url ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);

  const updateMutation = useMutation({
    mutationFn: (values: OrgUpdateFormValues) => {
      const payload: OrgUpdateFormValues = {};
      (Object.keys(values) as (keyof OrgUpdateFormValues)[]).forEach((k) => {
        const v = values[k];
        if (v !== undefined && v !== "") payload[k] = v as never;
      });
      return orgsApi.update(payload);
    },
    onSuccess: (res) => {
      if (res.data) {
        queryClient.setQueryData(["org", "me"], res);
      }
      toast.success("Organization updated", {
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast.error("Couldn't update organization", {
        description: parseApiError(error),
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => orgsApi.uploadLogo(file),
    onSuccess: (res) => {
      if (res.data) {
        queryClient.setQueryData(["org", "me"], res);
      }
      toast.success("Logo updated", {
        description: "Your organization logo has been saved.",
      });
    },
    onError: (error) => {
      toast.error("Couldn't upload logo", {
        description: parseApiError(error),
      });
    },
  });

  const processFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!ORG_LOGO_ACCEPTED_TYPES.includes(file.type as (typeof ORG_LOGO_ACCEPTED_TYPES)[number])) {
      toast.error("Unsupported image", {
        description: "Please choose a PNG, JPEG, WebP, or SVG image.",
      });
      return;
    }
    if (file.size > ORG_LOGO_MAX_BYTES) {
      toast.error("Image is too large", {
        description: "Maximum size is 5 MB.",
      });
      return;
    }
    uploadLogoMutation.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    processFile(file);
  };

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(values);
  });

  const initials = orgInitials(org?.name);
  const isUploading = uploadLogoMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Logo card */}
      <section
        className={cn(
          "rounded-[12px] border border-[var(--border-color-light)] bg-[var(--background-color)] p-6 dark:border-white/[0.09]",
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                setIsDragging(false);
                processFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "relative h-24 w-24 shrink-0 rounded-[14px] transition-all",
                isDragging &&
                  "ring-4 ring-[var(--primary-color)]/40 ring-offset-2 ring-offset-transparent scale-[1.02]",
              )}
            >
              <button
                type="button"
                onClick={() => canEdit && fileInputRef.current?.click()}
                aria-label="Change organization logo"
                disabled={!canEdit || isUploading}
                className={cn(
                  "group flex h-24 w-24 items-center justify-center overflow-hidden rounded-[14px] border-2 text-[20px] font-bold outline-none transition-all",
                  "border-white shadow-[0_8px_24px_-8px_rgba(var(--shadow-rgb),0.35)] dark:border-white/10",
                  canEdit && "focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]/30",
                  !canEdit && "cursor-not-allowed opacity-90",
                )}
              >
                {org?.logo_signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.logo_signed_url}
                    alt={org.name ?? "Organization logo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--primary-color)_0%,color-mix(in_oklab,var(--primary-color)_70%,#000)_100%)] text-white">
                    {initials || <Building2 className="h-8 w-8" strokeWidth={1.75} />}
                  </div>
                )}
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload a new logo"
                  disabled={isUploading}
                  className={cn(
                    "absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--primary-color)] text-white shadow-[0_4px_12px_-2px_rgba(var(--shadow-rgb),0.4)] outline-none transition-all",
                    "hover:bg-[var(--primary-color-hover,var(--primary-color))] hover:scale-105",
                    "focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]/30",
                    "disabled:cursor-not-allowed disabled:opacity-80",
                    "dark:border-[var(--surface-2)]",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  ) : (
                    <Camera className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </button>
              )}
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-foreground">
                {org?.name || "Your organization"}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {canEdit
                  ? "Upload a square image — PNG, JPEG, WebP, or SVG up to 5 MB."
                  : "Only admins and owners can change the organization logo."}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ORG_LOGO_ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </section>

      {/* Details form */}
      <form
        onSubmit={onSubmit}
        className="rounded-[12px] border border-[var(--border-color-light)] bg-[var(--background-color)] p-6 dark:border-white/[0.09]"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-foreground">Details</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {canEdit
                ? "Update your company profile — all fields except name are optional."
                : "Viewing as a member. Ask an owner or admin to make changes."}
            </p>
          </div>
        </div>

        <fieldset disabled={!canEdit || updateMutation.isPending} className="space-y-8">
          <Section title="Identity">
            <Grid>
              <Field label="Company name" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} placeholder="Acme, Inc." className="h-11 rounded-xl" />
              </Field>
              <Field label="Industry" error={form.formState.errors.industry?.message}>
                <Input {...form.register("industry")} placeholder="e.g. Software" className="h-11 rounded-xl" />
              </Field>
              <Field label="Company size" error={form.formState.errors.size?.message}>
                <Controller
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORG_SIZE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Location" error={form.formState.errors.location?.message}>
                <Input {...form.register("location")} placeholder="San Francisco, USA" className="h-11 rounded-xl" />
              </Field>
              <Field
                label="Description"
                error={form.formState.errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  {...form.register("description")}
                  placeholder="What does your organization do?"
                  className="min-h-[96px] rounded-xl"
                  rows={3}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Contact">
            <Grid>
              <Field label="Contact email" error={form.formState.errors.contact_email?.message}>
                <Input {...form.register("contact_email")} type="email" placeholder="hello@acme.com" className="h-11 rounded-xl" />
              </Field>
              <Field label="Billing email" error={form.formState.errors.billing_email?.message}>
                <Input {...form.register("billing_email")} type="email" placeholder="billing@acme.com" className="h-11 rounded-xl" />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} placeholder="+1 555 123 4567" className="h-11 rounded-xl" />
              </Field>
              <Field label="Timezone" error={form.formState.errors.timezone?.message}>
                <Input {...form.register("timezone")} placeholder="America/New_York" className="h-11 rounded-xl" />
              </Field>
            </Grid>
          </Section>

          <Section title="Presence">
            <Grid>
              <Field label="Website" error={form.formState.errors.website?.message}>
                <Input {...form.register("website")} placeholder="https://acme.com" className="h-11 rounded-xl" />
              </Field>
              <Field label="LinkedIn" error={form.formState.errors.linkedin_url?.message}>
                <Input
                  {...form.register("linkedin_url")}
                  placeholder="https://linkedin.com/company/acme"
                  className="h-11 rounded-xl"
                />
              </Field>
            </Grid>
          </Section>

          {canEdit && (
            <div className="flex items-center justify-between border-t border-[var(--border-color-light)] pt-5 dark:border-white/[0.09]">
              <p className="text-[12px] text-[var(--text-muted)]">
                {form.formState.isDirty ? "You have unsaved changes" : "Everything is up to date"}
              </p>
              <div className="flex items-center gap-2">
                {form.formState.isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => org && form.reset()}
                    className="h-10 rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-[var(--primary-color)] px-5 font-semibold hover:bg-[var(--primary-color-hover)]"
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                >
                  {updateMutation.isPending ? "Saving…" : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[12px] text-[var(--error-color)]">{error}</p>
      )}
    </div>
  );
}
