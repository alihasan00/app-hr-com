import type { MarketingCta } from "@/app/home-content";
import { SITE_BASE_URL } from "@/lib/site/marketing-site";

export const BLOG_PAGE_PATH = "/blog";

export const blogCanonical = `${SITE_BASE_URL}${BLOG_PAGE_PATH}`;

export const BLOG_METADATA = {
  title: "Blog | ReechOut - AI Phone Interview Automation",
  description:
    "Insights on AI phone interviews, structured questionnaires, hiring signals, and building fair, efficient recruitment workflows.",
  keywords:
    "ReechOut blog, AI interviews, phone screening, hiring automation, HR tech, recruitment, interview questionnaires",
  author: "ReechOut",
  robots: "index, follow",
  language: "English",
} as const;

export const BLOG_HERO = {
  title: "Hiring Signals, Interview Design, and Practical Ops",
  subtitle:
    "Notes for teams building fair, fast phone screens—structured questionnaires, AI-assisted summaries, and the policy questions worth answering early.",
} as const;

export const BLOG_CTA = {
  heading: "Ready to hear\ncandidates clearly?",
  description:
    "See how structured AI phone interviews turn conversations into consistent, review-ready signals for your team.",
  primaryLabel: "Book a Demo",
  primaryHref: "/contact",
  secondaryLabel: "Start for Free",
  secondaryHref:
    process.env.NEXT_PUBLIC_REECHOUT_CONNECT_URL ??
    "https://cal.com/reechout-founders/connect",
} as const satisfies MarketingCta;

