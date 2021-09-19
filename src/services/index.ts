import { FolderGateway } from "../gateways/FolderGateway";
import { FolderService } from "./FolderService";

const folderGateway = new FolderGateway();

export const folderService = new FolderService({ folderGateway });
