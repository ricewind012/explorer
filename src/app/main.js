let {
	app: hApp,
	BrowserWindow: CBrowserWindow,
	ipcMain,
} = require('electron');
let path = require('node:path');

function CreateWindow(strPageName, additionalOptions) {
	let options = Object.assign({
		frame:           false,
		width:           800,
		height:          600,
		minWidth:        400,
		minHeight:       300,

		show:            false, // Try to prevent the white flash
		autoHideMenuBar: true,
		webPreferences:  {
			nodeIntegration: true,
			preload:         path.join(__dirname, 'preload.js'),
		},
	}, additionalOptions);
	let hWindow = new CBrowserWindow(options);

	hWindow.loadFile(`src/ui/html/${strPageName}.html`);
	hWindow.once('ready-to-show', () => hWindow.show());

	return hWindow;
}

hApp.commandLine.appendSwitch('disable-smooth-scrolling');
hApp.whenReady().then(() => {
	let hWindow = CreateWindow('index');

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
	ipcMain.on('create-window', (ev, args) => {
		if (args.page == 'menu' && CBrowserWindow.getAllWindows().length >= 2)
			return;

		let hWindow = CreateWindow(args.page, args.options);

		if (!args.msg)
			return;

		hWindow.once('ready-to-show', () => {
			hWindow.webContents.postMessage('window-message', args.msg);
		});
	});
	ipcMain.on('send-message-to-parent', (ev, args) => {
		if (ev.sender == hWindow.webContents)
			return;

		hWindow.webContents.postMessage('window-message', args);
	});
});
hApp.on('window-all-closed', () => hApp.quit());
