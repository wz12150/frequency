"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { FrequencyForm } from "./FrequencyForm";
import { StationForm } from "./StationForm";
import { permitApi, PermitVO } from "../api/permit";
import { stationPermitApi } from "../api/permit";

type LicenseDetailProps = {
  permitId: string;
  onBack: () => void;
};

type PermitData = {
  guid: string;
  consent: string;
  interlocutor: string;
  category: string;
  type: string;
  status: string;
  startdate: string;
  enddate: string;
  code: string;
  decisiondate: string;
  decision: string;
  process: string;
  scope: string;
  address: string;
  phone: string;
  email: string;
  directorname: string;
  note: string;
  legal?: string;
  register?: string;
  administrativeinfo?: string;
};

type FrequencyData = {
  guid: string;
  permitid: string;
  frequency: number;
  bandwidth: number;
};

type StationData = {
  guid: string;
  permitid: string;
  type?: string;
  quantity?: number;
  outputpower?: number;
};

export function LicenseDetail({ permitId, onBack }: LicenseDetailProps) {
  const [permit, setPermit] = useState<PermitData | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取许可详情
  useEffect(() => {
    const fetchPermit = async () => {
      try {
        setLoading(true);
        const res = await permitApi.getById(permitId);
        if (res.code === 200 && res.data) {
          const p: PermitVO = res.data;
          setPermit({
            guid: p.guid,
            consent: p.consent ?? '',
            interlocutor: p.interlocutor ?? '',
            category: p.category ?? '',
            type: p.type ?? '',
            status: p.status ?? 'active',
            startdate: p.startdate ?? '',
            enddate: p.enddate ?? '',
            code: p.code ?? '',
            decisiondate: p.decisiondate ?? '',
            decision: p.decision ?? '',
            process: p.process ?? '',
            scope: p.scope ?? '',
            address: p.address ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
            directorname: p.directorname ?? '',
            note: p.note ?? '',
            legal: p.legal ?? '',
            register: p.register ?? '',
            administrativeinfo: p.administrativeinfo ?? '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch permit:', error);
      } finally {
        setLoading(false);
      }
    };
    if (permitId) {
      fetchPermit();
      fetchFrequencies();
      fetchStations();
    }
  }, [permitId]);

  const fetchFrequencies = async () => {
    try {
      const res = await permitApi.getFrequencies(permitId);
      if (res.code === 200 && res.data) {
        setFrequencies(res.data.map((f: any) => ({
          guid: f.guid,
          permitid: f.permitid,
          frequency: f.frequency,
          bandwidth: f.bandwidth,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch frequencies:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await stationPermitApi.getByPermitId(permitId);
      if (res.code === 200 && res.data) {
        setStations(res.data.map((s: any) => ({
          guid: s.guid,
          permitid: s.permitid,
          type: s.type,
          quantity: s.quantity,
          outputpower: s.outputpower,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const [frequencies, setFrequencies] = useState<FrequencyData[]>([]);

  const [stations, setStations] = useState<StationData[]>([]);

  const [showFrequencyForm, setShowFrequencyForm] = useState(false);
  const [editingFrequency, setEditingFrequency] = useState<{
    guid?: string;
    permitid: string;
    frequency?: number;
    bandwidth?: number;
  } | null>(null);

  const [showStationForm, setShowStationForm] = useState(false);
  const [editingStation, setEditingStation] = useState<{
    guid?: string;
    permitid: string;
    quantity?: number;
    outputpower?: number;
    type?: string;
  } | null>(null);

  const handleAddFrequency = () => {
    setEditingFrequency({ permitid: permit.guid });
    setShowFrequencyForm(true);
  };

  const handleEditFrequency = (freq: FrequencyData) => {
    setEditingFrequency({
      guid: freq.guid,
      permitid: freq.permitid,
      frequency: freq.frequency,
      bandwidth: freq.bandwidth,
    });
    setShowFrequencyForm(true);
  };

  const handleDeleteFrequency = async (guid: string) => {
    try {
      await permitApi.deleteFrequency(guid);
      setFrequencies((prev) => prev.filter((f) => f.guid !== guid));
    } catch (error) {
      console.error('Failed to delete frequency:', error);
      alert('删除失败');
    }
  };

  const handleSaveFrequency = async () => {
    if (!editingFrequency) return;

    if (!editingFrequency.frequency) {
      alert('请输入Frequency');
      return;
    }

    try {
      if (editingFrequency.guid) {
        await permitApi.updateFrequency(editingFrequency.guid, {
          frequency: editingFrequency.frequency,
          bandwidth: editingFrequency.bandwidth,
        });
        setFrequencies((prev) =>
          prev.map((f) =>
            f.guid === editingFrequency.guid
              ? { ...f, frequency: editingFrequency.frequency!, bandwidth: editingFrequency.bandwidth! }
              : f
          )
        );
      } else {
        const payload = {
          permitid: editingFrequency.permitid,
          frequency: editingFrequency.frequency!,
          bandwidth: editingFrequency.bandwidth,
        };
        console.log('Creating frequency with payload:', payload);
        const res = await permitApi.createFrequency(payload);
        console.log('Create frequency response:', res);

        // 兼容不同的响应格式
        const newGuid = res?.data?.guid || res?.guid || res?.data?.frequencyGuid;
        if (newGuid) {
          setFrequencies((prev) => [
            ...prev,
            {
              guid: newGuid,
              permitid: editingFrequency.permitid,
              frequency: editingFrequency.frequency!,
              bandwidth: editingFrequency.bandwidth!,
            },
          ]);
        } else {
          // 如果没有返回 guid，刷新整个列表
          console.warn('No guid returned, refreshing frequency list');
          await fetchFrequencies();
        }
      }
    } catch (error) {
      console.error('Failed to save frequency:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return;
    }
    setShowFrequencyForm(false);
    setEditingFrequency(null);
  };

  const handleAddStation = () => {
    setEditingStation({ permitid: permit.guid });
    setShowStationForm(true);
  };

  const handleEditStation = (station: StationData) => {
    setEditingStation({
      guid: station.guid,
      permitid: station.permitid,
      type: station.type,
      quantity: station.quantity,
      outputpower: station.outputpower,
    });
    setShowStationForm(true);
  };

  const handleDeleteStation = async (guid: string) => {
    try {
      await stationPermitApi.delete(guid);
      setStations((prev) => prev.filter((s) => s.guid !== guid));
    } catch (error) {
      console.error('Failed to delete station:', error);
      alert('删除失败');
    }
  };

  const handleSaveStation = async () => {
    if (!editingStation) return;

    if (!editingStation.type) {
      alert('请输入Station Type');
      return;
    }

    try {
      if (editingStation.guid) {
        await stationPermitApi.update(editingStation.guid, {
          type: editingStation.type,
          quantity: editingStation.quantity,
          outputpower: editingStation.outputpower,
        });
        setStations((prev) =>
          prev.map((s) =>
            s.guid === editingStation.guid
              ? {
                  ...s,
                  type: editingStation.type,
                  quantity: editingStation.quantity,
                  outputpower: editingStation.outputpower,
                }
              : s
          )
        );
      } else {
        const payload = {
          permitid: editingStation.permitid,
          type: editingStation.type,
          quantity: editingStation.quantity,
          outputpower: editingStation.outputpower,
        };
        console.log('Creating station permit with payload:', payload);
        const res = await stationPermitApi.create(payload);
        console.log('Create station permit response:', res);

        // 兼容不同的响应格式
        const newGuid = res?.data?.guid || res?.guid || res?.data?.stationPermitGuid;
        if (newGuid) {
          setStations((prev) => [
            ...prev,
            {
              guid: newGuid,
              permitid: editingStation.permitid,
              type: editingStation.type,
              quantity: editingStation.quantity,
              outputpower: editingStation.outputpower,
            },
          ]);
        } else {
          // 如果没有返回 guid，刷新整个列表
          console.warn('No guid returned, refreshing station list');
          await fetchStations();
        }
      }
    } catch (error) {
      console.error('Failed to save station:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return;
    }
    setShowStationForm(false);
    setEditingStation(null);
  };

  const permitFields: Array<[string, string]> = permit ? [
    ["License / Authorization", permit.consent],
    ["Organization", permit.interlocutor],
    ["Category", permit.category],
    ["Law", permit.legal ?? ''],
    ["Type", permit.type],
    ["Start Date", permit.startdate],
    ["End Date", permit.enddate],
    ["Coverage Range", permit.scope],
    ["Process", permit.process],
    ["Status", permit.status],
    ["Code / No.", permit.code],
    ["Decision Date", permit.decisiondate],
    ["Decision", permit.decision],
    ["Description", permit.note],
    ["Registration", permit.register ?? ''],
    ["Address", permit.address],
    ["Phone", permit.phone],
    ["Email", permit.email],
    ["Administrative Info", permit.administrativeinfo ?? ''],
    ["Contact Person", permit.directorname],
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">License Detail</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading license details...</div>
        </div>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">License Detail</h1>
            <p className="text-sm text-muted-foreground">License not found</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">License not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">License Detail</h1>
          <p className="text-sm text-muted-foreground">{permit.consent}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 overflow-y-auto flex-1 max-h-[calc(100vh-180px)]">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">License Info</TabsTrigger>
            <TabsTrigger value="frequencies">
              Frequencies ({frequencies.length})
            </TabsTrigger>
            <TabsTrigger value="stations">
              Stations ({stations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permitFields.map(([label, value]) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium break-all">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="frequencies" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddFrequency}>
                <Plus className="h-4 w-4 mr-2" />
                Add Frequency
              </Button>
            </div>

            {frequencies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No frequencies. Click Add Frequency to create one.
              </div>
            ) : (
              <div className="border border-border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frequency (MHz)</TableHead>
                      <TableHead>Bandwidth (kHz)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frequencies.map((freq) => (
                      <TableRow key={freq.guid}>
                        <TableCell className="font-medium">{freq.frequency}</TableCell>
                        <TableCell>{freq.bandwidth}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditFrequency(freq)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteFrequency(freq.guid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stations" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddStation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </div>

            {stations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stations. Click Add Station to create one.
              </div>
            ) : (
              <div className="border border-border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Power (W)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations.map((station) => (
                      <TableRow key={station.guid}>
                        <TableCell>{station.type || '-'}</TableCell>
                        <TableCell>{station.quantity ?? '-'}</TableCell>
                        <TableCell>{station.outputpower ?? '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditStation(station)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteStation(station.guid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Frequency Form Dialog */}
      {showFrequencyForm && editingFrequency && (
        <FrequencyForm
          title={editingFrequency.guid ? "Edit Frequency" : "Add Frequency"}
          description={
            editingFrequency.guid
              ? "Update frequency details"
              : "Enter frequency details"
          }
          value={editingFrequency}
          onChange={(value) => setEditingFrequency(value)}
          onClose={() => {
            setShowFrequencyForm(false);
            setEditingFrequency(null);
          }}
          onSubmit={handleSaveFrequency}
          submitLabel={editingFrequency.guid ? "Update" : "Add"}
        />
      )}

      {/* Station Form Dialog */}
      {showStationForm && editingStation && (
        <StationForm
          title={editingStation.guid ? "Edit Station" : "Add Station"}
          description={
            editingStation.guid
              ? "Update station details"
              : "Enter station details"
          }
          value={editingStation}
          onChange={(value) => setEditingStation(value)}
          onClose={() => {
            setShowStationForm(false);
            setEditingStation(null);
          }}
          onSubmit={handleSaveStation}
          submitLabel={editingStation.guid ? "Update" : "Add"}
        />
      )}
    </div>
  );
}