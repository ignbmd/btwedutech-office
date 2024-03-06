class TransactionDatatable {
  constructor() {
    this.DATATABLE_ID = "transaction-table";
    this.FILTER_FORM_ID = "filter-form";
    this.FILTER_FORM_CONTAINER_ID = "filter-form-container";
    this.PRODUCT_TYPE_FILTER_ID = "product-type";

    this.data = [];
    this.table = null;
    this.user = this.getUser();
    this.userRole = this.getUserRoles();
    this.billType = this.getBillType();
    this.badgeClass = this.getBadgeClass(this.billType);
    this.badgeText = this.getBadgeText(this.billType);
    this.selectedProductType = "OFFLINE_PRODUCT";
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.productTypes = [
      { value: "OFFLINE_PRODUCT", label: "Produk Offline" },
      { value: "FRANCHISE_ACTIVATION", label: "Pembayaran Fee Franchise" },
    ];
    this.init();
  }

  async init() {
    this.data = await this.fetchData();
    this.initTable();
    this.setCardHeaderTitle("Daftar Tagihan");
    this.activateProductTypeFilter();
    this.loadTagComponent();
    this.fetchSecondSelect(this.selectedProductType);
    this.activateFormSubmitHandler(this.selectedProductType);
  }

  setCardHeaderTitle(title) {
    const element = $(".head-label");
    const headerTitle = `<h6 class="mb-0">${title}</h6>`;
    element.append(headerTitle);
  }

  initTable() {
    const self = this;
    const dom = $(`#${self.DATATABLE_ID}`);
    this.table = dom.DataTable({
      scrollX: true,
      data: self.data,
      columns: [
        { data: null },
        { data: null },
        { data: "bill_to" },
        { data: "created_at" }, // used for sorting so will hide this column
        { data: "email" },
        { data: "title" },
        { data: "created_at" },
        { data: "due_date" },
        { data: "final_bill" },
        { data: "remain_bill" },
        { data: "status" },
        { data: "" },
      ],
      autoWidth: false,
      columnDefs: [
        { width: "20%", targets: [4, 5] },
        { className: "text-center", targets: [6, 7] },
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
          targets: 6,
          orderable: true,
          render: function (data, type, full, meta) {
            return moment(data).format("YYYY-MM-DD HH:mm:ss");
          },
        },
        {
          targets: 7,
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
          targets: 8,
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
          targets: 9,
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
          targets: 10,
          orderable: false,
          render: function (data, type, full, meta) {
            const statusColor = data === "OPEN" ? "danger" : "success";
            return `
              <span class="badge badge-glow badge-${statusColor}">
                ${data}
              </span>
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

            const isReconcile = full.is_reconcile;
            const isBillClosed = billStatus === "CLOSED";
            const isOfflineProduct = productType === "OFFLINE_PRODUCT";
            const isOnlineProduct = productType === "ONLINE_PRODUCT";
            const isCentralBranch =
              full.branch_code === "PT0000" || full.branch_tag === "CENTRAL";
            const isFranchiseBranch = full.branch_tag === "FRANCHISE";

            const isUserCanReconcileBill =
              this.user.branch_code === "PT0000" ||
              this.user.branch_code === null;
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
              isCentralBranch;

            let reconcileButtonHtml = "";
            let editDueDateHtml = "";
            let editBillNoteHtml = `
              <a class="btn btn-flat-transparent dropdown-item w-100" href="/tagihan/${
                full.id
              }/edit-note">
                ${feather.icons["edit"].toSvg({
                  class: "font-small-4",
                })} Edit Catatan Tagihan
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

            if (!isReconcile) {
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

            let detailHtml = /* html */ `
            <div class="d-inline-flex">
              <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary action-button" data-toggle="dropdown">
                <span class="action-button-label">Pilih Aksi</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down font-small-4"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </a>
              <div class="dropdown-menu dropdown-menu-right">
                <a
                  href="/tagihan/detail/${full.id}"
                  class="btn btn-flat-transparent dropdown-item w-100"
                >
                  ${feather.icons["zoom-in"].toSvg({
                    class: "font-small-4",
                  })} Lihat Detail Tagihan
                </a>
                ${editDueDateHtml}
                ${
                  ["*", "edit_bill_note"].some((r) => this.userRole.includes(r))
                    ? editBillNoteHtml
                    : ""
                }
                ${reconcileButtonHtml}
              </div>
            </div>
            `;

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
      .on("order.dt search.dt", function () {
        self.table
          .column(1, { search: "applied", order: "applied" })
          .nodes()
          .each((cell, i) => (cell.innerHTML = i + 1));
      })
      .draw();

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

  activateProductTypeFilter() {
    this.initProductTypeFilter();
    this.listenProductTypeFilter();
  }

  initProductTypeFilter() {
    const html = `
    <div class="col-md-6">
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
  }

  listenProductTypeFilter() {
    const dom = document.getElementById(this.PRODUCT_TYPE_FILTER_ID);
    dom.addEventListener("change", (e) => {
      this.selectedProductType = e.target.value;
      this.fetchSecondSelect(this.selectedProductType);
      this.activateFormSubmitHandler(this.selectedProductType);
    });
  }

  fetchSecondSelect() {
    this.fetchSubmitButton();
  }

  fetchSubmitButton() {
    const html = `
    <div class="col-md-6" id="submit-button">
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

  async fetchData() {
    try {
      const branchCode = this.user.branch_code;
      let type = this.selectedProductType;

      const url = `/api/finance/bill/by-branch/${branchCode}/${type}`;
      const response = await fetch(url);
      let data = await response.json();
      if (this.billType) data = this.getFilteredBillData(data);
      if (this.type === "FRANCHISE_ACTIVATION")
        data = this.getFranchiseActivationBill(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getUserRoles() {
    const dom = document.getElementById("allowed");
    return JSON.parse(dom.innerText);
  }

  getUser() {
    const dom = document.getElementById("user");
    return JSON.parse(dom.innerText);
  }

  getFilteredBillData(data) {
    const filteredData = data.filter((bill) => this.getFilterCondition(bill));
    return filteredData;
  }

  getFranchiseActivationBill(data) {
    const filteredData = data.filter(
      (bill) => bill.product_type === "FRANCHISE_ACTIVATION"
    );
    return filteredData;
  }

  getFilterCondition(data) {
    const due_date = new Date(data.due_date);
    due_date.setHours(0, 0, 0, 0);

    const differenceInMiliseconds =
      due_date.getTime() - this.currentDate.getTime();
    const differenceInDays = Math.ceil(
      differenceInMiliseconds / (1000 * 3600 * 24)
    );
    const billIsOpen = data.status === "OPEN";

    if (this.billType === "unpaid-past")
      return billIsOpen && differenceInDays < 0;
    if (this.billType === "unpaid-today")
      return billIsOpen && differenceInDays === 0;
    if (this.billType === "unpaid-h-1")
      return billIsOpen && differenceInDays === 1;
    if (this.billType === "unpaid-h-3")
      return billIsOpen && differenceInDays === 3;

    return true;
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
    const html = `<span class="${this.badgeClass}" style="position: absolute;top: 11px;left: 135px;">${this.badgeText} <span class="p-0 close-pointer">X</span></span>`;
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

  getPaymentWebHost() {
    const dom = document.getElementById("paymentWebHost");
    return dom.innerText;
  }
}

const dt = new TransactionDatatable();
