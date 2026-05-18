import { useState } from 'react';
import ActionButton from '../UIComponents/ActionButton';
import LabeledInput from '../UIComponents/LabeledInput';
import { login, setCurrentUser } from './UsersService';
import { useNavigate } from 'react-router-dom';


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleLogin = () => {
        const user = login(username, password);
        if (user) {
            setError('');
            setCurrentUser(user);
            navigate(user.role === 'Admin' ? '/manage-users' : '/profile');
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="bg-white p-8 rounded shadow-md w-96 justify-self-center 
justify-items-center mx-auto my-16  dark:bg-zinc-100/10 dark:text-white" >
            <form id="loginForm" method="post" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
                <LabeledInput label="Username or Email" type="text" value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
                <LabeledInput label="Password" type="password" value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <ActionButton text="Login" backgroundColor="CornflowerBlue"
                    onClick={handleLogin} />
                <ActionButton text="Register" backgroundColor="Gray" onClick={() =>
                    navigate('/register')} />
            </form >
        </div>
    );


}
