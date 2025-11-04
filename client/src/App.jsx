import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home"; // ✅ Import the new Home page
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    
    <Router>
      <Routes>
        {/* 🏠 Home (entry point before login) */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Protected routes after login */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile/>
            </Layout>
          }
        />
        <Route
          path="/expenses"
          element={
            <Layout>
              <Expenses />
            </Layout>
          }
        />
        <Route
          path="/income"
          element={
            <Layout>
              <Income />
            </Layout>
          }
        />
        <Route
          path="/goals"
          element={
            <Layout>
              <Goals />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>
    </Router>
    
  );
}

export default App;
