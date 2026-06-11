import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Parametres() {
  const [user, setUser] = useState({
    nom: "",
    email: "",
    role: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
  });

  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [passwordConfigured, setPasswordConfigured] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [langue, setLangue] = useState(localStorage.getItem("langue") || "FR");

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [userRes, emailRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/parametres/email"),
      ]);

      setUser({
        nom: userRes.data.nom || "",
        email: userRes.data.email || "",
        role: userRes.data.role || "",
      });

      setSmtpEmail(emailRes.data.smtp_email || "");
      setPasswordConfigured(emailRes.data.smtp_password_configured);
    } catch {
      alert("Impossible de charger les paramètres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("nom", user.nom);
    data.append("email", user.email);

    try {
      await api.put("/users/me/profile", data);
      alert("Profil mis à jour. Veuillez vous reconnecter si l'email a changé.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de modifier le profil.");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("ancien_mot_de_passe", passwordForm.ancien_mot_de_passe);
    data.append("nouveau_mot_de_passe", passwordForm.nouveau_mot_de_passe);

    try {
      await api.put("/users/me/password", data);
      setPasswordForm({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
      });
      alert("Mot de passe modifié avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de modifier le mot de passe.");
    }
  };

  const saveEmailConfig = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("smtp_email", smtpEmail);
    data.append("smtp_password", smtpPassword);

    try {
      await api.post("/parametres/email", data);
      setSmtpPassword("");
      setPasswordConfigured(true);
      alert("Configuration email enregistrée.");
    } catch {
      alert("Impossible d’enregistrer la configuration email.");
    }
  };

  const changeTheme = (value) => {
    setTheme(value);
    localStorage.setItem("theme", value);

    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const changeLangue = (value) => {
    setLangue(value);
    localStorage.setItem("langue", value);
    alert(`Langue sélectionnée : ${value}. Traduction complète à finaliser dans les pages.`);
  };

  return (
    <MainLayout>
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#081f5c] dark:text-white">
            Paramètres
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestion du profil, sécurité, email système et préférences.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card title="Profil utilisateur" description="Informations du compte connecté.">
              <form onSubmit={saveProfile} className="space-y-4">
                <Input
                  label="Nom"
                  value={user.nom}
                  onChange={(v) => setUser({ ...user, nom: v })}
                />

                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  onChange={(v) => setUser({ ...user, email: v })}
                />

                <Input
                  label="Rôle"
                  value={user.role}
                  disabled
                  onChange={() => {}}
                />

                <button className="h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
                  Enregistrer profil
                </button>
              </form>
            </Card>

            <Card title="Sécurité" description="Modification du mot de passe de connexion.">
              <form onSubmit={savePassword} className="space-y-4">
                <Input
                  label="Ancien mot de passe"
                  type="password"
                  value={passwordForm.ancien_mot_de_passe}
                  onChange={(v) =>
                    setPasswordForm({
                      ...passwordForm,
                      ancien_mot_de_passe: v,
                    })
                  }
                />

                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordForm.nouveau_mot_de_passe}
                  onChange={(v) =>
                    setPasswordForm({
                      ...passwordForm,
                      nouveau_mot_de_passe: v,
                    })
                  }
                />

                <button className="h-9 bg-[#081f5c] text-white px-4 rounded-lg text-xs font-bold hover:bg-blue-900">
                  Modifier mot de passe
                </button>
              </form>
            </Card>

            <Card title="Configuration email SMTP" description="Email utilisé pour envoyer contrats, reçus et notifications.">
              <form onSubmit={saveEmailConfig} className="space-y-4">
                <Input
                  label="Email SMTP"
                  type="email"
                  value={smtpEmail}
                  onChange={setSmtpEmail}
                />

                <Input
                  label="App Password"
                  type="password"
                  value={smtpPassword}
                  placeholder={
                    passwordConfigured
                      ? "Mot de passe déjà configuré"
                      : "Entrer App Password"
                  }
                  onChange={setSmtpPassword}
                />

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Statut :{" "}
                  <span className="font-bold">
                    {passwordConfigured ? "Configuré" : "Non configuré"}
                  </span>
                </div>

                <button className="h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
                  Enregistrer configuration
                </button>
              </form>
            </Card>

            <Card title="Préférences" description="Apparence et langue de l’interface.">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Thème
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => changeTheme(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Langue
                  </label>
                  <select
                    value={langue}
                    onChange={(e) => changeLangue(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="FR">Français</option>
                    <option value="EN">Anglais</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card title="Informations système" description="Résumé technique de l’application.">
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>Application : SmartRecruit RH</p>
                <p>Version : 1.0.0</p>
                <p>Authentification : JWT Bearer Token</p>
                <p>Backend : FastAPI</p>
                <p>Frontend : React + Vite + Tailwind CSS</p>
                <p>Email configuré : {smtpEmail || "Non configuré"}</p>
                <p>SMTP password : {passwordConfigured ? "Configuré" : "Non configuré"}</p>
              </div>
            </Card>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

function Card({ title, description, children }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-sm font-extrabold text-[#081f5c] dark:text-white mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
        {description}
      </p>

      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 dark:disabled:bg-slate-800"
        required={!disabled}
      />
    </div>
  );
}

export default Parametres;