<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="csrf-token" content="{{csrf_token()}}">
  <meta name="app-id" content="{{Auth::id()}}">
  <title>Manajer File</title>
  <link rel="stylesheet" href="/vendors/css/file-manager/adminlte.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />  <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
  <style>
    .hidden {
      display: none;
    }
  </style>
</head>
<body class="hold-transition layout-top-nav" >
<div class="wrapper" id="app">
  <div id="bucket" class="hidden">{{$bucket}}</div>
  <nav class="main-header navbar navbar-expand-md navbar-light navbar-white layout-footer-fixed">
    <div class="container">
      <a href="{{url('/home')}}" class="navbar-brand">
        <img src="https://cdn.btw-cat.com/assets/dist/img/logo-web.png"  class="brand-image">
      </a>
    </div>
  </nav>

  <div class="content-wrapper">
    <div class="content-header">
      <div class="container">
        <div class="row mb-2">
          <div class="col-sm-6">
          </div>

        </div>
      </div>
    </div>
    <div class="content">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="overlay" v-if="loading">
                <i class="fas fa-3x fa-spinner fa-spin"></i>
              </div>
              <div class="card-header">
                <h3 class="card-title">Manajer Berkas</h3>

                <div class="card-tools">
                  <div class="input-group input-group-sm" style="width: 150px;">
                    <input type="text" name="table_search" class="form-control float-right" placeholder="Search">

                    <div class="input-group-append">
                      <button type="submit" class="btn btn-default"><i class="fas fa-search"></i></button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body table-responsive p-0" style="height: 700px">
                <div style="margin:10px">
                  <button @click="showUpload" class="btn btn-sm btn-primary"><i class="fa fa-upload"></i> Upload File</button>
                  <button @click="showCreateFolder" class="btn btn-sm btn-primary"><i class="fa fa-folder"></i> Tambah Folder</button>
                  <button @click="getDir(fm.base)" class="btn btn-sm btn-primary"><i class="fa fa-sync"></i> Refresh</button>
                </div>
                <table class="table table-head-fixed">
                  <thead>
                    <tr>
                      <th width="5%"><button :disabled="fm.base == '/'" @click="getDir(fm.back_path)" class="btn btn-xs btn-primary"><i class="fa fa-chevron-circle-left"></i></button></th>
                      <th width="50%">Nama Berkas</th>
                      <th>Tipe</th>
                      <th>Ukuran</th>
                      <th>Tanggal Upload</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(d,i) in fm.directories" :key="'d'+i">
                      <td></td>
                      <td><a href="javascript:void(0);" @click="openFolder(d)"><i class="fa fa-folder"></i> @{{d}}</a></i></td>
                      <td colspan="3">Folder</td>
                    </tr>
                    <tr v-for="(f,i) in fm.files" :key="'f'+i">
                      <td></td>
                      <td><a href="#" @click="getFile(f.url)"><i class="fa fa-file-alt"></i> @{{f.file_name}}</a></td>
                      <td>@{{f.type}}</td>
                      <td>@{{f.size}}</td>
                      <td>@{{f.last_modified}}</td>
                    </tr>
                    <tr v-if="fm.files.length == 0 && fm.directories.length == 0">
                      <td colspan="5"><center>Tidak ada file</center></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" ref="modalUpload" data-backdrop="static">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Pilih Berkas</h4>
          <button @click="getDir(fm.base)" type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <dropzone
            ref="dropzone"
            id="dropzone"
            :options="dropzoneOptions"
            v-on:vdropzone-sending="beforeUpload"
            :duplicateCheck="true">

          </dropzone>
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-default" data-dismiss="modal" @click="clearUpload">Tutup</button>
        </div>
      </div>

    </div>
  </div>

  <div class="modal fade" ref="modalFolder">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Nama Folder</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grup">
            <input type="text" class="form-control" v-model="folder">
          </div>
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal" @click="createFolder">Tambahkan</button>
        </div>
      </div>
    </div>
  </div>

  <footer class="main-footer">

  </footer>
</div>

<script src="{{ asset(mix("js/scripts/file-manager/file-manager.js")) }}"></script>
<script src="/vendors/js/vendors.min.js"></script>
<script src="/vendors/js/bootstrap/bootstrap.min.js"></script>
<script src="/vendors/js/adminlte.min.js"></script>
</body>
</html>
