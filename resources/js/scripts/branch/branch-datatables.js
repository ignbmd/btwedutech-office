$(function () {
  "use strict";

  var branchTableEl = $("#branch-table");

  if (branchTableEl.length) {
    const branchDtTable = branchTableEl.DataTable({
      ajax: "/api/branch/all",
      columns: [
        { data: null },
        { data: "createdAt" }, // used for sorting so will hide this column
        { data: "code" },
        { data: "name" },
        { data: "level" },
        { data: "createdAt" },
        { data: "" },
      ],
      columnDefs: [
        { className: "text-center", targets: 5 },
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          defaultContent: "",
        },
        {
          targets: 1,
          visible: false,
        },
        {
          targets: 2,
          orderable: false,
          render: function (data, type, full, meta) {
            return `<span class="badge badge-success">${data}</span>`;
          },
        },
        {
          targets: 3,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <div class="d-flex align-items-center">
                ${feather.icons["globe"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                <span class="emp_name text-truncate font-weight-bold">${data}</span>
              </div>
            `;
          },
        },
        {
          targets: 4,
          orderable: false,
          render: function (data, type, full, meta) {
            let badge = {};
            if (data === "PV") {
              badge = { color: "light-primary", text: "Provinsi" };
            } else if (data === "KB") {
              badge = { color: "light-success", text: "Kabupaten" };
            }
            return `
              <span class="badge badge-${badge.color}">
                ${badge.text}
              </span>
            `;
          },
        },
        {
          targets: 5,
          orderable: false,
          render: function (data, type, full, meta) {
            return moment(data).format("DD MMM YYYY");
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                  Pilihan
                  ${feather.icons["chevron-down"].toSvg({
                    class: "font-small-4",
                  })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a href="/cabang/detail/${
                    full.code
                  }" class="btn btn-flat-transparent dropdown-item">
                    ${feather.icons["zoom-in"].toSvg({
                      class: "font-small-4",
                    })}
                    Lihat Detail Cabang
                  </a>
                  <a href="/cabang/metode-pembayaran/${
                    full.code
                  }" class="btn btn-flat-transparent dropdown-item">
                    ${feather.icons["credit-card"].toSvg({
                      class: "font-small-4",
                    })}
                    Lihat Metode Pembayaran Cabang
                  </a>
                </div>
              </div>`;
          },
        },
      ],
      order: [[1, "desc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Buat Cabang Baru",
          className: "create-new btn btn-primary",
          action: () => {
            window.location = "/cabang/tambah";
          },
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Details of Kelas " + data["title"];
            },
          }),
          type: "column",
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== "" // ? Do not show row in modal popup if title is blank (for check box)
                ? `<tr
                      data-dt-row="${col.rowIndex}"
                      data-dt-column="${col.columnIndex}"
                    >
                    <td>
                      ${col.title} :
                    </td>
                    <td>
                      ${col.data}
                    </td>
                  </tr>`
                : "";
            }).join("");

            return data ? $('<table class="table"/>').append(data) : false;
          },
        },
      },
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });
  }
});
