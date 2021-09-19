import { Folder, FolderProperties } from "../model/Folder";

export class FolderGateway {
  //For example
  private initFolders: Folder[] = [
    {
      key: "aqh5jy",
      title: "Folder 1",
      properties: FolderProperties.EVERYONE,
      specificUsers: [],
      children: [],
    },
    {
      key: "r601gq",
      title: "Folder 2",
      specificUsers: [],
      properties: FolderProperties.ONLY_ME,
      children: [
        {
          key: "dfcihj",
          title: "Folder 3",
          properties: FolderProperties.ONLY_ME,
          specificUsers: [],
          children: [
            {
              key: "bpbymt",
              title: "Folder 4",
              specificUsers: [],
              properties: FolderProperties.ONLY_ME,
              children: [],
            },
            {
              key: "9fjtzr",
              title: "Folder 5",
              specificUsers: [],
              properties: FolderProperties.ONLY_ME,
              children: [],
            },
          ],
        },
        {
          key: "1obkzu",
          title: "Folder 6",
          specificUsers: [],
          properties: FolderProperties.ONLY_ME,
          children: [
            {
              key: "jkwh4m",
              title: "Folder 7",
              specificUsers: [],
              properties: FolderProperties.ONLY_ME,
              children: [
                {
                  key: "uh8qqn",
                  title: "Folder 8",
                  specificUsers: [],
                  properties: FolderProperties.ONLY_ME,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  public getFolders = async (): Promise<Folder[]> => {
    return new Promise((resolve, reject) => {
      if (!this.initFolders) {
        return setTimeout(() => reject(new Error("Folders not found")), 250);
      }
      setTimeout(() => resolve(Object.values(this.initFolders)), 250);
    });
  };
}
