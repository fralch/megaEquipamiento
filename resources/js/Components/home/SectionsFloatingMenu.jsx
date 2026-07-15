import React from "react";
import useSecciones from "@/hooks/useSecciones";
import SectionsPillBar from "@/Components/home/SectionsPillBar";

export default function SectionsFloatingMenu({ onSelectSeccion, selectedId }) {
    const { secciones, loading } = useSecciones();

    if (loading || secciones.length === 0) return null;

    return (
        <SectionsPillBar
            secciones={secciones}
            onSelect={onSelectSeccion}
            selectedId={selectedId}
        />
    );
}
