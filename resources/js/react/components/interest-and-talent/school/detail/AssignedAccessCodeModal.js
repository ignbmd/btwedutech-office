import React, { Fragment, useContext, useState } from "react";
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
import moment from "moment-timezone";

const AssignedAccessCodeModal = () => {
  const {
    school,
    isAssignedAccessCodeModalOpen,
    toggleAssignedAccessCodeModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);

  return (
    <Modal
      isOpen={isAssignedAccessCodeModalOpen}
      toggle={toggleAssignedAccessCodeModalVisibility}
      backdrop={true}
      centered={true}
      scrollable={true}
      className={clsx(
        modalStyles.CustomModal,
        modalStyles.AssginedCodeCustomModal
      )}
      size="lg"
    >
      <ModalHeader
        className={clsx(`justify-content-center align-items-center p-2`)}
        style={{ backgroundColor: "#fff" }}
        toggle={toggleAssignedAccessCodeModalVisibility}
      >
        Riwayat Kode Terassign
      </ModalHeader>
      <ModalBody>
        <table>
          <thead>
            <tr>
              <th>Tgl Assign</th>
              <th>Kode</th>
              <th>Kode Mulai Berlaku</th>
              <th>Kode Expired</th>
            </tr>
          </thead>
          <tbody>
            {school?.exam_codes?.length ? (
              school?.exam_codes?.map((value, index) => {
                const formattedStartDate = value.start_date
                  ? `${moment(value.start_date)
                      .tz("Asia/Jakarta")
                      .format("DD/MM/YYYY - HH:mm")} WIB`
                  : "-";
                const formattedExpiredDate = value.expired_date
                  ? `${moment(value.expired_date)
                      .tz("Asia/Jakarta")
                      .format("DD/MM/YYYY - HH:mm")} WIB`
                  : "-";
                const formattedCreatedAt = moment(value.created_at)
                  .tz("Asia/Jakarta")
                  .format("DD/MM/YYYY");
                return (
                  <tr key={index}>
                    <td>{formattedCreatedAt}</td>
                    <td>{value.code}</td>
                    <td>{formattedStartDate}</td>
                    <td>{formattedExpiredDate}</td>
                  </tr>
                );
              })
            ) : (
              <td colSpan="4" className="text-center">
                Data kosong
              </td>
            )}
          </tbody>
        </table>
      </ModalBody>
    </Modal>
  );
};

export default AssignedAccessCodeModal;
