// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}

	interface DatabaseResult<T = unknown> {
		success: boolean;
		results?: T[];
		meta?: { changes?: number; last_row_id?: number };
	}

	interface DatabasePreparedStatement {
		bind(...values: unknown[]): DatabasePreparedStatement;
		first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
		all<T = Record<string, unknown>>(): Promise<DatabaseResult<T>>;
		run<T = Record<string, unknown>>(): Promise<DatabaseResult<T>>;
	}

	interface AppDatabase {
		prepare(query: string): DatabasePreparedStatement;
		batch<T = unknown>(statements: DatabasePreparedStatement[]): Promise<DatabaseResult<T>[]>;
	}
}

export {};
