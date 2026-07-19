import { writable } from 'svelte/store';
import { customers as initialCustomers, editors as initialEditors, orders as initialOrders } from '$lib/data';
import type { Customer, Editor, Order, TaskStatus } from '$lib/types';

// In-browser copies keep lists/search responsive; Neon remains the permanent source.
export const orderStore = writable<Order[]>(structuredClone(initialOrders));
export const customerStore = writable<Customer[]>(structuredClone(initialCustomers));
export const editorStore = writable<Editor[]>(structuredClone(initialEditors));
export const sidebarOpen = writable(false);
export function updateTaskStatus(orderId: string, taskId: string, status: TaskStatus, progress: number) {
	orderStore.update((orders) => orders.map((order) => order.id !== orderId ? order : { ...order, tasks: order.tasks.map((task) => task.id === taskId ? { ...task, status, progress } : task) }));
}
