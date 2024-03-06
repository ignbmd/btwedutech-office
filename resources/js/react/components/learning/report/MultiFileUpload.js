import Uppy from "@uppy/core";
import { useEffect, useState } from "react";
import { File, Image, X } from "react-feather";
import { DragDrop } from "@uppy/react";
import { Card, CardBody, Media } from "reactstrap";
import "uppy/dist/uppy.css";

import Avatar from "../../core/avatar";
import { nanoid } from "nanoid";

const allowedImgTypes = ["jpg", "jpeg", "png"];

const MultiFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleSelectedFile = (selectedFile) => {
    const newFile = selectedFile.data;
    setFiles((currentFiles) => [...currentFiles, newFile]);
  };

  const handlePreviews = (files) => {
    let previews = [];

    files.map((file) => {
      const fileName = file.name;
      const fileType = fileName.split(".").pop();
      const featherIcon = allowedImgTypes.includes(fileType) ? "image" : "file";
      const color = featherIcon === "image" ? "light-success" : "light-primary";
      const id = nanoid();
      previews.push({
        id,
        color,
        name: fileName,
        type: fileType,
        icon: featherIcon,
      });
    });

    setPreviews(previews);
  };

  useEffect(() => {
    handlePreviews(files);
  }, [files]);

  const uppy = new Uppy({
    meta: { type: "avatar" },
    allowMultipleUploads: true,
    onBeforeFileAdded: (currentFile, files) => {
      handleSelectedFile(currentFile);
    },
  });

  const handleRemoveFile = (fileIndex) => {
    const updatedFiles = [...files];
    updatedFiles.splice(fileIndex, 1);
    setFiles(updatedFiles);
  };

  return (
    <>
      <DragDrop uppy={uppy} />
      <Card className="card-transaction">
        <CardBody>
          {previews.map((item, itemIndex) => (
            <div key={item.id} className="transaction-item">
              <Media>
                <Avatar
                  className="rounded"
                  color={item.color}
                  icon={
                    item.icon === "image" ? (
                      <Image size={18} />
                    ) : (
                      <File size={18} />
                    )
                  }
                />
                <Media body>
                  <h6 className="transaction-title">{item.name}</h6>
                  <small>{item.type}</small>
                </Media>
              </Media>
              <div className="text-danger">
                <X size={18} onClick={() => handleRemoveFile(itemIndex)} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
};

export default MultiFileUpload;
