import logo from '../assets/IoTPic.png';
import { Link } from "react-router-dom";
import { LuSun, LuMoon } from "react-icons/lu";


export default function Navbar(props: any) {

    const menuItems = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Services', path: '/services' },
        { label: 'Contact', path: '/contact' },
        { label: 'Login', path: '/login' },
    ];

    return (
        <header className="fixed w-full top-0 py-6 px-2 drop-shadow-md bg-white">
            <ul className="hidden md:flex items-center gap-12 font-semibold text-base">
                <li>
                    <Link to="/">
                        <img src={logo} alt="Logo" className="w-20 hover:scale-125 transition-all" />
                    </Link>
                </li>

                {menuItems.map((item) => (
                    <li
                        key={item.path}
                        className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"
                    >
                        <Link to={item.path} className="block w-full h-full">
                            {item.label}
                        </Link>
                    </li>
                ))}
                <div className='bg-zinc-100 p-2 rounded-xl'>
                    <button onClick={props.onClick} className='bg-transparent p-3 hover:bg-zinc-200 rounded-lg text-black'>
                        {props.theme === 'dark' && <LuSun size={24} />}
                        {props.theme === '' && <LuMoon size={24} />}
                    </button>
                </div>

            </ul>
        </header>
    );
}