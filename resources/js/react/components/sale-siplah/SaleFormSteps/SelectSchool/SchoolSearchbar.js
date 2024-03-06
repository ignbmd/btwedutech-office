import { Search } from "react-feather";
import { Controller } from "react-hook-form";
import {
  Col,
  Form,
  Input,
  Row,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";

const SchoolSearchbar = ({ control, searchSchool }) => {
  return (
    <div id="ecommerce-searchbar" className="ecommerce-searchbar">
      <Row className="mt-1">
        <Col sm="12">
          <Form onSubmit={searchSchool}>
            <InputGroup className="input-group-merge">
              <Controller
                name="search_school"
                defaultValue=""
                control={control}
                render={({ field }) => {
                  const { ref, ...rest } = field;
                  return (
                    <Input
                      {...rest}
                      id="search_school"
                      innerRef={ref}
                      className="search-product"
                      placeholder="Cari Sekolah"
                      invalid={false}
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
export default SchoolSearchbar;
