class ClassesDataTable {
  constructor() {
    this.highschools = [];
    this.provinces = [];
    this.regions = [];
    this.highSchoolType = null;
    this.selectedYear = new Date().getFullYear();
    this.table = null;
    this.DATATABLE_CLASS = "datatables-basic";
  }

  async init() {
    this.provinces = this.getProvinces();
    this.regions = this.getRegions();
    this.highSchoolType = this.getHighSchoolType();
    this.initTable();
    this.initEventListeners();
  }

  initTable() {
    const dom = $(`.${this.DATATABLE_CLASS}`);
    this.table = dom.DataTable({
      scrollX: true,
      processing: true,
      serverSide: true,
      ajax: `/api/highschools?type=${this.highSchoolType}`,
      columns: [
        { data: "name" },
        { data: "_id" },
        { data: "_id" }, // used for sorting so will hide this column
        { data: "name" },
        { data: "" }, // Provinsi
        { data: "" }, // Kabupaten/Kota
        { data: "" }, // Aksi
      ],
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
          // render: (data) => {
          //   const $html = `
          //   <div class="d-flex justify-content-left align-items-center">
          //     <div class="d-flex flex-column">
          //       <span class="emp_name text-truncate font-weight-bold">
          //         ${data}
          //       </span>
          //     </div>
          //   </div>`;
          //   return $html;
          // },
        },
        {
          targets: 4,
          responsivePriority: 1,
        },
        {
          targets: 4,
          orderable: false,
          render: (data, type, full, meta) => {
            const highSchoolLocationID = full["location_id"]
              ? full["location_id"]
              : null;
            const highSchoolRegion = highSchoolLocationID
              ? this.regions[highSchoolLocationID]
              : null;
            const highSchoolProvince = highSchoolRegion
              ? this.provinces[highSchoolRegion.parent_id]
              : null;
            return highSchoolProvince ? highSchoolProvince.name : "-";
          },
        },
        {
          targets: 5,
          orderable: false,
          render: (data, type, full, meta) => {
            const highSchoolLocationID = full["location_id"]
              ? full["location_id"]
              : null;
            const highSchoolRegion = highSchoolLocationID
              ? this.regions[highSchoolLocationID]
              : null;
            return highSchoolRegion ? highSchoolRegion.name : "-";
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const highSchoolID = full["_id"];

            let editHighSchoolDropdownItemHtml = `
              <a
                class="btn btn-flat-transparent dropdown-item w-100"
                href="/sekolah/edit/${highSchoolID}"
              >
                ${feather.icons["edit"].toSvg({
                  class: "font-small-4",
                })} Edit
              </a>
            `;

            let deleteHighSchoolDropdownItemHtml = `
            <button type="button" class="btn btn-flat-transparent dropdown-item w-100 text-danger delete-button" data-id="${highSchoolID}">
              ${feather.icons["trash"].toSvg({
                class: "font-small-4 text-danger",
              })} Hapus
            </button>`;

            let actionDropdownsHtml = `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                Pilih Aksi
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                ${editHighSchoolDropdownItemHtml}
              </div>
            </div>
            `;

            return actionDropdownsHtml;
          },
        },
      ],
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label d-flex"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Tambah Sekolah Baru",
          className: `create-new btn btn-primary`,
          attr: {
            "data-toggle": "modal",
            "data-target": "#modals-slide-in",
          },
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
          action: function (e, dt, button, config) {
            window.location = `${window.location.origin}/sekolah/tambah`;
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
      .on("order.dt search.dt draw.dt", () => {
        var info = this.table.page.info();
        this.table
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each((cell, i) => (cell.innerHTML = i + 1 + info.start));
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

  initEventListeners() {
    this.listenOnDeleteButtonClicked();
  }

  listenOnDeleteButtonClicked() {
    const self = this;
    $(document).on("click", ".delete-button", function (event) {
      const id = $(this).data("id");
      self.showConfirmationPopUp(id);
    });
  }

  showConfirmationPopUp(id) {
    Swal.fire({
      icon: "warning",
      title: "Konfirmasi",
      text: "Apa anda yakin ingin menghapus akun ini",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) this.deleteHighSchool(id);
    });
  }

  deleteHighSchool(highSchoolID) {
    const self = this;
    $.ajax({
      url: `/api/highschools/${highSchoolID}`,
      type: "DELETE",
      data: {
        _token: this.getCsrf(),
      },
      success: function (data) {
        if (data.success) self.showDeleteSuccessToast(data);
      },
      error: function () {
        self.showDeleteErrorToast();
      },
    });
  }

  showDeleteSuccessToast(data) {
    const self = this;
    toastr.success("Data berhasil dihapus", "Hapus akun berhasil", {
      timeOut: 1500,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/sekolah?type=${self.highSchoolType}`;
      },
    });
  }

  showDeleteErrorToast() {
    toastr.error(
      "Proses hapus akun gagal, silakan coba lagi nanti",
      "Terjadi kesalahan",
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      }
    );
  }

  replaceTableData(classes) {
    this.table.clear();
    this.table.rows.add(classes);
    this.table.draw();
  }

  async reloadTable() {
    this.classes = await this.fetchData();
    this.years = this.getClassYears();
    this.activateTableYearFilter();
    this.refreshTableBySelectedYear();
    // this.initSummary();
  }

  activateTableAction() {
    this.listenShowSchedule();
    this.listenShowClassMember();
    this.listenShowClassMemberScore();
    this.listenAssignReceivedModule();
    this.listenShareClassroom();
    this.listenShareClassroomUsers();
    this.listenEdit();
    this.listenDelete();
    this.listenAddClassMembersToClassroom();
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

  listenAssignReceivedModule() {
    const self = this;

    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.ASSIGN_RECEIVED_MODULE_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToAssignReceivedModule(id);
      }
    );

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.ASSIGN_RECEIVED_MODULE_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToAssignReceivedModule(id);
      }
    );
  }

  listenShareClassroom() {
    const self = this;

    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.SHARE_CLASSROOM_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShareClassroom(id);
      }
    );

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.SHARE_CLASSROOM_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShareClassroom(id);
      }
    );
  }

  listenShareClassroomUsers() {
    const self = this;

    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.SHARE_CLASSROOM_USERS_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShareClassroomUsers(id);
      }
    );

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.SHARE_CLASSROOM_USERS_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToShareClassroomUsers(id);
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

  listenAddClassMembersToClassroom() {
    const self = this;

    // In Table
    $(`.${self.DATATABLE_CLASS} tbody`).on(
      "click",
      `.${self.ADD_CLASS_MEMBERS_TO_CLASSROOM_CLASS}`,
      function () {
        const data = self.table.row($(this).parents("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToAddClassMembersToClassroom(id);
      }
    );

    // In Modal
    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.ADD_CLASS_MEMBERS_TO_CLASSROOM_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?._id;
        if (!id) return;
        self.redirectToAddClassMembersToClassroom(id);
      }
    );
  }

  redirectToShowSchedule(id) {
    window.location.href = `/pembelajaran/jadwal/${id}`;
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
        this.refreshBranchName();
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

  async loadBranches() {
    const event = new CustomEvent("branchesFetched");
    this.branches = await this.fetchBranch();
    document.dispatchEvent(event);
  }

  refreshBranchName() {
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

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  getHighSchoolType() {
    const dom = document.getElementById("high-school-type");
    return dom.innerText;
  }

  getRegions() {
    const dom = document.getElementById("regions");
    return JSON.parse(dom.innerText);
  }

  getProvinces() {
    const dom = document.getElementById("provinces");
    return JSON.parse(dom.innerText);
  }
}

const dt = new ClassesDataTable();
dt.init();
