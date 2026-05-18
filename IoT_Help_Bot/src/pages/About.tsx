import { teamMembers } from '../data/fakeData';

export default function About() {
    return (
        <div>
            {/* ==========================================
                Hero
               ========================================== */}
            <section className="bg-gradient-to-br from-sky-600 to-teal-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
                        About Us
                    </h1>
                    <p className="text-lg text-sky-100 max-w-2xl mx-auto animate-fade-in-up stagger-1">
                        We're building the future of smart home management — one device at a time.
                    </p>
                </div>
            </section>

            {/* ==========================================
                Mission
               ========================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Our Mission
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            At IoT Help Bot, we believe that smart home technology should be accessible,
                            reliable, and easy to manage for everyone. Our AI-powered platform bridges
                            the gap between complex IoT ecosystems and everyday users.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            We combine real-time device monitoring with intelligent diagnostics to
                            provide instant support — 24/7. Whether you have 1 device or 100, our
                            platform scales with your needs.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            Founded in 2024, we've grown from a small university project to a
                            platform trusted by thousands of smart home enthusiasts worldwide.
                        </p>
                    </div>

                    {/* Visual element */}
                    <div className="flex justify-center animate-fade-in-up stagger-2">
                        <div className="relative">
                            <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-sky-500/20 to-teal-400/20 dark:from-sky-500/10 dark:to-teal-400/10 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-7xl mb-4 animate-float">🏠</div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">Smart Living</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Made Simple</div>
                                </div>
                            </div>
                            {/* Floating accents */}
                            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-sky-400/20 flex items-center justify-center text-2xl animate-float" style={{ animationDelay: '0.5s' }}>📡</div>
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center text-2xl animate-float" style={{ animationDelay: '1s' }}>🤖</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                Team
               ========================================== */}
            <section className="bg-gray-100 dark:bg-zinc-800/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Meet the Team
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            The people behind IoT Help Bot.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, i) => (
                            <div
                                key={member.id}
                                className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 text-center
                                           hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1
                                           transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 mx-auto mb-4
                                                flex items-center justify-center text-white text-2xl font-bold
                                                group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-500/20">
                                    {member.initials}
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-sky-500 text-sm font-medium mb-3">{member.role}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================
                Tech Stack
               ========================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Built With Modern Tech
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Reliable, scalable, and cutting-edge.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js', 'AI / ML'].map((tech, i) => (
                        <span
                            key={i}
                            className="px-6 py-3 bg-white dark:bg-zinc-800 rounded-xl font-medium text-gray-700 dark:text-gray-300
                                       border border-gray-200 dark:border-zinc-700
                                       hover:border-sky-400 hover:text-sky-500 hover:shadow-md
                                       transition-all duration-200 cursor-default animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}
