import { useRef, useState, useEffect } from "react";

import Wizard from "../../core/wizard";
import Summary from "../SaleFormSteps/Summary";
import SelectClass from "../SaleFormSteps/SelectClass";
import SelectProduct from "../SaleFormSteps/SelectProduct";
import SelectStudent from "../SaleFormSteps/SelectStudent";
import { getUserFromBlade } from "../../../utility/Utils";

import "./SaleForm.css";
import StudentScreening from "../SaleFormSteps/StudentScreening";

const SaleForm = () => {
  const [user] = useState(getUserFromBlade);
  const [isCentralUser] = useState(
    user?.branch_code == "PT0000" || !user?.branch_code
  );
  const [userSSORoles] = useState(user?.roles ?? []);
  const [selectedProductType, setSelectedProductType] = useState(
    isCentralUser
      ? userSSORoles.includes("admin_tatap_muka_online")
        ? "TATAP_MUKA_ONLINE_PRODUCT"
        : "ONLINE_PRODUCT"
      : "OFFLINE_PRODUCT"
  );

  const [selectedProduct, setSelectedProduct] = useState();
  const [selectedStudent, setSelectedStudent] = useState();
  const [selectedStudentDetail, setSelectedStudentDetail] = useState();
  const [selectedClass, setSelectedClass] = useState();
  const [screeningResult, setScreeningResult] = useState();
  const [stepper, setStepper] = useState(null);
  const [stepper2, setStepper2] = useState(null);
  const [stepper3, setStepper3] = useState(null);
  const [stepper4, setStepper4] = useState(null);
  const [stepper5, setStepper5] = useState(null);
  const ref = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  // ** Online
  const selectProductStep = (
    <SelectProduct
      stepper={stepper}
      type="modern-vertical"
      productType={selectedProductType}
      selectProductType={setSelectedProductType}
      setSelectedProduct={setSelectedProduct}
    />
  );
  const selectStudentStep = (
    <SelectStudent
      stepper={stepper}
      type="modern-vertical"
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
      selectedStudentDetail={selectedStudentDetail}
      setSelectedStudentDetail={setSelectedStudentDetail}
    />
  );
  const summaryStep = (
    <Summary
      stepper={stepper}
      type="modern-vertical"
      selectedClass={selectedClass}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
    />
  );

  // ** Offline
  const selectProductStepOffline = (
    <SelectProduct
      stepper={stepper2}
      type="modern-vertical"
      productType={selectedProductType}
      selectProductType={setSelectedProductType}
      setSelectedProduct={setSelectedProduct}
    />
  );
  const selectStudentStepOffline = (
    <SelectStudent
      stepper={stepper2}
      type="modern-vertical"
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
      selectedStudentDetail={selectedStudentDetail}
      setSelectedStudentDetail={setSelectedStudentDetail}
    />
  );
  const summaryStepOffline = (
    <Summary
      stepper={stepper2}
      type="modern-vertical"
      selectedClass={selectedClass}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
    />
  );
  const selectClassStepOffline = (
    <SelectClass
      stepper={stepper2}
      type="modern-vertical"
      setSelectedClass={setSelectedClass}
    />
  );

  // ** Tatap Muka Online
  const selectProductStepTatapMukaOnline = (
    <SelectProduct
      stepper={stepper3}
      type="modern-vertical"
      productType={selectedProductType}
      selectProductType={setSelectedProductType}
      setSelectedProduct={setSelectedProduct}
    />
  );
  const selectStudentStepTatapMukaOnline = (
    <SelectStudent
      stepper={stepper3}
      type="modern-vertical"
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
      setSelectedStudentDetail={setSelectedStudentDetail}
    />
  );
  const selectClassStepTatapMukaOnline = (
    <SelectClass
      stepper={stepper3}
      type="modern-vertical"
      setSelectedClass={setSelectedClass}
    />
  );
  const summaryStepTatapMukaOnline = (
    <Summary
      stepper={stepper3}
      type="modern-vertical"
      selectedClass={selectedClass}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
    />
  );

  // ** Coin currency
  const selectProductCoinCurrency = (
    <SelectProduct
      stepper={stepper4}
      type="modern-vertical"
      productType={selectedProductType}
      selectProductType={setSelectedProductType}
      setSelectedProduct={setSelectedProduct}
    />
  );
  const selectStudentStepCoinCurrency = (
    <SelectStudent
      stepper={stepper4}
      type="modern-vertical"
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
    />
  );
  const summaryStepCoinCurrency = (
    <Summary
      stepper={stepper4}
      type="modern-vertical"
      selectedClass={selectedClass}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
    />
  );

  // ** Siswa Unggulan
  const selectProductStepSiswaUnggulan = (
    <SelectProduct
      stepper={stepper5}
      type="modern-vertical"
      productType={selectedProductType}
      selectProductType={setSelectedProductType}
      setSelectedProduct={setSelectedProduct}
    />
  );
  const selectStudentStepSiswaUnggulan = (
    <SelectStudent
      stepper={stepper5}
      type="modern-vertical"
      selectedStudent={selectedStudent}
      setSelectedStudent={setSelectedStudent}
      selectedStudentDetail={selectedStudentDetail}
      setSelectedStudentDetail={setSelectedStudentDetail}
    />
  );
  const selectClassStepSiswaUnggulan = (
    <SelectClass
      stepper={stepper5}
      type="modern-vertical"
      setSelectedClass={setSelectedClass}
    />
  );
  const summaryStepSiswaUnggulan = (
    <Summary
      stepper={stepper5}
      type="modern-vertical"
      selectedClass={selectedClass}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
      screeningResult={screeningResult}
    />
  );
  const studentScreeningStepSiswaUnggulan = (
    <StudentScreening
      stepper={stepper5}
      selectedProduct={selectedProduct}
      selectedStudent={selectedStudent}
      setScreeningResult={setScreeningResult}
      type="modern-vertical"
    />
  );

  const onlineProductSteps = [
    {
      id: "branch-details",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: selectProductStep,
    },
    {
      id: "personal-info",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: selectStudentStep,
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: summaryStep,
    },
  ];

  const offlineProductSteps = [
    {
      id: "branch-details",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: selectProductStepOffline,
    },
    {
      id: "personal-info",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: selectStudentStepOffline,
    },
    {
      id: "select-class",
      title: "Pilih Kelas",
      subtitle: "Pilih kelas yang diikuti",
      content: selectClassStepOffline,
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: summaryStepOffline,
    },
  ];

  const tatapMukaOnlineProductSteps = [
    {
      id: "branch-details",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: selectProductStepTatapMukaOnline,
    },
    {
      id: "personal-info",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: selectStudentStepTatapMukaOnline,
    },
    {
      id: "select-class",
      title: "Pilih Kelas",
      subtitle: "Pilih kelas yang diikuti",
      content: selectClassStepTatapMukaOnline,
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: summaryStepTatapMukaOnline,
    },
  ];

  const coinCurrencyProductSteps = [
    {
      id: "branch-details",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: selectProductCoinCurrency,
    },
    {
      id: "personal-info",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: selectStudentStepCoinCurrency,
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: summaryStepCoinCurrency,
    },
  ];

  const siswaUnggulanProductSteps = [
    {
      id: "branch-details",
      title: "Pilih Produk",
      subtitle: "Pilih produk yang ingin dibeli",
      content: selectProductStepSiswaUnggulan,
    },
    {
      id: "personal-info",
      title: "Pilih Siswa",
      subtitle: "Pilih siswa yang bersangkutan",
      content: selectStudentStepSiswaUnggulan,
    },
    {
      id: "select-class",
      title: "Pilih Kelas",
      subtitle: "Pilih kelas yang diikuti",
      content: selectClassStepSiswaUnggulan,
    },
    {
      id: "student-screening",
      title: "Screening Siswa",
      subtitle: "Screening Data Siswa Unggulan",
      content: studentScreeningStepSiswaUnggulan,
    },
    {
      id: "step-address",
      title: "Tinjauan",
      subtitle: "Tinjau ulang data yang akan diinput",
      content: summaryStepSiswaUnggulan,
    },
  ];

  return (
    <div className="modern-vertical-wizard">
      <Wizard
        className={selectedProductType === "OFFLINE_PRODUCT" ? "d-none" : ""}
        type="modern-vertical"
        instance={(el) => setStepper(el)}
        isShow={selectedProductType === "ONLINE_PRODUCT"}
        ref={ref}
        steps={onlineProductSteps}
      />

      <Wizard
        className={selectedProductType === "ONLINE_PRODUCT" ? "d-none" : ""}
        type="modern-vertical"
        instance={(el) => setStepper2(el)}
        ref={ref2}
        isShow={selectedProductType === "OFFLINE_PRODUCT"}
        steps={offlineProductSteps}
      />

      <Wizard
        className={
          selectedProductType !== "TATAP_MUKA_ONLINE_PRODUCT" ? "d-none" : ""
        }
        type="modern-vertical"
        instance={(el) => setStepper3(el)}
        ref={ref3}
        isShow={selectedProductType === "TATAP_MUKA_ONLINE_PRODUCT"}
        steps={tatapMukaOnlineProductSteps}
      />

      <Wizard
        className={selectedProductType !== "COIN_CURRENCY" ? "d-none" : ""}
        type="modern-vertical"
        instance={(el) => setStepper4(el)}
        ref={ref4}
        isShow={selectedProductType === "COIN_CURRENCY"}
        steps={coinCurrencyProductSteps}
      />

      <Wizard
        className={
          selectedProductType !== "SISWA_UNGGULAN_PRODUCT" ? "d-none" : ""
        }
        type="modern-vertical"
        instance={(el) => setStepper5(el)}
        ref={ref5}
        isShow={selectedProductType === "SISWA_UNGGULAN_PRODUCT"}
        steps={siswaUnggulanProductSteps}
      />
    </div>
  );
};

export default SaleForm;
