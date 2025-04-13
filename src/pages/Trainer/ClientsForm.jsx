"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createClient, getClient, updateClient } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Eye, EyeOff, RefreshCw } from "lucide-react"

function ClientForm() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        notes: "",
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEditMode)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (isEditMode) {
            fetchClient()
        }
    }, [id])

    async function fetchClient() {
        try {
            setInitialLoading(true)
            const response = await getClient(id)
            const clientData = response.data || response

            setFormData({
                name: clientData.name || "",
                email: clientData.email || "",
                password: "", // Password is not returned from the API
                phone: clientData.phone || "",
                address: clientData.address || "",
                notes: clientData.notes || "",
            })
        } catch (err) {
            console.error("Error fetching client", err)
            setServerError("Failed to load client data")
        } finally {
            setInitialLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const generateRandomPassword = () => {
        // Generate a random password with letters, numbers, and special characters
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        let password = ""

        // Ensure at least 8 characters
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        setFormData((prev) => ({ ...prev, password }))
        setShowPassword(true) // Show the password when generated

        // Clear password error if any
        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }))
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        } else if (formData.name.length > 255) {
            newErrors.name = "Name must be less than 255 characters"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        // Only validate password for new clients or if password is provided for existing clients
        if (!isEditMode || formData.password) {
            if (!isEditMode && !formData.password) {
                newErrors.password = "Password is required"
            } else if (formData.password && formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError("")

        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)

            const dataToSubmit = { ...formData }
            if (isEditMode && !dataToSubmit.password) {
                delete dataToSubmit.password
            }

            if (isEditMode) {
                await updateClient(id, dataToSubmit)
            } else {
                await createClient(dataToSubmit)
            }

            navigate("/trainer/clients")
        } catch (err) {
            console.error("Error saving client", err)

            if (err.response?.data?.errors) {
                // Handle validation errors from Laravel
                const serverErrors = err.response.data.errors
                const formattedErrors = {}

                Object.keys(serverErrors).forEach((key) => {
                    formattedErrors[key] = serverErrors[key][0]
                })

                setErrors(formattedErrors)
            } else {
                setServerError("Failed to save client. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/trainer/clients")}
                    className="hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? "Edit Client" : "Add New Client"}</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{isEditMode ? "Edit Client Details" : "Client Details"}</CardTitle>
                        <CardDescription>
                            {isEditMode ? "Update the information for this client" : "Fill in the details to create a new client"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password {!isEditMode && <span className="text-red-500">*</span>}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={generateRandomPassword}
                                    className="text-xs h-7 px-2 hover:bg-muted transition-colors"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Generate Password
                                </Button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={isEditMode ? "Leave blank to keep current password" : "Minimum 8 characters"}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                </Button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            {formData.password && (
                                <p className="text-xs text-muted-foreground">
                                    {formData.password.length < 8
                                        ? `Password must be at least 8 characters (currently ${formData.password.length})`
                                        : "Password meets minimum requirements"}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Main St, City, Country"
                            />
                            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional information about the client"
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/trainer/clients")}
                            className="hover:bg-muted transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 transition-colors">
                            {loading ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditMode ? "Update Client" : "Save Client"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default ClientForm
