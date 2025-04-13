import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createClient, getClient, updateClient } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"

function ClientForm() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "client", // Default role
        phone: "",
        address: "",
        notes: "",
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEditMode)

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
                role: clientData.role || "client",
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

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!formData.role) {
            newErrors.role = "Role is required"
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

            if (isEditMode) {
                await updateClient(id, formData)
            } else {
                await createClient(formData)
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
                            <Label htmlFor="role">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border shadow-md">
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="premium">Premium Client</SelectItem>
                                    <SelectItem value="vip">VIP Client</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
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
