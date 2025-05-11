"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchPlanDay, markExerciseComplete, reportExerciseDifficulty, fetchPlanDaySummary } from "../../api/axios"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Star } from "lucide-react"
import { toast } from "sonner"

function Workout() {
    const { planId } = useParams()
    const navigate = useNavigate()
    const videoRef = useRef(null)

    const [workout, setWorkout] = useState(null)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [difficultyDialogOpen, setDifficultyDialogOpen] = useState(false)
    const [selectedDifficulty, setSelectedDifficulty] = useState(0)
    const [comment, setComment] = useState("")
    const [summary, setSummary] = useState(null)
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)

    useEffect(() => {
        fetchWorkout()
    }, [planId])

    async function fetchWorkout() {
        try {
            setLoading(true)
            const data = await fetchPlanDay(planId)
            setWorkout(data)
        } catch (err) {
            console.error("Error fetching workout:", err)
            toast.error("Could not load your workout")
            navigate("/client")
        } finally {
            setLoading(false)
        }
    }

    async function fetchSummary() {
        try {
            const data = await fetchPlanDaySummary(planId)
            setSummary(data)
        } catch (err) {
            console.error("Error fetching summary:", err)
        }
    }

    async function handleCompleteExercise() {
        try {
            setSubmitting(true)
            const currentExercise = workout.exercises[currentExerciseIndex]
            await markExerciseComplete(currentExercise.log_id, true)

            // Move to next exercise or show summary
            if (currentExerciseIndex < workout.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1)
                setConfirmDialogOpen(false)
                // Reset video if there is one
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                }
            } else {
                // Last exercise completed, show summary
                await fetchSummary()
                setConfirmDialogOpen(false)
                setSummaryDialogOpen(true)
            }
        } catch (err) {
            console.error("Error completing exercise:", err)
            toast.error("Could not mark exercise as complete")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleReportDifficulty() {
        try {
            setSubmitting(true)
            const currentExercise = workout.exercises[currentExerciseIndex]
            await reportExerciseDifficulty(currentExercise.log_id, selectedDifficulty, comment)
            toast.success("Feedback submitted")
            setDifficultyDialogOpen(false)
            setSelectedDifficulty(0)
            setComment("")
        } catch (err) {
            console.error("Error reporting difficulty:", err)
            toast.error("Could not submit feedback")
        } finally {
            setSubmitting(false)
        }
    }

    function handleFinishWorkout() {
        navigate("/client")
    }

    const currentExercise = workout?.exercises?.[currentExerciseIndex]
    const progress = workout?.exercises ? ((currentExerciseIndex + 1) / workout.exercises.length) * 100 : 0

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/client")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate("/client")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    Exercise {currentExerciseIndex + 1} of {workout?.exercises?.length}
                </div>
            </div>

            <Progress value={progress} className="h-2" />

            {currentExercise && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">{currentExercise.exercise_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentExercise.video_url && (
                            <div className="aspect-video bg-black rounded-md overflow-hidden">
                                <video
                                    ref={videoRef}
                                    src={currentExercise.video_url}
                                    controls
                                    className="w-full h-full"
                                    poster="/placeholder.svg?height=400&width=600"
                                />
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                    <div className="text-muted-foreground text-sm">Sets</div>
                                    <div className="text-2xl font-bold">{currentExercise.sets}</div>
                                </div>
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                    <div className="text-muted-foreground text-sm">Reps</div>
                                    <div className="text-2xl font-bold">{currentExercise.reps}</div>
                                </div>
                                {currentExercise.rest_time && (
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <div className="text-muted-foreground text-sm">Rest</div>
                                        <div className="text-2xl font-bold">{currentExercise.rest_time}s</div>
                                    </div>
                                )}
                                {currentExercise.tempo && (
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <div className="text-muted-foreground text-sm">Tempo</div>
                                        <div className="text-2xl font-bold">{currentExercise.tempo}</div>
                                    </div>
                                )}
                            </div>

                            {currentExercise.notes && (
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                    <div className="text-muted-foreground text-sm mb-1">Notes:</div>
                                    <div>{currentExercise.notes}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
                        <Button
                            className="w-full bg-teal-500 hover:bg-teal-600 text-lg py-6"
                            onClick={() => setConfirmDialogOpen(true)}
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Complete Exercise
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => setDifficultyDialogOpen(true)}
                        >
                            <Flag className="mr-2 h-5 w-5" />
                            Report Difficulty
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Confirm Complete Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Exercise</DialogTitle>
                        <DialogDescription>Have you completed all {currentExercise?.sets} sets of this exercise?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="sm:flex-1">
                            No, Go Back
                        </Button>
                        <Button
                            onClick={handleCompleteExercise}
                            disabled={submitting}
                            className="bg-teal-500 hover:bg-teal-600 sm:flex-1"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Yes, Complete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Difficulty Dialog */}
            <Dialog open={difficultyDialogOpen} onOpenChange={setDifficultyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Report Exercise Difficulty</DialogTitle>
                        <DialogDescription>How difficult was this exercise for you?</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                    key={rating}
                                    type="button"
                                    variant="ghost"
                                    className={`h-12 w-12 p-0 ${
                                        selectedDifficulty === rating ? "text-amber-500" : "text-gray-300 hover:text-amber-300"
                                    }`}
                                    onClick={() => setSelectedDifficulty(rating)}
                                >
                                    <Star className="h-8 w-8 fill-current" />
                                    <span className="sr-only">{rating} stars</span>
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Additional comments (optional):</label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell your trainer about any issues or questions..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setDifficultyDialogOpen(false)} className="sm:flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReportDifficulty}
                            disabled={submitting || selectedDifficulty === 0}
                            className="bg-teal-500 hover:bg-teal-600 sm:flex-1"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                    Submitting...
                                </>
                            ) : (
                                "Submit Feedback"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Workout Summary Dialog */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Workout Complete!</DialogTitle>
                        <DialogDescription>Great job! You've completed today's workout.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {summary && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full bg-teal-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-12 w-12 text-teal-600" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1">
                                        {summary.done}/{summary.total} Exercises Completed
                                    </h3>
                                    <p className="text-muted-foreground">{summary.progress}% of today's workout</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-muted-foreground text-sm">Total Sets</div>
                                            <div className="text-xl font-bold">{summary.total_sets}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-sm">Total Reps</div>
                                            <div className="text-xl font-bold">{summary.total_reps}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={handleFinishWorkout} className="w-full bg-teal-500 hover:bg-teal-600">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Return to Home
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Workout
