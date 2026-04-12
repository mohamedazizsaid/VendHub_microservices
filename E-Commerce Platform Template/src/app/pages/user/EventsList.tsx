import { Link } from "react-router";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { mockEvents } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../lib/utils";

export function EventsList() {
  const categories = ["All", "Technology", "Business", "Design", "Health", "Entertainment"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-4">Upcoming Events</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={cat === "All" ? "primary" : "outline"}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Featured Events */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Featured Events</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {mockEvents.filter((e) => e.featured).map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card hover className="overflow-hidden">
                  <div className="relative h-64">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="success" className="mb-2">{event.category}</Badge>
                      <h3 className="text-2xl text-white mb-2">{event.title}</h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.attendees} attending
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* All Events */}
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card hover className="h-full">
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute top-3 left-3 bg-white dark:bg-[#0F3460] px-3 py-2 rounded-lg text-center">
                      <p className="text-2xl text-[#FF6B35]">
                        {new Date(event.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                      </p>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <Badge variant="info" className="mb-2">{event.category}</Badge>
                    <h3 className="text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.time} • {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees} / {event.maxAttendees} attending
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xl text-[#FF6B35]">
                        From {formatCurrency(event.price)}
                      </span>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
