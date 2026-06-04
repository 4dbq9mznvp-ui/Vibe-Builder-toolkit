export function DashboardHero() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-12 text-white shadow-2xl">
      <p className="mb-4 text-sm font-bold uppercase tracking-widest">AI POWERED PLATFORM</p>
      <h1 className="mb-6 text-6xl font-black leading-none">
        Unlock the future of productivity
      </h1>
      <p className="mb-8 max-w-2xl text-xl opacity-80">
        Our revolutionary solution helps you streamline everything with cutting-edge AI.
      </p>
      <div className="grid grid-cols-3 gap-6">
        {['Fast', 'Smart', 'Powerful'].map((label) => (
          <div className="rounded-2xl bg-white/20 p-6 backdrop-blur" key={label}>
            <h2 className="text-2xl font-bold">{label}</h2>
            <p className="mt-2 text-sm opacity-70">Lorem ipsum dolor sit amet.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
