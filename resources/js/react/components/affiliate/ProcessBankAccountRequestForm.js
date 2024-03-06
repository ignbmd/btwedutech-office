import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useState } from "react";
import { Label, FormGroup, Row, Col, Button, FormFeedback } from "reactstrap";
import axios from "axios";
import { AvForm } from "availity-reactstrap-validation-safe";
import {
  showToast,
  isFieldHasErrorMessage,
  getIdFromURLSegment,
} from "../../utility/Utils";
import SpinnerCenter from "../../components/core/spinners/Spinner";

const statuses = [
  {
    label: "Diterima",
    value: "ACCEPTED",
  },
  {
    label: "Ditolak",
    value: "REJECTED",
  },
];
const affiliateID = getIdFromURLSegment();

const ProcessBankAccountRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const yupObjectSchema = {};

  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const { control, getValues, watch, handleSubmit } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "all",
    defaultValues: {
      status: "",
      reason: "",
    },
  });

  const { status } = watch();

  function getFormPayload() {
    const formValues = getValues();
    return {
      affiliate_id: affiliateID,
      status: formValues?.status?.value,
      reason: formValues?.reason,
    };
  }

  async function fetchData() {
    setIsLoading(true);
    const response = await axios.get(
      `/api/affiliates/bank-account-update-requests/${affiliateID}`
    );
    const body = await response.data;
    setIsLoading(false);
    return body?.data;
  }

  async function onSubmit() {
    setIsSubmitting(true);
    const payload = getFormPayload();
    axios
      .post(`/api/affiliates/bank-account-update-requests`, {
        ...payload,
        cancelToken: source.token,
      })
      .then(() => {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data berhasil diproses",
        });
        setTimeout(() => {
          window.location.href = "/mitra/akun-bank/request-update-rekening";
        }, 5000);
      })
      .catch((error) => {
        showToast({
          type: "error",
          title: "Terjadi kesalahan",
          message:
            error?.response?.data?.message ??
            "Sistem sedang dalam perbaikan, silakan coba lagi nanti",
        });
        setIsSubmitting(false);
      });
  }

  useEffect(() => {
    (async () => {
      const data = await fetchData();
      setData(data);
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  return isLoading ? (
    <SpinnerCenter />
  ) : (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={12}>
            <h5>Data Mitra</h5>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <FormGroup className="flex-fill">
              <Label className="form-label">Nama/Email Mitra</Label>
              <div className="font-weight-bold">
                {data?.name} ({data?.email})
              </div>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup className="flex-fill">
              <Label className="form-label">Tipe Bank</Label>
              <div className="font-weight-bold">{data?.bank_type}</div>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <FormGroup className="flex-fill">
              <Label className="form-label">No. Rekening Bank</Label>
              <div className="font-weight-bold">{data?.bank_number}</div>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup className="flex-fill">
              <Label className="form-label">Foto Rekening Bank</Label>
              {data?.bank_photo ? (
                <div className="w-50">
                  <a className="w-100" href={data?.bank_photo}>
                    <img src={data?.bank_photo} className="w-100" />
                  </a>
                </div>
              ) : (
                <div className="font-weight-bold">Tidak tersedia</div>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <FormGroup className="flex-fill">
              <Label for="status" className="form-label">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <Fragment>
                      <Select
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        {...field}
                        options={statuses}
                        classNamePrefix="select"
                        className={classnames("react-select mb-50", {
                          "is-invalid": isFieldHasErrorMessage(error),
                        })}
                        id="user"
                        placeholder="Pilih Status"
                      />
                      <FormFeedback className="mb-1">
                        {error?.message}
                      </FormFeedback>
                    </Fragment>
                  );
                }}
              />
            </FormGroup>
            {status?.value == "REJECTED" ? (
              <Controller
                name="reason"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label for="name" className="form-label">
                        Alasan Ditolak
                      </Label>
                      <textarea
                        {...rest}
                        id="reason"
                        cols={10}
                        rows={5}
                        ref={ref}
                        placeholder="No. Rekening Bank tidak valid, dsb"
                        className={classnames("form-control react-select", {
                          "is-invalid": isFieldHasErrorMessage(error),
                        })}
                      ></textarea>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            ) : null}
            <div className="d-flex justify-content-end mt-2">
              <Button
                type="submit"
                color="success"
                className="btn-next"
                disabled={isSubmitting}
              >
                <span className="align-middle d-sm-inline-block">
                  {isSubmitting ? "Memproses data..." : "Proses"}
                </span>
              </Button>
            </div>
          </Col>
        </Row>
      </AvForm>
    </Fragment>
  );
};

export default ProcessBankAccountRequestForm;
