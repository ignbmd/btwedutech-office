import React, { useContext } from "react";
import { Card, Col } from "reactstrap";
import styles from "./SchoolInfo.module.css";
import clsx from "clsx";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import ContentLoader from "react-content-loader";
const SchoolInfo = () => {
  const {
    toggleSchoolModalVisibility,
    toggleAssignedAccessCodeModalVisibility,
    toggleAssignNewAccessCodeModalVisibility,
    school,
  } = useContext(InterestAndTalentSchoolContext);

  const canUserAssignAccessCode = () => {
    const dom = document.getElementById("allowed-actions");
    const allowedActions = JSON.parse(dom.innerText);
    return allowedActions.includes("assign_access_code");
  };

  return (
    <Col sm="12">
      <Card className={clsx("p-3")}>
        {!school ? (
          <ContentLoader viewBox="0 0 380 70" className="mt-3">
            <rect x="0" y="0" rx="5" ry="5" width="100%" height="10" />
            <rect x="0" y="14" rx="5" ry="5" width="100%" height="10" />
            <rect x="0" y="28" rx="5" ry="5" width="100%" height="10" />
          </ContentLoader>
        ) : (
          <>
            <div className={clsx(styles["school-detail-container"])}>
              <img
                className={clsx(styles["school-image"])}
                src={school?.logo}
              />
              <div className={clsx(styles["school-info-container"])}>
                <div>
                  <h6 className={clsx("text-muted")}>Nama Sekolah</h6>
                  <h6 className={clsx("font-weight-bolder")}>{school?.name}</h6>
                </div>
                <div>
                  <h6 className={clsx("text-muted")}>Jenis</h6>
                  <h6 className={clsx("font-weight-bolder")}>{school?.type}</h6>
                </div>
              </div>
              <div className={clsx(styles["vertical-divider"])}></div>
              <div className={clsx(styles["school-info-container"])}>
                <div>
                  <h6 className={clsx("text-muted")}>Alamat</h6>
                  <h6 className={clsx("font-weight-bolder")}>
                    {school?.address}
                  </h6>
                </div>
              </div>
              <button
                className={clsx(
                  `btn btn-outline-primary ${styles["school-edit-btn"]}`
                )}
                onClick={toggleSchoolModalVisibility}
              >
                Edit
              </button>
            </div>
            <table border="1">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Total Peserta</th>
                  <th style={{ width: "35%" }}>Kode Terassign</th>
                  {canUserAssignAccessCode() ? (
                    <th style={{ width: "auto" }}>Aksi</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className={clsx(`${styles["count-text"]}`)}>
                      {school?.student_count}
                    </span>
                  </td>
                  <td>
                    <div className={clsx(`${styles["assigned-code-section"]}`)}>
                      <span className={clsx(`${styles["count-text"]}`)}>
                        {school?.exam_codes_total}
                      </span>
                      <button
                        className={clsx("btn btn-outline-primary")}
                        onClick={toggleAssignedAccessCodeModalVisibility}
                        disabled={!school?.exam_codes_total}
                      >
                        Riwayat
                      </button>
                    </div>
                  </td>
                  {canUserAssignAccessCode() ? (
                    <td>
                      <button
                        className={clsx("btn btn-gradient-primary")}
                        onClick={toggleAssignNewAccessCodeModalVisibility}
                        disabled={school?.tag?.includes("SIPLAH")}
                      >
                        Assign Kode Akses
                      </button>
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </table>
          </>
        )}
      </Card>
    </Col>
  );
};

export default SchoolInfo;
