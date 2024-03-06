import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import Wizard from "../core/wizard";
import SpinnerCenter from "../core/spinners/Spinner";
import { getPointCheckup } from "../../services/mcu/point-checkup";

import Summary from "./CheckForm/Summary";
import BiodataForm from "./CheckForm/BiodataForm";
import SelectStudentForm from "./CheckForm/Student";
import ChecklistForm from "./CheckForm/ChecklistForm";
import { Button, Card, CardBody } from "reactstrap";
import { ArrowLeft, X } from "react-feather";

const BiodataSchema = yup.object().shape({
  name: yup.string().required("Wajib Diisi"),
  email: yup.string().email().required("Wajib Diisi"),
  age: yup.string().required("Wajib Diisi"),
  height: yup.string().required("Wajib Diisi"),
  weight: yup.string().required("Wajib Diisi"),
});

const SummaryEdit = ({ summary, toggleEdit }) => {
  const [isFetchingPointList, setIsFetchingPointList] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState();
  const [renderCheckedFormList, setRenderCheckedFormList] = useState([]);
  const [pointList, setPointList] = useState([]);
  const [stepper, setStepper] = useState(null);
  const ref = useRef(null);

  const useFormChecklist = useForm();
  const useFormBiodata = useForm({
    resolver: yupResolver(BiodataSchema),
  });
  const { setValue: setValueBiodata } = useFormBiodata;
  const { setValue: setValueChecklist } = useFormChecklist;

  const steps = [
    {
      id: "step-biodata",
      title: "Biodata",
      subtitle: "Inputkan biodata siswa",
      content: (
        <BiodataForm
          formType="edit"
          stepper={stepper}
          type="modern-vertical"
          selectedStudent={selectedStudent}
          useFormProps={useFormBiodata}
        />
      ),
    },
    ...renderCheckedFormList,
    {
      id: "step-summary",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan disimpan",
      content: (
        <Summary
          formType="edit"
          stepper={stepper}
          pointList={pointList}
          type="modern-vertical"
          defaultComment={summary?.comment}
          useFormBiodataProps={useFormBiodata}
          useFormChecklistProps={useFormChecklist}
        />
      ),
    },
  ];

  const fetchPointCheckup = async () => {
    try {
      const res = await getPointCheckup();
      const points = res.data;
      setPointList(points.filter((point) => point?.inspections));
      setIsFetchingPointList(false);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    if(pointList.length > 0) {
      const updatedFormPointList = pointList.map((list, index) => ({
        id: `step-${index + 1}`,
        title: list.text,
        subtitle: list.description
          ? list.description
          : "Inputkan rincian kesehatan",
        content: (
          <ChecklistForm
            index={index}
            item={list}
            stepper={stepper}
            type="modern-vertical"
            stepLength={pointList.length}
            useFormProps={useFormChecklist}
          />
        ),
      }));
      setRenderCheckedFormList(updatedFormPointList)
    }
  }, [pointList.length, stepper])

  useEffect(() => {
    fetchPointCheckup();
  }, []);

  useEffect(() => {
    if (summary) {
      setValueBiodata("id", summary.smartbtw_id);
      setValueBiodata("name", summary.name);
      setValueBiodata("email", summary.email);
      setValueBiodata("gender", summary.gender ? "1" : "0");
      setValueBiodata("age", summary.age);
      setValueBiodata("height", summary.height);
      setValueBiodata("weight", summary.weight);
      setValueBiodata("branch_code", summary.branch_code);
      summary.detail_answers.map((answer) => {
        setValueChecklist(
          `${answer.area}-${answer._id}`,
          answer.value == 1 ? "no" : "yes"
        );
      });
    }
  }, [summary]);

  return (
    <>
      <Button
        className="btn-icon btn-sm text-primary font-weight-bolder"
        color="transparent"
        onClick={toggleEdit}
      >
        <ArrowLeft
          size={20}
          className="text-primary"
        /> Kembali
      </Button>

      <div className="modern-vertical-wizard">
        {isFetchingPointList ? (
          <SpinnerCenter color="primary" />
        ) : (
          <Wizard
            ref={ref}
            steps={steps}
            type="modern-vertical"
            options={{
              linear: false,
            }}
            instance={(el) => setStepper(el)}
          />
        )}
        {/* <div className="d-flex justify-content-end mt-2">
        <Button type="button" color="outline-warning">
          <X size={14} className="align-middle ml-sm-25 ml-0" />
          <span className="align-middle d-sm-inline-block d-none">
            Batal Ubah
          </span>
        </Button>
      </div> */}
      </div>
    </>
  );
};

export default SummaryEdit;
