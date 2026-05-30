import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ currentUser, setCurrentUser }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
       <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <main className="flex-1 p-10 flex flex-col relative">
        <Outlet />
        
      </main>
      <Footer />
    </div>
  );
}
