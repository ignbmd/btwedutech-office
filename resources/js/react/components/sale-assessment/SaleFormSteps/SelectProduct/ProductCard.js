import classnames from "classnames";
import parse from "html-react-parser";
import { ShoppingCart, X } from "react-feather";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  Card,
  CardBody,
  CardText,
  Button,
  Badge,
  Input,
  Label,
} from "reactstrap";
import { priceFormatter } from "../../../../utility/Utils";
import { DEFAULT_PRODUCT_IMAGE } from "../../../../config/image";

const ProductCard = ({ products, cart, setCart }) => {
  const isProductOnCart = (product_code) => {
    return cart[product_code];
  };

  const handleChooseProduct = (product) => {
    const qtyInputElement = document.getElementById(product.product_code);
    if (!Number(qtyInputElement.value)) return;

    setCart((prev) => ({
      ...prev,
      [product.product_code]: +qtyInputElement.value,
    }));
  };

  const handleUnchooseProduct = (product) => {
    const currentProduct = { ...cart };
    delete currentProduct[product.product_code];
    setCart(currentProduct);
  };

  const handleOnQtyInputChange = (e, product) => {
    const qtyInputElement = document.getElementById(product.product_code);
    if (+e.target.value < 0 || isNaN(+e.target.value)) {
      qtyInputElement.value = 0;
    }
  };

  const handleOnQtyInputBlur = (e, product) => {
    const qtyInputElement = document.getElementById(product.product_code);
    if (!+e.target.value || isNaN(+e.target.value)) {
      qtyInputElement.value = 0;
    }
  };

  const renderProducts = () => {
    if (products.length) {
      return products.map((item) => {
        return (
          <Card className="ecommerce-card product-card" key={item._id}>
            <div className="item-img text-center mx-auto product-card__img-container">
              <LazyLoadImage
                className="img-fluid"
                alt={item.title}
                src={item?.image?.[0] ?? DEFAULT_PRODUCT_IMAGE}
              />
            </div>
            <CardBody>
              <div className="item-wrapper">
                <div className="item-cost">
                  <h6 className="item-price">
                    {priceFormatter(+item.sell_price)}
                  </h6>
                </div>
              </div>
              <h6 className="item-name">
                <a href="#" className="text-body" title={item.title}>
                  <b>{item.title}</b>
                </a>
                <CardText tag="span" className="item-company">
                  <Badge color="light-primary mr-25">{item.program}</Badge>
                  <Badge color="light-success">{item.product_code}</Badge>
                </CardText>
              </h6>
              <div className="item-description">{parse(item.description)}</div>
            </CardBody>
            <div className="item-options text-center">
              <div className="item-wrapper item-grid">
                <div className="item-quantity form-group mr-25">
                  <Label className="form-label">Jumlah</Label>
                  <Input
                    type="text"
                    id={item.product_code}
                    defaultValue={cart[item.product_code] ?? 0}
                    disabled={isProductOnCart(item.product_code)}
                    onChange={(e) => handleOnQtyInputChange(e, item)}
                    onBlur={(e) => handleOnQtyInputBlur(e, item)}
                  ></Input>
                </div>
                <div className="item-cost form-group ml-25">
                  <Label className="form-label mb-75">Harga</Label>
                  <h4 className="item-price">
                    {priceFormatter(+item.sell_price)}
                  </h4>
                </div>
              </div>
              {isProductOnCart(item.product_code) ? (
                <Button
                  color="danger"
                  tag="button"
                  className="btn-cart move-cart"
                  onClick={() => handleUnchooseProduct(item)}
                >
                  <X className="mr-50" size={14} />
                  <span>Batal</span>
                </Button>
              ) : (
                <Button
                  color="primary"
                  tag="button"
                  className="btn-cart move-cart"
                  onClick={() => handleChooseProduct(item)}
                >
                  <ShoppingCart className="mr-50" size={14} />
                  <span>Pilih</span>
                </Button>
              )}
            </div>
          </Card>
        );
      });
    }
  };

  return <div className={classnames("list-view")}>{renderProducts()}</div>;
};

export default ProductCard;
