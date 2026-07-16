import type { ThemeMode, ThemePalette } from '$lib/types';

export interface ThemeSelection { palette: ThemePalette; mode: ThemeMode }
export const themePalettes: { id: ThemePalette; name: string; mode: ThemeMode; colors: string[] }[] = [
	{ id: 'graphite-aqua', name: 'Graphite Aqua', mode: 'light', colors: ['#222831', '#393E46', '#00ADB5', '#EEEEEE'] },
	{ id: 'ice-cyan', name: 'Ice Cyan', mode: 'light', colors: ['#71C9CE', '#A6E3E9', '#CBF1F5', '#E3FDFD'] },
	{ id: 'forest-gold', name: 'Forest Gold', mode: 'light', colors: ['#283F24', '#467235', '#FFF78D', '#FFBF00'] },
	{ id: 'lime-cream', name: 'Lime Cream', mode: 'light', colors: ['#98CD00', '#A4DD00', '#B6F500', '#FFFADC'] },
	{ id: 'meadow-amber', name: 'Meadow Amber', mode: 'light', colors: ['#FFF6C0', '#F7C85C', '#7FB77E', '#2F6B3F'] },
	{ id: 'midnight-violet', name: 'Midnight Violet', mode: 'dark', colors: ['#0B1020', '#171B34', '#8B5CF6', '#EDE9FE'] },
	{ id: 'obsidian-blue', name: 'Obsidian Blue', mode: 'dark', colors: ['#090E16', '#111827', '#38BDF8', '#E0F2FE'] }
];

const paletteKey = 'studioflow_palette';
const modeKey = 'studioflow_theme';

export function getStoredTheme(defaultPalette: ThemePalette = 'graphite-aqua', defaultMode: ThemeMode = 'light'): ThemeSelection {
	if (typeof localStorage === 'undefined') return { palette: defaultPalette, mode: defaultMode };
	const storedPalette = localStorage.getItem(paletteKey);
	const theme = themePalettes.find((item) => item.id === storedPalette) ?? themePalettes.find((item) => item.id === defaultPalette) ?? themePalettes[0];
	return { palette: theme.id, mode: theme.mode };
}

export function currentTheme(): ThemeSelection {
	if (typeof document === 'undefined') return { palette: 'graphite-aqua', mode: 'light' };
	const theme = themePalettes.find((item) => item.id === document.documentElement.dataset.palette) ?? themePalettes[0];
	return { palette: theme.id, mode: theme.mode };
}

export function applyTheme(selection: ThemeSelection, remember = true) {
	if (typeof document === 'undefined') return;
	const theme = themePalettes.find((item) => item.id === selection.palette) ?? themePalettes[0];
	document.documentElement.dataset.palette = theme.id;
	document.documentElement.dataset.theme = theme.mode;
	document.documentElement.style.colorScheme = theme.mode;
	if (remember) {
		localStorage.setItem(paletteKey, theme.id);
		localStorage.setItem(modeKey, theme.mode);
	}
}
