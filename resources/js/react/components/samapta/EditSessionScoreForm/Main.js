import clsx from "clsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Fragment, useEffect, useState } from "react";
import { Plus } from "react-feather";
import Select from "react-select";
import SpinnerCenter from "../../core/spinners/Spinner";
import { Input } from "reactstrap";
import { genders } from "../../../config/samapta";
import styles from "./index.module.css";
import PTKScores from "./PTKScores";
import TNIPolriScores from "./TNIPolriScores";

const MySwal = withReactContent(Swal);

const Main = ({
  control,
  formValues,
  isFetchingStudents,
  isSubmitting,
  fields,
  updateField,
  toggleModal,
  keywordFilter,
  setKeywordFilter,
  genderFilter,
  setGenderFilter,
  setClose,
  sessionData,
  setValue,
  submitForm,
}) => {
  const { selection_type, selection_year } = formValues();

  const [selectionTypeFix, setSelectionTypeFix] = useState("PTK");
  // const [selectionTypeFix, setSelectionTypeFix] = useState("PTK");

  const getFilteredFields = () => {
    if (!genderFilter && !keywordFilter) {
      return fields;
    }

    if (genderFilter && !keywordFilter) {
      return fields.filter((field) => field?.gender == genderFilter);
    }

    if (!genderFilter && keywordFilter) {
      return fields.filter((field) =>
        field?.name
          ?.trim()
          ?.toLowerCase()
          ?.includes(keywordFilter?.trim().toLowerCase())
      );
    }

    return fields.filter((field) => {
      return (
        field?.gender == genderFilter &&
        field?.name
          ?.trim()
          ?.toLowerCase()
          ?.includes(keywordFilter?.trim().toLowerCase())
      );
    });
  };

  const getStudentFieldIndex = (student_id) => {
    return fields.findIndex((item) => {
      return item.smartbtw_id == student_id;
    });
  };

  if (isFetchingStudents) {
    return <SpinnerCenter />;
  }

  if (!isFetchingStudents && !fields?.length) {
    return (
      <div className="d-flex justify-content-center align-items-center p-2">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <Fragment>
      <div
        className={clsx(
          styles["student-list-bg"],
          styles["student-list-padding"]
        )}
      >
        <div className={clsx(styles["student-list-header"])}>
          <Input
            type="text"
            className={clsx("form-control", "w-25", styles["filter"])}
            placeholder="Cari Siswa"
            onChange={(e) => {
              setKeywordFilter(e?.target?.value);
            }}
          />

          <Select
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
              control: (provided) => ({
                ...provided,
                background: "transparent",
              }),
            }}
            isSearchable
            isClearable
            options={genders}
            classNamePrefix="select"
            className={clsx("w-25", styles["filter"])}
            placeholder="Filter"
            onChange={(e) => {
              setGenderFilter(e?.value);
            }}
          />
          <button
            className={clsx("btn", "btn-outline-info", "ml-auto")}
            disabled={
              !fields?.length ||
              fields?.every((field) => {
                return field?.add_score;
              }) ||
              keywordFilter ||
              genderFilter
            }
            onClick={(e) => {
              e.preventDefault();
              fields?.forEach((field, index) => {
                updateField(index, { ...field, add_score: true });
              });
            }}
          >
            <span>
              <Plus className="mr-25 mb-25" size={14} />
            </span>
            Tambah Semua
          </button>
        </div>
        <div className={clsx(styles["scroll"])}>
          <div>
            {getFilteredFields()?.length ? (
              getFilteredFields()?.map((field) => {
                return (
                  <div key={field?.id} className={clsx("card", "p-2")}>
                    <div
                      className={clsx(
                        "container",
                        styles["student-list-container"]
                      )}
                    >
                      <div className={clsx(styles["student-data"])}>
                        <div className={clsx(styles["student-text-name"])}>
                          {field?.name}
                        </div>
                        <div className={clsx(styles["student-text-gender"])}>
                          {field?.gender == 1 ? "Laki-laki" : "Perempuan"}
                        </div>
                      </div>
                      {field?.add_score ? (
                        selectionTypeFix == "PTK" ? (
                          <PTKScores
                            index={getStudentFieldIndex(field?.smartbtw_id)}
                            control={control}
                          />
                        ) : (
                          <TNIPolriScores
                            index={getStudentFieldIndex(field?.smartbtw_id)}
                            control={control}
                          />
                        )
                      ) : (
                        <div></div>
                      )}
                      {field?.add_score ? (
                        <button
                          type="button"
                          className={clsx("btn", "btn-outline-danger")}
                          onClick={(e) => {
                            e.preventDefault();
                            const dataIndex = fields.findIndex((item) => {
                              return item.smartbtw_id == field.smartbtw_id;
                            });

                            updateField(dataIndex, {
                              ...field,
                              scores: {
                                run: "",
                                sit_up: "",
                                push_up: "",
                                pull_up: "",
                                shuttle: "",
                                swim: "",
                              },
                              add_score: false,
                            });
                          }}
                        >
                          &#10005;
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={clsx("btn", "btn-primary")}
                          onClick={(e) => {
                            e.preventDefault();
                            const dataIndex = fields.findIndex((item) => {
                              return item.smartbtw_id == field.smartbtw_id;
                            });
                            updateField(dataIndex, {
                              ...field,
                              add_score: true,
                            });
                          }}
                        >
                          Tambah Nilai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="d-flex justify-content-center align-items-center">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
        <div
          className={clsx(
            "mt-1",
            "d-flex",
            "align-items-center",
            "justify-content-end"
          )}
          style={{ gap: "10px" }}
        >
          <button
            className={clsx("btn", "btn-outline-info")}
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              const state = await MySwal.fire({
                title: "Yakin untuk membatalkan?",
                icon: "info",
                text: "dengan menekan yakin, semua nilai yang telah anda inputkan akan hilang",
                showCancelButton: true,
                confirmButtonText: "Yakin",
                cancelButtonText: "Batal",
                customClass: {
                  confirmButton: "btn btn-info",
                  cancelButton: "btn btn-outline-info ml-1",
                },
                buttonsStyling: false,
              });
              if (state.isDismissed) return;
              toggleModal();
              setClose();
            }}
          >
            Batalkan
          </button>
          <button
            className={clsx("btn", "btn-info")}
            disabled={
              !fields?.length ||
              fields.every((field) => !field.add_score) ||
              isSubmitting
            }
            type="submit"
            // onClick={(e) => {
            //   e.preventDefault();
            //   submitForm();
            // }}
          >
            <span>
              <Plus className="mr-25 mb-25" size={14} />
            </span>
            Simpan Sesi Latihan
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Main;
