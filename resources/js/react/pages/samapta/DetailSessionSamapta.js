import ReactDOM from "react-dom";

import DetailSessionTabPane from "../../components/samapta/DetailSessionTabPane";
import { Fragment } from "react";
import SamaptaProvider from "../../context/SamaptaContext";

const DetailSessionTabPaneSamapta = () => {
  return (
    <Fragment>
      <DetailSessionTabPane />
    </Fragment>
  );
};

export default DetailSessionTabPaneSamapta;
if (document.getElementById("container")) {
  ReactDOM.render(
    <SamaptaProvider>
      <DetailSessionTabPaneSamapta />
    </SamaptaProvider>,
    document.getElementById("container")
  );
}
