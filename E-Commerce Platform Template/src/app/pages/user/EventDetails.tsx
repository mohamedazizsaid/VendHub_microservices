import { useParams, Link } from "react-router";
import { Calendar, MapPin, Users, Clock, Share2, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { mockEvents } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../lib/utils";
import { useState } from "react";

export function EventDetails() {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id) || mockEvents[0];
  const [selectedTicket, setSelectedTicket] = useState(event.tickets[0]);
  const similarEvents = mockEvents.filter((e) => e.id !== event.id && e.category === event.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <Badge variant="success" className="mb-3">{event.category}</Badge>
            <h1 className="text-4xl text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {event.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.location}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {event.description}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      123 Main Street, City Name, State 12345
                    </p>
                  </div>
                </div>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                    alt="Map"
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
                    "Keynote speeches from industry leaders",
                    "Interactive workshops and panel discussions",
                    "Networking opportunities with peers",
                    "Complimentary refreshments and meals",
                    "Access to exclusive event materials",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] text-sm shrink-0 mt-0.5">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent>
                <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Book Tickets</h2>
                
                {/* Ticket Types */}
                <div className="space-y-3 mb-6">
                  {event.tickets.map((ticket, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedTicket.type === ticket.type
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

                <Button className="w-full mb-4" size="lg" disabled={selectedTicket.available === 0}>
                  Book {selectedTicket.type}
                </Button>

                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Event Info */}
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendees</p>
                    <p className="text-gray-900 dark:text-white">
                      {event.attendees} / {event.maxAttendees} people going
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6B35]"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-6">Similar Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarEvents.map((evt) => (
                <Link key={evt.id} to={`/events/${evt.id}`}>
                  <Card hover>
                    <img src={evt.image} alt={evt.title} className="w-full h-48 object-cover rounded-t-xl" />
                    <CardContent className="pt-4">
                      <h3 className="text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{evt.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formatDate(evt.date)}</p>
                      <p className="text-xl text-[#FF6B35]">From {formatCurrency(evt.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
