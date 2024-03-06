@extends('layouts/contentLayoutMaster')

@section('title', 'Menu Dinamic')

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
    #product-table_length, #product-table_info {
      margin-left: 1em;
    }
    #product-table_filter, #product-table_paginate {
      margin-right: 1em;
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
              <a href="/dinamic-menu/tambah" class="btn btn-primary">
                <i data-feather="user-plus"></i>
                <span>Add data</span>
              </a>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Tags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @forelse($dataManusia ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->name }}</td>
                <td>
                    @foreach($data->tags as $tag)
                        <span class="badge badge-primary">{{ $tag->name }}</span>
                    @endforeach
                </td>               
                 <td>
                    <div class="btn-group">
                      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                        Action
                      </button>
                      <div class="dropdown-menu">
                        <a class="dropdown-item w-100" href="dinamic-menu/edit/{{ $data->id }}">
                          <i data-feather="edit"></i>
                          Edit</a>
                          <button class="dropdown-item action-delete w-100" data-id="{{ $data->id }}">
                            <i data-feather="trash"></i>
                            Delete</button>
                      </div>
                    </div>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="6" class="text-center">Data kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<style>
  tr:nth-child(even) {
      background-color:  #FFFFFF; /* Warna untuk kolom genap */
  }

  tr:nth-child(odd) {
      background-color: #f6f6f6; /* Warna untuk kolom ganjil */
  }
</style>
<script>
  $(".datatables-basic").DataTable({
    language: {
      paginate: {
        previous: "&nbsp;",
        next: "&nbsp;",
      },
    }
  });
</script>
<script>
  $(function() {
    //Events
    $(document).on("click", ".action-delete", function(event) {
      const id = $(this).data("id");
      showConfirmationPopUp(id);
    });

    //Functions
    function showConfirmationPopUp(id) {
      Swal.fire({
        icon: "warning",
        title: "Konfirmasi",
        text: "Apa anda yakin ingin menghapus application ini",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak"
      }).then((result) => {
        if(result.isConfirmed) deleteMenuDinamic(id);
      });
    }


    function deleteMenuDinamic(ssoId) {
        const token = $("meta[name='csrf-token']").attr("content");

         $.ajax({
           url: `/api/sso/application/${ssoId}`, /*nanti di ganti dengan api delete*/
           type: "DELETE",
           data : { "_token": token },
           success: function(data) {
             showDeleteSuccessToast(data);
            },
           error: function() {
             showDeleteErrorToast();
           }
        });
      } 

    function showDeleteSuccessToast(data) {
      toastr.success(data?.data.message, "Hapus Menu Dinamic berhasil", {
        timeOut: 1500,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
        onHidden() {
          window.location.href = "/admin-sso/applications"; /*di ganti dengan route index*/
        },
      })
    }
    function showDeleteErrorToast() {
      toastr.error("Proses hapus application gagal, silakan coba lagi nanti", "Terjadi kesalahan", {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      })
    }

  })
</script>
@endsection