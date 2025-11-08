export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Bem-vindo ao seu site
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          A página está pronta para usar. Customize conforme necessário.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Começar
          </button>
          <button className="px-8 py-3 border-2 border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition">
            Saiba mais
          </button>
        </div>
      </div>
    </main>
  );
}
