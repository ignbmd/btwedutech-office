import React from "react";
import { useState } from "react";
import classnames from "classnames";

import "./TryoutSmartBTWPreview.css";
import CKEditorParser from "../core/parser/CKEditorParser";

const TryoutSmartBTWPreview = ({ className, questions }) => {
  const [questionActive, setQuestionActive] = useState(1);

  const nextHandler = () => {
    if (questionActive != questions.length) {
      setQuestionActive((current) => current + 1);
    }
  };

  const numberClickHandler = (selectedNumber) => {
    if (selectedNumber == questionActive) return;
    setQuestionActive(selectedNumber);
  };

  return (
    <div className={classnames("start-to", className)}>
      {questions?.map((question, questionIndex) => (
        <div
          key={questionIndex}
          className={
            questionIndex + 1 == questionActive
              ? "gen3__start-to__header active"
              : "gen3__start-to__header"
          }
        >
          <div className="font-weight-bolder">
            <p className="mb-0">
              <b>SOAL SKD BERBASIS CAT</b>
            </p>
            <p className="mb-0" style={{ color: "rgb(255, 202, 99)" }}>
              <b>{question?.question_categories?.description ?? "Tidak ada deskripsi"}</b>
            </p>
            <p className="mt-2 font-weight-bolder">
              Nama : Dwiky Chandra Hidayat
            </p>
          </div>
          <p className="mt-75 mb-0 text-xs">Sisa Waktu</p>
          <div className="countdown-container">
            <div
              className="countdown desc-text px-2 py-1"
              style={{
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "8px",
              }}
            >
              <div className="block text-4xl leading-none">
                <span className="font-weight-bolder h1 mb-0">1</span>
                <span className="text">Jam</span>
              </div>
              <span className="font-weight-bolder divider flex items-center">
                <div className="colon">:</div>
              </span>
              <div className="block text-4xl leading-none">
                <span className="font-weight-bolder h1 mb-0">27</span>
                <span className="text">Menit</span>
              </div>
              <span className="font-weight-bolder divider flex items-center">
                <div className="colon">:</div>
              </span>
              <div className="block text-4xl leading-none">
                <span className="font-weight-bolder h1 mb-0">29</span>
                <span className="text">detik</span>
              </div>
            </div>
            <p className="countdown-desc" />
          </div>
        </div>
      ))}
      <div className="body-section body-section--rounded  body-section--paddingShrink ">
        <div className="start-to__body">
          {questions?.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className={
                questionIndex + 1 == questionActive
                  ? "gen3__start-to-question active"
                  : "gen3__start-to-question"
              }
            >
              <p className="question-number">
                Soal Nomor :{" "}
                <span className="question-number__number flex">
                  {questionIndex + 1}
                </span>
              </p>
              <hr className="question-divider" />
              <div className="question text-tiny-sm desc-text font-weight-bolder">
                <CKEditorParser mString={question.question} />
              </div>
              <p className="mt-2 title-text font-weight-bolder">
                <b>Opsi Jawaban</b>
              </p>
              {question.answers.map((answer, index) => {
                const lowerOption = answer.option?.toLowerCase();
                return (
                  <label
                    key={index}
                    className="start-to-choose-opt mt-75 border border-info rounded-lg"
                    style={{
                      pointerEvents: "none",
                    }}
                  >
                    <span className="gen3__start-to__answerText d-flex">
                      <CKEditorParser mString={
                        `<div class="mr-25 flex-shrink-0">${lowerOption}.</div> <div class="flex-grow-1">${answer.answer}</div>`
                      } />
                    </span>
                    <input
                      className="gen3__start-to__radioButton"
                      type="radio"
                      readOnly
                    />
                  </label>
                );
              })}
            </div>
          ))}
          <div className="start-to-main-action active">
            <div className="start-to-main-action__media-right">
              <button
                type="button"
                className="btn font-weight-bolder rounded-lg gen3__start-to__btn-primary"
                onClick={nextHandler}
              >
                Simpan &amp; Lanjutkan
              </button>
              <button
                type="button"
                className="btn font-weight-bolder rounded-lg gen3__start-to__btn-warning"
                onClick={nextHandler}
              >
                Lewati Soal
              </button>
            </div>
            <button
              type="button"
              className="btn font-weight-bolder rounded-lg gen3__start-to__btn-success btn-submit"
            >
              Selesai Ujian
            </button>
          </div>
        </div>
      </div>
      <div className="start-to__number-action">
        <div className="gen3__start-to__number-action-info">
          <div className="start-to__number-action-info__1">
            <span className="bullet gen3__start-to__bg-success" />
            <span className="font-weight-bolder">Sudah Terjawab</span>
          </div>
          <div className="start-to__number-action-info__2">
            <span className="bullet gen3__start-to__bg-danger" />
            <span className="font-weight-bolder">Belum Terjawab</span>
          </div>
        </div>
        <div className="start-to__number-action-body">
          <p>
            <b>Pilih Nomor</b>
          </p>
          <div className="start-to__number-action-row">
            {questions?.map((_, index) => (
              <div
                key={index}
                className="number-container"
                onClick={() => numberClickHandler(index + 1)}
              >
                <div
                  className={classnames(
                    "gen3__start-to-number",
                    index + 1 == questionActive && "current"
                  )}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryoutSmartBTWPreview;
