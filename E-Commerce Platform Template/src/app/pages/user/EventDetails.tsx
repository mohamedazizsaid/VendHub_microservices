import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { Calendar, MapPin, Users, Clock, Heart, Loader2, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { eventService, Event } from "../../api/event.service";
import { authService, getUserFromToken } from "../../api/auth.service";
import { feedbackService } from "../../api/feedback.service";
import { formatCurrency, formatDate } from "../../lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

interface TicketOption {
  type: string;
  price: number;
  available: number;
}

const inferCategory = (event: Event): string => {
  const text = `${event.name} ${event.description}`.toLowerCase();
  if (text.includes("tech") || text.includes("ai") || text.includes("digital")) return "Technology";
  if (text.includes("business") || text.includes("startup") || text.includes("marketing")) return "Business";
  if (text.includes("design") || text.includes("creative")) return "Design";
  if (text.includes("health") || text.includes("wellness") || text.includes("fitness")) return "Health";
  if (text.includes("music") || text.includes("festival") || text.includes("entertainment")) return "Entertainment";
  return "General";
};

const buildTicketOptions = (event: Event): TicketOption[] => {
  const attendeeCount = event.participant?.length || 0;
  const capacity = Math.max(event.capacity || 0, attendeeCount);
  const remaining = Math.max(0, capacity - attendeeCount);

  const base = Math.max(49, Math.round((capacity || 120) * 0.65));
  const standardAvailable = Math.max(0, Math.floor(remaining * 0.6));
  const premiumAvailable = Math.max(0, Math.floor(remaining * 0.3));
  const vipAvailable = Math.max(0, remaining - standardAvailable - premiumAvailable);

  return [
    { type: "Standard", price: base, available: standardAvailable },
    { type: "Premium", price: Math.round(base * 1.45), available: premiumAvailable },
    { type: "VIP", price: Math.round(base * 2), available: vipAvailable },
  ];
};

export function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isFeedbackSaving, setIsFeedbackSaving] = useState(false);
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [resolvedFeedbackUserId, setResolvedFeedbackUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [current, all] = await Promise.all([
          eventService.getEventById(id),
          eventService.getAllEvents(),
        ]);
        setEvent(current);
        setEvents(all);
      } catch (error: any) {
        toast.error(error.message || "Failed to load event details");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  const tickets = useMemo(() => (event ? buildTicketOptions(event) : []), [event]);
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(null);

  useEffect(() => {
    setSelectedTicket(tickets[0] || null);
  }, [tickets]);

  const similarEvents = useMemo(() => {
    if (!event) return [];
    const category = inferCategory(event);
    return events
      .filter((candidate) => (candidate.id || candidate._id) !== (event.id || event._id))
      .filter((candidate) => inferCategory(candidate) === category)
      .slice(0, 3);
  }, [events, event]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading event details...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Event not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This event may have been removed or is unavailable.</p>
            <Link to="/events">
              <Button>Back to Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attendeeCount = event.participant?.length || 0;
  const attendanceRate = event.capacity > 0 ? Math.min(100, (attendeeCount / event.capacity) * 100) : 0;
  const eventDate = new Date(event.date);
  const currentUser = getUserFromToken();
  const currentUserId = currentUser?.sub ? String(currentUser.sub) : "";
  const isRegistered = !!currentUserId && event.participant.includes(currentUserId);

  const handleBookTicket = async () => {
    if (!event.id && !event._id) return;

    if (!currentUserId) {
      toast.error("Please login to register for this event");
      return;
    }

    if (isRegistered) {
      toast.info("You are already registered for this event");
      return;
    }

    try {
      setIsBooking(true);
      const eventId = event.id || event._id || "";
      const updated = await eventService.register(eventId, currentUserId);
      setEvent(updated);
      setEvents((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      toast.success(`Registration confirmed for ${selectedTicket?.type || "ticket"}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to register for this event");
    } finally {
      setIsBooking(false);
    }
  };

  const resolveFeedbackUserId = async (): Promise<number | null> => {
    if (!currentUserId) return null;

    if (/^\d+$/.test(currentUserId)) {
      return Number(currentUserId);
    }

    try {
      const profile = await authService.getUser(currentUserId);
      return typeof profile?.id === "number" ? profile.id : null;
    } catch {
      return null;
    }
  };

  const handleOpenFeedbackDialog = async () => {
    const eventId = event.id || event._id;
    if (!eventId) return;

    if (!currentUserId) {
      toast.error("Please login to leave feedback");
      return;
    }

    setIsFeedbackDialogOpen(true);
    setIsFeedbackLoading(true);

    try {
      const numericUserId = await resolveFeedbackUserId();
      if (!numericUserId) {
        toast.error("Unable to identify your profile for feedback");
        setIsFeedbackDialogOpen(false);
        return;
      }

      setResolvedFeedbackUserId(numericUserId);

      const eventFeedbacks = await feedbackService.getFeedbacksByEventId(eventId);
      const myFeedback = eventFeedbacks.find((entry) => Number(entry.userId) === numericUserId);

      if (myFeedback) {
        setFeedbackId(myFeedback.id);
        setFeedbackRating(Math.min(5, Math.max(1, myFeedback.rating || 1)));
        setFeedbackComment(myFeedback.comment || "");
      } else {
        setFeedbackId(null);
        setFeedbackRating(5);
        setFeedbackComment("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load feedback data");
      setIsFeedbackDialogOpen(false);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleSaveFeedback = async () => {
    const eventId = event.id || event._id;
    if (!eventId || !resolvedFeedbackUserId) return;

    if (!feedbackComment.trim()) {
      toast.error("Please write a short feedback comment");
      return;
    }

    const payload = {
      eventId,
      userId: resolvedFeedbackUserId,
      rating: feedbackRating,
      comment: feedbackComment.trim(),
    };

    try {
      setIsFeedbackSaving(true);

      if (feedbackId) {
        await feedbackService.updateFeedback(feedbackId, payload);
        toast.success("Feedback updated successfully");
      } else {
        const created = await feedbackService.createFeedback(payload);
        setFeedbackId(created.id);
        toast.success("Feedback submitted successfully");
      }

      setIsFeedbackDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save feedback");
    } finally {
      setIsFeedbackSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <Badge variant="success" className="mb-3">{inferCategory(event)}</Badge>
            <h1 className="text-4xl text-white mb-4">{event.name}</h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.location}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description || "No description provided yet."}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Join this exclusive experience and connect with a highly engaged community. This page is now powered by live event data and updates instantly from the backend.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-[#FF6B35] mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white mb-1">{event.location}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Venue details and access instructions are shared after booking confirmation.</p>
                  </div>
                </div>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200"
                    alt="Event location"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Curated sessions and high-value interactions",
                    "Premium networking and hands-on exchange",
                    "Actionable insights and practical takeaways",
                    "Smooth on-site experience and guided support",
                    "Post-event resources for attendees",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] text-sm shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardContent>
                <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Book Tickets</h2>

                <div className="space-y-3 mb-6">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.type}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedTicket?.type === ticket.type
                          ? "border-[#FF6B35] bg-[#FF6B35]/5"
                          : "border-gray-300 dark:border-gray-600 hover:border-[#FF6B35]/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-gray-900 dark:text-white">{ticket.type}</p>
                          <p className="text-2xl text-[#FF6B35]">{formatCurrency(ticket.price)}</p>
                        </div>
                        {ticket.available > 0 ? (
                          <Badge variant="success">{ticket.available} left</Badge>
                        ) : (
                          <Badge variant="danger">Sold Out</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mb-4"
                  size="lg"
                  disabled={!selectedTicket || selectedTicket.available === 0 || isRegistered || isBooking}
                  onClick={handleBookTicket}
                >
                  {isBooking
                    ? "Registering..."
                    : isRegistered
                      ? "Already Registered"
                      : selectedTicket
                        ? `Book ${selectedTicket.type}`
                        : "Book Ticket"}
                </Button>

                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="flex-1" onClick={() => toast.success("Saved to your list") }>
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleOpenFeedbackDialog}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Feedback
                  </Button>
                </div>

                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendees</p>
                    <p className="text-gray-900 dark:text-white">{attendeeCount} / {event.capacity || "-"} people going</p>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B35]" style={{ width: `${attendanceRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {similarEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-6">Similar Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarEvents.map((evt) => (
                <Link key={evt.id || evt._id} to={`/events/${evt.id || evt._id}`}>
                  <Card hover>
                    <img src={evt.image} alt={evt.name} className="w-full h-48 object-cover rounded-t-xl" />
                    <CardContent className="pt-4">
                      <h3 className="text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{evt.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formatDate(evt.date)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{evt.location}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[560px] bg-white dark:bg-[#1B1B2F] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {feedbackId ? "Update Your Feedback" : "Leave Feedback"}
            </DialogTitle>
          </DialogHeader>

          {isFeedbackLoading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading your feedback...
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedbackRating(value)}
                      className={`w-10 h-10 rounded-lg border transition-colors flex items-center justify-center ${
                        value <= feedbackRating
                          ? "bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
                          : "bg-white border-gray-200 text-gray-400 hover:border-amber-300 dark:bg-[#16213E] dark:border-gray-700 dark:text-gray-500"
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your comment</p>
                <Textarea
                  rows={5}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience about this event..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)} disabled={isFeedbackSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFeedback}
                  disabled={isFeedbackSaving || !feedbackComment.trim()}
                  className="bg-[#FF6B35] hover:bg-[#e85a24] text-white"
                >
                  {isFeedbackSaving ? "Saving..." : feedbackId ? "Update Feedback" : "Submit Feedback"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
