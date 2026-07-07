import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Wraps every page with the shared Navbar at the top, page content in the middle, and Footer at the bottom
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-zinc-950 dark:text-white transition-colors duration-300">
      <Navbar />
      {/* Outlet renders whichever child route is currently active */}
      <main className="flex-1 pt-24 pb-10 px-10 flex flex-col relative">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
