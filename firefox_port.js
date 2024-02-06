const S_IFMT = 61440;
const S_IFREG = 32768;
const S_IFDIR = 16384;
const S_IFCHR = 8192;
const S_IFBLK = 24576;
const S_IFIFO = 4096;
const S_IFLNK = 40960;
const S_IFSOCK = 49152;

const S_IRWXU = 448;
const S_IRUSR = 256;
const S_IWUSR = 128;
const S_IXUSR = 64;

const S_IRWXG = 56;
const S_IRGRP = 32;
const S_IWGRP = 16;
const S_IXGRP = 8;

const S_IRWXO = 7;
const S_IROTH = 4;
const S_IWOTH = 2;
const S_IXOTH = 1;

class CNSIFileWrapper {
	static New(strPath) {
		let file = Cc["@mozilla.org/file/local;1"].getService(Ci.nsIFile);
		file.initWithPath(strPath);

		return file;
	}

	/**
	 * @param file nsIFile
	 * @returns {import('./IExplorerFile.d.ts').IExplorerFile}
	 */
	static BuildInterface(file) {
		let type = (() => {
			switch (file.permissions & S_IFMT) {
				case S_IFREG:
					return EFileType.Regular;
				case S_IFDIR:
					return EFileType.Directory;
				case S_IFLNK:
					return EFileType.Symlink;
				case S_IFBLK:
					return EFileType.Block;
				case S_IFCHR:
					return EFileType.Character;
				case S_IFIFO:
					return EFileType.FIFO;
				case S_IFSOCK:
					return EFileType.Socket;
				default:
					return EFileType.Unknown;
			}
		})();

		return {
			type,
			path: file.path,
			mode: file.permissions,
			size: file.fileSize,
		};
	}
}

let electron = {
	List(strPath) {
		let file = CNSIFileWrapper.New(strPath);
		let entries = file.directoryEntries;
		let vecFiles = [];

		while (entries.hasMoreElements()) {
			let entry = entries.getNext();
			entry.QueryInterface(Ci.nsIFile);

			vecFiles.push(CNSIFileWrapper.BuildInterface(entry));
		}

		return vecFiles;
	},
};
