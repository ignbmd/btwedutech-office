@extends('layouts/contentLayoutMaster')

@section('title', "Edit Jadwal Kelas $class->title")

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
@endsection

@section('content')
    <style>
        .is-invalid~.select2 .select2-selection {
            border: 1px solid #ea5455;
        }

        .text-error {
            width: 100%;
            margin-top: 0.25rem;
            font-size: 0.857rem;
            color: #ea5455;
        }

    </style>

    @php
        function getTime($time) {
          return (new Carbon\Carbon($time))
            ->setTimezone(config('app.timezone'))
            ->format('Y-m-d H:i:s');
        }
    @endphp

    <!-- Input Sizing start -->
    <section id="input-sizing">
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <form action={{ "/pembelajaran/jadwal/update/{$schedule?->_id}" }} method="POST">

                            @csrf
                            <input type="hidden" name="classroom_id" value="{{ $schedule?->classroom_id }}">

                            <div class="form-group">
                                <label class="form-label" for="title">
                                    Judul
                                </label>
                                <input type="text" class="form-control @error('title') is-invalid @enderror" id="title"
                                    placeholder="Contoh: Pelajaran SKD" value="{{ $schedule?->title }}" name="title" />
                                @error('title')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group">
                                <label for="startDate">Waktu Mulai (WIB)</label>
                                <input
                                  type="text"
                                  id="startDate"
                                  value="{{getTime($schedule?->start_date)}}"
                                  class="form-control flatpickr-date-time flatpickr-human-friendly @error('start_date') is-invalid @enderror"
                                  placeholder="YYYY-MM-DD HH:MM"
                                  name="start_date"
                                />
                                @error('start_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group">
                                <label for="endDate">Waktu Selesai (WIB)</label>
                                <input
                                  type="text"
                                  id="endDate"
                                  class="form-control flatpickr-date-time flatpickr-human-friendly @error('end_date') is-invalid @enderror"
                                  name="end_date"
                                  placeholder="YYYY-MM-DD HH:MM"
                                  value="{{ getTime($schedule?->end_date) }}"
                                  />
                                @error('end_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="teacher">Pilih Pengajar</label>
                                <select id="teacher" name="teacher_id"
                                    class="select2 form-control @error('teacher_id') is-invalid @enderror">
                                    <option value="">Pilih Pengajar</option>
                                    @foreach ($teachers as $teacher)
                                        <option {{ $schedule?->teacher_id == $teacher->sso_id ? 'selected' : '' }}
                                            value="{{ $teacher->sso_id }}">
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('teacher_id')
                                    <div class="text-error">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="program">Pilih Program</label>
                                <select id="program" name="program"
                                    class="select2 form-control @error('program') is-invalid @enderror">
                                    <option value="">Pilih Program</option>
                                    @foreach ($programs as $program)
                                        <option {{ ($schedule->program ?? '') == $program->id ? 'selected' : '' }}
                                            value="{{ $program->id }}">
                                            {{ $program->text }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('material_id')
                                    <div class="text-error">{{ $message }}</div>
                                @enderror
                            </div>

                            @if($schedule->program === "skd" || $schedule->program === "cpns")
                                <div class="form-group" id="question_category_container">
                                    <label class="form-label" for="question_category">Pilih Kategori Soal Materi (Opsional)</label>
                                    <select id="question_category" name="question_category"
                                        class="select2 form-control @error('question_category') is-invalid @enderror">
                                        <option value="">Pilih Kategori Soal Materi</option>
                                        @foreach ($scheduleQuestionCategories as $questionCategory)
                                            <option {{ ($scheduleQuestionCategory ?? '') == $questionCategory["value"] ? 'selected' : '' }}
                                                value="{{ $questionCategory["value"] }}">
                                                {{ $questionCategory["label"] }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('question_category')
                                        <div class="text-error">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="form-group" id="sub_question_category_container">
                                    <label class="form-label" for="sub_question_category">Pilih Sub Kategori Soal Materi (Opsional)</label>
                                    <select id="sub_question_category" name="sub_question_category"
                                        class="select2 form-control @error('sub_question_category') is-invalid @enderror">
                                        <option value="">Pilih Sub Kategori Soal Materi</option>
                                        @foreach ($scheduleSubQuestionCategories as $subQuestionCategory)
                                            <option {{ ($scheduleSubQuestionCategory ?? '') == $subQuestionCategory["value"] ? 'selected' : '' }}
                                                value="{{ $subQuestionCategory["value"] }}">
                                                {{ $subQuestionCategory["label"] }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('sub_question_category')
                                        <div class="text-error">{{ $message }}</div>
                                    @enderror
                                </div>
                            @endif

                            <div class="form-group">
                                <label class="form-label" for="material_id">Pilih Materi</label>
                                <select id="material" name="material_id"
                                    class="select2 form-control @error('material_id') is-invalid @enderror">
                                    <option value="">Pilih Materi</option>
                                    @if(!$isP3KClass)
                                      @foreach ($materials as $material)
                                          <option {{ ($schedule?->material_id ?? '') == $material->id ? 'selected' : '' }}
                                              value="{{ $material->id }}">
                                              {{ $material->title }}
                                          </option>
                                      @endforeach
                                    @else
                                      @foreach ($materials as $material)
                                          <option {{ ($schedule?->material_id ?? '') == $material->_id ? 'selected' : '' }}
                                              value="{{ $material->_id }}">
                                              {{ $material->title }}
                                          </option>
                                      @endforeach
                                    @endif
                                </select>
                                @error('material_id')
                                    <div class="text-error">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="session">Pilih Pertemuan (Opsional)</label>
                                <select id="session" name="session"
                                    class="select2 form-control @error('session') is-invalid @enderror">
                                    <option value="">Pilih Pertemuan</option>
                                    @foreach ($scheduleSessions as $session)
                                        <option {{ ($scheduleSession ?? '') == $session["value"] ? 'selected' : '' }}
                                            value="{{ $session["value"] }}">
                                            {{ $session["label"] }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('session')
                                    <div class="text-error">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-check custom-control custom-checkbox">
                                <input class="form-check-input custom-control-input" type="checkbox" name="is_pre_test" id="is_pre_test"
                                    {{ $schedule->is_pre_test ?? false ? 'checked' : '' }}>
                                <label class="form-check-label custom-control-label" for="is_pre_test">
                                    Pre Test
                                </label>
                            </div>

                            <div class="form-check custom-control custom-checkbox mt-1">
                                <input class="form-check-input custom-control-input" type="checkbox" name="is_post_test" id="is_post_test"
                                    {{ $schedule->is_post_test ?? false ? 'checked' : '' }}>
                                <label class="form-check-label custom-control-label" for="is_post_test">
                                    Post Test
                                </label>
                            </div>

                            <div class="form-group mt-1">
                                <label class="form-label" for="topics">Topik</label>
                                <select id="topics" name="topics[]" multiple
                                    class="select2 select2-tokenizer form-control @error('topics') is-invalid @enderror">
                                    @foreach ($schedule->topics as $topic)
                                        <option value="{{ $topic }}" @if (in_array($topic, old('topics') ?? $schedule->topics)) selected @endif>{{$topic}}</option>
                                    @endforeach
                                </select>
                                @error('topics')
                                    <div class="text-error">{{ $message }}</div>
                                @enderror
                            </div>

                            @if($isOnlineClass)
                              {{-- <div class="form-group">
                                  <label class="form-label" for="zoom_meeting_password">
                                    Password Zoom Meeting
                                  </label>
                                  <input type="text" class="form-control @error('zoom_meeting_password') is-invalid @enderror" id="zoom_meeting_password" value="{{ $onlineClassMeeting?->zoom_meeting_password }}" name="zoom_meeting_password" />
                                  @error('zoom_meeting_password')
                                      <div class="invalid-feedback">{{ $message }}</div>
                                  @enderror
                              </div> --}}
                              <div class="form-group">
                                  <label class="form-label" for="zoom_meeting_status">
                                    Status Zoom Meeting
                                  </label>
                                  <select id="zoom_meeting_status" name="zoom_meeting_status" class="select2 select2-tokenizer form-control @error('zoom_meeting_status') is-invalid @enderror">
                                    <option value="WAITING" @if($onlineClassMeeting->zoom_meeting_status === "WAITING") selected @endif>Menunggu</option>
                                    <option value="ENDED" @if($onlineClassMeeting->zoom_meeting_status === "ENDED") selected @endif>Selesai</option>
                                  </select>
                                  @error('zoom_meeting_status')
                                      <div class="invalid-feedback">{{ $message }}</div>
                                  @enderror
                              </div>
                            @endif

                            <div class="mt-3 text-right">
                                <button class="btn btn-gradient-success data-submit">
                                    <i data-feather='save' class="mr-50"></i> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/pickers/flatpickr/flatpickr.min.js')) }}"></script>
@endsection
@section('page-script')
    <script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
    <script src="{{ asset(mix('js/scripts/forms/pickers/form-pickers.js')) }}"></script>
    <script>
      const program = $("#program");

      const question_category_container = $("#question_category_container");
      const question_category_select = $("#question_category");

      const sub_question_category_container = $("#sub_question_category_container");
      const sub_question_category_select = $("#sub_question_category");

      $(document).on("change", "#program", function(event) {
        question_category_select.val(null).trigger("change");
        sub_question_category_select.val(null).trigger("change");

        if (program.val() === "skd" || program.val() === "cpns") {
          question_category_container.removeClass("d-none");
          sub_question_category_container.removeClass("d-none");
          return;
        };
        question_category_container.addClass("d-none");
        sub_question_category_container.addClass("d-none");
      });
    </script>
@endsection
