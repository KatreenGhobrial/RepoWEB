function LabeledInput(props:any){

    return (
      <div className=" dark:bg-zinc-100/10 dark:text-white">
        <label className="block text-sm font-medium">{props.label}</label>
        {/* <input className="w-full p-3 mb-4 border rounded" type={props.type}/> */}
        <input className="w-full p-3 mb-4 border rounded" type={props.type} value={props.value} onChange={props.onChange}/>
      </div>
    );

}

export default LabeledInput