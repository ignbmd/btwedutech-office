$(function () {
  "use strict";

  const branchTableEl = $("#branch-table");
  const getLastSegment = () => {
    const lastSegment = window.location.href.substring(
      window.location.href.lastIndexOf("/") + 1
    );
    const lastSegmentWithoutQuery = lastSegment.split("?")?.[0];
    return lastSegmentWithoutQuery;
  };

  function deleteConfirmation(id) {
    Swal.fire({
      icon: "warning",
      title: "Konfirmasi",
      text: "Apa anda yakin ingin menghapus data ini",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) deleteBranchPaymentMethod(id);
    });
  }

  function deleteBranchPaymentMethod(id) {
    const token = $("meta[name='csrf-token']").attr("content");

    $.ajax({
      url: `/api/branch-payment-method/${id}`,
      type: "DELETE",
      headers: { "X-CSRF-TOKEN": token },
      success: function (data) {
        if (data.success) showDeleteSuccessToast(data);
      },
      error: function () {
        showDeleteErrorToast();
      },
    });
  }

  function showDeleteSuccessToast(data) {
    toastr.success("Data berhasil dihapus", "Berhasil", {
      timeOut: 1500,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/cabang/metode-pembayaran/${getLastSegment()}`;
      },
    });
  }

  function showDeleteErrorToast() {
    toastr.error(
      "Proses hapus data gagal, silakan coba lagi nanti",
      "Terjadi kesalahan",
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      }
    );
  }

  if (branchTableEl.length) {
    const branchDtTable = branchTableEl.DataTable({
      ajax: `/api/branch-payment-method/${getLastSegment()}`,
      columns: [{ data: "transaction_method" }, { data: "" }],
      columnDefs: [
        {
          targets: 0,
          orderable: false,
          render: function (data, type, full, meta) {
            const document = full["document"];
            return document.length
              ? `<a href="${document[0].path}" target="__blank">${data}</a>`
              : data;
          },
        },
        {
          // Actions
          targets: -1,
          orderable: false,
          render: function (data, type, full, meta) {
            const id = full["id"];
            return `
              <div class="d-inline-flex">
                <button class="pr-1 hide-arrow text-primary btn btn-sm btn-danger delete-button" id=${id}>
                  Hapus
                </button>
              </div>`;
          },
        },
      ],
      order: [[1, "desc"]],
      dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text:
            feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
            "Buat Metode Pembayaran Baru",
          className: "create-new btn btn-primary",
          action: () => {
            window.location = `/cabang/metode-pembayaran/tambah/${getLastSegment()}`;
          },
          init: function (api, node, config) {
            $(node).removeClass("btn-secondary");
          },
        },
      ],
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });
  }

  $(document).on("init.dt", function (e, settings) {
    const deleteButtonEl = $(".delete-button");
    deleteButtonEl.on("click", function () {
      deleteConfirmation(this.id);
    });
  });
});
