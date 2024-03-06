$(function () {
  "use strict";
  var dt_basic_table = $(".datatables-basic"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable with buttons
  // --------------------------------------------------------------------
  const branch_code = document.getElementById("branch-code").value;
  const is_user_pusat = document.getElementById("is-user-pusat").value;
  const userRole = getUserAllowedRoleFromBlade();
  const studentPageAllowed = JSON.parse(
    document.getElementById("student-page-allowed").innerText
  );

  function getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  // function setButtonSyncState(element) {
  //   element.text = "Sinkronisasi data..."
  //   element.disabled = true
  // }

  // function setButtonSyncState(element) {
  //   element.text = "Sinkronisasi data..."
  //   element.disabled = true
  // }
  function checkURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }

  function handleSyncStudentToLearningService(student) {
    $.ajax({
      url: `/api/students/sync`,
      method: "POST",
      headers: { "X-CSRF-TOKEN": getCsrf() },
      data: {
        smartbtw_id: student.id,
        name: student.nama_lengkap,
        email: student.email,
        branch_code: student.kode_cabang,
        whatsapp_no: student.no_wa,
        photo: student.photo,
        address: student.alamat,
        parent_phone: student.hp_ortu,
      },
      success: () => {
        toastr.success("Sinkronisasi data siswa berhasil", "Berhasil!", {
          closeButton: true,
          tapToDismiss: false,
          timeOut: 3000,
        });
      },
      error: (err) => {
        toastr.error("Sinkronisasi data siswa gagal", "Terjadi Kesalahan!", {
          closeButton: true,
          tapToDismiss: false,
          timeOut: 3000,
        });
      },
    });
  }

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      processing: true,
      serverSide: true,
      ajax: `/api/students?branch_code=${branch_code}`,
      columns: [
        { data: null },
        { data: "smartbtw_id" },
        { data: null }, // used for sorting so will hide this column
        { data: "name" },
        { data: "name" },
        { data: "name" },
        { data: "name" },
        { data: "name" },
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
          // Name and email
          targets: 3,
          orderable: false,
          searchable: true,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            const userImg = full["photo"];
            const name = full["name"];

            let avatarOutput;
            let initials = name.match(/\b\w/g) || [];
            initials = (
              (initials.shift() || "") + (initials.pop() || "")
            ).toUpperCase();

            if (userImg) {
              const isImage = checkURL(userImg);
              if (isImage)
                avatarOutput = `<img src="${userImg}" alt="Avatar" width="32" height="32">`;
              else
                avatarOutput = `<span class="avatar-content">${initials}</span>`;
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
                  <span class="emp_name text-truncate font-weight-bold nama_lengkap">
                    ${full.name}
                  </span>
                  <small class="emp_post text-truncate text-muted email">
                    ${full.email}
                  </small>
                </div>
                <span class="badge badge-light-secondary mt-25">
                  <small>
                    ${full.smartbtw_id}
                  </small>
                </span>
                <span class="badge badge-light-${
                  full.branch_code ? "success" : "danger"
                } mt-25">
                <small>
                  ${full.branch_code ?? "N/A"}
                </small>
              </span>
                ${
                  full.deleted_at !== null
                    ? `
                  <span class="badge badge-light-secondary mt-25 ml-25">
                    <small>
                      Dihapus
                    </small>
                  </span>
                `
                    : ""
                }
                </div>
              </div>
            `;

            return row_output;
          },
        },
        // {
        //   // Packages
        //   targets: 4,
        //   orderable: false,
        //   render: function (data, type, full, meta) {
        //     let products = "";
        //     if (full.products.length > 0) {
        //       for (let i = 0; i < full.products.length; i++) {
        //         products += `
        //         <li class="list-group-item">
        //           ${feather.icons["package"].toSvg({
        //             class: "font-small-4 mr-25",
        //           })} ${full.products[i]}
        //         </li>`;
        //       }
        //     } else {
        //       products += `
        //       <li class="list-group-item">
        //         ${feather.icons["package"].toSvg({
        //           class: "font-small-4 mr-25",
        //         })} -
        //       </li>`;
        //     }
        //     return `
        //     <ul class="list-group list-group-flush">
        //       ${products}
        //     </ul>
        //   `;
        //   },
        // },
        // {
        //   // Packages
        //   targets: 5,
        //   orderable: false,
        //   render: function (data, type, full, meta) {
        //     let offline_products = "";
        //     if (full.offline_products.length > 0) {
        //       for (let i = 0; i < full.offline_products.length; i++) {
        //         offline_products += `
        //         <li class="list-group-item">
        //           ${feather.icons["package"].toSvg({
        //             class: "font-small-4 mr-25",
        //           })} ${full.offline_products[i]}
        //         </li>`;
        //       }
        //     } else {
        //       offline_products += `
        //       <li class="list-group-item">
        //         ${feather.icons["package"].toSvg({
        //           class: "font-small-4 mr-25",
        //         })} -
        //       </li>`;
        //     }
        //     return `
        //     <ul class="list-group list-group-flush">
        //       ${offline_products}
        //     </ul>
        //   `;
        //   },
        // },
        // {
        //   targets: 5,
        //   orderable: false,
        //   render: function (data, type, full, meta) {
        //     return full?.nik ?? "-";
        //   },
        // },
        {
          targets: 4,
          orderable: false,
          render: function (data, type, full, meta) {
            return full?.nik ?? "-";
          },
        },
        {
          targets: 5,
          orderable: false,
          render: function (data, type, full, meta) {
            const birth_date = full?.birth_date_location;
            const birth_place = full?.birth_place;
            if (!birth_date && !birth_place) {
              return "-";
            }
            if (!birth_date && birth_place) {
              return birth_place;
            }
            if (birth_date && !birth_place) {
              return birth_date;
            }
            return `${birth_place}, ${birth_date}`;
          },
        },
        {
          targets: 6,
          orderable: false,
          render: function (data, type, full, meta) {
            return full?.birth_mother_name ?? "-";
          },
        },
        {
          // Classes
          targets: 7,
          orderable: false,
          render: function (data, type, full, meta) {
            let classrooms = "";
            if (full.classroom_names.length > 0) {
              for (let i = 0; i < full.classroom_names.length; i++) {
                classrooms += `
                <li class="list-group-item">
                  ${feather.icons["monitor"].toSvg({
                    class: "font-small-4 mr-25",
                  })} ${full.classroom_names[i]}
                </li>`;
              }
            } else {
              classrooms += `
              <li class="list-group-item">
                ${feather.icons["monitor"].toSvg({
                  class: "font-small-4 mr-25",
                })} -
              </li>`;
            }
            return `
            <ul class="list-group list-group-flush">
              ${classrooms}
            </ul>
          `;
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const studentId = full["smartbtw_id"];
            const studentName = full["name"];
            const isStudentDeleted = full["deleted_at"];
            let actionButtonAddStudentToClass = "";
            if (
              ["*", "add_student_to_class"].some((r) =>
                studentPageAllowed.includes(r)
              )
            ) {
              actionButtonAddStudentToClass = `
                <button
                  type="button"
                  class="btn btn-flat-transparent dropdown-item w-100"
                  data-toggle="modal"
                  data-target="#modals-slide-in"
                  data-id="${studentId}" data-name="${studentName}"
                >
                  ${feather.icons["plus"].toSvg({
                    class: "font-small-4",
                  })} Tambah Siswa Ke Kelas
                </button>
              `;
            }

            const pusatActions = /* html */ `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                Lihat
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/siswa/detail/${studentId}">
                  ${feather.icons["zoom-in"].toSvg({
                    class: "font-small-4",
                  })} Detail Siswa
                </a>
                <a
                class="btn btn-flat-transparent dropdown-item w-100"
                href="/siswa/${studentId}/banned-access"
              >
                ${feather.icons["slash"].toSvg({
                  class: "font-small-4",
                })} Batas Akses Siswa
              </a>
                ${actionButtonAddStudentToClass}
                <a
                  class="btn btn-flat-transparent dropdown-item w-100"
                  href="/siswa/riwayat-pemeriksaan-kesehatan/${studentId}"
                >
                  ${feather.icons["list"].toSvg({
                    class: "font-small-4",
                  })} Riwayat Pemeriksaan Kesehatan
                </a>
                <div class="dropdown-divider"></div>
                <button type="button" class="btn btn-flat-transparent dropdown-item w-100 sync-button">
                  ${feather.icons["refresh-cw"].toSvg({
                    class: "font-small-4",
                  })} Sinkronisasi Data Siswa
                </button>
                <div class="dropdown-divider"></div>
                <button type="button" class="btn btn-flat-transparent dropdown-item w-100 text-danger delete-button" data-id="${studentId}">
                  ${feather.icons["trash"].toSvg({
                    class: "font-small-4 text-danger",
                  })} Hapus Siswa
                </button>
              </div>
            </div>
            `;

            let actionButtonMCUHistory = "";
            if (
              ["*", "read_history_per_student"].some((r) =>
                userRole.includes(r)
              )
            ) {
              actionButtonMCUHistory = `<a
                  class="btn btn-flat-transparent dropdown-item w-100"
                  href="/siswa/riwayat-pemeriksaan-kesehatan/${studentId}"
                >
                  ${feather.icons["list"].toSvg({
                    class: "font-small-4",
                  })} Riwayat Pemeriksaan Kesehatan
                </a>`;
            }

            const cabangActions = /* html */ `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                  Lihat
                  ${feather.icons["chevron-down"].toSvg({
                    class: "font-small-4",
                  })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a class="btn btn-flat-transparent dropdown-item w-100" href="/siswa/detail/${studentId}">
                    ${feather.icons["zoom-in"].toSvg({
                      class: "font-small-4",
                    })} Detail Siswa
                  </a>
                  ${actionButtonAddStudentToClass}
                  ${actionButtonMCUHistory}
                </div>
              </div>
            `;

            const studentDeletedActions = /* html */ `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                  Lihat
                  ${feather.icons["chevron-down"].toSvg({
                    class: "font-small-4",
                  })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a class="btn btn-flat-transparent dropdown-item w-100" href="/siswa/detail/${studentId}">
                    ${feather.icons["zoom-in"].toSvg({
                      class: "font-small-4",
                    })} Detail Siswa
                  </a>
                </div>
              </div>
            `;

            if (!isStudentDeleted)
              return is_user_pusat ? pusatActions : cabangActions;
            else return studentDeletedActions;
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
              exportOptions: {
                columns: [1, 3, 4, 5, 6],
                format: {
                  body: function (data, row, column, node) {
                    if (column === 0) {
                      data = row + 1;
                    }
                    if (column === 1) {
                      const nama_lengkap =
                        $(node).find(".nama_lengkap")[0].innerText;
                      const email = $(node).find(".email")[0].innerText;
                      const value = `${nama_lengkap} (${email})`;
                      data = value;
                    }
                    return data;
                  },
                },
              },
            },
            {
              extend: "csv",
              text:
                feather.icons["file-text"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Csv",
              className: "dropdown-item",
              exportOptions: {
                columns: [1, 3, 4, 5, 6],
                format: {
                  body: function (data, row, column, node) {
                    if (column === 0) {
                      data = row + 1;
                    }
                    if (column === 1) {
                      const nama_lengkap =
                        $(node).find(".nama_lengkap")[0].innerText;
                      const email = $(node).find(".email")[0].innerText;
                      const value = `${nama_lengkap} (${email})`;
                      data = value;
                    }

                    if (column === 2) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }

                    if (column === 3) {
                      $(node).find("svg").remove();
                      const classes = $(node)[0].innerText;
                      data = classes;
                    }

                    if (column === 4) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }

                    return data;
                  },
                },
              },
            },
            {
              extend: "excel",
              text:
                feather.icons["file"].toSvg({ class: "font-small-4 mr-50" }) +
                "Excel",
              className: "dropdown-item",
              exportOptions: {
                columns: [1, 3, 4, 5, 6],
                format: {
                  body: function (data, row, column, node) {
                    if (column === 0) {
                      data = row + 1;
                    }
                    if (column === 1) {
                      const nama_lengkap =
                        $(node).find(".nama_lengkap")[0].innerText;
                      const email = $(node).find(".email")[0].innerText;
                      const value = `${nama_lengkap} (${email})`;
                      data = value;
                    }

                    if (column === 2) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }

                    if (column === 3) {
                      $(node).find("svg").remove();
                      const classes = $(node)[0].innerText;
                      data = classes;
                    }

                    if (column === 4) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }

                    return data;
                  },
                },
              },
            },
            {
              extend: "pdf",
              text:
                feather.icons["clipboard"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Pdf",
              className: "dropdown-item",
              exportOptions: {
                columns: [1, 3, 4, 5],
                format: {
                  body: function (data, row, column, node) {
                    if (column === 0) {
                      data = row + 1;
                    }
                    if (column === 1) {
                      const nama_lengkap =
                        $(node).find(".nama_lengkap")[0].innerText;
                      const email = $(node).find(".email")[0].innerText;
                      const value = `${nama_lengkap} (${email})`;
                      data = value;
                    }

                    if (column === 2) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }

                    if (column === 3) {
                      $(node).find("svg").remove();
                      const classes = $(node)[0].innerText;
                      data = classes;
                    }

                    if (column === 4) {
                      $(node).find("svg").remove();
                      const packages = $(node)[0].innerText;
                      data = packages;
                    }
                    return data;
                  },
                },
              },
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
            "Tambah Siswa Baru",
          className: "create-new btn btn-primary",
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
          action: function (e, dt, button, config) {
            window.location = `${window.location.origin}/siswa/tambah`;
          },
        },
      ],
      // responsive: {
      //   details: {
      //     display: $.fn.dataTable.Responsive.display.modal({
      //       header: function (row) {
      //         var data = row.data();
      //         return "Detail Siswa";
      //       },
      //     }),
      //     type: "column",
      //     renderer: function (api, rowIdx, columns) {
      //       var data = $.map(columns, function (col, i) {
      //         return col.title && !col.title.match(/^no$/i) // ? Do not show row in modal popup if title is blank (for check box)
      //           ? `<tr
      //                 data-dt-row="${col.rowIndex}"
      //                 data-dt-column="${col.columnIndex}"
      //               >
      //               <td>
      //                 ${col.title} :
      //               </td>
      //               <td>
      //                 ${col.data}
      //               </td>
      //             </tr>`
      //           : "";
      //       }).join("");

      //       return data ? $('<table class="table"/>').append(data) : false;
      //     },
      //   },
      // },
      language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });

    // ** Add Click Event to Sync Button
    $(".datatables-basic tbody").on("click", ".sync-button", function () {
      // const dropdownButton = $(this).parent().prev();
      // console.log(dropdownButton, this);
      // setButtonSyncState(dropdownButton[0]);
      var data = dt_basic.row($(this).parents("tr")).data();
      handleSyncStudentToLearningService(data);
    });

    // ** Add Click Event to Sync Button Modal
    $(document).on("click", ".dtr-bs-modal .sync-button", function () {
      var data = dt_basic.row($(this).closest("tr")).data();
      handleSyncStudentToLearningService(data);
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

    function debounce(fn, delay) {
      var timeoutID = null;
      return function () {
        clearTimeout(timeoutID);
        var args = arguments;
        var that = this;
        timeoutID = setTimeout(function () {
          fn.apply(that, args);
        }, delay);
      };
    }

    // Debounce the search
    const debouncedSearch = debounce(function () {
      dt_basic.search(this.value).draw();
    }, 2000); // Adjust the delay as needed

    // Apply the debounced search function to the search input
    $("div.dataTables_filter input").unbind().on("input", debouncedSearch);
  }
  if (!is_user_pusat) dt_basic.buttons(".create-new").remove();
});
