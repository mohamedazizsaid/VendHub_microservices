import { Outlet } from "react-router";
import { Navbar } from "../components/shared/Navbar";
import { Footer } from "../components/shared/Footer";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#16213E]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
