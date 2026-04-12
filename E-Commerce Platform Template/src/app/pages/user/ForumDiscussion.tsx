import { useParams, Link } from "react-router";
import { MessageSquare, ArrowLeft, Send, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useState } from "react";

export function ForumDiscussion() {
    const { id } = useParams();
    const [replyText, setReplyText] = useState("");

    // Mock forum data (in a real app, this would come from an API or shared state)
    const forum = {
        id: id,
        title: "Product Feedback",
        category: "Feedback",
        description: "Share your thoughts on our latest products and help us improve.",
        participants: 1245,
        messagesCount: 5674
    };

    const [messages, setMessages] = useState([
        {
            id: 1,
            author: "Alex Johnson",
            role: "Member",
            avatar: "AJ",
            content: "I've been using the new wireless headphones for a week now. The noise cancellation is impressive, but I feel the touch controls could be more responsive.",
            timestamp: "2 hours ago",
            likes: 12,
            replies: []
        },
        {
            id: 2,
            author: "Sarah Smith",
            role: "Moderator",
            avatar: "SS",
            content: "Thanks for the feedback, Alex! We're actually working on a firmware update that should address the touch control sensitivity. Stay tuned!",
            timestamp: "1 hour ago",
            likes: 45,
            replies: [
                {
                    id: 3,
                    author: "Alex Johnson",
                    content: "That's great news! When can we expect the update?",
                    timestamp: "45 minutes ago"
                }
            ]
        },
        {
            id: 4,
            author: "Mike Rodriguez",
            role: "Member",
            avatar: "MR",
            content: "Personally, I love the battery life. I managed to get through a whole 12-hour flight and still had 40% battery left. Amazing work guys!",
            timestamp: "30 minutes ago",
            likes: 8,
            replies: []
        }
    ]);

    const handleSendReply = () => {
        if (!replyText.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            author: "You",
            role: "Member",
            avatar: "ME",
            content: replyText,
            timestamp: "Just now",
            likes: 0,
            replies: []
        };

        setMessages([...messages, newMessage]);
        setReplyText("");
    };

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
                                        <Badge variant="outline" className="text-sm border-[#FF6B35] text-[#FF6B35]">
                                            {forum.category}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                                        {forum.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 bg-gray-50 dark:bg-[#0F3460]/40 p-4 rounded-2xl">
                                <div className="text-center">
                                    <p className="text-xl font-bold dark:text-white">1.2k</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Members</p>
                                </div>
                                <div className="w-[1px] h-10 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-xl font-bold dark:text-white">5.6k</p>
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
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
                                            {message.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-gray-900 dark:text-white">{message.author}</span>
                                                    {message.role === "Moderator" && (
                                                        <Badge variant="success" className="text-[10px] h-5">MODERATOR</Badge>
                                                    )}
                                                    <span className="text-sm text-gray-500">{message.timestamp}</span>
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
                                                    <span>{message.likes} Likes</span>
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

                            {/* Nested Replies */}
                            {message.replies.map((reply) => (
                                <div key={reply.id} className="ml-16">
                                    <Card className="border-none bg-gray-50/50 dark:bg-[#1A1A2E]/50 shadow-sm">
                                        <CardContent className="p-4 flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                                                {reply.author.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-bold text-sm dark:text-white">{reply.author}</span>
                                                    <span className="text-[10px] text-gray-500">{reply.timestamp}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{reply.content}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    <Button
                                        onClick={handleSendReply}
                                        className="h-10 w-10 p-0 rounded-lg bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                                    >
                                        <Send className="w-5 h-5" />
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
