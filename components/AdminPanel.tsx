
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import type { Work, Comment, ViewState } from '../types';
import { Status, workTypeToChinese } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { PinIcon } from './icons/PinIcon';
import { StarIcon } from './icons/StarIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface AdminPanelProps {
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

const ActionButtons: React.FC<{onApprove: () => void, onReject: () => void}> = ({ onApprove, onReject }) => (
    <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onApprove} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-md transition-colors">通过</button>
        <button onClick={onReject} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-md transition-colors">拒绝</button>
    </div>
);

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
          <p className="text-sm text-gray-400">作者：{item.author}{isWork(item) && ` / 提交者：${item.submittedBy}`}</p>
        </div>
        {onView && <button onClick={() => onView(isWork(item) ? item.id : item.workId)} className="text-sm text-gray-400 hover:underline">查看内容</button>}
      </div>
      <p className="mt-2 p-3 bg-gray-800 rounded text-sm italic">"{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}"</p>
      <ActionButtons onApprove={() => onApprove(item.id)} onReject={() => onReject(item.id)} />
    </div>
  );
};

const ReviewEditCard: React.FC<{ work: Work; onApprove: (id: number) => void; onReject: (id: number) => void; setView: (view: ViewState) => void; }> = ({ work, onApprove, onReject, setView }) => (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-800">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg">{work.title}</h4>
            <button onClick={() => setView({ page: 'detail', workId: work.id })} className="text-sm text-gray-400 hover:underline">查看原文</button>
        </div>
        <div className="mt-2 space-y-3">
            <div className="p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400 mb-1 font-semibold">修改后标题</p>
                <p className="text-sm">{work.draftTitle}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400 mb-1 font-semibold">修改后内容 (片段)</p>
                <p className="text-sm italic">"{work.draftContent?.substring(0, 100)}..."</p>
            </div>
            {work.draftExcerpt && (
              <div className="p-3 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400 mb-1 font-semibold">修改后推荐语 (片段)</p>
                  <p className="text-sm italic">"{work.draftExcerpt?.substring(0, 100)}..."</p>
              </div>
            )}
        </div>
        <ActionButtons onApprove={() => onApprove(work.id)} onReject={() => onReject(work.id)} />
    </div>
);


