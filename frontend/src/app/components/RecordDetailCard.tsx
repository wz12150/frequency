type DetailField = {
  label: string;
  value: string;
};

type RecordDetailCardProps = {
  title: string;
  subtitle?: string;
  fields: DetailField[];
  onClose: () => void;
  primaryActionLabel?: string;
};

export function RecordDetailCard({
  title,
  subtitle,
  fields,
  onClose,
  primaryActionLabel = 'Close',
}: RecordDetailCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card shadow-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {fields.map((field) => (
              <div key={field.label} className="rounded-lg border border-border p-3 bg-background">
                <div className="text-xs font-semibold text-muted-foreground mb-1">{field.label}</div>
                <div className="text-sm font-medium break-words text-foreground">{field.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
