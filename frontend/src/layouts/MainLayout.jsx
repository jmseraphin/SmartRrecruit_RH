import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 overflow-y-auto text-slate-900 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;