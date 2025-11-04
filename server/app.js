import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { db } from "./config/db.js";

// // Route imports
// import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

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
