/**
 * Mapeo centralizado de valores internos a etiquetas legibles.
 * Extraído de las opciones definidas en configs/landing.ts.
 * Usado por generateDocx, generateXlsx y generateEmailHtml.
 */

const VALUE_LABELS: Record<string, string> = {
    // ── Rubro / Industria ──
    gastronomia: "Gastronomía / Restaurante",
    salud: "Salud / Medicina",
    belleza: "Belleza / Estética",
    educacion: "Educación / Cursos",
    tecnologia: "Tecnología / Software",
    inmobiliaria: "Inmobiliaria / Bienes raíces",
    legal: "Legal / Abogados",
    fitness: "Fitness / Deporte",
    construccion: "Construcción / Remodelación",
    automotriz: "Automotriz",
    agricultura: "Agricultura / Agro",
    consultoria: "Consultoría / Asesoría",
    marketing: "Marketing / Publicidad",

    // ── Objetivo principal ──
    captar_leads: "Captar clientes potenciales (leads)",
    vender_servicio: "Promocionar y vender un servicio",
    vender_producto: "Promocionar un producto",
    informar: "Dar a conocer mi negocio",
    evento: "Promocionar un evento",
    portafolio: "Mostrar mi portafolio / trabajo",

    // ── Llamada a la acción (CTA) ──
    whatsapp: "Contactar por WhatsApp",
    formulario: "Llenar un formulario de contacto",
    llamar: "Llamar por teléfono",
    agendar: "Agendar una cita / reunión",
    comprar: "Comprar un producto / servicio",
    descargar: "Descargar algo (PDF, catálogo, etc.)",

    // ── Secciones de la landing ──
    hero: "Hero / Banner principal",
    servicios: "Servicios / Lo que ofrezco",
    proceso: "Proceso / Cómo trabajamos",
    sobre_mi: "Sobre mí / Nosotros",
    // portafolio ya mapeado arriba ("Mostrar mi portafolio / trabajo")
    testimonios: "Testimonios / Reseñas",
    equipo: "Equipo de trabajo",
    precios: "Precios / Planes",
    faq: "Preguntas frecuentes (FAQ)",
    blog: "Blog / Noticias",
    contacto: "Formulario de contacto",
    ubicacion: "Mapa / Ubicación",
    estadisticas: "Cifras / Estadísticas",
    clientes: "Logos de clientes",

    // ── Estilo de diseño ──
    moderno: "Moderno y limpio",
    elegante: "Elegante y sofisticado",
    minimalista: "Minimalista",
    corporativo: "Corporativo / Profesional",
    creativo: "Creativo y colorido",
    oscuro: "Dark mode / Oscuro",
    calido: "Cálido y acogedor",

    // ── Logo ──
    si: "Sí",
    no_necesito: "No tengo, pero lo necesito",
    no_no_necesito: "No tengo y no lo necesito por ahora",

    // ── Fotos ──
    algunas: "Tengo algunas, necesitaría más",

    // ── Textos ──
    borrador: "Tengo un borrador / ideas",

    // ── Funcionalidades extras ──
    whatsapp_button: "Botón de WhatsApp flotante",
    google_maps: "Google Maps integrado",
    formulario_contacto: "Formulario de contacto",
    formulario_avanzado: "Formulario avanzado (más campos)",
    animaciones: "Animaciones y efectos",
    multiidioma: "Multi-idioma (ES/EN)",
    agenda: "Integración con agenda (Calendly)",
    descargables: "Descargables (PDF / Catálogo)",
    analytics: "Google Analytics",
    seo: "Optimización SEO",

    // ── Dominio ──
    necesito: "No, necesito uno",
    no_se: "No estoy seguro / No sé",

    // ── Plazo de entrega ──
    urgente: "Lo antes posible (1-3 días)",
    pronto: "Esta semana",
    normal: "En 1-2 semanas",
    sin_prisa: "Sin prisa, cuando esté listo",

    // ── Presupuesto ──
    basico: "Básico",
    medio: "Medio",
    premium: "Premium",

    // ── Genéricos ──
    otro: "Otro",
    no: "No",
};

/**
 * Traduce un valor crudo a su etiqueta legible.
 * Si el valor es un array, traduce cada elemento.
 * Si no hay traducción, devuelve el valor tal cual (formateado).
 */
export function translateValue(value: unknown): string {
    if (value === undefined || value === null || value === "") return "No especificado";

    if (Array.isArray(value)) {
        return value
            .map((v) => VALUE_LABELS[String(v)] || String(v).replace(/_/g, " "))
            .join(", ");
    }

    if (typeof value === "boolean") return value ? "Sí" : "No";

    const str = String(value);
    return VALUE_LABELS[str] || str;
}

export { VALUE_LABELS };
