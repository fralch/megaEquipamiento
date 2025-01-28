-- Insertar datos de ejemplo en la tabla `productos`
INSERT INTO productos (
    sku,
    nombre,
    id_subcategoria,
    marca_id,
    pais,
    precio_sin_ganancia,
    precio_ganancia,
    precio_igv,
    imagen,
    descripcion,
    video,
    envio,
    soporte_tecnico,
    caracteristicas,
    datos_tecnicos,
    documentos,
    created_at,
    updated_at
) VALUES
-- Equipo Médico 1
(
    'EQMED001',
    'Monitor de Signos Vitales',
    1,
    1,
    'Alemania',
    1500.00,
    2000.00,
    2240.00,
    'https://example.com/images/monitor-vitales.jpg',
    'Monitor avanzado para la medición de signos vitales en tiempo real.',
    'https://example.com/videos/monitor-vitales.mp4',
    'Envío especializado',
    'Mantenimiento incluido por 2 años',
    JSON_OBJECT(
        'pantalla', '10 pulgadas',
        'resolucion', '1280x720',
        'modos_medicion', 'ECG, SpO2, Presión Arterial'
    ),
    JSON_OBJECT(
        'peso', '3kg',
        'dimensiones', '30x20x15 cm',
        'fuente_energia', 'Batería recargable 12h'
    ),
    JSON_ARRAY('manual_uso.pdf', 'especificaciones_tecnicas.pdf'),
    NOW(),
    NOW()
),

-- Equipo Médico 2
(
    'EQMED002',
    'Ventilador Mecánico',
    2,
    2,
    'Estados Unidos',
    10000.00,
    15000.00,
    16800.00,
    'https://example.com/images/ventilador-mecanico.jpg',
    'Sistema de soporte respiratorio con modos avanzados para UCI.',
    'https://example.com/videos/ventilador-mecanico.mp4',
    'Transporte especializado con seguro',
    'Capacitación técnica incluida',
    JSON_OBJECT(
        'modos_ventilacion', 'VCV, PCV, SIMV',
        'pantalla', '15 pulgadas táctil',
        'alarmas', 'Personalizables'
    ),
    JSON_OBJECT(
        'peso', '15kg',
        'dimensiones', '50x40x30 cm',
        'alimentacion', 'Corriente alterna 110-240V'
    ),
    JSON_ARRAY('manual_configuracion.pdf', 'poliza_garantia.pdf'),
    NOW(),
    NOW()
),

-- Equipo Médico 3
(
    'EQMED003',
    'Electrocardiógrafo',
    3,
    3,
    'Japón',
    3000.00,
    4500.00,
    5040.00,
    'https://example.com/images/electrocardiografo.jpg',
    'Equipo portátil para análisis de electrocardiogramas de 12 derivaciones.',
    'https://example.com/videos/electrocardiografo.mp4',
    'Envío estándar',
    'Suscripción a actualizaciones de software por 1 año',
    JSON_OBJECT(
        'derivaciones', '12',
        'papel', 'A4 térmico',
        'conectividad', 'USB, WiFi'
    ),
    JSON_OBJECT(
        'peso', '5kg',
        'dimensiones', '35x25x10 cm',
        'bateria', '8 horas de autonomía'
    ),
    JSON_ARRAY('manual_tecnico.pdf', 'certificacion_iso.pdf'),
    NOW(),
    NOW()
);
