import { assign } from "lodash-unified";
import { setObj, SetObjMapType } from "./setObj";

/**
 * @description 通过一个映射关系类型将一个对象生成一个新的对象
 * @param data 被映射的对象
 * @param map 映射关系类型
 * @param extraObj 额外属性值封装成对象与原对象进行合并
 * @returns 映射完成的新对象
 */
export const getObj: <T = any>(
  data: any,
  map: SetObjMapType,
  extraObj?: object
) => T = (data, map, extraObj = {}) => {
  const obj: any = {};
  assign(obj, extraObj);
  setObj(data, obj, map, false);
  return obj;
};
