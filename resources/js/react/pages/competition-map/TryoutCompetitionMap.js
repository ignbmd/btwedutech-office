import React from "react";
import ReactDOM from "react-dom";
import TryoutCompetitionMapTable from "../../components/comp-map/tryout";

const TryoutCompetitionMap = () => {
  return (
    <div className="mx-auto mb-2">
      <TryoutCompetitionMapTable />
    </div>
  );
};

export default TryoutCompetitionMap;

if (document.getElementById("competition-map-tryout-container")) {
  ReactDOM.render(
    <TryoutCompetitionMap />,
    document.getElementById("competition-map-tryout-container")
  );
}
