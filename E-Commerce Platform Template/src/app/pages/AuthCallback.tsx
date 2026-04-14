import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authService, getUserFromToken } from "../api/auth.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");

        if (code) {
            if (processedRef.current) {
                return;
            }
            processedRef.current = true;

            const handleSocialLogin = async () => {
                try {
                    const redirectUri = window.location.origin + window.location.pathname;
                    const response = await authService.socialLogin(code, redirectUri);

                    const user = getUserFromToken();
                    const roles: string[] = user?.roles || user?.realm_access?.roles || [];
                    if (response.role && !roles.includes(response.role)) {
                        roles.push(response.role);
                    }

                    window.dispatchEvent(new Event("auth-change"));
                    toast.success("Successfully logged in.");
                    if (roles.includes("ADMIN")) {
                        navigate("/admin", { replace: true });
                    } else {
                        navigate("/dashboard", { replace: true });
                    }
                } catch (error: any) {
                    console.error("Social login sync failed", error);
                    toast.error("Failed to sync account. Please try again or use standard login.");
                    navigate("/login", { replace: true });
                }
            };

            handleSocialLogin();
        } else {
            toast.error("No authentication code found.");
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin" />
            <h2 className="text-2xl font-semibold">Authenticating...</h2>
            <p className="text-gray-500">Please wait while we sync your account.</p>
        </div>
    );
}
