"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchPlanUsers, startPlan } from "../../api/axios"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO } from "date-fns"
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react"
import { toast } from "sonner"

function ClientPlans() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [startingPlan, setStartingPlan] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchPlans()
    }, [])

    async function fetchPlans() {
        try {
            setLoading(true)
            const response = await fetchPlanUsers()
            setPlans(response.data || [])
        } catch (err) {
            console.error("Error fetching plans:", err)
            toast.error("Could not load your training plans")
        } finally {
            setLoading(false)
        }
    }

    async function handleStartPlan(planId) {
        try {
            setStartingPlan(planId)
            await startPlan(planId)
            toast.success("Plan started successfully")
            // Refresh plans to update status
            await fetchPlans()
            // Navigate to dashboard to show today's workout
            navigate("/client")
        } catch (err) {
            console.error("Error starting plan:", err)
            toast.error("Could not start the plan")
        } finally {
            setStartingPlan(null)
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

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Training Plans</h1>
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                    </div>
                ))}
            </div>
        )
    }

    // Separate plans into categories
    const startedPlans = plans.filter((plan) => plan.started_at)
    const availablePlans = plans.filter((plan) => !plan.started_at && plan.active)
    const completedPlans = plans.filter((plan) => plan.completed_at || (!plan.active && plan.started_at))

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Training Plans</h1>

            {plans.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No Plans Available</h2>
                            <p className="text-muted-foreground">You don't have any training plans assigned yet.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Started Plans */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Started Plans</h2>

                        {startedPlans.length === 0 ? (
                            <p className="text-muted-foreground">No started plans. Start a plan below.</p>
                        ) : (
                            startedPlans.map((plan) => (
                                <Card key={plan.id} className="border-2 border-teal-100">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{plan.plan_name || plan.name}</CardTitle>
                                            <Badge className="bg-teal-500">{plan.progress}% Complete</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <Progress value={plan.progress} className="h-2 mb-4" />

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Started:</span>
                                            </div>
                                            <div className="text-right font-medium">{formatDate(plan.started_at)}</div>

                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Duration:</span>
                                            </div>
                                            <div className="text-right font-medium">{plan.duration_weeks} weeks</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button
                                            className="w-full bg-teal-500 hover:bg-teal-600"
                                            onClick={() => navigate(`/client/plan-details/${plan.id}`)}
                                        >
                                            View Plan Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Available Plans (not started yet) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Available Plans</h2>

                        {availablePlans.length === 0 ? (
                            <p className="text-muted-foreground">No new plans available to start.</p>
                        ) : (
                            availablePlans.map((plan) => (
                                <Card key={plan.id}>
                                    <CardHeader className="pb-2">
                                        <CardTitle>{plan.plan_name || plan.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <p className="text-muted-foreground mb-4">
                                            {plan.description || "A training plan created by your trainer."}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Assigned:</span>
                                            </div>
                                            <div className="text-right font-medium">{formatDate(plan.assigned_at)}</div>

                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Duration:</span>
                                            </div>
                                            <div className="text-right font-medium">{plan.duration_weeks} weeks</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button
                                            className="w-full bg-teal-500 hover:bg-teal-600"
                                            onClick={() => handleStartPlan(plan.id)}
                                            disabled={startingPlan === plan.id}
                                        >
                                            {startingPlan === plan.id ? (
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
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Completed Plans */}
                    {completedPlans.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Completed Plans</h2>

                            {completedPlans.map((plan) => (
                                <Card key={plan.id} className="bg-gray-50">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{plan.plan_name || plan.name}</CardTitle>
                                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Completed
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <Progress value={plan.progress} className="h-2 mb-4" />

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Completed:</span>
                                            </div>
                                            <div className="text-right font-medium">{formatDate(plan.completed_at)}</div>

                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Duration:</span>
                                            </div>
                                            <div className="text-right font-medium">{plan.duration_weeks} weeks</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate(`/client/plan-details/${plan.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ClientPlans
