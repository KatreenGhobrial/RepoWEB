// Reusable page header that displays a title and subtitle passed in as props
export default function Header({ title, subtitle }) {
  return (
    <header className="mb-10">
      <h2 className="text-4xl font-bold text-slate-950 dark:text-white">{title}</h2>
      <p className="text-xl text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </header>
  );
}
