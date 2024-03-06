import classNames from "classnames";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Card, CardBody, Button } from "reactstrap";
import { DEFAULT_SCHOOL_IMAGE } from "../../../../config/image";

const SchoolCard = ({ stepper, schools, selectSchool }) => {
  const handleOnSelectSchool = (school) => {
    selectSchool(school);
    stepper.next();
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
