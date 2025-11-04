import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AddExpense from "../components/AddExpense";
import MonthlyReport from "../components/MonthlyReport";
import {
  Plus,
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import "chart.js/auto";

export default function Expenses() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false); // central trigger for refresh

  // 🧾 Fetch categories
  const fetchCategories = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${userId}`);
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // 💰 Fetch expenses
  const fetchExpenses = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/expenses/${userId}`);
      const data = await res.json();

      const formattedData = data.map((exp) => ({
        ...exp,
        dateFormatted: new Date(exp.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        }),
      }));

      setExpenses(formattedData);
      setFilteredExpenses(formattedData);
    } catch (err) {
      toast.error("Failed to fetch expenses");
      console.error(err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [userId]);

  useEffect(() => {
    fetchExpenses();
  }, [categories]);

  // Triggered when shouldFetch changes
  useEffect(() => {
    if (shouldFetch) {
      fetchExpenses();
      setShouldFetch(false);
    }
  }, [shouldFetch]);

  const getPaymentIcon = (method) => {
    if (method === "cash") return <DollarSign size={16} />;
    if (method === "card") return <CreditCard size={16} />;
    if (method === "upi") return <Smartphone size={16} />;
    return null;
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/expenses/${id}`, { method: "DELETE" });
      toast.success("Expense deleted successfully!");
      setShouldFetch(true);
    } catch (err) {
      toast.error("Failed to delete expense");
      console.error(err);
    }
  };

  // 📊 Pie and Bar Chart Data
  const pieData = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        data: categories.map(
          (cat) =>
            filteredExpenses
              .filter((exp) => exp.category_id === cat.category_id)
              .reduce((a, b) => a + Number(b.amount), 0)
        ),
        backgroundColor: [
          "#10b981",
          "#34d399",
          "#059669",
          "#6ee7b7",
          "#047857",
          "#22c55e",
        ],
      },
    ],
  };

  const barData = {
    labels: filteredExpenses.map((exp) => exp.dateFormatted),
    datasets: [
      {
        label: "Expenses",
        data: filteredExpenses.map((exp) => exp.amount),
        backgroundColor: theme === "dark" ? "#4ade80" : "#16a34a",
      },
    ],
  };

  // 💥 Total Expense
  const totalExpense = filteredExpenses.reduce(
    (a, b) => a + Number(b.amount),
    0
  );

  return (
    <div
      className={`p-6 transition-colors duration-300 ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          {user?.name}'s Expenses
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMonthlyModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:scale-105 transition"
          >
            Monthly Report
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-900 to-black border border-gray-700"
              : "bg-green-100 border border-green-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold mt-2 flex items-center gap-2">
            ₹ {totalExpense}{" "}
            <ArrowDown size={20} className="text-red-500" />
          </p>
        </div>

        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-800 to-black border border-gray-700"
              : "bg-green-200 border border-green-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Top Category
          </h3>
          <p className="text-2xl font-bold mt-2">
            {filteredExpenses.length > 0 ? filteredExpenses[0].category : "-"}
          </p>
        </div>

        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-tr from-red-900 to-black border border-gray-700"
              : "bg-red-100 border border-red-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Highest Expense
          </h3>
          <p className="text-2xl font-bold mt-2">
            ₹ {Math.max(...filteredExpenses.map((e) => e.amount), 0)}
          </p>
        </div>

        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-700 to-black border border-gray-700"
              : "bg-green-300 border border-green-400"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Savings
          </h3>
          <p className="text-2xl font-bold mt-2">₹ {0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Expenses Over Time</h3>
          <Bar data={barData} />
        </div>

        <div
          className={`p-6 rounded-xl shadow-lg transition ${
            theme === "dark"
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
          <Pie data={pieData} />
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Expense Timeline</h2>
        <div className="relative">
          <div
            className={`absolute left-5 top-0 w-1 h-full ${
              theme === "dark" ? "bg-green-500" : "bg-green-600"
            }`}
          ></div>
          <div className="ml-12 space-y-6">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.expense_id}
                className={`p-4 rounded-xl shadow-lg transition transform hover:scale-105 ${
                  exp.amount > 1000 ? "border-2 border-red-500" : ""
                } ${
                  theme === "dark"
                    ? "bg-gradient-to-tr from-gray-800 to-black"
                    : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{exp.note}</span>
                  <span className="text-sm text-gray-400">
                    {exp.dateFormatted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          exp.amount > 1000 ? "#f87171" : "#10b981",
                      }}
                    >
                      {exp.category}
                    </span>
                    {getPaymentIcon(exp.payment_method)}
                  </div>
                  <span className="font-bold text-lg">₹ {exp.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition transform"
      >
        <Plus size={28} />
      </button>

      {/* Add Expense Modal */}
      <AddExpense
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        setShouldFetch={setShouldFetch}
      />

      {/* Monthly Report Modal */}
      <MonthlyReport
        isOpen={monthlyModalOpen}
        onClose={() => setMonthlyModalOpen(false)}
        expenses={expenses}
        categories={categories}
        user={user}
      />
    </div>
  );
}
