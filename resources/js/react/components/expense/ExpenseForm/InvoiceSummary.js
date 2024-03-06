import classnames from "classnames";
import React, { useState, useEffect, useContext } from "react";
import { Trash2 } from "react-feather";
import { Controller } from "react-hook-form";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import { useFileUpload } from "../../../hooks/useFileUpload";
import FileUpload from "../../core/file-upload/FileUpload";
import { priceFormatter } from "../../../utility/Utils";
import FilePreview from "../../core/file-upload/FilePreview";

const InvoiceSummary = ({ control, total, setValue, fields, handleRemove }) => {
  const [isAddNotes, setIsAddNotes] = useState(false);
  const [userFiles] = useState({
    files: [],
  });

  const {
    files,
    fileErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleSelectedFile,
  } = useFileUpload(userFiles);

  const handleToggleNotes = () => {
    setIsAddNotes((isAdd) => {
      return !isAdd;
    });
  };

  useEffect(() => {
    if (!files?.files?.length) return;
    setValue("files", files.files);
  }, [files]);

  const getFileColor = (mimeType) => {
    const colors = {
      doc: "primary",
      docx: "primary",
      pdf: "success",
    };
    const isSupported = typeof colors[mimeType] != "undefined";
    return isSupported ? colors[mimeType] : "primary";
  };

  return (
    <Row className="mt-3 d-flex justify-content-between">
      <Col md={4}>
        <FormGroup>
          <Label>Lampiran</Label>
          <FileUpload
            {...registerFile("files")}
            changed={handleSelectedFile}
            allowMultiple={true}
            name="files"
            maxFileSize="5MB"
            onerror={(e) => handleError("files", e)}
            className={classnames({
              "filepond-is-invalid": fileErrors.files.length > 0,
            })}
          />

          {fields.map((attachment, i) => {
            const nameArray = attachment.name.split(",");
            const extension = nameArray[nameArray.length - 1];
            return (
              <div
                key={i}
                className="d-flex justify-content-between align-items-center"
              >
                <FilePreview
                  title={attachment.name}
                  desc={extension}
                  color={`light-${getFileColor(extension)}`}
                  className="mb-0"
                />
                <Trash2
                  size="20"
                  className="text-danger mr-1 cursor-pointer"
                  onClick={() => handleRemove(i)}
                />
              </div>
            );
          })}
        </FormGroup>

        <div className="form-label-group mt-2">
          <Controller
            name="note"
            defaultValue=""
            control={control}
            render={({ field }) => {
              const { ref, ...rest } = field;
              return (
                <>
                  <Input
                    {...rest}
                    rows="3"
                    type="textarea"
                    innerRef={ref}
                    value={field.value}
                    placeholder="Catatan"
                    value={field.value ? field.value : ""}
                  />
                  <Label>Catatan</Label>
                </>
              );
            }}
          />
        </div>
      </Col>

      <Col md={6} className="tex-right">
        <ul className="list-unstyled">
          <li className="d-flex justify-content-between">
            <p>Sub Total</p>
            <p>{priceFormatter(total)}</p>
          </li>
          {/* <li className="d-flex justify-content-between">
            <p>PPN</p>
            <p>Rp 9.000,00</p>
          </li> */}
          <li className="d-flex justify-content-between font-weight-bold">
            <h4>Total</h4>
            <h4>{priceFormatter(total)}</h4>
          </li>
        </ul>
      </Col>
    </Row>
  );
};

export default InvoiceSummary;
