function ActionButton(props: any) {
    return (
        <button
            type={props.type || 'button'}
            style={{ backgroundColor: props.backgroundColor }}
            className="text-white px-5 py-2.5 rounded-lg cursor-pointer font-medium
                       transition-all duration-200 ease-out
                       hover:scale-105 hover:shadow-lg
                       active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       m-1"
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.text}
        </button>
    );
}

export default ActionButton;