import { useContext } from "react";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);

  const transactions = [
    { id: 1, type: "Income", category: "Salary", amount: 5000, date: "2025-11-01" },
    { id: 2, type: "Expense", category: "Groceries", amount: 1200, date: "2025-11-02" },
    { id: 3, type: "Expense", category: "Transport", amount: 800, date: "2025-11-03" },
    { id: 4, type: "Income", category: "Freelance", amount: 2500, date: "2025-11-03" },
  ];

  const barHeights = [50, 120, 80, 150, 90, 200, 130];
  const barColors = theme === "dark"
    ? ["#d1d5db", "#9ca3af", "#f3f4f6", "#6b7280", "#e5e7eb", "#4b5563", "#f9fafb"]
    : ["#34d399", "#10b981", "#6ee7b7", "#3b82f6", "#60a5fa", "#fbbf24", "#f87171"]; // light mode colors

  return (
    <div className={`p-6 transition-colors duration-300 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className={`text-3xl md:text-4xl font-bold mb-8 ${theme === "dark" ? "text-white/90" : "text-gray-900"}`}>
        Dashboard Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
          theme === "dark" ? "bg-gradient-to-tr from-green-900 to-black border border-gray-700" : "bg-green-100 border border-gray-300"
        }`}>
          <h3 className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Total Income</h3>
          <p className={`text-2xl md:text-3xl font-bold mt-2 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            ₹ 25,000 <ArrowUp size={20} className="text-green-500" />
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
          theme === "dark" ? "bg-gradient-to-tr from-red-900 to-black border border-gray-700" : "bg-red-100 border border-gray-300"
        }`}>
          <h3 className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Total Expenses</h3>
          <p className={`text-2xl md:text-3xl font-bold mt-2 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            ₹ 18,700 <ArrowDown size={20} className="text-red-500" />
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
          theme === "dark" ? "bg-gradient-to-tr from-green-800 via-green-900 to-black border border-gray-700" : "bg-green-200 border border-gray-300"
        }`}>
          <h3 className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Savings</h3>
          <p className={`text-2xl md:text-3xl font-bold mt-2 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            ₹ 6,300 <ArrowUp size={20} className="text-green-500" />
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses */}
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
          theme === "dark" ? "bg-gradient-to-br from-green-950 to-black border border-gray-700" : "bg-gray-100 border border-gray-300"
        }`}>
          <h3 className={`text-lg md:text-xl font-semibold mb-4 ${theme === "dark" ? "text-white/80" : "text-gray-900"}`}>Income vs Expenses</h3>
          <div className={`h-64 flex items-end justify-around rounded-lg p-4 transition-colors duration-300 ${
            theme === "dark" ? "bg-gray-900/40" : "bg-white/60"
          }`}>
            {barHeights.map((h, idx) => (
              <div
                key={idx}
                className="rounded-t-md transition hover:brightness-125"
                style={{
                  height: `${h}px`,
                  width: "15px",
                  backgroundColor: barColors[idx],
                }}
              />
            ))}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
          theme === "dark" ? "bg-gradient-to-br from-green-950 to-black border border-gray-700" : "bg-gray-100 border border-gray-300"
        }`}>
          <h3 className={`text-lg md:text-xl font-semibold mb-4 ${theme === "dark" ? "text-white/80" : "text-gray-900"}`}>Expenses by Category</h3>
          <div className={`h-64 flex items-center justify-center rounded-lg relative ${
            theme === "dark" ? "bg-gray-900/40" : "bg-white/50"
          }`}>
            <div className="w-40 h-40 rounded-full bg-gray-700/40 relative overflow-hidden animate-spin-slow">
              <div className="absolute inset-0 bg-white/30 clip-pie"></div>
            </div>
            <div className={`absolute font-semibold ${theme === "dark" ? "text-white/80" : "text-gray-900/80"}`}>Pie Chart</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition ${
        theme === "dark" ? "bg-gradient-to-tr from-green-950 to-black border border-gray-700" : "bg-gray-100 border border-gray-300"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg md:text-xl font-semibold ${theme === "dark" ? "text-white/80" : "text-gray-900"}`}>Recent Transactions</h3>
          <button className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-300"}`}>
            <thead className={`${theme === "dark" ? "bg-gray-900/30" : "bg-gray-200"}`}>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody className={`${theme === "dark" ? "divide-y divide-gray-700" : "divide-y divide-gray-300"}`}>
              {transactions.map((t) => (
                <tr key={t.id} className={`transition hover:${theme === "dark" ? "bg-gray-800/40" : "bg-gray-200/30"}`}>
                  <td className="px-4 py-2">{t.date}</td>
                  <td className={`px-4 py-2 font-medium ${t.type === "Income" ? "text-green-400" : "text-red-400"}`}>{t.type}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2 text-right">₹ {t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
