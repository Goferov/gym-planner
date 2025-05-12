"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchPlanUsers } from "../../api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO, subDays } from "date-fns"
import { Calendar, CheckCircle2, HistoryIcon } from "lucide-react"
import { toast } from "sonner"

function History() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            // Fetch all plans (both active and completed)
            const response = await fetchPlanUsers()

            if (response && response.data) {
                // Filter and sort plans
                const allPlans = response.data.sort((a, b) => {
                    const dateA = a.started_at ? new Date(a.started_at) : new Date(0)
                    const dateB = b.started_at ? new Date(b.started_at) : new Date(0)
                    return dateB - dateA
                })

                setPlans(allPlans)
            } else {
                setPlans([])
            }
        } catch (err) {
            console.error("Error fetching history:", err)
            toast.error("Could not load your training history")
            setPlans([])
        } finally {
            setLoading(false)
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

    // Generate some mock recent activity data for demonstration
    const recentActivity = [
        {
            date: format(subDays(new Date(), 1), "MMMM d, yyyy"),
            description: "Completed Upper Body workout",
            exercises: 8,
            planName: "Strength Training",
        },
        {
            date: format(subDays(new Date(), 3), "MMMM d, yyyy"),
            description: "Completed Leg Day workout",
            exercises: 6,
            planName: "Strength Training",
        },
        {
            date: format(subDays(new Date(), 5), "MMMM d, yyyy"),
            description: "Completed Core workout",
            exercises: 5,
            planName: "Strength Training",
        },
    ]

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">My Training History</h1>
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">My Training History</h1>

            {/* Recent Activity */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center">
                    <HistoryIcon className="h-6 w-6 mr-2 text-teal-600" />
                    Recent Activity
                </h2>

                {recentActivity.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-center">
                            <p className="text-lg text-muted-foreground">No recent activity to show.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-md">
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="p-5 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-lg">{activity.description}</div>
                                            <Badge variant="outline" className="text-base">
                                                {activity.exercises} exercises
                                            </Badge>
                                        </div>
                                        <div className="text-base text-muted-foreground flex items-center justify-between">
                                            <div>{activity.planName}</div>
                                            <div>{activity.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Training Plans */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-teal-600" />
                    Training Plans
                </h2>

                {plans.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-center">
                            <p className="text-lg text-muted-foreground">No training plans to show.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className="cursor-pointer hover:shadow-md transition-all shadow-sm"
                                onClick={() => navigate(`/client/plan-details/${plan.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{plan.plan_name || plan.name}</CardTitle>
                                        {plan.active ? (
                                            <Badge className="bg-teal-500 text-base">{plan.progress}% Complete</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-base">
                                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                                Completed
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Progress value={plan.progress} className="h-3 mb-4" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default History
