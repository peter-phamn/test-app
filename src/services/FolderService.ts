import { FolderGateway } from "../gateways/FolderGateway";
import { Folder } from "../model/Folder";

export class FolderService {
  private folderGateway: FolderGateway;

  constructor(options: { folderGateway: FolderGateway }) {
    this.folderGateway = options.folderGateway;
  }
  //For example
  public getFolders = async (): Promise<Folder[]> => {
    return this.folderGateway.getFolders();
  };
}
