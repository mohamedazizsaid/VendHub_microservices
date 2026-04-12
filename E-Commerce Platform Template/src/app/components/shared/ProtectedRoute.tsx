import { Navigate, Outlet } from "react-router";
import { getUserFromToken } from "../../api/auth.service";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const user = getUserFromToken();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const userRoles = user?.roles || user?.realm_access?.roles || [];
        const hasPermission = allowedRoles.some(role => userRoles.includes(role));

        if (!hasPermission) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
}
