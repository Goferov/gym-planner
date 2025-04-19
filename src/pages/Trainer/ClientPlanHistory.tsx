"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAssignedPlans, getPlanHistory } from "../../api/axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Calendar, CheckCircle2, ClipboardList, Clock, Dumbbell, XCircle } from "lucide-react"

// Define types for our data structures
interface Exercise {
    exercise: string
    sets: number
    reps: number
    completed: boolean | null
    date: string | null
    difficulty: number | null
    comment: string | null
}

interface Day {
    day_number: number
    description: string | null
    exercises: Exercise[]
}

interface PlanHistory {
    plan_name: string
    started_at: string | null
    completed_at: string | null
    progress: number
    weeks: Day[][]
}

interface AssignedPlan {
    id: number
    plan_id: number
    plan_name: string
    description: string | null
    duration_weeks: number
    assigned_at: string
    started_at: string | null
    completed_at: string | null
    active: boolean
    progress: number
}

function ClientPlanHistory() {
    const { clientId } = useParams()
    const navigate = useNavigate()

    const [assignedPlans, setAssignedPlans] = useState<AssignedPlan[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
    const [planHistory, setPlanHistory] = useState<PlanHistory | null>(null)
    const [loading, setLoading] = useState(true)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("active")

    useEffect(() => {
        fetchAssignedPlans()
    }, [clientId])

    useEffect(() => {
        if (selectedPlanId) {
            fetchPlanHistory(selectedPlanId)
        }
    }, [selectedPlanId])

    async function fetchAssignedPlans() {
        try {
            setLoading(true)

            if (!clientId) {
                console.error("No client ID provided")
                return
            }

            // Fetch both active and inactive plans with the client's user_id
            const [activePlans, inactivePlans] = await Promise.all([
                getAssignedPlans({ active: 1, user_id: clientId }),
                getAssignedPlans({ active: 0, user_id: clientId }),
            ])

            // Create a Map to track unique plans by ID to avoid duplicates
            const plansMap = new Map()

                // Add active plans to the map
            ;(activePlans.data || []).forEach((plan) => {
                plansMap.set(plan.id, plan)
            })

            // Add inactive plans to the map (will overwrite if duplicate ID)
            ;(inactivePlans.data || []).forEach((plan) => {
                plansMap.set(plan.id, plan)
            })

            // Convert map values back to array
            setAssignedPlans(Array.from(plansMap.values()))

            // Select the first active plan by default if available
            if (activePlans.data && activePlans.data.length > 0) {
                setSelectedPlanId(activePlans.data[0].id)
            } else if (inactivePlans.data && inactivePlans.data.length > 0) {
                setSelectedPlanId(inactivePlans.data[0].id)
            }
        } catch (error) {
            console.error("Error fetching assigned plans:", error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchPlanHistory(planUserId: number) {
        try {
            setHistoryLoading(true)
            const response = await getPlanHistory(planUserId)
            setPlanHistory(response.data)
        } catch (error) {
            console.error("Error fetching plan history:", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not started"
        try {
            return format(parseISO(dateString), "MMM d, yyyy")
        } catch (e) {
            return "Invalid date"
        }
    }

    // Get day name from number
    const getDayName = (dayNumber: number) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return days[dayNumber - 1]
    }

    // Filter plans based on active tab
    const filteredPlans = assignedPlans.filter((plan) => {
        if (activeTab === "active") return plan.active
        return !plan.active
    })

    if (loading) {
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
                    Back to Clients
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Client Plan History</h1>
            </div>

            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="active" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                            Active Plans
                        </TabsTrigger>
                        <TabsTrigger value="inactive" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                            Completed Plans
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="mt-4">
                    {filteredPlans.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="text-muted-foreground">No active plans assigned to this client.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {filteredPlans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedPlanId === plan.id ? "ring-2 ring-teal-500" : ""
                                    }`}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                                            <Badge variant={plan.active ? "default" : "outline"} className="bg-teal-500">
                                                {plan.progress}% Complete
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {plan.description || "No description available"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Progress value={plan.progress} className="h-2" />
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Assigned:</span>
                                                </div>
                                                <div className="text-right font-medium">{formatDate(plan.assigned_at)}</div>

                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Started:</span>
                                                </div>
                                                <div className="text-right font-medium">{formatDate(plan.started_at)}</div>

                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <ClipboardList className="h-3.5 w-3.5" />
                                                    <span>Duration:</span>
                                                </div>
                                                <div className="text-right font-medium">{plan.duration_weeks} weeks</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="inactive" className="mt-4">
                    {filteredPlans.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="text-muted-foreground">No completed or inactive plans for this client.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {filteredPlans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedPlanId === plan.id ? "ring-2 ring-teal-500" : ""
                                    }`}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                                            <Badge variant="outline" className={plan.progress === 100 ? "bg-green-100" : ""}>
                                                {plan.progress}% Complete
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {plan.description || "No description available"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Progress value={plan.progress} className="h-2" />
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Assigned:</span>
                                                </div>
                                                <div className="text-right font-medium">{formatDate(plan.assigned_at)}</div>

                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Completed:</span>
                                                </div>
                                                <div className="text-right font-medium">{formatDate(plan.completed_at)}</div>

                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <ClipboardList className="h-3.5 w-3.5" />
                                                    <span>Duration:</span>
                                                </div>
                                                <div className="text-right font-medium">{plan.duration_weeks} weeks</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Plan History Details */}
            {selectedPlanId && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Plan History Details</CardTitle>
                        <CardDescription>
                            Detailed history of exercises, completion status, and client feedback for the selected plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {historyLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            </div>
                        ) : !planHistory ? (
                            <div className="text-center py-8 text-muted-foreground">No history data available for this plan yet.</div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Plan Progress</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold mb-2">{planHistory.progress}%</div>
                                            <Progress value={planHistory.progress} className="h-2" />
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Started</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-lg font-medium">
                                                {planHistory.started_at ? formatDate(planHistory.started_at) : "Not started yet"}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Completed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-lg font-medium">
                                                {planHistory.completed_at ? formatDate(planHistory.completed_at) : "In progress"}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    {planHistory.weeks.map((week, weekIndex) => (
                                        <Accordion type="single" collapsible key={`week-${weekIndex}`} className="border rounded-md">
                                            <AccordionItem value={`week-${weekIndex}`} className="border-none">
                                                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                                                        <span className="font-medium">Week {weekIndex + 1}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-4">
                                                        {week.map((day) => (
                                                            <Card key={`day-${day.day_number}`}>
                                                                <CardHeader className="pb-2 bg-muted/30">
                                                                    <CardTitle className="text-base flex items-center">
                                                                        {getDayName(day.day_number)}
                                                                        {day.description && (
                                                                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        - {day.description}
                                      </span>
                                                                        )}
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="pt-4">
                                                                    {day.exercises.length === 0 ? (
                                                                        <p className="text-muted-foreground text-sm">No exercises for this day</p>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            {day.exercises.map((exercise, exIndex) => (
                                                                                <div
                                                                                    key={`exercise-${exIndex}`}
                                                                                    className={`border rounded-md p-3 ${
                                                                                        exercise.completed === true
                                                                                            ? "bg-green-50 border-green-200"
                                                                                            : exercise.completed === false
                                                                                                ? "bg-red-50 border-red-200"
                                                                                                : ""
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-2">
                                                                                        <div className="flex items-center">
                                                                                            <Dumbbell className="h-4 w-4 mr-2 text-teal-600" />
                                                                                            <span className="font-medium">{exercise.exercise}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center">
                                                                                            {exercise.completed === true && (
                                                                                                <Badge className="bg-green-500 mr-2">
                                                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                                                    Completed
                                                                                                </Badge>
                                                                                            )}
                                                                                            {exercise.completed === false && (
                                                                                                <Badge variant="destructive">
                                                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                                                    Skipped
                                                                                                </Badge>
                                                                                            )}
                                                                                            {exercise.completed === null && (
                                                                                                <Badge variant="outline">
                                                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                                                    Pending
                                                                                                </Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                                                                                        <div>
                                                                                            <span className="text-muted-foreground">Sets:</span>{" "}
                                                                                            <span className="font-medium">{exercise.sets}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-muted-foreground">Reps:</span>{" "}
                                                                                            <span className="font-medium">{exercise.reps}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-muted-foreground">Difficulty:</span>{" "}
                                                                                            <span className="font-medium">
                                                {exercise.difficulty ? `${exercise.difficulty}/5` : "N/A"}
                                              </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-muted-foreground">Date:</span>{" "}
                                                                                            <span className="font-medium">
                                                {exercise.date ? formatDate(exercise.date) : "Not completed"}
                                              </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {exercise.comment && (
                                                                                        <div className="mt-2 bg-white p-2 rounded-md border text-sm">
                                                                                            <div className="text-muted-foreground mb-1">Client comment:</div>
                                                                                            <div>{exercise.comment}</div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ClientPlanHistory
