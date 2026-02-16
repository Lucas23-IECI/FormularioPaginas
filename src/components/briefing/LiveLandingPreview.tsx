"use client";

import React from "react";
import { useBriefingForm } from "@/modules/briefingEngine/context";
import {
    Globe,
    Mail,
    Phone,
    ArrowRight,
    Star,
    MapPin,
    MessageCircle,
    Users,
    HelpCircle,
    BarChart3,
    Building2,
    RefreshCw,
    DollarSign,
    FileText,
    Image as ImageIcon,
    Briefcase,
} from "lucide-react";

// Placeholder images per section generated via picsum with stable seeds
const sectionImages: Record<string, string[]> = {
    hero: [
        "https://picsum.photos/seed/hero1/600/250",
    ],
    servicios: [
        "https://picsum.photos/seed/svc1/120/80",
        "https://picsum.photos/seed/svc2/120/80",
        "https://picsum.photos/seed/svc3/120/80",
    ],
    sobre_mi: [
        "https://picsum.photos/seed/about1/100/100",
    ],
    portafolio: [
        "https://picsum.photos/seed/port1/100/80",
        "https://picsum.photos/seed/port2/100/80",
        "https://picsum.photos/seed/port3/100/80",
        "https://picsum.photos/seed/port4/100/80",
    ],
    equipo: [
        "https://picsum.photos/seed/team1/60/60",
        "https://picsum.photos/seed/team2/60/60",
        "https://picsum.photos/seed/team3/60/60",
    ],
    clientes: [
        "https://picsum.photos/seed/cl1/60/30",
        "https://picsum.photos/seed/cl2/60/30",
        "https://picsum.photos/seed/cl3/60/30",
        "https://picsum.photos/seed/cl4/60/30",
    ],
    blog: [
        "https://picsum.photos/seed/blog1/100/60",
        "https://picsum.photos/seed/blog2/100/60",
    ],
};

// ── Design style presets ──────────────────────────────────
interface StylePreset {
    isDark: boolean;
    bg: string;
    text: string;
    subtext: string;
    card: string;
    divider: string;
    heroOverlay: string;
    fontClass: string;
    borderRadius: string;
}

