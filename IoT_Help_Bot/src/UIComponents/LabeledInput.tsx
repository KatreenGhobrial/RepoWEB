function LabeledInput(props: any) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {props.label}
            </label>
            <input
                className="w-full p-3 border border-gray-300 rounded-lg
                           bg-white text-gray-900
                           dark:bg-zinc-800 dark:border-zinc-600 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                           transition-all duration-200
                           disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                           dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                type={props.type}
                value={props.value}
                onChange={props.onChange}
                disabled={props.disabled}
                placeholder={props.placeholder}
            />
        </div>
    );
}

export default LabeledInput;