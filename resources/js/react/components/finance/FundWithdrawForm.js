import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Plus, Save } from "react-feather";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import React, { useState, useRef, useEffect, Fragment } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
} from "reactstrap";
import {
  getLastSegment,
  isObjEmpty,
  priceFormatter,
  getUserFromBlade,
  showToast,
} from "../../utility/Utils";
import {
  getBranchDebt,
  getCentralReceivableHistory,
} from "../../data/branch-debt-table";

import AddNewContactModal from "./AddNewContactModal";
import EditContactModal from "./EditContactModal";

import { getBranchReceivable } from "../../data/branch-credit-table";
import {
  getContactsByBranchCode,
  getContacts,
} from "../../data/finance-contact";

import SpinnerCenter from "../core/spinners/Spinner";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};
const user = getUserFromBlade();
const { branch_code: branchCode } = user;

const bankAccountTypes = [
  { label: "BCA", value: "BCA" },
  { label: "BRI", value: "BRI" },
  { label: "BNI", value: "BNI" },
];

const FundWithdrawForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivable, setReceivable] = useState();
  const [contact, setContact] = useState();
  const [isAddNewContact, setIsAddNewContact] = useState(false);
  const [isEditContact, setIsEditContact] = useState(false);
  const FundWithdrawSchema = yup.object().shape({
    contact_id: yup.mixed().required("Harus dipilih"),
    withdraw_amount: yup
      .number()
      .min(1, "Tidak boleh 0 atau kurang")
      .max(receivable, `Tidak boleh melebihi ${priceFormatter(receivable)}`)
      .typeError("Harus diisi"),
  });
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(FundWithdrawSchema) });
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const getPayload = () => {
    const data = getValues();
    return {
      amount: +data?.withdraw_amount,
      contact_id: data?.contact_id,
      branch_code: branchCode,
    };
  };

  const submitHandler = async (data) => {
    const payload = getPayload();
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/finance/transfer-fund/branch", {
        ...payload,
        cancelToken: source.token,
      });
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Permintaan penarikan dana berhasil dikirim",
      });
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      if (!isCanceled.current) {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: error.response.data.message,
        });
      }
      setIsSubmitting(false);
    }
  };
  const handleShowModal = () => {
    setIsAddNewContact(true);
  };
  const handleShowEditModal = () => {
    setIsEditContact(true);
  };

  const redirectToIndex = () => {
    window.location.href = "/keuangan";
  };

  useEffect(() => {
    (async () => {
      const branchReceivable = await getBranchReceivable();
      const receivableAmount = branchReceivable?.amount;
      setReceivable(receivableAmount);

      const branchContact = await getContactsByBranchCode(branchCode);
      setContact(branchContact);
    })();
  }, []);

  useEffect(() => {
    if (!contact) return;
    setValue("contact_id", contact[0]);
  }, [contact]);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        <Form onSubmit={handleSubmit(submitHandler)}>
          <Col md={6} className={classnames("mt-2 pl-0")}>
            {!receivable ? (
              <SpinnerCenter />
            ) : (
              <>
                <h6>Total Piutang</h6>
                <h1>{priceFormatter(receivable)}</h1>
              </>
            )}
          </Col>
          <hr />
          {!contact ? (
            <SpinnerCenter />
          ) : (
            <>
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  id="withdraw_amount"
                  name="withdraw_amount"
                  control={control}
                  defaultValue={0}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="withdraw_amount">Nominal Penarikan</label>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <Cleave
                          {...field}
                          options={numeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          value={field.value ?? 0}
                          placeholder="Inputkan nominal penarikan"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </InputGroup>
                    </FormGroup>
                  )}
                />

                <Controller
                  name="contact_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label className="form-label">Kontak Penerima</Label>
                        {contact?.length > 0 ? (
                          <>
                            <Badge
                              size="sm"
                              color="light-warning"
                              className="cursor-pointer"
                              onClick={handleShowEditModal}
                            >
                              <Plus size={12} /> Klik untuk edit kontak
                            </Badge>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              disabled={true}
                              isSearchable={false}
                              // isLoading={isFetchingTcCategory}
                              options={contact}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.id}
                              classNamePrefix="select"
                              value={contact[0]}
                              className={classnames("react-select", {
                                "is-invalid": error && true,
                              })}
                            />
                          </>
                        ) : (
                          <>
                            <Badge
                              size="sm"
                              color="light-primary"
                              className="cursor-pointer"
                              onClick={handleShowModal}
                            >
                              <Plus size={12} /> Klik untuk menambahkan
                            </Badge>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              isSearchable={false}
                              // isLoading={isFetchingTcCategory}
                              options={contact}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.id}
                              classNamePrefix="select"
                              className={classnames("react-select", {
                                "is-invalid": error && true,
                              })}
                            />
                          </>
                        )}
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Button type="submit" color="gradient-success">
                  Proses
                </Button>
              </Col>
            </>
          )}
        </Form>
      </CardBody>
      <AddNewContactModal
        isShow={isAddNewContact}
        withAddress={true}
        handleShow={setIsAddNewContact}
        defaultBranchCode={branchCode}
        setContact={setContact}
      />
      {contact && (
        <EditContactModal
          isShow={isEditContact}
          withAddress={true}
          handleShow={setIsEditContact}
          defaultBranchCode={branchCode}
          contact={contact[0]}
          setContact={setContact}
        />
      )}
    </Card>
  );
};

export default FundWithdrawForm;
