
import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import type { ViewState, WorkType } from '../types';
import { Status, workTypeToChinese } from '../types';

interface CommunityViewProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

const WorkCard: React.FC<{
    title: string;
    author: string;
    contentSnippet: string;
    onClick: () => void;
}> = ({ title, author, contentSnippet, onClick }) => (
    <div onClick={onClick} className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-800">
        <h3 className="text-xl font-bold text-gray-300 hover:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">作者：{author}</p>
        <p className="text-gray-300 leading-relaxed">{contentSnippet}...</p>
    </div>
);

const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        }`}
    >
        {children}
    </button>
);

export const CommunityView: React.FC<CommunityViewProps> = ({ setView }) => {
    const [activeCategory, setActiveCategory] = useState<WorkType>('novel');
    
    const works = useMemo(() => 
        dataService.getWorks().filter(w => !w.isPersonal && w.category === activeCategory && w.status === Status.Published),
        [activeCategory]
    );

    const categories = Object.keys(workTypeToChinese) as WorkType[];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-4xl font-extrabold text-white mb-4">共创</h2>
                <nav className="flex space-x-2 border-b border-gray-800 pb-2">
                    {categories.map(cat => (
                        <TabButton 
                            key={cat}
                            isActive={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {workTypeToChinese[cat]}
                        </TabButton>
                    ))}
                </nav>
            </header>
            
            {works.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {works.map(work => (
                        <WorkCard 
                            key={work.id}
                            title={work.title}
                            author={work.author}
                            contentSnippet={work.content.substring(0, 150)}
                            onClick={() => setView({ page: 'detail', workId: work.id })}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-gray-900 rounded-lg border border-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-200">尚无回响</h3>
                    <p className="text-gray-400 mt-2">该分类下还没有人分享故事，来成为第一位吧！</p>
                </div>
            )}
        </div>
    );
};
