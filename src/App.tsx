import React, {
  FC,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, TreeSelect, Input, Row, Col, Layout } from "antd";
import { DataNode, EventDataNode } from "antd/lib/tree";
import { RefTreeSelectProps } from "antd/lib/tree-select";
import ForwardDirectoryTree from "antd/lib/tree/DirectoryTree";
import { Content, Header } from "antd/lib/layout/layout";
import debounce from "lodash/debounce";
import findIndex from "lodash/findIndex";

import { folderService } from "./services";
import { Folder, FolderProperties } from "./model/Folder";
import FolderCreationForm from "./components/FolderCreationForm";
import { propertiesLabel } from "./assets/PropertiesLabel";

const { Search } = Input;

const App: FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>(
    undefined
  );
  const [expandedKeys, setExpandedKeys] = useState<Key[] | undefined>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(false);
  const [showFolderSelection, setShowFolderSelection] =
    useState<boolean>(false);
  const [pendingFolders, setPendingFolders] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const treeRef = useRef<RefTreeSelectProps | null>(null);

  const generateList = useCallback((folder: Folder, allFolders: Folder[]) => {
    allFolders.push(folder);
    if (folder.children.length > 0) {
      folder.children.forEach((child) => {
        generateList(child, allFolders);
      });
    }
  }, []);

  const rootFolders = useMemo(() => {
    return folders.map((folder) => folder);
  }, [folders]);

  const individualFolders = useMemo(() => {
    let allFolders: Folder[] = [];
    folders.forEach((folder) => {
      generateList(folder, allFolders);
    });
    return allFolders;
  }, [folders, generateList]);

  const getParentKey = useCallback(
    (key: Key, tree: Folder[]): Key | undefined => {
      let parentKey: Key | undefined = undefined;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
          if (node.children.some((item) => item.key === key)) {
            parentKey = node.key;
          } else if (getParentKey(key, node.children)) {
            parentKey = getParentKey(key, node.children);
          }
        }
      }
      return parentKey;
    },
    []
  );

  const getFolderFromKey = (key: Key, tree: Folder[]): Folder | undefined => {
    let folder: Folder | undefined = undefined;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.key === key) {
        folder = node;
      } else if (getFolderFromKey(key, node.children)) {
        folder = getFolderFromKey(key, node.children);
      }
    }
    return folder;
  };

  const getFolderTitle = useCallback(
    (searchText: string, folderTitle: string) => {
      const lowercaseSearchText = searchText.toLowerCase();
      const lowercaseTitle = folderTitle.toLowerCase();
      const index = lowercaseTitle.indexOf(lowercaseSearchText);
      return folderTitle.slice(index, searchValue.length);
    },
    [searchValue]
  );

  const getSpecificUserStr = (users: string[]) => {
    if (users.length === 0) {
      return propertiesLabel.specific_users;
    } else {
      let str = "Visible to ";
      users.forEach((user, index) => {
        str += user;
        if (index !== users.length - 1) {
          str += ", ";
        }
      });
      return str;
    }
  };

  const onSelectFolder = (_keys: Key[], info: any) => {
    const {
      node: { key },
    } = info;
    const selectedFolder = getFolderFromKey(key.toString(), folders);
    setSelectedFolder(selectedFolder);
    treeRef.current?.blur();
    setShowFolderSelection(false);
  };

  const onSearchFolder = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      const expandedKeys = individualFolders
        .map((item) => {
          if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
            return getParentKey(item.key, rootFolders);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      let finalExpandedKeys: Key[] = [];
      expandedKeys.forEach((key) => {
        if (key) {
          finalExpandedKeys.push(key);
        }
      });
      setSearchValue(value);
      setExpandedKeys(finalExpandedKeys);
      setAutoExpandParent(true);
    },
    [getParentKey, individualFolders, rootFolders]
  );

  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const debouncedChangeTextHandler = useMemo(
    () => debounce(onSearchFolder, 300),
    [onSearchFolder]
  );

  const onAddFolder = useCallback(() => {
    const randomStr = Math.random().toString(36).substr(2, 6);
    let currentPendingFolders = [...pendingFolders];

    const newFolder: Folder = {
      key: randomStr,
      children: [],
      properties: FolderProperties.EVERYONE,
      title: "",
    };
    currentPendingFolders.unshift(newFolder);
    setPendingFolders(currentPendingFolders);
  }, [pendingFolders]);

  const onSaveNewFolder = useCallback(
    (newFolder: Folder) => {
      let currentFolders = [...folders];
      let currentPendingFolders = [...pendingFolders];
      currentFolders.unshift(newFolder);
      const pendingFolderIndex: number = findIndex(pendingFolders, {
        key: newFolder.key,
      });
      if (pendingFolderIndex >= 0) {
        currentPendingFolders.splice(pendingFolderIndex, 1);
      }
      setFolders(currentFolders);
      setPendingFolders(currentPendingFolders);
    },
    [folders, pendingFolders]
  );

  const onDeleteNewFolder = useCallback(
    (folderKey: string) => {
      const currentPendingFolders: Folder[] = [...pendingFolders];
      const pendingFolderIndex: number = findIndex(currentPendingFolders, {
        key: folderKey,
      });
      if (pendingFolderIndex > -1) {
        currentPendingFolders.splice(pendingFolderIndex, 1);
      }
      setPendingFolders(currentPendingFolders);
    },
    [pendingFolders]
  );

  const onDragDrop = useCallback(
    (
      info: any & {
        dragNode: EventDataNode;
        dragNodesKeys: Key[];
        dropPosition: number;
        dropToGap: boolean;
      }
    ) => {
      const { node, dragNode, dropToGap } = info;
      const dropKey: string = node.key.toString();
      const dragKey: string = dragNode.key.toString();
      const dropPos: string = node.pos.split("-");
      const dropPosition: number =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);

      const loop = (
        data: Folder[],
        key: string,
        callback: (folder: Folder, index: number, folders: Folder[]) => void
      ) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children, key, callback);
          }
        }
      };
      const currentFolders = [...folders];

      // Find dragObject
      let dragFolder: Folder | undefined = undefined;
      loop(currentFolders, dragKey, (item, index, arr): void => {
        arr.splice(index, 1);
        dragFolder = item;
      });

      if (!dropToGap) {
        // Drop on the content
        loop(currentFolders, dropKey, (item) => {
          item.children = item.children || [];
          if (dragFolder) item.children.unshift(dragFolder);
        });
      } else if (
        (node.props.children || []).length > 0 && // Has children
        node.props.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(currentFolders, dropKey, (item) => {
          item.children = item.children || [];
          if (dragFolder) item.children.unshift(dragFolder);
        });
      } else {
        let ar: Folder[] = [];
        let i: number = 0;
        loop(currentFolders, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dragFolder) {
          if (dropPosition === -1) {
            ar.splice(i, 0, dragFolder);
          } else {
            ar.splice(i + 1, 0, dragFolder);
          }
        }
      }

      setFolders(currentFolders);
    },
    [folders]
  );

  const loop = useCallback(
    (rootFolders: Folder[]): DataNode[] | undefined => {
      return rootFolders.map((folder) => {
        const { properties, specificUsers } = folder;
        const lowercaseSearchValue = searchValue;
        const lowercaseTitle = folder.title;
        const index = lowercaseTitle
          .toLowerCase()
          .indexOf(lowercaseSearchValue.toLowerCase());
        const beforeStr = folder.title.substr(0, index);
        const afterStr = folder.title.substr(index + searchValue.length);

        const title =
          index > -1 ? (
            <Col className="tree-note">
              <span className="tree-note__folder-title">
                {beforeStr}
                <span className="tree-note__search-value">
                  {`${getFolderTitle(searchValue, folder.title)}`}
                </span>
                {afterStr}
              </span>
              <Row>
                {properties === FolderProperties.SPECIFIC_USERS
                  ? getSpecificUserStr(specificUsers || [])
                  : propertiesLabel[folder.properties]}
              </Row>
            </Col>
          ) : (
            <Col className="tree-note">
              <Row className="tree-note__folder-title">{folder.title}</Row>
              <Row>
                {properties === FolderProperties.SPECIFIC_USERS
                  ? getSpecificUserStr(specificUsers || [])
                  : propertiesLabel[folder.properties]}
              </Row>
            </Col>
          );
        if (folder.children) {
          return { title, key: folder.key, children: loop(folder.children) };
        }
        return {
          title,
          key: folder.key,
        };
      });
    },
    [getFolderTitle, searchValue]
  );

  useEffect(() => {
    (async () => {
      try {
        const folderFromDB = await folderService.getFolders();
        setFolders(folderFromDB);
      } catch (error) {
        console.log({ error });
      }
    })();
  }, []);

  return (
    <div className="App">
      <Layout>
        <Header className="App-header">
          <h1>Copy Data To Folder</h1>
        </Header>
        <Content className="App-content">
          {showFolderSelection && (
            <div
              className="tree-select-backdrop"
              onClick={() => setShowFolderSelection(false)}
            />
          )}
          <div className="copy-data-container">
            <TreeSelect
              ref={treeRef}
              className="tree-select"
              onFocus={() => setShowFolderSelection(true)}
              open={showFolderSelection}
              dropdownClassName="tree-select__drop-down"
              value={selectedFolder?.title}
              placeholder="Please select folder"
              dropdownRender={() => {
                return (
                  <>
                    <Row className="tree-select__action-view">
                      <Col span={24} md={{ span: 16 }}>
                        <Search
                          allowClear
                          placeholder="Search"
                          onChange={debouncedChangeTextHandler}
                        />
                      </Col>
                      <Col
                        span={24}
                        md={{ span: 8 }}
                        className="tree-select__button-view"
                      >
                        <Button block type="primary" onClick={onAddFolder}>
                          Add Folder
                        </Button>
                      </Col>
                    </Row>
                    <Row className="tree-select__folder-creation-view">
                      <Col span={24}>
                        {pendingFolders.map((pendingFolder) => (
                          <FolderCreationForm
                            onDelete={onDeleteNewFolder}
                            key={pendingFolder.key}
                            onSave={onSaveNewFolder}
                            folder={pendingFolder}
                          />
                        ))}
                      </Col>
                    </Row>
                    <ForwardDirectoryTree
                      draggable
                      onExpand={onExpand}
                      autoExpandParent={autoExpandParent}
                      expandedKeys={expandedKeys}
                      onSelect={onSelectFolder}
                      onDrop={onDragDrop}
                      treeData={loop(rootFolders)}
                    />
                  </>
                );
              }}
            />
            <div className="copy-data-container__action-view">
              <Button className="copy-data-container__cancel-button">
                Cancel
              </Button>
              <Button type="primary">Save</Button>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default App;
