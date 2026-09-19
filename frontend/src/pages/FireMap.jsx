import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map as MapIcon,
  TreePine,
  Thermometer,
  Wind,
  Droplets,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Compass
} from 'lucide-react';
import { fireGuardApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function FireMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await fireGuardApi.getGeospatialRisk();
        setLocations(data || []);
        if (data?.length > 0) {
          setSelectedLocation(data[0]);
        }
      } catch (err) {
        console.error('Failed to load geospatial risk locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || locations.length === 0) return;

    // Centered on Pacific/California Wildland Basin
    const map = L.map(mapContainerRef.current, {
      center: [38.5, -120.5],
      zoom: 6,
      zoomControl: true,
    });

    // Sleek Dark Tile Layer from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locations]);

  // Update map markers whenever locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || locations.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const color =
        loc.risk_category === 'CRITICAL'
          ? '#ef4444'
          : loc.risk_category === 'HIGH'
          ? '#f97316'
          : loc.risk_category === 'MEDIUM'
          ? '#f59e0b'
          : '#10b981';

      // Outer pulsing hazard intensity radius
      const circle = L.circle([loc.latitude, loc.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.25,
        radius: Math.max(15000, loc.risk_score * 800),
        weight: 1.5,
      }).addTo(map);

      // Center pin
      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 7,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; min-width: 170px;">
          <strong style="color: #ffffff; font-size: 13px;">${loc.region}</strong><br/>
          <span style="color: ${color}; font-weight: bold;">[${loc.risk_category}] Risk: ${loc.risk_score}%</span><br/>
          <span>Fire Prob: ${(loc.fire_probability * 100).toFixed(1)}%</span><br/>
          <span>Temp: ${loc.telemetry.temperature}°C | Wind: ${loc.telemetry.wind_speed} km/h</span>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      markersRef.current.push(circle, marker);
    });
  }, [locations]);

  const handleSelectSite = (loc) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 8, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MapIcon className="h-6 w-6 text-emerald-400" />
            <span>Geospatial Wildfire Hazard Map</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Open-Source Leaflet GIS Integration • Real-Time Wildland Risk Propagation Corridors
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Critical
          </span>
        </div>
      </div>

      {/* Map & Inspector Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leaflet Map Canvas (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0c1220] p-3 shadow-lg flex flex-col">
          <div
            ref={mapContainerRef}
            className="w-full h-[540px] rounded-lg overflow-hidden border border-slate-800/80 z-10"
          />
          <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
            <span>Tile Source: CartoDB Dark Matter (OpenStreetMap) • No Google Maps API required</span>
            <span>Spatial Coverage: Western Fire Basins</span>
          </div>
        </div>

        {/* Selected Location Details Panel (1 col) */}
        <div className="space-y-4">
          {selectedLocation ? (
            <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedLocation.region}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedLocation.code} • {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°W
                  </p>
                </div>
                <RiskBadge level={selectedLocation.risk_category} score={selectedLocation.risk_score} />
              </div>

              {/* Fire Probability Metric */}
              <div className="rounded-lg border border-slate-800 bg-[#12192c] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono block">
                    Fire Ignition Probability
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {(selectedLocation.fire_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <Flame className="h-8 w-8 text-orange-500 opacity-80" />
              </div>

              {/* Weather Telemetry Matrix */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Atmospheric & Fuel Status
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">TEMPERATURE</span>
                    <span className="text-white font-bold">{selectedLocation.telemetry.temperature}°C</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">HUMIDITY</span>
                    <span className="text-white font-bold">{selectedLocation.telemetry.humidity}%</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">WIND SPEED</span>
                    <span className="text-white font-bold">{selectedLocation.telemetry.wind_speed} km/h</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">PRESSURE</span>
                    <span className="text-white font-bold">{selectedLocation.telemetry.pressure} hPa</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">PRECIPITATION</span>
                    <span className="text-white font-bold">{selectedLocation.telemetry.rainfall} mm</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-900/80 p-2">
                    <span className="text-slate-400 block text-[10px]">FIRE WEATHER (FWI)</span>
                    <span className="text-orange-400 font-bold">{selectedLocation.telemetry.fwi || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Forward Forecast Risk */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Location Forward Trend
                </span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center font-mono text-xs">
                  <div className="rounded border border-slate-800 bg-[#12192c] p-2">
                    <span className="text-slate-400 block text-[10px]">+2 Hours</span>
                    <span className="text-white font-bold">{selectedLocation.forecast_risk?.plus_2h}%</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-[#12192c] p-2">
                    <span className="text-slate-400 block text-[10px]">+4 Hours</span>
                    <span className="text-white font-bold">{selectedLocation.forecast_risk?.plus_4h}%</span>
                  </div>
                  <div className="rounded border border-slate-800 bg-[#12192c] p-2">
                    <span className="text-slate-400 block text-[10px]">+6 Hours</span>
                    <span className="text-white font-bold">{selectedLocation.forecast_risk?.plus_6h}%</span>
                  </div>
                </div>
              </div>

              {/* Switch Location Quick List */}
              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-2">
                  Jump to Region:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectSite(loc)}
                      className={`rounded px-2 py-1 text-[11px] font-mono transition ${
                        selectedLocation.id === loc.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {loc.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-8 text-center text-slate-500 text-xs">
              Click a location marker on the map to inspect live fire risk telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
