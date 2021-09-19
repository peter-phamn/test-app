export enum FolderProperties {
  EVERYONE = "everyone",
  ONLY_ME = "only_me",
  SPECIFIC_USERS = "specific_users",
}

export interface Folder {
  title: string;
  key: string;
  children: Folder[];
  properties: FolderProperties;
  specificUsers?: string[];
}
