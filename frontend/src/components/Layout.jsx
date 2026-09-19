import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  MapPin,
  Building2,
  Map as MapIcon,
  Clock,
  PlaySquare,
  Navigation,
  Bell,
  BarChart3,
  Sliders,
  ShieldAlert,
  Server,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { fireGuardApi } from '../services/api';

const NAV_GROUPS = [
  {
    title: 'Command & Overview',
    items: [
      { label: 'Main Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Geospatial & Wildland',
    items: [
      { label: 'Regional Risk', path: '/regional-risk', icon: MapPin },
      { label: 'Fire Map', path: '/map', icon: MapIcon },
      { label: '6-Hour Forecast', path: '/forecast', icon: Clock },
    ],
  },
  {
    title: 'Facility & Emergency',
    items: [
      { label: 'Building Risk (2D)', path: '/building-risk', icon: Building2 },
      { label: 'What-If Simulation', path: '/simulation', icon: PlaySquare },
      { label: 'Evacuation Routes', path: '/evacuation', icon: Navigation },
    ],
  },
  {
    title: 'Intelligence & Ops',
    items: [
      { label: 'Active Alerts', path: '/alerts', icon: Bell, badgeKey: 'alerts' },
      { label: 'Sensor Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'System Settings', path: '/settings', icon: Sliders },
    ],
  },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [currentRiskLevel, setCurrentRiskLevel] = useState('MEDIUM');
  const [overallScore, setOverallScore] = useState(32.3);
  const location = useLocation();

  useEffect(() => {
    // Poll alerts & current hazard level
    const fetchStatus = async () => {
      try {
        const [alertData, riskData] = await Promise.all([
          fireGuardApi.getAlerts().catch(() => null),
          fireGuardApi.getCurrentRisk().catch(() => null),
        ]);

        if (alertData?.counts) {
          setActiveAlertCount(alertData.counts.critical + alertData.counts.warning);
        }
        if (riskData) {
          setCurrentRiskLevel(riskData.overall_fire_hazard_level || 'MEDIUM');
          setOverallScore(riskData.overall_fire_hazard_score || 32.3);
        }
      } catch (err) {
        // silent fail in dev
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const hazardColor = {
    CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/10',
    HIGH: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    LOW: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  }[currentRiskLevel] || 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 antialiased font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-[#0d1322] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-red-500/20">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
                <span>FireGuard</span>
                <span className="rounded bg-orange-500/20 px-1 py-0.2 text-[10px] font-mono font-semibold text-orange-400 border border-orange-500/30">
                  AI v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">COMMAND CENTER</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badgeKey === 'alerts' && activeAlertCount > 0 && (
                        <span className="flex h-5 items-center justify-center rounded-full bg-red-500/20 px-2 text-[10px] font-mono font-bold text-red-400 border border-red-500/40">
                          {activeAlertCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Status */}
        <div className="border-t border-slate-800/80 p-4 bg-[#0a0e19]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              LOCAL DEV READY
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
              NO CLOUD REQ
            </span>
          </div>
          <div className="text-[11px] text-slate-300 leading-tight">
            Multi-Source Hazard Simulation & Evacuation Engine
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#0d1322]/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-700/60 p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-white tracking-wide">
                FireGuard AI — Hazard Response System
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Decoupled Architecture | High-Fidelity Local Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Overall Hazard Pill */}
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${hazardColor}`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>HAZARD INDEX:</span>
              <span>{overallScore}% ({currentRiskLevel})</span>
            </div>

            {/* Quick Alert Bell */}
            <Link
              to="/alerts"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition"
              title="Active Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-mono font-bold text-white shadow">
                  {activeAlertCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
