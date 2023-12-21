let Addon = p =>
	require(path.join(__dirname, `../modules/${p}/build/Release/addon`));

let {
	contextBridge,
	ipcRenderer,
} = require('electron');

let path = require('node:path');
let cp = require('node:child_process');

let FilesystemUtils = Addon('FilesystemUtils');

ipcRenderer.on('window-message', (ev, args) => {
	postMessage(args);
});

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer,
	FilesystemUtils,

	CreateWindow(strPageName, options, msg) {
		return ipcRenderer.invoke('create-window', {
			page: strPageName,
			options,
			msg,
		});
	},

	// shell.openPath() is async, but blocking ?
	ExecuteCommand(cmd) {
		cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				throw new Error(err.message);
			}
		});
	},
});
