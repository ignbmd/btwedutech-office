import { LazyLoadImage } from "react-lazy-load-image-component";
import { Card, CardBody, Button } from "reactstrap";
import { DEFAULT_SCHOOL_IMAGE } from "../../../../config/image";
import { useState } from "react";
import classNames from "classnames";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const SchoolCard = ({ stepper, schools, selectSchool }) => {
  const [isFetchingSchoolAffiliate, setIsFetchingSchoolAffiliate] =
    useState(false);

  const fetchSchoolAffiliate = async (school_id) => {
    try {
      setIsFetchingSchoolAffiliate(true);
      const response = await axios.get(`/api/affiliates/schools/${school_id}`);
      const data = (await response?.data?.data) ?? null;
      return data;
    } catch (error) {
      return null;
    } finally {
      setIsFetchingSchoolAffiliate(false);
    }
  };

  const handleOnSelectSchool = (school) => {
    (async () => {
      const schoolAffiliate = await fetchSchoolAffiliate(school.id);
      const schoolWithAffiliateCode = {
        ...school,
        affiliate_code: schoolAffiliate?.ref_code ?? null,
      };
      if (!schoolWithAffiliateCode.affiliate_code) {
        const swalState = await MySwal.fire({
          title: "Sekolah ini belum memiliki akun mitra",
          text: "Apakah anda yakin ingin melanjutkan ke tahap berikutnya?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Lanjutkan",
          cancelButtonText: "Batalkan",
          customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-outline-secondary ml-1",
          },
          buttonsStyling: false,
        });
        if (swalState.isDismissed) return;
      }
      selectSchool(schoolWithAffiliateCode);
      stepper.next();
    })();
  };
  const renderContent = () => {
    if (schools.length) {
      return schools.map((school) => {
        return (
          <Card className="ecommerce-card product-card" key={school.id}>
            <div className="item-img text-center mx-auto product-card__img-container">
              <LazyLoadImage
                className="img-fluid"
                alt={school?.name}
                src={school?.logo ?? DEFAULT_SCHOOL_IMAGE}
              />
            </div>
            <CardBody>
              <h6 className="item-name">
                <a href="#" className="text-body" title="SMAN 3 Denpasar">
                  <b>{school?.name}</b>
                </a>
              </h6>
              <div className="item-description">
                <p>{school?.address}</p>
              </div>
            </CardBody>
            <div className="item-options text-center">
              <Button
                color="primary"
                tag="button"
                className="btn-cart move-cart mt-0"
                onClick={() => handleOnSelectSchool(school)}
                disabled={isFetchingSchoolAffiliate}
              >
                <span>Pilih</span>
              </Button>
            </div>
          </Card>
        );
      });
    }
  };

  return <div className={classNames("list-view")}>{renderContent()}</div>;
};
export default SchoolCard;
