import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContrats = async () => {
    try {
      const res = await api.get("/contrats/");
      setContrats(res.data);
    } catch {
      setContrats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContrats();
  }, []);

  const openContrat = async (contratId) => {
    try {
      const res = await api.get(`/contrats/${contratId}/download`, {
        responseType: "blob",
      });

      const fileURL = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(fileURL, "_blank");
    } catch {
      alert("Impossible d’ouvrir le contrat.");
    }
  };

  const downloadContrat = async (contratId) => {
    try {
      const res = await api.get(`/contrats/${contratId}/download`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrat_${contratId}.pdf`;
      link.click();
    } catch {
      alert("Impossible de télécharger le contrat.");
    }
  };

  const envoyerEmail = async (contratId) => {
    try {
      await api.post(`/contrats/${contratId}/send-email`);
      alert("Contrat envoyé par email avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible d’envoyer l’email.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#081f5c]">Contrats</h2>
          <p className="text-xs text-slate-500">Contrats générés automatiquement.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : contrats.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border rounded-2xl bg-slate-50 text-sm">
            Aucun contrat disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">N°</th>
                  <th className="px-3 py-2 text-left">Employé</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-center">Début</th>
                  <th className="px-3 py-2 text-center">Fin</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {contrats.map((c, index) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-[#081f5c]">{index + 1}</td>
                    <td className="px-3 py-2 font-bold text-[#081f5c]">Employé #{c.employe_id}</td>
                    <td className="px-3 py-2">{c.type_contrat}</td>
                    <td className="px-3 py-2 text-center">{c.date_debut}</td>
                    <td className="px-3 py-2 text-center">{c.date_fin || "-"}</td>
                    <td className="px-3 py-2 text-center"><Badge statut={c.statut} /></td>

                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openContrat(c.id)} className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                          Voir
                        </button>
                        <button onClick={() => downloadContrat(c.id)} className="h-7 px-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold">
                          Télécharger
                        </button>
                        <button onClick={() => envoyerEmail(c.id)} className="h-7 px-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                          Email
                        </button>
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
  return (
    <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold bg-green-50 text-green-700 border-green-200">
      {statut}
    </span>
  );
}

export default Contrats;