"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createExercise, getExercise, updateExercise, muscleGroups } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react"

function ExerciseForm() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()

    const imageInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        video_url: "",
        preferred_media: "image",
        muscle_group_ids: [],
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState("")
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEditMode)
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([])
    const [isSystemExercise, setIsSystemExercise] = useState(false)
    const [debugInfo, setDebugInfo] = useState("")

    useEffect(() => {
        fetchMuscleGroups()
        if (isEditMode) {
            fetchExercise()
        }
    }, [id])

    async function fetchMuscleGroups() {
        try {
            const response = await muscleGroups()
            // Handle the data structure with the "data" property
            setAvailableMuscleGroups(response.data.data || [])
        } catch (err) {
            console.error("Error fetching muscle groups", err)
            setServerError("Failed to load muscle groups")
        }
    }

    async function fetchExercise() {
        try {
            setInitialLoading(true)
            const response = await getExercise(id)

            // Log the response to see its structure
            console.log("Exercise data:", response)

            // Get the data from the response
            // If the API returns data directly, use response.data
            const data = response.data || response

            // Check if this is a system exercise
            if (data.is_system_exercise) {
                setIsSystemExercise(true)
                setServerError("System exercises cannot be edited. Redirecting to exercises list...")
                setTimeout(() => {
                    navigate("/trainer/exercises")
                }, 2000)
                return
            }

            // Update form data with values from API
            setFormData({
                name: data.name || "",
                description: data.description || "",
                video_url: data.video_url || "",
                preferred_media: data.preferred_media || "image",
                muscle_group_ids: data.muscle_groups?.map((group) => group.id) || [],
            })

            console.log("Updated form data:", {
                name: data.name || "",
                description: data.description || "",
                video_url: data.video_url || "",
                preferred_media: data.preferred_media || "image",
                muscle_group_ids: data.muscle_groups?.map((group) => group.id) || [],
            })

            // Set image preview if image_url or image_path exists
            if (data.image_url) {
                setImagePreview(data.image_url)
            } else if (data.image_path) {
                // If image_path is a relative path, prepend the base URL
                if (data.image_path.startsWith("/")) {
                    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
                    setImagePreview(`${baseUrl}${data.image_path}`)
                } else if (!data.image_path.startsWith("http")) {
                    // If it's not an absolute URL, assume it's a relative path to storage
                    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
                    setImagePreview(`${baseUrl}/storage/${data.image_path}`)
                } else {
                    // It's already a full URL
                    setImagePreview(data.image_path)
                }
            }
        } catch (err) {
            console.error("Error fetching exercise", err)
            setServerError("Failed to load exercise data")
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"]
        if (!validTypes.includes(file.type)) {
            setErrors((prev) => ({ ...prev, image: "Please upload a valid image file (JPG, PNG, or GIF)" }))
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: "Image must be less than 2MB" }))
            return
        }

        setImageFile(file)
        setErrors((prev) => ({ ...prev, image: undefined }))

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview("")
        if (imageInputRef.current) {
            imageInputRef.current.value = ""
        }
    }

    const handleMuscleGroupToggle = (groupId) => {
        setFormData((prev) => {
            const currentIds = [...prev.muscle_group_ids]

            if (currentIds.includes(groupId)) {
                return { ...prev, muscle_group_ids: currentIds.filter((id) => id !== groupId) }
            } else {
                return { ...prev, muscle_group_ids: [...currentIds, groupId] }
            }
        })

        // Clear muscle group error if any
        if (errors.muscle_group_ids) {
            setErrors((prev) => ({ ...prev, muscle_group_ids: undefined }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        } else if (formData.name.length > 255) {
            newErrors.name = "Name must be less than 255 characters"
        }

        if (formData.video_url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.video_url)) {
            newErrors.video_url = "Please enter a valid URL"
        }

        if (!["image", "video"].includes(formData.preferred_media)) {
            newErrors.preferred_media = "Please select a valid media type"
        }

        if (formData.muscle_group_ids.length === 0) {
            newErrors.muscle_group_ids = "Please select at least one muscle group"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError("")
        setDebugInfo("")

        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)

            // Create FormData object for file uploads
            const submitData = new FormData()

            // Add basic fields
            submitData.append("name", formData.name)

            if (formData.description) {
                submitData.append("description", formData.description)
            }

            if (formData.video_url) {
                submitData.append("video_url", formData.video_url)
            }

            submitData.append("preferred_media", formData.preferred_media)

            // Add muscle group IDs
            if (formData.muscle_group_ids.length > 0) {
                formData.muscle_group_ids.forEach((id) => {
                    submitData.append("muscle_group_ids[]", id)
                })
            }

            // Add image file if it exists
            if (imageFile) {
                submitData.append("image", imageFile)
            }

            // Debug info
            const debugFormData = {}
            submitData.forEach((value, key) => {
                if (key !== "image") {
                    // Don't log the image binary data
                    debugFormData[key] = value
                } else {
                    debugFormData[key] = "File data present"
                }
            })

            console.log("Submitting form data:", debugFormData)
            // setDebugInfo(JSON.stringify(debugFormData, null, 2))

            if (isEditMode) {
                // For PUT/PATCH requests with FormData, we need to append the _method field
                submitData.append("_method", "PUT")
                const response = await updateExercise(id, submitData)
                console.log("Update response:", response)
            } else {
                const response = await createExercise(submitData)
                console.log("Create response:", response)
            }

            navigate("/trainer/exercises")
        } catch (err) {
            console.error("Error saving exercise", err)

            // More detailed error logging
            if (err.response) {
                console.log("Error response:", err.response)
                console.log("Error status:", err.response.status)
                console.log("Error data:", err.response.data)

                // setDebugInfo((prev) => prev + "\n\nError Response: " + JSON.stringify(err.response.data, null, 2))
            }

            if (err.response?.data?.errors) {
                // Handle validation errors from Laravel
                const serverErrors = err.response.data.errors
                const formattedErrors = {}

                Object.keys(serverErrors).forEach((key) => {
                    formattedErrors[key] = serverErrors[key][0]
                })

                setErrors(formattedErrors)
            } else if (err.response?.data?.message) {
                setServerError(err.response.data.message)
            } else {
                setServerError("Failed to save exercise. Please try again.")
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

    if (isSystemExercise) {
        return (
            <div className="flex justify-center items-center h-64">
                <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/trainer/exercises")}
                    className="hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? "Edit Exercise" : "Add New Exercise"}</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{isEditMode ? "Edit Exercise Details" : "Exercise Details"}</CardTitle>
                        <CardDescription>
                            {isEditMode ? "Update the information for this exercise" : "Fill in the details to create a new exercise"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {debugInfo && (
                            <div className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-40">
                                <pre>{debugInfo}</pre>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Exercise Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Barbell Squat"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the exercise and how to perform it correctly..."
                                rows={4}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label>Exercise Image</Label>
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => imageInputRef.current.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload size={16} />
                                        Upload Image
                                    </Button>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/jpeg,image/png,image/gif"
                                        className="hidden"
                                    />
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={clearImage}
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} className="mr-1" /> Remove
                                        </Button>
                                    )}
                                </div>

                                {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}

                                {imagePreview && (
                                    <div className="relative mt-2 border rounded-md overflow-hidden w-full max-w-xs">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Exercise preview"
                                            className="w-full h-auto object-cover max-h-48"
                                            onError={(e) => {
                                                console.error("Image failed to load:", imagePreview)
                                                e.target.src = "/placeholder.svg"
                                            }}
                                        />
                                    </div>
                                )}

                                {!imagePreview && (
                                    <div className="flex items-center justify-center border border-dashed rounded-md p-8 bg-gray-50">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-1 text-sm text-gray-500">No image uploaded</p>
                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 2MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="video_url">Video URL</Label>
                            <Input
                                id="video_url"
                                name="video_url"
                                value={formData.video_url}
                                onChange={handleChange}
                                placeholder="https://example.com/exercise-video"
                            />
                            {errors.video_url && <p className="text-sm text-red-500">{errors.video_url}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Preferred Media</Label>
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="media-image"
                                        name="preferred_media"
                                        value="image"
                                        checked={formData.preferred_media === "image"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <Label htmlFor="media-image" className="text-sm font-normal cursor-pointer">
                                        Image
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="media-video"
                                        name="preferred_media"
                                        value="video"
                                        checked={formData.preferred_media === "video"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <Label htmlFor="media-video" className="text-sm font-normal cursor-pointer">
                                        Video
                                    </Label>
                                </div>
                            </div>
                            {errors.preferred_media && <p className="text-sm text-red-500">{errors.preferred_media}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Muscle Groups <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {availableMuscleGroups.map((group) => (
                                    <div key={group.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`muscle-group-${group.id}`}
                                            checked={formData.muscle_group_ids.includes(group.id)}
                                            onCheckedChange={() => handleMuscleGroupToggle(group.id)}
                                        />
                                        <Label htmlFor={`muscle-group-${group.id}`} className="text-sm font-normal cursor-pointer">
                                            {group.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.muscle_group_ids && <p className="text-sm text-red-500">{errors.muscle_group_ids}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/trainer/exercises")}
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
                                    {isEditMode ? "Update Exercise" : "Save Exercise"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default ExerciseForm
