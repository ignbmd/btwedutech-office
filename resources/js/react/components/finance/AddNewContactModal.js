import * as yup from "yup";
import classnames from "classnames";
import React, { useEffect, useState, useContext } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import {
  Form,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormGroup,
  Input,
  Col,
  FormFeedback,
} from "reactstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import AvCheckboxGroup from "availity-reactstrap-validation-safe/lib/AvCheckboxGroup";
import { getUserFromBlade, selectThemeColors } from "../../utility/Utils";
import {
  createBranchContact,
  createContact,
  getContactsByBranchCode,
} from "../../data/finance-contact";
import { ExpenseContext } from "../../context/ExpenseContext";

const addContactSchema = yup.object().shape({
  name: yup.string().required("Harus diisi"),
  email: yup.string().required("Harus diisi"),
  address: yup.string(),
  phone: yup.string().required("Harus diisi"),
  bank_account_name: yup.string().required("Harus diisi"),
  bank_account_type: yup.object().typeError("Harus diisi"),
  bank_account_number: yup.string().required("Harus diisi"),
});

const bankAccountTypes = [
  { label: "BCA", value: "BCA" },
  { label: "BRI", value: "BRI" },
  { label: "BNI", value: "BNI" },
];

const AddNewContactModal = ({
  isShow,
  handleShow,
  withAddress = true,
  defaultBranchCode = null,
  setContact,
}) => {
  const defaultValues = {
    branch_code: "",
    name: "",
    type: "",
    email: "",
    address: "",
    phone: "",
    bank_account_name: "",
    bank_account_type: "",
    bank_account_number: "",
  };

  const {
    watch,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addContactSchema),
    defaultValues,
  });

  const [user] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    loadContactOption,
    loadContactOptionByBranchCode,
    branchOption,
    loadBranchOption,
    setSelectedContactId,
  } = useContext(ExpenseContext);

  useEffect(() => {
    setSelectedContactId(null);
    loadBranchOption();
    setDefaultBranch();
  }, []);

  const setDefaultBranch = () => {
    setValue("branch_code", defaultBranchCode);
  };

  const isCentralOffice = () => {
    return user?.branch_code == "PT0000";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await createBranchContact(data);
    if (!result?.success) {
      toastr.error(result?.message, "Terjadi Kesalahan", {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
      return;
    }
    setIsSubmitting(false);
    handleShow(false);
    setContact(await getContactsByBranchCode(defaultBranchCode));
    reset(defaultValues);
  };

  return (
    <Modal
      isOpen={isShow}
      toggle={() => handleShow(!isShow)}
      className="modal-dialog-centered"
    >
      <Form>
        <ModalHeader toggle={() => handleShow(!isShow)}>
          Buat Kontak Baru
        </ModalHeader>

        <ModalBody>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="name">
                    Nama Panggilan
                  </Label>
                  <Col sm="9">
                    <Input
                      {...rest}
                      id="name"
                      name="name"
                      type="text"
                      innerRef={ref}
                      invalid={!!error}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          <Controller
            name="email"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="email">
                    Email
                  </Label>
                  <Col sm="9">
                    <Input
                      {...rest}
                      id="email"
                      innerRef={ref}
                      invalid={!!error}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          {withAddress ? (
            <Controller
              name="address"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup row>
                    <Label sm="3" for="address">
                      Alamat (Opsional)
                    </Label>
                    <Col sm="9">
                      <Input
                        {...rest}
                        rows="3"
                        id="address"
                        type="textarea"
                        innerRef={ref}
                        invalid={!!error}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </Col>
                  </FormGroup>
                );
              }}
            />
          ) : null}

          <Controller
            name="phone"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="phone">
                    No Handphone
                  </Label>
                  <Col sm="9">
                    <Input
                      {...rest}
                      type="number"
                      id="phone"
                      innerRef={ref}
                      invalid={!!error}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          <Controller
            name="bank_account_type"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="name">
                    Rekening Bank
                  </Label>
                  <Col sm="9">
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
                      options={bankAccountTypes}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />{" "}
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          <Controller
            name="bank_account_name"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="name">
                    Atas Nama
                  </Label>
                  <Col sm="9">
                    <Input
                      {...rest}
                      id="bank_account_name"
                      name="bank_account_name"
                      type="text"
                      innerRef={ref}
                      invalid={!!error}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          <Controller
            name="bank_account_number"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup row>
                  <Label sm="3" for="phone">
                    No. Rekening
                  </Label>
                  <Col sm="9">
                    <Input
                      {...rest}
                      type="number"
                      id="bank_account_number"
                      innerRef={ref}
                      invalid={!!error}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />
        </ModalBody>

        <ModalFooter>
          <Button outline color="secondary" onClick={() => handleShow(!isShow)}>
            Tutup
          </Button>{" "}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            color="primary"
          >
            {isSubmitting ? "Menyimpan" : "Simpan"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
export default AddNewContactModal;
