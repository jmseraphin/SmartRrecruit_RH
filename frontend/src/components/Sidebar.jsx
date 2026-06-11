import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.JPEG";

const menus = [
  ["🏠", "Tableau de bord", "/dashboard"],
  ["💼", "Offres & Postes", "/offres"],
  ["📄", "Candidatures", "/candidatures"],
  ["🧠", "Sélection IA", "/selection"],
  ["📝", "Contrats", "/contrats"],
  ["📋", "Missions / Tâches", "/missions"],
  ["💰", "Solde & Paiements", "/paiements"],
  ["👥", "Employés", "/employes"],
  ["⭐", "Évaluation", "/evaluations"],
  ["📑", "Attestations", "/attestations"],
  ["📊", "Rapports", "/rapports"],
  ["⚙️", "Paramètres", "/parametres"],
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-56"
      } bg-white border-r border-slate-200 h-screen shadow-sm transition-all duration-300 flex flex-col`}
    >
      <div className="px-3 py-4 border-b border-slate-200">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <img
              src={logo}
              alt="Logo SmartRecruit RH"
              className="w-10 h-10 object-contain rounded-lg shrink-0"
            />

            {!collapsed && (
              <div>
                <h1 className="text-base font-bold text-[#081f5c] leading-tight">
                  SmartRecruit
                </h1>
                <p className="text-[11px] font-semibold text-slate-500">
                  Gestion RH intelligente
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-lg"
              title="Réduire le menu"
            >
              ☰
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-3 w-full h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-lg"
            title="Afficher le menu"
          >
            ☰
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-4 pb-2 text-center">
          <p className="text-[11px] font-extrabold text-[#081f5c] uppercase tracking-wider">
            Menu principal
          </p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 sidebar-scroll">
        {menus.map(([icon, label, path]) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              } py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-[#081f5c] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-[#081f5c]"
              }`
            }
          >
            <span className="text-[17px] w-5 text-center shrink-0">
              {icon}
            </span>

            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;