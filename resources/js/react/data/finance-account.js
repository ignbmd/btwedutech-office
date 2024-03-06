import axios from "axios";

export const getAccountByBranchAndCategory = async (
  branchCode,
  categoryIds
) => {
  try {
    const response = await axios.get(
      "/api/finance/coa/branch-and-category-ids",
      { params: { branch_code: branchCode, category_ids: categoryIds } }
    );
    const data = await response.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
