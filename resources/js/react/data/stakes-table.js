import { Badge } from "reactstrap";
import { Edit } from "react-feather";

import { areas, stakes } from "../config/mcu";
import { initialDatatables } from "../api/datatables/stakes-data";

export const getStakesPoint = async () => {
  const response = await axios.get("/api/medical-checkup/point");
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    maxWidth: "100px",
    center: true,
    sortable: false,
    selector: "no",
  },
  {
    name: "Area",
    sortable: false,
    wrap: true,
    style: { height: "unset !important" },
    selector: ({ area }) => {
      const currentArea = areas.find(item => item.value == area)
      return currentArea?.label ?? '-'
    },
  },
  {
    name: "Rincian",
    grow: 2,
    sortable: false,
    wrap: true,
    style: { height: "unset !important" },
    selector: "name",
  },
  {
    name: "Stakes",
    center: true,
    sortable: false,
    selector: ({ value: stakesValue }) => {
      const currentStakes = stakes.find((item) => item.value == stakesValue);
      return (
        <Badge
          pill
          style={{
            backgroundColor: currentStakes.color,
            color: "#fff",
          }}
        >
          {currentStakes.label}
        </Badge>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
      <a
        href={`/kesehatan/stakes/edit/${row._id}`}
        className="py-50 btn btn-sm bg-gradient-primary"
      >
        <Edit size={15} className="mr-50" /> Edit
      </a>
    ),
  },
];
