import { Badge } from "reactstrap";
import axios from "../utility/http";

export const getCompetitionMapList = async () => {
    try {
        const response = await axios.get(`/competition-map`);
        const data = response.data;
        return data?.result ?? [];
    } catch (error) {
        throw error;
    }
};

export const columns = [
    {
        name: "No",
        sortable: true,
        center: true,
        maxWidth: "80px",
        selector: "no",
    },
    {
        name: "Instansi",
        grow: 3,
        wrap: true,
        sortable: true,
        selector: ({ schools }) => schools?.ministry,
        style: { height: "unset !important" }
    },
    {
        name: "Nama Sekolah",
        grow: 2,
        wrap: true,
        sortable: true,
        selector: ({ schools }) => schools?.name,
        style: { height: "unset !important" }
    },
    {
        name: "Prodi",
        grow: 5,
        wrap: true,
        sortable: true,
        selector: ({ studyprograms }) => studyprograms?.name,
        style: { height: "unset !important" }
    },
    {
        name: "Alokasi Daerah",
        grow: 2,
        wrap: true,
        sortable: true,
        selector: ({ locations }) => locations?.name,
        style: { height: "unset !important" }
    },
    {
        name: "Tipe",
        grow: 2,
        wrap: true,
        sortable: true,
        selector: ({ type }) => (
            type == "KUOTA" ? <Badge className="mr-25" color="light-primary">{type}</Badge>
                : type == "PENDAFTAR" ? <Badge className="mr-25" color="light-success">{type}</Badge>
                    : type == "RATIO" ? <Badge className="mr-25" color="light-warning">{type}</Badge>
                        : type == "LOWEST_SCORE" ? <Badge className="mr-25" color="light-secondary">Nilai SKD Terendah</Badge>
                            : <Badge className="mr-25" color="light-info">{type}</Badge>),
    },
    {
        name: "Tahun",
        grow: 2,
        wrap: true,
        center: true,
        sortable: true,
        selector: "year",
    },
    {
        name: "Jumlah",
        grow: 2,
        wrap: true,
        center: true,
        sortable: true,
        selector: "value",
    },
];