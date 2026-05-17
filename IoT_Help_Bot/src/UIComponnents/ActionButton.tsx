function ActionButton(props: any) {
    const buttonStyle = {
        backgroundColor: props.backgroundColor,
        color: 'white',
        margin: '5px',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    };


    return (
        <button style={buttonStyle} onClick={props.onClick}>
            {props.text}
        </button>
    );





}

export default ActionButton