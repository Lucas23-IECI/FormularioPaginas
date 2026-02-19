import { FormData } from "@/types/briefing";

// ── Pricing Engine para Landing Pages ─────────────────────
// Calcula precio estimado basado en las selecciones del formulario

export interface PriceBreakdownItem {
    category: string;
    label: string;
    amount: number;
}

export interface PricingResult {
    basePrice: number;
    totalMin: number;
    breakdown: PriceBreakdownItem[];
    sectionsCount: number;
    featuresCount: number;
}

// ── Precios por sección ───────────────────────────────────
const SECTION_PRICES: Record<string, { label: string; price: number }> = {
    hero: { label: "Hero / Banner principal", price: 0 },
    servicios: { label: "Servicios", price: 5_000 },
    proceso: { label: "Proceso", price: 3_000 },
    sobre_mi: { label: "Sobre nosotros", price: 3_000 },
    portafolio: { label: "Portafolio / Galería", price: 8_000 },
    testimonios: { label: "Testimonios", price: 3_000 },
    equipo: { label: "Equipo", price: 5_000 },
    precios: { label: "Precios / Planes", price: 5_000 },
    faq: { label: "Preguntas frecuentes", price: 3_000 },
    blog: { label: "Blog / Noticias", price: 10_000 },
    contacto: { label: "Formulario de contacto", price: 5_000 },
    ubicacion: { label: "Mapa / Ubicación", price: 3_000 },
    estadisticas: { label: "Estadísticas", price: 3_000 },
    clientes: { label: "Logos de clientes", price: 3_000 },
};

// ── Precios por funcionalidad extra ───────────────────────
const FEATURE_PRICES: Record<string, { label: string; price: number }> = {
    whatsapp_button: { label: "Botón de WhatsApp", price: 0 },
    google_maps: { label: "Google Maps", price: 3_000 },
    formulario_contacto: { label: "Formulario de contacto", price: 5_000 },
    formulario_avanzado: { label: "Formulario avanzado", price: 10_000 },
    animaciones: { label: "Animaciones y efectos", price: 8_000 },
    multiidioma: { label: "Multi-idioma (ES/EN)", price: 25_000 },
    agenda: { label: "Integración Calendly", price: 8_000 },
    descargables: { label: "Descargables (PDF)", price: 3_000 },
    analytics: { label: "Google Analytics", price: 3_000 },
    seo: { label: "Optimización SEO", price: 8_000 },
};

// ── Precios por estilo de diseño ──────────────────────────
const DESIGN_PRICES: Record<string, { label: string; price: number }> = {
    moderno: { label: "Diseño moderno", price: 0 },
    minimalista: { label: "Diseño minimalista", price: 0 },
    no_se: { label: "Diseño a elección", price: 0 },
    oscuro: { label: "Diseño dark mode", price: 3_000 },
    calido: { label: "Diseño cálido", price: 3_000 },
    corporativo: { label: "Diseño corporativo", price: 5_000 },
    elegante: { label: "Diseño elegante", price: 8_000 },
    creativo: { label: "Diseño creativo", price: 12_000 },
};

// ── Precios por urgencia ──────────────────────────────────
const DEADLINE_PRICES: Record<string, { label: string; price: number }> = {
    sin_prisa: { label: "Sin prisa", price: 0 },
    normal: { label: "2-3 semanas", price: 0 },
    pronto: { label: "1-2 semanas", price: 15_000 },
    urgente: { label: "Esta semana", price: 30_000 },
};

// ── Precios por contenido ─────────────────────────────────
const CONTENT_PRICES = {
    needsLogo: { label: "Diseño de logo", price: 20_000 },
    needsTexts: { label: "Redacción de textos", price: 10_000 },
};

// ── Base ──────────────────────────────────────────────────
const BASE_PRICE = 100_000;

// ── Calculador principal ──────────────────────────────────
export function calculatePrice(formData: FormData): PricingResult {
    const breakdown: PriceBreakdownItem[] = [];
    let total = BASE_PRICE;

    breakdown.push({
        category: "base",
        label: "Landing Page base",
        amount: BASE_PRICE,
    });

    // ── Secciones ──
    const sections = (formData.sections as string[]) || [];
    let sectionsTotal = 0;
    for (const sectionId of sections) {
        const info = SECTION_PRICES[sectionId];
        if (info && info.price > 0) {
            sectionsTotal += info.price;
        }
    }
    if (sectionsTotal > 0) {
        breakdown.push({
            category: "secciones",
            label: `${sections.length} secciones`,
            amount: sectionsTotal,
        });
        total += sectionsTotal;
    }

    // ── Diseño ──
    const designStyle = (formData.designStyle as string) || "";
    const designInfo = DESIGN_PRICES[designStyle];
    if (designInfo && designInfo.price > 0) {
        breakdown.push({
            category: "diseño",
            label: designInfo.label,
            amount: designInfo.price,
        });
        total += designInfo.price;
    }

    // ── Contenido ──
    const hasLogo = formData.hasLogo as string;
    if (hasLogo === "no_necesito") {
        breakdown.push({
            category: "contenido",
            label: CONTENT_PRICES.needsLogo.label,
            amount: CONTENT_PRICES.needsLogo.price,
        });
        total += CONTENT_PRICES.needsLogo.price;
    }

    const hasTexts = formData.hasTexts as string;
    if (hasTexts === "no") {
        breakdown.push({
            category: "contenido",
            label: CONTENT_PRICES.needsTexts.label,
            amount: CONTENT_PRICES.needsTexts.price,
        });
        total += CONTENT_PRICES.needsTexts.price;
    }

    // ── Features ──
    const features = (formData.features as string[]) || [];
    let featuresTotal = 0;
    const featureLabels: string[] = [];
    for (const featureId of features) {
        const info = FEATURE_PRICES[featureId];
        if (info && info.price > 0) {
            featuresTotal += info.price;
            featureLabels.push(info.label);
        }
    }
    if (featuresTotal > 0) {
        breakdown.push({
            category: "extras",
            label: `${featureLabels.length} funcionalidades`,
            amount: featuresTotal,
        });
        total += featuresTotal;
    }

    // ── Urgencia ──
    const deadline = (formData.deadline as string) || "";
    const deadlineInfo = DEADLINE_PRICES[deadline];
    if (deadlineInfo && deadlineInfo.price > 0) {
        breakdown.push({
            category: "urgencia",
            label: `Entrega: ${deadlineInfo.label}`,
            amount: deadlineInfo.price,
        });
        total += deadlineInfo.price;
    }

    return {
        basePrice: BASE_PRICE,
        totalMin: total,
        breakdown,
        sectionsCount: sections.length,
        featuresCount: features.length,
    };
}

// ── Formateo CLP ──────────────────────────────────────────
export function formatCLP(amount: number): string {
    return `$${amount.toLocaleString("es-CL")}`;
}
