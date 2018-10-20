import { isString, isObject } from "wtf-is-this";

/*
  REF HELPER
  ref({a:{b:1}},"a.b") >> returns 1
*/
export default (obj, str) => {
  if (isString(str) && isObject(obj)) {
    str = str.split(".");

    for (let i = 0; i < str.length; i++) {
      obj = obj[str[i]] || { empty: true };
    }
    if (obj && obj.empty) return null;
    return obj;
  }
  return null;
};
