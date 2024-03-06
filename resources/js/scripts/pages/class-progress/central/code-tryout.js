"use strict";

const urlParams = new URLSearchParams(window.location.search);
const currentClassId = urlParams.get("classroom_id");
const currentCodeCategory = urlParams.get("code_category");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const codeCategorySelectElement = $("#code_category");
const datatableElement = $("#datatables-basic");
const filterButtonElement = $("#btnFilter");
const filterFormElement = $("#filterForm");
const emptyResultTdElement = $("#empty-result");

let columnLength = $(".th-first-row").length - 1;
let selectedColumnIndex;
let selectedColumnOrderState;

class ModuleSummary {
  constructor() {
    this.userId = userIdElement[0].innerText;
    this.branchCodeSelectElementChangedOnce = false;
    this.classroomIdSelectElementChangedOnce = false;
    this.codeCategorySelectElementChangedOnce = false;
    this.initDataTable();
    this.initBranchCodeSelectElement();
    this.initCodeCategorySelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
    codeCategorySelectElement.on(
      "change",
      this.codeCategorySelectElementHandler.bind(this)
    );
    filterFormElement.on("submit", this.filterFormElementHandler);
  }

  initDataTable() {
    if (!emptyResultTdElement.length) {
      this.datatable = datatableElement.DataTable({
        lengthMenu: [
          [7, 10, 25, 50, 100],
          [7, 10, 25, 50, "All"],
        ],
        displayLength: 100,
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
              }/pembelajaran/kelas/members/progress/refresh-tryout?${urlParams.toString()}`;
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
                `${window.location.origin}/pembelajaran/kelas/${currentClassId}/progress-report-tryout?code_category=${currentCodeCategory}`,
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

  async fetchCodeCategory() {
    try {
      const response = await fetch("/api/exam/tryout-code/code-category");
      const data = await response.json();
      return data.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
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
    if (currentClassId && currentClassId !== "all-class") {
      const classroomData = await this.fetchCurrentClassroom();
      this.setSelectElementValue(
        branchCodeSelectElement,
        classroomData.branch_code
      );
    } else if (currentClassId == "all-class") {
      this.setSelectElementValue(branchCodeSelectElement, "all-branch");
    }

    this.enableElement(branchCodeSelectElement);
    branchCodeSelectElement.select2({ placeholder: "Pilih Cabang" });
  }

  // DOM manipulation methods
  async initCodeCategorySelectElement() {
    this.codeCategory = await this.fetchCodeCategory();
    this.addCodeCategoryOptions();

    // If current class id is selected, set branch code select element value to corresponding classroom branch code
    if (currentClassId && currentClassId !== "all-class") {
      const classroomData = await this.fetchCurrentClassroom();
      this.setSelectElementValue(
        branchCodeSelectElement,
        classroomData.branch_code
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
    branchCodeSelectElement.append(
      `<option value="all-branch">Semua Cabang</option>`
    );
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
    if (branchCodeSelectElement.val() == "all-branch") {
      classroomIdSelectElement.append(
        `<option value="all-class">Semua Kelas Intensif</option>`
      );
    }
  }

  addCodeCategoryOptions() {
    this.codeCategory.forEach((codeCategory) => {
      codeCategorySelectElement.append(
        `<option value="${codeCategory.id}">${codeCategory.name}</option>`
      );
    });
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").not(":first").remove();
    const selectedBranchCodeCount = branchCodeSelectElement.val().length;

    if (!selectedBranchCodeCount) {
      this.disableElement([
        classroomIdSelectElement,
        codeCategorySelectElement,
        filterButtonElement,
      ]);
      this.setSelectElementValue(
        [classroomIdSelectElement, codeCategorySelectElement],
        ""
      );
    }

    const branch_code = branchCodeSelectElement.val();
    const classrooms = await this.fetchClassroomByBranchCode(branch_code);
    this.addClassroomIdsOptions(classrooms);
    this.enableElement(classroomIdSelectElement);
    this.setSelectElementValue(classroomIdSelectElement, "");

    if (currentClassId && !this.branchCodeSelectElementChangedOnce) {
      this.branchCodeSelectElementChangedOnce = true;
      this.setSelectElementValue(classroomIdSelectElement, currentClassId);
    }

    if (currentCodeCategory && !this.codeCategorySelectElementChangedOnce) {
      this.codeCategorySelectElementChangedOnce = true;
      this.setSelectElementValue(
        codeCategorySelectElement,
        currentCodeCategory
      );
    }
  }

  classroomIdSelectElementHandler() {
    if (classroomIdSelectElement.val() === "") {
      this.setSelectElementValue(codeCategorySelectElement, "");
      this.disableElement([codeCategorySelectElement, filterButtonElement]);
    }

    if (classroomIdSelectElement.val() !== "") {
      this.enableElement(codeCategorySelectElement);
      if (currentCodeCategory && !this.codeCategorySelectElementChangedOnce) {
        this.codeCategorySelectElementChangedOnce = true;
        this.setSelectElementValue(
          codeCategorySelectElement,
          currentCodeCategory
        );
      }
      if (classroomIdSelectElement.val() == "all-class") {
        this.enableElement(filterButtonElement);
      } else {
        if (codeCategorySelectElement.val() !== "") {
          this.enableElement(filterButtonElement);
        }
      }
    }
  }

  codeCategorySelectElementHandler() {
    if (codeCategorySelectElement.val() !== "") {
      this.enableElement(filterButtonElement);
    }
  }

  filterFormElementHandler(event) {
    event.preventDefault();
    branchCodeSelectElement.attr("disabled", true);
    this.submit();
  }
}

const app = new ModuleSummary();
