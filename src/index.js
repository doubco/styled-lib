import { isFunction, isString, isArray, isNumber, isColor } from "wtf-is-this";
import * as polished from "polished";
// https://polished.js.org/docs

import ref from "./ref";

class StyledLib {
  constructor({ theme = {}, options = {}, mixins = {}, debug = false }) {
    this.colorAPIsWithValue = [
      "setHue",
      "setLightness",
      "setSaturation",
      "adjustHue",
      "darken",
      "lighten",
      "opacify",
      "transparentize",
      "tint",
      "shade",
      "desaturate",
      "saturate"
    ];
    this.colorAPIs = ["complement", "getLuminance", "grayscale", "invert"];

    this.theme = theme;
    this.options = {
      // typography options
      TYPOGRAPHY: {
        themeKey: "font",
        ...options.TYPOGRAPHY
      },

      // variant/color options
      VARIANT: {
        key: "variant",
        themeKey: "colors",
        default: "primary",
        options: ["light", "lighter", "dark", "darker", "contrast"],
        asProp: true,
        optionsAsProp: true,
        contrastKey: "contrast",
        mainKey: "main",
        ...options.VARIANT
      },

      // depth options
      DEPTH: {
        key: "depth",
        themeKey: "depth",
        default: "base",
        asProp: true,
        options: [
          "base",
          "flat",
          "raised",
          "overlay",
          "superior",
          "declaration"
        ],
        ...options.DEPTH
      },

      // size options
      SIZE: {
        key: "size",
        asProp: true,
        options: [
          "micro",
          "small",
          "normal",
          "medium",
          "large",
          "huge",
          "extreme"
        ],
        default: "normal",
        ...options.SIZE
      },

      // unit options
      UNIT: {
        default: "px",
        ...options.UNIT
      },

      // prop options
      UIPROPS: [...options.UIPROPS],

      // OPERATORS
      OPERATORS: {
        scale: " as ",
        unit: "|",
        size: ":",
        nin: " nin ",
        in: " in ",
        ne: " != ",
        eq: " == ",
        gt: " > ",
        gte: " >= ",
        lt: " < ",
        lte: " <= ",
        ...options.OPERATORS
      }
    };
    //
    // this.typography = this.typography.bind(this);
    // this.gutter = this.gutter.bind(this);
    // this.wrapper = this.wrapper.bind(this);

    this.uiProps = this.uiProps.bind(this);
    this.sizer = this.sizer.bind(this);

    this.get = this.get.bind(this);
    this.prop = this.prop.bind(this);
    this.unit = this.unit.bind(this);
    this.size = this.size.bind(this);
    this.scale = this.scale.bind(this);

    this.match = this.match.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.cond = this.cond.bind(this);

    if (debug) {
      // eslint-disable-next-line
      console.log(
        "RESERVED KEYS FOR UI ELEMENETS",
        Object.keys(this.uiProps({}))
      );
    }

    this.mixins = {};
    Object.keys(mixins).forEach(m => {
      if (isFunction(mixins[m])) {
        this.mixins[m] = mixins[m](this);
      } else {
        this.mixins[m] = mixins[m];
      }
    });
  }

  /*
    EXPOSE HELPERS
  */

  get helpers() {
    return {
      ...this.mixins,
      // theme
      theme: this.theme,
      // css helpers
      // typography: this.typography,
      // gutter: this.gutter,
      // wrapper: this.wrapper,
      // component helpers
      uiProps: this.uiProps,
      sizer: this.sizer,
      // getters
      get: this.get,
      prop: this.prop,
      // theming helpers
      variant: this.variant,
      depth: this.depth,
      size: this.size,
      scale: this.scale,
      unit: this.unit,
      // condition helpers
      match: this.match,
      is: this.is,
      or: this.or,
      and: this.and,
      cond: this.cond
    };
  }

  /*
    UNIT OPTIONS
  */

  get unitOptions() {
    const { OPERATORS } = this.options;
    return [
      `${OPERATORS.unit}%`,
      `${OPERATORS.unit}cm`,
      `${OPERATORS.unit}em`,
      `${OPERATORS.unit}ex`,
      `${OPERATORS.unit}in`,
      `${OPERATORS.unit}mm`,
      `${OPERATORS.unit}pc`,
      `${OPERATORS.unit}pt`,
      `${OPERATORS.unit}px`
    ];
  }

  /*
    SIZER
    {sizer("large",2) >> "extreme"}
  */
  sizer(size, change) {
    const { SIZE } = this.options;
    let idx = SIZE.options.indexOf(size);
    if (idx > -1) {
      if (change > 0) {
        return idx + change >= SIZE.options.length
          ? SIZE.options[SIZE.options.length - 1]
          : SIZE.options[idx + change];
      } else {
        return idx - change < 0 ? SIZE.options[0] : SIZE.options[idx - change];
      }
    }
    return size;
  }

  /*
    UI PROPS GENERATOR
    {...uiProps(this.props)}
  */
  uiProps(props, otherKeys = []) {
    const ui = {};
    const { UIPROPS, VARIANT, DEPTH, SIZE } = this.options;

    let keys = [
      ...UIPROPS,
      VARIANT.key,
      SIZE.key,
      DEPTH.key,
      ...otherKeys,
      "gutter"
    ];

    if (VARIANT.asProp) {
      keys = [...keys, ...Object.keys(this.theme[VARIANT.themeKey])];
    }

    if (VARIANT.optionsAsProp) {
      keys = [...keys, ...VARIANT.options];
    }

    if (SIZE.asProp) {
      keys = [...keys, ...SIZE.options];
    }

    if (DEPTH.asProp) {
      keys = [...keys, ...DEPTH.options];
    }

    keys.forEach(key => {
      ui[key] = props[key];
    });
    return ui;
  }

  /*
    GET HELPER
    ${get`spacing.normal`}
  */
  get(v, v2) {
    let variable = v;
    if (isArray(variable)) variable = variable[0];
    let variable2 = v2;
    if (isArray(variable2)) variable2 = variable2[0];

    return p => {
      if (variable2) {
        if (isFunction(variable2)) {
          return ref(ref(p.theme, variable), variable2(p));
        } else {
          return ref(ref(p.theme, variable), variable2);
        }
      } else {
        return ref(p.theme, variable);
      }
    };
  }

  /*
    UNIT HELPER
    ${unit(fn,"px")}
  */
  unit(fn, unit) {
    const { UNIT } = this.options;
    return p => {
      return `${fn(p)}${unit || UNIT.default}`;
    };
  }
  /*
    PROP HELPER
    ${prop(`overflow`)}
  */
  prop(k) {
    let key = k;
    if (isArray(k)) key = k[0];

    return p => {
      return ref(p, key);
    };
  }

