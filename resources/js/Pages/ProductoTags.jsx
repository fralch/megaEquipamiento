import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProductoTagsManagement from '@/Components/ProductoTagsManagement';

export default function ProductoTags({ auth, productos, tags, tagParents, filters }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Tags en Productos</h2>}
        >
            <Head title="Gestión de Tags en Productos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ProductoTagsManagement 
                        initialProductos={productos}
                        initialTags={tags}
                        initialTagParents={tagParents}
                        initialFilters={filters}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}