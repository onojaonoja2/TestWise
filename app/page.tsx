import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import {
    ShieldCheck,
    Sparkles,
    Activity,
    BarChart3,
    Clock,
    Building2,
    ArrowRight,
    ArrowUpRight,
    Play,
    Check,
    Mail,
    MessageCircle,
    PhoneCall,
    Star,
    Timer,
    FileCheck2,
    ScanEye,
    GraduationCap,
    PenLine,
} from "lucide-react";
import LandingNav from "./components/LandingNav";
import AnimateOnScroll from "./components/AnimateOnScroll";
import { Button } from "@/components/ui/button";

const features = [
    {
        index: "01",
        icon: ScanEye,
        title: "Anti-cheating suite",
        description:
            "Browser locking, focus tracking, and live session signals keep every sitting honest without intimidating students.",
    },
    {
        index: "02",
        icon: Sparkles,
        title: "AI question generation",
        description:
            "Drop in a syllabus or PDF and get review-ready questions you can approve, edit, and publish in minutes.",
    },
    {
        index: "03",
        icon: Activity,
        title: "Real-time monitoring",
        description:
            "Heartbeat tracking, warning counts, and presence status refresh every few seconds while exams run.",
    },
    {
        index: "04",
        icon: BarChart3,
        title: "Auto-grading & analytics",
        description:
            "Instant scoring with per-question breakdowns and one-click Excel export for department reviews.",
    },
    {
        index: "05",
        icon: Clock,
        title: "Resilient sessions",
        description:
            "Auto-saved answers, countdown timers, and crash-safe submissions mean no lost work, ever.",
    },
    {
        index: "06",
        icon: Building2,
        title: "Multi-tenant orgs",
        description:
            "Isolated workspaces with role-based access for admins, teachers, and student cohorts.",
    },
];

const steps = [
    {
        index: "01",
        icon: PenLine,
        title: "Draft in minutes",
        description:
            "Create from scratch or let AI turn your materials into balanced, curriculum-aligned questions.",
    },
    {
        index: "02",
        icon: ShieldCheck,
        title: "Secure & supervise",
        description:
            "Lock the browser, track focus, and watch every session from a calm live dashboard.",
    },
    {
        index: "03",
        icon: GraduationCap,
        title: "Grade & share",
        description:
            "Auto-grade objective items, moderate the rest, then export results stakeholders trust.",
    },
];

