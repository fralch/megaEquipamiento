const menuData = {
    lab: {
        kicker: "Línea principal",
        title: "Laboratorio",
        featureTitle: "Cotiza equipos por aplicación",
        featureText: "Recibe sugerencias según uso, rango, norma o presupuesto.",
        items: [
            { title: "Autoclaves Verticales", desc: "Esterilización y bioseguridad industrial", price: "2,499.00", oldPrice: "3,100.00", discount: "19", stars: "★★★★★", reviews: "28", moq: "1 ud" },
            { title: "Balanzas Analíticas", desc: "Precisión extrema para análisis científico", price: "1,250.00", oldPrice: "1,600.00", discount: "21", stars: "★★★★☆", reviews: "19", moq: "1 ud" },
            { title: "Microscopía Digital", desc: "Óptica avanzada para biología y clínica", price: "950.00", oldPrice: "1,200.00", discount: "20", stars: "★★★★★", reviews: "12", moq: "1 ud" },
            { title: "Centrífugas de Banco", desc: "Velocidad constante para microplacas y tubos", price: "780.00", oldPrice: "980.00", discount: "20", stars: "★★★★☆", reviews: "15", moq: "1 ud" },
            { title: "Agitadores Magnéticos", desc: "Agitación homogénea con placa calefactora", price: "340.00", oldPrice: "420.00", discount: "19", stars: "★★★★☆", reviews: "8", moq: "2 uds" },
            { title: "Incubadoras de Cultivo", desc: "Cámaras con control de temperatura", price: "1,850.00", oldPrice: "2,200.00", discount: "15", stars: "★★★★★", reviews: "6", moq: "1 ud" }
        ]
    },
    medicion: {
        kicker: "Nueva línea integrada",
        title: "Medición industrial",
        featureTitle: "Instrumentos para campo y control",
        featureText: "Agrupa equipos por variable: temperatura, ruido, flujo, humedad, presión y electricidad.",
        items: [
            { title: "Anemómetros Digitales", desc: "Medición de flujo y velocidad de aire", price: "180.00", oldPrice: "220.00", discount: "18", stars: "★★★★☆", reviews: "14", moq: "2 uds" },
            { title: "Multímetros Industriales", desc: "Mantenimiento eléctrico preventivo de campo", price: "290.00", oldPrice: "360.00", discount: "19", stars: "★★★★★", reviews: "22", moq: "1 ud" },
            { title: "Sonómetros Tipo 1", desc: "Medición de ruido ocupacional y ambiental", price: "1,150.00", oldPrice: "1,450.00", discount: "20", stars: "★★★★☆", reviews: "9", moq: "1 ud" },
            { title: "Termómetros Infrarrojos", desc: "Dataloggers IR de precisión sin contacto", price: "140.00", oldPrice: "180.00", discount: "22", stars: "★★★★☆", reviews: "31", moq: "5 uds" },
            { title: "Calibradores Pie de Rey", desc: "Dimensión física de alta tolerancia", price: "85.00", oldPrice: "110.00", discount: "22", stars: "★★★★☆", reviews: "17", moq: "10 uds" },
            { title: "Higrómetros de Proceso", desc: "Registro de humedad relativa y ambiente", price: "210.00", oldPrice: "260.00", discount: "19", stars: "★★★★☆", reviews: "11", moq: "3 uds" }
        ]
    },
    clinico: {
        kicker: "Línea complementaria",
        title: "Clínico y mobiliario",
        featureTitle: "Ambientes listos para operar",
        featureText: "Conecta mobiliario, refrigeración, seguridad y equipos de soporte.",
        items: [
            { title: "Mesas de Laboratorio", desc: "Superficies de resina fenólica química", price: "720.00", oldPrice: "900.00", discount: "20", stars: "★★★★★", reviews: "8", moq: "1 ud" },
            { title: "Cabinas de Extracción", desc: "Seguridad y bioseguridad de gases", price: "3,800.00", oldPrice: "4,600.00", discount: "17", stars: "★★★★★", reviews: "11", moq: "1 ud" },
            { title: "Refrigeración Médica", desc: "Conservación de vacunas y cadena fría", price: "2,150.00", oldPrice: "2,600.00", discount: "17", stars: "★★★★☆", reviews: "14", moq: "1 ud" },
            { title: "Vitrinas de Acero", desc: "Almacenamiento y orden de reactivos", price: "550.00", oldPrice: "680.00", discount: "19", stars: "★★★★☆", reviews: "5", moq: "1 ud" },
            { title: "Lavaderos Industriales", desc: "Acero inoxidable calidad AISI 304", price: "450.00", oldPrice: "550.00", discount: "18", stars: "★★★★☆", reviews: "7", moq: "2 uds" },
            { title: "Sillas Ergonómicas", desc: "Uso clínico y laboratorio lavable", price: "120.00", oldPrice: "150.00", discount: "20", stars: "★★★★☆", reviews: "23", moq: "5 uds" }
        ]
    },
    insumos: {
        kicker: "Compra recurrente",
        title: "Insumos y reactivos",
        featureTitle: "Reposición y consumibles",
        featureText: "Ideal para compradores que vuelven por accesorios, vidrio, reactivos y repuestos.",
        items: [
            { title: "Pipetas Automáticas", desc: "Volumen variable micropipeta mono-canal", price: "110.00", oldPrice: "140.00", discount: "21", stars: "★★★★★", reviews: "45", moq: "3 uds" },
            { title: "Vidriería de Borosilicato", desc: "Vasos, matraces, probetas grado A pack", price: "75.00", oldPrice: "95.00", discount: "21", stars: "★★★★☆", reviews: "60", moq: "10 uds" },
            { title: "Reactivos Químicos", desc: "Soluciones de análisis y preparación química", price: "60.00", oldPrice: "75.00", discount: "20", stars: "★★★★☆", reviews: "18", moq: "5 uds" },
            { title: "Guantes de Nitrilo", desc: "Protección estéril caja por 100 unidades", price: "12.00", oldPrice: "16.00", discount: "25", stars: "★★★★★", reviews: "124", moq: "20 cjs" },
            { title: "Medios de Cultivo", desc: "Agar de microbiología y control de calidad", price: "95.00", oldPrice: "120.00", discount: "20", stars: "★★★★☆", reviews: "14", moq: "2 uds" },
            { title: "Kit Repuestos Preventivos", desc: "Filtros y empaques para autoclaves", price: "130.00", oldPrice: "160.00", discount: "18", stars: "★★★★☆", reviews: "6", moq: "1 ud" }
        ]
    },
    servicios: {
        kicker: "Diferenciador B2B",
        title: "Servicios",
        featureTitle: "Soporte técnico como argumento comercial",
        featureText: "Refuerza confianza: calibración, mantenimiento, capacitación e instalación.",
        items: [
            { title: "Servicio Calibración", desc: "Certificado de trazabilidad metrológica", price: "250.00", oldPrice: "300.00", discount: "16", stars: "★★★★★", reviews: "89", moq: "1 eq" },
            { title: "Mantenimiento Autoclaves", desc: "Preventivo anual e informe técnico", price: "400.00", oldPrice: "500.00", discount: "20", stars: "★★★★★", reviews: "42", moq: "1 eq" },
            { title: "Capacitación Operativa", desc: "Entrenamiento certificado de equipos", price: "180.00", oldPrice: "220.00", discount: "18", stars: "★★★★☆", reviews: "15", moq: "1 cur" },
            { title: "Instalación de Cabinas", desc: "Puesta en marcha y pruebas de flujo", price: "350.00", oldPrice: "450.00", discount: "22", stars: "★★★★★", reviews: "27", moq: "1 eq" },
            { title: "Asesoría de Selección", desc: "Estudio de necesidades técnicas en planta", price: "150.00", oldPrice: "200.00", discount: "25", stars: "★★★★☆", reviews: "11", moq: "1 ses" },
            { title: "Gestión Importación", desc: "Trámite de equipos especiales globales", price: "800.00", oldPrice: "1,000.00", discount: "20", stars: "★★★★★", reviews: "8", moq: "1 pro" }
        ]
    }
};

