import * as yup from "yup";
import { Fragment, useMemo } from "react";
import classnames from "classnames";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Table,
} from "reactstrap";
import { ArrowLeft, Save } from "react-feather";
import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  getUserAllowedRoleFromBlade,
  getUserBranchCode,
  isObjEmpty,
  showToast,
} from "../../../utility/Utils";
import { createRecord, editRecord } from "../../../services/mcu/record";
import { Controller, useForm } from "react-hook-form";

const Summary = ({
  formType,
  stepper,
  pointList,
  defaultComment,
  useFormChecklistProps,
  useFormBiodataProps,
}) => {
  const [userBranchCode] = useState(getUserBranchCode());
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [formSchema, setFormSchema] = useState({
    comment: yup.string(),
  });
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: useMemo(
      () => yupResolver(yup.object().shape(formSchema)),
      [formSchema]
    ),
    defaultValues: {
      comment: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCanceled = useRef(false);
  const { watch: watchBiodataValues } = useFormBiodataProps;
  const { watch: watchChecklistValues } = useFormChecklistProps;
  const { comment } = watch();
  const biodataFormData = watchBiodataValues();
  const checklistFormData = watchChecklistValues();
  const checklistKeys = Object.keys(checklistFormData);
  const isAllowed = ["comment"].some((r) => userRole.includes(r));

  const getPayload = () => {
    const answers = [];

    pointList.map((point) =>
      point.inspections?.map((inspect, index) => {
        const selectedInspection = checklistKeys.find((list) =>
          list.includes(inspect._id)
        );
        const selectedInspectionValue = checklistFormData[selectedInspection];

        if (!selectedInspectionValue) return;

        answers.push({
          point_checkup_id: inspect._id,
          value: selectedInspectionValue == "no" ? 1 : inspect.value,
          area: inspect.area,
        });
      })
    );

    const payload = {
      smartbtw_id: biodataFormData.id,
      name: biodataFormData.name,
      email: biodataFormData.email,
      age: parseInt(biodataFormData.age),
      gender: Boolean(+biodataFormData.gender),
      height: parseFloat(biodataFormData.height),
      weight: parseFloat(biodataFormData.weight),
      branch_code: biodataFormData.branch_code,
      classroom: "-",
      comment: comment,
      answers: answers,
    };

    return payload;
  };

  const getHistoryId = () => {
    const dom = document.getElementById("historyId");
    return dom.innerText;
  };

  const redirectToIndex = () => {
    window.location.href = "/kesehatan/riwayat-pemeriksaan";
  };

  const redirectToIndexStudent = (studentId) => {
    window.location.href = `/siswa/riwayat-pemeriksaan-kesehatan/${studentId}`;
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const submitHandler = async () => {
    trigger();
    if (
      !biodataFormData.name ||
      !biodataFormData.email ||
      !biodataFormData.age ||
      typeof biodataFormData.gender == undefined ||
      (!biodataFormData.height || +biodataFormData.height <= 0) ||
      (!biodataFormData.weight || +biodataFormData.height <= 0)
    ) {
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Harap melengkapi form biodata',
        duration: 5000
      })
      return;
    }

    if (isObjEmpty(errors)) {
      setIsSubmitting(true);
      const payload = getPayload();
      try {
        if (formType == "create") {
          await createRecord(payload);
        } else if (formType == "edit") {
          const historyId = getHistoryId();
          await editRecord(historyId, payload);
        }
        if (!isCanceled.current) {
          if (formType == "create") {
            if (userBranchCode == "PT0000") {
              redirectToIndex();
            } else {
              redirectToIndexStudent(payload.smartbtw_id);
            }
          } else if (formType == "edit") {
            refreshPage();
          }
        }
      } catch (error) {
        if (!isCanceled.current) {
          setIsSubmitting(false);
        }
      }
    }
  };

  useEffect(() => {
    if (["comment"].some((r) => userRole.includes(r))) {
      setFormSchema({ comment: yup.string().required("Wajib diisi") });
    }
  }, []);

  useEffect(() => {
    if (defaultComment) {
      setValue("comment", defaultComment);
    }
  }, [defaultComment]);

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0 font-weight-bolder">Tinjauan</h5>
        <small className="text-muted">
          Tinjau ulang data yang akan disimpan
        </small>
      </div>

      <Form onSubmit={handleSubmit(submitHandler)}>
        <Table borderless striped responsive className="mt-1">
          <thead className="thead-light">
            <tr>
              <th width="30%">Biodata</th>
              <th width="70%" className="text-center" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nama</td>
              <td>
                {biodataFormData.name ? (
                  biodataFormData.name
                ) : (
                  <span className="text-danger">TIDAK DIISI</span>
                )}
              </td>
            </tr>
            <tr>
              <td>Email</td>
              <td>
                {biodataFormData.email ? (
                  biodataFormData.email
                ) : (
                  <span className="text-danger">TIDAK DIISI</span>
                )}
              </td>
            </tr>
            <tr>
              <td>Tinggi Badan</td>
              <td>
                {biodataFormData?.height ? (
                  biodataFormData.height
                ) : (
                  <span className="text-danger">TIDAK DIISI</span>
                )}
              </td>
            </tr>
            <tr>
              <td>Berat Badan</td>
              <td>
                {biodataFormData?.weight ? (
                  biodataFormData.weight
                ) : (
                  <span className="text-danger">TIDAK DIISI</span>
                )}
              </td>
            </tr>
            <tr>
              <td>Umur</td>
              <td>
                {biodataFormData.age ? (
                  biodataFormData.age
                ) : (
                  <span className="text-danger">TIDAK DIISI</span>
                )}
              </td>
            </tr>
          </tbody>
        </Table>

        {pointList.map((point) => (
          <Table
            key={point.area}
            borderless
            striped
            responsive
            className="mt-1"
          >
            <thead className="thead-light">
              <tr>
                <th width="70%">{point.text}</th>
                <th width="30%" className="text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {point.inspections?.map((inspect, index) => {
                const selectedInspection = checklistKeys.find((list) =>
                  list.includes(inspect._id)
                );
                const selectedInspectionValue =
                  checklistFormData[selectedInspection];
                return (
                  <tr key={inspect._id}>
                    <td>{inspect.name}</td>
                    <td className="text-center">
                      {selectedInspectionValue == "yes" ? (
                        "YA"
                      ) : selectedInspectionValue == "no" ? (
                        "TIDAK"
                      ) : (
                        <span className="text-danger">TIDAK DIISI</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ))}

        <Controller
          name="comment"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const { ref, ...rest } = field;
            return (
              <FormGroup className="flex-fill mt-1">
                <Label className="form-label">Rekomendasi Pemeriksaan</Label>
                <Input
                  {...rest}
                  rows="3"
                  readOnly={!isAllowed}
                  type="textarea"
                  id="comment"
                  innerRef={ref}
                  invalid={error && true}
                  placeholder={
                    isAllowed
                      ? "Inputkan Rekomedasi Pemeriksaan"
                      : "Belum Ada Rekomendasi"
                  }
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            );
          }}
        />

        <div
          className={classnames(
            "d-flex justify-content-between mt-2",
            isSubmitting ? "block-content" : ""
          )}
        >
          <Button
            color="secondary"
            className="btn-prev"
            outline
            onClick={() => stepper.previous()}
          >
            <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
            <span className="align-middle d-sm-inline-block d-none">
              Sebelumnya
            </span>
          </Button>
          <Button type="submit" color="success" className="btn-next">
            {!isSubmitting && (
              <Save size={14} className="align-middle mr-50 ml-0" />
            )}
            <span className="align-middle d-sm-inline-block d-none">
              {isSubmitting ? "Menyimpan data..." : "Simpan Data"}
            </span>
          </Button>
        </div>
      </Form>
    </Fragment>
  );
};

export default Summary;
