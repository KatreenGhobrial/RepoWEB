import ActionButton from '../UIComponnents/ActionButton';
import LabeledInput from '../UIComponnents/LabeledInput';


export default function Login() {
    const handleClick = (buttonText: any) => {
        alert(`Button "${buttonText}" clicked!`);

    };
    return (
        <div className="bg-white p-8 rounded shadow-md w-96 justify-self-center 
justify-items-center mx-auto my-16">
            <form id="loginForm" method="post">
                <LabeledInput label="Username or Email" type="text"></LabeledInput>
                <LabeledInput label="Password"
                    type="password"></LabeledInput>
                <ActionButton text="Login"
                    backgroundColor="CornflowerBlue" onClick={() =>
                        handleClick("Login")} />
            </form>
        </div>
    );


}
