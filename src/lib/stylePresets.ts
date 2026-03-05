// ── Shared Design Style Presets ──────────────────────────────────
// Used by LiveLandingPreview and LiveWebCorporativaPreview

export interface StylePreset {
    isDark: boolean;
    bg: string;
    text: string;
    subtext: string;
    card: string;
    divider: string;
    heroOverlay: string;
    fontClass: string;
    borderRadius: string;
    shadow: string;
    headingClass: string;
    sectionPy: string;
}

export function getStylePreset(designStyle: string, primaryColor: string): StylePreset {
    switch (designStyle) {
        case "oscuro":
            return {
                isDark: true,
                bg: "bg-gray-950",
                text: "text-white",
                subtext: "text-gray-400",
                card: "bg-white/5 border border-white/10",
                divider: "border-white/5",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                fontClass: "",
                borderRadius: "rounded-lg",
                shadow: "shadow-none",
                headingClass: "uppercase tracking-wider text-[9px]",
                sectionPy: "py-4 px-5",
            };
        case "elegante":
            return {
                isDark: false,
                bg: "bg-stone-50",
                text: "text-stone-900",
                subtext: "text-stone-500",
                card: "bg-white border border-stone-200",
                divider: "border-stone-200",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
                fontClass: "font-serif",
                borderRadius: "rounded-sm",
                shadow: "shadow-none",
                headingClass: "uppercase tracking-[0.2em] text-[9px] font-light",
                sectionPy: "py-6 px-6",
            };
        case "minimalista":
            return {
                isDark: false,
                bg: "bg-white",
                text: "text-gray-800",
                subtext: "text-gray-400",
                card: "bg-gray-50/50 border border-gray-100",
                divider: "border-gray-50",
                heroOverlay: `linear-gradient(180deg, ${primaryColor}08, transparent)`,
                fontClass: "",
                borderRadius: "rounded-xl",
                shadow: "shadow-none",
                headingClass: "tracking-tight text-[10px] font-light lowercase",
                sectionPy: "py-6 px-8",
            };
        case "corporativo":
            return {
                isDark: false,
                bg: "bg-slate-50",
                text: "text-slate-900",
                subtext: "text-slate-500",
                card: "bg-white border border-slate-200",
                divider: "border-slate-200",
                heroOverlay: `linear-gradient(135deg, #1e293b, #334155)`,
                fontClass: "",
                borderRadius: "rounded",
                shadow: "shadow-md",
                headingClass: "uppercase tracking-wide text-[9px] font-bold",
                sectionPy: "py-3 px-4",
            };
        case "creativo":
            return {
                isDark: false,
                bg: "bg-white",
                text: "text-gray-900",
                subtext: "text-gray-600",
                card: "bg-gradient-to-br from-gray-50 to-white border border-purple-100",
                divider: "border-purple-100",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}30, #a855f740)`,
                fontClass: "",
                borderRadius: "rounded-2xl",
                shadow: "shadow-lg shadow-purple-100/50",
                headingClass: "text-[11px] font-extrabold",
                sectionPy: "py-5 px-5",
            };
        case "calido":
            return {
                isDark: false,
                bg: "bg-amber-50/30",
                text: "text-amber-950",
                subtext: "text-amber-700/60",
                card: "bg-white border border-amber-100",
                divider: "border-amber-100",
                heroOverlay: `linear-gradient(135deg, ${primaryColor}20, #f59e0b15)`,
                fontClass: "",
                borderRadius: "rounded-2xl",
                shadow: "shadow-sm shadow-amber-100",
                headingClass: "text-[10px] font-medium",
                sectionPy: "py-5 px-6",
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
                shadow: "shadow-sm",
                headingClass: "text-[10px] font-semibold",
                sectionPy: "py-4 px-5",
            };
    }
}
