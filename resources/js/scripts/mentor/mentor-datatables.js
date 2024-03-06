$(function () {
  "use strict";

  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {

    const columns = [
      { data: null },
      { data: "id" },
      { data: null }, // used for sorting so will hide this column
      { data: "name" },
      { data:  "nik" },
      { data: "phone" },
      { data: "gender" },
      { data: "branch_code" },
      { data: null },
      { data: "address" },
      { data: "" },
    ];

    var dt_basic = dt_basic_table.DataTable({
      ajax: {
        url: "/api/mentor",
        dataSrc: ""
      },
      columns: columns,
      responsive: true,
      columnDefs: [
        {
          className: "control",
          orderable: false,
          searchable: false,
          visible: false,
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
          render: function (data, type, full, meta) {
            const userImg = full["profile_image"];
            const name = full["name"];

            let avatarOutput;
            let initials = name.match(/\b\w/g) || [];
            initials = (
              (initials.shift() || "") + (initials.pop() || "")
            ).toUpperCase();

            if (userImg) {
              const isImage = checkURL(userImg);
              if(isImage) avatarOutput = `<img src="${userImg}" alt="Avatar" width="32" height="32">`;
              else avatarOutput = `<span class="avatar-content">${initials}</span>`;
            } else {
              avatarOutput = `<span class="avatar-content">${initials}</span>`;
            }

            var row_output = `
              <div class="d-flex justify-content-left align-items-center">
                <div class="avatar bg-light-primary mr-1">
                  ${avatarOutput}
                </div>
                <div>
                <div class="d-flex flex-column">
                  <span class="emp_name text-truncate font-weight-bold">
                    ${full.name}
                  </span>
                  <small class="emp_post text-truncate text-muted">
                    ${full.email}
                  </small>
                </div>
                </div>
              </div>
            `;

            return row_output;
          },
        },
        {
          targets: 4,
          orderable: false,
          defaultContent: "-"
        },
        {
          targets: 5,
          orderable: false,
          defaultContent: "-"
        },
        {
          targets: 6,
          orderable: false,
          render: function (data, type, full, meta) {
            const gender = full.gender;
            const badgeColor =
              gender
                ? "light-success"
                : "light-warning"
            const genderText =
              gender
                ? "Laki-laki"
                : "Perempuan"

            return `
              <div class="badge badge-pill badge-${badgeColor}">
                <span>${genderText}</span>
              </div>`;
          },
        },
        {
          targets: 7,
          orderable: false,
          defaultContent: "-",
        },
        {
          targets: 8,
          orderable: false,
          render: function (data, type, full, meta) {
            if (!full.ktp_image && !full.npwp_image) return "-";
            return `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-outline-primary" data-toggle="dropdown">
                    Lihat
                    ${feather.icons["chevron-down"].toSvg({
                      class: "font-small-4",
                    })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  ${
                    full.ktp_image
                      ? `<a target="_blank" href="${full.ktp_image}" class="btn btn-flat-transparent dropdown-item w-100">
                      Lihat KTP
                    </a>`
                      : ""
                  }
                  ${
                    full.npwp_image
                      ? `<a target="_blank" href="${full.npwp_image}" class="btn btn-flat-transparent dropdown-item w-100">
                      Lihat NPWP
                    </a>`
                      : ""
                  }
                </div>
              </div>
            `;
          },
        },
        {
          targets: 9,
          orderable: false,
          defaultContent: "-"
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          responsivePriority: 8,
          render: function (data, type, full, meta) {
            return `
              <div class="d-inline-flex">
                <a href="/mentor/edit/${full.id}" class="pr-1 hide-arrow text-white btn btn-sm btn-gradient-primary">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4",
                  })}
                  Edit
                </a>
              </div>`;
          },
        },
      ],
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
              exportOptions: { columns: [3, 4, 5, 6] },
            },
            {
              extend: "csv",
              text:
                feather.icons["file-text"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Csv",
              className: "dropdown-item",
              exportOptions: { columns: [3, 4, 5, 6] },
            },
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
            "Tambah Mentor Baru",
          className: "create-new btn btn-primary mr-1",
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
          action: function (e, dt, button, config) {
            window.location = `${window.location.origin}/mentor/create`;
          },
        },
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Tambah Mentor Lama",
          className: "create-new btn btn-outline-info",
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
          action: function (e, dt, button, config) {
            window.location = `${window.location.origin}/mentor/legacy/create`;
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Mentor";
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
      .on("order.dt search.dt draw.dt", function () {
        dt_basic
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1;
          });
      })
      .draw();
      new $.fn.dataTable.FixedHeader( dt_basic );
  }
});
