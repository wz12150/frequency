type LicenseRecord = {
  id: number;
  number: string;
  organization: string;
  station: string;
  frequency: string;
  type: string;
  power: string;
  status: 'normal' | 'expiring' | 'expired';
  startDate: string;
  endDate: string;
  licenseAuthorization?: string;
  unit?: string;
  category?: string;
  law?: string;
  startDateDisplay?: string;
  endDateDisplay?: string;
  coverage?: string;
  process?: string;
  code?: string;
  decisionDate?: string;
  decision?: string;
  description?: string;
  registration?: string;
  address?: string;
  phone?: string;
  email?: string;
  administrativeInfo?: string;
  contactPerson?: string;
};

type LicenseFormProps = {
  title: string;
  description: string;
  value: LicenseRecord;
  onChange: (value: LicenseRecord) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};

export function LicenseForm({ title, description, value, onChange, onClose, onSubmit, submitLabel }: LicenseFormProps) {
  const update = <K extends keyof LicenseRecord>(key: K, next: LicenseRecord[K]) => onChange({ ...value, [key]: next });
  const requiredFields = ['licenseAuthorization', 'unit', 'category', 'type', 'startDateDisplay', 'endDateDisplay'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-card shadow-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['License / Authorization', 'licenseAuthorization'], ['Organization', 'unit'], ['Category', 'category'], ['Law', 'law'], ['Type', 'type'], ['Start Date', 'startDateDisplay'], ['End Date', 'endDateDisplay'], ['Coverage Range', 'coverage'], ['Process', 'process'], ['Status', 'status'], ['Code / No.', 'code'], ['Decision Date', 'decisionDate'], ['Decision', 'decision'], ['Description', 'description'], ['Registration', 'registration'], ['Address', 'address'], ['Phone', 'phone'], ['Email', 'email'], ['Administrative Info', 'administrativeInfo'], ['Contact Person', 'contactPerson'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2">{label}{requiredFields.includes(key) && <span className="text-red-500"> *</span>}</label>
              <input
                value={(value as any)[key] ?? ''}
                onChange={(e) => update(key as keyof LicenseRecord, e.target.value as any)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                required={requiredFields.includes(key)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-border p-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
          <button type="button" onClick={onSubmit} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
