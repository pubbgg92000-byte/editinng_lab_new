import { error } from '@sveltejs/kit'; import { orders } from '$lib/data';
export const load = ({ params }) => { const order=orders.find(o=>o.id===params.id); if(!order) error(404,'Order not found'); return { order }; };
