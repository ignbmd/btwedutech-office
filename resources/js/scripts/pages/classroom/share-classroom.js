"use strict";

// Initialize Select2
$("#branch_code").select2({
  placeholder: "Pilih cabang"
});

$("#sso_id").select2({
  placeholder: "Pilih pengguna",
  multiple: true,
  allowClear: true,
});


// Events
$(document).on("change", "#branch_code", function(event) {
  populateBranchCodeUsers(event.target.value);
});


// Functions
async function populateBranchCodeUsers(branch_code) {
  $("#sso_id").select2().empty();

  const users = await fetchBranchCodeUsers(branch_code);
  const mappedUsers = users.map(function(obj) {
    obj.id = obj.id;
    obj.text = `${obj.name} ${obj.email}`;
    return obj;
  });

  $("#sso_id").select2({
    placeholder: "Pilih pengguna",
    multiple: true,
    allowClear: true,
    data: mappedUsers
  });
}

async function fetchBranchCodeUsers(branch_code) {
  try {
    const response = await fetch(`/api/sso/branch-users/${branch_code}`);
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error(error);
  }
}


