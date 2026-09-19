import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Server,
  CloudOff,
  CheckCircle2,
  RefreshCw,
  Info,
  ExternalLink,
  Code
} from 'lucide-react';
import { fireGuardApi } from '../services/api';

export default function Settings() {
  const [weights, setWeights] = useState({
    forest: 0.35,
    weather: 0.20,
    building: 0.30,
    exposure: 0.15,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchCurrentWeights = async () => {
      try {
        const risk = await fireGuardApi.getCurrentRisk();
        if (risk?.weights) {
          setWeights(risk.weights);
        }
      } catch (err) {
        console.error('Failed to load current weights:', err);
      }
    };
    fetchCurrentWeights();
  }, []);

  const totalWeight = weights.forest + weights.weather + weights.building + weights.exposure;

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await fireGuardApi.updateRiskWeights(weights);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save weights:', err);
    } finally {
      setSaving(false);
    }
  };

  const services = [
    {
      domain: 'Telemetry Ingestion',
      contract: 'ITelemetryRepository',
      activeLocal: 'LocalTelemetryRepository',
      futureCloud: 'Amazon DynamoDB / AWS IoT Core',
      status: 'Active (In-Memory / Mongo)',
    },
    {
      domain: 'Risk Assessments',
      contract: 'IRiskRepository',
      activeLocal: 'LocalRiskRepository',
      futureCloud: 'Amazon DynamoDB',
      status: 'Active (Local-First)',
    },
    {
      domain: 'Emergency Alerts',
      contract: 'IAlertService',
      activeLocal: 'LocalAlertService',
      futureCloud: 'Amazon Simple Notification Service (SNS)',
      status: 'Active (Console & Store)',
    },
    {
      domain: 'Artifact & File Storage',
      contract: 'IObjectStorageService',
      activeLocal: 'LocalStorageService (data/uploads)',
      futureCloud: 'Amazon Simple Storage Service (S3)',
      status: 'Active (Filesystem)',
    },
    {
      domain: 'Event Telemetry Stream',
      contract: 'IEventPublisher',
      activeLocal: 'LocalEventPublisher',
      futureCloud: 'AWS IoT Core / Amazon EventBridge',
      status: 'Active (In-Process)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="h-6 w-6 text-orange-400" />
          <span>System Settings & Architecture Abstraction</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Tune Dynamic Risk Fusion Engine Weights & Inspect Decoupled Cloud Integration Boundaries
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Risk Fusion Engine Weights Tuning */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="h-4 w-4 text-orange-400" />
                <span>Risk Fusion Weights Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Convex combination weights applied to calculate overall fire hazard index
              </p>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-4">
            {/* Forest Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Forest / Wildland ML Weight (w_f):</span>
                <span className="font-bold text-emerald-400">
                  {(weights.forest * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.70"
                step="0.05"
                value={weights.forest}
                onChange={(e) => setWeights({ ...weights, forest: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Weather Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Weather Atmospheric Aridity Weight (w_w):</span>
                <span className="font-bold text-amber-400">
                  {(weights.weather * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.weather}
                onChange={(e) => setWeights({ ...weights, weather: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Building Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>Building Facility ML Weight (w_b):</span>
                <span className="font-bold text-blue-400">
                  {(weights.building * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.building}
                onChange={(e) => setWeights({ ...weights, building: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Exposure Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                <span>WUI Exposure & Occupancy Density Weight (w_e):</span>
                <span className="font-bold text-purple-400">
                  {(weights.exposure * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.exposure}
                onChange={(e) => setWeights({ ...weights, exposure: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="rounded border border-slate-800 bg-[#12192c] p-3 text-xs font-mono text-slate-300 space-y-1">
              <div className="font-semibold text-white">Weighting Methodology Formula:</div>
              <div className="text-orange-400 text-[11px]">
                HazardScore = (w_f × Forest) + (w_w × Weather) + (w_b × Building) + (w_e × Exposure)
              </div>
              <div className="text-[11px] text-slate-400">
                Normalized Sum: {totalWeight.toFixed(2)} (Automatically balanced to 1.00 at runtime)
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500 shadow transition disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              <span>{saving ? 'Updating Weights...' : 'Apply & Save Fusion Weights'}</span>
            </button>
          </form>
        </div>

        {/* Right: Decoupled Cloud Architecture & AWS Readiness */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <CloudOff className="h-4 w-4 text-emerald-400" />
                <span>Decoupled Cloud Abstraction Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Pure local operation with zero cloud dependency & zero billing
              </p>
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40">
              100% LOCAL
            </span>
          </div>

          <div className="space-y-2.5">
            {services.map((s) => (
              <div
                key={s.contract}
                className="rounded-lg border border-slate-800 bg-[#12192c] p-3 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{s.domain}</span>
                  <span className="text-emerald-400 text-[11px]">{s.status}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Interface Contract: <code className="text-slate-300">{s.contract}</code>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Active Local Provider: <code className="text-emerald-300">{s.activeLocal}</code>
                </div>
                <div className="text-slate-500 text-[10px]">
                  Future Cloud Target: {s.futureCloud}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 font-mono">
            <strong>Future Cloud Integration Notice:</strong> Complete architectural blueprints, interface stubs, and step-by-step instructions for AWS deployment are detailed in <code className="text-white font-bold">docs/aws-integration-guide.md</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
