import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck, Zap, BrainCircuit, ArrowRight, Mail, MessageCircle } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                TestWise
              </span>
            </Link>
            <div>
              <Link
                href="#contact"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-white/5"
              >
                Contact
              </Link>
              <Link
                href="/auth/signin"
                className="ml-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <span className="text-sm text-gray-300">The Future of Online Testing</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8">
            <span className="block text-white">Intelligent Exams.</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">
              Uncompromised Security.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            TestWise empowers educational institutions with secure, AI-enhanced examination tools.
            Create, monitor, and grade tests with unprecedented ease and reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signin"
              className="group flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Start Testing Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 rounded-full font-semibold border border-white/20 hover:bg-white/5 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
              <div className="bg-indigo-500/10 p-3 rounded-lg w-fit mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <ShieldCheck className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Anti-Cheating Suite</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced browser locking, focus tracking, and real-time monitoring ensure integrity in every exam session.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
              <div className="bg-purple-500/10 p-3 rounded-lg w-fit mb-6 group-hover:bg-purple-500/20 transition-colors">
                <CheckCircle2 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Reliable & Robust</h3>
              <p className="text-gray-400 leading-relaxed">
                Auto-saving answers, resilient session management, and instant submission handling prevent data loss.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors group">
              <div className="bg-pink-500/10 p-3 rounded-lg w-fit mb-6 group-hover:bg-pink-500/20 transition-colors">
                <Zap className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Get immediate insights with automated grading and detailed performance reports for every student.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">Get in Touch</h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <a
              href="mailto:byteops.digital@gmail.com"
              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
            >
              <div className="bg-indigo-500/10 p-2 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                <Mail className="h-6 w-6 text-indigo-400" />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">byteops.digital@gmail.com</span>
            </a>

            <a
              href="https://wa.me/2347080904982"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all group"
            >
              <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">+234 708 090 4982</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        <p className="mb-2">&copy; {new Date().getFullYear()} TestWise. All rights reserved.</p>
        <p className="flex items-center justify-center gap-1">
          Made with <span className="text-red-500">❤️</span> by ByteOps Digital Systems
        </p>
      </footer>
    </main>
  );
}
