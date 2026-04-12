import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Ban, Eye, Save } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../lib/utils";
import { authService, User } from "../../api/auth.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });

  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    statut: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => clearTimeout(timeout);
  }, [currentPage, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getUsers({
        page: currentPage - 1,
        size: pageSize,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter === "all" ? "ALL" : statusFilter.toUpperCase(),
      });

      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(Math.max(response.totalPages || 1, 1));
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      phone: user.phone || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
    setIsEditOpen(true);
  };

  const openDetailsDialog = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const requestDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete?.idKeycloak) return;

    try {
      await authService.deleteUser(userToDelete.idKeycloak);
      toast.success("User deleted successfully");

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.idKeycloak) return;

    try {
      await authService.updateUser(editingUser.idKeycloak, {
        email: editForm.email,
        phone: editForm.phone,
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
      });

      toast.success("User updated successfully");
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authService.register({
        username: addForm.username,
        email: addForm.email,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        phone: addForm.phone || undefined,
        password: addForm.password,
        statut: addForm.statut,
      });

      toast.success("User created successfully");
      setIsAddOpen(false);
      setAddForm({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
        statut: "ACTIVE",
      });
      fetchUsers();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.idKeycloak) return;

    const currentStatus = user.statut || "ACTIVE";
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await authService.updateUserStatus(user.idKeycloak, nextStatus);
      toast.success(`User status changed to ${nextStatus.toLowerCase()}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const from = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform users and their permissions</p>
        </div>
        <Button variant="outline" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1F4068] border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600 dark:text-gray-300">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600 dark:text-gray-300">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1F4068]">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center text-white mr-3 overflow-hidden">
                          <img
                              src={user.imageUrl}
                              className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role?.toUpperCase() === "ADMIN" ? "info" : "default"}>
                        {(user.role || "USER").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={(user.statut || "ACTIVE") === "ACTIVE" ? "success" : "danger"}>
                        {(user.statut || "ACTIVE").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      0
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatCurrency(0)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => openDetailsDialog(user)}
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => handleToggleStatus(user)}
                          title={(user.statut || "ACTIVE") === "ACTIVE" ? "Disable account" : "Enable account"}
                        >
                          <Ban className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => requestDelete(user)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {from} to {to} of {totalElements} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-semibold">Username:</span> {selectedUser.username}</p>
              <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
              <p><span className="font-semibold">Phone:</span> {selectedUser.phone || "-"}</p>
              <p><span className="font-semibold">Role:</span> {selectedUser.role || "USER"}</p>
              <p><span className="font-semibold">Status:</span> {(selectedUser.statut || "ACTIVE").toLowerCase()}</p>
              <p><span className="font-semibold">Joined:</span> {formatDate(selectedUser.createdAt)}</p>
              <p><span className="font-semibold">Keycloak ID:</span> {selectedUser.idKeycloak}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[560px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add New User</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleAddUser}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                <Input
                  id="username"
                  required
                  value={addForm.username}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="addFirstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                <Input
                  id="addFirstName"
                  required
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="addLastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                <Input
                  id="addLastName"
                  required
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addEmail" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="addEmail"
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="addPhone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                <Input
                  id="addPhone"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="addStatus" className="text-gray-700 dark:text-gray-300">Status</Label>
                <select
                  id="addStatus"
                  value={addForm.statut}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, statut: e.target.value as "ACTIVE" | "INACTIVE" }))}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#FF6B35] hover:bg-[#e85a24] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create user
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Edit User</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleEditSave}>
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
              <Input
                id="firstName"
                value={editForm.firstName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
              <Input
                id="lastName"
                value={editForm.lastName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#FF6B35] hover:bg-[#e85a24] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Delete this user?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action is permanent and will remove the user from Keycloak and your local database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
