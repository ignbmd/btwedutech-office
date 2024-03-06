import axios from "axios";
import { priceFormatter } from "../utility/Utils";
import moment from "moment-timezone";
import classNames from "classnames";

export const getAffiliateTransactionHistory = async (affiliate_id) => {
  const response = await axios.get(
    `/api/affiliates/${affiliate_id}/transaction-histories`
  );
  const data = response.data;
  return data?.data ?? [];
};

export let data = {};

export const columns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Tanggal Transaksi",
    wrap: true,
    sortable: false,
    selector: ({ created_at }) =>
      moment(created_at).locale("id").tz("Asia/Jakarta").format("LLLL") +
      " WIB",
  },
  {
    name: "Deskripsi",
    wrap: true,
    sortable: false,
    selector: ({ product_name, product_code, description, status }) => {
      return status == "IN"
        ? `${description} - ${product_name} (${product_code})`
        : `${description}`;
    },
  },
  {
    name: "Nominal",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ status, fee }) => {
      return (
        <div
          className={classNames("font-weight-bold", {
            "text-success": status == "IN",
            "text-danger": status == "OUT",
          })}
        >
          {status == "IN" ? "+ " : "- "} {priceFormatter(fee)}
        </div>
      );
    },
  },
];
