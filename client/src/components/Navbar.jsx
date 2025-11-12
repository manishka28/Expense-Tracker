import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  Bell,
  UserCircle,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { createPortal } from "react-dom";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoiceAssistant from "./VoiceAssistant.jsx";
import { useFetch } from "../context/FetchContext.jsx";

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const iconRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const { shouldFetch, setShouldFetch } = useFetch();


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
{/* Voice Assistant with Talking Animation */}
<div className="relative flex items-center justify-center group">
  {/* Pulsing Circle around Mic */}
  <div
    className="absolute w-10 h-10 rounded-full border-2 border-green-500/40 scale-100 opacity-0 group-hover:opacity-100 group-hover:animate-ping"
  ></div>

  {/* Voice Assistant Component */}
  <div className="relative z-10 flex items-center justify-center">
    <VoiceAssistant setShouldFetch={setShouldFetch} />
  </div>

  {/* Mouth Animation beside Mic */}
  <div
    className={`absolute left-10 flex gap-0.5 items-center opacity-0 group-hover:opacity-100 transition-all duration-500 ${
      theme === "dark" ? "text-green-300" : "text-green-700"
    }`}
  >
    <div className="w-1 h-2 rounded-full bg-current animate-mouth"></div>
    <div className="w-1 h-3 rounded-full bg-current animate-mouth delay-100"></div>
    <div className="w-1 h-2 rounded-full bg-current animate-mouth delay-200"></div>
  </div>
</div>



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
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                  onClick={handleProfile}
                >
                  <Settings size={16} /> Profile
                </button>
                <button
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-200 ${
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>,
              document.body
            )}
        </div>
      </header>

      {/* Toasts */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </>
  );
}
