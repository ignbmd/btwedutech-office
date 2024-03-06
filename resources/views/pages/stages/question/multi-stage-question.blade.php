@extends('layouts/contentLayoutMaster')

@section('title', "Soal Multi Stage " . $stage->type . " " . $stage->stage_type . " Stage " . $stage->stage . " Level " . $stage->level)

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
        <h6 class="card-header">Filter Data</h6>
        <div class="card-body">
          <form>
            <div class="form-row align-items-end">
              <div class="form-group col-4">
                <label for="question_category_id">Kategori Soal</label>
                <select name="question_category_id" id="question_category_id" class="form-control select2" @if($isMentor) required @endif>
                  <option value="">Pilih Kategori Soal</option>
                  @foreach($questionCategories as $questionCategory)
                    <option value="{{ $questionCategory->id }}" @if(request()->get('question_category_id') == $questionCategory->id) selected @endif>{{ $questionCategory->category_label }}</option>
                  @endforeach
                </select>
              </div>
              <div class="form-group col-4">
                <label for="branch_code">Cabang</label>
                <select name="branch_code" id="branch_code" class="form-control select2" required>
                  <option value="">Pilih Cabang</option>
                  @foreach($branches as $branch)
                    <option value="{{ $branch->code }}" @if(request()->get('branch_code') == $branch->code) selected @endif>{{ $branch->name }}  ({{ $branch->code }})</option>
                  @endforeach
                </select>
              </div>
              <div class="form-group col-4">
                <button type="submit" class="btn btn-primary">Filter</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  @if((request()->has('branch_code') && request()->get('branch_code') !== null) && request()->has('question_category_id'))
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header pb-0">
          <h5>Terakhir diperbarui pada: {{ \Carbon\Carbon::parse($questionDifficulties?->information?->updated_at)->timezone("Asia/Jakarta")->format('Y-m-d H:i:s') . ' WIB' ?? "-" }}</h5>
        </div>
        <hr/>
        <div class="card-body">
          <div class="table-responsive">
            <table class="datatables-basic table">
              <thead>
                <tr>
                  <th>ID Soal</th>
                  <th>Soal</th>
                  <th>Kategori Soal</th>
                  <th>Sub Kategori Soal</th>
                  <th>Jumlah Siswa Yang Menjawab Soal</th>
                  <th>Jumlah Siswa Yang Salah Menjawab Soal</th>
                  <th>Persentase Kesulitan Soal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                @forelse($questions ?? [] as $index => $data)
                <tr>
                  <td>{{ $data->id }}</td>
                  <td>{!! $data->question !!}</td>
                  <td>{{ $data->question_categories->category }}</td>
                  <td>{{ $data->sub_category_questions->title }}</td>
                  <td>{{ isset($questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}) ? $questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}?->total_students_attempted : "-" }}</td>
                  <td>{{ isset($questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}) ? $questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}?->wrong_students_answer : "-" }}</td>
                  <td>{{ isset($questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}) ? $questionDifficulties?->data?->{'CODE-' . $data?->id}?->questions?->{$selectedBranchCode}?->difficulty_percentage . "%" : "-"}}</td>
                  <td>
                    <div class="d-inline-flex">
                      <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                        Pilihan
                        <i data-feather="chevron-down" class="font-small-4"></i>
                      </a>
                      <div class="dropdown-menu dropdown-menu-right">
                        <button type="button" class="btn btn-flat-transparent dropdown-item question-explanation" data-id="{{$data->id}}">
                          Lihat Pembahasan Soal
                        </button>
                        <a class="dropdown-item w-100" href="/soal-multistages/{{ $type }}/{{ $stage->_id }}/soal/{{ $data->id }}/komentar">
                          Lihat Komentar Soal</a>
                      </div>
                    </div>
                  </td>
                </tr>
                @empty
                <tr>
                  <td colspan="8" class="text-center">Data kosong</td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  @endif
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js" integrity="sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
  });
</script>
<script
  type="text/javascript"
  async
  src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML"
></script>
<script>
  window.addEventListener("load", function() {
    var dt_basic = $(".datatables-basic").DataTable({
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      }
    });

    dt_basic
      .on("order.dt search.dt draw.dt", function () {
        // Get all the elements with class name "mathjax-string"
        const mathjaxElements = document.getElementsByClassName("math-tex");

        // Loop through each element and render the MathJax string
        for (let i = 0; i < mathjaxElements.length; i++) {
          const mathjaxString = mathjaxElements[i].innerHTML;
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, mathjaxString]);
        }
      })
    .draw();

    $(document).on('click', '.question-explanation', function() {
      const questionID = $(this).data('id');
      const questionCode = `CODE-${questionID}`;
      const stageID = @json($stage->_id);
      const stageType = @json($type);
      const explanationHost = @json($explanationHost);
      const authUserId = @json($authUserId);
      const authUserName = @json($authUserName);

      const cipherKey = "d17e5fb4-352f-4263-a4c7-e271efd3b454";
      const cipherText = CryptoJS.AES.encrypt(questionCode, cipherKey).toString();
      const encryptedText = cipherText.split('/').join('---').split('+').join('@@');

      const cipherUserIdText = CryptoJS.AES.encrypt(authUserId, cipherKey).toString();
      const encryptedUserIdText = cipherUserIdText.split('/').join('---').split('+').join('@@');

      const cipherUserNameText = CryptoJS.AES.encrypt(authUserName, cipherKey).toString();
      const encryptedUserNameText = cipherUserNameText.split('/').join('---').split('+').join('@@');

      // const url = `${explanationHost}/pembahasan/${stageType.toLowerCase()}/${encryptedText}`;
      // window.open(url, '_blank');
      const url = `${window.location.origin}/soal-multistages/${stageType}/${stageID}/soal/${questionID}/pembahasan?qid=${encryptedText}&mid=${encryptedUserIdText}&mnm=${encryptedUserNameText}&track=comment`;
      window.open(url, '_blank');
    })
  });
</script>
@endsection
