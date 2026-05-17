function LabeledInput(props:any){

    return (
      <div>
        <label className="block text-sm font-medium">{props.label}</label>
        <input className="w-full p-3 mb-4 border rounded" type={props.type}/>
      </div>
    );

}

export default LabeledInput