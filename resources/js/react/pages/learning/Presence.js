import ReactDOM from "react-dom";

import { getIsOnlineClass } from "../../utility/Utils";
import PresenceTable from "../../components/learning/presence/PresenseTable";
import OnlinePresenceTable from "../../components/learning/presence/OnlinePresenceTable";

const isOnlineClassroom = getIsOnlineClass();
const Presence = () => {
  return <>{isOnlineClassroom ? <OnlinePresenceTable /> : <PresenceTable />}</>;
};

export default Presence;

if (document.getElementById("example")) {
  ReactDOM.render(<Presence />, document.getElementById("example"));
}