export const AdminPanel: React.FC<AdminPanelProps> = ({ setView }) => {
  const { isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [signature, setSignature] = useState(dataService.getSignature());

  const allWorksData = useMemo(() => dataService.getWorks(), [refreshKey]);
  const pendingWorks = allWorksData.filter(w => w.status === Status.Pending);
  const pendingEdits = allWorksData.filter(w => w.hasPendingEdit);
  const pendingComments = useMemo(() => dataService.getComments().filter(c => c.status === Status.Pending), [refreshKey]);

  const handleAction = useCallback(() => { setRefreshKey(prev => prev + 1); }, []);

  const handleUpdateSignature = () => { dataService.updateSignature(signature); alert('个性签名已更新'); };
  const handleApproveWork = (id: number) => { dataService.updateWorkStatus(id, Status.Published); handleAction(); };
  const handleRejectWork = (id: number) => { dataService.deleteWork(id); handleAction(); };
  const handleApproveComment = (id: number) => { dataService.updateCommentStatus(id, Status.Published); handleAction(); };
  const handleRejectComment = (id: number) => { dataService.deleteComment(id); handleAction(); };
  const handleApproveEdit = (id: number) => { dataService.approveWorkEdit(id); handleAction(); };
  const handleRejectEdit = (id: number) => { dataService.rejectWorkEdit(id); handleAction(); };
  const handleTogglePin = (id: number) => { dataService.toggleWorkPin(id); handleAction(); };
  const handleToggleFeature = (id: number) => { dataService.toggleWorkFeature(id); handleAction(); };
  const handleToggleVisibility = (id: number) => { dataService.toggleWorkVisibility(id); handleAction(); };

  if (!isAdmin) {
    return <div className="text-center p-8"><p className="text-xl text-red-500">访问被拒绝。</p></div>;
  }
  
  return (
    <div className="space-y-12">
      <header className="border-b border-gray-800 pb-6"><h2 className="text-4xl font-extrabold text-white">管理面板</h2></header>
      <section id="site-settings" className="pb-8 border-b border-gray-800">
        <h3 className="text-2xl font-bold mb-4">站点设置</h3>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-2xl">
            <label className="block text-sm font-medium text-gray-400 mb-2">个性签名 (Header)</label>
            <div className="flex gap-4">
                <textarea value={signature} onChange={(e) => setSignature(e.target.value)} className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-white resize-y" rows={2} />
                <button onClick={handleUpdateSignature} className="self-start bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">更新</button>
            </div>
        </div>
      </section>
      <section id="upload-section">
        <h3 className="text-2xl font-bold mb-4">快捷操作</h3>
        <button onClick={() => setView({ page: 'submit', workId: null })} className="w-full md:w-auto flex items-center justify-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700">
            <PlusIcon className="h-6 w-6" />
            <span className="text-lg font-semibold">上传新作品</span>
        </button>
      </section>
      <section id="management-section">
        <h3 className="text-2xl font-bold mb-4">作品管理 ({allWorksData.length})</h3>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-800 text-gray-200 uppercase"><tr><th className="px-6 py-3">标题</th><th className="px-6 py-3">作者</th><th className="px-6 py-3">栏目/类型</th><th className="px-6 py-3">状态</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">
                        {allWorksData.map(work => (
                            <tr key={work.id} className={`hover:bg-gray-800 transition-colors ${work.isHidden ? 'opacity-60' : ''}`}>
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                    {work.isPinned && <PinIcon className="h-4 w-4 text-blue-400" title="已置顶" />}
                                    {work.isFeatured && <StarIcon className="h-4 w-4 text-yellow-400" title="已加精" />}
                                    {work.isHidden && <EyeOffIcon className="h-4 w-4 text-gray-500" title="已隐藏" />}
                                    <span className="truncate max-w-xs" title={work.title}>{work.title}</span>
                                </td>
                                <td className="px-6 py-4">{work.author}</td>
                                <td className="px-6 py-4">{workTypeToChinese[work.category]}<span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">{work.isPersonal ? '个人' : '共创'}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${work.status === Status.Published ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{work.status === Status.Published ? '已发布' : '待审核'}</span>
                                    {work.hasPendingEdit && <span className="ml-1 px-2 py-1 rounded text-xs font-bold bg-blue-900 text-blue-300">有修改</span>}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setView({ page: 'detail', workId: work.id })} className="text-blue-400 hover:text-blue-300 transition-colors" title="查看">查看</button>
                                    <button onClick={() => handleTogglePin(work.id)} className={`transition-colors ${work.isPinned ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-300'}`} title={work.isPinned ? "取消置顶" : "置顶"}><PinIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleToggleFeature(work.id)} className={`transition-colors ${work.isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-gray-300'}`} title={work.isFeatured ? "取消加精" : "加精"}><StarIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleToggleVisibility(work.id)} className={`transition-colors ${work.isHidden ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-300'}`} title={work.isHidden ? "设为可见" : "隐藏"}><EyeOffIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                        {allWorksData.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">暂无作品</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      </section>
      <section id="review-section" className="space-y-8 pt-8 border-t border-gray-800">
        <h3 className="text-2xl font-bold">审核中心</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-300">待审核作品 ({pendingWorks.length})</h4>
              {pendingWorks.length > 0 ? (<div className="space-y-4">{pendingWorks.map(work => (<ReviewCard key={work.id} item={work} type="work" onApprove={handleApproveWork} onReject={handleRejectWork} onView={(id) => setView({ page: 'detail', workId: id })} />))}</div>) : <p className="text-gray-500 p-4 bg-gray-900 rounded border border-gray-800">暂无待审核作品</p>}
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-300">待审核评论 ({pendingComments.length})</h4>
              {pendingComments.length > 0 ? (<div className="space-y-4">{pendingComments.map(comment => (<ReviewCard key={comment.id} item={comment} type="comment" onApprove={handleApproveComment} onReject={handleRejectComment} onView={() => setView({ page: 'detail', workId: comment.workId })} />))}</div>) : <p className="text-gray-500 p-4 bg-gray-900 rounded border border-gray-800">暂无待审核评论</p>}
            </div>
            <div className="lg:col-span-2">
              <h4 className="text-xl font-semibold mb-4 text-gray-300">待审核的修改 ({pendingEdits.length})</h4>
              {pendingEdits.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pendingEdits.map(work => (<ReviewEditCard key={work.id} work={work} onApprove={handleApproveEdit} onReject={handleRejectEdit} setView={setView} />))}</div>) : <p className="text-gray-500 p-4 bg-gray-900 rounded border border-gray-800">暂无待审核的修改</p>}
            </div>
        </div>
      </section>
    </div>
  );
};
