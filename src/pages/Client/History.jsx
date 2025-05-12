"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchWorkoutHistory } from "../../api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Calendar, CheckCircle2, Clock } from "lucide-react"
import { toast } from "sonner"

function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchHistory()
    }, [])

    async function fetchHistory() {
        try {
            setLoading(true)
            const response = await fetchWorkoutHistory()
            setHistory(response.data || [])
        } catch (err) {
            console.error("Error fetching history:", err)
            toast.error("Could not load your workout history")
        } finally {
            setLoading(false)
        }
    }

    function formatDate(dateString) {
        try {
            return format(parseISO(dateString), "EEEE, MMMM d, yyyy")
        } catch (e) {
            return "Unknown date"
        }
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center">
                    <Button variant="ghost" size="lg" onClick={() => navigate("/client")}>
                        <ArrowLeft className="h-6 w-6 mr-2" />
                        <span className="font-medium">Back</span>
                    </Button>
                    <h1 className="text-3xl font-bold ml-2">My Workout History</h1>
                </div>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[150px] w-full rounded-lg" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">My Workout History</h1>

            {history.length === 0 ? (
                <Card className="shadow-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Calendar className="h-20 w-20 text-gray-400 mb-6" />
                            <h2 className="text-2xl font-semibold mb-4">No Workout History</h2>
                            <p className="text-lg text-muted-foreground mb-6">You haven't completed any workouts yet.</p>
                            <Button onClick={() => navigate("/client")} className="bg-teal-500 hover:bg-teal-600 text-xl py-6 px-8">
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {history.map((workout, index) => (
                        <Card key={index} className="shadow-md">
                            <CardHeader className="bg-gray-50 pb-4">
                                <CardTitle className="text-xl flex items-center">
                                    <Calendar className="mr-3 h-5 w-5 text-teal-600" />
                                    {formatDate(workout.date)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 pb-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 text-teal-700 mr-4">
                                            {workout.completed ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">{workout.plan_name}</h3>
                                            <p className="text-lg text-muted-foreground">
                                                Week {workout.week}, Day {workout.day}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div className="text-lg">
                                                <span className="font-medium">{workout.completed_exercises}</span> of{" "}
                                                <span className="font-medium">{workout.total_exercises}</span> exercises completed
                                            </div>
                                            <div className="text-lg font-medium text-teal-600">
                                                {Math.round((workout.completed_exercises / workout.total_exercises) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default History
