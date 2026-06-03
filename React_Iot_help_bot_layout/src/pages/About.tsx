export default function About() {
  const team = [
    { name: 'Katreen Ghobrial', role: 'Full-Stack Developer', emoji: '👩‍💻' },
    { name: 'BridgeBot AI', role: 'Socratic Learning Engine', emoji: '🤖' },
  ];

  const techStack = [
    { name: 'React + TypeScript', category: 'Frontend', icon: '⚛️' },
    { name: 'Node.js + Express', category: 'Backend', icon: '🟢' },
    { name: 'MongoDB Atlas', category: 'Database', icon: '🍃' },
    { name: 'OpenAI GPT-4o', category: 'AI Engine', icon: '🧠' },
    { name: 'Tailwind CSS', category: 'Styling', icon: '🎨' },
    { name: 'JWT + bcrypt', category: 'Authentication', icon: '🔐' },
  ];

  const phases = [
    { name: 'Ideation', icon: '💡', desc: 'Brainstorm IoT solutions and define project goals' },
    { name: 'Design', icon: '📐', desc: 'Plan architecture, select protocols and hardware' },
    { name: 'Integration', icon: '🔗', desc: 'Connect hardware, software, and cloud services' },
    { name: 'Testing', icon: '🧪', desc: 'Validate functionality, performance, and security' },
    { name: 'Reflection', icon: '🪞', desc: 'Review decisions and identify lessons learned' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-cyan-500/30">
          🌐
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">About BridgeBot</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An AI-powered web application designed to support interdisciplinary IoT projects
          using the <strong className="text-cyan-400">Socratic method</strong> — guiding teams to discover
          solutions rather than providing direct answers.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span>🎯</span> Our Mission
        </h2>
        <p className="text-slate-300 leading-relaxed">
          IoT projects are inherently interdisciplinary — they combine hardware engineering,
          software development, network protocols, data management, and cloud infrastructure.
          BridgeBot bridges these disciplines by helping teams identify conflicts, understand
          trade-offs, and build critical thinking skills through guided questioning.
        </p>
      </div>

      {/* Project Phases */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📍</span> Project Phases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {phases.map((phase, idx) => (
            <div key={phase.name} className="relative bg-slate-800/30 border border-white/5 rounded-xl p-4 text-center">
              {idx < phases.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-cyan-500/30" />
              )}
              <span className="text-2xl">{phase.icon}</span>
              <h3 className="text-sm font-semibold text-white mt-2">{phase.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{phase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚙️</span> Technology Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div key={tech.name} className="bg-slate-800/30 border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-800/60 transition-colors">
              <span className="text-2xl">{tech.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{tech.name}</p>
                <p className="text-xs text-slate-500">{tech.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👥</span> Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.map((member) => (
            <div key={member.name} className="bg-slate-800/30 border border-white/5 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                {member.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="text-xs text-slate-400">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-sm text-slate-500">
          Built as a final project at <strong className="text-slate-400">Braude College of Engineering</strong> — Web Technologies Course 2025
        </p>
      </div>
    </div>
  );
}
