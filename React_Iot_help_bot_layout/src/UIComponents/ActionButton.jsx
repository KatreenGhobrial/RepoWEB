// Reusable button component that accepts background color, click handler, and label via props
export default function ActionButton(props) {
    // Build inline style using the backgroundColor prop passed by the parent
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
