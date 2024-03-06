import React, { useContext } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import modalStyles from "../CustomModal.module.css";
import clsx from "clsx";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import AssignEditHistoryCodeForm from "./AssignEditHistoryCodeForm";

const AssignEditHistoryCodeModal = ({ codeHistory = null }) => {
  const {
    school,
    isAssignedUpdateAccessCodeModalOpen,
    toggleAssignedUpdateAccessCodeModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);

  return (
    <Modal
      isOpen={isAssignedUpdateAccessCodeModalOpen}
      toggle={toggleAssignedUpdateAccessCodeModalVisibility}
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
          Update Assign Kode Akses
        </div>
        <div className={clsx("modal-header-secondary-text")}>
          {school?.name}
        </div>
      </ModalHeader>
      <ModalBody>
        <AssignEditHistoryCodeForm codeHistory={codeHistory} />
      </ModalBody>
    </Modal>
  );
};

export default AssignEditHistoryCodeModal;
