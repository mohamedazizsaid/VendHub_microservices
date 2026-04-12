import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, MessageSquare, Loader2, UserCircle2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
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
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { forumService, Forum, ForumMessage } from "../../api/forum.service";
import { formatDate } from "../../lib/utils";
import { toast } from "sonner";

export function ForumManagement() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForum, setEditingForum] = useState<Partial<Forum> | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [forumToDelete, setForumToDelete] = useState<number | null>(null);

  const [isMessagesDialogOpen, setIsMessagesDialogOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  useEffect(() => {
    loadForumsData();
  }, []);

  const loadForumsData = async () => {
    try {
      setIsLoading(true);
      const [forumsData, messagesData] = await Promise.all([
        forumService.getForums(),
        forumService.getMessagesWithUsers(),
      ]);
      setForums(forumsData);
      setMessages(messagesData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load forums");
      setForums([]);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredForums = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return forums;

    return forums.filter((forum) =>
      forum.title.toLowerCase().includes(query)
      || forum.description.toLowerCase().includes(query),
    );
  }, [forums, searchQuery]);

  const getForumMessages = (forumId: number | undefined) => {
    return messages
      .filter((message) => Number(message.forumId) === Number(forumId || 0))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  };

  const handleSaveForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForum?.title?.trim() || !editingForum?.description?.trim()) {
      toast.error("Please provide title and description");
      return;
    }

    try {
      if (editingForum.id) {
        await forumService.updateForum(editingForum.id, {
          title: editingForum.title.trim(),
          description: editingForum.description.trim(),
        });
        toast.success("Forum updated successfully");
      } else {
        await forumService.createForum({
          title: editingForum.title.trim(),
          description: editingForum.description.trim(),
        });
        toast.success("Forum created successfully");
      }

      setIsDialogOpen(false);
      setEditingForum(null);
      await loadForumsData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save forum");
    }
  };

  const handleDeleteForum = (forumId: number | undefined) => {
    if (!forumId) return;
    setForumToDelete(forumId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteForum = async () => {
    if (!forumToDelete) return;

    try {
      await forumService.deleteForum(forumToDelete);
      toast.success("Forum deleted successfully");
      await loadForumsData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete forum");
    } finally {
      setIsDeleteDialogOpen(false);
      setForumToDelete(null);
    }
  };

  const openMessagesDialog = async (forum: Forum) => {
    setSelectedForum(forum);
    setIsMessagesDialogOpen(true);

    try {
      setIsMessagesLoading(true);
      const latestMessages = await forumService.getMessagesWithUsers();
      setMessages(latestMessages);
    } catch {
      toast.error("Failed to load forum messages");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] text-white shadow-lg">
        <h1 className="text-3xl mb-2">Forum Management</h1>
        <p className="text-white/80">Create, moderate and monitor community discussions.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search forums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingForum({ title: "", description: "" })}>
              <Plus className="w-4 h-4 mr-2" />
              New Forum
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle>{editingForum?.id ? "Edit Forum" : "Create Forum"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveForum} className="space-y-4 mt-2">
              <div className="grid gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Title</label>
                <Input
                  value={editingForum?.title || ""}
                  onChange={(e) => setEditingForum((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Forum title"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Description</label>
                <Textarea
                  value={editingForum?.description || ""}
                  onChange={(e) => setEditingForum((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Forum description"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#FF6B35] hover:bg-[#e85a24] text-white">
                  {editingForum?.id ? "Update Forum" : "Create Forum"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading forums...
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {filteredForums.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">No forums found.</CardContent>
            </Card>
          ) : filteredForums.map((forum) => {
            const forumMessages = getForumMessages(forum.id);
            return (
              <Card key={forum.id} className="bg-white dark:bg-[#1F4068] border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <h3 className="text-2xl text-gray-900 dark:text-white mb-1">{forum.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{forum.description}</p>
                      <Badge variant="info">{forumMessages.length} messages</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => {
                          setEditingForum(forum);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteForum(forum.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openMessagesDialog(forum)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Messages
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isMessagesDialogOpen} onOpenChange={setIsMessagesDialogOpen}>
        <DialogContent className="sm:max-w-[760px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>
              Messages {selectedForum ? `- ${selectedForum.title}` : ""}
            </DialogTitle>
          </DialogHeader>

          {isMessagesLoading ? (
            <div className="py-10 text-center text-gray-600 dark:text-gray-400">Loading messages...</div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-auto pr-1">
              {getForumMessages(selectedForum?.id).length === 0 ? (
                <div className="py-10 text-center text-gray-600 dark:text-gray-400">No messages in this forum yet.</div>
              ) : getForumMessages(selectedForum?.id).map((message) => {
                const senderName = message.user?.username || message.author || `User #${message.iduser || "-"}`;
                return (
                  <div key={message.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-[#16213E]/70">
                    <div className="flex items-center gap-3 mb-2">
                      {message.user?.imageUrl ? (
                        <img
                          src={message.user.imageUrl}
                          alt={senderName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center">
                          <UserCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{senderName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {message.createdAt ? formatDate(message.createdAt) : "No date"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this forum?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The forum and its linked messages may be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteForum} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Forum
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
