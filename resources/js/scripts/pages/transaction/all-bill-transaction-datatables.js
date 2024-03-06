class TransactionDatatable {
  constructor() {
    this.DATATABLE_ID = "transaction-table";
    this.data = [];
    this.table = null;
    this.user = this.getUser();
    this.userRole = this.getUserRoles();
    this.transactionStatus = {
      pending: {
        text: "Menunggu Konfirmasi",
        class: "badge badge-light-warning",
      },
      approved: {
        text: "Lunas",
        class: "badge badge-light-success",
      },
      fail: {
        text: "Gagal",
        class: "badge badge-light-danger",
      },
    };
  }

  async init() {
    this.initTable();
  }

  initTable() {
    const self = this;
    const dom = $(`#${self.DATATABLE_ID}`);
    this.table = dom.DataTable({
      processing: true,
      serverSide: true,
      ajax: "/api/finance/bill",
      columns: [
        { data: null }, // plus button
        { data: null }, // no. column
        { data: "bill.bill_to" },
        { data: "created_at" }, // used for sorting so will hide this column
        { data: "bill.email" },
        { data: "bill.branch_code" },
        { data: "bill.title" },
        { data: "created_at" },
        { data: "final_transaction" },
        { data: "" }, // payment_proof
        { data: "transaction_status" },
        { data: "" }, // action button
      ],
      autoWidth: false,
      columnDefs: [
        { width: "15%", targets: [-1] },
        {
          className: "control",
          orderable: false,
          targets: 0, // Plus button
          defaultContent: "",
          visible: false,
        },
        {
          targets: 1, // no. column
          orderable: false,
        },
        {
          targets: 2, // bill.bill_to
          orderable: false,
        },
        {
          targets: 3, // created_at (1)
          visible: false,
        },
        {
          targets: 4, // bill.email
          orderable: false,
        },
        {
          targets: 5, // bill.branch_code
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <span class="badge badge-success">${data}</span>
            `;
          },
        },
        {
          targets: 6, // bill.title
          orderable: false,
          render: function (data, type, full, meta) {
            let productType = "-";
            if (full["bill"].product_type == "ONLINE_PRODUCT") {
              productType = "Produk Online";
            } else if (full["bill"].product_type == "OFFLINE_PRODUCT") {
              productType = "Produk Offline";
            } else if (full["bill"].product_type == "ASSESSMENT_PRODUCT") {
              productType = "Produk Assessment";
            } else if (
              full["bill"].product_type == "BUNDLE_PSYCHOLOG_PRODUCT"
            ) {
              productType = "Produk Bundle Psikolog";
            } else if (
              full["bill"].product_type == "ASSESSMENT_PSYCHOLOG_PRODUCT"
            ) {
              productType = "Produk Assessment Psikolog ";
            } else if (
              full["bill"].product_type == "ASSESSMENT_BUNDLE_PRODUCT"
            ) {
              productType = "Produk Bundle Assessment";
            } else if (full["bill"].product_type == "COIN_CURRENCY") {
              productType = "Produk Mata Uang Koin";
            } else if (full["bill"].product_type == "COIN_PRODUCT") {
              productType = "Produk Online Koin";
            } else if (full["bill"].product_type == "SIPLAH") {
              productType = "Produk SIPLAH";
            }
            return `
              ${data} <span class="badge badge-light-secondary">${productType}</span>
            `;
          },
        },
        {
          targets: 7, // created_at (2)
          render: function (data, type, full, meta) {
            const is_online_transaction_status_approved =
              full["transaction_status"].toLowerCase() === "approved" &&
              full["bill"].product_type === "ONLINE_PRODUCT";
            return moment(
              is_online_transaction_status_approved
                ? full["updated_at"]
                : full["created_at"]
            ).format("YYYY-MM-DD HH:mm:ss");
          },
        },
        {
          targets: 8, // bill.final_bill
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <span class="badge badge-pill badge-primary">
                ${priceFormatter(data)}
              </span>
            `;
          },
        },
        {
          targets: 9, // payment_proof
          orderable: false,
          render: function (data, type, full, meta) {
            const payment_proof = full["document"];
            if (!payment_proof?.length) {
              return `
                <span class="badge badge-light-secondary">
                  Belum Ada
                </span>
              `;
            }
            const last = payment_proof[payment_proof.length - 1];
            return `
              <a href="${last?.path}" target="_blank">
                <span class="badge badge-light-primary">
                  Lihat Bukti Pembayaran ${feather.icons[
                    "external-link"
                  ].toSvg()}
                </span>
              </a>
            `;
          },
        },
        {
          targets: 10, // transaction_status
          orderable: false,
          render: function (data, type, full, meta) {
            const status = data.toLowerCase();
            return `
              <span class="${
                self?.transactionStatus[status]?.class ??
                "badge badge-light-secondary"
              }">
                ${self?.transactionStatus[status]?.text ?? data}
              </span>
            `;
          },
        },
        {
          targets: -1, // action button
          orderable: false,
          render: (data, type, full, meta) => {
            const detailHtml = `
              <a
                href="/tagihan/detail/${full.bill.id}"
                class="btn btn-sm btn-primary"
              >
                ${feather.icons["zoom-in"].toSvg({
                  class: "font-small-4 mr-50",
                })} Lihat Tagihan
              </a>
            `;
            return `
              ${
                ["*", "detail"].some((r) => this.userRole.includes(r))
                  ? detailHtml
                  : ""
              }
            `;
          },
        },
      ],
      order: [[3, "desc"]],
      dom: `<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>`,
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [],
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });

    self.table
      .on("order.dt search.dt draw.dt", function () {
        var info = self.table.page.info();
        self.table
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1 + info.start;
          });
      })
      .draw();

    self.addTableHeader();
  }

  addTableHeader() {
    const headLabel = $(".head-label");
    headLabel.append(`<h6 class="mb-0">Daftar Seluruh Transaksi Tagihan</h6>`);
  }

  async fetchData() {
    try {
      const url = `/api/finance/bill`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  getUserRoles() {
    const dom = document.getElementById("allowed");
    return JSON.parse(dom.innerText);
  }

  getUser() {
    const dom = document.getElementById("user");
    return JSON.parse(dom.innerText);
  }
}

const dt = new TransactionDatatable();
dt.init();
