import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            {/* Gradient separator */}
            <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-sky-500" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-3 bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                            IoT Help Bot
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Your intelligent IoT device management and support platform. Monitor, control, and troubleshoot — all in one place.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-sky-400 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-sky-400 transition-colors">About</Link></li>
                            <li><Link to="/services" className="hover:text-sky-400 transition-colors">Services</Link></li>
                            <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/services" className="hover:text-sky-400 transition-colors">Smart Monitoring</Link></li>
                            <li><Link to="/services" className="hover:text-sky-400 transition-colors">AI Help Bot</Link></li>
                            <li><Link to="/login" className="hover:text-sky-400 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span>📧</span>
                                <span>support@iothelpbot.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span>
                                <span>+972-50-123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📍</span>
                                <span>Tel Aviv, Israel</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                    <p>&copy; 2026 IoT Help Bot. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="hover:text-sky-400 transition-colors cursor-pointer">Privacy</span>
                        <span className="hover:text-sky-400 transition-colors cursor-pointer">Terms</span>
                        <span className="hover:text-sky-400 transition-colors cursor-pointer">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}