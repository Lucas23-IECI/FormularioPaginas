"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FileDown,
    FileText,
    Filter,
    Loader2,
    LogOut,
    Eye,
    Clock,
    CheckCircle2,
    Inbox,
    RefreshCw,
} from "lucide-react";
import { BriefingRecord } from "@/types/briefing";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    nuevo: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Inbox size={12} /> },
    revisado: { label: "Revisado", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Eye size={12} /> },
    en_progreso: { label: "En Progreso", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <Clock size={12} /> },
    completado: { label: "Completado", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 size={12} /> },
};

const typeLabels: Record<string, string> = {
    LANDING: "Landing Page",
    WEB_COMERCIAL: "Web Comercial",
    ECOMMERCE: "E-commerce",
};

export default function AdminDashboard() {
    const router = useRouter();
    const [briefings, setBriefings] = useState<BriefingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [token, setToken] = useState("");

    const fetchBriefings = useCallback(async (adminToken: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set("type", filterType);
            if (filterStatus) params.set("status", filterStatus);

            const res = await fetch(`/api/briefings?${params.toString()}`, {
                headers: { "x-admin-token": adminToken },
            });

            if (res.status === 401) {
                sessionStorage.removeItem("admin_token");
                router.push("/admin");
                return;
            }

            const data = await res.json();
            setBriefings(data.data || []);
        } catch (err) {
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [filterType, filterStatus, router]);

    useEffect(() => {
        const storedToken = sessionStorage.getItem("admin_token");
        if (!storedToken) {
            router.push("/admin");
            return;
        }
        setToken(storedToken);
        fetchBriefings(storedToken);
    }, [fetchBriefings, router]);

    const handleExportCSV = async () => {
        const params = new URLSearchParams();
        if (filterType) params.set("type", filterType);

        const res = await fetch(`/api/briefings/export/csv?${params.toString()}`, {
            headers: { "x-admin-token": token },
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `briefings_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await fetch(`/api/briefings/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": token,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchBriefings(token);
        } catch (err) {
            console.error("Status update error:", err);
        }
    };


    return (
        <main className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Briefings</h1>
                        <p className="text-xs text-white/40 mt-1">{briefings.length} briefings encontrados</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchBriefings(token)}
                            className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            title="Refrescar"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/20 transition-all"
                        >
                            <FileDown size={14} />
                            <span>Exportar CSV</span>
                        </button>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("admin_token");
                                router.push("/admin");
                            }}
                            className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <Filter size={14} />
                        <span>Filtros:</span>
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="" className="bg-slate-900">Todos los tipos</option>
                        <option value="LANDING" className="bg-slate-900">Landing Page</option>
                        <option value="WEB_COMERCIAL" className="bg-slate-900">Web Comercial</option>
                        <option value="ECOMMERCE" className="bg-slate-900">E-commerce</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="" className="bg-slate-900">Todos los estados</option>
                        <option value="nuevo" className="bg-slate-900">Nuevo</option>
                        <option value="revisado" className="bg-slate-900">Revisado</option>
                        <option value="en_progreso" className="bg-slate-900">En Progreso</option>
                        <option value="completado" className="bg-slate-900">Completado</option>
                    </select>
                </div>

                {/* Table/Cards */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    </div>
                ) : briefings.length === 0 ? (
                    <div className="text-center py-20">
                        <Inbox size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-lg">No hay briefings todavía</p>
                        <p className="text-white/20 text-sm mt-2">Los briefings aparecerán aquí cuando tus clientes los envíen</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {briefings.map((b) => {
                            const sc = statusConfig[b.status] || statusConfig.nuevo;
                            return (
                                <div
                                    key={b.id}
                                    className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-base font-semibold text-white truncate">{b.clientName}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sc.color}`}>
                                                    {sc.icon}
                                                    {sc.label}
                                                </span>
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs border border-indigo-500/20">
                                                    {typeLabels[b.type] || b.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-white/30">
                                                <span>{b.clientEmail || "Sin email"}</span>
                                                <span>{new Date(b.createdAt).toLocaleDateString("es-CL")}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Status dropdown */}
                                            <select
                                                value={b.status}
                                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                                className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 focus:outline-none cursor-pointer"
                                            >
                                                <option value="nuevo" className="bg-slate-900">Nuevo</option>
                                                <option value="revisado" className="bg-slate-900">Revisado</option>
                                                <option value="en_progreso" className="bg-slate-900">En Progreso</option>
                                                <option value="completado" className="bg-slate-900">Completado</option>
                                            </select>

                                            <Link
                                                href={`/admin/dashboard/${b.id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/20 transition-all"
                                            >
                                                <Eye size={12} />
                                                <span>Ver</span>
                                            </Link>

                                            <button
                                                onClick={async () => {
                                                    const res = await fetch(`/api/briefings/export/docx?id=${b.id}`, {
                                                        headers: { "x-admin-token": token },
                                                    });
                                                    if (res.ok) {
                                                        const blob = await res.blob();
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = `briefing_${b.clientName.replace(/\s+/g, "_")}.docx`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 rounded-lg text-xs hover:bg-white/10 hover:text-white/70 transition-all"
                                            >
                                                <FileText size={12} />
                                                <span>DOCX</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
