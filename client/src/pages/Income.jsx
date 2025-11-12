import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AddIncome from "../components/AddIncome";
import MonthlyIncomeReport from "../components/MonthlyIncomeReport";
import { Plus, ArrowUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";

import "chart.js/auto";

export default function Income() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [income, setIncome] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // ✅ Fetch income entries
  const fetchIncome = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/income/${userId}`);
      const fetchedData = await res.json();
      const data=fetchedData.data;

      // console.log("Income data: ",data);
      

      if (!Array.isArray(data) || data.length === 0) {
        setIncome([]);
        // console.log("Income saved",income);
        
        return;
      }

      const formatted = data.map((inc) => ({
        ...inc,
        dateFormatted: new Date(inc.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        }),
      }));

      setIncome(formatted);
    } catch (err) {
      toast.error("Failed to fetch income");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [userId]);

  // ✅ Handle delete
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/income/${id}`, { method: "DELETE" });
      toast.success("Income deleted successfully!");
      fetchIncome(); // instantly refresh list
    } catch (err) {
      toast.error("Failed to delete income");
      console.error(err);
    }
  };

  // ✅ Chart data
  const pieData = {
    labels: income.map((i) => i.source || "Other"),
    datasets: [
      {
        data: income.map((i) => Number(i.amount)),
        backgroundColor: [
          "#34d399",
          "#10b981",
          "#6ee7b7",
          "#22c55e",
          "#4ade80",
          "#86efac",
        ],
      },
    ],
  };

  const barData = {
    labels: income.map((i) => i.dateFormatted),
    datasets: [
      {
        label: "Income",
        data: income.map((i) => i.amount),
        backgroundColor: theme === "dark" ? "#4ade80" : "#16a34a",
      },
    ],
  };

  return (
    <div
      className={`p-6 transition-colors duration-300 ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          {user?.name}'s Income
        </h1>
        <div className=" flex gap-2">
        <button
  onClick={() => setReportOpen(true)}
  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:scale-105 transition"
>
  📄 Monthly Report
</button>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <Plus size={18} /> Add Income
        </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-900 to-black border border-gray-700"
              : "bg-green-100 border border-green-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Total Income
          </h3>
          <p className="text-2xl font-bold mt-2 flex items-center gap-2">
            ₹ {income.reduce((a, b) => a + Number(b.amount || 0), 0)}
            <ArrowUp size={20} className="text-green-500" />
          </p>
        </div>
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-800 to-black border border-gray-700"
              : "bg-green-200 border border-green-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Top Source
          </h3>
          <p className="text-2xl font-bold mt-2">
            {income.length > 0 ? income[0].source || "-" : "-"}
          </p>
        </div>
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-900 to-black border border-gray-700"
              : "bg-green-100 border border-green-300"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">
            Highest Income
          </h3>
          <p className="text-2xl font-bold mt-2">
            ₹ {Math.max(...income.map((e) => e.amount), 0)}
          </p>
        </div>
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-tr from-green-700 to-black border border-gray-700"
              : "bg-green-300 border border-green-400"
          }`}
        >
          <h3 className="text-sm text-gray-700 dark:text-gray-400">Savings</h3>
          <p className="text-2xl font-bold mt-2">₹ {0}</p>
        </div>
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Income Over Time</h3>
          {income.length === 0 ? (
            <p className="text-gray-500">No income data yet</p>
          ) : (
            <Bar data={barData} />
          )}
        </div>
        <div
          className={`p-6 rounded-xl shadow-lg ${
            theme === "dark"
              ? "bg-gradient-to-br from-green-950 to-black border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Income by Source</h3>
          {income.length === 0 ? (
            <p className="text-gray-500">No income data yet</p>
          ) : (
            <Pie data={pieData} />
          )}
        </div>
      </div> */}

      {/* Timeline */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Income Timeline</h2>
        {income.length === 0 ? (
          <p className="text-gray-500">No income added yet.</p>
        ) : (
          <div className="relative">
            <div
              className={`absolute left-5 top-0 w-1 h-full ${
                theme === "dark" ? "bg-green-500" : "bg-green-600"
              }`}
            ></div>
            <div className="ml-12 space-y-6">
              {income.map((inc) => (
                <div
                  key={inc.income_id}
                  className={`p-4 rounded-xl shadow-lg transition transform hover:scale-105 ${
                    inc.amount > 10000 ? "border-2 border-green-400" : ""
                  } ${
                    theme === "dark"
                      ? "bg-gradient-to-tr from-gray-800 to-black"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{inc.source || "Other"}</span>
                    <span className="text-sm text-gray-400">
                      {inc.dateFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{inc.note}</span>
                    <span className="font-bold text-lg">₹ {inc.amount}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(inc.income_id)}
                    className="text-red-500 text-xs mt-2 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition transform"
      >
        <Plus size={28} />
      </button>

      {/* Add Income Modal */}
      <AddIncome
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fetchIncome={fetchIncome} // ✅ Pass refresh function
      />
      <MonthlyIncomeReport
  isOpen={reportOpen}
  onClose={() => setReportOpen(false)}
  income={income}
  user={user}
/>
    </div>
  );
}
