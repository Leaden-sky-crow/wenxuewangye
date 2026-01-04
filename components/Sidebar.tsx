
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { ViewState } from '../types';
import { WorkType } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { dataService } from '../services/dataService';
import { ADMIN_USERNAME } from '../constants';

interface SidebarProps {
  view: ViewState;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  isDropdown?: boolean;
}> = ({ onClick, isActive, children, isDropdown = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-gray-700 text-white'
        : 'text-gray-300 hover:bg-gray-800'
    } ${isDropdown ? 'relative' : ''}`}
  >
    {children}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  const { user, isAdmin } = useAuth();
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const registeredUsers = dataService.getUsers().filter(u => u.username !== ADMIN_USERNAME);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full flex flex-wrap justify-center items-center gap-x-6 gap-y-4 pb-4 border-b border-gray-800">
      <NavLink onClick={() => setView({ page: WorkType.Novel, workId: null })} isActive={view.page === WorkType.Novel}>
          <span>小说</span>
      </NavLink>
      <NavLink onClick={() => setView({ page: WorkType.Prose, workId: null })} isActive={view.page === WorkType.Prose}>
          <span>散文</span>
      </NavLink>
      <NavLink onClick={() => setView({ page: WorkType.Essay, workId: null })} isActive={view.page === WorkType.Essay}>
          <span>随笔</span>
      </NavLink>
      <NavLink onClick={() => setView({ page: WorkType.Poetry, workId: null })} isActive={view.page === WorkType.Poetry}>
          <span>诗歌</span>
      </NavLink>
      
      <div className="h-4 w-px bg-gray-700"></div>

      <NavLink onClick={() => setView({ page: 'community', workId: null })} isActive={view.page === 'community'}>
          <UsersIcon className="h-4 w-4"/>
          <span>共创</span>
      </NavLink>
      {user && (
        <NavLink onClick={() => setView({ page: 'submit', workId: null })} isActive={view.page === 'submit'}>
          <PlusIcon className="h-4 w-4" />
          <span>我要投稿</span>
        </NavLink>
      )}
      {isAdmin && (
        <>
          <NavLink onClick={() => setView({ page: 'admin', workId: null })} isActive={view.page === 'admin'}>
            <ShieldCheckIcon className="h-4 w-4" />
            <span>管理面板</span>
          </NavLink>
          <div className="relative" ref={dropdownRef}>
            <NavLink onClick={() => setIsUserListOpen(!isUserListOpen)} isActive={isUserListOpen} isDropdown>
              <UsersIcon className="h-4 w-4" />
              <span>注册用户</span>
              <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${ isUserListOpen ? 'rotate-180' : '' }`} />
            </NavLink>
            {isUserListOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {registeredUsers.length > 0 ? (
                    registeredUsers.map(regUser => (
                      <div key={regUser.id} className="text-gray-400 text-sm px-2 py-1 truncate">
                        {regUser.username}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm px-2 py-1 italic">
                      暂无用户
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};
