import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { FaExclamationTriangle, FaMedal } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import AddGoal from "../components/AddGoal";
import EditGoalModal from "../components/EditGoalModal";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import BahiKhataLogo from "../assets/images/BahiKhata.png";

export default function Goals() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [customAmounts, setCustomAmounts] = useState({});
  const [expandedContributions, setExpandedContributions] = useState({});
  const [filters, setFilters] = useState({ priority: "All", status: "All" });
  const [sortBy, setSortBy] = useState("deadline");

  const { user } = useAuth();
  const userId = user.userId;

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/goals/${userId}`);
      setGoals(res.data);
    } catch (err) {
      toast.error("Failed to fetch goals!");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/goals/${id}`);
      toast.success("Goal deleted!");
      fetchGoals();
    } catch (err) {
      toast.error("Failed to delete goal!");
      console.error(err);
    }
  };

  const handleContribution = async (id, amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.warning("Enter a valid contribution amount!");
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/goals/contribute`, {
        goal_id: id,
        amount: Number(amount),
      });
      toast.success("Contribution added!");
      setCustomAmounts((prev) => ({ ...prev, [id]: "" }));
      fetchGoals();
    } catch (err) {
      toast.error("Failed to add contribution!");
      console.error(err);
    }
  };

  // Filtering & Sorting
  const filteredAndSortedGoals = () => {
    let temp = [...goals];

    if (filters.priority !== "All") {
      temp = temp.filter((g) => g.priority === filters.priority);
    }
    if (filters.status !== "All") {
      const today = new Date();
      temp = temp.filter((g) => {
        const progress = (g.current_amount / g.target_amount) * 100;
        const deadline = new Date(g.deadline);
        if (filters.status === "Overdue") return today > deadline && progress < 100;
        if (filters.status === "Completed") return progress >= 100;
        if (filters.status === "InProgress") return progress < 100 && today <= deadline;
        return true;
      });
    }

    temp.sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "progress") return (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount);
      if (sortBy === "target") return a.target_amount - b.target_amount;
      return 0;
    });

    return temp;
  };

  // Export to Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      goals.map((g) => ({
        Name: g.name,
        Target: g.target_amount,
        Saved: g.current_amount,
        Priority: g.priority || "",
        Deadline: g.deadline,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Goals");
    XLSX.writeFile(wb, "Goals.xlsx");
  };

  // Export to PDF
  const getBase64Image = (imgSrc) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgSrc;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
    });

  const exportGoalsPDF = async (goals, user) => {
    if (!Array.isArray(goals) || goals.length === 0) return;

    const doc = new jsPDF();

    try {
      const logoBase64 = await getBase64Image(BahiKhataLogo);
      doc.addImage(logoBase64, "PNG", 10, 5, 30, 20);
    } catch (err) {
      console.error("Failed to load logo for PDF", err);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Goals Report", 50, 15);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`User Name: ${user?.name || "N/A"}`, 50, 25);

    const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Saved: ₹ ${totalSaved} / ₹ ${totalTarget}`, 50, 32);

    const headers = [["Name", "Target", "Saved", "Progress (%)", "Deadline"]];
    const rows = goals.map((g) => {
      const progress = ((Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100).toFixed(1);
      const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString() : "-";
      return [g.name, `₹ ${g.target_amount}`, `₹ ${g.current_amount}`, progress, deadline];
    });

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      styles: { fontSize: 10, textColor: "#000" },
      headStyles: { fillColor: "#10b981", textColor: "#fff", fontStyle: "bold" },
      alternateRowStyles: { fillColor: "#f2f2f2" },
      margin: { left: 14, right: 14 },
      tableLineColor: [211, 211, 211],
      tableLineWidth: 0.3,
    });

    doc.save(`goals-report.pdf`);
  };

  const overdueGoals = goals.filter(
    (g) => new Date(g.deadline) < new Date() && g.current_amount < g.target_amount
  );

  return (
    <div className={`p-6 transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Goals</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:scale-105 transition"
          >
            Export Excel
          </button>
          <button
            onClick={() => exportGoalsPDF(goals, user)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Export PDF
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            <Plus size={18} /> Add Goal
          </button>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex gap-4 mb-6">
         <div className="relative w-48">
    <select
      className="block w-full p-2 border rounded appearance-none bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
      value={filters.status}
      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
    >
      <option value="All">All Status</option>
      <option value="Overdue">Overdue</option>
      <option value="Completed">Completed</option>
      <option value="InProgress">In Progress</option>
    </select>
    {/* Custom arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg
        className="w-4 h-4 text-green-700 dark:text-green-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  <div className="relative w-48">
    <select
      className="block w-full p-2 border rounded appearance-none bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value="deadline">Sort by Deadline</option>
      <option value="progress">Sort by Progress</option>
      <option value="target">Sort by Target</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg
        className="w-4 h-4 text-green-700 dark:text-green-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

      </div>

      {/* Dashboard Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <DashboardCard
          theme={theme}
          title="Overdue Goals"
          value={`${overdueGoals.length}`}
          gradientDark="from-yellow-800 to-black"
          gradientLight="bg-yellow-100 border-yellow-300"
          icon={<FaExclamationTriangle className="text-yellow-500" />}
        />
        <DashboardCard
          theme={theme}
          title="Total Goals"
          value={`${goals.length}`}
          gradientDark="from-green-800 to-black"
          gradientLight="bg-green-100 border-green-300"
          icon={<Plus className="text-green-500" />}
        />
        <DashboardCard
          theme={theme}
          title="Total Progress"
          value={`${
            goals.length === 0
              ? 0
              : Math.round(
                  (goals.reduce((a, g) => a + Number(g.current_amount || 0), 0) /
                    goals.reduce((a, g) => a + Number(g.target_amount || 0), 0)) *
                    100
                )
          }%`}
          gradientDark="from-blue-800 to-black"
          gradientLight="bg-blue-100 border-blue-300"
          icon={<Plus className="text-blue-500" />}
        />
      </div>

      {/* Goals List */}
      <div className="grid md:grid-cols-2 gap-6">
  {filteredAndSortedGoals().map((goal) => {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const deadline = new Date(goal.deadline);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
    const suggestedDaily = daysLeft
      ? Math.max(0, (goal.target_amount - goal.current_amount) / daysLeft)
      : 0;
    const isOverdue = today > deadline && progress < 100;
    const almostComplete = progress >= 90 && progress < 100;
    const completed = progress >= 100;

    return (
      <div
        key={goal.goal_id}
        className={`p-6 rounded-xl shadow-lg transition transform hover:scale-[1.02] ${
          isDark
            ? "bg-green-900 text-white"  // Dark mode: green background with white text
            : "bg-white text-gray-900"   // Light mode: white background with dark text
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleDelete(goal.goal_id)}
              className="p-1 text-red-500 hover:bg-red-200 rounded-full"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setEditGoal(goal)}
              className="p-1 text-blue-500 hover:bg-blue-200 rounded-full"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        {/* Target / Saved */}
        <div className="mb-2 text-sm">
          Target: ₹ {goal.target_amount} | Saved: ₹ {goal.current_amount}{" "}
          {goal.priority && (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-200 text-indigo-800">
              {goal.priority}
            </span>
          )}
          {completed && (
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800 flex items-center gap-1">
              <FaMedal /> Completed
            </span>
          )}
        </div>

{/* Progress Bar */}
<div className={`w-full rounded-full h-4 mb-2 overflow-hidden ${isDark ? "bg-white" : "bg-gray-200"}`}>
  {[25, 50, 75].map((m) => (
    <div
      key={m}
      className={`absolute top-0 h-4 border-l ${isDark ? "border-gray-500" : "border-gray-400"}`}
      style={{ left: `${m}%` }}
    />
  ))}
  <div
    className={`h-4 rounded-full transition-all ${
      completed
        ? "bg-green-500"
        : almostComplete
        ? "bg-yellow-400"
        : isOverdue
        ? "bg-red-500"
        : isDark
        ? "bg-cyan-500"
        : "bg-blue-500"
    }`}
    style={{ width: `${progress}%` }}
  ></div>
</div>



        {/* Progress Details */}
        <div className="text-xs mb-3">
          Progress: {progress.toFixed(1)}% |{" "}
          {completed
            ? "Goal Completed!"
            : isOverdue
            ? "Overdue!"
            : `Days Left: ${daysLeft}`}{" "}
          {almostComplete && <span className="ml-2 text-yellow-600 font-semibold">Almost Done!</span>}
          {suggestedDaily > 0 && !completed && (
            <div className={`text-xs mt-1 ${isDark ? "text-green-200" : "text-gray-600"}`}>
              Suggested daily: ₹{Math.ceil(suggestedDaily)}
            </div>
          )}
        </div>

        {/* Contribution */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <input
            type="number"
            placeholder="Amount"
            value={customAmounts[goal.goal_id] || ""}
            onChange={(e) =>
              setCustomAmounts((prev) => ({ ...prev, [goal.goal_id]: e.target.value }))
            }
            className={`w-24 p-2 border rounded ${
              isDark ? "bg-green-800 text-white border-green-700" : "bg-white text-gray-900 border-green-300"
            }`}
          />
          <button
            onClick={() => handleContribution(goal.goal_id, customAmounts[goal.goal_id])}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Add
          </button>
        </div>

        {/* Contribution History */}
        {goal.contributions && goal.contributions.length > 0 && (
          <div className="text-xs">
            <button
              className="text-green-500 underline mb-1"
              onClick={() =>
                setExpandedContributions((prev) => ({
                  ...prev,
                  [goal.goal_id]: !prev[goal.goal_id],
                }))
              }
            >
              {expandedContributions[goal.goal_id] ? "Hide Contributions" : "View Contributions"}
            </button>
            {expandedContributions[goal.goal_id] && (
              <ul className={`${isDark ? "text-green-200" : "text-gray-700"} pl-2`}>
                {goal.contributions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((c, idx) => (
                    <li key={idx}>
                      ₹{c.amount} on {new Date(c.date).toLocaleDateString()}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  })}
</div>


      {/* Modals */}
      <AddGoal isOpen={modalOpen} onClose={() => setModalOpen(false)} fetchGoals={fetchGoals} />
      {editGoal && (
        <EditGoalModal
          goal={editGoal}
          isOpen={!!editGoal}
          onClose={() => setEditGoal(null)}
          fetchGoals={fetchGoals}
        />
      )}
    </div>
  );
}

// DashboardCard Component (dark/light theme)
const DashboardCard = ({ title, value, icon, gradientDark, gradientLight, theme }) => {
  const isDark = theme === "dark";
  return (
    <div
      className={`p-6 rounded-xl shadow-lg transition transform hover:scale-105 hover:shadow-2xl ${
        isDark
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
};
