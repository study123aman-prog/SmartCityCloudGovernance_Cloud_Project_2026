import React, { useState, useEffect } from 'react';
import {
  PlaySquare,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  Users,
  Navigation,
  CheckCircle2,
  Building2,
  Sliders,
  RefreshCw,
  Info
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Simulation() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('building_a');
  const [originZoneId, setOriginZoneId] = useState('bldg_a_elec');
  const [initialSeverity, setInitialSeverity] = useState('CRITICAL');
  const [temperature, setTemperature] = useState(42.0);
  const [humidity, setHumidity] = useState(18.0);
  const [wind, setWind] = useState(15.0);
  const [duration, setDuration] = useState(6);

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchBldgs = async () => {
      try {
        const list = await fireGuardApi.getBuildings();
        setBuildings(list || []);
      } catch (err) {
        console.error('Failed to load buildings for simulation:', err);
      }
    };
    fetchBldgs();
  }, []);

  // Update origin zone when building changes
  useEffect(() => {
    if (selectedBuildingId === 'building_a') setOriginZoneId('bldg_a_elec');
    else if (selectedBuildingId === 'building_b') setOriginZoneId('bldg_b_server');
    else if (selectedBuildingId === 'building_c') setOriginZoneId('bldg_c_kitchen');
  }, [selectedBuildingId]);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    setSimulating(true);
    setIsPlaying(false);
    try {
      const sim = await fireGuardApi.runSimulation({
        building_id: selectedBuildingId,
        origin_zone_id: originZoneId,
        initial_severity: initialSeverity,
        temperature: Number(temperature),
        humidity: Number(humidity),
        wind: Number(wind),
        duration: Number(duration),
      });
      setSimulationResult(sim);
      setActiveStepIndex(0);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Automated Playback Timer
  useEffect(() => {
    let interval = null;
    if (isPlaying && simulationResult?.steps) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= simulationResult.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationResult]);

  const currentStep = simulationResult?.steps?.[activeStepIndex] || null;

  const getZoneFill = (level, isOrigin) => {
    if (isOrigin) return 'rgba(239, 68, 68, 0.45)';
    switch (level) {
      case 'CRITICAL':
        return 'rgba(239, 68, 68, 0.35)';
      case 'HIGH':
        return 'rgba(249, 115, 22, 0.25)';
      case 'MEDIUM':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(30, 41, 59, 0.6)';
    }
  };

  const getZoneStroke = (level, isOrigin) => {
    if (isOrigin) return '#ef4444';
    switch (level) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#f59e0b';
      default:
        return '#334155';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <PlaySquare className="h-6 w-6 text-orange-500" />
          <span>What-If Fire Hazard Propagation Simulator</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Discrete-Time Multi-Hop Thermal Propagation Modeling & Dynamic Egress Rerouting
        </p>
      </div>

      {/* Top Controls: Setup Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {/* Building Selection */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Building</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono"
              >
                <option value="building_a">Building A (Research)</option>
                <option value="building_b">Building B (Academic)</option>
                <option value="building_c">Building C (Operations)</option>
              </select>
            </div>

            {/* Origin Zone */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Origin Zone</label>
              <select
                value={originZoneId}
                onChange={(e) => setOriginZoneId(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono"
              >
                {selectedBuildingId === 'building_a' && (
                  <>
                    <option value="bldg_a_elec">Electrical Room</option>
                    <option value="bldg_a_lab1">Lab 1 (Chemical)</option>
                    <option value="bldg_a_lab2">Lab 2 (Optics)</option>
                    <option value="bldg_a_storage">Chemical Storage</option>
                  </>
                )}
                {selectedBuildingId === 'building_b' && (
                  <>
                    <option value="bldg_b_server">Server Room</option>
                    <option value="bldg_b_class1">Classroom 1</option>
                    <option value="bldg_b_storage">Hardware Storage</option>
                  </>
                )}
                {selectedBuildingId === 'building_c' && (
                  <>
                    <option value="bldg_c_kitchen">Commercial Kitchen</option>
                    <option value="bldg_c_office">Admin Office</option>
                    <option value="bldg_c_storage">Warehouse Storage</option>
                  </>
                )}
              </select>
            </div>

            {/* Initial Severity */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Severity</label>
              <select
                value={initialSeverity}
                onChange={(e) => setInitialSeverity(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono"
              >
                <option value="CRITICAL">CRITICAL (Ignition)</option>
                <option value="HIGH">HIGH (Thermal Spike)</option>
                <option value="MEDIUM">MEDIUM (Smoldering)</option>
              </select>
            </div>

            {/* Ambient Temperature */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Temp ({temperature}°C)</label>
              <input
                type="range"
                min="20"
                max="55"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Relative Humidity */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Humidity ({humidity}%)</label>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* External Airflow / Wind */}
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Airflow ({wind} km/h)</label>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={simulating}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-500 shadow-md shadow-orange-600/30 transition disabled:opacity-50"
              >
                <Flame className={`h-4 w-4 ${simulating ? 'animate-spin' : 'fill-current'}`} />
                <span>{simulating ? 'Simulating...' : 'Run Sim'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Simulation Viewport (Canvas + Playback Controls + Metrics) */}
      {simulationResult ? (
        <div className="space-y-6">
          {/* Playback Scrubber & Timeline Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition shadow"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStepIndex(0);
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                title="Reset simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={activeStepIndex >= simulationResult.steps.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(simulationResult.steps.length - 1, prev + 1))}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="ml-2 text-xs text-white font-bold">
                Step {activeStepIndex} of {simulationResult.steps.length - 1} (T+{currentStep?.elapsed_minutes} min)
              </div>
            </div>

            {/* Step Scrubber Slider */}
            <div className="flex-1 max-w-md mx-2">
              <input
                type="range"
                min="0"
                max={simulationResult.steps.length - 1}
                value={activeStepIndex}
                onChange={(e) => setActiveStepIndex(parseInt(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="text-xs font-mono text-slate-400">
              {currentStep?.narrative}
            </div>
          </div>

          {/* Visualization Grid: 2D Step Floorplan + Real-Time Incident Status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* SVG 2D Map (2 cols) */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] p-4 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Hazard Spread Visualization — T+{currentStep?.elapsed_minutes} min
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {simulationResult.building.name}
                </span>
              </div>

              <div className="relative flex-1 min-h-[420px] rounded-lg border border-slate-800/80 bg-[#070b14] overflow-hidden flex items-center justify-center p-3">
                <svg viewBox="0 0 650 440" className="w-full h-full max-h-[440px] select-none">
                  {/* Zones */}
                  {currentStep?.zone_states?.map((zone) => {
                    const isOrigin = zone.id === simulationResult.parameters.origin_zone_id;
                    const { x, y, width, height } = zone.coordinates;

                    return (
                      <g key={zone.id}>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          rx="6"
                          fill={getZoneFill(zone.risk_level, isOrigin)}
                          stroke={getZoneStroke(zone.risk_level, isOrigin)}
                          strokeWidth={isOrigin ? '3' : '1.5'}
                        />
                        <text
                          x={x + 10}
                          y={y + 22}
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {zone.name}
                        </text>
                        <text
                          x={x + 10}
                          y={y + 38}
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {zone.type.toUpperCase()} • FLAM: {zone.flammability || 2.5}
                        </text>

                        {/* Occupancy pill */}
                        <g transform={`translate(${x + width - 35}, ${y + 10})`}>
                          <circle cx="12" cy="10" r="10" fill="#1e293b" stroke="#334155" />
                          <text
                            x="12"
                            y="14"
                            fill="#38bdf8"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {zone.occupancy || 0}
                          </text>
                        </g>

                        {/* Fire Origin Icon */}
                        {isOrigin && (
                          <g transform={`translate(${x + width - 35}, ${y + height - 32})`}>
                            <circle cx="12" cy="12" r="12" fill="#ef4444" />
                            <text x="12" y="16" fill="#fff" fontSize="11" textAnchor="middle">🔥</text>
                          </g>
                        )}

                        {/* Risk status */}
                        <text
                          x={x + 10}
                          y={y + height - 16}
                          fill={
                            zone.risk_level === 'CRITICAL' ? '#f87171' : zone.risk_level === 'HIGH' ? '#fb923c' : zone.risk_level === 'MEDIUM' ? '#fbbf24' : '#34d399'
                          }
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {zone.risk_level} ({zone.risk_score.toFixed(0)}%)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Algorithmic discrete risk cascade (heuristic multi-hop decay)</span>
                <span>🔥 Indicates Primary Fire Origin</span>
              </div>
            </div>

            {/* Simulation Step Incident Metrics (1 col) */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span>Step {activeStepIndex} Incident Status</span>
                </h3>

                {/* Primary Step KPIs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-3 font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">AFFECTED ZONES</span>
                    <span className="text-xl font-bold text-orange-400">
                      {currentStep?.affected_zones_count}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-3 font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">PEOPLE IN DANGER</span>
                    <span className="text-xl font-bold text-red-400">
                      {currentStep?.occupancy_at_risk}
                    </span>
                  </div>
                </div>

                {/* Recommended Exit */}
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5">
                  <span className="text-[11px] text-emerald-400 uppercase font-mono font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>RECOMMENDED EVACUATION DESTINATION</span>
                  </span>
                  <div className="mt-1 text-sm font-bold text-white font-mono">
                    {currentStep?.primary_recommended_exit?.name || 'Exit B (East Main Entrance)'}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Direct egress safely avoiding fire cascade from origin zone.
                  </p>
                </div>

                {/* Compromised Warnings */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Zone Safety Evaluation
                  </span>
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentStep?.zone_states?.map((zs) => (
                      <div
                        key={zs.id}
                        className="rounded border border-slate-800 bg-slate-900/60 p-2 text-xs flex items-center justify-between font-mono"
                      >
                        <span className="text-slate-200">{zs.name}</span>
                        <RiskBadge level={zs.risk_level} score={zs.risk_score} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-12 text-center text-slate-400 space-y-3">
          <Flame className="h-12 w-12 text-orange-500/60 mx-auto" />
          <h3 className="text-base font-bold text-white">No Simulation Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select building origin, severity, and atmospheric factors in the controls above, then click{' '}
            <strong className="text-orange-400">Run Sim</strong> to model step-by-step hazard progression.
          </p>
        </div>
      )}
    </div>
  );
}
