
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginIcon } from './icons/LoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ADMIN_USERNAME } from '../constants';
import { dataService } from '../services/dataService';
// FIX: Import WorkType enum for runtime usage.
import type { ViewState } from '../types';
import { WorkType } from '../types';

interface HeaderProps {
    setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const Header: React.FC<HeaderProps> = ({ setView }) => {
    const { user, login, logout, register } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [signature, setSignature] = useState(dataService.getSignature());

    useEffect(() => {
        const handleUpdate = () => {
             setSignature(dataService.getSignature());
        };
        window.addEventListener('storageUpdated', handleUpdate);
        return () => window.removeEventListener('storageUpdated', handleUpdate);
    }, []);

    const handleAuthAction = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        let success = false;
        if (isRegistering) {
            if (username.trim().length < 3 || password.trim().length < 6) {
                setError("用户名需3位以上，密码需6位以上。");
                return;
            }
            success = register(username, password);
            if (!success) setError('用户名已被占用。');
        } else {
            success = login(username, password);
            if (!success) setError('用户名或密码无效。');
        }

        if (success) {
            if (username === ADMIN_USERNAME) {
                setView({ page: 'admin', workId: null });
            }
            setUsername('');
            setPassword('');
            setIsDropdownOpen(false);
        }
    };
    
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
        <header className="w-full py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-y-6 text-center">
                {/* Left: Site Title */}
                <div className="md:text-left">
                    {/* FIX: Use WorkType.Novel instead of the string "novel". */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider cursor-pointer" onClick={() => setView({page: WorkType.Novel, workId: null})}>忘却录</h1>
                    <p className="mt-2 text-sm text-gray-500 italic whitespace-pre-wrap">
                        {signature}
                    </p>
                </div>

                {/* Center: Author Name */}
                <div className="md:text-center flex justify-center items-baseline">
                    <span className="text-sm text-gray-400 opacity-75 mr-2">作者</span>
                    <h2 className="text-3xl md:text-4xl text-white font-fancy">虫狼L.S.Crow</h2>
                </div>
                
                {/* Right: Auth UI */}
                <div className="md:text-right flex justify-center md:justify-end">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-300">欢迎, <span className="font-semibold">{user.username}</span></span>
                            <button onClick={logout} className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                                <LogoutIcon />
                                <span>退出</span>
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <button onClick={toggleDropdown} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                                登录 / 注册
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 z-10">
                                    <form onSubmit={handleAuthAction} className="space-y-3">
                                        <h2 className="text-lg font-semibold text-center text-white">{isRegistering ? '注册' : '登录'}</h2>
                                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700 text-white" required />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-800 border-gray-700 text-white" required />
                                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                                        <button type="submit" className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                                            <LoginIcon />
                                            {isRegistering ? '注册' : '登录'}
                                        </button>
                                        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="w-full text-xs text-center text-gray-400 hover:underline">
                                            {isRegistering ? '已有账户？立即登录' : "没有账户？立即注册"}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};