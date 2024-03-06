import { useState } from "react";
import classnames from "classnames";

import Questions from "./Questions";


const SelectQuestionIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState();

  return (
    <div className="content-area-wrapper rounded-0 border-left-0 border-right-0">
      <div className="content-right w-100">
        <div className="content-body">
          <div
            className={classnames("body-content-overlay", {
              show: sidebarOpen,
            })}
            onClick={() => setSidebarOpen(false)}
          ></div>
          <Questions
            setSidebarOpen={setSidebarOpen}
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectQuestionIndex;
