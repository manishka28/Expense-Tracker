import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AddExpense from "../components/AddExpense";
import MonthlyReport from "../components/MonthlyReport";
import AddRecurringExpense from "../components/AddRecurringExpense";
import {
  Plus,
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowDown,
} from "lucide-react";
import { FaExclamationTriangle } from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import "chart.js/auto";
import { useFetch } from "../context/FetchContext";

export default function Expenses() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = user?.userId;

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

    const [analytics, setAnalytics] = useState({
    categoryTotals: [],
    topCategory: null,
    totalExpense: 0,
  });


  const [modalOpen, setModalOpen] = useState(false);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const { shouldFetch, setShouldFetch } = useFetch();
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);



  // 🧾 Fetch categories
  const fetchCategories = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${userId}`);
      const data = await res.json();
      // console.log("res",res);
      
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

 const fetchExpenses = async () => {
  if (!userId) return;
  try {
    const res = await fetch(`http://localhost:3000/api/expenses/${userId}`);
    const data = await res.json();
    console.log(data);
    
    // Sort by date first (latest first)
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Then format for display
    const formattedData = sortedData.map((exp) => ({
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
    // toast.error("Failed to fetch expenses");
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

   // NEW Fetch Expense Analytics
    const fetchExpenseAnalytics = async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/expense-analytics/${userId}`
      );
      const result = await res.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

const fetchRecurringExpenses = async () => {
  if (!userId) return;
  try {
    const res = await fetch(`http://localhost:3000/api/recurring-expenses/${userId}`);
    const data = await res.json();

    // ✅ Format date and sort by next_due_date
    const formattedData = (data.data || [])
      .map((r) => ({
        ...r,
        next_due_date: r.next_due_date
          ? new Date(r.next_due_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
      }))
      .sort((a, b) => {
        const dateA = new Date(a.next_due_date);
        const dateB = new Date(b.next_due_date);
        return dateA - dateB; // earliest first
      });

    setRecurringExpenses(formattedData);
  } catch (err) {
    console.error("Error fetching recurring expenses:", err);
  }
};

  useEffect(() => {
    if (userId) {
      fetchCategories();
      fetchExpenses();
      fetchRecurringExpenses();
      fetchExpenseAnalytics(); 
    }
  }, [userId]);


    useEffect(() => {
    if (shouldFetch) {
      fetchCategories();
      fetchExpenses();
      fetchRecurringExpenses();
      fetchExpenseAnalytics();
    }
  }, [shouldFetch]);



  const getPaymentIcon = (method) => {
    if (method === "cash") return <DollarSign size={16} />;
    if (method === "card") return <CreditCard size={16} />;
    if (method === "upi") return <Smartphone size={16} />;
    return null;
  };

  const handleDelete = async (expenseId) => {
    try {
      console.log("id",expenseId);
      
      await fetch(`http://localhost:3000/api/expenses/${expenseId}`, { method: "DELETE" });
      toast.success("Expense deleted successfully!");
      setShouldFetch(true);
    } catch (err) {
      toast.error("Failed to delete expense");
      console.error(err);
    }
  };

  // 📊 Pie and Bar Chart Data
  const pieData = {
    labels: analytics.categoryTotals.map((c) => c.category_name),
    datasets: [
      {
        data: analytics.categoryTotals.map((c) => c.total_amount),
        backgroundColor: [
          "#10b981",
          "#34d399",
          "#059669",
          "#6ee7b7",
          "#047857",
          "#22c55e",
          "#4ade80",
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
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

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
  onClick={() => setRecurringModalOpen(true)}
  className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
>
  <Plus size={18} /> Add Recurring Expense
</button>
<button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Plus size={18} /> Add Expense
          </button>

        </div>
      </div>
{/* Insight Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <DashboardCard
    theme={theme}
    title="Total Expenses"
    value={`₹ ${totalExpense}`}
    gradientDark="from-red-900 to-black"
    gradientLight="bg-red-100 border-red-300"
    icon={<ArrowDown size={20} className="text-red-500" />}
  />

  <DashboardCard
    theme={theme}
    title="Top Category"
    value={analytics.topCategory?.category_name || "-"}
    gradientDark="from-green-900 to-black"
    gradientLight="bg-green-100 border-green-300"
    icon={<DollarSign size={20} className="text-green-500" />}
  />

  <DashboardCard
    theme={theme}
    title="Highest Expense"
    value={`₹ ${Math.max(...filteredExpenses.map((e) => e.amount), 0)}`}
    gradientDark="from-red-800 to-black"
    gradientLight="bg-red-100 border-red-300"
    icon={<CreditCard size={20} className="text-red-500" />}
  />

  <DashboardCard
    theme={theme}
    title="Overdue Recurring"
    value={`${recurringExpenses.filter((r) => new Date(r.next_due_date) < new Date()).length}`}
    gradientDark="from-yellow-800 to-black"
    gradientLight="bg-yellow-100 border-yellow-300"
    icon={<FaExclamationTriangle className="text-yellow-500" />}
  />
</div>


      {/* Charts */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
      </div> */}

{/* Timeline */}
<div className="mb-10">
  <h2 className="text-2xl font-bold mb-4">Expense Timeline</h2>

  {filteredExpenses.length === 0 ? (
    <p className="text-gray-500 text-sm">No expenses recorded yet.</p>
  ) : (
    <>
      {/* Scrollable compact timeline */}
      <div className="relative max-h-[400px] overflow-y-auto border-l-2 border-green-500 dark:border-green-700 pl-6 space-y-4 pr-2 custom-scrollbar">
        {filteredExpenses.slice(0, visibleCount).map((exp) => (
          <div
            key={exp.category_name}
            className={`relative p-3 rounded-lg shadow-md text-sm ${
              theme === "dark"
                ? "bg-gradient-to-tr from-gray-800 to-black"
                : "bg-white border border-gray-200"
            } hover:shadow-lg transition`}
          >
            {/* Green or red dot */}
            <span
              className={`absolute -left-[9px] top-4 w-3 h-3 rounded-full ${
                exp.amount > 1000 ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>

            {/* Note and date */}
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{exp.category_name || "No Note"}</span>
              <span className="text-xs text-gray-400">
                {exp.dateFormatted}
              </span>
            </div>

            {/* Category, payment method & amount */}
            <div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
      style={{
        backgroundColor: exp.amount > 1000 ? "#f87171" : "#10b981",
      }}
    >
      {exp.subcategory_name}
    </span>
    {getPaymentIcon(exp.payment_method)}
  </div>

  <div className="flex items-center gap-2">
    <span className="font-bold">₹ {exp.amount}</span>

    {/* Delete Button */}
    <button
      onClick={() => handleDelete(exp.expense_id)}
      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded-md border border-red-300 hover:border-red-500 transition"
      title="Delete Expense"
    >
      Delete
    </button>
  </div>
</div>

          </div>
        ))}
      </div>

      {/* Load More button */}
      {visibleCount < filteredExpenses.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            Load more ({filteredExpenses.length - visibleCount} more)
          </button>
        </div>
      )}
    </>
  )}
</div>



{/* Recurring Expenses Section */}
<div className="mt-10">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
    <h2 className="text-2xl font-bold">Recurring Expenses</h2>

    {/* Legend / Status Key */}
    <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
      <div className="flex items-center gap-1 text-sm">
        <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
        <span>Scheduled</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
        <span>Due Soon</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span className="inline-block w-3 h-3 rounded-full bg-red-400"></span>
        <span>Overdue</span>
      </div>
    </div>
  </div>

  {recurringExpenses.length === 0 ? (
    <p className="text-gray-500">No recurring expenses yet.</p>
  ) : (
    <div className="grid md:grid-cols-2 gap-4">
      {recurringExpenses
        .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date))
        .map((r) => {
          const today = new Date();
          const dueDate = new Date(r.next_due_date);
          const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

          // Status logic
          let status = "Scheduled";
          let color = "bg-green-100 text-green-800";
          if (diffDays < 0) {
            status = "Overdue";
            color = "bg-red-100 text-red-800";
          } else if (diffDays <= 7) {
            status = "Due Soon";
            color = "bg-yellow-100 text-yellow-800";
          }

          // Date format → "4 Nov 2025"
          const formattedDate = dueDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          // Mark as Paid handler
          const handleMarkAsPaid = async () => {
            try {
              const res = await fetch(
                `http://localhost:3000/api/recurring-expenses/mark-paid/${r.recurring_id}`,
                { method: "POST" }
              );
              const data = await res.json();

              if (data.success) {
                toast.success(`${r.name} marked as paid.`);
                setShouldFetch(true); // trigger data refresh
              } else {
                toast.error("Failed to mark as paid.");
              }
            } catch (err) {
              console.error(err);
              toast.error("Server error while marking as paid.");
            }
          };

          return (
            <div
              key={r.recurring_id}
              className={`p-4 rounded-xl shadow-md transition transform hover:scale-[1.01] ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{r.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}
                >
                  {status}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-1">
                Frequency: <span className="font-medium">{r.frequency}</span>
              </p>
              <p className="text-sm mb-1">Amount: ₹{r.amount}</p>
              <p className="text-xs text-gray-400">Next Due: {formattedDate}</p>

              <button
                onClick={handleMarkAsPaid}
                className="mt-3 w-full py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Mark as Paid
              </button>
            </div>
          );
        })}
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

      {/* Add Expense Modal */}
      <AddExpense
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        setShouldFetch={setShouldFetch}
      />
      <AddRecurringExpense
  isOpen={recurringModalOpen}
  onClose={() => setRecurringModalOpen(false)}
  fetchRecurringExpenses={fetchRecurringExpenses}
  userId={userId}
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

const DashboardCard = ({ title, value, icon, gradientDark, gradientLight, theme }) => (
  <div
    className={`p-6 rounded-xl shadow-lg transition transform hover:scale-105 hover:shadow-2xl ${
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

