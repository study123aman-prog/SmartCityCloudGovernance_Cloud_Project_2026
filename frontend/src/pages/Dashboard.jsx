import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Building2,
  TreePine,
  CloudSun,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [risk, forecast, alerts, bldgs] = await Promise.all([
        fireGuardApi.getCurrentRisk(),
        fireGuardApi.getForecast(),
        fireGuardApi.getAlerts(),
        fireGuardApi.getBuildings(),
      ]);
      setRiskData(risk);
      setForecastData(forecast);
      setAlertsData(alerts);
      setBuildings(bldgs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard telemetry:', err);
      setError('Telemetry stream temporarily unreachable. Showing cached local state.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm font-mono tracking-wide">INITIALIZING FIREGUARD TELEMETRY...</p>
        </div>
      </div>
    );
  }

  const overallScore = riskData?.overall_fire_hazard_score ?? 32.3;
  const overallLevel = riskData?.overall_fire_hazard_level ?? 'MEDIUM';
  const domainScores = riskData?.domain_scores || {
    forest_risk: 39.5,
    weather_risk: 52.0,
    building_risk: 13.6,
    exposure_risk: 26.5,
  };

  const criticalZones = [];
  buildings.forEach((b) => {
    if (b.highest_risk_score >= 50) {
      criticalZones.push({
        building: b.name,
        code: b.code,
        score: b.highest_risk_score,
        level: b.highest_risk_level,
        occupancy: b.total_occupancy,
      });
    }
  });

  const totalPeopleAtRisk = riskData?.summary?.occupants_at_risk || 0;
  const activeAlerts = alertsData?.alerts?.filter((a) => !a.acknowledged) || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Operational Fire Hazard Overview
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synchronized Multi-Source Hazard Assessment & Infrastructure Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
          <Link
            to="/simulation"
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 shadow-md shadow-orange-600/20 transition"
          >
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span>Run What-If Sim</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData(true)} className="underline hover:text-white">Retry</button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Hazard Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-[#131b2e] to-[#0e1526] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Overall Hazard Index
            </span>
            <Activity className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {overallScore}%
            </span>
            <RiskBadge level={overallLevel} />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Fused from 4 multi-domain environmental vectors
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                overallScore >= 75 ? 'bg-red-500' : overallScore >= 50 ? 'bg-orange-500' : overallScore >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallScore)}%` }}
            />
          </div>
        </div>

        {/* Forest Wildland Risk */}
        <Link
          to="/regional-risk"
          className="group rounded-xl border border-slate-800 bg-[#10172a] p-5 hover:border-slate-700 transition shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Forest & Wildland
            </span>
            <TreePine className="h-4 w-4 text-emerald-400 group-hover:text-white transition" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {domainScores.forest_risk.toFixed(1)}%
            </span>
            <RiskBadge
              level={
                domainScores.forest_risk >= 75 ? 'CRITICAL' : domainScores.forest_risk >= 50 ? 'HIGH' : domainScores.forest_risk >= 25 ? 'MEDIUM' : 'LOW'
              }
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Model: Random Forest (ML)</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-orange-400 transition" />
          </div>
        </Link>

        {/* Building & Facilities */}
        <Link
          to="/building-risk"
          className="group rounded-xl border border-slate-800 bg-[#10172a] p-5 hover:border-slate-700 transition shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Building Peak Risk
            </span>
            <Building2 className="h-4 w-4 text-blue-400 group-hover:text-white transition" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {domainScores.building_risk.toFixed(1)}%
            </span>
            <RiskBadge
              level={
                domainScores.building_risk >= 75 ? 'CRITICAL' : domainScores.building_risk >= 50 ? 'HIGH' : domainScores.building_risk >= 25 ? 'MEDIUM' : 'LOW'
              }
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Facilities: Buildings A, B, C</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-orange-400 transition" />
          </div>
        </Link>

        {/* Occupants / People at Risk */}
        <div className="rounded-xl border border-slate-800 bg-[#10172a] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              People at Risk
            </span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {totalPeopleAtRisk}
            </span>
            <span className="text-xs text-slate-400">occupants in hazard zones</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {totalPeopleAtRisk === 0 ? 'All zones within nominal parameters' : 'Evacuation routes computed'}
          </p>
        </div>
      </div>

      {/* Secondary Metric Strip: Weather Risk, Exposure Risk, Critical Zones, Active Alerts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800/80 bg-[#0d1322] p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <CloudSun className="h-3.5 w-3.5 text-amber-400" />
            <span>WEATHER RISK</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {domainScores.weather_risk.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">High aridity index</div>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-[#0d1322] p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
            <span>EXPOSURE RISK</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {domainScores.exposure_risk.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">WUI boundary proximity</div>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-[#0d1322] p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span>CRITICAL ZONES</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {criticalZones.length}
          </div>
          <div className="text-[11px] text-slate-400">Requiring containment</div>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-[#0d1322] p-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>ACTIVE ALERTS</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-slate-400">Awaiting acknowledgment</div>
        </div>
      </div>

      {/* Main Two-Column Row: 6-Hour Forecast & Active Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 6-Hour Forecast Card (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>6-Hour Time-Series Risk Forecast</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Forward projections based on diurnal meteorological swings
              </p>
            </div>
            <Link
              to="/forecast"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono"
            >
              <span>Detailed Timeline</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {forecastData?.timeline && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
              {forecastData.timeline.map((slot) => (
                <div
                  key={slot.hour_offset}
                  className={`rounded-lg border p-2.5 text-center flex flex-col justify-between transition ${
                    slot.overall_hazard_level === 'CRITICAL'
                      ? 'border-red-500/40 bg-red-500/10'
                      : slot.overall_hazard_level === 'HIGH'
                      ? 'border-orange-500/40 bg-orange-500/10'
                      : slot.overall_hazard_level === 'MEDIUM'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="text-[11px] font-mono font-semibold text-slate-400">
                    {slot.label.split(' ')[0]}
                  </div>
                  <div className="my-2">
                    <div className="text-base font-bold font-mono text-white">
                      {slot.overall_hazard_score.toFixed(0)}%
                    </div>
                    <div className="mt-1">
                      <RiskBadge level={slot.overall_hazard_level} size="sm" />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {slot.projected_weather.temperature}°C
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Alerts Stream (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span>Active Alerts</span>
            </h3>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 font-mono"
            >
              View All ({alertsData?.counts?.total || 0})
            </Link>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-64 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-slate-500 text-xs text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mb-1" />
                <p>No active alerts. All telemetry streams are nominal.</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 text-xs ${
                    alert.severity === 'CRITICAL'
                      ? 'border-red-500/30 bg-red-500/10 text-red-200'
                      : alert.severity === 'WARNING'
                      ? 'border-orange-500/30 bg-orange-500/10 text-orange-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{alert.title}</span>
                    <RiskBadge level={alert.severity} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{alert.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{alert.source.toUpperCase()}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Buildings Summary & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Buildings Status */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span>Monitored Facilities</span>
            </h3>
            <Link
              to="/building-risk"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono"
            >
              <span>Inspect 2D Floorplans</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {buildings.map((bldg) => (
              <Link
                key={bldg.id}
                to={`/building-risk?building=${bldg.id}`}
                className="group rounded-lg border border-slate-800/80 bg-[#11192e] p-4 hover:border-orange-500/40 hover:bg-[#152038] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-orange-400">{bldg.code}</span>
                  <RiskBadge level={bldg.highest_risk_level} size="sm" />
                </div>
                <div className="font-semibold text-white text-sm group-hover:text-orange-300 transition line-clamp-1">
                  {bldg.name.split('—')[0].trim()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{bldg.campus}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400 font-mono">
                  <span>{bldg.zone_count} Zones</span>
                  <span>{bldg.total_occupancy} Occupants</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Launch Operations */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
          <h3 className="text-base font-bold text-white mb-3">Rapid Incident Response</h3>
          <div className="space-y-2">
            <Link
              to="/simulation"
              className="block rounded-lg border border-slate-800 bg-[#121a2d] p-3 hover:border-orange-500/40 hover:bg-slate-800/60 transition"
            >
              <div className="font-semibold text-sm text-white flex items-center justify-between">
                <span>Interactive Fire Simulation</span>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Model flame front cascade across connected building zones
              </p>
            </Link>

            <Link
              to="/evacuation"
              className="block rounded-lg border border-slate-800 bg-[#121a2d] p-3 hover:border-orange-500/40 hover:bg-slate-800/60 transition"
            >
              <div className="font-semibold text-sm text-white flex items-center justify-between">
                <span>Dijkstra Evacuation Router</span>
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dynamic safest route egress bypassing compromised corridors
              </p>
            </Link>

            <Link
              to="/map"
              className="block rounded-lg border border-slate-800 bg-[#121a2d] p-3 hover:border-orange-500/40 hover:bg-slate-800/60 transition"
            >
              <div className="font-semibold text-sm text-white flex items-center justify-between">
                <span>Geospatial Wildfire Map</span>
                <CloudSun className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Interactive Leaflet map tracking wildland perimeter & FWI indices
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
