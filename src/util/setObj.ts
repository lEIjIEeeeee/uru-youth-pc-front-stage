import { get, has, setWith } from "lodash-unified";
import { defaultToUndef } from "./defaultToUndef";

type SetObjMapValueType =
  | string
  | {
      key: string | string[];
      defaultValue?: any;
      active?: (val: any) => boolean;
      getValue?: (val: any) => any;
    }
  //不传key时val的值为data，此时必须有getValue函数获取值
  | {
      defaultValue?: any;
      active?: (val: any) => boolean;
      getValue: (val: any) => any;
    };

export type SetObjMapType = {
  [key: string]: SetObjMapValueType;
};

/**
 * @description 通过自定义的映射类型将一个对象中的属性值赋值给另一个对象的属性
 * @param sourceObj 被映射的来源对象
 * @param targetObj 要赋值操作的目标对象
 * @param map 映射关系类型
 * @param strict 是否为严格模式，目标对象必须存在对应的属性才能赋值
 */
export const setObj: (
  sourceObj: any,
  targetObj: any,
  map: SetObjMapType,
  strict?: boolean
) => void = (sourceObj, targetObj, map, strict = false) => {
  for (const key in map) {
    try {
      let dataKey: any = "";
      let result = "";
      if (typeof map[key] === "string") {
        dataKey = map[key];
        result = get(sourceObj, dataKey, "");
      } else {
        const hasKey = has(map[key], "key");
        dataKey = get(map[key], "key");
        const defaultValue = has(map[key], "defaultValue")
          ? get(map[key], "defaultValue")
          : "";
        const value = hasKey
          ? get(sourceObj, dataKey, defaultValue)
          : sourceObj;
        if (
          has(map[key], "active") &&
          !get(map[key], "active", (val?: any) => {
            console.log("active" + val);
            true;
          })(value)
        ) {
          throw key + "is not activated";
        }
        result = has(map[key], "getValue")
          ? defaultToUndef(
              get(map[key], "getValue", (val: any) => {
                val;
              })(value),
              defaultValue,
              (val) => val === undefined
            )
          : hasKey
          ? value
          : defaultValue;
      }

      if (has(targetObj, key) || !strict) {
        setWith(targetObj, key, result, Object);
      }
    } catch (e) {
      console.log(e);
    }
  }
};