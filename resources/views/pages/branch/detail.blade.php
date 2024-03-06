@extends('layouts/contentLayoutMaster')

@section('title', 'Detail Cabang')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/maps/leaflet.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/animate/animate.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/maps/map-leaflet.css')) }}">
@endsection

@section('content')
    <section class="app-user-view">
        <div id="isBranchHasOwner" class="d-none">{{ json_encode($isBranchHasOwner) }}</div>
        <!-- Branch Info -->
        <div class="card user-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-lg-12 d-flex flex-column justify-content-between border-container-lg">
                        <div class="user-avatar-section">
                            <div class="d-flex justify-content-start">
                                <div class="avatar rounded bg-light-success" style="width: 90px; height: 90px">
                                    <div class="avatar-content w-100 h-100">
                                        <i data-feather="home" style="width: 35px; height: 35px"></i>
                                    </div>
                                </div>
                                <input type="hidden" id="lat" name="lat" value="{{ $branch->geolocation->lat }}">
                                <input type="hidden" id="lng" name="lng" value="{{ $branch->geolocation->lng }}">
                                <div class="d-flex flex-column ml-1">
                                    <div class="user-info mb-1">
                                        <h4 class="mb-0 mt-50">{{ $branch->name }} <div
                                                class="badge badge-light-primary">{{ $branch->code }}</div>
                                        </h4>
                                        <p class="mb-0 mt-25"><i data-feather="map-pin"></i> {{ $branch->address }}
                                        </p>
                                        <p class="mb-0 mt-25"><i data-feather="flag"></i> Lingkup
                                            @if ($branch->level === 'PV')
                                                Provinsi
                                            @elseif ($branch->level === 'KB')
                                                Kabupaten
                                            @endif
                                        </p>
                                    </div>
                                    <div class="d-flex flex-wrap">
                                        <a href="{{ url('cabang/ubah/' . $branch->code) }}" class="btn btn-primary">Ubah</a>
                                        {{-- <button class="btn btn-outline-danger ml-1">Hapus</button> --}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 mt-2">
                        <div class="content-header">
                            <h5 class="mb-1">Lokasi Cabang
                                <a target="_blank" rel="noreferrer"
                                    href="https://www.google.com/maps?q={{ $branch->geolocation->lat }},{{ $branch->geolocation->lng }}">
                                    <span class="badge badge-light-primary">Buka di Google Maps <i
                                            data-feather='external-link'></i></span>
                                </a>
                            </h5>
                        </div>
                        <div class="leaflet-map" id="branch-location"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- End Branch Info -->

        <!-- Branch Users -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <table class="datatables-basic table" id="branch-detail-users-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Peran</th>
                                <th>NIK</th>
                                <th>No. HP</th>
                                <th>Jenis Kelamin</th>
                                <th>Alamat</th>
                                <th>Lampiran</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
        <!-- End Branch Users -->
    </section>
@endsection

@section('vendor-script')
    <!-- vendor files -->
    <script src="{{ asset(mix('vendors/js/maps/leaflet.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/extensions/polyfill.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/buttons.bootstrap4.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
    <script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
    <script src="{{ asset(mix('js/scripts/branch/detail.js')) }}"></script>
    <script src="{{ asset(mix('js/scripts/branch/branch-detail-datatables.js')) }}"></script>
@endsection
