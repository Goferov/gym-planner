"use client"

import { useContext, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Dumbbell, ClipboardList, Settings, LogOut, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

function TrainerLayout() {
    const { user, logout } = useContext(AuthContext)
    const [message, setMessage] = useState("")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const handleLogout = async () => {
        try {
            await logout()
            setMessage("Successfully logged out")
        } catch (error) {
            console.error("Logout error", error)
            setMessage("Logout error")
        }
    }

    const navigation = [
        { name: "Dashboard", href: "", icon: LayoutDashboard },
        { name: "Clients", href: "clients", icon: Users },
        { name: "Exercises", href: "exercises", icon: Dumbbell },
        { name: "Plans", href: "plans", icon: ClipboardList },
        { name: "Settings", href: "settings", icon: Settings },
    ]

    const NavItems = () => (
        <>
            {navigation.map((item) => {
                // console.log(location.pathname);
                // console.log(`/trainer/${item.href ? item.href : '/'}`);
                const isActive = location.pathname === `/trainer${item.href ? '/' + item.href : ''}`
                return (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                            isActive ? "bg-teal-500 text-white" : "text-gray-200 hover:bg-gray-700 hover:text-white",
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                )
            })}
        </>
    )

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile header */}
            <div className="h-16 bg-gray-800 flex items-center justify-between px-4 md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                <div className="text-white font-medium">Trainer Portal</div>
                <div className="w-10"></div> {/* Spacer for balance */}
            </div>

            {/* Mobile menu - using a simple conditional render instead of Sheet */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-gray-800/95">
                    <div className="flex h-16 items-center justify-between px-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                        <div className="text-white font-medium">Trainer Portal</div>
                        <div className="w-10"></div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-6">
                            <Avatar>
                                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-teal-500">{user?.name?.charAt(0) || "T"}</AvatarFallback>
                            </Avatar>
                            <div className="text-white">
                                <p className="font-medium">{user?.name || "Trainer"}</p>
                                <p className="text-xs text-gray-400">{user?.email || "trainer@example.com"}</p>
                            </div>
                        </div>
                        <nav className="space-y-1 text-white">
                            <NavItems />
                        </nav>
                        <div className="mt-8">
                            <Button
                                variant="destructive"
                                className="w-full hover:bg-red-700 transition-colors duration-200"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                            {message && (
                                <Alert className="mt-2 bg-green-800 border-green-700">
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-gray-800 text-white">
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Avatar>
                            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-teal-500">{user?.name?.charAt(0) || "T"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user?.name || "Trainer"}</p>
                            <p className="text-xs text-gray-400">{user?.email || "trainer@example.com"}</p>
                        </div>
                    </div>
                    <Separator className="bg-gray-700 my-4" />
                    <nav className="space-y-1">
                        <NavItems />
                    </nav>
                    <div className="mt-auto">
                        <Separator className="bg-gray-700 my-4" />
                        <Button
                            variant="destructive"
                            className="w-full hover:bg-red-700 transition-colors duration-200"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                        {message && (
                            <Alert className="mt-2 bg-green-800 border-green-700">
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-100 min-h-screen md:min-h-0">
                <div className="container mx-auto py-6 px-4 md:px-6 md:pt-6 pt-4">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default TrainerLayout
