import { Badge } from "reactstrap";
import axios from "../../utility/http";
import { Eye } from "react-feather";

export const getTryoutCodes = async () => {
  const url = "/exam/tryout-code/all";
  const queryParams = { program: "skd" };

  const response = await axios.get(url, {
    params: queryParams,
  });
  const data = response.data;
  return data?.data ?? [];
};

const live_ranking_host =
  document.getElementById("live-ranking-host").textContent;

export const columns = [
  {
    name: "No",
    sortable: true,
    center: true,
    maxWidth: "50px",
    selector: "no",
  },
  {
    name: "Kode Tryout",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ tryout_code }) => (
      <span className="font-weight-bolder">{tryout_code}</span>
    ),
  },
  {
    name: "Nama Tryout",
    grow: 2,
    wrap: true,
    sortable: false,
    selector: "packages.title",
    style: { height: "unset !important" },
  },
  {
    name: "Kode Modul",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ packages, program }) => {
      return (
        <>
          <Badge color="light-info mr-25">
            {packages?.modules?.module_code}
          </Badge>
          <Badge color="light-success mt-25">{program.toUpperCase()}</Badge>
        </>
      );
    },
  },
  {
    name: "Tanggal Mulai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({
      program,
      start_exam_date,
      is_live,
      packages: { start_date },
    }) => {
      if (["tps", "skd", "skb", "pppk", "utbk"].includes(program)) {
        if (!is_live && start_date) {
          return `${moment(start_date)
            .utcOffset("+0700")
            .format("DD MMM YYYY • HH:mm")} WIB`;
        } else if (is_live && start_exam_date) {
          return `${moment(start_exam_date)
            .utcOffset("+0700")
            .format("DD MMM YYYY • HH:mm")} WIB`;
        } else {
          return "-";
        }
      }
    },
  },
  {
    name: "Tanggal Selesai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ packages: { end_date } }) => {
      return end_date
        ? `${moment(end_date)
            .utcOffset("+0700")
            .format("DD MMM YYYY • HH:mm")} WIB`
        : "-";
    },
  },
  {
    name: "Live",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ is_live }) => {
      return is_live ? (
        <Badge color="light-success">Ya</Badge>
      ) : (
        <Badge color="light-danger">Tidak</Badge>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: (row) => (
      <div className="d-flex">
        <a
          href={`/soal-uka-kode/${row.id}/soal`}
          className="btn btn-info btn-sm"
        >
          Lihat Soal
        </a>
      </div>
    ),
  },
];
