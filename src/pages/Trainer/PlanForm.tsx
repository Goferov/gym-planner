import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { createPlan, getPlan, updatePlan, getExercises, getClients, assignPlan, unassignPlan } from "../../api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Trash2,
    Save,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    Users,
    Dumbbell,
    Calendar,
    CalendarDays,
    Check,
} from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Define types for our data structures
interface Exercise {
    id: number
    name: string
    description?: string
    is_system_exercise: boolean
    muscle_groups: { id: number; name: string }[]
}

interface ExerciseInPlan {
    exercise_id: number
    exercise_name?: string // For display purposes
    sets?: number
    reps?: number
    rest_time?: number
    tempo?: string
    notes?: string
}

interface PlanDay {
    week_number: number
    day_number: number
    description?: string
    exercises: ExerciseInPlan[]
}

interface Plan {
    id?: number
    name: string
    description?: string
    duration_weeks: number
    plan_days: PlanDay[]
}

interface Client {
    id: number
    name: string
    email: string
    avatar?: string
}

function PlanForm() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()

    // Main plan state
    const [plan, setPlan] = useState<Plan>({
        name: "",
        description: "",
        duration_weeks: 1,
        plan_days: [],
    })

    // UI state
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEditMode)
    const [exerciseModalOpen, setExerciseModalOpen] = useState(false)
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [currentDay, setCurrentDay] = useState<{ week: number; day: number } | null>(null)
    const [expandedWeeks, setExpandedWeeks] = useState<number[]>([0]) // Default expand first week
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClientIds, setSelectedClientIds] = useState<number[]>([])
    const [clientSearchTerm, setClientSearchTerm] = useState("")
    const [previouslyAssignedClientIds, setPreviouslyAssignedClientIds] = useState<number[]>([])
    const [clientsModalOpen, setClientsModalOpen] = useState(false)
    const [assigningClients, setAssigningClients] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Load data on component mount
    useEffect(() => {
        fetchExercises()
        fetchClients()

        if (isEditMode) {
            fetchPlan()
        } else {
            // Initialize with one week and seven days
            initializeEmptyPlan(1)
        }
    }, [id])

    // Initialize an empty plan with the specified number of weeks
    const initializeEmptyPlan = (weeks: number) => {
        const newPlanDays: PlanDay[] = []

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < 7; day++) {
                newPlanDays.push({
                    week_number: week + 1, // 1-based for user display
                    day_number: day + 1, // 1-based for user display
                    exercises: [],
                })
            }
        }

        setPlan((prev) => ({
            ...prev,
            duration_weeks: weeks,
            plan_days: newPlanDays,
        }))
    }

    // Fetch exercises from API
    const fetchExercises = async () => {
        try {
            const data = await getExercises()
            setExercises(data.data || [])
        } catch (err) {
            console.error("Error fetching exercises", err)
            toast.error("Failed to load exercises")
        }
    }

    // Fetch clients from API
    const fetchClients = async () => {
        try {
            const data = await getClients()
            setClients(data.data || [])
        } catch (err) {
            console.error("Error fetching clients", err)
            toast.error("Failed to load clients")
        }
    }

    // Fetch plan details if in edit mode
    const fetchPlan = async () => {
        try {
            setInitialLoading(true)
            const data = await getPlan(id)

            // Initialize plan data
            setPlan({
                id: data.id,
                name: data.name || "",
                description: data.description || "",
                duration_weeks: data.duration_weeks || 1,
                plan_days: data.plan_days || [],
            })
            console.log(data);

            // Set selected clients
            if (data.clients) {
                setSelectedClientIds(data.clients.map((client: any) => client.id))
                setPreviouslyAssignedClientIds(data.clients.map((client: any) => client.id))
            }

            // Expand all weeks by default in edit mode
            const weeksArray = [...new Set(data.plan_days.map((day: PlanDay) => day.week_number - 1))]
            setExpandedWeeks(weeksArray)
        } catch (err) {
            console.error("Error fetching plan", err)
            toast.error("Failed to load plan data")
        } finally {
            setInitialLoading(false)
        }
    }

    // Handle plan name and description changes
    const handlePlanMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPlan((prev) => ({ ...prev, [name]: value }))
    }

    // Handle adding a new week
    const handleAddWeek = () => {
        const newWeekNumber = plan.duration_weeks + 1

        // Create 7 new days for the new week
        const newDays: PlanDay[] = []
        for (let day = 0; day < 7; day++) {
            newDays.push({
                week_number: newWeekNumber,
                day_number: day + 1,
                exercises: [],
            })
        }

        setPlan((prev) => ({
            ...prev,
            duration_weeks: newWeekNumber,
            plan_days: [...prev.plan_days, ...newDays],
        }))

        // Expand the newly added week
        setExpandedWeeks((prev) => [...prev, newWeekNumber - 1])
    }

    // Handle removing a week
    const handleRemoveWeek = (weekNumber: number) => {
        // Filter out all days from this week
        const filteredDays = plan.plan_days.filter((day) => day.week_number !== weekNumber)

        // Renumber the remaining weeks
        const renumberedDays = filteredDays.map((day) => {
            if (day.week_number > weekNumber) {
                return { ...day, week_number: day.week_number - 1 }
            }
            return day
        })

        setPlan((prev) => ({
            ...prev,
            duration_weeks: prev.duration_weeks - 1,
            plan_days: renumberedDays,
        }))

        // Remove this week from expanded weeks
        setExpandedWeeks((prev) => prev.filter((week) => week !== weekNumber - 1))
    }

    // Toggle week expansion
    const toggleWeekExpansion = (weekIndex: number) => {
        setExpandedWeeks((prev) => {
            if (prev.includes(weekIndex)) {
                return prev.filter((w) => w !== weekIndex)
            } else {
                return [...prev, weekIndex]
            }
        })
    }

    // Open exercise modal for a specific day
    const openExerciseModal = (weekNumber: number, dayNumber: number) => {
        setCurrentDay({ week: weekNumber, day: dayNumber })
        setExerciseModalOpen(true)
    }

    // Add exercise to a day
    const addExerciseToPlan = (exercise: Exercise) => {
        if (!currentDay) return

        const newExercise: ExerciseInPlan = {
            exercise_id: exercise.id,
            exercise_name: exercise.name, // Store name for display
            sets: 3, // Default values
            reps: 10,
            rest_time: 60,
            tempo: "2-0-2-0",
            notes: "",
        }

        setPlan((prev) => {
            const updatedDays = prev.plan_days.map((day) => {
                if (day.week_number === currentDay.week && day.day_number === currentDay.day) {
                    return {
                        ...day,
                        exercises: [...day.exercises, newExercise],
                    }
                }
                return day
            })

            return {
                ...prev,
                plan_days: updatedDays,
            }
        })

        setExerciseModalOpen(false)
    }

    // Update exercise parameters
    const updateExerciseParams = (
        weekNumber: number,
        dayNumber: number,
        exerciseIndex: number,
        field: keyof ExerciseInPlan,
        value: any,
) => {
        setPlan((prev) => {
            const updatedDays = prev.plan_days.map((day) => {
                if (day.week_number === weekNumber && day.day_number === dayNumber) {
                    const updatedExercises = [...day.exercises]
                    updatedExercises[exerciseIndex] = {
                        ...updatedExercises[exerciseIndex],
                        [field]: value,
                    }
                    return {
                        ...day,
                        exercises: updatedExercises,
                    }
                }
                return day
            })

            return {
                ...prev,
                plan_days: updatedDays,
            }
        })
    }

    // Remove exercise from a day
    const removeExercise = (weekNumber: number, dayNumber: number, exerciseIndex: number) => {
        setPlan((prev) => {
            const updatedDays = prev.plan_days.map((day) => {
                if (day.week_number === weekNumber && day.day_number === dayNumber) {
                    const updatedExercises = day.exercises.filter((_, index) => index !== exerciseIndex)
                    return {
                        ...day,
                        exercises: updatedExercises,
                    }
                }
                return day
            })

            return {
                ...prev,
                plan_days: updatedDays,
            }
        })
    }

    // Update day description
    const updateDayDescription = (weekNumber: number, dayNumber: number, description: string) => {
        setPlan((prev) => {
            const updatedDays = prev.plan_days.map((day) => {
                if (day.week_number === weekNumber && day.day_number === dayNumber) {
                    return {
                        ...day,
                        description,
                    }
                }
                return day
            })

            return {
                ...prev,
                plan_days: updatedDays,
            }
        })
    }

    // Toggle client selection
    const toggleClientSelection = (clientId: number) => {
        setSelectedClientIds((prev) => {
            if (prev.includes(clientId)) {
                return prev.filter((id) => id !== clientId)
            } else {
                return [...prev, clientId]
            }
        })
    }

    // Save the plan
    const handleSavePlan = async () => {
        if (!plan.name.trim()) {
            toast.error("Please enter a plan name")
            return
        }

        try {
            setLoading(true)

            // Prepare data for API
            const planData = {
                ...plan,
                // Filter out empty days (days with no exercises)
                plan_days: plan.plan_days.filter((day) => day.exercises.length > 0 || day.description),
            }

            console.log(planData);

            let savedPlan

            if (isEditMode) {
                savedPlan = await updatePlan(id, planData)
            } else {
                savedPlan = await createPlan(planData)
            }

            const savedPlanId = isEditMode ? id : savedPlan.data.id
            // Assign clients if any are selected
            if (savedPlanId) {
                // Find clients to assign (newly selected)
                const clientsToAssign = selectedClientIds.filter(
                    (id) =>
                        !previouslyAssignedClientIds.includes(id) ||
                        // Also include previously inactive clients that are now selected
                        (previouslyAssignedClientIds.includes(id) && clients.find((c) => c.id === id)?.active === false),
                )

                // Find clients to unassign (previously active but now unselected)
                const clientsToUnassign = previouslyAssignedClientIds.filter(
                    (id) => !selectedClientIds.includes(id) && clients.find((c) => c.id === id)?.active !== false,
                )

                // Perform assign and unassign operations
                if (clientsToAssign.length > 0) {
                    await assignPlan(savedPlanId, clientsToAssign)
                }

                if (clientsToUnassign.length > 0) {
                    await unassignPlan(savedPlanId, clientsToUnassign)
                }

                // Update the previously assigned clients list
                setPreviouslyAssignedClientIds([...previouslyAssignedClientIds, ...clientsToAssign])
            }

            setSaveSuccess(true)
            toast.success("Plan saved successfully")

            // If it's a new plan, update the URL to edit mode without navigating
            if (!isEditMode && savedPlanId) {
                window.history.replaceState(null, "", `/trainer/plans/edit/${savedPlanId}`)
                // Update the plan ID
                setPlan((prev) => ({ ...prev, id: savedPlanId }))
            }
        } catch (err) {
            console.error("Error saving plan", err)
            toast.error("Failed to save plan")
        } finally {
            setLoading(false)

            // Reset success state after a delay
            setTimeout(() => {
                setSaveSuccess(false)
            }, 2000)
        }
    }

    // Get day name from number
    const getDayName = (dayNumber: number) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return days[dayNumber - 1]
    }

    // Find exercise details by ID
    const getExerciseById = (id: number) => {
        return exercises.find((ex) => ex.id === id)
    }

    // Filter exercises based on search term
    const filteredExercises = exercises.filter(
        (exercise) =>
            exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
            exercise.muscle_groups.some((group) => group.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())),
    )

    // Filter clients based on search term
    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()),
    )

    // Get day object by week and day number
    const getDay = (weekNumber: number, dayNumber: number) => {
        return plan.plan_days.find((day) => day.week_number === weekNumber && day.day_number === dayNumber)
    }

    // Get selected clients
    const getSelectedClients = () => {
        return clients.filter((client) => selectedClientIds.includes(client.id))
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEditMode ? "Edit Training Plan" : "Create New Training Plan"}
                </h1>
                <p className="text-muted-foreground">
                    Design a structured training plan with exercises for each day of the week.
                </p>
            </div>

            {/* Plan Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={plan.name}
                                onChange={handlePlanMetadataChange}
                                placeholder="e.g., 12-Week Strength Program"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Assigned Clients</Label>
                                <Button variant="outline" size="sm" onClick={() => setClientsModalOpen(true)} className="h-8">
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage Clients
                                </Button>
                            </div>

                            <div className="border rounded-md p-2 min-h-[40px]">
                                {selectedClientIds.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No clients assigned</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {getSelectedClients()
                                            .slice(0, 5)
                                            .map((client) => (
                                                <Badge key={client.id} variant="secondary" className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                            {client.name.charAt(0)}
                          </span>
                                                    {client.name}
                                                </Badge>
                                            ))}
                                        {selectedClientIds.length > 5 && (
                                            <Badge variant="outline">+{selectedClientIds.length - 5} more</Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={plan.description || ""}
                            onChange={handlePlanMetadataChange}
                            placeholder="Describe the goals and focus of this training plan..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Weeks and Days Canvas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Training Schedule
                    </h2>
                    <Button onClick={handleAddWeek} className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Week
                    </Button>
                </div>

                {/* Weeks Accordion */}
                <div className="space-y-4">
                    {Array.from({ length: plan.duration_weeks }, (_, weekIndex) => {
                        const weekNumber = weekIndex + 1
                        const isExpanded = expandedWeeks.includes(weekIndex)

                        return (
                            <Card key={`week-${weekNumber}`} className="overflow-hidden">
                                <div
                                    className={cn(
                                        "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                                        isExpanded ? "border-b" : "",
                                    )}
                                    onClick={() => toggleWeekExpansion(weekIndex)}
                                >
                                    <div className="flex items-center">
                                        <CalendarDays className="h-5 w-5 mr-2 text-teal-600" />
                                        <h3 className="text-lg font-medium">Week {weekNumber}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {plan.duration_weeks > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemoveWeek(weekNumber)
                                                }}
                                                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove Week</span>
                                            </Button>
                                        )}
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                                const dayNumber = dayIndex + 1
                                                const day = getDay(weekNumber, dayNumber) || {
                                                    week_number: weekNumber,
                                                    day_number: dayNumber,
                                                    exercises: [],
                                                }

                                                return (
                                                    <Card key={`day-${weekNumber}-${dayNumber}`} className="overflow-hidden">
                                                        <CardHeader className="p-3 bg-muted/30">
                                                            <CardTitle className="text-base flex justify-between items-center">
                                                                <span>{getDayName(dayNumber)}</span>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => openExerciseModal(weekNumber, dayNumber)}
                                                                                className="h-7 w-7 p-0"
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                                <span className="sr-only">Add Exercise</span>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Add Exercise</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-3 space-y-3">
                                                            <div>
                                                                <Input
                                                                    placeholder="Day notes (optional)"
                                                                    value={day.description || ""}
                                                                    onChange={(e) => updateDayDescription(weekNumber, dayNumber, e.target.value)}
                                                                    className="text-sm"
                                                                />
                                                            </div>

                                                            {day.exercises.length === 0 ? (
                                                                <div
                                                                    className="border border-dashed rounded-md p-3 text-center text-muted-foreground text-sm cursor-pointer hover:bg-muted/30 transition-colors"
                                                                    onClick={() => openExerciseModal(weekNumber, dayNumber)}
                                                                >
                                                                    <Dumbbell className="h-4 w-4 mx-auto mb-1" />
                                                                    Click to add exercises
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {day.exercises.map((exercise, index) => {
                                                                        const exerciseDetails = getExerciseById(exercise.exercise_id)

                                                                        return (
                                                                            <div key={`exercise-${index}`} className="border rounded-md p-2 text-sm">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <div className="font-medium">
                                                                                        {exercise.exercise_name || exerciseDetails?.name}
                                                                                    </div>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => removeExercise(weekNumber, dayNumber, index)}
                                                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                        <span className="sr-only">Remove</span>
                                                                                    </Button>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    <div>
                                                                                        <Label className="text-xs">Sets</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            value={exercise.sets || ""}
                                                                                            onChange={(e) =>
                                                                                                updateExerciseParams(
                                                                                                    weekNumber,
                                                                                                    dayNumber,
                                                                                                    index,
                                                                                                    "sets",
                                                                                                    Number.parseInt(e.target.value) || "",
                                                                                                )
                                                                                            }
                                                                                            className="h-7 text-xs"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Reps</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            value={exercise.reps || ""}
                                                                                            onChange={(e) =>
                                                                                                updateExerciseParams(
                                                                                                    weekNumber,
                                                                                                    dayNumber,
                                                                                                    index,
                                                                                                    "reps",
                                                                                                    Number.parseInt(e.target.value) || "",
                                                                                                )
                                                                                            }
                                                                                            className="h-7 text-xs"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Rest (sec)</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            value={exercise.rest_time || ""}
                                                                                            onChange={(e) =>
                                                                                                updateExerciseParams(
                                                                                                    weekNumber,
                                                                                                    dayNumber,
                                                                                                    index,
                                                                                                    "rest_time",
                                                                                                    Number.parseInt(e.target.value) || "",
                                                                                                )
                                                                                            }
                                                                                            className="h-7 text-xs"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Tempo</Label>
                                                                                        <Input
                                                                                            value={exercise.tempo || ""}
                                                                                            onChange={(e) =>
                                                                                                updateExerciseParams(
                                                                                                    weekNumber,
                                                                                                    dayNumber,
                                                                                                    index,
                                                                                                    "tempo",
                                                                                                    e.target.value,
                                                                                                )
                                                                                            }
                                                                                            placeholder="2-0-2-0"
                                                                                            className="h-7 text-xs"
                                                                                        />
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-2">
                                                                                    <Label className="text-xs">Notes</Label>
                                                                                    <Input
                                                                                        value={exercise.notes || ""}
                                                                                        onChange={(e) =>
                                                                                            updateExerciseParams(
                                                                                                weekNumber,
                                                                                                dayNumber,
                                                                                                index,
                                                                                                "notes",
                                                                                                e.target.value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="Optional notes"
                                                                                        className="h-7 text-xs"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}

                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openExerciseModal(weekNumber, dayNumber)}
                                                                        className="w-full h-7 text-xs"
                                                                    >
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Add Another Exercise
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSavePlan}
                    disabled={loading || saveSuccess}
                    className={cn(
                        "min-w-[120px]",
                        saveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-teal-600 hover:bg-teal-700",
                    )}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                            Saving...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Plan
                        </>
                    )}
                </Button>
            </div>

            {/* Exercise Selection Modal */}
            <Dialog open={exerciseModalOpen} onOpenChange={setExerciseModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Exercise</DialogTitle>
                        <DialogDescription>Search and select an exercise to add to your plan.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search exercises..."
                                className="pl-8 w-full"
                                value={exerciseSearchTerm}
                                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border rounded-md">
                            <ScrollArea className="h-[300px]">
                                {filteredExercises.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">No exercises found</div>
                                ) : (
                                    <div className="p-1">
                                        {filteredExercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="flex items-center p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                                                onClick={() => addExerciseToPlan(exercise)}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{exercise.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {exercise.muscle_groups.map((group) => (
                                                            <Badge key={group.id} variant="outline" className="bg-teal-50 text-xs">
                                                                {group.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="ml-2">
                                                    <Plus className="h-4 w-4" />
                                                    <span className="sr-only">Add</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Client Assignment Modal */}
            <Dialog open={clientsModalOpen} onOpenChange={setClientsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Clients</DialogTitle>
                        <DialogDescription>Select clients who will have access to this training plan.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search clients..."
                                className="pl-8 w-full"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border rounded-md">
                            <ScrollArea className="h-[300px]">
                                {filteredClients.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">No clients found</div>
                                ) : (
                                    <div className="p-1">
                                        {filteredClients.map((client) => (
                                            <div
                                                key={client.id}
                                                className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
                                            >
                                                <Checkbox
                                                    id={`client-${client.id}`}
                                                    checked={selectedClientIds.includes(client.id)}
                                                    onCheckedChange={() => toggleClientSelection(client.id)}
                                                />
                                                <Label htmlFor={`client-${client.id}`} className="flex items-center flex-1 cursor-pointer">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="bg-teal-100 text-teal-800">
                                                            {client.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{client.name}</span>
                                                        <span className="text-xs text-muted-foreground">{client.email}</span>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {selectedClientIds.length} client{selectedClientIds.length !== 1 ? "s" : ""} selected
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedClientIds([])}
                                    disabled={selectedClientIds.length === 0}
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedClientIds(filteredClients.map((c) => c.id))}
                                >
                                    Select All
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setClientsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setClientsModalOpen(false)
                            }}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Confirm Selection
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PlanForm
