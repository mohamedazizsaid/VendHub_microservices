import { useState } from "react";
import { Plus, MessageSquare, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { mockTickets } from "../../data/mockData";
import { formatDate } from "../../lib/utils";

export function Support() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Ticket created! (This is a demo)");
    setShowNewTicket(false);
    setFormData({ title: "", category: "general", priority: "medium", description: "" });
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info"> = {
      resolved: "success",
      in_progress: "warning",
      open: "info",
    };
    return variants[status] || "default";
  };

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, "danger" | "warning" | "info"> = {
      high: "danger",
      medium: "warning",
      low: "info",
    };
    return variants[priority] || "default";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Support Center</h1>
            <p className="text-gray-600 dark:text-gray-400">Get help with your orders and account</p>
          </div>
          <Button onClick={() => setShowNewTicket(!showNewTicket)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="delivery">Delivery</option>
                      <option value="refund">Refund Request</option>
                      <option value="account">Account</option>
                      <option value="technical">Technical Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Submit Ticket</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your tickets..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid gap-4">
          {mockTickets.map((ticket) => (
            <Card key={ticket.id} hover className="cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-900 dark:text-white">{ticket.title}</h3>
                      <Badge variant={getStatusVariant(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant={getPriorityVariant(ticket.priority)}>
                        {ticket.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>#{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.date)}</span>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{ticket.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Resources */}
        <div className="mt-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-6">Help Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Browse our comprehensive guides and tutorials
                </p>
                <Button variant="outline" size="sm">View Docs</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Chat with our support team in real-time
                </p>
                <Button variant="outline" size="sm">Start Chat</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white mb-2">FAQ</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Find answers to common questions
                </p>
                <Button variant="outline" size="sm">View FAQ</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
