class ClassesDataTable {
  constructor() {
    this.summary = [];
    this.classes = [];
    this.years = [];
    this.branches = [];
    this.selectedYear = new Date().getFullYear();
    this.selectedClassType = "branch-classroom";
    this.table = null;
    this.userRole = this.getUserRoles();
    this.userBranchCode = this.getUserBranchCode();
    this.isUserHasMultipleBranchCode = this.isUserHasMultipleBranchCode();
    this.canShowAllClassroom = this.canShowAllClassroom();

    this.YEAR_FILTER_CONTAINER_ID = "year-filter-container";
    this.USER_BRANCH_CODE_ID = "user_branch_code";
    this.YEAR_FILTER_ID = "year-filter";
    this.CLASS_TYPE_FILTER_ID = "class-type-filter";
    this.SUBMIT_BUTTON_CLASS = "data-submit";
    this.SHOW_SCHEDULE_CLASS = "show-schedule";
    this.SHOW_STUDENT_CLASS = "show-student";
    this.SHOW_STUDENT_SCORES_CLASS = "show-student-scores";
    this.EDIT_CLASS = "edit-record";
    this.DELETE_CLASS = "delete-record";
    this.DATATABLE_CLASS = "datatables-basic";
    this.DATATABLE_MODAL_CLASS = "dtr-bs-modal";
  }

  async init() {
    $(async () => {
      this.classes = await this.fetchData();
      this.years = this.getClassYears();
      if (this.isUserHasMultipleBranchCode) this.removeUserCreateRole();
      this.initTable();
      this.activateTableFeatures();
      this.refreshSummary(this.getClassesByYear());
      this.listenBranchesFetched();
      this.loadBranches();
    });
  }

  async initSummary() {
    this.summary = await this.fetchSummary();
    this.resetSummary();
    this.summary.forEach((item) => {
      const dom = document.getElementById(`COUNT_${item?.status}`);
      dom.innerText = item?.count;
    });
  }

  refreshSummary(data) {
    const names = ["ALL", "ONGOING", "ENDED", "NOT_ACTIVE"];
    const summary = {};

    const ongoingClasses = data.filter((e, i) => e.status === "ONGOING");
    const endedClasses = data.filter((e, i) => e.status === "ENDED");
    const notActiveClasses = data.filter((e, i) => e.status === "NOT_ACTIVE");

    summary["ALL"] = data.length;
    summary["ONGOING"] = ongoingClasses.length;
    summary["ENDED"] = endedClasses.length;
    summary["NOT_ACTIVE"] = notActiveClasses.length;

    names.forEach((name) => {
      const dom = document.getElementById(`COUNT_${name}`);
      dom.innerText = summary[name];
    });
  }

  resetSummary() {
    const names = ["ALL", "ONGOING", "ENDED", "NOT_ACTIVE"];
    names.forEach((name) => {
      const dom = document.getElementById(`COUNT_${name}`);
      dom.innerText = 0;
    });
  }

