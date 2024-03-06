// ** Third Party Components
import { Row, Col } from "reactstrap";

const ProductsHeader = ({ productTotal, isFetchingProducts }) => {
  return (
    <div className="ecommerce-header">
      <Row>
        <Col sm="12">
          <div className="ecommerce-header-items align-items-center">
            <span className="search-results">
              {isFetchingProducts ? "" : <>{productTotal} Results Found</>}
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductsHeader;
