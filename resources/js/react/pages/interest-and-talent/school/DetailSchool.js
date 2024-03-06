import { useContext, useEffect } from "react";
import ReactDOM from "react-dom";
import { Row } from "reactstrap";
import SchoolInfo from "../../../components/interest-and-talent/school/detail/SchoolInfo";
import SchoolAdminTable from "../../../components/interest-and-talent/school/detail/SchoolAdminTable";
import AssignedAccessCodeModal from "../../../components/interest-and-talent/school/detail/AssignedAccessCodeModal";
import InterestAndTalentSchoolContextProvider from "../../../context/InterestAndTalentSchoolContext";
import { InterestAndTalentSchoolContext } from "../../../context/InterestAndTalentSchoolContext";
import AddSchoolAdminModal from "../../../components/interest-and-talent/school/detail/AddSchoolAdminModal";
import SchoolModal from "../../../components/interest-and-talent/school/SchoolModal";
import AssignNewAccessCodeModal from "../../../components/interest-and-talent/school/detail/AssignNewAccessCodeModal";
import { getIdFromURLSegment } from "../../../utility/Utils";

const DetailSchool = () => {
  const school_id = getIdFromURLSegment();
  const { fetchSchool, fetchSchoolAdmins } = useContext(
    InterestAndTalentSchoolContext
  );

  useEffect(() => {
    fetchSchool(school_id);
    fetchSchoolAdmins(school_id);
  }, []);

  return (
    <>
      <Row>
        <SchoolInfo />
      </Row>
      <Row>
        <SchoolAdminTable />
      </Row>
      <SchoolModal type="edit" />
      <AssignedAccessCodeModal />
      <AssignNewAccessCodeModal codeRequest={null} />
      <AddSchoolAdminModal />
    </>
  );
};

export default DetailSchool;

if (document.getElementById("school-container")) {
  ReactDOM.render(
    <InterestAndTalentSchoolContextProvider>
      <DetailSchool />
    </InterestAndTalentSchoolContextProvider>,
    document.getElementById("school-container")
  );
}
