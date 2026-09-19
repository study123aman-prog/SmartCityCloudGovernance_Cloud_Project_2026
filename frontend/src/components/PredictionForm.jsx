import { useState } from "react";

const fields = [
  ["temperature", "Temperature (°C)", 25, -10, 50],
  ["oxygenLevel", "Oxygen level (%)", 21, 10, 30],
  ["humidity", "Humidity (%)", 60, 0, 100],
  ["windSpeed", "Wind speed (km/h)", 10, 0, 50],
  ["pressure", "Pressure (hPa)", 1013, 900, 1050],
  ["rainfall", "Rainfall (mm)", 0, 0, 500],
];

export default function PredictionForm({ onSubmit, onSimulate, submitting }) {
  const [values, setValues] = useState(Object.fromEntries(fields.map(([name, , value]) => [name, value])));
  const [simulating, setSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  function update(event) { setValues({ ...values, [event.target.name]: Number(event.target.value) }); }
  async function simulate() { setSimulating(true); setSimulationError(""); try { setValues(await onSimulate()); } catch (error) { setSimulationError(error.message); } finally { setSimulating(false); } }
  function submit(event) { event.preventDefault(); onSubmit(values); }
  return <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist px-4 py-3"><span className="text-sm text-ink/60">No sensors connected. Generate a test scenario.</span><button type="button" onClick={simulate} disabled={simulating} className="rounded-lg border border-moss px-3 py-2 text-sm font-bold text-moss hover:bg-moss hover:text-white disabled:opacity-60">{simulating ? "Generating..." : "Fill simulated values"}</button></div>{fields.map(([name, label, , min, max]) => <label key={name} className="text-sm font-bold text-ink/75">{label}<input name={name} type="number" min={min} max={max} step="any" value={values[name]} onChange={update} required className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none ring-ember/30 focus:ring-4" /></label>)}{simulationError && <p className="sm:col-span-2 text-sm text-ember">{simulationError}</p>}<button disabled={submitting} className="sm:col-span-2 rounded-xl bg-ink px-5 py-3 font-bold text-white transition hover:bg-moss disabled:cursor-wait disabled:opacity-60">{submitting ? "Analysing..." : "Run prediction"}</button></form>;
}
