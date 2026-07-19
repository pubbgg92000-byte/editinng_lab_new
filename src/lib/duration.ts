// Convert editor-friendly duration text into integer minutes before billing.
export function parseVideoDurationMinutes(value: unknown) {
	// Accept editor-friendly values such as 1:30, 1.5 hr, or 30 min and store minutes.
	const input = String(value || '').trim().toLowerCase().replace(',', '.');
	if (!input) return 0;

	const clock = input.match(/^(\d+)\s*:\s*([0-5]?\d)$/);
	if (clock) return Number(clock[1]) * 60 + Number(clock[2]);

	const combined = input.match(/^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\s*(?:(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes))?$/);
	if (combined) return Math.round(Number(combined[1]) * 60 + Number(combined[2] || 0));

	const minutes = input.match(/^(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)$/);
	if (minutes) return Math.round(Number(minutes[1]));

	const plain = Number(input);
	return Number.isFinite(plain) && plain >= 0 ? Math.round(plain) : Number.NaN;
}

export function formatVideoDuration(minutesInput: unknown) {
	const minutes = Math.max(0, Math.round(Number(minutesInput) || 0));
	if (!minutes) return '';
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;
	if (!hours) return `${remainder} min`;
	return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function durationBillableAmount(rateInput: unknown, minutesInput: unknown) {
	// Duration bill = hourly rate × video minutes ÷ 60, rounded to paise.
	const rate = Math.max(0, Number(rateInput) || 0);
	const minutes = Math.max(0, Number(minutesInput) || 0);
	return Math.round(rate * minutes / 60 * 100) / 100;
}
