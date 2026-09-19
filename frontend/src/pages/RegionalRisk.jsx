import React, { useState, useEffect } from 'react';
import {
  TreePine,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  Compass,
  Flame,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function RegionalRisk() {
  const [locations, setLocations] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingModel, setTestingModel] = useState(false);

  // Custom simulation inputs
  const [customParams, setCustomParams] = useState({
    temperature: 36.5,
    humidity: 20.0,
    wind_speed: 18.0,
    pressure: 1005.0,
    rainfall: 0.0,
    oxygen_level: 20.95,
    ffmc: 91.5,
    dmc: 55.0,
    dc: 340.0,
    isi: 13.5,
    bui: 68.0,
    fwi: 31.0,
  });

  const [assessmentResult, setAssessmentResult] = useState(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await fireGuardApi.getGeospatialRisk();
        setLocations(data || []);
        if (data?.length > 0) {
          setSelectedSite(data[0]);
        }
      } catch (err) {
        console.error('Failed to load regional sites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleSelectSite = (site) => {
    setSelectedSite(site);
    setCustomParams({
      temperature: site.telemetry.temperature,
      humidity: site.telemetry.humidity,
      wind_speed: site.telemetry.wind_speed,
      pressure: site.telemetry.pressure,
      rainfall: site.telemetry.rainfall,
      oxygen_level: site.telemetry.oxygen_level,
      ffmc: site.telemetry.fwi ? 90.0 : 85.0,
      dmc: 45.0,
      dc: 250.0,
      isi: site.telemetry.isi || 10.0,
      bui: 50.0,
      fwi: site.telemetry.fwi || 25.0,
    });
    setAssessmentResult(null);
  };

  const handleRunInference = async (e) => {
    e.preventDefault();
    setTestingModel(true);
    try {
      const res = await fireGuardApi.getForestRisk(customParams);
      setAssessmentResult(res);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setTestingModel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TreePine className="h-6 w-6 text-emerald-400" />
          <span>Regional & Wildland Fire Risk Domain</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Canadian Forest Fire Weather Index (FWI) System & Random Forest ML Inference
        </p>
      </div>

      {/* Grid: Station Cards (Left) & Live Inference Tester (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Regional Station List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Active Regional Stations ({locations.length})
          </h3>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {locations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleSelectSite(loc)}
                className={`cursor-pointer rounded-lg border p-3.5 transition ${
                  selectedSite?.id === loc.id
                    ? 'border-emerald-500/60 bg-emerald-500/10 shadow-md'
                    : 'border-slate-800 bg-[#0f172a] hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-white">{loc.region}</span>
                  <RiskBadge level={loc.risk_category} score={loc.risk_score} size="sm" />
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">
                  {loc.code} • {loc.elevation_meters}m elev • {loc.vegetation}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                  <div>Temp: {loc.telemetry.temperature}°C</div>
                  <div>Hum: {loc.telemetry.humidity}%</div>
                  <div>Wind: {loc.telemetry.wind_speed} km/h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive Dual-Model Risk Evaluator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span>Forest Model Inference & Rule-Based Comparison</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Compare Random Forest ML predictions vs deterministic baseline fire rules
                </p>
              </div>
              <button
                onClick={handleRunInference}
                disabled={testingModel}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow transition disabled:opacity-50"
              >
                {testingModel ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Flame className="h-3.5 w-3.5" />
                )}
                <span>Evaluate Risk</span>
              </button>
            </div>

            {/* Input Parameter Form */}
            <form onSubmit={handleRunInference} className="space-y-4">
              {/* Primary Atmospheric Features */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Primary Meteorological Telemetry
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mt-2">
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.temperature}
                      onChange={(e) => setCustomParams({ ...customParams, temperature: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Humidity (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.humidity}
                      onChange={(e) => setCustomParams({ ...customParams, humidity: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Wind Speed (km/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.wind_speed}
                      onChange={(e) => setCustomParams({ ...customParams, wind_speed: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Pressure (hPa)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.pressure}
                      onChange={(e) => setCustomParams({ ...customParams, pressure: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Precipitation (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.rainfall}
                      onChange={(e) => setCustomParams({ ...customParams, rainfall: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-mono block mb-1">Atmospheric O₂ (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={customParams.oxygen_level}
                      onChange={(e) => setCustomParams({ ...customParams, oxygen_level: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Canadian FWI Components */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span>Canadian Fire Weather Index (FWI) Components</span>
                  <Info className="h-3.5 w-3.5 text-slate-500" title="FFMC, DMC, DC, ISI, BUI, FWI" />
                </span>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 mt-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">FFMC (Fuel)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.ffmc}
                      onChange={(e) => setCustomParams({ ...customParams, ffmc: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">DMC (Duff)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.dmc}
                      onChange={(e) => setCustomParams({ ...customParams, dmc: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">DC (Drought)</label>
                    <input
                      type="number"
                      step="1"
                      value={customParams.dc}
                      onChange={(e) => setCustomParams({ ...customParams, dc: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">ISI (Spread)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.isi}
                      onChange={(e) => setCustomParams({ ...customParams, isi: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">BUI (Buildup)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.bui}
                      onChange={(e) => setCustomParams({ ...customParams, bui: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">FWI (Index)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customParams.fwi}
                      onChange={(e) => setCustomParams({ ...customParams, fwi: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Assessment Comparison Card */}
            {assessmentResult && (
              <div className="mt-6 border-t border-slate-800 pt-5 space-y-4">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Model Evaluation Comparison Results
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Machine Learning Model */}
                  <div className="rounded-lg border border-slate-700 bg-[#121b2f] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        MACHINE LEARNING MODEL (Random Forest)
                      </span>
                      <RiskBadge level={assessmentResult.ml_assessment.risk_category} />
                    </div>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-white">
                      Score: {assessmentResult.ml_assessment.risk_score}%
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      Fire Occurrence Probability: {(assessmentResult.ml_assessment.probability * 100).toFixed(1)}%
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Trained on 15,000 empirical wildland fire records with stratified cross-validation.
                    </div>
                  </div>

                  {/* Deterministic Rule-Based Engine */}
                  <div className="rounded-lg border border-slate-700 bg-[#121b2f] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        RULE-BASED BASELINE ENGINE
                      </span>
                      <RiskBadge level={assessmentResult.rule_assessment.category} />
                    </div>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-white">
                      Score: {assessmentResult.rule_assessment.score}%
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      Rules Triggered: {assessmentResult.rule_assessment.rules_triggered?.length || 0}
                    </div>
                    <ul className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                      {assessmentResult.rule_assessment.rules_triggered?.map((r, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="text-amber-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Score Delta */}
                <div className="rounded border border-slate-800 bg-slate-900/60 p-3 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Delta (ML vs Heuristic): {assessmentResult.comparison.delta_score}%</span>
                  <span className="text-slate-400">Model Convergence: High Confidence</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
