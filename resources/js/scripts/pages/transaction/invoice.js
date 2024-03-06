class SendInvoice {
  constructor() {
    this.form = document.getElementById("send-form");
    this.billId = this.getBillId();
    this.phone = this.getDefaultPhone();
    this.studentName = this.getStudentName();
    this.amount = this.getAmount();
    this.send = document.getElementById("button-send");
    this.alert = document.getElementById("alert");
    this.alert.style.display = "none";
    this.listenForm();
    this.listenModalClosed();
  }

  listenForm() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      this.phone = fd.get("phone");
      await this.onSubmit();
    });
  }

  listenModalClosed() {
    self = this;
    $("#send-invoice-sidebar").on("hidden.bs.modal", () => {
      self.alert.style.display = "none";
    });
  }

  getBillId() {
    const dom = document.getElementById("billId");
    return dom.innerText;
  }

  getStudentName() {
    const dom = document.getElementById("studentName");
    return dom.innerText;
  }

  getAmount() {
    const dom = document.getElementById("invoiceAmount");
    return dom.innerText;
  }

  getDefaultPhone() {
    const dom = document.getElementById("default-phone");
    return dom.innerText;
  }

  getCsrf() {
    return $('meta[name="csrf-token"]').attr("content");
  }

  async onSubmit() {
    this.send.disabled = true;
    this.alert.style.display = "none";
    try {
      const url = `/api/finance/bill/${this.billId}/send-invoice`;
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          studentName: this.studentName,
          amount: `${this.amount}`,
          phone: this.phone
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": this.getCsrf(),
        },
      });
      await res.json();
    } catch (error) {
      console.error(error);
    } finally {
      this.send.disabled = false;
      this.alert.style.display = "block";
    }
  }
}

const send = new SendInvoice();
console.log("init");