  /*
    VARIANT
    ${variant.main} >> active variant
    ${variant.get("primary","light")}
    ${variant.get`primary.light`}
    ${variant.opacify(0.1)} >> active variant
    ${variant.opacify(0.1, "positive")}
  */
  get variant() {
    const { VARIANT } = this.options;

    let methods = {
      // generic color getter
      get: (x, key, force) => {
        let variant = x;
        if (isArray(x)) variant = x[0];

        return p => {
          let schema = p.theme[VARIANT.themeKey];
          let activeVariant = VARIANT.default;

          // allow variant depths as props on component
          if (!force && VARIANT.optionsAsProp && key != VARIANT.contrastKey) {
            VARIANT.options.forEach(k => {
              if (p[k]) key = k;
            });
          }

          // allow variants as props on component
          if (VARIANT.asProp) {
            Object.keys(schema).forEach(v => {
              if (p[v]) {
                activeVariant = v;
              }
            });
          }

          // direct usage
          let x = (variant || "").split(".");
          if (x.length > 1) {
            return ref(schema, variant);
          }

          if (variant && schema[variant]) {
            // variant with key
            activeVariant = variant;
          } else if (p[VARIANT.key] && schema[p[VARIANT.key]]) {
            // variant from theme and component with key
            activeVariant = p[VARIANT.key];
          }

          return ref(schema[activeVariant], key);
        };
      }
    };

    // variant main helper
    methods[VARIANT.mainKey] = p => methods.get(null, VARIANT.mainKey)(p);

    // variant depth helpers
    VARIANT.options.forEach(k => {
      methods[k] = p => methods.get(null, k)(p);
    });

    // allow polished methods on selected variants
    this.colorAPIsWithValue.forEach(func => {
      methods[func] = (value, variant, key) => {
        return p => {
          return polished[func](value, methods.get(variant, key)(p));
        };
      };
    });

    this.colorAPIs.forEach(func => {
      methods[func] = (variant, key) => {
        return p => {
          return polished[func](methods.get(variant, key)(p));
        };
      };
    });

    return methods;
  }

  /*
    DEPTH
    ${depth.main} >> active depth
    ${depth.get("base")} >> depth getter
    ${depth.base} >> depth direct helper
  */
  get depth() {
    const { DEPTH } = this.options;

    let d = {
      get: key => {
        return p => {
          let options = p.theme[DEPTH.themeKey];

          if (!key) {
            DEPTH.options.forEach(k => {
              if (p[k]) key = k;
            });

            if (p[DEPTH.key]) key = p[DEPTH.key];
          }

          if (!key) {
            key = DEPTH.default;
          }

          return ref(options, key);
        };
      }
    };

    // depth main helper
    d.active = p => d.get()(p);

    // depth helpers
    DEPTH.options.forEach(k => {
      d[k] = p => d.get(k)(p);
    });

    return d;
  }

  /*
    SIZE
    ${size`font.default.height`} >> active size
    ${size`font.default:line.height`} >> active size
  */
  size(key) {
    const { OPERATORS, SIZE } = this.options;
    let k = key;
    if (isArray(k)) k = k[0];

    return p => {
      let x = k.split(".");
      let y = k.split(OPERATORS.size);

      let size = p.size || SIZE.default;

      // allow sizes as props on component
      if (SIZE.asProp) {
        SIZE.options.forEach(v => {
          if (p[v]) size = v;
        });
      }

      let str;

      if (y.length == 1) {
        if (x.length > 1) {
          let end = x[x.length - 1];
          let start = x.join(".").replace(`.${end}`, "");
          str = `${start}.${size}.${end}`;
        } else {
          str = `${k}.${size}`;
        }
      } else {
        str = `${y[0]}.${size}.${y[1]}`;
      }

      let unit = "";
      this.unitOptions.forEach(i => {
        if (str.indexOf(i) > -1) unit = i.replace("|", "");
        str = str.replace(i, "");
      });
      return `${ref(p.theme, str)}${unit}`;
    };
  }
  /*
    SCALE
    ${scale`padding as spacing`} >> active size
  */
  scale(key) {
    const { OPERATORS, SIZE } = this.options;

    let k = key;
    if (isArray(k)) k = k[0];

    return p => {
      let x = k.split(OPERATORS.scale);

      let size = p[x[0]] || SIZE.default;
      let str = `${x[1]}.${size}`;

      let unit = "";
      this.unitOptions.forEach(i => {
        if (str.indexOf(i) > -1) unit = i.replace("|", "");
        str = str.replace(i, "");
      });
      return `${ref(p.theme, str)}${unit}`;
    };
  }

