import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Rapports() {
  const [soldes, setSoldes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSoldes = async () => {
    try {
      const res = await api.get("/soldes/");
      setSoldes(res.data);
    } catch {
      setSoldes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSoldes();
  }, []);

  const filteredSoldes = soldes.filter((s) => {
    const q = search.toLowerCase();

    return (
      String(s.employe_id).includes(q) ||
      (s.nom || "").toLowerCase().includes(q) ||
      (s.prenom || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.telephone || "").toLowerCase().includes(q) ||
      (s.poste || "").toLowerCase().includes(q)
    );
  });

  const downloadRapport = async (type) => {
    try {
      const res = await api.get(`/rapports/${type}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");

      link.href = url;
      link.download = `rapport_${type}.pdf`;
      link.click();
    } catch {
      alert("Impossible de télécharger le rapport.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Rapports & Statistiques
            </h2>
            <p className="text-xs text-slate-500">
              Export PDF et synthèse des soldes par employé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RapportCard
              title="Rapport candidatures"
              description="Liste des candidatures avec score et statut."
              onClick={() => downloadRapport("candidatures")}
            />

            <RapportCard
              title="Rapport employés"
              description="Liste des employés intégrés dans le système."
              onClick={() => downloadRapport("employes")}
            />

            <RapportCard
              title="Rapport paiements"
              description="Historique des paiements, montants et statuts."
              onClick={() => downloadRapport("paiements")}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-[#081f5c]">
                Soldes des employés
              </h3>
              <p className="text-xs text-slate-500">
                Total payé, montant en attente et solde global.
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom, email, poste..."
              className="w-72 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : filteredSoldes.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
              Aucun résultat trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="px-3 py-2 text-left w-12">N°</th>
                    <th className="px-3 py-2 text-left">Employé</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Téléphone</th>
                    <th className="px-3 py-2 text-left">Poste</th>
                    <th className="px-3 py-2 text-right">Total payé</th>
                    <th className="px-3 py-2 text-right">En attente</th>
                    <th className="px-3 py-2 text-right">Solde total</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSoldes.map((s, index) => (
                    <tr key={s.employe_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {s.nom || "-"} {s.prenom || ""}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {s.email || "-"}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {s.telephone || "-"}
                      </td>

                      <td className="px-3 py-2 text-slate-700">
                        {s.poste}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-green-700">
                        Ar {Number(s.total_paye).toLocaleString()}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-yellow-700">
                        Ar {Number(s.total_en_attente).toLocaleString()}
                      </td>

                      <td className="px-3 py-2 text-right font-extrabold text-[#081f5c]">
                        Ar {Number(s.solde_total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

function RapportCard({ title, description, onClick }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
      <h3 className="text-sm font-extrabold text-[#081f5c] mb-2">
        {title}
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        {description}
      </p>

      <button
        onClick={onClick}
        className="h-8 px-3 rounded-lg bg-[#081f5c] text-white text-xs font-bold hover:bg-blue-900"
      >
        Télécharger PDF
      </button>
    </div>
  );
}

export default Rapports;