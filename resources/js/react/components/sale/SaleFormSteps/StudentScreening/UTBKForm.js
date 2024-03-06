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
import { getUserFromBlade } from "../../../../utility/Utils";

import "flatpickr/dist/themes/airbnb.css";
import "react-slidedown/lib/slidedown.css";
import "filepond/dist/filepond.min.css";
import "./StudentScreening.css";

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

const user = getUserFromBlade();
const userBranchCode = user?.branch_code ?? null;

const UTBKForm = ({
  stepper,
  selectedProduct,
  selectedStudent,
  selectedStudentDetail,
  setScreeningResult,
}) => {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showPeminatanScoreModal, setShowPeminatanScoreModal] = useState(false);
  const [showUTBKScoreModal, setShowUTBKScoreModal] = useState(false);
  const [isFetchingUKAScore, setIsFetchingUKAScore] = useState(false);
  const [isFetchingPeminatanScore, setIsFetchingPeminatanScore] =
    useState(false);
  const [isDownloadingStudentResult, setIsDownloadingStudentResult] =
    useState(false);
  const [ukaScores, setUKAScores] = useState([]);
  const [peminatanScores, setPeminatanScores] = useState([]);
  const [isAllFormValuesFilled, setIsAllFormValuesFilled] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState();
  const [isValidEmailUKA, setIsValidEmailUKA] = useState();
  const {
    trigger,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const {
    matematika,
    bahasa_indonesia,
    bahasa_inggris,
    peminatan_score,
    utbk_score,
  } = watch();

  useEffect(() => {
    return () => {
      isCanceled.current = true;
      source.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      matematika &&
      bahasa_indonesia &&
      bahasa_inggris &&
      peminatan_score &&
      utbk_score
    ) {
      setIsAllFormValuesFilled(true);
      return;
    }
    setIsAllFormValuesFilled(false);
  }, [
    matematika,
    bahasa_indonesia,
    bahasa_inggris,
    peminatan_score,
    utbk_score,
  ]);

  useEffect(() => {
    setValue("utbk_student_email", selectedStudent?.email);
    setValue("peminatan_student_email", selectedStudent?.email);
    setIsValidEmail(isEmailValid(selectedStudent?.email));
    setIsValidEmailUKA(isEmailValid(selectedStudent?.email));
  }, [selectedStudent?.email]);

  const togglePeminatanScoreModal = () => {
    setShowPeminatanScoreModal(!showPeminatanScoreModal);
  };

  const toggleUTBKScoreModal = () => {
    setShowUTBKScoreModal(!showUTBKScoreModal);
  };

  const handleFindAndShowPeminatanScore = async () => {
    setShowPeminatanScoreModal(false);
    setValue("peminatan_score", "");

    const email = getValues("peminatan_student_email");
    if (!email) return;

    try {
      setIsFetchingPeminatanScore(true);
      const response = await axios.get(
        `/api/psikotest/student-result/find-by-email/${email}`
      );
      const body = (await response?.data?.data) ?? [];
      const status = response?.status;
      setPeminatanScores(body);
    } catch (error) {
      setPeminatanScores([]);
    } finally {
      setIsFetchingPeminatanScore(false);
      setShowPeminatanScoreModal(true);
    }
  };

  const handleFindAndShowUTBKScore = async () => {
    setShowUTBKScoreModal(false);
    setValue("utbk_score", "");

    const email = getValues("utbk_student_email");
    if (!email) return;
    try {
      setIsFetchingUKAScore(true);
      const response = await axios.get(
        `/api/students/${email}/uka-code-scores`
      );
      const body = (await response?.data?.data?.ptn_histories) ?? [];
      const status = response?.status;
      setUKAScores(body);
    } catch (error) {
      setUKAScores([]);
    } finally {
      setIsFetchingUKAScore(false);
      setShowUTBKScoreModal(true);
    }
  };

  const handleSelectPeminatanScore = async (student_result_id) => {
    try {
      setIsDownloadingStudentResult(true);
      const response = await axios.get(
        `/api/psikotest/participant-list/${student_result_id}/download-link`
      );
      const body = (await response?.data?.data) ?? null;
      if (body?.download_link) {
        window.open(body?.download_link, "_blank");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloadingStudentResult(false);
    }
  };

  const handleSelectUTBKScore = (score) => {
    setValue("utbk_score", score);
    setShowUTBKScoreModal(false);
    setUKAScores([]);
  };

  const handleInputEmailIqChange = (event) => {
    if (event.target.id == "peminatan_student_email") {
      setValue("peminatan_student_email", event.target.value);
      setIsValidEmail(isEmailValid(event.target.value));
    }
    if (!event.target.value) {
      setIsValidEmail(undefined);
      return;
    }
    setIsValidEmail(isEmailValid(event.target.value));
  };

  const handleInputEmailUKAChange = (event) => {
    if (event.target.id == "utbk_student_email") {
      setValue("utbk_student_email", event.target.value);
      setIsValidEmailUKA(isEmailValid(event.target.value));
    }

    if (!event.target.value) {
      setIsValidEmailUKA(undefined);
      return;
    }
    setIsValidEmailUKA(isEmailValid(event.target.value));
  };

  const isEmailValid = (email) => {
    // Regex untuk validasi email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const emailRegexResult = emailRegex.test(email);
    return emailRegexResult;
  };

  const handleInputValueMatematika = (e) => {
    const value = parseInt(e.target.value);
    setValue("matematika", e.target.value);
    if (value > 10) {
      setError("matematika", {
        type: "manual",
        message: "Nilai tidak boleh lebih dari 10",
      });
    } else {
      clearErrors();
    }
  };

  const handleInputValueIndonesian = (e) => {
    const value = parseInt(e.target.value);
    setValue("bahasa_indonesia", e.target.value);
    if (value > 10) {
      setError("bahasa_indonesia", {
        type: "manual",
        message: "Nilai tidak boleh lebih dari 10",
      });
    } else {
      clearErrors();
    }
  };

  const handleInputValueEnglish = (e) => {
    const value = parseInt(e.target.value);
    setValue("bahasa_inggris", e.target.value);
    if (value > 10) {
      setError("bahasa_inggris", {
        type: "manual",
        message: "Nilai tidak boleh lebih dari 10",
      });
    } else {
      clearErrors();
    }
  };

  const submitForm = async () => {
    trigger();
    setIsSubmittingForm(true);
    const form = getValues();
    const payload = {
      matematika: +form.matematika,
      bahasa_indonesia: +form.bahasa_indonesia,
      bahasa_inggris: +form.bahasa_inggris,
      iq_score: +form.peminatan_score,
      uka_score: +form.utbk_score,
      gender: selectedStudent?.gender == "1" ? "Male" : "Female",
      program: "utbk",
      smartbtw_id: selectedStudent?.id,
      product: {
        product_code: selectedProduct?.product_code,
        price: selectedProduct?.sell_price,
        branch_code: userBranchCode,
      },
    };
    const result = await checkStudentScreeningResult(payload);
    setScreeningResult(result);
    setIsSubmittingForm(false);
    stepper.next();
    // setSelectedClass({
    //   id: user_class.value,
    //   name: user_class.label,
    // });
    // stepper.next();
  };

  const checkStudentScreeningResult = async (payload) => {
    try {
      const response = await axios.post(
        `/api/sale/student-screening-result`,
        payload
      );
      const body = (await response?.data) ?? null;
      return body;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkipStep = () => {
    reset();
    setScreeningResult({
      is_eligible_to_discount: false,
      selected_discount_code: null,
      received_discount_amount: 0,
      message: null,
    });
    setIsValidEmail(null);
    setIsValidEmailUKA(null);
    stepper.next();
  };

  return (
    <Fragment>
      <AvForm
        className={classnames("mt-50", isSubmittingForm && "block-content")}
        onSubmit={handleSubmit(submitForm)}
      >
        <Row className="justify-content-between align-items-end">
          <Col md={12}>
            <div className="content-header">
              <h5 className="mb-0">Nilai Akademik Siswa</h5>
            </div>
            <Alert color="warning" isOpen>
              <div className="alert-body">
                Masukan nilai rata-rata akademik dari semester 1 (satu) hingga
                semester akhir
              </div>
            </Alert>

            <Controller
              name="matematika"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="matematika">Matematika</Label>
                    <Input
                      {...rest}
                      type="number"
                      id="matematika"
                      min={0}
                      max={10}
                      innerRef={ref}
                      onChange={(e) => handleInputValueMatematika(e)}
                      placeholder="Masukan Nilai 1 - 10"
                      invalid={error !== undefined}
                      onWheel={(e) => e.target.blur()}
                    />
                    {error && <FormFeedback>{error.message}</FormFeedback>}
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="bahasa_indonesia"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="bahasa_indonesia">Bahasa Indonesia</Label>
                    <Input
                      {...rest}
                      id="bahasa_indonesia"
                      type="number"
                      min={0}
                      max={10}
                      innerRef={ref}
                      onChange={(e) => handleInputValueIndonesian(e)}
                      invalid={error !== undefined}
                      placeholder="Masukan Nilai 1 - 10"
                      onWheel={(e) => e.target.blur()}
                    />
                    {error && <FormFeedback>{error.message}</FormFeedback>}
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="bahasa_inggris"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="bahasa_inggris">Bahasa Inggris</Label>
                    <Input
                      {...rest}
                      id="bahasa_inggris"
                      type="number"
                      min={0}
                      max={10}
                      onChange={(e) => handleInputValueEnglish(e)}
                      innerRef={ref}
                      invalid={error !== undefined}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Masukan Nilai 1 - 10"
                    />
                    {error && <FormFeedback>{error.message}</FormFeedback>}
                  </FormGroup>
                );
              }}
            />

            <hr className="my-1" />

            <div className="content-header">
              <h5 className="mb-0">
                Nilai IQ Siswa Berdasarkan Hasil Minat Bakat
              </h5>
            </div>

            <Controller
              name="peminatan_student_email"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <Row className="justify-content-between align-items-center flex-fill">
                    <Col md={10}>
                      <FormGroup>
                        <Label for="peminatan_student_email">
                          Cari Hasil Minat Bakat
                        </Label>
                        <Input
                          {...rest}
                          id="peminatan_student_email"
                          type="email"
                          placeholder="Cari berdasarkan email"
                          innerRef={ref}
                          onChange={(event) => handleInputEmailIqChange(event)}
                          invalid={isValidEmail == false}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <Button
                        size="md"
                        color="primary"
                        className="w-100 mt-50"
                        onClick={() => handleFindAndShowPeminatanScore()}
                        disabled={isFetchingPeminatanScore || !isValidEmail}
                      >
                        {isFetchingPeminatanScore
                          ? "Mohon tunggu"
                          : "Cari Nilai IQ"}
                      </Button>
                    </Col>
                  </Row>
                );
              }}
            />

            <Controller
              name="peminatan_score"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="peminatan_score">
                      Nilai IQ Siswa Pada Hasil Minat Bakat
                    </Label>
                    <Input
                      {...rest}
                      id="peminatan_score"
                      type="number"
                      min={0}
                      placeholder="Masukan Nilai IQ"
                      innerRef={ref}
                      invalid={error && true}
                      onWheel={(e) => e.target.blur()}
                    />
                  </FormGroup>
                );
              }}
            />

            <hr className="my-1" />

            <div className="content-header">
              <h5 className="mb-0">Nilai UKA UTBK SNBT Siswa</h5>
            </div>

            <Controller
              name="utbk_student_email"
              defaultValue={selectedStudentDetail?.email ?? ""}
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <Row className="justify-content-between align-items-center">
                    <Col md={10}>
                      <FormGroup>
                        <Label for="utbk_student_email">
                          Cari Nilai UKA UTBK SNBT Siswa
                        </Label>
                        <Input
                          {...rest}
                          id="utbk_student_email"
                          type="email"
                          innerRef={ref}
                          placeholder="Cari berdasarkan email"
                          invalid={isValidEmailUKA == false}
                          onChange={(event) => handleInputEmailUKAChange(event)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <Button
                        size="md"
                        color="primary"
                        className="w-100 mt-50"
                        onClick={() => handleFindAndShowUTBKScore()}
                        disabled={isFetchingUKAScore || !isValidEmailUKA}
                      >
                        {isFetchingUKAScore
                          ? "Mohon Tunggu"
                          : "Cari Nilai UTBK"}
                      </Button>
                    </Col>
                  </Row>
                );
              }}
            />

            <Controller
              name="utbk_score"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="utbk_score">Nilai UKA UTBK SNBT Siswa</Label>
                    <Input
                      {...rest}
                      id="utbk_score"
                      type="number"
                      min={0}
                      innerRef={ref}
                      placeholder="Nilai UKA UTBK SNBT"
                      invalid={error && true}
                      disabled={true}
                      onWheel={(e) => e.target.blur()}
                    />
                  </FormGroup>
                );
              }}
            />

            <div className="d-flex justify-content-between mt-3">
              <Button
                color="primary"
                className="btn-prev"
                onClick={() => {
                  reset();
                  setIsValidEmail(null);
                  setIsValidEmailUKA(null);
                  stepper.previous();
                }}
              >
                <ArrowLeft
                  size={14}
                  className="align-middle mr-sm-25 mr-0"
                ></ArrowLeft>
                <span className="align-middle d-sm-inline-block d-none">
                  Sebelumnya
                </span>
              </Button>
              <div>
                <Button
                  outline
                  type="button"
                  color="primary"
                  className="btn-next mr-1"
                  onClick={handleSkipStep}
                >
                  <span className="align-middle d-sm-inline-block">Lewati</span>
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="btn-next"
                  disabled={!isAllFormValuesFilled}
                >
                  <span className="align-middle d-sm-inline-block d-none">
                    {/* {isCreatingStudent ? "Please wait..." : "Select & Next"} */}
                    Pilih & Lanjutkan
                  </span>

                  <ArrowRight
                    size={14}
                    className="align-middle ml-sm-25 ml-0"
                  ></ArrowRight>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </AvForm>

      {/* Start of Peminatan Score Modal  */}
      <Modal
        backdrop={true}
        centered={true}
        scrollable={true}
        keyboard={false}
        size="xl"
        isOpen={showPeminatanScoreModal}
        toggle={togglePeminatanScoreModal}
      >
        <ModalHeader
          className={clsx(`justify-content-center align-items-center p-2`)}
          style={{ backgroundColor: "#fff" }}
        >
          Hasil Pencarian Minat Bakat Siswa
        </ModalHeader>
        <ModalBody>
          <div className="student-screening-table-container">
            <table className="w-100 student-screening-table">
              <thead></thead>
              <tbody>
                {!peminatanScores?.length ? (
                  <tr>
                    <td className="text-center">Tidak ada data</td>
                  </tr>
                ) : (
                  peminatanScores?.map((value, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <h6>{value?.name ? value?.name : "-"}</h6>
                          <p className="text-muted">
                            {value?.email ? value?.email : "-"}
                          </p>
                        </td>
                        <td>
                          <div>
                            <p>Asal Sekolah/Cabang</p>
                            <p className="text-uppercase">
                              {value?.instance_name
                                ? value?.instance_name
                                : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p>Pelaksanaan</p>
                            <p className="text-uppercase">
                              {value?.date_test ? value?.date_test : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p>Kode Tes</p>
                            <p className="text-uppercase">
                              {value?.code ? value?.code : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <Button
                            color="primary"
                            className="text-uppercase"
                            onClick={() =>
                              handleSelectPeminatanScore(value?._id)
                            }
                            disabled={isDownloadingStudentResult}
                          >
                            <Download size={14}></Download>
                            <span>Unduh</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ModalBody>
      </Modal>
      {/* End of Peminatan Score Modal */}

      {/* Start of UTBK Score Modal  */}
      <Modal
        backdrop={true}
        centered={true}
        scrollable={true}
        size="xl"
        isOpen={showUTBKScoreModal}
        toggle={toggleUTBKScoreModal}
      >
        <ModalHeader
          className={clsx(`justify-content-center align-items-center p-2`)}
          style={{ backgroundColor: "#fff" }}
        >
          Hasil Pencarian UKA UTBK SNBT
        </ModalHeader>
        <ModalBody>
          <div className="student-screening-table-container">
            <table className="w-100 student-screening-table">
              <thead></thead>
              <tbody>
                {!ukaScores?.length ? (
                  <tr>
                    <td className="text-center">Tidak ada data</td>
                  </tr>
                ) : (
                  ukaScores?.map((value, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <h6>
                            {value?.student_name ? value?.student_name : "-"}
                          </h6>
                          <p className="text-muted">
                            {value?.student_email ? value?.student_email : "-"}
                          </p>
                        </td>
                        <td>
                          <div>
                            <p>Asal Sekolah/Cabang</p>
                            <p className="text-uppercase">
                              {value?.school_origin
                                ? value?.school_origin
                                : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p>Pelaksanaan</p>
                            <p className="text-uppercase">
                              {value?.start ? value?.start : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p>Kode Tes</p>
                            <p className="text-uppercase">
                              {value?.exam_code ? value?.exam_code : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p>Nilai UTBK</p>
                            <p className="text-uppercase">
                              {value?.total ? value?.total : "-"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <Button
                            color="primary"
                            className="text-uppercase"
                            onClick={() => handleSelectUTBKScore(value?.total)}
                          >
                            Pilih
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ModalBody>
      </Modal>
      {/* End of UTBK Score Modal */}
    </Fragment>
  );
};

export default UTBKForm;
