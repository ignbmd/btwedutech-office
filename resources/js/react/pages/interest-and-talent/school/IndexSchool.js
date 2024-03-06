import ReactDOM from "react-dom";
import { Fragment } from "react";

import SchoolTable from "../../../components/interest-and-talent/school/SchoolTable";
import SchoolModal from "../../../components/interest-and-talent/school/SchoolModal";
import InterestAndTalentSchoolContextProvider from "../../../context/InterestAndTalentSchoolContext";

const IndexSchool = () => {
  return (
    <Fragment>
      <SchoolTable />
      <SchoolModal type="create" />
    </Fragment>
  );
};

export default IndexSchool;

if (document.getElementById("school-container")) {
  ReactDOM.render(
    <InterestAndTalentSchoolContextProvider>
      <IndexSchool />
    </InterestAndTalentSchoolContextProvider>,
    document.getElementById("school-container")
  );
}
