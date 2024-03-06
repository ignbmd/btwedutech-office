"use strict";

class GenerateForm {
  constructor() {
    // DOM Element
    this.programSelectElement = $("#program");
    this.productSelectElement = $("#product");
    this.formElement = $("#generate-ebook-form");
    this.submitButtonElement = $("#submit-button");

    // Static config variable
    this.programs = [
      {
        id: "skd",
        text: "SKD",
      },
      {
        id: "skb",
        text: "SKB",
      },
      {
        id: "tps",
        text: "TPS",
      },
      {
        id: "tpa",
        text: "TPA",
      },
      {
        id: "pppk",
        text: "PPPK",
      },
      {
        id: "tka-saintek",
        text: "TKA Saintek",
      },
      {
        id: "tka-soshum",
        text: "TKA Soshum",
      },
      {
        id: "tka-campuran",
        text: "TKA Campuran",
      },
    ];

    // State variable
    this.selectedProgram = "";
    this.products = [];
    this.isFormSubmitted = false;

    // Change standard select element to select2 element
    // and set its initial value to null
    this.programSelectElement
      .select2({
        allowClear: true,
        placeholder: "Pilih program",
        data: this.programs,
      })
      .val(null)
      .trigger("change");
    this.productSelectElement
      .select2({
        allowClear: true,
        placeholder: "Pilih produk",
      })
      .val(null)
      .trigger("change");

    // Event listeners
    this.formElement.on("submit", this.onFormSubmit.bind(this));
    this.programSelectElement.on("change", this.onProgramChanged.bind(this));
  }

  onFormSubmit(event) {
    if (this.isFormSubmitted) return;

    event.preventDefault();
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda yakin data yang diinputkan sudah benar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: `Tidak`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isFormSubmitted = true;
        this.submitButtonElement.attr("disabled", true);
        this.formElement.addClass("block-content");
        this.formElement.submit();
      }
    });
  }

  async onProgramChanged(event) {
    // Reset previously populated products array
    this.products = [];
    this.productSelectElement.val(null).trigger("change");
    this.productSelectElement.empty();

    this.selectedProgram = event.target.value;
    if (this.selectedProgram) {
      // Disable necessary elements
      this.productSelectElement.prop("disabled", true).trigger("change");
      this.programSelectElement.prop("disabled", true);
      this.submitButtonElement.prop("disabled", true);

      // Fetch products by selected program
      this.products = await this.fetchOnlineProducts(this.selectedProgram);
      if (this.products.length) this.populateProductOptions();

      // Enable necessary elements after data fetch
      this.productSelectElement.prop("disabled", false).trigger("change");
      this.productSelectElement.val(null).trigger("change");
      this.programSelectElement.prop("disabled", false);
      this.submitButtonElement.prop("disabled", false);
    }
  }

  async fetchOnlineProducts(program) {
    try {
      const response = await fetch(
        `/api/product/online-package/${program}/options?module_packages_only=1`
      );
      const data = await response.json();
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  populateProductOptions() {
    this.products.forEach((product) => {
      const eachProductOptionElement = new Option(
        `${product.title} (${product.product_code})`,
        product.product_code,
        false,
        false
      );
      this.productSelectElement.append(eachProductOptionElement);
    });
  }
}

const generateForm = new GenerateForm();
