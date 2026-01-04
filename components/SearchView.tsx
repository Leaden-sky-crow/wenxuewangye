
import React, { useMemo } from 'react';
import { dataService } from '../services/dataService';
import type { ViewState } from '../types';
import { Status } from '../types';

interface SearchViewProps {
  query: string;
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

export const SearchView: React.FC<SearchViewProps> = ({ query, setView }) => {
  const works = useMemo(() => {
    if (!query) return [];
    return dataService.getWorks().filter(w => 
      w.isPersonal && 
      w.status === Status.Published && 
      w.title.toLowerCase().includes(query.toLowerCase())
    )
  }, [query]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white">搜索结果: "<span className="italic">{query}</span>"</h2>
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
          <h3 className="text-2xl font-semibold text-gray-200">未找到结果</h3>
          <p className="text-gray-400 mt-2">没有找到标题包含 "{query}" 的个人作品。</p>
        </div>
      )}
    </div>
  );
};
