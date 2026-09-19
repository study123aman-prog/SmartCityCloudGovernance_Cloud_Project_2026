import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Clock,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecast = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fireGuardApi.getForecast();
      setForecast(data);
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Format chart series data
  const chartData = forecast?.timeline?.map((item) => ({
    name: item.label.split(' ')[0],
    fullTime: item.label,
    OverallHazard: item.overall_hazard_score,
    ForestRisk: item.forest_risk.score,
    BuildingRisk: item.building_risk.score,
    WeatherRisk: item.weather_risk_score,
    Temperature: item.projected_weather.temperature,
    Humidity: item.projected_weather.humidity,
    WindSpeed: item.projected_weather.wind_speed,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-orange-400" />
            <span>6-Hour Time-Series Predictive Hazard Forecast</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Diurnal Atmospheric Curves Evaluated Through Real-Time ML Inference Pipelines
          </p>
        </div>
        <button
          onClick={() => fetchForecast(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 self-start rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Recalculate Model'}</span>
        </button>
      </div>

      {/* Peak Risk Summary Alert Banner */}
      <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <span>PROJECTED PEAK PERIOD:</span>
              <span className="text-orange-400">{forecast?.peak_label}</span>
              <RiskBadge level={forecast?.peak_level} size="sm" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Atmospheric temperature and convective wind gusts peak concurrently, escalating fuel flammability.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Horizon: Current → +6 Hours
        </div>
      </div>

      {/* Chart 1: Fire Hazard Score Progression */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-mono">
            Hazard Score Progression (Current → +6h)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Scores evaluated by Random Forest models</span>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <Line
                type="monotone"
                dataKey="OverallHazard"
                name="Overall Hazard Index"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f97316' }}
              />
              <Line
                type="monotone"
                dataKey="ForestRisk"
                name="Forest Wildland ML"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="WeatherRisk"
                name="Weather Atmospheric"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="BuildingRisk"
                name="Building Facility ML"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Meteorological Diurnal Swing */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-mono">
            Diurnal Meteorology: Temperature vs Fuel Moisture Aridity
          </h3>
          <span className="text-xs text-slate-400 font-mono">Atmospheric drivers</span>
        </div>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
              <Area
                type="monotone"
                dataKey="Temperature"
                name="Temperature (°C)"
                stroke="#ef4444"
                fill="rgba(239, 68, 68, 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Humidity"
                name="Relative Humidity (%)"
                stroke="#06b6d4"
                fill="rgba(6, 182, 212, 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="WindSpeed"
                name="Wind Speed (km/h)"
                stroke="#8b5cf6"
                fill="rgba(139, 92, 246, 0.15)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Hourly Breakdown Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg overflow-x-auto">
        <h3 className="text-base font-bold text-white font-mono mb-3">
          Step-by-Step Hourly Forecast Verification Matrix
        </h3>
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-2.5">Horizon</th>
              <th className="pb-2.5">Temperature</th>
              <th className="pb-2.5">Humidity</th>
              <th className="pb-2.5">Wind</th>
              <th className="pb-2.5">Forest ML</th>
              <th className="pb-2.5">Building ML</th>
              <th className="pb-2.5">Hazard Score</th>
              <th className="pb-2.5">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {forecast?.timeline?.map((item) => (
              <tr key={item.hour_offset} className="hover:bg-slate-800/40 transition">
                <td className="py-3 font-bold text-white">{item.label}</td>
                <td className="py-3">{item.projected_weather.temperature}°C</td>
                <td className="py-3">{item.projected_weather.humidity}%</td>
                <td className="py-3">{item.projected_weather.wind_speed} km/h</td>
                <td className="py-3 text-emerald-400">{item.forest_risk.score.toFixed(1)}%</td>
                <td className="py-3 text-blue-400">{item.building_risk.score.toFixed(1)}%</td>
                <td className="py-3 font-extrabold text-white">{item.overall_hazard_score.toFixed(1)}%</td>
                <td className="py-3">
                  <RiskBadge level={item.overall_hazard_level} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
