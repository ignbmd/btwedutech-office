import React from 'react'
import classnames from "classnames";

const ImagePreview = ({ files, name }) => {
  return (
    <div
      className={classnames(
        typeof files?.[name][0] !== "string" && "d-none",
        "mt-50"
      )}
    >
      <img src={files[name][0]} width="100" />
    </div>
  );
};

export default ImagePreview
