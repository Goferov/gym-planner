"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchPlanUser, fetchPlanUserHistory, startPlan } from "../../api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Dumbbell, PlayCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

function PlanDetails() {
    const { planId } = useParams()
    const navigate = useNavigate()
    const [plan, setPlan] = useState(null)
    const [planHistory, setPlanHistory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [startingPlan, setStartingPlan] = useState(false)

    useEffect(() => {
        fetchData()
    }, [planId])

    async function fetchData() {
        try {
            setLoading(true)
            const [planData, historyData] = await Promise.all([fetchPlanUser(planId), fetchPlanUserHistory(planId)])

            setPlan(planData.data)
            setPlanHistory(historyData.data)
        } catch (err) {
            console.error("Error fetching plan details:", err)
            toast.error("Could not load plan details")
        } finally {
            setLoading(false)
        }
    }

    async function handleStartPlan() {
        try {
            setStartingPlan(true)
            await startPlan(planId)
            toast.success("Plan started successfully")
            // Refresh data to update status
            await fetchData()
            // Navigate to dashboard to show today's workout
            navigate("/client")
        } catch (err) {
            console.error("Error starting plan:", err)
            toast.error("Could not start the plan")
        } finally {
            setStartingPlan(false)
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "Not started"
        try {
            return format(parseISO(dateString), "MMMM d, yyyy")
        } catch (e) {
            return "Invalid date"
        }
    }

    // Get day name from number
    const getDayName = (dayNumber) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return days[dayNumber - 1]
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/client/plans")} className="mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-3/4" />
                </div>
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={() => navigate("/client/plans")} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Plan Details</h1>
            </div>

            {/* Plan Overview */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{plan?.plan?.name || "Loading plan..."}</CardTitle>
                        {plan?.active ? (
                            <Badge className="bg-teal-500">{plan?.progress || 0}% Complete</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={plan?.progress || 0} className="h-2 mb-6" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Started:</span>
                        </div>
                        <div className="font-medium">{formatDate(plan?.started_at)}</div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Duration:</span>
                        </div>
                        <div className="font-medium">{plan?.duration_weeks} weeks</div>

                        {plan?.completed_at && (
                            <>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Completed:</span>
                                </div>
                                <div className="font-medium">{formatDate(plan?.completed_at)}</div>
                            </>
                        )}
                    </div>

                    {!plan?.started_at && plan?.active && (
                        <Button
                            className="w-full mt-6 bg-teal-500 hover:bg-teal-600"
                            onClick={handleStartPlan}
                            disabled={startingPlan}
                        >
                            {startingPlan ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Start Plan
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Plan Schedule */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Training Schedule</h2>

                {planHistory?.weeks?.map((week, weekIndex) => (
                    <Accordion type="single" collapsible key={`week-${weekIndex}`} className="border rounded-md">
                        <AccordionItem value={`week-${weekIndex}`} className="border-none">
                            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                                    <span className="font-medium">Week {weekIndex + 1}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-3">
                                    {week.map((day) => (
                                        <Card key={`day-${day.day_number}`} className="overflow-hidden">
                                            <CardHeader className="py-3 bg-gray-50">
                                                <CardTitle className="text-base flex items-center">
                                                    {getDayName(day.day_number)}
                                                    {day.description && (
                                                        <span className="ml-2 text-sm font-normal text-muted-foreground">- {day.description}</span>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="py-3">
                                                {day.exercises.length === 0 ? (
                                                    <p className="text-muted-foreground text-sm">Rest day - No exercises</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {day.exercises.map((exercise, exIndex) => (
                                                            <div
                                                                key={`exercise-${exIndex}`}
                                                                className={`p-3 rounded-md border ${
                                                                    exercise.completed === true
                                                                        ? "bg-green-50 border-green-200"
                                                                        : exercise.completed === false
                                                                            ? "bg-red-50 border-red-200"
                                                                            : "bg-gray-50"
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center">
                                                                        <Dumbbell className="h-4 w-4 mr-2 text-teal-600" />
                                                                        <span className="font-medium">{exercise.exercise}</span>
                                                                    </div>
                                                                    {exercise.completed === true && (
                                                                        <Badge className="bg-green-500">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                            Done
                                                                        </Badge>
                                                                    )}
                                                                    {exercise.completed === false && (
                                                                        <Badge variant="destructive">
                                                                            <XCircle className="h-3 w-3 mr-1" />
                                                                            Skipped
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="mt-2 text-sm">
                                                                    <span className="text-muted-foreground">Reps:</span>{" "}
                                                                    <span className="font-medium">{exercise.reps}</span>
                                                                </div>

                                                                {exercise.difficulty && (
                                                                    <div className="mt-2 text-sm">
                                                                        <span className="text-muted-foreground">Difficulty:</span>{" "}
                                                                        <span className="font-medium">{exercise.difficulty}/5</span>
                                                                    </div>
                                                                )}

                                                                {exercise.comment && (
                                                                    <div className="mt-2 p-2 bg-white rounded-md border text-sm">
                                                                        <div className="text-muted-foreground mb-1">Your comment:</div>
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
    )
}

export default PlanDetails
