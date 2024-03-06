import { useRef, useState } from "react";
import Wizard from "../../core/wizard";

import Summary from "./steps/Summary";
import MemberDetails from "./steps/MemberDetails";
import BranchDetails from "./steps/BranchDetails";

const FormAddBranch = () => {
  const [formData, setFormData] = useState({});
  const [stepper, setStepper] = useState(null);
  const ref = useRef(null);

  const updateFormDataHandler = (data) => {
    setFormData((current) => {
      return {
        ...current,
        ...data,
      };
    });
  };

  const steps = [
    {
      id: "branch-details",
      title: "Detail Cabang",
      subtitle: "Inputkan detail informasi cabang",
      content: (
        <BranchDetails
          stepper={stepper}
          formData={formData}
          updateFormData={updateFormDataHandler}
          type="wizard-horizontal"
        />
      ),
    },
    {
      id: "personal-info",
      title: "Pengguna Cabang",
      subtitle: "Tambah Pengguna Cabang",
      content: (
        <MemberDetails
          stepper={stepper}
          formData={formData}
          updateFormData={updateFormDataHandler}
          type="wizard-horizontal"
        />
      ),
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: (
        <Summary
          stepper={stepper}
          formData={formData}
          updateFormData={updateFormDataHandler}
          type="wizard-horizontal"
        />
      ),
    },
  ];

  return (
    <div className="horizontal-wizard">
      <Wizard instance={(el) => setStepper(el)} ref={ref} steps={steps} />
    </div>
  );
};

export default FormAddBranch;
