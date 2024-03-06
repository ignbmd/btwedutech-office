@extends('layouts/contentLayoutMaster')

@section('title', 'Atur Besaran Komisi Per Mitra')

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
              <a href="/pengaturan-porsi/per-mitra/tambah" class="btn btn-primary">
                <i data-feather="user-plus"></i>
                <span>Tambah</span>
              </a>
            </div>
          </div>
        </div>
        <table class="datatables-basic table">
          <caption class="d-none">Pengaturan Porsi Per Mitra</caption>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Mitra</th>
              <th>Email Mitra</th>
              <th>Pengaturan Porsi Mitra</th>
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
                  class="btn btn-sm btn-outline-primary show-affiliate-portion-btn"
                  data-affiliate-id="{{ $affiliate->id }}"
                  data-affiliate-name="{{ $affiliate->name }}"
                  data-affiliate-email="{{ $affiliate->email }}"
                >
                  Lihat Pengaturan Porsi
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
</section>
<div
  class="modal fade"
  id="affiliate-portion-modal"
  tabindex="-1"
  role="dialog"
  aria-labelledby="affiliate-portion-modal-label"
  aria-hidden="false"
>
  <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="affiliate-portion-modal-label"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <table id="affiliate-portion-modal-table" class="table table-striped text-center">
          <caption class="d-none">Affiliate Portion Setting</caption>
          <thead>
            <th>No</th>
            <th>Produk</th>
            <th>Tipe Porsi</th>
            <th>Tipe Nominal Porsi</th>
            <th>Nominal Porsi</th>
            <th>Aksi</th>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Produk 1</td>
              <td>Upliner/Downliner</td>
              <td>10</td>
              <td>PERCENT</td>
              <td>
                <button class="btn btn-warning btn-sm">Edit</button>
              </td>
              <td colspan="6">Data tidak ditemukan</td>
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
    const showAffiliatePortionButton = $(".show-affiliate-portion-btn");
    const affiliatePortionModal = $("#affiliate-portion-modal");
    const affiliatePortionModalLabel = $("#affiliate-portion-modal-label");
    const affiliatePortionModalTableBody = $("#affiliate-portion-modal-table tbody");
    const affiliatePortionModalTable = $("#affiliate-portion-modal-table");
    $(".datatables-basic").DataTable({
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      }
    });

    // Event Listener
    $(document).on("click", ".show-affiliate-portion-btn", handleOnClickShowAffiliatePortionButton);
    $(affiliatePortionModal).on("hidden.bs.modal", clearAndDeinitializeModalDatatable);

    // Functions
    function handleOnClickShowAffiliatePortionButton() {
      const clickedButtonElement = $(this);

      const affiliateId = clickedButtonElement.data("affiliate-id");
      const affiliateName = clickedButtonElement.data("affiliate-name");
      const affiliateEmail = clickedButtonElement.data("affiliate-email");

      (async function () {
        affiliatePortionModalLabel.text(`Pengaturan Porsi Mitra ${affiliateName} (${affiliateEmail})`);
        showAffiliatePortionButton.attr("disabled", true);
        const affiliatePortion = await fetchAffiliatePortionByAffiliateId(affiliateId);
        setupModalComponent(affiliatePortion);
        showAffiliatePortionButton.attr("disabled", false);
      })();
    }

    function setupModalComponent(affiliatePortion) {
      // Remove previous component
      affiliatePortionModalTableBody.empty();

      // Define new component markup & append it to the table body
      const markup = generateComponentMarkup(affiliatePortion);
      affiliatePortionModalTableBody.append(markup);

      // Initialize affiliate portion modal datatable
      affiliatePortionModalTable.DataTable({
        language: {
          paginate: {
            previous: "&nbsp;",
            next: "&nbsp;",
          },
        }
      });

      // Show the modal
      affiliatePortionModal.modal("show");
    }

    function generateComponentMarkup(affiliatePortion) {
      return !affiliatePortion.length
      ? `
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>Data tidak ditemukan</td>
            <td></td>
            <td></td>
          </tr>
        `
      : affiliatePortion.map(function (data, index) {
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
              <td>${data.type === "UPLINE_FEE" ? "UPLINE" : "DOWNLINE"}</td>
              <td>${data.amount_type}</td>
              <td>
                ${data.amount_type === "FIXED" ? `Rp. ${formatNumberWithThousandsSeparator(data.amount)}` : data.amount}
              </td>
              <td>
                <a class="btn btn-warning btn-sm" href="/pengaturan-porsi/per-mitra/${data.id}/edit">Edit</a>
              </td>
            </tr>
          `
        });
      ;
    }

    function formatNumberWithThousandsSeparator(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    function clearAndDeinitializeModalDatatable() {
      affiliatePortionModalTable.DataTable().clear().destroy();
    }

    async function fetchAffiliatePortionByAffiliateId(affiliateId) {
      try {
        const response = await fetch(`/api/affiliate-portion/affiliate-id/${affiliateId}`);
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
