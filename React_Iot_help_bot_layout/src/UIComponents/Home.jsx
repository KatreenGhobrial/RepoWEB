import Header from './Header';
import { Link } from 'react-router-dom';

// Landing page that introduces the platform and shows the three main feature cards
export default function Home() {
  return (
    <>
      <Header title="Welcome to IoT Help Bot" subtitle="Your portal for robust IoT architecture and mentorship." />
      {/* Hero section with call-to-action buttons */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-10 mb-8 text-center transition-colors">
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-4">Master Your IoT Projects</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          The Socratic support platform guides you through designing, troubleshooting, and monitoring your IoT systems securely and efficiently.
        </p>
        {/* Navigation links to the main entry points of the app */}
        <div className="flex justify-center gap-4">
          <Link to="/project-setup" className="bg-slate-950 dark:bg-sky-600 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors">
            Start a Project
          </Link>
          <Link to="/socratic-bot" className="bg-slate-100 dark:bg-zinc-800 text-slate-950 dark:text-white border border-slate-200 dark:border-zinc-700 px-8 py-4 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
            Ask the Bot
          </Link>
        </div>
      </section>

      {/* Three feature highlight cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 transition-colors">
          <div className="text-4xl mb-4">🛠️</div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Architecture Setup</h3>
          <p className="text-slate-500 dark:text-slate-400">Configure your hardware, communication protocols, and server infrastructure effortlessly.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 transition-colors">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Conflict Detection</h3>
          <p className="text-slate-500 dark:text-slate-400">Automatically identify potential bottlenecks and security risks before deploying your IoT solution.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 transition-colors">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Real-time Monitoring</h3>
          <p className="text-slate-500 dark:text-slate-400">Keep an eye on device health, sensor readings, and system alerts via the mentor panel.</p>
        </div>
      </section>
    </>
  );
}