const sectorData = {
    calidad: {
        title: "Control de calidad",
        text: "Equipos para ensayo, medición, preparación de muestras y trazabilidad de procesos.",
        items: [
            { title: "Balanza de precisión", linea: "Laboratorio", price: "720.00", oldPrice: "900.00", discount: "20", stars: "★★★★★", reviews: "14", moq: "1 ud" },
            { title: "Medición dimensional", linea: "Medición", price: "280.00", oldPrice: "350.00", discount: "20", stars: "★★★★☆", reviews: "9", moq: "3 uds" },
            { title: "Mufla de calentamiento", linea: "Laboratorio", price: "1,850.00", oldPrice: "2,300.00", discount: "19", stars: "★★★★★", reviews: "7", moq: "1 ud" },
            { title: "Certificado Calibración", linea: "Servicios", price: "250.00", oldPrice: "300.00", discount: "16", stars: "★★★★☆", reviews: "38", moq: "1 ud" }
        ]
    },
    ambiental: {
        title: "Ambiental",
        text: "Instrumentos para campo, monitoreo, toma de muestras y análisis fisicoquímico.",
        items: [
            { title: "Sonómetro Tipo 2", linea: "Medición", price: "640.00", oldPrice: "800.00", discount: "20", stars: "★★★★☆", reviews: "12", moq: "1 ud" },
            { title: "Anemómetro de Copa", linea: "Medición", price: "220.00", oldPrice: "270.00", discount: "18", stars: "★★★★☆", reviews: "5", moq: "2 uds" },
            { title: "Higrómetro Registrador", linea: "Medición", price: "310.00", oldPrice: "390.00", discount: "20", stars: "★★★★★", reviews: "18", moq: "1 ud" },
            { title: "Muestreador de Aire", linea: "Laboratorio", price: "1,450.00", oldPrice: "1,800.00", discount: "19", stars: "★★★★☆", reviews: "8", moq: "1 ud" }
        ]
    },
    academico: {
        title: "Académico",
        text: "Soluciones para laboratorios de universidades, institutos y centros de investigación.",
        items: [
            { title: "Microscopio Binocular", linea: "Laboratorio", price: "550.00", oldPrice: "700.00", discount: "21", stars: "★★★★★", reviews: "26", moq: "1 ud" },
            { title: "Centrífuga Analítica", linea: "Laboratorio", price: "620.00", oldPrice: "780.00", discount: "20", stars: "★★★★☆", reviews: "14", moq: "1 ud" },
            { title: "Agitador Orbital", linea: "Laboratorio", price: "290.00", oldPrice: "360.00", discount: "19", stars: "★★★★☆", reviews: "9", moq: "2 uds" },
            { title: "Kit Didáctico Física", linea: "Insumos", price: "180.00", oldPrice: "220.00", discount: "18", stars: "★★★★☆", reviews: "4", moq: "5 uds" }
        ]
    },
    alimentos: {
        title: "Alimentos",
        text: "Equipos para control sanitario, humedad, temperatura, esterilización y formulación.",
        items: [
            { title: "Autoclave de Alimentos", linea: "Laboratorio", price: "3,200.00", oldPrice: "3,950.00", discount: "18", stars: "★★★★★", reviews: "15", moq: "1 ud" },
            { title: "Estufa de Secado", linea: "Laboratorio", price: "1,400.00", oldPrice: "1,750.00", discount: "20", stars: "★★★★☆", reviews: "11", moq: "1 ud" },
            { title: "Termómetro de Pincho", linea: "Medición", price: "95.00", oldPrice: "120.00", discount: "20", stars: "★★★★★", reviews: "41", moq: "5 uds" },
            { title: "Reactivos Patógenos", linea: "Insumos", price: "80.00", oldPrice: "100.00", discount: "20", stars: "★★★★☆", reviews: "13", moq: "5 uds" }
        ]
    }
};

