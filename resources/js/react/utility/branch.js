export const formatMultipleBranchCodeInput = (branches) => {
  if(!Array.isArray(branches)) throw new Error('Branches must be type of array');

  const branchCodes = branches.map(branch => branch.code);
  return branchCodes.join(',');
}

export const explodeMultipleStringBranchCode = (branchCode) => {
  if(typeof branchCode !== 'string') throw new Error('Branches must be type of string');

  return branchCode.split(',');
}
