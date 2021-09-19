import React, { FC, useCallback, useState } from "react";
import { Input, Row, Select, Tag } from "antd";
import { SaveFilled, DeleteFilled, FolderOutlined } from "@ant-design/icons";

import { Folder, FolderProperties } from "../model/Folder";
import { propertiesLabel } from "../assets/PropertiesLabel";

const { Option } = Select;

const FOLDER_PROPERTIES: FolderProperties[] = [
  FolderProperties.EVERYONE,
  FolderProperties.ONLY_ME,
  FolderProperties.SPECIFIC_USERS,
];

interface Props {
  folder: Folder;
  onSave: (folder: Folder) => void;
  onDelete: (folderKey: string) => void;
}

const FolderCreationForm: FC<Props> = ({ folder, onSave, onDelete }) => {
  const [selectedProperties, setSelectedProperties] =
    useState<FolderProperties>(folder.properties);
  const [newTitle, setNewTitle] = useState("");

  const [newSpecificUsers, setNewSpecificUsers] = useState<string[]>(
    folder.specificUsers || []
  );

  const [newUserName, setNewUserName] = useState<string>("");

  const onChangeUserName = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserName(value);
  };

  const onChangeNewTitle = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(value);
  };

  const onSaveFolder = useCallback(() => {
    const newFolder: Folder = {
      ...folder,
      properties: selectedProperties,
      title: newTitle,
      specificUsers: newSpecificUsers,
    };
    onSave(newFolder);
  }, [folder, newSpecificUsers, newTitle, onSave, selectedProperties]);

  const handleAddUserConfirm = useCallback(() => {
    if (newUserName !== "") {
      const specificUsers = [...newSpecificUsers];
      specificUsers.push(newUserName);
      setNewSpecificUsers(specificUsers);
      setNewUserName("");
    }
  }, [newSpecificUsers, newUserName]);

  const handleRemoveUserConfirm = useCallback(
    (index) => {
      const specificUsers = [...newSpecificUsers];
      specificUsers.splice(index, 1);
      setNewSpecificUsers(specificUsers);
    },
    [newSpecificUsers]
  );

  return (
    <div className="form">
      <FolderOutlined className="form__folder-icon" />
      <Row className="form__action-view">
        <Input onChange={onChangeNewTitle} placeholder="Basic usage" />
        <Select
          onSelect={setSelectedProperties}
          defaultValue={selectedProperties}
          className="form__select"
        >
          {FOLDER_PROPERTIES.map((prop, index) => (
            <Option key={index} value={prop}>
              {propertiesLabel[prop]}
            </Option>
          ))}
        </Select>
        {selectedProperties === FolderProperties.SPECIFIC_USERS && (
          <Row className="form__tag">
            {newSpecificUsers.map((user, index) => (
              <Tag
                key={index}
                onClose={() => handleRemoveUserConfirm(index)}
                closable
              >
                {user}
              </Tag>
            ))}
            <Input
              size="small"
              className="tag-input"
              placeholder="Add user"
              value={newUserName}
              onChange={onChangeUserName}
              onBlur={handleAddUserConfirm}
              onPressEnter={handleAddUserConfirm}
            />
          </Row>
        )}
      </Row>
      <Row className="form__icon-view" justify="end">
        <DeleteFilled
          onClick={() => onDelete(folder.key)}
          className="form__action-icon form__action-icon--danger"
        />
        <SaveFilled
          onClick={onSaveFolder}
          className="form__action-icon form__action-icon--primary"
        />
      </Row>
    </div>
  );
};

export default FolderCreationForm;
