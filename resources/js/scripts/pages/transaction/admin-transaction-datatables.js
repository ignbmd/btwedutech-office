class TransactionDatatable {
  constructor() {
    this.DATATABLE_ID = "transaction-table";
    this.FILTER_FORM_ID = "filter-form";
    this.FILTER_FORM_CONTAINER_ID = "filter-form-container";
    this.PRODUCT_TYPE_FILTER_ID = "product-type";
    this.TRANSACTION_STATUS_FILTER_ID = "transaction-status";
    this.BRANCH_CODE_FILTER_ID = "branch-code";
    this.DATATABLE_MODAL_CLASS = "dtr-bs-modal";
    this.DELETE_CLASS = "delete-bill";

    this.data = [];
    this.branches = [];
    this.table = null;
    this.user = this.getUser();
    this.userRole = this.getUserRoles();
    this.query = this.getQueryParams();
    this.billType = this.getBillType();
    this.badgeClass = this.getBadgeClass(this.billType);
    this.badgeText = this.getBadgeText(this.billType);
    this.selectedProductType = "OFFLINE_PRODUCT";
    this.selectedTransactionStatus = "";
    this.selectedBranchCode = "PT0000";
    this.productTypes = [
      { value: "OFFLINE_PRODUCT", label: "Produk Offline" },
      { value: "ONLINE_PRODUCT", label: "Produk Online" },
      { value: "SIPLAH", label: "Produk SIPLAH" },
      { value: "ASSESSMENT_PRODUCT", label: "Produk Assessment" },
      {
        value: "ASSESSMENT_PSYCHOLOG_PRODUCT",
        label: "Produk Assessment Psikolog",
      },
      { value: "BUNDLE_PSYCHOLOG_PRODUCT", label: "Produk Bundle Psikolog" },
      { value: "ASSESSMENT_BUNDLE_PRODUCT", label: "Produk Bundle Assessment" },
      { value: "ASSESSMENT_EVENT_PRODUCT", label: "Produk Event Assessment" },
      { value: "COIN_CURRENCY", label: "Top Up Coin" },
      { value: "FRANCHISE_ACTIVATION", label: "Pembayaran Fee Franchise" },
    ];
    this.transactionStatuses = [
      { value: "", label: "Semua Transaksi" },
      { value: "OPEN", label: "Belum Lunas" },
      { value: "CLOSED", label: "Lunas" },
    ];
  }

  async init() {
    this.branches = await this.fetchBranch();
    this.data = await this.fetchData();
    this.appendOnlineTransactionModal();
    this.initTable();
    this.setCardHeaderTitle("Daftar Tagihan");
    if (!this.query.has("type") && !this.query.has("branch_code")) {
      this.activateProductTypeFilter();
      this.activateFormSubmitHandler(this.selectedProductType);
    } else {
      this.loadTagComponent();
      $(`#${this.FILTER_FORM_ID}`).addClass("d-none");
    }
  }

  activateProductTypeFilter() {
    this.initProductTypeFilter();
    this.listenProductTypeFilter();
  }

  setCardHeaderTitle(title) {
    const element = $(".head-label");
    const headerTitle = `<h6 class="mb-0">${title}</h6>`;
    element.append(headerTitle);
  }

  initProductTypeFilter() {
    /*
    const html = `
      <div class="align-items-center">
        <label for="basicInput" class="">
          Tipe Produk
        </label>
        <select
          class="select2-size-sm form-control form-control-lg"
          id="${this.PRODUCT_TYPE_FILTER_ID}"
        >
          ${this.productTypes.map((v) => {
            const selected =
              this.selectedProductType == v.value ? "selected" : "";
            return `<option value="${v.value}" ${selected}>${v.label}</option>`;
          })}
        </select>
      </div>`;

    const dom = document.querySelector("div.head-label");
    */

    const html = `
    <div class="col-md-4">
      <label for="basicInput" class="">
        Tipe Produk
      </label>
      <select
        id="${this.PRODUCT_TYPE_FILTER_ID}"
        name="${this.PRODUCT_TYPE_FILTER_ID}"
        class="form-control text-capitalize mb-md-0 mb-2"
        required
      >
        ${this.productTypes.map((v) => {
          const selected =
            this.selectedProductType == v.value ? "selected" : "";
          return `<option value="${v.value}" ${selected}>${v.label}</option>`;
        })}
      </select>
    </div>
    `;
    const dom = $(`#${this.FILTER_FORM_CONTAINER_ID}`);
    dom.append(html);
    this.fetchSecondSelect(this.selectedProductType);
  }

  listenProductTypeFilter() {
    const dom = document.getElementById(this.PRODUCT_TYPE_FILTER_ID);
    dom.addEventListener("change", (e) => {
      /*
      this.selectedProductType = e.target.value;
      this.replaceTableData(await this.fetchData());
      */
      this.selectedProductType = e.target.value;
      this.fetchSecondSelect(this.selectedProductType);
      this.activateFormSubmitHandler(this.selectedProductType);
    });
  }

  fetchSecondSelect(productType) {
    if (
      productType === "ONLINE_PRODUCT" ||
      productType === "COIN_CURRENCY" ||
      productType === "ASSESSMENT_BUNDLE_PRODUCT" ||
      productType === "BUNDLE_PSYCHOLOG_PRODUCT" ||
      productType === "ASSESSMENT_PSYCHOLOG_PRODUCT" ||
      productType === "ASSESSMENT_PRODUCT" ||
      productType === "SIPLAH" ||
      productType === "ASSESSMENT_EVENT_PRODUCT"
    )
      this.fetchTransactionStatusFilter();
    else this.fetchBranchFilter();
    this.fetchSubmitButton();
  }

  fetchTransactionStatusFilter() {
    const html = `
    <div class="col-md-4" id="second-select-col">
      <label for="basicInput" class="">
        Status Transaksi
      </label>
      <select
        id="${this.TRANSACTION_STATUS_FILTER_ID}"
        name="${this.TRANSACTION_STATUS_FILTER_ID}"
        class="form-control text-capitalize mb-md-0 mb-2"
      >
        ${this.transactionStatuses.map((v) => {
          const selected =
            this.selectedTransactionStatus == v.value ? "selected" : "";
          return `<option value="${v.value}" ${selected}>${v.label}</option>`;
        })}
      </select>
    </div>
    `;
    const dom = $(`#${this.FILTER_FORM_CONTAINER_ID}`);
    const secondSelect = $(`#second-select-col`);
    if (secondSelect.length) secondSelect.remove();
    dom.append(html);
    this.listenTransactionStatusFilter();
  }

  listenTransactionStatusFilter() {
    const dom = document.getElementById(this.TRANSACTION_STATUS_FILTER_ID);
    dom.addEventListener("change", (e) => {
      this.selectedTransactionStatus = e.target.value;
    });
  }

  fetchBranchFilter() {
    const html = `
    <div class="col-md-4" id="second-select-col">
      <label for="basicInput" class="">
        Cabang
      </label>
      <select
        id="${this.BRANCH_CODE_FILTER_ID}"
        name="${this.BRANCH_CODE_FILTER_ID}"
        class="form-control text-capitalize mb-md-0 mb-2"
        required
      >
        ${this.branches.map((v) => {
          const selected = this.user.branch_code == v.code ? "selected" : "";
          return `<option value="${v.code}" ${selected}>(${v.code}) ${v.name}</option>`;
        })}
      </select>
    </div>
    `;
    const dom = $(`#${this.FILTER_FORM_CONTAINER_ID}`);
    const secondSelect = $(`#second-select-col`);
    if (secondSelect.length) secondSelect.remove();
    dom.append(html);
    (() => {
      $(`#${this.BRANCH_CODE_FILTER_ID}`).select2();
    })();
  }

  fetchSubmitButton() {
    const html = `
    <div class="col-md-4" id="submit-button">
      <button type="button" id="submitBtn" class="btn btn-success mt-2">Filter</button>
    </div>
    `;
    const dom = $(`#${this.FILTER_FORM_CONTAINER_ID}`);
    const submitButton = $(`#submit-button`);
    if (submitButton.length) submitButton.remove();
    dom.append(html);
  }

  activateFormSubmitHandler(selectedProductType) {
    const submitBtn = $("#submitBtn");

    submitBtn.on("click", async (e) => {
      e.target.disabled = true;
      e.target.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
      const data = await this.fetchData();
      this.replaceTableData(data);
      e.target.disabled = false;
      e.target.innerHTML = `Filter`;
    });
  }

  replaceTableData(data) {
    this.table.clear();
    this.table.rows.add(data);
    this.table.draw();
  }

  initTable() {
    const self = this;
    const dom = $(`#${self.DATATABLE_ID}`);
    this.table = dom.DataTable({
      orderMulti: true,
      data: self.data,
      columns: [
        { data: null },
        { data: null },
        { data: "bill_to" },
        { data: "created_at" }, // used for sorting so will hide this column
        { data: "email" },
        { data: "title" },
        { data: "branch_code" },
        { data: "created_at" },
        { data: "due_date" },
        { data: "final_bill" },
        { data: "remain_bill" },
        { data: "status" },
        { data: "" },
      ],
      autoWidth: false,
      columnDefs: [
        { width: "15%", targets: 5 },
        { className: "product-title", targets: 5 },
        { className: "branch-code", targets: 6 },
        { className: "text-center", targets: [6, 7, 8] },
        { orderable: false, targets: [1, 4, 5] },
        {
          className: "control",
          orderable: false,
          targets: 0,
          defaultContent: "",
        },
        {
          targets: 3,
          visible: false,
        },
        {
          targets: 7,
          orderable: true,
          render: function (data, type, full, meta) {
            return moment(data).format("YYYY-MM-DD HH:mm:ss");
          },
        },
        {
          targets: 8,
          orderable: true,
          render: function (data, type, full, meta) {
            return `
              <span class="${self.badgeClass}">
                ${moment(data).format("YYYY-MM-DD HH:mm:ss")}
              </span>
            `;
          },
        },
        {
          targets: 9,
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
          targets: 10,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
            <span class="badge badge-pill badge-warning">
              ${priceFormatter(data)}
            </span>
          `;
          },
        },
        {
          targets: 11,
          orderable: true,
          render: function (data, type, full, meta) {
            const statusColor = data === "OPEN" ? "danger" : "success";
            const isReconcile = full["is_reconcile"];
            const isClosed = full["status"] === "CLOSED";

            return `
              <div class="d-flex flex-column justify-content-between">
                <span class="badge badge-glow badge-${statusColor}">
                  ${data}
                </span>
                ${
                  !isReconcile && isClosed
                    ? `<span class="badge badge-light-info mt-25">
                      Belum Direkonsiliasi
                    </span>`
                    : ""
                }
              </div>
            `;
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: (data, type, full, meta) => {
            const billId = full.id;
            const billStatus = full.status;
            const productType = full.product_type;
            const paidBill = full.paid_bill;
            const isReconcile = full.is_reconcile;
            const isBillClosed = billStatus === "CLOSED";
            const isOfflineProduct = productType === "OFFLINE_PRODUCT";
            const isOnlineProduct = productType === "ONLINE_PRODUCT";
            const isCoinProduct = productType === "COIN_CURRENCY";
            const isBillHasBeenPaidOnce = paidBill > 0;
            const isAssessmentProducts =
              productType == "ASSESSMENT_EVENT_PRODUCT" ||
              productType == "ASSESSMENT_PRODUCT" ||
              productType == "ASSESSMENT_PSYCHOLOG_PRODUCT" ||
              productType == "BUNDLE_PSYCHOLOG_PRODUCT" ||
              productType == "ASSESSMENT_BUNDLE_PRODUCT" ||
              productType == "SIPLAH";
            const canEditBillDiscount =
              isOfflineProduct &&
              !isBillHasBeenPaidOnce &&
              !isReconcile &&
              !isAssessmentProducts;
            const isCentralBranch =
              full.branch_code === "PT0000" || full.branch_tag === "CENTRAL";
            const isUserCanReconcileBill =
              !isAssessmentProducts &&
              (this.user.branch_code === "PT0000" ||
                this.user.branch_code === null);

            const isBillReconcileable =
              !isReconcile &&
              isBillClosed &&
              isOfflineProduct &&
              isUserCanReconcileBill &&
              isCentralBranch;

            const isBillAlreadyReconciled =
              isReconcile &&
              isBillClosed &&
              isOfflineProduct &&
              isUserCanReconcileBill &&
              isCentralBranch;

            let reconcileButtonHtml = "";
            let returnPaymentHtml = "";
            let editDueDateHtml = "";
            let editBillDiscountHtml = "";

            let editBillNoteHtml = !isAssessmentProducts
              ? `
              <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
                full.id
              }/edit-note">
                ${feather.icons["edit"].toSvg({
                  class: "font-small-4",
                })} Edit Catatan Tagihan
              </a>
            `
              : "";

            let editBillStatusHtml = `<a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
              full.id
            }/edit-status">
          ${feather.icons["edit"].toSvg({
            class: "font-small-4",
          })}
          Edit Status Tagihan
          </a>`;

            let deleteBillHtml = isAssessmentProducts
              ? ""
              : `
            <div class="dropdown-divider"></div>
            <a class="btn btn-flat-transparent dropdown-item text-danger delete-bill">
            ${feather.icons["trash"].toSvg({
              class: "font-small-4 text-danger",
            })}
              Hapus Tagihan
            </a>
            `;

            if (isOfflineProduct) {
              if (isBillReconcileable) {
                reconcileButtonHtml = /* html */ `
                <div class="dropdown-divider"></div>
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
                  full.id
                }/rekonsiliasi" onclick="this.classList.add('disabled')">
                  ${feather.icons["dollar-sign"].toSvg({
                    class: "font-small-4",
                  })} Rekonsiliasi Tagihan
                </a>`;
              } else {
                reconcileButtonHtml = /*html*/ `
                  <div class="dropdown-divider"></div>
                  <a class="btn btn-flat-transparent dropdown-item w-100 disabled" href="#">
                    ${feather.icons["dollar-sign"].toSvg({
                      class: "font-small-4",
                    })} ${
                  isBillAlreadyReconciled
                    ? "Tagihan sudah direkonsiliasi"
                    : "Tagihan ini belum dapat direkonsiliasi"
                }
                  </a>`;
              }
            }

            if (
              isBillHasBeenPaidOnce &&
              !isReconcile &&
              (this.user.roles.includes("admin") ||
                this.user.roles.includes("keuangan"))
            ) {
              returnPaymentHtml = `
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
                  full.id
                }/retur-pembayaran">
                  ${feather.icons["file-plus"].toSvg({
                    class: "font-small-4",
                  })} Tambah Retur/Diskon Tagihan
                </a>
              `;
            }

            if (!isReconcile && !isAssessmentProducts) {
              editDueDateHtml = `
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
                  full.id
                }/due-date/edit">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4",
                  })} Edit Jatuh Tempo Tagihan
                </a>
              `;
            }

            if (canEditBillDiscount && !isAssessmentProducts) {
              editBillDiscountHtml = `
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/admin/tagihan/${
                  full.id
                }/final-discount/edit">
                  ${feather.icons["edit"].toSvg({
                    class: "font-small-4",
                  })} Edit Diskon Tagihan
                </a>
              `;
            }

            let detailHtml = /* html */ `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                Pilihan
                ${feather.icons["chevron-down"].toSvg({
                  class: "font-small-4",
                })}
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/detail/${
                  full.id
                }">
                  ${feather.icons["zoom-in"].toSvg({
                    class: "font-small-4",
                  })} Lihat Detail
                </a>
                <div class="dropdown-divider"></div>
                ${returnPaymentHtml}
                ${reconcileButtonHtml}
                ${editBillDiscountHtml}
                ${editDueDateHtml}
                ${
                  ["*", "edit_bill_status"].some((r) =>
                    this.userRole.includes(r)
                  )
                    ? editBillStatusHtml
                    : ""
                }
                ${
                  ["*", "edit_bill_note"].some((r) => this.userRole.includes(r))
                    ? editBillNoteHtml
                    : ""
                }
                ${
                  ["*", "delete_bill"].some((r) => this.userRole.includes(r))
                    ? deleteBillHtml
                    : ""
                }
              </div>
            </div>`;

            if (
              productType === "FRANCHISE_ACTIVATION" &&
              billStatus !== "CLOSED"
            ) {
              detailHtml = `
              <div class="inline-flex">
                <button class="btn btn-primary btn-sm pay-franchise-fee" data-id="${billId}">Lakukan Pembayaran</button>
              </div>
              `;
            }

            if (
              productType === "FRANCHISE_ACTIVATION" &&
              billStatus === "CLOSED"
            ) {
              detailHtml = `
              <div class="inline-flex">
                <button class="btn btn-primary btn-sm" data-id="${billId}" disabled>Lakukan Pembayaran</button>
              </div>
              `;
            }

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
      order: [[7, "desc"]],
      dom: `<"card-header border-bottom p-1"<"p-0 head-label"><"p-0 tag-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>`,
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: ["*", "show_all_bill"].some((r) => this.userRole.includes(r))
        ? [
            {
              extend: "collection",
              className: "btn btn-primary",
              text:
                feather.icons["zoom-in"].toSvg({
                  class: "font-small-4 mr-50",
                }) + "Lihat Seluruh Transaksi Tagihan",
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
              action: function (e, dt, node, config) {
                window.location.href = "/tagihan/semua";
              },
            },
          ]
        : [],
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });

    self.table
      .on("order.dt search.dt draw.dt", () => {
        if (
          this.selectedProductType == "ONLINE_PRODUCT" ||
          this.selectedProductType == "COIN_CURRENCY" ||
          (this.query.has("branch_code") && this.query.has("type"))
        ) {
          $("#branch-code-header").addClass("d-none");
          $(".branch-code").addClass("d-none");
        } else {
          $("#branch-code-header").removeClass("d-none");
          $(".branch-code").removeClass("d-none");
        }

        self.table
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each((cell, i) => (cell.innerHTML = i + 1));
      })
      .draw();

    self.table.on("page.dt", () => {
      if (
        this.selectedProductType == "ONLINE_PRODUCT" ||
        this.selectedProductType == "COIN_CURRENCY" ||
        (this.query.has("branch_code") && this.query.has("type"))
      ) {
        $("#branch-code-header").addClass("d-none");
        $(".branch-code").addClass("d-none");
      } else {
        $("#branch-code-header").removeClass("d-none");
        $(".branch-code").removeClass("d-none");
      }
    });

    $(document).on("click", `.${self.DELETE_CLASS}`, function () {
      var data = self.table.row($(this).closest("tr")).data();
      const id = data?.id;
      if (!id) return;
      self.deleteBill(id);
    });

    $(document).on("click", ".transaction-detail-btn", function (event) {
      const button = $(event.target);
      const billId = button.data("id");

      self.fetchBillTransaction(billId, function (data) {
        const transactionDetailModal = $("#transaction-detail-modal");

        const transactionNumberColumn = $("#transaction-number-column");
        const transactionNoteColumn = $("#transaction-note-column");
        const transactionAmountColumn = $("#transaction-amount-column");
        const transactionFeeColumn = $("#transaction-fee-column");
        const transactionSubTotalColumn = $("#transaction-subtotal-column");
        const transactionMethodColumn = $("#transaction-method-column");
        const transactionStatusColumn = $("#transaction-status-column");
        const transactionCreatedByColumn = $("#transaction-created-by-column");
        const transactionDateColumn = $("#transaction-date-column");
        const transactionPaymentProofColumn = $(
          "#transaction-payment-proof-column"
        );
        const transactionActionColumn = $("#transaction-action-column");

        const transaction = data[0];
        const transactionMethod = transaction.transaction_method;
        const isTransactionMethodManual = transactionMethod.includes("MANUAL");

        let transactionStatusBadgeColor;
        let transactionProofPaymentLabel;

        if (transaction.transaction_status === "APPROVED")
          transactionStatusBadgeColor = "success";
        else if (transaction.transaction_status === "PENDING")
          transactionStatusBadgeColor = "warning";
        else if (transaction.transaction_status === "CANCELED")
          transactionStatusBadgeColor = "secondary";
        else transactionStatusBadgeColor = "danger";

        if (
          !Array.isArray(transaction.document) ||
          !transaction.document.length
        ) {
          transactionProofPaymentLabel = `
            <span class="badge badge-light-secondary">
              Belum Ada
            </span>
          `;
        } else {
          const latestProofPayment =
            transaction?.document[transaction?.document?.length - 1];
          transactionProofPaymentLabel = `
            <a href="${latestProofPayment?.path}" target="_blank">
              <span class="badge badge-light-primary">
                Lihat Bukti Pembayaran ${feather.icons["external-link"].toSvg()}
              </span>
            </a>
          `;
        }

        transactionNumberColumn.html(`#${transaction.id}`);
        transactionNoteColumn.html(`${transaction.note ?? "-"}`);
        transactionAmountColumn.html(`
          <span class="badge badge-pill badge-success">
            ${feather.icons["arrow-down"].toSvg()}
            ${priceFormatter(transaction.amount)}
          </span>
        `);
        transactionFeeColumn.html(`
          <span class="badge badge-pill badge-warning">
            ${priceFormatter(transaction.transaction_fee)}
          </span>
        `);
        transactionSubTotalColumn.html(`
          <span class="badge badge-pill badge-primary">
            ${priceFormatter(transaction.final_transaction)}
          </span>
        `);
        transactionMethodColumn.html(
          `${self.getTransactionPaymentMethod(transaction.transaction_method)}`
        );
        transactionStatusColumn.html(`
          <span class="badge badge-glow badge-${transactionStatusBadgeColor} capitalize">
            ${transaction.transaction_status}
          </span>
        `);
        transactionCreatedByColumn.html(`${transaction.created_by}`);
        transactionDateColumn.html(`
          ${moment(transaction.created_at).format("DD MMM YYYY HH:mm:ss")} WIB
        `);
        transactionPaymentProofColumn.html(`${transactionProofPaymentLabel}`);
        if (!isTransactionMethodManual) {
          transactionActionColumn.html(`Pilihan aksi tidak tersedia`);
        } else {
          transactionActionColumn.html(
            /* html */
            `
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary action-button" data-toggle="dropdown">
                  <span class="action-button-label">Pilih Aksi</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down font-small-4"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <form id="approve-transaction-form" method="POST">
                    <input type="hidden" name="approve_transaction_id" id="approve-transaction-id" />
                    <input type="hidden" name="approve_bill_id" id="approve-bill-id">
                    <button id="approve-transaction-button" type="submit" class="dropdown-item">
                      Terima Transaksi
                    </button>
                  </form>
                  <form id="reject-transaction-form" method="POST">
                    <input type="hidden" name="reject_transaction_id" id="reject-transaction-id" />
                    <input type="hidden" name="reject_bill_id" id="reject-bill-id">
                    <button id="reject-transaction-button" type="submit" class="dropdown-item text-danger">
                      Tolak Transaksi
                    </button>
                  </form>
                </div>
              </div>
            `
          );

          const approveTransactionIdInput = $("#approve-transaction-id");
          const approveBillIdInput = $("#approve-bill-id");
          const rejectTransactionIdInput = $("#reject-transaction-id");
          const rejectBillIdInput = $("#reject-bill-id");

          approveTransactionIdInput.attr("value", transaction.id);
          rejectTransactionIdInput.attr("value", transaction.id);
          approveBillIdInput.attr("value", transaction.bill_id);
          rejectBillIdInput.attr("value", transaction.bill_id);
        }
        transactionDetailModal.modal("show");
      });
    });

    $(document).on("submit", "#approve-transaction-form", function (event) {
      event.preventDefault();
      const transactionId = $("#approve-transaction-id").val();
      const billId = $("#approve-bill-id").val();
      const url = `/api/finance/bill/${billId}/online-transaction/${transactionId}/approve`;

      $.ajax({
        url: url,
        method: "POST",
        headers: { "X-CSRF-TOKEN": self.getCsrf() },
        beforeSend: function () {
          $(".action-button").attr("disabled", true);
          $(".action-button-label").html(
            `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
          );
        },
        success: function () {
          $(".action-button").attr("disabled", false);
          $(".action-button-label").html(`Pilih Aksi`);
          $("#transaction-detail-modal").modal("hide");
          toastr.success("Transaksi tagihan berhasil diterima", "Berhasil!", {
            closeButton: true,
            tapToDismiss: false,
            timeOut: 3000,
          });
          window.location.reload();
        },
        error: function () {
          $(".action-button").attr("disabled", false);
          $(".action-button-label").html(`Pilih Aksi`);
          $("#transaction-detail-modal").modal("hide");
          toastr.success(
            "Proses terima transaksi tagihan gagal, silakan coba lagi nanti",
            "Terjadi Keslahan!",
            {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            }
          );
        },
      });
    });

    $(document).on("submit", "#reject-transaction-form", function (event) {
      event.preventDefault();
      const transactionId = $("#reject-transaction-id").val();
      const billId = $("#reject-bill-id").val();
      const url = `/api/finance/bill/${billId}/online-transaction/${transactionId}/reject`;

      $.ajax({
        url: url,
        method: "POST",
        headers: { "X-CSRF-TOKEN": self.getCsrf() },
        beforeSend: function () {
          $(".action-button").attr("disabled", true);
          $(".action-button-label").html(
            `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
          );
        },
        success: function () {
          $(".action-button").attr("disabled", false);
          $(".action-button-label").html(`Pilih Aksi`);
          $("#transaction-detail-modal").modal("hide");
          toastr.success("Transasksi tagihan berhasil ditolak", "Berhasil!", {
            closeButton: true,
            tapToDismiss: false,
            timeOut: 3000,
          });
          window.location.reload();
        },
        error: function () {
          $(".action-button").attr("disabled", false);
          $(".action-button-label").html(`Pilih Aksi`);
          $("#transaction-detail-modal").modal("hide");
          toastr.success(
            "Proses penolakan transaksi tagihan gagal, silakan coba lagi nanti",
            "Terjadi Keslahan!",
            {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            }
          );
        },
      });
    });

    $(document).on("click", ".pay-franchise-fee", function (event) {
      const billId = event.target.dataset.id;
      const buttonElement = event.target;

      $(buttonElement).attr("disabled", true);
      self.fetchBillTransaction(billId, function (data) {
        const transaction = data[0];
        const paymentWebHost = self.getPaymentWebHost();
        const paymentUrl = `${paymentWebHost}/transaction/${transaction.encrypted_id}`;
        window.open(paymentUrl, "_blank");
        $(buttonElement).attr("disabled", false);
      });
    });
  }

  appendOnlineTransactionModal() {
    const modalElement = /* html */ `
    <div class="modal fade" id="transaction-detail-modal" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Detail Transaksi Tagihan</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
          </div>
          <div class="modal-body">
            <table class="table">
              <tr>
                <td>No. Transaksi:</td>
                <td id="transaction-number-column"></td>
              </tr>
              <tr>
                <td>Catatan:</td>
                <td id="transaction-note-column"></td>
              </tr>
              <tr>
                <td>Total Bayar:</td>
                <td id="transaction-amount-column"></td>
              </tr>
              <tr>
                <td>Biaya:</td>
                <td id="transaction-fee-column">
                </td>
              </tr>
              <tr>
                <td>Sub Total:</td>
                <td id="transaction-subtotal-column">
                </td>
              </tr>
              <tr>
                <td>Metode Transaksi:</td>
                <td id="transaction-method-column"></td>
              </tr>
              <tr>
                <td>Status:</td>
                <td id="transaction-status-column"></td>
              </tr>
              <tr>
                <td>Dibuat oleh:</td>
                <td id="transaction-created-by-column"></td>
              </tr>
              <tr>
                <td>Tanggal Transaksi:</td>
                <td id="transaction-date-column"></td>
              </tr>
              <tr>
                <td>Bukti Pembayaran:</td>
                <td id="transaction-payment-proof-column"></td>
              </tr>
              <tr>
                <td>Aksi:</td>
                <td id="transaction-action-column"></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    `;
    $("body").append(modalElement);
  }

  async fetchData() {
    try {
      let branchCode = document.getElementById(this.BRANCH_CODE_FILTER_ID)
        ? document.getElementById(this.BRANCH_CODE_FILTER_ID).value
        : "PT0000";
      let type = this.selectedProductType;
      let url =
        type == "ONLINE_PRODUCT" || type == "COIN_CURRENCY"
          ? `/api/finance/bill/by-product-type/${type}`
          : `/api/finance/bill/by-branch/${branchCode}/${type}`;
      if (this.query.has("type") && this.query.has("branch_code")) {
        url = `/api/finance/bill/branch-code/${this.query.get(
          "branch_code"
        )}/unpaid/past-due-date`;
        type = null;
      }
      if (type == "ASSESSMENT_EVENT_PRODUCT") {
        url = "/api/finance/bill/assessment-event-products";
      }
      const response = await fetch(url);
      const data = await response.json();
      if (
        type == "ONLINE_PRODUCT" ||
        type == "COIN_CURRENCY" ||
        type == "ASSESSMENT_EVENT_PRODUCT" ||
        type == "ASSESSMENT_PRODUCT" ||
        type == "ASSESSMENT_PSYCHOLOG_PRODUCT" ||
        type == "BUNDLE_PSYCHOLOG_PRODUCT" ||
        type == "ASSESSMENT_BUNDLE_PRODUCT" ||
        type == "SIPLAH"
      ) {
        const selectedTransactionStatus = this.selectedTransactionStatus;
        if (selectedTransactionStatus) {
          const filteredData = data.filter((value) => {
            return value.status == this.selectedTransactionStatus;
          });
          return filteredData;
        }
        return data;
      }

      if (type == "FRANCHISE_ACTIVATION") {
        const filteredData = data.filter((value) => {
          return value.product_type == "FRANCHISE_ACTIVATION";
        });
        return filteredData;
      }

      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchBranch() {
    try {
      const getBranches = await fetch("/api/branch/all");
      const branches = await getBranches.json();
      return branches.data;
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

  getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  getBillType() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    return params.type ?? null;
  }

  getBadgeClass(billType) {
    switch (billType) {
      case "unpaid-past":
        return "badge badge-pill badge-h-plus-1";
      case "unpaid-today":
        return "badge badge-pill badge-h-min-0";
      case "unpaid-h-3":
        return "badge badge-pill badge-h-min-3";
      case "unpaid-h-1":
        return "badge badge-pill badge-h-min-1";
      default:
        return "";
    }
  }

  getBadgeText(billType) {
    switch (billType) {
      case "unpaid-past":
        return "Lewat tanggal jatuh tempo";
      case "unpaid-today":
        return "Jatuh tempo hari ini";
      case "unpaid-h-3":
        return "3 hari sebelum jatuh tempo";
      case "unpaid-h-1":
        return "1 hari sebelum jatuh tempo";
      default:
        return "";
    }
  }

  loadTagComponent() {
    if (!this.badgeClass && !this.badgeText) return;
    const html = `<span class="${
      this.badgeClass
    }" style="position: absolute;top: 15px;left: 135px;">${
      this.branches.find((value) => value.code == this.query.get("branch_code"))
        .name
    } (${this.query.get("branch_code")}) - ${
      this.badgeText
    } <span class="p-0 close-pointer">X</span></span>`;
    const header = $(".tag-label");
    header.append(html);
    this.listenClosePointerEventHandler();
  }

  listenClosePointerEventHandler() {
    const closePointer = $(".close-pointer");
    closePointer.click(() => {
      window.location.href = "/tagihan";
    });
  }

  async fetchBillTransaction(billId, callback) {
    try {
      const url = `/api/finance/bill/${billId}/transactions`;
      const response = await fetch(url);
      const data = await response.json();
      if (callback && typeof callback === "function") {
        callback(data);
        return;
      } else {
        return data;
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getTransactionPaymentMethod(key) {
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

  deleteBill(billId) {
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
          url: `/api/finance/bill/${billId}`,
          type: "DELETE",
          headers: { "X-CSRF-TOKEN": this.getCsrf() },
          success: async (response) => {
            const data = await this.fetchData();
            await this.replaceTableData(data);
            swal.close();
            toastr.success("Hapus Tagihan Berhasil", "Berhasil!", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            });
            $(".modal").modal("hide");
          },
          error: async (data) => {
            toastr.error("Hapus Tagihan Gagal", "Terjadi Kesalahan!", {
              closeButton: true,
              tapToDismiss: false,
              timeOut: 3000,
            });
            $(".modal").modal("hide");
          },
        });
      }
    });
  }

  getPaymentWebHost() {
    const dom = document.getElementById("paymentWebHost");
    return dom.innerText;
  }
}

const dt = new TransactionDatatable();
dt.init();
