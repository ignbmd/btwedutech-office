function selectTransactionIdAndCreatedAt(id, createdAt) {
  const dom = document.getElementById("selectedTransactionId");
  dom.innerText = id;

  const dom2 = document.getElementById("selectedCreatedAt");
  dom2.innerText = createdAt;
}

function setSelectedTransactionPaymentLink(url) {
  const dom = document.getElementById("payment-link");
  dom.href = url;
}

function getSelectedTransactionId() {
  const dom = document.getElementById("selectedTransactionId");
  return dom.innerText;
}

function getSelectedCreatedAt() {
  const dom = document.getElementById("selectedCreatedAt");
  return dom.innerText;
}

function getPaymentWebHost() {
  const dom = document.getElementById("paymentWebHost");
  return dom.innerText;
}

class BillTransactionsDataTable {
  constructor() {
    this.data = [];
    this.billId = this.getBillId();
    this.userData = this.getUserData();
    this.userRole = this.getUserRoles();
    this.bill = this.getBill();
    this.table = null;
    this.TRANSACTION_TABLE_ID = "transaction-table";
    this.DATATABLE_MODAL_CLASS = "dtr-bs-modal";
    this.DELETE_CLASS = "delete-transaction";
  }

  async init() {
    this.data = await this.getTransactions();
    this.initTable();
    this.setCardHeaderTitle("Daftar Histori Transaksi");
  }

