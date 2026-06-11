import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";
import { Search } from "lucide-react";

function Candidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/candidatures/")
      .then((res) => setCandidatures(res.data))
      .catch(() => setCandidatures([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCandidatures = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return candidatures;

    return candidatures.filter((c) => {
      const reference = (
        c.reference_offre || `Offre #${c.offre_id || ""}`
      ).toLowerCase();

      const nomPrenom = `${c.nom || ""} ${c.prenom || ""}`.toLowerCase();

      const email = (c.email || "").toLowerCase();
      const telephone = (c.telephone || "").toLowerCase();

      return (
        reference.includes(query) ||
        nomPrenom.includes(query) ||
        email.includes(query) ||
        telephone.includes(query)
      );
    });
  }, [candidatures, search]);

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Candidatures
            </h2>
            <p className="text-xs text-slate-500">
              Liste des candidatures reçues.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une candidature..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : filteredCandidatures.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune candidature disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Réf. offre</th>
                  <th className="px-3 py-2 text-left">Nom & prénom</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Téléphone</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidatures.map((c, index) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                      {c.rang || index + 1}
                    </td>

                    <td className="px-3 py-2 font-bold text-[#081f5c]">
                      {c.reference_offre || `Offre #${c.offre_id}`}
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {c.nom || "-"} {c.prenom || ""}
                    </td>

                    <td className="px-3 py-2 text-slate-600">
                      {c.email || "-"}
                    </td>

                    <td className="px-3 py-2 text-slate-600">
                      {c.telephone || "-"}
                    </td>

                    <td className="px-3 py-2 text-center font-extrabold text-blue-700">
                      {c.score}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <Badge statut={c.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

function Badge({ statut }) {
  const styles = {
    EN_ATTENTE: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SELECTIONNE: "bg-green-50 text-green-700 border-green-200",
    NON_RETENU: "bg-red-50 text-red-700 border-red-200",
    EMPLOYE: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
        styles[statut] || styles.EN_ATTENTE
      }`}
    >
      {statut}
    </span>
  );
}

export default Candidatures;