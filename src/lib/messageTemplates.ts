export const defaultAssignmentTemplate = `Hello {{editor_name}},

{{studio_name}} assigned you work for {{project}} ({{customer}}).

{{task_list}}

Open your private work portal:
{{portal_link}}

Please update progress and submit the output link from the portal.`;

export const defaultInvoiceTemplate = `{{studio_name}}
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

Track your work status:
{{portal_link}}`;

export function fillTemplate(template: string, values: Record<string, string>) {
	return Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{{${key}}}`, value), template);
}
