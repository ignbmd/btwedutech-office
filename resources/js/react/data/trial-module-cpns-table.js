import { Fragment } from "react";
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2, ZoomIn } from "react-feather";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/trial-module-data";

export let data = initialDatatables;

export const getTrialModule = async () => {
  const url = "/api/exam-cpns/trial-module";
  const response = await axios.get(url);
  const data = response.data;
  return data?.data ?? [];
};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
    style: { height: "unset !important" },
  },
  {
    name: "Nama Modul",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ modules: { name } }) => {
      return `${name}`;
    },
  },
  {
    name: "Program",
    wrap: true,
    sortable: false,
    grow: 1,
    allowOverflow: true,
    center: true,
    style: { height: "unset !important" },
    selector: ({ program }) => {
      return <Badge color="light-primary">{program.toUpperCase()}</Badge>;
    },
  },
  {
    name: "Tag",
    sortable: false,
    grow: 1,
    allowOverflow: true,
    wrap: true,
    style: { height: "unset !important" },
    selector: ({ tags }) => {
      return tags?.length
        ? tags.map((tag, index) => {
            return (
              <Fragment key={index}>
                <Badge className="mr-50 mb-50" color="light-info">
                  {tag}
                </Badge>
              </Fragment>
            );
          })
        : "-";
    },
  },
  {
    name: "Status",
    sortable: false,
    allowOverflow: true,
    center: true,
    grow: 1,
    style: { height: "unset !important" },
    selector: ({ status }) => {
      return (
        <>
          {status ? (
            <Badge color="light-success">Aktif</Badge>
          ) : (
            <Badge color="light-danger">Tidak Aktif</Badge>
          )}
        </>
      );
    },
  },
  {
    name: "Aksi",
    allowOverflow: true,
    center: true,
    style: { height: "unset !important" },
    selector: (row) => (
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
          <DropdownItem href={`/ujian-cpns/coba-modul/edit/${row.id}`} tag="a">
            <Edit size={15} className="mr-50" /> Edit
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    ),
  },
];
