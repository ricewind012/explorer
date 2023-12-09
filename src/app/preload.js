let Addon = p =>
	require(path.join(__dirname, `../modules/${p}/build/Release/addon`));

let {
	contextBridge,
	ipcRenderer,
} = require('electron');

let path = require('node:path');
let cp = require('node:child_process');

let FilesystemUtils = Addon('FilesystemUtils');

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer,
	FilesystemUtils,

	// Could have used g_app_info_launch_default_for_uri() here, but fuck you
	ExecuteCommand(cmd) {
		cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				throw new Error(err.message);
			}
		});
	},
});
