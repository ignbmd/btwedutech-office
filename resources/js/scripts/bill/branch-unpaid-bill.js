"use strict";

// Init Datatable
const table = $(".datatables-basic").DataTable({
  columnDefs: [
    {
      orderable: false,
      searchable: false,
      targets: [0],
    },
  ],
  language: {
    paginate: {
      // remove previous & next text from pagination
      previous: "&nbsp;",
      next: "&nbsp;",
    },
  },
});

table
.on("order.dt search.dt draw.dt", function () {
  const info = table.page.info();
  table
    .column(0, { search: "applied", order: "applied" })
    .nodes()
    .each(function (cell, i) {
      cell.innerHTML = i + 1 + info.start;
    });
})
.draw();
