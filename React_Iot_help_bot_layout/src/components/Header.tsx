interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-400 mt-2 text-lg">{subtitle}</p>
      )}
    </div>
  );
}
