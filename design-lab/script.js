const menuData = {
    lab: {
        kicker: "Línea principal",
        title: "Laboratorio",
        featureTitle: "Cotiza equipos por aplicación",
        featureText: "Recibe sugerencias según uso, rango, norma o presupuesto.",
        items: [
            ["Autoclaves", "Esterilización y bioseguridad"],
            ["Balanzas", "Analíticas, precisión y plataforma"],
            ["Microscopía", "Biología, clínica e industria"],
            ["Centrífugas", "Tubos, microplacas y banco"],
            ["Agitadores", "Magnéticos, orbitales y vortex"],
            ["Incubadoras", "Cultivo, estabilidad y secado"]
        ]
    },
    medicion: {
        kicker: "Nueva línea integrada",
        title: "Medición industrial",
        featureTitle: "Instrumentos para campo y control",
        featureText: "Agrupa equipos por variable: temperatura, ruido, flujo, humedad, presión y electricidad.",
        items: [
            ["Anemómetros", "Flujo y velocidad de aire"],
            ["Multímetros", "Electricidad y mantenimiento"],
            ["Sonómetros", "Ruido ocupacional y ambiental"],
            ["Termómetros", "IR, contacto y dataloggers"],
            ["Calibradores", "Dimensión y precisión"],
            ["Higrómetros", "Humedad, ambiente y proceso"]
        ]
    },
    clinico: {
        kicker: "Línea complementaria",
        title: "Clínico y mobiliario",
        featureTitle: "Ambientes listos para operar",
        featureText: "Conecta mobiliario, refrigeración, seguridad y equipos de soporte.",
        items: [
            ["Mesas de laboratorio", "Superficies y almacenamiento"],
            ["Cabinas", "Bioseguridad y extracción"],
            ["Refrigeración", "Conservación y cadena fría"],
            ["Vitrinas", "Orden y exhibición técnica"],
            ["Lavaderos", "Acero, resina y accesorios"],
            ["Sillas", "Ergonomía y uso clínico"]
        ]
    },
    insumos: {
        kicker: "Compra recurrente",
        title: "Insumos y reactivos",
        featureTitle: "Reposición y consumibles",
        featureText: "Ideal para compradores que vuelven por accesorios, vidrio, reactivos y repuestos.",
        items: [
            ["Pipetas", "Volumen fijo y variable"],
            ["Vidriería", "Vasos, matraces y probetas"],
            ["Reactivos", "Análisis y preparación"],
            ["Guantes", "Protección y bioseguridad"],
            ["Medios de cultivo", "Microbiología y control"],
            ["Repuestos", "Mantenimiento preventivo"]
        ]
    },
    servicios: {
        kicker: "Diferenciador B2B",
        title: "Servicios",
        featureTitle: "Soporte técnico como argumento comercial",
        featureText: "Refuerza confianza: calibración, mantenimiento, capacitación e instalación.",
        items: [
            ["Calibración", "Trazabilidad y certificados"],
            ["Mantenimiento", "Preventivo y correctivo"],
            ["Capacitación", "Uso seguro y eficiente"],
            ["Instalación", "Puesta en marcha"],
            ["Asesoría", "Selección por necesidad"],
            ["Importación", "Equipos especializados"]
        ]
    }
};

const sectorData = {
    calidad: {
        title: "Control de calidad",
        text: "Equipos para ensayo, medición, preparación de muestras y trazabilidad de procesos.",
        items: ["Balanzas de precisión", "Medición dimensional", "Hornos y muflas", "Calibración"]
    },
    ambiental: {
        title: "Ambiental",
        text: "Instrumentos para campo, monitoreo, toma de muestras y análisis fisicoquímico.",
        items: ["Sonómetros", "Anemómetros", "Higrómetros", "Muestreo"]
    },
    academico: {
        title: "Académico",
        text: "Soluciones para laboratorios de universidades, institutos y centros de investigación.",
        items: ["Microscopios", "Centrífugas", "Agitadores", "Kits didácticos"]
    },
    alimentos: {
        title: "Alimentos",
        text: "Equipos para control sanitario, humedad, temperatura, esterilización y formulación.",
        items: ["Autoclaves", "Estufas", "Termometría", "Reactivos"]
    }
};

const assistantData = {
    esterilizar: {
        title: "Autoclaves y esterilizadores",
        text: "Revisa volumen, temperatura de trabajo, tipo de carga y normas de seguridad.",
        tags: ["Autoclave vertical", "Esterilización", "Bioseguridad"]
    },
    medir: {
        title: "Instrumentos de medición de campo",
        text: "Define variable, rango, precisión, registro de datos y ambiente de uso.",
        tags: ["Sonómetro", "Anemómetro", "Termómetro IR"]
    },
    calibrar: {
        title: "Calibradores y patrones",
        text: "Evalúa trazabilidad, incertidumbre, frecuencia de calibración y certificado requerido.",
        tags: ["Calibrador", "Patrón", "Servicio técnico"]
    },
    pesar: {
        title: "Balanzas de precisión",
        text: "Elige capacidad, resolución, cabina, conectividad y condiciones del ambiente.",
        tags: ["Balanza analítica", "Precisión", "Control de calidad"]
    }
};

const megaCategories = document.getElementById("megaCategories");
const megaTitle = document.getElementById("megaTitle");
const megaKicker = document.getElementById("megaKicker");
const megaFeatureTitle = document.getElementById("megaFeatureTitle");
const megaFeatureText = document.getElementById("megaFeatureText");

function renderMega(key) {
    if (!megaCategories || !megaTitle || !megaKicker || !megaFeatureTitle || !megaFeatureText) return;

    const data = menuData[key];
    megaKicker.textContent = data.kicker;
    megaTitle.textContent = data.title;
    megaFeatureTitle.textContent = data.featureTitle;
    megaFeatureText.textContent = data.featureText;
    megaCategories.innerHTML = data.items.map(([title, text]) => `
        <article class="mega-card">
            <strong>${title}</strong>
            <span>${text}</span>
        </article>
    `).join("");
}

document.querySelectorAll(".mega-item").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".mega-item").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderMega(button.dataset.menu);
    });
});

const sectorTitle = document.getElementById("sectorTitle");
const sectorText = document.getElementById("sectorText");
const solutionGrid = document.getElementById("solutionGrid");

function renderSector(key) {
    if (!sectorTitle || !sectorText || !solutionGrid) return;

    const data = sectorData[key];
    sectorTitle.textContent = data.title;
    sectorText.textContent = data.text;
    solutionGrid.innerHTML = data.items.map((item) => `
        <article class="solution-card">
            <strong>${item}</strong>
            <span>Categoría recomendada</span>
        </article>
    `).join("");
}

document.querySelectorAll("#sectorTabs button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("#sectorTabs button").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderSector(button.dataset.sector);
    });
});

const assistantTitle = document.getElementById("assistantTitle");
const assistantText = document.getElementById("assistantText");
const assistantTags = document.getElementById("assistantTags");

function renderAssistant(key) {
    if (!assistantTitle || !assistantText || !assistantTags) return;

    const data = assistantData[key];
    assistantTitle.textContent = data.title;
    assistantText.textContent = data.text;
    assistantTags.innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join("");
}

document.querySelectorAll("#choiceList button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("#choiceList button").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderAssistant(button.dataset.choice);
    });
});

renderMega("lab");
renderSector("calidad");
renderAssistant("esterilizar");
