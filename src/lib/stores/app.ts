import { writable } from 'svelte/store';
import { customers as initialCustomers, orders as initialOrders } from '$lib/data';
import type { Customer, Order, TaskStatus } from '$lib/types';

export const orderStore = writable<Order[]>(structuredClone(initialOrders));
export const customerStore = writable<Customer[]>(structuredClone(initialCustomers));
export const sidebarOpen = writable(false);
export function updateTaskStatus(orderId: string, taskId: string, status: TaskStatus, progress: number) {
	orderStore.update((orders) => orders.map((order) => order.id !== orderId ? order : { ...order, tasks: order.tasks.map((task) => task.id === taskId ? { ...task, status, progress } : task) }));
}
