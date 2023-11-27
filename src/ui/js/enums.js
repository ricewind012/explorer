const EFileSorting = new CEnum(
	'none',
	'ascending',
	'descending',
);

const EFileUnits = new CEnum(
	'B',
	'KB',
	'MB',
	'GB',
	'TB',
);

const EFileType = new CEnum(
	'None',
	'Regular',
	'Directory',
	'Symlink',
	'Block',
	'Character',
	'FIFO',
	'Socket',
	'Unknown',
);
EFileType.Append('NotFound', -1);