"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Search,
  User as UserIcon,
  Edit,
  Trash,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { FloatingBtn } from "@/components/floating-btn";
import { questionnairesApi, type Questionnaire } from "@/lib/api/questionnaires";
import { useQuestionnaireListFcmInvalidation } from "@/hooks/use-questionnaire-list-fcm-invalidation";
import { useAuthStore } from "@/lib/store/auth.store";
import { canManageContent } from "@/lib/orgs/permissions";
import {
  mapCreateFormToApiBody,
  type CreateQuestionnaireModalState,
} from "@/lib/questionnaires/map-create-payload";
import { cn } from "@/lib/ui/cn";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Modal Components
import { DeleteQuestionnaireModal } from "./components/delete-questionnaire-modal";
import { UpdateQuestionnaireModal } from "./components/update-questionnaire-modal";
import { CreateQuestionnaireModal } from "./components/create-questionnaire-modal";

type ViewMode = "grid" | "list";

const VIEW_MODE_STORAGE_KEY = "questionnaire_view_mode";

function isProcessingStatus(status: Questionnaire["status"] | undefined) {
  return status === "pending" || status === "processing";
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || "all"} onValueChange={(val) => onChange(val === "all" ? "" : val)}>
      <SelectTrigger className="h-10 min-w-[140px] rounded-[6px] border border-[var(--header-floating-border)] bg-background shadow-sm focus:ring-primary">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any {label.toLowerCase()}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


import { Suspense } from "react";

function QuestionnairesDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [questionsFilter, setQuestionsFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModeHydrated, setViewModeHydrated] = useState(false);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const currentOrgRole = useAuthStore((s) => s.user?.current_org_role);
  const canManage = canManageContent(currentOrgRole);

  const targetClasses = 'rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] shadow-[0_4px_32px_rgba(var(--shadow-rgb),0.09),0_1px_4px_rgba(var(--shadow-rgb),0.05)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[rgba(var(--primary-color-rgb),0.28)] hover:shadow-[0_20px_40px_rgba(var(--shadow-rgb),0.08)] dark:hover:border-[rgba(var(--accent-violet-rgb),0.35)]';
  const pillClasses = "inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--primary-color-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.08)] to-[rgba(var(--primary-color-rgb),0.04)] px-3.5 py-2 backdrop-blur-md transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(var(--primary-color-rgb),0.25)] hover:from-[rgba(var(--primary-color-rgb),0.12)] hover:to-[rgba(var(--primary-color-rgb),0.06)] hover:shadow-[0_4px_12px_rgba(var(--primary-color-rgb),0.15)]";

  useQuestionnaireListFcmInvalidation();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    } catch {
      /* ignore */
    }
    setViewModeHydrated(true);
  }, []);

  useEffect(() => {
    if (!viewModeHydrated) return;
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode, viewModeHydrated]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateModalOpen(true);
      // Clean up URL
      router.replace("/questionnaires", { scroll: false });
    }
  }, [searchParams, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["questionnaires", page, pageSize],
    queryFn: () => questionnairesApi.getQuestionnaires(page, pageSize),
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load questionnaires");
    }
  }, [error]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnairesApi.deleteQuestionnaire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
      setIsDeleteModalOpen(false);
      setSelectedQuestionnaire(null);
      toast.success("Questionnaire deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete questionnaire");
    },
  });

  const createMutation = useMutation({
    mutationFn: (form: CreateQuestionnaireModalState) =>
      questionnairesApi.createQuestionnaire(mapCreateFormToApiBody(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
      setIsCreateModalOpen(false);
      toast.success("Questionnaire created successfully");
    },
    onError: () => {
      toast.error("Failed to create questionnaire");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      questionnairesApi.updateQuestionnaire(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
      setIsUpdateModalOpen(false);
      setSelectedQuestionnaire(null);
      toast.success("Questionnaire updated successfully");
    },
    onError: () => {
      toast.error("Failed to update questionnaire");
    },
  });

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (item: Questionnaire) => {
    setSelectedQuestionnaire(item);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (item: Questionnaire) => {
    setSelectedQuestionnaire(item);
    setIsDeleteModalOpen(true);
  };

  const navigateToQuestionnaire = (item: Questionnaire) => {
    if (isProcessingStatus(item.status)) {
      toast.info("Questionnaire is being generated…");
      return;
    }
    if (item.id) {
      router.push(`/questionnaires/${item.id}`);
    }
  };

  const filteredQuestionnaires = useMemo(() => {
    if (!data?.results) return [];
    let results = data.results;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      results = results.filter((q) => {
        const titleMatch = q.title?.toLowerCase().includes(lowerQuery) ?? false;
        const detailsMatch = q.details?.toLowerCase().includes(lowerQuery) ?? false;
        const userMatch = q.user?.toLowerCase().includes(lowerQuery) ?? false;
        return titleMatch || detailsMatch || userMatch;
      });
    }

    if (dateFilter) {
      const days = parseInt(dateFilter, 10);
      if (Number.isFinite(days)) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        results = results.filter((q) => {
          if (!q.created_at) return false;
          return new Date(q.created_at) >= cutoff;
        });
      }
    }

    if (questionsFilter) {
      results = results.filter((q) => {
        const n = q.number_of_questions;
        switch (questionsFilter) {
          case "1-5":
            return n >= 1 && n <= 5;
          case "6-10":
            return n >= 6 && n <= 10;
          case "11-20":
            return n >= 11 && n <= 20;
          case "20+":
            return n > 20;
          default:
            return true;
        }
      });
    }

    return results;
  }, [data?.results, searchQuery, dateFilter, questionsFilter]);

  const getStatusClasses = (status: Questionnaire["status"]) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold capitalize tracking-wide backdrop-blur-md transition-all duration-200 hover:-translate-y-[1px] shadow-sm";
    
    switch (status) {
      case "completed":
        return cn(baseClasses, "border-[rgba(var(--success-color-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--success-color-rgb),0.08)] to-[rgba(var(--success-color-rgb),0.04)] text-[var(--success-color)] hover:border-[rgba(var(--success-color-rgb),0.25)] hover:from-[rgba(var(--success-color-rgb),0.12)] hover:to-[rgba(var(--success-color-rgb),0.06)] hover:shadow-[0_4px_12px_rgba(var(--success-color-rgb),0.15)]");
      case "pending":
      case "processing":
        return cn(baseClasses, "border-[rgba(var(--brand-blue-modern-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--brand-blue-modern-rgb),0.08)] to-[rgba(var(--brand-blue-modern-rgb),0.04)] text-[var(--brand-blue-modern)] hover:border-[rgba(var(--brand-blue-modern-rgb),0.25)] hover:from-[rgba(var(--brand-blue-modern-rgb),0.12)] hover:to-[rgba(var(--brand-blue-modern-rgb),0.06)] hover:shadow-[0_4px_12px_rgba(var(--brand-blue-modern-rgb),0.15)]");
      case "failed":
        return cn(baseClasses, "border-[rgba(var(--error-color-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--error-color-rgb),0.08)] to-[rgba(var(--error-color-rgb),0.04)] text-[var(--error-color)] hover:border-[rgba(var(--error-color-rgb),0.25)] hover:from-[rgba(var(--error-color-rgb),0.12)] hover:to-[rgba(var(--error-color-rgb),0.06)] hover:shadow-[0_4px_12px_rgba(var(--error-color-rgb),0.15)]");
      default: // pending
        return cn(baseClasses, "border-[rgba(var(--warning-color-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--warning-color-rgb),0.08)] to-[rgba(var(--warning-color-rgb),0.04)] text-[var(--warning-color)] hover:border-[rgba(var(--warning-color-rgb),0.25)] hover:from-[rgba(var(--warning-color-rgb),0.12)] hover:to-[rgba(var(--warning-color-rgb),0.06)] hover:shadow-[0_4px_12px_rgba(var(--warning-color-rgb),0.15)]");
    }
  };

  const getStatusText = (status: Questionnaire["status"] | string | undefined) => {
    if (!status) return "Unknown";
    if (status === "pending" || status === "processing") return "Generating";
    if (status === "completed") return "Completed";
    if (status === "failed") return "Failed";
    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] pt-2 pb-2 sm:pt-3 sm:pb-3">
      {/* Background Decorative Gradient - inspired by nav aesthetic */}
      <div className="fixed inset-0 -z-10 bg-[var(--background-color)] bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-color-rgb),0.05),transparent_60%)]" />

      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between relative z-20">
        <div className={cn("flex w-full min-h-[52px] flex-col gap-4 rounded-[var(--radius-md)] py-3 px-[clamp(0.875rem,2.5vw,1.125rem)] sm:px-[clamp(1.125rem,3.5vw,1.5rem)] lg:px-[clamp(1.25rem,4vw,2rem)] md:flex-row md:items-center md:justify-between", targetClasses)}>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Date"
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { label: "Last 7 days", value: "7" },
                { label: "Last 30 days", value: "30" },
                { label: "Last 3 months", value: "90" },
                { label: "Last year", value: "365" },
              ]}
            />
            <FilterDropdown
              label="Questions"
              value={questionsFilter}
              onChange={setQuestionsFilter}
              options={[
                { label: "1-5 questions", value: "1-5" },
                { label: "6-10 questions", value: "6-10" },
                { label: "11-20 questions", value: "11-20" },
                { label: "20+ questions", value: "20+" },
              ]}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-[6px] border border-[var(--header-floating-border)] pl-9 bg-background focus-visible:ring-primary placeholder:text-muted-foreground shadow-sm"
              />
            </div>

            {/* View Toggle */}
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(val) => val && setViewMode(val as ViewMode)} 
              className="h-10 items-center gap-0 rounded-[6px] border border-[var(--header-floating-border)] bg-background p-1 shadow-sm"
            >
              <ToggleGroupItem 
                value="grid" 
                aria-label="Grid view" 
                className={cn("h-full w-10 rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground")}
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="list" 
                aria-label="List view" 
                className={cn("h-full w-10 rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground")}
              >
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className={cn(isLoading && "opacity-60 pointer-events-none")}>
        {!isLoading && filteredQuestionnaires.length === 0 ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">No questionnaires found</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {searchQuery ? "Try adjusting your search or filters." : "Click 'New Questionnaire' to create your first template."}
            </p>
          </div>
        ) : (
          <>
            {/* List View */}
            {viewMode === "list" && (
              <div className={cn("rounded-[var(--radius-md)] relative z-10", targetClasses)}>
                {/* Desktop Header */}
                <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.2fr_80px] rounded-t-[calc(var(--radius-md)-1px)] border-b border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] md:grid">
                  <div className="px-2">Questionnaire</div>
                  <div className="px-2">Created By</div>
                  <div className="px-2">Status</div>
                  <div className="px-2">Questions</div>
                  <div className="px-2">Date Added</div>
                  <div className="px-2 text-center">Manage</div>
                </div>
                
                {/* List Items */}
                <div className="flex flex-col divide-y divide-[var(--header-floating-border)]">
                  {(isLoading ? Array(5).fill(null) : filteredQuestionnaires).map((item: Questionnaire | null, i) => (
                    <div
                      key={item?.id || i}
                      onClick={() => { if (!isLoading && item) navigateToQuestionnaire(item); }}
                      className={cn(
                        "group grid grid-cols-1 p-4 transition-colors hover:bg-black/5 md:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_80px] md:px-6 md:py-4 dark:hover:bg-white/5 last:rounded-b-[calc(var(--radius-md)-1px)] cursor-pointer",
                        isLoading && "animate-pulse cursor-default"
                      )}
                    >
                      {/* Title Cell */}
                      <div className="flex flex-col justify-center gap-1 px-2 md:pr-4">
                        {isLoading ? (
                          <>
                            <div className="h-5 w-3/4 rounded-md bg-[var(--border-color-light)]" />
                            <div className="h-4 w-1/2 rounded-md bg-[var(--border-color-light)] opacity-60" />
                          </>
                        ) : (
                          <>
                            <div className="truncate text-[15px] font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-accent-color)]">
                              {item!.title}
                            </div>
                            {item!.details && (
                              <div className="line-clamp-1 text-sm text-[var(--text-secondary)]">
                                {item!.details}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* User Cell */}
                      <div className="hidden items-center px-2 md:flex">
                        {isLoading ? (
                          <div className="h-8 w-24 rounded-full bg-[var(--border-color-light)]" />
                        ) : (
                          <div className={pillClasses}>
                            <UserIcon className="h-4 w-4 text-[var(--primary-color)]" />
                            <span className="max-w-[120px] truncate text-[13px] font-semibold text-[var(--text-primary)]">
                              {item!.user || "Unknown"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Cell */}
                      <div className="hidden items-center px-2 md:flex">
                        {isLoading ? (
                          <div className="h-6 w-20 rounded-full bg-[var(--border-color-light)]" />
                        ) : (
                          <span className={getStatusClasses(item!.status)}>
                            {getStatusText(item!.status)}
                          </span>
                        )}
                      </div>

                      {/* Questions Cell */}
                      <div className="hidden items-center px-2 md:flex">
                        {isLoading ? (
                          <div className="h-6 w-12 rounded-lg bg-[var(--border-color-light)]" />
                        ) : (
                          <div className={pillClasses}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                              Questions:
                            </span>
                            <span className="text-[15px] font-bold leading-none text-[var(--primary-color)]">
                              {item!.status === "completed"
                                ? item!.number_of_questions
                                : "-"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Date Cell */}
                      <div className="hidden items-center px-2 md:flex">
                        {isLoading ? (
                          <div className="h-6 w-24 rounded-lg bg-[var(--border-color-light)]" />
                        ) : (
                          <div className={pillClasses}>
                            <Calendar className="h-4 w-4 text-[var(--primary-color)]" />
                            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                              {format(new Date(item!.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions Cell */}
                      <div className="hidden items-center justify-center px-2 md:flex relative">
                        {isLoading ? (
                          <div className="h-8 w-8 rounded-xl bg-[var(--border-color-light)]" />
                        ) : canManage ? (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button onClick={(e) => e.stopPropagation()} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32 rounded-[6px]" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(item!); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(item!); }} className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : null}
                      </div>

                      {/* Mobile Only: Inline stats & actions */}
                      <div className="mt-4 flex items-center justify-between pt-1 md:hidden relative">
                        {isLoading ? (
                          <div className="h-6 w-full rounded bg-[var(--border-color-light)] opacity-50" />
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className={getStatusClasses(item!.status)}>
                                {getStatusText(item!.status)}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                                <Calendar className="h-3.5 w-3.5 opacity-70" />
                                {format(new Date(item!.created_at), "MMM d")}
                              </div>
                            </div>
                            {canManage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button onClick={(e) => e.stopPropagation()} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 rounded-[6px]" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(item!); }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(item!); }} className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(isLoading ? Array(8).fill(null) : filteredQuestionnaires).map((item: Questionnaire | null, i) => (
                  <div
                    key={item?.id || i}
                    onClick={() => { if (!isLoading && item) navigateToQuestionnaire(item); }}
                    className={cn(
                      cn("group relative flex flex-col overflow-hidden rounded-[var(--radius-md)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--primary-color-rgb)]/30 cursor-pointer", targetClasses),
                      isLoading && "animate-pulse cursor-default"
                    )}
                  >
                    {/* Accent border left */}
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-[var(--primary-color)] to-[var(--primary-color-rgb)]/60 opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    {isLoading ? (
                      <>
                        <div className="mb-2 h-6 w-3/4 rounded bg-[var(--border-color-light)]" />
                        <div className="mb-4 h-4 w-full rounded bg-[var(--border-color-light)] opacity-60" />
                        <div className="mt-auto flex flex-col gap-3">
                          <div className="h-8 w-full rounded-xl bg-[var(--border-color-light)] opacity-50" />
                          <div className="h-8 w-full rounded-xl bg-[var(--border-color-light)] opacity-50" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-1 flex items-start justify-between gap-2 relative">
                          <h3 className="line-clamp-1 text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-accent-color)]">
                            {item!.title}
                          </h3>
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button onClick={(e) => e.stopPropagation()} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32 rounded-[6px]" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(item!); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(item!); }} className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        {item!.details && (
                          <p className="mb-4 line-clamp-2 text-sm text-[var(--text-secondary)] opacity-85">
                            {item!.details}
                          </p>
                        )}

                        <div className="mt-auto flex flex-col gap-2.5 pt-4">
                          <div className="flex items-center justify-between">
                            <span className={getStatusClasses(item!.status)}>
                              {getStatusText(item!.status)}
                            </span>
                            <div className={cn(pillClasses, "px-2 py-1")}>
                              <Calendar className="h-3 w-3 text-[var(--primary-color)]" />
                              <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                                {format(new Date(item!.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className={cn(pillClasses, "px-2.5 py-1.5")}>
                              <UserIcon className="h-3.5 w-3.5 text-[var(--primary-color)]" />
                              <span className="max-w-[100px] truncate text-xs font-semibold text-[var(--text-primary)]">
                                {item!.user || "Unknown"}
                              </span>
                            </div>
                            <div className={cn(pillClasses, "px-2.5 py-1.5")}>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Qs:
                              </span>
                              <span className="text-[13px] font-bold leading-none text-[var(--primary-color)]">
                                {item!.status === "completed"
                                  ? item!.number_of_questions
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && data?.count ? (
          <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:mt-4 sm:flex-row">
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span>
                Showing{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {Math.min(page * pageSize, data.count)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {data.count}
                </span>{" "}
                questionnaires
              </span>
              <div className="hidden sm:block">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1); // Reset to page 1 on size change
                  }}
                  className="h-8 rounded-[6px] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] px-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.count / pageSize)}
                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {canManage && <FloatingBtn text="New Questionnaire" onClick={handleCreateNew} />}

      {/* Modals */}
      <CreateQuestionnaireModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={(data) => createMutation.mutate(data as CreateQuestionnaireModalState)}
      />

      <UpdateQuestionnaireModal
        isOpen={isUpdateModalOpen}
        isUpdating={updateMutation.isPending}
        questionnaire={selectedQuestionnaire}
        onClose={() => setIsUpdateModalOpen(false)}
        onConfirm={(title) => updateMutation.mutate({ id: selectedQuestionnaire!.id, title })}
      />

      <DeleteQuestionnaireModal
        isOpen={isDeleteModalOpen}
        isDeleting={deleteMutation.isPending}
        questionnaire={selectedQuestionnaire}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedQuestionnaire!.id)}
      />
    </div>
  );
}

export default function QuestionnairesPage() {
  return (
    <Suspense fallback={null}>
      <QuestionnairesDashboard />
    </Suspense>
  );
}
