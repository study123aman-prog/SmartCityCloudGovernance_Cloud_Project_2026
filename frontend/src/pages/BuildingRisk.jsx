import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Thermometer,
  CloudFog,
  Zap,
  Flame,
  DoorOpen,
  ArrowRight,
  ShieldAlert,
  Info,
  RefreshCw,
  Navigation
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function BuildingRisk() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('building_a');
  const [buildingData, setBuildingData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBuilding = async (id, isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fireGuardApi.getBuilding(id);
      setBuildingData(data);
      if (data?.zones?.length > 0) {
        // preserve selected zone or default to first
        setSelectedZone((prev) => {
          if (prev) {
            const updated = data.zones.find((z) => z.id === prev.id);
            return updated || data.zones[0];
          }
          return data.zones[0];
        });
      }
    } catch (err) {
      console.error('Failed to fetch building details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await fireGuardApi.getBuildings();
        setBuildings(list || []);
        if (list?.length > 0) {
          const initId = list[0].id;
          setSelectedBuildingId(initId);
          fetchBuilding(initId);
        }
      } catch (err) {
        console.error('Failed to load buildings list:', err);
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const handleSelectBuilding = (id) => {
    setSelectedBuildingId(id);
    setSelectedZone(null);
    fetchBuilding(id);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Zone risk styling config
  const getZoneFill = (level, isSelected) => {
    if (isSelected) return 'rgba(59, 130, 246, 0.35)';
    switch (level) {
      case 'CRITICAL':
        return 'rgba(239, 68, 68, 0.25)';
      case 'HIGH':
        return 'rgba(249, 115, 22, 0.20)';
      case 'MEDIUM':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(30, 41, 59, 0.6)';
    }
  };

  const getZoneStroke = (level, isSelected) => {
    if (isSelected) return '#60a5fa';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" />
            <span>Infrastructure Fire Hazard & 2D Floorplan</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive Zone Telemetry, Flammability Indices & Algorithmic Hazard Spread
          </p>
        </div>

        {/* Building Selector Pills */}
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
          <button
            onClick={() => fetchBuilding(selectedBuildingId, true)}
            disabled={refreshing}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            title="Refresh building telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Floorplan & Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Interactive 2D Floorplan (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                {buildingData?.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {buildingData?.campus} • Total Area: {buildingData?.total_area_sqm} m²
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Med
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Crit
              </span>
            </div>
          </div>

          {/* SVG Canvas for 2D Floorplan */}
          <div className="relative flex-1 min-h-[420px] rounded-lg border border-slate-800/80 bg-[#070b14] overflow-hidden flex items-center justify-center p-4">
            <svg
              viewBox="0 0 650 440"
              className="w-full h-full max-h-[440px] select-none"
            >
              {/* Draw Connection Links */}
              {buildingData?.zones?.map((zone) =>
                zone.connected_zones?.map((conn) => {
                  const targetZone = buildingData.zones.find((tz) => tz.id === conn.target_id);
                  if (!targetZone) return null;
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
                      stroke="#1e293b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })
              )}

              {/* Draw Zone Boxes */}
              {buildingData?.zones?.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                const isExit = zone.is_exit || zone.type === 'exit';
                const { x, y, width, height } = zone.coordinates;

                return (
                  <g
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className="cursor-pointer transition-transform hover:opacity-90"
                  >
                    {/* Zone Boundary Box */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx="6"
                      fill={getZoneFill(zone.risk_level, isSelected)}
                      stroke={getZoneStroke(zone.risk_level, isSelected)}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />

                    {/* Zone Label */}
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

                    {/* Type & Flammability */}
                    <text
                      x={x + 10}
                      y={y + 38}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {zone.type.toUpperCase()} • FLAM: {zone.flammability || 2.5}
                    </text>

                    {/* Telemetry quick view */}
                    <text
                      x={x + 10}
                      y={y + height - 24}
                      fill="#cbd5e1"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {zone.telemetry?.temperature ? `${zone.telemetry.temperature}°C` : ''}
                      {zone.telemetry?.smoke_index ? ` | Smoke: ${zone.telemetry.smoke_index}` : ''}
                    </text>

                    {/* Occupancy Indicator */}
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

                    {/* Exit Badge */}
                    {isExit && (
                      <g transform={`translate(${x + width - 65}, ${y + height - 25})`}>
                        <rect x="0" y="0" width="55" height="18" rx="3" fill="#059669" />
                        <text
                          x="27"
                          y="13"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          EXIT
                        </text>
                      </g>
                    )}

                    {/* Risk Tag Badge */}
                    <g transform={`translate(${x + 10}, ${y + height - 16})`}>
                      <text
                        x="0"
                        y="0"
                        fill={
                          zone.risk_level === 'CRITICAL' ? '#f87171' : zone.risk_level === 'HIGH' ? '#fb923c' : zone.risk_level === 'MEDIUM' ? '#fbbf24' : '#34d399'
                        }
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {zone.risk_level} ({zone.risk_score?.toFixed(0)}%)
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Click any zone box to inspect sensor telemetry & propagation details</span>
            <span>Scale: 1:100 Topographic Schematic</span>
          </div>
        </div>

        {/* Right: Zone Inspector Sidebar (1 col) */}
        <div className="space-y-4">
          {selectedZone ? (
            <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedZone.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedZone.id}</p>
                </div>
                <RiskBadge level={selectedZone.risk_level} score={selectedZone.risk_score} />
              </div>

              {/* Sensor Telemetry Cards */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Live Zone Sensor Readings
                </span>
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                      <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                      <span>TEMPERATURE</span>
                    </div>
                    <div className="mt-1 text-base font-bold font-mono text-white">
                      {selectedZone.telemetry?.temperature ?? 22.0}°C
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                      <CloudFog className="h-3.5 w-3.5 text-slate-400" />
                      <span>SMOKE INDEX</span>
                    </div>
                    <div className="mt-1 text-base font-bold font-mono text-white">
                      {selectedZone.telemetry?.smoke_index ?? 0.2}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>ELECTRICAL LOAD</span>
                    </div>
                    <div className="mt-1 text-base font-bold font-mono text-white">
                      {selectedZone.telemetry?.electrical_load ?? 40.0} kW
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#12192c] p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      <span>OCCUPANTS</span>
                    </div>
                    <div className="mt-1 text-base font-bold font-mono text-white">
                      {selectedZone.occupancy ?? 0} / {selectedZone.max_occupancy ?? 30}
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Characteristics */}
              <div className="rounded-lg border border-slate-800/80 bg-[#12192c] p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Zone Type:</span>
                  <span className="font-semibold text-white uppercase">{selectedZone.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flammability Rating:</span>
                  <span className="font-semibold text-white">{selectedZone.flammability || 2.5} / 5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Designated Exit:</span>
                  <span className="font-semibold text-white">{selectedZone.is_exit ? 'YES (Egress point)' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ML Hazard Probability:</span>
                  <span className="font-semibold text-white">{((selectedZone.risk_score || 5) / 100).toFixed(3)}</span>
                </div>
              </div>

              {/* Connected Zones */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Connected Corridor Graph ({selectedZone.connected_zones?.length || 0})
                </span>
                <div className="mt-2 space-y-1.5">
                  {selectedZone.connected_zones?.map((conn) => {
                    const target = buildingData?.zones?.find((z) => z.id === conn.target_id);
                    return (
                      <div
                        key={conn.target_id}
                        onClick={() => target && setSelectedZone(target)}
                        className="cursor-pointer rounded border border-slate-800 bg-slate-900/60 p-2 text-xs flex items-center justify-between hover:border-slate-700 transition font-mono"
                      >
                        <span className="text-slate-200">{target?.name || conn.target_id}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{conn.distance_meters}m</span>
                          <ArrowRight className="h-3 w-3 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Route from here */}
              <Link
                to={`/evacuation?building=${selectedBuildingId}&zone=${selectedZone.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Compute Safest Evacuation Route</span>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-8 text-center text-slate-500 text-xs">
              Select a zone on the floorplan to view telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
