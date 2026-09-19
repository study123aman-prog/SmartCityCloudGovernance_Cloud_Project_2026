import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Navigation,
  Building2,
  DoorOpen,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Compass,
  Footprints
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Evacuation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialBuilding = queryParams.get('building') || 'building_a';
  const initialZone = queryParams.get('zone') || 'bldg_a_elec';

  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuilding);
  const [startZoneId, setStartZoneId] = useState(initialZone);
  const [buildingData, setBuildingData] = useState(null);
  const [evacuationPlan, setEvacuationPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  // Load building metadata
  useEffect(() => {
    const fetchBldgs = async () => {
      try {
        const list = await fireGuardApi.getBuildings();
        setBuildings(list || []);
      } catch (err) {
        console.error('Failed to load buildings:', err);
      }
    };
    fetchBldgs();
  }, []);

  // Fetch building topology & run route computation
  const computeRoute = async (bldgId, zoneId) => {
    setComputing(true);
    try {
      const [bData, plan] = await Promise.all([
        fireGuardApi.getBuilding(bldgId),
        fireGuardApi.getEvacuationRoute(bldgId, zoneId),
      ]);
      setBuildingData(bData);
      setEvacuationPlan(plan);
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setLoading(false);
      setComputing(false);
    }
  };

  useEffect(() => {
    computeRoute(selectedBuildingId, startZoneId);
  }, [selectedBuildingId, startZoneId]);

  const handleSelectBuilding = (bldgId) => {
    setSelectedBuildingId(bldgId);
    let defaultZone = 'bldg_a_elec';
    if (bldgId === 'building_b') defaultZone = 'bldg_b_server';
    else if (bldgId === 'building_c') defaultZone = 'bldg_c_kitchen';
    setStartZoneId(defaultZone);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const routeSet = new Set(evacuationPlan?.route || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Navigation className="h-6 w-6 text-blue-400" />
            <span>Safest Evacuation Route Planner</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Dijkstra Shortest & Lowest-Hazard Egress Pathfinder Bypassing Compromised Zones
          </p>
        </div>

        {/* Building selector */}
        <div className="flex items-center gap-2">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelectBuilding(b.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold font-mono transition ${
                selectedBuildingId === b.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Origin Select */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-300 font-mono font-bold uppercase">
            Origin Zone:
          </label>
          <select
            value={startZoneId}
            onChange={(e) => setStartZoneId(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
          >
            {buildingData?.zones
              ?.filter((z) => !z.is_exit)
              .map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.type})
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => computeRoute(selectedBuildingId, startZoneId)}
            disabled={computing}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 shadow transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${computing ? 'animate-spin' : ''}`} />
            <span>{computing ? 'Recalculating...' : 'Recalculate Path'}</span>
          </button>
        </div>
      </div>

      {/* Main Path Viewport (2D Visualizer + Route Directives) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: 2D Path Overlay (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] p-4 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Floorplan Egress Route Overlay — {buildingData?.name}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Egress Route
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Start
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-600" /> Exit
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[420px] rounded-lg border border-slate-800/80 bg-[#070b14] overflow-hidden flex items-center justify-center p-3">
            <svg viewBox="0 0 650 440" className="w-full h-full max-h-[440px] select-none">
              {/* Connections */}
              {buildingData?.zones?.map((zone) =>
                zone.connected_zones?.map((conn) => {
                  const targetZone = buildingData.zones.find((tz) => tz.id === conn.target_id);
                  if (!targetZone) return null;
                  const inPath = routeSet.has(zone.id) && routeSet.has(conn.target_id);

                  const x1 = zone.coordinates.x + zone.coordinates.width / 2;
                  const y1 = zone.coordinates.y + zone.coordinates.height / 2;
                  const x2 = targetZone.coordinates.x + targetZone.coordinates.width / 2;
                  const y2 = targetZone.coordinates.y + targetZone.coordinates.height / 2;

                  return (
                    <line
                      key={`${zone.id}-${conn.target_id}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={inPath ? '#10b981' : '#1e293b'}
                      strokeWidth={inPath ? '4' : '1.5'}
                      strokeDasharray={inPath ? 'none' : '4 4'}
                    />
                  );
                })
              )}

              {/* Zones */}
              {buildingData?.zones?.map((zone) => {
                const inRoute = routeSet.has(zone.id);
                const isStart = zone.id === startZoneId;
                const isExit = zone.is_exit || zone.type === 'exit';
                const isDestExit = zone.id === evacuationPlan?.destination_exit?.id;
                const { x, y, width, height } = zone.coordinates;

                let fill = 'rgba(30, 41, 59, 0.5)';
                let stroke = '#334155';

                if (isStart) {
                  fill = 'rgba(59, 130, 246, 0.35)';
                  stroke = '#3b82f6';
                } else if (isDestExit) {
                  fill = 'rgba(16, 185, 129, 0.4)';
                  stroke = '#10b981';
                } else if (inRoute) {
                  fill = 'rgba(16, 185, 129, 0.2)';
                  stroke = '#10b981';
                }

                return (
                  <g key={zone.id}>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx="6"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={inRoute ? '2.5' : '1.5'}
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
                      {zone.type.toUpperCase()}
                    </text>

                    {/* Step order index badge */}
                    {inRoute && (
                      <g transform={`translate(${x + width - 35}, ${y + 10})`}>
                        <circle cx="12" cy="10" r="11" fill="#10b981" />
                        <text
                          x="12"
                          y="14"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          #{evacuationPlan.route.indexOf(zone.id) + 1}
                        </text>
                      </g>
                    )}

                    {isDestExit && (
                      <g transform={`translate(${x + 10}, ${y + height - 25})`}>
                        <rect x="0" y="0" width="105" height="18" rx="3" fill="#059669" />
                        <text
                          x="52"
                          y="13"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          DESIGNATED EXIT
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Dijkstra Shortest & Lowest Risk Path Algorithm</span>
            <span>Numbers indicate progression order</span>
          </div>
        </div>

        {/* Right: Path Details & Navigation Directives (1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Footprints className="h-4 w-4 text-emerald-400" />
                <span>Egress Directives</span>
              </h3>
              <RiskBadge
                level={
                  evacuationPlan?.safety_rating === 'OPTIMAL' ? 'LOW' : evacuationPlan?.safety_rating === 'CAUTION' ? 'MEDIUM' : 'CRITICAL'
                }
              />
            </div>

            {/* Path Key Metrics */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="rounded border border-slate-800 bg-[#12192c] p-2.5">
                <span className="text-slate-400 block text-[10px]">TOTAL DISTANCE</span>
                <span className="text-lg font-bold text-white">
                  {evacuationPlan?.total_distance_meters} m
                </span>
              </div>
              <div className="rounded border border-slate-800 bg-[#12192c] p-2.5">
                <span className="text-slate-400 block text-[10px]">ROUTE RISK</span>
                <span className="text-lg font-bold text-emerald-400">
                  {evacuationPlan?.risk}% (Safe)
                </span>
              </div>
            </div>

            {/* Destination Exit Card */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase">
                TARGET EMERGENCY EXIT:
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {evacuationPlan?.destination_exit?.name}
              </div>
            </div>

            {/* Waypoint Steps */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Waypoint Progression
              </span>
              <div className="mt-2 space-y-2">
                {evacuationPlan?.route_details?.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-2.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                        {idx + 1}
                      </span>
                      <span className="text-white font-medium">{step.name}</span>
                    </div>
                    <span className="text-slate-400">{step.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings if any */}
            {evacuationPlan?.warnings?.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>HAZARD AVOIDANCE NOTICES</span>
                </div>
                {evacuationPlan.warnings.map((w, i) => (
                  <div key={i} className="text-[11px] leading-relaxed">
                    • {w}
                  </div>
                ))}
              </div>
            )}

            {/* Alternate Routes */}
            {evacuationPlan?.alternate_routes?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Secondary Backup Egress
                </span>
                <div className="mt-2 space-y-1.5">
                  {evacuationPlan.alternate_routes.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded border border-slate-800 bg-[#12192c] p-2 text-xs flex items-center justify-between font-mono"
                    >
                      <span className="text-slate-200">{alt.exit_name}</span>
                      <span className="text-slate-400 text-[11px]">{alt.total_distance_meters}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
