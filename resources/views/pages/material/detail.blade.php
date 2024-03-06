@extends('layouts/contentLayoutMaster')

@section('title', 'Detail Materi')

@php
function getFileColor($fileType) {
  $colors = config("ui.file_color");
  $isTypeValid = array_key_exists($fileType, $colors);
  return $isTypeValid ? $colors[$fileType] : 'primary';
}
@endphp

@section('content')
<section>
  <div class="row">
    <div class="col-12">
      @if (count(array_intersect(['detail'], $allowed)))

        <div class="card card-apply-job card-app-design">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <div class="media">
                <div class="avatar mr-1">
                  @php
                    $defaultUrl = "https://btw-cdn.com/assets/office/image/user-1.png";
                    $photoUrl = $material?->user?->photo ?? $defaultUrl;
                  @endphp
                  <img src="{{$defaultUrl}}" alt="Avatar" width="42" height="42">
                </div>
                <div class="media-body">
                  <h5 class="mb-0">{{$material->user->name ?? ''}}</h5>
                  <small class="text-muted">{{$material->user->bio ?? 'Dosen'}}</small>
                </div>
              </div>
              <div class="text-right">
                <div class="text-muted">
                  <small>Dibuat oleh : <i>{{$material->user->name ?? ''}}</i></small>
                </div>
                @php
                  $isMine = Auth::user()->id == $material?->sso_id;
                  $isAdmin = count(array_intersect(['admin'], Auth::user()->roles)) > 0;
                  $isPossible = $isMine;
                @endphp
                @if (count(array_intersect(['edit'], $allowed)) && $isPossible)
                  <a
                    href="/material/{{request()->route('materialId')}}/edit"
                    class="btn btn-sm btn-outline-primary mt-50"
                    >
                    Edit
                  </a>
                @endif
              </div>
            </div>

            <div class="design-group">
              <h5 class="apply-job-title">{{$material->title ?? ''}}</h5>
            </div>

            <div class="card-transaction">
              <div class="design-group">
                <h6 class="section-label">Lampiran</h6>
                @foreach (($material?->attachments ?? []) as $attachment)
                <div class="transaction-item">
                  <div class="media">
                    <div class="avatar bg-light-{{getFileColor($attachment->mime_type)}} rounded">
                      <div class="avatar-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          class="feather feather-file avatar-icon font-medium-3">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="media-body">
                      <h6 class="transaction-title">{{$attachment->file_name ?? ''}}</h6>
                      <small>{{$attachment->mime_type ?? ''}}</small>
                    </div>
                  </div>
                  <a
                    href="{{$attachment->file_url}}"
                    class="btn btn-primary btn-sm waves-effect waves-float waves-light"
                  >
                    Lihat <i data-feather='external-link'></i>
                  </a>
                </div>
                @endforeach
              </div>
            </div>

          </div>
        </div>
      @endif
    </div>
  </div>
</section>
@endsection
