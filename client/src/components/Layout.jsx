import { useContext } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { theme } = useContext(ThemeContext);
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />; // Redirect if not logged in

  return (
    <div
      className={`flex min-h-screen overflow-x-hidden transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-green-900 to-black text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col md:ml-64 relative">
        <Navbar theme={theme} />
        <main
          className={`flex-1 p-8 overflow-y-auto h-[calc(100vh-5rem)] transition-colors duration-300 ${
            theme === "dark"
              ? "backdrop-blur-md bg-white/5 border-l border-green-500/20"
              : "bg-white border-l border-gray-300 shadow-sm"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
