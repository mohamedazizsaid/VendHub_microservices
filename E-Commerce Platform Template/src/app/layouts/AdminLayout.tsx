import { Outlet } from "react-router";
import { AdminSidebar } from "../components/shared/AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#16213E]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
