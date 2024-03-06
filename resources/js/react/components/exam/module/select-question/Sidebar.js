// ** Third Party Components
import { useContext } from "react";
import classnames from "classnames";
import { ListGroup, ListGroupItem } from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";

import { ExamModuleContext } from "../../../../context/ExamModuleContext";

const Sidebar = ({ sidebarOpen }) => {
  const { examModuleState, getQuestions, resetSelectedQuestion, setQuery } =
    useContext(ExamModuleContext);
  const { programs, activeProgram } = examModuleState;

  const handleProgram = (program) => {
    getQuestions({ program });
    resetSelectedQuestion();
    setQuery("");
  };

  const handleActiveItem = (value) => {
    if (activeProgram === value) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div
      className={classnames("sidebar-left", {
        show: sidebarOpen,
      })}
    >
      <div className="sidebar">
        <div className="sidebar-content email-app-sidebar">
          <div className="email-app-menu">
            <PerfectScrollbar
              className="sidebar-menu-list"
              options={{ wheelPropagation: false }}
            >
              <h6 className="section-label mt-3 mb-1 px-2">Program</h6>
              <ListGroup tag="div" className="list-group-labels cursor-pointer">
                {Object.keys(programs).map((program, index) => (
                  <ListGroupItem
                    key={index}
                    onClick={() => handleProgram(program)}
                    active={handleActiveItem(program)}
                    action
                  >
                    <span
                      className={`bullet bullet-sm bullet-${
                        programs[program]?.color ?? "primary"
                      } mr-1`}
                    ></span>
                    {programs[program].text}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </PerfectScrollbar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
