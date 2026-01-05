
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CategoryView } from './components/CategoryView';
import { WorkDetail } from './components/WorkDetail';
import { SubmitWork } from './components/SubmitWork';
import { AdminPanel } from './components/AdminPanel';
import type { ViewState } from './types';
import { WorkType } from './types';
import { Header } from './components/Header';
import { CommunityView } from './components/CommunityView';
import { SearchView } from './components/SearchView';
import { SearchIcon } from './components/icons/SearchIcon';
import { Footer } from './components/Footer';
import { CollectionView } from './components/CollectionView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ page: WorkType.Novel, workId: null });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setView({ page: 'search', workId: null, query });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        handleSearch(searchQuery.trim());
        setSearchQuery('');
    }
  }

  const renderContent = () => {
    switch (view.page) {
      case WorkType.Novel:
      case WorkType.Prose:
      case WorkType.Essay:
      case WorkType.Poetry:
        return <CategoryView category={view.page} setView={setView} />;
      case 'community':
        return <CommunityView setView={setView} />;
      case 'detail':
        return <WorkDetail workId={view.workId!} setView={setView} />;
      case 'submit':
        return <SubmitWork setView={setView} workToEditId={view.workId} />;
      case 'admin':
        return <AdminPanel setView={setView} />;
      case 'search':
        return <SearchView query={view.query || ''} setView={setView} />;
      case 'collection':
        return <CollectionView collectionId={view.collectionId!} setView={setView} />;
      default:
        return <CategoryView category={WorkType.Novel} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col min-h-screen">
        <div className="flex-grow">
          <Header setView={setView} />
          
          <div className="py-8">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mx-auto flex items-center">
              <input
                  type="search"
                  placeholder="搜索个人作品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 text-sm bg-gray-900 border border-gray-700 rounded-l-full focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-colors"
              />
              <button type="submit" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 border-l-0 px-5 py-3 rounded-r-full transition-colors">
                  <SearchIcon className="h-5 w-5 text-white" />
              </button>
            </form>
          </div>

          <Sidebar view={view} setView={setView} />
          <main className="py-8">
            {renderContent()}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
