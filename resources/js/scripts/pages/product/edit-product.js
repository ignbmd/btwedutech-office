/*=========================================================================================
  File Name: form-validation.js
  Description: jquery bootstrap validation js
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: PIXINVENT
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(function () {
  "use strict";

  // Quill WYSIWYG (Description input form)
  const quill = new Quill("#description-container", {
    modules: {
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        ["link", "blockquote", "code-block", "image"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
      ],
    },
    theme: "snow",
  });

  let isProductOnline = false;
  let isProductCoin = false;
  let isCoinCurrency = false;
  let isProductAssessment = false;
  let selectedProgram = $("#program").val();
  let currentParentProductId = $("#current_parent_product_id").val();

  let legacyContainer = $("#legacy-container");

  let childProductContainer = $("#child-product-container");
  const childProductRadioButton = `
    <label class="form-label">
      Produk Turunan
    </label>
    <div class="d-flex">
      <div class="custom-control custom-radio mr-1">
        <input type="radio" id="is-child-product-true" name="is-child-product" class="is-child-product custom-control-input" value="1" required/>
        <label class="custom-control-label" for="is-child-product-true">Ya</label>
      </div>
      <div class="custom-control custom-radio">
        <input type="radio" id="is-child-product-false" name="is-child-product" class="is-child-product custom-control-input" value="0" />
        <label class="custom-control-label" for="is-child-product-false">Tidak</label>
      </div>
    </div>
  `;

  function loadChildProductRadioButtonElement() {
    unregisterEventListener($(".is-child-product"), "change");
    childProductContainer.children().remove();
    parentProductContainer.children().remove();
    const isOfflineProduct =
      !isProductOnline &&
      !isProductCoin &&
      !isCoinCurrency &&
      !isProductAssessment;
    if (isOfflineProduct) {
      childProductContainer.append(childProductRadioButton);
      registerEventListener(
        $(".is-child-product"),
        "change",
        childProductEventHandler
      );
      if (currentParentProductId) {
        $("#is-child-product-true").attr("checked", true);
        $("#is-child-product-true .is-child-product")
          .val("1")
          .trigger("change");
        loadParentProductSelectElement(true);
      } else {
        $("#is-child-product-false").attr("checked", true);
        $("#is-child-product-false .is-child-product")
          .val("0")
          .trigger("change");
      }
    }
  }

  function unregisterEventListener(element, action) {
    element.off(action);
  }

  function registerEventListener(element, action, callback) {
    element.on(action, callback);
  }

  function childProductEventHandler(event) {
    const isChildProduct = Boolean(+event.target.value);
    loadParentProductSelectElement(isChildProduct);
  }

  let parentProductContainer = $("#parent-product-container");
  let parentProductIdSelectElement = `
      <label class="form-label" for="parent_product_id">
        Produk Inti/Induk
      </label>
      <select id="parent_product_id" name="parent_product_id" class="select2 form-control form-control-lg">
      </select>
    `;
  function loadParentProductSelectElement(renderElement) {
    parentProductContainer.children().remove();
    if (renderElement) {
      const productType = $("#type").val();
      parentProductContainer.append(parentProductIdSelectElement);
      fetchParentProducts({ program: selectedProgram, type: productType });
    }
  }

  const currentProductType = $("#current_product_type").val();
  if (currentProductType === "OFFLINE_PRODUCT")
    loadChildProductRadioButtonElement();
  if (
    ["ASSESSMENT_PRODUCT", "ASSESSMENT_PSYCHOLOG_PRODUCT"].includes(
      currentProductType
    )
  ) {
    hideLegacyIdElementVisibility();
  } else {
    showLegacyIdElementVisibility();
  }
  $("#sub-product-type").select2({
    tags: true,
  });

  function priceFormatter(price) {
    const numberFormat = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    return numberFormat.format(price);
  }
  function checkProductSubType(element) {
    const subProductType = $("#sub-product-type");
    const currentSubProduct = $("#currentSubProductType").val();
    const currentSubProductObj = JSON.parse(currentSubProduct);
    const subProductTypeStateLabel = $("#sub-product-type-state-label");

    subProductType.empty();

    if (
      (element.val() && element.val() === "ONLINE_PRODUCT") ||
      (element.val() && element.val() === "ONLINE_PRODUCT_IOS") ||
      (element.val() && element.val() === "ONLINE_PRODUCT_ANDROID")
    ) {
      isProductOnline = true;
      isProductCoin = false;
      isCoinCurrency = false;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Wajib diisi)");

      const subProductTypeOptions = [
        `<option value="PACKAGE" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("PACKAGE")
            ? "selected"
            : ""
        }>PACKAGE</option>`,
        `<option value="TRYOUT" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("TRYOUT")
            ? "selected"
            : ""
        }>TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("LEARNING_MATERIAL")
            ? "selected"
            : ""
        }>LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("VIDEO_MATERIAL")
            ? "selected"
            : ""
        }>VIDEO_MATERIAL</option>`,
      ];
      const subProductTypeString = subProductTypeOptions.join();

      currentSubProductObj.forEach(function (value, index) {
        if (!subProductTypeString.includes(value))
          subProductTypeOptions.push(
            `<option value="${value}" selected>${value}</option>`
          );
      });

      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else if (element.val() && element.val() === "COIN_PRODUCT") {
      isProductOnline = false;
      isProductCoin = true;
      isCoinCurrency = false;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Wajib diisi)");
      const subProductTypeOptions = [
        `<option value="PACKAGE" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("PACKAGE")
            ? "selected"
            : ""
        }>PACKAGE</option>`,
        `<option value="TRYOUT" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("TRYOUT")
            ? "selected"
            : ""
        }>TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("LEARNING_MATERIAL")
            ? "selected"
            : ""
        }>LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("VIDEO_MATERIAL")
            ? "selected"
            : ""
        }>VIDEO_MATERIAL</option>`,
      ];
      const subProductTypeString = subProductTypeOptions.join();

      currentSubProductObj.forEach(function (value, index) {
        if (!subProductTypeString.includes(value))
          subProductTypeOptions.push(
            `<option value="${value}" selected>${value}</option>`
          );
      });
      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else if (element.val() && element.val() === "COIN_CURRENCY") {
      isProductOnline = false;
      isProductCoin = false;
      isCoinCurrency = true;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Wajib diisi)");
      const subProductTypeOptions = [
        `<option value="COIN_ITEM" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("COIN_ITEM")
            ? "selected"
            : ""
        }>COIN_ITEM</option>`,
      ];

      const subProductTypeString = subProductTypeOptions.join();

      currentSubProductObj.forEach(function (value, index) {
        if (!subProductTypeString.includes(value))
          subProductTypeOptions.push(
            `<option value="${value}" selected>${value}</option>`
          );
      });

      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else if (
      (element.val() && element.val() === "ASSESSMENT_PRODUCT") ||
      (element.val() && element.val() === "ASSESSMENT_PSYCHOLOG_PRODUCT")
    ) {
      isProductOnline = false;
      isProductCoin = false;
      isCoinCurrency = false;
      isProductAssessment = true;
      subProductTypeStateLabel.text("(Wajib diisi)");

      const subProductTypeOptions = [
        `<option value="PACKAGE" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("PACKAGE")
            ? "selected"
            : ""
        }>PACKAGE</option>`,
        `<option value="TRYOUT" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("TRYOUT")
            ? "selected"
            : ""
        }>TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("LEARNING_MATERIAL")
            ? "selected"
            : ""
        }>LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL" ${
          currentSubProductObj !== null &&
          currentSubProductObj.includes("VIDEO_MATERIAL")
            ? "selected"
            : ""
        }>VIDEO_MATERIAL</option>`,
      ];
      const subProductTypeString = subProductTypeOptions.join();

      currentSubProductObj.forEach(function (value, index) {
        if (!subProductTypeString.includes(value))
          subProductTypeOptions.push(
            `<option value="${value}" selected>${value}</option>`
          );
      });

      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else {
      isProductOnline = false;
      isProductCoin = false;
      isCoinCurrency = false;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Opsional)");

      const subProductTypeOptions = [
        `<option value="BOOK" ${
          currentSubProductObj !== null && currentSubProductObj.includes("BOOK")
            ? "selected"
            : ""
        }>BOOK</option>`,
      ];

      const subProductTypeString = subProductTypeOptions.join();

      currentSubProductObj.forEach(function (value, index) {
        if (!subProductTypeString.includes(value))
          subProductTypeOptions.push(
            `<option value="${value}" selected>${value}</option>`
          );
      });

      subProductType.attr("required", false);
      subProductType.html(subProductTypeOptions);
    }
  }

  function showLegacyIdElementVisibility() {
    if (legacyContainer.hasClass("d-none")) {
      legacyContainer.removeClass("d-none");
    }
  }

  function hideLegacyIdElementVisibility() {
    $("#legacy_id").val("0").trigger("change");
    if (!legacyContainer.hasClass("d-none")) {
      legacyContainer.addClass("d-none");
    }
  }

  let editLegacyProductBadge = $("#editLegacyProductBadge");
  let editLegacyProductModal = $("#editLegacyProductModal");
  let editLegacyProductForm = $("#editLegacyProductForm");
  let editLegacyProductSubmitButton = $("#editLegacyProductSubmitButton");

  editLegacyProductBadge.on("click", function () {
    const label = $(this).text();
    if (label === "Please wait...") alert("Still getting legacy product data");
    else {
      let legacyId = $("#legacy-id").val();
      let url;
      if (isProductOnline || isProductCoin || isCoinCurrency) {
        url = `/api/internal/online-legacy-product/${legacyId}`;
        $("#legacy_product_type_label").text("Tipe Produk Legacy");
        $("#legacy_product_type")
          .removeClass("d-none")
          .removeAttr("readonly")
          .removeAttr("disabled");
      } else {
        url = `/api/internal/offline-legacy-product/${legacyId}`;
        $("#legacy_product_type_label").text(null);
        $("#legacy_product_type")
          .addClass("d-none")
          .attr("readonly", true)
          .attr("disabled", true);
      }
      $.ajax({
        url: url,
        success: function (data) {
          $("#legacy_product_title").val(data?.title);
          if (isProductOnline || isProductCoin || isCoinCurrency)
            $("#legacy_product_type").val(data?.is_platinum).trigger("change");
          editLegacyProductModal.modal("show");
        },
      });
    }
  });

  editLegacyProductForm.on("submit", function (e) {
    e.preventDefault();
    const legacyId = $("#legacy-id").val();
    let url;
    let payload;
    editLegacyProductSubmitButton.text("Memperbarui...");
    editLegacyProductSubmitButton.attr("disabled", true);
    if (isProductOnline || isCoinCurrency || isProductCoin) {
      url = `/api/internal/online-legacy-product/${legacyId}`;
      payload = {
        title: $("#legacy_product_title").val(),
        is_platinum: $("#legacy_product_type").val(),
      };
    } else {
      url = `/api/internal/offline-legacy-product/${legacyId}`;
      payload = {
        title: $("#legacy_product_title").val(),
      };
    }

    $.ajaxSetup({
      headers: {
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
          .content,
      },
    });
    $.ajax({
      url: url,
      type: "PUT",
      data: payload,
      success: function () {
        fetchLegacyIds({ program: selectedProgram });
        editLegacyProductModal.modal("hide");
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        editLegacyProductSubmitButton.text("Perbarui");
        editLegacyProductSubmitButton.attr("disabled", false);
      },
    });
  });

  editLegacyProductModal.on("hide.bs.modal", function () {
    $("#legacy_product_title").val(null);
    $("#legacy_product_type").val(null).trigger("change");
  });

  // Show/Hide Sub Product Type
  // --------------------------------------------------------------------
  const productType = $("#type");
  checkProductSubType(productType);

  productType.on("change", function (e) {
    checkProductSubType($(e.target));
    if (isProductAssessment) {
      hideLegacyIdElementVisibility();
    } else {
      showLegacyIdElementVisibility();
      fetchLegacyIds({ program: selectedProgram });
    }
    loadCoinAmountElement();
    loadChildProductRadioButtonElement();
  });

  // jQuery Validation
  // --------------------------------------------------------------------
  var editPackageForm = $("#editPackageForm");
  var editSingleForm = $("#editSingleForm");
  let baseRule = {
    branch_code: {
      required: true,
    },
    program: {
      required: true,
    },
    legacy_id: {
      required: true,
    },
    base_price: {
      required: true,
    },
    sell_price: {
      required: true,
    },
    type: {
      required: true,
    },
    status: {
      required: true,
    },
    status: {
      required: true,
    },
    duration: {
      required: true,
    },
  };

  if (isProductOnline || isCoinCurrency || isProductCoin) {
    baseRule["sub_product_type"] = {
      required: true,
    };
  }

  let coinAmountContainer = $("#coin-amount-container");
  let coinAmountFormElement =
    /* html */
    `
      <label class="form-label" for="coin_amount">
        Harga / Nilai Koin
      </label>
      <input type="text" name="coin_amount" class="form-control" id="coin_amount" required />
    `;

  function loadCoinAmountElement() {
    coinAmountContainer.children().remove();
    if (isCoinCurrency || isProductCoin) {
      baseRule["coin_amount"] = {
        required: true,
      };
      coinAmountContainer.append(coinAmountFormElement);
      new Cleave(document.getElementById("coin_amount"), {
        numeral: true,
        numericOnly: true,
        numeralPositiveOnly: true,
        numeralDecimalMark: "thousand",
        delimiter: ".",
      });
    } else {
      baseRule["coin_amount"] = {
        required: false,
      };
      return;
    }
  }

  if (isCoinCurrency || isProductCoin) {
    coinAmountContainer.children().remove();
    baseRule["coin_amount"] = {
      required: true,
    };
    coinAmountContainer.append(coinAmountFormElement);
    const current_coin_amount = $('input[name="current_coin_amount"]').val();
    $("#coin_amount").val(current_coin_amount);
    new Cleave(document.getElementById("coin_amount"), {
      numeral: true,
      numericOnly: true,
      numeralPositiveOnly: true,
      numeralDecimalMark: "thousand",
      delimiter: ".",
    });
  }

  if (editSingleForm.length) {
    editSingleForm.validate({
      rules: baseRule,
    });
  }

  editPackageForm.validate({
    rules: {
      ...baseRule,
      included_product: {
        required: true,
      },
    },
    submitHandler: function (form) {
      let description = document.querySelector("#description");
      description.value = quill.container.firstChild.innerHTML;

      const submitButton = $(".data-submit");
      submitButton.html(`
        ${feather.icons["save"].toSvg({
          class: "font-small-4 mr-25",
        })} Memperbarui Data
      `);
      submitButton.attr("disabled", true);
      form.classList.add("block-content");
      form.submit();
    },
  });

  // Branchs Select Init
  const selectBranchEl = $("#branch-code");
  selectBranchEl.prop("readonly", true);

  // Branchs Ajax
  // --------------------------------------------------------------------
  const currentBranchCode = $("#currentBranchCode").val();

  function fetchAllBranch() {
    $.ajax({
      url: `/api/branch/all`,
      success: function (branchs) {
        selectBranchEl.prop("readonly", false);
        const defaultOption = [`<option value="">Pilih Kode Cabang</option>`];

        const options = [
          defaultOption,
          ...branchs.data.map((branch) => {
            return `
            <option value="${branch.code}">
              ${branch.code} - ${branch.name}
            </option>
          `;
          }),
        ];
        selectBranchEl.html(options);
        selectBranchEl.val(currentBranchCode);
      },
    });
  }
  fetchAllBranch();

  // Included Product Ajax
  // --------------------------------------------------------------------
  const selectIncludedProduct = $("#included-product");
  selectIncludedProduct.prop("disabled", true);
  selectIncludedProduct.select2({ placeholder: "Please wait..." });

  const currentIncludedProduct = $("#currentIncludedProduct").val();
  const currentIncludedProductObj = JSON.parse(currentIncludedProduct);

  function fetchIncludedProduct({ program, branchCode }) {
    $.ajax({
      url: `/api/product/included-products/satuan`,
      success: function (results) {
        selectIncludedProduct.prop("disabled", false);
        selectIncludedProduct.select2({ placeholder: "" });
        const options = results.data.map((item) => {
          return `
              <option value="${item._id}">${item.title} ${
            item.branch_code ? `(${item.branch_code})` : ""
          } (${item.product_code}) ${priceFormatter(item.sell_price)}</option>
            `;
        });
        const selectedIncludedProduct =
          currentIncludedProductObj.map((product) => product._id) ?? [];
        selectIncludedProduct.html(options);
        selectIncludedProduct.val(selectedIncludedProduct).trigger("change");
      },
    });
  }

  // ** Fetch Legacy Ids
  const currentLegacyId = $("#currentLegacyId").val();

  function fetchLegacyIds(program) {
    const isOnlineProduct =
      isProductOnline || isCoinCurrency || isProductCoin ? true : false;
    editLegacyProductBadge.text("Please wait...");
    editLegacyProductBadge.css("cursor", "default");
    const selectLegacyId = $("#legacy-id");
    selectLegacyId.prop("disabled", true);
    selectLegacyId.select2({ placeholder: "Please wait..." });
    $.ajax({
      url: "/api/product/get-legacy-ids",
      method: "GET",
      dataType: "json",
      data: { program, isProductOnline: isOnlineProduct },
      success: function (results) {
        selectLegacyId.prop("disabled", false);
        selectLegacyId.select2({ placeholder: "" });

        const options = results.data.map((item) => {
          return `
              <option value="${item.id}">${item.text}</option>
            `;
        });

        selectLegacyId.html(options);
        if ($(`#legacy-id option[value='${currentLegacyId}']`).length > 0) {
          selectLegacyId.val(JSON.parse(currentLegacyId)).trigger("change");
        }
        if (isProductAssessment) {
          selectLegacyId.val("0").trigger("change");
        }
        editLegacyProductBadge.text("Click to edit");
        editLegacyProductBadge.css("cursor", "pointer");
      },
    });
  }

  function fetchParentProducts({ program, type }) {
    $("#parent_product_id").prop("disabled", true);
    $("#parent_product_id").select2({
      placeholder: "-- Pilih Produk Inti/Induk --",
    });

    $.ajax({
      url: "/api/product/by-query",
      method: "GET",
      dataType: "json",
      data: {
        program: program,
        type: type,
        branch_code: "PT0000",
      },
      success: function (results) {
        const options = results.data.map((item) => {
          return `
              <option value="${item._id}">${item.title} ${
            item.branch_code ? `(${item.branch_code})` : ""
          } (${item.product_code}) ${priceFormatter(item.sell_price)}</option>
            `;
        });
        $("#parent_product_id").html(options);
        if (
          $(`#parent_product_id option[value='${currentParentProductId}']`)
            .length > 0
        ) {
          $("#parent_product_id").val(currentParentProductId);
        }
        $("#parent_product_id").prop("disabled", false);
      },
    });
  }

  // ** Fetch Included Product on Init, on Program & Branch Change
  let selectedBranch = $("#branch-code").val();

  fetchIncludedProduct({
    program: selectedProgram,
    branchCode: selectedBranch,
  });
  fetchLegacyIds({ program: selectedProgram });

  $("#program").on("change", function (e) {
    selectedProgram = e.target.value;
    fetchIncludedProduct({
      program: selectedProgram,
      branchCode: selectedBranch,
    });
    fetchLegacyIds({ program: selectedProgram });
    loadChildProductRadioButtonElement();
  });

  $("#branch-code").on("change", function (e) {
    selectedBranch = e.target.value;
    fetchIncludedProduct({
      program: selectedProgram,
      branchCode: selectedBranch,
    });
  });

  /**
   ---------------------------------------------------------------------
   Max Discount Form Input
   ---------------------------------------------------------------------
  */

  // Define DOM Elements
  const max_discount_container = $("#max_discount_container");
  const max_discount_type = $('input[name="max_discount_type"]');
  const sell_price = $("#sell-price");
  const current_max_discount_amount = $(
    'input[name="current_max_discount_amount"]'
  ).val();

  // Run these functions when page is loaded
  setDiscountLabel(getInitialDiscountType());
  loadDiscountAmountForm(getInitialDiscountType());

  // Declare Functions
  function getInitialDiscountType() {
    return $('input[name="max_discount_type"]:checked').val();
  }

  function setDiscountLabel(discountType) {
    const max_discount_amount_label = $("#max_discount_amount_label");
    const newLabel =
      discountType == "fixed" ? "Maksimal Diskon (Rp)" : "Maksimal Diskon (%)";

    max_discount_amount_label.empty();
    max_discount_amount_label.append(newLabel);
  }

  function loadDiscountAmountForm(discountType) {
    const form =
      discountType == "fixed"
        ? `<input type="text" class="form-control" name="max_discount_amount" id="max_discount_amount" placeholder="Inputkan Maksimal Diskon" value="${current_max_discount_amount}" required />`
        : `<input type="number" class="form-control" name="max_discount_amount" id="max_discount_amount" placeholder="Inputkan Maksimal Diskon" min="0" max="100" value="${current_max_discount_amount}" required />`;

    // Remove existing old error message label & old discount amount form input
    $("#max_discount_amount").attr("aria-invalid", false);
    $("#max_discount_amount").removeClass("error");
    $("#max_discount_amount-error").remove();

    $("#sell-price").attr("aria-invalid", false);
    $("#sell-price").removeClass("error");
    $("#sell-price-error").remove();

    $("#max_discount_amount").remove();

    // Add new discount amount form input to container
    max_discount_container.append(form);
    $(".data-submit").attr("disabled", false);

    if (discountType == "fixed") {
      addNumeralMask(document.getElementById("max_discount_amount"));
    }
    watchSellPriceValue();
  }

  function addNumeralMask(element) {
    const el = $(element);
    const cleave = new Cleave(element, {
      numeral: true,
      numericOnly: true,
      numeralPositiveOnly: true,
      numeralDecimalMark: "thousand",
      delimiter: ".",
      onValueChanged: function (event) {
        const maxDiscount = parseInt(event.target.rawValue);
        const sellPrice = parseInt(sell_price.val().replaceAll(".", ""));
        if (
          maxDiscount > sellPrice ||
          getNumberLength(sellPrice) < getNumberLength(maxDiscount)
        ) {
          $("#max_discount_amount").val(0);
        }
      },
    });
    cleave.setRawValue(current_max_discount_amount ?? 0);
  }

  function setMaximumDiscountValueInput(price) {
    const max_discount_amount = $("#max_discount_amount");
    max_discount_amount.attr("data-cleave-max", price);
  }

  function getNumberLength(number) {
    return number.toString().length;
  }

  function watchSellPriceValue() {
    const max_discount_amount = $("#max_discount_amount");

    const formattedMaxDiscount = parseInt(
      max_discount_amount.val().replaceAll(".", "")
    );
    const formattedSellPrice = parseInt(sell_price.val().replaceAll(".", ""));

    if (formattedSellPrice <= 0) {
      max_discount_amount.val(0);
    } else {
      setMaximumDiscountValueInput(formattedSellPrice);
    }

    if (
      formattedSellPrice <= formattedMaxDiscount ||
      getNumberLength(formattedSellPrice) <
        getNumberLength(formattedMaxDiscount)
    ) {
      max_discount_amount.val(0);
    }
  }

  // Event handlers
  max_discount_type.click(function (event) {
    setDiscountLabel(event.target.value);
    loadDiscountAmountForm(event.target.value);
  });

  sell_price.on("input", function (event) {
    watchSellPriceValue();
  });
});