  initTable() {
    const self = this;
    const dom = $(`#${this.TRANSACTION_TABLE_ID}`);
    const isSuperAdmin =
      this.userData.branch_code === "PT0000" ||
      this.userData.branch_code === null;

    this.table = dom.DataTable({
      data: this.data,
      paging: false,
      scrollX: true,
      columns: [
        { data: null },
        { data: "id" },
        { data: "note" },
        { data: "final_transaction" },
        { data: "transaction_fee" },
        { data: "final_transaction" },
        { data: "transaction_method" },
        { data: "transaction_status" },
        { data: "created_by" },
        { data: "" },
        { data: "document" },
        { data: "" },
      ],
      columnDefs: [
        { className: "text-center", targets: [6, 7] },
        { orderable: false, targets: [1, 4, 5] },
        {
          className: "control",
          orderable: false,
          targets: 0,
          visible: false,
          defaultContent: "",
        },
        {
          orderable: false,
          targets: 1,
          render: (data) => `#${data}`,
        },
        {
          targets: 3,
          orderable: false,
          render: (data) => `
            <span class="badge badge-pill badge-success">
              ${feather.icons["arrow-down"].toSvg()}
              ${priceFormatter(data)}
            </span>
          `,
        },
        {
          targets: 4,
          orderable: false,
          render: (data) => `
            <span class="badge badge-pill badge-warning">
              ${priceFormatter(data)}
            </span>
          `,
        },
        {
          targets: 5,
          orderable: false,
          render: (data) => `
            <span class="badge badge-pill badge-primary">
              ${priceFormatter(data)}
            </span>
          `,
        },
        {
          targets: 6,
          orderable: false,
          render: (key) => this.getMethod(key),
        },
        {
          targets: 7,
          orderable: false,
          render: (status) => {
            const color = this.getStatusColor(status);
            return `
              <span class="badge badge-glow badge-${color} capitalize">
                ${status}
              </span>
            `;
          },
        },
        {
          targets: 9,
          orderable: false,
          render: (data, type, full, meta) => {
            const isTransactionApproved =
              full["transaction_status"].toLowerCase() === "approved";
            const is_online_transaction_status_approved =
              isTransactionApproved &&
              self.bill.product_type === "ONLINE_PRODUCT";
            const isMidtransTransactionApproved =
              isTransactionApproved &&
              full["transaction_method"] === "MIDTRANS";
            return `${moment(
              is_online_transaction_status_approved ||
                isMidtransTransactionApproved
                ? full["updated_at"]
                : full["created_at"]
            )
              .utcOffset("+0700")
              .format("YYYY-MM-DD HH:mm:ss")} WIB`;
          },
        },
        {
          // Bukti Pembayaran
          targets: 10,
          orderable: false,
          render: (data) => {
            if (!Array.isArray(data) || !data?.length) {
              return `
                <span class="badge badge-light-secondary">
                  Kosong
                </span>
              `;
            }
            const last = data[data.length - 1];
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
          // Actions
          targets: -1,
          orderable: false,
          responsivePriority: 7,
          render: (data, type, full, meta) => {
            const editTransactionHtml = `
              <a
              ${
                isSuperAdmin
                  ? `href="/admin/tagihan/detail/${full.bill_id}/edit/${full.id}"`
                  : `href="/tagihan/detail/${full.bill_id}/edit/${full.id}"`
              }
              class="dropdown-item">
                ${feather.icons["edit"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Edit Transaksi
              </a>
            `;

            const deleteTransactionHtml = `
            <a
            class="dropdown-item text-danger delete-transaction">
              ${feather.icons["trash"].toSvg({
                class: "font-small-4 mr-50 text-danger",
              })}
              Hapus Transaksi
            </a>
            `;

            const downloadReceipt = `
              <a href="/tagihan/kwitansi/${
                full.id
              }/pdf" class="dropdown-item" target="_blank">
                ${feather.icons["file-text"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Download Kwitansi
              </a>
            `;

            const printReceipt = `
              <a href="/tagihan/kwitansi/${
                full.id
              }/print" class="dropdown-item" target="_blank">
                ${feather.icons["file-text"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Print Kwitansi
              </a>
            `;

            const paymentWebHost = getPaymentWebHost();
            const paymentUrl = `${paymentWebHost}/transaction/${full.encrypted_id}`;
            const midtransLinkAction = `
              <a href="${paymentUrl}" class="dropdown-item" target="_blank">
                ${feather.icons["credit-card"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Link Pembayaran
              </a>
            `;
            const sendMidtransLinkAction = `
              <a
                class="dropdown-item"
                data-toggle="modal"
                data-target="#send-payment-link-sidebar"
                data-id=${full.id}
                onclick="
                  selectTransactionIdAndCreatedAt(${full.id}, '${moment(
              full.created_at
            ).format("DD MMM YYYY")}');
                  setSelectedTransactionPaymentLink('${paymentUrl}')"
              >
                ${feather.icons["send"].toSvg({
                  class: "font-small-4 mr-50",
                })}
                Kirim Link Pembayaran
              </a>
            `;

            const userCanEdit = ["*", "edit_transaction"].some((r) =>
              this.userRole.includes(r)
            );
            const isBillPaidOf = this.bill.remain_bill == 0;
            const isEditable = userCanEdit && !isBillPaidOf;
            const isApproved = full?.transaction_status == "APPROVED";

            return `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary" data-toggle="dropdown">
                  Pilihan
                  ${feather.icons["chevron-down"].toSvg({
                    class: "font-small-4",
                  })}
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  ${!isApproved ? midtransLinkAction : ""}
                  ${!isApproved ? sendMidtransLinkAction : ""}
                  ${
                    isApproved &&
                    ["*", "download_receipt"].some((r) =>
                      this.userRole.includes(r)
                    )
                      ? downloadReceipt
                      : ""
                  }
                  ${
                    isApproved &&
                    ["*", "print_receipt"].some((r) =>
                      this.userRole.includes(r)
                    )
                      ? printReceipt
                      : ""
                  }
                  ${
                    isApproved
                      ? `<a
                      class="dropdown-item"
                      data-toggle="modal"
                      data-target="#send-receipt-sidebar"
                      data-id=${full.id}
                      onclick="selectTransactionIdAndCreatedAt(${
                        full.id
                      }, '${moment(full.created_at).format("DD MMM YYYY")}')"
                    >
                      ${feather.icons["file-text"].toSvg({
                        class: "font-small-4 mr-50",
                      })}
                      Kirim Kwitansi
                    </a>`
                      : ""
                  }
                  ${
                    !isApproved && isEditable
                      ? `<div class="dropdown-divider"></div>`
                      : ""
                  }
                  ${!isApproved && isEditable ? editTransactionHtml : ""}
                  ${
                    ["*", "delete_transaction"].some((r) => this.userRole.includes(r))
                      ? deleteTransactionHtml
                      : ""
                  }
                </div>
              </div>
            `;
          },
        },
      ],
      order: [[9, "desc"]],
      dom: `
        <"card-header border-bottom p-1"
          <"head-label">
            <"dt-action-buttons text-right"B>
          >
          <"d-flex justify-content-between align-items-center mx-0 row"
            <"col-sm-12 col-md-6"l>
            <"col-sm-12 col-md-6"f>
          >t
          <"d-flex justify-content-between mx-0 row"
            <"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>
          >
        `,
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

    const rowLength = this.table.data().count();
    const tableScrollTbody = $(
      ".dataTables_scroll .dataTables_scrollBody tbody"
    );
    if (rowLength < 5) {
      tableScrollTbody.height("230px");
    }

    $(document).on(
      "click",
      `.${self.DATATABLE_MODAL_CLASS} .${self.DELETE_CLASS}`,
      function () {
        var data = self.table.row($(this).closest("tr")).data();
        const id = data?.id;
        if (!id) return;
        console.log(id);
        self.deleteTransaction(id);
      }
    );

    $(document).on("click", `.${self.DELETE_CLASS}`, function () {
      var data = self.table.row($(this).closest("tr")).data();
      const id = data?.id;
      if (!id) return;
      self.deleteTransaction(id);
    });
  }

  setCardHeaderTitle(title) {
    const element = $(".head-label");
    const headerTitle = `<h6 class="mb-0">${title}</h6>`;
    element.append(headerTitle);
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  deleteTransaction(transactionId) {
    return swal({
      title: "Konfirmasi",
      text: "Apakah anda yakin ingin menghapus data ini?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      closeModal: false,
    }).then((willDelete) => {
      if (willDelete) {
        $.ajax({
          url: `/api/finance/bill/transaction/${transactionId}`,
          type: "DELETE",
          headers: { "X-CSRF-TOKEN": this.getCsrf() },
          success: async (response) => {
            swal.close();
            toastr.success("Transaksi berhasil dihapus", "Berhasil!", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            });
            $(".modal").modal("hide");
            window.location.reload();
          },
          error: async (data) => {
            toastr.error(
              "Hapus Transaksi Gagal, Silakan coba lagi nanti",
              "Terjadi Kesalahan!",
              {
                closeButton: true,
                tapToDismiss: false,
                timeOut: 3000,
              }
            );
            $(".modal").modal("hide");
          },
        });
      }
    });
  }

  async getTransactions() {
    try {
      const url = `/api/finance/bill/${this.billId}/transactions`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getMethod(key) {
    const methods = {
      MANUAL_TF_BCA: "Transfer Manual Bank BCA",
      MANUAL_TF_BNI: "Transfer Manual Bank BNI",
      MANUAL_TF_BRI: "Transfer Manual Bank BRI",
      CASH: "Cash",
      VC: "Credit Card (Visa / Master / JCB)",
      BK: "BCA KlikPay",
      BC: "BCA Virtual Account",
      M1: "Mandiri Virtual Account (Deprecated)",
      M2: "Mandiri Virtual Account",
      BT: "Permata Bank Virtual Account",
      A1: "ATM Bersama",
      B1: "CIMB Niaga Virtual Account",
      I1: "BNI Virtual Account",
      VA: "Maybank Virtual Account",
      FT: "Ritel",
      OV: "OVO (Support Void)",
      DN: "Indodana Paylater",
      SP: "Shopee Pay",
      SA: "Shopee Pay Apps (Support Void)",
      AG: "Bank Artha Graha",
      S1: "Bank Sahabat Sampoerna",
      LA: "LinkAja Apps (Percentage Fee)",
      LF: "LinkAja Apps (Fixed Fee)",
      LQ: "LinkAja QRIS",
      DA: "DANA",
      IR: "Indomaret",
      A2: "POS Indonesia",
    };
    return methods[key] ?? key;
  }

  getStatusColor(status) {
    const colors = {
      APPROVED: "success",
      PENDING: "warning",
      FAIL: "danger",
    };
    return colors[status] ?? "black";
  }

  getBillId() {
    const dom = document.getElementById("billId");
    return dom.innerText;
  }

  getUserRoles() {
    const dom = document.getElementById("allowed");
    return JSON.parse(dom.innerText);
  }

  getUserData() {
    const dom = document.getElementById("user");
    return JSON.parse(dom.innerText);
  }

  getBill() {
    const dom = document.getElementById("bill");
    return JSON.parse(dom.innerText);
  }
}

class SendReceipt {
  constructor() {
    this.form = document.getElementById("send-form");
    this.alert = document.getElementById("alert");
    this.alert.style.display = "none";
    this.phone = this.getDefaultParentPhone();
    this.billId = this.getBillId();
    this.studentName = this.getStudentName();
    this.send = document.getElementById("button-send");
    this.listenForm();
    this.listenModalClosed();
  }

  getDefaultParentPhone() {
    const dom = document.getElementById("defaultParentPhone");
    return dom.innerText;
  }

  getBillId() {
    const dom = document.getElementById("billId");
    return dom.innerText;
  }

  getStudentName() {
    const dom = document.getElementById("studentName");
    return dom.innerText;
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  listenForm() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      this.phone = fd.get("phone") ?? this.getDefaultParentPhone();
      this.onSubmit();
    });
  }

  listenModalClosed() {
    self = this;
    $("#send-receipt-sidebar").on("hidden.bs.modal", () => {
      self.alert.style.display = "none";
    });
  }

  async onSubmit() {
    this.send.disabled = true;
    this.alert.style.display = "none";
    try {
      const id = getSelectedTransactionId();
      const createdAt = getSelectedCreatedAt();
      const url = `/api/finance/bill/${this.billId}/transaction/${id}/send`;
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          studentName: this.studentName,
          createdAt: createdAt,
          phone: this.phone,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": this.getCsrf(),
        },
      });
      await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      this.send.disabled = false;
      this.alert.style.display = "block";
    }
  }
}

