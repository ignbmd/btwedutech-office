import React, { Fragment, useEffect } from "react";
import HtmlParser from "react-html-parser";

const CKEditorParser = ({ mString }) => {
  useEffect(() => {
    const mathJax = window?.MathJax;

    if (typeof mathJax !== "undefined") {
      mathJax.typesetPromise();
    }
  }, []);

  return <Fragment>{HtmlParser(mString ?? "")}</Fragment>;
};

export default CKEditorParser;
