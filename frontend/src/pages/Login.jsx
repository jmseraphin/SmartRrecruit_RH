import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/smartrecruit.jpeg";

function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [motDePasse, setMotDePasse] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        mot_de_passe: motDePasse,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      setError("Connexion refusée");
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl w-96 shadow-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img
            src={logo}
            alt="SmartRecruit RH"
            className="w-48 h-auto object-contain"
          />
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Email */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>

        <input
          className="border p-3 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Mot de passe */}
        <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
          Mot de passe
        </label>

        <div className="relative">
          <input
            className="border p-3 w-full rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            type={showPassword ? "text" : "password"}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          className="bg-blue-900 text-white p-3 w-full mt-6 rounded-lg hover:bg-blue-800 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;