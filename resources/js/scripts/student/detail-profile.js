$(function () {
  "use strict";

  const path = window.location.pathname;
  const trimmedPath = path.replace(/^\W+/, "");
  const splittedPath = trimmedPath.split("/");
  const studentId = splittedPath[2];

  const deleteStudentBtn = $("#delete-student-btn");
  deleteStudentBtn.on("click", showConfirmationPopUp);

  function showConfirmationPopUp() {
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
      if(result.isConfirmed) deleteStudent()
    });
  }

  function deleteStudent() {
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
    })
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
