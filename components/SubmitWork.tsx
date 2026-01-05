
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { Status, WorkType, workTypeToChinese } from '../types';
import type { ViewState, Collection } from '../types';
import { ADMIN_USERNAME } from '../constants';

interface SubmitWorkProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
  workToEditId?: number | null;
}

export const SubmitWork: React.FC<SubmitWorkProps> = ({ setView, workToEditId }) => {
  const { user, isAdmin } = useAuth();
  const isEditMode = !!workToEditId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<WorkType>(WorkType.Novel);
  const [isPersonal, setIsPersonal] = useState(false);

  // Collection state
  const [addToCollection, setAddToCollection] = useState(false);
  const [collectionMode, setCollectionMode] = useState<'existing' | 'new'>('existing');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [userCollections, setUserCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (isEditMode) {
      const workToEdit = dataService.getWorks().find(w => w.id === workToEditId);
      if (workToEdit) {
        setTitle(workToEdit.title);
        setContent(workToEdit.content);
        setExcerpt(workToEdit.excerpt || '');
        setAuthor(workToEdit.author);
        setCategory(workToEdit.category);
        setIsPersonal(workToEdit.isPersonal);
        // Disable collection editing for now to keep it simple
        setAddToCollection(false);
      }
    }
  }, [isEditMode, workToEditId]);

  useEffect(() => {
    if (user) {
      const collections = dataService.getCollections().filter(c => c.author === user.username);
      setUserCollections(collections);
      if (collections.length > 0) {
        setSelectedCollectionId(String(collections[0].id));
      } else {
        setCollectionMode('new');
      }
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    if (isEditMode) {
        dataService.submitWorkEdit(workToEditId, { title, content, excerpt });
        alert('您的修改已提交审核。');
        setView({ page: 'detail', workId: workToEditId });
        return;
    }

    const workIsPersonal = isAdmin && isPersonal;
    const status = workIsPersonal ? Status.Published : Status.Pending;
    const finalAuthor = workIsPersonal ? ADMIN_USERNAME : (author.trim() || user.username);
    const submittedBy = user.username;

    let collectionId: number | null = null;
    let collectionName: string | null = null;

    if (addToCollection) {
        if (collectionMode === 'new' && newCollectionName.trim()) {
            const newCollection = dataService.addCollection(newCollectionName.trim(), user.username);
            collectionId = newCollection.id;
            collectionName = newCollection.name;
        } else if (collectionMode === 'existing' && selectedCollectionId) {
            collectionId = parseInt(selectedCollectionId, 10);
            collectionName = userCollections.find(c => c.id === collectionId)?.name || null;
        }
    }
    
    dataService.addWork({
      title,
      content,
      excerpt,
      author: finalAuthor,
      submittedBy,
      category,
      isPersonal: workIsPersonal,
      status,
      collectionId,
      collectionName
    });

    alert(status === Status.Published ? '您的作品已成功发布！' : '您的作品已提交审核。');
    
    setView({ page: workIsPersonal ? category : 'community', workId: null });
  };
  
  if (!user) {
      return (
          <div className="text-center p-8 bg-gray-900 rounded-lg shadow-md border border-gray-800">
              <p className="text-xl">请登录后操作。</p>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-white">{isEditMode ? '修改作品' : '分享你的故事'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">标题</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700" required />
        </div>
        {!isEditMode && (
          <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">作者名 (选填)</label>
              <input id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={`默认为您的用户名: ${user.username}`} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700" disabled={isAdmin && isPersonal} />
          </div>
        )}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">正文</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={15} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700" required />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-1">推荐语 (选填)</label>
          <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={5} placeholder="粘贴一段最吸引人的段落，将在作品列表页展示..." className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700" />
        </div>
        
        {!isEditMode && (
          <>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">栏目</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as WorkType)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700">
                  {Object.values(WorkType).map(cat => (<option key={cat} value={cat}>{workTypeToChinese[cat]}</option>))}
              </select>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg space-y-4">
                <div className="flex items-center">
                    <input id="addToCollection" type="checkbox" checked={addToCollection} onChange={(e) => setAddToCollection(e.target.checked)} className="h-4 w-4 text-gray-500 bg-gray-800 border-gray-600 rounded focus:ring-gray-600" />
                    <label htmlFor="addToCollection" className="ml-2 block text-sm font-medium text-gray-300">加入合辑</label>
                </div>
                {addToCollection && (
                    <div className="pl-6 space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center"><input type="radio" value="existing" checked={collectionMode === 'existing'} onChange={() => setCollectionMode('existing')} disabled={userCollections.length === 0} className="mr-2" />选择已有</label>
                            <label className="flex items-center"><input type="radio" value="new" checked={collectionMode === 'new'} onChange={() => setCollectionMode('new')} className="mr-2" />创建新的</label>
                        </div>
                        {collectionMode === 'existing' ? (
                            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-800 border-gray-700" disabled={userCollections.length === 0}>
                                {userCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        ) : (
                            <input type="text" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} placeholder="新合辑名称" className="w-full p-3 border rounded-lg bg-gray-800 border-gray-700" />
                        )}
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="flex items-center">
                    <input id="isPersonal" type="checkbox" checked={isPersonal} onChange={(e) => setIsPersonal(e.target.checked)} className="h-4 w-4 text-gray-500 bg-gray-800 border-gray-600 rounded focus:ring-gray-600" />
                    <label htmlFor="isPersonal" className="ml-2 block text-sm text-gray-300">作为个人作品发布 (仅管理员)</label>
                </div>
            )}
          </>
        )}
        <div className="text-right">
            <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md">
                {isEditMode ? '提交修改' : (isAdmin && isPersonal) ? '立即发布' : '提交审核'}
            </button>
        </div>
      </form>
    </div>
  );
};
