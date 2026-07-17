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
    labels: ["Interns", "Active", "Pending", "Completed"],
    datasets: [{ label: "Overview", backgroundColor: "#2374e1", data: [stats.totalInterns, stats.activeInterns, stats.pendingTasks, stats.completedTasks] }]
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total interns" value={stats.totalInterns} />
        <StatCard title="Active interns" value={stats.activeInterns} tone="green" />
        <StatCard title="Pending tasks" value={stats.pendingTasks} tone="amber" />
        <StatCard title="Completed tasks" value={stats.completedTasks} tone="slate" />
      </div>
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Dashboard chart</h2>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </section>
    </div>
  );
}
