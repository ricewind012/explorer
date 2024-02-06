import { Stats } from "node:fs";

enum EFileType {
	None,
	Regular,
	Directory,
	Symlink,
	Block,
	Character,
	FIFO,
	Socket,
	Unknown,
}

export interface IExplorerFile extends Stats {
  path: string;
  type: EFileType;
}
