import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  Check,
  Filter,
  RefreshCw,
  Plus,
  Radio,
  ExternalLink
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const fetchAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fireGuardApi.getAlerts();
      setAlerts(data?.alerts || []);
      setCounts(data?.counts || { total: 0, critical: 0, warning: 0, info: 0 });
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    setAcknowledgingId(id);
    try {
      await fireGuardApi.acknowledgeAlert(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-orange-400" />
            <span>Local Emergency Response & Alert Console</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            LocalAlertService Dispatch • In-Process Repository & Real-Time Notification Stream
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Alerts'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 font-mono shadow">
          <span className="text-slate-400 text-xs uppercase block">TOTAL INCIDENTS</span>
          <span className="text-2xl font-bold text-white mt-1 block">{counts.total}</span>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-mono shadow">
          <span className="text-red-300 text-xs uppercase block">CRITICAL HAZARDS</span>
          <span className="text-2xl font-bold text-red-400 mt-1 block">{counts.critical}</span>
        </div>
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 font-mono shadow">
          <span className="text-orange-300 text-xs uppercase block">ELEVATED WARNINGS</span>
          <span className="text-2xl font-bold text-orange-400 mt-1 block">{counts.warning}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 font-mono shadow">
          <span className="text-slate-400 text-xs uppercase block">INFORMATIONAL</span>
          <span className="text-2xl font-bold text-slate-300 mt-1 block">{counts.info}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono">
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterSeverity === sev
                  ? 'bg-slate-700 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredAlerts.length} incidents
        </span>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-12 text-center text-slate-500 text-xs space-y-2">
            <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No matching alerts found</p>
            <p>All environmental telemetry is currently below active thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.severity === 'CRITICAL'
                  ? 'border-red-500/40 bg-gradient-to-r from-red-500/15 via-[#131726] to-[#0f172a]'
                  : alert.severity === 'WARNING'
                  ? 'border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-[#131726] to-[#0f172a]'
                  : 'border-slate-800 bg-[#0f172a]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <RiskBadge level={alert.severity} size="sm" />
                  <span className="font-bold text-white text-sm">{alert.title}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    [{alert.source.toUpperCase()}]
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {alert.message}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
                  {alert.score > 0 && <span>Hazard Score: {alert.score}%</span>}
                  {alert.acknowledged && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Acknowledged by {alert.acknowledged_by}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                {!alert.acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={acknowledgingId === alert.id}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{acknowledgingId === alert.id ? 'Saving...' : 'Acknowledge'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-slate-500 px-3 py-1.5">
                    RESOLVED
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AWS SNS Migration Documentation Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f1d] p-5 shadow-lg space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
          <Radio className="h-4 w-4 text-blue-400" />
          <span>AWS SNS Integration Boundary Documentation</span>
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Currently, all warnings and critical hazard alerts are handled by <code className="text-orange-300 font-mono">LocalAlertService</code> and logged to the in-memory/MongoDB <code className="text-orange-300 font-mono">LocalAlertRepository</code>.
          To later connect to Amazon SNS for SMS and email broadcasts:
          replace <code className="text-orange-300 font-mono">LocalAlertService.dispatchAlert()</code> with AWS SNS <code className="text-orange-300 font-mono">PublishCommand</code>.
          See <code className="text-blue-400 font-mono">docs/aws-integration-guide.md</code> for complete code references.
        </p>
      </div>
    </div>
  );
}
