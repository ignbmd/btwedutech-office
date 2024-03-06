import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, InputGroup } from "reactstrap";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import {
  getExamResult,
  getSkdRankTryout,
  getTryoutDetail,
} from "../../services/comp-map/comp-map";
import TableLoader from "../core/skeleton-loader/TableLoader";
import Select from "react-select";
import moment from "moment";

const urlParam = (num) => {
  const url = window.location.pathname;
  const urlParam = url.split("/");
  return parseInt(urlParam[num]);
};

const TryoutCompetitionMapTable = () => {
  const tryout_id = urlParam(4);
  const task_id = urlParam(3);
  const yearNow = new Date().getFullYear();
  const objectYears = (year) => {
    return { years: year, label: year };
  };
  const getYears = () => {
    let twoYearsAgo = yearNow - 2;
    let years = [];
    while (twoYearsAgo <= yearNow) {
      years.push(objectYears(twoYearsAgo++));
    }
    return years;
  };
  const years = getYears();

  const [year, setYear] = useState(
    years.find((value) => value.years === yearNow)
  );
  const [data, setData] = useState([]);
  const [skdRank, setSkdRank] = useState();
  const [examResult, setExamResult] = useState();
  const [tryout, setTryout] = useState();
  const [isFetchingRank, setIsFetchingRank] = useState(true);

  const fetchExamResult = async (task_id) => {
    try {
      const payload = { task_id: task_id };
      const response = await getExamResult(payload);
      setExamResult(response.data);
    } catch (error) {
      console.log({ error });
    }
  };

  const fetchSkdRankTryout = async (years) => {
    try {
      setIsFetchingRank(true);
      const payload = { task_id: task_id, year: years };
      const response = await getSkdRankTryout(payload);
      setSkdRank(response.data);
      setIsFetchingRank(false);
    } catch (error) {
      console.log({ error });
      setIsFetchingRank(false);
    }
  };

  const fetchTryoutDetail = async (id) => {
    try {
      const response = await getTryoutDetail(id);
      setTryout(response);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleYear = (value) => {
    setYear(value);
  };

  useEffect(() => {
    fetchTryoutDetail(tryout_id);
    fetchExamResult(task_id);
  }, []);

  useEffect(() => {
    if (examResult && year.years) {
      fetchSkdRankTryout(year.years);
    }
  }, [year.years, examResult]);

  useEffect(() => {
    let allData = [];
    if (skdRank) {
      const resultRank = examResult.ranks;
      resultRank.forEach((student) => {
        skdRank.forEach((ranks) => {
          if (ranks.smartbtw_id == student.smartbtw_id) {
            let list_school = ranks.skd_rank_list;
            list_school.forEach((school) => {
              let tempData = {};
              tempData.name = student.student_name;
              tempData.twk = student.score_values.TWK.score;
              tempData.tiu = student.score_values.TIU.score;
              tempData.tkp = student.score_values.TKP.score;
              tempData.total = ranks.skd_score;
              tempData.status = student.status_text;
              tempData.sekolah = school.school_name;
              tempData.jurusan = school.study_program_name;
              tempData.kuota = school.study_program_quota;
              tempData.ranking = school.student_rank;
              allData.push(tempData);
            });
          }
        });
      });
      setData(allData);
    }
  }, [skdRank]);

  const gridStyle = { minHeight: 600 };

  const columns = [
    { name: "name", header: "Nama", defaultFlex: 1 },
    {
      name: "twk",
      header: "TWK",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "tiu",
      header: "TIU",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "tkp",
      header: "TKP",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "total",
      header: "Total",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "status",
      header: "Status",
      defaultWidth: 100,
    },
    {
      name: "sekolah",
      header: "Sekolah",
      defaultFlex: 1,
    },
    {
      name: "jurusan",
      header: "Jurusan",
      defaultFlex: 1,
    },
    {
      name: "kuota",
      header: "Kuota",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "ranking",
      header: "Ranking",
      defaultFlex: 1,
      defaultWidth: 80,
      type: "number",
      filterEditor: NumberFilter,
    },
  ];

  const filterValue = [
    { name: "name", operator: "contains", type: "string", value: "" },
    { name: "twk", operator: "gte", type: "number", value: "" },
    { name: "tiu", operator: "gte", type: "number", value: "" },
    { name: "tkp", operator: "gte", type: "number", value: "" },
    { name: "total", operator: "gte", type: "number", value: "" },
    { name: "status", operator: "eq", type: "string", value: "" },
    { name: "sekolah", operator: "contains", type: "string", value: "" },
    { name: "jurusan", operator: "contains", type: "string", value: "" },
    { name: "kuota", operator: "gte", type: "number", value: "" },
    { name: "ranking", operator: "gte", type: "number", value: "" },
  ];

  const handleDownload = () => {
    window.open(`${window.location.href}/download/${year.years}`, "_blank");
  };

  return (
    <Card className="px-2 pt-4">
      <CardHeader>
        <h3>Peta Persaingan Tryout SKD</h3>
      </CardHeader>
      <CardBody>
        <InputGroup className="input-group-merge w-25">
          <Select
            id="year"
            options={years}
            classNamePrefix="select"
            className="react-select w-100"
            onChange={handleYear}
            isSearchable={false}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.years}
            value={year}
          />
        </InputGroup>
        {isFetchingRank ? (
          <TableLoader />
        ) : (
          <>
            <div className="mt-2">
              <p>Tryout : {tryout?.packages?.title}</p>
              <p>
                Tanggal : {moment(tryout?.created_at).locale("ID").format("LL")}
              </p>
            </div>
            <div className="mt-3 d-flex justify-content-end">
              <button className="btn btn-danger" onClick={handleDownload}>
                Unduh PDF
              </button>
            </div>
            <div className="mt-2">
              <ReactDataGrid
                idProperty="id"
                style={gridStyle}
                defaultFilterValue={filterValue}
                columns={columns}
                dataSource={data}
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default TryoutCompetitionMapTable;
