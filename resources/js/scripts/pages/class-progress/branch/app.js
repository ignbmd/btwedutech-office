"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentClassId = urlParams.getAll("classroom_id[]");
const currentExamType = urlParams.get("exam_type");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const examTypeSelectElement = $("#exam_type");
const datatableElement = $("#datatables-basic");
const filterButtonElement = $("#btnFilter");
const emptyResultTdElement = $("#empty-result");

let columnLength = $("thead th").length - 1;
let selectedColumnIndex;
let selectedColumnOrderState;

class ModuleSummary {
  constructor() {
    this.userId = userIdElement[0].innerText;
    this.branchCodeSelectElementChangedOnce = false;
    this.examTypeSelectElementChangedOnce = false;
    this.initDataTable();
    this.initBranchCodeSelectElement();
    this.initClassroomIdSelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
    $("thead th.sorting").on("click", this.markTableHeaderAsSorted.bind(this));
  }

  initDataTable() {
    if (!emptyResultTdElement.length) {
      this.datatable = datatableElement.DataTable({
        displayLength: 7,
        lengthMenu: [7, 10, 25, 50, 75, 100],
        dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        columnDefs: [
          {
            searchable: false,
            orderable: false,
            targets: [0, columnLength],
          },
        ],
        buttons: [
          {
            text:
              feather.icons["refresh-cw"].toSvg({
                class: "mr-50 font-small-4",
              }) + "Refresh Data",
            className: "create-new btn btn-outline-info",
            init: function (api, node, config) {
              $(node).removeClass("btn-secondary");
            },
            action: function (e, dt, button, config) {
              window.location.href = `${
                window.location.origin
              }/pembelajaran/kelas/members/progress/refresh?${urlParams.toString()}`;
            },
          },
          {
            text:
              feather.icons["file"].toSvg({ class: "mr-50 font-small-4" }) +
              "Export To Pdf",
            className: "create-new btn btn-primary ml-50",
            init: function (api, node, config) {
              $(node).removeClass("btn-secondary");
            },
            action: function (e, dt, button, config) {
              urlParams.delete("classroom_id");
              window.open(
                `${
                  window.location.origin
                }/pembelajaran/kelas/progress-report?${urlParams.toString()}`,
                "_blank"
              );
              urlParams.append("classroom_id", currentClassId);
            },
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
      const response = await fetch(
        `/api/learning/classroom/${currentClassId[0]}`
      );
      const data = await response.json();
      return data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchSharedClassroom() {
    try {
      const response = await fetch(
        `/api/learning/classroom/shared/by-sso-id/${this.userId}`
      );
      const data = await response.json();
      return data?.data ?? [];
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
      const data = await response.json();
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // DOM manipulation methods
  async initBranchCodeSelectElement() {
    this.branches = await this.fetchBranches();
    this.addSharedClassroomOption();
    this.addBranchOption();

    // If current class id is selected, set branch code select element value to corresponding classroom branch code
    // Otherwise, set branch code select element value to authenticated user branch code
    if (!currentClassId.length) {
      this.setSelectElementValue(
        branchCodeSelectElement,
        Array.isArray(this.branches)
          ? this.branches[0].code
          : this.branches.code
      );
    } else {
      const selectedClassroomData = await this.fetchCurrentClassroom();
      const isBranchCodeOptionExistsOnSelectElement =
        $(`#branch_code option[value=${selectedClassroomData.branch_code}]`)
          .length > 0;
      if (isBranchCodeOptionExistsOnSelectElement)
        this.setSelectElementValue(
          branchCodeSelectElement,
          selectedClassroomData.branch_code
        );
      else
        this.setSelectElementValue(branchCodeSelectElement, "shared-classroom");
    }
    this.enableElement(branchCodeSelectElement);
  }

  async initClassroomIdSelectElement() {
    classroomIdSelectElement.prop("multiple", "multiple");
    classroomIdSelectElement.prop("name", "classroom_id[]");
    classroomIdSelectElement.select2({
      multiple: true,
      placeholder: "Pilih Kelas",
    });
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

  addSharedClassroomOption() {
    branchCodeSelectElement.append(
      `<option value="shared-classroom">Kelas Dibagikan</option>`
    );
  }

  markTableHeaderAsSorted(event) {
    this.datatable.columns().nodes().flatten().to$().removeClass("sorted");
    urlParams.delete("orderBy");
    urlParams.delete("sort");

    selectedColumnIndex = this.datatable.order()[0][0];
    selectedColumnOrderState = this.datatable.order()[0][1];
    // ** Set sort params by clicked table header's index
    // urlParams.append("orderBy", selectedColumnIndex);
    // ** Alternative - Set sort params by clicked table header's element ID value
    urlParams.append("orderBy", event.target.id);
    urlParams.append("sort", selectedColumnOrderState);

    this.datatable.column(selectedColumnIndex).nodes().to$().addClass("sorted");
  }

  filterAndOrderDataTable() {
    this.datatable
      .column(0, { search: "applied", order: "applied" })
      .nodes()
      .each(function (cell, i) {
        cell.innerHTML = i + 1;
      });
  }

  addBranchOption() {
    if (Array.isArray(this.branches)) {
      this.branches.forEach((branch) => {
        branchCodeSelectElement.append(
          `<option value="${branch.code}">${branch.name}</option>`
        );
      });
    } else {
      branchCodeSelectElement.append(
        `<option value="${this.branches.code}">${this.branches.name}</option>`
      );
    }
  }

  addSharedClassroomOptions(sharedClassrooms) {
    sharedClassrooms.forEach((item) =>
      classroomIdSelectElement.append(
        `<option value="${item.classrooms._id}">${item.classrooms.title} (${item.classrooms.year})</option>`
      )
    );
  }

  addClassroomIdsOptions(classrooms) {
    classrooms.forEach((classroom) =>
      classroomIdSelectElement.append(
        `<option value="${classroom._id}">${classroom.title} (${classroom.year})</option>`
      )
    );
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").remove();

    if (!this.branchCodeSelectElementChangedOnce) {
      this.branchCodeSelectElementChangedOnce = true;
      this.setClassroomIdSelectElementToSelectedClassroomIds();
      return;
    }

    if (branchCodeSelectElement.val() === "") {
      this.disableElement([
        classroomIdSelectElement,
        examTypeSelectElement,
        filterButtonElement,
      ]);
      this.setSelectElementValue(
        [classroomIdSelectElement, examTypeSelectElement],
        ""
      );
    } else if (branchCodeSelectElement.val() === "shared-classroom") {
      const userSharedClassroom = await this.fetchSharedClassroom();
      this.addSharedClassroomOptions(userSharedClassroom);
      this.setSelectElementValue(
        [classroomIdSelectElement, examTypeSelectElement],
        ""
      );
      this.enableElement(classroomIdSelectElement);
    } else {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
      this.setSelectElementValue(
        [classroomIdSelectElement, examTypeSelectElement],
        ""
      );
      this.enableElement(classroomIdSelectElement);
    }
  }

  async setClassroomIdSelectElementToSelectedClassroomIds() {
    if (
      branchCodeSelectElement.val() !== "" &&
      branchCodeSelectElement.val() === "shared-classroom"
    ) {
      const userSharedClassroom = await this.fetchSharedClassroom();
      this.addSharedClassroomOptions(userSharedClassroom);
    }

    if (
      branchCodeSelectElement.val() !== "" &&
      branchCodeSelectElement !== "shared-classroom"
    ) {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
    }

    if (currentClassId.length)
      this.setSelectElementValue(classroomIdSelectElement, currentClassId);
    this.enableElement(classroomIdSelectElement);
  }

  classroomIdSelectElementHandler() {
    if (!this.examTypeSelectElementChangedOnce) {
      this.examTypeSelectElementChangedOnce = true;
      this.setSelectElementValue(examTypeSelectElement, currentExamType);
    }

    if (classroomIdSelectElement.val().length) {
      this.enableElement(examTypeSelectElement);
      this.enableElement(filterButtonElement);
    }

    if (!classroomIdSelectElement.val().length) {
      this.setSelectElementValue(examTypeSelectElement, "");
      this.disableElement([examTypeSelectElement, filterButtonElement]);
    }
  }
}

const app = new ModuleSummary();
