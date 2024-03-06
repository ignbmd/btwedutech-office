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

  let isProductOnline;
  let isProductCoin;
  let isCoinCurrency;
  let isProductAssessment;

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
        `<option value="PACKAGE">PACKAGE</option>`,
        `<option value="TRYOUT">TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL">LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL">VIDEO_MATERIAL</option>`,
      ];
      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else if (element.val() && element.val() === "COIN_PRODUCT") {
      isProductOnline = false;
      isProductCoin = true;
      isCoinCurrency = false;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Wajib diisi)");
      const subProductTypeOptions = [
        `<option value="PACKAGE">PACKAGE</option>`,
        `<option value="TRYOUT">TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL">LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL">VIDEO_MATERIAL</option>`,
      ];
      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else if (element.val() && element.val() === "COIN_CURRENCY") {
      isProductOnline = false;
      isProductCoin = false;
      isCoinCurrency = true;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Wajib diisi)");
      const subProductTypeOptions = [
        `<option value="COIN_ITEM">COIN_ITEM</option>`,
      ];
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
        `<option value="PACKAGE">PACKAGE</option>`,
        `<option value="TRYOUT">TRYOUT</option>`,
        `<option value="LEARNING_MATERIAL">LEARNING_MATERIAL</option>`,
        `<option value="VIDEO_MATERIAL">VIDEO_MATERIAL</option>`,
      ];
      subProductType.attr("required", true);
      subProductType.html(subProductTypeOptions);
    } else {
      isProductOnline = false;
      isProductCoin = false;
      isCoinCurrency = false;
      isProductAssessment = false;
      subProductTypeStateLabel.text("(Opsional)");
      const subProductTypeOptions = [`<option value="BOOK">BOOK</option>`];
      subProductType.attr("required", false);
      subProductType.html(subProductTypeOptions);
    }
  }

  // Show/Hide Sub Product Type
  // --------------------------------------------------------------------
  const productType = $("#type");

  productType.on("change", function (e) {
    checkProductSubType($(e.target));
    if (isProductAssessment) {
      hideAddNewLegacyElementVisibility();
    } else {
      fetchLegacyIds({ program: selectedProgram });
      loadLegacyIdElement();
    }
    loadCoinAmountElement();
    loadChildProductRadioButtonElement();
  });

  // --------------------------------------------------------------------
  let legacyContainer = $("#legacy-container");
  let coinAmountContainer = $("#coin-amount-container");
  let addNewLegacyContainer = $("#add-new-legacy-container");

  let legacyIdSelectElement =
    /* html */
    `
    <div class="form-group">
      <label class="form-label" for="legacy-id">
        ID Produk Legacy
      </label>
      <select id="legacy-id" name="legacy_id" class="select2 form-control form-control-lg">
      </select>
    </div>
    `;

  let createNewOnlineLegacyIdFormElement =
    /* html */
    `
    <div class="form-group">
      <label class="form-label" for="legacy_package_title">
        Judul Paket Legacy
      </label>
      <input name="legacy_package_title" id="legacy_package_title" class="form-control" required />
    </div>
    <div class="form-group">
      <label class="form-label" for="is_platinum">
        Tipe Paket Legacy
      </label>
      <select name="is_platinum" id="is_platinum" class="form-control select2" required>
        <option value="1">Paket Premium</option>
        <option value="0">Tryout Premium</option>
      </select>
    </div>
    `;

  let createNewOfflineLegacyIdFormElement =
    /* html */
    `
    <div class="form-group">
      <label class="form-label" for="legacy_package_title">
        Judul Paket Legacy
      </label>
      <input name="legacy_package_title" id="legacy_package_title" class="form-control" required />
    </div>
    `;

  let coinAmountFormElement =
    /* html */
    `
      <label class="form-label" for="coin_amount">
        Harga / Nilai Koin
      </label>
      <input type="text" name="coin_amount" class="form-control" id="coin_amount" required />
      `;

  function loadSelectLegacyIdElement() {
    legacyContainer.children().remove();
    legacyContainer.append(legacyIdSelectElement);
    fetchLegacyIds({ program: selectedProgram });
  }

  function loadCreateLegacyIdElement() {
    let elementToAppend;

    if (isProductOnline === undefined) return;

    if (isProductOnline || isProductCoin || isCoinCurrency) {
      elementToAppend = createNewOnlineLegacyIdFormElement;
      baseRule["is_platinum"] = {
        required: true,
      };
    } else {
      elementToAppend = createNewOfflineLegacyIdFormElement;
      baseRule["is_platinum"] = {
        required: false,
      };
    }
    baseRule["legacy_package_title"] = {
      required: true,
    };
    legacyContainer.children().remove();
    legacyContainer.append(elementToAppend);
  }

  function loadLegacyIdElement() {
    let isAddNewLegacyId = $("#add-new-legacy-true").is(":checked");
    let isSelectNewLegacyId = $("#add-new-legacy-false").is(":checked");
    if (addNewLegacyContainer.hasClass("d-none")) {
      addNewLegacyContainer.removeClass("d-none");
    }
    if (
      (!isAddNewLegacyId && !isSelectNewLegacyId) ||
      isProductOnline === undefined
    )
      return;
    if (isAddNewLegacyId) {
      loadCreateLegacyIdElement();
    } else loadSelectLegacyIdElement();
  }

  function hideAddNewLegacyElementVisibility() {
    if (!addNewLegacyContainer.hasClass("d-none")) {
      addNewLegacyContainer.addClass("d-none");
    }
    $("#add-new-legacy-true").prop("checked", false);
    $("#add-new-legacy-false").prop("checked", false);
    legacyContainer.children().remove();
  }

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

  $("input[type=radio][name=add-new-legacy]").on("change", loadLegacyIdElement);

  // jQuery Validation
  // --------------------------------------------------------------------
  var addPackageForm = $("#addPackageForm");

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
    "add-new-legacy": {
      required: true,
    },
  };

  if (isProductOnline || isProductCoin || isCoinCurrency) {
    baseRule["sub_product_type"] = {
      required: true,
    };
  }

  addPackageForm.validate({
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
        })} Menambah Data
      `);
      submitButton.attr("disabled", true);
      form.classList.add("block-content");
      form.submit();
    },
  });

  // Type Select2
  // --------------------------------------------------------------------
  $("#type").select2({
    placeholder: "Pilih Tipe Produk",
    minimumResultsForSearch: Infinity,
  });
  $("#sub-product-type").select2({
    placeholder: "Pilih Sub Tipe Produk",
    minimumResultsForSearch: Infinity,
    tags: true,
  });

  // Branchs Ajax
  // --------------------------------------------------------------------
  const selectBranchEl = $("#branch-code");

  function fetchAllBranch() {
    $.ajax({
      url: `/api/branch/all`,
      success: function (branchs) {
        const defaultOption = [
          '<option value="" selected>Pilih Kode Cabang</option>',
        ];

        const options = [
          ...branchs.data.map((branch) => {
            return `
            <option value="${branch.code}">${branch.code} - ${branch.name}</option>
          `;
          }),
        ];
        selectBranchEl.html(options);
      },
    });
  }
  fetchAllBranch();

  // Included Product Ajax
  // --------------------------------------------------------------------
  const selectIncludedProduct = $("#included-product");

  function fetchIncludedProduct({ program, branchCode }) {
    $.ajax({
      url: `/api/product/included-products/satuan`,
      success: function (results) {
        const options = results.data.map((item) => {
          return `
              <option value="${item._id}">${item.title} ${
            item.branch_code ? `(${item.branch_code})` : ""
          } (${item.product_code}) ${priceFormatter(item.sell_price)}</option>
            `;
        });
        selectIncludedProduct.html(options);
      },
    });
  }

  // Fetch Legacy Ids
  function fetchLegacyIds(program) {
    const currentLegacyId = $("#currentLegacyId").val();
    const selectLegacyId = $("#legacy-id");
    selectLegacyId.prop("disabled", true);
    selectLegacyId.select2({ placeholder: "Please wait..." });
    const isOnlineProduct =
      isProductOnline || isCoinCurrency || isProductCoin ? true : false;
    $.ajax({
      url: "/api/product/get-legacy-ids",
      method: "GET",
      dataType: "json",
      data: { program, isProductOnline: isOnlineProduct },
      success: function (results) {
        selectLegacyId.prop("disabled", false);
        selectLegacyId.select2({ placeholder: "-- Pilih Legacy Product --" });
        const options = results.data.map((item) => {
          return `
              <option value="${item.id}">${item.text}</option>
            `;
        });
        selectLegacyId.html(options);
        if ($(`#legacy-id option[value='${currentLegacyId}']`).length > 0) {
          selectLegacyId.val(JSON.parse(currentLegacyId));
        }
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
      },
    });
    $("#parent_product_id").prop("disabled", false);
  }

  let selectedProgram = $("#program").val();
  let selectedBranch = $("#branch-code").val();

  fetchIncludedProduct({
    program: selectedProgram,
    branchCode: selectedBranch,
  });

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
        ? `<input type="text" class="form-control" name="max_discount_amount" id="max_discount_amount" placeholder="Inputkan Maksimal Diskon" required />`
        : `<input type="number" class="form-control" name="max_discount_amount" id="max_discount_amount" placeholder="Inputkan Maksimal Diskon" min="0" max="100" required />`;

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
    new Cleave(element, {
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
