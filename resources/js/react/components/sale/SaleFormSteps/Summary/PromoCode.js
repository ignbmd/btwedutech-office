import React from "react";
import classnames from "classnames";
import { X } from "react-feather";
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Card,
  CardBody,
  FormFeedback,
} from "reactstrap";
import { BASE_IMG_URL } from "../../../../config/icons";
import { Controller } from "react-hook-form";

const PromoCode = ({
  promo,
  control,
  resetPromo,
  checkPromoCode,
  isCheckingPromo,
}) => {
  return (
    <>
      {promo?.is_valid ? (
        <Card>
          <CardBody className="p-1 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div>
                <img
                  src={`${BASE_IMG_URL}/icons/coupon.svg`}
                  alt=""
                  width={30}
                />
              </div>
              <div className="ml-1">
                <p className="mb-0">
                  <b>{promo.promo_code.code}</b>
                </p>
              </div>
            </div>
            <X size={18} onClick={resetPromo} />
          </CardBody>
        </Card>
      ) : (
        // <Form onSubmit={checkPromoCode}>
        <Controller
          name="promo_code"
          defaultValue=""
          control={control}
          render={({ field, fieldState: { error } }) => {
            const { ref, ...rest } = field;
            return (
              <FormGroup>
                <Label className="form-label" for="promo_code">
                  Kode Promo
                </Label>
                <InputGroup>
                  <Input
                    {...rest}
                    id="promo_code"
                    placeholder="Masukkan Kode Promo"
                    innerRef={ref}
                    invalid={error && true}
                    disabled={isCheckingPromo}
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      type="submit"
                      color="primary"
                      outline
                      disabled={isCheckingPromo}
                      onClick={checkPromoCode}
                    >
                      Terapkan
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                <FormFeedback
                  className={classnames({
                    "d-block": error?.message,
                  })}
                >
                  {error?.message}
                </FormFeedback>
              </FormGroup>
            );
          }}
        />
        // </Form>
      )}
    </>
  );
};

export default PromoCode;
