import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Dumbbell } from "lucide-react"

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-teal-100 px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto bg-white p-3 rounded-full w-16 h-16 flex items-center justify-center shadow-md">
                        <Dumbbell className="h-8 w-8 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gym Planner App</h1>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Sign in to access your personalized training programs
                    </p>
                </div>

                <Card className="shadow-md border-0">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="rounded-lg bg-teal-50 p-4 text-sm text-teal-800">
                                <p>
                                    Access to the platform requires an account. If you don't have an account yet, you'll be prompted to
                                    register during login.
                                </p>
                            </div>

                            <Link to="/login" className="block w-full">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white group" size="lg">
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-gray-500">
                    <p>© 2024 Gym Planner. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Home
