import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getExercises, deleteExercise, muscleGroups } from "../../api/axios"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function ExercisesList() {
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [exerciseToDelete, setExerciseToDelete] = useState(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    // Sorting state
    const [sortColumn, setSortColumn] = useState("name")
    const [sortDirection, setSortDirection] = useState("asc")

    // Muscle group filtering
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([])
    const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([])
    const [muscleGroupsLoading, setMuscleGroupsLoading] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        fetchExercises()
        fetchMuscleGroups()
    }, [])

    async function fetchMuscleGroups() {
        try {
            setMuscleGroupsLoading(true)
            const response = await muscleGroups()
            // Handle the data structure with the "data" property
            setAvailableMuscleGroups(response.data.data || [])
        } catch (err) {
            console.error("Error fetching muscle groups", err)
        } finally {
            setMuscleGroupsLoading(false)
        }
    }

    async function fetchExercises() {
        try {
            setLoading(true)
            const data = await getExercises()
            setExercises(data.data)
            setError(null)
        } catch (err) {
            console.error("Error fetching exercises", err)
            setError("Failed to load exercises. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteExercise() {
        if (!exerciseToDelete) return

        try {
            await deleteExercise(exerciseToDelete.id)
            setExercises(exercises.filter((ex) => ex.id !== exerciseToDelete.id))
            setDeleteDialogOpen(false)
            setExerciseToDelete(null)
        } catch (err) {
            console.error("Error deleting exercise", err)
            // You could add error handling UI here
        }
    }

    function confirmDelete(exercise) {
        setExerciseToDelete(exercise)
        setDeleteDialogOpen(true)
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

    // Handle muscle group filter toggle
    function toggleMuscleGroupFilter(groupId) {
        setSelectedMuscleGroups((prev) => {
            if (prev.includes(groupId)) {
                return prev.filter((id) => id !== groupId)
            } else {
                return [...prev, groupId]
            }
        })
    }

    // Clear all muscle group filters
    function clearMuscleGroupFilters() {
        setSelectedMuscleGroups([])
    }

    // Filter exercises based on search term and selected muscle groups
    const filteredExercises = exercises.filter((exercise) => {
        // Text search filter
        const matchesSearch =
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exercise.muscle_groups.some((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))

        // Muscle group filter
        const matchesMuscleGroups =
            selectedMuscleGroups.length === 0 || // If no muscle groups selected, show all
            exercise.muscle_groups.some((group) => selectedMuscleGroups.includes(group.id))

        return matchesSearch && matchesMuscleGroups
    })

    // Sort filtered exercises
    const sortedExercises = [...filteredExercises].sort((a, b) => {
        if (sortColumn === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }

        if (sortColumn === "muscleGroups") {
            const aGroups = a.muscle_groups.map((g) => g.name).join(", ")
            const bGroups = b.muscle_groups.map((g) => g.name).join(", ")
            return sortDirection === "asc" ? aGroups.localeCompare(bGroups) : bGroups.localeCompare(aGroups)
        }

        if (sortColumn === "type") {
            return sortDirection === "asc"
                ? (a.is_system_exercise ? 1 : 0) - (b.is_system_exercise ? 1 : 0)
                : (b.is_system_exercise ? 1 : 0) - (a.is_system_exercise ? 1 : 0)
        }

        return 0
    })

    // Paginate sorted exercises
    const paginatedExercises = sortedExercises.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const totalPages = Math.ceil(sortedExercises.length / pageSize)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
                <p className="text-muted-foreground">Manage your exercise library. Add, edit, or remove exercises.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Exercise Library</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search exercises..."
                                    className="pl-8 w-full sm:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => navigate("/trainer/exercises/add")}
                                className="bg-teal-600 hover:bg-teal-700 transition-colors"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Exercise
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed hover:bg-muted/50 transition-colors">
                                    <Filter className="mr-2 h-3.5 w-3.5" />
                                    Filter by Muscle Group
                                    {selectedMuscleGroups.length > 0 && (
                                        <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal lg:hidden">
                                            {selectedMuscleGroups.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0 bg-white border shadow-md" align="start">
                                <div className="p-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium">Muscle Groups</Label>
                                        {selectedMuscleGroups.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                onClick={clearMuscleGroupFilters}
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Clear filters
                                            </Button>
                                        )}
                                    </div>
                                    <Separator className="my-2" />
                                    {muscleGroupsLoading ? (
                                        <div className="flex justify-center py-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[300px] overflow-auto">
                                            {availableMuscleGroups.map((group) => (
                                                <div key={group.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`filter-${group.id}`}
                                                        checked={selectedMuscleGroups.includes(group.id)}
                                                        onCheckedChange={() => toggleMuscleGroupFilter(group.id)}
                                                    />
                                                    <Label htmlFor={`filter-${group.id}`} className="text-sm font-normal cursor-pointer">
                                                        {group.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {selectedMuscleGroups.length > 0 && (
                            <div className="hidden lg:flex gap-1 flex-wrap">
                                {selectedMuscleGroups.map((groupId) => {
                                    const group = availableMuscleGroups.find((g) => g.id === groupId)
                                    return group ? (
                                        <Badge key={group.id} variant="secondary" className="rounded-sm">
                                            {group.name}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 ml-1 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => toggleMuscleGroupFilter(group.id)}
                                            >
                                                <X className="h-3 w-3" />
                                                <span className="sr-only">Remove filter</span>
                                            </Button>
                                        </Badge>
                                    ) : null
                                })}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={clearMuscleGroupFilters}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm || selectedMuscleGroups.length > 0
                                ? "No exercises match your search criteria"
                                : "No exercises found. Add your first exercise!"}
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
                                                    Name
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
                                                onClick={() => handleSort("muscleGroups")}
                                            >
                                                <div className="flex items-center">
                                                    Muscle Groups
                                                    {sortColumn === "muscleGroups" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("type")}
                                            >
                                                <div className="flex items-center">
                                                    Type
                                                    {sortColumn === "type" &&
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
                                        {paginatedExercises.map((exercise) => (
                                            <TableRow key={exercise.id}>
                                                <TableCell className="font-medium">{exercise.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {exercise.muscle_groups.map((group) => (
                                                            <Badge key={group.id} variant="outline" className="bg-teal-50">
                                                                {group.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {exercise.is_system_exercise ? (
                                                        <Badge variant="secondary">System</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Custom</Badge>
                                                    )}
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
                                                                onClick={() => navigate(`/trainer/exercises/add/${exercise.id}`)}
                                                                disabled={exercise.is_system_exercise}
                                                                className={
                                                                    exercise.is_system_exercise
                                                                        ? "opacity-50 cursor-not-allowed"
                                                                        : "hover:bg-muted transition-colors"
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                {exercise.is_system_exercise ? "Cannot Edit System Exercise" : "Edit"}
                                                            </DropdownMenuItem>
                                                            {!exercise.is_system_exercise && (
                                                                <DropdownMenuItem
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    onClick={() => confirmDelete(exercise)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            )}
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
                                        <strong>{Math.min(currentPage * pageSize, sortedExercises.length)}</strong> of{" "}
                                        <strong>{sortedExercises.length}</strong> exercises
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white border shadow-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the exercise "{exerciseToDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="hover:bg-muted transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExercise} className="bg-red-600 hover:bg-red-700 transition-colors">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ExercisesList
