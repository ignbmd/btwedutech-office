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
import { getUserFromBlade, selectThemeColors } from "../../../utility/Utils";
import { createContact } from "../../../data/finance-contact";
import { ExpenseContext } from "../../../context/ExpenseContext";

const addContactSchema = yup.object().shape({
  name: yup.string().required("Nama arus diisi"),
  type: yup.array().of(yup.string().required()).min(1, "Tipe harus diisi"),
  email: yup.string(),
  address: yup.string(),
  phone: yup.string(),
});

const contactTypes = ["Supplier", "Karyawan", "Lainnya"];

const AddContactModal = ({
  isShow,
  handleShow,
  withAddress = true,
  defaultBranchCode = null,
}) => {
  const defaultValues = {
    branch_code: "",
    name: "",
    type: "",
    email: "",
    address: "",
    phone: "",
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

  const [user] = useState(getUserFromBlade());
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
    if (defaultBranchCode) {
      setValue("branch_code", defaultBranchCode);
    }

    if (!isCentralOffice()) {
      setValue("branch_code", user?.branch_code);
    }
  };

  const isCentralOffice = () => {
    return user?.branch_code == "PT0000";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await createContact(data);
    if (!result?.success) {
      toastr.error(result?.message, "Terjadi Kesalahan", {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
      return;
    }
    setSelectedContactId(result?.data?.id);
    await loadContactOptionByBranchCode(defaultBranchCode ?? user?.branch_code);
    setIsSubmitting(false);
    handleShow(false);
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
            name="type"
            defaultValue={[]}
            control={control}
            render={({ field: { onChange }, fieldState: { error } }) => {
              return (
                <FormGroup row>
                  <Label sm="3">Tipe Kontak</Label>
                  <Col md="9">
                    <Select
                      className={classnames("react-select", {
                        "is-invalid": error,
                      })}
                      isMulti
                      isClearable
                      options={contactTypes}
                      theme={selectThemeColors}
                      classNamePrefix="select"
                      getOptionLabel={(option) => option}
                      getOptionValue={(option) => option}
                      onChange={(val) => onChange(val)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </Col>
                </FormGroup>
              );
            }}
          />

          {isCentralOffice() && (
            <Controller
              name="branch_code"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <FormGroup row>
                    <Label sm="3" for="name">
                      Cabang
                    </Label>
                    <Col sm="9">
                      <Select
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        getOptionValue={(option) => option?.code}
                        getOptionLabel={(option) => option?.name}
                        options={branchOption}
                        classNamePrefix="select"
                        defaultValue={branchOption.find((v) => v.code == value)}
                        onChange={(option) => onChange(option?.code)}
                        className={classnames("react-select", {
                          "is-invalid": !!error,
                        })}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </Col>
                  </FormGroup>
                );
              }}
            />
          )}

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
                      Alamat Penagihan
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
export default AddContactModal;
