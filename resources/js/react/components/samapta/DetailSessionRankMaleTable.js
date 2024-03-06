import { PrimeReactProvider } from "primereact/api";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useEffect, useState } from "react";
import { Card, Row } from "reactstrap";

const DetailSessionRankMaleTable = ({ selectedFilter }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSessionIdFromUrl = () => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];
    return idFromUrl;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getDetailSession(getSessionIdFromUrl());
        const dataWithNumber = data.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setData(dataWithNumber);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const sort = selectedFilter?.value == "Max" ? 1 : 0;
        const data = await getDetailSessionWithParam(
          getSessionIdFromUrl(),
          sort
        );
        const dataWithNumber = data.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setIsLoading(false);
        setData(dataWithNumber);
      } catch (error) {
        setData([]);
        setIsLoading(false);
      }
    })();
  }, [selectedFilter]);

  const getDetailSession = async (id) => {
    const gender = 1;
    const response = await axios.get(
      `/api/samapta/students/student/${id}/gender/${gender}`
    );
    const data = response.data;
    return data ?? [];
  };

  const getDetailSessionWithParam = async (id, sort) => {
    const gender = 1;
    const sortParam = sort;

    const response = await axios.get(
      `/api/samapta/students/student-sort/${id}/gender/${gender}/sort/${sortParam}`
    );

    const data = response.data;
    return data ?? [];
  };

  const headerGroup = (
    <ColumnGroup>
      <Row>
        <Column alignHeader="center" header="NO" rowSpan={3} />
        <Column alignHeader="center" header="Nama" rowSpan={3} />
        <Column alignHeader="center" header="Test A" colSpan={2} />
        <Column alignHeader="center" header="Test B" colSpan={6} />
        {/* <Column alignHeader="center" header="Test B" colSpan={8} />  */}
        <Column alignHeader="center" header="Nilai" rowSpan={2} />
        <Column
          alignHeader="center"
          header="Nilai Akhir"
          rowSpan={3}
          colSpan={2}
        />
      </Row>
      <Row>
        <Column alignHeader="center" header="Lari 12 Menit" colSpan={2} />
        <Column alignHeader="center" header="Sit Up" colSpan={2} />
        <Column alignHeader="center" header="Push Up" colSpan={2} />
        {/* <Column alignHeader="center" header="Pull Up" colSpan={2} /> */}
        <Column alignHeader="center" header="Shuttle Run" colSpan={2} />
      </Row>
      <Row>
        <Column header="Jarak (Meter)" />
        <Column header="Nilai" />
        <Column header="Jumlah (Kali)" />
        <Column header="Nilai" />
        <Column header="Jumlah (Kali)" />
        {/* <Column header="Nilai" />
        <Column header="Jumlah (Kali)" /> */}
        <Column header="Nilai" />
        <Column header="Waktu (Detik)" />
        <Column header="Nilai" />
        <Column header='Nilai Rata - Rata Test "B"' />
      </Row>
    </ColumnGroup>
  );
  return (
    <>
      <Card>
        <PrimeReactProvider>
          <DataTable
            value={data}
            dataKey="no"
            showGridlines
            scrollable
            tableStyle={{ minWidth: "50rem" }}
            paginator
            loading={isLoading}
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="Data tidak ditemukan"
            headerColumnGroup={headerGroup}
          >
            <Column field="no" header="NO"></Column>
            <Column field="name" header="Nama"></Column>
            <Column
              field="r_score"
              header="JARAK (Meter)"
              body={(rowData) => {
                return <span>{rowData?.exercise_a?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_run"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_a?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="range"
              header="JUMLAH (Kali)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[0]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_sit_up"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[0]?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="range"
              header="JUMLAH (Kali)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[1]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_push_up"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[1]?.t_score || 0}</span>;
              }}
            ></Column>
            {/* <Column field="range" header="JUMLAH (Kali)"></Column>
            <Column field="score_pull_up" header="NILAI"></Column> */}
            <Column
              field="range"
              header="WAKTU (DETIK)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[2]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_shuttle_run"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[2]?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="average_test_b"
              header="Rata - Rata Test'B'"
              body={(rowData) => {
                return <span>{rowData?.mean_exercise_b || 0}</span>;
              }}
            ></Column>
            <Column
              field="final_score"
              header="NILAI AKHIR"
              body={(rowData) => {
                return <span>{rowData?.total_score?.score || 0}</span>;
              }}
            ></Column>
            <Column
              field="final_score_alphabet"
              header="NILAI AKHIR"
              body={(rowData) => {
                return <span>{rowData?.total_score?.grade || 0}</span>;
              }}
            ></Column>
          </DataTable>
        </PrimeReactProvider>
      </Card>
    </>
  );
};
export default DetailSessionRankMaleTable;
