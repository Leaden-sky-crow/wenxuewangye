
import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';
import { Status, WorkType } from '../types';
import type { ViewState } from '../types';
import { PinIcon } from './icons/PinIcon';
import { StarIcon } from './icons/StarIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { PencilIcon } from './icons/PencilIcon';

interface WorkDetailProps {
  workId: number;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({ workId, setView }) => {
  const { user, isAdmin } = useAuth();
  const [comment, setComment] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); 

  const work = useMemo(() => {
    const foundWork = dataService.getWorks().find(w => w.id === workId);
    if (foundWork && foundWork.isHidden && !isAdmin) {
      return undefined;
    }
    return foundWork;
  }, [workId, forceUpdate, isAdmin]);
  
  const comments = useMemo(() =>
    dataService.getComments().filter(c => c.workId === workId && c.status === Status.Published)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
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
            <button onClick={() => setView({ page: WorkType.Novel, workId: null })} className="mt-4 text-gray-400 hover:underline">
                返回首页
            </button>
        </div>
    );
  }
  
  const isAuthor = user?.username === work.author || user?.username === work.submittedBy;

  return (
    <div className="bg-gray-900 p-6 sm:p-10 rounded-lg shadow-lg border border-gray-800">
      <article>
        <header className="mb-12 border-b border-gray-800 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-grow">
              <h1 className="text-[31px] font-extrabold text-white mb-6 leading-tight flex items-center gap-3 flex-wrap">
                {work.isPinned && <PinIcon className="h-8 w-8 text-blue-400" title="置顶" />}
                {work.isFeatured && <StarIcon className="h-8 w-8 text-yellow-400" title="加精" />}
                {work.isHidden && <EyeOffIcon className="h-8 w-8 text-gray-500" title="已隐藏" />}
                <span>{work.title}</span>
              </h1>
              <div className="space-y-2">
                <p className="text-xl text-gray-400">作者：<span className="font-semibold text-gray-300">{work.author}</span></p>
                {!work.isPersonal && (
                  <p className="text-lg text-gray-500">
                    投稿者：<span className="font-semibold">{work.submittedBy}</span>
                  </p>
                )}
                <p className="text-lg text-gray-500">
                  发布于 {new Date(work.createdAt).toLocaleDateString()}
                </p>
                {work.hasPendingEdit && (
                    <p className="text-sm italic text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-md inline-block">
                        此作品有待审核的修改
                    </p>
                )}
              </div>
            </div>
             {isAuthor && !work.hasPendingEdit && (
                  <button 
                      onClick={() => setView({ page: 'submit', workId: work.id })}
                      className="flex items-center gap-2 self-start bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                      <PencilIcon className="h-4 w-4" />
                      修改
                  </button>
              )}
          </div>
        </header>
        
        <div className="prose max-w-none whitespace-pre-wrap mb-20 text-[21px] leading-loose text-gray-300 font-serif">
          {work.content}
        </div>
      </article>

      <section className="mt-16 pt-10 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-6">评论区 ({comments.length})</h2>
        <div className="space-y-6">
          {comments.length > 0 ? comments.map(c => (
            <div key={c.id} className="p-5 bg-gray-800 rounded-xl">
              <p className="text-gray-200 text-xl leading-relaxed">{c.content}</p>
              <p className="text-base text-gray-500 mt-3 text-right">
                - {c.author} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          )) : <p className="text-gray-400 text-xl italic">暂无评论。快来分享你的想法吧！</p>}
        </div>

        <div className="mt-10">
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <h3 className="text-2xl font-semibold">发表评论</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="分享你的想法..."
                rows={4}
                className="w-full p-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700 placeholder-gray-500"
                required
              />
              <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 text-lg">
                提交审核
              </button>
            </form>
          ) : (
            <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-xl mt-6">
              <p className="text-gray-300 text-xl">
                请先
                <button onClick={() => alert('请通过页面右上角登录后发表评论。')} className="text-gray-400 font-semibold hover:underline px-2">
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