function getStylePreset(designStyle: string, primaryColor: string): StylePreset {
    switch (designStyle) {
        case "oscuro":
            return {
                isDark: true,
                bg: "bg-gray-950",
                text: "text-white",
                subtext: "text-gray-400",
                card: "bg-white/5",
                divider: "border-white/5",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                fontClass: "",
                borderRadius: "rounded-lg",
            };
        case "elegante":
            return {
                isDark: false,
                bg: "bg-stone-50",
                text: "text-stone-900",
                subtext: "text-stone-500",
                card: "bg-white",
                divider: "border-stone-200",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
                fontClass: "font-serif",
                borderRadius: "rounded-none",
            };
        case "minimalista":
            return {
                isDark: false,
                bg: "bg-white",
                text: "text-gray-800",
                subtext: "text-gray-400",
                card: "bg-gray-50/50",
                divider: "border-gray-50",
                heroOverlay: `linear-gradient(180deg, ${primaryColor}08, transparent)`,
                fontClass: "",
                borderRadius: "rounded-xl",
            };
        case "corporativo":
            return {
                isDark: false,
                bg: "bg-slate-50",
                text: "text-slate-900",
                subtext: "text-slate-500",
                card: "bg-white",
                divider: "border-slate-200",
                heroOverlay: `linear-gradient(135deg, #1e293b, #334155)`,
                fontClass: "",
                borderRadius: "rounded-md",
            };
        case "creativo":
            return {
                isDark: false,
                bg: "bg-white",
                text: "text-gray-900",
                subtext: "text-gray-600",
                card: "bg-gradient-to-br from-gray-50 to-white",
                divider: "border-purple-100",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}30, #a855f740)`,
                fontClass: "",
                borderRadius: "rounded-2xl",
            };
        case "calido":
            return {
                isDark: false,
                bg: "bg-amber-50/30",
                text: "text-amber-950",
                subtext: "text-amber-700/60",
                card: "bg-white",
                divider: "border-amber-100",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}20, #f59e0b15)`,
                fontClass: "",
                borderRadius: "rounded-xl",
            };
        case "moderno":
        default:
            return {
                isDark: false,
                bg: "bg-white",
                text: "text-gray-900",
                subtext: "text-gray-600",
                card: "bg-gray-50",
                divider: "border-gray-100",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}08)`,
                fontClass: "",
                borderRadius: "rounded-lg",
            };
    }
}

// Canonical section order for landing page preview
const SECTION_ORDER = [
    "hero", "servicios", "proceso", "sobre_mi", "portafolio",
    "testimonios", "equipo", "precios", "faq", "blog",
    "estadisticas", "clientes", "contacto", "ubicacion",
];

export function LiveLandingPreview() {
    // ── Read directly from context — single source of truth ──
    const { formData } = useBriefingForm();

    const primaryColor = (formData.primaryColor as string) || "#6366f1";
    const secondaryColor = (formData.secondaryColor as string) || "";
    const accentColor = secondaryColor || primaryColor;
    const businessName = (formData.businessName as string) || "Tu Negocio";
    const industry = (formData.industry as string) || "";
    const designStyle = (formData.designStyle as string) || "moderno";
    const sections = (formData.sections as string[]) || [];
    const mainCTA = (formData.mainCTA as string) || "whatsapp";
    const features = (formData.features as string[]) || [];

    const ctaLabels: Record<string, string> = {
        whatsapp: "Contáctanos por WhatsApp",
        formulario: "Enviar consulta",
        llamar: "Llámanos ahora",
        agendar: "Agendar cita",
        comprar: "Comprar ahora",
        descargar: "Descargar gratis",
    };

    const style = getStylePreset(designStyle, primaryColor);
    const { isDark, fontClass } = style;
    const bgClass = style.bg;
    const textClass = style.text;
    const subtextClass = style.subtext;
    const cardBg = style.card;
    const dividerColor = style.divider;

    const activeSections = SECTION_ORDER.filter((s) => sections.includes(s));

    return (
        <div className={`w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 transition-all duration-300 relative ${fontClass}`}>
            {/* Browser Chrome */}
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1 flex items-center gap-2 text-xs text-white/50">
                        <Globe size={10} />
                        <span>www.{businessName.toLowerCase().replace(/\s+/g, "")}.cl</span>
                    </div>
                </div>
            </div>

            {/* Page Preview — scrollable */}
            <div className={`${bgClass} overflow-y-auto transition-colors duration-300`} style={{ maxHeight: "500px" }}>

                {/* Hero Section — always present or if selected */}
                {(activeSections.includes("hero") || activeSections.length === 0) && (
                    <div
                        className="relative overflow-hidden transition-all duration-300"
                        style={{ background: style.heroOverlay }}
                    >
                        <div className="relative">
                            <img
                                src={sectionImages.hero[0]}
                                alt="Hero"
                                className="w-full h-28 object-cover opacity-30"
                                style={{ filter: `sepia(0.3) hue-rotate(${parseInt(primaryColor.slice(1), 16) % 360}deg)` }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                <h3 className={`text-lg font-bold ${style.isDark || designStyle === "corporativo" ? "text-white" : textClass} mb-1 drop-shadow-lg`}>{businessName}</h3>
                                {industry && (
                                    <p className={`text-[10px] ${style.isDark || designStyle === "corporativo" ? "text-white/70" : subtextClass} mb-3 capitalize`}>{industry.replace(/_/g, " ")}</p>
                                )}
                                <button
                                    className={`px-4 py-1.5 ${style.borderRadius} text-white text-[10px] font-medium shadow-lg transition-transform hover:scale-105`}
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <span className="flex items-center gap-1">
                                        {ctaLabels[mainCTA] || "Contáctanos"} <ArrowRight size={10} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic Sections */}
                <div className="space-y-0">
                    {activeSections.filter(s => s !== "hero").map((section) => (
                        <div
                            key={section}
                            className={`px-5 py-4 border-b ${dividerColor} transition-all duration-300 animate-fadeIn`}
                        >
                            {/* ─── Servicios ─── */}
                            {section === "servicios" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Briefcase size={10} />} title="Nuestros Servicios" color={accentColor} textClass={textClass} />
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {sectionImages.servicios.map((src, i) => (
                                            <div key={i} className={`${cardBg} rounded-lg overflow-hidden transition-colors`}>
                                                <img src={src} alt={`Servicio ${i + 1}`} className="w-full h-12 object-cover" />
                                                <div className="p-1.5">
                                                    <div className={`h-1.5 ${isDark ? "bg-white/20" : "bg-gray-200"} rounded w-3/4 mb-1`} />
                                                    <div className={`h-1 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-1/2`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Sobre mí ─── */}
                            {section === "sobre_mi" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Users size={10} />} title="Sobre Nosotros" color={accentColor} textClass={textClass} />
                                    <div className="flex gap-3 items-center">
                                        <img
                                            src={sectionImages.sobre_mi[0]}
                                            alt="About"
                                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className={`h-1.5 ${isDark ? "bg-white/15" : "bg-gray-200"} rounded w-full`} />
                                            <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-5/6`} />
                                            <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-2/3`} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Portafolio ─── */}
                            {section === "portafolio" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<ImageIcon size={10} />} title="Nuestro Portafolio" color={accentColor} textClass={textClass} />
                                    <div className="grid grid-cols-4 gap-1">
                                        {sectionImages.portafolio.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                alt={`Portfolio ${i + 1}`}
                                                className="w-full h-12 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Testimonios ─── */}
                            {section === "testimonios" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Star size={10} />} title="Testimonios" color={accentColor} textClass={textClass} />
                                    <div className={`${cardBg} rounded-lg p-3 transition-colors`}>
                                        <div className="flex gap-0.5 mb-1.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} size={9} fill={accentColor} color={accentColor} />
                                            ))}
                                        </div>
                                        <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-full mb-1`} />
                                        <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-2/3`} />
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`w-5 h-5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                                            <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-16`} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Precios ─── */}
                            {section === "precios" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<DollarSign size={10} />} title="Planes y Precios" color={accentColor} textClass={textClass} />
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {["Básico", "Pro", "Premium"].map((plan, i) => (
                                            <div
                                                key={plan}
                                                className={`${cardBg} rounded-lg p-2 text-center transition-colors`}
                                                style={i === 1 ? { boxShadow: `0 0 0 1px ${accentColor}` } : {}}
                                            >
                                                <div className={`text-[8px] font-medium ${subtextClass}`}>{plan}</div>
                                                <div className={`text-xs font-bold ${textClass} my-1`}>${"$".repeat(i + 1)}</div>
                                                <div className={`h-1 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-4/5 mx-auto mb-0.5`} />
                                                <div className={`h-1 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-3/5 mx-auto`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Proceso ─── */}
                            {section === "proceso" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<RefreshCw size={10} />} title="Nuestro Proceso" color={accentColor} textClass={textClass} />
                                    <div className="flex items-center gap-1">
                                        {["1", "2", "3", "4"].map((step, i) => (
                                            <React.Fragment key={step}>
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    {step}
                                                </div>
                                                {i < 3 && <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Estadísticas ─── */}
                            {section === "estadisticas" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<BarChart3 size={10} />} title="Cifras y Resultados" color={accentColor} textClass={textClass} />
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {[{ n: "150+", l: "Proyectos" }, { n: "98%", l: "Satisfacción" }, { n: "5★", l: "Rating" }].map(({ n, l }) => (
                                            <div key={l}>
                                                <div className="text-sm font-bold" style={{ color: accentColor }}>{n}</div>
                                                <div className={`text-[8px] ${subtextClass}`}>{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Equipo ─── */}
                            {section === "equipo" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Users size={10} />} title="Nuestro Equipo" color={accentColor} textClass={textClass} />
                                    <div className="flex justify-center gap-3">
                                        {sectionImages.equipo.map((src, i) => (
                                            <div key={i} className="text-center">
                                                <img src={src} alt={`Team ${i + 1}`} className="w-10 h-10 rounded-full object-cover mx-auto mb-1" />
                                                <div className={`h-1 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded w-10 mx-auto`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── FAQ ─── */}
                            {section === "faq" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<HelpCircle size={10} />} title="Preguntas Frecuentes" color={accentColor} textClass={textClass} />
                                    <div className="space-y-1">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`${cardBg} rounded p-2 flex items-center justify-between transition-colors`}>
                                                <div className={`h-1.5 ${isDark ? "bg-white/15" : "bg-gray-200"} rounded w-3/4`} />
                                                <span className={`text-[10px] ${subtextClass}`}>+</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Clientes ─── */}
                            {section === "clientes" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Building2 size={10} />} title="Confían en Nosotros" color={accentColor} textClass={textClass} />
                                    <div className="flex justify-center gap-3">
                                        {sectionImages.clientes.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                alt={`Client ${i + 1}`}
                                                className={`h-5 object-contain ${isDark ? "opacity-50 invert" : "opacity-40 grayscale"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Blog ─── */}
                            {section === "blog" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<FileText size={10} />} title="Blog / Noticias" color={accentColor} textClass={textClass} />
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {sectionImages.blog.map((src, i) => (
                                            <div key={i} className={`${cardBg} rounded-lg overflow-hidden transition-colors`}>
                                                <img src={src} alt={`Blog ${i + 1}`} className="w-full h-10 object-cover" />
                                                <div className="p-1.5">
                                                    <div className={`h-1.5 ${isDark ? "bg-white/15" : "bg-gray-200"} rounded w-full mb-1`} />
                                                    <div className={`h-1 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded w-2/3`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Contacto ─── */}
                            {section === "contacto" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<Mail size={10} />} title="Contacto" color={accentColor} textClass={textClass} />
                                    <div className={`flex gap-4 text-[9px] ${subtextClass}`}>
                                        <span className="flex items-center gap-1"><Mail size={9} /> Email</span>
                                        <span className="flex items-center gap-1"><Phone size={9} /> Teléfono</span>
                                        <span className="flex items-center gap-1"><MapPin size={9} /> Ubicación</span>
                                    </div>
                                    <div className={`${cardBg} rounded p-2 space-y-1 transition-colors`}>
                                        <div className={`h-5 ${isDark ? "bg-white/5" : "bg-gray-100"} rounded w-full`} />
                                        <div className={`h-5 ${isDark ? "bg-white/5" : "bg-gray-100"} rounded w-full`} />
                                        <div className="h-5 rounded w-1/3 text-white text-[8px] flex items-center justify-center" style={{ backgroundColor: accentColor }}>Enviar</div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Ubicación ─── */}
                            {section === "ubicacion" && (
                                <div className="space-y-2">
                                    <SectionTitle icon={<MapPin size={10} />} title="Ubicación" color={accentColor} textClass={textClass} />
                                    <div
                                        className="h-20 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${accentColor}08` }}
                                    >
                                        <div className="text-center">
                                            <MapPin size={16} style={{ color: accentColor }} className="mx-auto mb-1" />
                                            <span className={`text-[8px] ${subtextClass}`}>Google Maps</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {activeSections.length === 0 && (
                    <div className="px-6 py-8 text-center">
                        <p className={`text-xs ${subtextClass}`}>Selecciona secciones para ver la vista previa</p>
                    </div>
                )}

                {/* Footer */}
                <div
                    className="px-6 py-3 text-center transition-colors duration-300"
                    style={{ backgroundColor: `${accentColor}10` }}
                >
                    <p className={`text-[9px] ${subtextClass}`}>© 2026 {businessName} — Todos los derechos reservados</p>
                </div>
            </div>

            {/* WhatsApp floating button */}
            {features.includes("whatsapp_button") && (
                <div
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: "#25D366" }}
                >
                    <MessageCircle size={18} className="text-white" />
                </div>
            )}
        </div>
    );
}

function SectionTitle({ icon, title, color, textClass }: { icon: React.ReactNode; title: string; color: string; textClass: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-1">
            <span style={{ color }}>{icon}</span>
            <h4 className={`text-[10px] font-semibold ${textClass}`}>{title}</h4>
        </div>
    );
}
