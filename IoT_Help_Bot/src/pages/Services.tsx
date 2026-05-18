import { useState } from 'react';
import { iotServices, pricingTiers } from '../data/fakeData';
import { Link } from 'react-router-dom';

export default function Services() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <div>
            {/* ==========================================
                Hero
               ========================================== */}
            <section className="bg-gradient-to-br from-sky-600 to-teal-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
                        Our Services
                    </h1>
                    <p className="text-lg text-sky-100 max-w-2xl mx-auto animate-fade-in-up stagger-1">
                        Comprehensive IoT solutions tailored for your smart home.
                    </p>
                </div>
            </section>

            {/* ==========================================
                Services Grid (2 services)
               ========================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {iotServices.map((service, i) => (
                        <div
                            key={service.id}
                            className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700
                                       overflow-hidden hover:shadow-xl hover:shadow-sky-500/10
                                       transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        >
                            {/* Card header gradient */}
                            <div className="h-2 bg-gradient-to-r from-sky-500 to-teal-400" />

                            <div className="p-8">
                                <div className="text-5xl mb-5">{service.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    {service.description}
                                </p>

                                {/* Features list */}
                                <ul className="space-y-2 mb-6">
                                    {service.features.map((feat, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="text-teal-500 mt-0.5 shrink-0">✓</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                    className="text-sky-500 font-medium text-sm hover:text-sky-600 transition-colors cursor-pointer"
                                >
                                    {expandedId === service.id ? 'Show Less ↑' : 'Learn More ↓'}
                                </button>

                                {/* Expanded content */}
                                {expandedId === service.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 animate-fade-in">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {service.id === 1
                                                ? 'Our Smart Home Monitoring service uses advanced protocols like Zigbee, Z-Wave, and WiFi to connect with a wide range of devices. Real-time data is processed at the edge for minimal latency, with cloud sync for historical analytics. Set up custom automation rules, get push notifications, and manage schedules — all from your browser or mobile device.'
                                                : 'Our AI Help Bot is trained on thousands of IoT troubleshooting scenarios. It uses natural language processing to understand your issues, cross-references with real-time device data, and provides step-by-step solutions. When manual intervention is needed, it creates and tracks support tickets automatically, ensuring nothing falls through the cracks.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==========================================
                Pricing
               ========================================== */}
            <section className="bg-gray-100 dark:bg-zinc-800/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Simple Pricing
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose the plan that fits your smart home.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {pricingTiers.map((tier, i) => (
                            <div
                                key={i}
                                className={`relative rounded-2xl p-8 transition-all duration-300 animate-fade-in-up
                                    ${tier.highlighted
                                        ? 'bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-500/25 scale-105'
                                        : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:shadow-lg'
                                    }`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                {tier.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}

                                <h3 className={`text-xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {tier.name}
                                </h3>

                                <div className="mb-6">
                                    <span className={`text-4xl font-extrabold ${tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                        {tier.price}
                                    </span>
                                    <span className={`text-sm ${tier.highlighted ? 'text-sky-100' : 'text-gray-500'}`}>
                                        {tier.period}
                                    </span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feat, j) => (
                                        <li key={j} className={`flex items-start gap-2 text-sm ${tier.highlighted ? 'text-sky-100' : 'text-gray-600 dark:text-gray-300'}`}>
                                            <span className={`mt-0.5 shrink-0 ${tier.highlighted ? 'text-amber-300' : 'text-teal-500'}`}>✓</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/login"
                                    className={`block text-center py-3 rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5
                                        ${tier.highlighted
                                            ? 'bg-white text-sky-600 hover:bg-gray-100 hover:shadow-lg'
                                            : 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25'
                                        }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
