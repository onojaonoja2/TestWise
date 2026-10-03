import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="h-8 w-48 animate-pulse rounded-full bg-stone-900/10" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-stone-900/5" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="paper-card rounded-3xl p-5">
                        <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#C2410C]/10" />
                        <div className="mt-4 h-4 w-24 animate-pulse rounded-full bg-stone-900/10" />
                        <div className="mt-2 h-7 w-16 animate-pulse rounded-lg bg-stone-900/10" />
                    </div>
                ))}
            </div>
            <div className="paper-card flex items-center justify-center gap-3 rounded-3xl py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C2410C]" />
                <p className="text-sm font-medium text-stone-500">Loading your dashboard...</p>
            </div>
        </div>
    )
}
