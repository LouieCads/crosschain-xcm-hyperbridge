type Theme = 'light' | 'dark';

class ThemeStore {
	theme = $state<Theme>('dark');

	constructor() {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('theme') as Theme | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			
			this.theme = stored || (prefersDark ? 'dark' : 'light');

			this.applyTheme();
			requestAnimationFrame(() => this.applyTheme());
		}
	}

	toggle() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		this.applyTheme();
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', this.theme);
		}
	}

	private applyTheme() {
		if (typeof document !== 'undefined') {
			if (this.theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export const themeStore = new ThemeStore();