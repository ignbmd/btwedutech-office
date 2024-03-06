import React, { useContext } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import clsx from "clsx";
import modalStyles from "../CustomModal.module.css";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import AssignNewAccessCodeForm from "./AssignNewAccessCodeForm";

const AssignNewAccessCodeModal = ({ codeRequest = null }) => {
  const {
    school,
    isAssignNewAccessCodeModalOpen,
    toggleAssignNewAccessCodeModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);

  return (
    <Modal
      isOpen={isAssignNewAccessCodeModalOpen}
      toggle={toggleAssignNewAccessCodeModalVisibility}
      backdrop="static"
      centered={true}
      scrollable={true}
      keyboard={false}
      className={clsx(
        `${modalStyles.CustomModal} ${modalStyles.AccessCodeModal}`
      )}
      size="lg"
    >
      <ModalHeader
        className={clsx(`justify-content-center align-items-center p-3`)}
        style={{ backgroundColor: "#fff" }}
      >
        <div className={clsx("modal-header-primary-text mb-50")}>
          Assign Kode Akses
        </div>
        <div className={clsx("modal-header-secondary-text")}>
          {school?.name}
        </div>
      </ModalHeader>
      <ModalBody>
        <AssignNewAccessCodeForm codeRequest={codeRequest} />
      </ModalBody>
    </Modal>
  );
};

export default AssignNewAccessCodeModal;
