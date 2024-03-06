import React, { createContext, useState } from "react";

export const ParticipantContext = createContext({});

const ParticipantProvider = ({ children }) => {
  const [showPopupUpdate, setShowPopupUpdate] = useState(false);
  const [showPopupEdit, setShowPopupEdit] = useState(false);

  return (
    <ParticipantContext.Provider
      value={{
        showPopupUpdate,
        setShowPopupUpdate,

        showPopupEdit,
        setShowPopupEdit,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export default ParticipantProvider;
