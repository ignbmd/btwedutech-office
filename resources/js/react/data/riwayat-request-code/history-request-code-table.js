import { initialDatatables } from "../../api/datatables/history-request-code";
import axios from "../../utility/http";

export const getHistoryRequestCode = async () => {
  const response = await axios.get("/psikotest/history-request-code/");
  const data = response.data;
  return data ?? [];
};

export let data = initialDatatables;