const liveRows = [
    { name: "Grace Hall", initials: "GH", tone: "bg-stone-900 text-[#FFF7ED]", dot: "bg-emerald-500", score: "98%", note: "Answering · Q18/20" },
    { name: "Daniel Okafor", initials: "DO", tone: "bg-[#C2410C] text-white", dot: "bg-emerald-500", score: "87%", note: "Answering · Q16/20" },
    { name: "Amara Obi", initials: "AO", tone: "bg-[#44403C] text-[#FFF7ED]", dot: "bg-amber-500", score: "74%", note: "Flagged · 1 warning" },
    { name: "Samuel Peters", initials: "SP", tone: "bg-[#78716C] text-white", dot: "bg-red-500", score: "68%", note: "Flagged · 2 warnings" },
    { name: "Zainab Bello", initials: "ZB", tone: "bg-[#1C1917] text-[#FDE68A]", dot: "bg-emerald-500", score: "92%", note: "Reviewing · Q20/20" },
];

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#FAF7F1] text-stone-900 selection:bg-[#C2410C] selection:text-white overflow-x-hidden">
            <LandingNav />

            {/* ===================== HERO ===================== */}
            <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <div className="mesh-orb animate-mesh top-[-12%] left-[-6%] h-[28rem] w-[28rem] bg-[#C2410C]/15" />
                    <div className="mesh-orb animate-mesh top-[10%] right-[-8%] h-[26rem] w-[26rem] bg-amber-400/20" style={{ animationDelay: "-6s" }} />
                    <div className="absolute inset-0 dot-grid-warm opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                        {/* Copy */}
                        <div>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2.5 rounded-full border border-stone-900/10 bg-white/80 py-1.5 pl-2 pr-4 text-[13px] font-medium text-stone-700 shadow-sm backdrop-blur hover:border-[#C2410C]/40 transition-colors"
                            >
                                <span className="inline-flex items-center rounded-full bg-[#C2410C] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                    New
                                </span>
                                AI question generation 2.0 is live
                                <ArrowRight className="h-3.5 w-3.5 text-[#C2410C]" />
                            </a>

                            <h1 className="mt-6 font-display text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem] font-semibold tracking-[-0.02em] text-stone-900">
                                Exams that earn
                                <span className="block italic font-medium text-[#C2410C]">
                                    everyone&rsquo;s trust.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                                TestWise gives schools a calm, secure way to create, supervise,
                                and grade examinations — without the cat-and-mouse games or
                                the grading weekend marathons.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Button
                                    nativeButton={false}
                                    render={<a href="/auth/signin" />}
                                    className="h-12 rounded-full bg-stone-900 px-7 text-[15px] font-semibold text-[#FFF7ED] border-0 shadow-[0_16px_30px_-14px_rgba(28,25,23,0.55)] hover:bg-[#C2410C] transition-colors"
                                >
                                    Start your first exam
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    nativeButton={false}
                                    render={<a href="#how-it-works" />}
                                    variant="outline"
                                    className="h-12 rounded-full px-7 text-[15px] font-semibold border-stone-900/15 bg-white/80 text-stone-900 hover:border-stone-900/30 hover:bg-white"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C2410C]/10">
                                        <Play className="h-3 w-3 fill-[#C2410C] text-[#C2410C]" />
                                    </span>
                                    See how it works
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                                <div className="flex -space-x-2.5">
                                    {["AK", "JM", "RS", "T+"]?.map((t, i) => (
                                        <span
                                            key={t}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FAF7F1] text-[11px] font-bold ${
                                                i === 3
                                                    ? "bg-[#C2410C] text-white"
                                                    : "bg-stone-900 text-[#FFF7ED]"
                                            }`}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div>
                                    <span className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                        ))}
                                        <span className="ml-1.5 text-sm font-semibold text-stone-900">4.9/5</span>
                                    </span>
                                    <p className="mt-0.5 text-[13px] text-stone-500">
                                        Loved by 2,400+ educators &amp; examiners
                                    </p>
                                </div>
                            </div>

                            <dl className="mt-10 grid grid-cols-3 divide-x divide-stone-900/10 border-y border-stone-900/10 py-5">
                                {[
                                    { value: "120k+", label: "Exams delivered" },
                                    { value: "99.98%", label: "Session uptime" },
                                    { value: "6 hrs", label: "Saved weekly" },
                                ].map((s) => (
                                    <div key={s.label} className="px-4 first:pl-0">
                                        <dt className="sr-only">{s.label}</dt>
                                        <dd className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                                            {s.value}
                                        </dd>
                                        <dd className="mt-1 text-[13px] font-medium text-stone-500">{s.label}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Visual */}
                        <div className="relative">
                            <div className="paper-card relative rounded-[1.75rem] p-5 sm:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C2410C]">
                                            Live now
                                        </p>
                                        <p className="mt-1 font-display text-xl font-semibold text-stone-900">
                                            Mid-Term · Computer Science
                                        </p>
                                        <p className="text-[13px] text-stone-500">SS2 · 32 candidates · Room A</p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse-glow" />
                                        28 live
                                    </span>
                                </div>

                                <div className="mt-5 space-y-2">
                                    {liveRows.map((row) => (
                                        <div
                                            key={row.name}
                                            className="flex items-center gap-3 rounded-2xl border border-stone-900/8 bg-[#FAF7F1] px-3.5 py-2.5 transition-colors hover:border-[#C2410C]/30 hover:bg-white"
                                        >
                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${row.tone}`}>
                                                {row.initials}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-semibold text-stone-900">
                                                        {row.name}
                                                    </span>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                                                </span>
                                                <span className="block truncate text-xs text-stone-500">{row.note}</span>
                                            </span>
                                            <span className="rounded-lg bg-stone-900 px-2 py-1 text-xs font-bold text-[#FFF7ED]">
                                                {row.score}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-2.5">
                                    {[
                                        { v: "3", l: "Warnings" },
                                        { v: "96%", l: "Completion" },
                                        { v: "18:32", l: "Remaining" },
                                    ].map((s) => (
                                        <div key={s.l} className="rounded-xl bg-stone-900 px-3 py-3 text-center">
                                            <p className="font-display text-lg font-semibold text-[#FFF7ED]">{s.v}</p>
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute -right-3 sm:-right-6 -top-6 rotate-3 rounded-2xl border border-stone-900/10 bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgba(28,25,23,0.4)]">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </span>
                                    Auto-graded
                                </p>
                                <p className="mt-1 font-display text-2xl font-semibold text-[#C2410C]">98%</p>
                            </div>

                            <div className="absolute -left-3 sm:-left-6 -bottom-6 -rotate-2 rounded-2xl border border-stone-900/10 bg-stone-900 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(28,25,23,0.6)]">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                                    <Timer className="h-3.5 w-3.5 text-amber-400" />
                                    Auto-submit in
                                </p>
                                <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-[#FFF7ED]">
                                    18:32
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== LOGOS ===================== */}
            <section className="relative border-y border-stone-900/8 bg-white/60">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                        Powering assessment at forward-thinking schools
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-stone-400">
                        {["Northbridge", "Cedar College", "Brightpath", "EduCore", "Lakeside"].map((name) => (
                            <span key={name} className="font-display text-lg font-semibold tracking-tight">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== FEATURES ===================== */}
            <section id="features" className="relative py-20 sm:py-28">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <AnimateOnScroll className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#C2410C]/25 bg-[#C2410C]/8 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#9A3412]">
                            Why TestWise
                        </span>
                        <h2 className="mt-5 font-display text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-stone-900">
                            Everything from draft <span className="italic text-[#C2410C]">to done.</span>
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-stone-600">
                            One calm workspace for the whole exam lifecycle — no plugins,
                            no paper trails, no all-night grading.
                        </p>
                    </AnimateOnScroll>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, index) => (
                            <AnimateOnScroll key={feature.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                                <article className="paper-card paper-card-hover group h-full rounded-3xl p-7">
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C2410C]/10 text-[#C2410C] transition-colors group-hover:bg-[#C2410C] group-hover:text-white">
                                            <feature.icon className="h-6 w-6" />
                                        </span>
                                        <span className="font-display text-sm font-semibold text-stone-300">
                                            {feature.index}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 font-display text-xl font-semibold text-stone-900">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
                                        {feature.description}
                                    </p>
                                </article>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== HOW IT WORKS ===================== */}
            <section id="how-it-works" className="relative pb-20 sm:pb-28">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#F3ECE1]">
                        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 p-8 sm:p-12">
                            <AnimateOnScroll>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A3412]">
                                    How it works
                                </span>
                                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
                                    From blank page to final scores in three moves.
                                </h2>
                                <p className="mt-4 leading-relaxed text-stone-600">
                                    Designed with examiners, not just for them. Each step
                                    removes a manual chore your team currently dreads.
                                </p>
                                <Button
                                    nativeButton={false}
                                    render={<a href="/auth/signin" />}
                                    className="mt-7 h-11 rounded-full bg-[#C2410C] px-6 text-sm font-semibold text-white border-0 shadow-[0_14px_28px_-14px_rgba(194,65,12,0.7)] hover:bg-[#9A3412] transition-colors"
                                >
                                    Try the workflow
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </AnimateOnScroll>
                            <ol className="space-y-4">
                                {steps.map((step, i) => (
                                    <AnimateOnScroll key={step.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                                        <li className="flex gap-4 rounded-2xl border border-stone-900/10 bg-[#FFFDF9] p-5 sm:p-6">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-[#FFF7ED]">
                                                <step.icon className="h-5 w-5" />
                                            </span>
                                            <span>
                                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C2410C]">
                                                    Step {step.index}
                                                </span>
                                                <span className="mt-1 block font-display text-lg font-semibold text-stone-900">
                                                    {step.title}
                                                </span>
                                                <span className="mt-1 block text-sm leading-relaxed text-stone-600">
                                                    {step.description}
                                                </span>
                                            </span>
                                        </li>
                                    </AnimateOnScroll>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== SECURITY (dark contrast) ===================== */}
            <section id="security" className="relative pb-20 sm:pb-28">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="relative overflow-hidden rounded-[2rem] bg-[#1C1917] px-6 py-12 sm:p-14">
                        <div
                            className="absolute inset-0 pointer-events-none opacity-60"
                            aria-hidden
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 85% 15%, rgba(194,65,12,0.35), transparent 45%), radial-gradient(circle at 10% 90%, rgba(217,119,6,0.18), transparent 40%)",
                            }}
                        />
                        <div className="relative grid items-center gap-12 lg:grid-cols-2">
                            <AnimateOnScroll>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                                    Exam integrity
                                </span>
                                <h2 className="mt-5 font-display text-3xl sm:text-[2.75rem] sm:leading-[1.08] font-semibold tracking-tight text-[#FAF7F1]">
                                    Calm for students.
                                    <span className="block italic text-[#E7A06B]">Strict on cheating.</span>
                                </h2>
                                <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-stone-300">
                                    Watch sessions unfold live — presence, warnings, and
                                    progress at a glance. Intervene early, with evidence,
                                    instead of discovering issues after submission.
                                </p>
                                <ul className="mt-7 space-y-3.5">
                                    {[
                                        { icon: FileCheck2, text: "Heartbeat tracking keeps every session status live." },
                                        { icon: ScanEye, text: "Three-strike warning system flags suspicious behavior." },
                                        { icon: Timer, text: "Five-second polling for instant visibility." },
                                    ].map((item) => (
                                        <li key={item.text} className="flex items-start gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C2410C]">
                                                <item.icon className="h-4.5 w-4.5 text-white" />
                                            </span>
                                            <span className="pt-1.5 leading-relaxed text-stone-200">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                    <Button
                                        nativeButton={false}
                                        render={<a href="#contact" />}
                                        className="h-12 rounded-full bg-[#C2410C] px-7 font-semibold text-white border-0 shadow-[0_16px_32px_-14px_rgba(194,65,12,0.8)] hover:bg-[#EA580C] transition-colors"
                                    >
                                        Talk to our team
                                    </Button>
                                    <Button
                                        nativeButton={false}
                                        render={<a href="/auth/signin" />}
                                        variant="outline"
                                        className="h-12 rounded-full px-7 font-semibold border-white/20 bg-transparent text-[#FAF7F1] hover:bg-white/10 hover:text-white"
                                    >
                                        Get started
                                    </Button>
                                </div>
                            </AnimateOnScroll>

                            <AnimateOnScroll delay={2}>
                                <div className="rounded-3xl bg-[#FAF7F1] p-5 sm:p-6 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">Integrity feed</p>
                                            <p className="text-xs text-stone-500">Flagged events · just now</p>
                                        </div>
                                        <span className="rounded-full bg-[#C2410C]/10 px-3 py-1 text-xs font-bold text-[#9A3412]">
                                            3 open
                                        </span>
                                    </div>
                                    <div className="mt-4 space-y-2.5">
                                        {[
                                            { tag: "Focus lost", who: "Amara Obi · 12s away", tone: "bg-amber-100 text-amber-900" },
                                            { tag: "Tab switch", who: "Samuel Peters · attempt 2 of 3", tone: "bg-red-100 text-red-900" },
                                            { tag: "Resolved", who: "Grace Hall · back in 4s", tone: "bg-emerald-100 text-emerald-900" },
                                        ].map((e) => (
                                            <div key={e.who} className="flex items-center justify-between gap-3 rounded-xl border border-stone-900/8 bg-white px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-900">{e.who}</p>
                                                    <p className="text-xs text-stone-500">Auto-logged with timestamp</p>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${e.tone}`}>
                                                    {e.tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-3">
                                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                        <p className="text-[13px] text-stone-200">
                                            <span className="font-semibold text-white">29 of 32</span> sessions clean — no action needed.
                                        </p>
                                    </div>
                                </div>
                            </AnimateOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== CONTACT ===================== */}
            <section id="contact" className="relative pb-20 sm:pb-28">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                        <AnimateOnScroll>
                            <div className="paper-card h-full rounded-[2rem] p-8 sm:p-10">
                                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                                    Talk to a human <span className="italic text-[#C2410C]">today.</span>
                                </h2>
                                <p className="mt-3 leading-relaxed text-stone-600">
                                    Rolling out to a department or a whole institution?
                                    We&rsquo;ll help you scope it in one call.
                                </p>
                                <div className="mt-7 space-y-3">
                                    {[
                                        { icon: Mail, label: "Email us", value: "info@byteops.digital", href: "mailto:info@byteops.digital" },
                                        { icon: MessageCircle, label: "WhatsApp", value: "+234 701 909 1481", href: "https://wa.me/2347019091481" },
                                        { icon: PhoneCall, label: "Call us", value: "+234 704 712 3311", href: "tel:+2347047123311" },
                                    ].map((c) => (
                                        <a
                                            key={c.label}
                                            href={c.href}
                                            target={c.href.startsWith("http") ? "_blank" : undefined}
                                            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="group flex items-center gap-4 rounded-2xl border border-stone-900/10 bg-[#FAF7F1] p-4 transition-colors hover:border-[#C2410C]/40 hover:bg-white"
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C2410C]/10 text-[#C2410C] group-hover:bg-[#C2410C] group-hover:text-white transition-colors">
                                                <c.icon className="h-5 w-5" />
                                            </span>
                                            <span>
                                                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                                                    {c.label}
                                                </span>
                                                <span className="block font-semibold text-stone-900">{c.value}</span>
                                            </span>
                                            <ArrowUpRight className="ml-auto h-4 w-4 text-stone-300 group-hover:text-[#C2410C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </AnimateOnScroll>

                        <AnimateOnScroll delay={2}>
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#C2410C] p-8 sm:p-10 text-white">
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    aria-hidden
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(circle at 10% 100%, rgba(0,0,0,0.25), transparent 45%)",
                                    }}
                                />
                                <div className="relative">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                                        Get started
                                    </p>
                                    <h3 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                                        Run your first secure exam this week.
                                    </h3>
                                    <ul className="mt-6 space-y-2.5 text-[15px] text-white/90">
                                        {[
                                            "Free pilot for one class or department",
                                            "Import questions or generate with AI",
                                            "Live support during your first sitting",
                                        ].map((t) => (
                                            <li key={t} className="flex items-start gap-2.5">
                                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </span>
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                        <Button
                                            nativeButton={false}
                                            render={<a href="/auth/signin" />}
                                            className="h-12 rounded-full bg-white px-7 font-semibold text-stone-900 border-0 hover:bg-[#FFF7ED] transition-colors"
                                        >
                                            Start free
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            nativeButton={false}
                                            render={<a href="#features" />}
                                            variant="outline"
                                            className="h-12 rounded-full px-7 font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                        >
                                            Explore features
                                        </Button>
                                    </div>
                                    <p className="mt-6 text-[13px] text-white/70">
                                        No credit card · Set up in under 15 minutes
                                    </p>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </section>

            {/* ===================== FOOTER ===================== */}
            <footer className="bg-[#1C1917] text-stone-300">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
                    <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-[#C2410C] p-2 rounded-xl">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div className="leading-none">
                                    <p className="font-display text-xl font-semibold text-[#FAF7F1]">TestWise</p>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                                        Smart Exam OS
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-stone-400">
                                Secure, AI-assisted examinations for schools that
                                take fairness seriously.
                            </p>
                        </div>
                        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Product</p>
                                <ul className="mt-3 space-y-2.5">
                                    <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                                    <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Company</p>
                                <ul className="mt-3 space-y-2.5">
                                    <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                                    <li><a href="/auth/signin" className="hover:text-white transition-colors">Sign in</a></li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Reach us</p>
                                <ul className="mt-3 space-y-2.5">
                                    <li><a href="mailto:info@byteops.digital" className="hover:text-white transition-colors">info@byteops.digital</a></li>
                                    <li><a href="tel:+2347047123311" className="hover:text-white transition-colors">+234 704 712 3311</a></li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    <div className="mt-10 h-px w-full bg-white/10" />
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-stone-500">
                        <p>&copy; {new Date().getFullYear()} TestWise. All rights reserved.</p>
                        <p>
                            Crafted by <span className="font-semibold text-stone-300">ByteOps Digital Systems</span>
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
