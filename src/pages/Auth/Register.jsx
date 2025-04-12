"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerTrainer } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dumbbell, UserPlus, ArrowLeft } from "lucide-react"

function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [serverSuccess, setServerSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})
        setServerError("")
        setServerSuccess("")
        setIsLoading(true)

        const newErrors = {}

        if (!name.trim()) {
            newErrors.name = "Name is required."
        }
        if (!email.trim()) {
            newErrors.email = "Email is required."
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Invalid email format."
        }
        if (!password) {
            newErrors.password = "Password is required."
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters."
        }
        if (!passwordConfirmation) {
            newErrors.passwordConfirmation = "Please confirm your password."
        } else if (password !== passwordConfirmation) {
            newErrors.passwordConfirmation = "Passwords do not match."
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsLoading(false)
            return
        }

        try {
            const data = await registerTrainer(name, email, password, passwordConfirmation)
            setServerSuccess(data.message || "Registration successful!")
            setTimeout(() => {
                navigate("/login")
            }, 1500)
        } catch (err) {
            console.error(err)
            if (err.response?.data?.message) {
                setServerError(err.response.data.message)
            } else {
                setServerError("Registration failed.")
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
                    <CardTitle className="text-2xl font-bold text-center">Trainer Registration</CardTitle>
                    <CardDescription className="text-center">Create your trainer account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {serverSuccess && (
                            <Alert className="bg-green-50 text-green-700 border-green-200 text-sm py-2">
                                <AlertDescription>{serverSuccess}</AlertDescription>
                            </Alert>
                        )}
                        {serverError && (
                            <Alert variant="destructive" className="text-sm py-2">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

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

                        <div className="space-y-2">
                            <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                            <Input
                                id="passwordConfirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                            {errors.passwordConfirmation && (
                                <p className="text-red-500 text-sm mt-1">{errors.passwordConfirmation}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            disabled={isLoading || serverSuccess}
                        >
                            {isLoading ? "Registering..." : "Register"}
                            <UserPlus className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Register
