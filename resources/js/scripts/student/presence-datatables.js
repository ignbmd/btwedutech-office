$(function () {
  "use strict";

  var dt_basic_table = $("#presence-table"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  let path = window.location.pathname;
  let trimmedPath = path.replace(/^\W+/, "");
  let splittedPath = trimmedPath.split("/");
  let studentId = splittedPath[2];

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      ajax: "/api/students/" + studentId + "/presence-log",
      columns: [
        { data: null },
        { data: "_id" },
        { data: null }, // used for sorting so will hide this column
        { data: "classroom_title" },
        { data: "presence" },
        { data: "comment" },
        { data: "created_at" },
      ],
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          defaultContent:""
        },
        {
          targets: 1,
          orderable: false,
        },
        {
          targets: 2,
          visible: false,
          defaultContent: ""
        },
        {
          targets: 4,
          orderable: false,
          render: function (data, type, full, meta) {
            const status = data;
            const badge =
              status === "ATTEND"
                ? { icon: "check", color: "success", text: "Hadir" }
                : { icon: "x", color: "danger", text: "Tidak Hadir" };

            return `
              <div class="badge badge-light-${badge.color}">
                ${feather.icons[badge.icon].toSvg({
                  class: "font-small-4 mr-25",
                })}
                <span>${badge.text}</span>
              </div>`;
          },
        },
        {
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            return new Date(data).toLocaleString("sv-SE", {
              hour12: false,
              hourCycle: "h24",
            });
          },
        },
      ],
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Data Presensi";
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
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });

    dt_basic
      .on("order.dt search.dt", function () {
        dt_basic
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1;
          });
      })
      .draw();
  }
});
