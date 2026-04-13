import { Search, Plus, Edit, Trash2, Users, Calendar, MapPin, Info, Save, Loader2, Star, MessageSquare, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { eventService, Event } from "../../api/event.service";
import { feedbackService, Feedback } from "../../api/feedback.service";
import { authService, User } from "../../api/auth.service";
import { formatDate } from "../../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Array<{ id: string; user: User | null }>>([]);
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<Event | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackUsersById, setFeedbackUsersById] = useState<Record<string, User | null>>({});
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | null>(null);
  const [isFeedbackDeleteDialogOpen, setIsFeedbackDeleteDialogOpen] = useState(false);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await eventService.deleteEvent(eventToDelete);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editingEvent.image) {
      toast.error("Please upload an image before saving");
      return;
    }

    try {
      const payload = {
        ...editingEvent,
        date: new Date(editingEvent.date!).toISOString(),
        capacity: Number(editingEvent.capacity),
        participant: editingEvent.participant || []
      };

      const eventId = editingEvent.id || (editingEvent as any)._id;
      if (eventId) {
        await eventService.updateEvent(eventId, payload as any);
        toast.success("Event updated successfully");
      } else {
        await eventService.createEvent(payload as any);
        toast.success("Event created successfully");
      }
      setIsDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Failed to save event");
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file || !editingEvent) return;

    try {
      setIsUploadingImage(true);
      const response = await eventService.uploadEventImage(file);
      setEditingEvent({ ...editingEvent, image: response.imageUrl });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const loadParticipants = async (event: Event) => {
    const participantIds = Array.isArray(event.participant) ? event.participant.filter(Boolean) : [];
    setSelectedEventForParticipants(event);
    setIsParticipantsDialogOpen(true);

    if (participantIds.length === 0) {
      setParticipants([]);
      return;
    }

    try {
      setIsParticipantsLoading(true);
      const usersResult = await Promise.allSettled(
        participantIds.map(async (participantId) => {
          const user = await authService.getUser(String(participantId));
          return { id: String(participantId), user };
        })
      );

      const mapped = usersResult.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return {
          id: String(participantIds[index]),
          user: null,
        };
      });

      setParticipants(mapped);
    } catch (error) {
      toast.error("Failed to load participants");
      setParticipants(participantIds.map((id) => ({ id: String(id), user: null })));
    } finally {
      setIsParticipantsLoading(false);
    }
  };

  const loadFeedbacks = async (event: Event) => {
    const eventId = event.id || (event as any)._id;
    if (!eventId) {
      toast.error("Event ID not found");
      return;
    }

    setSelectedEventForFeedback(event);
    setIsFeedbackDialogOpen(true);

    try {
      setIsFeedbackLoading(true);
      const data = await feedbackService.getFeedbacksByEventId(String(eventId));
      setFeedbacks(data);

      const uniqueUserIds = Array.from(new Set(data.map((entry) => String(entry.userId)).filter(Boolean)));
      if (uniqueUserIds.length === 0) {
        setFeedbackUsersById({});
        return;
      }
      const usersMap: Record<string, User | null> = {};

      // Feedback stores numeric user IDs; use the paginated users endpoint for reliable resolution.
      const usersPage = await authService.getUsers({ page: 0, size: 1000, search: "", role: "ALL", status: "ALL" });
      const usersByNumericId: Record<string, User> = {};
      (usersPage.content || []).forEach((user) => {
        usersByNumericId[String(user.id)] = user;
      });

      uniqueUserIds.forEach((userId) => {
        usersMap[userId] = usersByNumericId[userId] || null;
      });

      setFeedbackUsersById(usersMap);
    } catch (error) {
      toast.error("Failed to load feedbacks");
      setFeedbacks([]);
      setFeedbackUsersById({});
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete || !selectedEventForFeedback) return;

    try {
      setIsDeletingFeedback(true);
      await feedbackService.deleteFeedback(feedbackToDelete);
      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== feedbackToDelete));
      toast.success("Feedback deleted successfully");
    } catch (error) {
      toast.error("Failed to delete feedback");
    } finally {
      setIsDeletingFeedback(false);
      setIsFeedbackDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your organization's events and participants</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingEvent(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEvent({ name: "", description: "", image: "", capacity: 0, location: "", date: new Date().toISOString(), participant: [] })}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {(editingEvent?.id || (editingEvent as any)?._id) ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
                <Input
                  id="name"
                  value={editingEvent?.name || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  placeholder="Event name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={editingEvent?.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Event description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={editingEvent?.date ? (() => {
                      const d = new Date(editingEvent.date);
                      if (isNaN(d.getTime())) return "";
                      // Adjust for local timezone to prevent shifting
                      const offset = d.getTimezoneOffset() * 60000;
                      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
                    })() : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity" className="text-gray-700 dark:text-gray-300">Max Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={editingEvent?.capacity || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 100"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={editingEvent?.location || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder="Event location"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Event Image</Label>
                <div className="flex gap-4 items-start flex-wrap">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {editingEvent?.image && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                      <img src={editingEvent.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {isUploadingImage && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">Uploading image...</p>
                )}
                {editingEvent?.image && (
                  <p className="text-xs text-green-600 dark:text-green-400">Image uploaded and ready.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#FF6B35] hover:bg-[#e85a24] text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {(editingEvent?.id || (editingEvent as any)?._id) ? "Edit Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search events by name, location or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden border-none bg-white dark:bg-[#1F4068] shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                      <img
                        src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"}
                        alt={event.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{event.name}</h3>
                          <Badge variant="info" className="bg-[#FF6B35] text-white border-none">
                            {event.participant?.length || 0} / {event.capacity} Attendees
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                          {event.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 text-[#FF6B35]" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2 text-[#FF6B35]" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            const id = event.id || (event as any)._id;
                            if (id) handleDelete(id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() => loadParticipants(event)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Participants
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          onClick={() => loadFeedbacks(event)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-[#1F4068] rounded-xl shadow-inner">
              <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-300">No events found matching your search.</p>
              <Button
                variant="ghost"
                className="text-[#FF6B35] font-semibold mt-2 hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the event
              and remove all associated participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="sm:max-w-[680px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Participants {selectedEventForParticipants ? `- ${selectedEventForParticipants.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {isParticipantsLoading ? (
            <div className="py-12 flex items-center justify-center text-gray-600 dark:text-gray-300 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading participants...
            </div>
          ) : participants.length === 0 ? (
            <div className="py-12 text-center text-gray-600 dark:text-gray-300">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              No participants registered yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {participants.map((entry) => {
                const fullName = entry.user
                  ? `${entry.user.firstName || ""} ${entry.user.lastName || ""}`.trim() || entry.user.username
                  : "Unknown user";

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-[#16213E]/70"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {entry.user?.imageUrl ? (
                        <img
                          src={entry.user.imageUrl}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center">
                          <UserCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {entry.user?.email || `User ID: ${entry.id}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Registered</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[720px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Feedbacks {selectedEventForFeedback ? `- ${selectedEventForFeedback.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {isFeedbackLoading ? (
            <div className="py-12 flex items-center justify-center text-gray-600 dark:text-gray-300 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading feedbacks...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="py-12 text-center text-gray-600 dark:text-gray-300">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              No feedbacks for this event.
            </div>
          ) : (
            <div className="space-y-3 max-h-[430px] overflow-auto pr-1">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-[#16213E]/70"
                >
                  {(() => {
                    const user = feedbackUsersById[String(feedback.userId)] || null;
                    const fullName = user
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
                      : `User #${feedback.userId}`;

                    return (
                      <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center">
                          <UserCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {feedback.createdAt ? formatDate(feedback.createdAt) : "No date"}
                      </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <Star className="w-3.5 h-3.5" />
                        {feedback.rating}/5
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setFeedbackToDelete(feedback.id);
                          setIsFeedbackDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback.comment || "No comment"}</p>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isFeedbackDeleteDialogOpen} onOpenChange={setIsFeedbackDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Delete this feedback?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action is permanent. The feedback will be removed from this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFeedback}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              disabled={isDeletingFeedback}
            >
              {isDeletingFeedback ? "Deleting..." : "Delete Feedback"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
