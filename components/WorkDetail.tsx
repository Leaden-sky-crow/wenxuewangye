
import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';
import { Status } from '../types';
import type { ViewState } from '../types';

interface WorkDetailProps {
  workId: number;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({ workId, setView }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); 

  const work = useMemo(() => dataService.getWorks().find(w => w.id === workId), [workId]);
  
  const comments = useMemo(() =>
    dataService.getComments().filter(c => c.workId === workId && c.status === Status.Published)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workId, forceUpdate]
  );
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    dataService.addComment({
      workId: workId,
      content: comment,
      author: user.username,
      status: Status.Pending,
    });

    setComment('');
    setForceUpdate(f => f + 1);
    alert('您的评论已提交审核。');
  };

  if (!work) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold">作品未找到</h2>
            <button onClick={() => setView({ page: 'novel', workId: null })} className="mt-4 text-gray-400 hover:underline">
                返回首页
            </button>
        </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg border border-gray-800">
      <article>
        <header className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{work.title}</h1>
          <p className="text-md text-gray-400">作者：<span className="font-semibold">{work.author}</span></p>
           {!work.isPersonal && (
            <p className="text-sm text-gray-500 mt-1">
              投稿者：<span className="font-semibold">{work.submittedBy}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            发布于 {new Date(work.createdAt).toLocaleDateString()}
          </p>
        </header>
        <div className="prose prose-lg prose-invert max-w-none whitespace-pre-wrap">
          {work.content}
        </div>
      </article>

      <section className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-6">评论区</h2>
        <div className="space-y-6">
          {comments.length > 0 ? comments.map(c => (
            <div key={c.id} className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-200">{c.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                - {c.author} 发布于 {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          )) : <p className="text-gray-400">暂无评论。快来分享你的想法吧！</p>}
        </div>

        <div className="mt-8">
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold">发表评论</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700"
                required
              />
              <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                提交审核
              </button>
            </form>
          ) : (
            <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-300">
                请先
                <button onClick={() => alert('请通过页面右上角登录后发表评论。')} className="text-gray-400 font-semibold hover:underline px-1">
                  登录
                </button>
                后分享你的想法。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
