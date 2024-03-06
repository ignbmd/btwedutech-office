import * as yup from "yup";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardBody, Col, Row } from "reactstrap";
import React, { useEffect, useRef, useState } from "react";

import SpinnerCenter from "../core/spinners/Spinner";
import { getRecordSummary } from "../../services/mcu/record";
import SummaryEdit from "./SummaryEdit";
import SummaryTable from "./SummaryTable";
import { getClassesBySmartbtwIds } from "../../services/learning/classes";
import { getStudentById } from "../../services/learning/student";
import { getBranchByCode } from "../../services/branch/branch";

const FormSchema = {
  comment: yup.string().required("Wajib diisi"),
};

const SummarySection = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [branch, setBranch] = useState();
  const [summary, setSummary] = useState();
  const [classes, setClasses] = useState();
  const isCanceled = useRef(false);
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const getHistoryId = () => {
    const dom = document.getElementById("historyId");
    return dom.innerText;
  };

  const fetchSummary = async () => {
    try {
      const historyId = getHistoryId();
      const res = await getRecordSummary(historyId);
      const summaryData = res?.data ?? {};

      if (!isCanceled.current) {
        setSummary(summaryData);
      }
    } catch (error) {}
  };

  const fetchStudentClassroom = async (studentId) => {
    try {
      const res = await getClassesBySmartbtwIds({ student_ids: studentId ? [studentId] : []});
      const classesData = res?.data ?? {};
      if (!isCanceled.current) {
        setClasses(classesData)
      }
    } catch (error) {
      if (!isCanceled.current) {
        setClasses([])
      }
    }
  };

  const fetchBranch = async (code) => {
    try {
      const res = await getBranchByCode(code);
      const branchData = res?.data ?? {};
      return branchData
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const fetchStudentProfile = async (studentId) => {
    try {
      const res = await getStudentById(studentId);
      const studentData = res?.data ?? {};
      if (!isCanceled.current) {
        if(studentData.branch_code) {
          const branch = await fetchBranch(studentData.branch_code);
          setBranch(branch.name ?? '-')
          return;
        }
        setBranch('-')
      }
    } catch (error) {
      if (!isCanceled.current) {
        setBranch('Gagal Memuat')
      }
    }
  };

  const toggleEdit = () => {
    setIsEdit((current) => !current);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    window.scrollTo(0,0);
  }, [isEdit])

  useEffect(() => {
    if(summary) {
      fetchStudentClassroom(summary.smartbtw_id)
      fetchStudentProfile(summary.smartbtw_id)
    }
  }, [summary]);

  return !summary ? (
    <SpinnerCenter />
  ) : (
    <>
      <Row className={classnames(isEdit ? "d-none" : "d-block")}>
        <Col sm="12">
          <Card>
            <CardBody>
              <SummaryTable summary={summary} branch={branch} classes={classes} toggleEdit={toggleEdit} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <div className={classnames(isEdit ? "d-block" : "d-none")}>
        <SummaryEdit summary={summary} branch={branch} toggleEdit={toggleEdit} />
      </div>
    </>
  );
};

export default SummarySection;
