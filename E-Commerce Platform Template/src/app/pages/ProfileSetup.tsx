import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Camera, Loader2, Upload, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { authService } from "../api/auth.service";
import { toast } from "sonner";

export default function ProfileSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    if (!userId) {
        navigate("/login");
        return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select an image first");
            return;
        }

        setLoading(true);
        try {
            await authService.updateProfileImage(userId, selectedFile);
            toast.success("Profile picture updated!");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-950">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-[#1A1A2E]">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-[#00D4FF] to-[#FF6B35] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#FF6B35]/20">
                        <Camera className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold dark:text-white">Profile Setup</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Show the world who you are! Upload a profile photo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 dark:border-white/10 shadow-xl bg-gray-50 dark:bg-black/20">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Upload className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-2 right-2 p-3 bg-[#FF6B35] hover:bg-[#ff8c5a] text-white rounded-full cursor-pointer shadow-lg transition-all scale-100 group-hover:scale-110"
                            >
                                <Camera className="w-5 h-5" />
                                <input
                                    id="profile-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button
                            className="w-full h-12 text-lg font-semibold bg-[#FF6B35] hover:bg-[#ff8c5a] text-white rounded-xl shadow-lg"
                            disabled={loading || !selectedFile}
                            onClick={handleUpload}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Save and Continue"
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            onClick={() => navigate("/login")}
                        >
                            Skip for now <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
