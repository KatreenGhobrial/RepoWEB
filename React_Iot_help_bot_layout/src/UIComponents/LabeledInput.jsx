/**
 * Reusable labeled form field component.
 *
 * Usage with a plain input:
 *   <LabeledInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
 *
 * Usage wrapping custom children (select, textarea, etc.):
 *   <LabeledInput label="Role">
 *     <select value={role} onChange={...}>...</select>
 *   </LabeledInput>
 */
// Wraps any form control with a consistent label style; falls back to a styled <input> when no children are given
export default function LabeledInput({ label, children, className, ...inputProps }) {
  // If children are provided, render them directly under the label (supports select, textarea, etc.)
  if (children) {
    return (
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
        {children}
      </div>
    );
  }

  // Default: render a standard <input> with consistent styling
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input
        className={className || "w-full border border-slate-300 dark:border-zinc-700 rounded-2xl px-4 py-3 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"}
        {...inputProps}
      />
    </div>
  );
}
