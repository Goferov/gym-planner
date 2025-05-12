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
import { Calendar, CheckCircle2, PlayCircle } from "lucide-react"
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
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">My Training Plans</h1>
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-[250px] w-full rounded-lg" />
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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">My Training Plans</h1>

            {plans.length === 0 ? (
                <Card className="shadow-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Calendar className="h-20 w-20 text-gray-400 mb-6" />
                            <h2 className="text-2xl font-semibold mb-4">No Plans Available</h2>
                            <p className="text-lg text-muted-foreground">You don't have any training plans assigned yet.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Started Plans */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Started Plans</h2>

                        {startedPlans.length === 0 ? (
                            <p className="text-lg text-muted-foreground">No started plans. Start a plan below.</p>
                        ) : (
                            startedPlans.map((plan) => (
                                <Card key={plan.id} className="border-2 border-teal-100 shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-2xl">{plan.plan_name || plan.name}</CardTitle>
                                            <Badge className="bg-teal-500 text-lg py-1 px-3">{plan.progress}% Complete</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <Progress value={plan.progress} className="h-3 mb-6" />
                                    </CardContent>
                                    <CardFooter className="pt-4 pb-6">
                                        <Button
                                            className="w-full bg-teal-500 hover:bg-teal-600 text-xl py-6"
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
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Available Plans</h2>

                        {availablePlans.length === 0 ? (
                            <p className="text-lg text-muted-foreground">No new plans available to start.</p>
                        ) : (
                            availablePlans.map((plan) => (
                                <Card key={plan.id} className="shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-2xl">{plan.plan_name || plan.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <p className="text-lg text-muted-foreground mb-6">
                                            {plan.description || "A training plan created by your trainer."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-4 pb-6">
                                        <Button
                                            className="w-full bg-teal-500 hover:bg-teal-600 text-xl py-6"
                                            onClick={() => handleStartPlan(plan.id)}
                                            disabled={startingPlan === plan.id}
                                        >
                                            {startingPlan === plan.id ? (
                                                <>
                                                    <div className="animate-spin mr-3 h-6 w-6 border-3 border-b-transparent border-white rounded-full"></div>
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="mr-3 h-7 w-7" />
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
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold">Completed Plans</h2>

                            {completedPlans.map((plan) => (
                                <Card key={plan.id} className="bg-gray-50 shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-2xl">{plan.plan_name || plan.name}</CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="bg-green-100 text-green-800 border-green-200 text-lg py-1 px-3"
                                            >
                                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                                Completed
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <Progress value={plan.progress} className="h-3 mb-6" />
                                    </CardContent>
                                    <CardFooter className="pt-4 pb-6">
                                        <Button
                                            variant="outline"
                                            className="w-full text-xl py-6"
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
