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

            // If there's at least one active plan, fetch today's workout
            if (plans.length > 0) {
                const activePlan = plans[0] // Use the first active plan
                try {
                    const dayResponse = await fetchPlanDay(activePlan.id)
                    setTodayWorkout(dayResponse)

                    // Check for missed workouts (simplified logic - in a real app you'd need more complex logic)
                    // This is just a placeholder to demonstrate the UI
                    if (dayResponse.missed_days && dayResponse.missed_days.length > 0) {
                        setMissedWorkouts(dayResponse.missed_days)
                    }
                } catch (err) {
                    // If there's no workout for today, it will throw an error
                    console.log("No workout scheduled for today")
                    setTodayWorkout({ is_rest_day: true, next_workout_date: addDays(new Date(), 1) })
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
            <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Welcome to Your Training</h1>

            {activePlans.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No Active Plans</h2>
                            <p className="text-muted-foreground mb-4">You don't have any active training plans yet.</p>
                            <Button onClick={() => navigate("/client/plans")} className="bg-teal-500 hover:bg-teal-600">
                                View Available Plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Today's Workout */}
                    <Card className="border-2 border-teal-100">
                        <CardHeader className="bg-teal-50 pb-4">
                            <CardTitle className="flex items-center text-xl">
                                <Calendar className="mr-2 h-5 w-5 text-teal-600" />
                                Today's Training
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {todayWorkout?.is_rest_day ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Clock className="h-16 w-16 text-teal-500 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Rest Day</h3>
                                    <p className="text-muted-foreground mb-1">No workout scheduled for today.</p>
                                    <p className="font-medium">
                                        Next workout:{" "}
                                        {todayWorkout.next_workout_date ? formatDate(todayWorkout.next_workout_date) : "Coming soon"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{todayWorkout?.plan_name}</h3>
                                            <p className="text-muted-foreground">{todayWorkout?.exercises?.length || 0} exercises planned</p>
                                        </div>
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 text-teal-700">
                                            <Dumbbell className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium mb-1">
                                            Week {todayWorkout?.week_number}, Day {todayWorkout?.day_number}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {todayWorkout?.day_description || "Regular training day"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-2 pb-6">
                            {!todayWorkout?.is_rest_day && (
                                <Button
                                    className="w-full bg-teal-500 hover:bg-teal-600 text-lg py-6"
                                    onClick={() => handleStartWorkout(activePlans[0].id)}
                                    disabled={startingWorkout}
                                >
                                    {startingWorkout ? (
                                        <>
                                            <div className="animate-spin mr-2 h-5 w-5 border-2 border-b-transparent border-white rounded-full"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="mr-2 h-5 w-5" />
                                            Start Today's Workout
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Missed Workouts */}
                    {missedWorkouts.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-amber-700">Missed Workouts</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {missedWorkouts.map((workout, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{formatDate(workout.date)}</p>
                                                <p className="text-sm text-muted-foreground">{workout.exercises_count} exercises</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-amber-500 text-amber-700 hover:bg-amber-100"
                                                onClick={() => handleStartWorkout(activePlans[0].id, workout.date)}
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
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col items-center justify-center text-base"
                            onClick={() => navigate("/client/plans")}
                        >
                            <Calendar className="h-8 w-8 mb-2" />
                            My Plans
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col items-center justify-center text-base"
                            onClick={() => navigate("/client/history")}
                        >
                            <CheckCircle2 className="h-8 w-8 mb-2" />
                            My Progress
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ClientDashboard
