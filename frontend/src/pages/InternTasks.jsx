import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";

export default function InternTasks() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ status: "", remarks: "" });

  const load = () => {
    setLoading(true);
    api.get("/tasks", { params: { page } }).then((res) => {
      setTasks(res.data);
      setMeta(res.meta);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const openEdit = (task) => {
    setEditingId(task._id);
    setEditData({ status: task.status, remarks: task.remarks || "" });
  };

  const saveUpdate = async () => {
    try {
      await api.put(`/tasks/${editingId}`, editData);
      toast.success("Task updated");
      setEditingId(null);
      load();
    } catch (error) {
      toast.error(error.message || "Update failed");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ status: "", remarks: "" });
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-lg font-semibold">My Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">View and update the tasks assigned to you.</p>
      </section>

      <section className="card overflow-hidden">
        {loading ? <Spinner /> : tasks.length === 0 ? <EmptyState title="No tasks assigned" message="You don't have any tasks yet. Check back later!" /> : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <span className="text-slate-500">Priority: <b>{task.priority}</b></span>
                      <span className="text-slate-500">Due: <b>{formatDate(task.dueDate)}</b></span>
                    </div>
                  </div>
                  <StatusBadge value={task.status} />
                </div>

                {editingId === task._id ? (
                  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                      <select className="input mt-1" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Remarks / Comments</label>
                      <textarea className="input mt-1" placeholder="Add any remarks or comments..." value={editData.remarks} onChange={(e) => setEditData({ ...editData, remarks: e.target.value })} rows={2} />
                    </div>
                    {task.remarks && (
                      <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Previous remarks:</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{task.remarks}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="btn-primary flex-1" onClick={saveUpdate}>Save changes</button>
                      <button className="btn-secondary flex-1" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {task.remarks && (
                      <div className="mt-3 rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Your remarks:</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{task.remarks}</p>
                      </div>
                    )}
                    <button className="mt-3 btn-secondary w-full" onClick={() => openEdit(task)}>Update task</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination meta={meta} onPage={setPage} />
      </section>
    </div>
  );
}
