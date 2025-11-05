import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  Bell,
  UserCircle,
  Moon,
  Sun,
  PlusCircle,
  Search,
} from "lucide-react";
import { createPortal } from "react-dom";
import { ThemeContext } from "../context/ThemeContext.jsx";
import AddExpense from "./AddExpense.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar({ setShouldFetch }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const iconRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // 🔹 Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <header
        className={`h-20 border-b shadow-lg flex items-center justify-between px-6 relative z-50 transition-colors duration-300 ${
          theme === "dark"
            ? "bg-green-900/30 border-green-500/30 text-white backdrop-blur-lg"
            : "bg-white border-gray-200 text-gray-900 backdrop-blur-sm"
        }`}
      >
        {/* Left - Search */}
        <div
          className={`flex items-center gap-2 w-full max-w-md rounded-lg px-3 py-1.5 border transition-all duration-300 ${
            theme === "dark"
              ? "bg-white/10 border-green-400/30"
              : "bg-gray-100 border-gray-300"
          }`}
        >
          <Search
            size={18}
            className={theme === "dark" ? "text-green-300" : "text-gray-500"}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className={`w-full bg-transparent placeholder-gray-400 text-sm focus:outline-none ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5 ml-6 relative">
          {/* Add Button */}
          <button
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-transform duration-200 ${
              theme === "dark"
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:scale-105"
                : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105"
            }`}
            onClick={() => setModalOpen(true)}
          >
            <PlusCircle size={16} /> Add
          </button>

          {/* Notification Icon */}
          <Bell
            className={`cursor-pointer transition-colors duration-300 ${
              theme === "dark"
                ? "hover:text-green-400"
                : "hover:text-green-600 text-gray-700"
            }`}
            size={22}
          />

          {/* Theme Toggle */}
          <button
            className={`p-1 rounded transition-colors duration-300 ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-200"
            }`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Icon */}
          <UserCircle
            ref={iconRef}
            className={`cursor-pointer transition-colors duration-300 ${
              theme === "dark"
                ? "hover:text-green-400"
                : "hover:text-green-600 text-gray-700"
            }`}
            size={26}
            onClick={() => setOpen(!open)}
          />

          {/* Dropdown Menu */}
          {open &&
            createPortal(
              <div
                ref={dropdownRef}
                className={`fixed rounded-lg shadow-lg py-2 z-50 backdrop-blur-md transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-900/90 text-gray-100 border border-green-800/40"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
                style={{
                  top: iconRef.current
                    ? iconRef.current.getBoundingClientRect().bottom + 5
                    : 100,
                  left: iconRef.current
                    ? iconRef.current.getBoundingClientRect().right - 192
                    : 0,
                  width: 192,
                }}
              >
                <button
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-200 ${
                    theme === "dark"
                      ? "hover:bg-white/10"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={handleProfile}
                >
                  <Settings size={16} /> Profile
                </button>
                <button
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-200 ${
                    theme === "dark"
                      ? "hover:bg-white/10"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>,
              document.body
            )}

          {/* Add Expense Modal */}
          <AddExpense
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            setShouldFetch={setShouldFetch}
          />
        </div>
      </header>

      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
