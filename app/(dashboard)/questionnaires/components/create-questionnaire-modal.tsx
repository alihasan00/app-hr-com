"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  COMPETENCY_IMPORTANCE_LABELS,
  COMPETENCY_ROWS,
  CULTURE_ROWS,
  WORK_LEVEL_LABELS,
  competencyLabelToValue,
  competencyToLabel,
  type CreateQuestionnaireModalState,
  workDemandToLabel,
  workLabelToValue,
} from "@/lib/questionnaires/map-create-payload";
import { useAuthStore } from "@/lib/store/auth.store";

import { HelpDialog, type HelpTopic } from "./help-dialog";

interface CreateQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuestionnaireModalState) => void;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: 0, title: "Role Info", icon: FileText },
  { id: 1, title: "Work Demands", icon: LayoutDashboard },
  { id: 2, title: "Competencies", icon: Trophy },
  { id: 3, title: "Culture & Values", icon: Users },
  { id: 4, title: "Success & Failure", icon: Star },
  { id: 5, title: "Review", icon: Gauge },
];

const DRAFT_STORAGE_KEY_PREFIX = "questionnaire-draft";

function draftKey(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return `${DRAFT_STORAGE_KEY_PREFIX}:${userId}`;
}

const INITIAL_ROLE_INFO: CreateQuestionnaireModalState["roleInfo"] = {
  roleName: "",
  companyName: "",
  department: "",
  seniorityLevel: "",
  location: "",
  yearsOfExperience: "",
  minSalary: "",
  maxSalary: "",
  numberOfQuestions: 8,
  jobDescription: "",
};

const INITIAL_WORK_DEMANDS: CreateQuestionnaireModalState["workDemands"] = {
  stressLevel: 3,
  customerContact: 3,
  teamworkVsSolo: 3,
  ambiguityChange: 3,
};

const INITIAL_COMPETENCIES: CreateQuestionnaireModalState["competencies"] = {
  reliabilityOwnership: 2,
  learningAdaptability: 2,
  communicationClarity: 2,
  empathyCollaboration: 2,
  resilienceStress: 2,
  valuesCultureFit: 2,
};

const INITIAL_CULTURE: CreateQuestionnaireModalState["culture"] = {
  innovation: 2,
  structure: 2,
  teamOrientation: 2,
  detailFocus: 2,
  outcomeFocus: 2,
};

const INITIAL_PERFORMANCE: CreateQuestionnaireModalState["performance"] = {
  topPerformers: "",
  commonFailureModes: "",
};

type DraftShape = {
  details?: string;
  number_of_questions?: number;
  job_role_title?: string;
  department?: string;
  seniority_level?: string;
  location?: string;
  company_name?: string;
  min_salary?: string | number | null;
  max_salary?: string | number | null;
  years_of_experience?: string | number | null;
  work_environment?: {
    stress_level?: string;
    customer_contact?: string;
    teamwork_vs_solo?: string;
    ambiguity_change?: string;
  };
  competency_ratings?: Array<{ id: string; importance_label?: string }>;
  team_culture_profile?: Array<{ id: string; value_label?: string }>;
  success_patterns?: string;
  failure_patterns?: string;
  currentStep?: number;
  completedSteps?: number[];
};

function readDraft(key: string | null): DraftShape | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftShape;
  } catch {
    return null;
  }
}

function writeDraft(key: string | null, value: object) {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled */
  }
}

