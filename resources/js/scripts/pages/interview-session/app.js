"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentClassId = urlParams.get("classroom_id");
const currentBranchCode = urlParams.get("branch_code");
// const currentClassMembers = urlParams.get("classId");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const classMembersSelectElement = $("#class_member");
const datatableElement = $("#datatables-basic");
const classMemberIDInputElement = $("#class_member_id");
const classMemberEmailInputElement = $("#class_member_email");
const submitButtonElement = $("#submit-btn");
const ptkSchoolInputElement = $("#ptk-school");
const studyProgramInputElement = $("#study-program");
const oldInputElement = $("#old-input");

class InterviewSession {
  constructor() {
    this.initBranchCodeSelectElement();
    this.classMembers = [];
    this.oldInputs = this.getOldInputs();

    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
    classMembersSelectElement.on(
      "change",
      this.classMemberSelectElementHandler.bind(this)
    );
  }

  async fetchBranches() {
    try {
      const response = await fetch("/api/branch/all");
      const data = await response.json();
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchCurrentClassroom() {
    try {
      const response = await fetch(`/api/learning/classroom/${currentClassId}`);
      const data = await response.json();
      return data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchClassMembers(classId) {
    try {
      const response = await fetch(
        `/api/learning/classroom/class-member/${classId}`
      );
      const data = await response.json();
      return data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchStudentPTKProfileByEmail(email) {
    try {
      const response = await fetch(`/api/students/${email}/targets/PTK`);
      const data = await response.json();
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchClassroomByBranchCode(branch_code) {
    try {
      const response = await fetch(
        `/api/learning/classroom/branch/${branch_code}`
      );
      const classrooms = await response.json();
      const currentYearOngoingClassrooms = classrooms?.data?.length
        ? classrooms?.data.filter(
            (classroom) =>
              classroom.status === "ONGOING" &&
              classroom.year === new Date().getFullYear()
          ) ?? []
        : classrooms?.data ?? [];
      return currentYearOngoingClassrooms;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async initBranchCodeSelectElement() {
    this.branches = await this.fetchBranches();
    this.addBranchOptions();

    if (this.oldInputs?.branch_code) {
      this.setSelectElementValue(
        branchCodeSelectElement,
        this.oldInputs?.branch_code
      );
    }

    this.enableElement(branchCodeSelectElement);
    branchCodeSelectElement.select2({ placeholder: "Pilih Cabang" });
  }

  enableElement(element) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.removeAttr("disabled"));
    } else {
      element.removeAttr("disabled");
    }
  }

  disableElement(element) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.attr("disabled", true));
    } else {
      element.attr("disabled", true);
    }
  }

  setSelectElementValue(element, value) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.val(value).trigger("change"));
    } else {
      element.val(value).trigger("change");
    }
  }

  filterAndOrderDataTable() {
    this.datatable
      .column(0, { search: "applied", order: "applied" })
      .nodes()
      .each(function (cell, i) {
        cell.innerHTML = i + 1;
      });
  }

  addBranchOptions() {
    if (Array.isArray(this.branches)) {
      this.branches.forEach((branch) => {
        branchCodeSelectElement.append(
          `<option value="${branch.code}">${branch.name}</option>`
        );
      });
      return;
    }
    branchCodeSelectElement.append(
      `<option value="${this.branches.code}">${this.branches.name}</option>`
    );
    if (!currentClassId)
      branchCodeSelectElement.val(this.userBranchCode).trigger("change");
  }

  addClassroomIdsOptions(classrooms) {
    classrooms.forEach((classroom) =>
      classroomIdSelectElement.append(
        `<option value="${classroom._id}">${classroom.title} (${classroom.year})</option>`
      )
    );
  }

  addClassMemberOption(classMembers) {
    classMembers.forEach((classMember) => {
      const stringifiedClassMember = JSON.stringify(classMember);
      classMembersSelectElement.append(
        `<option value='${stringifiedClassMember}'>${classMember.name}</option>`
      );
    });
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").not(":first").remove();
    this.setSelectElementValue(classroomIdSelectElement, "");
    ptkSchoolInputElement.val("");
    studyProgramInputElement.val("");

    const selectedBranchCode = branchCodeSelectElement.val();

    if (selectedBranchCode) {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
    }

    if (this.oldInputs?.classroom_id) {
      this.setSelectElementValue(
        classroomIdSelectElement,
        this.oldInputs?.classroom_id
      );
    }
  }

  async classroomIdSelectElementHandler() {
    classMembersSelectElement.find("option").not(":first").remove();
    ptkSchoolInputElement.val("");
    studyProgramInputElement.val("");
    const classId = classroomIdSelectElement.val();
    if (classroomIdSelectElement.val() === "") {
      return;
    }

    if (classroomIdSelectElement.val() !== "") {
      this.classMembers = await this.fetchClassMembers(classId);
      if (!this.classMembers.length) return;

      this.addClassMemberOption(this.classMembers);
      classMembersSelectElement.select2({ placeholder: "Pilih Siswa" });

      if (this.oldInputs?.class_member_id) {
        this.setSelectElementValue(
          classMembersSelectElement,
          this.oldInputs?.class_member
        );
      }
    }
  }

  async classMemberSelectElementHandler() {
    ptkSchoolInputElement.val("Mohon tunggu...");
    studyProgramInputElement.val("Mohon tunggu...");

    submitButtonElement.attr("disabled", true);
    classMemberIDInputElement.val(null);
    classMemberEmailInputElement.val(null);

    const selectedClassMember = classMembersSelectElement.val();
    if (!selectedClassMember) return;
    const parsedSelectedClassMember = JSON.parse(selectedClassMember);
    const studentPTKProfile = await this.fetchStudentPTKProfileByEmail(
      parsedSelectedClassMember.email
    );
    if (
      !studentPTKProfile ||
      (studentPTKProfile?.school_id === 0 && studentPTKProfile?.major_id === 0)
    ) {
      ptkSchoolInputElement.val("Siswa belum memilih sekolah");
      studyProgramInputElement.val("Siswa belum program studi/jurusan");
    }
    if (
      !studentPTKProfile ||
      (studentPTKProfile?.school_id === 0 && studentPTKProfile?.major_id === 0)
    ) {
      ptkSchoolInputElement.val("Siswa belum memilih sekolah");
      document.getElementById("ptkSchoolError").textContent =
        "Siswa belum memilih sekolah dan jurusan";
    } else {
      document.getElementById("ptkSchoolError").textContent = "";
    }

    if (
      !studentPTKProfile ||
      (studentPTKProfile?.school_id === 0 && studentPTKProfile?.major_id === 0)
    ) {
      ptkSchoolInputElement.val("Siswa belum memilih sekolah");
      document.getElementById("majorSchoolError").textContent =
        "Siswa belum memilih sekolah dan jurusan";
    } else {
      document.getElementById("ptkSchoolError").textContent = "";
    }

    ptkSchoolInputElement.val(studentPTKProfile.school_name);
    studyProgramInputElement.val(studentPTKProfile.major_name);
    classMemberIDInputElement.val(parsedSelectedClassMember.smartbtw_id);
    classMemberEmailInputElement.val(parsedSelectedClassMember.email);
    if (parsedSelectedClassMember.email)
      submitButtonElement.attr("disabled", false);
  }

  getOldInputs() {
    const dom = document.getElementById("old-input");
    return dom.innerText === "[]" ? null : JSON.parse(dom.innerText);
  }
}

const app = new InterviewSession();
