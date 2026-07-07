// Displays a simple footer with copyright text at the bottom of every page
export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white p-6 mt-10">
      <div className="text-center">
        <p className="text-sm text-slate-400">&copy; 2026 IoT HelpBot Platform. All rights reserved.</p>
        <p className="text-sm text-slate-400 mt-2">Empowering students to build secure and robust IoT architectures.</p>
      </div>
    </footer>
  );
}
