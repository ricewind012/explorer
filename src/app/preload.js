let {
	contextBridge,
	ipcRenderer,
} = require('electron');

let path = require('node:path');
let cp = require('node:child_process');
let fs = require('node:fs');

function HandleBeforeUnload(ev) {
	ev.returnValue = true;
}

ipcRenderer.on('window-message', (ev, args) => {
	postMessage(args);
});

contextBridge.exposeInMainWorld('electron', {
	FS: {
		Constants: fs.constants,

		List(strPath) {
			return fs.readdirSync(strPath)
				.map(e => path.join(strPath, e))
				.map(e => {
					try {
						return Object.assign(fs.statSync(e), { path: e });
					} catch (e) {
						console.error(e.message);
						return;
					}
				})
				.filter(Boolean);
		},

		Stat(strPath) {
			return fs.statfsSync(strPath);
		},
	},

	File: {
		Delete: fs.rmSync,
		Move: fs.renameSync,
	},

	SendMesssageToParent(msg) {
		ipcRenderer.send('send-message-to-parent', msg);
	},

	Window: {
		Close(hWindow) {
			ipcRenderer.send('close-window', hWindow);
		},

		Create(strPageName, options, msg) {
			return ipcRenderer.invoke('create-window', {
				page: strPageName,
				options,
				msg,
			});
		},

		Minimize() {
			ipcRenderer.send('minimize');
		},

		ToggleFullscreen() {
			ipcRenderer.send('fullscreen');
		},

		Resize(nWidth, nHeight) {
			ipcRenderer.send('resize', {
				width:  nWidth,
				height: nHeight,
			});
		},

		SetDestroyable(bCanDestroy) {
			if (bCanDestroy)
				window.removeEventListener('beforeunload', HandleBeforeUnload);
			else
				window.addEventListener('beforeunload', HandleBeforeUnload);
		},
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
