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
    var dt_basic = dt_basic_table.DataTable({
      ajax: assetPath + "data/teacher-datatable.json",
      columns: [
        { data: "responsive_id" },
        { data: "id" },
        { data: "id" }, // used for sorting so will hide this column
        { data: "name" },
        { data: "email" },
        { data: "" },
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
            let user_img = full['avatar'];
            let name = full['name'];
            let post = full['bio'];
            let state = '';
            let output = '';

            if (user_img) {
              // For Avatar image
              output =
                `<img src="${assetPath}images/portrait/small/${user_img}" alt="Avatar" width="32" height="32">`;
            } else {
              // For Avatar badge
              let stateNum = full['status'];
              let states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
              let initials = name.match(/\b\w/g) || [];

              state = states[stateNum];
              name = full['name'];

              initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
              output = `<span class="avatar-content">${initials}</span>`;
            }

            let colorClass = user_img === '' ? `bg-light-${state}` : '';
            // Creates full output for row
            let row_output =
              `<div class="d-flex justify-content-left align-items-center">
                <div class="avatar ${colorClass} mr-1">
                  ${output}
                </div>
                <div class="d-flex flex-column">
                  <span class="emp_name text-truncate font-weight-bold">
                    ${name}
                  </span>
                  <small class="emp_post text-truncate text-muted">
                    ${post}
                  </small>
                </div>
              </div>`;

            return row_output;

            // var $row_output = `<div class="d-flex justify-content-left align-items-center">
            //   <div class="d-flex flex-column">
            //   <span class="emp_name text-truncate font-weight-bold">
            //     ${data}
            //   </span>
            //   </div>
            //   </div>`;

            // return $row_output;
          },
        },
        {
          // Label
          targets: 4,
          orderable: false
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary" data-toggle="dropdown">
                    Pilihan
                    ${feather.icons["chevron-down"].toSvg({
                      class: "font-small-4",
                    })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a href="javascript:;" class="dropdown-item">
                    ${feather.icons["edit"].toSvg({
                      class: "font-small-4 mr-50",
                    })}
                  Edit</a>
                  <a href="javascript:;" class="dropdown-item delete-record text-danger">
                    ${feather.icons["trash-2"].toSvg({
                      class: "font-small-4 mr-50 text-danger",
                    })}
                  Delete</a>
                </div>
              </div>`;
          },
        },
      ],
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          extend: "collection",
          className: "btn btn-outline-secondary dropdown-toggle mr-2",
          text:
            feather.icons["share"].toSvg({ class: "font-small-4 mr-50" }) +
            "Export",
          buttons: [
            {
              extend: "print",
              text:
                feather.icons["printer"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Print",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6, 7] },
            },
            {
              extend: "csv",
              text:
                feather.icons["file-text"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Csv",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6, 7] },
            },
            {
              extend: "excel",
              text:
                feather.icons["file"].toSvg({ class: "font-small-4 mr-50" }) +
                "Excel",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6, 7] },
            },
            {
              extend: "pdf",
              text:
                feather.icons["clipboard"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Pdf",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6, 7] },
            },
            {
              extend: "copy",
              text:
                feather.icons["copy"].toSvg({ class: "font-small-4 mr-50" }) +
                "Copy",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6, 7] },
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
            "Tambah Pengajar Baru",
          className: "create-new btn btn-primary",
          attr: {
            "data-toggle": "modal",
            "data-target": "#modals-slide-in",
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
              return "Detail " + data["title"];
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
