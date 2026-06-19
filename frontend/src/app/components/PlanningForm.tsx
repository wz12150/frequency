import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { DictData } from '../api/system';

export type FrequencyBand = {
  guid: string;
  category: string;
  subCategory: string;
  service: string;
  bandName: string;
  startFreq: number;
  endFreq: number;
  step: number;
  bandwidth: number;
  status: 'occupied' | 'free';
  note: string;
  /** 业务类型，从数据字典 ServiceType 获取 */
  serviceType?: string;
  /** 频段类型，从数据字典 BandType 获取 */
  bandType?: string;
};

export type PlanningFormProps = {
  title: string;
  description: string;
  value: FrequencyBand;
  onChange: (value: FrequencyBand) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  serviceTypeOptions?: DictData[];
  bandTypeOptions?: DictData[];
};

export function PlanningForm({ title, description, value, onChange, onClose, onSubmit, submitLabel, serviceTypeOptions = [], bandTypeOptions = [] }: PlanningFormProps) {
  const update = <K extends keyof FrequencyBand>(key: K, next: FrequencyBand[K]) => onChange({ ...value, [key]: next });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Radioservices<span className="text-red-500"> *</span></label><input value={value.category} onChange={(e) => update('category', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Subservices<span className="text-red-500"> *</span></label><input value={value.subCategory} onChange={(e) => update('subCategory', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Level<span className="text-red-500"> *</span></label><input value={value.service} onChange={(e) => update('service', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Band Name</label><input value={value.bandName} onChange={(e) => update('bandName', e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Start Frequency<span className="text-red-500"> *</span></label><input type="number" value={value.startFreq} onChange={(e) => update('startFreq', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">End Frequency<span className="text-red-500"> *</span></label><input type="number" value={value.endFreq} onChange={(e) => update('endFreq', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label className="block text-sm font-medium mb-2">Step</label><input type="number" value={value.step} onChange={(e) => update('step', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Signal Bandwidth</label><input type="number" value={value.bandwidth} onChange={(e) => update('bandwidth', Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-medium mb-2">Service Type</label>
              <Select value={value.serviceType ?? ''} onValueChange={(v) => update('serviceType', v)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Service Type --" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {serviceTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><label className="block text-sm font-medium mb-2">Band Type</label>
              <Select value={value.bandType ?? ''} onValueChange={(v) => update('bandType', v)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Band Type --" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {bandTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Notes</label><textarea value={value.note} onChange={(e) => update('note', e.target.value)} rows={4} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