const assistantData = {
    esterilizar: {
        title: "Autoclaves y esterilizadores",
        text: "Revisa volumen, temperatura de trabajo, tipo de carga y normas de seguridad.",
        tags: ["Autoclave vertical", "Esterilización", "Bioseguridad"],
        product: { price: "2,499.00", oldPrice: "3,100.00", discount: "19", moq: "1 unidad" }
    },
    medir: {
        title: "Instrumentos de medición de campo",
        text: "Define variable, rango, precisión, registro de datos y ambiente de uso.",
        tags: ["Sonómetro Tipo 1", "Anemómetro Digital", "Termómetro IR"],
        product: { price: "1,150.00", oldPrice: "1,450.00", discount: "20", moq: "1 unidad" }
    },
    calibrar: {
        title: "Calibradores y patrones",
        text: "Evalúa trazabilidad, incertidumbre, frecuencia de calibración y certificado requerido.",
        tags: ["Servicio Calibración", "Bloque Patrón", "Calibrador Dimensional"],
        product: { price: "250.00", oldPrice: "300.00", discount: "16", moq: "1 unidad" }
    },
    pesar: {
        title: "Balanzas de precisión B2B",
        text: "Elige capacidad, resolución, cabina, conectividad y condiciones del ambiente.",
        tags: ["Balanza analítica", "Celda de carga", "Calidad Farmacéutica"],
        product: { price: "1,250.00", oldPrice: "1,600.00", discount: "21", moq: "1 unidad" }
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
    megaCategories.innerHTML = data.items.map((item) => `
        <article class="mega-card">
            <span class="badge-discount-promo">-${item.discount}%</span>
            <div style="height: 80px; background: #f1f5f9; border-radius: var(--radius-sm); position: relative; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: var(--brand);">
                <svg class="svg-icon" style="width: 32px; height: 32px;" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <strong>${item.title}</strong>
            <span>${item.desc}</span>
            <div class="rating-stars">${item.stars} <span class="rating-count">(${item.reviews})</span></div>
            <div class="price-container">
                <span class="price-old">$${item.oldPrice}</span>
                <span class="price-new">$${item.price}</span>
            </div>
            <span class="product-moq">Pedido mín: ${item.moq}</span>
            <button class="btn-add-cart-circle" onclick="this.textContent='✓'; this.style.background='#00875a'; event.stopPropagation();">+</button>
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
            <span class="badge-discount-promo">-${item.discount}% B2B</span>
            <strong>${item.title}</strong>
            <span>Línea: ${item.linea}</span>
            <div class="rating-stars">${item.stars} <span class="rating-count">(${item.reviews})</span></div>
            <div class="price-container">
                <span class="price-old">$${item.oldPrice}</span>
                <span class="price-new">$${item.price}</span>
            </div>
            <span class="product-moq">P. Mínimo: ${item.moq}</span>
            <button class="btn-add-cart-circle" onclick="this.textContent='✓'; this.style.background='#00875a'; event.stopPropagation();">+</button>
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
    
    const resultBox = document.querySelector(".assistant-result");
    if (resultBox) {
        let priceBox = resultBox.querySelector(".price-container-assistant");
        if (!priceBox) {
            priceBox = document.createElement("div");
            priceBox.className = "price-container-assistant";
            priceBox.style.margin = "12px 0";
            resultBox.insertBefore(priceBox, resultBox.querySelector(".spec-box"));
        }
        priceBox.innerHTML = `
            <div style="font-size: 13px; color: var(--muted); text-decoration: line-through;">$${data.product.oldPrice}</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-dark); font-family: Outfit;">$${data.product.price} <span style="font-size:12px; color: var(--green); font-weight:700;">-${data.product.discount}% B2B</span></div>
            <div style="font-size: 12px; color: var(--muted); margin-top:4px;">Pedido Mínimo: ${data.product.moq}</div>
        `;
    }
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
