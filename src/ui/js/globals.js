const k_strOpener = 'xdg-open';

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
