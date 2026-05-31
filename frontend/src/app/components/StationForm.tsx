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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { stationApi, StationSelectVO } from "../api/station";

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
  const [stations, setStations] = React.useState<StationSelectVO[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch station list for selection
  React.useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await stationApi.getSelectList();
        const list = res?.data ?? res ?? [];
        setStations(list);
      } catch (err) {
        console.error("Failed to fetch stations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

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

  const handleStationSelect = (stationId: string) => {
    const newValue = { ...value, stationid: stationId === "none" ? undefined : stationId };
    onChange(newValue);
  };

  const selectedStation = stations.find(s => s.guid === value.stationid);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Station Selection */}
          <div className="grid gap-2">
            <Label htmlFor="stationid">Station</Label>
            <Select
              value={value.stationid ?? ""}
              onValueChange={handleStationSelect}
            >
              <SelectTrigger id="stationid">
                <SelectValue placeholder="Select a station..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- No station --</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.guid} value={station.guid}>
                    {station.sitename || station.guid}
                    {station.stationtype ? ` (${station.stationtype})` : ""}
                    {station.province ? ` - ${station.province}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show selected station info */}
          {selectedStation && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium mb-2">Selected Station Info:</div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                {selectedStation.stationtype && (
                  <span>Type: {selectedStation.stationtype}</span>
                )}
                {selectedStation.type && (
                  <span>Category: {selectedStation.type}</span>
                )}
                {selectedStation.province && (
                  <span>Province: {selectedStation.province}</span>
                )}
                {selectedStation.unit && (
                  <span>Unit: {selectedStation.unit}</span>
                )}
                {selectedStation.location && (
                  <span className="col-span-2">Location: {selectedStation.location}</span>
                )}
              </div>
            </div>
          )}

          {/* Optional type override */}
          <div className="grid gap-2">
            <Label htmlFor="type">Station Type (override)</Label>
            <Input
              id="type"
              type="text"
              placeholder="Optional type override"
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
          <Button onClick={onSubmit} disabled={loading}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}