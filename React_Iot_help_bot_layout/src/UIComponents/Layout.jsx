import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-zinc-950 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-24 pb-10 px-10 flex flex-col relative">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
