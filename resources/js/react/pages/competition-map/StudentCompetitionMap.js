import React from "react";
import ReactDOM from "react-dom";
import StudentCompetitionMapTable from "../../components/comp-map/student";

const StudentCompetitionMap = () => {
  return (
    <div className="mx-auto mb-2">
      <StudentCompetitionMapTable />
    </div>
  );
};

export default StudentCompetitionMap;

if (document.getElementById("competition-map-student-container")) {
  ReactDOM.render(
    <StudentCompetitionMap />,
    document.getElementById("competition-map-student-container")
  );
}
