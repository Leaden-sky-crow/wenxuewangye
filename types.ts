
export enum Role {
  Admin = 'admin',
  User = 'user',
}

export enum WorkType {
  Novel = 'novel',
  Prose = 'prose',
  Essay = 'essay',
  Poetry = 'poetry',
}

export const workTypeToChinese = {
  [WorkType.Novel]: '小说',
  [WorkType.Prose]: '散文',
  [WorkType.Essay]: '随笔',
  [WorkType.Poetry]: '诗歌',
};


export enum Status {
  Published = 'published',
  Pending = 'pending',
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: Role;
}

export interface Work {
  id: number;
  title: string;
  content: string;
  author: string;
  submittedBy: string;
  category: WorkType;
  isPersonal: boolean;
  status: Status;
  createdAt: string;
}

export interface Comment {
  id: number;
  workId: number;
  content: string;
  author: string;
  status: Status;
  createdAt: string;
}

export type ViewState = {
  page: WorkType | 'community' | 'detail' | 'submit' | 'admin' | 'search';
  workId: number | null;
  query?: string;
};
