import { Fragment } from "react";

import School from "./School";

const SelectSchool = ({ stepper, selectSchool }) => {
  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pilih Sekolah</h5>
        <small className="text-muted">Pilih sekolah/instansi</small>
      </div>
      <div className="ecommerce-application">
        <School stepper={stepper} selectSchool={selectSchool} />
      </div>
    </Fragment>
  );
};

export default SelectSchool;
