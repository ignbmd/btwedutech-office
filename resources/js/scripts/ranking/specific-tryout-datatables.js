$(async function () {
  "use strict";
  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  const getTryoutSchedules = async () => {
    const response = await fetch("/api/internal/code-tryout/schedule");
    const data = await response.json();
    return data?.data ?? [];
  };

  const recalculateIrtHtml = (tryoutCode) => {
    if (!tryoutSchedules || !tryoutSchedules[tryoutCode]) return "";
    if (tryoutSchedules[tryoutCode]["calculation_status"] === "GENERATING") {
      return /* html */ `
      <button type="button" class="btn btn-flat-transparent dropdown-item w-100" href="#">
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Nilai akhir sedang dikalkulasi ...
      </button>`;
    }
    return /* html */ `
    <a class="btn btn-flat-transparent dropdown-item w-100" href="/ranking/specific-tryout/${tryoutCode}/recalculate-irt" onclick="this.classList.add('disabled')">
      ${feather.icons["award"].toSvg({
        class: "font-small-4",
      })} Rekalkulasi nilai akhir IRT
    </a>`;
  };

  const rankingIrtHtml = (tryoutCode, taskId) => {
    if (!tryoutSchedules || !tryoutSchedules[tryoutCode]) return "";
    return /* html */ `
    <a class="btn btn-flat-transparent dropdown-item w-100" href="/ranking/show-irt/${taskId}">
      ${feather.icons["eye"].toSvg({
        class: "font-small-4",
      })} Lihat Ranking IRT
    </a>`;
  };
  const tryoutSchedules = await getTryoutSchedules();

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      processing: true,
      serverSide: true,
      ajax: `/api/tryout/specific/sections`,
      columns: [
        { data: null },
        { data: "id" },
        { data: null },
        { data: "name" },
        { data: "type" },
        { data: "alias" },
        { data: "kode_kupon" },
        { data: "date" },
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
          render: function (data, type, full, meta) {
            if (data === "to_intensif") return "TO Intensif";
            else if (data === "to_tatapmuka") return "TO Tatapmuka";
            else if (data === "to_sosialisasi") return "TO Sosialisasi";
            else if (data === "to_khusus") return "TO Khusus";
            else return "-";
          },
        },
        {
          targets: 5,
          orderable: false,
        },
        {
          targets: 6,
          orderable: false,
        },
        {
          targets: 7,
          orderable: false,
          defaultContent: "-",
        },
        {
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const taskId = full["id_tugas"];
            const tryoutCode = full["kode_kupon"];
            const programSlug = full["slug"];
            const specificProgramSlugs = ["tps", "tka-saintek", "tka-soshum"];
            const isSpecificTryout = specificProgramSlugs.includes(programSlug);
            const html = /* html */ `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                Pilihan
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/ranking/show/${taskId}">
                  ${feather.icons["eye"].toSvg({
                    class: "font-small-4",
                  })} Lihat Ranking
                </a>
                ${isSpecificTryout ? rankingIrtHtml(tryoutCode, taskId) : ""}
                ${isSpecificTryout ? recalculateIrtHtml(tryoutCode) : ""}
              </div>
            </div>`;
            return html;
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
