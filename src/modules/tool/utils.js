export const foundSomeIdItemInArrayByName = (name, array) =>
  array.find((item) => item.name === name)?.id ?? null
