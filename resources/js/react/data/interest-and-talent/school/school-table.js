export const getSchools = async ({ page, per_page, search = "" }) => {
  try {
    const response = await axios.get(
      `/api/interest-and-talent/schools?page=${page}&per_page=${per_page}&search=${search}`
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama Instansi",
    wrap: true,
    center: true,
    sortable: false,
    selector: (row) => {
      return (
        <div className="d-flex justify-content-center align-items-center">
          <img src={row.logo} width={35} height={35} />
          <span className="mb-0 mt-0 ml-75 font-weight-bold">{row.name}</span>
        </div>
      );
    },
  },
  {
    name: "Total Peserta",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: (row) => {
      return row.student_count;
    },
  },
  {
    name: "Kode Terassign",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: (row) => {
      return row.exam_codes_total;
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: (row) => {
      return (
        <div className="d-flex">
          <a
            className="btn btn-gradient-primary btn-sm"
            href={`/peminatan/sekolah/${row.id}/detail`}
          >
            Lihat Detail
          </a>
        </div>
      );
    },
  },
];
