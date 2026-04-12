import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, MapPin, Search, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../lib/utils";
import { Event, eventService } from "../../api/event.service";
import { toast } from "sonner";

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(sorted);
      } catch (error: any) {
        toast.error(error.message || "Failed to load events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const inferCategory = (event: Event): string => {
    const text = `${event.name} ${event.description}`.toLowerCase();
    if (text.includes("tech") || text.includes("ai") || text.includes("digital")) return "Technology";
    if (text.includes("business") || text.includes("startup") || text.includes("marketing")) return "Business";
    if (text.includes("design") || text.includes("creative")) return "Design";
    if (text.includes("health") || text.includes("wellness") || text.includes("fitness")) return "Health";
    if (text.includes("music") || text.includes("festival") || text.includes("entertainment")) return "Entertainment";
    return "General";
  };

  const featuredEvents = useMemo(
    () => [...events].sort((a, b) => (b.participant?.length || 0) - (a.participant?.length || 0)).slice(0, 2),
    [events]
  );

  const categories = useMemo(() => {
    const values = new Set(events.map((event) => inferCategory(event)));
    return ["All", ...Array.from(values)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const category = inferCategory(event);
      const byCategory = selectedCategory === "All" || category === selectedCategory;
      const bySearch = !query
        || event.name.toLowerCase().includes(query)
        || event.description.toLowerCase().includes(query)
        || event.location.toLowerCase().includes(query);
      return byCategory && bySearch;
    });
  }, [events, searchQuery, selectedCategory]);

  const getEventDateParts = (dateValue: string) => {
    const date = new Date(dateValue);
    return {
      day: Number.isNaN(date.getTime()) ? "--" : date.getDate(),
      month: Number.isNaN(date.getTime())
        ? "---"
        : date.toLocaleString("en-US", { month: "short" }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] p-6 text-white">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-4">Upcoming Events</h1>
          <p className="text-white/80 mb-4">Discover experiences curated from live event data.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={cat === selectedCategory ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-700 dark:text-gray-300 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading events...</span>
          </div>
        ) : (
          <>
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Featured Events</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {featuredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id || event._id}`}>
                <Card hover className="overflow-hidden">
                  <div className="relative h-64">
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="success" className="mb-2">{inferCategory(event)}</Badge>
                      <h3 className="text-2xl text-white mb-2">{event.name}</h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participant?.length || 0} attending
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {featuredEvents.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No featured events available right now.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">All Events ({filteredEvents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const dateParts = getEventDateParts(event.date);
              return (
              <Link key={event.id} to={`/events/${event.id || event._id}`}>
                <Card hover className="h-full">
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute top-3 left-3 bg-white dark:bg-[#0F3460] px-3 py-2 rounded-lg text-center">
                      <p className="text-2xl text-[#FF6B35]">{dateParts.day}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{dateParts.month}</p>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <Badge variant="info" className="mb-2">{inferCategory(event)}</Badge>
                    <h3 className="text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {event.participant?.length || 0} / {event.capacity || 0} attending
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {event.capacity > 0 ? `${Math.max(0, event.capacity - (event.participant?.length || 0))} spots left` : "Open event"}
                      </span>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )})}
            {filteredEvents.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No events match your search and category filters.</p>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
