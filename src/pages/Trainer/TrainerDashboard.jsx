"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, ClipboardList, Calendar, TrendingUp, Clock } from "lucide-react"

// Sample data - replace with actual data from your API
const stats = {
    totalClients: 24,
    activePlans: 18,
    completedSessions: 156,
    upcomingSessions: 12,
}

const recentClients = [
    { id: 1, name: "John Smith", status: "Active", lastSession: "Today" },
    { id: 2, name: "Emma Wilson", status: "Active", lastSession: "Yesterday" },
    { id: 3, name: "Michael Brown", status: "Inactive", lastSession: "3 days ago" },
    { id: 4, name: "Sarah Davis", status: "Active", lastSession: "1 week ago" },
]

function TrainerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your trainer dashboard. Here's an overview of your activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePlans}</div>
                        <p className="text-xs text-muted-foreground">+4 from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedSessions}</div>
                        <p className="text-xs text-muted-foreground">+23 from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                        <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                        Recent Activity
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                                    <TrendingUp className="h-8 w-8 text-teal-500" />
                                    <span className="ml-2 text-sm text-muted-foreground">Performance chart will appear here</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle>Recent Clients</CardTitle>
                                <CardDescription>Your most recently active clients</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentClients.map((client) => (
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
                                                    {client.status} • Last session: {client.lastSession}
                                                </p>
                                            </div>
                                            <div
                                                className={`ml-auto flex h-2 w-2 rounded-full ${
                                                    client.status === "Active" ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="analytics" className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="text-center">
                        <TrendingUp className="h-10 w-10 text-teal-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">Detailed analytics will be available in the next update.</p>
                    </div>
                </TabsContent>
                <TabsContent value="recent" className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="text-center">
                        <Clock className="h-10 w-10 text-teal-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Recent Activity</h3>
                        <p className="text-sm text-muted-foreground">Your recent activity will appear here.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default TrainerDashboard
