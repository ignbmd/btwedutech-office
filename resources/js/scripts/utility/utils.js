const unformatPrice = (price = '') => {
  const unformattedPrice = price.replace(/[,\.]/g, "");
  return unformattedPrice;
}

const priceFormatter = (price) => {
  const numberFormat = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return numberFormat.format(price)
}

const getLastSegment = () => {
  return window.location.href.substring(
    window.location.href.lastIndexOf("/") + 1
  );
};

const getUserAllowedRoleFromBlade = () => {
  const dom = document.getElementById("allowed");
  return JSON.parse(dom.innerText) ?? [];
};
