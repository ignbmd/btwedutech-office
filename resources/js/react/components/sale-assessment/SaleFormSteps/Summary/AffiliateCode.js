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

const AffiliateCode = ({
  control,
  data,
  isCheckingAffiliateCode,
  resetAffiliateCode,
  checkAffiliateCode,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
  return (
    <>
      {data?.is_valid ? (
        <FormGroup>
          <Label>Kode Mitra</Label>
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
                    <b>{data.affiliate_code}</b>
                  </p>
                </div>
              </div>
              <X size={18} onClick={resetAffiliateCode} />
            </CardBody>
          </Card>
        </FormGroup>
      ) : (
        // <Form onSubmit={checkPromoCode}>
        <Controller
          name="affiliate_code"
          defaultValue=""
          control={control}
          render={({ field, fieldState: { error } }) => {
            const { ref, ...rest } = field;
            return (
              <FormGroup>
                <Label className="form-label" for="affiliate_code">
                  Kode Mitra
                </Label>
                <InputGroup>
                  <Input
                    {...rest}
                    id="affiliate_code"
                    placeholder="Masukkan Kode Mitra"
                    innerRef={ref}
                    invalid={Boolean(error?.message)}
                    disabled={isCheckingAffiliateCode}
                    onKeyDown={handleKeyDown}
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      type="submit"
                      color="primary"
                      outline
                      disabled={isCheckingAffiliateCode}
                      onClick={checkAffiliateCode}
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

export default AffiliateCode;
