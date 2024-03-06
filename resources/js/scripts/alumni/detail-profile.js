$(function () {
  "use strict";

  const path = window.location.pathname;
  const trimmedPath = path.replace(/^\W+/, "");
  const splittedPath = trimmedPath.split("/");
  const [_, program, selection, id] = splittedPath;

  const deleteStudentBtn = $("#delete-alumni-btn");
  deleteStudentBtn.on("click", showConfirmationPopUp);

  function showConfirmationPopUp() {
    Swal.fire({
      icon: "warning",
      title: "Konfirmasi",
      text: "Apa anda yakin ingin menghapus data ini",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak"
    }).then((result) => {
      if(result.isConfirmed) deleteStudent();
    });
  }

  function deleteStudent() {
    const token = $("meta[name='csrf-token']").attr("content");

    $.ajax({
      url: `/api/alumni/${program}/${selection}/${id}`,
      type: "DELETE",
      headers: { "X-CSRF-TOKEN": token },
      success: function(data) {
        if(data.success) showDeleteSuccessToast(data);
      },
      error: function() {
        showDeleteErrorToast();
      }
    })
  }

  function showDeleteSuccessToast(data) {
    toastr.success("Data alumni berhasil dihapus", "Berhasil", {
      timeOut: 1500,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = "/alumni";
      },
    })
  }

  function showDeleteErrorToast() {
    toastr.error("Proses hapus alumni gagal, silakan coba lagi nanti", "Terjadi kesalahan", {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
    })
  }
});
