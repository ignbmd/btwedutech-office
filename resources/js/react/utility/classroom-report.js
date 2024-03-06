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

export const getUserBranchCode = () => {
  const dom = document.getElementById("branch-code");
  return dom.innerText;
};

export const isCentralBranchUser = () => {
  const dom = document.getElementById("branch-code");
  const branch_code = dom.innerText;
  return branch_code === "PT0000";
};

export const isNonCentralBranchUser = () => {
  const dom = document.getElementById("branch-code");
  const branch_code = dom.innerText;
  return branch_code !== "PT0000";
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
