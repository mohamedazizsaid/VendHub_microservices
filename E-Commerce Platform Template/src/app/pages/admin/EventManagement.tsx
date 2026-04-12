import { Search, Plus, Edit, Trash2, Users, Calendar, MapPin, Info, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { eventService, Event } from "../../api/event.service";
import { formatDate } from "../../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
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
                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Image URL</Label>
                <div className="flex gap-4 items-start">
                  <Input
                    id="image"
                    value={editingEvent?.image || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1"
                    required
                  />
                  {editingEvent?.image && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                      <img src={editingEvent.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
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
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Participants
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
    </div>
  );
}
