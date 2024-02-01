import {
	app,
	BrowserWindow as CBrowserWindow,
	ipcMain,
} from 'electron';
import * as path from'node:path';

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
			preload:         path.join(process.cwd(), 'src', 'app', 'preload.mjs'),
		},
	}, additionalOptions);
	let wnd = new CBrowserWindow(options);

	wnd.loadFile(`src/ui/html/${strPageName}.html`);
	wnd.once('ready-to-show', () => {
		wnd.show()
	});

	return wnd;
}

app.commandLine.appendSwitch('disable-smooth-scrolling');
app.whenReady().then(() => {
	let wnd = CreateWindow('index');

	ipcMain.on('resize', (_, e) => {
		wnd.setSize(e.width, e.height);
	});
	ipcMain.on('minimize', () => {
		wnd.minimize();
	});
	ipcMain.on('fullscreen', () => {
		wnd.isMaximized() ? wnd.restore() : wnd.maximize();
	});
	ipcMain.on('close-app', () => {
		app.quit();
	});
	ipcMain.handle('create-window', (ev, args) => {
		return new Promise((resolve, reject) => {
			if (args.page == 'menu' && CBrowserWindow.getAllWindows().length >= 2) {
				reject('Too many windows');
				return;
			}

			let wnd = CreateWindow(args.page, args.options);

			wnd.once('ready-to-show', () => {
				wnd.webContents.postMessage('window-message', args.msg);

				resolve(wnd.id);
			});
		});
	});
	ipcMain.on('close-window', (ev, args) => {
		CBrowserWindow.fromId(args)?.close();
	});
	ipcMain.on('send-message-to-parent', (ev, args) => {
		if (ev.sender == wnd.webContents)
			return;

		wnd.webContents.postMessage('window-message', args);
	});
});
app.on('window-all-closed', () => {
	app.quit()
});
