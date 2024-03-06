(function (window, document, $) {
  "use strict";
  var assetPath = "../../../app-assets/";

  if ($("body").attr("data-framework") === "laravel") {
    assetPath = $("body").attr("data-asset-path");
  }

  const path = window.location.pathname;
  const trimmedPath = path.replace(/^\W+/, "");
  const splittedPath = trimmedPath.split("/");
  const studentId = splittedPath[2];
  const sendRaportModal = $("#modals-slide-in");
  const sendReportForm = $('#send-report-form');

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  params.student_id = studentId;
  const generateExamTypeOptions = (params) => {
    $("#exam_type option:gt(0)").remove();
    $("#exam_type").attr("disabled", true);
    $.ajax({
      url: "/api/student-result/option/exam-type",
      method: "GET",
      dataType: "json",
      data: params,
      success: function (data, textStatus, jqXHR) {
        data.data.forEach(function (option) {
          $("#exam_type").append(
            $("<option></option>").attr("value", option.name).text(option.title)
          );
        });
        $("#exam_type").attr("disabled", false);
        if(params.exam_type) $('#exam_type').val(params.exam_type);
      },
    });
  };
  generateExamTypeOptions({ student_id: studentId, program: "skd", exam_type: params.exam_type });

  $("#program").on("change", function () {
    const program = $("#program").val();
    generateExamTypeOptions({ student_id: studentId, program: program });
  });

  $('#filter-report-button').on('click', function() {
    $('#report-content-form').attr('action', `/siswa/detail/${studentId}`);
    $('#report-content-form').trigger('submit');
  });

  $('#download-report-button').on('click', function() {
    $('#report-content-form').attr('action', `/siswa/report/${studentId}/download`);
    $('#report-content-form').trigger('submit');
  });

  $('#send-to').on('change', function(event) {
    const sendTo = event.target.value;
    const formHiddenElement = $('#form-hidden');
    const student = JSON.parse($('#student-profile').val());

    if(sendTo == 'student') {
      const phoneNumberInput =
      /* html */
      `<input type="hidden" id="whatsapp_no" name="whatsapp_no" value="${student.phone}" required />`;

      $('#whatsapp_no, #whatsapp_no_wrapper').remove(); // remove previous/old whatsapp_no input element
      formHiddenElement.append(phoneNumberInput); // add new whatsapp_no input element

    } else if(sendTo == 'parent') {
      const phoneNumberInput =
      /* html */
      `<input type="hidden" id="whatsapp_no" name="whatsapp_no" value="${student.parent_datas.parent_number ?? student.parent_phone}" required />`;

      $('#whatsapp_no, #whatsapp_no_wrapper').remove(); // remove previous/old whatsapp_no input element
      formHiddenElement.append(phoneNumberInput); // add new whatsapp_no input element
    } else {
      const phoneNumberInput =
      /* html */
      `
        <div class="form-group" id="whatsapp_no_wrapper">
          <label for="whatsapp_no">No. WA</label>
          <input type="text" name="whatsapp_no" class="form-control" id="whatsapp_no" required />
        </div>
      `;

      $('#whatsapp_no, #whatsapp_no_wrapper').remove(); // remove previous/old whatsapp_no input element
      formHiddenElement.append(phoneNumberInput); // add new whatsapp_no input element
    }
  });

  sendRaportModal.on('show.bs.modal', function(event) {
    const program = $('#program').val();
    const exam_type = $('#exam_type').val();

    $('#program-report').attr('value', program);
    $('#exam-type-report').attr('value', exam_type);
  });

  sendReportForm.on('submit', function(event) {
    $('#sendBtn').html(`Mengirim...`);
    $('#sendBtn').attr("disabled", true);
    $('#cancelBtn').attr("disabled", true);
    sendReportForm.addClass('block-content');
  });





})(window, document, jQuery);
