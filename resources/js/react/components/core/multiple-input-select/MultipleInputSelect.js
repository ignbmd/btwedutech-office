import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { selectThemeColors } from "../../../utility/Utils";

const MultipleInputSelect = ({
  setValue,
  valueName,
  fieldName,
  currentValue,
  changeHandler,
  defaultValue = [],
}) => {
  const [createdValues, setCreatedValues] = useState([]);
  const [createdOptionValues, setCreatedOptionValues] = useState([]);

  const createOption = (label) => ({
    label,
    value: label,
  });

  const handleChange = (value) => {
    setCreatedValues(value.map(item => item.value));
    setCreatedOptionValues(value);
  };

  const handleKeyDown = (name, event) => {
    const value = event.target.value;
    if (!value) return;
    switch (event.key) {
      case ",":
        setValue(name, "");
        setCreatedOptionValues([...createdOptionValues, createOption(value)]);
        setCreatedValues((current) => [...current, value]);
        event.preventDefault();
    }
  };

  useEffect(() => {
    setValue(valueName, createdValues);
  }, [createdValues]);

  useEffect(() => {
    setValue(fieldName, "");
    setCreatedOptionValues(
      defaultValue ? defaultValue.map((value) => createOption(value)) : []
    );
    setCreatedValues((current) => [...current, ...defaultValue]);
  }, []);

  return (
    <CreatableSelect
      isMulti
      isClearable
      components={{
        DropdownIndicator: null,
      }}
      styles={{
        control: (provided) => ({
          ...provided,
          borderColor: "#d8d6de",
          cursor: "text",
        }),
      }}
      menuIsOpen={false}
      inputValue={currentValue}
      value={createdOptionValues}
      onChange={handleChange}
      onInputChange={changeHandler}
      onKeyDown={(event) => handleKeyDown(fieldName, event)}
      classNamePrefix="select"
      className="react-select"
      theme={selectThemeColors}
      placeholder=""
    />
  );
};

export default MultipleInputSelect;
