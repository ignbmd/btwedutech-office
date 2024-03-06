import { useCallback, useEffect, useRef, useState } from "react";

export const useFileUpload = (initialState = {}) => {
  const [files, setFiles] = useState(initialState);
  const [errors, setErrors] = useState(initialState);
  const [inputRequireds, setInputRequireds] = useState([]);
  const defaultState = useRef(initialState);
  const currentFiles = useRef(files);
  const currentErrors = useRef(errors);
  const multipleFileButAnyErrorExist = useRef(false);

  useEffect(() => {
    currentErrors.current = errors;
  }, [errors]);

  useEffect(() => {
    currentFiles.current = files;
  }, [files]);

  const checkIsFileValid = () => {
    let isValid = true;

    // ** Check Input Required
    inputRequireds.map((inputName) => {
      if (isValid) {
        isValid =
          files[inputName]?.length === 0 || !files[inputName] ? false : true;
        if (!isValid) {
          focusToFirstErrorInput(inputName);
        }
      }

      if (files[inputName]?.length === 0) {
        setErrors((currentError) => ({
          ...currentError,
          [inputName]: ["Wajib diisi"],
        }));
      }
    });

    // ** Check other error exist
    if (isValid) {
      Object.keys(errors).map((key) => {
        if (errors[key].length > 0) {
          isValid = false;
          focusToFirstErrorInput(key);
        }
      });
    }

    return isValid;
  };

  const focusToFirstErrorInput = (name) => {
    const inputElement = document.querySelector(`input[name="${name}"]`);
    if (inputElement) {
      inputElement.focus();
    }
  };

  useEffect(() => {
    defaultState.current = initialState;
    setFiles(initialState);
  }, [initialState]);

  const onInit = (name, isRequired) => {
    setErrors((current) => {
      return {
        ...current,
        [name]: [],
      };
    });

    if (isRequired) {
      setInputRequireds((current) => [...current, name]);
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

  const clearError = (name) => {
    setErrors((currentErrors) => {
      if (currentErrors[name].length > 0) {
        return {
          ...currentErrors,
          [name]: [],
        };
      }

      return currentErrors;
    });
  };

  const handleError = (name, error) => {
    setErrors((currentError) => {
      const updatedErrors = { ...currentError, [name]: [error.sub] };
      return updatedErrors;
    });
    multipleFileButAnyErrorExist.current = true;
  };

  const handleBeforeAddFile = (file) => {
    if (multipleFileButAnyErrorExist.current) {
      return false;
    }

    return true;
  };

  const handleRemoveFile = (name, file, maxFileSize = null) => {
    const removedFileSize = file.fileSize / 1024 / 1024;
    let isRemovedFileExceededSize = false;
    if (maxFileSize != null && removedFileSize > +maxFileSize) {
      isRemovedFileExceededSize = true;
      clearError(name);
    }

    let exceededFileSizeLength = 0;
    currentFiles.current[name].map((file) => {
      const fileSize = file.size / 1024 / 1024;
      if (maxFileSize != null && fileSize > +maxFileSize) {
        exceededFileSizeLength++;
        setErrors((currentError) => ({
          ...currentError,
          [name]: ["Harap mengganti file yang melebihi batas maksimum"],
        }));
      } else if (isRemovedFileExceededSize && exceededFileSizeLength === 1) {
        clearError(name);
      }
    });
  };

  const handleSelectedFile = ({ uploadedFiles, name }) => {
    const currentFileLength = uploadedFiles?.length;

    setFiles((current) => {
      multipleFileButAnyErrorExist.current =
        currentFileLength > 1 && currentErrors.current[name]?.length > 0;
      return {
        ...current,
        [name]:
          uploadedFiles.length > 0
            ? uploadedFiles.map((file) => file.file)
            : defaultState.current[name] || [],
      };
    });

    if (multipleFileButAnyErrorExist.current) {
      setErrors((currentError) => ({
        ...currentError,
        [name]: ["Harap mengganti file yang melebihi batas maksimum"],
      }));
      return;
    }

    const isAnyErrorAndFirstFile =
      currentErrors.current[name]?.length > 0 &&
      currentFiles.current[name]?.length === 1;

    if (currentFileLength === 0 || isAnyErrorAndFirstFile) {
      clearError(name);
    }
  };

  return {
    files,
    fileErrors: errors,

    setFiles,
    setErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleRemoveFile,
    setInputRequireds,
    handleSelectedFile,
    handleBeforeAddFile,
  };
};
