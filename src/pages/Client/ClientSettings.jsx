"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/AuthContext"
import { updateMyProfile, changeMyPassword } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Save, User, Lock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

function ClientSettings() {
    const { user, setUser } = useContext(AuthContext)

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
    })
    const [profileErrors, setProfileErrors] = useState({})
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState(false)

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    })
    const [passwordErrors, setPasswordErrors] = useState({})
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || "",
                email: user.email || "",
            })
        }
    }, [user])

    // Handle profile form changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileForm((prev) => ({ ...prev, [name]: value }))

        // Clear error when field is edited
        if (profileErrors[name]) {
            setProfileErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Handle password form changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm((prev) => ({ ...prev, [name]: value }))

        // Clear error when field is edited
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Validate profile form
    const validateProfileForm = () => {
        const errors = {}

        if (!profileForm.name.trim()) {
            errors.name = "Name is required"
        }

        if (!profileForm.email.trim()) {
            errors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(profileForm.email)) {
            errors.email = "Please enter a valid email address"
        }

        setProfileErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Validate password form
    const validatePasswordForm = () => {
        const errors = {}

        if (!passwordForm.current_password) {
            errors.current_password = "Current password is required"
        }

        if (!passwordForm.new_password) {
            errors.new_password = "New password is required"
        } else if (passwordForm.new_password.length < 8) {
            errors.new_password = "Password must be at least 8 characters"
        }

        if (!passwordForm.new_password_confirmation) {
            errors.new_password_confirmation = "Please confirm your new password"
        } else if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            errors.new_password_confirmation = "Passwords do not match"
        }

        setPasswordErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setProfileSuccess(false)

        if (!validateProfileForm()) {
            return
        }

        try {
            setProfileLoading(true)
            const data = await updateMyProfile(profileForm)

            // Update user context with new data
            if (setUser) {
                setUser((prev) => ({ ...prev, ...profileForm }))
            }

            setProfileSuccess(true)
            toast.success("Profile updated successfully")
        } catch (err) {
            console.error("Error updating profile", err)

            if (err.response?.data?.errors) {
                // Handle validation errors from Laravel
                const serverErrors = err.response.data.errors
                const formattedErrors = {}

                Object.keys(serverErrors).forEach((key) => {
                    formattedErrors[key] = serverErrors[key][0]
                })

                setProfileErrors(formattedErrors)
            } else {
                toast.error("Failed to update profile. Please try again.")
            }
        } finally {
            setProfileLoading(false)

            // Reset success state after a delay
            if (profileSuccess) {
                setTimeout(() => {
                    setProfileSuccess(false)
                }, 3000)
            }
        }
    }

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setPasswordSuccess(false)

        if (!validatePasswordForm()) {
            return
        }

        try {
            setPasswordLoading(true)
            await changeMyPassword(
                passwordForm.current_password,
                passwordForm.new_password,
                passwordForm.new_password_confirmation,
            )

            setPasswordSuccess(true)
            toast.success("Password changed successfully")

            // Reset password form
            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            })
        } catch (err) {
            console.error("Error changing password", err)

            if (err.response?.data?.errors) {
                // Handle validation errors from Laravel
                const serverErrors = err.response.data.errors
                const formattedErrors = {}

                Object.keys(serverErrors).forEach((key) => {
                    formattedErrors[key] = serverErrors[key][0]
                })

                setPasswordErrors(formattedErrors)
            } else if (err.response?.data?.message) {
                // Handle specific error message
                toast.error(err.response.data.message)
            } else {
                toast.error("Failed to change password. Please try again.")
            }
        } finally {
            setPasswordLoading(false)

            // Reset success state after a delay
            if (passwordSuccess) {
                setTimeout(() => {
                    setPasswordSuccess(false)
                }, 3000)
            }
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Account</h1>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="w-full">
                    <TabsTrigger
                        value="profile"
                        className="flex-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
                    >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="password"
                        className="flex-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
                    >
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card>
                        <form onSubmit={handleProfileSubmit}>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={profileForm.name}
                                        onChange={handleProfileChange}
                                        placeholder="Your full name"
                                        className="h-12"
                                    />
                                    {profileErrors.name && <p className="text-sm text-red-500">{profileErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-base">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        placeholder="your.email@example.com"
                                        className="h-12"
                                    />
                                    {profileErrors.email && <p className="text-sm text-red-500">{profileErrors.email}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6">
                                <Button
                                    type="submit"
                                    disabled={profileLoading || profileSuccess}
                                    className={`w-full h-12 text-lg ${
                                        profileSuccess ? "bg-green-600 hover:bg-green-700" : "bg-teal-500 hover:bg-teal-600"
                                    }`}
                                >
                                    {profileLoading ? (
                                        <>
                                            <div className="animate-spin mr-2 h-5 w-5 border-2 border-b-transparent border-white rounded-full"></div>
                                            Saving...
                                        </>
                                    ) : profileSuccess ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* Password Settings */}
                <TabsContent value="password">
                    <Card>
                        <form onSubmit={handlePasswordSubmit}>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password" className="text-base">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            name="current_password"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.current_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter your current password"
                                            className="h-12 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                    {passwordErrors.current_password && (
                                        <p className="text-sm text-red-500">{passwordErrors.current_password}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="new_password" className="text-base">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="new_password"
                                            name="new_password"
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.new_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter your new password"
                                            className="h-12 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                                        >
                                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                    {passwordErrors.new_password && <p className="text-sm text-red-500">{passwordErrors.new_password}</p>}
                                    {passwordForm.new_password && (
                                        <p
                                            className={`text-sm ${
                                                passwordForm.new_password.length >= 8 ? "text-green-600" : "text-amber-600"
                                            }`}
                                        >
                                            {passwordForm.new_password.length < 8
                                                ? `Password must be at least 8 characters (currently ${passwordForm.new_password.length})`
                                                : "Password meets minimum requirements"}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new_password_confirmation" className="text-base">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="new_password_confirmation"
                                            name="new_password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordForm.new_password_confirmation}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm your new password"
                                            className="h-12 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                    {passwordErrors.new_password_confirmation && (
                                        <p className="text-sm text-red-500">{passwordErrors.new_password_confirmation}</p>
                                    )}
                                    {passwordForm.new_password && passwordForm.new_password_confirmation && (
                                        <p
                                            className={`text-sm ${
                                                passwordForm.new_password === passwordForm.new_password_confirmation
                                                    ? "text-green-600"
                                                    : "text-amber-600"
                                            }`}
                                        >
                                            {passwordForm.new_password === passwordForm.new_password_confirmation
                                                ? "Passwords match"
                                                : "Passwords do not match"}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6">
                                <Button
                                    type="submit"
                                    disabled={passwordLoading || passwordSuccess}
                                    className={`w-full h-12 text-lg ${
                                        passwordSuccess ? "bg-green-600 hover:bg-green-700" : "bg-teal-500 hover:bg-teal-600"
                                    }`}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <div className="animate-spin mr-2 h-5 w-5 border-2 border-b-transparent border-white rounded-full"></div>
                                            Changing...
                                        </>
                                    ) : passwordSuccess ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Changed!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Change Password
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ClientSettings
