"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { login } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dumbbell, LogIn, UserPlus } from "lucide-react"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { setToken, setUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})
        setServerError("")
        setIsLoading(true)

        const newErrors = {}

        if (!email.trim()) {
            newErrors.email = "Email is required."
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Invalid email format."
        }

        if (!password) {
            newErrors.password = "Password is required."
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsLoading(false)
            return
        }

        try {
            const data = await login(email, password)
            setToken(data.token)
            setUser(data.user)
            navigate("/trainer")
        } catch (err) {
            console.error(err)
            if (err.response?.data?.message) {
                setServerError(err.response.data.message)
            } else {
                setServerError("Login failed. Please check your credentials.")
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-teal-100 px-4 py-12">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="mx-auto bg-white p-2 rounded-full w-12 h-12 flex items-center justify-center shadow-sm mb-2">
                        <Dumbbell className="h-6 w-6 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {serverError && (
                            <Alert variant="destructive" className="text-sm py-2">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                            <LogIn className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => navigate("/register")}>
                        Register
                        <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login
