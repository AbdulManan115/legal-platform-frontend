"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
};

type NotificationsResponse = {
  success: boolean;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch<NotificationsResponse>("/notifications");
      setNotifications(result.notifications);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((items) =>
        items.map((item) =>
          item._id === id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark notification",
      );
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((items) =>
        items.map((item) => ({
          ...item,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark notifications",
      );
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <ProtectedRoute allowedRoles={["client"]}>
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <Bell size={22} className="text-slate-700" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notifications
                </h1>
                <p className="text-sm text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-6 text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="font-medium text-slate-700">
                No notifications yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New appointment and hearing updates will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-5 transition ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-blue-50/50"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-slate-200"
                          : "bg-blue-600"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {notification.title}
                        </h2>

                        <span className="text-xs text-slate-400">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleString()}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => {
                              if (!notification.isRead) {
                                void markRead(notification._id);
                              }
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            View
                          </Link>
                        )}

                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() => void markRead(notification._id)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}
