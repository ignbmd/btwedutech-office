require("./bootstrap");

import Vue from "vue/dist/vue.js";
import dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";

const bucket = document.getElementById("bucket").innerText;
const FM = new Vue({
  el: "#app",
  data: {
    dropzoneOptions: {
      url: `/file-manager?bucket=${bucket}`,
      method: "POST",
      paramName: "data",
      timeout: 0,
      thumbnailWidth: 150,
      dictDefaultMessage: `<i class="fa fa-upload"></i> Silakan klik disini untuk memilih file (Size Maksimal : ${
        bucket === "video" ? 1024 : 100
      }MB, Jumlah Upload : 100 File)`,
      acceptedFiles:
        bucket === "video"
          ? ".mp4,.mkv"
          : "image/*,application/pdf,.zip,.docx,.doc,.rar,.mp4,.mkv, .ppt, .pptx, .svg",
      maxFilesize: bucket === "video" ? 1024 : 100,
      headers: {
        "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]')
          .content,
      },
      maxFiles: 100,
      parallelUploads: 10,
    },
    fm: {
      directories: [],
      files: [],
    },
    folder: "",
    authDir: `/storage/files/${
      document.head.querySelector('meta[name="app-id"]').content
    }`,
    loading: true,
  },
  mounted() {
    let self = this;
    this.getDir();
    $(this.$refs.modalUpload).on("hidden.bs.modal", function () {
      self.clearUpload();
      self.getDir(self.fm.base);
    });
    $(this.$refs.modalFolder).on("hidden.bs.modal", function () {
      self.folder = "";
    });
  },
  methods: {
    showUpload() {
      $(this.$refs.modalUpload).modal("show");
    },
    showCreateFolder() {
      $(this.$refs.modalFolder).modal("show");
    },
    clearUpload() {
      this.$refs.dropzone.removeAllFiles();
      this.getDir(this.fm.base);
    },
    getDir(path = "/") {
      this.loading = true;
      axios
        .post("/file-manager/dir", { path, bucket })
        .then(({ data }) => {
          this.fm = data.data;
        })
        .catch((e) => {
          alert(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openFolder(folder) {
      this.getDir(`${this.fm.base}${folder}/`);
    },
    beforeUpload(file, xhr, form) {
      form.append("path", this.fm.base);
    },
    createFolder() {
      this.loading = true;
      axios
        .post("/file-manager/folder", {
          folder: this.folder,
          base: this.fm.base,
          bucket,
        })
        .then((r) => {
          this.getDir(this.fm.base);
          this.folder = "";
        })
        .catch((e) => {
          alert(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getFile(path) {
      if (window.opener) {
        if (typeof window.opener[`setFileAttachment`] === "function") {
          window.opener[`setFileAttachment`](
            this.getParameterByName("key"),
            path
          );
        } else {
          bucket === "video"
            ? this.getFilePreSignedURL(path)
            : window.open(path);
        }
      } else {
        bucket === "video" ? this.getFilePreSignedURL(path) : window.open(path);
      }
      if (
        window.opener &&
        typeof window.opener[`setFileAttachment`] === "function"
      ) {
        window.close();
      }
    },
    getFilePreSignedURL(path) {
      let pathname = new URL(path).pathname;
      pathname = pathname.substr(pathname.indexOf("/") + 1);

      this.loading = true;
      axios
        .post("/file-manager/file", { path, bucket, pathname })
        .then(({ data }) => {
          window.open(data.url);
        })
        .catch((e) => {
          alert(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
  },
  components: {
    dropzone,
  },
});
