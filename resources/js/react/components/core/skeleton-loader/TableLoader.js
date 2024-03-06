import React from "react";
import ContentLoader from "react-content-loader";

const TableLoader = () => {
  return (
    <ContentLoader viewBox="0 0 380 70" className="mt-2 px-2">
      <rect x="0" y="0" rx="5" ry="5" width="100%" height="10" />
      <rect x="0" y="14" rx="5" ry="5" width="100%" height="10" />
      <rect x="0" y="28" rx="5" ry="5" width="100%" height="10" />
    </ContentLoader>
  );
};

export default TableLoader;
