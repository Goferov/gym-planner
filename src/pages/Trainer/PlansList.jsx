"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPlans, deletePlan, assignPlan, unassignPlan, createPlan, getPlan } from "../../api/axios"
import { getClients } from "../../api/axios" // For fetching clients to assign
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreHorizontal, Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Copy, Users, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function PlansList() {
    const [plans, setPlans] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [planToDelete, setPlanToDelete] = useState(null)
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [currentPlan, setCurrentPlan] = useState(null)
    const [selectedClientIds, setSelectedClientIds] = useState([])
    const [clientSearchTerm, setClientSearchTerm] = useState("")
    const [assignLoading, setAssignLoading] = useState(false)
    const [copyingPlan, setCopyingPlan] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    // Sorting state
    const [sortColumn, setSortColumn] = useState("name")
    const [sortDirection, setSortDirection] = useState("asc")

    const navigate = useNavigate()

    useEffect(() => {
        fetchPlans()
        fetchClients()
    }, [])

    async function fetchPlans() {
        try {
            setLoading(true)
            const data = await getPlans()
            setPlans(data.data || [])
            setError(null)
        } catch (err) {
            console.error("Error fetching plans", err)
            setError("Failed to load plans. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function fetchClients() {
        try {
            const data = await getClients()
            setClients(data.data || [])
        } catch (err) {
            console.error("Error fetching clients", err)
        }
    }

    async function handleDeletePlan() {
        if (!planToDelete) return

        try {
            await deletePlan(planToDelete.id)
            setPlans(plans.filter((plan) => plan.id !== planToDelete.id))
            setDeleteDialogOpen(false)
            setPlanToDelete(null)
            toast.success("The training plan has been successfully deleted.", {
                description: "Plan deleted successfully.",
            })
        } catch (err) {
            console.error("Error deleting plan", err)
            toast.error("Failed to delete the plan. Please try again.")
        }
    }

    function confirmDelete(plan) {
        setPlanToDelete(plan)
        setDeleteDialogOpen(true)
    }

    async function handleCopyPlan(plan) {
        try {
            setCopyingPlan(true)
            // Get the full plan details
            const planDetails = await getPlan(plan.id)

            // Create a new plan with the same data but a different name
            const newPlanData = {
                ...planDetails,
                name: `${planDetails.name} (Copy)`,
            }

            // Remove any id fields that might cause conflicts
            delete newPlanData.id
            delete newPlanData.created_at
            delete newPlanData.updated_at

            // If plan_days exists, remove their ids too
            if (newPlanData.plan_days) {
                newPlanData.plan_days = newPlanData.plan_days.map((day) => {
                    const newDay = { ...day }
                    delete newDay.id
                    delete newDay.created_at
                    delete newDay.updated_at

                    // Handle exercises if they exist
                    if (newDay.exercises) {
                        newDay.exercises = newDay.exercises.map((exercise) => {
                            const newExercise = { ...exercise }
                            delete newExercise.id
                            delete newExercise.created_at
                            delete newExercise.updated_at
                            return newExercise
                        })
                    }

                    return newDay
                })
            }

            await createPlan(newPlanData)
            await fetchPlans() // Refresh the plans list

            toast.success("The training plan has been successfully copied.")
        } catch (err) {
            console.error("Error copying plan", err)
            toast.error("Failed to copy the plan. Please try again.")
        } finally {
            setCopyingPlan(false)
        }
    }

    function openAssignDialog(plan) {
        setCurrentPlan(plan)
        // Initialize selected clients based on the plan's assigned clients
        setSelectedClientIds(plan.clients?.map((client) => client.id) || [])
        setAssignDialogOpen(true)
    }

    async function handleAssignClients() {
        if (!currentPlan) return

        try {
            setAssignLoading(true)

            // Get currently assigned client IDs
            const currentClientIds = currentPlan.clients?.map((client) => client.id) || []

            // Find clients to assign (new selections)
            const clientsToAssign = selectedClientIds.filter((id) => !currentClientIds.includes(id))

            // Find clients to unassign (removed selections)
            const clientsToUnassign = currentClientIds.filter((id) => !selectedClientIds.includes(id))

            // Perform assign and unassign operations
            if (clientsToAssign.length > 0) {
                await assignPlan(currentPlan.id, clientsToAssign)
            }

            if (clientsToUnassign.length > 0) {
                await unassignPlan(currentPlan.id, clientsToUnassign)
            }

            // Refresh plans to update UI
            await fetchPlans()

            setAssignDialogOpen(false)
            toast.success("The client assignments have been updated successfully.")
        } catch (err) {
            console.error("Error updating client assignments", err)
            toast.error("Failed to update client assignments. Please try again.")
        } finally {
            setAssignLoading(false)
        }
    }

    function toggleClientSelection(clientId) {
        setSelectedClientIds((prev) => {
            if (prev.includes(clientId)) {
                return prev.filter((id) => id !== clientId)
            } else {
                return [...prev, clientId]
            }
        })
    }

    // Handle sorting
    function handleSort(column) {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            // Set new column and default to ascending
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    // Filter plans based on search term
    const filteredPlans = plans.filter((plan) => {
        return plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    // Sort filtered plans
    const sortedPlans = [...filteredPlans].sort((a, b) => {
        if (sortColumn === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }

        if (sortColumn === "clients") {
            const aCount = a.clients?.length || 0
            const bCount = b.clients?.length || 0
            return sortDirection === "asc" ? aCount - bCount : bCount - aCount
        }

        if (sortColumn === "duration") {
            const aDuration = a.duration_weeks || 0
            const bDuration = b.duration_weeks || 0
            return sortDirection === "asc" ? aDuration - bDuration : bDuration - aDuration
        }

        return 0
    })

    // Paginate sorted plans
    const paginatedPlans = sortedPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const totalPages = Math.ceil(sortedPlans.length / pageSize)

    // Filter clients for the assign dialog
    const filteredClients = clients.filter(
        (client) =>
            client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Training Plans</h1>
                <p className="text-muted-foreground">Manage your training plans and assign them to clients.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Plans Library</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search plans..."
                                    className="pl-8 w-full sm:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => navigate("/trainer/plans/add")}
                                className="bg-teal-600 hover:bg-teal-700 transition-colors"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Plan
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No plans match your search criteria" : "No plans found. Create your first training plan!"}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center">
                                                    Plan Name
                                                    {sortColumn === "name" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("duration")}
                                            >
                                                <div className="flex items-center">
                                                    Duration
                                                    {sortColumn === "duration" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("clients")}
                                            >
                                                <div className="flex items-center">
                                                    Assigned Clients
                                                    {sortColumn === "clients" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedPlans.map((plan) => (
                                            <TableRow key={plan.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{plan.name}</TableCell>
                                                <TableCell>{plan.duration_weeks ? `${plan.duration_weeks} weeks` : "Not specified"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2 mr-2">
                                                            {(plan.clients || []).slice(0, 3).map((client) => (
                                                                <Avatar key={client.id} className="border-2 border-white h-8 w-8">
                                                                    <AvatarImage src={client.avatar || "/placeholder.svg"} />
                                                                    <AvatarFallback className="text-xs bg-teal-100 text-teal-800">
                                                                        {client.name?.charAt(0) || "C"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            {(plan.clients || []).length > 3 && (
                                                                <Avatar className="border-2 border-white h-8 w-8">
                                                                    <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                                                                        +{(plan.clients || []).length - 3}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => openAssignDialog(plan)}
                                                        >
                                                            <Users className="h-3.5 w-3.5 mr-1" />
                                                            {(plan.clients || []).length > 0
                                                                ? `Manage (${(plan.clients || []).length})`
                                                                : "Assign Clients"}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted transition-colors">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                                                            <DropdownMenuItem
                                                                onClick={() => navigate(`/trainer/plans/edit/${plan.id}`)}
                                                                className="hover:bg-muted transition-colors"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleCopyPlan(plan)}
                                                                disabled={copyingPlan}
                                                                className="hover:bg-muted transition-colors"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                {copyingPlan ? "Copying..." : "Copy Plan"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                onClick={() => confirmDelete(plan)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                                        <strong>{Math.min(currentPage * pageSize, sortedPlans.length)}</strong> of{" "}
                                        <strong>{sortedPlans.length}</strong> plans
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="hover:bg-muted transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous Page</span>
                                        </Button>
                                        <div className="text-sm">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="hover:bg-muted transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next Page</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white border shadow-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the plan "{planToDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="hover:bg-muted transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700 transition-colors">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Clients Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent className="bg-white border shadow-md sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Clients to Plan</DialogTitle>
                        <DialogDescription>
                            Select clients to assign to "{currentPlan?.name}". Clients will be able to access this training plan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search clients..."
                                className="pl-8 w-full"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="border rounded-md">
                            <ScrollArea className="h-[300px]">
                                {filteredClients.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">No clients found</div>
                                ) : (
                                    <div className="p-1">
                                        {filteredClients.map((client) => (
                                            <div
                                                key={client.id}
                                                className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors"
                                            >
                                                <Checkbox
                                                    id={`client-${client.id}`}
                                                    checked={selectedClientIds.includes(client.id)}
                                                    onCheckedChange={() => toggleClientSelection(client.id)}
                                                />
                                                <Label htmlFor={`client-${client.id}`} className="flex items-center flex-1 cursor-pointer">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="bg-teal-100 text-teal-800">
                                                            {client.name?.charAt(0) || "C"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{client.name}</span>
                                                        <span className="text-xs text-muted-foreground">{client.email}</span>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {selectedClientIds.length} client{selectedClientIds.length !== 1 ? "s" : ""} selected
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedClientIds([])}
                                    disabled={selectedClientIds.length === 0}
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedClientIds(filteredClients.map((c) => c.id))}
                                >
                                    Select All
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAssignDialogOpen(false)}
                            className="hover:bg-muted transition-colors"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignClients}
                            disabled={assignLoading}
                            className="bg-teal-600 hover:bg-teal-700 transition-colors"
                        >
                            {assignLoading ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Save Assignments
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PlansList
