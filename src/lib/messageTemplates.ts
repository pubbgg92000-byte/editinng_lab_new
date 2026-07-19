/**
 * Default WhatsApp messages and supported {{placeholders}}.
 * Each studio can edit its saved copy from Settings without changing code.
 */
export const legacyAssignmentTemplate = `Hello {{editor_name}},

{{studio_name}} assigned you work for {{project}} ({{customer}}).

{{task_list}}

Open your private work portal:
{{portal_link}}

Please update progress and submit the output link from the portal.`;

export const legacyInvoiceTemplate = `{{studio_name}}
{{studio_address}}{{studio_phone_line}}{{gstin_line}}

Bill: {{invoice_number}}
Customer: {{customer}}
Project: {{project}}
Event: {{event}}
Delivery: {{delivery_date}}

Total: {{total}}
Paid / Advance: {{paid}}
Balance: {{balance}}

{{payment_note}}{{invoice_footer_line}}

View your work status and bill:
{{portal_link}}`;

export const defaultAssignmentTemplate = `🎬 *New editing work from {{studio_name}}*

Hello {{editor_name}},

📁 *Project:* {{project}}
🏢 *Customer studio:* {{customer}}

*Assigned tasks*
{{task_list}}

🔐 *Open your private editor portal*
{{portal_link}}

Inside the portal you can view task details and source files, update status and progress, add the edited video duration, and submit the final Drive/delivery link.

Thank you — {{studio_name}}`;

export const defaultInvoiceTemplate = `✨ *{{studio_name}} — Project update & invoice*
{{studio_address}}{{studio_phone_line}}{{gstin_line}}

🏢 *Customer studio:* {{customer}}
🧾 *Invoice:* {{invoice_number}}
🎞️ *Project:* {{project}}
🎉 *Event:* {{event}}
📅 *Delivery:* {{delivery_date}}

💰 *Billing summary*
Total: {{total}}
Paid / advance: {{paid}}
Balance due: {{balance}}

{{payment_note}}{{invoice_footer_line}}

🔐 *Open your private customer portal*
{{portal_link}}

You can view every order, task progress, and all generated invoices in the portal. Open an invoice to print it or save it as PDF.`;

export function fillTemplate(template: string, values: Record<string, string>) {
	return Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{{${key}}}`, value), template);
}
