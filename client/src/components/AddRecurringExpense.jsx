import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext.jsx";

export default function AddRecurringExpense({ isOpen, onClose, setShouldFetch }) {
  const { theme } = useContext(ThemeContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  const { user } = useAuth();
  const userId = user?.userId;

  // 🔹 Fetch categories
  useEffect(() => {
    if (!isOpen || !userId) return;
    axios
      .get(`http://localhost:3000/api/categories/${userId}`)
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error("Failed to fetch categories"));
  }, [isOpen, userId]);

  // 🔹 Submit recurring expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in.");
      return;
    }

    if (!name || !amount || !startDate) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/recurring-expenses", {
        user_id: userId,
        name,
        amount,
        category_id: selectedCategory || null,
        start_date: startDate,
        frequency,
      });

      toast.success("Recurring expense added successfully!");
      setShouldFetch(true);
      onClose();

      // Reset form
      setName("");
      setAmount("");
      setSelectedCategory("");
      setStartDate("");
      setFrequency("monthly");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add recurring expense.");
    }
  };

  if (!isOpen) return null;

  // 🎨 Theming
  const modalBg =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-900 to-black text-gray-100"
      : "bg-white text-gray-900";
  const inputBg =
    theme === "dark"
      ? "bg-gray-800 text-gray-100 border-gray-700"
      : "bg-white text-gray-900 border-gray-300";

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`relative w-96 p-6 rounded-2xl shadow-2xl transition-all duration-300 ${modalBg}`}
      >
        {/* Close button */}
        <button
          className={`absolute top-3 right-3 ${
            theme === "dark"
              ? "text-gray-300 hover:text-white"
              : "text-gray-500 hover:text-gray-800"
          }`}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Add Recurring Expense
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Expense Name */}
          <input
            type="text"
            placeholder="Expense Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
            required
          />

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
            required
          />

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
          >
            <option value="">Select Category (optional)</option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name} {cat.user_id === null ? "(Global)" : ""}
                </option>
              ))}
          </select>

{/* Start Date */}
<label className="text-sm font-medium mt-2">Start Date</label>
<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  max={new Date().toISOString().split("T")[0]} // Prevent future dates
  className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
  required
/>


          {/* Frequency */}
          <label className="text-sm font-medium mt-2">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold py-2 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Add Recurring Expense
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
