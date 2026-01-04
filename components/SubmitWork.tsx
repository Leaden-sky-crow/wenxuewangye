
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { Status, WorkType, workTypeToChinese } from '../types';
import type { ViewState } from '../types';
import { ADMIN_USERNAME } from '../constants';

interface SubmitWorkProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const SubmitWork: React.FC<SubmitWorkProps> = ({ setView }) => {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<WorkType>(WorkType.Novel);
  const [isPersonal, setIsPersonal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    const workIsPersonal = isAdmin && isPersonal;
    const status = workIsPersonal ? Status.Published : Status.Pending;
    const finalAuthor = workIsPersonal ? ADMIN_USERNAME : (author.trim() || user.username);
    const submittedBy = user.username;

    dataService.addWork({
      title,
      content,
      author: finalAuthor,
      submittedBy,
      category,
      isPersonal: workIsPersonal,
      status,
    });

    alert(status === Status.Published ? '您的作品已成功发布！' : '您的作品已提交审核。');
    
    setTitle('');
    setContent('');
    setAuthor('');
    
    setView({ page: workIsPersonal ? category : 'community', workId: null });
  };
  
  if (!user) {
      return (
          <div className="text-center p-8 bg-gray-900 rounded-lg shadow-md border border-gray-800">
              <p className="text-xl">请登录后投稿。</p>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-white">分享你的故事</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            标题
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700"
            required
          />
        </div>
        <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">
                作者名 (选填)
            </label>
            <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={`默认为您的用户名: ${user.username}`}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700"
                disabled={isAdmin && isPersonal}
            />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
            正文
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700"
            required
          />
        </div>
        
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">栏目</label>
            <select 
                id="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value as WorkType)} 
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700"
            >
                {Object.values(WorkType).map(cat => (
                    <option key={cat} value={cat}>{workTypeToChinese[cat]}</option>
                ))}
            </select>
        </div>

        {isAdmin && (
             <div className="flex items-center">
                <input
                    id="isPersonal"
                    type="checkbox"
                    checked={isPersonal}
                    onChange={(e) => setIsPersonal(e.target.checked)}
                    className="h-4 w-4 text-gray-500 bg-gray-800 border-gray-600 rounded focus:ring-gray-600"
                />
                <label htmlFor="isPersonal" className="ml-2 block text-sm text-gray-300">
                    作为个人作品发布 (仅管理员)
                </label>
            </div>
        )}
        <div className="text-right">
            <button
                type="submit"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
            >
                {isAdmin && isPersonal ? '立即发布' : '提交审核'}
            </button>
        </div>
      </form>
    </div>
  );
};
