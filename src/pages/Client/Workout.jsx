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
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Flag,
    ChevronDown,
    ChevronUp,
    FrownIcon,
    MehIcon,
    SmileIcon,
} from "lucide-react"
import { toast } from "sonner"

function Workout() {
    const { planId } = useParams()
    const navigate = useNavigate()
    const videoRef = useRef(null)
    const imageRef = useRef(null)

    const [workout, setWorkout] = useState(null)
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [difficultyDialogOpen, setDifficultyDialogOpen] = useState(false)
    const [selectedDifficulty, setSelectedDifficulty] = useState(0)
    const [comment, setComment] = useState("")
    const [summary, setSummary] = useState(null)
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(10)
    const [canProceed, setCanProceed] = useState(false)
    const [firstExerciseTimerComplete, setFirstExerciseTimerComplete] = useState(false)
    const [showExerciseDetails, setShowExerciseDetails] = useState(false)

    useEffect(() => {
        fetchWorkout()
    }, [planId])

    // Timer for enabling the "Complete Exercise" button - ONLY for the first exercise
    useEffect(() => {
        if (!loading && workout && currentExerciseIndex === 0 && !firstExerciseTimerComplete) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setCanProceed(true)
                        setFirstExerciseTimerComplete(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [loading, workout, currentExerciseIndex, firstExerciseTimerComplete])

    // For subsequent exercises, allow immediate completion
    useEffect(() => {
        if (currentExerciseIndex > 0 || firstExerciseTimerComplete) {
            setCanProceed(true)
            setTimeRemaining(0)
        }
    }, [currentExerciseIndex, firstExerciseTimerComplete])

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
        if (!canProceed) return

        try {
            setSubmitting(true)
            const currentExercise = workout.exercises[currentExerciseIndex]
            await markExerciseComplete(currentExercise.log_id, true)

            // Move to next exercise or show summary
            if (currentExerciseIndex < workout.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1)
                // Reset video if there is one
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                }
            } else {
                // Last exercise completed, show summary
                await fetchSummary()
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

            // Move to next exercise after reporting difficulty
            if (currentExerciseIndex < workout.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1)
                // Reset video if there is one
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                }
            } else {
                // Last exercise completed, show summary
                await fetchSummary()
                setSummaryDialogOpen(true)
            }
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

    function handleImageError() {
        if (imageRef.current) {
            imageRef.current.src = "/test.gif"
        }
    }

    function handleVideoError() {
        if (videoRef.current) {
            const img = document.createElement("img")
            img.src = "/test.gif"
            img.className = "w-full h-full object-contain"
            videoRef.current.parentNode.replaceChild(img, videoRef.current)
        }
    }

    const currentExercise = workout?.exercises?.[currentExerciseIndex]
    const progress = workout?.exercises ? ((currentExerciseIndex + 1) / workout.exercises.length) * 100 : 0

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="lg" onClick={() => navigate("/client")}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-[300px] w-full rounded-lg" />
                <Skeleton className="h-[150px] w-full rounded-lg" />
                <div className="flex justify-between">
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="lg" onClick={() => navigate("/client")}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="text-xl font-medium">
                    Exercise {currentExerciseIndex + 1} of {workout?.exercises?.length}
                </div>
            </div>

            <Progress value={progress} className="h-3" />

            {currentExercise && (
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">{currentExercise.exercise_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Media display based on preferred_media */}
                        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                            {currentExercise.preferred_media === "video" && currentExercise.video_url ? (
                                <video
                                    ref={videoRef}
                                    src={currentExercise.video_url}
                                    controls
                                    className="w-full h-full"
                                    poster="/placeholder.svg?height=400&width=600"
                                    onError={handleVideoError}
                                />
                            ) : currentExercise.image_path ? (
                                <img
                                    ref={imageRef}
                                    src={currentExercise.image_path || "/placeholder.svg"}
                                    alt={currentExercise.exercise_name}
                                    className="max-h-full object-contain"
                                    onError={handleImageError}
                                />
                            ) : (
                                <img src="/test.gif" alt="Exercise demonstration" className="max-h-full object-contain" />
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="text-center">
                                <div className="text-muted-foreground text-xl mb-2">Repetitions</div>
                                <div className="text-4xl font-bold">{currentExercise.reps}</div>
                            </div>

                            {currentExercise.notes && (
                                <div className="mt-6 bg-white p-4 rounded-md shadow-sm">
                                    <div className="text-muted-foreground text-lg mb-2">Instructions:</div>
                                    <div className="text-lg">{currentExercise.notes}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-4 pb-8">
                        <Button
                            className={`w-full ${canProceed ? "bg-teal-500 hover:bg-teal-600" : "bg-gray-400"} text-xl py-8`}
                            onClick={handleCompleteExercise}
                            disabled={submitting || !canProceed}
                        >
                            {!canProceed ? (
                                <>
                                    <div className="mr-3">Wait {timeRemaining}s</div>
                                </>
                            ) : submitting ? (
                                <>
                                    <div className="animate-spin mr-3 h-6 w-6 border-3 border-b-transparent border-white rounded-full"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-3 h-7 w-7" />
                                    Complete Exercise
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-amber-600 border-amber-300 hover:bg-amber-50 text-xl py-6"
                            onClick={() => setDifficultyDialogOpen(true)}
                        >
                            <Flag className="mr-3 h-6 w-6" />
                            This Was Difficult
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Report Difficulty Dialog */}
            <Dialog open={difficultyDialogOpen} onOpenChange={setDifficultyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">How Difficult Was This?</DialogTitle>
                        <DialogDescription className="text-lg pt-2 text-center">
                            Rate the difficulty of this exercise
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <div className="flex justify-center gap-4 mb-8">
                            {[
                                { value: 1, icon: FrownIcon, label: "Very Hard" },
                                { value: 2, icon: FrownIcon, label: "Hard" },
                                { value: 3, icon: MehIcon, label: "Moderate" },
                                { value: 4, icon: SmileIcon, label: "Easy" },
                                { value: 5, icon: SmileIcon, label: "Very Easy" },
                            ].map((rating) => (
                                <Button
                                    key={rating.value}
                                    type="button"
                                    variant="outline"
                                    className={`flex flex-col items-center p-4 h-auto ${
                                        selectedDifficulty === rating.value
                                            ? "bg-amber-100 border-amber-500 text-amber-700"
                                            : "hover:bg-amber-50"
                                    }`}
                                    onClick={() => setSelectedDifficulty(rating.value)}
                                >
                                    <rating.icon
                                        className={`h-12 w-12 mb-2 ${
                                            rating.value <= 2 ? "text-red-500" : rating.value === 3 ? "text-amber-500" : "text-green-500"
                                        }`}
                                    />
                                    <span className="text-sm font-medium">{rating.label}</span>
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <label className="text-lg font-medium">Comments (optional):</label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell your trainer about any issues..."
                                className="min-h-[120px] text-lg p-4"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" onClick={() => setDifficultyDialogOpen(false)} className="sm:flex-1 text-lg py-6">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReportDifficulty}
                            disabled={submitting || selectedDifficulty === 0}
                            className="bg-teal-500 hover:bg-teal-600 sm:flex-1 text-lg py-6"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin mr-3 h-5 w-5 border-3 border-b-transparent border-white rounded-full"></div>
                                    Submitting...
                                </>
                            ) : (
                                "Submit & Continue"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Workout Summary Dialog */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Workout Complete!</DialogTitle>
                        <DialogDescription className="text-lg pt-2 text-center">
                            Great job! You've completed today's workout.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        {summary && (
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-32 w-32 rounded-full bg-teal-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-16 w-16 text-teal-600" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">
                                        {summary.done}/{summary.total} Exercises Completed
                                    </h3>
                                    <p className="text-xl text-muted-foreground">{summary.progress}% of today's workout</p>
                                </div>

                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <Button
                                        variant="ghost"
                                        className="w-full flex items-center justify-between py-3 text-xl font-semibold"
                                        onClick={() => setShowExerciseDetails(!showExerciseDetails)}
                                    >
                                        <span>Today's Exercises</span>
                                        {showExerciseDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                                    </Button>

                                    {showExerciseDetails && (
                                        <div className="space-y-3 mt-3">
                                            {workout.exercises.map((exercise, index) => (
                                                <div key={index} className="flex items-center bg-white p-3 rounded-md shadow-sm">
                                                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-lg">{exercise.exercise_name}</p>
                                                        <p className="text-muted-foreground">{exercise.reps} repetitions</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={handleFinishWorkout} className="w-full bg-teal-500 hover:bg-teal-600 text-xl py-6">
                            <ArrowRight className="mr-3 h-6 w-6" />
                            Return to Home
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Workout
