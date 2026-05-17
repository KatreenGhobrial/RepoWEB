

import './App.css'
import IoTPic from './assets/IoTPic.png'
import Footer from './UIComponnents/Footer';
import Login from './UsersManager/Login';


function App() {
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact', path: '/contact' },
    { label: 'Login', path: '/login' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-400 to-emerald-400">

      <header className="flex items-center justify-between py-6 px-8 md:px-32 bg-white text-black drop-shadow-md">
        <a href="#">
          <img className="w-12 hover:scale-110 transition-all" src={IoTPic} alt="Logo" />
        </a>

        <ul className='hidden md:flex items-center gap-12 font-semibold text-base'>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="p-3 text-gray-700 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </header>
      <Login></Login>
      <Footer></Footer>
    </div>


  )
}

export default App
