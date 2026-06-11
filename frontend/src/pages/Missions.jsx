import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Missions() {
  const [missions, setMissions] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employe_id: "",
    titre: "",
    description: "",
    mois_mission: "",
    intitule_projet:
      "pour la mise en œuvre des activités de Transfert Monétaire Non Conditionnel (TMNC)",
    commune: "",
    district: "",
    region: "",
    date_debut: "",
    date_fin: "",
  });

  const loadData = async () => {
    try {
      const [missionsRes, employesRes] = await Promise.all([
        api.get("/missions/"),
        api.get("/employes/"),
      ]);

      setMissions(missionsRes.data);
      setEmployes(employesRes.data);
    } catch {
      setMissions([]);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmploye = (id) => {
    return employes.find((e) => Number(e.id) === Number(id));
  };

  const resetForm = () => {
    setForm({
      employe_id: "",
      titre: "",
      description: "",
      mois_mission: "",
      intitule_projet:
        "pour la mise en œuvre des activités de Transfert Monétaire Non Conditionnel (TMNC)",
      commune: "",
      district: "",
      region: "",
      date_debut: "",
      date_fin: "",
    });
  };

  const assignerMission = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") data.append(key, value);
    });

    try {
      await api.post(`/missions/assigner/${form.employe_id}`, data);
      setShowForm(false);
      resetForm();
      loadData();
      alert("Mission assignée avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible d’assigner la mission.");
    }
  };

  const updateStatut = async (missionId, statut) => {
    const data = new FormData();
    data.append("statut", statut);

    try {
      await api.put(`/missions/${missionId}/statut`, data);
      loadData();
    } catch {
      alert("Impossible de modifier le statut.");
    }
  };

  const deleteMission = async (missionId) => {
    if (!confirm("Supprimer cette mission ?")) return;

    try {
      await api.delete(`/missions/${missionId}`);
      loadData();
    } catch {
      alert("Impossible de supprimer la mission.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Missions / Tâches
            </h2>
            <p className="text-xs text-slate-500">
              Attribution et suivi des missions des employés.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 bg-[#081f5c] text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-900"
          >
            {showForm ? "Fermer" : "+ Assigner mission"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={assignerMission}
            className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
              Nouvelle mission
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Input label="Titre mission" value={form.titre} onChange={(v) => setForm({ ...form, titre: v })} />
              <Input label="Mois mission" value={form.mois_mission} onChange={(v) => setForm({ ...form, mois_mission: v })} />
              <Input label="Commune" value={form.commune} onChange={(v) => setForm({ ...form, commune: v })} />
              <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
              <Input label="Région" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
              <Input label="Date début" type="date" value={form.date_debut} onChange={(v) => setForm({ ...form, date_debut: v })} />
              <Input label="Date fin" type="date" required={false} value={form.date_fin} onChange={(v) => setForm({ ...form, date_fin: v })} />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-xs font-bold text-slate-700">
                Intitulé projet
              </label>
              <textarea
                value={form.intitule_projet}
                onChange={(e) => setForm({ ...form, intitule_projet: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                rows="2"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-xs font-bold text-slate-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                rows="3"
              />
            </div>

            <button className="mt-5 h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
              Enregistrer mission
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : missions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune mission disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Employé</th>
                  <th className="px-3 py-2 text-left">Titre</th>
                  <th className="px-3 py-2 text-left">Mois</th>
                  <th className="px-3 py-2 text-left">Lieu</th>
                  <th className="px-3 py-2 text-center">Début</th>
                  <th className="px-3 py-2 text-center">Fin</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {missions.map((m, index) => {
                  const employe = getEmploye(m.employe_id);

                  return (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {employe ? `${employe.nom} ${employe.prenom}` : `Employé #${m.employe_id}`}
                      </td>

                      <td className="px-3 py-2 text-slate-700">
                        {m.titre}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {m.mois_mission || "-"}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {[m.commune, m.district, m.region].filter(Boolean).join(", ") || "-"}
                      </td>

                      <td className="px-3 py-2 text-center text-slate-600">
                        {m.date_debut}
                      </td>

                      <td className="px-3 py-2 text-center text-slate-600">
                        {m.date_fin || "-"}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Badge statut={m.statut} />
                      </td>

                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <select
                            value={m.statut}
                            onChange={(e) => updateStatut(m.id, e.target.value)}
                            className="h-7 bg-white text-slate-800 border border-slate-300 rounded-md px-2 text-[11px]"
                          >
                            <option value="EN_COURS">EN_COURS</option>
                            <option value="TERMINEE">TERMINEE</option>
                            <option value="ANNULEE">ANNULEE</option>
                          </select>

                          <button
                            onClick={() => deleteMission(m.id)}
                            className="h-7 px-2 rounded-md bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold hover:bg-red-100"
                          >
                            Suppr.
                          </button>
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

function Input({ label, value, onChange, type = "text", required = true }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function Badge({ statut }) {
  const styles = {
    EN_COURS: "bg-blue-50 text-blue-700 border-blue-200",
    TERMINEE: "bg-green-50 text-green-700 border-green-200",
    ANNULEE: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles[statut] || styles.EN_COURS}`}>
      {statut}
    </span>
  );
}

export default Missions;