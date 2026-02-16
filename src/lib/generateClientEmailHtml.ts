interface BriefingData {
    type: string;
    clientName: string;
    clientEmail: string;
    contactData: Record<string, unknown>;
    contentData: Record<string, unknown>;
    designData: Record<string, unknown>;
    extraData: Record<string, unknown>;
}

const TYPE_LABELS: Record<string, string> = {
    LANDING: "Landing Page",
    WEB_COMERCIAL: "Web Comercial",
    ECOMMERCE: "E-commerce",
};

const SECTION_LABELS: Record<string, string> = {
    hero: "Banner Principal",
    servicios: "Servicios",
    proceso: "Proceso de Trabajo",
    sobre_mi: "Sobre Nosotros",
    portafolio: "Portafolio",
    testimonios: "Testimonios",
    equipo: "Equipo",
    precios: "Planes y Precios",
    faq: "Preguntas Frecuentes",
    blog: "Blog / Noticias",
    contacto: "Formulario de Contacto",
    ubicacion: "Mapa / Ubicación",
    estadisticas: "Cifras y Estadísticas",
    clientes: "Logos de Clientes",
};

const FEATURE_LABELS: Record<string, string> = {
    whatsapp_button: "Botón de WhatsApp",
    google_maps: "Google Maps",
    formulario_contacto: "Formulario de contacto",
    formulario_avanzado: "Formulario avanzado",
    animaciones: "Animaciones y efectos",
    multiidioma: "Multi-idioma (ES/EN)",
    agenda: "Integración con agenda",
    descargables: "Descargables (PDF/Catálogo)",
    analytics: "Google Analytics",
    seo: "Optimización SEO",
};

const STYLE_LABELS: Record<string, string> = {
    moderno: "Moderno y limpio",
    elegante: "Elegante y sofisticado",
    minimalista: "Minimalista",
    corporativo: "Corporativo / Profesional",
    creativo: "Creativo y colorido",
    oscuro: "Dark mode / Oscuro",
    calido: "Cálido y acogedor",
    no_se: "A criterio del diseñador",
};

const GOAL_LABELS: Record<string, string> = {
    captar_leads: "Captar clientes potenciales",
    vender_servicio: "Promocionar un servicio",
    vender_producto: "Promocionar un producto",
    informar: "Dar a conocer el negocio",
    evento: "Promocionar un evento",
    portafolio: "Mostrar portafolio",
    otro: "Otro",
};

const DEADLINE_LABELS: Record<string, string> = {
    urgente: "Lo antes posible (1-3 días)",
    pronto: "Esta semana",
    normal: "En 1-2 semanas",
    sin_prisa: "Sin prisa",
};

/**
 * Generates a beautiful thank-you email for the CLIENT with a summary
 * of what they requested. This is NOT the admin briefing email.
 */
export function generateClientEmailHtml(data: BriefingData): string {
    const businessName = (data.contactData.businessName as string) || data.clientName;
    const primaryColor = (data.designData.primaryColor as string) || "#4361EE";
    const sections = (data.contentData.sections as string[]) || [];
    const features = (data.extraData.features as string[]) || [];
    const designStyle = (data.designData.designStyle as string) || "";
    const mainGoal = (data.contentData.mainGoal as string) || "";
    const deadline = (data.extraData.deadline as string) || "";
    const mainCTA = (data.contentData.mainCTA as string) || "";

    const sectionsList = sections
        .map((s) => SECTION_LABELS[s] || s.replace(/_/g, " "))
        .map((s) => `<li style="padding: 4px 0; color: #4b5563;">✅ ${s}</li>`)
        .join("");

    const featuresList = features
        .map((f) => FEATURE_LABELS[f] || f.replace(/_/g, " "))
        .map((f) => `<li style="padding: 4px 0; color: #4b5563;">⚡ ${f}</li>`)
        .join("");

    const styleLabel = STYLE_LABELS[designStyle] || designStyle || "No especificado";
    const goalLabel = GOAL_LABELS[mainGoal] || mainGoal || "No especificado";
    const deadlineLabel = DEADLINE_LABELS[deadline] || deadline || "No especificado";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${primaryColor}, #7C3AED); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
            <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px 0;">
                ¡Gracias por confiar en nosotros! 🎉
            </h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0;">
                Hemos recibido tu briefing correctamente
            </p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- Greeting -->
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${data.clientName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Queremos confirmarte que recibimos toda la información de tu proyecto 
                <strong style="color: ${primaryColor};">${businessName}</strong>. 
                Nuestro equipo ya está revisando los detalles para comenzar a trabajar en tu 
                <strong>${TYPE_LABELS[data.type] || data.type}</strong>.
            </p>

            <!-- Summary Box -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                    📋 Resumen de tu solicitud
                </h2>

                <!-- Quick info -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%; vertical-align: top;">Tipo de proyecto</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${TYPE_LABELS[data.type] || data.type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Objetivo</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">🎯 ${goalLabel}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Estilo visual</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">🎨 ${styleLabel}</td>
                    </tr>
                    ${mainCTA ? `<tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Acción principal</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${mainCTA.replace(/_/g, " ")}</td>
                    </tr>` : ""}
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Plazo solicitado</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">📅 ${deadlineLabel}</td>
                    </tr>
                </table>

                ${sections.length > 0 ? `
                <!-- Sections -->
                <div style="margin-bottom: 12px;">
                    <h3 style="color: #475569; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        Secciones incluidas (${sections.length})
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 4px; list-style: none; font-size: 14px;">
                        ${sectionsList}
                    </ul>
                </div>` : ""}

                ${features.length > 0 ? `
                <!-- Features -->
                <div>
                    <h3 style="color: #475569; font-size: 14px; font-weight: 700; margin: 12px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        Funcionalidades extras (${features.length})
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 4px; list-style: none; font-size: 14px;">
                        ${featuresList}
                    </ul>
                </div>` : ""}
            </div>

            <!-- What happens next -->
            <div style="background: linear-gradient(135deg, #eff6ff, #f0f4ff); border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${primaryColor};">
                <h3 style="color: #1e293b; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">
                    🚀 ¿Qué sigue ahora?
                </h3>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                    <li>Nuestro equipo revisará tu briefing en detalle</li>
                    <li>Te contactaremos para aclarar cualquier duda</li>
                    <li>Recibirás una propuesta con el plan de trabajo</li>
                    <li>¡Comenzamos a construir tu página! 💪</li>
                </ol>
            </div>

            <!-- Contact -->
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                Si tienes alguna pregunta o quieres agregar algo más a tu proyecto, no dudes en respondernos a este mismo correo.
            </p>
            <p style="color: #374151; font-size: 15px; font-weight: 600; margin: 16px 0 0 0;">
                ¡Estamos emocionados de trabajar contigo! ✨
            </p>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Este es un correo automático generado al recibir tu briefing.
                </p>
                <p style="color: #d1d5db; font-size: 11px; margin: 6px 0 0;">
                    ${new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
}
