import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaExclamationTriangle,
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user.userId;

  const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#2dd4bf", "#a7f3d0"];
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/dashboard/${userId}`);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userId]);

  if (loading)
    return (
      <div className="text-center text-gray-400 mt-20">
        Loading dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-red-500 mt-20">
        Failed to load dashboard data
      </div>
    );

  const {
    totalIncome = 0,
    totalExpense = 0,
    netSavings = 0,
    upcomingBills = 0,
    monthlyData = [],
    pieData = [],
    goals = [],
    recentTransactions = [],
  } = data;

  const formatAmount = (amount) =>
    isNaN(Number(amount))
      ? "0.00"
      : Number(amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  return (
    <div
      className={`p-6 transition-colors duration-300 ${
        isDark ? "text-white" : "text-gray-900"
      }`}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        {user?.name}'s Dashboard
      </h1>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Income */}
        <DashboardCard
          theme={theme}
          title="Total Income"
          value={`₹ ${formatAmount(totalIncome)}`}
          gradientDark="from-green-900 to-black"
          gradientLight="bg-green-100 border-green-300"
          icon={<FaArrowUp className="text-green-500" />}
        />

        {/* Expense */}
        <DashboardCard
          theme={theme}
          title="Total Expenses"
          value={`₹ ${formatAmount(totalExpense)}`}
          gradientDark="from-red-900 to-black"
          gradientLight="bg-red-100 border-red-300"
          icon={<FaArrowDown className="text-red-500" />}
        />

        {/* Net Savings */}
        <DashboardCard
          theme={theme}
          title="Net Savings"
          value={`₹ ${formatAmount(netSavings)}`}
          gradientDark="from-teal-900 to-black"
          gradientLight="bg-teal-100 border-teal-300"
          icon={<FaWallet className="text-teal-500" />}
        />

        {/* Upcoming Bills */}
        <DashboardCard
          theme={theme}
          title="Upcoming Bills"
          value={`${upcomingBills} Due Soon`}
          gradientDark="from-yellow-800 to-black"
          gradientLight="bg-yellow-100 border-yellow-300"
          icon={<FaExclamationTriangle className="text-yellow-500" />}
        />
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`p-6 rounded-xl shadow-lg transition ${
            isDark
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">
            Monthly Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="month" stroke={isDark ? "#9ca3af" : "#4b5563"} />
              <YAxis stroke={isDark ? "#9ca3af" : "#4b5563"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#f9fafb",
                  color: isDark ? "#fff" : "#000",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`p-6 rounded-xl shadow-lg transition ${
            isDark
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#f9fafb",
                  color: isDark ? "#fff" : "#000",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* --- Recent Transactions --- */}
      <div
        className={`p-6 rounded-xl shadow-lg transition ${
          isDark
            ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <ul>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((txn) => (
              <li
                key={txn.id}
                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-none"
              >
                <div>
                  <p className="font-medium">
                    {txn.category || "General"}{" "}
                    <span
                      className={`text-sm ml-2 px-2 py-1 rounded-full ${
                        txn.type === "Income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {txn.type}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {txn.note || "No note"} –{" "}
                    {new Date(txn.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    txn.type === "Income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ₹{formatAmount(txn.amount)}
                </p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">
              No recent transactions found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

/* --- Dashboard Card Component --- */
const DashboardCard = ({ title, value, icon, gradientDark, gradientLight, theme }) => (
  <div
    className={`p-6 rounded-xl shadow-lg transition ${
      theme === "dark"
        ? `bg-gradient-to-tr ${gradientDark} border border-gray-700`
        : `${gradientLight} border`
    }`}
  >
    <h3 className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2">
      {icon} {title}
    </h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);
