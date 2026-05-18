import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './UsersManager/UsersService';
import ActionButton from '../UIComponents/ActionButton';
import LabeledInput from '../UIComponents/LabeledInput';

// 1. Add "{ setUser }: { setUser: any }" here so it accepts the prop
export default function Login({ setUser }: { setUser: any }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: any) => {
        e.preventDefault(); 
        
        const loggedInUser = login(username, password);
        
        if (loggedInUser) {
            // 2. Tell App.tsx who just logged in
            setUser(loggedInUser); 
            navigate('/profile'); 
        } else {
            alert("Invalid username or password");
        }
    };

    return (
        <div className="bg-white p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16">
            <h2 className="text-xl font-bold mb-6 text-center">Login</h2>
            
            {/* 3. Make sure the form calls handleLogin on submit */}
            <form id="loginForm" onSubmit={handleLogin}>
                <LabeledInput 
                    label="Username or Email" 
                    type="text" 
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)} 
                />
                <LabeledInput 
                    label="Password" 
                    type="password" 
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)} 
                />
                <ActionButton text="Login" backgroundColor="CornflowerBlue" type="submit" />
            </form>
        </div>
    );
}