import React, { useContext, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import PropTypes from "prop-types";

import modalStyles from "./CustomModal.module.css";
import { InterestAndTalentSchoolContext } from "../../../context/InterestAndTalentSchoolContext";
import clsx from "clsx";
import SchoolForm from "./SchoolForm";

const SchoolModal = ({ type }) => {
  const { isSchoolModalOpen, toggleSchoolModalVisibility } = useContext(
    InterestAndTalentSchoolContext
  );

  return (
    <Modal
      isOpen={isSchoolModalOpen}
      toggle={toggleSchoolModalVisibility}
      backdrop="static"
      centered={true}
      keyboard={false}
      className={clsx(`${modalStyles.CustomModal} ${modalStyles.SchoolModal}`)}
      size="xl"
    >
      <ModalHeader
        className={clsx(`justify-content-center align-items-center p-3`)}
        style={{ backgroundColor: "#fff" }}
      >
        {type === "create" ? "Tambah" : "Edit"} Sekolah
      </ModalHeader>
      <ModalBody>
        <SchoolForm type={type} />
      </ModalBody>
    </Modal>
  );
};

SchoolModal.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default SchoolModal;
