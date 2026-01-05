
import React, { useMemo } from 'react';
import { dataService } from '../services/dataService';
import type { ViewState } from '../types';
import { Status } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CollectionViewProps {
  collectionId: number;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collectionId, setView }) => {
  const { isAdmin } = useAuth();

  const collection = useMemo(() => {
    return dataService.getCollections().find(c => c.id === collectionId);
  }, [collectionId]);

  const works = useMemo(() => 
    dataService.getWorks()
      .filter(w => w.collectionId === collectionId && w.status === Status.Published)
      .filter(w => isAdmin || !w.isHidden)
      .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [collectionId, isAdmin]
  );
  
  if (!collection) {
    return (
        <div className="text-center py-16 px-6 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-2xl font-semibold text-gray-200">合辑未找到</h3>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <header>
            <h2 className="text-4xl font-extrabold text-white mb-2">{collection.name}</h2>
            <p className="text-lg text-gray-400">作者：{collection.author}</p>
        </header>

      {works.length > 0 ? (
        <div className="space-y-4">
          {works.map((work, index) => (
            <div 
              key={work.id}
              onClick={() => setView({ page: 'detail', workId: work.id })}
              className="bg-gray-900 p-4 rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-300 cursor-pointer border border-gray-800 flex items-baseline gap-4"
            >
                <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-300">{work.title}</h3>
                    <p className="text-sm text-gray-500">发布于 {new Date(work.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-2xl font-semibold text-gray-200">空空如也</h3>
          <p className="text-gray-400 mt-2">该合辑下暂无作品。</p>
        </div>
      )}
    </div>
  );
};
