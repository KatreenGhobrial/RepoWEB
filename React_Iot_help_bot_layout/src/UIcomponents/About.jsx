import Header from './Header';

export default function About() {
  return (
    <>
      <Header title="About IoT Help Bot" subtitle="Empowering students to build better IoT solutions." />
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 mb-8">
        <h2 className="text-3xl font-bold text-slate-950 mb-6">Our Mission</h2>
        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
          The IoT Help Bot project was conceived to address the common challenges students face when integrating hardware components with cloud services. 
          By providing a Socratic approach to troubleshooting, we encourage deep understanding rather than simply handing out quick fixes.
        </p>
        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
          Whether you are building a simple home automation demo or a complex sensor network, our platform is designed to mentor you through the entire project lifecycle, from initial setup to final monitoring.
        </p>
        
        <h3 className="text-2xl font-bold text-slate-950 mt-10 mb-6">Core Features</h3>
        <ul className="list-disc list-inside space-y-3 text-lg text-slate-600 ml-4">
          <li>Socratic Troubleshooting Bot</li>
          <li>Architecture Conflict Detection</li>
          <li>Team Task Management</li>
          <li>Real-time Device Monitoring Panel</li>
        </ul>
      </section>
    </>
  );
}