  initTable() {
    const dom = $(`.${this.DATATABLE_CLASS}`);
    this.table = dom.DataTable({
      scrollX: true,
      data: this.getClassesByYear(),
      columns: [
        { data: "title" },
        { data: "_id" },
        { data: "_id" }, // used for sorting so will hide this column
        { data: "title" },
        { data: "description" },
        { data: "count_member" },
        // this.isBranchNameVisible() ? { data: "branch_name" } : null,
        { data: "branch_name" },
        { data: "quota" },
        { data: "status" },
        { data: "" },
      ].filter(Boolean),
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 1,
          width: "5%",
          targets: 0,
          render: function () {
            return "";
          },
        },
        {
          targets: 0,
          orderable: false,
        },
        {
          targets: 2,
          visible: false,
        },
        {
          targets: 3,
          responsivePriority: 1,
          render: (data) => {
            const $html = `
            <div class="d-flex justify-content-left align-items-center">
              <div class="d-flex flex-column">
                <span class="emp_name text-truncate font-weight-bold">
                  ${data}
                </span>
              </div>
            </div>`;
            return $html;
          },
        },
        {
          targets: 4,
          responsivePriority: 1,
          render: (data) => {
            return data ? data : "-";
          },
        },
        // this.isBranchNameVisible()
        //   ? {
        //       target: 4,
        //       responsivePriority: 1,
        //     }
        //   : null,
        {
          targets: 6,
          responsivePriority: 1,
          render: (data) => {
            return data ? data : "Loading...";
          },
        },
        {
          targets: 5,
          responsivePriority: 1,
          render: (data) => {
            return `
            <span class="badge badge-pill badge-light-info">
              ${data}
            </span>`;
          },
        },
        {
          responsivePriority: 2,
          targets: -3,
        },
        {
          responsivePriority: 2,
          targets: -2,
          render: (data, type, full, meta) => {
            const badge = this.getBadge(full.status);
            const icon = feather.icons[badge.icon].toSvg({
              class: "font-small-4 mr-25",
            });
            return `
            <div class="badge badge-light-${badge.color}">
              ${icon}
              <span>${badge.text}</span>
            </div>`;
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: (data, type, full, meta) => {
            const seeScheduleHtml = `
              <a
                href="javascript:;"
                class="dropdown-item ${this.SHOW_SCHEDULE_CLASS}"
                data-id="${full?._id}"
              >
                ${feather.icons["calendar"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Lihat Jadwal
              </a>`;

            const seeStudentHtml = `
              <a
                href="javascript:;"
                class="dropdown-item ${this.SHOW_STUDENT_CLASS}"
                data-id="${full?._id}"
              >
                ${feather.icons["users"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Lihat Siswa
              </a>
            `;

            const assignReceivedModuleHtml = `
            <a
              href="javascript:;"
              class="dropdown-item ${this.ASSIGN_RECEIVED_MODULE_CLASS}"
              data-id="${full?._id}"
            >
              ${feather.icons["package"].toSvg({
                class: "font-small-4 mr-50",
              })}
              Assign Paket Diterima
            </a>
          `;

            const editHtml = `
              <a
                href="javascript:;"
                class="dropdown-item ${this.EDIT_CLASS}"
                data-id="${full?._id}"
              >
                ${feather.icons["edit"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Edit
              </a>
              `;

            const deleteHtml = `
              <a
                href="javascript:;"
                class="dropdown-item text-danger ${this.DELETE_CLASS}"
                data-id="${full?._id}"
              >
                ${feather.icons["trash-2"].toSvg({
                  class: "font-small-4 mr-50 text-danger",
                })}
                Delete
              </a>
              `;

            return `
            <div class="d-inline-flex">
              <a
                class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary"
                data-toggle="dropdown"
              >
                Pilihan
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>

              <div class="dropdown-menu dropdown-menu-right">

              ${
                ["*", "read_schedule"].some((r) => this.userRole.includes(r))
                  ? seeScheduleHtml
                  : ""
              }

              ${
                ["*", "read_student"].some((r) => this.userRole.includes(r))
                  ? seeStudentHtml
                  : ""
              }

              ${
                ["*", "edit"].some((r) => this.userRole.includes(r))
                  ? editHtml
                  : ""
              }

              ${
                ["*", "delete"].some((r) => this.userRole.includes(r))
                  ? deleteHtml
                  : ""
              }

              </div>

            </div>`;
          },
        },
      ].filter(Boolean),
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label d-flex"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          extend: "collection",
          className: "btn btn-outline-secondary dropdown-toggle mr-2",
          text: `${feather.icons["share"].toSvg({
            class: "font-small-4 mr-50",
          })} Export`,
          buttons: [
            {
              extend: "excel",
              text:
                feather.icons["file"].toSvg({ class: "font-small-4 mr-50" }) +
                "Excel",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6] },
            },
            {
              extend: "pdf",
              text:
                feather.icons["clipboard"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Pdf",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6] },
            },
          ],
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
            $(node).parent().removeClass("btn-group");
            setTimeout(function () {
              $(node)
                .closest(".dt-buttons")
                .removeClass("btn-group")
                .addClass("d-inline-flex");
            }, 50);
          },
        },
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Tambah Kelas Baru",
          className: `create-new btn btn-primary ${
            ["*", "create"].some((r) => this.userRole.includes(r))
              ? ""
              : "d-none"
          }`,
          attr: {
            "data-toggle": "modal",
            "data-target": "#modals-slide-in",
          },
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
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

    this.table
      .on("order.dt search.dt", () => {
        this.table
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each((cell, i) => (cell.innerHTML = i + 1));
      })
      .draw();

    const rowLength = this.table.data().count();
    const tableScrollTbody = $(
      ".dataTables_scroll .dataTables_scrollBody tbody"
    );
    if (rowLength < 5) {
      tableScrollTbody.height("200px");
    }
  }

  replaceTableData(classes) {
    this.table.clear();
    this.table.rows.add(classes);
    this.table.draw();
  }

  activateTableFeatures() {
    this.activateTableClassTypeFilter();
    this.activateTableYearFilter();
    this.activateTableAction();
    this.activateAddNewModal();
  }

  async reloadTable() {
    this.classes = await this.fetchData();
    this.years = this.getClassYears();
    if (!this.isClassTypeAndYearFilterLoaded()) {
      this.activateTableClassTypeFilter();
      this.activateTableYearFilter();
    }
    this.refreshClassBranchData();
    this.refreshSummary(this.getClassesByYear());
  }

  activateTableClassTypeFilter() {
    this.initTableClassTypeFilter();
    this.listenTableClassTypeFilter();
  }

  activateTableYearFilter() {
    this.initTableYearFilter();
    this.listenTableYearFilter();
  }

  initTableYearFilter() {
    const html = `
      <div class="align-items-center" id="${this.YEAR_FILTER_CONTAINER_ID}">
        <label for="basicInput" class="">
          Tahun Penyelenggaraan
        </label>
        <select
          class="select2-size-sm form-control form-control-lg"
          id="${this.YEAR_FILTER_ID}"
        >
          ${this.years.map(
            (v) =>
              `<option
                  value="${v}" ${this.selectedYear == v ? "selected" : ""}
                >
                ${v}
              </option>`
          )}
        </select>
      </div>`;

    const dom = document.querySelector("div.head-label");
    dom.innerHTML += html;
  }

  initTableClassTypeFilter() {
    const html = `
    <div class="align-items-center mr-1">
      <label for="basicInput" class="">
        Tipe Kelas
      </label>
      <select class="select2-size-sm form-control form-control-lg" id="${this.CLASS_TYPE_FILTER_ID}">
        <option value="branch-classroom">Kelas Cabang</option>
        <option value="shared-classroom">Kelas Dibagikan</option>
      </select>
    </div>`;

    const dom = document.querySelector("div.head-label");
    dom.innerHTML += html;
  }

  listenTableYearFilter() {
    const self = this;
    const dom = document.getElementById(this.YEAR_FILTER_ID);
    dom.addEventListener("change", (event) => {
      if (self.selectedClassType === "branch-classroom") {
        this.selectedYear = event.target.value;
        this.refreshClassBranchData();
        this.refreshSummary(this.getClassesByYear());
      }
    });
  }

  listenTableClassTypeFilter() {
    const self = this;
    $(document).on(
      "change",
      `#${this.CLASS_TYPE_FILTER_ID}`,
      async function (event) {
        this.selectedClassType = event.target.value;
        if (this.selectedClassType === "shared-classroom") {
          document
            .getElementById(self.YEAR_FILTER_CONTAINER_ID)
            .classList.add("d-none");
          self.refreshTableWithSharedClassroomData();
          self.table.columns([-1]).visible(false, false);
          self.table.columns.adjust().draw(false); // adjust column sizing and redraw
        } else {
          document
            .getElementById(self.YEAR_FILTER_CONTAINER_ID)
            .classList.remove("d-none");
          this.classes = await self.fetchData();
          self.refreshClassBranchData();
          self.refreshSummary(self.getClassesByYear());
          self.table.columns([-1]).visible(true, true);
          self.table.columns.adjust().draw(false); // adjust column sizing and redraw
        }
      }
    );
  }

  refreshTableBySelectedYear() {
    this.replaceTableData(this.getClassesByYear());
  }

  async refreshTableWithSharedClassroomData() {
    const data = await this.fetchSharedClassroom();
    const newData = [];
    data.forEach((e, i) => {
      e.classrooms.count_member = e.count_member;
      e.classrooms.branch_name =
        this.branches.find((b) => e.classrooms.branch_code == b.code)?.name ??
        "-";
      newData.push(e.classrooms);
    });
    this.replaceTableData(newData);
    this.refreshSummary(newData);
  }

  activateTableAction() {
    this.listenShowSchedule();
    this.listenShowClassMember();
    this.listenShowClassMemberScore();
    this.listenEdit();
    this.listenDelete();
  }

  listenShowClassMember() {
    const self = this;

    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.SHOW_STUDENT_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowClassMember(id);
      }
    );

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.SHOW_STUDENT_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowClassMember(id);
      }
    );
  }

  listenShowClassMemberScore() {
    const self = this;

    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.SHOW_STUDENT_SCORES_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowClassMemberScore(id);
      }
    );

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.SHOW_STUDENT_SCORES_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowClassMemberScore(id);
      }
    );
  }

  listenShowSchedule() {
    const self = this;

    // In Table
    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.SHOW_SCHEDULE_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowSchedule(id);
      }
    );

    // In Modal
    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.SHOW_SCHEDULE_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShowSchedule(id);
      }
    );
  }

  redirectToShowSchedule(id) {
    window.location.href = `/pembelajaran/jadwal/${id}`;
  }

  redirectToShowClassMember(id) {
    window.location.href = `/pembelajaran/kelas/${id}/members`;
  }

  redirectToShowClassMemberScore(id) {
    window.location.href = `/pembelajaran/kelas/${id}/members/scores`;
  }

  listenEdit() {
    const self = this;

    // In Table
    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.EDIT_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToEdit(id);
      }
    );

    // In Modal
    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.EDIT_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToEdit(id);
      }
    );
  }

  redirectToEdit(id) {
    window.location.href = `/pembelajaran/kelas/edit/${id}`;
  }

  listenDelete() {
    const self = this;

    // In Table
    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.DELETE_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        const isConfirm = confirm("Hapus Kelas Ini?");
        if (!isConfirm) return;
        self.fetchDelete(id);
      }
    );

    // In Modal
    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.DELETE_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        const isConfirm = confirm("Hapus Kelas Ini?");
        if (!isConfirm) return;
        self.fetchDelete(id);
      }
    );
  }

  fetchDelete(id) {
    $.ajax({
      url: `/api/learning/classroom/${id}`,
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": this.getCsrf() },
      success: async () => {
        await this.reloadTable();
        $(".modal").modal("hide");
        toastr.success("Sukses!", "Hapus Kelas Sukses", {
          closeButton: true,
          tapToDismiss: false,
          timeOut: 3000,
        });
      },
      error: async () => {
        toastr.error("Gagal!", "Hapus Kelas Gagal", {
          closeButton: true,
          tapToDismiss: false,
          timeOut: 3000,
        });
      },
    });
  }

  activateAddNewModal() {
    this.listenAddNewModalClosed();
    this.listenAddNew();
  }

  listenAddNewModalClosed() {
    $("#modals-slide-in").on("hidden.bs.modal", () => {
      $("#modals-slide-in .ajax-error").addClass("d-none");
      $("#modals-slide-in input").val("");
      $("#modals-slide-in option").attr("selected", false);
    });
  }

  disableAddNewSubmitButton() {
    const dom = document.querySelector(`.${this.SUBMIT_BUTTON_CLASS}`);
    dom.setAttribute("disabled", true);
    dom.innerHTML = "Menyimpan...";
  }

  enableAddNewSubmitButton() {
    const dom = document.querySelector(`.${this.SUBMIT_BUTTON_CLASS}`);
    dom.removeAttribute("disabled");
    dom.innerHTML = "Simpan";
  }

  listenAddNew() {
    const self = this;
    const dom = document.querySelector(`.${this.SUBMIT_BUTTON_CLASS}`);
    dom.addEventListener("click", async () => {
      const payload = {
        title: $("#title").val(),
        description: $("#description").val(),
        year: $("#year").val(),
        quota: $("#quota").val(),
        product_id: $("#product_id").val() ?? 1,
        status: $("#status").val(),
        tags: $("#tags").val(),
        is_online: $("#is_online:checked").length > 0 ? true : false,
      };
      if (this.isUserAdmin()) {
        payload.branch_code = $("#branch_code")?.val() ?? null;
      }
      self.disableAddNewSubmitButton();
      $.ajax({
        url: "/api/learning/classroom",
        method: "POST",
        data: payload,
        headers: { "X-CSRF-TOKEN": this.getCsrf() },
        success: async (data) => {
          if (data?.data) {
            await this.reloadTable();
            $(".modal").modal("hide");
            $("#description").val("");
            $("#branch_code").val("").trigger("change");
            $("#tags").empty().trigger("change");
            $("#status").val("").trigger("change");
            $("#is_online").prop("checked", false);
            $("#product_id").val("").trigger("change");
            toastr.success("Sukses!", "Menambah Kelas Sukses", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            });
          }
          self.enableAddNewSubmitButton();
        },
        error: async (data) => {
          if (data.status == 422) {
            Object.entries(data.responseJSON.errors).forEach(([key, value]) => {
              const inputDOM = $(`#${key}`);
              inputDOM.addClass("is-invalid");

              const errorDOM = $(`#error-${key}`);
              errorDOM.html(value[0] ?? "");
              errorDOM.removeClass("d-none");
            });
            self.enableAddNewSubmitButton();
            return;
          }
          toastr.error("Gagal!", "Menambah Kelas Gagal", {
            closeButton: true,
            tapToDismiss: false,
            timeOut: 3000,
          });
          self.enableAddNewSubmitButton();
        },
      });
    });
  }

  getBadge(status) {
    switch (status) {
      case "ONGOING":
        return {
          text: "Sedang Berlangsung",
          icon: "activity",
          color: "primary",
        };
      case "ENDED":
        return {
          text: "Selesai",
          icon: "check",
          color: "success",
        };
      case "NOT_ACTIVE":
        return {
          text: "Tidak Aktif",
          icon: "x",
          color: "warning",
        };
      default:
        return { text: "Tidak Diketahui", icon: "x" };
    }
  }

  getClassYears() {
    const years = [
      ...new Set((this.classes ?? []).map((c) => c.year)).add(
        new Date().getFullYear()
      ),
    ];
    const sorted = years.sort((a, b) => b - a);
    return sorted;
  }

  getClassesByYear(year = this.selectedYear) {
    return (this.classes ?? []).filter((c) => c.year == year);
  }

  async fetchData() {
    try {
      const branch_code =
        typeof this.getUserBranchCode() === "object"
          ? this.getUserBranchCode()["mergedString"]
          : this.getUserBranchCode();
      const url =
        this.isUserAdmin() ||
        (this.getUserBranchCode() === "PT0000" && !this.isUserMentor())
          ? `/api/learning/classroom`
          : `/api/learning/classroom/by-branch-codes/${branch_code}`;
      const response = await fetch(url);
      const data = await response.json();
      if (this.canShowAllClassroom) return data?.data;
      if (this.isUserMentor() && !this.isBranchAdmin()) {
        const branchClasses = data.data.filter((e, i) => {
          return this.getUserBranchCode()["original"].includes(e.branch_code);
        });

        const scheduleClasses = data.data.filter((e, i) => {
          return Array.isArray(this.getUserBranchCode()["schedule"])
            ? this.getUserBranchCode()["schedule"].includes(e.branch_code) &&
                e.teacher_ids.includes(this.getUserSSOID())
            : Object.values(this.getUserBranchCode()["schedule"]).includes(
                e.branch_code
              ) && e.teacher_ids.includes(this.getUserSSOID());
        });
        const classes = branchClasses.concat(scheduleClasses);
        const setClasses = [...new Set(classes)];
        return setClasses;
      }
      return data?.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchSharedClassroom() {
    try {
      const response = await fetch(
        `/api/learning/classroom/shared/by-sso-id/${this.getUserSSOID()}`
      );
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchBranch() {
    try {
      const response = await fetch(`/api/branch/all`);
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async loadBranches() {
    const event = new CustomEvent("branchesFetched");
    this.branches = await this.fetchBranch();
    document.dispatchEvent(event);
  }

  refreshClassBranchData() {
    const event = new CustomEvent("branchesFetched");
    document.dispatchEvent(event);
  }

  listenBranchesFetched() {
    document.addEventListener("branchesFetched", (event) => {
      this.classes.forEach((c, i) => {
        this.classes[i].branch_name =
          this.branches.find((b) => c.branch_code == b.code)?.name ?? "-";
      });
      // this.replaceTableData(this.classes);
      this.refreshTableBySelectedYear();
    });
  }

  async fetchSummary() {
    try {
      const query = new URLSearchParams({ year: this.selectedYear });
      const url = `/api/learning/classroom/summary?${query}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  getUserRoles() {
    const dom = document.getElementById("allowed");
    return JSON.parse(dom.innerText);
  }

  isBranchNameVisible() {
    return this.isUserAdmin() || this.isUserMentor();
  }

  isUserAdmin() {
    const dom = document.getElementById("is_admin");
    return dom.innerText == "1";
  }

  isUserMentor() {
    const dom = document.getElementById("is_mentor");
    return dom.innerText == "1";
  }

  isBranchAdmin() {
    const dom = document.getElementById("is_branch_admin");
    return dom.innerText == "1";
  }

  canShowAllClassroom() {
    const dom = document.getElementById("can_show_all_classroom");
    return dom.innerText == "1";
  }

  getUserSSOID() {
    const dom = document.getElementById("sso_id");
    return dom.innerText;
  }

  getUserBranchCode() {
    const dom = document.getElementById("user_branch_code");
    return JSON.parse(dom.innerText);
  }

  isUserHasMultipleBranchCode() {
    return (
      document.getElementById("is_user_has_multiple_branch_code").innerText ==
      "1"
    );
  }

  isClassTypeAndYearFilterLoaded() {
    const classTypeElement = document.getElementById(
      `${this.CLASS_TYPE_FILTER_ID}`
    );
    const yearElement = document.getElementById(`${this.YEAR_FILTER_ID}`);
    const isElementLoaded = classTypeElement && yearElement;
    return isElementLoaded;
  }

  removeUserCreateRole() {
    this.userRole = this.userRole.filter((e) => e != "create");
  }
}

const dt = new ClassesDataTable();
dt.init();
