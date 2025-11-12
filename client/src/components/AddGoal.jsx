import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AddGoal({ isOpen, onClose, fetchGoals }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    deadline: new Date().toLocaleDateString('en-CA'),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target_amount) {
      toast.warning("Please fill all required fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: userId }),
      });

      if (res.ok) {
        toast.success("Goal added successfully!");
        setFormData({
          name: "",
          target_amount: "",
          deadline: new Date().toISOString().split("T")[0],
        });
        fetchGoals(); // ✅ instantly refresh goals list
        onClose();
      } else {
        toast.error("Failed to add goal");
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

        <h2 className="text-2xl font-bold mb-6 text-center">Add New Goal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Goal Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Buy a Car"
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Target Amount (₹)</label>
            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              required
              placeholder="e.g., 50000"
              className={`w-full p-2 rounded-lg border focus:outline-none ${
                theme === "dark"
                  ? "bg-green-950 border-green-700 text-white focus:ring-2 focus:ring-green-500"
                  : "bg-gray-50 border-gray-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
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
            Add Goal
          </button>
        </form>
      </div>
    </div>
  );
}
