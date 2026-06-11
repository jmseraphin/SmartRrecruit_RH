import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Attestations() {
  const [attestations, setAttestations] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employe_id: "",
    mission_id: "",
    mois_mission: "",
    intitule_travail:
      "pour la mise en œuvre des activités de Transfert Monétaire Non Conditionnel (TMNC)",
    commune: "",
    district: "",
    region: "",
  });

  const loadData = async () => {
    try {
      const [attRes, empRes, misRes] = await Promise.all([
        api.get("/attestations/"),
        api.get("/employes/"),
        api.get("/missions/"),
      ]);

      setAttestations(attRes.data);
      setEmployes(empRes.data);
      setMissions(misRes.data);
    } catch {
      setAttestations([]);
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

  const filteredAttestations = attestations.filter((a) => {
    const q = search.toLowerCase();
    const employe = getEmploye(a.employe_id);
    const mission = getMission(a.mission_id);

    return (
      String(a.id).includes(q) ||
      String(a.employe_id).includes(q) ||
      String(a.mission_id || "").includes(q) ||
      (a.statut || "").toLowerCase().includes(q) ||
      (employe?.nom || "").toLowerCase().includes(q) ||
      (employe?.prenom || "").toLowerCase().includes(q) ||
      (employe?.email || "").toLowerCase().includes(q) ||
      (employe?.telephone || "").toLowerCase().includes(q) ||
      (employe?.poste || "").toLowerCase().includes(q) ||
      (mission?.titre || "").toLowerCase().includes(q) ||
      (mission?.mois_mission || "").toLowerCase().includes(q) ||
      (mission?.commune || "").toLowerCase().includes(q) ||
      (mission?.district || "").toLowerCase().includes(q) ||
      (mission?.region || "").toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm({
      employe_id: "",
      mission_id: "",
      mois_mission: "",
      intitule_travail:
        "pour la mise en œuvre des activités de Transfert Monétaire Non Conditionnel (TMNC)",
      commune: "",
      district: "",
      region: "",
    });
  };

  const remplirDepuisMission = (missionId) => {
    const mission = missions.find((m) => Number(m.id) === Number(missionId));

    if (!mission) {
      setForm({ ...form, mission_id: missionId });
      return;
    }

    setForm({
      ...form,
      mission_id: missionId,
      employe_id: String(mission.employe_id),
      mois_mission: mission.mois_mission || "",
      intitule_travail: mission.intitule_projet || form.intitule_travail,
      commune: mission.commune || "",
      district: mission.district || "",
      region: mission.region || "",
    });
  };

  const genererAttestation = async (e) => {
    e.preventDefault();

    const data = new FormData();

    if (form.mission_id) {
      data.append("mission_id", form.mission_id);
    }

    data.append("mois_mission", form.mois_mission);
    data.append("intitule_travail", form.intitule_travail);
    data.append("commune", form.commune);
    data.append("district", form.district);
    data.append("region", form.region);

    try {
      await api.post(`/attestations/generer/${form.employe_id}`, data);
      setShowForm(false);
      resetForm();
      loadData();
      alert("Attestation générée avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de générer l’attestation.");
    }
  };

  const openAttestation = async (id) => {
    try {
      const res = await api.get(`/attestations/${id}/download`, {
        responseType: "blob",
      });

      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      window.open(fileURL, "_blank");
    } catch {
      alert("Impossible d’ouvrir l’attestation.");
    }
  };

  const downloadAttestation = async (id) => {
    try {
      const res = await api.get(`/attestations/${id}/download`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attestation_${id}.pdf`;
      link.click();
    } catch {
      alert("Impossible de télécharger l’attestation.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Attestations
            </h2>
            <p className="text-xs text-slate-500">
              Génération automatique des attestations de travail avec QR code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom, mission, région..."
              className="w-72 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
            />

            <button
              onClick={() => setShowForm(!showForm)}
              className="h-9 bg-[#081f5c] text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-900"
            >
              {showForm ? "Fermer" : "+ Générer attestation"}
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={genererAttestation}
            className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
              Nouvelle attestation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Mission
                </label>
                <select
                  value={form.mission_id}
                  onChange={(e) => remplirDepuisMission(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Choisir mission</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titre} - {m.mois_mission || "Mission"}
                    </option>
                  ))}
                </select>
              </div>

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

              <Input label="Mois mission" value={form.mois_mission} onChange={(v) => setForm({ ...form, mois_mission: v })} />
              <Input label="Commune" value={form.commune} onChange={(v) => setForm({ ...form, commune: v })} />
              <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
              <Input label="Région" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-xs font-bold text-slate-700">
                Intitulé travail
              </label>
              <textarea
                value={form.intitule_travail}
                onChange={(e) => setForm({ ...form, intitule_travail: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                rows="3"
                required
              />
            </div>

            <button className="mt-5 h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
              Générer attestation
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : filteredAttestations.length === 0 ? (
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
                  <th className="px-3 py-2 text-left">Mission</th>
                  <th className="px-3 py-2 text-left">Lieu</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-center">Date création</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttestations.map((a, index) => {
                  const employe = getEmploye(a.employe_id);
                  const mission = getMission(a.mission_id);

                  return (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {employe ? `${employe.nom} ${employe.prenom}` : `Employé #${a.employe_id}`}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {mission ? mission.titre : a.mission_id || "-"}
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {mission
                          ? [mission.commune, mission.district, mission.region].filter(Boolean).join(", ")
                          : "-"}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Badge statut={a.statut} />
                      </td>

                      <td className="px-3 py-2 text-center text-slate-600">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openAttestation(a.id)}
                            className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
                          >
                            Voir
                          </button>

                          <button
                            onClick={() => downloadAttestation(a.id)}
                            className="h-7 px-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold hover:bg-green-100"
                          >
                            Télécharger
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

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
        required
      />
    </div>
  );
}

function Badge({ statut }) {
  return (
    <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold bg-green-50 text-green-700 border-green-200">
      {statut}
    </span>
  );
}

export default Attestations;