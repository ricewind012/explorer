import CEnum from '../../shared/CEnum.js';

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

export {
	EFileSorting,
	EFileUnits,
};
