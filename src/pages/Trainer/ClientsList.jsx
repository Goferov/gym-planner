import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getClients, deleteClient } from "../../api/axios"
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
import {
    MoreHorizontal,
    Search,
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    History,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseISO, formatDistanceToNow } from "date-fns"

function ClientsList() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [clientToDelete, setClientToDelete] = useState(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    // Sorting state
    const [sortColumn, setSortColumn] = useState("name")
    const [sortDirection, setSortDirection] = useState("asc")

    const navigate = useNavigate()

    useEffect(() => {
        fetchClients()
    }, [])

    async function fetchClients() {
        try {
            setLoading(true)
            const data = await getClients()
            setClients(data.data || [])
            setError(null)
        } catch (err) {
            console.error("Error fetching clients", err)
            setError("Failed to load clients. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteClient() {
        if (!clientToDelete) return

        try {
            await deleteClient(clientToDelete.id)
            setClients(clients.filter((client) => client.id !== clientToDelete.id))
            setDeleteDialogOpen(false)
            setClientToDelete(null)
        } catch (err) {
            console.error("Error deleting client", err)
            // You could add error handling UI here
        }
    }

    function confirmDelete(client) {
        setClientToDelete(client)
        setDeleteDialogOpen(true)
    }

    // Format relative time for display
    const formatRelativeTime = (dateString) => {
        if (!dateString) return "Never"
        try {
            return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
        } catch (e) {
            return "Unknown"
        }
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

    // Filter clients based on search term
    const filteredClients = clients.filter((client) => {
        return (
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    // Sort filtered clients
    const sortedClients = [...filteredClients].sort((a, b) => {
        if (sortColumn === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }

        if (sortColumn === "email") {
            return sortDirection === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
        }

        if (sortColumn === "phone") {
            const phoneA = a.phone || ""
            const phoneB = b.phone || ""
            return sortDirection === "asc" ? phoneA.localeCompare(phoneB) : phoneB.localeCompare(phoneA)
        }

        if (sortColumn === "last_login_at") {
            const dateA = a.last_login_at ? new Date(a.last_login_at) : new Date(0)
            const dateB = b.last_login_at ? new Date(b.last_login_at) : new Date(0)
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA
        }

        return 0
    })

    // Paginate sorted clients
    const paginatedClients = sortedClients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const totalPages = Math.ceil(sortedClients.length / pageSize)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground">Manage your clients. Add, edit, or remove client profiles.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Client List</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search clients..."
                                    className="pl-8 w-full sm:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => navigate("/trainer/clients/add")}
                                className="bg-teal-600 hover:bg-teal-700 transition-colors"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Client
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
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No clients match your search criteria" : "No clients found. Add your first client!"}
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
                                                onClick={() => handleSort("email")}
                                            >
                                                <div className="flex items-center">
                                                    Email
                                                    {sortColumn === "email" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("phone")}
                                            >
                                                <div className="flex items-center">
                                                    Phone
                                                    {sortColumn === "phone" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort("last_login_at")}
                                            >
                                                <div className="flex items-center">
                                                    Last Login
                                                    {sortColumn === "last_login_at" &&
                                                        (sortDirection === "asc" ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[150px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedClients.map((client) => (
                                            <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{client.name}</TableCell>
                                                <TableCell>{client.email}</TableCell>
                                                <TableCell>{client.phone || "-"}</TableCell>
                                                <TableCell>
                                                    {client.last_login_at ? formatRelativeTime(client.last_login_at) : "Never"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/trainer/clients/history/${client.id}`)}
                                                            className="h-8 text-xs"
                                                        >
                                                            <History className="h-3.5 w-3.5 mr-1" />
                                                            Plan History
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted transition-colors">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-white border shadow-md">
                                                                <DropdownMenuItem
                                                                    onClick={() => navigate(`/trainer/clients/add/${client.id}`)}
                                                                    className="hover:bg-muted transition-colors"
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    onClick={() => confirmDelete(client)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
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
                                        <strong>{Math.min(currentPage * pageSize, sortedClients.length)}</strong> of{" "}
                                        <strong>{sortedClients.length}</strong> clients
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
                            This will permanently delete the client "{clientToDelete?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="hover:bg-muted transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700 transition-colors">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ClientsList
