const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

const glob = require("glob");

/*
 |--------------------------------------------------------------------------
 | Vendor assets
 |--------------------------------------------------------------------------
 */

function mixAssetsDir(query, cb) {
  (glob.sync("resources/" + query) || []).forEach((f) => {
    f = f.replace(/[\\\/]+/g, "/");
    cb(f, f.replace("resources", "public"));
  });
}

const sassOptions = {
  precision: 5,
  includePaths: ["node_modules", "resources/assets/"],
};

// plugins Core stylesheets
mixAssetsDir("sass/base/plugins/**/!(_)*.scss", (src, dest) =>
  mix.sass(
    src,
    dest.replace(/(\\|\/)sass(\\|\/)/, "$1css$2").replace(/\.scss$/, ".css"),
    { sassOptions }
  )
);

// pages Core stylesheets
mixAssetsDir("sass/base/pages/**/!(_)*.scss", (src, dest) =>
  mix.sass(
    src,
    dest.replace(/(\\|\/)sass(\\|\/)/, "$1css$2").replace(/\.scss$/, ".css"),
    { sassOptions }
  )
);

// Core stylesheets
mixAssetsDir("sass/base/core/**/!(_)*.scss", (src, dest) =>
  mix.sass(
    src,
    dest.replace(/(\\|\/)sass(\\|\/)/, "$1css$2").replace(/\.scss$/, ".css"),
    { sassOptions }
  )
);

// React stylesheets
mixAssetsDir("sass/lib/react/**/!(_)*.scss", (src, dest) =>
  mix.sass(
    src,
    dest.replace(/(\\|\/)sass(\\|\/)/, "$1css$2").replace(/\.scss$/, ".css"),
    { sassOptions }
  )
);

// Custom Pages stylesheets
mixAssetsDir("sass/pages/**/**/!(_)*.scss", (src, dest) =>
  mix.sass(
    src,
    dest.replace(/(\\|\/)sass(\\|\/)/, "$1css$2").replace(/\.scss$/, ".css"),
    { sassOptions }
  )
);

// script js
mixAssetsDir("js/scripts/**/*.js", (src, dest) => mix.scripts(src, dest));

/*
 |--------------------------------------------------------------------------
 | Application assets
 |--------------------------------------------------------------------------
 */

mixAssetsDir("vendors/js/**/*.js", (src, dest) => mix.scripts(src, dest));
mixAssetsDir("vendors/css/**/*.css", (src, dest) => mix.copy(src, dest));
mixAssetsDir("vendors/**/**/images", (src, dest) => mix.copy(src, dest));

mixAssetsDir("fonts", (src, dest) => mix.copy(src, dest));
mixAssetsDir("fonts/**/**/*.css", (src, dest) => mix.copy(src, dest));
mix.copyDirectory("resources/images", "public/images");
// mix.copyDirectory("resources/data", "public/data");

