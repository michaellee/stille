import { App, Modal, Notice, Plugin, addIcon, PluginSettingTab, Setting } from 'obsidian';

interface StillePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: StillePluginSettings = {
	mySetting: 'default'
}

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M195 125c0-26.3 5.3-51.3 14.9-74.1C118.7 73 51 155.1 51 253c0 114.8 93.2 208 208 208 97.9 0 180-67.7 202.1-158.9-22.8 9.6-47.9 14.9-74.1 14.9-106 0-192-86-192-192z"/></svg>`

export default class StillePlugin extends Plugin {
	settings: StillePluginSettings;
	statusBar: HTMLElement;
	styleElement: HTMLElement;
	stilleStatus: boolean = false;

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		addIcon('moon', moonIcon);

		this.addRibbonIcon('moon', 'Toggle Stille', () => {
			this.toggleStille();
		});

		this.statusBar = this.addStatusBarItem();
		this.statusBar.setText('Stille on');

		this.addCommand({
			id: 'open-sample-modal',
			name: 'Open Sample Modal',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new SampleModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		
		this.stilleStatus = true;
		
		this.addStyleToView();
	}

	onunload() {
		console.log('unloading plugin');
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
		document.head.appendChild(this.styleElement)
		document.body.classList.add('StilleStyle')
		this.updateStyles();
	}
	
	removeStyleFromView() {
		if (this.styleElement) {
			this.styleElement.remove()
			document.body.removeClass('StilleStyle')
		}
	}
	
	updateStyles() {
		this.styleElement.textContent = `body {
																			--unfocusedLevel: 0.5;
																			--focusedLevel: 1;
																		}`;
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: StillePlugin;

	constructor(app: App, plugin: StillePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}