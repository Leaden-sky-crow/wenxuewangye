
import type { User, Work, Comment, Collection } from '../types';
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
    if (!localStorage.getItem('collections_initialized')) {
        localStorage.setItem('collections', JSON.stringify([]));
        localStorage.setItem('collections_initialized', 'true');
    }
    // Initialize signature
    if (!localStorage.getItem('site_signature')) {
        localStorage.setItem('site_signature', '“All those moments will be lost...in time, like...tears in rain.”');
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
    
    // Sort logic: Pinned first, then by date descending
    getWorks: () => getItems<Work>('works').sort((a,b) => {
        const aPinned = a.isPinned ? 1 : 0;
        const bPinned = b.isPinned ? 1 : 0;
        if (aPinned !== bPinned) {
            return bPinned - aPinned; // Pinned items come first
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }),
    
    getComments: () => getItems<Comment>('comments'),
    getCollections: () => getItems<Collection>('collections'),
    getLastEdited: () => localStorage.getItem('lastEdited'),
    
    getSignature: () => localStorage.getItem('site_signature') || '',

    updateSignature: (text: string) => {
        localStorage.setItem('site_signature', text);
        updateLastEdited();
    },

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

    addCollection: (name: string, author: string): Collection => {
        const collections = dataService.getCollections();
        const newCollection: Collection = {
            id: Date.now(),
            name,
            author,
            createdAt: new Date().toISOString()
        };
        setItems('collections', [...collections, newCollection]);
        return newCollection;
    },

    addWork: (work: Omit<Work, 'id' | 'createdAt' | 'isPinned' | 'isFeatured' | 'isHidden'>): Work => {
        const works = dataService.getWorks();
        const newWork: Work = { 
            ...work, 
            id: Date.now(), 
            createdAt: new Date().toISOString(),
            isPinned: false,
            isFeatured: false,
            isHidden: false,
        };
        setItems('works', [...works, newWork]);
        updateLastEdited();
        return newWork;
    },
    
    submitWorkEdit: (workId: number, draft: { title: string, content: string, excerpt?: string }) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === workId ? { 
            ...w, 
            hasPendingEdit: true,
            draftTitle: draft.title,
            draftContent: draft.content,
            draftExcerpt: draft.excerpt,
        } : w);
        setItems('works', works);
        updateLastEdited();
    },
    
    approveWorkEdit: (workId: number) => {
        let works = dataService.getWorks();
        works = works.map(w => {
            if (w.id === workId) {
                return {
                    ...w,
                    title: w.draftTitle!,
                    content: w.draftContent!,
                    excerpt: w.draftExcerpt,
                    hasPendingEdit: false,
                    draftTitle: undefined,
                    draftContent: undefined,
                    draftExcerpt: undefined,
                }
            }
            return w;
        });
        setItems('works', works);
        updateLastEdited();
    },

    rejectWorkEdit: (workId: number) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === workId ? { 
            ...w, 
            hasPendingEdit: false,
            draftTitle: undefined,
            draftContent: undefined,
            draftExcerpt: undefined,
        } : w);
        setItems('works', works);
        updateLastEdited();
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

    toggleWorkPin: (id: number) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w);
        setItems('works', works);
        updateLastEdited();
    },

    toggleWorkFeature: (id: number) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === id ? { ...w, isFeatured: !w.isFeatured } : w);
        setItems('works', works);
        updateLastEdited();
    },

    toggleWorkVisibility: (id: number) => {
        let works = dataService.getWorks();
        works = works.map(w => w.id === id ? { ...w, isHidden: !w.isHidden } : w);
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
        
        // Also delete associated comments to prevent orphaned data
        let comments = dataService.getComments();
        comments = comments.filter(c => c.workId !== id);
        setItems('comments', comments);

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
