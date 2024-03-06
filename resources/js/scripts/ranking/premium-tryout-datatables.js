$(function () {
  "use strict";
  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      processing: true,
      serverSide: true,
      ajax: `/api/tryout/premium/sections`,
      columns: [
        { data: null },
        { data: "id" },
        { data: null },
        { data: "title" },
        { data: "date" },
        { data: "alias" },
        { data: "" },
      ],
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          searchable: false,
          responsivePriority: 2,
          targets: 0,
          defaultContent: "",
        },
        {
          targets: 1,
          orderable: false,
          searchable: false,
        },
        {
          targets: 2,
          visible: false,
          searchable: false,
          defaultContent: "",
        },
        {
          targets: 3,
          orderable: false,
          searchable: true,
          responsivePriority: 1,
        },
        {
          // Packages
          targets: 4,
          orderable: false,
        },
        {
          targets: 5,
          orderable: false,
        },
        {
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const taskId = full['id_tugas'];
            return /*html*/ `
              <div class="d-inline-flex">
                <a class="pr-1 text-primary btn btn-sm btn-primary" href="/ranking/show/${taskId}">
                  ${feather.icons["eye"].toSvg({
                    class: "font-small-4",
                  })} Lihat Ranking
                </a>
              </div>`;
          },
        },
      ],
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Ranking Tryout";
            },
          }),
          type: "column",
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title && !col.title.match(/^no$/i) // ? Do not show row in modal popup if title is blank (for check box)
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
      buttons: [],
      language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });

    dt_basic
      .on("order.dt search.dt draw.dt", function () {
        var info = dt_basic.page.info();
        dt_basic
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1 + info.start;
          });
      })
      .draw();
  }
});
