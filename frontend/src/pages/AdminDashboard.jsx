import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import api from "../api/client";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/tasks/stats/dashboard").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  const chartData = {
    labels: ["Interns", "Projects", "Tasks", "Pending", "Completed", "Overdue"],
    datasets: [{ label: "Overview", backgroundColor: "#2374e1", data: [stats.totalInterns, stats.totalProjects, stats.totalTasks, stats.pendingTasks, stats.completedTasks, stats.overdueTasks] }]
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total interns" value={stats.totalInterns} />
        <StatCard title="Total projects" value={stats.totalProjects} tone="green" />
        <StatCard title="Total tasks" value={stats.totalTasks} />
        <StatCard title="Pending tasks" value={stats.pendingTasks} tone="amber" />
        <StatCard title="Completed tasks" value={stats.completedTasks} tone="slate" />
        <StatCard title="In progress" value={stats.inProgressTasks} />
        <StatCard title="Overdue tasks" value={stats.overdueTasks} tone="amber" />
        <StatCard title="Due this week" value={stats.tasksDueThisWeek} tone="green" />
      </div>
      <section className="card">
        <div className="flex items-center justify-between text-sm"><span>Task completion rate</span><b>{stats.taskCompletionRate}%</b></div>
        <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-3 rounded-full bg-brand-600" style={{ width: `${stats.taskCompletionRate}%` }} /></div>
      </section>
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Dashboard chart</h2>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </section>
    </div>
  );
}
