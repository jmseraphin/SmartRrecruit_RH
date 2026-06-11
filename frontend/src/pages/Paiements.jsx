import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employe_id: "",
    mission_id: "",
    montant: "",
    type_paiement: "SALAIRE",
  });

  const loadData = async () => {
    try {
      const [paiementsRes, employesRes, missionsRes] = await Promise.all([
        api.get("/paiements/"),
        api.get("/employes/"),
        api.get("/missions/"),
      ]);

      setPaiements(paiementsRes.data);
      setEmployes(employesRes.data);
      setMissions(missionsRes.data);
    } catch {
      setPaiements([]);
      setEmployes([]);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmploye = (id) => employes.find((e) => Number(e.id) === Number(id));
  const getMission = (id) => missions.find((m) => Number(m.id) === Number(id));

  const resetForm = () => {
    setForm({
      employe_id: "",
      mission_id: "",
      montant: "",
      type_paiement: "SALAIRE",
    });
  };

  const creerPaiement = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("montant", form.montant);
    data.append("type_paiement", form.type_paiement);

    if (form.mission_id) {
      data.append("mission_id", form.mission_id);
    }

    try {
      await api.post(`/paiements/creer/${form.employe_id}`, data);
      setShowForm(false);
      resetForm();
      loadData();
      alert("Paiement créé avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de créer le paiement.");
    }
  };

  const marquerPaye = async (paiementId) => {
    const data = new FormData();
    data.append("date_paiement", new Date().toISOString().slice(0, 10));

    try {
      const res = await api.put(`/paiements/${paiementId}/payer`, data);
      await loadData();

      if (res.data.email_envoye) {
        alert("Paiement marqué PAYÉ. Reçu généré et envoyé par email.");
      } else {
        alert("Paiement marqué PAYÉ. Reçu généré.");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de valider le paiement.");
    }
  };

  const openRecu = async (paiementId) => {
    try {
      const res = await api.get(`/paiements/${paiementId}/download`, {
        responseType: "blob",
      });

      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      window.open(fileURL, "_blank");
    } catch {
      alert("Reçu non disponible.");
    }
  };

  const downloadRecu = async (paiementId) => {
    try {
      const res = await api.get(`/paiements/${paiementId}/download`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `recu_paiement_${paiementId}.pdf`;
      link.click();
    } catch {
      alert("Impossible de télécharger le reçu.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Solde & Paiements
            </h2>
            <p className="text-xs text-slate-500">
              Création, validation et génération automatique des reçus de paiement.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 bg-[#081f5c] text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-900"
          >
            {showForm ? "Fermer" : "+ Nouveau paiement"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={creerPaiement}
            className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
              Créer un paiement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Employé
                </label>
                <select
                  value={form.employe_id}
                  onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Choisir employé</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom} {e.prenom} - {e.poste}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Mission
                </label>
                <select
                  value={form.mission_id}
                  onChange={(e) => setForm({ ...form, mission_id: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Aucune mission</option>
                  {missions
                    .filter((m) => !form.employe_id || Number(m.employe_id) === Number(form.employe_id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titre} - {m.mois_mission || "Mission"}
                      </option>
                    ))}
                </select>
              </div>

              <Input
                label="Montant"
                type="number"
                value={form.montant}
                onChange={(v) => setForm({ ...form, montant: v })}
              />

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Type paiement
                </label>
                <select
                  value={form.type_paiement}
                  onChange={(e) => setForm({ ...form, type_paiement: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="SALAIRE">SALAIRE</option>
                  <option value="AVANCE">AVANCE</option>
                  <option value="PRIME">PRIME</option>
                </select>
              </div>
            </div>

            <button className="mt-5 h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
              Enregistrer paiement
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : paiements.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucun paiement disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Employé</th>
                  <th className="px-3 py-2 text-left">Mission</th>
                  <th className="px-3 py-2 text-center">Type</th>
                  <th className="px-3 py-2 text-right">Montant</th>
                  <th className="px-3 py-2 text-center">Date</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paiements.map((p, index) => {
                  const employe = getEmploye(p.employe_id);
                  const mission = getMission(p.mission_id);

                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {employe ? `${employe.nom} ${employe.prenom}` : `Employé #${p.employe_id}`}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {mission ? mission.titre : "-"}
                      </td>

                      <td className="px-3 py-2 text-center text-slate-700">
                        {p.type_paiement}
                      </td>

                      <td className="px-3 py-2 text-right font-extrabold text-[#081f5c]">
                        Ar {Number(p.montant).toLocaleString()}
                      </td>

                      <td className="px-3 py-2 text-center text-slate-600">
                        {p.date_paiement || "-"}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Badge statut={p.statut} />
                      </td>

                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          {p.statut !== "PAYE" && (
                            <button
                              onClick={() => marquerPaye(p.id)}
                              className="h-7 px-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold hover:bg-green-100"
                            >
                              Payer
                            </button>
                          )}

                          {p.statut === "PAYE" && (
                            <>
                              <button
                                onClick={() => openRecu(p.id)}
                                className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
                              >
                                Voir
                              </button>

                              <button
                                onClick={() => downloadRecu(p.id)}
                                className="h-7 px-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold hover:bg-purple-100"
                              >
                                Reçu
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
        required
      />
    </div>
  );
}

function Badge({ statut }) {
  const styles = {
    EN_ATTENTE: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PAYE: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles[statut] || styles.EN_ATTENTE}`}>
      {statut}
    </span>
  );
}

export default Paiements;