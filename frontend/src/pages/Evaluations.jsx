import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employe_id: "",
    note: "",
    commentaire: "",
  });

  const loadData = async () => {
    try {
      const [evalRes, empRes] = await Promise.all([
        api.get("/evaluations/"),
        api.get("/employes/"),
      ]);

      setEvaluations(evalRes.data);
      setEmployes(empRes.data);
    } catch {
      setEvaluations([]);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmploye = (id) => employes.find((e) => Number(e.id) === Number(id));

  const resetForm = () => {
    setForm({
      employe_id: "",
      note: "",
      commentaire: "",
    });
  };

  const creerEvaluation = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("note", form.note);

    if (form.commentaire) {
      data.append("commentaire", form.commentaire);
    }

    try {
      await api.post(`/evaluations/creer/${form.employe_id}`, data);
      setShowForm(false);
      resetForm();
      loadData();
      alert("Évaluation enregistrée avec succès.");
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible d’enregistrer l’évaluation.");
    }
  };

  const modifierEvaluation = async (evaluation) => {
    const note = prompt("Nouvelle note /20 :", evaluation.note);

    if (!note) return;

    const commentaire = prompt("Commentaire :", evaluation.commentaire || "");

    const data = new FormData();
    data.append("note", note);

    if (commentaire) {
      data.append("commentaire", commentaire);
    }

    try {
      await api.put(`/evaluations/${evaluation.id}`, data);
      loadData();
      alert("Évaluation mise à jour.");
    } catch {
      alert("Impossible de modifier l’évaluation.");
    }
  };

  const supprimerEvaluation = async (id) => {
    if (!confirm("Supprimer cette évaluation ?")) return;

    try {
      await api.delete(`/evaluations/${id}`);
      loadData();
    } catch {
      alert("Impossible de supprimer l’évaluation.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Évaluations
            </h2>
            <p className="text-xs text-slate-500">
              Suivi de la performance des employés après mission.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 bg-[#081f5c] text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-900"
          >
            {showForm ? "Fermer" : "+ Nouvelle évaluation"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={creerEvaluation}
            className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
              Créer une évaluation
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

              <Input
                label="Note /20"
                type="number"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
              />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-xs font-bold text-slate-700">
                Commentaire
              </label>
              <textarea
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                rows="3"
              />
            </div>

            <button className="mt-5 h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
              Enregistrer évaluation
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune évaluation disponible.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Employé</th>
                  <th className="px-3 py-2 text-center">Note</th>
                  <th className="px-3 py-2 text-center">Appréciation</th>
                  <th className="px-3 py-2 text-left">Commentaire</th>
                  <th className="px-3 py-2 text-center">Date</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {evaluations.map((ev, index) => {
                  const employe = getEmploye(ev.employe_id);

                  return (
                    <tr key={ev.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {employe ? `${employe.nom} ${employe.prenom}` : `Employé #${ev.employe_id}`}
                      </td>

                      <td className="px-3 py-2 text-center font-extrabold text-blue-700">
                        {ev.note}/20
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Badge appreciation={ev.appreciation} />
                      </td>

                      <td className="px-3 py-2 text-slate-600">
                        {ev.commentaire || "-"}
                      </td>

                      <td className="px-3 py-2 text-center text-slate-600">
                        {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : "-"}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => modifierEvaluation(ev)}
                            className="h-7 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => supprimerEvaluation(ev.id)}
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

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        min="0"
        max="20"
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
        required
      />
    </div>
  );
}

function Badge({ appreciation }) {
  const styles = {
    EXCELLENT: "bg-green-50 text-green-700 border-green-200",
    TRES_BIEN: "bg-blue-50 text-blue-700 border-blue-200",
    BIEN: "bg-yellow-50 text-yellow-700 border-yellow-200",
    INSUFFISANT: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles[appreciation] || styles.BIEN}`}>
      {appreciation}
    </span>
  );
}

export default Evaluations;