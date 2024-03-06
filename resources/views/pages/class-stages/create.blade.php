@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Stage Kelas')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('stages-kelas.store', $type) }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="level">
                Level
              </label>
              <input type="number" class="form-control" id="level" name="level" min="1" value="{{ old('level') ?? "" }}" required/>
              <p class="text-danger">@error('level'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="stage">
                Stage
              </label>
              <input type="number" class="form-control" id="stage" name="stage" min="1" value="{{ old('stage') ?? "" }}" required/>
              <p class="text-danger">@error('stage'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="required_stage">
                Syarat Stage
              </label>
              <input type="number" class="form-control" id="required_stage" name="required_stage" min="0" value="{{ old('required_stage') ?? "" }}" required/>
              <p class="text-danger">@error('required_stage'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="module_type">
                Tipe Modul
              </label>
              <select id="module_type" name="module_type" class="form-control select2 hide-search" required>
                @foreach ($moduleTypes as $moduleType)
                  <option value="{{ $moduleType }}">{{ $moduleType }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="package">
                Paket Stage
              </label>
              <select id="package" name="package" class="form-control select2 hide-search" required>
                <option value="">Pilih paket stage</option>
                @foreach ($packages as $package)
                  <option value="{{ json_encode($package) }}">{{ $package->title }} {{ $package->product_code ? " (" .$package->product_code. ")" : "" }}</option>
                @endforeach
              </select>
              <p class="text-danger">@error('package'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="stage_type">
                Tipe Stage Kelas
              </label>
              <select id="stage_type" name="stage_type" class="form-control select2 hide-search" required>
                <option value="">Pilih Tipe stage</option>
                @if($type == "CPNS")
                  <option value="KELAS">KELAS</option>
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                @else
                  <option value="REGULER">REGULER</option>
                  <option value="INTENSIF">INTENSIF</option>
                  <option value="BINSUS">BINSUS</option>
                @endif
              </select>
              <p class="text-danger">@error('stage_type'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="start_datetime">
                Tanggal & Waktu Mulai
              </label>
              <input type="datetime-local" name="start_date" id="start_date" class="form-control" value="{{ old('start_date') ?? "" }}" required />
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="end_datetime">
                Tanggal & Waktu Selesai
              </label>
              <input type="datetime-local" name="end_date" id="end_date" class="form-control" value="{{ old('end_datetime') ?? "" }}" required />
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script>
  const packages = @json($packages);
  const stageType = @json($type);

  const sessionModuleType = @json(old('module_type'));
  const sessionPackage = @json(old('package'));

  const packageSelectElement = $("#package");
  const moduleTypeSelectElement = $("#module_type");

  const filterPackages = () => {
    // Variable declaration
    const program = stage.type === "PTN" ? "tps" : "skd";
    const moduleType = sessionModuleType ? sessionModuleType : moduleTypeSelectElement.val();
    const filterCondition = (package) => {
      if(stageType === "PTN") return ["tps", "tps-2022", "utbk"].includes(package.program) && package.package_type === moduleType;
      return package.program === program && package.package_type === moduleType;
    };
    const filteredPackages = packages.filter(filterCondition);
    if(sessionModuleType) moduleTypeSelectElement.val(sessionModuleType).trigger("change");

    const newOptions = [];
    filteredPackages.forEach(function(data) {
      newOptions.push({id: JSON.stringify(data), text: `${data.title} (${data.product_code})`});
    });

    packageSelectElement.empty().trigger("change");
    packageSelectElement.select2({data: newOptions});
    if(sessionPackage) packageSelectElement.val(sessionPackage).trigger("change");
  }

  // Code execution
  $(".select2").select2();
  filterPackages();

  // Event listeners
  moduleTypeSelectElement.on("change", function() {
    filterPackages();
  })


</script>
@endsection
