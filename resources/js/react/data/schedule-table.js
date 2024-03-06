import {
  Edit,
  File,
  Trash2,
  Video,
  ZoomIn,
  Users,
  Download,
} from "react-feather";
import {
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  UncontrolledButtonDropdown,
} from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import {
  getUserAllowedRoleFromBlade,
  getUserFromBlade,
  getTimezone,
  showToast,
} from "../utility/Utils";

import { initialDatatables } from "../api/datatables/schedule-data";

export const getClassroomId = () => {
  const url = window.location.href;
  const splitted = url.split("/");
  return splitted[splitted.length - 1];
};

export const getSchedules = async () => {
  const response = await axios.get("/api/learning/schedule", {
    params: { classroom_id: getClassroomId() },
  });
  const data = await response.data;
  return data?.data ?? [];
};

export const getOnlineSchedules = async () => {
  const classroom_id = getClassroomId();
  const response = await axios.get(
    `/api/online-class/classrooms/${classroom_id}/schedules`
  );
  const data = await response.data;
  return data?.data ?? [];
};

export const deleteSchedule = async (id) => {
  try {
    const isConfirmed = confirm("Delete schedule?");
    if (!isConfirmed) return;
    const response = await axios.delete(`/api/learning/schedule/${id}`);
    const data = await response.data;
    window.location.reload();
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getTimeLabel = (start, end) => {
  const startDate = moment(start);
  return startDate.fromNow();
};

const redirectToZoomStartMeetingURL = async (zoom_meeting_id) => {
  try {
    const response = await axios.get(`/api/zoom/meetings/${zoom_meeting_id}`);
    const data = await response.data;
    window.open(data.start_url, "_blank");
  } catch (error) {
    showToast({
      type: "error",
      title: "Terjadi Kesalahan",
      message: "Data meeting tidak ditemukan atau sudah dihapus",
    });
  }
};

export let data = initialDatatables;

const userRole = getUserAllowedRoleFromBlade();
const user = getUserFromBlade();

const timezone = getTimezone();
export const columns = [
  // ? Need to find way to make numbering data
  // {
  //   name: "#",
  //   selector: (_, index) => index + 1,
  //   width: "10px",
  // },
  {
    name: "Judul",
    sortable: true,
    minWidth: "100px",
    selector: (row) => (
      <div className="user-info text-truncate">
        <span className="d-block font-weight-bold text-truncate">
          {row.title}
        </span>
      </div>
    ),
  },
  {
    name: "Waktu Mengajar",
    sortable: false,
    minWidth: "300px",
    selector: ({ start_date, end_date }) => {
      return (
        <div className="font-weight-bolder">
          {moment(start_date).utcOffset("+0700").format("DD MMMM YYYY • HH:mm")}
          {" - "}
          {moment(end_date).utcOffset("+0700").format("HH:mm")} WIB
          <br />
          <Badge className="badge-light-secondary" pill>
            {getTimeLabel(start_date, end_date)}
          </Badge>
        </div>
      );
    },
  },
  {
    name: "Pengajar",
    selector: (row) => row.teacher_name,
    sortable: true,
  },
  {
    name: "Topik",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const filteredTopics = row?.topics?.filter((item) => {
        return !/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:|cpns)/i.test(
          item
        );
      });
      const output = (filteredTopics ?? []).map((label, index) => (
        <Badge key={index} color="light-success" style={{ marginRight: "4px" }}>
          {label}
        </Badge>
      ));
      return output;
    },
  },
  {
    name: "Kehadiran Siswa",
    sortable: false,
    minWidth: "250px",
    selector: (row) => {
      return (
        <>
          <Badge color="light-primary" style={{ marginRight: "4px" }}>
            {row.count_presence} Hadir
          </Badge>
          <Badge color="light-warning" style={{ marginRight: "4px" }}>
            {row.count_absent} Tidak Hadir
          </Badge>
        </>
      );
    },
  },
  {
    name: "Actions",
    allowOverflow: true,
    selector: (row) => {
      return (
        <div className="d-flex">
          <UncontrolledButtonDropdown>
            <DropdownToggle
              className="btn-gradient-info"
              color="none"
              size="sm"
              caret
            >
              Pilihan
            </DropdownToggle>
            <DropdownMenu>
              {/* {user.roles.includes("mentor") && row.classroom.is_online ? (
                <DropdownItem
                  disabled={
                    row.online_class_meeting.zoom_meeting_status === "ENDED"
                  }
                  onClick={() =>
                    redirectToZoomStartMeetingURL(
                      row.online_class_meeting.zoom_meeting_id
                    )
                  }
                >
                  <Video size={15} className="mr-50" />
                  {row.online_class_meeting.zoom_meeting_status === "ENDED"
                    ? "Meeting sudah berakhir"
                    : "Start meeting"}
                </DropdownItem>
              ) : null} */}

              {["*", "read_report"].some((r) => userRole.includes(r)) && (
                <DropdownItem href={`/pembelajaran/laporan/${row._id}`} tag="a">
                  <ZoomIn size={15} className="mr-50" /> Lihat Laporan
                </DropdownItem>
              )}

              {["*", "read_presence"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/presensi/${row._id}`}
                  tag="a"
                >
                  <File size={15} className="mr-50" /> Lihat Presensi
                </DropdownItem>
              )}

              {["*", "edit"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/jadwal/edit/${row._id}`}
                  tag="a"
                >
                  <Edit size={15} className="mr-50" /> Edit
                </DropdownItem>
              )}

              {["*", "delete"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  onClick={() => deleteSchedule(row._id)}
                  tag="a"
                  className="text-danger"
                >
                  <Trash2 size={15} className="mr-50" /> Delete
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      );
    },
  },
];

export const onlineClassNonMentorColumns = [
  // ? Need to find way to make numbering data
  // {
  //   name: "#",
  //   selector: (_, index) => index + 1,
  //   width: "10px",
  // },
  {
    name: "Judul",
    sortable: true,
    minWidth: "100px",
    selector: (row) => (
      <div className="user-info text-truncate">
        <span className="d-block font-weight-bold text-truncate">
          {row.title}
        </span>
      </div>
    ),
  },
  {
    name: "Waktu Mengajar",
    sortable: false,
    minWidth: "300px",
    selector: ({ start_date, end_date }) => {
      return (
        <div className="font-weight-bolder">
          {moment(start_date).utcOffset("+0700").format("DD MMMM YYYY • HH:mm")}
          {" - "}
          {moment(end_date).utcOffset("+0700").format("HH:mm")} WIB
          <br />
          <Badge className="badge-light-secondary" pill>
            {getTimeLabel(start_date, end_date)}
          </Badge>
        </div>
      );
    },
  },
  {
    name: "Pengajar",
    selector: (row) => row.mentor_name,
    sortable: true,
  },
  {
    name: "Topik",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const filteredTopics = row?.topic?.filter((item) => {
        return !/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:|cpns)/i.test(
          item
        );
      });

      const output = (filteredTopics ?? []).map((label, index) => (
        <Badge key={index} color="light-success" style={{ marginRight: "4px" }}>
          {label}
        </Badge>
      ));
      return output;
    },
  },
  {
    name: "Zoom Meeting ID",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      return row?.zoom_meeting_id ?? "-";
    },
  },
  {
    name: "Zoom Meeting Password",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      return row?.zoom_meeting_password ?? "-";
    },
  },
  {
    name: "Link Zoom Untuk Siswa",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const url = row?.zoom_join_url ?? null;
      return url ? <a href={url}>{url}</a> : "-";
    },
  },
  {
    name: "Status Zoom Meeting",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const meetingStatusText = {
        WAITING: "Menunggu",
        STARTED: "Berlangsung",
        ENDED: "Selesai",
      };
      const meetingStatusBadge = {
        WAITING: "light-primary",
        STARTED: "light-info",
        ENDED: "light-success",
      };

      return (
        <>
          <Badge
            color={meetingStatusBadge[row?.zoom_meeting_status] ?? "light-info"}
          >
            {meetingStatusText[row?.zoom_meeting_status] ?? "-"}
          </Badge>
        </>
      );
    },
  },
  {
    name: "Kehadiran Siswa",
    sortable: false,
    minWidth: "250px",
    selector: (row) => {
      return (
        <>
          <Badge color="light-primary" style={{ marginRight: "4px" }}>
            {row.attended_participants} Hadir
          </Badge>
          <Badge color="light-warning" style={{ marginRight: "4px" }}>
            {row.unattended_participants} Tidak Hadir
          </Badge>
        </>
      );
    },
  },
  {
    name: "Actions",
    allowOverflow: true,
    selector: (row) => {
      return (
        <div className="d-flex">
          <UncontrolledButtonDropdown>
            <DropdownToggle
              className="btn-gradient-info"
              color="none"
              size="sm"
              caret
            >
              Pilihan
            </DropdownToggle>
            <DropdownMenu>
              {["*", "read_report"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/laporan/${row.class_schedule_id}`}
                  tag="a"
                >
                  <ZoomIn size={15} className="mr-50" /> Lihat Laporan
                </DropdownItem>
              )}

              {["*", "read_presence"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/presensi/${row.class_schedule_id}`}
                  tag="a"
                >
                  <File size={15} className="mr-50" /> Lihat Presensi
                </DropdownItem>
              )}
              {["*", "download_presence"].some((r) => true) && (
                <DropdownItem
                  href={`/pembelajaran/presensi/${row.class_schedule_id}/download`}
                  tag="a"
                >
                  <Download size={15} className="mr-50" /> Download Presensi
                </DropdownItem>
              )}
              {["*", "read_meeting_registrants"].some((r) =>
                userRole.includes(r)
              ) && (
                <DropdownItem
                  href={`/pembelajaran/jadwal/${row.class_schedule_id}/meeting-registrant`}
                  tag="a"
                >
                  <Users size={15} className="mr-50" /> Lihat Registrant
                </DropdownItem>
              )}

              {["*", "edit"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/jadwal/edit/${row.class_schedule_id}`}
                  tag="a"
                >
                  <Edit size={15} className="mr-50" /> Edit
                </DropdownItem>
              )}

              {["*", "delete"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  onClick={() => deleteSchedule(row.class_schedule_id)}
                  tag="a"
                  className="text-danger"
                >
                  <Trash2 size={15} className="mr-50" /> Delete
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      );
    },
  },
];

export const onlineClassMentorColumns = [
  // ? Need to find way to make numbering data
  // {
  //   name: "#",
  //   selector: (_, index) => index + 1,
  //   width: "10px",
  // },
  {
    name: "Judul",
    sortable: true,
    minWidth: "100px",
    selector: (row) => (
      <div className="user-info text-truncate">
        <span className="d-block font-weight-bold text-truncate">
          {row.title}
        </span>
      </div>
    ),
  },
  {
    name: "Waktu Mengajar",
    sortable: false,
    minWidth: "300px",
    selector: ({ start_date, end_date }) => {
      return (
        <div className="font-weight-bolder">
          {moment(start_date).utcOffset("+0700").format("DD MMMM YYYY • HH:mm")}
          {" - "}
          {moment(end_date).utcOffset("+0700").format("HH:mm")} WIB
          <br />
          <Badge className="badge-light-secondary" pill>
            {getTimeLabel(start_date, end_date)}
          </Badge>
        </div>
      );
    },
  },
  {
    name: "Pengajar",
    selector: (row) => row.mentor_name,
    sortable: true,
  },
  {
    name: "Topik",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const filteredTopics = row?.topic?.filter((item) => {
        return !/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:|cpns)/i.test(
          item
        );
      });

      const output = (filteredTopics ?? []).map((label, index) => (
        <Badge key={index} color="light-success" style={{ marginRight: "4px" }}>
          {label}
        </Badge>
      ));
      return output;
    },
  },
  {
    name: "Zoom Meeting ID",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      return row?.zoom_meeting_id ?? "-";
    },
  },
  {
    name: "Zoom Meeting Password",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      return row?.zoom_meeting_password ?? "-";
    },
  },
  {
    name: "Link Join Zoom",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const url = row?.zoom_join_url ?? null;
      return url ? <a href={url}>{url}</a> : "-";
    },
  },
  {
    name: "Status Zoom Meeting",
    sortable: false,
    minWidth: "150px",
    selector: (row) => {
      const meetingStatusText = {
        WAITING: "Menunggu",
        STARTED: "Berlangsung",
        ENDED: "Selesai",
      };
      const meetingStatusBadge = {
        WAITING: "light-primary",
        STARTED: "light-info",
        ENDED: "light-success",
      };

      return (
        <>
          <Badge
            color={meetingStatusBadge[row?.zoom_meeting_status] ?? "light-info"}
          >
            {meetingStatusText[row?.zoom_meeting_status] ?? "-"}
          </Badge>
        </>
      );
    },
  },
  {
    name: "Kehadiran Siswa",
    sortable: false,
    minWidth: "250px",
    selector: (row) => {
      return (
        <>
          <Badge color="light-primary" style={{ marginRight: "4px" }}>
            {row.attended_participants} Hadir
          </Badge>
          <Badge color="light-warning" style={{ marginRight: "4px" }}>
            {row.unattended_participants} Tidak Hadir
          </Badge>
        </>
      );
    },
  },
  {
    name: "Actions",
    allowOverflow: true,
    selector: (row) => {
      return (
        <div className="d-flex">
          <UncontrolledButtonDropdown>
            <DropdownToggle
              className="btn-gradient-info"
              color="none"
              size="sm"
              caret
            >
              Pilihan
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                disabled={row?.zoom_meeting_status !== "WAITING"}
                onClick={() =>
                  redirectToZoomStartMeetingURL(row?.zoom_meeting_id)
                }
              >
                <Video size={15} className="mr-50" />
                {row?.zoom_meeting_status === "ENDED"
                  ? "Meeting sudah berakhir"
                  : row?.zoom_meeting_status === "STARTED"
                  ? "Meeting sedang berlangsung"
                  : "Start meeting"}
              </DropdownItem>
              {["*", "read_report"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/laporan/${row.class_schedule_id}`}
                  tag="a"
                >
                  <ZoomIn size={15} className="mr-50" /> Lihat Laporan
                </DropdownItem>
              )}

              {["*", "read_presence"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/presensi/${row.class_schedule_id}`}
                  tag="a"
                >
                  <File size={15} className="mr-50" /> Lihat Presensi
                </DropdownItem>
              )}

              {["*", "edit"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  href={`/pembelajaran/jadwal/edit/${row.class_schedule_id}`}
                  tag="a"
                >
                  <Edit size={15} className="mr-50" /> Edit
                </DropdownItem>
              )}

              {["*", "delete"].some((r) => userRole.includes(r)) && (
                <DropdownItem
                  onClick={() => deleteSchedule(row.class_schedule_id)}
                  tag="a"
                  className="text-danger"
                >
                  <Trash2 size={15} className="mr-50" /> Delete
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      );
    },
  },
];
