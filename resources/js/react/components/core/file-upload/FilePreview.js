import React from "react";
import classnames from "classnames";
import { File } from "react-feather";
import { Card, CardBody, Media } from "reactstrap";

import Avatar from "../avatar";

const FilePreview = ({ className, title, desc, color = "light-primary" }) => {
  return (
    <Card className={classnames("card-transaction", className)}>
      <CardBody className={classnames("p-1")}>
        <div className="transaction-item">
          <Media>
            <Avatar
              className="rounded"
              color={color}
              icon={<File size={18} />}
            />
            <Media body>
              <h6 className="transaction-title">{title}</h6>
              <small>{desc}</small>
            </Media>
          </Media>
        </div>
      </CardBody>
    </Card>
  );
};

export default FilePreview;
