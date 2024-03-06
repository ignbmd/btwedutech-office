  <!-- Modal to add new record -->
  <div class="modal modal-slide-in fade" id="modals-slide-in">
    <div class="modal-dialog sidebar-sm">
      <form class="add-new-record modal-content pt-0" id="send-report-form" action="{{ route('siswa.report.send', $student->smartbtw_id) }}">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
        <div class="modal-header mb-1">
          <h5 class="modal-title" id="exampleModalLabel">Kirim Raport Siswa</h5>
        </div>
        <div class="modal-body flex-grow-1">
          <div class="form-group">
            <label for="send-to">Kirim Raport Ke No. WA</label>
            <select id="send-to" class="form-control" required>
              <option value="student" selected>Siswa</option>
              <option value="parent">Orang Tua Siswa</option>
              <option value="other">Input Nomor Lain</option>
            </select>
          </div>
          <div id="form-hidden">
            <input type="hidden" id="student-profile" value="{{ json_encode($student) }}" />
            <input type="hidden" name="program" id="program-report" />
            <input type="hidden" name="exam_type" id="exam-type-report" />
            <input type="hidden" name="whatsapp_no" id="whatsapp_no" value="{{ $student->phone }}" required/>
          </div>
          <div class="mt-3">
            <button type="submit" id="sendBtn" class="btn btn-primary data-submit mr-1">Kirim</button>
            <button type="reset" id="cancelBtn" class="btn btn-outline-secondary" data-dismiss="modal">Batal</button>
          </div>
        </div>
      </form>
    </div>
  </div>
