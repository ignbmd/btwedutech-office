$(function () {
  "use strict";

  var dt_basic_table = $("#branch-detail-users-table"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable with buttons
  // --------------------------------------------------------------------
  const getIsBranchHasOwner = () => {
    const isHasOwner = document.querySelector('#isBranchHasOwner').innerText;
    return isHasOwner === 'true';
  }

  const isHasOwner = getIsBranchHasOwner();

  if (dt_basic_table.length) {
    const branchCode = getLastSegment();
    var dt_basic = dt_basic_table.DataTable({
      ajax: `/api/sso/branch-users/${branchCode}`,
      columns: [
        { data: null },
        { data: "created_at" }, // used for sorting so will hide this column
        { data: null },
        { data: "name" },
        { data: "roles" },
        { data: "nik" },
        { data: "phone" },
        { data: "gender" },
        { data: "address" },
        { data: "ktp_image" },
        { data: "" },
      ],
      columnDefs: [
        { type: "num", targets: 2 },
        { orderable: false, targets: [2, 3, 4, 5, 6, 7, 8, 9] },
        { className: "text-center", targets: [4, 5, 6, 7, 8] },
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
          defaultContent: "",
        },
        {
          // ** Name
          targets: 3,
          render: function (data, type, full, meta) {
            const userImg = full["profile_image"];
            let avatarOutput;

            if (userImg) {
              avatarOutput = `
                <img
                  src="${userImg}"
                  alt="${full.name}"
                  class="object-contain"
                  width="32"
                  height="32"
                >
              `;
            } else {
              const name = full.name;

              let initials = name.match(/\b\w/g) || [];

              initials = (
                (initials.shift() || "") + (initials.pop() || "")
              ).toUpperCase();
              avatarOutput = `<span class="avatar-content">${initials}</span>`;
            }

            const row_output = `
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
          render: function (data, type, full, meta) {
            const userMainBranchCode = full["branch_code"].split(',')[0];
            const roleColor = {
              kepala_cabang: "primary",
              super_admin: "success",
              default: "secondary",
            };

            const roles = data.map(role => {
              return {
                type: role,
                text: `${role.split("_").join(" ")} ${ userMainBranchCode !== branchCode ? userMainBranchCode : ''}`,
              }
            });
            // const roleText = role.split("_").join(" ");
            return roles.map(role => (
              `<span class="badge badge-light-${
                roleColor[role.type] ?? roleColor["default"]
              } capitalize">
                ${role.text}
              </span>`
            )).join(' ');
          },
        },
        {
          targets: 5,
          render: function (data, type, full, meta) {
            return data ?? "-";
          },
        },
        {
          targets: 6,
          render: function (data, type, full, meta) {
            return data ?? "-";
          },
        },
        {
          // ** Gender
          targets: 7,
          render: function (data, type, full, meta) {
            const isMen = data === 1;
            const badgeColor = isMen ? "primary" : "warning";
            return `
              <span class="badge badge-light-${badgeColor}">
                ${isMen ? "Laki-laki" : "Perempuan"}
              </span>
            `;
          },
        },
        {
          targets: 8,
          render: function (data, type, full, meta) {
            return data ?? "-";
          },
        },
        {
          // Attachments
          targets: -2,
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
          // Actions
          targets: -1,
          orderable: false,
          responsivePriority: 8,
          render: function (data, type, full, meta) {
            return `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary" data-toggle="dropdown">
                  Pilih
                  ${feather.icons["chevron-down"].toSvg({
                    class: "font-small-4",
                  })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a href="/cabang/ubah-pengguna/${branchCode}/${
              full.id
            }" class="dropdown-item">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4 mr-50",
                  })}
                Edit</a>
              </div>
            </div>
          `;
          },
        },
      ],
      order: [[1, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text:
            `${feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" })} ${branchCode === 'PT0000' ? 'Tambah Pengguna' : isHasOwner ? "Tambah Pengguna Cabang" : "Tambah Kepala Cabang"}`,
          className: `create-new btn ${isHasOwner ? 'btn-primary' : 'btn-success'}`,
          action: () => {
            window.location = `/cabang/tambah-pengguna/${branchCode}`;
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
              return data["name"];
            },
          }),
          type: "column",
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== "" && !col.title.match(/^no$/i)
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
      initComplete: function (settings, json) {
        const deleteBtn = $("#delete-btn");

        if (deleteBtn.length) {
          deleteBtn.on("click", function (e) {
            console.log(e.target.dataset.userId);
            Swal.fire({
              title: "Warning!",
              text: "Yakin menghapus user ini?",
              icon: "warning",
              customClass: {
                confirmButton: "btn btn-danger",
              },
              confirmButtonText: "Hapus",
              buttonsStyling: false,
              preConfirm: function () {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve("success");
                  }, 1000);
                });
              },
            }).then(function (result) {
              if (result.value) {
                Swal.fire({
                  timer: 2000,
                  icon: "success",
                  title: "Deleted!",
                  text: "User berhasil dihapus",
                  showConfirmButton: false,
                });
              }
            });
          });
        }
      },
    });
    $("div.head-label").html('<h6 class="mb-0">Pengguna Cabang</h6>');

    dt_basic
      .on("order.dt search.dt", function () {
        dt_basic
          .column(2, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1;
            dt_basic.cell(cell).invalidate("dom");
          });
      })
      .draw();
  }
});
