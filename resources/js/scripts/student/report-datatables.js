$(function () {
  "use strict";

  var dt_basic_table = $("#report-table"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  let path = window.location.pathname;
  let trimmedPath = path.replace(/^\W+/, "");
  let splittedPath = trimmedPath.split("/");
  let studentId = splittedPath[2];

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // DataTable with buttons
  // --------------------------------------------------------------------
  function reqData() {
    return $.ajax({
      url: "/api/students/" + studentId + "/result",
      data: params,
      method: "GET",
    });
  }

  async function initRegulerTable() {
    try {
      const { data } = await reqData();
      const columns = [
        { data: null },
        { data: "_id" },
        { data: null }, // used for sorting so will hide this column
        { data: "title" },
        { data: "start" },
        { data: "end" },
        { data: "doneInterval" }
      ];

      const columnDefs = [
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
          orderable: false,
        },
        {
          targets: 2,
          visible: false,
        },
        {
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `${data} kali`;
          },
        },
      ];

      if (data[0]) {
        const firstRow = data[0];

        firstRow.score.forEach((value, index) => {
          columns.push({ data: `score.${index}.score` });
          columnDefs.push({
            targets: columns.length - 1,
            orderable: false,
            defaultContent: "0",
          });
        });
      }

      columns.push(
        ...[
          { data: "total_score" },
          { data: "status_text" },
          { data: "repeat" },
        ]
      );

      var dt_basic = dt_basic_table.DataTable({
        data: data,
        columns: columns,
        columnDefs: columnDefs,
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
                return "Detail Data Raport";
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
    } catch (err) {
      console.log(err);
    }
  }

  async function initTKACampuranTable() {
    try {
      var dt_basic = dt_basic_table.DataTable({
        dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        displayLength: 7,
        lengthMenu: [7, 10, 25, 50, 75, 100],
        buttons: [],
        language: {
          paginate: {
            // remove previous & next text from pagination
            previous: "&nbsp;",
            next: "&nbsp;",
          },
        },
      });

      // dt_basic
      //   .on("order.dt search.dt", function () {
      //     dt_basic
      //       .column(1, { search: "applied", order: "applied" })
      //       .nodes()
      //       .each(function (cell, i) {
      //         cell.innerHTML = i + 1;
      //       });
      //   })
      //   .draw();
    } catch (err) {
      console.log(err);
    }
  }

  if (params.program !== "tka-campuran") {
    initRegulerTable();
  } else {
    initTKACampuranTable();
  }
});
