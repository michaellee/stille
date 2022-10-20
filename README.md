## 🌗 Stille

An Obsidian plugin that helps you focus on your writing, a section at a time.

![A screenshot of Stille](https://user-images.githubusercontent.com/1329644/197059096-7a3ad259-6fc3-4471-8f0b-e28c551152eb.png)

[Learn more about Stille.](https://michaelsoolee.com/obsidian-focus-plugin-stille/)

## Getting started
- Once Stille is installed, make sure the plugin is activated under *Community plugins > Installed plugins* in *Settings*
- Once activated, you'll see a new moon-shaped icon in the left hand ribbon. This is the toggle to turn Stille on and off. You'll also see in the bottom status bar, a status for Stille that indicates whether it's on or off.
- Stille also comes with a hotkey to toggle it on or off, `command + shift + s` on macOS or `control + shift + s` on Windows.

## To develop

- Clone repository
- Run `npm i` to install dependencies
- Run `npm run dev`

## To install from repo

- Follow steps above in "To develop" section
- Instead of running `npm run dev`, you want to run `npm run build`
- Create a folder in your vault's `.obsidian/plugins` folder called "stille"
- Then copy and paste the `main.js`, `manifest.json` and `styles.css` files into the new stille folder
- Activate community plugins by turning off safe mode under settings and you should now see the option to turn on Stille

## Acknowledgement

[Limelight by Junegunn Choi](https://github.com/junegunn/limelight.vim)

## License

MIT
