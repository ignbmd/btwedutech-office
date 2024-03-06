export const getClassroomID = () => {
  const dom = document.getElementById("classroom_id");
  return dom.innerText;
};

export const getStudentID = () => {
  const dom = document.getElementById("student_id");
  return dom.innerText;
};

export const getClassroomProgram = (classroom) => {
  let classroomProgram = "ptk";
  let classroomTags = classroom?.tags ?? [];
  const isPTNClassroomProgram = classroomTags.some((tag) =>
    ["ptn", "utbk", "snbt"].includes(tag.toLowerCase())
  );
  const isCPNSClassroomProgram = classroomTags.some((tag) =>
    ["cpns"].includes(tag.toLowerCase())
  );
  if (isPTNClassroomProgram) {
    classroomProgram = "ptn";
  }
  if (isCPNSClassroomProgram) {
    classroomProgram = "cpns";
  }
  return classroomProgram;
};

export const getQueryParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  if (urlSearchParams.size === 0) {
    return null;
  }

  const queryParams = {};
  for (const [key, value] of urlSearchParams.entries()) {
    queryParams[key] = value;
  }

  return queryParams;
};
