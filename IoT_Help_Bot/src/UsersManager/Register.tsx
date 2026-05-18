import ActionButton from '../UIComponents/ActionButton';
import LabeledInput from '../UIComponents/LabeledInput';

export default function Register() {
    const handleClick = (buttonText: string): void => {
        alert(`Button "${buttonText}" clicked!`);
    };

    return (
        <div className="bg-white p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 dark:bg-zinc-100/10 dark:text-white">
            <form id="registerForm" method="post">
                <LabeledInput label="Username" type="text" />
                <LabeledInput label="Email" type="email" />
                <LabeledInput label="Name" type="text" />
                <LabeledInput label="Password" type="password" />
                <LabeledInput label="Confirm Password" type="password" />
                <ActionButton 
                    text="Register" 
                    backgroundColor="CornflowerBlue" 
                    onClick={() => handleClick("Register")} 
                />
            </form>
        </div>
    );
}