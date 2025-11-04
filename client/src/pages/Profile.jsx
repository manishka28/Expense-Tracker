import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

export default function Profile() {
  const { theme } = useContext(ThemeContext);

  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [settings, setSettings] = useState({
    currency: "INR",
    theme: "light",
    notifications_enabled: true,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedSettings = JSON.parse(localStorage.getItem("settings"));

    if (storedUser) setUser(storedUser);
    if (storedSettings) setSettings(storedSettings);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    alert("Settings saved!");
  };

  return (
    <div
      className={`flex justify-center items-start p-8 min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-green-900 to-black text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-xl flex flex-col gap-6 transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gray-900/80 backdrop-blur-md"
            : "bg-white border border-gray-300"
        }`}
      >
        <h1 className="text-3xl font-bold text-center">Profile & Settings</h1>

        {/* User Info */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <span className="font-semibold w-28">Name:</span>
            <span>{user.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-28">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold w-28">Phone:</span>
            <span>{user.phone}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="mt-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Settings</h2>

          {/* Currency */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Currency:</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className={`px-2 py-1 rounded transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"
              }`}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Theme Display */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Theme:</label>
            <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Notifications:</label>
            <input
              type="checkbox"
              name="notifications_enabled"
              checked={settings.notifications_enabled}
              onChange={handleChange}
              className={`w-5 h-5 transition-colors duration-300 accent-green-500 ${
                theme === "light" ? "border-gray-500" : "border-gray-700"
              }`}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors duration-300 ${
              theme === "dark"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-green-400 hover:bg-green-500 text-gray-900"
            }`}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
