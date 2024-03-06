import { useRef, useState } from "react";
import Wizard from "../../core/wizard";
import SelectSchool from "../SaleFormSteps/SelectSchool";
import SelectProduct from "../SaleFormSteps/SelectProduct";
import Summary from "../SaleFormSteps/Summary";

import "./SaleForm.css";

const SaleForm = () => {
  const [stepper, setStepper] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const ref = useRef(null);

  const steps = [
    {
      id: "school-step",
      title: "Pilih Sekolah",
      subtitle: "Pilih sekolah atau instansi",
      content: (
        <SelectSchool stepper={stepper} selectSchool={setSelectedSchool} />
      ),
    },
    {
      id: "product-step",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: (
        <SelectProduct
          stepper={stepper}
          selectedSchool={selectedSchool}
          selectProducts={setSelectedProducts}
        />
      ),
    },
    {
      id: "summary-step",
      title: "Tinjauan",
      subtitle: "Tinjauan dari produk yang akan dibeli",
      content: (
        <Summary
          stepper={stepper}
          selectedSchool={selectedSchool}
          selectedProducts={selectedProducts}
        />
      ),
    },
  ];

  return (
    <div className="modern-vertical-wizard">
      <Wizard
        ref={ref}
        steps={steps}
        type="modern-vertical"
        instance={(el) => setStepper(el)}
        isShow={true}
      />
    </div>
  );
};

export default SaleForm;
