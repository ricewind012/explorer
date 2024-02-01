import CEnum from './CEnum.js';

/**
 * Represents `std::filesystem::file_type`.
 */
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

export default EFileType;
