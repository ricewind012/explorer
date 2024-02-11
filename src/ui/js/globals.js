const k_strOpener = 'xdg-open';

const k_nChildWindowPadding = 3;
// 1 (border) + 3 (top margin) + 4 (bottom margin)
const k_nSeparatorHeight = 8;

// TODO: window borders ?
const k_nContentSeparatorOffset = 5;

const {
	S_IRUSR,
	S_IWUSR,
	S_IXUSR,

	S_IRGRP,
	S_IWGRP,
	S_IXGRP,

	S_IROTH,
	S_IWOTH,
	S_IXOTH,

	S_IFMT,
	S_IFREG,
	S_IFDIR,
	S_IFLNK,
	S_IFBLK,
	S_IFCHR,
	S_IFIFO,
	S_IFSOCK,
} = electron.FS.Constants;

const k_Messages = {
	file: {
		cut:      'file-cut',
		copy:     'file-copy',
		shortcut: 'file-create-shortcut',
		delete:   'file-delete',
		rename:   'file-rename',
	},

	nav: {
		execute:  'nav-execute',
		navigate: 'nav-igate',
		refresh:  'nav-refresh',
	},

	window: {
		close:     'window-close',
		create:    'window-create',
		menu_done: 'window-menu-close',
	}
};

let styles = getComputedStyle(document.body);
let nMenuItemHeight = Number(styles.lineHeight.replace('px', '')) + 4;
