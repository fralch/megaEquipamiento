import React from "react";
import useSecciones from "@/hooks/useSecciones";
import SectionsNavRail from "@/Components/home/SectionsNavRail";

export default function SectionsFloatingMenu({ onSelectSeccion, selectedId }) {
    const { secciones, loading } = useSecciones();

    if (loading || secciones.length === 0) return null;

    return (
        <SectionsNavRail
            secciones={secciones}
            onSelect={onSelectSeccion}
            selectedId={selectedId}
        />
    );
}
