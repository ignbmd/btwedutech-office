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

const samaptaTryoutScoreModalElement = $("#samaptaTryoutScoreModal");
const samaptaTryoutScoreModalFormElement = $("#samaptaTryoutScoreModalForm");
const samaptaTryoutScoreModalSubmitFormButtonElement = $("#btnSubmit");

const runScoreInput = $("#run_score");
const pullUpScoreInput = $("#pull_up_score");
const pushUpScoreInput = $("#push_up_score");
const sitUpScoreInput = $("#sit_up_score");
const shuttleScoreInput = $("#shuttle_score");
const totalScoreInput = $("#total");

const CENTRAL_BRANCH_CODE = "PT0000";

class SamaptaTryoutScore {
  constructor() {
    this.initDataTable();
    this.initBranchCodeSelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
    filterFormElement.on("submit", this.filterFormElementHandler);
    samaptaTryoutScoreModalElement.on(
      "show.bs.modal",
      this.SamaptaTryoutScoreModalShowHandler
    );
    samaptaTryoutScoreModalSubmitFormButtonElement.on(
      "click",
      this.submitSamaptaTryoutScoreModalFormButtonElementHandler.bind(this)
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

  // DOM manipulation methods
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

  SamaptaTryoutScoreModalShowHandler(event) {
    const button = $(event.relatedTarget);

    const modalType = button.data("type");
    const studentId = button.data("id");
    const studentName = button.data("name");
    const studentGender = button.data("gender");
    const studentRunScore = button.data("runScore");
    const studentPullUpScore = button.data("pullUpScore");
    const studentPushUpScore = button.data("pushUpScore");
    const studentSitUpScore = button.data("sitUpScore");
    const studentShuttleScore = button.data("shuttleScore");
    const studentTotalScore = button.data("total");

    const studentGenderIsMale = studentGender == "1";
    const studentGenderIsFemale = studentGender == "0";

    const modalTitle =
      modalType === "create"
        ? `Tambah Nilai Tryout Samapta ${studentName}`
        : `Edit Nilai Tryout Samapta ${studentName}`;
    const modal = $(this);
    modal.find(".modal-title").text(modalTitle);
    modal.find("#smartbtw_id").val(studentId);
    modal.find("#run_score").val(studentRunScore ? studentRunScore : 0);
    modal
      .find("#pull_up_score")
      .val(studentPullUpScore ? studentPullUpScore : 0);
    modal
      .find("#push_up_score")
      .val(studentPushUpScore ? studentPushUpScore : 0);
    modal.find("#sit_up_score").val(studentSitUpScore ? studentSitUpScore : 0);
    modal
      .find("#shuttle_score")
      .val(studentShuttleScore ? studentShuttleScore : 0);
    modal.find("#total").val(studentTotalScore ? studentTotalScore : 0);
    if (studentGenderIsMale) modal.find("#male").prop("checked", true);
    else if (studentGenderIsFemale) modal.find("#female").prop("checked", true);
    else {
      modal.find("#male").prop("checked", false);
      modal.find("#female").prop("checked", false);
    }
    if (modalType === "edit") {
      modal.find("#btnSubmit").text("Ubah");
      modal.find("#btnSubmit").removeClass("btn-primary");
      modal.find("#btnSubmit").addClass("btn-warning");
      modal.find("#btnClose").removeClass("btn-outline-primary");
      modal.find("#btnClose").addClass("btn-outline-warning");
      return;
    }

    modal.find("#btnSubmit").removeClass("btn-warning");
    modal.find("#btnSubmit").addClass("btn-primary");
    modal.find("#btnClose").removeClass("btn-outline-warning");
    modal.find("#btnClose").addClass("btn-outline-primary");

    modal.find("#btnSubmit").text("Tambah");
  }

  submitSamaptaTryoutScoreModalFormButtonElementHandler() {
    runScoreInput[0].setCustomValidity("");
    pushUpScoreInput[0].setCustomValidity("");
    pullUpScoreInput[0].setCustomValidity("");
    sitUpScoreInput[0].setCustomValidity("");
    shuttleScoreInput[0].setCustomValidity("");
    totalScoreInput[0].setCustomValidity("");
    runScoreInput[0].setCustomValidity("");

    if (isNaN(runScoreInput.val())) {
      runScoreInput[0].setCustomValidity("Please enter a number");
      return runScoreInput[0].reportValidity();
    }

    if (runScoreInput.val() < 0) {
      runScoreInput[0].setCustomValidity("Minimum value is 0");
      return runScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(runScoreInput.val())) &&
      !this.isValidFloat(runScoreInput.val())
    ) {
      runScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return runScoreInput[0].reportValidity();
    }

    if (isNaN(pushUpScoreInput.val())) {
      pushUpScoreInput[0].setCustomValidity("Please enter a number");
      return pushUpScoreInput[0].reportValidity();
    }

    if (pushUpScoreInput.val() < 0) {
      pushUpScoreInput[0].setCustomValidity("Minimum value is 0");
      return pushUpScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(pushUpScoreInput.val())) &&
      !this.isValidFloat(pushUpScoreInput.val())
    ) {
      pushUpScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return pushUpScoreInput[0].reportValidity();
    }

    if (isNaN(pullUpScoreInput.val())) {
      pullUpScoreInput[0].setCustomValidity("Please enter a number");
      return pullUpScoreInput[0].reportValidity();
    }

    if (pullUpScoreInput.val() < 0) {
      pullUpScoreInput[0].setCustomValidity("Minimum value is 0");
      return pullUpScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(pullUpScoreInput.val())) &&
      !this.isValidFloat(pullUpScoreInput.val())
    ) {
      pullUpScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return pullUpScoreInput[0].reportValidity();
    }

