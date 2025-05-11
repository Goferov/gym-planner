"use client"

import { useContext, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Home, Calendar, History, Settings, Menu, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

function ClientLayout() {
    const { user, logout } = useContext(AuthContext)
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/login")
            toast.success("Successfully logged out")
        } catch (error) {
            console.error("Logout error", error)
            toast.error("Logout error")
        }
    }

    const navigation = [
        { name: "Home", href: "", icon: Home },
        { name: "My Plans", href: "plans", icon: Calendar },
        { name: "History", href: "history", icon: History },
        { name: "Settings", href: "settings", icon: Settings },
    ]

    const isActive = (path) => {
        return location.pathname === `/client/${path}`
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Mobile header */}
            <header className="sticky top-0 z-10 bg-white border-b shadow-sm h-16 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-2 py-4 border-b">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-teal-500 text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user?.name || "User"}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <nav className="flex flex-col gap-1 py-4">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-md px-3 py-4 text-base transition-all",
                                                isActive(item.href) ? "bg-teal-500 text-white" : "text-gray-600 hover:bg-gray-100",
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto border-t py-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 py-4 px-3 h-auto"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        Log Out
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="text-xl font-semibold ml-2">Training App</div>
                </div>
                <Avatar className="h-9 w-9 md:hidden">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-teal-500 text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
            </header>

            {/* Main content */}
            <main className="flex-1 container max-w-lg mx-auto px-4 py-6">
                <Outlet />
            </main>

            {/* Bottom navigation for mobile */}
            <div className="md:hidden sticky bottom-0 bg-white border-t shadow-sm">
                <nav className="flex justify-around">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center py-3 text-xs",
                                isActive(item.href) ? "text-teal-500 font-medium" : "text-gray-500 hover:text-gray-900",
                            )}
                        >
                            <item.icon className="h-6 w-6 mb-1" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r shadow-sm">
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 p-6 border-b">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-teal-500 text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user?.name || "User"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1 p-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-4 py-3 text-base transition-all",
                                    isActive(item.href) ? "bg-teal-500 text-white" : "text-gray-600 hover:bg-gray-100",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto border-t p-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientLayout
