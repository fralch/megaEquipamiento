import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Tags from '@/Components/create/createTags';

export default function AdminTags({ auth, tags, tagParents }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Tags</h2>}
        >
            <Head title="Gestión de Tags" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tags initialTags={tags} initialTagParents={tagParents} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}