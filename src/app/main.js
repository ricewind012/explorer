let {
	app: hApp,
	BrowserWindow: CBrowserWindow,
	ipcMain,
} = require('electron');
let path = require('node:path');

function CreateWindow(strPageName) {
	let hWindow = new CBrowserWindow({
		frame:           false,
		width:           800,
		height:          600,
		minWidth:        400,
		minHeight:       300,

		show:            false, // Try to prevent FOUC
		autoHideMenuBar: true,
		webPreferences:  {
			nodeIntegration: true,
			preload:         path.join(__dirname, 'preload.js'),
		},
	});

	hWindow.loadFile(`src/ui/html/${strPageName}.html`);
	hWindow.once('ready-to-show', () => hWindow.show());

	ipcMain.on('resize', (_, e) => {
		hWindow.setSize(e.width, e.height);
	});
	ipcMain.on('minimize', () => {
		hWindow.minimize();
	});
	ipcMain.on('fullscreen', () => {
		hWindow.isMaximized() ? hWindow.restore() : hWindow.maximize();
	});
	ipcMain.on('close', () => {
		hApp.quit();
	});
}

hApp.commandLine.appendSwitch('disable-smooth-scrolling');
hApp.whenReady().then(() => CreateWindow('index'));
hApp.on('window-all-closed', () => hApp.quit());
