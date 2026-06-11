import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import api from "../api/axios";
import logo from "../assets/smartrecruit.JPEG";

function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seenNotif, setSeenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [lang, setLang] = useState(localStorage.getItem("lang") || "FR");
  const [user, setUser] = useState(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    api
      .get("/notifications/")
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const closeAll = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAll);
    return () => document.removeEventListener("mousedown", closeAll);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="mx-4 mt-3 h-16 bg-[#081f5c] px-5 flex items-center justify-between shadow-sm rounded-2xl">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logo}
          alt="Logo SmartRecruit RH"
          className="w-10 h-10 object-contain rounded-xl bg-white p-1 shrink-0"
        />

        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-white leading-tight truncate">
            SmartRecruit <span className="text-green-400">RH</span>
          </h1>

          <p className="text-[12px] text-blue-100 font-medium truncate max-w-[650px]">
            Système intelligent de gestion du recrutement et du suivi des ressources humaines
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setSeenNotif(true);
            }}
            className="relative w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Bell size={17} />

            {!seenNotif && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b bg-slate-50">
                <p className="font-extrabold text-sm text-slate-900">
                  Notifications
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-5 text-sm text-slate-500">
                  Aucune notification
                </div>
              ) : (
                notifications.map((n, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 border-b text-sm text-slate-700"
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="w-8 h-8 rounded-lg text-white hover:bg-white/10 flex items-center justify-center"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          onClick={() => {
            const next = lang === "FR" ? "EN" : "FR";
            setLang(next);
            localStorage.setItem("lang", next);
          }}
          className="h-8 px-2.5 rounded-lg border border-white/20 text-white font-bold text-xs hover:bg-white/10 flex items-center gap-1.5"
        >
          <Globe size={15} />
          {lang}
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-full bg-white text-[#081f5c] flex items-center justify-center font-extrabold text-sm"
          >
            A
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-4 border-b bg-slate-50">
                <p className="font-extrabold text-sm text-slate-900">Admin</p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.sub || "admin@gmail.com"}
                </p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                <User size={16} /> Profil
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                <Settings size={16} /> Paramètres
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;