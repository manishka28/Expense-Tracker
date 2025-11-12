import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { db } from "./config/db.js";

// // Route imports
// import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import recurringExpenseRoutes from "./routes/recurringExpenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cron from "node-cron";
import { processRecurringExpenses } from "./controllers/recurringExpenseController.js";
import expenseAnalyticsRoutes from "./routes/expenseAnalyticsRoutes.js";
import goalRoutes from './routes/goalRoutes.js';
dotenv.config();

const app = express();

// 🔧 Middlewares
app.use(cors());
app.use(express.json());

// // 🔗 API Routes
// app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/recurring-expenses", recurringExpenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", expenseAnalyticsRoutes);
app.use('/api/goals', goalRoutes);

cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily recurring expense check...");
  await processRecurringExpenses();
});

// 🏠 Test route
app.get("/", (req, res) => {
  res.send("Welcome to BahiKhata API 🚀");
});

// ❌ 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚙️ Start server only if DB connected
const PORT = process.env.PORT || 5000;
try {
  await db.query("SELECT 1");
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
} catch (error) {
  console.error("❌ Cannot start server — DB connection failed:", error.message);
}
