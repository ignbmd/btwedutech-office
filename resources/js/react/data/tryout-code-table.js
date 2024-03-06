import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import Swal from "sweetalert2";
import { Edit, Eye, Map } from "react-feather";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import {
  showToast,
  isUserHasMarketingRole,
  isBranchUser,
  getUserBranchCode,
} from "../utility/Utils";
import { initialDatatables } from "../api/datatables/tryout-code-data";

export const getTryoutCodes = async () => {
  const isMarketingUserLoggedIn = isUserHasMarketingRole();
  const isBranchUserLoggedIn = isBranchUser();
  const userBranchCode = JSON.parse(getUserBranchCode());

  const url = "/exam/tryout-code/all";
  const queryParams = {};

  if (isMarketingUserLoggedIn) queryParams.tags = "marketing";
  if (isBranchUserLoggedIn) queryParams.branch_code = userBranchCode;

  const response = await axios.get(url, {
    params: queryParams,
  });
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

const MySwal = withReactContent(Swal);
const live_ranking_host =
  document.getElementById("live-ranking-host").textContent;

const deleteTryoutCode = async (id) => {
  try {
    const url = `/exam/tryout-code/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Tryout kode berhasil dihapus",
      });
      window.location.reload();
    } else {
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message: "Proses gagal, silakan coba lagi nanti",
      });
    }
  } catch (error) {
    console.log(error);
    showToast({
      type: "error",
      title: "Terjadi kesalahan",
      message: "Proses gagal, silakan coba lagi nanti",
    });
  }
};

const actionElement = (id) => {
  const dom = document.querySelector(`#action-${id}`);
  return dom;
};

export const confirmDelete = async (id) => {
  const state = await MySwal.fire({
    title: "Apakah anda yakin ingin menghapus data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    customClass: {
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-outline-secondary ml-1",
    },
    buttonsStyling: false,
  });
  if (state.isDismissed) return;
  const actionButton = actionElement(id);
  actionButton.innerHTML = "Menghapus..";
  actionButton.disabled = true;
  deleteTryoutCode(id);
};

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
    name: "Link Live Ranking",
    center: true,
    allowOverflow: true,
    sortable: false,
    wrap: true,
    grow: 2,
    style: { height: "unset !important" },
    selector: ({
      is_live,
      program,
      tryout_code,
      start_exam_date,
      packages: { tags },
    }) => {
      const program_value = program === "tps" ? "tps-irt" : program;

      // Set live ranking nasional as initial live ranking type with the corresponding url
      let live_ranking_type = "live-ranking-nasional";
      let url = `${live_ranking_host}/${live_ranking_type}/${program_value}/${tryout_code}`;

      const start_exam_date_object = new Date(start_exam_date);
      const start_exam_day = start_exam_date_object.getDay();
      const tryout_start_exam_date = start_exam_date_object.getDate();
      const start_exam_month = (start_exam_date_object.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const start_exam_year = start_exam_date_object.getFullYear();
      const tryout_date = `${tryout_start_exam_date}-${start_exam_month}-${start_exam_year}`;
      const is_tryout_starts_on_sunday = start_exam_day === 0;
      const tryout_session_tags = [
        "uka_session_1",
        "uka_session_2",
        "uka_session_3",
      ];
      const tryout_code_session = tags.find((tag) =>
        tryout_session_tags.includes(tag)
      );

      // Live ranking combine
      if (tryout_code_session && is_tryout_starts_on_sunday) {
        const session_number = tryout_code_session.split("_")[2];
        live_ranking_type = "live-ranking-combine";
        url = `${live_ranking_host}/${live_ranking_type}/${program_value}/${session_number}/${tryout_date}`;
      }

      return is_live ? (
        <Badge color="light-info" href={url} target="__blank">
          Buka Link
        </Badge>
      ) : (
        "-"
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
        <UncontrolledButtonDropdown>
          <DropdownToggle
            id={`action-${row.id}`}
            className="btn-gradient-primary"
            color="none"
            size="sm"
            caret
          >
            Pilihan
          </DropdownToggle>
          <DropdownMenu>
            {/* <DropdownItem
              href={`/ranking/show/${row.packages.legacy_task_id}`}
              tag="a"
            >
              <Eye size={15} className="mr-50" />
              Lihat Ranking
            </DropdownItem> */}
            {/* {row.program === "skd" ? (
              <DropdownItem
                href={`/peta-persaingan/tryout/${row.packages.legacy_task_id}/${row.id}`}
                tag="a"
              >
                <Map size={15} className="mr-50" />
                Peta Persaingan Tryout
              </DropdownItem>
            ) : null}
            {row.program === "tps" ? (
              <DropdownItem
                href={`/ranking/show-irt/${row.packages.legacy_task_id}`}
                tag="a"
              >
                <Eye size={15} className="mr-50" />
                Lihat Ranking IRT
              </DropdownItem>
            ) : null} */}
            {/* <div className="dropdown-divider"></div>
            {row.is_live ? (
              <Fragment>
                <DropdownItem href="" tag="a">
                  <ExternalLink size={15} className="mr-50" />
                  Link Live Ranking
                </DropdownItem>
                {row.program === "tps" ? (
                  <DropdownItem href="" tag="a">
                    <ExternalLink size={15} className="mr-50" />
                    Link Live Ranking IRT
                  </DropdownItem>
                ) : null}
              </Fragment>
            ) : null} */}
            {/* <div className="dropdown-divider"></div> */}
            <DropdownItem href={`/ujian/tryout-kode/edit/${row.id}`} tag="a">
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
            {/* <DropdownItem
              onClick={() => confirmDelete(row.id)}
              tag="a"
              className="text-danger"
            >
              <Trash2 size={15} className="mr-50" /> Delete
            </DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
