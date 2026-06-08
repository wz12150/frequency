"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export type StationFormProps = {
  title: string;
  description: string;
  value: {
    guid?: string;
    permitid: string;
    stationid?: string;
    quantity?: number;
    outputpower?: number;
    type?: string;
  };
  onChange: (value: StationFormProps["value"]) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
};

export function StationForm({
  title,
  description,
  value,
  onChange,
  onClose,
  onSubmit,
  submitLabel,
}: StationFormProps) {
  const handleChange = (field: keyof StationFormProps["value"]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...value };

    switch (field) {
      case "permitid":
        newValue.permitid = e.target.value;
        break;
      case "stationid":
        newValue.stationid = e.target.value;
        break;
      case "quantity":
        newValue.quantity = e.target.value ? Number(e.target.value) : undefined;
        break;
      case "outputpower":
        newValue.outputpower = e.target.value ? Number(e.target.value) : undefined;
        break;
      case "type":
        newValue.type = e.target.value;
        break;
    }

    onChange(newValue);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Station Type <span className="text-red-500">*</span></Label>
            <Input
              id="type"
              type="text"
              placeholder="Enter station type"
              value={value.type ?? ""}
              onChange={handleChange("type")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={value.quantity ?? ""}
              onChange={handleChange("quantity")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="outputpower">Output Power (W)</Label>
            <Input
              id="outputpower"
              type="number"
              step="0.000001"
              value={value.outputpower ?? ""}
              onChange={handleChange("outputpower")}
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