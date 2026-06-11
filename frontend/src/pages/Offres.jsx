import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function Offres() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    titre: "",
    poste: "",
    description: "",
    lieu: "",
    type_contrat: "CDI",
    experience_min: 0,
    niveau_etude: "",
    competences_requises: "",
    date_debut_reception: "",
    date_fin_reception: "",
    critere_experience: 30,
    critere_competences: 40,
    critere_formation: 30,
  });

  const offresFiltrees = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return offres;

    return offres.filter((offre) =>
      [
        offre.reference,
        offre.titre,
        offre.poste,
        offre.lieu,
        offre.type_contrat,
        offre.statut,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [offres, search]);

  const loadOffres = async () => {
    try {
      const res = await api.get("/offres/");
      setOffres(res.data);
    } catch {
      setOffres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
  }, []);

  const resetForm = () => {
    setForm({
      titre: "",
      poste: "",
      description: "",
      lieu: "",
      type_contrat: "CDI",
      experience_min: 0,
      niveau_etude: "",
      competences_requises: "",
      date_debut_reception: "",
      date_fin_reception: "",
      critere_experience: 30,
      critere_competences: 40,
      critere_formation: 30,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const total =
      Number(form.critere_experience) +
      Number(form.critere_competences) +
      Number(form.critere_formation);

    if (total !== 100) {
      setError("La somme des critères doit être égale à 100.");
      return;
    }

    try {
      await api.post("/offres/", {
        titre: form.titre,
        poste: form.poste,
        description: form.description,
        lieu: form.lieu,
        type_contrat: form.type_contrat,
        experience_min: Number(form.experience_min),
        niveau_etude: form.niveau_etude || null,
        competences_requises: form.competences_requises
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        criteres_score: {
          experience: Number(form.critere_experience),
          competences: Number(form.critere_competences),
          formation: Number(form.critere_formation),
        },
        date_debut_reception: form.date_debut_reception,
        date_fin_reception: form.date_fin_reception,
      });

      setShowForm(false);
      resetForm();
      loadOffres();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Erreur lors de la création de l'offre."
      );
    }
  };

  const annulerOffre = async (id) => {
    if (!confirm("Annuler cette offre ?")) return;

    try {
      await api.delete(`/offres/${id}`);
      loadOffres();
    } catch {
      alert("Impossible d'annuler cette offre.");
    }
  };

  return (
    <MainLayout>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#081f5c]">
              Offres & Postes
            </h2>
            <p className="text-xs text-slate-500">
              Gestion des offres de recrutement et des postes ouverts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none shadow-sm focus:border-[#081f5c] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="h-9 bg-[#081f5c] text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-900 whitespace-nowrap"
            >
              {showForm ? "Fermer" : "+ Nouvelle offre"}
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#081f5c] mb-4">
              Créer une offre
            </h3>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl mb-4 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Titre" value={form.titre} onChange={(v) => setForm({ ...form, titre: v })} />
              <Input label="Poste" value={form.poste} onChange={(v) => setForm({ ...form, poste: v })} />
              <Input label="Lieu" value={form.lieu} onChange={(v) => setForm({ ...form, lieu: v })} />
              <Select label="Type contrat" value={form.type_contrat} onChange={(v) => setForm({ ...form, type_contrat: v })} />
              <Input label="Expérience min" type="number" value={form.experience_min} onChange={(v) => setForm({ ...form, experience_min: v })} />
              <Input label="Niveau étude" value={form.niveau_etude} onChange={(v) => setForm({ ...form, niveau_etude: v })} />
              <Input label="Date début réception" type="date" value={form.date_debut_reception} onChange={(v) => setForm({ ...form, date_debut_reception: v })} />
              <Input label="Date fin réception" type="date" value={form.date_fin_reception} onChange={(v) => setForm({ ...form, date_fin_reception: v })} />
              <Input label="Compétences séparées par virgule" value={form.competences_requises} onChange={(v) => setForm({ ...form, competences_requises: v })} />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-xs font-bold text-slate-700">
                Description
              </label>
              <textarea
                placeholder="Description de l’offre"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input label="Critère expérience %" type="number" value={form.critere_experience} onChange={(v) => setForm({ ...form, critere_experience: v })} />
              <Input label="Critère compétences %" type="number" value={form.critere_competences} onChange={(v) => setForm({ ...form, critere_competences: v })} />
              <Input label="Critère formation %" type="number" value={form.critere_formation} onChange={(v) => setForm({ ...form, critere_formation: v })} />
            </div>

            <button className="mt-5 h-9 bg-green-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-700">
              Enregistrer l’offre
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Chargement...</p>
        ) : offres.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune offre disponible.
          </div>
        ) : offresFiltrees.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-slate-50 text-sm">
            Aucune offre trouvée pour “{search}”.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left w-12">N°</th>
                  <th className="px-3 py-2 text-left">Référence</th>
                  <th className="px-3 py-2 text-left">Titre</th>
                  <th className="px-3 py-2 text-left">Poste</th>
                  <th className="px-3 py-2 text-left">Lieu</th>
                  <th className="px-3 py-2 text-center">Contrat</th>
                  <th className="px-3 py-2 text-center">Statut</th>
                  <th className="px-3 py-2 text-left">Période</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {offresFiltrees.map((offre, index) => (
                  <tr
                    key={offre.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-extrabold text-[#081f5c]">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2 font-bold text-[#081f5c]">
                      {offre.reference}
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {offre.titre}
                    </td>

                    <td className="px-3 py-2 text-slate-700">
                      {offre.poste}
                    </td>

                    <td className="px-3 py-2 text-slate-600">
                      {offre.lieu}
                    </td>

                    <td className="px-3 py-2 text-center text-slate-700">
                      {offre.type_contrat}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <Badge statut={offre.statut} />
                    </td>

                    <td className="px-3 py-2 text-slate-500">
                      {offre.date_debut_reception} → {offre.date_fin_reception}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {offre.statut !== "ANNULEE" ? (
                        <button
                          onClick={() => annulerOffre(offre.id)}
                          className="h-7 px-2 rounded-md bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold hover:bg-red-100"
                        >
                          Annuler
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
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
        required={label !== "Niveau étude"}
      />
    </div>
  );
}

function Select({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-xs font-bold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      >
        <option value="CDI">CDI</option>
        <option value="CDD">CDD</option>
        <option value="STAGE">STAGE</option>
        <option value="FREELANCE">FREELANCE</option>
      </select>
    </div>
  );
}

function Badge({ statut }) {
  const styles = {
    OUVERTE: "bg-green-50 text-green-700 border-green-200",
    FERMEE: "bg-red-50 text-red-700 border-red-200",
    PROGRAMMEE: "bg-blue-50 text-blue-700 border-blue-200",
    ANNULEE: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
        styles[statut] || styles.ANNULEE
      }`}
    >
      {statut}
    </span>
  );
}

export default Offres;