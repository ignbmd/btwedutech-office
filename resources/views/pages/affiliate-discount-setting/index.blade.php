@extends('layouts/contentLayoutMaster')

@section('title', 'Atur Besaran Diskon Per Mitra')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    #DataTables_Table_0_info, #DataTables_Table_0_length {
      margin-left: 1em;
    }
    #DataTables_Table_0_paginate, #DataTables_Table_0_filter {
      margin-right: 1em;
    }

    tr:nth-child(even) {
        background-color:  #FFFFFF; /* Warna untuk kolom genap */
    }

    tr:nth-child(odd) {
        background-color: #f6f6f6; /* Warna untuk kolom ganjil */
    }
  </style>
@endsection

@section('content')
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header border-bottom p-1">
          <div class="head-label"></div>
          <div class="text-right">
            <div class="d-inline-flex">
              <a href="/pengaturan-diskon/per-mitra/tambah" class="btn btn-primary">
                <i data-feather="user-plus"></i>
                <span>Tambah</span>
              </a>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <caption class="d-none">Pengaturan Diskon Per Mitra</caption>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Mitra</th>
                <th>Email Mitra</th>
                <th>Pengaturan Diskon Mitra</th>
              </tr>
            </thead>
            <tbody>
              @forelse($affiliates ?? [] as $index => $affiliate)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $affiliate->name }}</td>
                <td>{{ $affiliate->email }}</td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary show-affiliate-discount-setting-btn"
                    data-affiliate-refcode="{{ $affiliate->ref_code }}"
                    data-affiliate-name="{{ $affiliate->name }}"
                    data-affiliate-email="{{ $affiliate->email }}"
                  >
                    Lihat Pengaturan Diskon
                  </button>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="4" class="text-center">Data kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
<div
  class="modal fade"
  id="affiliate-discount-setting-modal"
  tabindex="-1"
  role="dialog"
  aria-labelledby="affiliate-discount-setting-modal-label"
  aria-hidden="false"
>
  <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="affiliate-discount-setting-modal-label"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <table id="affiliate-discount-setting-modal-table" class="table table-striped text-center">
          <caption class="d-none">Affiliate Discount Setting</caption>
          <thead>
            <th>No</th>
            <th>Produk</th>
            <th>Tipe Nominal Diskon</th>
            <th>Nominal Diskon</th>
            <th>Aksi</th>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Produk 1</td>
              <td>10</td>
              <td>PERCENT</td>
              <td>
                <button class="btn btn-warning btn-sm">Edit</button>
              </td>
              <td colspan="5">Data tidak ditemukan</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $(function() {

    // Data
    const productCodeName = @json($productCodeName);

    // Elements
    const showAffiliateDiscountSettingButton = $(".show-affiliate-discount-setting-btn");
    const affiliateDiscountSettingModal = $("#affiliate-discount-setting-modal");
    const affiliateDiscountSettingModalLabel = $("#affiliate-discount-setting-modal-label");
    const affiliateDiscountSettingModalTable = $("#affiliate-discount-setting-modal-table");
    const affiliateDiscountSettingModalTableBody = $("#affiliate-discount-setting-modal-table tbody");

    // Initialize index page datatable
    $(".datatables-basic").DataTable({
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      }
    });

    // Event Listener
    $(document).on("click", ".show-affiliate-discount-setting-btn", handleOnClickShowAffiliateDiscountSettingButton);
    $(affiliateDiscountSettingModal).on("hidden.bs.modal", clearAndDeinitializeModalDatatable);
    // Functions
    function handleOnClickShowAffiliateDiscountSettingButton() {
      const clickedButtonElement = $(this);

      const affiliateRefCode = clickedButtonElement.data("affiliate-refcode");
      const affiliateName = clickedButtonElement.data("affiliate-name");
      const affiliateEmail = clickedButtonElement.data("affiliate-email");

      (async function () {
        affiliateDiscountSettingModalLabel.text(`Pengaturan Diskon Mitra ${affiliateName} (${affiliateEmail})`);
        showAffiliateDiscountSettingButton.attr("disabled", true);
        const affiliateDiscountSettings = await fetchAffiliateDiscountSettingsByAffiliateCode(affiliateRefCode);
        setupModalComponent(affiliateDiscountSettings);
        showAffiliateDiscountSettingButton.attr("disabled", false);
      })();
    }

    function setupModalComponent(affiliateDiscountSettings) {
      // Remove previous component
      affiliateDiscountSettingModalTableBody.empty();

      // Define new component markup & append it to the table body
      const markup = generateComponentMarkup(affiliateDiscountSettings);
      affiliateDiscountSettingModalTableBody.append(markup);

      // Initialize affiliate discount setting modal datatable
      affiliateDiscountSettingModalTable.DataTable({
        language: {
          paginate: {
            previous: "&nbsp;",
            next: "&nbsp;",
          },
        }
      });

      // Show the modal
      affiliateDiscountSettingModal.modal("show");
    }

    function generateComponentMarkup(affiliateDiscountSettings) {
      return !affiliateDiscountSettings.length
      ? `
          <tr>
            <td></td>
            <td></td>
            <td>Data tidak ditemukan</td>
            <td></td>
            <td></td>

          </tr>
        `
      : affiliateDiscountSettings.map(function (data, index) {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>
                ${
                  productCodeName.hasOwnProperty(data.product_code)
                  ? `${productCodeName[data.product_code]} (${data.product_code})`
                  : data.product_code
                }
              </td>
              <td>${data.type}</td>
              <td>${data.type == "FIXED" ? formatNum(data.amount) : data.amount}</td>
              <td>
                <a class="btn btn-warning btn-sm" href="/pengaturan-diskon/per-mitra/${data.id}/edit">Edit</a>
              </td>
            </tr>
          `
        });
      ;
    }

    function formatNum(num, separator = ".", fraction) {
      var str = num.toLocaleString("en-US");
      str = str.replace(/\./, fraction);
      str = str.replace(/,/g, separator);
      return str;
    };

    function clearAndDeinitializeModalDatatable() {
      affiliateDiscountSettingModalTable.DataTable().clear().destroy();
    }

    async function fetchAffiliateDiscountSettingsByAffiliateCode(affiliateCode) {
      try {
        const response = await fetch(`/api/affiliate-discount-setting/affiliate-code/${affiliateCode}`);
        const data = await response.json();
        return data?.data ?? [];
      } catch (error) {
        console.error(error);
        return [];
      }
    }
  })
</script>
@endsection
