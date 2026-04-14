import { MessageSquare, Users, MessageCircle, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { forumService, Forum, ForumMessage } from "../../api/forum.service";
import { formatDate } from "../../lib/utils";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

export function ForumsList() {
    const [forums, setForums] = useState<Forum[]>([]);
    const [messages, setMessages] = useState<ForumMessage[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
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
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const forumCards = useMemo(() => {
        return forums.map((forum) => {
            const forumMessages = messages.filter((msg) => Number(msg.forumId) === Number(forum.id));
            const membersSet = new Set(
                forumMessages
                    .map((msg) => Number(msg.iduser || msg.user?.id || 0))
                    .filter((value) => value > 0),
            );
            const latestMessage = forumMessages
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

            const titleLower = forum.title.toLowerCase();
            let category = "General";
            if (titleLower.includes("feedback")) category = "Feedback";
            else if (titleLower.includes("event")) category = "Events";
            else if (titleLower.includes("support") || titleLower.includes("help")) category = "Support";

            return {
                ...forum,
                topics: forumMessages.length,
                messages: forumMessages.length,
                members: membersSet.size,
                category,
                lastActivity: latestMessage?.createdAt ? formatDate(latestMessage.createdAt) : "No activity yet",
            };
        });
    }, [forums, messages]);

    const filteredForums = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return forumCards;
        return forumCards.filter((forum) =>
            forum.title.toLowerCase().includes(query)
            || forum.description.toLowerCase().includes(query)
            || forum.category.toLowerCase().includes(query),
        );
    }, [forumCards, search]);

    const totalUsers = useMemo(() => {
        const ids = new Set(
            messages
                .map((msg) => Number(msg.iduser || msg.user?.id || 0))
                .filter((value) => value > 0),
        );
        return ids.size;
    }, [messages]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F3460]/20 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Community Forums</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Join the discussion and connect with other community members.</p>
                </div>

                {/* Stats & Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="md:col-span-3">
                        <CardContent className="p-4 flex items-center space-x-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search forums, topics..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <Button onClick={() => setSearch(search.trim())}>Search</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#FF6B35]/10 rounded-lg text-[#FF6B35]">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                                    <p className="text-xl font-bold dark:text-white">{totalUsers}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Forums List */}
                <div className="space-y-6">
                    {loading ? (
                        <Card>
                            <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">
                                Loading forums...
                            </CardContent>
                        </Card>
                    ) : filteredForums.length === 0 ? (
                        <Card>
                            <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">
                                No forums match your search.
                            </CardContent>
                        </Card>
                    ) : filteredForums.map((forum) => (
                        <Link key={forum.id} to={`/forums/${forum.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer group mb-6">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-3 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-2xl text-white shadow-lg shadow-[#FF6B35]/20">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                                                        {forum.title}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                                                        {forum.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                                    {forum.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-8 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{forum.topics}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Topics</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{forum.messages}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Messages</p>
                                            </div>
                                            <div className="hidden lg:block text-right min-w-[120px]">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Last Activity</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{forum.lastActivity}</p>
                                            </div>
                                            <div className="text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 p-8 bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold dark:text-white">Become a Moderator</h4>
                            <p className="text-gray-500 dark:text-gray-400">Help us maintain a positive and helpful community.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="min-w-[160px]">Apply Now</Button>
                </div>
            </div>
        </div>
    );
}
