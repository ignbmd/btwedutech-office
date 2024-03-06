$(function () {
  "use strict";

  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  const is_user_pusat = document.getElementById('is_user_pusat').value;

  function indonesiaRupiahNumberFormat(value){
    let reverse = value.toString().split('').reverse().join(''),
    ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return `Rp. ${ribuan}`;
  }

  function fetchBranches() {
    return $.ajax({
      url: "/api/branch/all",
      method: "GET",
      success: function (response) {
        // Populate branches data
        const branches = $.map(response.data, function(obj) {
          obj.id = obj.code;
          obj.text = `(${obj.code}) ${obj.name}`;

          return obj;
        });
        $('#branch_code').select2({
          data: branches
        });
      },
      complete: function () {
        $('#branch_code').attr('disabled', false);
      }
    });
  }

  async function fetchCoa() {
    return $.ajax({
      url: "/api/finance/coa",
      method: "GET"
    });
  }

  fetchBranches();

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      ajax: "/api/finance/coa",
      method: "GET",
      dataType: "json",
      columns: [
        { data: null },
        { data: "id" },
        { data: null }, // used for sorting so will hide this column
        { data: "account_code" },
        { data: "name" },
        { data: "branch_code" },
        { data: "init_balance" },
        { data: "" },
        { data: ""},
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
          targets: 4,
          orderable: false,
        },
        {
          targets: 6,
          orderable: false,
          render: function (data, type, full, meta) {
            return indonesiaRupiahNumberFormat(data);
          }
        },
        {
          targets: 7,
          orderable: false,
          render: function (data, type, full, meta) {
            const accountStatus = full['status'];
            const badgeColor =
              accountStatus
                ? "light-success"
                : "light-warning"
            const statusText =
              accountStatus
                ? "Aktif"
                : "Tidak Aktif"

          return `
            <div class="badge badge-pill badge-${badgeColor}">
              <span>${statusText}</span>
            </div>`;
          }
        },
        {
          targets: -1,
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            const id = full["id"];
            const is_protected = full["is_protected"];

            return !is_protected ? `
              <div class="d-inline-flex">
                <a class="pr-1 text-white btn btn-sm btn-gradient-primary" href="/coa/edit/${id}">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4",
                  })}
                  Edit
                </a>
              </div>
            ` : "Akun ini diproteksi";
          },
        }
      ],
      dom: '<"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Akun";
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
      .on("order.dt search.dt draw.dt", function () {
        dt_basic
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1;
          });
      })
      .draw();
  }

  if(!is_user_pusat) {
    (async () => {
      const coa = await fetchCoa();
      const auth_user_branch_code = document.getElementById('auth_user_branch_code').value;
      const filteredCoa = coa.data.filter((value) => value.branch_code == auth_user_branch_code);
      dt_basic.clear();
      dt_basic.rows.add(filteredCoa);
      dt_basic.draw();
    })();
  }

  // Event handlers
  // --------------------------------------------------------------------
  $('#branch_code').on('change', async function(event) {
    const coa = await fetchCoa(event.target.value);
    const filteredCoa = coa.data.filter((value) => value.branch_code == event.target.value);
    dt_basic.clear();
    if(event.target.value != "") dt_basic.rows.add(filteredCoa);
    else dt_basic.rows.add(coa.data);
    dt_basic.draw();
  });
});
