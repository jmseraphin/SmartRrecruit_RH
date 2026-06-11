import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [motDePasse, setMotDePasse] = useState("123456");
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
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl w-96">
        <h1 className="text-3xl font-bold text-blue-950 text-center">
          SmartRecruit <span className="text-green-600">RH</span>
        </h1>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <input
          className="border p-3 w-full mt-6"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-3 w-full mt-4"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />

        <button className="bg-blue-900 text-white p-3 w-full mt-6">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;