$(function () {
  "use strict";

  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {
    const addRadioOptionChangeHandler = function () {
      $(".presence-radio").on("change", function (e) {
        const radioValue = e.target.value;
        const descriptionInputTargetId = e.target.dataset.target;
        const defaultDescriptionTextEl = $(
          `#default-${descriptionInputTargetId}`
        );
        const descriptionInputEl = $(`#${e.target.dataset.target}`);

        if (radioValue === "0") {
          descriptionInputEl.addClass("d-block");
          defaultDescriptionTextEl.addClass("d-none");
        } else {
          descriptionInputEl.removeClass("d-block");
          defaultDescriptionTextEl.removeClass("d-none");
        }
      });
    };

    var dt_basic = dt_basic_table.DataTable({
      ajax: assetPath + "data/table-datatable.json",
      columns: [
        { data: "responsive_id" },
        { data: "id" },
        { data: "id" }, // used for sorting so will hide this column
        { data: "title" },
        { data: "" },
        { data: "" },
        { data: "created_at" },
      ],
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 2,
          targets: 0,
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
          // Name and post
          targets: 3,
          responsivePriority: 4,
          render: function (data, type, full, meta) {
            var $row_output = `<div class="d-flex justify-content-left align-items-center">
              <div class="d-flex flex-column">
              <span class="emp_name text-truncate font-weight-bold">
                ${data}
              </span>
              </div>
              </div>`;

            return $row_output;
          },
        },
        {
          // Label
          targets: -3,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
            <div class="d-flex">
              <div class="custom-control custom-radio mr-2">
                <input
                  type="radio"
                  id="attend${full.id}"
                  name="presence_${full.id}"
                  class="custom-control-input presence-radio"
                  data-target="description${full.id}"
                  value="1"
                >
                <label class="custom-control-label" for="attend${full.id}">Hadir</label>
              </div>
              <div class="custom-control custom-radio">
                <input
                  type="radio"
                  id="notAttend${full.id}"
                  name="presence_${full.id}"
                  class="custom-control-input presence-radio"
                  data-target="description${full.id}"
                  value="0"
                >
                <label class="custom-control-label" for="notAttend${full.id}">Tidak Hadir</label>
              </div>
            </div>`;
          },
        },
        {
          responsivePriority: 1,
          targets: -2,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
                <p id="default-description${full.id}" class="text-center">-</p>
                <input
                  type="text"
                  class="form-control d-none"
                  id="description${full.id}"
                  placeholder="Contoh: Sakit, Izin, dll"
                  required
                >
            `;
          },
        },
      ],
      paging: false,
      info: false,
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 50,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Absensi" + data["title"];
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
      initComplete: addRadioOptionChangeHandler,
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

    dt_basic.on("load", function () {
      console.log("drawed");
    });
  }

  // On Change Radio Button
  $("#attend1").on("change", function (e) {
    console.log(e);
  });

  // Add New record
  // ? Remove/Update this code as per your requirements ?
  var count = 101;
  $(".data-submit").on("click", function () {
    var $new_name = $(".add-new-record .dt-full-name").val(),
      $new_post = $(".add-new-record .dt-post").val(),
      $new_email = $(".add-new-record .dt-email").val(),
      $new_date = $(".add-new-record .dt-date").val(),
      $new_salary = $(".add-new-record .dt-salary").val();

    if ($new_name != "") {
      dt_basic.row
        .add({
          responsive_id: null,
          id: count,
          full_name: $new_name,
          post: $new_post,
          email: $new_email,
          start_date: $new_date,
          salary: "$" + $new_salary,
          status: 5,
        })
        .draw();
      count++;
      $(".modal").modal("hide");
    }
  });

  // Delete Record
  $(".datatables-basic tbody").on("click", ".delete-record", function () {
    dt_basic.row($(this).parents("tr")).remove().draw();
  });
});
