import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: '🤖',
      title: 'Socratic Bot',
      description: 'AI-powered learning companion that guides you through IoT challenges using the Socratic method.',
      link: '/socratic-bot',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: '⚡',
      title: 'Conflict Detector',
      description: 'Automatically scan your architecture for protocol, power, and integration conflicts.',
      link: '/detect-conflict',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '📋',
      title: 'Project Setup',
      description: 'Define your IoT project components, sensors, and communication flow.',
      link: '/project-setup',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: '👥',
      title: 'Task Management',
      description: 'Assign and track interdisciplinary tasks across your team members.',
      link: '/tasks-team',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: '📚',
      title: 'IoT Library',
      description: 'Browse protocols, hardware, sensors, and cloud platforms with comparisons.',
      link: '/library',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: '💬',
      title: 'Knowledge Forum',
      description: 'Share solutions, ask questions, and collaborate with the IoT community.',
      link: '/forum',
      gradient: 'from-rose-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 rounded-3xl p-8 md:p-12">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
              🌐
            </div>
            <div>
              <p className="text-sm text-cyan-400 font-medium">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white">{user?.username || 'Explorer'}</h1>
            </div>
          </div>

          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mt-4">
            <strong className="text-white">BridgeBot</strong> is your AI-powered companion for interdisciplinary IoT projects.
            Get guided through complex system design, detect architectural conflicts, and learn
            through Socratic questioning — never getting direct answers, always building understanding.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/socratic-bot"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              🤖 Start Chatting
            </Link>
            <Link
              to="/project-setup"
              className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all"
            >
              ⚙️ Setup Project
            </Link>
            <Link
              to="/dashboard"
              className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all"
            >
              📊 Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">🧩 Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group bg-slate-800/30 border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-white/10 transition-all hover:scale-[1.02]"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>🎯</span> How It Works
          </h3>
          <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
            <li>Set up your IoT project architecture</li>
            <li>Chat with the Socratic Bot about challenges</li>
            <li>Detect conflicts automatically</li>
            <li>Track tasks and collaborate with your team</li>
          </ol>
        </div>
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>🧠</span> Socratic Method
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            BridgeBot uses the Socratic method — it won't give you answers directly.
            Instead, it asks guiding questions to help you think critically and discover
            solutions yourself. This builds deeper understanding of IoT systems.
          </p>
        </div>
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>🔗</span> IoT Focus Areas
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['Protocols', 'Sensors', 'Power', 'Security', 'Cloud', 'Edge', 'Integration', 'Latency'].map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
