import { motion } from "framer-motion";
import AuthForm from "../components/AuthForm";
import Logo from "../assets/images/BahiKhata.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-green-900 to-black text-white overflow-x-hidden overflow-y-auto">
      {/* Decorative glowing orbs (optimized animation) */}
      <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl bottom-0 right-10 animate-pulse"></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-screen px-6 md:px-20 py-10 md:py-0 space-y-10 md:space-y-0">
        
        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-center md:text-left"
        >
          <img
            src={Logo}
            alt="BahiKhata Logo"
            className="w-36 mb-6 mx-auto md:mx-0 drop-shadow-lg"
          />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Manage Your Finances Easily <br /> with{" "}
            <span className="text-green-500">BahiKhata</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Your modern digital ledger — track income, monitor expenses, set
            goals, and stay in control of your money. Smart. Simple. Secure.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold rounded-xl shadow-lg hover:scale-105 transition">
            Get Started
          </button>
        </motion.div>

        {/* RIGHT SECTION — GLASSMORPHIC LOGIN */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-[400px] max-w-md bg-white/10 backdrop-blur-md border border-green-400/30 rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-semibold text-green-300 text-center mb-6">
            Welcome Back
          </h2>
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
}
