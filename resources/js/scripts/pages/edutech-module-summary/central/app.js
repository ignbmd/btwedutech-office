"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentBranchCode = urlParams.getAll("branch_code[]");
const selectedClassroomYear = urlParams.get("classroom_year");
const currentClassType = urlParams.get("classroom_type");
const currentExamType = urlParams.get("exam_type");
const withDeviation = urlParams.get("with_deviation");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomTypeSelectElement = $("#classroom_type");
const classroomYearSelectElement = $("#classroom_year");
const examTypeSelectElement = $("#exam_type");
const withDeviationSelectElement = $("#with_deviation");
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
    this.initWithDeviationSelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomTypeSelectElement.on(
      "change",
      this.classroomTypeSelectElementHandler.bind(this)
    );
    // $("thead th.sorting").on("click", this.markTableHeaderAsSorted.bind(this));
  }

  initDataTable() {
    if (!emptyResultTdElement.length) {
      this.datatable = datatableElement.DataTable({
        lengthMenu: [-1],
        // lengthMenu: [7, 10, 25, 50, 75, 100],
        scrollY: "500px",
        scrollX: true,
        paging: false,
        fixedColumns: {
          left: 5,
        },
        fixedHeader: {
          header: true,
          footer: true,
        },
        dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"><"col-sm-12 col-md-6"p>>',
        columnDefs: [
          {
            searchable: false,
            orderable: false,
            targets: [0, columnLength],
          },
        ],
        buttons: [
          // {
          //   text:
          //     feather.icons["refresh-cw"].toSvg({
          //       class: "mr-50 font-small-4",
          //     }) + "Refresh Data",
          //   className: "create-new btn btn-outline-info",
          //   init: function (api, node, config) {
          //     $(node).removeClass("btn-secondary");
          //   },
          //   action: function (e, dt, button, config) {
          //     window.location.href = `${
          //       window.location.origin
          //     }/pembelajaran/kelas/members/progress/refresh?${urlParams.toString()}`;
          //   },
          // },
          // {
          //   text:
          //     feather.icons["file"].toSvg({ class: "mr-50 font-small-4" }) +
          //     "Export To Pdf",
          //   className: "create-new btn btn-primary ml-50",
          //   init: function (api, node, config) {
          //     $(node).removeClass("btn-secondary");
          //   },
          //   action: function (e, dt, button, config) {
          //     window.open(
          //       `${
          //         window.location.origin
          //       }/performa-siswa-edutech/pdf?${urlParams.toString()}`,
          //       "_blank"
          //     );
          //   },
          // },
        ],
        language: {
          paginate: {
            // remove previous & next text from pagination
            previous: "&nbsp;",
            next: "&nbsp;",
          },
        },
        footerCallback: function (row, data, start, end, display) {
          const api = this.api();
          const COLUMN_INDEX_START = 6; // Start from average score column index
          const COLUMN_INDEX_END = api.columns().count() - 1; // Ignore action column index
          let tableHeaders = api.columns().header().toArray(); // Retrieve the header nodes

          for (let i = COLUMN_INDEX_START; i < COLUMN_INDEX_END; i++) {
            const visibleNodes = api
              .column(i, { search: "applied" })
              .nodes()
              .toArray();
            let sum = 0;
            let count = 0;

            $(visibleNodes).each(function () {
              const cellData =
                $(this).text() === "-" ? 0 : parseFloat($(this).text());
              sum += cellData;
              count++;
            });
            let avg = sum / count;
            avg = Math.round(avg * 10) / 10;

            let tableHeaderTitle = $(tableHeaders[i]).text();
            let percentageTableCell = /persentase|peluang/i.test(
              tableHeaderTitle
            );

            $(api.column(i).footer()).html(
              percentageTableCell ? `${avg}%` : avg
            );
          }
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

    if (currentBranchCode.length && !currentBranchCode.includes("ALL"))
      this.setSelectElementValue(branchCodeSelectElement, currentBranchCode);
    if (currentBranchCode.length && currentBranchCode.includes("ALL")) {
      branchCodeSelectElement.val(["ALL"]).trigger("change");
    }
    branchCodeSelectElement.select2({ placeholder: "Pilih Cabang" });
  }

  initWithDeviationSelectElement() {
    withDeviationSelectElement.val(withDeviation).trigger("change");
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
    branchCodeSelectElement.append(`<option value="ALL">Semua Cabang</option>`);
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

  branchCodeSelectElementHandler() {
    const selectedBranchCodeCount = branchCodeSelectElement.val().length;
    if (
      selectedBranchCodeCount > 1 &&
      branchCodeSelectElement.val().includes("ALL")
    )
      branchCodeSelectElement.val(["ALL"]).trigger("change");

    const currentSelectedExamType = examTypeSelectElement.val();
    this.setSelectElementValue(examTypeSelectElement, currentSelectedExamType);

    if (currentClassType && !this.branchCodeSelectElementChangedOnce) {
      this.branchCodeSelectElementChangedOnce = true;
      this.setSelectElementValue(classroomTypeSelectElement, currentClassType);
    }

    if (currentExamType && !this.examTypeSelectElementChangedOnce) {
      this.examTypeSelectElementChangedOnce = true;
      this.setSelectElementValue(examTypeSelectElement, currentExamType);
    }

    if (selectedClassroomYear && !this.classroomYearSelectElementChangedOnce) {
      this.classroomYearSelectElementChangedOnce = true;
      this.setSelectElementValue(
        classroomYearSelectElement,
        selectedClassroomYear
      );
    }
  }

  classroomTypeSelectElementHandler() {
    if (classroomTypeSelectElement.val() !== "") {
      if (currentExamType && !this.examTypeSelectElementChangedOnce) {
        this.examTypeSelectElementChangedOnce = true;
        this.setSelectElementValue(examTypeSelectElement, currentExamType);
      }
    }
  }
}

const app = new ModuleSummary();
