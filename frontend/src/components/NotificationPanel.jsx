import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../api/client";
import { formatDate } from "../utils/format";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    api.get("/notifications").then((res) => {
      setItems(res.data);
      setUnread(res.meta?.unread || 0);
    }).catch(() => {});
  };

  useEffect(load, []);

  const markAll = async () => {
    await api.put("/notifications/read-all");
    load();
  };

  return (
    <div className="relative">
      <button className="relative rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <button className="text-xs text-brand-600" onClick={markAll}>Mark all read</button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No notifications yet.</p> : items.map((item) => (
              <div key={item._id} className={`rounded-md border p-3 text-sm ${item.read ? "border-slate-100 dark:border-slate-800" : "border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-700/10"}`}>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
