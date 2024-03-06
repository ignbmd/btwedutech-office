import React, { createContext, useState } from "react";

export const SamaptaContext = createContext({});

const SamaptaProvider = ({ children }) => {
  const [showModalGlobalScoreForm, setShowModalGlobalScoreForm] =
    useState(false);
  const [showModalCreateSessionForm, setShowModalCreateSessionForm] =
    useState(false);

  const [showModalEditSessionForm, setShowModalEditSessionForm] =
    useState(false);

  return (
    <SamaptaContext.Provider
      value={{
        showModalGlobalScoreForm,
        setShowModalGlobalScoreForm,

        showModalCreateSessionForm,
        setShowModalCreateSessionForm,

        showModalEditSessionForm,
        setShowModalEditSessionForm,
      }}
    >
      {children}
    </SamaptaContext.Provider>
  );
};

export default SamaptaProvider;
