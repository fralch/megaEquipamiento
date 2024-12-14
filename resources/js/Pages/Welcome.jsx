import { Head } from "@inertiajs/react";
import {
    mdiChevronDown,
    mdiChevronRight,
    mdiGauge,
    mdiLayersOutline,
    mdiWidgetsOutline,
} from "@mdi/js";
import { useEffect, useState } from "react";
import CartIcon from "@/Components/home/CartIcon ";
import Slider from "@/Components/home/Slider";
import Sectores from "@/Components/home/Sectores";
import Categorias_cuadrado from "@/Components/home/Categorias_cuadrado";

export default function Welcome() {
    const [showUIElements, setShowUIElements] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null); // New state to track active submenu
    const [categoriasArray, setCategoriasArray] = useState([
        "Accesorios de Laboratorio",
        "Agitadores de Laboratorio",
        "Analizadores de alimentos",
        "Analizadores de Gases",
        "Analizadores de Texturas",
        "Autoclaves de laboratorio",
        "Balanzas de laboratorio",
        "Baños de Laboratorio",
        "Baños Ultrasónicos",
        "Biorreactores",
        "Bombas y compresores de Laboratorio",
        "Buretas y Dispensadores",
        "Cabinas de Ventilación de Laboratorio",
        "Calorímetros",
        "Cámaras Climáticas de Laboratorio",
        "Campanas Extractoras",
        "Centrífugas",
        "Certificados De Calibración Acreditado",
        "Certificados De Calibración Trazable",
        "Congeladores de laboratorio",
        "Consumibles de Laboratorio",
        "Contadores de Colonias",
        "Criostatos",
        "Densímetros",
        "Destiladores de Agua",
        "Dispersores de laboratorios",
        "Electroquímica",
        "Equipos de seguridad",
        "Espectrofotómetros",
        "Espectroscopía",
        "Espectroscopios",
        "Esterilizadores de laboratorio",
        "Estufas de Laboratorio",
        "Evaporadores o Concentradores de Muestras",
        "Extracción en Fase Sólida",
        "Fotómetros",
        "Generadores de Laboratorio",
        "Homogenizador de laboratorio",
        "Hornos",
        "Incubadoras de Laboratorio",
        "Instrumentos Analíticos",
        "Lámparas de análisis UV",
        "Lavadores de microplacas",
        "Limpiadores a vapor",
        "Liofilizadores para laboratorio",
        "Máquina de limpieza de relojes",
        "Maquinas Laser",
        "Materiales de Laboratorio",
        "Medidores de punto de fusión",
        "Mezcladores de Laboratotio",
        "Microscopios",
        "Mobiliarios de laboratorio",
        "Molinos",
        "Molinos de Laboratorio",
        "Pesas Patrón",
        "Pipetas de Laboratorio",
        "Placas de Calentamiento",
        "Polarímetros",
        "Reactores de Alta Viscosidad",
        "Reactores de Síntesis",
        "Refractómetros",
        "Refrigeradores de Laboratorio",
        "Reómetros",
        "Rotavapores",
        "Servicio de Mantenimiento Equipos de Laboratorio",
        "Sistemas de extracción de ADN-ARN y purificación de proteínas",
        "Sistemas de Histotecnología",
        "Sistemas de Limpieza UV",
        "Software de Laboratorio",
        "Tamizadora",
        "Tamizadores",
        "Termobloques",
        "Termostatos de Laboratorio",
        "Trituradores de Laboratorio",
        "Viscosímetros",
    ]);

    const [subcategoriasArray, setSubcategoriasArray] = useState(
        { 
        "Accesorios de Laboratorio": [
            "Accesorios de Laboratorio",
            "Accesorios de Agitadores",
            "Accesorios de Agitadores de Hélice",
            "Accesorios de Agitadores de Incubación",
            "Accesorios de Agitadores de Laboratorio",
            "Accesorios de Agitadores de Microplacas",
            "Accesorios de Agitadores de Rodillo",
            "Accesorios de Agitadores de vórtex",
            "Accesorios de Agitadores Magnéticos",
            "Accesorios de Agitadores Orbitales",
            "Accesorios de Agitadores Oscilantes",
            "Accesorios de Agitadores Rotativos",
            "Accesorios de Agitadores Térmicos",
            "Accesorios de Analizador de texturas",
            "Accesorios de Analizadores de alimentos",
            "Accesorios de Autoclaves",
            "Accesorios de Balanzas",
            "Accesorios de Baño Ultrasonico",
            "Accesorios de Baños de Laboratorio",
            "Accesorios de Baños Maria",
            "Accesorios de Biorreactores",
            "Accesorios de Bombas y compresores",
            "Accesorios de Buretas y dispensadores",
            "Accesorios de Cabinas de Flujo Laminar",
            "Accesorios de Cabinas de Ventilación de Laboratorio",
            "Accesorios de Calorímetros",
            "Accesorios de Cámaras Climáticas",
            "Accesorios de Cámaras Climáticas de Laboratorio",
            "Accesorios de Campanas Extractoras",
            "Accesorios de Centrífugas",
            "Accesorios de Congeladores",
            "Accesorios de Congeladores de laboratorio",
            "Accesorios de Contadores de Colonias",
            "Accesorios de Densímetros",
            "Accesorios de Desecadores",
            "Accesorios de Destiladores y Purificadores de Agua",
            "Accesorios de Dispersores",
            "Accesorios de Esterilizadores",
            "Accesorios de Esterilizadores de laboratorio",
            "Accesorios de Estufas",
            "Accesorios de Fotómetros",
            "Accesorios de Generadores de Laboratorio",
            "Accesorios de Homogeneizadores",
            "Accesorios de Hornos",
            "Accesorios de Incubadoras",
            "Accesorios de Incubadoras de Laboratorio",
            "Accesorios de Instrumentos Analíticos",
            "Accesorios de Kit de electroquímica",
            "Accesorios de Laboratorio",
            "Accesorios de Lavadores de microplacas",
            "Accesorios de Limpiadores a vapor",
            "Accesorios de Microscopios",
            "Accesorios de Mobiliarios de laboratorio",
            "Accesorios de Molinos",
            "Accesorios de Pesas Patrón",
            "Accesorios de Pipetas",
            "Accesorios de Placas de Calentamiento",
            "Accesorios de Polarímetros",
            "Accesorios de Polarímetros Automáticos",
            "Accesorios de probetas",
            "Accesorios de Reactores de alta viscosidad",
            "Accesorios de Reactores de síntesis",
            "Accesorios de Refractómetros",
            "Accesorios de Refrigeradores",
            "Accesorios de Refrigeradores de Laboratorio",
            "Accesorios de Reómetros",
            "Accesorios de Rotavapores",
            "Accesorios de Sistema de detección",
            "Accesorios de Sistemas de Limpieza UV",
            "Accesorios de Sistemas de purificación de agua",
            "Accesorios de Software de Laboratorio",
            "Accesorios de Tamizadoras",
            "Accesorios de Termobloques",
            "Accesorios de Termostatos",
            "Accesorios de Viscosímetros",
            "Accesorios Sistemas de extracción de ADN-ARN y purificación de proteínas",
            "Liofilizadores con trampa de enfriamiento",
        ],
        "Agitadores de Laboratorio": [
            "Agitadores de Laboratorio",
            "Agitadores de Hélice",
            "Agitadores de Incubación",
            "Agitadores de Laboratorio",
            "Agitadores de Microplacas",
            "Agitadores de Rodillos",
            "Agitadores de Varillas",
            "Agitadores Magnéticos",
            "Agitadores Orbitales",
            "Agitadores Oscilantes",
            "Agitadores Recíprocos",
            "Agitadores Rotativos",
            "Agitadores Térmicos",
            "Agitadores Vortex",
        ],
        "Analizadores de alimentos": [
            "Analizadores de alimentos",
            "Determinadores de Fibra",
            "Determinadores de Fósforo",
            "Determinadores de Grasa",
            "Determinadores de Proteínas",
            "Digestores de Laboratorio",
        ],
        "Analizadores de Gases": [
            "Analizadores de Gases",
            "Analizadores de gases para concentraciones de O 2 y CO 2",
            "Analizadores de gases para medición de O 2 y CO 2",
        ],
        "Analizadores de Texturas": ["Analizadores de Texturas"],
        "Autoclaves de laboratorio": [
            "Autoclaves de laboratorio",
            "Autoclaves de Mesa",
            "Autoclaves Horizontales",
            "Autoclaves Vertical",
            "Esterilizadores a Vapor Sin Presión",
        ],
        "Balanzas de laboratorio": [
            "Balanzas de laboratorio",
            "Balanzas Analíticas",
            "Balanzas Antiexplosión",
            "Balanzas Colgantes",
            "Balanzas Contadoras",
            "Balanzas de Bolsillo",
            "Balanzas de Densidad",
            "Balanzas de Humedad",
            "Balanzas de Joyeria",
            "Balanzas de laboratorio",
            "Balanzas de Mesa",
            "Balanzas de Piso",
            "Balanzas de Precisión",
            "Balanzas de Quilates",
            "Balanzas Escolares",
            "Balanzas Mecánicas",
            "Balanzas para bebés y niños pequeños",
            "Balanzas para Paqueteria",
            "Balanzas Semi-Micro",
            "Balanzas Triple Brazo",
            "Báscula Contadora",
            "Básculas de Transpaletas",
            "Microbalanzas",
        ],
        "Baños de Laboratorio": [
            "Baños de Laboratorio",
            "Baños de Aceite para Laboratorio",
            "Baños de Ebullición",
            "Baños de Flotación",
            "Baños de Laboratorio",
            "Baños María Con Agitación",
            "Baños Maria Con Agitador Magnético",
            "Baños María Refrigerada",
            "Baños Maria Sin Agitación",
            "Baños María Sin Agitación",
        ],
        "Baños Ultrasónicos": [
            "Baños Ultrasónicos",
            "Baños Ultrasónicos Análogos",
            "Baños Ultrasónicos Digitales",
            "Baños Ultrasónicos Industriales",
            "Baños Ultrasónicos Profesionales",
        ],
        "Biorreactores": [
            "Biorreactores",
            "Biorreactores personales",
            "Fotobiorreactores",
            "Paquetes de Modelo Control",
            "Paquetes de Recipientes",
            "Sistema de Flujo",
        ],
        "Bombas y compresores de Laboratorio": [
            "Bombas y compresores de Laboratorio",
            "Bombas de Vacío",
            "Bombas de Vacío con Transmisión por Correa",
            "Bombas de Vacío de Diafragma",
            "Bombas de Vacío de Paletas Rotativas",
            "Bombas de Vacío seca",
            "Bombas de Vacío Sin Aceite",
            "Bombas Peristáltica",
            "Controlador de Vacío",
        ],
        "Buretas y Dispensadores": [
            "Buretas y Dispensadores",
            "Buretas Digitales",
            "Dispensadores de Laboratorio",
        ],
        "Cabinas de Ventilación de Laboratorio": [
            "Cabinas de Ventilación de Laboratorio",
            "Cabinas de Flujo Horizontal",
            "Cabinas de Flujo Laminar",
            "Cabinas de Flujo Laminar UV de ADN/ARN",
            "Cabinas de Flujo Vertical",
            "Cabinas de Seguridad Biológica",
        ],
        "Calorímetros": [
            "Calorímetros",
            "Calorímetros automáticos",
            "Calorímetros de Chaqueta Estática",
            "Sistemas de Descomposición",
        ],
        "Cámaras Climáticas de Laboratorio": [
            "Cámaras Climáticas de Laboratorio",
            "Cámaras Climáticas",
            "Cámaras Climáticas Visitables",
            "Cámaras De Calentamiento",
            "Cámaras de Choque Térmico",
            "Cámaras de Estabilidad",
            "Cámaras de Pruebas Ambientales",
            "Estantes de Crecimiento de Plantas",
        ],
        "Campanas Extractoras": ["Campanas Extractoras", "Depurador de Gases"],
        "Centrífugas": [
            "Centrífugas",
            "Centrífuga clínicas de baja velocidad",
            "Centrífugas",
            "Centrífugas Automatizadas",
            "Centrífugas de alta velocidad y gran capacidad",
            "Centrífugas de Mesa",
            "Centrífugas Multipropósito",
            "Centrífugas Pequeñas",
            "Microcentrífugas",
        ],
        "Certificados De Calibración Acreditado": [
            "Certificados De Calibración Acreditado",
            "Calibración acreditada de balanza analítica",
            "Calibración Acreditado de Agitadores de Hélice",
            "Calibración Acreditado de Agitadores de Incubación",
            "Calibración Acreditado de Agitadores de Microplacas",
            "Calibración Acreditado de Agitadores de Rodillos",
            "Calibración Acreditado de Agitadores Magnéticos",
            "Calibración Acreditado de Agitadores Oscilantes",
            "Calibración Acreditado de Agitadores Recíprocos",
            "Calibración Acreditado de Baños de Ebullición",
            "Calibración Acreditado de Baños María",
            "Calibración Acreditado de Cámaras Climáticas",
        ],
        "Certificados De Calibración Trazable": [
            "Certificados De Calibración Trazable",
            "Calibración Trazable de Agitadores de Hélice",
            "Calibración Trazable de Agitadores de Incubación",
            "Calibración Trazable de Agitadores de Microplacas",
            "Calibración Trazable de Agitadores de Rodillos",
            "Calibración Trazable de Agitadores Magnéticos",
            "Calibración Trazable de Agitadores Orbitales",
            "Calibración Trazable de Agitadores Oscilantes",
            "Calibración Trazable de Agitadores Rotativos",
            "Calibración Trazable de Agitadores Térmicos",
            "Calibración Trazable de Agitadores Vortex",
            "Calibración Trazable de Analizador de Texturas",
            "Calibración Trazable de Autoclaves",
            "Calibración Trazable de Baños de Ebullición",
            "Calibración Trazable de Baños María",
            "Calibración Trazable de Baños Ultrasónicos",
            "Calibración Trazable de Cabinas de Flujo Laminar",
            "Calibración Trazable de Calorímetros",
            "Calibración Trazable de Centrífugas",
            "Calibración Trazable de Congeladores",
            "Calibración Trazable de Densímetros",
            "Calibración Trazable de Dispersores",
            "Calibración Trazable de Espectroscopios",
            "Calibración Trazable de Estufas",
            "Calibración Trazable de Fotómetros",
            "Calibración Trazable de Incubadoras",
            "Calibración Trazable de Microscopios",
            "Calibración Trazable de Pipetas",
            "Calibración Trazable de Placas de Calentamiento",
            "Calibración Trazable de Refractómetros",
            "Calibración Trazable de Refrigeradores",
            "Calibración Trazable de Reómetros",
            "Calibración Trazable de Rotavapores",
            "Calibración Trazable de Termobloques",
            "Calibración Trazable de Viscosímetros",
            "Certificado de Calibración Trazable de Balanza Analítica",
        ],
        "Congeladores de laboratorio": [
            "Congeladores de laboratorio",
            "Congeladoras de laboratorio de convección forzada",
            "Congeladoras de laboratorio de convección natural",
            "Ultra Congeladores de Laboratorio",
        ],
        "Consumibles de Laboratorio": [
            "Consumibles de Laboratorio",
            "Consumibles de analizadores de alimentos",
            "Consumibles de Balanzas",
            "Consumibles de Baño Ultrasónico",
            "Consumibles de Baños Maria",
            "Consumibles de Cabinas de Flujo Laminar",
            "Consumibles de Cabinas de Ventilación de Laboratorio",
            "Consumibles de Calorímetros",
            "Consumibles de Cámaras Climáticas de Laboratorio",
            "Consumibles de Campanas Extractoras",
            "Consumibles de Centrífugas",
            "Consumibles de Congeladores de laboratorio",
            "Consumibles de Destiladores de Agua",
            "Consumibles de Esterilizadores",
            "Consumibles de Esterilizadores de laboratorio",
            "Consumibles de Fotómetro de llama",
            "Consumibles de Incubadoras de Laboratorio",
            "Consumibles de Instrumentos Analíticos",
            "Consumibles de Laboratorio",
            "Consumibles de Medidores de punto de fusión",
            "Consumibles de Pipetas",
            "Consumibles de Refractómetros",
            "Consumibles de Refrigeradores de Laboratorio",
            "Consumibles de Sistemas de extracción de ADN-ARN y purificación de proteínas",
            "Consumibles de Termostatos",
            "Consumibles de Viscosímetros",
        ],
        "Contadores de Colonias": [
            "Contadores de Colonias",
            "Contadores de Colonias Automático",
            "Contadores de Colonias Manual",
        ],
        "Criostatos": ["Criostatos", "Criostatos con Agitador Magnético"],
        "Densímetros": [
            "Densímetros",
            "Densímetros automático",
            "Densímetros manual",
            "Densímetros semiautomática",
        ],
        "Destiladores de Agua": [
            "Destiladores de Agua",
            "Destiladores automático de agua",
            "Destiladores de Amoníaco",
            "Sistemas de purificación de agua",
        ],
        "Dispersores de laboratorios": [
            "Dispersores de laboratorios",
            "Dispersores a Escala de Laboratorio",
            "Dispersores de Escala Piloto",
            "Dispersores en Linea",
            "Sistemas Desechables",
        ],
        "Electroquímica": [
            "Electroquímica",
            "Kit de electroquímica",
            "Sistema de detección",
        ],
        "Equipos de seguridad": ["Equipos de seguridad", "Cabina de Guantes"],
        "Espectrofotómetros": ["Espectrofotómetros", "Espectrofotómetro"],
        "Espectroscopía": [
            "Espectroscopía",
            "Espectrómetros de Fluorescencia",
            "Espectrómetros XRF de mano",
        ],
        "Espectroscopios": [
            "Espectroscopios",
            "Espectroscopio de Kirchhoff-Bunsen",
            "Espectroscopios portátil con Escala",
            "Espectroscopios portátil sin Escala",
            "Goniómetros y Espectrómetros",
        ],
        "Esterilizadores de laboratorio": [
            "Esterilizadores de laboratorio",
            "Esterilizadores de Convección Forzada",
            "Esterilizadores de Convección Natural",
            "Esterilizadores por Infrarrojo",
            "Esterilizadores por Llama",
            "Mecheros Bunsen",
        ],
        "Estufas de Laboratorio": [
            "Estufas de Laboratorio",
            "Estufas de Convección Forzada",
            "Estufas de Convección Natural",
            "Estufas de Secado",
            "Estufas de Vacío",
            "Horno de Secado de Alta Temperatura",
            "Horno de Secado de Limpieza",
            "Hornos de secado",
        ],
        "Evaporadores o Concentradores de Muestras": [
            "Evaporadores o Concentradores de Muestras",
            "Concentradores de Nitrógeno",
        ],
        "Extracción en Fase Sólida": [
            "Extracción en Fase Sólida",
            "Sistema automático",
        ],
        "Fotómetros": [
            "Fotómetros",
            "Fotómetros de llama automática",
            "Fotómetros de llama básico",
            "Fotómetros de microplacas",
            "Fotómetros Portátiles",
        ],
        "Generadores de Laboratorio": [
            "Generadores de Laboratorio",
            "Generadores de Ozono",
            "Generadores Eléctricos",
        ],
        "Homogenizador de laboratorio": ["Homogenizador de laboratorio"],
        "Hornos": [
            "Hornos",
            "Hornos de convección forzada",
            "Hornos de Convección Natural",
            "Hornos de Fusión por Inducción",
            "Hornos de Mufla",
        ],
        "Incubadoras de Laboratorio": [
            "Incubadoras de Laboratorio",
            "Cultivos Anaeróbico",
            "Incubadora de Plaquetas",
            "Incubadoras con Agitación",
            "Incubadoras de Co2",
            "Incubadoras de Convección Aire Forzado",
            "Incubadoras de Convección Natural",
            "Incubadoras de Laboratorio",
            "Incubadoras Económicas",
            "Incubadoras Para Cultivos",
            "Incubadoras Refrigeradas",
        ],
        "Instrumentos Analíticos": [
            "Instrumentos Analíticos",
            "Electroanalizadores",
            "Medidor de pH",
            "Medidores de Aceite",
            "Medidores de Calcio",
            "Medidores de Conductividad",
            "Medidores de Fluoruro",
            "Medidores de Nitrato",
            "Medidores de ORP",
            "Medidores de Oxígeno Disuelto",
            "Medidores de Potasio",
            "Medidores de Salinidad",
            "Medidores de Sodio",
            "Medidores Multiparamétricos",
            "Sistemas de Ensayo de Desintegración",
            "Sondas y Sensores",
            "Unidades de Control",
        ],
        "Lámparas de análisis UV": ["Lámparas de análisis UV"],
        "Lavadores de microplacas": ["Lavadores de microplacas"],
        "Limpiadores a vapor": [
            "Limpiadores a vapor",
            "Limpiadores a vapor Básico",
            "Limpiadores a vapor Industrial",
        ],
        "Liofilizadores para laboratorio": [
            "Liofilizadores para laboratorio",
            "Cámara de Secado para Liofilizador",
            "Liofilizadores con trampa de enfriamiento",
            "Liofilizadores de Mesa",
            "Liofilizadores para laboratorio",
            "Liofilizadores Piloto",
            "Liofilizadores sin CFC",
            "Secadoras de Hielo",
        ],
        "Máquina de limpieza de relojes": [
            "Máquina de limpieza de relojes",
            "Máquina de limpieza Automático de relojes",
            "Máquina de limpieza Manual de relojes",
        ],
        "Maquinas Laser": [
            "Maquinas Laser",
            "Máquinas de Marcado Láser UV",
            "Maquinas Láser de Diodo",
            "Maquinas Laser de Fibra",
        ],
        "Materiales de Laboratorio": [
            "Materiales de Laboratorio",
            "Buretas Automáticas",
            "Condensadores",
            "Crisoles",
            "Desecadores",
            "Embudos",
            "Frascos de Bureta",
            "Frascos de Laboratorio",
            "Frascos de lavado",
            "Jarras Medidoras de Laboratorio",
            "Llaves de paso",
            "Matraces Aforados",
            "Matraces de Erlenmeyer",
            "Matraces Esférico de Fondo Plano",
            "Matraces Esféricos",
            "Matraces Kjeldahl",
            "Microburetas",
            "Pipetas Automática Kipp",
            "Pipetas Pasteur",
            "Pipetas Volumétricas",
            "Probetas",
            "Sistemas de extracción",
            "Tapones",
            "Tubos de Centrífuga",
            "Tubos De Ensayo",
            "Vasos Precipitados",
        ],
        "Medidores de punto de fusión": [
            "Medidores de punto de fusión",
            "Medidores de punto de fusión automáticos",
            "Medidores de punto de fusión semiautomáticos",
        ],
        "Mezcladores de Laboratotio": [
            "Mezcladores de Laboratotio",
            "Mezcladores Digitales",
        ],
        "Microscopios": [
            "Microscopios",
            "Microscopios Binoculares",
            "Microscopios de vídeo",
            "Microscopios Digitales",
            "Microscopios Estereoscópicos",
            "Microscopios Invertidos",
            "Microscopios metalúrgicos",
            "Microscopios Monocular",
            "Microscopios Trinocular",
        ],
        "Mobiliarios de laboratorio": [
            "Mobiliarios de laboratorio",
            "Cajoneras de laboratorio",
            "Escritorios de laboratorio",
            "Estación de Lavado",
            "Gabinetes de Seguridad",
        ],
        "Molinos": [
            "Molinos",
            "Cámaras de Molienda",
            "Molino en Linea",
            "Molinos de Lotes",
            "Sistema Desechables",
        ],
        "Molinos de Laboratorio": [
            "Molinos de Laboratorio",
            "Molinos de Bolas",
            "Molinos de Discos",
            "Molinos de Martillos",
            "Molinos Tipo Wiley",
        ],
        "Pesas Patrón": [
            "Pesas Patrón",
            "Pesas Patrón de Clase ASTM",
            "Pesas Patrón de Clase OIML E",
            "Pesas Patrón de Clase OIML F",
            "Pesas Patrón de Clase OIML M",
        ],
        "Pipetas de Laboratorio": [
            "Pipetas de Laboratorio",
            "Aspiradores de Pipetas",
            "Cargadores de Pipetas",
            "Pipetas Monocanal - Volumen Fijo",
            "Pipetas Monocanal - Volumen Variable",
            "Pipetas Multicanal - Volumen Variable",
        ],
        "Placas de Calentamiento": [
            "Placas de Calentamiento",
            "Controladores de temperatura",
            "Placas Calefactoras",
        ],
        "Polarímetros": [
            "Polarímetros",
            "Polarímetros Automático",
            "Polarímetros Automáticos",
            "Polarímetros Económico",
            "Polarímetros Manuales",
            "Polarímetros profesional",
        ],
        "Reactores de Alta Viscosidad": [
            "Reactores de Alta Viscosidad",
            "Reactores de Laboratorio",
            "Reactores de Laboratorio Compactos",
        ],
        "Reactores de Síntesis": [
            "Reactores de Síntesis",
            "Sistemas Advanced",
            "Sistemas Starter",
        ],
        "Refractómetros": [
            "Refractómetros",
            "Refractómetro de mano",
            "Refractómetros Abbe",
            "Refractómetros de proceso",
            "Refractómetros digital de mano",
            "Refractómetros Digitales",
        ],
        "Refrigeradores de Laboratorio": [
            "Refrigeradores de Laboratorio",
            "Congeladoras de laboratorio de convección forzada",
            "Congeladoras de laboratorio de convección natural",
            "Maquinas de Hielo",
            "Refrigerador Portátil",
            "Refrigeradores de Bancos de Sangre",
            "Refrigeradores de Laboratorio",
            "Refrigeradores Medicos",
        ],
        "Reómetros": ["Reómetros", "Reómetros Rotacional"],
        "Rotavapores": [
            "Rotavapores",
            "Evaporador Rotativo de Elevación Automático",
            "Evaporador Rotativo de Elevación Manual",
            "Sistema Automático con Bomba de Vacío",
            "Sistema Completo",
            "Sistemas de Aspiración",
        ],
        "Servicio de Mantenimiento Equipos de Laboratorio": [
            "Servicio de Mantenimiento Equipos de Laboratorio",
            "Mantenimiento Preventivo y/o Reparación de Baños de Ebullición",
            "Mantenimiento Preventivo y/o Reparación de Baños María",
            "Servicio de mantenimiento preventivo y/o correctivo de balanza analítica",
        ],
        "Sistemas de extracción de ADN-ARN y purificación de proteínas": [
            "Sistemas de extracción de ADN-ARN y purificación de proteínas",
            "Sistemas de PCR",
        ],
        "Sistemas de Histotecnología": [
            "Sistemas de Histotecnología",
            "Micrótomos",
        ],
        "Sistemas de Limpieza UV": ["Sistemas de Limpieza UV"],
        "Software de Laboratorio": [
            "Software de Laboratorio",
            "Software de Balanzas",
            "Software de Baños Termostáticos de Circulación",
            "Software de calibración de pipetas",
            "Software de Cámaras Climáticas",
            "Software de Control y Evaluación para Calorímetros",
            "Software de Incubadoras",
            "Software de Medición, Control y Regulación",
            "Software de Viscosímetro",
        ],
        "Tamizadora": ["Tamizadora"],
        "Tamizadores": ["Tamizadores"],
        "Termobloques": [
            "Termobloques",
            "Calentadores de Bloque Seco",
            "Calentamiento y Refrigeración de Bloques seco",
        ],
        "Termostatos de Laboratorio": [
            "Termostatos de Laboratorio",
            "Baños de Calibración",
            "Baños de viscosidad",
            "Baños termostáticos con Agitación Magnética",
            "Baños Termostáticos con Agitación Orbital",
            "Baños Termostáticos con Agitación Vaivén",
            "Baños Termostáticos de Circulación",
            "Baños Termostáticos De Circulación Con Refrigeración",
            "Baños Termostáticos para Cata de Aceite",
            "Enfriadores de inmersión",
            "Recirculadores de Laboratorio",
            "Termostatos de Circulación",
        ],
        "Trituradores de Laboratorio": [
            "Trituradores de Laboratorio",
            "Trituradoras",
        ],
        "Viscosímetros": [
            "Viscosímetros",
            "Instrumentos medidores de torque",
            "Viscosímetros",
            "Viscosímetros Industriales",
            "Viscosímetros Portátiles",
            "Viscosímetros Rotacional",
        ],
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            const categoryButton = document.getElementById("category-button");
            const dropdown = document.getElementById("dropdown");
            if (
                categoryButton &&
                !categoryButton.contains(event.target) &&
                dropdown &&
                !dropdown.contains(event.target)
            ) {
                setShowUIElements(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCategoryClick = (categoryIndex) => {
        // Toggle the submenu visibility
        setActiveSubMenu(
            activeSubMenu === categoryIndex ? null : categoryIndex
        );
    };
    return (
        <>
            <Head title="EquinLab" />

            <div>
                <header className="bg-white">
                    <div className="container mx-auto flex items-center px-8 py-8 md:px-12 max-w-full">
                        {/* Logo */}
                        <div className="mr-auto w-2/12 flex-shrink-0 sm:w-1/12 md:w-1/6 pr-4 ml-10">
                            <img
                                className="w-full object-contain"
                                src="/img/logo2.jpg"
                                alt="EquinLab Logo"
                            />
                        </div>

                        {/* Input de búsqueda centrado */}
                        <div className="mx-auto flex w-full max-w-lg items-center rounded-md bg-gray-100 xl:max-w-2xl">
                            <input
                                className="w-full border-l border-gray-300 bg-transparent py-2 pl-4 text-sm font-semibold"
                                type="text"
                                placeholder="Buscar ..."
                            />
                            <svg
                                className="ml-auto h-5 px-4 text-gray-500"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="far"
                                data-icon="search"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"
                                ></path>
                            </svg>
                        </div>

                        {/* Contacto */}
                        <div
                            className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52 pl-4 mr-20"
                            id="contactos"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icon-tabler-phone"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                            </svg>

                            <div className="flex flex-col">
                                <div
                                    className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52"
                                    id="redes-sociales"
                                >
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"24px"}
                                        height={"24px"}
                                    >
                                        <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 448 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 576 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <CartIcon />
                    </div>
                </header>

                <div
                    className="min-w-screen min-h-screen bg-gray-200"
                    style={{ marginTop: "-20px" }}
                >
                    <div className="rounded bg-white px-5 py-3 shadow-xl pb-5">
                        <div className="-mx-1 flex items-center justify-between">
                            <ul className="flex h-10 w-full flex-wrap items-center">
                                <li className="relative block">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded bg-[#0c2249] px-4 leading-10 text-white no-underline transition-colors duration-100 hover:no-underline"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowUIElements(!showUIElements);
                                        }}
                                        id="category-button"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiLayersOutline} />
                                            </svg>
                                        </span>
                                        <span>Categorias</span>
                                        <span className="ml-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiChevronDown} />
                                            </svg>
                                        </span>
                                    </a>
                                    {showUIElements && (
                                        <div
                                            className="absolute left-0 top-auto z-30 mt-1 w-56 min-w-full rounded border border-gray-300 bg-white text-sm shadow-md"
                                            id="dropdown"
                                        >
                                            <span className="absolute left-0 top-0 -mt-1 ml-6 h-3 w-3 rotate-45 transform border bg-white"></span>
                                            <div className="relative z-10 w-full rounded bg-white py-1">
                                                <ul className="list-reset">
                                                    {categoriasArray.map(
                                                        (categoria, index) => (
                                                            <li
                                                                key={index}
                                                                className="relative block"
                                                            >
                                                                <a
                                                                    href="#"
                                                                    onClick={() =>
                                                                        handleCategoryClick(
                                                                            categoria
                                                                        )
                                                                    } // Toggle subcategories on click
                                                                    className="flex w-full cursor-pointer items-start px-4 py-2 no-underline transition-colors duration-100 hover:bg-gray-100 hover:no-underline"
                                                                >
                                                                    <span>
                                                                        {" "}
                                                                        {
                                                                            categoria
                                                                        }
                                                                    </span>
                                                                    <span className="ml-2">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            width="16"
                                                                            height="16"
                                                                        >
                                                                            <path
                                                                                d={
                                                                                    mdiChevronRight
                                                                                }
                                                                            />
                                                                        </svg>
                                                                    </span>
                                                                </a>

                                                                {/* Subcategorías */}
                                                                {activeSubMenu ===
                                                                    categoria && (
                                                                    <ul className="absolute left-full top-0 mt-0 w-48 bg-white border border-gray-300 rounded shadow-md">
                                                                        {subcategoriasArray[
                                                                            categoria
                                                                        ].map(
                                                                            (
                                                                                subcategoria,
                                                                                subIndex
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        subIndex
                                                                                    }
                                                                                    className="text-sm text-gray-700 hover:bg-slate-200 px-3 py-2 shadow-sm transition-all"
                                                                                >
                                                                                    <a href="#">
                                                                                        {
                                                                                            subcategoria
                                                                                        }
                                                                                    </a>
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </li>
                                <li className="relative hidden md:block ">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:bg-gray-100 hover:no-underline"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiGauge} />
                                            </svg>
                                        </span>
                                        <span>Inicio</span>
                                        <span className="ml-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiChevronDown} />
                                            </svg>
                                        </span>
                                    </a>
                                </li>

                                <li className="relative  hidden md:block">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:bg-gray-100 hover:no-underline"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiWidgetsOutline} />
                                            </svg>
                                        </span>
                                        <span>Contactenos</span>
                                    </a>
                                </li>
                            </ul>
                            <div className="ml-10 flex flex-row items-center gap-4 sm:flex md:w-28 xl:w-32">
                                <select
                                    name="moneda"
                                    id="moneda"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="sol">Soles</option>
                                    <option value="dollar">Dolares</option>
                                    <option value="euro">Euros</option>
                                </select>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "5px",
                                    marginLeft: "20px",
                                    borderColor: "#d1d5db",
                                    border: "1px solid",
                                    padding: "5px",
                                    borderRadius: "5px",
                                    backgroundColor: "#f3f4f6",
                                    alignItems: "center",
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="icon icon-tabler icons-tabler-outline icon-tabler-git-compare"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                    <path d="M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                    <path d="M11 6h5a2 2 0 0 1 2 2v8" />
                                    <path d="M14 9l-3 -3l3 -3" />
                                    <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />
                                    <path d="M10 15l3 3l-3 3" />
                                </svg>
                                <h4>Comparador</h4>
                            </div>
                        </div>
                    </div>
                    <main className="mt-0 w-full">
                        <Slider />

                        <section className="flex flex-col md:flex-row relative">
                            <div className="bg-[#0c2249] md:w-1/2 p-4 md:p-8 flex flex-col gap-4 mt-10 text-white relative z-0">
                                <h3 className="text-3xl font-bold pt-12">
                                    Equipos de laboratorio
                                </h3>
                                <p className="text-xl pr-36 pb-24">
                                    Los equipos de laboratorio son instrumentos
                                    utilizados para llevar a cabo experimentos,
                                    análisis y estudios en diferentes
                                    disciplinas científicas. Algunos equipos de
                                    laboratorio incluyen microscopios,
                                    espectrofotómetros, balanzas de laboratorio,
                                    centrífugas, autoclaves, agitadores
                                    magnéticos, incubadoras, pipetas, y sistemas
                                    de cromatografía, entre muchos otros. Cada
                                    equipo tiene su propia utilidad y está
                                    diseñado para manipular muestras y realizar
                                    mediciones con precisión. Estos instrumentos
                                    son esenciales para la investigación
                                    científica, el desarrollo de productos, el
                                    control de calidad y el análisis en una
                                    amplia gama de campos, como la biología, la
                                    química, la física, la medicina, la
                                    ingeniería y las ciencias ambientales.
                                </p>
                            </div>
                            <div
                                id="image"
                                className="md:w-7/12 absolute top-32 right-0 z-10"
                            >
                                <img
                                    src="https://megaequipamiento.com/wp-content/uploads/2023/09/desarrollo-de-proyectos-2.webp"
                                    alt="Equipos de laboratorio"
                                />
                            </div>
                        </section>
                      {/* ------------- */}
                      <Sectores />
                   
                      {/* ------------- */}
                      <Categorias_cuadrado />
                    </main>
                    <footer className="py-16 text-center text-sm text-black dark:text-white/70"></footer>
                </div>
            </div>
        </>
    );
}
