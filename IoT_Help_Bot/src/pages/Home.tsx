import { Link } from 'react-router-dom';
import { homeStats, homeFeatures, testimonials } from '../data/fakeData';

export default function Home() {
    return (
        <div>
            {/* ==========================================
                Hero Section
               ========================================== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-teal-400 text-white">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-6 animate-fade-in-up">
                            <span className="animate-float">🤖</span>
                            <span>AI-Powered IoT Management</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up stagger-1">
                            Your Smart Home,
                            <br />
                            <span className="bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent">
                                Brilliantly Managed
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-sky-100 mb-10 leading-relaxed animate-fade-in-up stagger-2">
                            Monitor, control, and troubleshoot all your IoT devices with our
                            intelligent Help Bot. Real-time insights, instant diagnostics, and
                            seamless automation — all in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
                            <Link
                                to="/login"
                                className="px-8 py-3.5 bg-white text-sky-600 font-bold rounded-xl hover:bg-gray-100 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/services"
                                className="px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/70 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Explore Services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                Stats Bar
               ========================================== */}
            <section className="relative -mt-8 z-10 max-w-5xl mx-auto px-4">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {homeStats.map((stat, i) => (
                        <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==========================================
                Features Grid
               ========================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Powerful features to manage your smart home ecosystem effortlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {homeFeatures.map((feature, i) => (
                        <div
                            key={i}
                            className="group p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700
                                       hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1
                                       transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==========================================
                Testimonials
               ========================================== */}
            <section className="bg-gray-100 dark:bg-zinc-800/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Trusted by thousands of smart home enthusiasts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div
                                key={t.id}
                                className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="flex gap-1 mb-3 text-amber-400">
                                    {Array.from({ length: t.rating }, (_, j) => (
                                        <span key={j}>★</span>
                                    ))}
                                    {Array.from({ length: 5 - t.rating }, (_, j) => (
                                        <span key={j} className="text-gray-300 dark:text-zinc-600">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 italic leading-relaxed">
                                    "{t.text}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                                        {t.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================
                CTA Section
               ========================================== */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-gradient-to-br from-sky-600 to-teal-500 p-12 rounded-3xl text-white shadow-2xl shadow-sky-500/20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-sky-100 mb-8 text-lg">
                            Join thousands of users managing their smart homes with ease.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block px-10 py-4 bg-white text-sky-600 font-bold rounded-xl hover:bg-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Start For Free →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
