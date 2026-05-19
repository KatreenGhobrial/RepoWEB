import { useState } from 'react';
import { faqs } from '../API_Service/fakeData';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required.';
        if (!form.email.trim()) newErrors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email.';
        if (!form.subject.trim()) newErrors.subject = 'Subject is required.';
        if (!form.message.trim()) newErrors.message = 'Message is required.';
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            setSubmitted(true);
        }
    };

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    return (
        <div>
            {/* ==========================================
                Hero
               ========================================== */}
            <section className="bg-gradient-to-br from-sky-600 to-teal-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
                        Contact Us
                    </h1>
                    <p className="text-lg text-sky-100 max-w-2xl mx-auto animate-fade-in-up stagger-1">
                        Have questions? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* ==========================================
                        Contact Form
                       ========================================== */}
                    <div className="animate-fade-in-up">
                        {submitted ? (
                            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-2xl p-8 text-center">
                                <div className="text-5xl mb-4">✅</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Thank you for reaching out. We'll get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                    className="px-6 py-2.5 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors cursor-pointer"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-zinc-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Send a Message
                                </h2>
                                <form id="contactForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                        <input
                                            className={`w-full p-3 border rounded-lg bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all
                                                ${errors.name ? 'border-red-400' : 'border-gray-300 dark:border-zinc-600'}`}
                                            value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="Your full name"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className={`w-full p-3 border rounded-lg bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all
                                                ${errors.email ? 'border-red-400' : 'border-gray-300 dark:border-zinc-600'}`}
                                            value={form.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder="you@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                        <input
                                            className={`w-full p-3 border rounded-lg bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all
                                                ${errors.subject ? 'border-red-400' : 'border-gray-300 dark:border-zinc-600'}`}
                                            value={form.subject}
                                            onChange={e => handleChange('subject', e.target.value)}
                                            placeholder="How can we help?"
                                        />
                                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                        <textarea
                                            className={`w-full p-3 border rounded-lg bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all resize-none
                                                ${errors.message ? 'border-red-400' : 'border-gray-300 dark:border-zinc-600'}`}
                                            rows={5}
                                            value={form.message}
                                            onChange={e => handleChange('message', e.target.value)}
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold rounded-xl
                                                   hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5
                                                   transition-all duration-200 cursor-pointer"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ==========================================
                        Info + FAQ
                       ========================================== */}
                    <div className="space-y-8 animate-fade-in-up stagger-2">
                        {/* Contact Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: '📧', label: 'Email', value: 'support@iothelpbot.com' },
                                { icon: '📞', label: 'Phone', value: '+972-50-123-4567' },
                                { icon: '📍', label: 'Address', value: 'Tel Aviv, Israel' },
                            ].map((info, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-zinc-800 rounded-xl p-4 text-center border border-gray-100 dark:border-zinc-700
                                               hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className="text-2xl mb-2">{info.icon}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{info.label}</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">{info.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* FAQ Accordion */}
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-zinc-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-2">
                                {faqs.map((faq, i) => (
                                    <div
                                        key={i}
                                        className="border border-gray-100 dark:border-zinc-700 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white
                                                       hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors flex justify-between items-center cursor-pointer"
                                        >
                                            <span>{faq.question}</span>
                                            <span className={`transform transition-transform duration-200 text-gray-400 ${openFaq === i ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 animate-fade-in leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
