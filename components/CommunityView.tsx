
import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../services/dataService';
import type { ViewState, WorkType, Work, Collection } from '../types';
import { Status, workTypeToChinese, WorkType as WorkTypeEnum } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PinIcon } from './icons/PinIcon';
import { StarIcon } from './icons/StarIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ExpandableText } from './ExpandableText';

interface CommunityViewProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

type DisplayItem = (Work & { itemType: 'work' }) | (Collection & { itemType: 'collection', works: Work[], latestWorkDate: string });
const isCollection = (item: DisplayItem): item is Collection & { itemType: 'collection', works: Work[], latestWorkDate: string } => item.itemType === 'collection';


const WorkCard: React.FC<{ work: Work; onClick: () => void; }> = ({ work, onClick }) => (
    <div onClick={onClick} className={`bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-800 flex flex-col ${work.isHidden ? 'opacity-70' : ''}`}>
        <h3 className="text-xl font-bold text-gray-300 hover:text-white mb-2 flex items-center gap-2">
            {work.isPinned && <PinIcon className="h-5 w-5 text-blue-400 flex-shrink-0" title="置顶" />}
            {work.isFeatured && <StarIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" title="加精" />}
            {work.isHidden && <EyeOffIcon className="h-5 w-5 text-gray-500 flex-shrink-0" title="已隐藏" />}
            <span>{work.title}</span>
        </h3>
        <p className="text-sm text-gray-400 mb-4">作者：{work.author}</p>
        {work.excerpt ? (
          <ExpandableText text={work.excerpt} maxLength={300} />
        ) : (
          <p className="text-gray-300 leading-relaxed font-serif">{work.content.substring(0, 150)}...</p>
        )}
    </div>
);

const CollectionCard: React.FC<{ collection: Collection & { works: Work[] }; onClick: () => void; }> = ({ collection, onClick }) => (
    <div onClick={onClick} className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-800 relative overflow-hidden flex flex-col">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-300 hover:text-white mb-2 flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{collection.name}</span>
            </h3>
            <p className="text-sm text-gray-400 mb-4">作者：{collection.author}</p>
            <p className="text-gray-300 leading-relaxed font-serif">包含 {collection.works.length} 部作品的合辑。</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 text-right">
             <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">合辑</span>
        </div>
    </div>
);

const TabButton: React.FC<{isActive: boolean; onClick: () => void; children: React.ReactNode;}> = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
        {children}
    </button>
);

export const CommunityView: React.FC<CommunityViewProps> = ({ setView }) => {
    const { isAdmin } = useAuth();
    const [activeCategory, setActiveCategory] = useState<WorkType>(WorkTypeEnum.Novel);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleUpdate = () => setRefreshKey(prev => prev + 1);
        window.addEventListener('storageUpdated', handleUpdate);
        return () => window.removeEventListener('storageUpdated', handleUpdate);
    }, []);
    
    const items = useMemo(() => {
        const works = dataService.getWorks()
            .filter(w => !w.isPersonal && w.category === activeCategory && w.status === Status.Published)
            .filter(w => isAdmin || !w.isHidden);

        const collectionsMap = new Map<number, Collection & { works: Work[] }>();
        const standaloneWorks: Work[] = [];
        const allCollections = dataService.getCollections();

        works.forEach(work => {
          if (work.collectionId) {
            if (!collectionsMap.has(work.collectionId)) {
              const details = allCollections.find(c => c.id === work.collectionId);
              if (details) collectionsMap.set(work.collectionId, { ...details, works: [] });
            }
            collectionsMap.get(work.collectionId)?.works.push(work);
          } else {
            standaloneWorks.push(work);
          }
        });

        const collectionItems: DisplayItem[] = Array.from(collectionsMap.values()).map(c => ({
            ...c,
            itemType: 'collection',
            latestWorkDate: c.works.reduce((latest, current) => new Date(current.createdAt) > new Date(latest) ? current.createdAt : latest, c.works[0].createdAt),
        }));
        
        const workItems: DisplayItem[] = standaloneWorks.map(w => ({ ...w, itemType: 'work' }));
        
        const combined = [...collectionItems, ...workItems];
        return combined.sort((a,b) => new Date(isCollection(b) ? b.latestWorkDate : b.createdAt).getTime() - new Date(isCollection(a) ? a.latestWorkDate : a.createdAt).getTime());
    }, [activeCategory, refreshKey, isAdmin]);

    const categories = Object.keys(workTypeToChinese) as WorkType[];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-4xl font-extrabold text-white mb-4">共创</h2>
                <nav className="flex space-x-2 border-b border-gray-800 pb-2">
                    {categories.map(cat => (<TabButton key={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{workTypeToChinese[cat]}</TabButton>))}
                </nav>
            </header>
            
            {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map(item => 
                        isCollection(item) ? (
                            <CollectionCard key={`col-${item.id}`} collection={item} onClick={() => setView({ page: 'collection', collectionId: item.id, workId: null })} />
                        ) : (
                            <WorkCard key={`work-${item.id}`} work={item} onClick={() => setView({ page: 'detail', workId: item.id })} />
                        )
                    )}
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
