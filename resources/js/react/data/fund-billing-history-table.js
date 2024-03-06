import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import Swal from "sweetalert2";
import { Edit, Trash2, Eye } from "react-feather";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import { priceFormatter, showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/withdraw-history-data";

export let data = initialDatatables;

const getPaymentStatusConfig = (statusValue) => {
  const status = {
    PENDING: {
      label: "Menunggu Konfirmasi",
      color: "light-warning",
    },
    CANCELED: { label: "Ditolak", color: "light-danger" },
    REJECTED: { label: "Ditolak", color: "light-danger" },
    APPROVED: { label: "Diterima", color: "light-success" },
  };

  return status[statusValue] ?? { label: "-", color: "light-secondary" };
};

const MySwal = withReactContent(Swal);

export const columns = [
  {
    name: "No",
    center: true,
    maxWidth: "50px",
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Cabang",
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: "branch_name",
  },
  {
    name: "Nominal",
    wrap: true,
    sortable: false,
    center: true,

    style: { height: "unset !important" },
    selector: ({ amount }) => priceFormatter(amount),
  },
  {
    name: "Bank",
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: ({ contact }) => {
      return (
        <div className="d-flex flex-column justify-content-between">
          {contact?.bank_account_type && contact?.bank_account_number ? (
            <>
              <div className="badge badge-pill badge-info">
                {contact?.bank_account_type ?? "-"}
              </div>
              <div className="badge badge-pill badge-info mt-25">
                {contact?.bank_account_number ?? "-"}{" "}
              </div>
            </>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    name: "Tanggal Dibuat",
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: ({ created_at }) =>
      `${moment(created_at)
        .utcOffset("+0700")
        .format("DD MMMM YYYY • HH:mm")} WIB`,
  },
  {
    name: "Status",
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: ({ status, updated_at }) => {
      const config = getPaymentStatusConfig(status);
      return (
        <div className="d-flex flex-column justify-content-between">
          <Badge color={config.color} style={{ whiteSpace: "normal" }}>
            {config.label}
          </Badge>
          {status === "APPROVED" && (
            <Badge
              className="mt-25"
              color={config.color}
              style={{ whiteSpace: "normal" }}
            >
              {" "}
              {moment(updated_at)
                .utcOffset("+0700")
                .format("DD MMMM YYYY • HH:mm")}{" "}
              WIB
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: ({ id, status, transfer_fund_attachment }) => (
      <div className="d-flex">
        <UncontrolledButtonDropdown>
          <DropdownToggle
            className="btn-gradient-primary"
            color="none"
            size="sm"
            caret
          >
            Pilihan
          </DropdownToggle>
          <DropdownMenu>
            {transfer_fund_attachment.proof_path ? (
              <DropdownItem
                href={`${transfer_fund_attachment.proof_path}`}
                tag="a"
              >
                <Eye size={15} className="mr-50" />
                Lihat Bukti Pembayaran
              </DropdownItem>
            ) : null}
            <DropdownItem
              href={`/keuangan/konfirmasi-penagihan-dana/${id}`}
              disabled={status !== "PENDING" && status !== "APPROVED"}
              tag="a"
            >
              <Edit size={15} className="mr-50" />
              Edit
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
