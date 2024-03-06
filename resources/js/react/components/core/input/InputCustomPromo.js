import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller } from "react-hook-form";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  InputGroupText,
  Label,
} from "reactstrap";
import React, { useEffect, useState } from "react";

import { unformatPrice } from "../../../utility/Utils";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const InputCustomPromo = ({
  name = "",
  placeholder = "",
  defaultValue = "",
  value,
  setValue,
  control,
  typeName = "type",
  defaultTypeValue = "FIXED",
}) => {
  const [isDropdownFeeOpen, setIsDropdownFeeOpen] = useState(false);
  const [selectedCustomPromo, setSelectedCustomPromo] =
    useState(defaultTypeValue);

  const plainCustomDiscount = unformatPrice(value);

  const handleCustomDiscountTypeChange = (type) => {
    setSelectedCustomPromo(type);
    if (type === "PERCENT" && plainCustomDiscount > 100) {
      setValue(name, "0");
    }
  };

  const toggleDropdownFee = () => {
    setIsDropdownFeeOpen((current) => !current);
  };

  useEffect(() => {
    handleCustomDiscountTypeChange(defaultTypeValue);
  }, [defaultTypeValue]);

  useEffect(() => {
    if (selectedCustomPromo === "PERCENT" && plainCustomDiscount > 100) {
      setValue(name, "100");
    }
  }, [value]);

  useEffect(() => {
    setValue(typeName, selectedCustomPromo);
  }, [selectedCustomPromo]);

  return (
    <Controller
      control={control}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <FormGroup>
          <Label className="form-label">Nominal</Label>
          <InputGroup
            className={classnames({
              "is-invalid": error && true,
            })}
          >
            <InputGroupButtonDropdown
              addonType="prepend"
              isOpen={isDropdownFeeOpen}
              toggle={toggleDropdownFee}
            >
              <DropdownToggle color="primary" caret outline>
                {selectedCustomPromo === "FIXED" ? "Rupiah" : "Persentase"}
              </DropdownToggle>

              <DropdownMenu>
                <DropdownItem
                  className={classnames(
                    "w-100",
                    selectedCustomPromo === "FIXED" && "active"
                  )}
                  onClick={() => handleCustomDiscountTypeChange("FIXED")}
                >
                  Rupiah
                </DropdownItem>
                <DropdownItem
                  className={classnames(
                    "w-100",
                    selectedCustomPromo === "PERCENT" && "active"
                  )}
                  onClick={() => handleCustomDiscountTypeChange("PERCENT")}
                >
                  Persentase
                </DropdownItem>
              </DropdownMenu>
            </InputGroupButtonDropdown>
            <Cleave
              name="fee_amount"
              options={numeralOptions}
              className={classnames("form-control")}
              className={classnames("form-control", {
                "is-invalid": error && true,
              })}
              value={value}
              onChange={(e) => field.onChange(e.target.rawValue)}
            />
            {selectedCustomPromo === "PERCENT" && (
              <InputGroupAddon addonType="append">
                <InputGroupText>%</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
          <FormFeedback>{error?.message}</FormFeedback>
        </FormGroup>
      )}
    />
  );
};

export default InputCustomPromo;
