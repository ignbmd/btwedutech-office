import clsx from "clsx";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import ReactHtmlParser from "react-html-parser";

import "./index.css";
import $ from "jquery";
import "jquery/dist/jquery.min.js";
import "datatables.net";
import "datatables.net-dt/css/jquery.dataTables.min.css";

import { fourYearsFromNow, fourYearsFromNow2Years } from "../../utility/Utils";
import TableLoader from "../core/skeleton-loader/TableLoader";
import { afirmationTableRowHeading } from "../../config/competition_maps";

const CompetitionMapTableDaerah = ({ studies }) => {
  const getCompetitionValue = (list, location_id, type, year) => {
    let val = "";
    if (list.length > 0) {
      let filtered;
      if (location_id) {
        filtered = list
          .reverse()
          .filter(
            (x) =>
              x.type === type &&
              x.year === year &&
              x.location_id?._id == location_id
          );
      } else {
        filtered = list
          .reverse()
          .filter(
            (x) => x.type === type && x.year === year && x.location_id === null
          );
      }
      if (filtered.length > 0) {
        val = filtered[0].value;
      }
    }
    if (type === "RASIO") {
      return val ? `<span class='comp-map-val'>${val}</span>` : "-";
    }
    if (type === "LOWEST_STATUS" && val) {
      return val ? "P/L" : "PA/L";
    }
    return val ? val : "-";
  };

  useEffect(() => {
    if ($("#comp-map-table").length > 0 && studies.length > 0) {
      setTimeout(() => {
        $("#comp-map-table").DataTable({
          paging: false,
        });
      }, 1000);
    }
  }, [studies]);

  return !studies.length ? (
    <TableLoader />
  ) : (
    <table
      id="comp-map-table"
      className="display w-100 mt-25 bg-main-blue-5 table-comp-map"
    >
      <thead className="text-white text-center">
        <tr>
          <th
            colSpan="4"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            INFORMASI UMUM
          </th>
          <th
            colSpan="3"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            Kuota
          </th>
          <th
            colSpan="3"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            Pelamar
          </th>
          <th
            colSpan="3"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            Peta Persaingan
            <br />
            (1 Kursi Diperebutkan...)
          </th>
          <th
            colSpan="3"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            Peta Persaingan
            <br />
            (Presentase Kemungkinan Kelulusan)
          </th>
          <th
            colSpan="9"
            className="border-l border-t border-b border-r border-solid border-gray-300"
          >
            NILAI SKD TERENDAH FORMULASI 2,5 X KUOTA (N)
          </th>
        </tr>
        <tr>
          <th
            colSpan="4"
            className="border-r border-t border-solid border-gray-300"
          />
          {Array(4)
            .fill(null)
            .map(() =>
              fourYearsFromNow.map((_) => (
                <th
                  key={nanoid()}
                  className="border-l border-t border-b border-r border-solid border-gray-300"
                />
              ))
            )}
          {fourYearsFromNow2Years.map((year) => (
            <th
              key={nanoid()}
              colSpan="2"
              className="border-l border-t border-b border-r border-solid border-gray-300"
            >
              {year}
            </th>
          ))}
        </tr>
        <tr>
          <th>Instansi</th>
          <th>Sekolah</th>
          <th>Prodi</th>
          <th>Alokasi Daerah</th>
          {Array(4)
            .fill(null)
            .map((_, parentIndex) =>
              fourYearsFromNow.map((year, index) => {
                const type =
                  parentIndex === 0
                    ? "KUOTA"
                    : index === 1
                    ? "PENDAFTAR"
                    : index === 2
                    ? "RASIO"
                    : "PASS_OPPORTUNITY";
                return (
                  <th
                    key={nanoid()}
                    className={clsx(
                      "border-l border-r border-t border-b border-solid border-gray-300 pl-2 pr-2"
                    )}
                  >
                    <div className="d-flex align-items-center">
                      <span className="mr-25">{year}</span>
                    </div>
                  </th>
                );
              })
            )}
          {Array(2)
            .fill(null)
            .map(() =>
              afirmationTableRowHeading.map((heading) => (
                <th
                  key={nanoid()}
                  className="border-l border-r border-t border-b border-solid border-gray-300 pl-2 pr-2"
                >
                  {heading.text}
                </th>
              ))
            )}
        </tr>
      </thead>
      <tbody className="bg-main-gray-1">
        {studies?.length ? (
          studies.map((study) => {
            return study.competitions
              .reduce(
                (unique, item) =>
                  unique.find(
                    (uniqueItem) =>
                      uniqueItem.location_id?._id == item.location_id?._id
                  )
                    ? unique
                    : [...unique, item],
                []
              )
              .map((competition, index) => {
                return (
                  <tr
                    key={nanoid()}
                    className={clsx((index + 1) % 2 === 0 && "bg-white")}
                  >
                    <td>{study.school_id?.ministry}</td>
                    <td>{study.school_id?.name}</td>
                    <td>{study.name}</td>
                    <td className="text-center">
                      {competition.location_id?.name ?? "PUSAT"}
                    </td>
                    {fourYearsFromNow.map((year) => (
                      <td key={nanoid()} className="text-center">
                        {getCompetitionValue(
                          study.competitions,
                          competition.location_id?._id,
                          "KUOTA",
                          year.toString()
                        )}
                      </td>
                    ))}
                    {fourYearsFromNow.map((year) => (
                      <td key={nanoid()} className="text-center">
                        {getCompetitionValue(
                          study.competitions,
                          competition.location_id?._id,
                          "PENDAFTAR",
                          year.toString()
                        )}
                      </td>
                    ))}
                    {fourYearsFromNow.map((year) => {
                      const registran = getCompetitionValue(
                        study.competitions,
                        competition.location_id?._id,
                        "PENDAFTAR",
                        year.toString()
                      );
                      const quota = getCompetitionValue(
                        study.competitions,
                        competition.location_id?._id,
                        "KUOTA",
                        year.toString()
                      );
                      return (
                        <td key={nanoid()} className="text-center">
                          {registran && quota && registran !== '-' && quota !== '-' ? (
                            <span className="comp-map-val">
                              {Math.ceil(+registran / +quota)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                    {fourYearsFromNow.map((year, yearIndex) => {
                      const quota = +getCompetitionValue(
                        study.competitions,
                        competition.location_id?._id,
                        "KUOTA",
                        year.toString()
                      );

                      const registrant = +getCompetitionValue(
                        study.competitions,
                        competition.location_id?._id,
                        "PENDAFTAR",
                        year.toString()
                      );

                      const finalValue =
                        quota && registrant
                          ? Math.ceil((quota / registrant) * 100)
                          : null;

                      return (
                        <td key={yearIndex} className="text-center">
                          {finalValue ? `${finalValue}%` : "-"}
                        </td>
                      );
                    })}
                    {fourYearsFromNow2Years.map((year) => {
                      return afirmationTableRowHeading.map((heading) => (
                        <td key={nanoid()} className="text-center">
                          {getCompetitionValue(
                            study.competitions,
                            competition.location_id?._id,
                            heading.type,
                            year.toString()
                          )}
                        </td>
                      ));
                    })}
                  </tr>
                );
              });
          })
        ) : (
          <tr className="text-center mt-2">
            <td colSpan="100">Data Tidak Ditemukan</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CompetitionMapTableDaerah;
