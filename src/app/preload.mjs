import {
	contextBridge,
	ipcRenderer,
} from 'electron';

import * as path from 'node:path';
import * as cp from 'node:child_process';
import * as fs from 'node:fs';

import EFileType from '../shared/EFileType.js';

const {
	S_IFMT,
	S_IFREG,
	S_IFDIR,
	S_IFLNK,
	S_IFBLK,
	S_IFCHR,
	S_IFIFO,
	S_IFSOCK,
} = fs.constants;

function OnBeforeUnload(ev) {
	ev.returnValue = true;
}

ipcRenderer.on('window-message', (ev, args) => {
	postMessage(args);
});

function GetFileStats(strPath) {
	let stats = fs.statSync(strPath);

	let type = (() => {
		switch (stats.mode & S_IFMT) {
			case S_IFREG:  return EFileType.Regular;
			case S_IFDIR:  return EFileType.Directory;
			case S_IFLNK:  return EFileType.Symlink;
			case S_IFBLK:  return EFileType.Block;
			case S_IFCHR:  return EFileType.Character;
			case S_IFIFO:  return EFileType.FIFO;
			case S_IFSOCK: return EFileType.Socket;
			default:       return EFileType.Unknown;
		}
	})();

	return Object.assign(stats, {
		type,
		path: strPath,
	});
}

contextBridge.exposeInMainWorld('electron', {
	FS: {
		Constants: fs.constants,

		List(strPath) {
			return fs.readdirSync(strPath)
				.map(e => path.join(strPath, e))
				.map(e => {
					try {
						return GetFileStats(e);
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
		Copy: fs.copyFileSync,
		Delete: fs.rmSync,
		Move: fs.renameSync,
		Get: GetFileStats,
		Write: fs.writeFileSync,
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
				window.removeEventListener('beforeunload', OnBeforeUnload);
			else
				window.addEventListener('beforeunload', OnBeforeUnload);
		},
	},

	// shell.openPath() is async, but blocking ?
	ExecuteCommand(cmd) {
		cp.exec(cmd, (err) => {
			if (err) {
				throw new Error(err.message);
			}
		});
	},
});
