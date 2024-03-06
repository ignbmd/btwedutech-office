import ReactDOM from "react-dom";
import { useContext, useState, useEffect } from "react";
import { Calendar, List, Plus } from "react-feather";
import { Button, ButtonGroup, Card, CardHeader, CardTitle } from "reactstrap";
import { getSchedules, getOnlineSchedules } from "../../data/schedule-table";
import ScheduleTable from "../../components/learning/schedule/ScheduleTable";
import ScheduleCalendar from "../../components/learning/schedule/ScheduleCalendar";
import CalendarContextProvider, {
  CalendarContext,
} from "../../context/CalendarContext";
import {
  getUserAllowedRoleFromBlade,
  getUserFromBlade,
  getIsOnlineClass,
} from "../../utility/Utils";
import moment from "moment";

const Schedule = () => {
  const [viewActive, setViewActive] = useState("table");
  const { toggleSidebar, handleAddEventSidebar } = useContext(CalendarContext);
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [user] = useState(getUserFromBlade());
  const [isOnlineClass] = useState(getIsOnlineClass());
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    setIsLoading(true);
    if (isOnlineClass) setData(await getOnlineSchedules());
    else setData(await getSchedules());
    setIsLoading(false);
  }, []);

  const handleViewTable = () => {
    setViewActive("table");
  };

  const handleViewCalendar = () => {
    setViewActive("calendar");
  };

  const handleAddEventClick = () => {
    toggleSidebar(false);
    handleAddEventSidebar();
  };

  const getClassroomId = () => {
    const url = window.location.href;
    const splitted = url.split("/");
    return splitted[splitted.length - 1];
  };

  const getExportData = () => {
    return isOnlineClass
      ? null
      : data.map((d) => ({
          Judul: d.title,
          "Waktu Mengajar": `${moment(d.start_date).format(
            "DD MMMM YYYY • hh:mm"
          )} - ${moment(d.end_date).format("hh:mm")}`,
          Pengajar: d.teacher_name,
          Topik: d.topics.join(", "),
          "Siswa Hadir": d.count_presence,
          "Siswa Tidak Hadir": d.count_absent,
        }));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
          <CardTitle tag="h4">
            <ButtonGroup className="mb-1">
              <Button
                outline
                color="primary"
                active={viewActive === "table"}
                onClick={handleViewTable}
              >
                <List size={15} />
              </Button>
              <Button
                outline
                color="primary"
                active={viewActive === "calendar"}
                onClick={handleViewCalendar}
              >
                <Calendar size={15} />
              </Button>
            </ButtonGroup>
          </CardTitle>

          <div className="d-flex mt-md-0 mt-1">
            {["*", "create"].some((r) => userRole.includes(r)) ? (
              viewActive == "table" ? (
                <div className="d-flex mt-md-0 mt-1">
                  <Button
                    className="ml-2"
                    color="primary"
                    tag="a"
                    href={`/pembelajaran/jadwal/tambah/${getClassroomId()}`}
                  >
                    <Plus size={15} />
                    <span className="align-middle ml-50">Buat Jadwal Baru</span>
                  </Button>
                </div>
              ) : (
                <Button color="primary" block onClick={handleAddEventClick}>
                  <Plus size={14} className="mr-25" />{" "}
                  <span className="align-middle">Buat Jadwal Baru</span>
                </Button>
              )
            ) : (
              ""
            )}
          </div>
        </CardHeader>
        {["*", "read"].some((r) => userRole.includes(r)) && (
          <>
            {viewActive == "table" && (
              <ScheduleTable data={data} isLoading={isLoading} />
            )}
            {viewActive == "calendar" && <ScheduleCalendar />}
          </>
        )}
      </Card>
    </>
  );
};

export default Schedule;

if (document.getElementById("schedule-container")) {
  ReactDOM.render(
    <CalendarContextProvider>
      <Schedule />
    </CalendarContextProvider>,
    document.getElementById("schedule-container")
  );
}
