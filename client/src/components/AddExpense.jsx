import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext.jsx";

export default function AddExpense({ isOpen, onClose, setShouldFetch }) {
  const { theme } = useContext(ThemeContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { user } = useAuth();
  const userId = user?.userId;

  // 🔹 Fetch categories on open
  useEffect(() => {
    if (!isOpen || !userId) return;
    axios
      .get(`http://localhost:3000/api/categories/${userId}`)
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error("Failed to fetch categories"));
  }, [isOpen, userId]);

  // 🔹 Update subcategories dynamically
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory("");
      return;
    }
    const cat = categories.find((c) => c.category_id === selectedCategory);
    if (cat) setSubcategories(cat.subcategories || []);
  }, [selectedCategory, categories]);

  // 🔹 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to add an expense.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/expenses", {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        amount,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory || null,
        payment_method: paymentMethod || null,
        note: description || null,
      });

      toast.success("Expense added successfully!");
      setShouldFetch(true); // trigger refresh on Expenses.jsx
      onClose();

      // Reset form
      setSelectedCategory("");
      setSelectedSubcategory("");
      setAmount("");
      setDescription("");
      setPaymentMethod("cash");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense.");
    }
  };

  if (!isOpen) return null;

  // 🎨 Theme-based styles
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

        <h2 className="text-xl font-semibold mb-5 text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          Add Expense
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
            required
          >
            <option value="">Select Category</option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name} {cat.user_id === null ? "(Global)" : ""}
                </option>
              ))}
          </select>

          {/* Subcategory */}
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
            disabled={!subcategories.length}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.subcategory_id} value={sub.subcategory_id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
            required
          />

          {/* Description */}
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
          />

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={`p-2 rounded-lg border focus:outline-none ${inputBg}`}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold py-2 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