  /*
    IS HELPER
    ${is.eq("size","normal")}
  */
  get is() {
    return {
      nset: k => p => !ref(p, k),
      set: k => p => ref(p, k),
      in: (k, v) => p => p[k] && p[k].length && p[k].includes(v),
      nin: (k, v) => p => !p[k] || (p[k] && p[k].length && !p[k].includes(v)),
      eq: (k, v) => p => p[k] == v,
      ne: (k, v) => p => p[k] != v,
      lt: (k, v) => p => p[k] < v,
      lte: (k, v) => p => p[k] <= v,
      gt: (k, v) => p => p[k] > v,
      gte: (k, v) => p => p[k] >= v,
      color: k => p => isColor(p[k])
    };
  }

  /*
    MATCH HELPER FOR OR, AND & COND OPERATOR
  */
  match(c) {
    const { OPERATORS } = this.options;
    let cond = c;
    if (isArray(cond)) cond = c[0];
    return p => {
      let matched;
      // run function if value is function
      if (isFunction(cond)) matched = cond(p);
      // check with is.set if value is string
      if (isString(cond)) {
        if (cond.includes(OPERATORS.nin)) {
          let [k, v] = cond.split(OPERATORS.nin);
          matched = this.is.nin(k, v)(p);
        } else if (cond.includes(OPERATORS.in)) {
          let [k, v] = cond.split(OPERATORS.in);
          matched = this.is.in(k, v)(p);
        } else if (cond.includes(OPERATORS.ne)) {
          let [k, v] = cond.split(OPERATORS.ne);
          matched = this.is.ne(k, v)(p);
        } else if (cond.includes(OPERATORS.eq)) {
          let [k, v] = cond.split(OPERATORS.eq);
          matched = this.is.eq(k, v)(p);
        } else if (cond.includes(OPERATORS.gt)) {
          let [k, v] = cond.split(OPERATORS.gt);
          matched = this.is.gt(k, v)(p);
        } else if (cond.includes(OPERATORS.gte)) {
          let [k, v] = cond.split(OPERATORS.gte);
          matched = this.is.gte(k, v)(p);
        } else if (cond.includes(OPERATORS.lt)) {
          let [k, v] = cond.split(OPERATORS.lt);
          matched = this.is.lt(k, v)(p);
        } else if (cond.includes(OPERATORS.lte)) {
          let [k, v] = cond.split(OPERATORS.lte);
          matched = this.is.lte(k, v)(p);
        } else if (cond.substr(0, 2) == "!!") {
          let k = cond.replace("!!", "");
          matched = this.is.eq(k, false)(p);
        } else if (cond.substr(0, 1) == "!") {
          let k = cond.replace("!", "");
          matched = this.is.nset(k)(p);
        } else {
          matched = this.is.set(cond)(p);
        }
      }
      return matched;
    };
  }

  /*
    OR HELPER
    ${or(is.eq("size","normal"),is.set("ghost"))}
  */
  or(...conds) {
    return p => {
      let passed = false;
      if (conds && conds.length) {
        conds.forEach(cond => {
          let matched = this.match(cond)(p);
          if (matched) {
            passed = true;
          }
        });
      }
      return passed;
    };
  }

  /*
    AND HELPER
    ${or(is.eq("size","normal"),is.set("ghost"))}
  */
  and(...conds) {
    return p => {
      let passed = true;
      if (conds && conds.length) {
        conds.forEach(cond => {
          let matched = this.match(cond)(p);
          if (!matched) {
            passed = false;
          }
        });
      }
      return passed;
    };
  }

  /*
    CONDTION HELPER
    ${cond({if:(p)=>{},then:(p)=>{},else:(p)=>{}})}
  */
  cond(c) {
    return p => {
      let matched = this.match(c.if)(p);

      if (matched) {
        if (c.then) {
          if (isFunction(c.then)) {
            return c.then(p);
          } else {
            return c.then;
          }
        }
      } else {
        if (c.else) {
          if (isFunction(c.else)) {
            return c.else(p);
          } else {
            return c.else;
          }
        }
      }
    };
  }
}

export default StyledLib;