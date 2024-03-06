import React, { useRef, useState, useEffect } from "react";
import parser from "html-react-parser";
import { Edit, Maximize } from "react-feather";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import ClusterTableTryoutFreeSection from "./ClusterTableTryoutFreeSection";
import SpinnerCenter from "../../core/spinners/Spinner";
import { getLastSegment } from "../../../utility/Utils";
import axios from "../../../utility/http";
import moment from "moment-timezone";

const DetailTryoutFreeSection = () => {
  const [tryoutFree, setTryoutFree] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [instructionModalShowed, setInstructionModalShowed] = useState(false);
  const isCanceled = useRef(false);

  const toggleModal = () => {
    setInstructionModalShowed((current) => !current);
  };

  const getTryoutFreeById = async (id, config) => {
    try {
      const response = await axios.get(
        `/exam/tryout-free/detail/${id}`,
        config
      );
      const data = await response.data;
      const tryoutFree = data?.data ?? [];
      return tryoutFree;
    } catch (error) {
      throw error;
    }
  };

  const fetchTryoutFree = async () => {
    try {
      const id = getLastSegment();
      const data = await getTryoutFreeById(id);
      if (!isCanceled.current) {
        setTryoutFree(data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchTryoutFree();
  }, []);

  const tryoutFreeId = getLastSegment();
  return (
    <Card>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <>
          <CardHeader>
            <CardTitle>{tryoutFree.title}</CardTitle>
          </CardHeader>
          <CardBody>
            <Col md={6}>
              <div className="row mt-50">
                <span className="col-6">Pendaftaran Dibuka</span>
                <span className="col-1">:</span>
                <span className="col-5 font-weight-bolder">
                  {moment(tryoutFree.start_date)
                    .utcOffset("+0700")
                    .format("DD MMM YYYY")}
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Pendaftaran Ditutup</span>
                <span className="col-1">:</span>
                <span className="col-5 font-weight-bolder">
                  {moment(tryoutFree.end_date)
                    .utcOffset("+0700")
                    .format("DD MMM YYYY")}
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Waktu Mengerjakan</span>
                <span className="col-1">:</span>
                <span className="col-5 font-weight-bolder">
                  {tryoutFree.duration} Menit
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Modul</span>
                <span className="col-1">:</span>
                <span className="col-5 font-weight-bolder">
                  {tryoutFree.modules.module_code}
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Status</span>
                <span className="col-1">:</span>
                <span className="col-5">
                  {tryoutFree.status === true ? (
                    <Badge color="success">Aktif</Badge>
                  ) : (
                    <Badge color="danger">Tidak Aktif</Badge>
                  )}
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Kode Cabang</span>
                <span className="col-1">:</span>
                <span className="col-5">
                  <Badge color="primary">{tryoutFree.branch_code}</Badge>
                </span>
              </div>
              <div className="row mt-50">
                <span className="col-6">Instruksi Soal</span>
                <span className="col-1">:</span>
                <span className="col-5">
                  <Button size="sm" color="secondary" onClick={toggleModal}>
                    <Maximize size={14} className="mr-25" /> Lihat Instruksi
                  </Button>
                </span>
              </div>

              <div className="mt-2">
                <a
                  href={`/ujian/tryout-gratis/edit/${tryoutFreeId}`}
                  className="btn btn-primary"
                >
                  <Edit size={14} className="mr-25" /> Ubah Tryout Gratis
                </a>
              </div>
            </Col>
          </CardBody>

          <Card>
            <CardHeader>
              <CardTitle>Sesi Tryout</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mx-n2">
                <ClusterTableTryoutFreeSection
                  tryout_clusters={tryoutFree.tryout_clusters}
                  isLoading={isLoading}
                />
              </div>
            </CardBody>
          </Card>

          <Modal
            scrollable
            modalClassName="dark"
            toggle={toggleModal}
            isOpen={instructionModalShowed}
          >
            <ModalHeader toggle={toggleModal}>Instruksi Soal</ModalHeader>
            <ModalBody>{parser(tryoutFree.instructions.instruction)}</ModalBody>
            <ModalFooter>
              <Button color="dark" onClick={toggleModal}>
                Tutup
              </Button>
            </ModalFooter>
          </Modal>
        </>
      )}
    </Card>
  );
};

export default DetailTryoutFreeSection;
