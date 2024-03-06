import React from "react";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller } from "react-hook-form";
import {
  Button,
  CardText,
  FormFeedback,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import {
  convertNumberDotWithComma,
  priceFormatter,
} from "../../../../utility/Utils";

const numeralOptions = {
  numeral: true,
  numeralDecimalMark: ",",
  delimiter: ".",
};

const CashPayment = ({
  control,
  centralFee,
  getSubTotal,
  payTemplates,
  payTemplateClicked,
  selectedProductType,
  selectedProductTags,
}) => {
  return (
    <>
      <Controller
        render={({ field, fieldState: { error } }) => (
          <FormGroup>
            <label htmlFor="cash-amount">Jumlah Bayar</label>
            {selectedProductType !== "ONLINE_PRODUCT" ||
            selectedProductTags.includes("TATAP_MUKA_ONLINE") ? (
              <div className="d-flex align-items-center justify-content-between">
                {payTemplates.map((templateValue, index) => (
                  <Button
                    key={index}
                    outline
                    type="button"
                    color="primary"
                    className="flex-grow-1 mr-75"
                    onClick={() => payTemplateClicked(templateValue)}
                  >
                    {priceFormatter(templateValue)}
                  </Button>
                ))}
                <Button
                  type="button"
                  outline
                  color="primary"
                  className="flex-grow-1"
                  onClick={() =>
                    payTemplateClicked(convertNumberDotWithComma(getSubTotal()))
                  }
                >
                  LUNAS
                </Button>
              </div>
            ) : null}

            <InputGroup
              className={classnames("mt-75", {
                "is-invalid": error && true,
              })}
            >
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Rp</InputGroupText>
              </InputGroupAddon>
              <Cleave
                {...field}
                options={numeralOptions}
                className={classnames("form-control", {
                  "is-invalid": error && true,
                })}
                ref={(ref) => ref}
                max="100"
                maxLength="100"
                placeholder={
                  centralFee === -1
                    ? "Please wait..."
                    : "Inputkan nominal pembayaran atau pilih template nominal diatas"
                }
                disabled={
                  !selectedProductTags?.includes("TATAP_MUKA_ONLINE") &&
                  (selectedProductType === "ONLINE_PRODUCT" ||
                    centralFee === -1)
                  // centralFee === -1
                }
              />
            </InputGroup>
            <FormFeedback>{error?.message}</FormFeedback>
          </FormGroup>
        )}
        id="cash-amount"
        name="cash_amount"
        control={control}
        placeholder="10.000"
        defaultValue=""
      />
    </>
  );
};

export default CashPayment;
