import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import {
    ShieldCheck,
    Zap,
    BrainCircuit,
    ArrowRight,
    Mail,
    MessageCircle,
    PhoneCall,
    Sparkles,
    Activity,
    BarChart3,
    Clock,
    Building2,
    UserCheck,
    ShieldAlert,
    LayoutDashboard,
    Eye,
} from "lucide-react";
import LandingNav from "./components/LandingNav";
import AnimateOnScroll from "./components/AnimateOnScroll";
import { Button } from "@/components/ui/button";

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
            <LandingNav />

            {/* ===================== HERO ===================== */}
            <section className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
                {/* Animated mesh gradient background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="mesh-orb animate-mesh top-[-15%] left-[10%] h-[34rem] w-[34rem] bg-indigo-600/25" />
                    <div className="mesh-orb animate-mesh top-[5%] right-[5%] h-[30rem] w-[30rem] bg-purple-600/20" style={{ animationDelay: '-6s' }} />
                    <div className="mesh-orb animate-mesh bottom-[-10%] left-[30%] h-[28rem] w-[28rem] bg-cyan-500/15" style={{ animationDelay: '-12s' }} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]" />
                    <div
                        className="absolute inset-0 opacity-[0.14]"
                        style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
                            backgroundSize: "40px 40px",
                            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
                            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
                        }}
                    />
                </div>

                {/* Floating glass badges */}
                <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
                    <div className="animate-float absolute top-44 left-[8%]">
                        <div className="glass rounded-xl px-4 py-3 flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                            <span className="text-sm text-gray-200">Real-time monitoring</span>
                        </div>
                    </div>
                    <div className="animate-float-slow absolute top-56 right-[7%]">
                        <div className="glass rounded-xl px-4 py-3 flex items-center gap-2.5">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-gray-200">AI question generation</span>
                        </div>
                    </div>
                    <div className="animate-float absolute bottom-32 left-[16%]" style={{ animationDelay: '-3s' }}>
                        <div className="glass rounded-xl px-4 py-3 flex items-center gap-2.5">
                            <Zap className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-200">Auto-grading</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse-glow" />
                        <span className="text-sm text-gray-300">The Future of Online Testing</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
                        <span className="block text-white drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]">Intelligent Exams.</span>
                        <span className="block text-gradient animate-gradient bg-gradient-to-r from-indigo-300 via-purple-400 to-cyan-300 drop-shadow-[0_0_45px_rgba(168,85,247,0.35)]">
                            Uncompromised Security.
                        </span>
                    </h1>

                    <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        TestWise empowers educational institutions with secure, AI-enhanced examination tools.
                        Create, monitor, and grade tests with unprecedented ease and reliability.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            render={<a href="/auth/signin" />}
                            className="group h-12 rounded-full bg-white text-black px-8 font-semibold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:bg-gray-100 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all border-0"
                        >
                            Start Testing Now
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            render={<a href="#features" />}
                            className="h-12 rounded-full px-8 font-semibold glass border-white/15 text-white hover:bg-white/10 transition-all"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* ===================== FEATURES ===================== */}
            <section id="features" className="relative py-24 sm:py-32 border-t border-white/[0.06]">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="mesh-orb animate-mesh top-1/3 left-[-10%] h-[24rem] w-[24rem] bg-purple-600/15" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimateOnScroll className="text-center max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-gray-300 uppercase tracking-widest">
                            Why TestWise
                        </span>
                        <h2 className="mt-6 text-3xl sm:text-5xl font-bold tracking-tight">
                            Everything you need for
                            <span className="block text-gradient animate-gradient bg-gradient-to-r from-indigo-300 via-purple-400 to-cyan-300">
                                every exam lifecycle
                            </span>
                        </h2>
                        <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                            From creation to grading, TestWise covers the entire examination journey with intelligent automation.
                        </p>
                    </AnimateOnScroll>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Anti-Cheating Suite",
                                description: "Advanced browser locking, focus tracking, and real-time monitoring ensure integrity in every exam session.",
                                chip: "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(99,102,241,0.55)]",
                                border: "group-hover:border-indigo-400/40",
                            },
                            {
                                icon: Sparkles,
                                title: "AI Question Generation",
                                description: "Upload documents and let AI craft review-ready questions you can approve, edit, and apply instantly.",
                                chip: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(168,85,247,0.55)]",
                                border: "group-hover:border-purple-400/40",
                            },
                            {
                                icon: Activity,
                                title: "Real-Time Monitoring",
                                description: "Watch live student sessions with heartbeat tracking, warning counts, and instant status updates.",
                                chip: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(34,211,238,0.55)]",
                                border: "group-hover:border-cyan-400/40",
                            },
                            {
                                icon: BarChart3,
                                title: "Auto-Grading & Analytics",
                                description: "Automated scoring with per-question breakdowns and one-click Excel export for deep class insights.",
                                chip: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(52,211,153,0.55)]",
                                border: "group-hover:border-emerald-400/40",
                            },
                            {
                                icon: Clock,
                                title: "Resilient Sessions",
                                description: "Auto-saved answers, countdown timers, and crash-resilient submission handling prevent data loss.",
                                chip: "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(251,191,36,0.5)]",
                                border: "group-hover:border-amber-400/40",
                            },
                            {
                                icon: Building2,
                                title: "Multi-Tenant Organization",
                                description: "Isolated org workspaces with role-based control for admins, teachers, and student groups.",
                                chip: "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/25",
                                glow: "group-hover:shadow-[0_0_45px_-12px_rgba(244,63,94,0.5)]",
                                border: "group-hover:border-rose-400/40",
                            },
                        ].map((feature, index) => (
                            <div key={feature.title}>
                                <AnimateOnScroll delay={((index % 3) + 1) as 1 | 2 | 3}>
                                    <div className={`glass-card glass-card-hover group flex h-full rounded-2xl p-8 ${feature.glow} ${feature.border}`}>
                                        <div className={`w-fit p-3 rounded-xl ${feature.chip} transition-colors duration-300`}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
                                        <p className="mt-2.5 text-sm leading-relaxed text-gray-400">{feature.description}</p>
                                    </div>
                                </AnimateOnScroll>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== SECURITY SHOWCASE ===================== */}
            <section id="security" className="relative py-24 sm:py-32 border-t border-white/[0.06] overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="mesh-orb animate-mesh bottom-0 right-[-8%] h-[26rem] w-[26rem] bg-indigo-600/18" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <AnimateOnScroll>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-gray-300 uppercase tracking-widest">
                                <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
                                Exam Integrity
                            </span>
                            <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
                                Total peace of mind,
                                <span className="block text-gradient animate-gradient bg-gradient-to-r from-indigo-300 via-purple-400 to-cyan-300">
                                    exam after exam.
                                </span>
                            </h2>
                            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl">
                                Watch every session unfold in real time. Our live monitor surfaces each student&apos;s status,
                                warnings, and activity so you can intervene the moment something looks off.
                            </p>
                            <ul className="mt-8 space-y-4">
                                {[
                                    { icon: UserCheck, text: "Heartbeat tracking keeps every session status live." },
                                    { icon: Eye, text: "Three-strike warning system flags suspicious behavior." },
                                    { icon: LayoutDashboard, text: "Poll every 5 seconds for instant visibility." },
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3.5">
                                        <div className="glass rounded-lg p-2 shrink-0">
                                            <item.icon className="h-5 w-5 text-indigo-300" />
                                        </div>
                                        <span className="text-gray-300 leading-relaxed">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <Button
                                    render={<a href="#contact" />}
                                    className="h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-400 hover:to-purple-400 border-0 transition-all"
                                >
                                    Talk to our team
                                </Button>
                                <Button
                                    render={<a href="/auth/signin" />}
                                    className="h-12 rounded-full px-8 font-semibold glass border-white/15 text-white hover:bg-white/10 transition-all"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </AnimateOnScroll>

                        {/* Monitoring mockup */}
                        <AnimateOnScroll delay={2}>
                            <div className="glass-card glass-card-hover relative rounded-3xl p-6 sm:p-8">
                                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 -z-10 blur-sm" />
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Live Exam Monitor</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Mid-Term · Computer Science</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium px-2.5 py-1 ring-1 ring-inset ring-emerald-500/25">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                                        12 live
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        { name: "Grace Hall", initials: "GH", status: "bg-emerald-400", score: "98%" },
                                        { name: "Daniel Okafor", initials: "DO", status: "bg-emerald-400", score: "87%" },
                                        { name: "Amara Obi", initials: "AO", status: "bg-amber-400", score: "74%" },
                                        { name: "Samuel Peters", initials: "SP", status: "bg-red-400", score: "68%" },
                                        { name: "Zainab Bello", initials: "ZB", status: "bg-emerald-400", score: "92%" },
                                    ].map((row, index) => (
                                        <div key={index} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 transition-colors hover:bg-white/[0.06]">
                                            <div className="relative shrink-0">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {row.initials}
                                                </div>
                                                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${row.status} ring-2 ring-[#0a0a0a]`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-white truncate">{row.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Active · answering</p>
                                            </div>
                                            <span className={`text-xs font-semibold rounded-md px-2 py-1 ${row.status === "bg-emerald-400" ? "bg-emerald-500/10 text-emerald-300" : row.status === "bg-amber-400" ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"}`}>
                                                {row.score}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                                        <p className="text-lg font-bold text-white">3</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Warnings</p>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                                        <p className="text-lg font-bold text-white">96%</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Completion</p>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                                        <p className="text-lg font-bold text-white">18:32</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Remaining</p>
                                    </div>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </section>

            {/* ===================== CONTACT ===================== */}
            <section id="contact" className="relative py-24 sm:py-32 border-t border-white/[0.06] overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="mesh-orb animate-mesh top-[-5%] right-[15%] h-[26rem] w-[26rem] bg-purple-600/15" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimateOnScroll className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Get in Touch</h2>
                        <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                            Have questions about bringing TestWise to your institution? We&apos;re one message away.
                        </p>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={2} className="mt-14">
                        <div className="glass-card relative rounded-3xl overflow-hidden">
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/15 -z-10 blur-sm" />
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                                <a
                                    href="mailto:info@byteops.digital"
                                    className="group flex flex-col items-center gap-4 p-10 hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="rounded-2xl bg-indigo-500/10 p-4 group-hover:scale-110 transition-transform duration-300">
                                        <Mail className="h-7 w-7 text-indigo-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-1">Email us</p>
                                        <p className="text-gray-200 font-medium group-hover:text-white transition-colors">info@byteops.digital</p>
                                    </div>
                                </a>
                                <a
                                    href="https://wa.me/2347019091481"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col items-center gap-4 p-10 hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="rounded-2xl bg-emerald-500/10 p-4 group-hover:scale-110 transition-transform duration-300">
                                        <MessageCircle className="h-7 w-7 text-emerald-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-1">WhatsApp</p>
                                        <p className="text-gray-200 font-medium group-hover:text-white transition-colors">+234 701 909 1481</p>
                                    </div>
                                </a>
                                <a
                                    href="tel:+2347047123311"
                                    className="group flex flex-col items-center gap-4 p-10 hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="rounded-2xl bg-cyan-500/10 p-4 group-hover:scale-110 transition-transform duration-300">
                                        <PhoneCall className="h-7 w-7 text-cyan-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-1">Call us</p>
                                        <p className="text-gray-200 font-medium group-hover:text-white transition-colors">+234 704 712 3311</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>

            {/* ===================== FOOTER ===================== */}
            <footer className="relative border-t border-white/[0.06] bg-black/40 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                                <BrainCircuit className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white">TestWise</p>
                                <p className="text-xs text-gray-500">Smart Exam Management System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                            <a href="#security" className="text-sm text-gray-400 hover:text-white transition-colors">Security</a>
                            <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                    <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} TestWise. All rights reserved.</p>
                        <p className="flex items-center gap-1.5">
                            Made with <span className="text-red-500">❤</span> by ByteOps Digital Systems
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}