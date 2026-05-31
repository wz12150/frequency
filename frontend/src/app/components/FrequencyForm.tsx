import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

type FrequencyFormProps = {
  title: string;
  description: string;
  value: {
    guid?: string;
    permitid: string;
    frequency?: number;
    bandwidth?: number;
  };
  onChange: (value: FrequencyFormProps['value']) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};

export function FrequencyForm({ title, description, value, onChange, onClose, onSubmit, submitLabel }: FrequencyFormProps) {
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange({ ...value, frequency });
  };

  const handleBandwidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bandwidth = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange({ ...value, bandwidth });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Frequency (MHz) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              value={value.frequency ?? ''}
              onChange={handleFrequencyChange}
              placeholder="Enter frequency"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Bandwidth (MHz)
            </label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              value={value.bandwidth ?? ''}
              onChange={handleBandwidthChange}
              placeholder="Enter bandwidth"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}