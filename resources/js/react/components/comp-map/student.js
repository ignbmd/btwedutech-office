import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Card, CardHeader, CardBody, InputGroup } from "reactstrap";
import { getSkdRank, getExamResult } from "../../services/comp-map/comp-map";
import clsx from "clsx";
import TableLoader from "../core/skeleton-loader/TableLoader";
import moment from "moment";

const urlParam = (num) => {
  const url = window.location.pathname;
  const urlParam = url.split("/");
  return parseInt(urlParam[num]);
};

const StudentCompetitionMapTable = () => {
  const task_id = urlParam(4);
  const smartbtw_id = urlParam(3);
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

  const pg = {
    TWK: 65,
    TIU: 80,
    TKP: 165,
  };

  const [year, setYear] = useState(
    years.find((value) => value.years === yearNow)
  );
  const [data, setData] = useState();
  const [examResult, setExamResult] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingRank, setIsFetchingRank] = useState(true);

  const fetchExamResult = async (task_id, smartbtw_id) => {
    try {
      setIsLoading(true);
      const payload = { task_id: task_id, smartbtw_id: smartbtw_id };
      const response = await getExamResult(payload);
      setExamResult(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  };

  const fetchSkdRank = async (score, years) => {
    try {
      setIsFetchingRank(true);
      const payload = { score: score, year: years };
      const response = await getSkdRank(payload);
      setData(response.data);
      setIsFetchingRank(false);
    } catch (error) {
      console.log({ error });
      setIsFetchingRank(false);
    }
  };

  const handleYear = (value) => {
    setYear(value);
  };

  useEffect(() => {
    fetchExamResult(task_id, smartbtw_id);
  }, []);

  useEffect(() => {
    if (examResult?.user_result?.total_score && year.years)
      fetchSkdRank(examResult?.user_result?.total_score, year.years);
  }, [year.years, examResult]);

  const handleDownload = () => {
    window.open(`${window.location.href}/download/${year.years}`, "_blank");
  };

  return (
    <Card className="overflow-auto mx-auto px-2 pt-4">
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
        {isLoading ? (
          <TableLoader />
        ) : (
          <>
            <div className="mt-2">
              <p>Nama : {examResult?.user_result?.student_name}</p>
              <p>Email : {examResult?.user_result?.student_email}</p>
              <p>
                Tryout : {examResult?.user_result?.title} -{" "}
                {moment(examResult?.user_result?.start)
                  .locale("ID")
                  .format("LL")}
              </p>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h5>Hasil Tryout</h5>
              <button className="btn btn-danger" onClick={handleDownload}>
                Unduh PDF
              </button>
            </div>
            <table className="table mt-2 text-center table-bordered">
              <thead>
                <tr>
                  <th scope="col">TWK</th>
                  <th scope="col">TIU</th>
                  <th scope="col">TKP</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className={clsx(
                      examResult?.user_result?.score_values.TWK.score >= pg.TWK
                        ? "text-success"
                        : "text-danger"
                    )}
                  >
                    {examResult?.user_result?.score_values.TWK.score}
                  </td>
                  <td
                    className={clsx(
                      examResult?.user_result?.score_values.TIU.score >= pg.TIU
                        ? "text-success"
                        : "text-danger"
                    )}
                  >
                    {examResult?.user_result?.score_values.TIU.score}
                  </td>
                  <td
                    className={clsx(
                      examResult?.user_result?.score_values.TKP.score >= pg.TKP
                        ? "text-success"
                        : "text-danger"
                    )}
                  >
                    {examResult?.user_result?.score_values.TKP.score}
                  </td>
                  <td>{examResult?.user_result?.total_score}</td>
                  <td
                    className={clsx(
                      examResult?.user_result?.status_text == "TIDAK LULUS"
                        ? "text-danger"
                        : "text-success"
                    )}
                  >
                    {examResult?.user_result?.status_text}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        <div className="mt-3 d-flex justify-content-between">
          <h5>Ranking SKD</h5>
        </div>
        {isFetchingRank ? (
          <TableLoader />
        ) : (
          <table className="table mt-2 table-bordered table-striped">
            <thead>
              <tr>
                <th scope="col">Sekolah</th>
                <th scope="col">Jurusan</th>
                <th scope="col">Kuota</th>
                <th scope="col">Ranking</th>
              </tr>
            </thead>
            <tbody>
              {data.map((school, index) => (
                <tr key={index}>
                  <td>{school.school_name ?? "-"}</td>
                  <td>{school.study_program_name ?? "-"}</td>
                  <td>{school.study_program_quota ?? "-"}</td>
                  <td>
                    {school.student_rank ?? "Nilai tidak masuk dalam ranking"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
};

export default StudentCompetitionMapTable;
