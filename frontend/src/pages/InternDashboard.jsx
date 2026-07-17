import React, { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { moneylessPercent } from "../utils/format";

export default function InternDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/tasks/stats/dashboard").then((res) => setStats(res.data));
  }, []);
  if (!stats) return <Spinner />;
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
        <p className="mt-1 text-sm text-slate-500">Track your onboarding tasks and download documents from one workspace.</p>
        <div className="mt-5 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-3 rounded-full bg-brand-600" style={{ width: moneylessPercent(stats.progress) }} />
        </div>
        <p className="mt-2 text-sm font-medium">{stats.progress}% progress</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Assigned tasks" value={stats.assignedTasks} />
        <StatCard title="Pending tasks" value={stats.pendingTasks} tone="amber" />
        <StatCard title="Completed tasks" value={stats.completedTasks} tone="green" />
      </div>
    </div>
  );
}
