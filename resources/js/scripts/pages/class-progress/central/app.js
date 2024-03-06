"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentBranchCode = urlParams.getAll("branch_code[]");
const currentClassId = urlParams.get("classroom_id");
const currentExamType = urlParams.get("exam_type");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const examTypeSelectElement = $("#exam_type");
const datatableElement = $("#datatables-basic");
const filterButtonElement = $("#btnFilter");
const filterFormElement = $("#filterForm");
const emptyResultTdElement = $("#empty-result");

let columnLength = $("thead th").length - 1;
let selectedColumnIndex;
let selectedColumnOrderState;

class ModuleSummary {
  constructor() {
    this.userId = userIdElement[0].innerText;
    this.branchCodeSelectElementChangedOnce = false;
    this.classroomIdSelectElementChangedOnce = false;
    this.examTypeSelectElementChangedOnce = false;
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
              window.open(
                `${
                  window.location.origin
                }/pembelajaran/kelas/progress-report?${urlParams.toString()}`,
                "_blank"
              );
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
      const response = await fetch(`/api/learning/classroom/${currentClassId}`);
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
    this.addBranchOptions();

    // If current class id is selected, set branch code select element value to corresponding classroom branch code
    if (currentClassId) {
      const classroomData = await this.fetchCurrentClassroom();
      this.setSelectElementValue(
        branchCodeSelectElement,
        classroomData.branch_code
      );
    }

    if (currentBranchCode.length)
      this.setSelectElementValue(branchCodeSelectElement, currentBranchCode);
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

  addBranchOptions() {
    this.branches.forEach((branch) => {
      branchCodeSelectElement.append(
        `<option value="${branch.code}">${branch.name}</option>`
      );
    });
  }

  addClassroomIdsOptions(classrooms) {
    classrooms.forEach((classroom) =>
      classroomIdSelectElement.append(
        `<option value="${classroom._id}">${classroom.title} (${classroom.year})</option>`
      )
    );
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").not(":first").remove();
    const selectedBranchCodeCount = branchCodeSelectElement.val().length;

    if (!selectedBranchCodeCount) {
      this.disableElement([
        classroomIdSelectElement,
        examTypeSelectElement,
        filterButtonElement,
      ]);
      this.setSelectElementValue(
        [classroomIdSelectElement, examTypeSelectElement],
        ""
      );
    }

    if (selectedBranchCodeCount === 1) {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
      this.enableElement(classroomIdSelectElement);
      this.setSelectElementValue(classroomIdSelectElement, "");
    }

    if (selectedBranchCodeCount > 1) {
      const currentSelectedExamType = examTypeSelectElement.val();
      this.disableElement(classroomIdSelectElement);
      this.setSelectElementValue(classroomIdSelectElement, "");

      if (currentSelectedExamType === "Pilih Jenis Latihan")
        this.setSelectElementValue(examTypeSelectElement, "");
      else
        this.setSelectElementValue(
          examTypeSelectElement,
          currentSelectedExamType
        );

      this.enableElement([examTypeSelectElement, filterButtonElement]);
    }

    if (currentClassId && !this.branchCodeSelectElementChangedOnce) {
      this.branchCodeSelectElementChangedOnce = true;
      this.setSelectElementValue(classroomIdSelectElement, currentClassId);
    }

    if (currentExamType && !this.examTypeSelectElementChangedOnce) {
      this.examTypeSelectElementChangedOnce = true;
      this.setSelectElementValue(examTypeSelectElement, currentExamType);
    }
  }

  classroomIdSelectElementHandler() {
    if (classroomIdSelectElement.val() === "") {
      this.setSelectElementValue(examTypeSelectElement, "");
      this.disableElement([examTypeSelectElement, filterButtonElement]);
    }

    if (classroomIdSelectElement.val() !== "") {
      this.enableElement(examTypeSelectElement);
      if (currentExamType && !this.examTypeSelectElementChangedOnce) {
        this.examTypeSelectElementChangedOnce = true;
        this.setSelectElementValue(examTypeSelectElement, currentExamType);
      }
      this.enableElement(filterButtonElement);
    }
  }

  filterFormElementHandler(event) {
    event.preventDefault();
    const selectedBranchCodeCount = branchCodeSelectElement.val().length;
    if (selectedBranchCodeCount === 1)
      branchCodeSelectElement.attr("disabled", true);
    this.submit();
  }
}

const app = new ModuleSummary();
