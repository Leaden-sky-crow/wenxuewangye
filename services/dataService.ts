
import type { User, Work, Comment } from '../types';
import { Role, WorkType, Status } from '../types';
import { ADMIN_USERNAME } from '../constants';

// WARNING: This is a simple mock for password hashing.
// In a real application, NEVER store passwords in localStorage and always use a secure, server-side hashing algorithm.
const simpleHash = (str: string) => btoa(str);

const updateLastEdited = () => {
    localStorage.setItem('lastEdited', new Date().toISOString());
    window.dispatchEvent(new Event('storageUpdated'));
};

const initData = () => {
    if (!localStorage.getItem('users')) {
        const adminUser: User = { id: 1, username: ADMIN_USERNAME, passwordHash: simpleHash('Leadenskycrow912'), role: Role.Admin };
        const regularUser: User = { id: 2, username: 'user', passwordHash: simpleHash('user123'), role: Role.User };
        localStorage.setItem('users', JSON.stringify([adminUser, regularUser]));
    }
    // Clear initial data
    if (!localStorage.getItem('works_initialized')) {
        localStorage.setItem('works', JSON.stringify([]));
        localStorage.setItem('works_initialized', 'true');
    }
    if (!localStorage.getItem('comments_initialized')) {
        localStorage.setItem('comments', JSON.stringify([]));
        localStorage.setItem('comments_initialized', 'true');
    }
};

const getItems = <T,>(key: string): T[] => {
    try {
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage`, error);
        return [];
    }
};

const setItems = <T,>(key: string, items: T[]) => {
    localStorage.setItem(key, JSON.stringify(items));
};

initData();

export const dataService = {
    getUsers: () => getItems<User>('users'),
    getWorks: () => getItems<Work>('works').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getComments: () => getItems<Comment>('comments'),
    getLastEdited: () => localStorage.getItem('lastEdited'),

    addUser: (username: string, password_raw: string): User | null => {
        const users = dataService.getUsers();
        if (users.some(u => u.username === username)) {
            return null; // Username already exists
        }
        const newUser: User = {
            id: Date.now(),
            username,
            passwordHash: simpleHash(password_raw),
            role: Role.User
        };
        setItems('users', [...users, newUser]);
        return newUser;
    },

    addWork: (work: Omit<Work, 'id' | 'createdAt'>): Work => {
        const works = dataService.getWorks();
        const newWork: Work = { ...work, id: Date.now(), createdAt: new Date().toISOString() };
        setItems('works', [...works, newWork]);
        updateLastEdited();
        return newWork;
    },

    addComment: (comment: Omit<Comment, 'id' | 'createdAt'>): Comment => {
        const comments = dataService.getComments();
        const newComment: Comment = { ...comment, id: Date.now(), createdAt: new Date().toISOString() };
        setItems('comments', [...comments, newComment]);
        updateLastEdited();
        return newComment;
    },
    
    updateWorkStatus: (id: number, status: Status) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === id ? { ...w, status } : w);
        setItems('works', works);
        updateLastEdited();
    },

    updateCommentStatus: (id: number, status: Status) => {
        let comments = dataService.getComments();
        comments = comments.map(c => c.id === id ? { ...c, status } : c);
        setItems('comments', comments);
        updateLastEdited();
    },

    deleteWork: (id: number) => {
        let works = dataService.getWorks();
        works = works.filter(w => w.id !== id);
        setItems('works', works);
        updateLastEdited();
    },

    deleteComment: (id: number) => {
        let comments = dataService.getComments();
        comments = comments.filter(c => c.id !== id);
        setItems('comments', comments);
        updateLastEdited();
    },
    
    findUser: (username: string, password_raw: string): User | undefined => {
        const users = dataService.getUsers();
        return users.find(u => u.username === username && u.passwordHash === simpleHash(password_raw));
    }
};
