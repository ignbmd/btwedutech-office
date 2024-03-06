import { useCallback, useEffect, useState } from "react";
import { isObjEmpty } from "../utility/Utils";

export const useFileUploadNew = (initialState = {}) => {
  const [files, setFiles] = useState(initialState);
  const [errors, setErrors] = useState(initialState);
  const [inputRequireds, setInputRequireds] = useState([]);

  const focusToFirstErrorInput = (name, index) => {
    const inputElement = document.querySelector(
      `input[name="${name}-${index}"]`
    );
    if (inputElement) {
      inputElement.focus();
    }
  };

  const checkIsFormValid = () => {
    let isValid = isObjEmpty(errors);

    inputRequireds.map((key) => {
      if (errors[key] || files[key].findIndex((file) => file === null) !== -1) {
        files[key].map((file, fileIndex) => {
          let updatedError = [];
          if (errors[key]) {
            updatedError = [...errors[key]];
          }
          if (!file) {
            updatedError[fileIndex] = "Field required";
          } else {
            updatedError[fileIndex] = null;
          }

          setErrors((current) => {
            let currentErrors = { ...current };
            if (
              Object.values(updatedError).filter(
                (value) => value != undefined || value != null
              ).length === 0
            ) {
              delete currentErrors[key];
            } else {
              currentErrors[key] = updatedError;
            }

            isValid = isObjEmpty(currentErrors);
            return currentErrors;
          });

          if (!isValid) {
            focusToFirstErrorInput(key, fileIndex);
          }
        });
      }
    });

    return isValid;
  };

  /**
   * Add new default value by key when function has called
   **/
  const setDefaultValue = ({ currentValue, name, index }) => {
    let updatedValues = [];
    // const updatedValues = current[key] ? [...current[key], null] : [null];
    if (currentValue[name]) {
      updatedValues = [...currentValue[name], null];
    } else {
      updatedValues[name] = [];
      updatedValues[name][index] = null;
    }
    return {
      ...currentValue,
      [name]: updatedValues,
    };
  };

  const onInit = (name, isRequired) => {
    const arrayNameIndex = name.match(/\d+/g)?.[0];
    let key = name;
    if (arrayNameIndex) {
      key = name.split("[")[0];
      setFiles((current) =>
        setDefaultValue({
          currentValue: current,
          name: key,
          index: arrayNameIndex,
        })
      );
      setErrors((current) =>
        setDefaultValue({
          currentValue: current,
          name: key,
          index: arrayNameIndex,
        })
      );

      if (isRequired) {
        setInputRequireds((current) => [...current, key]);
      }
    }
  };

  const registerFile = useCallback(
    (name, isRequired) => {
      return {
        oninit: () => onInit(name, isRequired),
        required: isRequired,
      };
    },
    [files]
  );

  const handleSelectedFile = ({ uploadedFiles, name, index }) => {
    const updatedFiles = { ...files };
    updatedFiles[name][index] =
      uploadedFiles.length > 0 ? uploadedFiles.map((file) => file.file) : null;
    setFiles(updatedFiles);

    if (uploadedFiles.length > 0) {
      setErrors((currentErrors) => {
        const updatedErrors = { ...currentErrors };
        if (updatedErrors[name].length > 0) {
          updatedErrors[name][index] = null;
          return updatedErrors
        }

        return currentErrors;
      });
    }
  };

  return {
    files,
    fileErrors: errors,

    setFiles,
    setErrors,
    registerFile,
    checkIsFormValid,
    handleSelectedFile,
  };
};
