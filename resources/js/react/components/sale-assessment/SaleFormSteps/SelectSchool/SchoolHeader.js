import { Row, Col } from "reactstrap";

const SchoolsHeader = ({ schoolTotal, isFetchingSchool }) => {
  return (
    <div className="ecommerce-header">
      <Row>
        <Col sm="12">
          <div className="ecommerce-header-items align-items-center">
            <span className="search-results">
              {isFetchingSchool ? "" : <>{schoolTotal} results found</>}
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default SchoolsHeader;
