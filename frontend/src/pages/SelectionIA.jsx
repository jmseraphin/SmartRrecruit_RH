import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function SelectionIA() {
  const [offres, setOffres] = useState([]);
  const [offreId, setOffreId] = useState("");
  const [classement, setClassement] = useState([]);
  const [range, setRange] = useState("1-1");
  const [loading, setLoading] = useState(false);

  const loadOffres = async () => {
    try {
      const res = await api.get("/offres/");
      setOffres(res.data);

      if (res.data.length > 0) {
        setOffreId(String(res.data[0].id));
      }
    } catch {
      setOffres([]);
    }
  };

  const loadRanking = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const res = await api.get(`/candidatures/offre/${id}/ranking`);
      setClassement(res.data.classement || []);
    } catch {
      setClassement([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
  }, []);

  useEffect(() => {
    if (offreId) {
      loadRanking(offreId);
    }
  }, [offreId]);

  const autoSelect = async () => {
    if (!offreId) {
      alert("Veuillez choisir une offre.");
      return;
    }

    const parts = range.split("-");
    const nombre = Number(parts[1] || parts[0]);

    if (!nombre || nombre < 1) {
      alert("Format invalide. Exemple : 1-30");
      return;
    }

    const data = new FormData();
    data.append("nombre", nombre);

    try {
      await api.post(`/candidatures/offre/${offreId}/auto-select`, data);
      await loadRanking(offreId);
      alert("Sélection automatique effectuée.");
    } catch {
      alert("Impossible d’effectuer la sélection automatique.");
    }
  };

  const integrerEmploye = async (candidatureId) => {
    const data = new FormData();
    data.append("date_embauche", new Date().toISOString().slice(0, 10));

    try {
      await api.post(`/employes/integrer/${candidatureId}`, data);
      await loadRanking(offreId);
      alert("Candidat intégré comme employé.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible d’intégrer ce candidat.");
    }
  };

  const envoyerEmail = async (candidat) => {
    alert(`Email de sélection prêt pour : ${candidat.email}`);
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Sélection IA
            </h2>
            <p className="text-xs text-slate-500">
              Classement intelligent, auto-sélection et intégration des meilleurs candidats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={offreId}
              onChange={(e) => setOffreId(e.target.value)}
              className="h-9 bg-white text-slate-800 border border-slate-300 rounded-lg px-3 text-xs font-semibold"
            >
              <option value="">Choisir offre</option>
              {offres.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.reference} - {o.titre}
                </option>
              ))}
            </select>

            <input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="1-30"
              className="h-9 w-20 bg-white text-slate-800 border border-slate-300 rounded-lg px-3 text-xs font-semibold"
            />

            <button
              onClick={autoSelect}
              className="h-9 bg-green-600 text-white px-3 rounded-lg text-xs font-bold hover:bg-green-700"
            >
              Auto-sélect.
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : classement.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune candidature pour cette offre.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">Rang</th>
                  <th className="px-3 py-2 text-left">Nom & prénom</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Téléphone</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {classement.map((c, index) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                      {c.rang || index + 1}
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

                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        {c.statut === "SELECTIONNE" && (
                          <>
                            <button
                              onClick={() => envoyerEmail(c)}
                              className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
                            >
                              Email
                            </button>

                            <button
                              onClick={() => integrerEmploye(c.id)}
                              className="h-7 px-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold hover:bg-green-100"
                            >
                              Intégrer
                            </button>
                          </>
                        )}

                        {c.statut !== "SELECTIONNE" && (
                          <span className="text-[11px] text-slate-400">
                            En attente
                          </span>
                        )}
                      </div>
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
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles[statut] || styles.EN_ATTENTE}`}>
      {statut}
    </span>
  );
}

export default SelectionIA;