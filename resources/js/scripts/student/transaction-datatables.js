$(function () {
  "use strict";
  var dt_basic_table = $("#transaction-table"),
    assetPath = "../../../app-assets/",
    transaction_status = $("#transaction-status");

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }
  let path = window.location.pathname;
  let trimmedPath = path.replace(/^\W+/, "");
  let splittedPath = trimmedPath.split("/");
  let studentId = splittedPath[2];

  let transactions = $.parseJSON($.ajax({
    url: "/api/students/" + studentId + "/transaction",
    dataType: "json",
    async: false,
  }).responseText);

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      data: transactions.data,
      columns: [
        { data: null },
        { data: "id" },
        { data: "id" }, // used for sorting so will hide this column
        { data: "title" },
        { data: "payment_status" },
        { data: "amount" },
        { data: "updated_at" },
      ],
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          defaultContent: ""
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
          targets: 4,
          orderable: false,
          render: function (data, type, full, meta) {
            const status = full.payment_status;
            const badgeColor =
              status === "settlement"
                ? "light-success"
                : status === "canceled"
                ? "light-warning"
                : status === "failed"
                ? "light-danger"
                : "light-secondary";
            const statusText =
              status === "settlement"
                ? "Lunas"
                : status === "canceled"
                ? "Dibatalkan"
                : status === "failed"
                ? "Gagal"
                : "Menunggu Konfirmasi";

            return `
              <div class="badge badge-pill badge-${badgeColor}">
                <span>${statusText}</span>
              </div>`;
          },
        },
        {
          targets: 5,
          orderable: false,
          render: function (data, type, full, meta) {
            return priceFormatter(data);
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
              return "Detail Data Transaksi";
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

    transaction_status.on("change", function() {
      let status = transaction_status.val();
      let filteredData = status ? transactions.data.filter(function(value, index) {
        return value.payment_status == status;
      }) : [...transactions.data];

      dt_basic.clear().draw();
      dt_basic.rows.add(filteredData);
      dt_basic.columns.adjust().draw();
    });
  }
});