    if (isNaN(sitUpScoreInput.val())) {
      sitUpScoreInput[0].setCustomValidity("Please enter a number");
      return sitUpScoreInput[0].reportValidity();
    }

    if (sitUpScoreInput.val() < 0) {
      sitUpScoreInput[0].setCustomValidity("Minimum value is 0");
      return sitUpScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(sitUpScoreInput.val())) &&
      !this.isValidFloat(sitUpScoreInput.val())
    ) {
      sitUpScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return sitUpScoreInput[0].reportValidity();
    }

    if (isNaN(shuttleScoreInput.val())) {
      shuttleScoreInput[0].setCustomValidity("Please enter a number");
      return shuttleScoreInput[0].reportValidity();
    }

    if (shuttleScoreInput.val() < 0) {
      shuttleScoreInput[0].setCustomValidity("Minimum value is 0");
      return shuttleScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(shuttleScoreInput.val())) &&
      !this.isValidFloat(shuttleScoreInput.val())
    ) {
      shuttleScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return shuttleScoreInput[0].reportValidity();
    }

    if (isNaN(totalScoreInput.val())) {
      totalScoreInput[0].setCustomValidity("Please enter a number");
      return totalScoreInput[0].reportValidity();
    }

    if (totalScoreInput.val() < 0) {
      totalScoreInput[0].setCustomValidity("Minimum value is 0");
      return totalScoreInput[0].reportValidity();
    }

    if (
      this.isFloat(parseFloat(totalScoreInput.val())) &&
      !this.isValidFloat(totalScoreInput.val())
    ) {
      totalScoreInput[0].setCustomValidity(
        "Please enter a two decimal places value"
      );
      return totalScoreInput[0].reportValidity();
    }

    if (!runScoreInput[0].checkValidity())
      return runScoreInput[0].reportValidity();
    if (!pushUpScoreInput[0].checkValidity())
      return pushUpScoreInput[0].reportValidity();
    if (!pullUpScoreInput[0].checkValidity())
      return pullUpScoreInput[0].reportValidity();
    if (!sitUpScoreInput[0].checkValidity())
      return sitUpScoreInput[0].reportValidity();
    if (!shuttleScoreInput[0].checkValidity())
      return shuttleScoreInput[0].reportValidity();
    if (!totalScoreInput[0].checkValidity())
      return totalScoreInput[0].reportValidity();

    samaptaTryoutScoreModalElement
      .find(".modal-footer")
      .addClass("block-content");
    samaptaTryoutScoreModalFormElement.addClass("block-content");
    samaptaTryoutScoreModalFormElement.submit();
  }

  getUserBranchCode() {
    const dom = document.getElementById("branch-code");
    return dom.innerText;
  }

  showToast = ({ type, title, message, duration = 3000 }) => {
    toastr[type](message, title, {
      closeButton: true,
      tapToDismiss: false,
      timeOut: duration,
    });
  };

  isFloat(value) {
    if (
      typeof value === "number" &&
      !Number.isNaN(value) &&
      !Number.isInteger(value)
    ) {
      return true;
    }

    return false;
  }

  isValidFloat(value) {
    if (!value) return true;
    const validDecimalScoreRegex = /^(?:\d*\.\d{1,2}|\d+)$/;
    return validDecimalScoreRegex.test(value);
  }
}

const app = new SamaptaTryoutScore();
