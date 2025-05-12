"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchPlanUsers, fetchPlanDay, startPlanDay } from "../../api/axios"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO, addDays } from "date-fns"
import { Calendar, CheckCircle2, Clock, Dumbbell, PlayCircle } from "lucide-react"
import { toast } from "sonner"

function ClientDashboard() {
    const [activePlans, setActivePlans] = useState([])
    const [todayWorkout, setTodayWorkout] = useState(null)
    const [missedWorkouts, setMissedWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [startingWorkout, setStartingWorkout] = useState(false)
    const [hasStartedPlan, setHasStartedPlan] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            // Fetch active plans
            const plansResponse = await fetchPlanUsers({ active: 1 })
            const plans = plansResponse.data || []
            setActivePlans(plans)

            // Check if user has any started plans
            const hasStartedPlans = plans.some((plan) => plan.started_at)
            setHasStartedPlan(hasStartedPlans)

            // If there's at least one started plan, fetch today's workout
            const startedPlans = plans.filter((plan) => plan.started_at)
            if (startedPlans.length > 0) {
                const activePlan = startedPlans[0] // Use the first started plan
                try {
                    const dayResponse = await fetchPlanDay(activePlan.id)
                    setTodayWorkout(dayResponse)

                    // Check for missed workouts
                    if (dayResponse.pending_days && dayResponse.pending_days.length > 0) {
                        setMissedWorkouts(dayResponse.pending_days)
                    }
                } catch (err) {
                    // If there's no workout for today, it will throw an error
                    console.log("No workout scheduled for today")
                    setTodayWorkout({ rest: true, next_training_date: addDays(new Date(), 1) })
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err)
            toast.error("Could not load your workout information")
        } finally {
            setLoading(false)
        }
    }

    async function handleStartWorkout(planUserId, date = null) {
        try {
            setStartingWorkout(true)
            const response = await startPlanDay(planUserId, date)
            navigate(`/client/workout/${planUserId}`)
        } catch (err) {
            console.error("Error starting workout:", err)
            toast.error("Could not start the workout")
        } finally {
            setStartingWorkout(false)
        }
    }

    function formatDate(dateString) {
        try {
            return format(parseISO(dateString), "EEEE, MMMM d")
        } catch (e) {
            return "Unknown date"
        }
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-14 w-3/4" />
                <Skeleton className="h-[250px] w-full rounded-lg" />
                <Skeleton className="h-[120px] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Welcome to Your Training</h1>

            {activePlans.length === 0 ? (
                <Card className="shadow-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Calendar className="h-20 w-20 text-gray-400 mb-6" />
                            <h2 className="text-2xl font-semibold mb-4">No Active Plans</h2>
                            <p className="text-lg text-muted-foreground mb-6">You don't have any active training plans yet.</p>
                            <Button
                                onClick={() => navigate("/client/plans")}
                                className="bg-teal-500 hover:bg-teal-600 text-xl py-6 px-8"
                            >
                                View Available Plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {hasStartedPlan ? (
                        /* Today's Workout - only show if there's at least one started plan */
                        <Card className="border-2 border-teal-100 shadow-md">
                            <CardHeader className="bg-teal-50 pb-4">
                                <CardTitle className="flex items-center text-2xl">
                                    <Calendar className="mr-3 h-7 w-7 text-teal-600" />
                                    Today's Training
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {todayWorkout?.rest ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Clock className="h-24 w-24 text-teal-500 mb-6" />
                                        <h3 className="text-2xl font-semibold mb-3">Rest Day</h3>
                                        <p className="text-lg font-medium">
                                            Next workout:{" "}
                                            {todayWorkout.next_training_date ? formatDate(todayWorkout.next_training_date) : "Coming soon"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-2xl font-semibold">{todayWorkout?.plan_name}</h3>
                                                <p className="text-lg text-muted-foreground">
                                                    {todayWorkout?.exercises?.length || 0} exercises planned
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-700">
                                                <Dumbbell className="h-8 w-8" />
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <p className="text-xl font-medium mb-2">
                                                Week {todayWorkout?.week}, Day {todayWorkout?.day}
                                            </p>
                                            <p className="text-lg text-muted-foreground">
                                                {todayWorkout?.description || "Regular training day"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-4 pb-8">
                                {!todayWorkout?.rest && (
                                    <Button
                                        className="w-full bg-teal-500 hover:bg-teal-600 text-xl py-8"
                                        onClick={() => handleStartWorkout(activePlans.filter((plan) => plan.started_at)[0].id)}
                                        disabled={startingWorkout}
                                    >
                                        {startingWorkout ? (
                                            <>
                                                <div className="animate-spin mr-3 h-6 w-6 border-3 border-b-transparent border-white rounded-full"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="mr-3 h-7 w-7" />
                                                Start Today's Workout
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="shadow-md">
                            <CardContent className="pt-8 pb-8">
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Calendar className="h-20 w-20 text-gray-400 mb-6" />
                                    <h2 className="text-2xl font-semibold mb-4">No Active Training</h2>
                                    <p className="text-lg text-muted-foreground mb-6">You haven't started any training plans yet.</p>
                                    <Button
                                        className="bg-teal-500 hover:bg-teal-600 text-xl py-6 px-8"
                                        onClick={() => navigate("/client/plans")}
                                    >
                                        Go to My Plans
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Missed Workouts - only show if there are started plans */}
                    {activePlans.filter((plan) => plan.started_at).length > 0 && missedWorkouts.length > 0 && (
                        <Card className="shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-amber-700">Missed Workouts</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {missedWorkouts.map((workout, index) => (
                                        <div key={index} className="flex items-center justify-between p-5 bg-amber-50 rounded-lg">
                                            <div>
                                                <p className="text-lg font-medium">{formatDate(workout.scheduled_date)}</p>
                                                <p className="text-base text-muted-foreground">
                                                    Week {workout.week}, Day {workout.day}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-amber-500 text-amber-700 hover:bg-amber-100 text-lg py-5 px-6"
                                                onClick={() =>
                                                    handleStartWorkout(
                                                        activePlans.filter((plan) => plan.started_at)[0].id,
                                                        workout.scheduled_date,
                                                    )
                                                }
                                            >
                                                Complete
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-6">
                        <Button
                            variant="outline"
                            className="h-auto py-8 flex flex-col items-center justify-center text-xl shadow-sm"
                            onClick={() => navigate("/client/plans")}
                        >
                            <Calendar className="h-10 w-10 mb-3" />
                            My Plans
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-8 flex flex-col items-center justify-center text-xl shadow-sm"
                            onClick={() => navigate("/client/history")}
                        >
                            <CheckCircle2 className="h-10 w-10 mb-3" />
                            My Progress
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ClientDashboard
