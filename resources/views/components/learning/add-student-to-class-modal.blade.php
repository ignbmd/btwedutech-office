  <!-- Modal to add new record -->
  <div class="modal modal-slide-in fade" id="modals-slide-in">
    <div class="modal-dialog sidebar-sm">
      <form class="add-new-record modal-content pt-0" action="/pembelajaran/kelas/tambah-member" method="POST">
        @csrf
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
        <div class="modal-header mb-1">
          <h5 class="modal-title" id="exampleModalLabel">Tambah Siswa Ke Kelas</h5>
        </div>
        <div class="modal-body flex-grow-1">
          <div class="form-group">
            <label for="smartbtw_id">Nama Siswa</label>
            <input type="hidden" name="smartbtw_id" id="smartbtw_id" class="form-control" readonly required>
            <input type="text" id="student_name" class="form-control" readonly>
          </div>
          <div class="form-group">
            <label for="classroom_id">Kelas</label>
            <select name="classroom_id" id="classroom_id" class="form-control" required>
              <option value="">Pilih Kelas</option>
            </select>
            <p class="text-danger d-none" id="quota-full-warning">Kuota untuk kelas ini sudah terisi penuh</p>
          </div>
          <div class="mt-3">
            <button type="submit" id="saveBtn" class="btn btn-primary data-submit mr-1" disabled>Simpan</button>
            <button type="reset" class="btn btn-outline-secondary" data-dismiss="modal">Batal</button>
          </div>
        </div>
      </form>
    </div>
  </div>
