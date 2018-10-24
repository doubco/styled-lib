# Styled Library

`styled-lib` is set of helpers and theme manager for `styled-components`

You can ...

- manage your theme variables
- write readable styled components
- manage your mixins
- easy `polished` support for all your colors

## Before/After

Before:

```
export const Wrapper = styled.section`
  ${gutter(8) // custom mixin};
  width: 100%;
  height: ${p => p.liquid ? "100%": null};
  margin-top: ${p =>
    p.margin.includes("top") ? p.theme.card[p.size || p.big ? "big" : "normal"].wrapper.margin
  }px;
  padding: ${p =>
    p.theme.card[p.size].wrapper.padding
  }px;
  background: ${p =>
    p.theme.card[p.variant].main || p.black ? "black" : p.green ? "green" : ... // goes on
  };
`;
```

After:

```
import UI from "./theme";
const { cond, is, variant, size, wrapper } = UI;

export const Wrapper = styled.section`
  ${gutter(size`card.gutter`) // custom mixin};
  width: 100%;
  height: ${cond({ if: "liquid", then: "100%", else: null }) // conditions };
  margin-top: ${cond({
    if: is.in("margin","top"),
    then: size`card:wrapper.margin|px`,
    else: null }) // conditions
  };
  padding: ${size`card:wrapper.padding|px` // sizing };
  background: ${variant.main // variants };
`;
```

## Installation

`yarn add styled-lib` or `npm install styled-lib --save`

## Usage

theme.js

```
import StyledLib from "../utils/styled-lib";
import * as allMixins from "./mixins";

const dev = process.env.NODE_ENV == "development";

const Lib = new StyledLib({
  mixins: allMixins,
  theme: {
    colors:{
      black: {
        light: "222",
        main: "#000"
      }
    },
    card: {
      normal:{
        radius: 2
        wrapper: {
          padding: 8,
          margin: 4
        }
      },
      // ...other size variables
    }
    // other component variables or default design tokens
  },
  debug: dev,
  options: {
    UIPROPS: ["color", "passive"]
  }
});

export const theme = Lib.theme;

export default {
  Instance: Lib,
  theme,
  ...Lib.helpers
};
```

App.js

```
import { theme } from "./theme"

export const = App (props)=>{
  <ThemeProvider theme={theme}>
    <Routes {...props} />
  </ThemeProvider>
}
```

> give theme variables to `ThemeProvider`

Button/styled.js

```
import UI from "./theme";
const { cond, is, variant, size, wrapper // mixin } = UI;
```

> import any tool or mixins you want.

> This is optional but you can easily pass all ui related props to your styled component like below

Button/index.js

```
import UI from "../../theme";
const { uiProps } = UI;

class Button extends React.Component {
  get ui(){
    return uiProps(["onClick","..."]) // add custom props

    // all of your theme props will be pushed automatically.
  }
  render(){
    <ButtonWrapper {...this.ui}>
      {this.props.title}
    </ButtonWrapper
  }
}
```

home.js

```
<Button black large margin={["top","left"]}>Login</>
```

## API

`styled-lib` provides

`get`, `prop` for easy access component props or theme props.

`variant`, `depth`, `size`, `scale`, `unit` for theming your component.

`match`, `is`, `or`, `and`, `cond` for writing readable conditional css.

`uiProps`, `sizer` for cleaner component code.

> Most of the helpers also supports template literals.

This is

```
...
padding: ${get`card.padding.size`}px;
...
```

same with this

```
...
padding: ${get("card.padding.size")}px;
...
```

### get

Gets props from theme.

```
...
padding: ${get`card.padding.size`}px;
...
```

### prop

Gets props from Component prop.

```
...
overflow: ${prop`overflow` // equals to: p => p.overflow};
...
```

### variant

Helps add coloring/variant support to components.

Use it like below;

Button.js
`<Button variant="yellow" />`
`<Button yellow />`
`<Button yellow dark />`

styled.js

```
${variant.main} >> active variant
${variant.dark} >> dark variant
${variant.get("blue","main")} >> blue.main variant
${variant.get`blue.light`} >> blue.light variant
${variant.opacify(0.1)} >> active variant with opacity
${variant.opacify(0.1, "yellow")} >> yellow variant with opacity
${variant.opacify(0.1, "yellow","dark")} >> yellow.dark variant with opacity
```

> Supported `polished` methods

> value required methods

```
  variant.setHue(value)
  variant.setLightness(value, "blue.light")
  variant.setSaturation(value, null, "dark")
  variant.adjustHue(value)
  variant.darken(value)
  variant.lighten(value)
  variant.opacify(value)
  variant.transparentize(value)
  variant.tint(value)
  variant.shade(value)
  variant.desaturate(value)
  variant.saturate(value)
```

> others

```
  variant.complement()
  variant.getLuminance("blue.dark")
  variant.grayscale()
  variant.invert()
```

### depth

Helps add depthing to components.

> PS: you can use this to set box-shadows etc.

Use it like below;

Button.js
`<Button depth="raised" />`
`<Button raised />`

styled.js

```
${depth.main} >> active depth
${depth.get("base")} >> depth getter
${depth.base} >> depth direct helper
```

### size

Helps add sizing to components.

```
${size`font.default.height`} >> active size
${size`font.default:line.height|px`} >> active size
${size`font.default:line.height|%`} >> active size
```

Use it like below;

Button.js
`<Button /> // normal size`
`<Button size="big" />`
`<Button big />`

styled.js

```
${size`font.default.height`} >> active size
${size`font.default:line.height|px`} >> active size
${size`font.default:line.height|%`} >> active size
```

> you can unit your variables with `|` operator
> you can determine where is your size prop begins with `:` operator

### unit

Helps adding unit to props with this helper

```
${unit(get("padding"),"px")}
```

### cond

Helps write conditional css.

```
  margin-left: ${cond({
    if: or("marginTop", is.in("margin",top)),
    // you can use match strings, is, and, or operator here.
    then: size`button:title.margin|px`,
    else: "0px"
  })};
```

### match

Helps operate some matching in your props.

> this is a low level method, you can it strings with `cond` helper

```
match`hidden` >> is set
match`!hidden` >> is not set
match`!!hidden` >> is set to false
match`hidden > 8` >> is greater than 8
match`hidden >= 8` >> is greater or equal than 8
match`hidden < 8` >> is little than 8
match`hidden <= 8` >> is little or equal than 8
match`hidden != 8` >> is not equal
match`hidden == 8` >> is equal
match`vars in var` >> includes
match`vars nin var` >> not includes
```

### is

Same as match but more functional usage.

> this is a low level method, you can use it with `cond` helper

```
${is.nset("size")}
${is.set("size")}
${is.in("margin","top")}
${is.nin("margin",left)}
${is.eq("size","normal")}
${is.ne("size","big")}
${is.lt("width",200)}
${is.lte("width",200)}
${is.gt("width",200)}
${is.gte("width",200)}
${is.color("directHexColor")}
```

### or

Or operator for `cond` helper

> this is a low level method, you can use it with `cond` helper

```
or("normal","!!hidden",is.color("iconColor"))
```

### and

And operator for `cond` helper

```
and("normal","!!hidden",is.color("iconColor"))
```

> this is a low level method, you can use it with `cond` helper

### scale (Beta)

Helps use one variables like other.

```
${scale`padding as spacing`} >> active size
```

### uiProps

Helps pass your custom and pre-defined prop keys to components

`<Button {...uiProps(["onClick","foo","bar"])}`

### sizer

Helps find out next or previous size.

`<Button size={sizer("normal", -1)}`
`<Button size={sizer("normal", 2)}`

theme.var.js

```
  button:{
    micro:{},
    small:{}, // -1 resolves here
    normal:{}, // default
    medium:{},
    large:{} // 2 resolves here
  }
```

### OPTIONS

You can change `styled-lib` default options.

#### Usage

```
const Lib = new StyledLib({
  mixins: allMixins,
  theme: themeVars,
  options: {
    // all custom options in here, it will overwrite existing ones.
  }
});
```

#### Default options

```
{
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
```

### How to write styled-lib mixins?

Just wrap your mixins like this.

```
export default ({
  options, cond, is, or, get, size
  // you can use any helper styled-lib provides + your options
}) => {
  return (s, width, height) => {
    return p => { return // your mixin code will be here };
  };
};
```

```
export const Button = styled.div`
  ${gutter(size`card.gutter`)};
`
```

---

## Contribute

Pull requests are welcome and please submit bugs 🐛.

## Contact

- Follow [@doubco](https://twitter.com/doubco) on Twitter
- Follow [@doubco](http://facebook.com/doubco) on Facebook
- Follow [@doubco](http://instagram.com/doubco) on Instagram
- Email <mailto:hi@doub.co>
