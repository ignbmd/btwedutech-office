import React, { useEffect, useState, useRef } from "react";
import { Alert, Card, Col, Button } from "reactstrap";
import { getModulesByModuleCode } from "../../../services/exam/module";
import { getQuestionByModuleCode } from "../../../services/exam/question";
import { getLastSegment } from "../../../utility/Utils";
import SpinnerCenter from "../../core/spinners/Spinner";
import TryoutSmartBTWPreview from "../TryoutSmartBTWPreview";
import DetailQuestionCard from "../DetailQuestionCard";
import { nanoid } from "nanoid";
import { AES } from "crypto-js";

const ModulePreviewSection = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isCanceled = useRef(false);
  const [isShowSmartBTWPreview, setIsShowSmartBTWPreview] = useState(false);
  const [urlRedirect, setUrlRedirect] = useState("");
  let num = 1;

  const hostURL =
    window.APP_ENV == "dev"
      ? "https://app-edutech.btwazure.com"
      : "https://app.btwedutech.com";

  const toggleSmartBTWPreview = () => {
    const module_code = getLastSegment();
    const splitModuleCode = module_code.split("-");
    const program = splitModuleCode[1];
    const cipherKey = "d17e5fb4-352f-4263-a4c7-e271efd3b454";
    const cipherText = AES.encrypt(module_code, cipherKey).toString();
    const encryptedText = cipherText
      .split("/")
      .join("---")
      .split("+")
      .join("@@");
    const redirectURL = `${hostURL}/preview/modul/${program}/${encryptedText}`;
    setUrlRedirect(redirectURL);
    setIsShowSmartBTWPreview((current) => !current);
  };
  const sortedAnswersQuestion = (questions) => {
    return questions.map((question) => {
      question.answers = question.answers.sort((a, b) => {
        return a.option > b.option ? 1 : -1;
      });
      return question;
    });
  };

  const fetchQuestion = async () => {
    try {
      const module_code = getLastSegment();
      const data = await getModulesByModuleCode(module_code);
      const questions = data.questions;

      if (!isCanceled.current) {
        const questionUpdated = sortedAnswersQuestion(questions);
        setQuestions(questionUpdated);
        setIsLoading(false);
      }
    } catch (error) {
      console.log({ error });
    }
  };
  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <Card>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <div>
          <Button
            size="md"
            color={isShowSmartBTWPreview ? "danger" : "info"}
            outline
            className="d-flex align-items-center ml-2 mt-1"
            onClick={toggleSmartBTWPreview}
          >
            <img
              src="https://btw-cdn.com/assets/btw-edutech/logo/btw-edutech-logo.svg"
              alt="Smart BTW Icon"
              width={22}
              className="mr-50"
            />{" "}
            {isShowSmartBTWPreview
              ? "Tutup Tampilan BTW Edutech"
              : "Lihat Tampilan BTW Edutech"}
          </Button>

          {isShowSmartBTWPreview ? (
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <iframe
                src={urlRedirect ?? ""}
                style={{
                  width: "100%",
                  height: "100vh",
                  border: "0px",
                }}
              ></iframe>
            </div>
          ) : (
            questions.map((question) => (
              <DetailQuestionCard
                key={nanoid()}
                question={question}
                number={num++}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default ModulePreviewSection;