mix
  .js("resources/js/core/app-menu.js", "public/js/core")
  .js("resources/js/core/app.js", "public/js/core")
  .js("resources/js/dashboard.js", "public/js/scripts")
  // .js("resources/js/presence.js", "public/js/scripts/learning")
  // .js("resources/js/schedule.js", "public/js/scripts/learning")
  // .js("resources/js/add-schedule.js", "public/js/scripts/learning")
  // .js("resources/js/add-report.js", "public/js/scripts/learning")
  // .js("resources/js/edit-report.js", "public/js/scripts/learning")
  // .js("resources/js/material.js", "public/js/scripts/material")
  // .js("resources/js/add-material.js", "public/js/scripts/material")
  // .js("resources/js/edit-material.js", "public/js/scripts/material")
  // .js("resources/js/add-branch.js", "public/js/scripts/branch")
  // .js("resources/js/edit-branch.js", "public/js/scripts/branch")
  // .js("resources/js/edit-branch-user.js", "public/js/scripts/branch")
  // .js("resources/js/add-branch-user.js", "public/js/scripts/branch")
  // .js("resources/js/add-branch-payment-method", "public/js/scripts/branch")
  .js("resources/js/sale.js", "public/js/scripts/sale")
  // .js("resources/js/create-bill.js", "public/js/scripts/bill")
  // .js("resources/js/edit-bill-transaction.js", "public/js/scripts/bill")
  // .js("resources/js/edit-final-discount.js", "public/js/scripts/bill")
  // .js("resources/js/create-return-payment.js", "public/js/scripts/bill")
  // .js("resources/js/add-coa.js", "public/js/scripts/coa")
  // .js("resources/js/edit-coa.js", "public/js/scripts/coa")
  // .js("resources/js/add-alumni.js", "public/js/scripts/alumni")
  // .js("resources/js/edit-alumni.js", "public/js/scripts/alumni")
  // .js("resources/js/expense.js", "public/js/scripts/expense")
  // .js("resources/js/create-expense.js", "public/js/scripts/expense")
  // .js(
  //   "resources/js/health-check/index-stakes.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/create-stakes.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/edit-stakes.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/check-form.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/medical-checkup-history.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/medical-checkup-summary.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/health-check/all-medical-checkup-history.js",
  //   "public/js/scripts/health-check"
  // )
  // .js(
  //   "resources/js/pay-and-bill-index.js",
  //   "public/js/scripts/pay-and-bill/index.js"
  // )
  // .js("resources/js/central-pay-debt.js", "public/js/scripts/pay-and-bill")
  // .js(
  //   "resources/js/central-collect-receivable.js",
  //   "public/js/scripts/pay-and-bill"
  // )
  // .js(
  //   "resources/js/central-update-collect-receivable.js",
  //   "public/js/scripts/pay-and-bill"
  // )
  // .js("resources/js/branch-debt-credit.js", "public/js/scripts/pay-and-bill")
  // .js(
  //   "resources/js/revenue-share-index.js",
  //   "public/js/scripts/revenue-share/index.js"
  // )
  // .js(
  //   "resources/js/add-revenue-share.js",
  //   "public/js/scripts/revenue-share/add-revenue-share.js"
  // )
  // .js(
  //   "resources/js/edit-revenue-share.js",
  //   "public/js/scripts/revenue-share/edit-revenue-share.js"
  // )
  // .js("resources/js/branch-pays-debt.js", "public/js/scripts/pay-and-bill")
  // .js("resources/js/branch-pays-debt-now.js", "public/js/scripts/pay-and-bill")
  // .js("resources/js/edit-expense.js", "public/js/scripts/expense")
  // .js(
  //   "resources/js/edit-transaction-history.js",
  //   "public/js/scripts/transaction-history"
  // )
  // .js("resources/js/file-manager.js", "public/js/scripts/file-manager")
  // .version()
  // .js("resources/js/exam/create-question.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/create-sub-question-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/create-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-tryout-code.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/create-tryout-code-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js(
  //   "resources/js/exam/edit-tryout-code-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/create-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/add-session-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-tryout-premium.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-instruction.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-question-category.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-question.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-tryout-code.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/index-tryout-code-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/index-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-tryout-premium.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-instruction.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-question-category.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/index-sub-question-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/index-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/detail-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/detail-question.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-question.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-tryout-code.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-instruction.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-question-category.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/edit-sub-question-category.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/edit-package-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-cluster-tryout-free.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-tryout-premium.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/connect-question.js", "public/js/scripts/exam")
  // .js("resources/js/exam/module-preview.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/competition-map/index.js",
  //   "public/js/scripts/competition-map"
  // )
  // .js(
  //   "resources/js/competition-map/student.js",
  //   "public/js/scripts/competition-map"
  // )
  // .js(
  //   "resources/js/competition-map/tryout.js",
  //   "public/js/scripts/competition-map"
  // )
  // .js("resources/js/school/index-school.js", "public/js/scripts/school")
  // .js("resources/js/school/add-school.js", "public/js/scripts/school")
  // .js("resources/js/school/edit-school.js", "public/js/scripts/school")
  // .js(
  //   "resources/js/last-education/index-last-education.js",
  //   "public/js/scripts/last-education"
  // )
  // .js(
  //   "resources/js/last-education/add-last-education.js",
  //   "public/js/scripts/last-education"
  // )
  // .js(
  //   "resources/js/last-education/edit-last-education.js",
  //   "public/js/scripts/last-education"
  // )
  // .js("resources/js/location/index-location.js", "public/js/scripts/location")
  // .js("resources/js/location/add-location.js", "public/js/scripts/location")
  // .js("resources/js/location/edit-location.js", "public/js/scripts/location")
  // .js("resources/js/location/detail-location.js", "public/js/scripts/location")

  // .js(
  //   "resources/js/study-program/index-study-program.js",
  //   "public/js/scripts/study-program"
  // )
  // .js(
  //   "resources/js/study-program/add-study-program.js",
  //   "public/js/scripts/study-program"
  // )
  // .js(
  //   "resources/js/study-program/edit-study-program.js",
  //   "public/js/scripts/study-program"
  // )

  // .js(
  //   "resources/js/school-quota/index-school-quota.js",
  //   "public/js/scripts/school-quota"
  // )
  // .js(
  //   "resources/js/school-quota/add-school-quota.js",
  //   "public/js/scripts/school-quota"
  // )
  // .js(
  //   "resources/js/school-quota/edit-school-quota.js",
  //   "public/js/scripts/school-quota"
  // )

  // .js(
  //   "resources/js/competition/index-competition.js",
  //   "public/js/scripts/competition"
  // )
  // .js(
  //   "resources/js/competition/add-competition.js",
  //   "public/js/scripts/competition"
  // )
  // .js(
  //   "resources/js/competition/edit-competition.js",
  //   "public/js/scripts/competition"
  // )
  // .js("resources/js/skd-rank/index-skd-rank.js", "public/js/scripts/skd-rank")
  // .js(
  //   "resources/js/central-operational-item/add-central-operational-item.js",
  //   "public/js/scripts/central-operational-item"
  // )
  // .js(
  //   "resources/js/central-operational-item/edit-central-operational-item.js",
  //   "public/js/scripts/central-operational-item"
  // )
  // .js(
  //   "resources/js/central-operational-item/index-central-operational-item.js",
  //   "public/js/scripts/central-operational-item"
  // )
  // .js("resources/js/finance/central-dashboard.js", "public/js/scripts/finance")
  // .js("resources/js/finance/branch-dashboard.js", "public/js/scripts/finance")
  // .js("resources/js/finance/fund-transfer.js", "public/js/scripts/finance")
  // .js("resources/js/finance/fund-withdraw.js", "public/js/scripts/finance")
  // .js(
  //   "resources/js/finance/fund-withdraw-confirmation.js",
  //   "public/js/scripts/finance"
  // )
  // .js("resources/js/finance/edit-fund-withdraw.js", "public/js/scripts/finance")
  // .js("resources/js/exam/create-trial-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-trial-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-trial-module.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-pre-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-pre-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-pre-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-post-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-post-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-post-test-package.js", "public/js/scripts/exam")
  // .js("resources/js/exam/index-study-material.js", "public/js/scripts/exam")
  // .js("resources/js/exam/create-study-material.js", "public/js/scripts/exam")
  // .js("resources/js/exam/edit-study-material.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/index-study-material-document.js",
  //   "public/js/scripts/exam"
  // )
  // .js(
  //   "resources/js/exam/create-study-material-document.js",
  //   "public/js/scripts/exam"
  // )
  // .js(
  //   "resources/js/exam/edit-study-material-document.js",
  //   "public/js/scripts/exam"
  // )
  .js(
    "resources/js/discount-code/index-discount-code.js",
    "public/js/scripts/discount-code"
  )
  .js(
    "resources/js/discount-code/add-discount-code.js",
    "public/js/scripts/discount-code"
  )
  .js(
    "resources/js/discount-code/edit-discount-code.js",
    "public/js/scripts/discount-code"
  )
  .js(
    "resources/js/discount-code/index-usage.js",
    "public/js/scripts/discount-code"
  )
  // .js(
  //   "resources/js/exam-cpns/index-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-sub-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-sub-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-sub-question-category.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-instruction.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-instruction.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-instruction.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js("resources/js/exam-cpns/index-package.js", "public/js/scripts/exam-cpns")
  // .js("resources/js/exam-cpns/create-package.js", "public/js/scripts/exam-cpns")
  // .js("resources/js/exam-cpns/edit-package.js", "public/js/scripts/exam-cpns")
  // .js(
  //   "resources/js/exam-cpns/index-pre-test-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-pre-test-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-pre-test-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-post-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-post-test-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-post-test-package.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js("resources/js/exam-cpns/index-module.js", "public/js/scripts/exam-cpns")
  // .js("resources/js/exam-cpns/create-module.js", "public/js/scripts/exam-cpns")
  // .js("resources/js/exam-cpns/edit-module.js", "public/js/scripts/exam-cpns")
  // .js("resources/js/exam-cpns/module-preview.js", "public/js/scripts/exam-cpns")
  // .js(
  //   "resources/js/exam-cpns/create-tryout-premium.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-tryout-premium.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-tryout-premium.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-trial-module.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-trial-module.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-trial-module.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-study-material.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-study-material.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-study-material.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-study-material-document.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-study-material-document.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-study-material-document.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/create-tryout-code.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/index-tryout-code.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/exam-cpns/edit-tryout-code.js",
  //   "public/js/scripts/exam-cpns"
  // )
  // .js(
  //   "resources/js/interest-and-talent/school/index-school.js",
  //   "public/js/scripts/interest-and-talent/school"
  // )
  // .js(
  //   "resources/js/interest-and-talent/school/detail-school.js",
  //   "public/js/scripts/interest-and-talent/school"
  // )
  // .js(
  //   "resources/js/psikotes/index-participant-list.js",
  //   "public/js/scripts/psikotes"
  // )
  // .js(
  //   "resources/js/psikotes/index-history-request-code.js",
  //   "public/js/scripts/psikotes"
  // )
  // .js(
  //   "resources/js/tryout-code-question/index-tryout-code.js",
  //   "public/js/scripts/tryout-code-question"
  // )
  // .js(
  //   "resources/js/stages-uka-access/access-code.js",
  //   "public/js/scripts/stages-uka-access"
  // )
  // .js(
  //   "resources/js/portion-setting/index-portion-setting.js",
  //   "public/js/scripts/portion-setting"
  // )
  // .js(
  //   "resources/js/portion-setting/add-portion-setting.js",
  //   "public/js/scripts/portion-setting"
  // )
  // .js(
  //   "resources/js/portion-setting/edit-portion-setting.js",
  //   "public/js/scripts/portion-setting"
  // )
  // .js(
  //   "resources/js/global-discount-setting/index-global-discount-setting.js",
  //   "public/js/scripts/global-discount-setting"
  // )
  // .js(
  //   "resources/js/global-discount-setting/add-global-discount-setting.js",
  //   "public/js/scripts/global-discount-setting"
  // )
  // .js(
  //   "resources/js/global-discount-setting/edit-global-discount-setting.js",
  //   "public/js/scripts/global-discount-setting"
  // )
  // .js("resources/js/exam/index-assessment-package.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/exam/create-assessment-package.js",
  //   "public/js/scripts/exam"
  // )
  // .js("resources/js/exam/edit-assessment-package.js", "public/js/scripts/exam")
  // .js(
  //   "resources/js/affiliate/index-affiliate.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js(
  //   "resources/js/affiliate/create-affiliate.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js("resources/js/affiliate/edit-affiliate.js", "public/js/scripts/affiliate")
  // .js("resources/js/affiliate/index-wallet.js", "public/js/scripts/affiliate")
  // .js(
  //   "resources/js/affiliate/index-transaction-history.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js(
  //   "resources/js/affiliate/verification-affiliate.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js("resources/js/withdraw/index-withdraw.js", "public/js/scripts/withdraw")
  // .js("resources/js/withdraw/proses-withdraw.js", "public/js/scripts/withdraw")

  // .js("resources/js/sale-siplah.js", "public/js/scripts/sale")
  // .js("resources/js/sale-assessment.js", "public/js/scripts/sale")
  // .js(
  //   "resources/js/affiliate/bank-account-request.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js(
  //   "resources/js/affiliate/bank-account-request-form.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js("resources/js/ranking/ranking.js", "public/js/scripts/ranking")
  // .js("resources/js/ranking/filter-program.js", "public/js/scripts/ranking")
  // .js(
  //   "resources/js/tax-payment/index-tax-payment.js",
  //   "public/js/scripts/tax-payment"
  // )
  // .js(
  //   "resources/js/tax-payment/process-tax-payment.js",
  //   "public/js/scripts/tax-payment"
  // )
  // .js(
  //   "resources/js/student-progress/student-report.js",
  //   "public/js/scripts/student-progress"
  // )
  .js(
    "resources/js/student-progress/classroom-report.js",
    "public/js/scripts/student-progress"
  )
  // .js("resources/js/samapta/dashboard-samapta.js", "public/js/scripts/samapta")
  // .js("resources/js/samapta/list-class-samapta.js", "public/js/scripts/samapta")
  // .js(
  //   "resources/js/samapta/student-list-samapta.js",
  //   "public/js/scripts/samapta"
  // )
  // .js(
  //   "resources/js/samapta/student-report-samapta.js",
  //   "public/js/scripts/samapta"
  // )
  // .js(
  //   "resources/js/samapta/global-exercise-score/create-global-exercise-score.js",
  //   "public/js/scripts/samapta/global-exercise-score"
  // )
  // .js(
  //   "resources/js/affiliate/affiliate-dashboard.js",
  //   "public/js/scripts/affiliate"
  // )
  // .js(
  //   "resources/js/samapta/detail-session-samapta.js",
  //   "public/js/scripts/samapta"
  // )
  // .js(
  //   "resources/js/samapta/session-score/create-session-score.js",
  //   "public/js/scripts/samapta/session-score"
  // )
  // .js(
  //   "resources/js/samapta/session-score/edit-session-score.js",
  //   "public/js/scripts/samapta/session-score"
  // )
  .sass("resources/sass/core.scss", "public/css", { sassOptions })
  .sass("resources/sass/overrides.scss", "public/css", { sassOptions })
  .sass("resources/assets/scss/style.scss", "public/css", { sassOptions })
  .react();

mix.options({
  legacyNodePolyfills: false,
  processCssUrls: false,
});

if (mix.inProduction()) {
  mix.version();
}

// if (mix.isWatching()) {
//   mix.bundleAnalyzer();
// }
