import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import Wizard from "../../core/wizard";
import SpinnerCenter from "../../core/spinners/Spinner";
import { getPointCheckup } from "../../../services/mcu/point-checkup";

import Summary from "./Summary";
import BiodataForm from "./BiodataForm";
import SelectStudentForm from "./Student";
import ChecklistForm from "./ChecklistForm";

const BiodataSchema = yup.object().shape({
  name: yup.string().required("Wajib Diisi"),
  email: yup.string().email().required("Wajib Diisi"),
  branch_code: yup.string().required("Wajib Diisi"),
  age: yup.string().required("Wajib Diisi"),
  height: yup.string().required("Wajib Diisi"),
  weight: yup.string().required("Wajib Diisi"),
});

const CheckForm = () => {
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

  const steps = [
    {
      id: "step-student",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: (
        <SelectStudentForm
          stepper={stepper}
          type="modern-vertical"
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
        />
      ),
    },
    {
      id: "step-biodata",
      title: "Biodata",
      subtitle: "Inputkan biodata siswa",
      content: (
        <BiodataForm
          formType="create"
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
          formType="create"
          stepper={stepper}
          pointList={pointList}
          type="modern-vertical"
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
      const pointInspections = points.filter((point) => {
        const inspections = point?.inspections
        inspections.sort((a,b) => {
          if(a.value == b.value) {
            return a._id > b._id ? 1 : -1
          }
          return a.value > b.value ? 1 : -1
        })
        return inspections;
      });
      setPointList(pointInspections);
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

  return (
    <div className="modern-vertical-wizard">
      {isFetchingPointList && renderCheckedFormList.length == 0 ? (
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
    </div>
  );
};

export default CheckForm;
