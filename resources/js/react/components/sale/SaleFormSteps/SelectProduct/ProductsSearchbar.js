import { Search } from "react-feather";
import { Controller } from "react-hook-form";
import {
  Form,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  Input,
  InputGroupText,
} from "reactstrap";

const ProductsSearchbar = ({ control, searchProduct }) => {
  return (
    <div id="ecommerce-searchbar" className="ecommerce-searchbar">
      <Row className="mt-1">
        <Col sm="12">
          <Form onSubmit={searchProduct}>
            <InputGroup className="input-group-merge">
              <Controller
                name="search_product"
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <Input
                      {...rest}
                      id="name"
                      innerRef={ref}
                      className="search-product"
                      placeholder="Search Product"
                      invalid={error && true}
                      disabled={false}
                    />
                  );
                }}
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <Search className="text-muted" size={14} />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ProductsSearchbar;
