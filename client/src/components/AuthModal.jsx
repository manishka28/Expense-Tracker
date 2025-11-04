import { useState } from "react";

export default function AuthModal({ closeModal, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };

    try {
      // You can later replace this with actual API call using fetch or axios
      console.log(`Submitting to ${endpoint}`, payload);
      // Example:
      // const res = await fetch(endpoint, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      // const data = await res.json();
      // if (data.success) onLoginSuccess();

      onLoginSuccess(); // temporarily auto-login for now
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Slight overlay with transparency */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>

      {/* Glassmorphic Modal */}
      <div className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-8 w-96 text-gray-900">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-700 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-green-700 mb-6">
          {isLogin ? "Login to BahiKhata" : "Create Your BahiKhata Account"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/70 border border-gray-300 rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/70 border border-gray-300 rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white/70 border border-gray-300 rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-white/70 border border-gray-300 rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-700 mt-4">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <span
            className="text-green-700 font-medium cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
