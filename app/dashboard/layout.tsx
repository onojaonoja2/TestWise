import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import DashboardNavigation from "./components/DashboardNavigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/signin")
    }

    // Pass necessary user info to client components
    const userSession = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        isSubAdmin: session.user.isSubAdmin,
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <DashboardNavigation user={userSession} />
            <main className="lg:pl-72">
                <div className="px-4 py-8 sm:px-6 lg:px-8 xl:px-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
