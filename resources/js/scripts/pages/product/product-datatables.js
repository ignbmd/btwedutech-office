$(function () {
  "use strict";

  var productTableEl = $("#product-table"),
    assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  // DataTable
  // --------------------------------------------------------------------

  if (productTableEl.length) {
    var dtTable = productTableEl.DataTable({
      ajax: "/api/product/all",
      // processing: true,
      // serverSide: true,
      columns: [
        { data: null },
        { data: "product_code" },
        { data: "created_at" }, // used for sorting so will hide this column
        { data: "branch_code" },
        { data: "title" },
        { data: "description" },
        { data: "type" },
        { data: "status" },
        { data: "" },
      ],
      columnDefs: [
        { className: "text-center", targets: [6, 7] },
        { orderable: false, targets: [4, 5] },
        {
          // Responsive
          className: "control",
          orderable: false,
          targets: 0,
          defaultContent: ""
        },
        {
          targets: 1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `<span class="badge badge-success">${data}</span>`;
          },
        },
        {
          targets: 2,
          visible: false,
        },
        {
          // ** Branch Code
          targets: 3,
          orderable: false,
          render: function (data, type, full, meta) {
            return `<span class="badge badge-light-primary">${
              data ?? "Belum ada"
            }</span>`;
          },
        },
        {
          // ** Product Type
          targets: 6,
          orderable: false,
          render: function (data, type, full, meta) {
            const productType = full.type;
            const includedProduct = full.included_product;
            const typeText = data.split("_").join(" ");
            const typeBadgeColor =
              productType == "PRODUCT_ONLINE"
                ? "primary"
                : productType == "PRODUCT_OFFLINE"
                ? "success"
                : productType == "PRODUCT_ONLINE_IOS"
                ? "warning"
                : productType == "PRODUCT_ONLINE_ANDROID"
                ? "secondary"
                : "primary";

            const productUnitBadge =
              includedProduct?.length > 0
                ? {
                    color: "success",
                    icon: "package",
                    text: "Paket",
                  }
                : {
                    color: "primary",
                    icon: "file",
                    text: "Satuan",
                  };

            return `
              <span class="badge d-block badge-light-${typeBadgeColor}">${typeText}</span>
              <span class="badge d-block badge-${productUnitBadge.color} mt-25">
                ${feather.icons[productUnitBadge.icon].toSvg({
                  class: "font-small-2",
                })} ${productUnitBadge.text}
              </span>
            `;
          },
        },
        {
          // ** Product Status
          targets: 7,
          orderable: false,
          render: function (data, type, full, meta) {
            const badge = data
              ? {
                  color: "success",
                  text: "Aktif",
                }
              : {
                  color: "danger",
                  text: "Tidak Aktif",
                };

            return `
              <span class="badge badge-pill badge-light-${badge.color}">
                ${badge.text}
              </span>
            `;
          },
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
                  <a href="/produk/detail/${full._id}" class="dropdown-item">
                    ${feather.icons["zoom-in"].toSvg({
                      class: "font-small-4 mr-50",
                    })}
                    Lihat Detail
                  </a>
                  <div class="dropdown-divider"></div>
                  <a href="/produk/edit/${full._id}" class="dropdown-item">
                    ${feather.icons["edit"].toSvg({
                      class: "font-small-4 mr-50",
                    })}
                    Edit
                  </a>
                </div>
              </div>
            `;
          },
        },
      ],
      order: [[2, "desc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Detail Produk " + data["title"];
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

    $(".dt-action-buttons").html(`
        <a
          class="btn btn-primary"
          type="button"
          id="addMenu"
          href="/produk/tambah"
        >
          Tambah Produk
        </a>
    `);
  }
});
