import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Home, Wallet, BarChart, Target, Settings, Menu, X, LogOut } from "lucide-react";
import Logo from "../assets/images/BahiKhata.png";
import { ThemeContext } from "../context/ThemeContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/expenses", label: "Expenses", icon: <Wallet size={18} /> },
  { to: "/income", label: "Income", icon: <BarChart size={18} /> },
  { to: "/goals", label: "Goals", icon: <Target size={18} /> },
  { to: "/reports", label: "Reports", icon: <BarChart size={18} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const { theme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden p-3 fixed top-4 left-4 z-50 rounded-md shadow-lg transition-colors duration-300 ${
          theme === "dark" ? "bg-green-600 text-white" : "bg-green-200 text-gray-900"
        }`}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 flex flex-col justify-between shadow-xl z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          theme === "dark"
            ? "bg-gradient-to-b from-green-950 via-green-900 to-black/90 border-r border-green-500/30 text-white"
            : "bg-white border-r border-gray-300 text-gray-900"
        }`}
      >
        {/* Logo */}
        <div className="flex justify-center mt-8 mb-8">
          <img src={Logo} alt="Logo" className="w-24 h-24 object-contain drop-shadow-lg" />
        </div>

        {/* Links */}
        <nav className="space-y-2 px-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg transition-colors duration-300 ${
                  isActive
                    ? theme === "dark"
                      ? "bg-green-500/30 font-semibold text-green-300"
                      : "bg-green-300 font-semibold text-green-900"
                    : theme === "dark"
                    ? "hover:bg-green-500/20 text-gray-300"
                    : "hover:bg-green-200 text-gray-700"
                }`
              }
              onClick={() => setOpen(false)}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          className={`p-4 border-t flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors duration-300 ${
            theme === "dark"
              ? "border-green-500/20 text-gray-400 hover:text-green-300"
              : "border-gray-300 text-gray-700 hover:text-green-900"
          }`}
        >
          <LogOut size={16} /> Logout
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)}></div>}
    </>
  );
}
