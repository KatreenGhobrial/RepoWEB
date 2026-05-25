export default function Header({ title, subtitle }) {
  return (
    <header className="mb-10">
      <h2 className="text-4xl font-bold text-slate-950">{title}</h2>
      <p className="text-xl text-slate-500 mt-1">{subtitle}</p>
    </header>
  );
}
