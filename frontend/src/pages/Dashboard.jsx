import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend
} from "recharts";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  const data = stats || {
    offres: { total: 0, ouvertes: 0 },
    candidats: { total: 0 },
    candidatures: { total: 0, selectionnes: 0, non_retenus: 0 },
    employes: { total: 0, actifs: 0 },
    contrats: { total: 0 },
    missions: { total: 0, en_cours: 0, terminees: 0 },
    paiements: { total: 0, montant_total: 0, montant_paye: 0, montant_en_attente: 0 },
    evaluations: { total: 0 },
    attestations: { total: 0 },
  };

  const cards = [
    ["Offres ouvertes", data.offres.ouvertes, "text-blue-700", "border-blue-200"],
    ["Total offres", data.offres.total, "text-sky-700", "border-sky-200"],
    ["Candidats", data.candidats.total, "text-green-700", "border-green-200"],
    ["Candidatures", data.candidatures.total, "text-emerald-700", "border-emerald-200"],
    ["Sélectionnés", data.candidatures.selectionnes, "text-indigo-700", "border-indigo-200"],
    ["Non retenus", data.candidatures.non_retenus, "text-red-600", "border-red-200"],
    ["Employés actifs", data.employes.actifs, "text-purple-700", "border-purple-200"],
    ["Total employés", data.employes.total, "text-violet-700", "border-violet-200"],
    ["Contrats", data.contrats.total, "text-orange-700", "border-orange-200"],
    ["Missions total", data.missions.total, "text-cyan-700", "border-cyan-200"],
    ["Missions en cours", data.missions.en_cours, "text-teal-700", "border-teal-200"],
    ["Missions terminées", data.missions.terminees, "text-lime-700", "border-lime-200"],
    ["Paiements", data.paiements.total, "text-slate-700", "border-slate-200"],
    ["Montant total", `Ar ${Number(data.paiements.montant_total).toLocaleString()}`, "text-blue-700", "border-blue-200"],
    ["Montant payé", `Ar ${Number(data.paiements.montant_paye).toLocaleString()}`, "text-green-700", "border-green-200"],
    ["Montant en attente", `Ar ${Number(data.paiements.montant_en_attente).toLocaleString()}`, "text-red-600", "border-red-200"],
    ["Évaluations", data.evaluations.total, "text-yellow-700", "border-yellow-200"],
    ["Attestations", data.attestations.total, "text-pink-700", "border-pink-200"],
  ];

  const autres = Math.max(
    data.candidatures.total - data.candidatures.selectionnes - data.candidatures.non_retenus,
    0
  );

  const pieData = [
    { name: "Sélectionnés", value: data.candidatures.selectionnes },
    { name: "Non retenus", value: data.candidatures.non_retenus },
    { name: "Autres", value: autres },
  ];

  const lineData = [
    { name: "Offres", taux: data.offres.total },
    { name: "Candidats", taux: data.candidats.total },
    { name: "Candidatures", taux: data.candidatures.total },
    { name: "Sélectionnés", taux: data.candidatures.selectionnes },
    { name: "Employés", taux: data.employes.actifs },
  ];

  const paymentData = [
    {
      name: "Paiements",
      "Montant payé": Number(data.paiements.montant_paye),
      "En attente": Number(data.paiements.montant_en_attente),
    },
  ];

  const COLORS = ["#2563eb", "#ef4444", "#22c55e"];

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-center text-sm font-extrabold text-[#081f5c] mb-5 uppercase">
            Tableau de bord — Vue globale
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map(([title, value, color, border]) => (
              <div
                key={title}
                className={`rounded-xl border ${border} bg-white p-4 text-center shadow-sm hover:shadow-md transition`}
              >
                <p className={`text-xs font-extrabold ${color}`}>{title}</p>
                <h3 className={`text-xl font-extrabold ${color} mt-2`}>
                  {value}
                </h3>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ChartBox title="Répartition des candidatures">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Évolution du processus">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="taux"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Paiements & Soldes">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Montant payé" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="En attente" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>
      </div>
    </MainLayout>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default Dashboard;