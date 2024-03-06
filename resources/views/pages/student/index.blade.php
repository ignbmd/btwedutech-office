@extends('layouts/contentLayoutMaster')

@section('title', 'Siswa')

@section('vendor-style')
{{-- vendor css files --}}
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
    #DataTables_Table_0_length,
    #DataTables_Table_0_filter,
    #DataTables_Table_0_info,
    #DataTables_Table_0_paginate
    {
      padding-left: 1em;
      padding-right: 1em;
    }
  </style>
@endsection

@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th></th>
                <th>No</th>
                <th></th>
                <th>Nama</th>
                {{-- <th>Paket Online</th> --}}
                {{-- <th>Paket Tatap Muka</th> --}}
                <th>NIK</th>
                <th>Tanggal Lahir</th>
                <th>Nama Ibu Kandung</th>
                <th>Kelas yang diikuti</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal add student to class -->
  <x-learning.add-student-to-class-modal />
  <input type="hidden" id="branch-code" value="{{ auth()->user()->branch_code }}" />
  <input type="hidden" id="is-user-pusat" value="{{ $is_user_pusat }}" />
  <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
  <div id="student-page-allowed" class="d-none">{{json_encode($studentPageAllowed)}}</div>
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
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.checkboxes.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jszip.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/pdfmake.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/vfs_fonts.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/buttons.html5.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/buttons.print.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/student/student-datatables.js')) }}"></script>
<script>
  $(function() {
    const classRoomSelect = $("#classroom_id");
    const addStudentToClassModal = $("#modals-slide-in");
    const saveButton = $("#saveBtn");

    fetchClassrooms();

    // Events
    classRoomSelect.on('change', function(event) {
      if(!this.value) {
        saveButton.attr('disabled', true);
      } else {
        $.ajax({
          url: `/api/learning/classroom/${this.value}`,
          method: "GET",
          dataType: "json",
          beforeSend: function() {
            saveButton.attr('disabled', true);
          },
          success: function(response) {
            if(response.count_member >= response.quota) {
              $("#quota-full-warning").removeClass("d-none");
              saveButton.attr('disabled', true);
            } else {
              $("#quota-full-warning").addClass("d-none");
              saveButton.attr('disabled', false);
            }
          }
        });
      }
    });

    addStudentToClassModal.on('show.bs.modal', function(event) {
      const button = $(event.relatedTarget);

      const studentId = button.data('id');
      const studentName = button.data('name');

      const modal = $(this);
      modal.find('#smartbtw_id').val(studentId);
      modal.find('#student_name').val(studentName);
    });

    $("form").on("submit", function (e) {
      e.preventDefault();
      submitForm(this);
    });

    $(document).on("click", ".delete-button", function(event) {
      const id = $(this).data("id");
      showConfirmationPopUp(id);
    });



    // Functions
    function fetchClassrooms() {
      return $.ajax({
        url: '/api/learning/classroom?status=ONGOING',
        method: 'GET',
        dataType: 'json',
        success: function(results) {
          const data = [];
          results.data.forEach(function (el) {
            data.push({id: el._id, text: `${el.branch_code ?? "PT0000"} - ${el.title}`});
          });
          classRoomSelect.select2({
            data: data
          });
        }
      });
    }

    function submitForm(form) {
      saveButton.html(`Menyimpan Data`);
      saveButton.attr("disabled", true);
      form.classList.add('block-content');
      form.submit();
    }

    function showConfirmationPopUp(id) {
      Swal.fire({
        icon: "warning",
        title: "Konfirmasi",
        text: "Apa anda yakin ingin menghapus akun ini",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak"
      }).then((result) => {
        if(result.isConfirmed) deleteStudent(id);
      });
    }

    function deleteStudent(studentId) {
      const token = $("meta[name='csrf-token']").attr("content");

      $.ajax({
        url: `/api/students/${studentId}/delete`,
        type: "DELETE",
        data: {
          "smartbtw_id": studentId,
          "_token": token
        },
        success: function(data) {
          if(data.success) showDeleteSuccessToast(data);
        },
        error: function() {
          showDeleteErrorToast()
        }
      });
    }

    function showDeleteSuccessToast(data) {
      toastr.success(data?.message, "Hapus akun berhasil", {
        timeOut: 1500,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
        onHidden() {
          window.location.href = "/siswa";
        },
      })
    }

    function showDeleteErrorToast() {
      toastr.error("Proses hapus akun gagal, silakan coba lagi nanti", "Terjadi kesalahan", {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      })
    }

  });

</script>
@endsection
