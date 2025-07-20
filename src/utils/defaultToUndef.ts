/**
 * @description 检查value，如果value是undefined、null、空字符串、NaN，返回默认defaultValue，否则返回value本身
 * @param value 被检查的值
 * @param defaultValue 默认值（统一将默认值返回为undefined）
 * @param judgeFuc 判断函数
 * @returns 默认值或本身原值
 */
export const defaultToUndef: (
  value: any,
  defaultValue?: any,
  judgeFuc?: (val: any) => boolean
) => any = (
  value,
  defaultValue = undefined,
  judgeFuc = (val) =>
    val === undefined || val === null || Number.isNaN(val) || val === ""
) => {
  return judgeFuc(value) ? defaultValue : value;
};
