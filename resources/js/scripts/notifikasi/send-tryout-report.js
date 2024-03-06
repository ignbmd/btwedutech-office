"use strict";
// Functions
const fetchBranches = () => {
  return $.ajax({
    url: '/api/branch/all',
    method: 'GET',
    success: function(response) {
      const branch_code_element = $('#branch_code');
      const data = $.map(response.data, function(obj) {
        obj.id = obj.code;
        obj.text = `(${obj.code}) ${obj.name}`;

        return obj;
      });
      populateOptionValues(branch_code_element, data);
      branch_code_element.attr('disabled', false);
      fetchClassrooms(branch_code_element.val());
    },
    error: function(response) {
      console.error(response);
    },
  });
};

const fetchClassrooms = (branch_code) => {
  const classroom_id_element = $('#classroom_id');
  classroom_id_element.attr('disabled', true);

  return $.ajax({
    url: `/api/learning/classroom/branch/${branch_code}`,
    method: 'GET',
    success: function(response) {
      const data = $.map(response.data, function(obj) {
        obj.id = obj._id;
        obj.text = obj.title;

        return obj;
      });
      populateOptionValues(classroom_id_element, data);
      classroom_id_element.attr('disabled', false);
    },
    error: function(response) {
      console.error(response);
    },
  });
};

const watchBranchCodeValue = () => {
  const branch_code_element = $('#branch_code');
  branch_code_element.on('change', (event) => {
    const selectedBranchCode = event.target.value;
    fetchClassrooms(selectedBranchCode);
  });
};

const populateOptionValues = (element, data) => {
  return element.empty().select2({
    data: data,
  });
};

const is_central_user = Boolean(parseInt($('#is_central_user').val()));

if(is_central_user) {
  fetchBranches();
  watchBranchCodeValue();
} else {
  const branch_code = $('#branch_code').val();
  fetchClassrooms(branch_code);
}

  // Events
  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });


  // Functions
  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["send"].toSvg({
        class: "font-small-4 mr-25",
      })} Memproses
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }
