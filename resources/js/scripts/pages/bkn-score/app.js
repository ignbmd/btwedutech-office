"use strict";

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());

const currentClassId = urlParams.get("classroom_id");
const currentBranchCode = urlParams.get("branch_code");

const userIdElement = $("#user_id");
const branchCodeSelectElement = $("#branch_code");
const classroomIdSelectElement = $("#classroom_id");
const schoolIdSelectElement = $("#ptk_school_id");
const majorIdSelectElement = $("#ptk_major_id");
const schoolNameInputElement = $("#ptk_school");
const majorNameInputElement = $("#ptk_major");
const datatableElement = $("#datatables-basic");
const filterButtonElement = $("#btnFilter");
const filterFormElement = $("#filterForm");
const downloadReportButtonElement = $(".download-report");
const downloadUKAChallengeReportButtonElement = $(
  ".download-uka-challenge-report"
);
const downloadResumeButtonElement = $(".download-resume");
const doSurveyButtonElement = $(".do-survey");
const BKNScoreModalElement = $("#BKNScoreModal");
const BKNScoreModalFormElement = $("#BKNScoreModalForm");
const BKNScoreModalSubmitFormButtonElement = $("#btnSubmit");

const downloadDropdownButtonElement = $(".download-dropdown-button");
const downloadDropdownButtonTextElement = $(".download-dropdown-button-text");

const TWKScoreInput = $("#twk");
const TIUScoreInput = $("#tiu");
const TKPScoreInput = $("#tkp");
const TotalScoreInput = $("#total");
const rankInput = $("#bkn-rank");

const isContinueTrueCheckboxElement = $("#continue");
const isContinueFalseCheckboxElement = $("#discontinue");

const CENTRAL_BRANCH_CODE = "PT0000";

class BKNScore {
  constructor() {
    this.modalFormType = "create";
    this.competitions = this.getCompetitions();
    this.competitionSchools = this.getCompetitionSchools();
    this.competitionStudyPrograms = [];
    this.initDataTable();
    this.initCompetitionSchoolSelectElement();
    this.initCompetitionStudyProgramSelectElement();
    this.initBranchCodeSelectElement();
    branchCodeSelectElement.on(
      "change",
      this.branchCodeSelectElementHandler.bind(this)
    );
    classroomIdSelectElement.on(
      "change",
      this.classroomIdSelectElementHandler.bind(this)
    );
    filterFormElement.on("submit", this.filterFormElementHandler);
    BKNScoreModalElement.on(
      "show.bs.modal",
      this.BKNScoreModalShowHandler.bind(this)
    );
    BKNScoreModalSubmitFormButtonElement.on(
      "click",
      this.submitBKNScoreModalFormButtonElementHandler.bind(this)
    );
    TWKScoreInput.on("input", this.handleScoreInputChange);
    TIUScoreInput.on("input", this.handleScoreInputChange);
    TKPScoreInput.on("input", this.handleScoreInputChange);
    downloadReportButtonElement.on(
      "click",
      this.downloadStudentReport.bind(this)
    );
    downloadUKAChallengeReportButtonElement.on(
      "click",
      this.downloadStudentUKAChallengeReport.bind(this)
    );
    doSurveyButtonElement.on("click", this.handleDoSurvey.bind(this));
    downloadResumeButtonElement.on(
      "click",
      this.downloadStudentResume.bind(this)
    );
    schoolIdSelectElement.on("change", this.handleSchoolIdSelected.bind(this));
    majorIdSelectElement.on("change", this.handleMajorIdSelected.bind(this));
  }

  initDataTable() {
    this.datatable = datatableElement.DataTable({
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      dom: '<"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      columnDefs: [
        {
          searchable: false,
          orderable: false,
          targets: [0],
        },
      ],
      language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
    });
    this.datatable
      .on("order.dt search.dt", this.filterAndOrderDataTable.bind(this))
      .draw();
  }

  async fetchBranches() {
    try {
      const response = await fetch("/pembelajaran/kelas/auth-user/kode");
      const data = await response.json();
      return data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchCurrentClassroom() {
    try {
      const response = await fetch(`/api/learning/classroom/${currentClassId}`);
      const data = await response.json();
      return data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async fetchClassroomByBranchCode(branch_code) {
    try {
      const response = await fetch(
        `/api/learning/classroom/branch/${branch_code}`
      );
      const classrooms = await response.json();
      const currentYearOngoingClassrooms = classrooms?.data?.length
        ? classrooms?.data.filter(
            (classroom) =>
              classroom.status === "ONGOING" &&
              classroom.year === new Date().getFullYear()
          ) ?? []
        : classrooms?.data ?? [];
      return currentYearOngoingClassrooms;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // DOM manipulation methods
  async initBranchCodeSelectElement() {
    this.branches = await this.fetchBranches();
    this.addBranchOptions();
    if (currentBranchCode)
      this.setSelectElementValue(branchCodeSelectElement, currentBranchCode);
    else {
      const userBranchCode = this.getUserBranchCode();
      this.setSelectElementValue(
        branchCodeSelectElement,
        userBranchCode !== CENTRAL_BRANCH_CODE ? userBranchCode : null
      );
    }
    this.enableElement(branchCodeSelectElement);
    branchCodeSelectElement.select2({ placeholder: "Pilih Cabang" });
  }

  enableElement(element) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.removeAttr("disabled"));
    } else {
      element.removeAttr("disabled");
    }
  }

  disableElement(element) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.attr("disabled", true));
    } else {
      element.attr("disabled", true);
    }
  }

  setSelectElementValue(element, value) {
    if (Array.isArray(element)) {
      element.forEach((el) => el.val(value).trigger("change"));
    } else {
      element.val(value).trigger("change");
    }
  }

  filterAndOrderDataTable() {
    var dataIsEmpty = false;
    this.datatable.cells().every(function () {
      let data = this.data();

      if (data === "Data Kosong") {
        dataIsEmpty = true;
        return;
      }
    });
    if (dataIsEmpty) return;

    this.datatable
      .column(0, { search: "applied", order: "applied" })
      .nodes()
      .each(function (cell, i) {
        console.log(cell);
        cell.innerHTML = i + 1;
      });
  }

  addBranchOptions() {
    if (Array.isArray(this.branches)) {
      this.branches.forEach((branch) => {
        branchCodeSelectElement.append(
          `<option value="${branch.code}">${branch.name}</option>`
        );
      });
      return;
    }
    branchCodeSelectElement.append(
      `<option value="${this.branches.code}">${this.branches.name}</option>`
    );
    if (!currentClassId)
      branchCodeSelectElement.val(this.userBranchCode).trigger("change");
  }

  addClassroomIdsOptions(classrooms) {
    classroomIdSelectElement.append(`<option value="ALL">Semua Kelas</option>`);
    classrooms.forEach((classroom) =>
      classroomIdSelectElement.append(
        `<option value="${classroom._id}">${classroom.title} (${classroom.year})</option>`
      )
    );
  }

  async branchCodeSelectElementHandler() {
    classroomIdSelectElement.find("option").not(":first").remove();
    const selectedBranchCode = branchCodeSelectElement.val();

    if (!selectedBranchCode) {
      this.disableElement([classroomIdSelectElement, filterButtonElement]);
      this.setSelectElementValue([classroomIdSelectElement], "");
    }

    if (selectedBranchCode) {
      const branch_code = branchCodeSelectElement.val();
      const classrooms = await this.fetchClassroomByBranchCode(branch_code);
      this.addClassroomIdsOptions(classrooms);
      this.enableElement(classroomIdSelectElement);
      this.setSelectElementValue(classroomIdSelectElement, "");
    }

    if (currentClassId) {
      this.setSelectElementValue(classroomIdSelectElement, currentClassId);
    }
  }

  classroomIdSelectElementHandler() {
    if (classroomIdSelectElement.val() === "") {
      this.disableElement([filterButtonElement]);
    }

    if (classroomIdSelectElement.val() !== "") {
      this.enableElement(filterButtonElement);
    }
  }

  filterFormElementHandler(event) {
    event.preventDefault();
    this.disableElement([classroomIdSelectElement, filterButtonElement]);
    this.submit();
  }

  BKNScoreModalShowHandler(event) {
    const button = $(event.relatedTarget);

    const modalType = button.data("type");
    const studentId = button.data("id");
    const studentName = button.data("name");
    const studentTWKScore = button.data("twk");
    const studentTIUScore = button.data("tiu");
    const studentTKPScore = button.data("tkp");
    const studentTotalScore = button.data("total");
    const studentBKNRank = button.data("rank");
    const isContinue = button.data("isContinue");
    const studentBknTestNumber = button.data("bknTestNumber");
    const ptkSchoolId = button.data("ptkSchoolId");
    const ptkMajorId = button.data("ptkMajorId");

    this.modalFormType = modalType;
    const modalTitle =
      modalType === "create"
        ? `Tambah Nilai BKN ${studentName}`
        : `Edit Nilai BKN ${studentName}`;
    const modal = $("#BKNScoreModal");
    modal.find(".modal-title").text(modalTitle);
    modal.find("#smartbtw_id").val(studentId);
    modal.find("#twk").val(studentTWKScore ? studentTWKScore : 0);
    modal.find("#tiu").val(studentTIUScore ? studentTIUScore : 0);
    modal.find("#tkp").val(studentTKPScore ? studentTKPScore : 0);
    modal.find("#total").val(studentTotalScore ? studentTotalScore : 0);
    modal.find("#bkn-rank").val(studentBKNRank ? studentBKNRank : 0);
    modal.find("#bkn_test_number").val(studentBknTestNumber ?? "");
    modal.find("#ptk_school_id").val(ptkSchoolId).trigger("change");
    this.setMajor(ptkMajorId);
    if (isContinue == 1) modal.find("#continue").prop("checked", true);
    else if (isContinue == 0) modal.find("#discontinue").prop("checked", true);
    else {
      modal.find("#discontinue").prop("checked", false);
      modal.find("#continue").prop("checked", false);
    }
    if (modalType === "edit") {
      modal.find("#btnSubmit").text("Ubah");
      modal.find("#btnSubmit").removeClass("btn-primary");
      modal.find("#btnSubmit").addClass("btn-warning");
      modal.find("#btnClose").removeClass("btn-outline-primary");
      modal.find("#btnClose").addClass("btn-outline-warning");
      return;
    }

    modal.find("#btnSubmit").removeClass("btn-warning");
    modal.find("#btnSubmit").addClass("btn-primary");
    modal.find("#btnClose").removeClass("btn-outline-warning");
    modal.find("#btnClose").addClass("btn-outline-primary");

    modal.find("#btnSubmit").text("Tambah");
  }

  submitBKNScoreModalFormButtonElementHandler() {
    const twkScoreInputValue = document.getElementById("twk");
    const tiuScoreInputValue = document.getElementById("tiu");
    const tkpScoreInputValue = document.getElementById("tkp");
    const totalScoreInputValue = document.getElementById("total");
    const rankingInputValue = document.getElementById("bkn-rank");

    if (!twkScoreInputValue.checkValidity())
      return twkScoreInputValue.reportValidity();
    if (!tiuScoreInputValue.checkValidity())
      return tiuScoreInputValue.reportValidity();
    if (!tkpScoreInputValue.checkValidity())
      return tkpScoreInputValue.reportValidity();
    if (!totalScoreInputValue.checkValidity())
      return totalScoreInputValue.reportValidity();
    if (!rankingInputValue.checkValidity())
      return rankingInputValue.reportValidity();

    BKNScoreModalElement.find(".modal-footer").addClass("block-content");
    BKNScoreModalFormElement.addClass("block-content");
    BKNScoreModalFormElement.submit();
  }

  handleScoreInputChange() {
    let TWKScoreInputValue = TWKScoreInput.val();
    let TIUScoreInputValue = TIUScoreInput.val();
    let TKPScoreInputValue = TKPScoreInput.val();
    if (TWKScoreInputValue && Number(TWKScoreInputValue) <= 0) {
      TWKScoreInput.val("0");
    }
    if (TIUScoreInputValue && Number(TIUScoreInputValue) <= 0) {
      TIUScoreInput.val("0");
    }
    if (TKPScoreInputValue && Number(TKPScoreInputValue) <= 0) {
      TKPScoreInput.val("0");
    }
    TotalScoreInput.val(
      Number(TWKScoreInput.val()) +
        Number(TIUScoreInput.val()) +
        Number(TKPScoreInput.val())
    );
  }

  getUserBranchCode() {
    const dom = document.getElementById("branch-code");
    return dom.innerText;
  }

  async downloadStudentReport(event) {
    try {
      this.disableElement(downloadDropdownButtonElement);
      downloadDropdownButtonTextElement.text("Mohon tunggu...");
      const studentId = event.target.dataset.id;
      const url = `/api/generate-result/student/${studentId}/ptk/pdf-report-link`;
      const response = await fetch(url);
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body?.message ?? "Proses gagal, silakan coba lagi nanti"
        );
      const link = body.data.link;
      window.open(link);
    } catch (error) {
      this.showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.message,
      });
    } finally {
      this.enableElement(downloadDropdownButtonElement);
      downloadDropdownButtonTextElement.text("Download");
    }
  }

  async downloadStudentUKAChallengeReport(event) {
    try {
      this.disableElement(downloadDropdownButtonElement);
      downloadDropdownButtonTextElement.text("Mohon tunggu...");
      const studentId = event.target.dataset.id;
      const url = `/api/generate-result/student/${studentId}/ptk/pdf-report-link?filter=CHALLENGE_UKA`;
      const response = await fetch(url);
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body?.message ?? "Proses gagal, silakan coba lagi nanti"
        );
      const link = body.data.link;
      window.open(link);
    } catch (error) {
      this.showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.message,
      });
    } finally {
      this.enableElement(downloadDropdownButtonElement);
      downloadDropdownButtonTextElement.text("Download");
    }
  }

  async downloadStudentResume(event) {
    const clickedRowDropdownButtonTextId = `${event.target.parentNode.id}-download-text`;
    const clickedRowDropdownButtonElement = $(
      `#${clickedRowDropdownButtonTextId}`
    );
    try {
      this.disableElement(downloadDropdownButtonElement);
      clickedRowDropdownButtonElement.text("Mohon tunggu...");
      const studentId = event.target.dataset.id;
      const url = `/api/generate-result/student/${studentId}/ptk/pdf-resume-link?filter=CHALLENGE_UKA`;
      const response = await fetch(url);
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body?.message ?? "Proses gagal, silakan coba lagi nanti"
        );
      const link = body.data.link;
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) window.location.href = link;
      else window.open(link);
    } catch (error) {
      this.showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.message,
      });
    } finally {
      this.enableElement(downloadDropdownButtonElement);
      clickedRowDropdownButtonElement.text("Download");
    }
  }

  handleDoSurvey(event) {
    try {
      const isStudentHasBknScore = event.target.dataset.hasBknScore;
      const studentId = event.target.dataset.studentId;
      const studentName = event.target.dataset.studentName;
      const studentEmail = event.target.dataset.studentEmail;
      const schoolId = event.target.dataset.schoolId;
      const schoolName = event.target.dataset.schoolName;
      const majorId = event.target.dataset.majorId;
      const majorName = event.target.dataset.majorName;
      if (isStudentHasBknScore == "0")
        throw new Error("Siswa belum memiliki data nilai BKN");
      if (schoolId == "0" || majorId == "0")
        throw new Error("Siswa belum memilih sekolah atau jurusan target");
      if (studentId == "0")
        throw new Error(
          "Akun siswa tidak ditemukan, pastikan siswa memiliki akun btwedutech"
        );
      const link = `https://btwedutech.typeform.com/to/OO1tTD1x#email=${studentEmail}&user_id=${studentId}&name=${studentName}&school_name=${schoolName}&school_id=${schoolId}&major_name=${majorName}&major_id=${majorId}`;
      window.open(link);
    } catch (error) {
      this.showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.message,
      });
    }
  }

  showToast = ({ type, title, message, duration = 3000 }) => {
    toastr[type](message, title, {
      closeButton: true,
      tapToDismiss: false,
      timeOut: duration,
    });
  };

  getCompetitions() {
    const dom = document.getElementById("competition");
    return dom ? JSON.parse(dom.innerText) : [];
  }

  getCompetitionSchools() {
    const dom = document.getElementById("school");
    return dom ? JSON.parse(dom.innerText) : [];
  }

  initCompetitionSchoolSelectElement() {
    if (!this.competitionSchools.length) return [];
    this.competitionSchools = this.competitionSchools.map((value) => ({
      id: value.sekolah_id,
      text: value.nama_sekolah,
    }));
    schoolIdSelectElement
      .select2({
        data: this.competitionSchools,
        placeholder: "Pilih Sekolah",
      })
      .val(null)
      .trigger("change");
  }

  initCompetitionStudyProgramSelectElement() {
    majorIdSelectElement
      .select2({
        placeholder: "Pilih Program Studi",
      })
      .val(null)
      .trigger("change");
  }

  handleSchoolIdSelected() {
    const selectedSchoolId = schoolIdSelectElement.val();
    const selectedSchool = this.competitions.find(
      (value) => value.sekolah_id == selectedSchoolId
    );
    schoolNameInputElement.val(selectedSchool?.nama_sekolah ?? "");
    majorIdSelectElement.attr("disabled", true);

    // Clear existing options
    majorIdSelectElement.empty();

    // Fetch new options
    this.competitionStudyPrograms = this.getUniqueArrayByKey(
      this.competitions
        .filter((value) => value.sekolah_id == selectedSchoolId)
        .map((value) => ({
          id: value.prodi_id,
          text: value.nama_prodi,
        })),
      "id"
    );

    this.competitionStudyPrograms.forEach((value) => {
      majorIdSelectElement.append(
        $("<option></option>").attr("value", value.id).text(value.text)
      );
    });

    // Update Select 2
    majorIdSelectElement.val(null).trigger("change");
    majorIdSelectElement.attr("disabled", false);
  }

  handleMajorIdSelected() {
    const selectedMajorId = majorIdSelectElement.val();
    const selectedMajor = this.competitions.find(
      (value) => value.prodi_id == selectedMajorId
    );
    majorNameInputElement.val(selectedMajor?.nama_prodi ?? "");
  }

  getUniqueArrayByKey(array, key) {
    return array.filter((item, index, self) => {
      const firstIndex = self.findIndex((obj) => obj[key] === item[key]);
      return index === firstIndex;
    });
  }

  setMajor(major_id) {
    if (this.modalFormType === "edit") {
      majorIdSelectElement.val(major_id).trigger("change");
    }
  }
}

const app = new BKNScore();
