"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BriefingRecord } from "@/types/briefing";
import {
    ArrowLeft,
    FileText,
    Loader2,
    Save,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
    nuevo: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    revisado: { label: "Revisado", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    en_progreso: { label: "En Progreso", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    completado: { label: "Completado", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

const typeLabels: Record<string, string> = {
    LANDING: "Landing Page",
    WEB_CORPORATIVA: "Web Corporativa",
    ECOMMERCE: "E-commerce",
};

const fieldLabels: Record<string, string> = {
    clientName: "Nombre del cliente",
    businessName: "Nombre del negocio",
    industry: "Rubro",
    email: "Email",
    phone: "Teléfono",
    mainGoal: "Objetivo principal",
    targetAudience: "Público objetivo",
    mainCTA: "Acción principal (CTA)",
    uniqueValue: "Valor diferencial",
    sections: "Secciones",
    sectionNotes: "Notas de secciones",
    designStyle: "Estilo visual",
    primaryColor: "Color principal",
    secondaryColor: "Color secundario",
    referenceUrls: "URLs de referencia",
    hasLogo: "Tiene logo",
    hasPhotos: "Tiene fotos",
    hasTexts: "Tiene textos",
    additionalContent: "Contenido adicional",
    features: "Funcionalidades",
    hasDomain: "Tiene dominio",
    domainName: "Nombre de dominio",
    socialMedia: "Redes sociales",
    deadline: "Plazo",
    budget: "Presupuesto",
    additionalNotes: "Notas adicionales",
    // ── ECOMMERCE fields ──
    instagramUrl: "Instagram",
    facebookUrl: "Facebook",
    websiteUrl: "Sitio web actual",
    storeObjective: "Objetivo de la tienda",
    competitorUrls: "URLs de competencia",
    expectedRevenue: "Facturación mensual esperada",
    productCount: "Cantidad de productos",
    productType: "Tipo de productos",
    hasVariants: "¿Tiene variantes?",
    categoryCount: "Cantidad de categorías",
    productDescription: "Descripción de productos",
    hasBulkImport: "¿Importación masiva?",
    pages: "Páginas del sitio",
    pagesDescription: "Descripción de páginas",
    paymentMethods: "Métodos de pago",
    paymentAccountStatus: "Estado de cuentas de pago",
    needsInvoicing: "¿Necesita facturación?",
    currencies: "Monedas aceptadas",
    paymentNotes: "Notas de pago",
    shippingModel: "Modelo de envío",
    shippingZones: "Zonas de envío",
    freeShippingThreshold: "Umbral envío gratis",
    handlesOwnShipping: "¿Gestiona su propio envío?",
    shippingNotes: "Notas de envío",
    accountSystem: "Sistema de cuentas",
    guestTrackingMethod: "Seguimiento invitados",
    customerFeatures: "Funciones de cliente",
    inventoryLevel: "Nivel de inventario",
    customerNotes: "Notas de clientes",
    accentColor: "Color de acento",
    hasProductPhotos: "¿Tiene fotos de productos?",
    productDescriptionStyle: "Estilo de descripciones",
    marketingFeatures: "Funciones de marketing",
    socialPlatforms: "Plataformas sociales",
    seoLevel: "Nivel de SEO",
    marketingNotes: "Notas de marketing",
    ecommerceFeatures: "Funcionalidades e-commerce",
};

export default function BriefingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [briefing, setBriefing] = useState<BriefingRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
            return;
        }

        fetch(`/api/briefings/${params.id}`, {
            headers: { "x-admin-token": token },
        })
            .then((res) => {
                if (res.status === 401) {
                    router.push("/admin");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setBriefing(data);
                    setSummary(data.summary || "");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id, router]);

    const handleSaveSummary = async () => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;

        setSaving(true);
        try {
            await fetch(`/api/briefings/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": token,
                },
                body: JSON.stringify({ summary }),
            });
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;

        try {
            const res = await fetch(`/api/briefings/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": token,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            setBriefing(data);
        } catch (err) {
            console.error("Status change error:", err);
        }
    };

    const handleExportDocx = async () => {
        const token = sessionStorage.getItem("admin_token");
        if (!token || !briefing) return;

        const res = await fetch(`/api/briefings/export/docx?id=${briefing.id}`, {
            headers: { "x-admin-token": token },
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `briefing_${briefing.clientName.replace(/\s+/g, "_")}.docx`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 size={32} className="text-indigo-500 animate-spin" />
            </main>
        );
    }

    if (!briefing) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-white mb-4">Briefing no encontrado</h1>
                    <Link href="/admin/dashboard" className="text-indigo-400">
                        Volver al dashboard
                    </Link>
                </div>
            </main>
        );
    }

    const sc = statusConfig[briefing.status] || statusConfig.nuevo;

    const renderDataSection = (title: string, data: Record<string, unknown>) => {
        const entries = Object.entries(data).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
        );
        if (entries.length === 0) return null;

        return (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                <h3 className="text-base font-semibold text-indigo-400 mb-4">{title}</h3>
                <div className="space-y-3">
                    {entries.map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                            <span className="text-xs text-white/40 sm:w-40 flex-shrink-0 font-medium">
                                {fieldLabels[key] || key}
                            </span>
                            <span className="text-sm text-white/80">
                                {Array.isArray(value)
                                    ? value.join(", ")
                                    : key.includes("Color") && typeof value === "string" && value.startsWith("#")
                                        ? (
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="w-4 h-4 rounded-full border border-white/20 inline-block"
                                                    style={{ backgroundColor: value }}
                                                />
                                                {value}
                                            </span>
                                        )
                                        : String(value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <select
                            value={briefing.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 focus:outline-none cursor-pointer"
                        >
                            <option value="nuevo" className="bg-slate-900">Nuevo</option>
                            <option value="revisado" className="bg-slate-900">Revisado</option>
                            <option value="en_progreso" className="bg-slate-900">En Progreso</option>
                            <option value="completado" className="bg-slate-900">Completado</option>
                        </select>
                        <button
                            onClick={handleExportDocx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/20 transition-all"
                        >
                            <FileText size={12} />
                            <span>Exportar DOCX</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Title Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{briefing.clientName}</h1>
                            <p className="text-sm text-white/40">{briefing.clientEmail || "Sin email"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${sc.color}`}>
                                {sc.label}
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs border border-indigo-500/20">
                                {typeLabels[briefing.type] || briefing.type}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-white/30">
                        Creado: {new Date(briefing.createdAt).toLocaleString("es-CL")}
                    </div>
                </div>

                {/* Data Sections */}
                {renderDataSection("📋 Datos de Contacto", briefing.contactData)}
                {renderDataSection("🎯 Contenido y Objetivos", briefing.contentData)}
                {renderDataSection("🎨 Diseño", briefing.designData)}
                {renderDataSection("⚙️ Extras y Entrega", briefing.extraData)}

                {/* Summary / Notes */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-indigo-400 mb-4">📝 Resumen / Notas</h3>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                        placeholder="Agrega notas o un resumen del briefing..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSaveSummary}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            <span>{saving ? "Guardando..." : "Guardar notas"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
