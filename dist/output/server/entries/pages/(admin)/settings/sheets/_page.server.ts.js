import { r as readSheetValues } from "../../../../../chunks/googleSheets.js";
import { i as orders, n as editors, t as customers } from "../../../../../chunks/data.js";
//#region src/routes/(admin)/settings/sheets/+page.server.ts
var definitions = [
	{
		name: "Customers",
		columns: [
			"Customer ID",
			"Name",
			"Business",
			"Phone",
			"Email",
			"Projects",
			"Pending"
		],
		demo: customers.map((c) => [
			c.id,
			c.name,
			c.business,
			c.phone,
			c.email,
			c.projects,
			c.pending
		])
	},
	{
		name: "Orders",
		columns: [
			"Order ID",
			"Customer",
			"Project",
			"Work type",
			"Files",
			"Due date",
			"Price",
			"Status"
		],
		demo: orders.map((o) => [
			o.id,
			o.customer,
			o.project,
			o.workType,
			o.files,
			o.due,
			o.price,
			o.status
		])
	},
	{
		name: "Tasks",
		columns: [
			"Task ID",
			"Order ID",
			"Task",
			"Editor",
			"Due date",
			"Progress",
			"Status"
		],
		demo: orders.flatMap((o) => o.tasks.map((t) => [
			t.id,
			o.id,
			t.name,
			t.assignee,
			t.due,
			`${t.progress}%`,
			t.status
		]))
	},
	{
		name: "Editors",
		columns: [
			"Editor ID",
			"Name",
			"Speciality",
			"Phone",
			"Active tasks",
			"Availability"
		],
		demo: editors.map((e) => [
			e.id,
			e.name,
			e.specialty,
			e.phone,
			e.activeTasks,
			e.available ? "Available" : "At capacity"
		])
	},
	{
		name: "Invoices",
		columns: [
			"Invoice ID",
			"Order ID",
			"Customer",
			"Project",
			"Total",
			"Paid",
			"Balance",
			"Status"
		],
		demo: orders.map((o) => [
			`INV-${o.id.slice(-4)}`,
			o.id,
			o.customer,
			o.project,
			o.price,
			o.paid,
			o.price - o.paid,
			o.paid === o.price ? "Paid" : o.paid ? "Partially paid" : "Unpaid"
		])
	},
	{
		name: "Payments",
		columns: [
			"Payment ID",
			"Invoice ID",
			"Customer",
			"Amount",
			"Date",
			"Method"
		],
		demo: orders.filter((o) => o.paid > 0).map((o, i) => [
			`PAY-00${i + 1}`,
			`INV-${o.id.slice(-4)}`,
			o.customer,
			o.paid,
			"15 Jul 2026",
			i % 2 ? "UPI" : "Bank transfer"
		])
	},
	{
		name: "Activity Logs",
		columns: [
			"Time",
			"Action",
			"Entity",
			"Details"
		],
		demo: [
			[
				"15 Jul, 11:42",
				"Task updated",
				"TSK-102",
				"Colour correction · 70%"
			],
			[
				"14 Jul, 16:08",
				"Task approved",
				"TSK-101",
				"Culling approved by admin"
			],
			[
				"12 Jul, 14:10",
				"Order assigned",
				"ORD-2026-0041",
				"Editors notified on WhatsApp"
			]
		]
	},
	{
		name: "Settings",
		columns: ["Key", "Value"],
		demo: [
			["Studio name", "Arvind Studio"],
			["Google Sheets sync", "Demo mode"],
			["WhatsApp notifications", "Demo mode"],
			["Default currency", "INR"]
		]
	}
];
var load = async () => {
	const liveResults = await Promise.all(definitions.map(async (sheet) => {
		try {
			return await readSheetValues(sheet.name);
		} catch {
			return null;
		}
	}));
	return {
		live: liveResults.some((result) => result !== null),
		sheets: definitions.map((sheet, index) => {
			const values = liveResults[index];
			if (values && values.length > 0) return {
				name: sheet.name,
				columns: values[0].map(String),
				rows: values.slice(1).map((row) => row.map(String))
			};
			return {
				name: sheet.name,
				columns: sheet.columns,
				rows: sheet.demo.map((row) => row.map(String))
			};
		})
	};
};
//#endregion
export { load };
