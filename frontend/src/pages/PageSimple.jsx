import MainLayout from "../layouts/MainLayout";

function PageSimple({ title }) {
  return (
    <MainLayout>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-2xl font-bold text-blue-950">{title}</h2>
        <p className="text-gray-500 mt-2">
          Page en cours de construction.
        </p>
      </div>
    </MainLayout>
  );
}

export default PageSimple;