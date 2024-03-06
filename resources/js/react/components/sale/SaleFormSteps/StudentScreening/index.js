import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { AlertCircle, ArrowLeft, ArrowRight, Download } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import {
  Label,
  FormGroup,
  Row,
  Col,
  Button,
  Input,
  FormFeedback,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";

import "flatpickr/dist/themes/airbnb.css";
import "react-slidedown/lib/slidedown.css";
import "filepond/dist/filepond.min.css";
import "./StudentScreening.css";
import SKDForm from "./SKDForm";
import UTBKForm from "./UTBKForm";
import SpinnerCenter from "../../../core/spinners/Spinner";

const classSchema = {
  user_class: yup.object().required(),
};

const colorBlindOptions = [
  {
    label: "Ya",
    value: "1",
  },
  {
    label: "Tidak",
    value: "0",
  },
];

const StudentScreening = ({
  stepper,
  selectedProduct,
  selectedStudent,
  selectedStudentDetail,
  setScreeningResult,
}) => {
  const [siswaUnggulanDiscountCode, setSiswaUnggulanDiscountCode] = useState();
  const [
    isFetchingSiswaUnggulanDiscountCode,
    setIsFetchingSiswaUnggulanDiscountCode,
  ] = useState(false);

  useEffect(() => {
    if (!selectedProduct?.product_code) return;
    getAvailableSiswaUnggulanProductDiscountCode(
      selectedProduct?.product_code,
      selectedProduct?.branch_code
    );
  }, [selectedProduct?.product_code]);

  const getAvailableSiswaUnggulanProductDiscountCode = async (
    product_code,
    branch_code
  ) => {
    try {
      setIsFetchingSiswaUnggulanDiscountCode(true);
      const response = await axios.get(
        `/api/sale/siswa-unggulan-products/${product_code}/branches/${branch_code}/available-discount-code`
      );
      const data = (await response.data) ?? null;
      setSiswaUnggulanDiscountCode(data);
    } catch (error) {
      console.log(error);
      setSiswaUnggulanDiscountCode(null);
    } finally {
      setIsFetchingSiswaUnggulanDiscountCode(false);
    }
  };

  return (
    <Fragment>
      {isFetchingSiswaUnggulanDiscountCode ? (
        <SpinnerCenter />
      ) : (
        <Alert
          color="warning"
          className="p-2 mb-2 d-flex justify-content-between align-items-center"
        >
          <div>
            {selectedProduct?.program == "skd"
              ? "Sisa Kuota Siswa Unggulan Program SKD"
              : null}
            {selectedProduct?.program == "tps"
              ? "Sisa Kuota Siswa Unggulan Program UTBK"
              : null}
            {selectedProduct?.program == "tni-polri"
              ? "Sisa Kuota Siswa Unggulan Program SKD"
              : null}
          </div>
          <div className="ml-auto">
            {siswaUnggulanDiscountCode?.remaining_quota
              ? siswaUnggulanDiscountCode?.remaining_quota
              : 0}{" "}
            Kuota
          </div>
        </Alert>
      )}
      {selectedProduct?.program == "skd" ||
      selectedProduct?.program == "tni-polri" ? (
        <SKDForm
          stepper={stepper}
          selectedProduct={selectedProduct}
          selectedStudent={selectedStudent}
          selectedStudentDetail={selectedStudentDetail}
          setScreeningResult={setScreeningResult}
        />
      ) : null}
      {selectedProduct?.program == "tps" ? (
        <UTBKForm
          stepper={stepper}
          selectedProduct={selectedProduct}
          selectedStudent={selectedStudent}
          selectedStudentDetail={selectedStudentDetail}
          setScreeningResult={setScreeningResult}
        />
      ) : null}
    </Fragment>
  );
};

export default StudentScreening;
