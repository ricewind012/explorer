const k_strOpener = 'xdg-open';

// TODO: happens with sockets
const k_n1TB = 1152921504606847000;

// TODO: window borders ?
const k_nContentSeparatorOffset = 5;

// linux/stat.h
const S_IRWXU = 0o700;
const S_IRUSR = 0o400;
const S_IWUSR = 0o200;
const S_IXUSR = 0o100;

const S_IRWXG = 0o70;
const S_IRGRP = 0o70;
const S_IWGRP = 0o40;
const S_IXGRP = 0o10;

const S_IRWXO = 0o7;
const S_IROTH = 0o4;
const S_IWOTH = 0o2;
const S_IXOTH = 0o1;

let g_Data     = new CAppData();
let g_Path     = new CPath();
let g_Elements = {};

let g_hChildWindow = null;
let g_vecFiles = [];

let g_vecTableButtons = [
	{
		name: 'name',
		functions: [
			(a, b) => a,
			(a, b) => a.path.localeCompare(b.path),
			(a, b) => b.path.localeCompare(a.path),
		],
	}, {
		name: 'size',
		functions: [
			(a, b) => a,
			(a, b) => a.size - b.size,
			(a, b) => b.size - a.size,
		],
	}, {
		name: 'type',
		functions: [
			(a, b) => a,
			(a, b) => a.type - b.type,
			(a, b) => b.type - a.type,
		],
	}, {
		name: 'mode',
		functions: [
			(a, b) => a,
			(a, b) => a.mode - b.mode,
			(a, b) => b.mode - a.mode,
		],
	},
];