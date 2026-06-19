export default function LabeledInput(props) {
    return (
      <div >
        <label className="block text-sm font-medium dark:text-white">{props.label}</label>
        <input className="w-full p-3 mb-4 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" type={props.type} disabled={props.disabled} value={props.value} onChange={props.onChange}/>
    </div>
    );
  }
