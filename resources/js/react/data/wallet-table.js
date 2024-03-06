import { priceFormatter } from "../utility/Utils";
import axios from "axios";

export const getWalletsByAffiliateID = async (affiliate_id) => {
  const response = await axios.get(`/api/affiliates/${affiliate_id}/wallets`);
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
    name: "Wallet",
    wrap: true,
    sortable: false,
    selector: ({ no }) => `Wallet ${no}`,
  },
  {
    name: "Saldo",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ amount }) => priceFormatter(amount),
  },
];
