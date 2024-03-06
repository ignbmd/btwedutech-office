import axios from "axios";
import { showToast } from "./Utils";

axios.defaults.headers.common["Accept"] = `application/json`;
axios.defaults.headers.common["Content-Type"] = `application/json`;
axios.defaults.headers.common["X-Requested-With"] = `XMLHttpRequest`;
axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: `${window.location.origin}/api`,
  validateStatus(status) {
    if (status >= 200 && status < 300) {
      return true;
    }

    return false;
  },
});

instance.interceptors.response.use(
  (response) => response,
  (err) => {
    if (!err.response?.data.data && err.response?.status) {
      // let errMessage = `${err.response.status} ${err.response.statusText} : ${err.response.data.message}`;
      let errMessage = err.response.data?.messages || err.response.data?.message;

      if (err.response.status == 500) {
        errMessage =
          "Maaf, terjadi kesalahan. Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
          showToast({
            type: 'error',
            title: 'Terjadi Kesalahan',
            message: errMessage
          })
      } else if(err.response.status == 419) {
        errMessage = "Harap muat ulang browser"
        showToast({
          type: 'error',
          title: 'Sesi Kamu Kadaluarsa',
          message: errMessage
        })
      } else {
        showToast({
          type: 'error',
          title: 'Terjadi Kesalahan',
          message: errMessage
        })
      }
    }
    throw err;
  }
);

export default instance;
