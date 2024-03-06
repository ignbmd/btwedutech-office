import axios from "axios";
import classnames from "classnames";
import { Save } from "react-feather";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Card, Badge, Button, CardHeader, CardTitle } from "reactstrap";

import "flatpickr/dist/themes/airbnb.css";
import SpinnerCenter from "../core/spinners/Spinner";
import { getLastSegment } from "../../utility/Utils";
import DetailQuestionCard from "./DetailQuestionCard";
import SelectQuestionIndex from "./module/select-question";
import SelectedQuestionIndex from "./module/selected-question";
import {
  getQuestionById,
  saveConnectQuestion,
} from "../../services/exam/question";
import { ExamModuleContext } from "../../context/ExamModuleContext";
import ContentLoader from "react-content-loader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const source = axios.CancelToken.source();

const ConnectQuestionSection = () => {
  const [isFetchingQuestionParent, setIsFetchingQuestionParent] =
    useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentQuestion, setParentQuestion] = useState();
  const isCanceled = useRef(false);

  const { examModuleState, selectQuestionForce, getQuestions } =
    useContext(ExamModuleContext);
  const {
    questions,
    isFetchingQuestion: isFetchingQuestionChild,
    isLoadMore,
    selectedQuestions,
    selectedQuestionData,
    page,
    limit,
  } = examModuleState;

  const getPayload = () => {
    const payload = {
      parent_id: parentQuestion.id,
      child_id: selectedQuestionData.map((item) => item.id),
    };

    return payload;
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian/bank-soal";
  };

  const submitHandler = async () => {
    try {
      setIsSubmitting(true);
      if (selectedQuestionData) {
        handleUpdateConnectedQuestion();
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsSubmitting(false);
      }
    }
  };

  const MySwal = withReactContent(Swal);

  const handleUpdateConnectedQuestion = async () => {
    const state = await MySwal.fire({
      title: "Apakah anda yakin ingin mengubah hubungan soal ini?",
      text: "Mengubah hubungan soal akan generate semua modul yang berkaitan dengan pertanyaan ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ubah hubungan soal",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-warning",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return setIsSubmitting(false);
    const payload = getPayload();
    await saveConnectQuestion(payload);
    if (!isCanceled.current) {
      redirectToIndex();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingQuestionParent(true);
        const questionId = getLastSegment();
        const question = await getQuestionById(questionId, {
          cancelToken: source.token,
        });
        if (!isCanceled.current) {
          setParentQuestion(question);
          setIsFetchingQuestionParent(false);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (parentQuestion?.program && !isLoadMore) {
      getQuestions({ program: parentQuestion.program, types: "CHILD", pages: page, limit: limit, question_category_id: parentQuestion.category_id });
    }
  }, [parentQuestion?.program, page]);

  useEffect(() => {
    if (questions.length > 0) {
      if (parentQuestion) {
        const selectedQuestions = parentQuestion?.child_questions;
        let selectedChildQuestions = [];
        selectedQuestions.map((question) => {
          selectedChildQuestions = [...selectedChildQuestions, question, ...selectedQuestions];
        });
        selectedChildQuestions.map((question) => {
          selectQuestionForce(question);
        });
      }
    }
  }, [parentQuestion, questions.length]);

  return (
    <>
      <Card className={classnames("pb-75", isSubmitting && "block-content")}>
        {isFetchingQuestionParent ? (
          <SpinnerCenter />
        ) : (
          <>
            <div className="px-2 pt-2">
              <Badge color="info" className="mr-50 text-capitalize" pill>
                Induk Soal
              </Badge>
              <Badge color="primary" className="mr-50 text-capitalize" pill>
                #{parentQuestion.id}
              </Badge>
              {parentQuestion.tags.map((label) => (
                <Badge
                  key={label}
                  color="light-success"
                  className="mr-50 text-capitalize"
                  pill
                >
                  {label}
                </Badge>
              ))}
            </div>
            <DetailQuestionCard question={parentQuestion} />
            <div className="bg-light-success mt-1 px-3 py-2">
              <h6 className="section-label text-success my-1 font-weight-bolder">
                Anak Soal Terpilih
              </h6>
            </div>
            <div className="mx-1">
              {isFetchingQuestionChild ? (
                <ContentLoader viewBox="0 0 200 5" className="mt-1">
                  <rect x="0" y="0" rx="0" ry="0" width="100%" height="10" />
                </ContentLoader>
              ) : (
                <SelectedQuestionIndex withChildCheckbox={true} />
              )}
              <div className="text-right mt-4">
                <Button
                  type="submit"
                  color="gradient-success"
                  disabled={selectedQuestions?.length == 0}
                  onClick={
                    selectedQuestions?.length > 0 ? submitHandler : () => { }
                  }
                >
                  {isSubmitting ? (
                    "Sedang Menyimpan..."
                  ) : (
                    <>
                      <Save size={14} /> Simpan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <Card>
        {parentQuestion && (
          <>
            <CardHeader>
              <CardTitle className="font-weight-bolder">
                Pilih Anak Soal
              </CardTitle>
            </CardHeader>
            <SelectQuestionIndex />
          </>
        )}
      </Card>
    </>
  );
};

export default ConnectQuestionSection;
