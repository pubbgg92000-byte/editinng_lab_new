import { error } from '@sveltejs/kit'; import { customers, orders } from '$lib/data';
export const load=({params})=>{const customer=customers.find(c=>c.token===params.token);if(!customer)error(404,'This secure customer link is invalid or has expired.');const customerOrders=orders.filter(o=>o.customer===customer.business);return{customer,orders:customerOrders.length?customerOrders:[orders[0]]}};
