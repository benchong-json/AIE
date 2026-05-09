import { StatusPill } from "@/components/status-pill";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <StatusPill>Sprint 0</StatusPill>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Provider keys and integration status will live here once agent and
          research workflows are enabled.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Database", "OpenAI", "Exa"].map((provider) => (
          <div
            key={provider}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-950">{provider}</p>
            <p className="mt-2 text-sm text-slate-500">Configuration pending</p>
          </div>
        ))}
      </div>
    </div>
  );
}
