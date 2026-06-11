import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Employes() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEmployes = async () => {
    try {
      const res = await api.get("/employes/");
      setEmployes(res.data);
    } catch {
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  const genererContrat = async (employeId) => {
    const dateDebut = prompt("Date début contrat (YYYY-MM-DD) :", new Date().toISOString().slice(0, 10));

    if (!dateDebut) return;

    const dateFin = prompt("Date fin contrat (YYYY-MM-DD) ou laisser vide :", "");

    const data = new FormData();
    data.append("date_debut", dateDebut);

    if (dateFin) {
      data.append("date_fin", dateFin);
    }

    try {
      await api.post(`/contrats/generer/${employeId}`, data);
      alert("Contrat généré avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de générer le contrat.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#081f5c]">
            Employés
          </h2>
          <p className="text-xs text-slate-500">
            Liste des candidats intégrés comme employés.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : employes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucun employé disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Nom & prénom</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Téléphone</th>
                  <th className="px-3 py-2 text-left">Réf. offre</th>
                  <th className="px-3 py-2 text-left">Poste</th>
                  <th className="px-3 py-2 text-center">Date embauche</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {employes.map((e, index) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {e.nom || "-"} {e.prenom || ""}
                    </td>

                    <td className="px-3 py-2 text-slate-600">
                      {e.email || "-"}
                    </td>

                    <td className="px-3 py-2 text-slate-600">
                      {e.telephone || "-"}
                    </td>

                    <td className="px-3 py-2 font-bold text-[#081f5c]">
                      {e.reference_offre || `Offre #${e.offre_id}`}
                    </td>

                    <td className="px-3 py-2 text-slate-700">
                      {e.poste}
                    </td>

                    <td className="px-3 py-2 text-center text-slate-600">
                      {e.date_embauche || "-"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <Badge statut={e.statut} />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => genererContrat(e.id)}
                        className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
                      >
                        Générer contrat
                      </button>
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
    ACTIF: "bg-green-50 text-green-700 border-green-200",
    INACTIF: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles[statut] || styles.ACTIF}`}>
      {statut}
    </span>
  );
}

export default Employes;