export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} <span className="text-cyan-400/70">BridgeBot</span> — IoT Interdisciplinary Learning Platform
        </p>
        <p className="text-slate-600 text-xs">
          Braude College of Engineering
        </p>
      </div>
    </footer>
  );
}
