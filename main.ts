import { App, Plugin, addIcon, PluginSettingTab, Setting } from "obsidian";

const nameOfApplication = `Stille`;

interface StillePluginSettings {
	unfocusedLevel: number;
	statusBarLabel: boolean;
	statusBarLabelText: string;
	unfocusTitle: boolean;
}

// Default settings values
const DEFAULT_SETTINGS: StillePluginSettings = {
	unfocusedLevel: 0.3,
	statusBarLabel: true,
	statusBarLabelText: `${nameOfApplication} on`,
	unfocusTitle: false,
};

// Icon for the side dock ribbon toggle for Stille
// Icon is from the ionicons icon set https://github.com/ionic-team/ionicons/blob/main/src/svg/moon-sharp.svg
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M195 125c0-26.3 5.3-51.3 14.9-74.1C118.7 73 51 155.1 51 253c0 114.8 93.2 208 208 208 97.9 0 180-67.7 202.1-158.9-22.8 9.6-47.9 14.9-74.1 14.9-106 0-192-86-192-192z"/></svg>`;

export default class StillePlugin extends Plugin {
	settings: StillePluginSettings;
	statusBar: HTMLElement;
	styleElement: HTMLElement;
	stilleStatus: boolean = false;

	async onload() {
		// Load settings values
		await this.loadSettings();

		// Add Stille toggle to ribbon
		addIcon("moon", moonIcon);
		this.addRibbonIcon("moon", "Toggle Stille", () => {
			this.toggleStille();
		});

		// Add Stille status to status bar
		this.statusBar = this.addStatusBarItem();
		this.statusBar.setText(this.settings.statusBarLabelText);
		this.toggleLabelDisplay(this.settings.statusBarLabel, true);

		this.toggleDimTitle(this.settings.unfocusTitle);

		// Add Stille toggle shortcut
		this.addCommand({
			id: "toggleStille",
			name: "Toggle Stille",
			callback: () => {
				this.toggleStille();
			},
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "S" }],
		});

		// Add Stille specific settings tab
		this.addSettingTab(new StilleSettingTab(this.app, this));

		this.stilleStatus = true;

		this.toggleStille();
	}

	async onunload() {
		this.removeStyleFromView();
		this.statusBar.remove();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async toggleStille() {
		this.stilleStatus = !this.stilleStatus;

		if (this.stilleStatus) {
			this.addStyleToView();
			this.settings.statusBarLabelText = `${nameOfApplication} on`;
			this.statusBar.setText(this.settings.statusBarLabelText);
		} else {
			this.removeStyleFromView();
			this.settings.statusBarLabelText = `${nameOfApplication} off`;
			this.statusBar.setText(this.settings.statusBarLabelText);
		}
	}

	addStyleToView() {
		this.styleElement = document.createElement("style");
		this.styleElement.id = "stilleStyles";
		document.head.appendChild(this.styleElement);
		document.body.classList.add("StilleStyle");
		const dimTitle = this.settings.unfocusTitle;
		if (dimTitle) {
			this.toggleDimTitle(dimTitle);
		}

		this.updateStyles();
	}

	removeStyleFromView() {
		if (this.styleElement) {
			this.styleElement.remove();
			document.body.removeClass("StilleStyle");
			document.body.removeClass("StilleUnfocusTitle");
		}
	}

	updateStyles() {
		this.styleElement.textContent = `body {
																			--unfocusedLevel: ${this.settings.unfocusedLevel};
																		}`;
	}

	toggleLabelDisplay(value: boolean, pluginOnLoad?: boolean) {
		if (!value) {
			this.statusBar.remove();
		}
		if (value && !pluginOnLoad) {
			this.statusBar = this.addStatusBarItem();
			this.statusBar.setText(this.settings.statusBarLabelText);
		}
	}

	toggleDimTitle(value: boolean) {
		if (value) {
			document.body.classList.add("StilleUnfocusTitle");
		} else {
			document.body.classList.remove("StilleUnfocusTitle");
		}
	}

	async toggleLabel(value: boolean) {
		this.toggleLabelDisplay(value);
		this.settings.statusBarLabel = value;
		await this.saveSettings();
	}

	async toggleTitle(value: boolean) {
		this.toggleDimTitle(value);
		this.settings.unfocusTitle = value;
		await this.saveSettings();
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
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h3", {
			text: `${nameOfApplication} — Focus on your writing.`,
		});
		containerEl.createEl("h4", {
			text: "v" + this.plugin.manifest.version,
		});
		containerEl.createEl("a", {
			text: `Learn more about ${nameOfApplication}`,
			href: "https://michaelsoolee.com/obsidian-focus-plugin-stille/",
		});
		containerEl.createEl("br");
		containerEl.createEl("span", {
			text: `If ${nameOfApplication} has helped you focus, consider buying me a slice of pizza 🍕 `,
		});
		containerEl.createEl("a", {
			text: "Buy Michael, a slice of pizza",
			href: "https://michaellee.gumroad.com/l/buy-michael-pizza",
		});
		containerEl.createEl("br");
		containerEl.createEl("br");
		// Adds setting to control opacity of unfocused test
		// The uses an input field and will update the unfocusedLevel settings value
		new Setting(containerEl)
			.setName("Opacity level for unfocused text")
			.setDesc(
				"This is the opacity level for text that is unfocused. This value should be a decimal value from 0.0 to 1.0."
			)
			.addText((text) =>
				text
					.setPlaceholder("A value from 0.0 to 1.0")
					.setValue(this.plugin.settings.unfocusedLevel + "")
					.onChange(async (value) => {
						this.plugin.settings.unfocusedLevel = Number(value);
						await this.plugin.saveSettings();
						this.plugin.refresh();
					})
			);

		// Adds settings option to toggle Stille's status bar label
		// This provides a toggle which controls the settings value for the statusBarLabel
		new Setting(containerEl)
			.setName("Toggle status bar label")
			.setDesc(
				`Use this to toggle the visibility of the status bar label for ${nameOfApplication}.`
			)
			.addToggle((barStatus) =>
				barStatus
					.setValue(this.plugin.settings.statusBarLabel)
					.onChange(async () => {
						await this.plugin.toggleLabel(
							!this.plugin.settings.statusBarLabel
						);
					})
			);

		// Adds settings option to toggle title to be dimmed
		// This provides a toggle which controls the settings value for the statusBarLabel
		new Setting(containerEl)
			.setName("Dim title")
			.setDesc(
				`Dim the title of the note when ${nameOfApplication} is on.`
			)
			.addToggle((title) =>
				title
					.setValue(this.plugin.settings.unfocusTitle)
					.onChange(async () => {
						await this.plugin.toggleTitle(
							!this.plugin.settings.unfocusTitle
						);
					})
			);
	}
}
