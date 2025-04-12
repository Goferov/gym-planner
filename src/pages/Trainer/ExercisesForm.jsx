import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createExercise, getExercise, updateExercise, muscleGroups } from "../../api/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from 'lucide-react'

function ExerciseForm() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        video_url: "",
        muscle_group_ids: [],
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEditMode)
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([])
    const [isSystemExercise, setIsSystemExercise] = useState(false)

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
            const data = await getExercise(id)

            // Check if this is a system exercise
            if (data.is_system_exercise) {
                setIsSystemExercise(true)
                setServerError("System exercises cannot be edited. Redirecting to exercises list...")
                setTimeout(() => {
                    navigate("/trainer/exercises")
                }, 2000)
                return
            }

            console.log(data);
            setFormData({
                name: data.name || "",
                description: data.description || "",
                video_url: data.video_url || "",
                muscle_group_ids: data.muscle_groups.map((group) => group.id) || [],
            })
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

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
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

        if (formData.muscle_group_ids.length === 0) {
            newErrors.muscle_group_ids = "Please select at least one muscle group"
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
                await updateExercise(id, formData)
            } else {
                await createExercise(formData)
            }

            navigate("/trainer/exercises")
        } catch (err) {
            console.error("Error saving exercise", err)

            if (err.response?.data?.errors) {
                // Handle validation errors from Laravel
                const serverErrors = err.response.data.errors
                const formattedErrors = {}

                Object.keys(serverErrors).forEach((key) => {
                    formattedErrors[key] = serverErrors[key][0]
                })

                setErrors(formattedErrors)
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
                    <CardContent className="space-y-4">
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
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
