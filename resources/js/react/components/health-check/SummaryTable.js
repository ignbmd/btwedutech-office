import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { Edit, File } from "react-feather";
import { Button, Table } from "reactstrap";
import { stakes } from "../../config/mcu";

const SummaryTable = ({ summary, branch, classes, toggleEdit }) => {
  const [highestStakes, setHighestStakes] = useState();

  useEffect(() => {
    const copySummary = [...summary.summary];
    copySummary.sort((a, b) => b.value - a.value);
    const highestStakesValue = copySummary[0]?.value;
    const currentHighest = stakes.find(
      (item) => item.value == highestStakesValue
    );
    setHighestStakes(currentHighest ?? {});
  }, []);

  return (
    <>
      <Table borderless striped responsive className="mt-1">
        <thead className="thead-light">
          <tr>
            <th width="30%">Biodata</th>
            <th width="70%" className="text-center" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nama</td>
            <td>
              {summary.name ? (
                summary.name
              ) : (
                <span className="text-danger">TIDAK DIISI</span>
              )}
            </td>
          </tr>
          <tr>
            <td>Email</td>
            <td>
              {summary.email ? (
                summary.email
              ) : (
                <span className="text-danger">TIDAK DIISI</span>
              )}
            </td>
          </tr>
          <tr>
            <td>Cabang</td>
            <td>
              {!branch ? (
                <ContentLoader viewBox="0 0 200 5">
                  <rect x="0" y="0" rx="0" ry="0" width="30%" height="5" />
                </ContentLoader>
              ) : (
                branch
              )}
            </td>
          </tr>
          <tr>
            <td>Kelas</td>
            <td>
              {!classes ? (
                <ContentLoader viewBox="0 0 200 5">
                  <rect x="0" y="0" rx="0" ry="0" width="30%" height="5" />
                </ContentLoader>
              ) : classes.length > 0 ? (
                <ul className="pl-1">
                  {classes.map((className, index) => (
                    <li key={index}>{className}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-danger">Belum Mengikuti Kelas</span>
              )}
            </td>
          </tr>
          <tr>
            <td>Umur</td>
            <td>
              {summary.age ? (
                summary.age
              ) : (
                <span className="text-danger">TIDAK DIISI</span>
              )}
            </td>
          </tr>
          <tr>
            <td>BMI</td>
            <td>
              {summary.bmi ? (
                summary.bmi
              ) : (
                <span className="text-danger">TIDAK DIISI</span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      <Table borderless striped responsive className="mt-1">
        <thead className="thead-light">
          {!summary?.summary ? (
            <p>Tidak ada ada</p>
          ) : (
            summary.summary.map((item) => {
              const stakesDetail = stakes.find(
                (stakesItem) => stakesItem.value == item.value
              );
              return (
                <tr key={item.area}>
                  <th width="70%">{item.text}</th>
                  <th width="30%" className="text-center">
                    {stakesDetail ? (
                      <span
                        className="font-weight-bolder"
                        style={{ color: stakesDetail.color }}
                      >
                        STAKES {stakesDetail.label}
                      </span>
                    ) : (
                      "-"
                    )}
                  </th>
                </tr>
              );
            })
          )}
        </thead>
      </Table>

      <Table borderless striped responsive className="mt-1">
        <thead className="thead-light">
          <tr>
            <th width="70%">Status Kesehatan</th>
            <th width="30%" className="text-center">
              <span
                className="font-weight-bolder"
                style={{ color: highestStakes?.color }}
              >
                {["1", "2", "2P"].some(
                  (value) => value === highestStakes?.label
                )
                  ? "MS"
                  : "TMS"}
              </span>
            </th>
          </tr>
        </thead>
      </Table>

      <Table borderless striped responsive className="mt-1">
        <thead className="thead-light">
          <tr>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{summary?.comment ?? "-"}</td>
          </tr>
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-2">
        <Button
          type="button"
          color="info"
          className="btn-next mr-50"
          tag="a"
          target="_blank"
          href={`/kesehatan/cetak-hasil-pengecekan-kesehatan/${summary?._id}`}
        >
          <File size={14} className="align-middle mr-50" />
          <span className="align-middle d-sm-inline-block d-none">
            Unduh Hasil
          </span>
        </Button>
        <Button
          type="submit"
          color="outline-warning"
          className="btn-next"
          onClick={toggleEdit}
        >
          <Edit size={14} className="align-middle mr-50" />
          <span className="align-middle d-sm-inline-block d-none">Ubah</span>
        </Button>
      </div>

      {/* <Controller
              name="comment"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill mt-1">
                    <Label className="form-label">Rekomendasi Pemeriksaan</Label>
                    <Input
                      {...rest}
                      type="textarea"
                      id="comment"
                      innerRef={ref}
                      invalid={error && true}
                      placeholder="Inputkan Rekomedasi Pemeriksaan"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            /> */}
    </>
  );
};

export default SummaryTable;