function clearDraft(key: string | null) {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function toDraftShape(
  state: {
    roleInfo: CreateQuestionnaireModalState["roleInfo"];
    workDemands: CreateQuestionnaireModalState["workDemands"];
    competencies: CreateQuestionnaireModalState["competencies"];
    culture: CreateQuestionnaireModalState["culture"];
    performance: CreateQuestionnaireModalState["performance"];
    currentStep: number;
    completedSteps: number[];
  },
): DraftShape {
  return {
    details: state.roleInfo.jobDescription,
    number_of_questions: state.roleInfo.numberOfQuestions,
    job_role_title: state.roleInfo.roleName,
    department: state.roleInfo.department,
    seniority_level: state.roleInfo.seniorityLevel,
    location: state.roleInfo.location,
    company_name: state.roleInfo.companyName,
    min_salary: state.roleInfo.minSalary,
    max_salary: state.roleInfo.maxSalary,
    years_of_experience: state.roleInfo.yearsOfExperience,
    work_environment: {
      stress_level: workDemandToLabel(state.workDemands.stressLevel),
      customer_contact: workDemandToLabel(state.workDemands.customerContact),
      teamwork_vs_solo: workDemandToLabel(state.workDemands.teamworkVsSolo),
      ambiguity_change: workDemandToLabel(state.workDemands.ambiguityChange),
    },
    competency_ratings: COMPETENCY_ROWS.map((row) => ({
      id: row.id,
      importance_label: competencyToLabel(state.competencies[row.key]),
    })),
    team_culture_profile: CULTURE_ROWS.map((row) => ({
      id: row.id,
      value_label: competencyToLabel(state.culture[row.key]),
    })),
    success_patterns: state.performance.topPerformers,
    failure_patterns: state.performance.commonFailureModes,
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
  };
}

function applyDraftToState(draft: DraftShape) {
  const roleInfo: CreateQuestionnaireModalState["roleInfo"] = {
    ...INITIAL_ROLE_INFO,
    roleName: draft.job_role_title ?? INITIAL_ROLE_INFO.roleName,
    department: draft.department ?? INITIAL_ROLE_INFO.department,
    seniorityLevel: draft.seniority_level ?? INITIAL_ROLE_INFO.seniorityLevel,
    location: draft.location ?? INITIAL_ROLE_INFO.location,
    companyName: draft.company_name ?? INITIAL_ROLE_INFO.companyName,
    minSalary:
      draft.min_salary == null || draft.min_salary === ""
        ? ""
        : String(draft.min_salary),
    maxSalary:
      draft.max_salary == null || draft.max_salary === ""
        ? ""
        : String(draft.max_salary),
    yearsOfExperience:
      draft.years_of_experience == null || draft.years_of_experience === ""
        ? ""
        : String(draft.years_of_experience),
    numberOfQuestions:
      typeof draft.number_of_questions === "number" && draft.number_of_questions > 0
        ? draft.number_of_questions
        : INITIAL_ROLE_INFO.numberOfQuestions,
    jobDescription: draft.details ?? INITIAL_ROLE_INFO.jobDescription,
  };

  const workDemands: CreateQuestionnaireModalState["workDemands"] = {
    stressLevel: workLabelToValue(draft.work_environment?.stress_level),
    customerContact: workLabelToValue(draft.work_environment?.customer_contact),
    teamworkVsSolo: workLabelToValue(draft.work_environment?.teamwork_vs_solo),
    ambiguityChange: workLabelToValue(draft.work_environment?.ambiguity_change),
  };

  const competencies = { ...INITIAL_COMPETENCIES };
  if (Array.isArray(draft.competency_ratings)) {
    for (const entry of draft.competency_ratings) {
      const row = COMPETENCY_ROWS.find((r) => r.id === entry.id);
      if (row) competencies[row.key] = competencyLabelToValue(entry.importance_label);
    }
  }

  const culture = { ...INITIAL_CULTURE };
  if (Array.isArray(draft.team_culture_profile)) {
    for (const entry of draft.team_culture_profile) {
      const row = CULTURE_ROWS.find((r) => r.id === entry.id);
      if (row) culture[row.key] = competencyLabelToValue(entry.value_label);
    }
  }

  const performance: CreateQuestionnaireModalState["performance"] = {
    topPerformers: draft.success_patterns ?? "",
    commonFailureModes: draft.failure_patterns ?? "",
  };

  const completedSteps = Array.isArray(draft.completedSteps)
    ? draft.completedSteps.filter((n) => Number.isFinite(n))
    : [];

  return {
    roleInfo,
    workDemands,
    competencies,
    culture,
    performance,
    currentStep:
      typeof draft.currentStep === "number" && draft.currentStep >= 0 && draft.currentStep <= 5
        ? draft.currentStep
        : 0,
    completedSteps,
  };
}

export function CreateQuestionnaireModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateQuestionnaireModalProps) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const storageKey = useMemo(() => draftKey(userId), [userId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [roleInfo, setRoleInfo] = useState(INITIAL_ROLE_INFO);
  const [workDemands, setWorkDemands] = useState(INITIAL_WORK_DEMANDS);
  const [competencies, setCompetencies] = useState(INITIAL_COMPETENCIES);
  const [culture, setCulture] = useState(INITIAL_CULTURE);
  const [performance, setPerformance] = useState(INITIAL_PERFORMANCE);

  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Hydrate from draft on first open
  const hydratedOnceRef = useRef(false);
  useEffect(() => {
    if (!isOpen || hydratedOnceRef.current) return;
    hydratedOnceRef.current = true;
    const draft = readDraft(storageKey);
    if (!draft) return;
    const next = applyDraftToState(draft);
    setRoleInfo(next.roleInfo);
    setWorkDemands(next.workDemands);
    setCompetencies(next.competencies);
    setCulture(next.culture);
    setPerformance(next.performance);
    setCurrentStep(next.currentStep);
    setCompletedSteps(next.completedSteps);
  }, [isOpen]);

  // Persist on every change while modal is open (debounced)
  useEffect(() => {
    if (!isOpen) return;
    const handle = setTimeout(() => {
      writeDraft(
        storageKey,
        toDraftShape({
          roleInfo,
          workDemands,
          competencies,
          culture,
          performance,
          currentStep,
          completedSteps,
        }),
      );
    }, 300);
    return () => clearTimeout(handle);
  }, [isOpen, storageKey, roleInfo, workDemands, competencies, culture, performance, currentStep, completedSteps]);

  const roleInfoErrors = useMemo(() => {
    const errs: Partial<Record<keyof CreateQuestionnaireModalState["roleInfo"], string>> = {};
    if (!roleInfo.roleName.trim() || roleInfo.roleName.trim().length < 3) {
      errs.roleName = "Role Name is required (at least 3 characters)";
    }
    if (!roleInfo.department.trim()) {
      errs.department = "Department is required";
    }
    if (!roleInfo.seniorityLevel.trim()) {
      errs.seniorityLevel = "Seniority Level is required";
    }
    if (!roleInfo.location.trim()) {
      errs.location = "Location is required";
    }
    if (!roleInfo.jobDescription.trim() || roleInfo.jobDescription.trim().length < 10) {
      errs.jobDescription = "Job Description is required (at least 10 characters)";
    }
    return errs;
  }, [roleInfo]);

  const performanceErrors = useMemo(() => {
    const errs: Partial<Record<keyof CreateQuestionnaireModalState["performance"], string>> = {};
    if (!performance.topPerformers.trim() || performance.topPerformers.trim().length < 10) {
      errs.topPerformers = "Success Patterns are required (at least 10 characters)";
    }
    if (
      !performance.commonFailureModes.trim() ||
      performance.commonFailureModes.trim().length < 10
    ) {
      errs.commonFailureModes = "Failure Patterns are required (at least 10 characters)";
    }
    return errs;
  }, [performance]);

  const isStepValid = useCallback(
    (step: number) => {
      if (step === 0) return Object.keys(roleInfoErrors).length === 0;
      if (step === 4) return Object.keys(performanceErrors).length === 0;
      return true;
    },
    [roleInfoErrors, performanceErrors],
  );

  const formatDemandLabel = (val: number) => WORK_LEVEL_LABELS[val - 1] ?? "Medium";
  const formatCompetencyLabel = (val: number) =>
    COMPETENCY_IMPORTANCE_LABELS[val] ?? "Important";

  const goNext = () => {
    if (!isStepValid(currentStep)) {
      setShowFieldErrors(true);
      return;
    }
    setShowFieldErrors(false);
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    setCurrentStep((s) => Math.min(5, s + 1));
  };

  const goPrev = () => {
    setShowFieldErrors(false);
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const goToStep = (step: number) => {
    setShowFieldErrors(false);
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }
    // forward only if every prior step is valid
    for (let i = 0; i < step; i++) {
      if (!isStepValid(i)) return;
    }
    setCurrentStep(step);
  };

  const hasAnyData = useCallback(() => {
    return (
      roleInfo.roleName.trim().length > 0 ||
      roleInfo.department.trim().length > 0 ||
      roleInfo.jobDescription.trim().length > 0 ||
      roleInfo.companyName.trim().length > 0 ||
      roleInfo.location.trim().length > 0 ||
      roleInfo.seniorityLevel.trim().length > 0 ||
      performance.topPerformers.trim().length > 0 ||
      performance.commonFailureModes.trim().length > 0
    );
  }, [roleInfo, performance]);

  const resetState = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setRoleInfo(INITIAL_ROLE_INFO);
    setWorkDemands(INITIAL_WORK_DEMANDS);
    setCompetencies(INITIAL_COMPETENCIES);
    setCulture(INITIAL_CULTURE);
    setPerformance(INITIAL_PERFORMANCE);
    setShowFieldErrors(false);
    hydratedOnceRef.current = false;
  }, []);

  const handleSaveDraftAndClose = () => {
    writeDraft(
      storageKey,
      toDraftShape({
        roleInfo,
        workDemands,
        competencies,
        culture,
        performance,
        currentStep,
        completedSteps,
      }),
    );
    setShowCloseConfirm(false);
    onClose();
  };

  const handleDiscardAndClose = () => {
    clearDraft(storageKey);
    setShowCloseConfirm(false);
    resetState();
    onClose();
  };

  const handleAttemptClose = () => {
    if (hasAnyData()) {
      setShowCloseConfirm(true);
    } else {
      clearDraft(storageKey);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open || isSubmitting) return;
    handleAttemptClose();
  };

  const handleSubmit = () => {
    // Validate the two required-step forms before submit
    if (!isStepValid(0)) {
      setCurrentStep(0);
      setShowFieldErrors(true);
      return;
    }
    if (!isStepValid(4)) {
      setCurrentStep(4);
      setShowFieldErrors(true);
      return;
    }
    onSubmit({ roleInfo, workDemands, competencies, culture, performance });
    clearDraft(storageKey);
    resetState();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] shadow-[0_24px_48px_rgba(var(--shadow-rgb),0.12)] rounded-[var(--radius-md)] max-h-[90vh] flex flex-col backdrop-blur-xl">
          <DialogHeader className="shrink-0 border-b border-[var(--header-floating-border)] bg-transparent px-6 py-5 sm:px-8 text-left">
            <DialogTitle className="text-xl font-bold text-foreground">
              Create Questionnaire
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-secondary)] mt-1">
              Configure the requirements and context to generate the perfect interview questions.
            </DialogDescription>
          </DialogHeader>

          {/* Body Container */}
          <div className="flex flex-1 min-h-0 w-full flex-col bg-transparent md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="relative flex w-full flex-none flex-col overflow-y-auto bg-[var(--surface-2)]/40 md:w-[260px] border-b md:border-b-0 md:border-r border-[var(--header-floating-border)]">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[rgba(var(--primary-color-rgb),0.06)] to-transparent" />
            <div className="relative z-10 p-4 sm:p-6">
              <h4 className="mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Configuration Steps
              </h4>
              <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:pb-0 scrollbar-none">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const completed = completedSteps.includes(step.id) && !isActive;
                  const blocked =
                    step.id > currentStep && (() => {
                      for (let i = 0; i < step.id; i++) {
                        if (!isStepValid(i)) return true;
                      }
                      return false;
                    })();

                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={blocked}
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        "group relative flex items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-4 py-3 text-left text-sm transition-all md:whitespace-normal overflow-hidden",
                        "backdrop-blur-md border shadow-sm mx-1 mb-2",
                        isActive
                          ? "bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.15)] to-[rgba(var(--primary-color-rgb),0.08)] border-[rgba(var(--primary-color-rgb),0.6)] border-[1.5px] shadow-[0_4px_12px_rgba(var(--primary-color-rgb),0.15)] text-[var(--primary-color)] font-bold"
                          : "border-[var(--border-color)] bg-background/60 hover:bg-background/80 hover:border-[var(--primary-color)]/30 hover:shadow-md text-[var(--text-primary)] disabled:opacity-40",
                        completed && !isActive && "border-[rgba(var(--success-color-rgb),0.3)] text-foreground",
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.1)] to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-transform duration-300 relative z-10",
                          isActive
                            ? "text-[var(--primary-color)] scale-110"
                            : completed
                              ? "text-[var(--success-color)]"
                              : "text-[var(--text-secondary)] group-hover:text-[var(--primary-color)] group-hover:scale-110",
                        )}
                      />
                      <span className="flex-1 transition-colors relative z-10">{step.title}</span>
                      {completed && !isActive && (
                        <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[var(--success-color)] relative z-10" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0 overflow-y-auto bg-transparent p-5 sm:p-8 md:p-10">
              <div className="mx-auto max-w-2xl">
                {/* Step 0: Role Info */}
                {currentStep === 0 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Role Information
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Provide the foundational details for the position you are hiring for.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label className="text-sm font-medium text-foreground">
                          Role Name <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={roleInfo.roleName}
                          onChange={(e) => setRoleInfo({ ...roleInfo, roleName: e.target.value })}
                          placeholder="e.g., Senior Full Stack Engineer"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                        {showFieldErrors && roleInfoErrors.roleName && (
                          <FieldError message={roleInfoErrors.roleName} />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">Company Name</Label>
                        <Input
                          type="text"
                          value={roleInfo.companyName}
                          onChange={(e) =>
                            setRoleInfo({ ...roleInfo, companyName: e.target.value })
                          }
                          placeholder="e.g., Acme Corp"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          Department <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={roleInfo.department}
                          onChange={(e) =>
                            setRoleInfo({ ...roleInfo, department: e.target.value })
                          }
                          placeholder="e.g., Engineering"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                        {showFieldErrors && roleInfoErrors.department && (
                          <FieldError message={roleInfoErrors.department} />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          Seniority Level <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <Select
                          value={roleInfo.seniorityLevel}
                          onValueChange={(val) =>
                            setRoleInfo({ ...roleInfo, seniorityLevel: val })
                          }
                        >
                          <SelectTrigger className="h-10 w-full rounded-[6px] bg-background border-[var(--header-floating-border)] focus:ring-[var(--primary-color)] shadow-sm">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                        {showFieldErrors && roleInfoErrors.seniorityLevel && (
                          <FieldError message={roleInfoErrors.seniorityLevel} />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          Location <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={roleInfo.location}
                          onChange={(e) => setRoleInfo({ ...roleInfo, location: e.target.value })}
                          placeholder="e.g., Remote, New York"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                        {showFieldErrors && roleInfoErrors.location && (
                          <FieldError message={roleInfoErrors.location} />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">Min. Salary</Label>
                        <Input
                          type="number"
                          step="1000"
                          min="0"
                          value={roleInfo.minSalary}
                          onChange={(e) =>
                            setRoleInfo({ ...roleInfo, minSalary: e.target.value })
                          }
                          placeholder="e.g., 50000"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">Max. Salary</Label>
                        <Input
                          type="number"
                          step="1000"
                          min="0"
                          value={roleInfo.maxSalary}
                          onChange={(e) =>
                            setRoleInfo({ ...roleInfo, maxSalary: e.target.value })
                          }
                          placeholder="e.g., 80000"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          Years of Experience
                        </Label>
                        <Input
                          type="number"
                          value={roleInfo.yearsOfExperience}
                          onChange={(e) =>
                            setRoleInfo({ ...roleInfo, yearsOfExperience: e.target.value })
                          }
                          placeholder="e.g., 3"
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          Number of Questions{" "}
                          <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">
                            (2-15)
                          </span>
                        </Label>
                        <Input
                          type="number"
                          min={2}
                          max={15}
                          value={roleInfo.numberOfQuestions}
                          onChange={(e) =>
                            setRoleInfo({
                              ...roleInfo,
                              numberOfQuestions: Number(e.target.value),
                            })
                          }
                          className="h-10 rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground">
                          Job Description <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setHelpTopic("jobDescription")}
                          className="inline-flex items-center gap-1 text-xs text-[var(--primary-color)] hover:underline"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          How to write
                        </button>
                      </div>
                      <Textarea
                        value={roleInfo.jobDescription}
                        onChange={(e) =>
                          setRoleInfo({ ...roleInfo, jobDescription: e.target.value })
                        }
                        rows={12}
                        placeholder="Paste the job description here. Include responsibilities, required skills, and technical stack..."
                        className="min-h-52 resize-none rounded-[var(--radius-md)] border-[var(--header-floating-border)] bg-background text-sm shadow-sm focus-visible:ring-[var(--primary-color)] sm:min-h-60"
                      />
                      {showFieldErrors && roleInfoErrors.jobDescription && (
                        <FieldError message={roleInfoErrors.jobDescription} />
                      )}
                    </div>
                  </div>
                )}

                {/* Step 1: Work Demands */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Work Demands
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Adjust the sliders to define the day-to-day context and pressures of this
                        role.
                      </p>
                    </div>

                    <div className="flex flex-col gap-8">
                      {(
                        [
                          {
                            key: "stressLevel" as const,
                            title: "Stress Level",
                            desc: "How stressful is this role on average?",
                          },
                          {
                            key: "customerContact" as const,
                            title: "Customer Contact",
                            desc: "How much direct customer interaction is required?",
                          },
                          {
                            key: "teamworkVsSolo" as const,
                            title: "Teamwork vs Solo Work",
                            desc: "How much teamwork versus individual work is expected?",
                          },
                          {
                            key: "ambiguityChange" as const,
                            title: "Ambiguity & Change",
                            desc: "How often do tools, processes, or priorities change?",
                          },
                        ]
                      ).map(({ key, title, desc }) => (
                        <div key={key} className="flex flex-col gap-5">
                          <div className="flex items-end justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{desc}</p>
                            </div>
                            <span className="text-sm font-bold text-[var(--primary-color)]">
                              {formatDemandLabel(workDemands[key])}
                            </span>
                          </div>
                          <div className="px-1">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[workDemands[key]]}
                              onValueChange={([val]) =>
                                setWorkDemands({ ...workDemands, [key]: val })
                              }
                              className="py-1"
                            />
                          </div>
                          <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] px-1">
                            <span>Very Low</span>
                            <span>Very High</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Competencies */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Competency Ratings
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Rate the importance of each core competency for this specific role.
                      </p>
                    </div>

                    <div className="flex flex-col gap-8">
                      {COMPETENCY_ROWS.map((row) => (
                        <div key={row.id} className="flex flex-col gap-5">
                          <div className="flex items-end justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">{row.name}</h4>
                              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                {row.description}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[var(--primary-color)]">
                              {formatCompetencyLabel(competencies[row.key])}
                            </span>
                          </div>
                          <div className="px-1">
                            <Slider
                              min={0}
                              max={3}
                              step={1}
                              value={[competencies[row.key]]}
                              onValueChange={([val]) =>
                                setCompetencies({ ...competencies, [row.key]: val })
                              }
                              className="py-1"
                            />
                          </div>
                          <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] px-1">
                            <span>Not Relevant</span>
                            <span>Critical</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Culture & Values */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Culture Profile
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Define the working style and cultural expectations.
                      </p>
                    </div>

                    <div className="flex flex-col gap-8">
                      {CULTURE_ROWS.map((row) => (
                        <div key={row.id} className="flex flex-col gap-5">
                          <div className="flex items-end justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">{row.label}</h4>
                              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                {row.description}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[var(--primary-color)]">
                              {formatCompetencyLabel(culture[row.key])}
                            </span>
                          </div>
                          <div className="px-1">
                            <Slider
                              min={0}
                              max={3}
                              step={1}
                              value={[culture[row.key]]}
                              onValueChange={([val]) =>
                                setCulture({ ...culture, [row.key]: val })
                              }
                              className="py-1"
                            />
                          </div>
                          <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] px-1">
                            <span>Not Relevant</span>
                            <span>Critical</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Success & Failure */}
                {currentStep === 4 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Success &amp; Failure Profiles
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Describe the behaviors that lead to success or failure in this role.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground">
                          Success Patterns <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setHelpTopic("topPerformers")}
                          className="inline-flex items-center gap-1 text-xs text-[var(--primary-color)] hover:underline"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          Examples
                        </button>
                      </div>
                      <Textarea
                        value={performance.topPerformers}
                        onChange={(e) =>
                          setPerformance({ ...performance, topPerformers: e.target.value })
                        }
                        rows={6}
                        placeholder="Think of 3–5 top performers in this role. What do they do that weaker performers don't? Example: 'They always follow up with customers without being reminded.'"
                        className="resize-none rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm text-sm"
                      />
                      {showFieldErrors && performanceErrors.topPerformers && (
                        <FieldError message={performanceErrors.topPerformers} />
                      )}
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground">
                          Failure Patterns <span className="text-[var(--error-color)]">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setHelpTopic("commonFailureModes")}
                          className="inline-flex items-center gap-1 text-xs text-[var(--primary-color)] hover:underline"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          Examples
                        </button>
                      </div>
                      <Textarea
                        value={performance.commonFailureModes}
                        onChange={(e) =>
                          setPerformance({
                            ...performance,
                            commonFailureModes: e.target.value,
                          })
                        }
                        rows={6}
                        placeholder="When people fail in this role, what usually goes wrong? Example: 'They ghost shifts without notice. They get flustered with angry customers.'"
                        className="resize-none rounded-[var(--radius-md)] bg-background border-[var(--header-floating-border)] focus-visible:ring-[var(--primary-color)] shadow-sm text-sm"
                      />
                      {showFieldErrors && performanceErrors.commonFailureModes && (
                        <FieldError message={performanceErrors.commonFailureModes} />
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Review &amp; Finalize
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Ensure all constraints are accurate before generating your questionnaire.
                      </p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-background p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary-color)]/50"></div>
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="flex items-center gap-2 font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-[var(--primary-color)]" /> Role
                            Information
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(0)}
                            className="text-xs font-semibold text-[var(--primary-color)] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <span className="text-[var(--text-secondary)]">Role Name:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.roleName || "Not provided"}
                          </span>
                          <span className="text-[var(--text-secondary)]">Department:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.department || "Not provided"}
                          </span>
                          <span className="text-[var(--text-secondary)]">Seniority Level:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.seniorityLevel || "Not provided"}
                          </span>
                          <span className="text-[var(--text-secondary)]">Location:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.location || "Not provided"}
                          </span>
                          <span className="text-[var(--text-secondary)]">Experience:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.yearsOfExperience
                              ? `${roleInfo.yearsOfExperience} years`
                              : "Not provided"}
                          </span>
                          <span className="text-[var(--text-secondary)]">Questions:</span>
                          <span className="font-medium text-foreground text-right">
                            {roleInfo.numberOfQuestions}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-background p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="flex items-center gap-2 font-semibold text-foreground">
                            <Star className="h-4 w-4 text-emerald-500" /> Performance Profiles
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-xs font-semibold text-emerald-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex flex-col gap-5 text-sm">
                          <div>
                            <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold block mb-2">
                              Success Patterns
                            </span>
                            <p className="text-foreground leading-relaxed bg-[var(--surface-2)] border border-[var(--header-floating-border)] p-3 rounded-[var(--radius-md)]">
                              {performance.topPerformers || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold block mb-2">
                              Failure Patterns
                            </span>
                            <p className="text-foreground leading-relaxed bg-[var(--surface-2)] border border-[var(--header-floating-border)] p-3 rounded-[var(--radius-md)]">
                              {performance.commonFailureModes || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex shrink-0 items-center justify-between border-t border-[var(--header-floating-border)] bg-transparent sm:justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={goPrev}
                  className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium border-[var(--header-floating-border)] bg-background hover:bg-[var(--surface-2)]"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                type="button"
                onClick={handleAttemptClose}
                className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:text-destructive hover:bg-destructive/10"
              >
                Cancel
              </Button>
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="h-10 rounded-[var(--radius-md)] px-5 text-sm font-semibold shadow-md bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="h-10 rounded-[var(--radius-md)] px-6 text-sm font-semibold bg-[var(--success-color)] hover:opacity-90 text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Check className="mr-2 h-4 w-4" strokeWidth={3} />
                  {isSubmitting ? "Creating…" : "Generate Questionnaire"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HelpDialog topic={helpTopic} onClose={() => setHelpTopic(null)} />

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="max-w-[480px] w-[95vw] p-0 overflow-hidden border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] shadow-[0_24px_48px_rgba(var(--shadow-rgb),0.12)] rounded-[var(--radius-md)] backdrop-blur-xl">
          <div className="flex items-center gap-4 border-b border-[var(--header-floating-border)] bg-transparent p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--warning-color)]/30 bg-[var(--warning-color)]/10 text-[var(--warning-color)] shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                Unsaved Changes
              </AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="p-6">
            <AlertDialogDescription className="text-sm leading-relaxed text-[var(--text-secondary)]">
              You have unsaved changes. Would you like to save them as a draft?
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="border-t border-[var(--header-floating-border)] bg-transparent p-5 sm:justify-end gap-3">
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={handleDiscardAndClose}
                className="h-10 rounded-xl px-4 text-sm font-medium"
              >
                Discard
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSaveDraftAndClose();
                }}
                className="h-10 rounded-xl px-4 text-sm font-semibold"
              >
                Save as Draft
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-0.5 text-xs font-medium text-[var(--error-color)]" role="alert">
      {message}
    </p>
  );
}
