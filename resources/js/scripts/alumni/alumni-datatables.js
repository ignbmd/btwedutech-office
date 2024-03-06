$(function () {
  "use strict";

  let dt_basic_table = $(".datatables-basic");
  let assetPath = "../../../app-assets/";
  let selection = "sekdin";
  let instanceFormationTableHeader = $("#instanceFormationTableHeader");

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable with buttons
  // --------------------------------------------------------------------

  if (dt_basic_table.length) {
    var dt_basic = dt_basic_table.DataTable({
      ajax: {
        url: `/api/alumni/skd/sekdin`,
        dataSrc: "data"
      },
      columns: [
        { data: null },
        { data: "_id" },
        { data: null }, // used for sorting so will hide this column
        { data: "name" },
        { data: "phone" },
        { data: "school_origin" },
        { data: "major" },
        { data: "instance" },
        { data: "" },
      ],
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          searchable: false,
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
          render: function (data, type, full, meta) {
            const userImg = full["formal_picture"];
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
                    <span class="emp_name text-truncate font-weight-bold nama_lengkap">
                      ${full.name}
                    </span>
                    <small class="emp_post text-truncate text-muted email">
                      ${full.email ?? "-"}
                    </small>
                  </div>
                </div>
              </div>
            `;

            return row_output;
          },
        },
        {
          targets: [4, 5, 6, 7],
          searchable: false,
          defaultContent: "-",
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const id = full["_id"];

            const dom = /* html */ `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                Lihat
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/alumni/skd/${selection}/${id}/detail">
                  ${feather.icons["zoom-in"].toSvg({
                    class: "font-small-4",
                  })} Detail Alumni
                </a>
                <div class="dropdown-divider"></div>
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/alumni/skd/${selection}/${id}/edit">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4",
                  })} Edit Alumni
                </a>
                <button type="button" data-id="${id}" class="btn btn-flat-transparent dropdown-item w-100 text-danger delete-button">
                  ${feather.icons["trash"].toSvg({
                    class: "font-small-4 text-danger",
                  })} Hapus Alumni
                </button>
              </div>
            </div>
            `;
            return dom;
          },
        },
      ],
      order: [[2, "asc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Tambah Alumni Baru",
          className: "create-new btn btn-primary",
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
          action: function (e, dt, button, config) {
            window.location = `${window.location.origin}/alumni/tambah`;
          },
        },
      ],
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
    loadSelectionFilter();
    listenSelectionFilter();
  }

  $(document).on("click", ".delete-button", function() {
    const id = $(this).attr("data-id");
    confirmDelete(id);
  });

  function confirmDelete(id) {
    return swal({
      title: "Konfirmasi",
      text: "Apakah anda yakin ingin menghapus data ini?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeModal: false,
    })
    .then((willDelete) => {
      if(willDelete) {
        $.ajax({
          url: `/api/alumni/skd/${selection}/${id}`,
          type: 'DELETE',
          headers: { "X-CSRF-TOKEN": getCsrf() },
          success: async (response) => {
            swal.close();
            toastr.success("Hapus Alumni Berhasil", "Berhasil!", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 1500,
            });
            $(".modal").modal("hide");

            dt_basic.clear();
            dt_basic.draw();

            clearTableData();
            refreshTableData(await fetchAlumni(selection));
          },
          error: async (data) => {
            toastr.error("Hapus Alumni Gagal", "Terjadi Kesalahan!", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            });
            $(".modal").modal("hide");
          }
        });
      }
    });
  }

  function getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  function loadSelectionFilter() {
    const html = `
      <div class="align-items-center">
        <label for="basicInput" class="">
          Seleksi
        </label>
        <select class="select2-size-sm form-control form-control-lg" id="selection">
          <option value="sekdin" selected>Sekolah Kedinasan</option>
          <option value="cpns">CPNS</option>
        </select>
      </div>`;
    const dom = document.querySelector("div.head-label");
    dom.innerHTML = html;
  }

  function listenSelectionFilter() {
    const dom = document.getElementById("selection");
    dom.addEventListener("change", async (event) => {
      selection = event.target.value;
      clearTableData();
      refreshTableData(await fetchAlumni(selection));
    });
  }

  async function fetchAlumni(selection) {
    try {
      const response = await fetch(`/api/alumni/skd/${selection}`);
      const data = await response.json();
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function refreshTableData(data) {
    if(selection == "cpns") {
      data.forEach((item) => {
        if(item.hasOwnProperty("formation")) item.instance = item.formation;
        else item.instance = null;
      });
      instanceFormationTableHeader.text("Formasi");
    } else {
      instanceFormationTableHeader.text("Instansi");
    }
    dt_basic.rows.add(data);
    dt_basic.draw();
  }

  function clearTableData() {
    dt_basic.clear();
    dt_basic.draw();
  }

  function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }
});
