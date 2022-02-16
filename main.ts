import { App, Modal, Notice, Plugin, addIcon, PluginSettingTab, Setting } from 'obsidian';

interface StillePluginSettings {
	unfocusedLevel: number;
}

const DEFAULT_SETTINGS: StillePluginSettings = {
	unfocusedLevel: 0.3
}

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M195 125c0-26.3 5.3-51.3 14.9-74.1C118.7 73 51 155.1 51 253c0 114.8 93.2 208 208 208 97.9 0 180-67.7 202.1-158.9-22.8 9.6-47.9 14.9-74.1 14.9-106 0-192-86-192-192z"/></svg>`

export default class StillePlugin extends Plugin {
	settings: StillePluginSettings;
	statusBar: HTMLElement;
	styleElement: HTMLElement;
	stilleStatus: boolean = false;

	async onload() {
		await this.loadSettings();

		addIcon('moon', moonIcon);

		this.addRibbonIcon('moon', 'Toggle Stille', () => {
			this.toggleStille();
		});

		this.statusBar = this.addStatusBarItem();
		this.statusBar.setText('Stille on');

		this.addCommand({
			id: 'toggleStille',
			name: 'Toggle Stille',
			callback: () => {
				this.toggleStille();
			},
			hotkeys: [
				{ modifiers: ["Mod","Shift"], key: "S" }
			]
		});

		this.addSettingTab(new StilleSettingTab(this.app, this));
		
		this.stilleStatus = true;
		
		this.toggleStille();
	}

	async onunload() {
		this.removeStyleFromView();
		this.statusBar.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	async toggleStille() {
		this.stilleStatus = !this.stilleStatus;
		
		if(this.stilleStatus) {
			this.addStyleToView()
			this.statusBar.setText('Stille on');
		} else {
			this.removeStyleFromView()
			this.statusBar.setText('Stille off');
		}
	}
	
	addStyleToView() {
		this.styleElement = document.createElement('style');
		this.styleElement.id = 'stilleStyles';
		document.head.appendChild(this.styleElement);
		document.body.classList.add('StilleStyle');
		this.updateStyles();
	}
	
	removeStyleFromView() {
		if (this.styleElement) {
			this.styleElement.remove();
			this.styleElement = null;
			document.body.removeClass('StilleStyle');
		}
	}
	
	updateStyles() {
		this.styleElement.textContent = `body {
																			--unfocusedLevel: ${this.settings.unfocusedLevel};
																		}`;
	}
	
	refresh() {
		this.removeStyleFromView();
		this.addStyleToView();
	}
}

class StilleSettingTab extends PluginSettingTab {
	plugin: StillePlugin;

	constructor(app: App, plugin: StillePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h3', {text: 'Stille — Focus on your writing.'});
		containerEl.createEl('h4', {text: 'v' + this.plugin.manifest.version})
		containerEl.createEl('a', { text: 'Learn more about Stille', href: 'https://michaelsoolee.com/stille-obsidian-plugin/'})
		containerEl.createEl('br');
		containerEl.createEl('span', {text: 'If Stille has helped you focus, consider buying me a slice of pizza 🍕 '});
		containerEl.createEl('a', {text: 'Buy Michael, a slice of pizza', href:"https://michaellee.gumroad.com/l/buy-michael-pizza"});
				
		new Setting(containerEl)
		.setName('Opacity level for unfocused text')
		.setDesc('This is the opacity level for text that is unfocused. This value should be a decimal value from 0.0 to 1.0.')
		.addText(text => text
			.setPlaceholder('A value from 0.0 to 1.0')
			.setValue(this.plugin.settings.unfocusedLevel + '')
			.onChange(async (value) => {
				this.plugin.settings.unfocusedLevel = Number(value);
				await this.plugin.saveSettings();
				this.plugin.refresh();
			}));
	}
}
