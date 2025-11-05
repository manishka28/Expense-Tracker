import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AddIncome({ isOpen, onClose, fetchIncome }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) {
      toast.warning("Please fill all required fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: userId }),
      });

      if (res.ok) {
        toast.success("Income added successfully!");
        setFormData({
          amount: "",
          source: "",
          note: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchIncome(); // ✅ instantly refresh
        onClose();
      } else {
        toast.error("Failed to add income");
      }
    } catch (err) {
      toast.error("Something went wrong!");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        theme === "dark" ? "bg-black/60" : "bg-gray-800/40"
      }`}
    >
      <div
        className={`w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl relative transition-all duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-br from-green-950 via-black to-green-900 border border-green-600/40 text-white"
            : "bg-white border border-green-200 text-gray-900"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Add Income</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              placeholder="e.g., Salary, Freelance, Investment"
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Optional note..."
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Add Income
          </button>
        </form>
      </div>
    </div>
  );
}
