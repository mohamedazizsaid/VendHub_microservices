import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { authService } from "../../api/auth.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Calendar, label: "Events", path: "/admin/events" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      toast.success("Logged out from admin panel");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("faceIdUser");
      navigate("/login");
    }
  };

  return (
    <aside
      className={cn(
        "bg-white dark:bg-[#1A1A2E] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">A</span>
            </div>
            <span className="text-lg text-[#2C3E50] dark:text-white">Admin</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition-colors group",
                    isActive
                      ? "bg-[#FF6B35] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-lg transition-colors group text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* User Info (Shown only when not collapsed) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center text-white">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@eventshop.com</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
