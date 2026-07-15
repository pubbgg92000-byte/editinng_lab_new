export type OrderStatus = 'Received' | 'Assigned' | 'Editing' | 'Waiting Review' | 'Revision' | 'Ready Delivery' | 'Completed';
export type TaskStatus = 'Not started' | 'Files downloaded' | 'In progress' | 'Waiting for clarification' | 'Ready for review' | 'Revision required' | 'Completed';

export interface Customer { id: string; name: string; business: string; phone: string; email: string; projects: number; pending: number; token: string; }
export interface Editor { id: string; name: string; initials: string; specialty: string; phone: string; activeTasks: number; available: boolean; token: string; }
export interface Task { id: string; name: string; assignee: string; status: TaskStatus; progress: number; due: string; fileCount?: number; instructions?: string; outputLink?: string; }
export interface Order { id: string; project: string; customer: string; workType: string; status: OrderStatus; progress: number; due: string; files: number; fileLink: string; price: number; paid: number; color: string; tasks: Task[]; }
