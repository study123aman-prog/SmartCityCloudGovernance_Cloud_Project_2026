import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

export default function Register() {
  const { user, register } = useAuth(); const navigate = useNavigate(); const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(event) { event.preventDefault(); setLoading(true); setError(""); try { await register(form); navigate("/dashboard"); } catch (requestError) { setError(getApiError(requestError, "Unable to create account")); } finally { setLoading(false); } }
  return <AuthPage title="Make a workspace" subtitle="Save predictions and spot patterns over time."><form onSubmit={submit} className="space-y-5"><Field label="Name" type="text" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} minLength={8} />{error && <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-ink px-5 py-3 font-bold text-white hover:bg-moss disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button></form><p className="mt-6 text-center text-sm text-ink/60">Already registered? <Link className="font-bold text-ember" to="/login">Sign in</Link></p></AuthPage>;
}

function Field({ label, type, value, onChange, minLength }) { return <label className="block text-sm font-bold text-ink/75">{label}<input required minLength={minLength} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:ring-4 focus:ring-ember/20" /></label>; }
function AuthPage({ title, subtitle, children }) { return <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-12"><div className="w-full max-w-md"><Link to="/" className="font-display text-2xl font-bold">Fire<span className="text-ember">Guard</span></Link><div className="mt-8 rounded-[1.5rem] bg-white p-7 shadow-xl shadow-ink/5 sm:p-9"><h1 className="font-display text-4xl font-bold">{title}</h1><p className="mt-2 text-ink/60">{subtitle}</p><div className="mt-8">{children}</div></div></div></div>; }
