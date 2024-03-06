import React, { useContext } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
} from "reactstrap";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import modalStyles from "../CustomModal.module.css";
import clsx from "clsx";
import AddSchoolAdminForm from "./AddSchoolAdminForm";

const AddSchoolAdminModal = () => {
  const {
    isAddNewSchoolAdminModalOpen,
    toggleAddNewSchoolAdminModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);

  return (
    <Modal
      isOpen={isAddNewSchoolAdminModalOpen}
      toggle={toggleAddNewSchoolAdminModalVisibility}
      backdrop="static"
      centered={true}
      scrollable={true}
      keyboard={false}
      className={clsx(modalStyles.CustomModal)}
      size="lg"
    >
      <ModalHeader
        className={clsx(`justify-content-center align-items-center p-3`)}
        style={{ backgroundColor: "#fff" }}
      >
        Buat Akun Admin Sekolah
      </ModalHeader>
      <ModalBody>
        <AddSchoolAdminForm />
      </ModalBody>
    </Modal>
  );
};

export default AddSchoolAdminModal;
