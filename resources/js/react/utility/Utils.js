// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = (obj) => Object.keys(obj).length === 0;

// ** Returns K format from a number
export const kFormatter = (num) =>
  num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");

// ** Checks if the passed date is today
const isToday = (date) => {
  const today = new Date();
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  );
};

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (
  value,
  formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
  if (!value) return value;
  return new Intl.DateTimeFormat("en-US", formatting).format(new Date(value));
};

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value);
  let formatting = { month: "short", day: "numeric" };

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: "numeric", minute: "numeric" };
  }

  return new Intl.DateTimeFormat("en-US", formatting).format(new Date(value));
};

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem("userData");
export const getUserData = () => JSON.parse(localStorage.getItem("userData"));

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = (userRole) => {
  if (userRole === "admin") return "/";
  if (userRole === "client") return "/access-control";
  return "/login";
};

// ** React Select Theme Colors
export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: "#00cfe81a", // for option hover bg-color
    primary: "#00cfe8", // for selected option bg-color
    neutral10: "#00cfe8", // for tags bg-color
    neutral20: "#ededed", // for input border-color
    neutral30: "#ededed", // for input hover border-color
  },
});

export const unformatPrice = (price = "") => {
  const withoutDots = price.replace(/[\.]/g, "");
  const unformattedPrice = withoutDots.replace(/[,]/g, ".");
  return unformattedPrice;
};

export const convertNumberDotWithComma = (number) => {
  const converted = `${number}`.replace(/[\.]/g, ",");
  return converted;
};

export const priceFormatter = (price) => {
  const numberFormat = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return numberFormat.format(price);
};

export const numberToCurrencyString = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

export const getUserBranchCode = () => {
  const dom = document.getElementById("branchCode");
  return dom.innerText;
};

export const getUserAllowedRoleFromBlade = () => {
  const dom = document.getElementById("allowed");
  return JSON.parse(dom.innerText) ?? [];
};

export const getLastSegment = () => {
  const lastSegment = window.location.href.substring(
    window.location.href.lastIndexOf("/") + 1
  );
  const lastSegmentWithoutQuery = lastSegment.split("?")?.[0];
  return lastSegmentWithoutQuery;
};

export const getUserFromBlade = () => {
  const dom = document.getElementById("user");
  return JSON.parse(dom.innerHTML) ?? null;
};

export const getClassroomFromBlade = () => {
  const dom = document.getElementById("classroom");
  return JSON.parse(dom.innerHTML) ?? null;
};

export const getIsOnlineClass = () => {
  const dom = document.getElementById("is-online-class");
  return JSON.parse(dom.innerHTML);
};

export const getScheduleFromBlade = () => {
  const dom = document.getElementById("schedule");
  return JSON.parse(dom.innerHTML) ?? null;
};

export const getCsrf = () => {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  return csrf;
};

export const getScheduleId = () => {
  const dom = document.getElementById("scheduleId");
  return dom.innerText;
};

export const getClassroomId = () => {
  const dom = document.getElementById("classroomId");
  return dom.innerText;
};

export const getBillId = () => {
  const dom = document.getElementById("billId");
  return dom.innerText;
};

export const getBillTransactionId = () => {
  const dom = document.getElementById("transactionId");
  return dom.innerText;
};

export const getBucketURL = () => {
  const dom = document.getElementById("bucket-url");
  return dom.innerText;
};

export const getFileColor = (mimeType) => {
  const colors = {
    doc: "primary",
    docx: "primary",
    pdf: "success",
  };
  const isSupported = typeof colors[mimeType] != "undefined";
  return isSupported ? colors[mimeType] : "primary";
};

export const showToast = ({ type, title, message, duration = 3000 }) => {
  toastr[type](message, title, {
    closeButton: true,
    tapToDismiss: false,
    timeOut: duration,
  });
};

export const getTimezone = () => {
  const dom = document.getElementById("timezone");
  return dom?.innerText;
};

export const baseNumeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

export const normalNumber = {
  numericOnly: true,
};

export const decimalNumber = {
  numeral: true,
  numeralPositiveOnly: true,
};

export const inputGroupType = {
  uppercase: true,
};

export const get4YearFromNow = (arrayNum = 3, fullYear = 2) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - fullYear);

  const stringDates = Array(arrayNum)
    .fill(null)
    .map((_, index) => {
      return date.getFullYear() + index;
    });

  return stringDates;
};

export const fourYearsFromNow = get4YearFromNow();
export const fourYearsFromNow2Years = get4YearFromNow(2, 1);

export const isUserHasMarketingRole = () => {
  const isMarketingUser = document.getElementById("is-marketing-user");
  return Boolean(JSON.parse(isMarketingUser.innerText));
};

export const isBranchUser = () => {
  const isBranchUser = document.getElementById("is-branch-user");
  return Boolean(JSON.parse(isBranchUser.innerText));
};

export const getIsCentralAdminUser = () => {
  const dom = document.getElementById("is-central-admin-user");
  return Boolean(JSON.parse(dom.innerText));
};

export const formatNum = (num, separator = ".", fraction) => {
  var str = num.toLocaleString("en-US");
  str = str.replace(/\./, fraction);
  str = str.replace(/,/g, separator);
  return str;
};

export const getIdFromURLSegment = () => {
  const url = window.location.href;
  const path = new URL(url).pathname;
  const parts = path.split("/");
  const value = parts[parts.length - 2];
  return value;
};

export const isFieldHasErrorMessage = (error) => {
  return Boolean(error?.message);
};
