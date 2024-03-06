import React, { useState, useRef, useEffect } from "react";
import { Edit, Trash2 } from "react-feather";
import { Badge, Button, Card, CardBody } from "reactstrap";
import { AES } from "crypto-js";

import SpinnerCenter from "../core/spinners/Spinner";
import DetailQuestionCard from "./DetailQuestionCard";
import TryoutSmartBTWPreview from "./TryoutSmartBTWPreview";
import { getQuestionById } from "../../services/exam/question";
import { getLastSegment, getBucketURL } from "../../utility/Utils";
import { confirmDelete } from "../../data/question-table";

import axios from "axios";

const DetailQuestionSection = () => {
  const [question, setQuestion] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [presignedURL, setPresignedURL] = useState(null);
  const [isShowSmartBTWPreview, setIsShowSmartBTWPreview] = useState(false);
  const [urlRedirect, setUrlRedirect] = useState("");
  const isCanceled = useRef(false);

  const hostURL =
    window.APP_ENV == "dev"
      ? "https://app-edutech.btwazure.com"
      : "https://app.btwedutech.com";

  const toggleSmartBTWPreview = () => {
    const questionId = question.id.toString();
    const questionCode = `CODE-${questionId}`;
    const cipherKey = "d17e5fb4-352f-4263-a4c7-e271efd3b454";
    const cipherText = AES.encrypt(questionCode, cipherKey).toString();
    const encryptedText = cipherText
      .split("/")
      .join("---")
      .split("+")
      .join("@@");
    const program = question?.program ?? "";
    const redirectURL = `${hostURL}/preview/soal/${program}/${encryptedText}`;
    setUrlRedirect(redirectURL);
    setIsShowSmartBTWPreview((current) => !current);
  };

  const fetchQuestion = async () => {
    try {
      const id = getLastSegment();
      const data = await getQuestionById(id);
      if (!isCanceled.current) {
        setQuestion(data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
    }
  };

  const fetchMediaPresignedURL = async (path) => {
    try {
      const response = await axios.post("/file-manager/file", {
        bucket: "video",
        pathname: path,
      });
      const data = await response.data;
      setPresignedURL(data.url);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (!question) return;
    if (question?.explanation_media)
      fetchMediaPresignedURL(question.explanation_media);
  }, [question]);

  return (
    <Card>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <>
          <div className="px-2 pt-2">
            <Badge color="primary" className="mr-50 text-capitalize" pill>
              #{question.id}
            </Badge>
            {question.tags.map((label) => (
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
          {isShowSmartBTWPreview ? (
            // <TryoutSmartBTWPreview className="mt-1" questions={[question]} />
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
            // <TryoutSmartBTWPreview className="mt-1" questions={[question]} />
            <DetailQuestionCard question={question} mediaURL={presignedURL} />
          )}
          <CardBody>
            <div className="d-flex align-items-center">
              <Button
                tag="a"
                href={`/ujian/bank-soal/edit/${question.id}`}
                size="md"
                color="primary"
                className="mr-50"
              >
                <Edit size={14} className="mr-25" /> Ubah
              </Button>

              <Button
                size="md"
                color="info"
                outline
                className="d-flex align-items-center mr-50"
                onClick={toggleSmartBTWPreview}
              >
                <img
                  src="https://btw-cdn.com/assets/btw-edutech/logo/btw-edutech-logo.svg"
                  alt="BTW Edutech Icon"
                  width={20}
                  className="mr-50"
                />{" "}
                {isShowSmartBTWPreview
                  ? "Tutup Tampilan BTW Edutech"
                  : "Lihat Tampilan BTW Edutech"}
              </Button>
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );
};

export default DetailQuestionSection;
