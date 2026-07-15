import { env } from '$env/dynamic/private';
export async function sendWhatsApp(to: string, template: string, parameters: string[]) {
	if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) return { sent: false, mode: 'demo' as const };
	const response = await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: parameters.map((text) => ({ type: 'text', text })) }] } }) });
	if (!response.ok) throw new Error(`WhatsApp notification failed: ${response.status}`);
	return { sent: true, mode: 'live' as const };
}
