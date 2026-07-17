import type { ThemeMode, ThemePalette } from '$lib/types';

export interface ThemeSelection { palette: ThemePalette; mode: ThemeMode }
export const themePalettes: { id: ThemePalette; name: string; mode: ThemeMode; colors: string[]; recommended?: boolean }[] = [
	{ id: 'graphite-aqua', name: 'Graphite Aqua', mode: 'light', colors: ['#222831', '#393E46', '#00ADB5', '#EEEEEE'] },
	{ id: 'ice-cyan', name: 'Ice Cyan', mode: 'light', colors: ['#71C9CE', '#A6E3E9', '#CBF1F5', '#E3FDFD'] },
	{ id: 'forest-gold', name: 'Forest Gold', mode: 'light', colors: ['#283F24', '#467235', '#FFF78D', '#FFBF00'] },
	{ id: 'lime-cream', name: 'Lime Cream', mode: 'light', colors: ['#98CD00', '#A4DD00', '#B6F500', '#FFFADC'] },
	{ id: 'meadow-amber', name: 'Meadow Amber', mode: 'light', colors: ['#FFF6C0', '#F7C85C', '#7FB77E', '#2F6B3F'] },
	{ id: 'coral-teal', name: 'Coral Teal', mode: 'light', colors: ['#FF165D', '#FF9A00', '#F6F7D7', '#3EC1D3'] },
	{ id: 'sky-sorbet', name: 'Sky Sorbet', mode: 'light', colors: ['#FFFA8D', '#A8F1FF', '#6FE6FC', '#4ED7F1'] },
	{ id: 'nordic-stone', name: 'Nordic Stone', mode: 'light', colors: ['#F1F0E8', '#E5E1DA', '#B3C8CF', '#89A8B2'], recommended: true },
	{ id: 'midnight-violet', name: 'Midnight Violet', mode: 'dark', colors: ['#0B1020', '#171B34', '#8B5CF6', '#EDE9FE'] },
	{ id: 'obsidian-blue', name: 'Obsidian Blue', mode: 'dark', colors: ['#090E16', '#111827', '#38BDF8', '#E0F2FE'] },
	{ id: 'heritage-sage', name: 'Heritage Sage', mode: 'dark', colors: ['#D99B7F', '#464858', '#0F3040', '#A56F63'], recommended: true },
	{ id: 'merlot-copper', name: 'Merlot Copper', mode: 'dark', colors: ['#F05941', '#BE3144', '#872341', '#22092C'] },
	{ id: 'citrus-evergreen', name: 'Citrus Evergreen', mode: 'dark', colors: ['#F3FF90', '#9BEC00', '#06D001', '#059212'] },
	{ id: 'graphite-coral', name: 'Graphite Coral', mode: 'dark', colors: ['#EAEAEA', '#FF2E63', '#252A34', '#08D9D6'], recommended: true }
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
