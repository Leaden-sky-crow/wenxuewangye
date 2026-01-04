
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import type { Work, Comment, ViewState } from '../types';
import { Status } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface AdminPanelProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

const ReviewCard: React.FC<{
  item: Work | Comment;
  type: 'work' | 'comment';
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onView?: (id: number) => void;
}> = ({ item, type, onApprove, onReject, onView }) => {
  const isWork = (item: Work | Comment): item is Work => type === 'work';
  const title = isWork(item) ? item.title : `对《${dataService.getWorks().find(w => w.id === item.workId)?.title || '未知作品'}》的评论`;

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">{title}</h4>
          {isWork(item) ? (
            <p className="text-sm text-gray-400">作者：{item.author} / 提交者：{item.submittedBy}</p>
          ) : (
            <p className="text-sm text-gray-400">作者：{item.author}</p>
          )}
        </div>
        {onView && (
            <button onClick={() => onView(isWork(item) ? item.id : item.workId)} className="text-sm text-gray-400 hover:underline">
              查看内容
            </button>
        )}
      </div>
      <p className="mt-2 p-3 bg-gray-800 rounded text-sm italic">
          "{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}"
      </p>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => onApprove(item.id)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-md transition-colors"
        >
          通过
        </button>
        <button
          onClick={() => onReject(item.id)}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-md transition-colors"
        >
          拒绝
        </button>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ setView }) => {
  const { isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const pendingWorks = useMemo(() => dataService.getWorks().filter(w => w.status === Status.Pending), [refreshKey]);
  const pendingComments = useMemo(() => dataService.getComments().filter(c => c.status === Status.Pending), [refreshKey]);

  const handleAction = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleApproveWork = (id: number) => { dataService.updateWorkStatus(id, Status.Published); handleAction(); };
  const handleRejectWork = (id: number) => { dataService.deleteWork(id); handleAction(); };
  const handleApproveComment = (id: number) => { dataService.updateCommentStatus(id, Status.Published); handleAction(); };
  const handleRejectComment = (id: number) => { dataService.deleteComment(id); handleAction(); };

  if (!isAdmin) {
    return <div className="text-center p-8"><p className="text-xl text-red-500">访问被拒绝。</p></div>;
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-extrabold text-white">管理面板</h2>
      
      <section id="upload-section">
        <h3 className="text-2xl font-bold mb-4">上传作品区</h3>
         <button
            onClick={() => setView({ page: 'submit', workId: null })}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
         >
            <PlusIcon className="h-6 w-6" />
            <span className="text-lg font-semibold">上传新作品</span>
        </button>
      </section>

      <section id="review-section" className="space-y-8">
        <h3 className="text-2xl font-bold">待审核区</h3>
        <div>
          <h4 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">待审核作品 ({pendingWorks.length})</h4>
          {pendingWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWorks.map(work => (
                <ReviewCard key={work.id} item={work} type="work" onApprove={handleApproveWork} onReject={handleRejectWork} onView={(id) => setView({ page: 'detail', workId: id })} />
              ))}
            </div>
          ) : <p className="text-gray-400">没有等待审核的作品。</p>}
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">待审核评论 ({pendingComments.length})</h4>
          {pendingComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingComments.map(comment => (
                <ReviewCard 
                    key={comment.id}
                    item={comment}
                    type="comment"
                    onApprove={handleApproveComment}
                    onReject={handleRejectComment}
                    onView={() => setView({ page: 'detail', workId: comment.workId })}
                />
              ))}
            </div>
          ) : <p className="text-gray-400">没有等待审核的评论。</p>}
        </div>
      </section>
    </div>
  );
};