class SendPaymentLink {
  constructor() {
    this.form = document.getElementById("send-payment-link-form");
    this.alert = document.getElementById("alert-send-payment-link");
    this.alert.style.display = "none";
    this.phone = this.getDefaultParentPhone();
    this.studentName = this.getStudentName();
    this.productName = this.getProductName();
    this.branchCode = this.getBranchCode();
    this.send = document.getElementById("button-send-payment-link");
    this.listenForm();
    this.listenModalClosed();
  }

  getDefaultParentPhone() {
    const dom = document.getElementById("defaultParentPhone");
    return dom.innerText;
  }

  getProductName() {
    const dom = document.getElementById("billProductName");
    return dom.value;
  }

  getBranchCode() {
    const dom = document.getElementById("billBranchCode");
    return dom.value;
  }

  getStudentName() {
    const dom = document.getElementById("studentName");
    return dom.innerText;
  }

  getPaymentLink() {
    const dom = document.getElementById("payment-link");
    return dom.href;
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  listenModalClosed() {
    self = this;
    $("#send-payment-link-sidebar").on("hidden.bs.modal", () => {
      self.alert.style.display = "none";
    });
  }

  listenForm() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      this.phone = fd.get("phone") ?? this.getDefaultParentPhone();
      this.onSubmit();
    });
  }

  async onSubmit() {
    this.send.disabled = true;
    this.alert.style.display = "none";
    try {
      const paymentLink = this.getPaymentLink();
      const url = `/api/finance/bill/transaction/send-payment-info`;
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          phone: this.phone,
          studentName: this.studentName,
          productName: this.productName,
          branchCode: this.branchCode,
          link: paymentLink,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": this.getCsrf(),
        },
      });
      await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      this.send.disabled = false;
      this.alert.style.display = "block";
    }
  }
}

const billTransactionTable = new BillTransactionsDataTable();
const sendReceipt = new SendReceipt();
const sendPaymentLink = new SendPaymentLink();
billTransactionTable.init();
