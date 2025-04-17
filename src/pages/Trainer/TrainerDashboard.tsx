"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, ClipboardList, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import { getMetrics, getPerformance, getRecentClients, getRecentActivity } from "../../api/axios"
import { format, parseISO, formatDistanceToNow } from "date-fns"

// Define types for our API responses
interface Metrics {
    total_clients: number
    active_plans: number
    completed_sessions: number
}

interface PerformanceData {
    day: string
    total: number
}

interface RecentClient {
    id: number
    name: string
    email: string
    last_login_at: string
}

// Update the ActivityItem interface to match the actual data structure
interface ActivityItem {
    id: number
    plan_day_exercise: {
        exercise: {
            id: number
            name: string
        }
    }
    completed: boolean
    date: string
    created_at: string
    plan_user_id: number
}

function TrainerDashboard() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
    const [recentClients, setRecentClients] = useState<RecentClient[]>([])
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const [performanceDays, setPerformanceDays] = useState(30)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    useEffect(() => {
        fetchPerformanceData()
    }, [performanceDays])

    async function fetchDashboardData() {
        try {
            setLoading(true)

            // Fetch all data in parallel
            const [metricsData, performanceData, clientsData, activityData] = await Promise.all([
                getMetrics(),
                getPerformance(performanceDays),
                getRecentClients(5),
                getRecentActivity(20),
            ])

            console.log(clientsData);

            setMetrics(metricsData)
            setPerformanceData(performanceData)
            setRecentClients(clientsData.data || [])
            setRecentActivity(activityData)
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchPerformanceData() {
        try {
            const data = await getPerformance(performanceDays)
            setPerformanceData(data)
        } catch (error) {
            console.error("Error fetching performance data:", error)
        }
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "MMM d, yyyy")
        } catch (e) {
            return "Unknown date"
        }
    }

    // Format relative time for display
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return "Never"
        try {
            return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
        } catch (e) {
            return "Unknown"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your trainer dashboard. Here's an overview of your customers' activities.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="hover:shadow-md transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics?.total_clients || 0}</div>
                                <p className="text-xs text-muted-foreground">Total registered clients</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics?.active_plans || 0}</div>
                                <p className="text-xs text-muted-foreground">Plans currently in use</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics?.completed_sessions || 0}</div>
                                <p className="text-xs text-muted-foreground">Total completed exercises</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                                Recent Activity
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4 hover:shadow-md transition-all duration-200">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Performance Overview</CardTitle>
                                        <div className="flex gap-2">
                                            <select
                                                className="text-xs border rounded p-1"
                                                value={performanceDays}
                                                onChange={(e) => setPerformanceDays(Number(e.target.value))}
                                            >
                                                <option value="7">Last 7 days</option>
                                                <option value="30">Last 30 days</option>
                                                <option value="90">Last 90 days</option>
                                            </select>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        {performanceData.length > 0 ? (
                                            <div className="h-[200px] w-full">
                                                <PerformanceChart data={performanceData} />
                                            </div>
                                        ) : (
                                            <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                                                <TrendingUp className="h-8 w-8 text-teal-500" />
                                                <span className="ml-2 text-sm text-muted-foreground">No performance data available</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3 hover:shadow-md transition-all duration-200">
                                    <CardHeader>
                                        <CardTitle>Recent Clients</CardTitle>
                                        <CardDescription>Your most recently active clients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentClients.length > 0 ? (
                                                recentClients.map((client) => (
                                                    <div
                                                        key={client.id}
                                                        className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                                                    >
                                                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                                                            {client.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4 space-y-1">
                                                            <p className="text-sm font-medium leading-none">{client.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Last login: {formatRelativeTime(client.last_login_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground">No recent client activity</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest exercise completions by your clients</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentActivity.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.map((activity) => (
                                                <div key={activity.id} className="flex items-center p-2 border-b last:border-0">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                                                        {activity.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <p className="text-sm font-medium">
                                                            Exercise:{" "}
                                                            <span className="font-semibold">{activity.plan_day_exercise.exercise.name}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {activity.completed ? "Completed" : "Logged"} on {formatDate(activity.date)}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{formatRelativeTime(activity.created_at)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No recent activity found</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}

// Simple performance chart component
function PerformanceChart({ data }: { data: PerformanceData[] }) {
    // Find the maximum value to scale the chart
    const maxValue = Math.max(...data.map((item) => item.total), 10)

    return (
        <div className="w-full h-full flex items-end">
            {data.map((item, index) => {
                const height = (item.total / maxValue) * 100
                const date = new Date(item.day)
                const dayLabel = format(date, "MMM d")

                return (
                    <div key={index} className="flex flex-col items-center flex-1 h-full">
                        <div
                            className="w-full max-w-[30px] bg-teal-500 rounded-t-sm mx-auto transition-all duration-300"
                            style={{ height: `${Math.max(height, 5)}%` }}
                        />
                        <div className="text-[10px] mt-2 text-muted-foreground">{dayLabel}</div>
                        <div className="text-[10px] font-medium">{item.total}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default TrainerDashboard
