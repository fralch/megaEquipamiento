import React from 'react';

const ProductTabs = ({ tabs, activeTab, handleTabChange }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
                <nav className="-mb-px flex min-w-max px-3 sm:px-5 gap-2 sm:gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={` 
                                flex-shrink-0 whitespace-nowrap h-11 px-3 sm:px-4 border-b-2 font-medium 
                                text-sm sm:text-base transition-colors duration-200
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default ProductTabs;
