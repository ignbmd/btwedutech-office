import React, { createContext, useRef } from "react";

export const AddBranchContext = createContext({
  updateErrorMemberDetailForm: () => {},
  setFocusErrorMemberDetailForm: () => {},
});

const AddBranchContextProvider = (props) => {
  const updateErrorMemberDetailForm = useRef(() => {});
  const setFocusErrorMemberDetailForm = useRef(() => {});

  return (
    <AddBranchContext.Provider
      value={{ updateErrorMemberDetailForm, setFocusErrorMemberDetailForm }}
    >
      {props.children}
    </AddBranchContext.Provider>
  );
};

export default AddBranchContextProvider;
