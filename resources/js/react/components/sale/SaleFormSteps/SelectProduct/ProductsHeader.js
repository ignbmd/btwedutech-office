// ** Third Party Components
import classnames from "classnames";
import { Menu, Grid, List } from "react-feather";
import {
  Row,
  Col,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";
import { getUserFromBlade } from "../../../../utility/Utils";
import { Fragment } from "react";

const ProductsHeader = ({
  totalProduct,
  selectedType,
  changeType,
  isFetchingProduct,
}) => {
  const user = getUserFromBlade();
  const isCentralUser = user?.branch_code == "PT0000";
  const sortToggleText = isCentralUser
    ? {
        ONLINE_PRODUCT: "Produk Online",
        TATAP_MUKA_ONLINE_PRODUCT: "Produk Tatap Muka Online",
        COIN_CURRENCY: "Top Up Koin",
      }
    : {
        OFFLINE_PRODUCT: "Produk Offline",
        SISWA_UNGGULAN_PRODUCT: "Produk Siswa Unggulan",
      };

  return (
    <div className="ecommerce-header">
      <Row>
        <Col sm="12">
          <div className="ecommerce-header-items align-items-center">
            <span className="search-results">
              {isFetchingProduct ? "" : <>{totalProduct} Results Found</>}
            </span>

            <div className="view-options d-flex">
              <UncontrolledButtonDropdown className="dropdown-sort">
                <DropdownToggle
                  className="text-capitalize mr-1"
                  color="primary"
                  outline
                  caret
                >
                  {sortToggleText[selectedType]}
                </DropdownToggle>
                <DropdownMenu>
                  {isCentralUser ? (
                    <Fragment>
                      <DropdownItem
                        className="w-100"
                        onClick={() => changeType("ONLINE_PRODUCT")}
                      >
                        Produk Online
                      </DropdownItem>
                      {/* <DropdownItem
                    className="w-100"
                    onClick={() => changeType("OFFLINE_PRODUCT")}
                  >
                    Produk Tatap Muka Offline
                  </DropdownItem> */}
                      <DropdownItem
                        className="w-100"
                        onClick={() => changeType("TATAP_MUKA_ONLINE_PRODUCT")}
                      >
                        Produk Tatap Muka Online
                      </DropdownItem>
                      <DropdownItem
                        className="w-100"
                        onClick={() => changeType("COIN_CURRENCY")}
                      >
                        Top Up Koin
                      </DropdownItem>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <DropdownItem
                        className="w-100"
                        onClick={() => changeType("OFFLINE_PRODUCT")}
                      >
                        Produk Offline
                      </DropdownItem>
                      <DropdownItem
                        className="w-100"
                        onClick={() => changeType("SISWA_UNGGULAN_PRODUCT")}
                      >
                        Produk Siswa Unggulan
                      </DropdownItem>
                    </Fragment>
                  )}
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductsHeader;
