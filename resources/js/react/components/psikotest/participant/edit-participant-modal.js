import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Row,
  Col,
  Label,
} from "reactstrap";
import { Upload } from "react-feather";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

// register plugin
const EditParticipantModal = ({ openEdit, closeEdit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [codeAccess, setCodeAccess] = useState("");
  const [result, setResult] = useState("");
  const [files, setFiles] = useState("");

  // const handleFileChange = () => {};
  const handleUpload = () => {
    // Handle file upload logic here
    console.log("Upload clicked");
  };

  // const handleSubmit  = () => {};
  const handleSubmit = (event) => {
    // Handle form submission logic here
    event.preventDefault();
    // console.log("Form submitted");
  };

  return (
    <div>
      <Modal
        isOpen={openEdit}
        toggle={closeEdit}
        centered={true}
        scrollable={true}
        style={{ height: "400px !important" }}
      >
        <ModalHeader toggle={closeEdit} style={{ backgroundColor: "#fff" }}>
          Edit Data Peserta
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label className="form-label">Kode Akses</Label>
                  <input
                    type="text"
                    value={codeAccess}
                    className="form-control"
                    onChange={(event) => setCodeAccess(event.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label className="form-label">Nama :</Label>
                  <input
                    type="text"
                    value={name}
                    className="form-control"
                    onChange={(event) => setName(event.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label className="form-label">Email :</Label>
                  <input
                    type="text"
                    value={email}
                    className="form-control"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <p className="text-center">Upload Hasil Minat & Bakat</p>
                  <FilePond
                    icon={Upload}
                    files={files}
                    onupdatefiles={setFiles}
                    allowMultiple={true}
                    maxFiles={1}
                    server="files"
                    name="files"
                    labelIdle='Seret & Jatuhkan atau <span class="filepond--label-action">Pilih File</span> untuk di Upload'
                  />
                </FormGroup>
              </Col>
            </Row>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeEdit}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Simpan Data
          </Button>{" "}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditParticipantModal;
