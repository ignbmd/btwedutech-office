import axios from "axios";
import classnames from "classnames";
import { useContext, useRef, useState } from "react";
import { Badge, Button, CardText, Col, Row } from "reactstrap";
import { ArrowLeft, Home, Map, MapPin, Save, Star } from "react-feather";

import Avatar from "../../../core/avatar/index.js";
import AppCollapse from "../../../core/app-collapse";
import { AddBranchContext } from "../../../../context/AddBranchContext.js";
import { showToast } from "../../../../utility/Utils.js";
import { formatMultipleBranchCodeInput } from "../../../../utility/branch.js";

const Summary = ({ stepper, formData }) => {
  const isCanceled = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateErrorMemberDetailForm, setFocusErrorMemberDetailForm } =
    useContext(AddBranchContext);

  const submitHandler = async () => {
    setIsSubmitting(true);
    const usersPayload = formData.ids.map((id) => {
      return {
        name: formData[`name-${id}`],
        email: formData[`email-${id}`],
        phone: formData[`phone_number-${id}`],
        nik: formData[`nik-${id}`],
        gender: formData[`gender-${id}`],
        address: formData[`address-${id}`],
        roles: [formData[`role-${id}`]],
        branch_code: formatMultipleBranchCodeInput(
          formData[`branch_code-${id}`]
        ),
      };
    });
    const fd = new FormData();
    formData.ids.map((id, index) => {
      fd.append(`profile_image-${index}`, formData[`profile-${id}`][0]);
      fd.append(`npwp_image-${index}`, formData[`ktp-${id}`][0]);
      fd.append(`ktp_image-${index}`, formData[`npwp-${id}`][0]);
    });
    fd.append("users", JSON.stringify(usersPayload));

    try {
      const response = await axios.post("/api/sso/create-users", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;

      if (!isCanceled.current) {
        window.location.href = "/cabang";
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsSubmitting(false);

        let isFirstErrorFocused = false;
        const errObj = error.response.data.data?.errors;
        const errMessage = error.response.data?.messages;
        if (errObj) {
          const arrKeyErrors = Object.keys(errObj);
          arrKeyErrors.map((key) => {
            const errorIndex = key.split(".").shift();
            const name = key.split(".").pop();

            const formErrorId = formData.ids[+errorIndex];
            const errMessage =
              name == "email" ? "Email sudah digunakan" : errObj[key];
            updateErrorMemberDetailForm.current(`${name}-${formErrorId}`, {
              message: errMessage,
            });

            if (!isFirstErrorFocused) {
              // setFocusErrorMemberDetailForm.current(`${name}-${formErrorId}`);
              isFirstErrorFocused = true;
            }
          });
        } else if (errMessage) {
          showToast({
            type: "error",
            title: "Terjadi Kesalahan",
            message: errMessage,
          });
        }

        if (isFirstErrorFocused) {
          showToast({
            type: "error",
            title: "Email sudah digunakan",
            message: "Harap mengganti email yang sudah digunakan",
          });
          stepper.previous();
        }
      }
    }
  };

  const renderDetailContent = (detailPayload) => {
    return (
      <Row className="px-2">
        <Col md={6}>
          <div>
            <CardText className="mb-0 font-weight-bold">Email</CardText>
            <CardText className="mb-0">{detailPayload.email}</CardText>
          </div>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">Foto Profil</CardText>
            {detailPayload.profileImg ? (
              <img
                src={URL.createObjectURL(detailPayload.profileImg)}
                alt="Profile"
                width="150"
                height="150"
                className="mt-50"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <Badge color="light-secondary">Tidak ada foto</Badge>
            )}
          </div>
          <div className="mt-75">
            <CardText className="mb-0 font-weight-bold">No.HP</CardText>
            <CardText className="mb-0">{detailPayload.phoneNumber}</CardText>
          </div>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">Jenis Kelamin</CardText>
            <CardText className="mb-0">
              {detailPayload.gender == 1 ? "Laki-laki" : "Perempuan"}
            </CardText>
          </div>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">NIK</CardText>
            <CardText className="mb-0">{detailPayload.nik}</CardText>
          </div>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">Alamat</CardText>
            <CardText className="mb-0">{detailPayload.address}</CardText>
          </div>
        </Col>
        <Col md={6}>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">Foto KTP</CardText>
            <img
              src={URL.createObjectURL(detailPayload.ktpImg)}
              alt="KTP"
              width="300"
              height="200"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="mt-50">
            <CardText className="mb-0 font-weight-bold">Foto NPWP</CardText>
            {detailPayload.npwpImg ? (
              <img
                src={URL.createObjectURL(detailPayload.npwpImg)}
                alt="KTP"
                width="300"
                height="200"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <Badge color="light-secondary">Tidak ada NPWP</Badge>
            )}
          </div>
        </Col>
      </Row>
    );
  };

  const renderInitialName = (name) => {
    return name.split(" ").slice(0, 2).join(" ");
  };

  const data = formData.ids
    ? formData.ids.map((id) => {
        const role = formData[`role-${id}`];
        const roleText = role.split("_").join(" ");

        return {
          title: (
            <>
              <Avatar
                initials
                color="light-success"
                className="mr-50"
                content={renderInitialName(formData[`name-${id}`])}
                contentStyles={{
                  borderRadius: 0,
                  fontSize: "calc(12px)",
                  width: "100%",
                  height: "100%",
                }}
                style={{
                  height: "30px",
                  width: "30px",
                }}
              />{" "}
              <span className="mr-50">{formData[`name-${id}`]}</span>{" "}
              <Badge
                color={role === "kepala_cabang" ? "primary" : "secondary"}
                pill
              >
                <span className="capitalize">{roleText}</span>
              </Badge>
            </>
          ),
          content: renderDetailContent({
            email: formData[`email-${id}`],
            profileImg: formData[`profile-${id}`][0],
            phoneNumber: formData[`phone_number-${id}`],
            gender: formData[`gender-${id}`],
            nik: formData[`nik-${id}`],
            address: formData[`address-${id}`],
            ktpImg: formData[`ktp-${id}`][0],
            npwpImg: formData[`npwp-${id}`][0],
          }),
        };
      })
    : [];

  return (
    <div className={classnames(isSubmitting ? "block-content" : "")}>
      <div className="content-header">
        <h5 className="mb-0">Tinjauan</h5>
        <small>Tinjau ulang data yang akan disimpan</small>
      </div>
      <div className="user-avatar-section">
        <div className="d-flex justify-content-start">
          <Avatar
            color="light-success"
            className="rounded"
            icon={<Home size={30} />}
            contentStyles={{
              borderRadius: 0,
              fontSize: "calc(36px)",
              width: "100%",
              height: "100%",
            }}
            style={{
              height: "90px",
              width: "90px",
            }}
          />
          <div className="d-flex flex-column ml-1">
            <div className="user-info mb-1">
              <h4 className="mb-0 mt-50">{formData.name}</h4>
              <p className="mb-0 mt-25">
                <MapPin size={12} /> {formData.address}
              </p>
              <p>
                <Map size={12} />
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps?q=${formData.geolocation?.lat},${formData.geolocation?.lng}`}
                >
                  {formData.geolocation?.lat}, {formData.geolocation?.lng}
                </a>
              </p>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <h5 className="mb-1">Detail Pengguna</h5>
          <AppCollapse data={data} type="border" accordion />
        </div>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <Button
          color="primary"
          className="btn-prev"
          onClick={() => stepper.previous()}
        >
          <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
          <span className="align-middle d-sm-inline-block d-none">
            Previous
          </span>
        </Button>
        <Button
          type="submit"
          color="success"
          className="btn-next"
          onClick={submitHandler}
        >
          {isSubmitting && (
            <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
          )}
          <span className="align-middle d-sm-inline-block d-none">
            {isSubmitting ? "Menyimpan data..." : "Simpan"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Summary;