/** Rich text blocks for blog article body (no markdown dependency). */
export type BlogBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bulletList"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  author: string;
  coverImageUrl?: string;
  body: BlogBodyBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "structured-phone-interviews-reduce-time-to-hire",
    title: "How Structured Phone Interviews Dramatically Cut Time-to-Hire",
    excerpt:
      "When every candidate answers the same core questions, your team compares signal instead of stories—accelerating decisions without sacrificing quality. Here is the blueprint for standardizing your top-of-funnel.",
    publishedAt: "2026-03-18T10:00:00.000Z",
    category: "Hiring",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-phone-interviews.jpg",
    body: [
      {
        type: "paragraph",
        text: "Unstructured phone screens feel comfortable and conversational, but they are a silent killer of recruitment efficiency. They inherently hide variance. One hiring manager might probe for culture fit for twenty minutes, while another might jump straight to technical qualifications or compensation. Consequently, candidates leave with vastly different experiences, and your team is left trying to reconcile incomparable notes.",
      },
      {
        type: "heading",
        text: "The Hidden Cost of “Winging It”",
      },
      {
        type: "paragraph",
        text: "When interviews lack structure, bias creeps in and signal gets lost. The time spent debating a candidate's vague 'vibe' in debriefs directly inflates your time-to-hire. Cognitive biases—like confirmation bias (favoring information that confirms prior beliefs) or recency bias (remembering only the last few minutes of a call)—dominate the evaluation. Worse, you often realize too late that critical questions were never asked, leading to unnecessary follow-up rounds and calendar ping-pong.",
      },
      {
        type: "heading",
        text: "Why Structure is Your Secret Weapon",
      },
      {
        type: "paragraph",
        text: "A structured interview doesn’t mean rigidly reading a robotic script. It means deliberately defining the core competencies you care about—such as communication, judgment, and role-specific knowledge—and ensuring every single candidate gets an equal opportunity to demonstrate them. This transforms the screening process from an art into a repeatable science.",
      },
      {
        type: "bulletList",
        items: [
          "Pre-Call Alignment: Align interviewers on what “good” sounds like before the first call ever happens. Create a simple rubric with 1-5 scoring for core skills.",
          "Frictionless Debriefs: Dramatically shorten debrief sessions because everyone is evaluating the same core signals. You move from debating 'did you like them?' to 'did they meet our threshold for problem-solving?'",
          "Bias Reduction: Mitigate unconscious bias resulting from shared hobbies or small talk dominating the screen. Structure anchors the conversation to job-relevant data.",
        ],
      },
      {
        type: "heading",
        text: "The Compounding ROI of Structured Data",
      },
      {
        type: "paragraph",
        text: "When phone screens are structured and captured consistently, all downstream steps—from onsites to final offers—inherit that clarity. Onsite interviewers don't have to re-ask foundational questions because they trust the screening data. Time-to-hire plummets because your team spends less time chasing missing context, eliminating the administrative drag that slows down high-growth teams.",
      },
    ],
  },
  {
    slug: "writing-better-screening-questionnaires",
    title: "Writing Screening Questionnaires That Actually Predict Fit",
    excerpt:
      "Good questions invite concrete evidence. Discover how to design prompts that surface how candidates truly think, rather than just what they claim on their resume, ensuring you only advance high-signal talent.",
    publishedAt: "2026-03-04T14:30:00.000Z",
    category: "Product",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-screening-questionnaires.jpg",
    body: [
      {
        type: "paragraph",
        text: "The most effective screening questionnaires often feel obvious in hindsight: they ask for specific situations, tough tradeoffs, and measurable outcomes. On the flip side, the worst questionnaires read like keyword traps blindly copy-pasted from a generic job description, encouraging candidates to respond with rehearsed platitudes rather than actual experience.",
      },
      {
        type: "heading",
        text: "Start From Outcomes, Not Buzzwords",
      },
      {
        type: "paragraph",
        text: "Instead of asking a broad question like, “Tell us about your leadership experience,” try prompts that force concrete recall. Ask about a specific time budgets unexpectedly shifted, a key stakeholder pushed back, or a critical deadline was moved. You’re not testing their memory—you’re testing whether they can clearly articulate how they operate under real-world pressure.",
      },
      {
        type: "heading",
        text: "The Anatomy of a High-Signal Prompt",
      },
      {
        type: "paragraph",
        text: "A well-designed questionnaire prompt sets the stage, introduces a constraint, and asks for a resolution. This is essentially the STAR (Situation, Task, Action, Result) method flipped on its head to guide the candidate's response.",
      },
      {
        type: "bulletList",
        items: [
          "One Scenario Per Theme: Focus on one scenario per theme. Avoid stringing together ten micro-questions that blur the candidate's focus (e.g., 'Tell me about a time you failed, what you learned, who you told, and how it impacted the budget.').",
          "Role-Relevant Context: Use role-relevant context and constraints so candidates can demonstrate authentic domain judgment.",
          "Inclusive Language: Keep the language inclusive. Strip away internal company jargon, complex idioms, or culture-specific references that artificially inflate the difficulty for diverse candidates.",
        ],
      },
      {
        type: "heading",
        text: "Calibrating for Seniority",
      },
      {
        type: "paragraph",
        text: "Your questions should scale with the role. For junior roles, index heavily on coachability, problem-solving frameworks, and execution. For senior and executive roles, pivot the questions toward strategic tradeoffs, stakeholder management, and instances of navigating profound ambiguity. A senior candidate should be able to explain not just what they built, but why they chose not to build the alternative.",
      },
      {
        type: "paragraph",
        text: "Great questionnaires aren't written in a vacuum. Iterate closely with your hiring managers: regularly review batches of candidate responses and proactively refine the wording wherever answers start to cluster into “generic” or “off-topic” territory. With each hiring cycle, your questionnaire should act as an increasingly sharper filter.",
      },
    ],
  },
  {
    slug: "fairness-in-ai-assisted-screening",
    title: "Ensuring Fairness in AI-Assisted Candidate Screening",
    excerpt:
      "AI can brilliantly summarize interview signals—but teams must own the policy and oversight. Here’s a grounded, tactical checklist for integrating ethical AI into your recruitment funnel.",
    publishedAt: "2026-02-19T09:00:00.000Z",
    category: "Best practices",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-fairness-screening.jpg",
    body: [
      {
        type: "paragraph",
        text: "As organizations increasingly adopt AI for top-of-funnel hiring, the conversation naturally extends far beyond technical accuracy. The real question modern talent teams must answer is whether the automated process remains completely understandable, transparent, and undeniably fair to both candidates and regulators. AI tools are built to flawlessly augment structured interviews, not to act as a black box that unilaterally decides a candidate's future.",
      },
      {
        type: "heading",
        text: "Signal Extraction vs. Automated Decision Making",
      },
      {
        type: "paragraph",
        text: "The ethical line in AI recruitment is the difference between extraction and decision. Using AI to transcribe a call, pull out quotes related to 'project management,' and summarize them against a rubric is signal extraction. It empowers the human recruiter. Conversely, using AI to automatically reject a candidate based on an arbitrary 'confidence score' is automated decision making—which introduces massive legal and ethical risk.",
      },
      {
        type: "heading",
        text: "The Foundation of Transparent AI",
      },
      {
        type: "paragraph",
        text: "Fairness begins with radical transparency. Candidates should never feel like their career prospects are being tossed into a void. Being upfront about how AI fits into your hiring workflow builds trust, sets proper expectations, and protects your employer brand.",
      },
      {
        type: "bulletList",
        items: [
          "Data Definition: Explicitly define what data is collected (audio, text transcripts, AI-generated summaries) and establish exact retention periods.",
          "Human-in-the-Loop: Outline your 'human-in-the-loop' process. Document exactly how recruiters and hiring managers review AI summaries alongside raw transcripts before making advancement decisions.",
          "Dispute Pathways: Establish a clear feedback loop showing how candidates can ask questions, request human review, or dispute outcomes where applicable by local law.",
        ],
      },
      {
        type: "heading",
        text: "Continuous Auditing and Bias Mitigation",
      },
      {
        type: "paragraph",
        text: "Bias mitigation is an active, ongoing discipline, not a one-time setup step. Regularly test your prompts and scoring rubrics across diverse demographics. Aggressively monitor your hiring outcomes for algorithmic drift—are certain groups disproportionately dropping off at the AI screening stage? Most importantly, train your interviewers to understand that 'automation' is a tool for scale, never a replacement for their critical thinking and empathy.",
      },
    ],
  },
  {
    slug: "gdpr-recorded-interviews-what-teams-should-know",
    title: "Data Privacy & Recorded Interviews: What Hiring Teams Must Know",
    excerpt:
      "Recorded phone screens inherently involve personal data. A straightforward look at purpose limitation, candidate transparency, and sensible retention strategies for modern HR tech stacks.",
    publishedAt: "2026-02-05T11:15:00.000Z",
    category: "Compliance",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-gdpr-compliance.jpg",
    body: [
      {
        type: "paragraph",
        text: "If your hiring team records or transcribes candidate interviews, you are actively processing highly sensitive personal data. Regulatory frameworks like GDPR in Europe, and CCPA/CPRA in California, demand strict clarity about why you are collecting this data, exactly how long you plan to keep it, and precisely who has the authority to access it within your organization.",
      },
      {
        type: "heading",
        text: "Moving Beyond Generic Privacy Policies",
      },
      {
        type: "paragraph",
        text: "Your Data Processing Agreement (DPA) and public-facing privacy notices must accurately reflect your actual, day-to-day operations. A generic, legally vague paragraph buried at the bottom of your careers page is no longer sufficient. When utilizing AI transcription or recording tools, candidate consent must be explicit, informed, and easily revocable.",
      },
      {
        type: "heading",
        text: "Operational Habits That Protect Your Team",
      },
      {
        type: "paragraph",
        text: "Compliance isn't just a legal checkbox; it requires operationalizing privacy directly into your recruitment workflows. Here is how top-tier talent teams handle it:",
      },
      {
        type: "bulletList",
        items: [
          "Data Minimization: Collect only the specific insights you strictly need for making hiring decisions. Do not record video if audio and transcription are sufficient for the evaluation rubric.",
          "Strict Retention Schedules: Align your data retention with both legal guidelines and business realities. Once a hiring cycle is closed, automate the deletion of raw audio files, keeping only the sanitized, aggregated scorecard data if necessary for historical reporting.",
          "Role-Based Access Control (RBAC): Implement robust access controls. Restrict transcript and audio access exclusively to the recruiters and hiring managers directly involved with evaluating that specific role.",
        ],
      },
      {
        type: "heading",
        text: "Vetting Your Vendor Ecosystem",
      },
      {
        type: "paragraph",
        text: "Your choice of HR tech vendors matters immensely. You must thoroughly understand their subprocessors, encryption standards (both at rest and in transit), and geographical data storage locations (e.g., ensuring EU data stays within the EU). While this post isn’t formal legal advice, involving your legal counsel early to vet vendor security postures and jurisdictional nuances will save your team massive headaches down the road.",
      },
    ],
  },
  {
    slug: "from-transcripts-to-hiring-reports",
    title: "Closing the Loop: Turning Transcripts into Actionable Hiring Reports",
    excerpt:
      "Raw interview transcripts are incredibly noisy. Learn how top-performing teams distill hours of conversation into concise, evidence-based reports that drive immediate hiring alignment.",
    publishedAt: "2026-01-22T08:45:00.000Z",
    category: "Product",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-hiring-reports.jpg",
    body: [
      {
        type: "paragraph",
        text: "A verbatim interview transcript is an incredibly faithful record of a conversation, but it is overwhelmingly long and entirely unstructured. Hiring reports exist precisely so that leadership, hiring managers, and cross-functional partners can achieve immediate alignment without having to painstakingly listen to every single minute of a recorded call.",
      },
      {
        type: "heading",
        text: "The Purpose of the 'TL;DR Debrief'",
      },
      {
        type: "paragraph",
        text: "The absolute best hiring reports act as mirrors: they directly reflect the specific competencies you originally set out to screen for. This ensures the narrative arc—from the initial phone screen all the way to the final executive offer approval—remains tight, coherent, and fully justified by empirical evidence rather than gut feeling.",
      },
      {
        type: "heading",
        text: "What Actually Belongs in a High-Impact Report",
      },
      {
        type: "paragraph",
        text: "A scorecard or hiring report should leave no room for ambiguity. It should arm the next interviewer with exactly what they need to know. Make sure every report includes:",
      },
      {
        type: "bulletList",
        items: [
          "Direct Evidence: Contextual evidence tied to each targeted competency. Rely on actual quotes or highly accurate paraphrases from the transcript. Never rely on subjective 'vibes' or 'culture fit' without defining what that means.",
          "Identified Risks & Red Flags: Clearly outline behavioral red flags, vague answers, or specific technical skill gaps that the team must deeply probe in the subsequent onsite interview stage.",
          "A Binary Recommendation: Conclude with a definitive, binary recommendation (e.g., 'Advance to Technical Screen' or 'Reject - Lack of Domain Experience') backed by a concise, two-sentence justification.",
        ],
      },
      {
        type: "heading",
        text: "Building Institutional Memory",
      },
      {
        type: "paragraph",
        text: "When your hiring reports are highly structured and unwaveringly consistent across all departments, comparing multiple candidates side-by-side becomes an objective, mathematical exercise. More importantly, it democratizes the debrief process, preventing the 'loudest voice in the room' from dominating the hiring decision. You also build a robust institutional memory of your hiring criteria that outlasts any single recruiter or hiring manager's tenure.",
      },
    ],
  },
  {
    slug: "scaling-early-stage-hiring-without-burnout",
    title: "Scaling Early-Stage Hiring Without Burning Out Your Core Team",
    excerpt:
      "Lean startup teams feel the weight of every extra screen. Automation is less about replacing people and entirely about protecting their energy for the high-judgment moments that actually close candidates.",
    publishedAt: "2026-01-08T16:00:00.000Z",
    category: "Hiring",
    author: "ReechOut Team",
    coverImageUrl: "https://apphrcomsa.blob.core.windows.net/images/blog/blog-scaling-hiring.jpg",
    body: [
      {
        type: "paragraph",
        text: "In early-stage companies, hiring is an all-hands-on-deck endeavor. The exact same five people—often founders or core engineering leads—are responsible for sourcing, screening, technical debriefing, and extending offers. When hiring volume suddenly spikes—whether right after a fresh Series A funding round or a major product launch—calendar debt aggressively compounds, bringing product momentum to a grinding halt.",
      },
      {
        type: "heading",
        text: "Escaping the Founder Hiring Trap",
      },
      {
        type: "paragraph",
        text: "It is a common trap for early-stage leaders to spend 40-50% of their week on repetitive, top-of-funnel screening calls. The goal of integrating AI and hiring technology isn’t to coldly eliminate the human touch from your startup's brand. The goal is to decisively stop forcing your core team to repeat the exact same baseline discovery questions—salary expectations, timezone alignment, basic tech stack familiarity—on every single introductory call.",
      },
      {
        type: "heading",
        text: "Where to Invest Your Energy First",
      },
      {
        type: "paragraph",
        text: "To scale without burning out your best people, shift your focus to asynchronous workflows and ruthless prioritization:",
      },
      {
        type: "bulletList",
        items: [
          "Asynchronous Screening: Leverage async, AI-assisted structured interviews so eager candidates can interview on their own time. They are never blocked by recruiter bottlenecks or cross-continental timezone ping-pong.",
          "Standardize the Top of Funnel: Ruthlessly standardize your first-round signal. The goal is to make downstream, calendar-heavy onsite interviews incredibly scarce, highly meaningful events reserved only for the top 10% of applicants.",
          "Batched Reviews: Implement batched review sessions for candidate scorecards (e.g., 30 minutes every Tuesday and Thursday) instead of relying on chaotic, continuous, one-off Slack threads that disrupt deep work.",
        ],
      },
      {
        type: "heading",
        text: "Preserving the Candidate Experience",
      },
      {
        type: "paragraph",
        text: "Automation only works if the candidate experience remains exceptional. Be transparent that the initial screen is AI-assisted to respect everyone's time, and promise a swift human review. Teams that master this balance hire significantly faster with a fraction of the exhaustion. They succeed because the work that remains on their plate is genuinely strategic, high-leverage evaluation and candidate closing—not tedious administrative reruns.",
      },
    ],
  },
];

export function getAllPostsSorted(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

export type BlogPostCardFields = Pick<
  BlogPost,
  "slug" | "title" | "excerpt" | "publishedAt" | "category" | "coverImageUrl"
>;

export function getPostCardFields(post: BlogPost): BlogPostCardFields {
  const { slug, title, excerpt, publishedAt, category, coverImageUrl } = post;
  return {
    slug,
    title,
    excerpt,
    publishedAt,
    category,
    coverImageUrl,
  };
}