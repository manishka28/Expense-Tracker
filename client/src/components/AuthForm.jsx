import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
   const { loginUser, signupUser } = useAuth();
   const navigate=useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    let success = false;

    if (isLogin) {
      success = await loginUser(formData.email, formData.password);
    } else {
      success = await signupUser(formData);
    }
    if(success){
      navigate('/dashboard');
    }

    if (!success) {
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* SIGN UP ONLY FIELDS */}
      {!isLogin && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 rounded-md bg-white/20 border border-green-400/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="p-3 rounded-md bg-white/20 border border-green-400/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </>
      )}

      {/* COMMON FIELDS */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        className="p-3 rounded-md bg-white/20 border border-green-400/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="p-3 rounded-md bg-white/20 border border-green-400/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      {!isLogin && (
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="p-3 rounded-md bg-white/20 border border-green-400/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-red-400 text-sm text-center font-medium">
          {error}
        </p>
      )}

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="mt-4 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold py-3 rounded-md hover:scale-105 transition-transform"
      >
        {isLogin ? "Log In" : "Sign Up"}
      </button>

      {/* TOGGLE BUTTON */}
      <p className="text-sm text-center text-gray-300 mt-2">
        {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-green-400 hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </form>
  );
}
