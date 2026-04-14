import { useParams, Link } from "react-router";
import { MessageSquare, ArrowLeft, Send, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { forumService, Forum, ForumMessage } from "../../api/forum.service";
import { authService, getUserFromToken } from "../../api/auth.service";
import { formatDate } from "../../lib/utils";
import { toast } from "sonner";

export function ForumDiscussion() {
    const { id } = useParams();
    const [replyText, setReplyText] = useState("");
    const [forum, setForum] = useState<Forum | null>(null);
    const [messages, setMessages] = useState<ForumMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const forumId = Number(id || 0);
    const currentUser = getUserFromToken();
    const currentUserId = currentUser?.sub ? String(currentUser.sub) : "";
    const currentUserName = currentUser?.preferred_username || currentUser?.name || "You";

    useEffect(() => {
        const loadDiscussion = async () => {
            if (!forumId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [forumData, forumMessages] = await Promise.all([
                    forumService.getForumById(forumId),
                    forumService.getForumMessages(forumId),
                ]);
                setForum(forumData);
                setMessages(forumMessages);
            } catch (error: any) {
                toast.error(error.message || "Failed to load forum discussion");
                setForum(null);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        loadDiscussion();
    }, [forumId]);

    const membersCount = useMemo(() => {
        const ids = new Set(
            messages
                .map((message) => Number(message.iduser || message.user?.id || 0))
                .filter((value) => value > 0),
        );
        return ids.size;
    }, [messages]);

    const resolveNumericUserId = async (): Promise<number | null> => {
        if (!currentUserId) return null;
        if (/^\d+$/.test(currentUserId)) {
            return Number(currentUserId);
        }
        try {
            const profile = await authService.getUser(currentUserId);
            return typeof profile.id === "number" ? profile.id : null;
        } catch {
            return null;
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        if (!forumId) return;

        if (!currentUserId) {
            toast.error("Please login to post a message");
            return;
        }

        try {
            setIsSending(true);
            const numericUserId = await resolveNumericUserId();
            await forumService.sendMessage(forumId, {
                content: replyText.trim(),
                author: currentUserName,
                iduser: numericUserId || undefined,
            });

            const refreshed = await forumService.getForumMessages(forumId);
            setMessages(refreshed);
            setReplyText("");
            toast.success("Message posted");
        } catch (error: any) {
            toast.error(error.message || "Failed to post message");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F3460]/20 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <Card>
                        <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">Loading forum discussion...</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0F3460]/20 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <Link to="/forums" className="inline-flex items-center text-[#FF6B35] hover:underline mb-6 group">
                        <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Forums
                    </Link>
                    <Card>
                        <CardContent className="p-10 text-center text-gray-600 dark:text-gray-400">Forum not found.</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F3460]/20 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Navigation Back */}
                <Link to="/forums" className="inline-flex items-center text-[#FF6B35] hover:underline mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Forums
                </Link>

                {/* Forum Header */}
                <Card className="mb-8 border-none shadow-md bg-white dark:bg-[#1A1A2E]">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start space-x-5">
                                <div className="p-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-2xl text-white shadow-lg shadow-[#FF6B35]/20">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h1 className="text-3xl font-bold dark:text-white">{forum.title}</h1>
                                        <Badge variant="outline" className="text-sm border-[#FF6B35] text-[#FF6B35] uppercase">
                                            Forum
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                                        {forum.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 bg-gray-50 dark:bg-[#0F3460]/40 p-4 rounded-2xl">
                                <div className="text-center">
                                    <p className="text-xl font-bold dark:text-white">{membersCount}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Members</p>
                                </div>
                                <div className="w-[1px] h-10 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-xl font-bold dark:text-white">{messages.length}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Messages</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Discussion Thread */}
                <div className="space-y-6 mb-8">
                    {messages.map((message) => (
                        <div key={message.id} className="space-y-4">
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                        {message.user?.imageUrl ? (
                                            <img
                                                src={message.user.imageUrl}
                                                alt={message.user.username || message.author || "User"}
                                                className="w-12 h-12 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
                                                {(message.user?.username || message.author || "U").slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-gray-900 dark:text-white">{message.user?.username || message.author || "Unknown"}</span>
                                                    {String(message.user?.role || "").toUpperCase() === "ADMIN" && (
                                                        <Badge variant="success" className="text-[10px] h-5">MODERATOR</Badge>
                                                    )}
                                                    <span className="text-sm text-gray-500">{message.createdAt ? formatDate(message.createdAt) : "Just now"}</span>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                                                {message.content}
                                            </p>
                                            <div className="flex items-center space-x-6">
                                                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>Like</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>Reply</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                    <span>Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Reply Section */}
                <Card className="sticky bottom-8 border-none shadow-2xl bg-white dark:bg-[#1A1A2E] overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold shrink-0">
                                ME
                            </div>
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="Write your message..."
                                    className="pr-20 py-6 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={isSending || !replyText.trim()}
                                        className="h-10 w-10 p-0 rounded-lg bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                                    >
                                        {isSending ? <MessageCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    </Button>
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg">
                                        <Flag className="w-5 h-5 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
