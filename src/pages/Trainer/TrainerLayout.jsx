import { useContext, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Dumbbell, Settings, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function TrainerLayout() {
    const { user, logout } = useContext(AuthContext)
    const [message, setMessage] = useState("")
    const [open, setOpen] = useState(false)
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
        { name: "Exercise Plans", href: "plans", icon: Dumbbell },
        { name: "Settings", href: "settings", icon: Settings },
    ]

    const NavItems = () => (
        <>
            {navigation.map((item) => {
                const isActive = location.pathname === `/trainer/${item.href}`
                return (
                    <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive ? "bg-teal-500 text-white" : "hover:bg-muted",
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
            {/* Mobile menu button */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-full flex-col bg-gray-800 text-white">
                        <div className="p-4">
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
                            <nav className="space-y-1">
                                <NavItems />
                            </nav>
                        </div>
                        <div className="mt-auto p-4">
                            <Button variant="destructive" className="w-full cursor-pointer" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4 " />
                                Logout
                            </Button>
                            {message && (
                                <Alert className="mt-2 bg-green-800 border-green-700">
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

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
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
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
            <main className="flex-1 bg-gray-100 min-h-screen">
                <div className="container mx-auto py-6 px-4 md:px-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default TrainerLayout
