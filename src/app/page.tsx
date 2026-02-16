"use client";

import React from "react";
import Link from "next/link";
import { Rocket, ShoppingCart, Building2, ArrowRight, Sparkles } from "lucide-react";
import { getAllConfigs } from "@/modules/briefingEngine";

const comingSoonConfigs = [
  {
    type: "WEB_COMERCIAL",
    label: "Web Comercial",
    description: "Sitio web completo con múltiples páginas para tu negocio",
    icon: "Building2",
    enabled: false,
  },
  {
    type: "ECOMMERCE",
    label: "E-commerce",
    description: "Tienda online completa con carrito de compras y pagos",
    icon: "ShoppingCart",
    enabled: false,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket size={32} />,
  Building2: <Building2 size={32} />,
  ShoppingCart: <ShoppingCart size={32} />,
};

export default function HomePage() {
  const enabledConfigs = getAllConfigs();
  const allServices = [
    ...enabledConfigs.map((c) => ({ ...c, enabled: true })),
    ...comingSoonConfigs.filter(
      (cs) => !enabledConfigs.find((ec) => ec.type === cs.type)
    ),
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-purple-950/30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-6">
            <Sparkles size={14} />
            <span>Briefing Profesional</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cuéntanos sobre tu{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              proyecto web
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Responde unas preguntas rápidas para que podamos diseñar la página perfecta para tu negocio.
            Toma menos de 5 minutos.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {allServices.map((service, index) => {
            const isEnabled = service.enabled;
            return (
              <div
                key={service.type}
                className={`group relative animate-slideUp`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isEnabled ? (
                  <Link
                    href={`/briefing/${service.type.toLowerCase()}`}
                    className="block h-full"
                  >
                    <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                        {iconMap[service.icon] || <Rocket size={32} />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {service.label}
                      </h3>
                      <p className="text-white/50 text-sm mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Comenzar</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 opacity-50">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-white/30 mb-6">
                      {iconMap[service.icon] || <Building2 size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-white/40 mb-3">
                      {service.label}
                    </h3>
                    <p className="text-white/30 text-sm mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-white/30 text-xs">
                      Próximamente
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
