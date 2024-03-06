"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentClassId = urlParams.get("classroom_id");
const currentBranchCode = urlParams.get("branch_code");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const datatableElement = $("#datatables-basic");
const filterButtonElement = $("#btnFilter");
const filterFormElement = $("#filterForm");
const schoolIdSelectElement = $("#ptk_school_id");
const majorIdSelectElement = $("#ptk_major_id");

const CENTRAL_BRANCH_CODE = "PT0000";

class InterviewTryout {
  constructor() {
    this.competitions = this.getCompetitions();
    this.competitionSchools = this.getCompetitionSchools();
    this.competitionStudyPrograms = [];
    this.initDataTable();
    this.initCompetitionSchoolSelectElement();
    this.initCompetitionStudyProgramSelectElement();
    this.initBranchCodeSelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
  }
  initDataTable() {
    this.datatable = datatableElement.DataTable({
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      dom: '<"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      columnDefs: [
        {
          searchable: false,
          orderable: false,
          targets: [0],
        },
      ],
      language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });
    this.datatable
      .on("order.dt search.dt", this.filterAndOrderDataTable.bind(this))
      .draw();
  }

  async fetchBranches() {
    try {
      const response = await fetch("/pembelajaran/kelas/auth-user/kode");
      const data = await response.json();
      return data ?? [];
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
    if (currentBranchCode)
      this.setSelectElementValue(branchCodeSelectElement, currentBranchCode);
    else {
      const userBranchCode = this.getUserBranchCode();
      this.setSelectElementValue(
        branchCodeSelectElement,
        userBranchCode !== CENTRAL_BRANCH_CODE ? userBranchCode : null
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
    classroomIdSelectElement.append(`<option value="ALL">Semua Kelas</option>`);
    classrooms.forEach((classroom) =>
      classroomIdSelectElement.append(
        `<option value="${classroom._id}">${classroom.title} (${classroom.year})</option>`
      )
    );
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").not(":first").remove();
    const selectedBranchCode = branchCodeSelectElement.val();

    if (!selectedBranchCode) {
      this.disableElement([classroomIdSelectElement, filterButtonElement]);
      this.setSelectElementValue([classroomIdSelectElement], "");
    }

    if (selectedBranchCode) {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
      this.enableElement(classroomIdSelectElement);
      this.setSelectElementValue(classroomIdSelectElement, "");
    }

    if (currentClassId) {
      this.setSelectElementValue(classroomIdSelectElement, currentClassId);
    }
  }

  classroomIdSelectElementHandler() {
    if (classroomIdSelectElement.val() === "") {
      this.disableElement([filterButtonElement]);
    }

    if (classroomIdSelectElement.val() !== "") {
      this.enableElement(filterButtonElement);
    }
  }

  filterFormElementHandler(event) {
    event.preventDefault();
    this.disableElement([classroomIdSelectElement, filterButtonElement]);
    this.submit();
  }

  getCompetitions() {
    const dom = document.getElementById("competition");
    return dom ? JSON.parse(dom.innerText) : [];
  }

  getCompetitionSchools() {
    const dom = document.getElementById("school");
    return dom ? JSON.parse(dom.innerText) : [];
  }

  getUserBranchCode() {
    const dom = document.getElementById("branch-code");
    return dom.innerText;
  }

  initCompetitionSchoolSelectElement() {
    if (!this.competitionSchools.length) return [];
    this.competitionSchools = this.competitionSchools.map((value) => ({
      id: value.sekolah_id,
      text: value.nama_sekolah,
    }));
    schoolIdSelectElement
      .select2({
        data: this.competitionSchools,
        placeholder: "Pilih Sekolah",
      })
      .val(null)
      .trigger("change");
  }

  initCompetitionStudyProgramSelectElement() {
    majorIdSelectElement
      .select2({
        placeholder: "Pilih Program Studi",
      })
      .val(null)
      .trigger("change");
  }

  handleSchoolIdSelected() {
    const selectedSchoolId = schoolIdSelectElement.val();
    const selectedSchool = this.competitions.find(
      (value) => value.sekolah_id == selectedSchoolId
    );
    schoolNameInputElement.val(selectedSchool?.nama_sekolah ?? "");
    majorIdSelectElement.attr("disabled", true);

    // Clear existing options
    majorIdSelectElement.empty();

    // Fetch new options
    this.competitionStudyPrograms = this.getUniqueArrayByKey(
      this.competitions
        .filter((value) => value.sekolah_id == selectedSchoolId)
        .map((value) => ({
          id: value.prodi_id,
          text: value.nama_prodi,
        })),
      "id"
    );

    this.competitionStudyPrograms.forEach((value) => {
      majorIdSelectElement.append(
        $("<option></option>").attr("value", value.id).text(value.text)
      );
    });

    // Update Select 2
    majorIdSelectElement.val(null).trigger("change");
    majorIdSelectElement.attr("disabled", false);
  }
}

const app = new InterviewTryout();
