import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import "filepond/dist/filepond.min.css";

import "./FileUpload.css";

registerPlugin(FilePondPluginFileValidateSize);

const FileUpload = ({
  name,
  changed,
  onerror,
  onupdatefiles,
  handleRemoveFile,
  handleBeforeAddFile,
  ...props
}) => {
  const handleUpdateFile = (uploadedFiles) => {
    changed({
      uploadedFiles,
      name: name,
    });
  };

  const getMaxFileSize = (maxFileSize) => {
    if (!maxFileSize) return null;
    const inputMaxFileSize =  maxFileSize.match(/\d+/)?.[0]
    return inputMaxFileSize;
  }

  return (
    <div className={props.className}>
      <FilePond
        onupdatefiles={onupdatefiles ?? handleUpdateFile}
        name={name}
        onerror={onerror}
        onremovefile={(error, file) => {
          if(handleRemoveFile) {
            return handleRemoveFile(name, file, getMaxFileSize(props.maxFileSize));
          }
          return true
        }}
        beforeAddFile={(file) => {
          if(handleBeforeAddFile) {
            return handleBeforeAddFile(file);
          }
          return true;
        }}
        {...props}
      />
    </div>
  );
};

export default React.memo(FileUpload);
