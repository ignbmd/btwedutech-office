import classnames from "classnames";
import parse from 'html-react-parser';
import { ShoppingCart } from "react-feather";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Card, CardBody, CardText, Button, Badge } from "reactstrap";

import { priceFormatter } from "../../../../utility/Utils";
import { DEFAULT_PRODUCT_IMAGE } from "../../../../config/image";

const ProductCards = ({ products, onSelect }) => {
  const renderProducts = () => {
    if (products.length) {
      return products.map((item) => {
        const CartBtnTag = "button";

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
                <a href="" className="text-body" title={item.title}>
                  <b>{item.title}</b>
                </a>
                <CardText tag="span" className="item-company">
                  <Badge color="light-primary mr-25">{item.program}</Badge>
                  <Badge color="light-success">{item.product_code}</Badge>
                </CardText>
              </h6>
              <div className="item-description">
                {parse(item.description)}
              </div>
            </CardBody>
            <div className="item-options text-center">
              <div className="item-wrapper">
                <div className="item-cost">
                  <h4 className="item-price">{priceFormatter(+item.sell_price)}</h4>
                </div>
              </div>
              <Button
                color="primary"
                tag={CartBtnTag}
                className="btn-cart move-cart"
                onClick={() => onSelect(item)}
              >
                <ShoppingCart className="mr-50" size={14} />
                <span>Beli</span>
              </Button>
            </div>
          </Card>
        );
      });
    }
  };

  return <div className={classnames("list-view")}>{renderProducts()}</div>;
};

export default ProductCards;
