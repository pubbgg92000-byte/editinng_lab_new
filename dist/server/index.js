var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e3) {
    throw err = [e3], e3;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e3) {
    throw mod = 0, e3;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .svelte-kit/output/server/chunks/internal2.js
function override(paths) {
  base = paths.base;
  assets = paths.assets;
}
function reset() {
  base = initial.base;
  assets = initial.assets;
}
var base, assets, app_dir, initial;
var init_internal2 = __esm({
  ".svelte-kit/output/server/chunks/internal2.js"() {
    base = "";
    assets = base;
    app_dir = "_app";
    initial = {
      base,
      assets
    };
    initial.base;
  }
});

// node_modules/devalue/src/constants.js
var UNDEFINED, HOLE, NAN, POSITIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_ZERO, SPARSE, MAX_ARRAY_LEN, MAX_ARRAY_INDEX;
var init_constants = __esm({
  "node_modules/devalue/src/constants.js"() {
    UNDEFINED = -1;
    HOLE = -2;
    NAN = -3;
    POSITIVE_INFINITY = -4;
    NEGATIVE_INFINITY = -5;
    NEGATIVE_ZERO = -6;
    SPARSE = -7;
    MAX_ARRAY_LEN = 2 ** 32 - 1;
    MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1;
  }
});

// node_modules/devalue/src/utils.js
function is_primitive(thing) {
  return thing === null || typeof thing !== "object" && typeof thing !== "function";
}
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
  );
}
function stringify_key(key2) {
  return is_identifier.test(key2) ? "." + key2 : "[" + JSON.stringify(key2) + "]";
}
function is_valid_array_index(n2) {
  if (!Number.isInteger(n2)) return false;
  if (n2 < 0) return false;
  if (n2 > MAX_ARRAY_INDEX) return false;
  return true;
}
function is_valid_array_len(n2) {
  if (!Number.isInteger(n2)) return false;
  if (n2 < 0) return false;
  if (n2 > MAX_ARRAY_LEN) return false;
  return true;
}
function is_valid_array_index_string(s3) {
  if (s3.length === 0) return false;
  if (s3.length > 1 && s3.charCodeAt(0) === 48) return false;
  for (let i = 0; i < s3.length; i++) {
    const c2 = s3.charCodeAt(i);
    if (c2 < 48 || c2 > 57) return false;
  }
  return is_valid_array_index(+s3);
}
function valid_array_indices(array2) {
  const keys = Object.keys(array2);
  for (var i = keys.length - 1; i >= 0; i--) {
    if (is_valid_array_index_string(keys[i])) {
      break;
    }
  }
  keys.length = i + 1;
  return keys;
}
var escaped, DevalueError, object_proto_names, is_identifier;
var init_utils = __esm({
  "node_modules/devalue/src/utils.js"() {
    init_constants();
    escaped = {
      "<": "\\u003C",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    DevalueError = class extends Error {
      /**
       * @param {string} message
       * @param {string[]} keys
       * @param {any} [value] - The value that failed to be serialized
       * @param {any} [root] - The root value being serialized
       */
      constructor(message, keys, value, root) {
        super(message);
        this.name = "DevalueError";
        this.path = keys.join("");
        this.value = value;
        this.root = root;
      }
    };
    object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
    is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
  }
});

// node_modules/devalue/src/uneval.js
function uneval(value, replacer) {
  const counts = /* @__PURE__ */ new Map();
  const keys = [];
  const custom = /* @__PURE__ */ new Map();
  function walk(thing) {
    if (!is_primitive(thing)) {
      if (counts.has(thing)) {
        counts.set(thing, counts.get(thing) + 1);
        return;
      }
      counts.set(thing, 1);
      if (replacer) {
        const str2 = replacer(thing, (value2) => uneval(value2, replacer));
        if (typeof str2 === "string") {
          custom.set(thing, str2);
          return;
        }
      }
      if (typeof thing === "function") {
        throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
      }
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "BigInt":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
        case "URL":
        case "URLSearchParams":
          return;
        case "Array":
          thing.forEach((value2, i) => {
            keys.push(`[${i}]`);
            walk(value2);
            keys.pop();
          });
          break;
        case "Set":
          Array.from(thing).forEach(walk);
          break;
        case "Map":
          for (const [key2, value2] of thing) {
            keys.push(`.get(${is_primitive(key2) ? stringify_primitive(key2) : "..."})`);
            walk(value2);
            keys.pop();
          }
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array":
        case "DataView":
          walk(thing.buffer);
          return;
        case "ArrayBuffer":
          return;
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          return;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
          }
          if (enumerable_symbols(thing).length > 0) {
            throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
          }
          for (const key2 of Object.keys(thing)) {
            if (key2 === "__proto__") {
              throw new DevalueError(
                `Cannot stringify objects with __proto__ keys`,
                keys,
                thing,
                value
              );
            }
            keys.push(stringify_key(key2));
            walk(thing[key2]);
            keys.pop();
          }
      }
    } else if (typeof thing === "symbol") {
      throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], get_name(i));
  });
  function stringify3(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (is_primitive(thing)) {
      return stringify_primitive(thing);
    }
    if (custom.has(thing)) {
      return custom.get(thing);
    }
    const type = get_type(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
      case "BigInt":
        return `Object(${stringify3(thing.valueOf())})`;
      case "RegExp":
        const { source: source2, flags: flags2 } = thing;
        return flags2 ? `new RegExp(${stringify_string(source2)},"${flags2}")` : `new RegExp(${stringify_string(source2)})`;
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "URL":
        return `new URL(${stringify_string(thing.toString())})`;
      case "URLSearchParams":
        return `new URLSearchParams(${stringify_string(thing.toString())})`;
      case "Array": {
        let has_holes = false;
        let result = "[";
        for (let i = 0; i < thing.length; i += 1) {
          if (i > 0) result += ",";
          if (Object.hasOwn(thing, i)) {
            result += stringify3(thing[i]);
          } else if (!has_holes) {
            const populated_keys = valid_array_indices(
              /** @type {any[]} */
              thing
            );
            const population = populated_keys.length;
            const d = String(thing.length).length;
            const hole_cost = thing.length + 2;
            const sparse_cost = 25 + d + population * (d + 2);
            if (hole_cost > sparse_cost) {
              const entries = populated_keys.map((k) => `${k}:${stringify3(thing[k])}`).join(",");
              return `Object.assign(Array(${thing.length}),{${entries}})`;
            }
            has_holes = true;
            i -= 1;
          }
        }
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return result + tail + "]";
      }
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify3).join(",")}])`;
      case "Int8Array":
      case "Uint8Array":
      case "Uint8ClampedArray":
      case "Int16Array":
      case "Uint16Array":
      case "Float16Array":
      case "Int32Array":
      case "Uint32Array":
      case "Float32Array":
      case "Float64Array":
      case "BigInt64Array":
      case "BigUint64Array": {
        let str2 = `new ${type}`;
        if (!names.has(thing.buffer)) {
          const array2 = new thing.constructor(thing.buffer);
          str2 += `([${array2}])`;
        } else {
          str2 += `(${stringify3(thing.buffer)})`;
        }
        if (thing.byteLength !== thing.buffer.byteLength) {
          const start = thing.byteOffset / thing.BYTES_PER_ELEMENT;
          const end = start + thing.length;
          str2 += `.subarray(${start},${end})`;
        }
        return str2;
      }
      case "DataView": {
        let str2 = `new DataView`;
        if (!names.has(thing.buffer)) {
          str2 += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`;
        } else {
          str2 += `(${stringify3(thing.buffer)}`;
        }
        if (thing.byteLength !== thing.buffer.byteLength) {
          str2 += `,${thing.startOffset},${thing.byteLength}`;
        }
        return str2 + ")";
      }
      case "ArrayBuffer": {
        const ui8 = new Uint8Array(thing);
        return `new Uint8Array([${ui8.toString()}]).buffer`;
      }
      case "Temporal.Duration":
      case "Temporal.Instant":
      case "Temporal.PlainDate":
      case "Temporal.PlainTime":
      case "Temporal.PlainDateTime":
      case "Temporal.PlainMonthDay":
      case "Temporal.PlainYearMonth":
      case "Temporal.ZonedDateTime":
        return `${type}.from(${stringify_string(thing.toString())})`;
      default:
        const keys2 = Object.keys(thing);
        const obj = keys2.map((key2) => `${safe_key(key2)}:${stringify3(thing[key2])}`).join(",");
        const proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return keys2.length > 0 ? `{${obj},__proto__:null}` : `{__proto__:null}`;
        }
        return `{${obj}}`;
    }
  }
  const str = stringify3(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (custom.has(thing)) {
        values.push(
          /** @type {string} */
          custom.get(thing)
        );
        return;
      }
      if (is_primitive(thing)) {
        values.push(stringify_primitive(thing));
        return;
      }
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "BigInt":
          values.push(`Object(${stringify3(thing.valueOf())})`);
          break;
        case "RegExp":
          const { source: source2, flags: flags2 } = thing;
          const regexp = flags2 ? `new RegExp(${stringify_string(source2)},"${flags2}")` : `new RegExp(${stringify_string(source2)})`;
          values.push(regexp);
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "URL":
          values.push(`new URL(${stringify_string(thing.toString())})`);
          break;
        case "URLSearchParams":
          values.push(`new URLSearchParams(${stringify_string(thing.toString())})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify3(v)}`);
          });
          break;
        case "Set":
          values.push(`new Set`);
          statements.push(
            `${name}.${Array.from(thing).map((v) => `add(${stringify3(v)})`).join(".")}`
          );
          break;
        case "Map":
          values.push(`new Map`);
          statements.push(
            `${name}.${Array.from(thing).map(([k, v]) => `set(${stringify3(k)}, ${stringify3(v)})`).join(".")}`
          );
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array": {
          let str2 = `new ${type}`;
          if (!names.has(thing.buffer)) {
            const array2 = new thing.constructor(thing.buffer);
            str2 += `([${array2}])`;
          } else {
            str2 += `(${stringify3(thing.buffer)})`;
          }
          if (thing.byteLength !== thing.buffer.byteLength) {
            const start = thing.byteOffset / thing.BYTES_PER_ELEMENT;
            const end = start + thing.length;
            str2 += `.subarray(${start},${end})`;
          }
          values.push(`{}`);
          statements.push(`${name}=${str2}`);
          break;
        }
        case "DataView": {
          let str2 = `new DataView`;
          if (!names.has(thing.buffer)) {
            str2 += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`;
          } else {
            str2 += `(${stringify3(thing.buffer)}`;
          }
          if (thing.byteLength !== thing.buffer.byteLength) {
            str2 += `,${thing.byteOffset},${thing.byteLength}`;
          }
          str2 += ")";
          values.push(`{}`);
          statements.push(`${name}=${str2}`);
          break;
        }
        case "ArrayBuffer":
          values.push(`new Uint8Array([${new Uint8Array(thing)}]).buffer`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key2) => {
            statements.push(`${name}${safe_prop(key2)}=${stringify3(thing[key2])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function get_name(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function escape_unsafe_char(c2) {
  return escaped[c2] || c2;
}
function escape_unsafe_chars(str) {
  return str.replace(unsafe_chars, escape_unsafe_char);
}
function safe_key(key2) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key2) ? key2 : escape_unsafe_chars(JSON.stringify(key2));
}
function safe_prop(key2) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key2) ? `.${key2}` : `[${escape_unsafe_chars(JSON.stringify(key2))}]`;
}
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing === void 0) return "void 0";
  if (thing === 0 && 1 / thing < 0) return "-0";
  const str = String(thing);
  if (type === "number") return str.replace(/^(-)?0\./, "$1.");
  if (type === "bigint") return thing + "n";
  return str;
}
var chars, unsafe_chars, reserved;
var init_uneval = __esm({
  "node_modules/devalue/src/uneval.js"() {
    init_utils();
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafe_chars = /[<\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
  }
});

// node_modules/devalue/src/base64.js
function encode_native(array_buffer) {
  return new Uint8Array(array_buffer).toBase64();
}
function decode_native(base64) {
  return Uint8Array.fromBase64(base64).buffer;
}
function encode_buffer(array_buffer) {
  return Buffer.from(array_buffer).toString("base64");
}
function decode_buffer(base64) {
  return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
function encode_legacy(array_buffer) {
  const array2 = new Uint8Array(array_buffer);
  let binary = "";
  const chunk_size = 32768;
  for (let i = 0; i < array2.length; i += chunk_size) {
    const chunk = array2.subarray(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}
function decode_legacy(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const array2 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array2[i] = binary_string.charCodeAt(i);
  }
  return array2.buffer;
}
var native, buffer, encode64, decode64;
var init_base64 = __esm({
  "node_modules/devalue/src/base64.js"() {
    native = typeof Uint8Array.fromBase64 === "function";
    buffer = typeof process === "object" && process.versions?.node !== void 0;
    encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
    decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;
  }
});

// node_modules/devalue/src/parse.js
function parse(serialized, revivers) {
  return unflatten(JSON.parse(serialized), revivers);
}
function unflatten(parsed, revivers) {
  if (typeof parsed === "number") return hydrate2(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  let hydrating2 = null;
  function hydrate2(index17, standalone = false) {
    if (index17 === UNDEFINED) return void 0;
    if (index17 === NAN) return NaN;
    if (index17 === POSITIVE_INFINITY) return Infinity;
    if (index17 === NEGATIVE_INFINITY) return -Infinity;
    if (index17 === NEGATIVE_ZERO) return -0;
    if (standalone || typeof index17 !== "number") {
      throw new Error(`Invalid input`);
    }
    if (index17 in hydrated) return hydrated[index17];
    const value = values[index17];
    if (!value || typeof value !== "object") {
      hydrated[index17] = value;
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") {
            i = values.push(value[1]) - 1;
          }
          hydrating2 ??= /* @__PURE__ */ new Set();
          if (hydrating2.has(i)) {
            throw new Error("Invalid circular reference");
          }
          hydrating2.add(i);
          hydrated[index17] = reviver(hydrate2(i));
          hydrating2.delete(i);
          return hydrated[index17];
        }
        switch (type) {
          case "Date":
            hydrated[index17] = new Date(value[1]);
            break;
          case "Set":
            const set2 = /* @__PURE__ */ new Set();
            hydrated[index17] = set2;
            for (let i = 1; i < value.length; i += 1) {
              set2.add(hydrate2(value[i]));
            }
            break;
          case "Map":
            const map = /* @__PURE__ */ new Map();
            hydrated[index17] = map;
            for (let i = 1; i < value.length; i += 2) {
              map.set(hydrate2(value[i]), hydrate2(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index17] = new RegExp(value[1], value[2]);
            break;
          case "Object": {
            const wrapped_index = value[1];
            if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") {
              throw new Error("Invalid input");
            }
            hydrated[index17] = Object(hydrate2(wrapped_index));
            break;
          }
          case "BigInt":
            hydrated[index17] = BigInt(value[1]);
            break;
          case "null":
            const obj = /* @__PURE__ */ Object.create(null);
            hydrated[index17] = obj;
            for (let i = 1; i < value.length; i += 2) {
              if (value[i] === "__proto__") {
                throw new Error("Cannot parse an object with a `__proto__` property");
              }
              obj[value[i]] = hydrate2(value[i + 1]);
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Float16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array":
          case "DataView": {
            if (values[value[1]][0] !== "ArrayBuffer") {
              throw new Error("Invalid data");
            }
            const TypedArrayConstructor = globalThis[type];
            const buffer2 = hydrate2(value[1]);
            hydrated[index17] = value[2] !== void 0 ? new TypedArrayConstructor(buffer2, value[2], value[3]) : new TypedArrayConstructor(buffer2);
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") {
              throw new Error("Invalid ArrayBuffer encoding");
            }
            const arraybuffer = decode64(base64);
            hydrated[index17] = arraybuffer;
            break;
          }
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            const temporalName = type.slice(9);
            hydrated[index17] = Temporal[temporalName].from(value[1]);
            break;
          }
          case "URL": {
            const url = new URL(value[1]);
            hydrated[index17] = url;
            break;
          }
          case "URLSearchParams": {
            const url = new URLSearchParams(value[1]);
            hydrated[index17] = url;
            break;
          }
          default:
            throw new Error(`Unknown type ${type}`);
        }
      } else if (value[0] === SPARSE) {
        const len = value[1];
        if (!is_valid_array_len(len)) {
          throw new Error("Invalid input");
        }
        const array2 = [];
        hydrated[index17] = array2;
        array2[MAX_ARRAY_INDEX] = void 0;
        delete array2[MAX_ARRAY_INDEX];
        for (let i = 2; i < value.length; i += 2) {
          const idx = value[i];
          if (!is_valid_array_index(idx) || idx >= len) {
            throw new Error("Invalid input");
          }
          array2[idx] = hydrate2(value[i + 1]);
        }
        array2.length = len;
      } else {
        const array2 = new Array(value.length);
        hydrated[index17] = array2;
        for (let i = 0; i < value.length; i += 1) {
          const n2 = value[i];
          if (n2 === HOLE) continue;
          array2[i] = hydrate2(n2);
        }
      }
    } else {
      const object = {};
      hydrated[index17] = object;
      for (const key2 of Object.keys(value)) {
        if (key2 === "__proto__") {
          throw new Error("Cannot parse an object with a `__proto__` property");
        }
        const n2 = value[key2];
        object[key2] = hydrate2(n2);
      }
    }
    return hydrated[index17];
  }
  return hydrate2(0);
}
var init_parse = __esm({
  "node_modules/devalue/src/parse.js"() {
    init_base64();
    init_constants();
    init_utils();
  }
});

// node_modules/devalue/src/stringify.js
function stringify(value, reducers) {
  const stringified = run(false, value, reducers);
  return typeof stringified === "string" ? stringified : `[${stringified.join(",")}]`;
}
function run(async, value, reducers) {
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  if (reducers) {
    for (const key2 of Object.getOwnPropertyNames(reducers)) {
      custom.push({ key: key2, fn: reducers[key2] });
    }
  }
  const keys = [];
  let p = 0;
  function flatten(thing, index18) {
    if (thing === void 0) return UNDEFINED;
    if (Number.isNaN(thing)) return NAN;
    if (thing === Infinity) return POSITIVE_INFINITY;
    if (thing === -Infinity) return NEGATIVE_INFINITY;
    if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO;
    if (indexes.has(thing)) return (
      /** @type {number} */
      indexes.get(thing)
    );
    index18 ??= p++;
    indexes.set(thing, index18);
    for (const { key: key2, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index18] = `["${key2}",${flatten(value2)}]`;
        return index18;
      }
    }
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
    } else if (typeof thing === "symbol") {
      throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
    }
    let str = "";
    if (is_primitive(thing)) {
      str = stringify_primitive2(thing);
    } else if (typeof thing.then === "function") {
      if (!async) {
        throw new DevalueError(
          `Cannot stringify a Promise or thenable \u2014 use stringifyAsync instead`,
          keys,
          thing,
          value
        );
      }
      str = Promise.resolve(thing).then((value2) => {
        const i = flatten(value2, index18);
        if (i < 0) stringified[index18] = i;
      });
    } else {
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "BigInt":
          str = `["Object",${flatten(thing.valueOf())}]`;
          break;
        case "Date":
          const valid = !isNaN(thing.getDate());
          str = `["Date","${valid ? thing.toISOString() : ""}"]`;
          break;
        case "URL":
          str = `["URL",${stringify_string(thing.toString())}]`;
          break;
        case "URLSearchParams":
          str = `["URLSearchParams",${stringify_string(thing.toString())}]`;
          break;
        case "RegExp":
          const { source: source2, flags: flags2 } = thing;
          str = flags2 ? `["RegExp",${stringify_string(source2)},"${flags2}"]` : `["RegExp",${stringify_string(source2)}]`;
          break;
        case "Array": {
          let mostly_dense = false;
          str = "[";
          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0) str += ",";
            if (Object.hasOwn(thing, i)) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else if (mostly_dense) {
              str += HOLE;
            } else {
              const populated_keys = valid_array_indices(
                /** @type {any[]} */
                thing
              );
              const population = populated_keys.length;
              const d = String(thing.length).length;
              const hole_cost = (thing.length - population) * 3;
              const sparse_cost = 4 + d + population * (d + 1);
              if (hole_cost > sparse_cost) {
                str = "[" + SPARSE + "," + thing.length;
                for (let j = 0; j < populated_keys.length; j++) {
                  const key2 = populated_keys[j];
                  keys.push(`[${key2}]`);
                  str += "," + key2 + "," + flatten(thing[key2]);
                  keys.pop();
                }
                break;
              } else {
                mostly_dense = true;
                str += HOLE;
              }
            }
          }
          str += "]";
          break;
        }
        case "Set":
          str = '["Set"';
          for (const value2 of thing) {
            str += `,${flatten(value2)}`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key2, value2] of thing) {
            keys.push(`.get(${is_primitive(key2) ? stringify_primitive2(key2) : "..."})`);
            str += `,${flatten(key2)},${flatten(value2)}`;
            keys.pop();
          }
          str += "]";
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array":
        case "DataView": {
          const typedArray = thing;
          str = '["' + type + '",' + flatten(typedArray.buffer);
          if (typedArray.byteLength !== typedArray.buffer.byteLength) {
            str += `,${typedArray.byteOffset},${typedArray.length}`;
          }
          str += "]";
          break;
        }
        case "ArrayBuffer": {
          const arraybuffer = thing;
          const base64 = encode64(arraybuffer);
          str = `["ArrayBuffer","${base64}"]`;
          break;
        }
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          str = `["${type}",${stringify_string(thing.toString())}]`;
          break;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
          }
          if (enumerable_symbols(thing).length > 0) {
            throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
          }
          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key2 of Object.keys(thing)) {
              if (key2 === "__proto__") {
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value
                );
              }
              keys.push(stringify_key(key2));
              str += `,${stringify_string(key2)},${flatten(thing[key2])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key2 of Object.keys(thing)) {
              if (key2 === "__proto__") {
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value
                );
              }
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key2));
              str += `${stringify_string(key2)}:${flatten(thing[key2])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }
    stringified[index18] = str;
    return index18;
  }
  const index17 = flatten(value);
  if (index17 < 0) return `${index17}`;
  return stringified;
}
function stringify_primitive2(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing === void 0) return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
  if (type === "bigint") return `["BigInt","${thing}"]`;
  return String(thing);
}
var init_stringify = __esm({
  "node_modules/devalue/src/stringify.js"() {
    init_utils();
    init_constants();
    init_base64();
  }
});

// node_modules/devalue/index.js
var init_devalue = __esm({
  "node_modules/devalue/index.js"() {
    init_uneval();
    init_parse();
    init_stringify();
  }
});

// node_modules/clsx/dist/clsx.mjs
function r(e3) {
  var t2, f, n2 = "";
  if ("string" == typeof e3 || "number" == typeof e3) n2 += e3;
  else if ("object" == typeof e3) if (Array.isArray(e3)) {
    var o2 = e3.length;
    for (t2 = 0; t2 < o2; t2++) e3[t2] && (f = r(e3[t2])) && (n2 && (n2 += " "), n2 += f);
  } else for (f in e3) e3[f] && (n2 && (n2 += " "), n2 += f);
  return n2;
}
function clsx() {
  for (var e3, t2, f = 0, n2 = "", o2 = arguments.length; f < o2; f++) (e3 = arguments[f]) && (t2 = r(e3)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
var init_clsx = __esm({
  "node_modules/clsx/dist/clsx.mjs"() {
  }
});

// .svelte-kit/output/server/chunks/server.js
function run2(fn) {
  return fn();
}
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) arr[i]();
}
function deferred() {
  var resolve2;
  var reject;
  return {
    promise: new Promise((res, rej) => {
      resolve2 = res;
      reject = rej;
    }),
    resolve: resolve2,
    reject
  };
}
function fallback(value, fallback2, lazy = false) {
  return value === void 0 ? lazy ? fallback2() : fallback2 : value;
}
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}
function experimental_async_required(name) {
  throw new Error(`https://svelte.dev/e/experimental_async_required`);
}
function lifecycle_outside_component(name) {
  throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
function missing_context() {
  throw new Error(`https://svelte.dev/e/missing_context`);
}
function effect_update_depth_exceeded() {
  throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
function hydration_failed() {
  throw new Error(`https://svelte.dev/e/hydration_failed`);
}
function state_descriptors_fixed() {
  throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
function state_prototype_fixed() {
  throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
function state_unsafe_mutation() {
  throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
function svelte_boundary_reset_onerror() {
  throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
function derived_inert() {
  console.warn(`https://svelte.dev/e/derived_inert`);
}
function hydration_mismatch(location) {
  console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
function svelte_boundary_reset_noop() {
  console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
function set_hydrating(value) {
  hydrating = value;
}
function set_hydrate_node(node) {
  if (node === null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return hydrate_node = node;
}
function hydrate_next() {
  return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
function next(count = 1) {
  if (hydrating) {
    var i = count;
    var node = hydrate_node;
    while (i--) node = /* @__PURE__ */ get_next_sibling(node);
    hydrate_node = node;
  }
}
function skip_nodes(remove = true) {
  var depth = 0;
  var node = hydrate_node;
  while (true) {
    if (node.nodeType === 8) {
      var data = node.data;
      if (data === "]") {
        if (depth === 0) return node;
        depth -= 1;
      } else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
    }
    var next2 = /* @__PURE__ */ get_next_sibling(node);
    if (remove) node.remove();
    node = next2;
  }
}
function set_component_context(context3) {
  component_context = context3;
}
function push$1(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    r: active_effect,
    l: legacy_mode_flag && !runes ? {
      s: null,
      u: null,
      $: []
    } : null
  };
}
function pop$1(component16) {
  var context3 = component_context;
  var effects = context3.e;
  if (effects !== null) {
    context3.e = null;
    for (var fn of effects) create_user_effect(fn);
  }
  if (component16 !== void 0) context3.x = component16;
  context3.i = true;
  component_context = context3.p;
  return component16 ?? {};
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks = micro_tasks;
    queueMicrotask(() => {
      if (tasks === micro_tasks) run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) run_micro_tasks();
}
function handle_error(error2) {
  var effect = active_effect;
  if (effect === null) {
    active_reaction.f |= ERROR_VALUE;
    return error2;
  }
  if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) throw error2;
  invoke_error_boundary(error2, effect);
}
function invoke_error_boundary(error2, effect) {
  if (effect !== null && (effect.f & 16384) !== 0) return;
  while (effect !== null) {
    if ((effect.f & 128) !== 0) {
      if ((effect.f & 32768) === 0) throw error2;
      try {
        effect.b.error(error2);
        return;
      } catch (e3) {
        error2 = e3;
      }
    }
    effect = effect.parent;
  }
  throw error2;
}
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived2) {
  if ((derived2.f & 512) !== 0 || derived2.deps === null) set_signal_status(derived2, CLEAN);
  else set_signal_status(derived2, MAYBE_DIRTY);
}
function clear_marked(deps) {
  if (deps === null) return;
  for (const dep of deps) {
    if ((dep.f & 2) === 0 || (dep.f & 65536) === 0) continue;
    dep.f ^= WAS_MARKED;
    clear_marked(
      /** @type {Derived} */
      dep.deps
    );
  }
}
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
  if ((effect.f & 2048) !== 0) dirty_effects.add(effect);
  else if ((effect.f & 4096) !== 0) maybe_dirty_effects.add(effect);
  clear_marked(effect.deps);
  set_signal_status(effect, CLEAN);
}
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop?.();
              stop = void 0;
              increment(version);
            }
          });
        };
      });
    }
  };
}
function boundary(node, props, children, transform_error) {
  new Boundary(node, props, children, transform_error);
}
function destroy_derived_effects(derived2) {
  var effects = derived2.effects;
  if (effects !== null) {
    derived2.effects = null;
    for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
  }
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  var parent = derived2.parent;
  if (!is_destroying_effect && parent !== null && derived2.v !== UNINITIALIZED && (parent.f & 24576) !== 0) {
    derived_inert();
    return derived2.v;
  }
  set_active_effect(parent);
  try {
    derived2.f &= ~WAS_MARKED;
    destroy_derived_effects(derived2);
    value = update_reaction(derived2);
  } finally {
    set_active_effect(prev_active_effect);
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  if (!derived2.equals(value)) {
    derived2.wv = increment_write_version();
    if (!current_batch?.is_fork || derived2.deps === null) {
      if (current_batch !== null) {
        current_batch.capture(derived2, value, true);
        previous_batch?.capture(derived2, value, true);
      } else derived2.v = value;
      if (derived2.deps === null) {
        set_signal_status(derived2, CLEAN);
        return;
      }
    }
  }
  if (is_destroying_effect) return;
  if (batch_values !== null) {
    if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived2, value);
  } else update_derived_status(derived2);
}
function freeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e3 of derived2.effects) if (e3.teardown || e3.ac) {
    e3.teardown?.();
    if (e3.ac !== null) without_reactive_context(() => {
      e3.ac.abort(STALE_REACTION);
      e3.ac = null;
    });
    if (e3.fn !== null) e3.teardown = noop;
    remove_reactions(e3, 0);
    destroy_effect_children(e3);
  }
}
function unfreeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e3 of derived2.effects) if (e3.teardown && e3.fn !== null) update_effect(e3);
}
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) {
      if (current_batch !== null && !current_batch.is_fork) current_batch.flush();
      result = fn();
    }
    while (true) {
      flush_tasks();
      if (current_batch === null) return result;
      current_batch.flush();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (error2) {
    invoke_error_boundary(error2, last_scheduled_effect);
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  var i = 0;
  while (i < length) {
    var effect = effects[i++];
    if ((effect.f & 24576) === 0 && is_dirty(effect)) {
      eager_block_effects = /* @__PURE__ */ new Set();
      update_effect(effect);
      if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
      if (eager_block_effects?.size > 0) {
        old_values.clear();
        for (const e3 of eager_block_effects) {
          if ((e3.f & 24576) !== 0) continue;
          const ordered_effects = [e3];
          let ancestor = e3.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1; j >= 0; j--) {
            const e4 = ordered_effects[j];
            if ((e4.f & 24576) !== 0) continue;
            update_effect(e4);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value)) return;
  marked.add(value);
  if (value.reactions !== null) for (const reaction of value.reactions) {
    const flags2 = reaction.f;
    if ((flags2 & 2) !== 0) mark_effects(reaction, sources, marked, checked);
    else if ((flags2 & 4194320) !== 0 && (flags2 & 2048) === 0 && depends_on(reaction, sources, checked)) {
      set_signal_status(reaction, DIRTY);
      schedule_effect(reaction);
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== void 0) return depends;
  if (reaction.deps !== null) for (const dep of reaction.deps) {
    if (includes.call(sources, dep)) return true;
    if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
      checked.set(dep, true);
      return true;
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(effect) {
  current_batch.schedule(effect);
}
function reset_branch(effect, tracked) {
  if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
  if ((effect.f & 2048) !== 0) tracked.d.push(effect);
  else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
  set_signal_status(effect, CLEAN);
  var e3 = effect.first;
  while (e3 !== null) {
    reset_branch(e3, tracked);
    e3 = e3.next;
  }
}
function reset_all(effect) {
  set_signal_status(effect, CLEAN);
  var e3 = effect.first;
  while (e3 !== null) {
    reset_all(e3);
    e3 = e3.next;
  }
}
function source(v, stack) {
  return {
    f: 0,
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
}
// @__NO_SIDE_EFFECTS__
function state(v, stack) {
  const s3 = source(v, stack);
  push_reaction_value(s3);
  return s3;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable2 = false, trackable = true) {
  const s3 = source(initial_value);
  if (!immutable2) s3.equals = safe_equals;
  if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) (component_context.l.s ??= []).push(s3);
  return s3;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !current_sources.has(source2))) state_unsafe_mutation();
  return internal_set(source2, should_proxy ? proxy(value) : value, legacy_updates);
}
function internal_set(source2, value, updated_during_traversal = null) {
  if (!source2.equals(value)) {
    old_values.set(source2, is_destroying_effect ? value : source2.v);
    var batch = Batch.ensure();
    batch.capture(source2, value);
    if ((source2.f & 2) !== 0) {
      const derived2 = source2;
      if ((source2.f & 2048) !== 0) execute_derived(derived2);
      if (batch_values === null) update_derived_status(derived2);
    }
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY, updated_during_traversal);
    if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) if (untracked_writes === null) set_untracked_writes([source2]);
    else untracked_writes.push(source2);
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  for (const effect of eager_effects) {
    if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
    let dirty;
    try {
      dirty = is_dirty(effect);
    } catch {
      dirty = true;
    }
    if (dirty) update_effect(effect);
  }
  eager_effects.clear();
}
function increment(source2) {
  set(source2, source2.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if (!runes && reaction === active_effect) continue;
    var not_dirty = (flags2 & DIRTY) === 0;
    if (not_dirty) set_signal_status(reaction, status);
    if ((flags2 & 131072) !== 0) eager_effects.add(reaction);
    else if ((flags2 & 2) !== 0) {
      var derived2 = reaction;
      batch_values?.delete(derived2);
      if ((flags2 & 65536) === 0) {
        if (flags2 & 512 && (active_effect === null || (active_effect.f & 2097152) === 0)) reaction.f |= WAS_MARKED;
        mark_reactions(derived2, MAYBE_DIRTY, updated_during_traversal);
      }
    } else if (not_dirty) {
      var effect = reaction;
      if ((flags2 & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
      if (updated_during_traversal !== null) updated_during_traversal.push(effect);
      else schedule_effect(effect);
    }
  }
}
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) return value;
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = /* @__PURE__ */ state(0);
  var stack = null;
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) return fn();
    var reaction = active_reaction;
    var version2 = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version2);
    return result;
  };
  if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(
    /** @type {any[]} */
    value.length,
    stack
  ));
  return new Proxy(value, {
    defineProperty(_, prop, descriptor) {
      if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
      var s3 = sources.get(prop);
      if (s3 === void 0) with_parent(() => {
        var s4 = /* @__PURE__ */ state(descriptor.value, stack);
        sources.set(prop, s4);
        return s4;
      });
      else set(s3, descriptor.value, true);
      return true;
    },
    deleteProperty(target, prop) {
      var s3 = sources.get(prop);
      if (s3 === void 0) {
        if (prop in target) {
          const s4 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
          sources.set(prop, s4);
          increment(version);
        }
      } else {
        set(s3, UNINITIALIZED);
        increment(version);
      }
      return true;
    },
    get(target, prop, receiver) {
      if (prop === STATE_SYMBOL) return value;
      var s3 = sources.get(prop);
      var exists = prop in target;
      if (s3 === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
        s3 = with_parent(() => {
          return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack);
        });
        sources.set(prop, s3);
      }
      if (s3 !== void 0) {
        var v = get(s3);
        return v === UNINITIALIZED ? void 0 : v;
      }
      return Reflect.get(target, prop, receiver);
    },
    getOwnPropertyDescriptor(target, prop) {
      var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (descriptor && "value" in descriptor) {
        var s3 = sources.get(prop);
        if (s3) descriptor.value = get(s3);
      } else if (descriptor === void 0) {
        var source2 = sources.get(prop);
        var value2 = source2?.v;
        if (source2 !== void 0 && value2 !== UNINITIALIZED) return {
          enumerable: true,
          configurable: true,
          value: value2,
          writable: true
        };
      }
      return descriptor;
    },
    has(target, prop) {
      if (prop === STATE_SYMBOL) return true;
      var s3 = sources.get(prop);
      var has = s3 !== void 0 && s3.v !== UNINITIALIZED || Reflect.has(target, prop);
      if (s3 !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
        if (s3 === void 0) {
          s3 = with_parent(() => {
            return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack);
          });
          sources.set(prop, s3);
        }
        if (get(s3) === UNINITIALIZED) return false;
      }
      return has;
    },
    set(target, prop, value2, receiver) {
      var s3 = sources.get(prop);
      var has = prop in target;
      if (is_proxied_array && prop === "length") for (var i = value2; i < s3.v; i += 1) {
        var other_s = sources.get(i + "");
        if (other_s !== void 0) set(other_s, UNINITIALIZED);
        else if (i in target) {
          other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
          sources.set(i + "", other_s);
        }
      }
      if (s3 === void 0) {
        if (!has || get_descriptor(target, prop)?.writable) {
          s3 = with_parent(() => /* @__PURE__ */ state(void 0, stack));
          set(s3, proxy(value2));
          sources.set(prop, s3);
        }
      } else {
        has = s3.v !== UNINITIALIZED;
        var p = with_parent(() => proxy(value2));
        set(s3, p);
      }
      var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (descriptor?.set) descriptor.set.call(receiver, value2);
      if (!has) {
        if (is_proxied_array && typeof prop === "string") {
          var ls = sources.get("length");
          var n2 = Number(prop);
          if (Number.isInteger(n2) && n2 >= ls.v) set(ls, n2 + 1);
        }
        increment(version);
      }
      return true;
    },
    ownKeys(target) {
      get(version);
      var own_keys = Reflect.ownKeys(target).filter((key3) => {
        var source3 = sources.get(key3);
        return source3 === void 0 || source3.v !== UNINITIALIZED;
      });
      for (var [key2, source2] of sources) if (source2.v !== UNINITIALIZED && !(key2 in target)) own_keys.push(key2);
      return own_keys;
    },
    setPrototypeOf() {
      state_prototype_fixed();
    }
  });
}
function init_operations() {
  if ($window !== void 0) return;
  $window = window;
  /Firefox/.test(navigator.userAgent);
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  var text_prototype = Text.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  if (is_extensible(element_prototype)) {
    element_prototype[CLASS_CACHE] = void 0;
    element_prototype[ATTRIBUTES_CACHE] = null;
    element_prototype[STYLE_CACHE] = void 0;
    element_prototype.__e = void 0;
  }
  if (is_extensible(text_prototype))
    text_prototype[TEXT_CACHE] = void 0;
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function clear_text_content(node) {
  node.textContent = "";
}
function push_effect(effect, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) parent_effect.last = parent_effect.first = effect;
  else {
    parent_last.next = effect;
    effect.prev = parent_last;
    parent_effect.last = effect;
  }
}
function create_effect(type, fn) {
  var parent = active_effect;
  if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
  var effect = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | 512,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  current_batch?.register_created_effect(effect);
  var e3 = effect;
  if ((type & 4) !== 0) if (collected_effects !== null) collected_effects.push(effect);
  else Batch.ensure().schedule(effect);
  else if (fn !== null) {
    try {
      update_effect(effect);
    } catch (e4) {
      destroy_effect(effect);
      throw e4;
    }
    if (e3.deps === null && e3.teardown === null && e3.nodes === null && e3.first === e3.last && (e3.f & 524288) === 0) {
      e3 = e3.first;
      if ((type & 16) !== 0 && (type & 65536) !== 0 && e3 !== null) e3.f |= EFFECT_TRANSPARENT;
    }
  }
  if (e3 !== null) {
    e3.parent = parent;
    if (parent !== null) push_effect(e3, parent);
    if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
      var derived2 = active_reaction;
      (derived2.effects ??= []).push(e3);
    }
  }
  return effect;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function create_user_effect(fn) {
  return create_effect(4 | USER_EFFECT, fn);
}
function component_root(fn) {
  Batch.ensure();
  const effect = create_effect(64 | EFFECT_PRESERVED, fn);
  return (options2 = {}) => {
    return new Promise((fulfil) => {
      if (options2.outro) pause_effect(effect, () => {
        destroy_effect(effect);
        fulfil(void 0);
      });
      else {
        destroy_effect(effect);
        fulfil(void 0);
      }
    });
  };
}
function render_effect(fn, flags2 = 0) {
  return create_effect(8 | flags2, fn);
}
function block(fn, flags2 = 0) {
  return create_effect(16 | flags2, fn);
}
function branch(fn) {
  return create_effect(32 | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect) {
  var teardown = effect.teardown;
  if (teardown !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect = signal.first;
  signal.first = signal.last = null;
  while (effect !== null) {
    const controller2 = effect.ac;
    if (controller2 !== null) without_reactive_context(() => {
      controller2.abort(STALE_REACTION);
    });
    var next2 = effect.next;
    if ((effect.f & 64) !== 0) effect.parent = null;
    else destroy_effect(effect, remove_dom);
    effect = next2;
  }
}
function destroy_block_effect_children(signal) {
  var effect = signal.first;
  while (effect !== null) {
    var next2 = effect.next;
    if ((effect.f & 32) === 0) destroy_effect(effect);
    effect = next2;
  }
}
function destroy_effect(effect, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
    remove_effect_dom(effect.nodes.start, effect.nodes.end);
    removed = true;
  }
  effect.f |= DESTROYING;
  destroy_effect_children(effect, remove_dom && !removed);
  remove_reactions(effect, 0);
  var transitions = effect.nodes && effect.nodes.t;
  if (transitions !== null) for (const transition of transitions) transition.stop();
  execute_effect_teardown(effect);
  effect.f ^= DESTROYING;
  effect.f |= DESTROYED;
  var parent = effect.parent;
  if (parent !== null && parent.first !== null) unlink_effect(effect);
  effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next2 = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
    node.remove();
    node = next2;
  }
}
function unlink_effect(effect) {
  var parent = effect.parent;
  var prev = effect.prev;
  var next2 = effect.next;
  if (prev !== null) prev.next = next2;
  if (next2 !== null) next2.prev = prev;
  if (parent !== null) {
    if (parent.first === effect) parent.first = next2;
    if (parent.last === effect) parent.last = prev;
  }
}
function pause_effect(effect, callback, destroy = true) {
  var transitions = [];
  pause_children(effect, transitions, true);
  var fn = () => {
    if (destroy) destroy_effect(effect);
    if (callback) callback();
  };
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition of transitions) transition.out(check);
  } else fn();
}
function pause_children(effect, transitions, local) {
  if ((effect.f & 8192) !== 0) return;
  effect.f ^= INERT;
  var t2 = effect.nodes && effect.nodes.t;
  if (t2 !== null) {
    for (const transition of t2) if (transition.is_global || local) transitions.push(transition);
  }
  var child = effect.first;
  while (child !== null) {
    var sibling = child.next;
    if ((child.f & 64) === 0) {
      var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
      pause_children(child, transitions, transparent ? local : false);
    }
    child = sibling;
  }
}
function move_effect(effect, fragment) {
  if (!effect.nodes) return;
  var node = effect.nodes.start;
  var end = effect.nodes.end;
  while (node !== null) {
    var next2 = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
    fragment.append(node);
    node = next2;
  }
}
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
function set_active_effect(effect) {
  active_effect = effect;
}
function push_reaction_value(value) {
  if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & 2) !== 0)) (current_sources ??= /* @__PURE__ */ new Set()).add(value);
}
function set_untracked_writes(value) {
  untracked_writes = value;
}
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(reaction) {
  var flags2 = reaction.f;
  if ((flags2 & 2048) !== 0) return true;
  if (flags2 & 2) reaction.f &= ~WAS_MARKED;
  if ((flags2 & 4096) !== 0) {
    var dependencies = reaction.deps;
    var length = dependencies.length;
    for (var i = 0; i < length; i++) {
      var dependency = dependencies[i];
      if (is_dirty(dependency)) update_derived(dependency);
      if (dependency.wv > reaction.wv) return true;
    }
    if ((flags2 & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) return;
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
    else if (effect === reaction) {
      if (root) set_signal_status(reaction, DIRTY);
      else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
      schedule_effect(reaction);
    }
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags2 = reaction.f;
  new_deps = null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & 96) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = reaction.fn;
    var result = fn();
    reaction.f |= REACTION_RAN;
    var deps = reaction.deps;
    var is_fork = current_batch?.is_fork;
    if (new_deps !== null) {
      var i;
      if (!is_fork) remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
      } else reaction.deps = deps = new_deps;
      if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
    } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (previous_reaction.deps !== null) for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) previous_reaction.deps[i2].rv = read_version;
      if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
      if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
      else previous_untracked_writes.push(...untracked_writes);
    }
    if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
    return result;
  } catch (error2) {
    return handle_error(error2);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index17 = index_of.call(reactions, signal);
    if (index17 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) reactions = dependency.reactions = null;
      else {
        reactions[index17] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
    var derived2 = dependency;
    if ((derived2.f & 512) !== 0) {
      derived2.f ^= 512;
      derived2.f &= ~WAS_MARKED;
    }
    if (derived2.v !== UNINITIALIZED) update_derived_status(derived2);
    if (derived2.ac !== null) without_reactive_context(() => {
      derived2.ac.abort(STALE_REACTION);
      derived2.ac = null;
    });
    freeze_derived_effects(derived2);
    remove_reactions(derived2, 0);
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
function update_effect(effect) {
  var flags2 = effect.f;
  if ((flags2 & 16384) !== 0) return;
  set_signal_status(effect, CLEAN);
  var previous_effect = active_effect;
  var was_updating_effect = is_updating_effect;
  active_effect = effect;
  is_updating_effect = (flags2 & 96) === 0;
  try {
    if ((flags2 & 16777232) !== 0) destroy_block_effect_children(effect);
    else destroy_effect_children(effect);
    execute_effect_teardown(effect);
    var teardown = update_reaction(effect);
    effect.teardown = typeof teardown === "function" ? teardown : null;
    effect.wv = write_version;
  } finally {
    is_updating_effect = was_updating_effect;
    active_effect = previous_effect;
  }
}
function get(signal) {
  var is_derived = (signal.f & 2) !== 0;
  captured_signals?.add(signal);
  if (active_reaction !== null && !untracking) {
    if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !current_sources.has(signal))) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & 2097152) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
          else if (new_deps === null) new_deps = [signal];
          else new_deps.push(signal);
        }
      } else {
        active_reaction.deps ??= [];
        if (!includes.call(active_reaction.deps, signal)) active_reaction.deps.push(signal);
        var reactions = signal.reactions;
        if (reactions === null) signal.reactions = [active_reaction];
        else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
      }
    }
  }
  if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
  if (is_derived) {
    var derived2 = signal;
    if (is_destroying_effect) {
      var value = derived2.v;
      if ((derived2.f & 1024) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) value = execute_derived(derived2);
      old_values.set(derived2, value);
      return value;
    }
    var should_connect = (derived2.f & 512) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & 512) !== 0);
    var is_new = (derived2.f & REACTION_RAN) === 0;
    if (is_dirty(derived2)) {
      if (should_connect) derived2.f |= 512;
      update_derived(derived2);
    }
    if (should_connect && !is_new) {
      unfreeze_derived_effects(derived2);
      reconnect(derived2);
    }
  }
  if (batch_values?.has(signal)) return batch_values.get(signal);
  if ((signal.f & 8388608) !== 0) throw signal.v;
  return signal.v;
}
function reconnect(derived2) {
  derived2.f |= 512;
  if (derived2.deps === null) return;
  for (const dep of derived2.deps) {
    (dep.reactions ??= []).push(derived2);
    if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
      unfreeze_derived_effects(dep);
      reconnect(dep);
    }
  }
}
function depends_on_old_values(derived2) {
  if (derived2.v === UNINITIALIZED) return true;
  if (derived2.deps === null) return false;
  for (const dep of derived2.deps) {
    if (old_values.has(dep)) return true;
    if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}
function subscribe_to_store(store, run3, invalidate) {
  if (store == null) {
    run3(void 0);
    if (invalidate) invalidate(void 0);
    return noop;
  }
  const unsub = untrack(() => store.subscribe(run3, invalidate));
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function readable(value, start) {
  return { subscribe: writable(value, start).subscribe };
}
function writable(value, start = noop) {
  let stop = null;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set2(fn(value));
  }
  function subscribe(run3, invalidate = noop) {
    const subscriber = [run3, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) stop = start(set2, update) || noop;
    run3(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return {
    set: set2,
    update,
    subscribe
  };
}
function is_void(name) {
  return VOID_ELEMENT_NAMES.includes(name) || name.toLowerCase() === "!doctype";
}
function is_boolean_attribute(name) {
  return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
function is_raw_text_element(name) {
  return RAW_TEXT_ELEMENTS.includes(name);
}
function escape_html(value, is_attr) {
  const str = String(value ?? "");
  const pattern2 = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern2.lastIndex = 0;
  let escaped2 = "";
  let last = 0;
  while (pattern2.test(str)) {
    const i = pattern2.lastIndex - 1;
    const ch = str[i];
    escaped2 += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped2 + str.substring(last);
}
function attr(name, value, is_boolean = false) {
  if (name === "hidden" && value !== "until-found") is_boolean = true;
  if (value == null || !value && is_boolean) return "";
  const normalized = has_own_property.call(replacements, name) && replacements[name].get(value) || value;
  return ` ${name}${is_boolean ? `=""` : `="${escape_html(normalized, true)}"`}`;
}
function clsx$1(value) {
  if (typeof value === "object") return clsx(value);
  else return value ?? "";
}
function to_class(value, hash2, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash2) classname = classname ? classname + " " + hash2 : hash2;
  if (directives) {
    for (var key2 of Object.keys(directives)) if (directives[key2]) classname = classname ? classname + " " + key2 : key2;
    else if (classname.length) {
      var len = key2.length;
      var a = 0;
      while ((a = classname.indexOf(key2, a)) >= 0) {
        var b = a + len;
        if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
        else a = b;
      }
    }
  }
  return classname === "" ? null : classname;
}
function append_styles(styles, important = false) {
  var separator = important ? " !important;" : ";";
  var css = "";
  for (var key2 of Object.keys(styles)) {
    var value = styles[key2];
    if (value != null && value !== "") css += " " + key2 + ": " + value + separator;
  }
  return css;
}
function to_css_name(name) {
  if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
  return name;
}
function to_style(value, styles) {
  if (styles) {
    var new_style = "";
    var normal_styles;
    var important_styles;
    if (Array.isArray(styles)) {
      normal_styles = styles[0];
      important_styles = styles[1];
    } else normal_styles = styles;
    if (value) {
      value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var in_str = false;
      var in_apo = 0;
      var in_comment = false;
      var reserved_names = [];
      if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
      if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
      var start_index = 0;
      var name_index = -1;
      const len = value.length;
      for (var i = 0; i < len; i++) {
        var c2 = value[i];
        if (in_comment) {
          if (c2 === "/" && value[i - 1] === "*") in_comment = false;
        } else if (in_str) {
          if (in_str === c2) in_str = false;
        } else if (c2 === "/" && value[i + 1] === "*") in_comment = true;
        else if (c2 === '"' || c2 === "'") in_str = c2;
        else if (c2 === "(") in_apo++;
        else if (c2 === ")") in_apo--;
        if (!in_comment && in_str === false && in_apo === 0) {
          if (c2 === ":" && name_index === -1) name_index = i;
          else if (c2 === ";" || i === len - 1) {
            if (name_index !== -1) {
              var name = to_css_name(value.substring(start_index, name_index).trim());
              if (!reserved_names.includes(name)) {
                if (c2 !== ";") i++;
                var property = value.substring(start_index, i).trim();
                new_style += " " + property + ";";
              }
            }
            start_index = i + 1;
            name_index = -1;
          }
        }
      }
    }
    if (normal_styles) new_style += append_styles(normal_styles);
    if (important_styles) new_style += append_styles(important_styles, true);
    new_style = new_style.trim();
    return new_style === "" ? null : new_style;
  }
  return value == null ? null : String(value);
}
function abort() {
  controller?.abort(STALE_REACTION);
  controller = null;
}
function getAbortSignal() {
  return (controller ??= new AbortController()).signal;
}
function async_local_storage_unavailable() {
  const error2 = /* @__PURE__ */ new Error(`async_local_storage_unavailable
The node API \`AsyncLocalStorage\` is not available, but is required to use async server rendering.
https://svelte.dev/e/async_local_storage_unavailable`);
  error2.name = "Svelte error";
  throw error2;
}
function await_invalid() {
  const error2 = /* @__PURE__ */ new Error(`await_invalid
Encountered asynchronous work while rendering synchronously.
https://svelte.dev/e/await_invalid`);
  error2.name = "Svelte error";
  throw error2;
}
function dynamic_element_invalid_tag(tag) {
  const error2 = /* @__PURE__ */ new Error(`dynamic_element_invalid_tag
\`<svelte:element this="${tag}">\` is not a valid element name \u2014 the element will not be rendered
https://svelte.dev/e/dynamic_element_invalid_tag`);
  error2.name = "Svelte error";
  throw error2;
}
function html_deprecated() {
  const error2 = /* @__PURE__ */ new Error(`html_deprecated
The \`html\` property of server render results has been deprecated. Use \`body\` instead.
https://svelte.dev/e/html_deprecated`);
  error2.name = "Svelte error";
  throw error2;
}
function hydratable_serialization_failed(key2, stack) {
  const error2 = /* @__PURE__ */ new Error(`hydratable_serialization_failed
Failed to serialize \`hydratable\` data for key \`${key2}\`.

\`hydratable\` can serialize anything [\`uneval\` from \`devalue\`](https://npmjs.com/package/uneval) can, plus Promises.

Cause:
${stack}
https://svelte.dev/e/hydratable_serialization_failed`);
  error2.name = "Svelte error";
  throw error2;
}
function invalid_csp() {
  const error2 = /* @__PURE__ */ new Error(`invalid_csp
\`csp.nonce\` was set while \`csp.hash\` was \`true\`. These options cannot be used simultaneously.
https://svelte.dev/e/invalid_csp`);
  error2.name = "Svelte error";
  throw error2;
}
function invalid_id_prefix() {
  const error2 = /* @__PURE__ */ new Error(`invalid_id_prefix
The \`idPrefix\` option cannot include \`--\`.
https://svelte.dev/e/invalid_id_prefix`);
  error2.name = "Svelte error";
  throw error2;
}
function lifecycle_function_unavailable(name) {
  const error2 = /* @__PURE__ */ new Error(`lifecycle_function_unavailable
\`${name}(...)\` is not available on the server
https://svelte.dev/e/lifecycle_function_unavailable`);
  error2.name = "Svelte error";
  throw error2;
}
function server_context_required() {
  const error2 = /* @__PURE__ */ new Error(`server_context_required
Could not resolve \`render\` context.
https://svelte.dev/e/server_context_required`);
  error2.name = "Svelte error";
  throw error2;
}
function set_ssr_context(v) {
  ssr_context = v;
}
function createContext() {
  const key2 = {};
  return [() => {
    if (!hasContext(key2)) missing_context();
    return getContext(key2);
  }, (context3) => setContext(key2, context3)];
}
function getContext(key2) {
  return get_or_init_context_map("getContext").get(key2);
}
function setContext(key2, context3) {
  get_or_init_context_map("setContext").set(key2, context3);
  return context3;
}
function hasContext(key2) {
  return get_or_init_context_map("hasContext").has(key2);
}
function getAllContexts() {
  return get_or_init_context_map("getAllContexts");
}
function get_or_init_context_map(name) {
  if (ssr_context === null) lifecycle_outside_component(name);
  return ssr_context.c ??= new Map(get_parent_context(ssr_context) || void 0);
}
function push(fn) {
  ssr_context = {
    p: ssr_context,
    c: null,
    r: null
  };
}
function pop() {
  ssr_context = ssr_context.p;
}
function get_parent_context(ssr_context2) {
  let parent = ssr_context2.p;
  while (parent !== null) {
    const context_map = parent.c;
    if (context_map !== null) return context_map;
    parent = parent.p;
  }
  return null;
}
function unresolved_hydratable(key2, stack) {
  console.warn(`https://svelte.dev/e/unresolved_hydratable`);
}
function get_render_context() {
  const store = context ?? als?.getStore();
  if (!store) server_context_required();
  return store;
}
async function with_render_context(fn) {
  context = { hydratable: {
    lookup: /* @__PURE__ */ new Map(),
    comparisons: [],
    unresolved_promises: /* @__PURE__ */ new Map()
  } };
  if (in_webcontainer()) {
    const { promise, resolve: resolve2 } = deferred();
    const previous_render = current_render;
    current_render = promise;
    await previous_render;
    return fn().finally(resolve2);
  }
  try {
    if (als === null) async_local_storage_unavailable();
    return als.run(context, fn);
  } finally {
    context = null;
  }
}
function init_render_context() {
  als_import ??= import("node:async_hooks").then((hooks) => {
    als = new hooks.AsyncLocalStorage();
  }).then(noop, noop);
  return als_import;
}
function in_webcontainer() {
  return !!globalThis.process?.versions?.webcontainer;
}
async function sha256(data) {
  text_encoder ??= new TextEncoder();
  crypto2 ??= globalThis.crypto?.subtle?.digest ? globalThis.crypto : (await obfuscated_import("node:crypto")).webcrypto;
  return base64_encode(await crypto2.subtle.digest("SHA-256", text_encoder.encode(data)));
}
function base64_encode(bytes2) {
  if (globalThis.Buffer) return globalThis.Buffer.from(bytes2).toString("base64");
  let binary = "";
  for (let i = 0; i < bytes2.length; i++) binary += String.fromCharCode(bytes2[i]);
  return btoa(binary);
}
function element(renderer, tag, attributes_fn = noop, children_fn = noop) {
  renderer.push("<!---->");
  if (tag) {
    if (!REGEX_VALID_TAG_NAME.test(tag)) dynamic_element_invalid_tag(tag);
    renderer.push(`<${tag}`);
    attributes_fn();
    renderer.push(`>`);
    if (!is_void(tag)) {
      children_fn();
      if (!is_raw_text_element(tag)) renderer.push(EMPTY_COMMENT);
      renderer.push(`</${tag}>`);
    }
  }
  renderer.push("<!---->");
}
function render(component16, options2 = {}) {
  if (options2.csp?.hash && options2.csp.nonce) invalid_csp();
  return Renderer.render(component16, options2);
}
function head(hash2, renderer, fn) {
  renderer.head((renderer2) => {
    renderer2.push(`<!--${hash2}-->`);
    renderer2.child(fn);
    renderer2.push(EMPTY_COMMENT);
  });
}
function attributes(attrs, css_hash, classes, styles, flags2 = 0) {
  if (styles) attrs.style = to_style(attrs.style, styles);
  if (attrs.class) attrs.class = clsx$1(attrs.class);
  if (css_hash || classes) attrs.class = to_class(attrs.class, css_hash, classes);
  let attr_str = "";
  let name;
  const is_html = (flags2 & 1) === 0;
  const lowercase = (flags2 & 2) === 0;
  const is_input = (flags2 & 4) !== 0;
  for (name of Object.keys(attrs)) {
    if (typeof attrs[name] === "function") continue;
    if (name[0] === "$" && name[1] === "$") continue;
    if (name === "" || INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
    var value = attrs[name];
    var lower = name.toLowerCase();
    if (lowercase) name = lower;
    if (lower.length > 2 && lower.startsWith("on")) continue;
    if (is_input) {
      if (name === "defaultvalue" || name === "defaultchecked") {
        name = name === "defaultvalue" ? "value" : "checked";
        if (attrs[name]) continue;
      }
    }
    attr_str += attr(name, value, is_html && is_boolean_attribute(name));
  }
  return attr_str;
}
function spread_props(props) {
  const merged_props = {};
  let key2;
  for (let i = 0; i < props.length; i++) {
    const obj = props[i];
    if (obj == null) continue;
    for (key2 of Object.keys(obj)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key2);
      if (desc) Object.defineProperty(merged_props, key2, desc);
      else merged_props[key2] = obj[key2];
    }
  }
  return merged_props;
}
function attr_class(value, hash2, directives) {
  var result = to_class(value, hash2, directives);
  return result ? ` class="${escape_html(result, true)}"` : "";
}
function attr_style(value, directives) {
  var result = to_style(value, directives);
  return result ? ` style="${escape_html(result, true)}"` : "";
}
function store_get(store_values, store_name, store) {
  if (store_name in store_values && store_values[store_name][0] === store) return store_values[store_name][2];
  store_values[store_name]?.[1]();
  store_values[store_name] = [
    store,
    null,
    void 0
  ];
  const unsub = subscribe_to_store(
    store,
    /** @param {any} v */
    (v) => store_values[store_name][2] = v
  );
  store_values[store_name][1] = unsub;
  return store_values[store_name][2];
}
function unsubscribe_stores(store_values) {
  for (const store_name of Object.keys(store_values)) store_values[store_name][1]();
}
function slot(renderer, $$props, name, slot_props, fallback_fn) {
  var slot_fn = $$props.$$slots?.[name];
  if (slot_fn === true) slot_fn = $$props[name === "default" ? "children" : name];
  if (slot_fn !== void 0) slot_fn(renderer, slot_props);
  else fallback_fn?.();
}
function rest_props(props, rest) {
  const rest_props2 = {};
  let key2;
  for (key2 of Object.keys(props)) if (!rest.includes(key2)) rest_props2[key2] = props[key2];
  return rest_props2;
}
function sanitize_props(props) {
  const { children, $$slots, ...sanitized } = props;
  return sanitized;
}
function bind_props(props_parent, props_now) {
  for (const key2 of Object.keys(props_now)) {
    const initial_value = props_parent[key2];
    const value = props_now[key2];
    if (initial_value === void 0 && value !== void 0 && Object.getOwnPropertyDescriptor(props_parent, key2)?.set) props_parent[key2] = value;
  }
}
function ensure_array_like(array_like_or_iterator) {
  if (array_like_or_iterator) return array_like_or_iterator.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
  return [];
}
function once(get_value) {
  let value = UNINITIALIZED;
  return () => {
    if (value === UNINITIALIZED) value = get_value();
    return value;
  };
}
function derived(fn) {
  const get_value = ssr_context === null ? fn : once(fn);
  let updated_value;
  return function(new_value) {
    if (arguments.length === 0) return updated_value ?? get_value();
    updated_value = new_value;
    return updated_value;
  };
}
var is_array, index_of, includes, array_from, define_property, get_descriptor, object_prototype, array_prototype, get_prototype_of, is_extensible, has_own_property, noop, CLEAN, DIRTY, MAYBE_DIRTY, INERT, DESTROYED, REACTION_RAN, DESTROYING, EFFECT_TRANSPARENT, EFFECT_PRESERVED, USER_EFFECT, WAS_MARKED, REACTION_IS_UPDATING, ERROR_VALUE, STATE_SYMBOL, LEGACY_PROPS, ATTRIBUTES_CACHE, CLASS_CACHE, STYLE_CACHE, TEXT_CACHE, STALE_REACTION, HYDRATION_ERROR, UNINITIALIZED, hydrating, hydrate_node, async_mode_flag, legacy_mode_flag, component_context, micro_tasks, STATUS_MASK, legacy_is_updating_store, flags, Boundary, OBSOLETE, first_batch, last_batch, current_batch, previous_batch, batch_values, last_scheduled_effect, is_flushing_sync, is_processing, collected_effects, legacy_updates, flush_count, uid, Batch, eager_block_effects, eager_effects, old_values, eager_effects_deferred, $window, first_child_getter, next_sibling_getter, captured_signals, is_updating_effect, is_destroying_effect, active_reaction, untracking, active_effect, current_sources, new_deps, skipped_deps, untracked_writes, write_version, read_version, update_version, subscriber_queue, VOID_ELEMENT_NAMES, DOM_BOOLEAN_ATTRIBUTES, PASSIVE_EVENTS, RAW_TEXT_ELEMENTS, REGEX_VALID_TAG_NAME, ATTR_REGEX, CONTENT_REGEX, replacements, whitespace, BLOCK_OPEN, BLOCK_CLOSE, EMPTY_COMMENT, controller, ssr_context, current_render, context, als, als_import, text_encoder, crypto2, obfuscated_import, Renderer, SSRState, INVALID_ATTR_NAME_CHAR_REGEX;
var init_server = __esm({
  ".svelte-kit/output/server/chunks/server.js"() {
    init_devalue();
    init_clsx();
    is_array = Array.isArray;
    index_of = Array.prototype.indexOf;
    includes = Array.prototype.includes;
    array_from = Array.from;
    define_property = Object.defineProperty;
    get_descriptor = Object.getOwnPropertyDescriptor;
    object_prototype = Object.prototype;
    array_prototype = Array.prototype;
    get_prototype_of = Object.getPrototypeOf;
    is_extensible = Object.isExtensible;
    has_own_property = Object.prototype.hasOwnProperty;
    noop = () => {
    };
    CLEAN = 1024;
    DIRTY = 2048;
    MAYBE_DIRTY = 4096;
    INERT = 8192;
    DESTROYED = 16384;
    REACTION_RAN = 32768;
    DESTROYING = 1 << 25;
    EFFECT_TRANSPARENT = 65536;
    EFFECT_PRESERVED = 1 << 19;
    USER_EFFECT = 1 << 20;
    WAS_MARKED = 65536;
    REACTION_IS_UPDATING = 1 << 21;
    ERROR_VALUE = 1 << 23;
    STATE_SYMBOL = /* @__PURE__ */ Symbol("$state");
    LEGACY_PROPS = /* @__PURE__ */ Symbol("legacy props");
    ATTRIBUTES_CACHE = /* @__PURE__ */ Symbol("attributes");
    CLASS_CACHE = /* @__PURE__ */ Symbol("class");
    STYLE_CACHE = /* @__PURE__ */ Symbol("style");
    TEXT_CACHE = /* @__PURE__ */ Symbol("text");
    STALE_REACTION = new class StaleReactionError extends Error {
      name = "StaleReactionError";
      message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
    }();
    globalThis.document?.contentType;
    HYDRATION_ERROR = {};
    UNINITIALIZED = /* @__PURE__ */ Symbol("uninitialized");
    hydrating = false;
    async_mode_flag = false;
    legacy_mode_flag = false;
    component_context = null;
    micro_tasks = [];
    STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
    legacy_is_updating_store = false;
    flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
    Boundary = class {
      /** @type {Boundary | null} */
      parent;
      is_pending = false;
      /**
      * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
      * Inherited from parent boundary, or defaults to identity.
      * @type {(error: unknown) => unknown}
      */
      transform_error;
      /** @type {TemplateNode} */
      #anchor;
      /** @type {TemplateNode | null} */
      #hydrate_open = hydrating ? hydrate_node : null;
      /** @type {BoundaryProps} */
      #props;
      /** @type {((anchor: Node) => void)} */
      #children;
      /** @type {Effect} */
      #effect;
      /** @type {Effect | null} */
      #main_effect = null;
      /** @type {Effect | null} */
      #pending_effect = null;
      /** @type {Effect | null} */
      #failed_effect = null;
      /** @type {DocumentFragment | null} */
      #offscreen_fragment = null;
      #local_pending_count = 0;
      #pending_count = 0;
      #pending_count_update_queued = false;
      /** @type {Set<Effect>} */
      #dirty_effects = /* @__PURE__ */ new Set();
      /** @type {Set<Effect>} */
      #maybe_dirty_effects = /* @__PURE__ */ new Set();
      /**
      * A source containing the number of pending async deriveds/expressions.
      * Only created if `$effect.pending()` is used inside the boundary,
      * otherwise updating the source results in needless `Batch.ensure()`
      * calls followed by no-op flushes
      * @type {Source<number> | null}
      */
      #effect_pending = null;
      #effect_pending_subscriber = createSubscriber(() => {
        this.#effect_pending = source(this.#local_pending_count);
        return () => {
          this.#effect_pending = null;
        };
      });
      /**
      * @param {TemplateNode} node
      * @param {BoundaryProps} props
      * @param {((anchor: Node) => void)} children
      * @param {((error: unknown) => unknown) | undefined} [transform_error]
      */
      constructor(node, props, children, transform_error) {
        this.#anchor = node;
        this.#props = props;
        this.#children = (anchor) => {
          var effect = active_effect;
          effect.b = this;
          effect.f |= 128;
          children(anchor);
        };
        this.parent = active_effect.b;
        this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e3) => e3);
        this.#effect = block(() => {
          if (hydrating) {
            const comment = this.#hydrate_open;
            hydrate_next();
            const server_rendered_pending = comment.data === "[!";
            if (comment.data.startsWith("[?")) {
              const serialized_error = JSON.parse(comment.data.slice(2));
              this.#hydrate_failed_content(serialized_error);
            } else if (server_rendered_pending) this.#hydrate_pending_content();
            else this.#hydrate_resolved_content();
          } else this.#render();
        }, flags);
        if (hydrating) this.#anchor = hydrate_node;
      }
      #hydrate_resolved_content() {
        try {
          this.#main_effect = branch(() => this.#children(this.#anchor));
        } catch (error2) {
          this.error(error2);
        }
      }
      /**
      * @param {unknown} error The deserialized error from the server's hydration comment
      */
      #hydrate_failed_content(error2) {
        const failed = this.#props.failed;
        if (!failed) return;
        this.#failed_effect = branch(() => {
          failed(this.#anchor, () => error2, () => () => {
          });
        });
      }
      #hydrate_pending_content() {
        const pending = this.#props.pending;
        if (!pending) return;
        this.is_pending = true;
        this.#pending_effect = branch(() => pending(this.#anchor));
        queue_micro_task(() => {
          var fragment = this.#offscreen_fragment = document.createDocumentFragment();
          var anchor = create_text();
          fragment.append(anchor);
          this.#main_effect = this.#run(() => {
            return branch(() => this.#children(anchor));
          });
          if (this.#pending_count === 0) {
            this.#anchor.before(fragment);
            this.#offscreen_fragment = null;
            pause_effect(this.#pending_effect, () => {
              this.#pending_effect = null;
            });
            this.#resolve(current_batch);
          }
        });
      }
      #render() {
        try {
          this.is_pending = this.has_pending_snippet();
          this.#pending_count = 0;
          this.#local_pending_count = 0;
          this.#main_effect = branch(() => {
            this.#children(this.#anchor);
          });
          if (this.#pending_count > 0) {
            var fragment = this.#offscreen_fragment = document.createDocumentFragment();
            move_effect(this.#main_effect, fragment);
            const pending = this.#props.pending;
            this.#pending_effect = branch(() => pending(this.#anchor));
          } else this.#resolve(current_batch);
        } catch (error2) {
          this.error(error2);
        }
      }
      /**
      * @param {Batch} batch
      */
      #resolve(batch) {
        this.is_pending = false;
        batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
      }
      /**
      * Defer an effect inside a pending boundary until the boundary resolves
      * @param {Effect} effect
      */
      defer_effect(effect) {
        defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
      }
      /**
      * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
      * @returns {boolean}
      */
      is_rendered() {
        return !this.is_pending && (!this.parent || this.parent.is_rendered());
      }
      has_pending_snippet() {
        return !!this.#props.pending;
      }
      /**
      * @template T
      * @param {() => T} fn
      */
      #run(fn) {
        var previous_effect = active_effect;
        var previous_reaction = active_reaction;
        var previous_ctx = component_context;
        set_active_effect(this.#effect);
        set_active_reaction(this.#effect);
        set_component_context(this.#effect.ctx);
        try {
          Batch.ensure();
          return fn();
        } catch (e3) {
          handle_error(e3);
          return null;
        } finally {
          set_active_effect(previous_effect);
          set_active_reaction(previous_reaction);
          set_component_context(previous_ctx);
        }
      }
      /**
      * Updates the pending count associated with the currently visible pending snippet,
      * if any, such that we can replace the snippet with content once work is done
      * @param {1 | -1} d
      * @param {Batch} batch
      */
      #update_pending_count(d, batch) {
        if (!this.has_pending_snippet()) {
          if (this.parent) this.parent.#update_pending_count(d, batch);
          return;
        }
        this.#pending_count += d;
        if (this.#pending_count === 0) {
          this.#resolve(batch);
          if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
            this.#pending_effect = null;
          });
          if (this.#offscreen_fragment) {
            this.#anchor.before(this.#offscreen_fragment);
            this.#offscreen_fragment = null;
          }
        }
      }
      /**
      * Update the source that powers `$effect.pending()` inside this boundary,
      * and controls when the current `pending` snippet (if any) is removed.
      * Do not call from inside the class
      * @param {1 | -1} d
      * @param {Batch} batch
      */
      update_pending_count(d, batch) {
        this.#update_pending_count(d, batch);
        this.#local_pending_count += d;
        if (!this.#effect_pending || this.#pending_count_update_queued) return;
        this.#pending_count_update_queued = true;
        queue_micro_task(() => {
          this.#pending_count_update_queued = false;
          if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
        });
      }
      get_effect_pending() {
        this.#effect_pending_subscriber();
        return get(this.#effect_pending);
      }
      /** @param {unknown} error */
      error(error2) {
        if (!this.#props.onerror && !this.#props.failed) throw error2;
        if (current_batch?.is_fork) {
          if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
          if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
          if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
          current_batch.oncommit(() => {
            this.#handle_error(error2);
          });
        } else this.#handle_error(error2);
      }
      /**
      * @param {unknown} error
      */
      #handle_error(error2) {
        if (this.#main_effect) {
          destroy_effect(this.#main_effect);
          this.#main_effect = null;
        }
        if (this.#pending_effect) {
          destroy_effect(this.#pending_effect);
          this.#pending_effect = null;
        }
        if (this.#failed_effect) {
          destroy_effect(this.#failed_effect);
          this.#failed_effect = null;
        }
        if (hydrating) {
          set_hydrate_node(this.#hydrate_open);
          next();
          set_hydrate_node(skip_nodes());
        }
        var onerror = this.#props.onerror;
        let failed = this.#props.failed;
        var did_reset = false;
        var calling_on_error = false;
        const reset2 = () => {
          if (did_reset) {
            svelte_boundary_reset_noop();
            return;
          }
          did_reset = true;
          if (calling_on_error) svelte_boundary_reset_onerror();
          if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
            this.#failed_effect = null;
          });
          this.#run(() => {
            this.#render();
          });
        };
        const handle_error_result = (transformed_error) => {
          try {
            calling_on_error = true;
            onerror?.(transformed_error, reset2);
            calling_on_error = false;
          } catch (error3) {
            invoke_error_boundary(error3, this.#effect && this.#effect.parent);
          }
          if (failed) this.#failed_effect = this.#run(() => {
            try {
              return branch(() => {
                var effect = active_effect;
                effect.b = this;
                effect.f |= 128;
                failed(this.#anchor, () => transformed_error, () => reset2);
              });
            } catch (error3) {
              invoke_error_boundary(error3, this.#effect.parent);
              return null;
            }
          });
        };
        queue_micro_task(() => {
          var result;
          try {
            result = this.transform_error(error2);
          } catch (e3) {
            invoke_error_boundary(e3, this.#effect && this.#effect.parent);
            return;
          }
          if (result !== null && typeof result === "object" && typeof result.then === "function")
            result.then(
              handle_error_result,
              /** @param {unknown} e */
              (e3) => invoke_error_boundary(e3, this.#effect && this.#effect.parent)
            );
          else handle_error_result(result);
        });
      }
    };
    OBSOLETE = /* @__PURE__ */ Symbol("obsolete");
    first_batch = null;
    last_batch = null;
    current_batch = null;
    previous_batch = null;
    batch_values = null;
    last_scheduled_effect = null;
    is_flushing_sync = false;
    is_processing = false;
    collected_effects = null;
    legacy_updates = null;
    flush_count = 0;
    uid = 1;
    Batch = class Batch2 {
      id = uid++;
      /** True as soon as `#process` was called */
      #started = false;
      linked = true;
      /** @type {Batch | null} */
      #prev = null;
      /** @type {Batch | null} */
      #next = null;
      /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
      async_deriveds = /* @__PURE__ */ new Map();
      /**
      * The current values of any signals that are updated in this batch.
      * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
      * They keys of this map are identical to `this.#previous`
      * @type {Map<Value, [any, boolean]>}
      */
      current = /* @__PURE__ */ new Map();
      /**
      * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
      * They keys of this map are identical to `this.#current`
      * @type {Map<Value, any>}
      */
      previous = /* @__PURE__ */ new Map();
      /**
      * When the batch is committed (and the DOM is updated), we need to remove old branches
      * and append new ones by calling the functions added inside (if/each/key/etc) blocks
      * @type {Set<(batch: Batch) => void>}
      */
      #commit_callbacks = /* @__PURE__ */ new Set();
      /**
      * If a fork is discarded, we need to destroy any effects that are no longer needed
      * @type {Set<(batch: Batch) => void>}
      */
      #discard_callbacks = /* @__PURE__ */ new Set();
      /**
      * The number of async effects that are currently in flight
      */
      #pending = 0;
      /**
      * Async effects that are currently in flight, _not_ inside a pending boundary
      * @type {Map<Effect, number>}
      */
      #blocking_pending = /* @__PURE__ */ new Map();
      /**
      * A deferred that resolves when the batch is committed, used with `settled()`
      * TODO replace with Promise.withResolvers once supported widely enough
      * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
      */
      #deferred = null;
      /**
      * The root effects that need to be flushed
      * @type {Effect[]}
      */
      #roots = [];
      /**
      * Effects created while this batch was active.
      * @type {Effect[]}
      */
      #new_effects = [];
      /**
      * Deferred effects (which run after async work has completed) that are DIRTY
      * @type {Set<Effect>}
      */
      #dirty_effects = /* @__PURE__ */ new Set();
      /**
      * Deferred effects that are MAYBE_DIRTY
      * @type {Set<Effect>}
      */
      #maybe_dirty_effects = /* @__PURE__ */ new Set();
      /**
      * A map of branches that still exist, but will be destroyed when this batch
      * is committed — we skip over these during `process`.
      * The value contains child effects that were dirty/maybe_dirty before being reset,
      * so they can be rescheduled if the branch survives.
      * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
      */
      #skipped_branches = /* @__PURE__ */ new Map();
      /**
      * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
      * @type {Set<Effect>}
      */
      #unskipped_branches = /* @__PURE__ */ new Set();
      is_fork = false;
      #decrement_queued = false;
      constructor() {
        if (last_batch === null) first_batch = last_batch = this;
        else {
          last_batch.#next = this;
          this.#prev = last_batch;
        }
        last_batch = this;
      }
      #is_deferred() {
        if (this.is_fork) return true;
        for (const effect of this.#blocking_pending.keys()) {
          var e3 = effect;
          var skipped = false;
          while (e3.parent !== null) {
            if (this.#skipped_branches.has(e3)) {
              skipped = true;
              break;
            }
            e3 = e3.parent;
          }
          if (!skipped) return true;
        }
        return false;
      }
      /**
      * Add an effect to the #skipped_branches map and reset its children
      * @param {Effect} effect
      */
      skip_effect(effect) {
        if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
          d: [],
          m: []
        });
        this.#unskipped_branches.delete(effect);
      }
      /**
      * Remove an effect from the #skipped_branches map and reschedule
      * any tracked dirty/maybe_dirty child effects
      * @param {Effect} effect
      * @param {(e: Effect) => void} callback
      */
      unskip_effect(effect, callback = (e3) => this.schedule(e3)) {
        var tracked = this.#skipped_branches.get(effect);
        if (tracked) {
          this.#skipped_branches.delete(effect);
          for (var e3 of tracked.d) {
            set_signal_status(e3, DIRTY);
            callback(e3);
          }
          for (e3 of tracked.m) {
            set_signal_status(e3, MAYBE_DIRTY);
            callback(e3);
          }
        }
        this.#unskipped_branches.add(effect);
      }
      #process() {
        this.#started = true;
        if (flush_count++ > 1e3) {
          this.#unlink();
          infinite_loop_guard();
        }
        for (const e3 of this.#dirty_effects) {
          this.#maybe_dirty_effects.delete(e3);
          set_signal_status(e3, DIRTY);
          this.schedule(e3);
        }
        for (const e3 of this.#maybe_dirty_effects) {
          set_signal_status(e3, MAYBE_DIRTY);
          this.schedule(e3);
        }
        const roots = this.#roots;
        this.#roots = [];
        this.apply();
        var effects = collected_effects = [];
        var render_effects = [];
        var updates = legacy_updates = [];
        for (const root of roots) try {
          this.#traverse(root, effects, render_effects);
        } catch (e3) {
          reset_all(root);
          if (!this.#is_deferred()) this.discard();
          throw e3;
        }
        current_batch = null;
        if (updates.length > 0) {
          var batch = Batch2.ensure();
          for (const e3 of updates) batch.schedule(e3);
        }
        collected_effects = null;
        legacy_updates = null;
        if (this.#is_deferred()) {
          this.#defer_effects(render_effects);
          this.#defer_effects(effects);
          for (const [e3, t2] of this.#skipped_branches) reset_branch(e3, t2);
          if (updates.length > 0)
            current_batch.#process();
          return;
        }
        const earlier_batch = this.#find_earlier_batch();
        if (earlier_batch) {
          this.#defer_effects(render_effects);
          this.#defer_effects(effects);
          earlier_batch.#merge(this);
          return;
        }
        this.#dirty_effects.clear();
        this.#maybe_dirty_effects.clear();
        for (const fn of this.#commit_callbacks) fn(this);
        this.#commit_callbacks.clear();
        previous_batch = this;
        flush_queued_effects(render_effects);
        flush_queued_effects(effects);
        previous_batch = null;
        this.#deferred?.resolve();
        var next_batch = current_batch;
        if (this.#pending === 0 && (this.#roots.length === 0 || next_batch !== null)) {
          this.#unlink();
          if (async_mode_flag) {
            this.#commit();
            current_batch = next_batch;
          }
        }
        if (this.#roots.length > 0) if (next_batch !== null) {
          const batch2 = next_batch;
          batch2.#roots.push(...this.#roots.filter((r3) => !batch2.#roots.includes(r3)));
        } else next_batch = this;
        if (next_batch !== null) next_batch.#process();
      }
      /**
      * Traverse the effect tree, executing effects or stashing
      * them for later execution as appropriate
      * @param {Effect} root
      * @param {Effect[]} effects
      * @param {Effect[]} render_effects
      */
      #traverse(root, effects, render_effects) {
        root.f ^= CLEAN;
        var effect = root.first;
        while (effect !== null) {
          var flags2 = effect.f;
          var is_branch = (flags2 & 96) !== 0;
          if (!(is_branch && (flags2 & 1024) !== 0 || (flags2 & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
            if (is_branch) effect.f ^= CLEAN;
            else if ((flags2 & 4) !== 0) effects.push(effect);
            else if (async_mode_flag && (flags2 & 16777224) !== 0) render_effects.push(effect);
            else if (is_dirty(effect)) {
              if ((flags2 & 16) !== 0) this.#maybe_dirty_effects.add(effect);
              update_effect(effect);
            }
            var child = effect.first;
            if (child !== null) {
              effect = child;
              continue;
            }
          }
          while (effect !== null) {
            var next2 = effect.next;
            if (next2 !== null) {
              effect = next2;
              break;
            }
            effect = effect.parent;
          }
        }
      }
      #find_earlier_batch() {
        var batch = this.#prev;
        while (batch !== null) {
          if (!batch.is_fork) {
            for (const [value, [, is_derived]] of this.current) if (batch.current.has(value) && !is_derived) return batch;
          }
          batch = batch.#prev;
        }
        return null;
      }
      /**
      * @param {Batch} batch
      */
      #merge(batch) {
        for (const [source2, value] of batch.current) {
          if (!this.previous.has(source2) && batch.previous.has(source2)) this.previous.set(source2, batch.previous.get(source2));
          this.current.set(source2, value);
        }
        for (const [effect, deferred2] of batch.async_deriveds) {
          const d = this.async_deriveds.get(effect);
          if (d) deferred2.promise.then(d.resolve).catch(d.reject);
        }
        batch.async_deriveds.clear();
        this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
        const mark = (value) => {
          var reactions = value.reactions;
          if (reactions === null) return;
          if ((value.f & 2) !== 0 && (value.f & 6144) === 0) return;
          for (const reaction of reactions) {
            var flags2 = reaction.f;
            if ((flags2 & 2) !== 0) mark(reaction);
            else {
              var effect = reaction;
              if (flags2 & 4194320 && !this.async_deriveds.has(effect)) {
                this.#maybe_dirty_effects.delete(effect);
                set_signal_status(effect, DIRTY);
                this.schedule(effect);
              }
            }
          }
        };
        for (const source2 of this.current.keys()) mark(source2);
        this.oncommit(() => batch.discard());
        batch.#unlink();
        current_batch = this;
        this.#process();
      }
      /**
      * @param {Effect[]} effects
      */
      #defer_effects(effects) {
        for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
      }
      /**
      * Associate a change to a given source with the current
      * batch, noting its previous and current values
      * @param {Value} source
      * @param {any} value
      * @param {boolean} [is_derived]
      */
      capture(source2, value, is_derived = false) {
        if (source2.v !== UNINITIALIZED && !this.previous.has(source2)) this.previous.set(source2, source2.v);
        if ((source2.f & 8388608) === 0) {
          this.current.set(source2, [value, is_derived]);
          batch_values?.set(source2, value);
        }
        if (!this.is_fork) source2.v = value;
      }
      activate() {
        current_batch = this;
      }
      deactivate() {
        current_batch = null;
        batch_values = null;
      }
      flush() {
        try {
          is_processing = true;
          current_batch = this;
          this.#process();
        } finally {
          flush_count = 0;
          last_scheduled_effect = null;
          collected_effects = null;
          legacy_updates = null;
          is_processing = false;
          current_batch = null;
          batch_values = null;
          old_values.clear();
        }
      }
      discard() {
        for (const fn of this.#discard_callbacks) fn(this);
        this.#discard_callbacks.clear();
        for (const deferred2 of this.async_deriveds.values()) deferred2.reject(OBSOLETE);
        this.#unlink();
        this.#deferred?.resolve();
      }
      /**
      * @param {Effect} effect
      */
      register_created_effect(effect) {
        this.#new_effects.push(effect);
      }
      #commit() {
        for (let batch = first_batch; batch !== null; batch = batch.#next) {
          var is_earlier = batch.id < this.id;
          var sources = [];
          for (const [source3, [value, is_derived]] of this.current) {
            if (batch.current.has(source3)) {
              var batch_value = batch.current.get(source3)[0];
              if (is_earlier && value !== batch_value) batch.current.set(source3, [value, is_derived]);
              else continue;
            }
            sources.push(source3);
          }
          if (is_earlier) for (const [effect, deferred2] of this.async_deriveds) {
            const d = batch.async_deriveds.get(effect);
            if (d) deferred2.promise.then(d.resolve).catch(d.reject);
          }
          var current2 = [...batch.current.keys()].filter((source3) => !batch.current.get(source3)[1]);
          if (!batch.#started || current2.length === 0) continue;
          var others = current2.filter((source3) => !this.current.has(source3));
          if (others.length === 0) {
            if (is_earlier) batch.discard();
          } else if (sources.length > 0) {
            if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e3) => {
              if ((e3.f & 4194320) !== 0) batch.schedule(e3);
              else batch.#defer_effects([e3]);
            });
            batch.activate();
            var marked = /* @__PURE__ */ new Set();
            var checked = /* @__PURE__ */ new Map();
            for (var source2 of sources) mark_effects(source2, others, marked, checked);
            checked = /* @__PURE__ */ new Map();
            var current_unequal = [...batch.current].filter(([c2, v1]) => {
              const v2 = this.current.get(c2);
              if (!v2) return true;
              return v2[0] !== v1[0] || v2[1] !== v1[1];
            }).map(([c2]) => c2);
            if (current_unequal.length > 0) {
              for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) if ((effect.f & 4194320) !== 0) {
                set_signal_status(effect, DIRTY);
                batch.schedule(effect);
              } else batch.#dirty_effects.add(effect);
            }
            if (batch.#roots.length > 0 && !batch.#decrement_queued) {
              batch.apply();
              for (var root of batch.#roots) batch.#traverse(root, [], []);
              batch.#roots = [];
            }
            batch.deactivate();
          }
        }
      }
      /**
      * @param {boolean} blocking
      * @param {Effect} effect
      */
      increment(blocking, effect) {
        this.#pending += 1;
        if (blocking) {
          let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
          this.#blocking_pending.set(effect, blocking_pending_count + 1);
        }
      }
      /**
      * @param {boolean} blocking
      * @param {Effect} effect
      */
      decrement(blocking, effect) {
        this.#pending -= 1;
        if (blocking) {
          let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
          if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
          else this.#blocking_pending.set(effect, blocking_pending_count - 1);
        }
        if (this.#decrement_queued) return;
        this.#decrement_queued = true;
        queue_micro_task(() => {
          this.#decrement_queued = false;
          if (this.linked) this.flush();
        });
      }
      /**
      * @param {Set<Effect>} dirty_effects
      * @param {Set<Effect>} maybe_dirty_effects
      */
      transfer_effects(dirty_effects, maybe_dirty_effects) {
        for (const e3 of dirty_effects) this.#dirty_effects.add(e3);
        for (const e3 of maybe_dirty_effects) this.#maybe_dirty_effects.add(e3);
        dirty_effects.clear();
        maybe_dirty_effects.clear();
      }
      /** @param {(batch: Batch) => void} fn */
      oncommit(fn) {
        this.#commit_callbacks.add(fn);
      }
      /** @param {(batch: Batch) => void} fn */
      ondiscard(fn) {
        this.#discard_callbacks.add(fn);
      }
      settled() {
        return (this.#deferred ??= deferred()).promise;
      }
      static ensure() {
        if (current_batch === null) {
          const batch = current_batch = new Batch2();
          if (!is_processing && !is_flushing_sync) queue_micro_task(() => {
            if (!batch.#started) batch.flush();
          });
        }
        return current_batch;
      }
      apply() {
        if (!async_mode_flag || !this.is_fork && this.#prev === null && this.#next === null) {
          batch_values = null;
          return;
        }
        batch_values = /* @__PURE__ */ new Map();
        for (const [source2, [value]] of this.current) batch_values.set(source2, value);
        for (let batch = first_batch; batch !== null; batch = batch.#next) {
          if (batch === this || batch.is_fork) continue;
          var intersects = false;
          if (batch.id < this.id) for (const [source2, [, is_derived]] of batch.current) {
            if (is_derived) continue;
            if (this.current.has(source2)) {
              intersects = true;
              break;
            }
          }
          if (!intersects) {
            for (const [source2, previous] of batch.previous) if (!batch_values.has(source2)) batch_values.set(source2, previous);
          }
        }
      }
      /**
      *
      * @param {Effect} effect
      */
      schedule(effect) {
        last_scheduled_effect = effect;
        if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
          effect.b.defer_effect(effect);
          return;
        }
        var e3 = effect;
        while (e3.parent !== null) {
          e3 = e3.parent;
          var flags2 = e3.f;
          if (collected_effects !== null && e3 === active_effect) {
            if (async_mode_flag) return;
            if ((active_reaction === null || (active_reaction.f & 2) === 0) && !legacy_is_updating_store) return;
          }
          if ((flags2 & 96) !== 0) {
            if ((flags2 & 1024) === 0) return;
            e3.f ^= CLEAN;
          }
        }
        this.#roots.push(e3);
      }
      #unlink() {
        if (!this.linked) return;
        var prev = this.#prev;
        var next2 = this.#next;
        if (prev === null) first_batch = next2;
        else prev.#next = next2;
        if (next2 === null) last_batch = prev;
        else next2.#prev = prev;
        this.linked = false;
      }
    };
    eager_block_effects = null;
    eager_effects = /* @__PURE__ */ new Set();
    old_values = /* @__PURE__ */ new Map();
    eager_effects_deferred = false;
    captured_signals = null;
    is_updating_effect = false;
    is_destroying_effect = false;
    active_reaction = null;
    untracking = false;
    active_effect = null;
    current_sources = null;
    new_deps = null;
    skipped_deps = 0;
    untracked_writes = null;
    write_version = 1;
    read_version = 0;
    update_version = read_version;
    subscriber_queue = [];
    VOID_ELEMENT_NAMES = [
      "area",
      "base",
      "br",
      "col",
      "command",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ];
    DOM_BOOLEAN_ATTRIBUTES = [
      "allowfullscreen",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "controls",
      "default",
      "disabled",
      "formnovalidate",
      "indeterminate",
      "inert",
      "ismap",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "playsinline",
      "readonly",
      "required",
      "reversed",
      "seamless",
      "selected",
      "webkitdirectory",
      "defer",
      "disablepictureinpicture",
      "disableremoteplayback"
    ];
    [...DOM_BOOLEAN_ATTRIBUTES];
    PASSIVE_EVENTS = ["touchstart", "touchmove"];
    RAW_TEXT_ELEMENTS = [
      "textarea",
      "script",
      "style",
      "title"
    ];
    REGEX_VALID_TAG_NAME = /^[a-zA-Z][a-zA-Z0-9]*(-[a-zA-Z0-9.\-_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]*)?$/u;
    ATTR_REGEX = /[&"<]/g;
    CONTENT_REGEX = /[&<]/g;
    replacements = { translate: /* @__PURE__ */ new Map([[true, "yes"], [false, "no"]]) };
    whitespace = [..." 	\n\r\f\xA0\v\uFEFF"];
    BLOCK_OPEN = `<!--[-->`;
    BLOCK_CLOSE = `<!--]-->`;
    EMPTY_COMMENT = `<!---->`;
    controller = null;
    ssr_context = null;
    current_render = null;
    context = null;
    als = null;
    als_import = null;
    obfuscated_import = (module_name) => import(
      /* @vite-ignore */
      module_name
    );
    Renderer = class Renderer2 {
      /**
      * The contents of the renderer.
      * @type {RendererItem[]}
      */
      #out = [];
      /**
      * Any `onDestroy` callbacks registered during execution of this renderer.
      * @type {(() => void)[] | undefined}
      */
      #on_destroy = void 0;
      /**
      * Whether this renderer is a component body.
      * @type {boolean}
      */
      #is_component_body = false;
      /**
      * If set, this renderer is an error boundary. When async collection
      * of the children fails, the failed snippet is rendered instead.
      * @type {{
      * 	failed: (renderer: Renderer, error: unknown, reset: () => void) => void;
      * 	transformError: (error: unknown) => unknown;
      * 	context: SSRContext | null;
      * } | null}
      */
      #boundary = null;
      /**
      * The type of string content that this renderer is accumulating.
      * @type {RendererType}
      */
      type;
      /** @type {Renderer | undefined} */
      #parent;
      /**
      * Asynchronous work associated with this renderer
      * @type {Promise<void> | undefined}
      */
      promise = void 0;
      /**
      * State which is associated with the content tree as a whole.
      * It will be re-exposed, uncopied, on all children.
      * @type {SSRState}
      * @readonly
      */
      global;
      /**
      * State that is local to the branch it is declared in.
      * It will be shallow-copied to all children.
      *
      * @type {{ select_value: string | undefined }}
      */
      local;
      /**
      * @param {SSRState} global
      * @param {Renderer | undefined} [parent]
      */
      constructor(global, parent) {
        this.#parent = parent;
        this.global = global;
        this.local = parent ? { ...parent.local } : { select_value: void 0 };
        this.type = parent ? parent.type : "body";
      }
      /**
      * @param {(renderer: Renderer) => void} fn
      */
      head(fn) {
        const head2 = new Renderer2(this.global, this);
        head2.type = "head";
        this.#out.push(head2);
        head2.child(fn);
      }
      /**
      * @param {Array<Promise<void>>} blockers
      * @param {(renderer: Renderer) => void} fn
      */
      async_block(blockers, fn) {
        this.#out.push(BLOCK_OPEN);
        this.async(blockers, fn);
        this.#out.push(BLOCK_CLOSE);
      }
      /**
      * @param {Array<Promise<void>>} blockers
      * @param {(renderer: Renderer) => void} fn
      */
      async(blockers, fn) {
        let callback = fn;
        if (blockers.length > 0) {
          const context3 = ssr_context;
          callback = (renderer) => {
            return Promise.all(blockers).then(() => {
              const previous_context = ssr_context;
              try {
                set_ssr_context(context3);
                return fn(renderer);
              } finally {
                set_ssr_context(previous_context);
              }
            });
          };
        }
        this.child(callback);
      }
      /**
      * @param {Array<() => void>} thunks
      */
      run(thunks) {
        const context3 = ssr_context;
        let promise = Promise.resolve(thunks[0]());
        const promises = [promise];
        for (const fn of thunks.slice(1)) {
          promise = promise.then(() => {
            const previous_context = ssr_context;
            set_ssr_context(context3);
            try {
              return fn();
            } finally {
              set_ssr_context(previous_context);
            }
          });
          promises.push(promise);
        }
        promise.catch(noop);
        this.promise = promise;
        return promises;
      }
      /**
      * @param {(renderer: Renderer) => MaybePromise<void>} fn
      */
      child_block(fn) {
        this.#out.push(BLOCK_OPEN);
        this.child(fn);
        this.#out.push(BLOCK_CLOSE);
      }
      /**
      * Create a child renderer. The child renderer inherits the state from the parent,
      * but has its own content.
      * @param {(renderer: Renderer) => MaybePromise<void>} fn
      */
      child(fn) {
        const child = new Renderer2(this.global, this);
        this.#out.push(child);
        const parent = ssr_context;
        set_ssr_context({
          ...ssr_context,
          p: parent,
          c: null,
          r: child
        });
        const result = fn(child);
        set_ssr_context(parent);
        if (result instanceof Promise) {
          result.catch(noop);
          result.finally(() => set_ssr_context(null)).catch(noop);
          if (child.global.mode === "sync") await_invalid();
          child.promise = result;
        }
        return child;
      }
      /**
      * Render children inside an error boundary. If the children throw and the API-level
      * `transformError` transform handles the error (doesn't re-throw), the `failed` snippet is
      * rendered instead. Otherwise the error propagates.
      *
      * @param {{ failed?: (renderer: Renderer, error: unknown, reset: () => void) => void }} props
      * @param {(renderer: Renderer) => MaybePromise<void>} children_fn
      */
      boundary(props, children_fn) {
        const child = new Renderer2(this.global, this);
        this.#out.push(child);
        const parent_context = ssr_context;
        if (props.failed) child.#boundary = {
          failed: props.failed,
          transformError: this.global.transformError,
          context: parent_context
        };
        set_ssr_context({
          ...ssr_context,
          p: parent_context,
          c: null,
          r: child
        });
        try {
          const result = children_fn(child);
          set_ssr_context(parent_context);
          if (result instanceof Promise) {
            if (child.global.mode === "sync") await_invalid();
            result.catch(noop);
            child.promise = result;
          }
        } catch (error2) {
          set_ssr_context(parent_context);
          const failed_snippet = props.failed;
          if (!failed_snippet) throw error2;
          const result = this.global.transformError(error2);
          child.#out.length = 0;
          child.#boundary = null;
          if (result instanceof Promise) {
            if (this.global.mode === "sync") await_invalid();
            child.promise = result.then((transformed) => {
              set_ssr_context(parent_context);
              child.#out.push(Renderer2.#serialize_failed_boundary(transformed));
              failed_snippet(child, transformed, noop);
              child.#out.push(BLOCK_CLOSE);
            });
            child.promise.catch(noop);
          } else {
            child.#out.push(Renderer2.#serialize_failed_boundary(result));
            failed_snippet(child, result, noop);
            child.#out.push(BLOCK_CLOSE);
          }
        }
      }
      /**
      * Create a component renderer. The component renderer inherits the state from the parent,
      * but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
      * @param {(renderer: Renderer) => MaybePromise<void>} fn
      * @param {Function} [component_fn]
      * @returns {void}
      */
      component(fn, component_fn) {
        push(component_fn);
        const child = this.child(fn);
        child.#is_component_body = true;
        pop();
      }
      /**
      * @param {Record<string, any>} attrs
      * @param {(renderer: Renderer) => void} fn
      * @param {string | undefined} [css_hash]
      * @param {Record<string, boolean> | undefined} [classes]
      * @param {Record<string, string> | undefined} [styles]
      * @param {number | undefined} [flags]
      * @param {boolean | undefined} [is_rich]
      * @returns {void}
      */
      select(attrs, fn, css_hash, classes, styles, flags2, is_rich) {
        const { value, ...select_attrs } = attrs;
        this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags2)}>`);
        this.child((renderer) => {
          renderer.local.select_value = value;
          fn(renderer);
        });
        this.push(`${is_rich ? "<!>" : ""}</select>`);
      }
      /**
      * @param {Record<string, any>} attrs
      * @param {string | number | boolean | ((renderer: Renderer) => void)} body
      * @param {string | undefined} [css_hash]
      * @param {Record<string, boolean> | undefined} [classes]
      * @param {Record<string, string> | undefined} [styles]
      * @param {number | undefined} [flags]
      * @param {boolean | undefined} [is_rich]
      */
      option(attrs, body, css_hash, classes, styles, flags2, is_rich) {
        this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags2)}`);
        const close = (renderer, value, { head: head2, body: body2 }) => {
          if (has_own_property.call(attrs, "value")) value = attrs.value;
          if (value === this.local.select_value) renderer.#out.push(' selected=""');
          renderer.#out.push(`>${body2}${is_rich ? "<!>" : ""}</option>`);
          if (head2) renderer.head((child) => child.push(head2));
        };
        if (typeof body === "function") this.child((renderer) => {
          const r3 = new Renderer2(this.global, this);
          body(r3);
          if (this.global.mode === "async") return r3.#collect_content_async().then((content) => {
            close(renderer, content.body.replaceAll("<!---->", ""), content);
          });
          else {
            const content = r3.#collect_content();
            close(renderer, content.body.replaceAll("<!---->", ""), content);
          }
        });
        else close(this, body, { body: escape_html(body) });
      }
      /**
      * @param {(renderer: Renderer) => void} fn
      */
      title(fn) {
        const path = this.get_path();
        const close = (head2) => {
          this.global.set_title(head2, path);
        };
        this.child((renderer) => {
          const r3 = new Renderer2(renderer.global, renderer);
          fn(r3);
          if (renderer.global.mode === "async") return r3.#collect_content_async().then((content) => {
            close(content.head);
          });
          else {
            const content = r3.#collect_content();
            close(content.head);
          }
        });
      }
      /**
      * @param {string | (() => Promise<string>)} content
      */
      push(content) {
        if (typeof content === "function") this.child(async (renderer) => renderer.push(await content()));
        else this.#out.push(content);
      }
      /**
      * @param {() => void} fn
      */
      on_destroy(fn) {
        (this.#on_destroy ??= []).push(fn);
      }
      /**
      * @returns {number[]}
      */
      get_path() {
        return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
      }
      /**
      * @deprecated this is needed for legacy component bindings
      */
      copy() {
        const copy = new Renderer2(this.global, this.#parent);
        copy.#out = this.#out.map((item) => item instanceof Renderer2 ? item.copy() : item);
        copy.promise = this.promise;
        return copy;
      }
      /**
      * @param {Renderer} other
      * @deprecated this is needed for legacy component bindings
      */
      subsume(other) {
        if (this.global.mode !== other.global.mode) throw new Error("invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!");
        this.local = other.local;
        this.#out = other.#out.map((item, i) => {
          const current2 = this.#out[i];
          if (current2 instanceof Renderer2 && item instanceof Renderer2) {
            current2.subsume(item);
            return current2;
          }
          return item;
        });
        this.promise = other.promise;
        this.type = other.type;
      }
      get length() {
        return this.#out.length;
      }
      /**
      * Creates the hydration comment that marks the start of a failed boundary.
      * The error is JSON-serialized and embedded inside an HTML comment for the client
      * to parse during hydration. The JSON is escaped to prevent `-->` or `<!--` sequences
      * from breaking out of the comment (XSS). Uses unicode escapes which `JSON.parse()`
      * handles transparently.
      * @param {unknown} error
      * @returns {string}
      */
      static #serialize_failed_boundary(error2) {
        return `<!--[?${JSON.stringify(error2).replace(/>/g, "\\u003e").replace(/</g, "\\u003c")}-->`;
      }
      /**
      * Only available on the server and when compiling with the `server` option.
      * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
      * @template {Record<string, any>} Props
      * @param {Component<Props>} component
      * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} [options]
      * @returns {RenderOutput}
      */
      static render(component16, options2 = {}) {
        let sync;
        let async;
        const result = {};
        Object.defineProperties(result, {
          html: { get: () => {
            return (sync ??= Renderer2.#render(component16, options2)).body;
          } },
          head: { get: () => {
            return (sync ??= Renderer2.#render(component16, options2)).head;
          } },
          body: { get: () => {
            return (sync ??= Renderer2.#render(component16, options2)).body;
          } },
          hashes: { value: { script: "" } },
          then: { value: (onfulfilled, onrejected) => {
            if (!async_mode_flag) {
              const result2 = sync ??= Renderer2.#render(component16, options2);
              const user_result = onfulfilled({
                head: result2.head,
                body: result2.body,
                html: result2.body,
                hashes: { script: [] }
              });
              return Promise.resolve(user_result);
            }
            async ??= init_render_context().then(() => with_render_context(() => Renderer2.#render_async(component16, options2)));
            return async.then((result2) => {
              Object.defineProperty(result2, "html", { get: () => {
                html_deprecated();
              } });
              return onfulfilled(result2);
            }, onrejected);
          } }
        });
        return result;
      }
      /**
      * Collect all of the `onDestroy` callbacks registered during rendering. In an async context, this is only safe to call
      * after awaiting `collect_async`.
      *
      * Child renderers are "porous" and don't affect execution order, but component body renderers
      * create ordering boundaries. Within a renderer, callbacks run in order until hitting a component boundary.
      * @returns {Iterable<() => void>}
      */
      *#collect_on_destroy() {
        for (const component16 of this.#traverse_components()) yield* component16.#collect_ondestroy();
      }
      /**
      * Performs a depth-first search of renderers, yielding the deepest components first, then additional components as we backtrack up the tree.
      * @returns {Iterable<Renderer>}
      */
      *#traverse_components() {
        for (const child of this.#out) if (typeof child !== "string") yield* child.#traverse_components();
        if (this.#is_component_body) yield this;
      }
      /**
      * @returns {Iterable<() => void>}
      */
      *#collect_ondestroy() {
        if (this.#on_destroy) for (const fn of this.#on_destroy) yield fn;
        for (const child of this.#out) if (child instanceof Renderer2 && !child.#is_component_body) yield* child.#collect_ondestroy();
      }
      /**
      * Render a component. Throws if any of the children are performing asynchronous work.
      *
      * @template {Record<string, any>} Props
      * @param {Component<Props>} component
      * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
      * @returns {AccumulatedContent}
      */
      static #render(component16, options2) {
        var previous_context = ssr_context;
        try {
          const renderer = Renderer2.#open_render("sync", component16, options2);
          const content = renderer.#collect_content();
          return Renderer2.#close_render(content, renderer);
        } finally {
          abort();
          set_ssr_context(previous_context);
        }
      }
      /**
      * Render a component.
      *
      * @template {Record<string, any>} Props
      * @param {Component<Props>} component
      * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
      * @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>}
      */
      static async #render_async(component16, options2) {
        const previous_context = ssr_context;
        try {
          const renderer = Renderer2.#open_render("async", component16, options2);
          const content = await renderer.#collect_content_async();
          const hydratables = await renderer.#collect_hydratables();
          if (hydratables !== null) content.head = hydratables + content.head;
          return Renderer2.#close_render(content, renderer);
        } finally {
          set_ssr_context(previous_context);
          abort();
        }
      }
      /**
      * Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
      * @param {AccumulatedContent} content
      * @returns {AccumulatedContent}
      */
      #collect_content(content = {
        head: "",
        body: ""
      }) {
        for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
        else if (item instanceof Renderer2) item.#collect_content(content);
        return content;
      }
      /**
      * Collect all of the code from the `out` array and return it as a string.
      * @param {AccumulatedContent} content
      * @returns {Promise<AccumulatedContent>}
      */
      async #collect_content_async(content = {
        head: "",
        body: ""
      }) {
        await this.promise;
        for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
        else if (item instanceof Renderer2) if (item.#boundary) {
          const boundary_content = {
            head: "",
            body: ""
          };
          try {
            await item.#collect_content_async(boundary_content);
            content.head += boundary_content.head;
            content.body += boundary_content.body;
          } catch (error2) {
            const { context: context3, failed, transformError } = item.#boundary;
            set_ssr_context(context3);
            let promise = transformError(error2);
            set_ssr_context(null);
            let transformed = await promise;
            set_ssr_context(context3);
            const failed_renderer = new Renderer2(item.global, item);
            failed_renderer.type = item.type;
            failed_renderer.#out.push(Renderer2.#serialize_failed_boundary(transformed));
            failed(failed_renderer, transformed, noop);
            failed_renderer.#out.push(BLOCK_CLOSE);
            await failed_renderer.#collect_content_async(content);
          }
        } else await item.#collect_content_async(content);
        return content;
      }
      async #collect_hydratables() {
        const ctx = get_render_context().hydratable;
        for (const [_, key2] of ctx.unresolved_promises) unresolved_hydratable(key2, ctx.lookup.get(key2)?.stack ?? "<missing stack trace>");
        for (const comparison of ctx.comparisons) await comparison;
        return await this.#hydratable_block(ctx);
      }
      /**
      * @template {Record<string, any>} Props
      * @param {'sync' | 'async'} mode
      * @param {import('svelte').Component<Props>} component
      * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
      * @returns {Renderer}
      */
      static #open_render(mode, component16, options2) {
        if (options2.idPrefix?.includes("--")) invalid_id_prefix();
        var previous_context = ssr_context;
        try {
          const renderer = new Renderer2(new SSRState(mode, options2.idPrefix ? options2.idPrefix + "-" : "", options2.csp, options2.transformError));
          set_ssr_context({
            p: null,
            c: options2.context ?? null,
            r: renderer
          });
          renderer.push(BLOCK_OPEN);
          component16(renderer, options2.props ?? {});
          renderer.push(BLOCK_CLOSE);
          return renderer;
        } finally {
          set_ssr_context(previous_context);
        }
      }
      /**
      * @param {AccumulatedContent} content
      * @param {Renderer} renderer
      * @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
      */
      static #close_render(content, renderer) {
        for (const cleanup of renderer.#collect_on_destroy()) cleanup();
        let head2 = content.head + renderer.global.get_title();
        let body = content.body;
        for (const { hash: hash2, code } of renderer.global.css) head2 += `<style id="${hash2}">${code}</style>`;
        return {
          head: head2,
          body,
          hashes: { script: renderer.global.csp.script_hashes }
        };
      }
      /**
      * @param {HydratableContext} ctx
      */
      async #hydratable_block(ctx) {
        if (ctx.lookup.size === 0) return null;
        let entries = [];
        let has_promises = false;
        for (const [k, v] of ctx.lookup) {
          if (v.promises) {
            has_promises = true;
            for (const p of v.promises) await p;
          }
          entries.push(`[${uneval(k)},${v.serialized}]`);
        }
        let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;
        if (has_promises) prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
        const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(",\n					")}
				]) {
					h.set(k, v);
				}
			}
		`;
        let csp_attr = "";
        if (this.global.csp.nonce) csp_attr = ` nonce="${this.global.csp.nonce}"`;
        else if (this.global.csp.hash) {
          const hash2 = await sha256(body);
          this.global.csp.script_hashes.push(`sha256-${hash2}`);
        }
        return `
		<script${csp_attr}>${body}<\/script>`;
      }
    };
    SSRState = class {
      /** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
      csp;
      /** @readonly @type {'sync' | 'async'} */
      mode;
      /** @readonly @type {() => string} */
      uid;
      /** @readonly @type {Set<{ hash: string; code: string }>} */
      css = /* @__PURE__ */ new Set();
      /**
      * `transformError` passed to `render`. Called when an error boundary catches an error.
      * Throws by default if unset in `render`.
      * @type {(error: unknown) => unknown}
      */
      transformError;
      /** @type {{ path: number[], value: string }} */
      #title = {
        path: [],
        value: ""
      };
      /**
      * @param {'sync' | 'async'} mode
      * @param {string} id_prefix
      * @param {Csp} csp
      * @param {((error: unknown) => unknown) | undefined} [transformError]
      */
      constructor(mode, id_prefix = "", csp = { hash: false }, transformError) {
        this.mode = mode;
        this.csp = {
          ...csp,
          script_hashes: []
        };
        this.transformError = transformError ?? ((error2) => {
          throw error2;
        });
        let uid2 = 1;
        this.uid = () => `${id_prefix}s${uid2++}`;
      }
      get_title() {
        return this.#title.value;
      }
      /**
      * Performs a depth-first (lexicographic) comparison using the path. Rejects sets
      * from earlier than or equal to the current value.
      * @param {string} value
      * @param {number[]} path
      */
      set_title(value, path) {
        const current2 = this.#title.path;
        let i = 0;
        let l = Math.min(path.length, current2.length);
        while (i < l && path[i] === current2[i]) i += 1;
        if (path[i] === void 0) return;
        if (current2[i] === void 0 || path[i] > current2[i]) {
          this.#title.path = path;
          this.#title.value = value;
        }
      }
    };
    INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
  }
});

// .svelte-kit/output/server/chunks/shared-server.js
function set_private_env(environment) {
  private_env = environment;
}
function set_public_env(environment) {
  public_env = environment;
}
var private_env, public_env;
var init_shared_server = __esm({
  ".svelte-kit/output/server/chunks/shared-server.js"() {
    private_env = {};
    public_env = {};
  }
});

// .svelte-kit/output/server/chunks/auth.js
async function sign(value) {
  const key2 = await crypto.subtle.importKey("raw", bytes(secret()), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key2, bytes(value));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createSession(userEmail) {
  const payload2 = `${userEmail}:${Date.now()}`;
  return `${payload2}:${await sign(payload2)}`;
}
async function verifySession(token) {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length < 3) return false;
  return parts.pop() === await sign(parts.join(":")) && Date.now() - Number(parts.at(-1)) < 1e3 * 60 * 60 * 24 * 14;
}
var email, password, secret, bytes, validCredentials;
var init_auth = __esm({
  ".svelte-kit/output/server/chunks/auth.js"() {
    init_shared_server();
    email = () => private_env.ADMIN_EMAIL || "admin@studioflow.app";
    password = () => private_env.ADMIN_PASSWORD || "studioflow";
    secret = () => private_env.SESSION_SECRET || "studioflow-local-development-secret";
    bytes = (value) => new TextEncoder().encode(value);
    validCredentials = (userEmail, userPassword) => userEmail.trim().toLowerCase() === email().toLowerCase() && userPassword === password();
  }
});

// node_modules/@sveltejs/kit/src/exports/internal/remote-functions.js
var init_remote_functions = __esm({
  "node_modules/@sveltejs/kit/src/exports/internal/remote-functions.js"() {
  }
});

// node_modules/@sveltejs/kit/src/exports/internal/index.js
var HttpError, Redirect, SvelteKitError, ActionFailure;
var init_internal = __esm({
  "node_modules/@sveltejs/kit/src/exports/internal/index.js"() {
    init_remote_functions();
    HttpError = class {
      /**
       * @param {number} status
       * @param {{message: string} extends App.Error ? (App.Error | string | undefined) : App.Error} body
       */
      constructor(status, body) {
        this.status = status;
        if (typeof body === "string") {
          this.body = { message: body };
        } else if (body) {
          this.body = body;
        } else {
          this.body = { message: `Error: ${status}` };
        }
      }
      toString() {
        return JSON.stringify(this.body);
      }
    };
    Redirect = class {
      /**
       * @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308} status
       * @param {string} location
       */
      constructor(status, location) {
        try {
          new Headers({ location });
        } catch {
          throw new Error(
            `Invalid redirect location ${JSON.stringify(location)}: this string contains characters that cannot be used in HTTP headers`
          );
        }
        this.status = status;
        this.location = location;
      }
    };
    SvelteKitError = class extends Error {
      /**
       * @param {number} status
       * @param {string} text
       * @param {string} message
       */
      constructor(status, text2, message) {
        super(message);
        this.status = status;
        this.text = text2;
      }
    };
    ActionFailure = class {
      /**
       * @param {number} status
       * @param {T} data
       */
      constructor(status, data) {
        this.status = status;
        this.data = data;
      }
    };
  }
});

// node_modules/esm-env/true.js
var true_default;
var init_true = __esm({
  "node_modules/esm-env/true.js"() {
    true_default = true;
  }
});

// node_modules/esm-env/dev-fallback.js
var node_env, dev_fallback_default;
var init_dev_fallback = __esm({
  "node_modules/esm-env/dev-fallback.js"() {
    node_env = globalThis.process?.env?.NODE_ENV;
    dev_fallback_default = node_env && !node_env.toLowerCase().startsWith("prod");
  }
});

// node_modules/esm-env/false.js
var init_false = __esm({
  "node_modules/esm-env/false.js"() {
  }
});

// node_modules/esm-env/index.js
var init_esm_env = __esm({
  "node_modules/esm-env/index.js"() {
    init_true();
    init_dev_fallback();
    init_false();
  }
});

// node_modules/@sveltejs/kit/src/runtime/pathname.js
var init_pathname = __esm({
  "node_modules/@sveltejs/kit/src/runtime/pathname.js"() {
  }
});

// node_modules/@sveltejs/kit/src/runtime/utils.js
var text_encoder2;
var init_utils2 = __esm({
  "node_modules/@sveltejs/kit/src/runtime/utils.js"() {
    init_esm_env();
    text_encoder2 = new TextEncoder();
  }
});

// node_modules/@sveltejs/kit/src/version.js
var init_version = __esm({
  "node_modules/@sveltejs/kit/src/version.js"() {
  }
});

// node_modules/@sveltejs/kit/src/exports/index.js
function error(status, body) {
  if ((!true_default || dev_fallback_default) && (isNaN(status) || status < 400 || status > 599)) {
    throw new Error(`HTTP error status codes must be between 400 and 599 \u2014 ${status} is invalid`);
  }
  throw new HttpError(status, body);
}
function redirect(status, location) {
  if ((!true_default || dev_fallback_default) && (isNaN(status) || status < 300 || status > 308)) {
    throw new Error("Invalid status code");
  }
  throw new Redirect(
    // @ts-ignore
    status,
    location.toString()
  );
}
function isRedirect(e3) {
  return e3 instanceof Redirect;
}
function json(data, init2) {
  const body = JSON.stringify(data);
  const headers3 = new Headers(init2?.headers);
  if (!headers3.has("content-length")) {
    headers3.set("content-length", text_encoder2.encode(body).byteLength.toString());
  }
  if (!headers3.has("content-type")) {
    headers3.set("content-type", "application/json");
  }
  return new Response(body, {
    ...init2,
    headers: headers3
  });
}
function text(body, init2) {
  const headers3 = new Headers(init2?.headers);
  if (!headers3.has("content-length")) {
    const encoded = text_encoder2.encode(body);
    headers3.set("content-length", encoded.byteLength.toString());
    return new Response(encoded, {
      ...init2,
      headers: headers3
    });
  }
  return new Response(body, {
    ...init2,
    headers: headers3
  });
}
function fail(status, data) {
  return new ActionFailure(status, data);
}
var init_exports = __esm({
  "node_modules/@sveltejs/kit/src/exports/index.js"() {
    init_internal();
    init_esm_env();
    init_pathname();
    init_utils2();
    init_version();
  }
});

// .svelte-kit/output/server/entries/hooks.server.js
var hooks_server_exports = {};
__export(hooks_server_exports, {
  handle: () => handle
});
var protectedPrefixes, handle;
var init_hooks_server = __esm({
  ".svelte-kit/output/server/entries/hooks.server.js"() {
    init_auth();
    init_exports();
    protectedPrefixes = [
      "/dashboard",
      "/customers",
      "/orders",
      "/editors",
      "/invoices",
      "/settings"
    ];
    handle = async ({ event, resolve: resolve2 }) => {
      if (protectedPrefixes.some((path) => event.url.pathname.startsWith(path)) && !await verifySession(event.cookies.get("studioflow_session"))) redirect(303, "/login");
      return resolve2(event);
    };
  }
});

// .svelte-kit/output/server/chunks/internal.js
function set_read_implementation(fn) {
  read_implementation = fn;
}
function set_manifest(_) {
}
function handle_event_propagation(event) {
  var handler_element = this;
  var owner_document = handler_element.ownerDocument;
  var event_name = event.type;
  var path = event.composedPath?.() || [];
  var current_target = path[0] || event.target;
  last_propagated_event = event;
  var path_idx = 0;
  var handled_at = last_propagated_event === event && event[event_symbol];
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
      event[event_symbol] = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) return;
    if (at_idx <= handler_idx) path_idx = at_idx;
  }
  current_target = path[path_idx] || event.target;
  if (current_target === handler_element) return;
  define_property(event, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      if (current_target === handler_element) break;
      try {
        var delegated = current_target[event_symbol]?.[event_name];
        if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
      } catch (error2) {
        if (throw_error) other_errors.push(error2);
        else throw_error = error2;
      }
      if (event.cancelBubble) break;
      path_idx++;
      current_target = path_idx < path.length ? path[path_idx] : null;
    }
    if (throw_error) {
      for (let error2 of other_errors) queueMicrotask(() => {
        throw error2;
      });
      throw throw_error;
    }
  } finally {
    event[event_symbol] = handler_element;
    delete event.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function assign_nodes(start, end) {
  var effect = active_effect;
  if (effect.nodes === null) effect.nodes = {
    start,
    end,
    a: null,
    t: null
  };
}
function mount$1(component16, options2) {
  return _mount(component16, options2);
}
function hydrate$1(component16, options2) {
  init_operations();
  options2.intro = options2.intro ?? false;
  const target = options2.target;
  const was_hydrating = hydrating;
  const previous_hydrate_node = hydrate_node;
  try {
    var anchor = /* @__PURE__ */ get_first_child(target);
    while (anchor && (anchor.nodeType !== 8 || anchor.data !== "[")) anchor = /* @__PURE__ */ get_next_sibling(anchor);
    if (!anchor) throw HYDRATION_ERROR;
    set_hydrating(true);
    set_hydrate_node(anchor);
    const instance = _mount(component16, {
      ...options2,
      anchor
    });
    set_hydrating(false);
    return instance;
  } catch (error2) {
    if (error2 instanceof Error && error2.message.split("\n").some((line) => line.startsWith("https://svelte.dev/e/"))) throw error2;
    if (error2 !== HYDRATION_ERROR) console.warn("Failed to hydrate: ", error2);
    if (options2.recover === false) hydration_failed();
    init_operations();
    clear_text_content(target);
    set_hydrating(false);
    return mount$1(component16, options2);
  } finally {
    set_hydrating(was_hydrating);
    set_hydrate_node(previous_hydrate_node);
  }
}
function _mount(Component, { target, anchor, props = {}, events, context: context3, intro = true, transformError }) {
  init_operations();
  var component16 = void 0;
  var unmount2 = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    boundary(anchor_node, { pending: () => {
    } }, (anchor_node2) => {
      push$1({});
      var ctx = component_context;
      if (context3) ctx.c = context3;
      if (events)
        props.$$events = events;
      if (hydrating) assign_nodes(anchor_node2, null);
      component16 = Component(anchor_node2, props) || {};
      if (hydrating) {
        active_effect.nodes.end = hydrate_node;
        if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
          hydration_mismatch();
          throw HYDRATION_ERROR;
        }
      }
      pop$1();
    }, transformError);
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        for (const node of [target, document]) {
          var counts = listeners.get(node);
          if (counts === void 0) {
            counts = /* @__PURE__ */ new Map();
            listeners.set(node, counts);
          }
          var count = counts.get(event_name);
          if (count === void 0) {
            node.addEventListener(event_name, handle_event_propagation, { passive });
            counts.set(event_name, 1);
          } else counts.set(event_name, count + 1);
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    return () => {
      for (var event_name of registered_events) for (const node of [target, document]) {
        var counts = listeners.get(node);
        var count = counts.get(event_name);
        if (--count == 0) {
          node.removeEventListener(event_name, handle_event_propagation);
          counts.delete(event_name);
          if (counts.size === 0) listeners.delete(node);
        } else counts.set(event_name, count);
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
    };
  });
  mounted_components.set(component16, unmount2);
  return component16;
}
function unmount$1(component16, options2) {
  const fn = mounted_components.get(component16);
  if (fn) {
    mounted_components.delete(component16);
    return fn(options2);
  }
  return Promise.resolve();
}
function asClassComponent$1(component16) {
  return class extends Svelte4Component {
    /** @param {any} options */
    constructor(options2) {
      super({
        component: component16,
        ...options2
      });
    }
  };
}
function asClassComponent(component16) {
  const component_constructor = asClassComponent$1(component16);
  const _render = (props, { context: context3, csp, transformError } = {}) => {
    const result = render(component16, {
      props,
      context: context3,
      csp,
      transformError
    });
    const munged = Object.defineProperties({}, {
      css: { value: {
        code: "",
        map: null
      } },
      head: { get: () => result.head },
      html: { get: () => result.body },
      then: {
        /**
        * this is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
        *
        * @template TResult1
        * @template [TResult2=never]
        * @param { (value: LegacyRenderResult) => TResult1 } onfulfilled
        * @param { (reason: unknown) => TResult2 } onrejected
        */
        value: (onfulfilled, onrejected) => {
          if (!async_mode_flag) {
            const user_result = onfulfilled({
              css: munged.css,
              head: munged.head,
              html: munged.html
            });
            return Promise.resolve(user_result);
          }
          return result.then((result2) => {
            return onfulfilled({
              css: munged.css,
              head: result2.head,
              html: result2.body,
              hashes: result2.hashes
            });
          }, onrejected);
        }
      }
    });
    return munged;
  };
  component_constructor.render = _render;
  return component_constructor;
}
function hydratable(key2, fn) {
  if (!async_mode_flag) experimental_async_required("hydratable");
  const { hydratable: hydratable2 } = get_render_context();
  let entry = hydratable2.lookup.get(key2);
  if (entry !== void 0) return entry.value;
  const value = fn();
  entry = encode(key2, value, hydratable2.unresolved_promises);
  hydratable2.lookup.set(key2, entry);
  return value;
}
function encode(key2, value, unresolved) {
  const entry = {
    value,
    serialized: ""
  };
  let uid2 = 1;
  entry.serialized = uneval(entry.value, (value2, uneval2) => {
    if (is_promise(value2)) {
      const placeholder = `"${uid2++}"`;
      const p = value2.then((v) => {
        entry.serialized = entry.serialized.replace(placeholder, () => `r(${uneval2(v)})`);
      }).catch((devalue_error) => hydratable_serialization_failed(key2, serialization_stack(entry.stack, devalue_error?.stack)));
      unresolved?.set(p, key2);
      p.catch(() => {
      }).finally(() => unresolved?.delete(p));
      (entry.promises ??= []).push(p);
      return placeholder;
    }
  });
  return entry;
}
function is_promise(value) {
  return Object.prototype.toString.call(value) === "[object Promise]";
}
function serialization_stack(root_stack, uneval_stack) {
  let out = "";
  if (root_stack) out += root_stack + "\n";
  if (uneval_stack) out += "Caused by:\n" + uneval_stack + "\n";
  return out || "<missing stack trace>";
}
function createRawSnippet(fn) {
  return (renderer, ...args) => {
    var getters = args.map((value) => () => value);
    renderer.push(fn(...getters).render().trim());
  };
}
function onDestroy(fn) {
  ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
  return noop;
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function hydrate() {
  lifecycle_function_unavailable("hydrate");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
function fork() {
  lifecycle_function_unavailable("fork");
}
async function tick() {
}
async function settled() {
}
function Root($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { stores: stores2, page: page3, constructors, components = [], form, data_0 = null, data_1 = null, data_2 = null } = $$props;
    setContext("__svelte__", stores2);
    stores2.page.set(page3);
    const Pyramid_2 = derived(() => constructors[2]);
    if (constructors[1]) {
      $$renderer2.push("<!--[0-->");
      const Pyramid_0 = constructors[0];
      if (Pyramid_0) {
        $$renderer2.push("<!--[-->");
        Pyramid_0($$renderer2, {
          data: data_0,
          form,
          params: page3.params,
          children: ($$renderer3) => {
            if (constructors[2]) {
              $$renderer3.push("<!--[0-->");
              const Pyramid_1 = constructors[1];
              if (Pyramid_1) {
                $$renderer3.push("<!--[-->");
                Pyramid_1($$renderer3, {
                  data: data_1,
                  form,
                  params: page3.params,
                  children: ($$renderer4) => {
                    if (Pyramid_2()) {
                      $$renderer4.push("<!--[-->");
                      Pyramid_2()($$renderer4, {
                        data: data_2,
                        form,
                        params: page3.params
                      });
                      $$renderer4.push("<!--]-->");
                    } else {
                      $$renderer4.push("<!--[!-->");
                      $$renderer4.push("<!--]-->");
                    }
                  },
                  $$slots: { default: true }
                });
                $$renderer3.push("<!--]-->");
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push("<!--]-->");
              }
            } else {
              $$renderer3.push("<!--[-1-->");
              const Pyramid_1 = constructors[1];
              if (Pyramid_1) {
                $$renderer3.push("<!--[-->");
                Pyramid_1($$renderer3, {
                  data: data_1,
                  form,
                  params: page3.params
                });
                $$renderer3.push("<!--]-->");
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push("<!--]-->");
              }
            }
            $$renderer3.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
    } else {
      $$renderer2.push("<!--[-1-->");
      const Pyramid_0 = constructors[0];
      if (Pyramid_0) {
        $$renderer2.push("<!--[-->");
        Pyramid_0($$renderer2, {
          data: data_0,
          form,
          params: page3.params
        });
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.push("<!--[-1-->");
    $$renderer2.push(`<!--]-->`);
  });
}
async function get_hooks() {
  let handle2;
  let handleFetch;
  let handleError;
  let handleValidationError;
  let init2;
  ({ handle: handle2, handleFetch, handleError, handleValidationError, init: init2 } = await Promise.resolve().then(() => (init_hooks_server(), hooks_server_exports)));
  let reroute;
  let transport;
  return {
    handle: handle2,
    handleFetch,
    handleError,
    handleValidationError,
    init: init2,
    reroute,
    transport
  };
}
var __defProp2, __exportAll, read_implementation, event_symbol, all_registered_events, root_event_handles, last_propagated_event, listeners, mounted_components, Svelte4Component, index_server_exports, root_default, error_template_default, options;
var init_internal3 = __esm({
  ".svelte-kit/output/server/chunks/internal.js"() {
    init_internal2();
    init_server();
    init_devalue();
    __defProp2 = Object.defineProperty;
    __exportAll = (all, no_symbols) => {
      let target = {};
      for (var name in all) __defProp2(target, name, {
        get: all[name],
        enumerable: true
      });
      if (!no_symbols) __defProp2(target, Symbol.toStringTag, { value: "Module" });
      return target;
    };
    read_implementation = null;
    event_symbol = /* @__PURE__ */ Symbol("events");
    all_registered_events = /* @__PURE__ */ new Set();
    root_event_handles = /* @__PURE__ */ new Set();
    last_propagated_event = null;
    globalThis?.window?.trustedTypes;
    listeners = /* @__PURE__ */ new Map();
    mounted_components = /* @__PURE__ */ new WeakMap();
    Svelte4Component = class {
      /** @type {any} */
      #events;
      /** @type {Record<string, any>} */
      #instance;
      /**
      * @param {ComponentConstructorOptions & {
      *  component: any;
      * }} options
      */
      constructor(options2) {
        var sources = /* @__PURE__ */ new Map();
        var add_source = (key2, value) => {
          var s3 = /* @__PURE__ */ mutable_source(value, false, false);
          sources.set(key2, s3);
          return s3;
        };
        const props = new Proxy({
          ...options2.props || {},
          $$events: {}
        }, {
          get(target, prop) {
            return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
          },
          has(target, prop) {
            if (prop === LEGACY_PROPS) return true;
            get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
            return Reflect.has(target, prop);
          },
          set(target, prop, value) {
            set(sources.get(prop) ?? add_source(prop, value), value);
            return Reflect.set(target, prop, value);
          }
        });
        this.#instance = (options2.hydrate ? hydrate$1 : mount$1)(options2.component, {
          target: options2.target,
          anchor: options2.anchor,
          props,
          context: options2.context,
          intro: options2.intro ?? false,
          recover: options2.recover,
          transformError: options2.transformError
        });
        if (!async_mode_flag && (!options2?.props?.$$host || options2.sync === false)) flushSync();
        this.#events = props.$$events;
        for (const key2 of Object.keys(this.#instance)) {
          if (key2 === "$set" || key2 === "$destroy" || key2 === "$on") continue;
          define_property(this, key2, {
            get() {
              return this.#instance[key2];
            },
            /** @param {any} value */
            set(value) {
              this.#instance[key2] = value;
            },
            enumerable: true
          });
        }
        this.#instance.$set = (next2) => {
          Object.assign(props, next2);
        };
        this.#instance.$destroy = () => {
          unmount$1(this.#instance);
        };
      }
      /** @param {Record<string, any>} props */
      $set(props) {
        this.#instance.$set(props);
      }
      /**
      * @param {string} event
      * @param {(...args: any[]) => any} callback
      * @returns {any}
      */
      $on(event, callback) {
        this.#events[event] = this.#events[event] || [];
        const cb = (...args) => callback.call(this, ...args);
        this.#events[event].push(cb);
        return () => {
          this.#events[event] = this.#events[event].filter(
            /** @param {any} fn */
            (fn) => fn !== cb
          );
        };
      }
      $destroy() {
        this.#instance.$destroy();
      }
    };
    index_server_exports = /* @__PURE__ */ __exportAll({
      afterUpdate: () => noop,
      beforeUpdate: () => noop,
      createContext: () => createContext,
      createEventDispatcher: () => createEventDispatcher,
      createRawSnippet: () => createRawSnippet,
      flushSync: () => noop,
      fork: () => fork,
      getAbortSignal: () => getAbortSignal,
      getAllContexts: () => getAllContexts,
      getContext: () => getContext,
      hasContext: () => hasContext,
      hydratable: () => hydratable,
      hydrate: () => hydrate,
      mount: () => mount,
      onDestroy: () => onDestroy,
      onMount: () => noop,
      setContext: () => setContext,
      settled: () => settled,
      tick: () => tick,
      unmount: () => unmount,
      untrack: () => run2
    });
    root_default = asClassComponent(Root);
    error_template_default = ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n";
    options = {
      app_template_contains_nonce: false,
      async: false,
      csp: {
        "mode": "auto",
        "directives": {
          "upgrade-insecure-requests": false,
          "block-all-mixed-content": false
        },
        "reportOnly": {
          "upgrade-insecure-requests": false,
          "block-all-mixed-content": false
        }
      },
      csrf_check_origin: true,
      csrf_trusted_origins: [],
      embedded: false,
      env_public_prefix: "PUBLIC_",
      env_private_prefix: "",
      hash_routing: false,
      hooks: null,
      preload_strategy: "modulepreload",
      root: root_default,
      service_worker: false,
      service_worker_options: void 0,
      server_error_boundaries: false,
      templates: {
        app: ({ head: head2, body, assets: assets2, nonce, env }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		<meta name="text-scale" content="scale" />\n		' + head2 + '\n	</head>\n	<body data-sveltekit-preload-data="hover">\n		<div style="display: contents">' + body + "</div>\n	</body>\n</html>\n",
        error: error_template_default
      },
      version_hash: "g21vff"
    };
  }
});

// .svelte-kit/output/server/chunks/shared.js
function noop2() {
}
function once2(fn) {
  let done = false;
  let result;
  return () => {
    if (done) return result;
    done = true;
    return result = fn();
  };
}
function get_relative_path(from, to) {
  const from_parts = from.split(/[/\\]/);
  const to_parts = to.split(/[/\\]/);
  from_parts.pop();
  while (from_parts[0] === to_parts[0]) {
    from_parts.shift();
    to_parts.shift();
  }
  let i = from_parts.length;
  while (i--) from_parts[i] = "..";
  return from_parts.concat(to_parts).join("/");
}
function base64_encode2(bytes2) {
  if (globalThis.Buffer) return globalThis.Buffer.from(bytes2).toString("base64");
  let binary = "";
  for (let i = 0; i < bytes2.length; i++) binary += String.fromCharCode(bytes2[i]);
  return btoa(binary);
}
function base64_decode(encoded) {
  if (globalThis.Buffer) {
    const buffer2 = globalThis.Buffer.from(encoded, "base64");
    return new Uint8Array(buffer2);
  }
  const binary = atob(encoded);
  const bytes2 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes2[i] = binary.charCodeAt(i);
  return bytes2;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function normalize_error(error2) {
  return error2;
}
function get_status(error2) {
  return error2 instanceof HttpError || error2 instanceof SvelteKitError ? error2.status : 500;
}
function get_message(error2) {
  return error2 instanceof SvelteKitError ? error2.text : "Internal Error";
}
function stringify2(data, transport) {
  const encoders = Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.encode]));
  return stringify(data, encoders);
}
function create_remote_arg_revivers(transport) {
  const remote_fns_revivers = {
    /** @type {(value: unknown) => unknown} */
    [remote_object]: (value) => value,
    /** @type {(value: unknown) => Map<unknown, unknown>} */
    [remote_map]: (value) => {
      if (!Array.isArray(value)) throw new Error("Invalid data for Map reviver");
      const map = /* @__PURE__ */ new Map();
      for (const item of value) {
        if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string" || typeof item[1] !== "string") throw new Error("Invalid data for Map reviver");
        const [key2, val] = item;
        map.set(parse2(key2), parse2(val));
      }
      return map;
    },
    /** @type {(value: unknown) => Set<unknown>} */
    [remote_set]: (value) => {
      if (!Array.isArray(value)) throw new Error("Invalid data for Set reviver");
      const set2 = /* @__PURE__ */ new Set();
      for (const item of value) {
        if (typeof item !== "string") throw new Error("Invalid data for Set reviver");
        set2.add(parse2(item));
      }
      return set2;
    },
    /** @type {(value: any) => File} */
    [remote_file]: (value) => {
      if (!value || typeof value !== "object" || typeof value.name !== "string" || typeof value.type !== "string" || typeof value.size !== "number" || typeof value.lastModified !== "number" || !(value.data instanceof ArrayBuffer)) throw new Error("Invalid data for File reviver");
      const { data, name, ...meta } = value;
      return new File([data], name, meta);
    }
  };
  const all_revivers = {
    ...Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.decode])),
    ...remote_fns_revivers
  };
  const parse2 = (data) => parse(data, all_revivers);
  return all_revivers;
}
function parse_remote_arg(string, transport) {
  if (!string) return void 0;
  const json_string = new TextDecoder().decode(base64_decode(string.replaceAll("-", "+").replaceAll("_", "/")));
  return parse(json_string, create_remote_arg_revivers(transport));
}
function create_remote_key(id, payload2) {
  return id + "/" + payload2;
}
function split_remote_key(key2) {
  const i = key2.lastIndexOf("/");
  if (i === -1) throw new Error(`Invalid remote key: ${key2}`);
  return {
    id: key2.slice(0, i),
    payload: key2.slice(i + 1)
  };
}
var text_encoder3, INVALIDATED_PARAM, TRAILING_SLASH_PARAM, remote_object, remote_map, remote_set, remote_file, remote_arg_marker;
var init_shared = __esm({
  ".svelte-kit/output/server/chunks/shared.js"() {
    init_internal();
    init_devalue();
    text_encoder3 = new TextEncoder();
    INVALIDATED_PARAM = "x-sveltekit-invalidated";
    TRAILING_SLASH_PARAM = "x-sveltekit-trailing-slash";
    remote_object = "__skrao";
    remote_map = "__skram";
    remote_set = "__skras";
    remote_file = "__skraf";
    remote_arg_marker = Symbol(remote_object);
  }
});

// node_modules/@sveltejs/kit/src/runtime/server/constants.js
var IN_WEBCONTAINER;
var init_constants2 = __esm({
  "node_modules/@sveltejs/kit/src/runtime/server/constants.js"() {
    IN_WEBCONTAINER = !!globalThis.process?.versions?.webcontainer;
  }
});

// node_modules/@sveltejs/kit/src/exports/internal/event.js
function with_request_store(store, fn) {
  try {
    sync_store = store;
    return als2 ? als2.run(store, fn) : fn();
  } finally {
    if (!IN_WEBCONTAINER) {
      sync_store = null;
    }
  }
}
var sync_store, als2;
var init_event = __esm({
  "node_modules/@sveltejs/kit/src/exports/internal/event.js"() {
    init_constants2();
    sync_store = null;
    import("node:async_hooks").then((hooks) => als2 = new hooks.AsyncLocalStorage()).catch(() => {
    });
  }
});

// node_modules/@sveltejs/kit/src/exports/internal/server.js
function merge_tracing(event_like, current2) {
  return {
    ...event_like,
    tracing: {
      ...event_like.tracing,
      current: current2
    }
  };
}
var init_server2 = __esm({
  "node_modules/@sveltejs/kit/src/exports/internal/server.js"() {
    init_event();
  }
});

// .svelte-kit/output/server/chunks/exports.js
function resolve(base2, path) {
  if (path[0] === "/" && path[1] === "/") return path;
  let url = new URL(base2, internal);
  url = new URL(path, url);
  return url.protocol === internal.protocol ? url.pathname + url.search + url.hash : url.href;
}
function normalize_path(path, trailing_slash) {
  if (path === "/" || trailing_slash === "ignore") return path;
  if (trailing_slash === "never") return path.endsWith("/") ? path.slice(0, -1) : path;
  else if (trailing_slash === "always" && !path.endsWith("/")) return path + "/";
  return path;
}
function decode_pathname(pathname) {
  return pathname.split("%25").map(decodeURI).join("%25");
}
function decode_params(params) {
  for (const key2 in params) params[key2] = decodeURIComponent(params[key2]);
  return params;
}
function make_trackable(url, callback, search_params_callback, allow_hash = false) {
  const tracked = new URL(url);
  Object.defineProperty(tracked, "searchParams", {
    value: new Proxy(tracked.searchParams, { get(obj, key2) {
      if (key2 === "get" || key2 === "getAll" || key2 === "has") return (param, ...rest) => {
        search_params_callback(param);
        return obj[key2](param, ...rest);
      };
      callback();
      const value = Reflect.get(obj, key2);
      return typeof value === "function" ? value.bind(obj) : value;
    } }),
    enumerable: true,
    configurable: true
  });
  const tracked_url_properties = [
    "href",
    "pathname",
    "search",
    "toString",
    "toJSON"
  ];
  if (allow_hash) tracked_url_properties.push("hash");
  for (const property of tracked_url_properties) Object.defineProperty(tracked, property, {
    get() {
      callback();
      return url[property];
    },
    enumerable: true,
    configurable: true
  });
  tracked[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
    return inspect(url, opts);
  };
  tracked.searchParams[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
    return inspect(url.searchParams, opts);
  };
  if (!allow_hash) disable_hash(tracked);
  return tracked;
}
function disable_hash(url) {
  allow_nodejs_console_log(url);
  Object.defineProperty(url, "hash", { get() {
    throw new Error("Cannot access event.url.hash. Consider using `page.url.hash` inside a component instead");
  } });
}
function disable_search(url) {
  allow_nodejs_console_log(url);
  for (const property of ["search", "searchParams"]) Object.defineProperty(url, property, { get() {
    throw new Error(`Cannot access url.${property} on a page with prerendering enabled`);
  } });
}
function allow_nodejs_console_log(url) {
  url[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
    return inspect(new URL(url), opts);
  };
}
function hash(...values) {
  let hash2 = 5381;
  for (const value of values) if (typeof value === "string") {
    let i = value.length;
    while (i) hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else if (ArrayBuffer.isView(value)) {
    const buffer2 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    let i = buffer2.length;
    while (i) hash2 = hash2 * 33 ^ buffer2[--i];
  } else throw new TypeError("value must be a string or TypedArray");
  return (hash2 >>> 0).toString(36);
}
function exec(match, params, matchers) {
  const result = {};
  const values = match.slice(1);
  const values_needing_match = values.filter((value) => value !== void 0);
  let buffered = 0;
  for (let i = 0; i < params.length; i += 1) {
    const param = params[i];
    let value = values[i - buffered];
    if (param.chained && param.rest && buffered) {
      value = values.slice(i - buffered, i + 1).filter((s3) => s3).join("/");
      buffered = 0;
    }
    if (value === void 0) if (param.rest) value = "";
    else continue;
    if (!param.matcher || matchers[param.matcher](value)) {
      result[param.name] = value;
      const next_param = params[i + 1];
      const next_value = values[i + 1];
      if (next_param && !next_param.rest && next_param.optional && next_value && param.chained) buffered = 0;
      if (!next_param && !next_value && Object.keys(result).length === values_needing_match.length) buffered = 0;
      continue;
    }
    if (param.optional && param.chained) {
      buffered++;
      continue;
    }
    return;
  }
  if (buffered) return;
  return result;
}
function find_route(path, routes, matchers) {
  for (const route of routes) {
    const match = route.pattern.exec(path);
    if (!match) continue;
    const matched = exec(match, route.params, matchers);
    if (matched) return {
      route,
      params: decode_params(matched)
    };
  }
  return null;
}
function validator(expected) {
  function validate(module, file) {
    if (!module) return;
    for (const key2 in module) {
      if (key2[0] === "_" || expected.has(key2)) continue;
      const values = [...expected.values()];
      const hint = hint_for_supported_files(key2, file?.slice(file.lastIndexOf("."))) ?? `valid exports are ${values.join(", ")}, or anything with a '_' prefix`;
      throw new Error(`Invalid export '${key2}'${file ? ` in ${file}` : ""} (${hint})`);
    }
  }
  return validate;
}
function hint_for_supported_files(key2, ext = ".js") {
  const supported_files = [];
  if (valid_layout_exports.has(key2)) supported_files.push(`+layout${ext}`);
  if (valid_page_exports.has(key2)) supported_files.push(`+page${ext}`);
  if (valid_layout_server_exports.has(key2)) supported_files.push(`+layout.server${ext}`);
  if (valid_page_server_exports.has(key2)) supported_files.push(`+page.server${ext}`);
  if (valid_server_exports.has(key2)) supported_files.push(`+server${ext}`);
  if (supported_files.length > 0) return `'${key2}' is a valid export in ${supported_files.slice(0, -1).join(", ")}${supported_files.length > 1 ? " or " : ""}${supported_files.at(-1)}`;
}
var internal, valid_layout_exports, valid_page_exports, valid_layout_server_exports, valid_page_server_exports, valid_server_exports, validate_layout_exports, validate_page_exports, validate_layout_server_exports, validate_page_server_exports, validate_server_exports;
var init_exports2 = __esm({
  ".svelte-kit/output/server/chunks/exports.js"() {
    internal = new URL("sveltekit-internal://");
    valid_layout_exports = /* @__PURE__ */ new Set([
      "load",
      "prerender",
      "csr",
      "ssr",
      "trailingSlash",
      "config"
    ]);
    valid_page_exports = /* @__PURE__ */ new Set([...valid_layout_exports, "entries"]);
    valid_layout_server_exports = /* @__PURE__ */ new Set([...valid_layout_exports]);
    valid_page_server_exports = /* @__PURE__ */ new Set([
      ...valid_layout_server_exports,
      "actions",
      "entries"
    ]);
    valid_server_exports = /* @__PURE__ */ new Set([
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
      "HEAD",
      "fallback",
      "prerender",
      "trailingSlash",
      "config",
      "entries"
    ]);
    validate_layout_exports = validator(valid_layout_exports);
    validate_page_exports = validator(valid_page_exports);
    validate_layout_server_exports = validator(valid_layout_server_exports);
    validate_page_server_exports = validator(valid_page_server_exports);
    validate_server_exports = validator(valid_server_exports);
  }
});

// .svelte-kit/output/server/chunks/index-server.js
var init_index_server = __esm({
  ".svelte-kit/output/server/chunks/index-server.js"() {
    init_server();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse2;
    exports.serialize = serialize2;
    var __toString = Object.prototype.toString;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse2(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var dec = opt.decode || decode;
      var index17 = 0;
      while (index17 < str.length) {
        var eqIdx = str.indexOf("=", index17);
        if (eqIdx === -1) {
          break;
        }
        var endIdx = str.indexOf(";", index17);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index17 = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var key2 = str.slice(index17, eqIdx).trim();
        if (void 0 === obj[key2]) {
          var val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          obj[key2] = tryDecode(val, dec);
        }
        index17 = endIdx + 1;
      }
      return obj;
    }
    function serialize2(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode3;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function encode3(val) {
      return encodeURIComponent(val);
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]" || val instanceof Date;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e3) {
        return str;
      }
    }
  }
});

// .svelte-kit/output/server/entries/pages/_layout.svelte.js
var layout_svelte_exports = {};
__export(layout_svelte_exports, {
  default: () => _layout
});
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.push(`<link rel="icon" href="data:image/svg+xml,&lt;svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22>&lt;rect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%237C5CFC%22/>&lt;path d=%22M18 20h29v8H27v5h17v8H27v15h-9z%22 fill=%22white%22/>&lt;/svg>"/> <meta name="theme-color" content="#0F1115"/>`);
  });
  children($$renderer);
  $$renderer.push(`<!---->`);
}
var init_layout_svelte = __esm({
  ".svelte-kit/output/server/entries/pages/_layout.svelte.js"() {
    init_server();
  }
});

// .svelte-kit/output/server/nodes/0.js
var __exports = {};
__export(__exports, {
  component: () => component,
  fonts: () => fonts,
  imports: () => imports,
  index: () => index,
  stylesheets: () => stylesheets
});
var index, component_cache, component, imports, stylesheets, fonts;
var init__ = __esm({
  ".svelte-kit/output/server/nodes/0.js"() {
    index = 0;
    component = async () => component_cache ??= (await Promise.resolve().then(() => (init_layout_svelte(), layout_svelte_exports))).default;
    imports = ["_app/immutable/nodes/0.BWHXXTJS.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js"];
    stylesheets = ["_app/immutable/assets/0.B9G8JvdC.css"];
    fonts = [];
  }
});

// .svelte-kit/output/server/chunks/client.js
function notifiable_store(value) {
  const store = writable(value);
  let ready = true;
  function notify() {
    ready = true;
    store.update((val) => val);
  }
  function set2(new_value) {
    ready = false;
    store.set(new_value);
  }
  function subscribe(run3) {
    let old_value;
    return store.subscribe((new_value) => {
      if (old_value === void 0 || ready && new_value !== old_value) run3(old_value = new_value);
    });
  }
  return {
    notify,
    set: set2,
    subscribe
  };
}
function create_updated_store() {
  const { set: set2, subscribe } = writable(false);
  return {
    subscribe,
    check: async () => false
  };
}
var PRELOAD_PRIORITIES, updated_listener, page, navigating, updated2, is_legacy, placeholder_url, onMount, tick2, stores;
var init_client = __esm({
  ".svelte-kit/output/server/chunks/client.js"() {
    init_internal3();
    init_shared();
    init_internal2();
    init_exports2();
    init_server();
    init_index_server();
    init_internal();
    init_server2();
    PRELOAD_PRIORITIES = {
      tap: 1,
      hover: 2,
      viewport: 3,
      eager: 4,
      off: -1,
      false: -1
    };
    ({ ...PRELOAD_PRIORITIES }, PRELOAD_PRIORITIES.hover);
    updated_listener = { v: noop2 };
    is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
    placeholder_url = "a:";
    if (is_legacy) {
      page = {
        data: {},
        form: null,
        error: null,
        params: {},
        route: { id: null },
        state: {},
        status: -1,
        url: new URL(placeholder_url)
      };
      navigating = { current: null };
      updated2 = { current: false };
    } else {
      page = new class Page {
        data = {};
        form = null;
        error = null;
        params = {};
        route = { id: null };
        state = {};
        status = -1;
        url = new URL(placeholder_url);
      }();
      navigating = new class Navigating {
        current = null;
      }();
      updated2 = new class Updated {
        current = false;
      }();
      updated_listener.v = () => updated2.current = true;
    }
    ({ onMount, tick: tick2 } = index_server_exports);
    stores = {
      url: /* @__PURE__ */ notifiable_store({}),
      page: /* @__PURE__ */ notifiable_store({}),
      navigating: /* @__PURE__ */ writable(null),
      updated: /* @__PURE__ */ create_updated_store()
    };
  }
});

// .svelte-kit/output/server/chunks/state.js
function context2() {
  return getContext("__request__");
}
var page2;
var init_state = __esm({
  ".svelte-kit/output/server/chunks/state.js"() {
    init_internal3();
    init_server();
    init_client();
    stores.updated.check;
    page2 = {
      get data() {
        return context2().page.data;
      },
      get error() {
        return context2().page.error;
      },
      get form() {
        return context2().page.form;
      },
      get params() {
        return context2().page.params;
      },
      get route() {
        return context2().page.route;
      },
      get state() {
        return context2().page.state;
      },
      get status() {
        return context2().page.status;
      },
      get url() {
        return context2().page.url;
      }
    };
  }
});

// .svelte-kit/output/server/entries/fallbacks/error.svelte.js
var error_svelte_exports = {};
__export(error_svelte_exports, {
  default: () => Error2
});
function Error2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<h1>${escape_html(page2.status)}</h1> <p>${escape_html(page2.error?.message)}</p>`);
  });
}
var init_error_svelte = __esm({
  ".svelte-kit/output/server/entries/fallbacks/error.svelte.js"() {
    init_server();
    init_state();
  }
});

// .svelte-kit/output/server/nodes/1.js
var __exports2 = {};
__export(__exports2, {
  component: () => component2,
  fonts: () => fonts2,
  imports: () => imports2,
  index: () => index2,
  stylesheets: () => stylesheets2
});
var index2, component_cache2, component2, imports2, stylesheets2, fonts2;
var init__2 = __esm({
  ".svelte-kit/output/server/nodes/1.js"() {
    index2 = 1;
    component2 = async () => component_cache2 ??= (await Promise.resolve().then(() => (init_error_svelte(), error_svelte_exports))).default;
    imports2 = ["_app/immutable/nodes/1.1uoFGymt.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CPjXBIn4.js", "_app/immutable/chunks/DxrAsuHp.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BZ4SA-SZ.js"];
    stylesheets2 = [];
    fonts2 = [];
  }
});

// .svelte-kit/output/server/chunks/data.js
var customers, editors, orders, money;
var init_data = __esm({
  ".svelte-kit/output/server/chunks/data.js"() {
    customers = [
      {
        id: "CUST-1042",
        name: "Rahul Sharma",
        business: "Rahul Photography",
        phone: "+91 98765 43210",
        email: "rahul@photography.in",
        projects: 8,
        pending: 7e3,
        token: "rahul-secure-1042"
      },
      {
        id: "CUST-1038",
        name: "Ananya Mehta",
        business: "AM Studios",
        phone: "+91 98220 11774",
        email: "hello@amstudios.in",
        projects: 4,
        pending: 0,
        token: "ananya-secure-1038"
      },
      {
        id: "CUST-1031",
        name: "Vikram Singh",
        business: "Frame House",
        phone: "+91 99876 24510",
        email: "vikram@framehouse.in",
        projects: 12,
        pending: 18500,
        token: "vikram-secure-1031"
      },
      {
        id: "CUST-1027",
        name: "Priya Nair",
        business: "Direct client",
        phone: "+91 99441 88291",
        email: "priya.nair@gmail.com",
        projects: 2,
        pending: 3500,
        token: "priya-secure-1027"
      }
    ];
    editors = [
      {
        id: "ED-018",
        name: "Anil Kumar",
        initials: "AK",
        specialty: "Photo editing",
        phone: "+91 98710 44521",
        activeTasks: 3,
        available: true,
        token: "anil-abc123xyz"
      },
      {
        id: "ED-014",
        name: "Megha Rao",
        initials: "MR",
        specialty: "Album design",
        phone: "+91 98450 12777",
        activeTasks: 2,
        available: true,
        token: "megha-f8k4p2q"
      },
      {
        id: "ED-009",
        name: "Meera Das",
        initials: "MD",
        specialty: "Color correction",
        phone: "+91 99110 65332",
        activeTasks: 4,
        available: false,
        token: "meera-m9n2r4s"
      },
      {
        id: "ED-021",
        name: "Kabir Shah",
        initials: "KS",
        specialty: "Video editing",
        phone: "+91 98920 44318",
        activeTasks: 1,
        available: true,
        token: "kabir-v7c1x9z"
      }
    ];
    orders = [
      {
        id: "ORD-2026-0041",
        project: "Priya Wedding",
        customer: "Rahul Photography",
        workType: "Wedding photo edit",
        status: "Editing",
        progress: 70,
        due: "25 Jul",
        files: 850,
        fileLink: "drive.google.com/priya-wedding",
        price: 12e3,
        paid: 5e3,
        color: "#7C5CFC",
        tasks: [
          {
            id: "TSK-101",
            name: "Culling",
            assignee: "Anil Kumar",
            status: "Completed",
            progress: 100,
            due: "20 Jul",
            fileCount: 850,
            instructions: "Remove blinks, duplicates and test shots."
          },
          {
            id: "TSK-102",
            name: "Colour correction",
            assignee: "Meera Das",
            status: "In progress",
            progress: 70,
            due: "22 Jul",
            fileCount: 420,
            instructions: "Warm natural tones. Keep skin texture. Use reference folder."
          },
          {
            id: "TSK-103",
            name: "Quality check",
            assignee: "Megha Rao",
            status: "Not started",
            progress: 0,
            due: "24 Jul",
            fileCount: 420
          },
          {
            id: "TSK-104",
            name: "Final delivery",
            assignee: "Unassigned",
            status: "Not started",
            progress: 0,
            due: "25 Jul"
          }
        ]
      },
      {
        id: "ORD-2026-0040",
        project: "Ananya Album",
        customer: "AM Studios",
        workType: "Album design",
        status: "Waiting Review",
        progress: 88,
        due: "19 Jul",
        files: 146,
        fileLink: "drive.google.com/ananya-album",
        price: 8500,
        paid: 8500,
        color: "#22C55E",
        tasks: [
          {
            id: "TSK-098",
            name: "Image selection",
            assignee: "Anil Kumar",
            status: "Completed",
            progress: 100,
            due: "15 Jul"
          },
          {
            id: "TSK-099",
            name: "Album design",
            assignee: "Megha Rao",
            status: "Ready for review",
            progress: 100,
            due: "18 Jul",
            instructions: "Minimal ivory layouts, 40 spreads."
          },
          {
            id: "TSK-100",
            name: "Quality check",
            assignee: "Unassigned",
            status: "Not started",
            progress: 0,
            due: "19 Jul"
          }
        ]
      },
      {
        id: "ORD-2026-0039",
        project: "Aarav Reception",
        customer: "Frame House",
        workType: "Highlight video",
        status: "Assigned",
        progress: 20,
        due: "28 Jul",
        files: 312,
        fileLink: "r2.studioflow.app/aarav",
        price: 18500,
        paid: 0,
        color: "#EAB308",
        tasks: [
          {
            id: "TSK-095",
            name: "Footage organisation",
            assignee: "Kabir Shah",
            status: "Files downloaded",
            progress: 20,
            due: "18 Jul"
          },
          {
            id: "TSK-096",
            name: "Highlight edit",
            assignee: "Kabir Shah",
            status: "Not started",
            progress: 0,
            due: "25 Jul"
          },
          {
            id: "TSK-097",
            name: "Quality check",
            assignee: "Anil Kumar",
            status: "Not started",
            progress: 0,
            due: "27 Jul"
          }
        ]
      },
      {
        id: "ORD-2026-0038",
        project: "Mira Portraits",
        customer: "Priya Nair",
        workType: "Photo retouching",
        status: "Ready Delivery",
        progress: 100,
        due: "Today",
        files: 36,
        fileLink: "drive.google.com/mira-portraits",
        price: 3500,
        paid: 3500,
        color: "#3B82F6",
        tasks: [{
          id: "TSK-094",
          name: "Portrait retouching",
          assignee: "Meera Das",
          status: "Completed",
          progress: 100,
          due: "Today"
        }]
      }
    ];
    money = (amount) => new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }
});

// .svelte-kit/output/server/chunks/app.js
var customerStore, sidebarOpen;
var init_app = __esm({
  ".svelte-kit/output/server/chunks/app.js"() {
    init_server();
    init_index_server();
    init_data();
    writable(structuredClone(orders));
    customerStore = writable(structuredClone(customers));
    sidebarOpen = writable(false);
  }
});

// .svelte-kit/output/server/chunks/Icon.js
function Icon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  $$renderer.component(($$renderer2) => {
    let name = fallback($$props["name"], void 0);
    let color = fallback($$props["color"], "currentColor");
    let size = fallback($$props["size"], 24);
    let strokeWidth = fallback($$props["strokeWidth"], 2);
    let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
    let iconNode = fallback($$props["iconNode"], () => [], true);
    $$renderer2.push(`<svg${attributes({
      ...defaultAttributes,
      ...!hasA11yProp($$restProps) ? { "aria-hidden": "true" } : void 0,
      ...$$restProps,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: clsx$1(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
    }, void 0, void 0, void 0, 3)}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, {
      name,
      color,
      size,
      strokeWidth,
      absoluteStrokeWidth,
      iconNode
    });
  });
}
var defaultAttributes, hasA11yProp, mergeClasses;
var init_Icon = __esm({
  ".svelte-kit/output/server/chunks/Icon.js"() {
    init_server();
    defaultAttributes = {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    };
    hasA11yProp = (props) => {
      for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
      return false;
    };
    mergeClasses = (...classes) => classes.filter((className, index17, array2) => {
      return Boolean(className) && className.trim() !== "" && array2.indexOf(className) === index17;
    }).join(" ").trim();
  }
});

// .svelte-kit/output/server/chunks/clipboard-list.js
function Clipboard_list($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "clipboard-list" },
    sanitize_props($$props),
    {
      /**
      * @component @name ClipboardList
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI0IiB4PSI4IiB5PSIyIiByeD0iMSIgcnk9IjEiIC8+CiAgPHBhdGggZD0iTTE2IDRoMmEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgyIiAvPgogIDxwYXRoIGQ9Ik0xMiAxMWg0IiAvPgogIDxwYXRoIGQ9Ik0xMiAxNmg0IiAvPgogIDxwYXRoIGQ9Ik04IDExaC4wMSIgLz4KICA8cGF0aCBkPSJNOCAxNmguMDEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/clipboard-list
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["rect", {
          "width": "8",
          "height": "4",
          "x": "8",
          "y": "2",
          "rx": "1",
          "ry": "1"
        }],
        ["path", { "d": "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }],
        ["path", { "d": "M12 11h4" }],
        ["path", { "d": "M12 16h4" }],
        ["path", { "d": "M8 11h.01" }],
        ["path", { "d": "M8 16h.01" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_clipboard_list = __esm({
  ".svelte-kit/output/server/chunks/clipboard-list.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/search.js
function Search($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "search" },
    sanitize_props($$props),
    {
      /**
      * @component @name Search
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
        "cx": "11",
        "cy": "11",
        "r": "8"
      }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_search = __esm({
  ".svelte-kit/output/server/chunks/search.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/x.js
function X($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "x" },
    sanitize_props($$props),
    {
      /**
      * @component @name X
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA2IDE4IiAvPgogIDxwYXRoIGQ9Im02IDYgMTIgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/x
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_x = __esm({
  ".svelte-kit/output/server/chunks/x.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/_layout.svelte.js
var layout_svelte_exports2 = {};
__export(layout_svelte_exports2, {
  default: () => _layout2
});
function Bell($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "bell" },
    sanitize_props($$props),
    {
      /**
      * @component @name Bell
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAuMjY4IDIxYTIgMiAwIDAgMCAzLjQ2NCAwIiAvPgogIDxwYXRoIGQ9Ik0zLjI2MiAxNS4zMjZBMSAxIDAgMCAwIDQgMTdoMTZhMSAxIDAgMCAwIC43NC0xLjY3M0MxOS40MSAxMy45NTYgMTggMTIuNDk5IDE4IDhBNiA2IDAgMCAwIDYgOGMwIDQuNDk5LTEuNDExIDUuOTU2LTIuNzM4IDcuMzI2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/bell
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { "d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Command($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "command" },
    sanitize_props($$props),
    {
      /**
      * @component @name Command
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgNnYxMmEzIDMgMCAxIDAgMy0zSDZhMyAzIDAgMSAwIDMgM1Y2YTMgMyAwIDEgMC0zIDNoMTJhMyAzIDAgMSAwLTMtMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/command
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Layout_dashboard($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "layout-dashboard" },
    sanitize_props($$props),
    {
      /**
      * @component @name LayoutDashboard
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI5IiB4PSIzIiB5PSIzIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIxNCIgeT0iMyIgcng9IjEiIC8+CiAgPHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iOSIgeD0iMTQiIHk9IjEyIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIzIiB5PSIxNiIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/layout-dashboard
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["rect", {
          "width": "7",
          "height": "9",
          "x": "3",
          "y": "3",
          "rx": "1"
        }],
        ["rect", {
          "width": "7",
          "height": "5",
          "x": "14",
          "y": "3",
          "rx": "1"
        }],
        ["rect", {
          "width": "7",
          "height": "9",
          "x": "14",
          "y": "12",
          "rx": "1"
        }],
        ["rect", {
          "width": "7",
          "height": "5",
          "x": "3",
          "y": "16",
          "rx": "1"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Menu($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "menu" },
    sanitize_props($$props),
    {
      /**
      * @component @name Menu
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNCA1aDE2IiAvPgogIDxwYXRoIGQ9Ik00IDEyaDE2IiAvPgogIDxwYXRoIGQ9Ik00IDE5aDE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/menu
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M4 5h16" }],
        ["path", { "d": "M4 12h16" }],
        ["path", { "d": "M4 19h16" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Receipt_text($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "receipt-text" },
    sanitize_props($$props),
    {
      /**
      * @component @name ReceiptText
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTMgMTZIOCIgLz4KICA8cGF0aCBkPSJNMTQgOEg4IiAvPgogIDxwYXRoIGQ9Ik0xNiAxMkg4IiAvPgogIDxwYXRoIGQ9Ik00IDNhMSAxIDAgMCAxIDEtMSAxLjMgMS4zIDAgMCAxIC43LjJsLjkzMy42YTEuMyAxLjMgMCAwIDAgMS40IDBsLjkzNC0uNmExLjMgMS4zIDAgMCAxIDEuNCAwbC45MzMuNmExLjMgMS4zIDAgMCAwIDEuNCAwbC45MzMtLjZhMS4zIDEuMyAwIDAgMSAxLjQgMGwuOTM0LjZhMS4zIDEuMyAwIDAgMCAxLjQgMGwuOTMzLS42QTEuMyAxLjMgMCAwIDEgMTkgMmExIDEgMCAwIDEgMSAxdjE4YTEgMSAwIDAgMS0xIDEgMS4zIDEuMyAwIDAgMS0uNy0uMmwtLjkzMy0uNmExLjMgMS4zIDAgMCAwLTEuNCAwbC0uOTM0LjZhMS4zIDEuMyAwIDAgMS0xLjQgMGwtLjkzMy0uNmExLjMgMS4zIDAgMCAwLTEuNCAwbC0uOTMzLjZhMS4zIDEuMyAwIDAgMS0xLjQgMGwtLjkzNC0uNmExLjMgMS4zIDAgMCAwLTEuNCAwbC0uOTMzLjZhMS4zIDEuMyAwIDAgMS0uNy4yIDEgMSAwIDAgMS0xLTF6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/receipt-text
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M13 16H8" }],
        ["path", { "d": "M14 8H8" }],
        ["path", { "d": "M16 12H8" }],
        ["path", { "d": "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Settings($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "settings" },
    sanitize_props($$props),
    {
      /**
      * @component @name Settings
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOS42NzEgNC4xMzZhMi4zNCAyLjM0IDAgMCAxIDQuNjU5IDAgMi4zNCAyLjM0IDAgMCAwIDMuMzE5IDEuOTE1IDIuMzQgMi4zNCAwIDAgMSAyLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMCAwIDMuODMxIDIuMzQgMi4zNCAwIDAgMS0yLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMC0zLjMxOSAxLjkxNSAyLjM0IDIuMzQgMCAwIDEtNC42NTkgMCAyLjM0IDIuMzQgMCAwIDAtMy4zMi0xLjkxNSAyLjM0IDIuMzQgMCAwIDEtMi4zMy00LjAzMyAyLjM0IDIuMzQgMCAwIDAgMC0zLjgzMUEyLjM0IDIuMzQgMCAwIDEgNi4zNSA2LjA1MWEyLjM0IDIuMzQgMCAwIDAgMy4zMTktMS45MTUiIC8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/settings
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }], ["circle", {
        "cx": "12",
        "cy": "12",
        "r": "3"
      }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function User_round($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "user-round" },
    sanitize_props($$props),
    {
      /**
      * @component @name UserRound
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjUiIC8+CiAgPHBhdGggZD0iTTIwIDIxYTggOCAwIDAgMC0xNiAwIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/user-round
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["circle", {
        "cx": "12",
        "cy": "8",
        "r": "5"
      }], ["path", { "d": "M20 21a8 8 0 0 0-16 0" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Users($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "users" },
    sanitize_props($$props),
    {
      /**
      * @component @name Users
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg2YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8cGF0aCBkPSJNMTYgMy4xMjhhNCA0IDAgMCAxIDAgNy43NDQiIC8+CiAgPHBhdGggZD0iTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODciIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/users
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
        ["path", { "d": "M16 3.128a4 4 0 0 1 0 7.744" }],
        ["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
        ["circle", {
          "cx": "9",
          "cy": "7",
          "r": "4"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function AppShell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    const nav = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Layout_dashboard
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Users
      },
      {
        label: "Orders",
        href: "/orders",
        icon: Clipboard_list
      },
      {
        label: "Editors",
        href: "/editors",
        icon: User_round
      },
      {
        label: "Invoices",
        href: "/invoices",
        icon: Receipt_text
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings
      }
    ];
    head("whg6dh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>StudioFlow \u2014 Editing work, clearly managed</title>`);
      });
      $$renderer3.push(`<meta name="description" content="A lightweight workflow system for editing studios."/>`);
    });
    $$renderer2.push(`<div class="app-shell">`);
    if (store_get($$store_subs ??= {}, "$sidebarOpen", sidebarOpen)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="scrim" aria-label="Close menu"></button>`);
    } else $$renderer2.push("<!--[-1-->");
    $$renderer2.push(`<!--]--> <aside${attr_class("", void 0, { "open": store_get($$store_subs ??= {}, "$sidebarOpen", sidebarOpen) })}><div class="brand-row"><a href="/dashboard" class="brand" aria-label="StudioFlow home"><span class="mark"><span></span><span></span><span></span></span><strong>StudioFlow</strong></a><button class="icon-btn mobile-close" aria-label="Close menu">`);
    X($$renderer2, { size: 18 });
    $$renderer2.push(`<!----></button></div> <nav><p class="nav-label">Workspace</p><!--[-->`);
    const each_array = ensure_array_like(nav);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class("", void 0, { "active": page2.url.pathname.startsWith(item.href) })}>`);
      if (item.icon) {
        $$renderer2.push("<!--[-->");
        item.icon($$renderer2, {
          size: 18,
          strokeWidth: 1.8
        });
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
      $$renderer2.push(`<span>${escape_html(item.label)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></nav> <div class="sidebar-footer"><div class="sync"><span class="sync-dot"></span><div><strong>Sheets synced</strong><small>Just now</small></div></div><div class="profile"><span class="avatar">AS</span><div><strong>Arvind Studio</strong><small>Administrator</small></div><span class="chev">\u2022\u2022\u2022</span></div></div></aside> <section class="workspace"><div class="topbar"><button class="icon-btn menu-btn" aria-label="Open menu">`);
    Menu($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></button><button class="search-button">`);
    Search($$renderer2, { size: 16 });
    $$renderer2.push(`<!----><span>Search anything...</span><kbd>`);
    Command($$renderer2, { size: 11 });
    $$renderer2.push(`<!----> K</kbd></button><div class="top-actions"><button class="icon-btn" aria-label="Notifications">`);
    Bell($$renderer2, { size: 18 });
    $$renderer2.push(`<!----><span class="notice"></span></button><span class="top-avatar">AS</span></div></div><main>`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout2($$renderer, $$props) {
  let { children } = $$props;
  AppShell($$renderer, {
    children: ($$renderer2) => {
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    },
    $$slots: { default: true }
  });
}
var init_layout_svelte2 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/_layout.svelte.js"() {
    init_server();
    init_state();
    init_app();
    init_Icon();
    init_clipboard_list();
    init_search();
    init_x();
  }
});

// .svelte-kit/output/server/nodes/2.js
var __exports3 = {};
__export(__exports3, {
  component: () => component3,
  fonts: () => fonts3,
  imports: () => imports3,
  index: () => index3,
  stylesheets: () => stylesheets3
});
var index3, component_cache3, component3, imports3, stylesheets3, fonts3;
var init__3 = __esm({
  ".svelte-kit/output/server/nodes/2.js"() {
    index3 = 2;
    component3 = async () => component_cache3 ??= (await Promise.resolve().then(() => (init_layout_svelte2(), layout_svelte_exports2))).default;
    imports3 = ["_app/immutable/nodes/2.B33UREfa.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CPjXBIn4.js", "_app/immutable/chunks/DxrAsuHp.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BZ4SA-SZ.js", "_app/immutable/chunks/DILKMuvj.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/DtfShkjJ.js", "_app/immutable/chunks/Bo1B5_Fi.js", "_app/immutable/chunks/Bs8raLH6.js"];
    stylesheets3 = [];
    fonts3 = [];
  }
});

// .svelte-kit/output/server/chunks/arrow-left.js
function Arrow_left($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "arrow-left" },
    sanitize_props($$props),
    {
      /**
      * @component @name ArrowLeft
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIgMTktNy03IDctNyIgLz4KICA8cGF0aCBkPSJNMTkgMTJINSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-left
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "m12 19-7-7 7-7" }], ["path", { "d": "M19 12H5" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_arrow_left = __esm({
  ".svelte-kit/output/server/chunks/arrow-left.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/entries/pages/customer/_token_/_layout.svelte.js
var layout_svelte_exports3 = {};
__export(layout_svelte_exports3, {
  default: () => _layout3
});
function _layout3($$renderer, $$props) {
  let { children } = $$props;
  children($$renderer);
  $$renderer.push(`<!----> <button class="customer-back svelte-kbd33k" aria-label="Go back to customers">`);
  Arrow_left($$renderer, { size: 15 });
  $$renderer.push(`<!----> Back to customers</button>`);
}
var init_layout_svelte3 = __esm({
  ".svelte-kit/output/server/entries/pages/customer/_token_/_layout.svelte.js"() {
    init_server();
    init_arrow_left();
  }
});

// .svelte-kit/output/server/nodes/3.js
var __exports4 = {};
__export(__exports4, {
  component: () => component4,
  fonts: () => fonts4,
  imports: () => imports4,
  index: () => index4,
  stylesheets: () => stylesheets4
});
var index4, component_cache4, component4, imports4, stylesheets4, fonts4;
var init__4 = __esm({
  ".svelte-kit/output/server/nodes/3.js"() {
    index4 = 3;
    component4 = async () => component_cache4 ??= (await Promise.resolve().then(() => (init_layout_svelte3(), layout_svelte_exports3))).default;
    imports4 = ["_app/immutable/nodes/3.BRs_gFM4.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/DTBFfHl0.js", "_app/immutable/chunks/Dp0m8DlN.js"];
    stylesheets4 = ["_app/immutable/assets/3.C99vsp6a.css"];
    fonts4 = [];
  }
});

// .svelte-kit/output/server/entries/pages/_page.ts.js
var page_ts_exports = {};
__export(page_ts_exports, {
  load: () => load
});
var load;
var init_page_ts = __esm({
  ".svelte-kit/output/server/entries/pages/_page.ts.js"() {
    init_exports();
    load = () => redirect(307, "/dashboard");
  }
});

// .svelte-kit/output/server/nodes/4.js
var __exports5 = {};
__export(__exports5, {
  fonts: () => fonts5,
  imports: () => imports5,
  index: () => index5,
  stylesheets: () => stylesheets5,
  universal: () => page_ts_exports,
  universal_id: () => universal_id
});
var index5, universal_id, imports5, stylesheets5, fonts5;
var init__5 = __esm({
  ".svelte-kit/output/server/nodes/4.js"() {
    init_page_ts();
    index5 = 4;
    universal_id = "src/routes/+page.ts";
    imports5 = ["_app/immutable/nodes/4._mtegzfz.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/Bin8K3vy.js", "_app/immutable/chunks/BuFlayix.js"];
    stylesheets5 = [];
    fonts5 = [];
  }
});

// .svelte-kit/output/server/chunks/check.js
function Check($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "check" },
    sanitize_props($$props),
    {
      /**
      * @component @name Check
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M20 6 9 17l-5-5" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_check = __esm({
  ".svelte-kit/output/server/chunks/check.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/message-circle.js
function Message_circle($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "message-circle" },
    sanitize_props($$props),
    {
      /**
      * @component @name MessageCircle
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi45OTIgMTYuMzQyYTIgMiAwIDAgMSAuMDk0IDEuMTY3bC0xLjA2NSAzLjI5YTEgMSAwIDAgMCAxLjIzNiAxLjE2OGwzLjQxMy0uOTk4YTIgMiAwIDAgMSAxLjA5OS4wOTIgMTAgMTAgMCAxIDAtNC43NzctNC43MTkiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/message-circle
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_message_circle = __esm({
  ".svelte-kit/output/server/chunks/message-circle.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/sheet.js
function Sheet($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "sheet" },
    sanitize_props($$props),
    {
      /**
      * @component @name Sheet
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIgLz4KICA8bGluZSB4MT0iMyIgeDI9IjIxIiB5MT0iOSIgeTI9IjkiIC8+CiAgPGxpbmUgeDE9IjMiIHgyPSIyMSIgeTE9IjE1IiB5Mj0iMTUiIC8+CiAgPGxpbmUgeDE9IjkiIHgyPSI5IiB5MT0iOSIgeTI9IjIxIiAvPgogIDxsaW5lIHgxPSIxNSIgeDI9IjE1IiB5MT0iOSIgeTI9IjIxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/sheet
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["rect", {
          "width": "18",
          "height": "18",
          "x": "3",
          "y": "3",
          "rx": "2",
          "ry": "2"
        }],
        ["line", {
          "x1": "3",
          "x2": "21",
          "y1": "9",
          "y2": "9"
        }],
        ["line", {
          "x1": "3",
          "x2": "21",
          "y1": "15",
          "y2": "15"
        }],
        ["line", {
          "x1": "9",
          "x2": "9",
          "y1": "9",
          "y2": "21"
        }],
        ["line", {
          "x1": "15",
          "x2": "15",
          "y1": "9",
          "y2": "21"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_sheet = __esm({
  ".svelte-kit/output/server/chunks/sheet.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/PageHeader.js
function PageHeader($$renderer, $$props) {
  let { title, eyebrow, action = "", onclick = void 0 } = $$props;
  $$renderer.push(`<header class="page-header"><div>`);
  if (eyebrow) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<p class="eyebrow">${escape_html(eyebrow)}</p>`);
  } else $$renderer.push("<!--[-1-->");
  $$renderer.push(`<!--]--><h1>${escape_html(title)}</h1></div>`);
  if (action) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<button class="primary">+\xA0 ${escape_html(action)}</button>`);
  } else $$renderer.push("<!--[-1-->");
  $$renderer.push(`<!--]--></header>`);
}
var init_PageHeader = __esm({
  ".svelte-kit/output/server/chunks/PageHeader.js"() {
    init_server();
  }
});

// .svelte-kit/output/server/chunks/Modal.js
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { title, open = void 0, children, footer } = $$props;
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="modal-backdrop svelte-ta60gp" aria-label="Close dialog"></button> <div class="modal svelte-ta60gp" role="dialog" aria-modal="true"${attr("aria-label", title)}><header class="svelte-ta60gp"><h2 class="svelte-ta60gp">${escape_html(title)}</h2><button class="icon-btn svelte-ta60gp" aria-label="Close">`);
      X($$renderer2, { size: 18 });
      $$renderer2.push(`<!----></button></header> <div class="modal-body svelte-ta60gp">`);
      children($$renderer2);
      $$renderer2.push(`<!----></div> `);
      if (footer) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<footer class="svelte-ta60gp">`);
        footer($$renderer2);
        $$renderer2.push(`<!----></footer>`);
      } else $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--]--></div>`);
    } else $$renderer2.push("<!--[-1-->");
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
var init_Modal = __esm({
  ".svelte-kit/output/server/chunks/Modal.js"() {
    init_server();
    init_x();
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/customers/_page.svelte.js
var page_svelte_exports = {};
__export(page_svelte_exports, {
  default: () => _page
});
function NewCustomerModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = void 0, onsaved = () => {
    } } = $$props;
    let name = "";
    let business = "";
    let phone = "";
    let whatsapp = "";
    let email2 = "";
    let address = "";
    let gst = "";
    let saving = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        let footer = function($$renderer4) {
          $$renderer4.push(`<button class="secondary">Cancel</button><button class="primary"${attr("disabled", saving, true)}>${escape_html("Add customer")}</button>`);
        };
        Modal($$renderer3, {
          title: "Add new customer",
          get open() {
            return open;
          },
          set open($$value) {
            open = $$value;
            $$settled = false;
          },
          footer,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="form-grid"><div class="field"><label for="customer-name">Customer name *</label><input id="customer-name"${attr("value", name)} placeholder="e.g. Rahul Sharma"/></div> <div class="field"><label for="business-name">Business name</label><input id="business-name"${attr("value", business)} placeholder="e.g. Rahul Photography"/></div> <div class="field"><label for="customer-phone">Phone number *</label><input id="customer-phone"${attr("value", phone)} placeholder="+91 98765 43210"/></div> <div class="field"><label for="customer-whatsapp">WhatsApp number</label><input id="customer-whatsapp"${attr("value", whatsapp)} placeholder="Same as phone if blank"/></div> <div class="field"><label for="customer-email">Email</label><input id="customer-email"${attr("value", email2)} type="email" placeholder="name@studio.com"/></div> <div class="field"><label for="customer-gst">GST details</label><input id="customer-gst"${attr("value", gst)} placeholder="Optional"/></div></div> <div class="field address svelte-jd1ca5"><label for="customer-address">Address</label><textarea id="customer-address" placeholder="Billing address">`);
            const $$body = escape_html(address);
            if ($$body) $$renderer4.push(`${$$body}`);
            $$renderer4.push(`</textarea></div> `);
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: {
            footer: true,
            default: true
          }
        });
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let query = "";
    let showNewCustomer = false;
    let toast = "";
    const filtered = derived(() => store_get($$store_subs ??= {}, "$customerStore", customerStore).filter((customer) => (customer.name + customer.business + customer.phone).toLowerCase().includes(query.toLowerCase())));
    function customerSaved(customer, synced) {
      customerStore.update((items) => [customer, ...items]);
      toast = synced ? "Customer added and synced to Google Sheets" : "Customer added in demo mode";
      setTimeout(() => toast = "", 3e3);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      PageHeader($$renderer3, {
        eyebrow: "People you work with",
        title: "Customers",
        action: "New customer",
        onclick: () => showNewCustomer = true
      });
      $$renderer3.push(`<!----> <div class="list-tools svelte-rswdxj"><div class="filter svelte-rswdxj">`);
      Search($$renderer3, { size: 15 });
      $$renderer3.push(`<!----><input${attr("value", query)} placeholder="Search customers" aria-label="Search customers" class="svelte-rswdxj"/></div> <div class="tool-actions svelte-rswdxj"><a class="sheet-link svelte-rswdxj" href="/settings/sheets">`);
      Sheet($$renderer3, { size: 13 });
      $$renderer3.push(`<!----> Sheets data</a><span class="svelte-rswdxj">${escape_html(filtered().length)} customers</span></div></div> <div class="card table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th></th></tr></thead><tbody><!--[-->`);
      const each_array = ensure_array_like(filtered());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let customer = each_array[$$index];
        $$renderer3.push(`<tr><td><strong>${escape_html(customer.business)}</strong><small>${escape_html(customer.name)} \xB7 ${escape_html(customer.id)}</small></td><td>${escape_html(customer.phone)}</td><td>${escape_html(customer.projects)}</td><td${attr_class("svelte-rswdxj", void 0, { "clear": customer.pending === 0 })}>${escape_html(customer.pending ? money(customer.pending) : "All clear")}</td><td><div class="row-actions svelte-rswdxj"><a class="whatsapp svelte-rswdxj"${attr("href", "https://wa.me/" + customer.phone.replace(/\D/g, ""))} aria-label="WhatsApp customer">`);
        Message_circle($$renderer3, { size: 14 });
        $$renderer3.push(`<!----></a><a class="open-button"${attr("href", "/customer/" + customer.token)}>Open</a></div></td></tr>`);
      }
      $$renderer3.push(`<!--]--></tbody></table></div> `);
      NewCustomerModal($$renderer3, {
        onsaved: customerSaved,
        get open() {
          return showNewCustomer;
        },
        set open($$value) {
          showNewCustomer = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (toast) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="toast svelte-rswdxj">`);
        Check($$renderer3, { size: 15 });
        $$renderer3.push(`<!---->${escape_html(toast)}</div>`);
      } else $$renderer3.push("<!--[-1-->");
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
var init_page_svelte = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/customers/_page.svelte.js"() {
    init_server();
    init_data();
    init_app();
    init_check();
    init_message_circle();
    init_search();
    init_sheet();
    init_PageHeader();
    init_Modal();
  }
});

// .svelte-kit/output/server/nodes/5.js
var __exports6 = {};
__export(__exports6, {
  component: () => component5,
  fonts: () => fonts6,
  imports: () => imports6,
  index: () => index6,
  stylesheets: () => stylesheets6
});
var index6, component_cache5, component5, imports6, stylesheets6, fonts6;
var init__6 = __esm({
  ".svelte-kit/output/server/nodes/5.js"() {
    index6 = 5;
    component5 = async () => component_cache5 ??= (await Promise.resolve().then(() => (init_page_svelte(), page_svelte_exports))).default;
    imports6 = ["_app/immutable/nodes/5.DuABUJi5.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/DILKMuvj.js", "_app/immutable/chunks/BZ4SA-SZ.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/BYaaJhau.js", "_app/immutable/chunks/Bo1B5_Fi.js", "_app/immutable/chunks/D9BcqJA9.js", "_app/immutable/chunks/DrsDWILO.js", "_app/immutable/chunks/B5Blcxre.js", "_app/immutable/chunks/Bs8raLH6.js"];
    stylesheets6 = ["_app/immutable/assets/Modal.CU3ovBLu.css", "_app/immutable/assets/5.171Ted9u.css"];
    fonts6 = [];
  }
});

// .svelte-kit/output/server/chunks/arrow-up-right.js
function Arrow_up_right($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "arrow-up-right" },
    sanitize_props($$props),
    {
      /**
      * @component @name ArrowUpRight
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNyA3aDEwdjEwIiAvPgogIDxwYXRoIGQ9Ik03IDE3IDE3IDciIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/arrow-up-right
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M7 7h10v10" }], ["path", { "d": "M7 17 17 7" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_arrow_up_right = __esm({
  ".svelte-kit/output/server/chunks/arrow-up-right.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/clock-3.js
function Clock_3($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "clock-3" },
    sanitize_props($$props),
    {
      /**
      * @component @name Clock3
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgNnY2aDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/clock-3
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["circle", {
        "cx": "12",
        "cy": "12",
        "r": "10"
      }], ["path", { "d": "M12 6v6h4" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_clock_3 = __esm({
  ".svelte-kit/output/server/chunks/clock-3.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/StatusBadge.js
function StatusBadge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { status } = $$props;
    const tone = derived(() => status.includes("Completed") || status.includes("Paid") || status.includes("Ready") ? "green" : status.includes("Review") || status.includes("Editing") || status.includes("progress") ? "purple" : status.includes("Revision") || status.includes("Overdue") ? "red" : "gray");
    $$renderer2.push(`<span${attr_class("badge", void 0, {
      "green": tone() === "green",
      "purple": tone() === "purple",
      "red": tone() === "red"
    })}><span class="dot"></span>${escape_html(status)}</span>`);
  });
}
var init_StatusBadge = __esm({
  ".svelte-kit/output/server/chunks/StatusBadge.js"() {
    init_server();
  }
});

// .svelte-kit/output/server/chunks/NewOrderModal.js
function NewOrderModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = void 0, onsaved = () => {
    } } = $$props;
    let project = "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        let footer = function($$renderer4) {
          $$renderer4.push(`<button class="secondary">Cancel</button><button class="primary">Create order</button>`);
        };
        Modal($$renderer3, {
          title: "Create new order",
          get open() {
            return open;
          },
          set open($$value) {
            open = $$value;
            $$settled = false;
          },
          footer,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="form-grid"><div class="field"><label for="customer">Customer</label><select id="customer">`);
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Rahul Photography`);
            });
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`AM Studios`);
            });
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Frame House`);
            });
            $$renderer4.push(`</select></div> <div class="field"><label for="project">Project name</label><input id="project"${attr("value", project)} placeholder="e.g. Neha Wedding"/></div> <div class="field"><label for="work">Work type</label><select id="work">`);
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Photo editing`);
            });
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Video editing`);
            });
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Album design`);
            });
            $$renderer4.option({}, ($$renderer5) => {
              $$renderer5.push(`Retouching`);
            });
            $$renderer4.push(`</select></div> <div class="field"><label for="date">Delivery date</label><input id="date" type="date"/></div> <div class="field"><label for="files">Number of files</label><input id="files" type="number" placeholder="0"/></div> <div class="field"><label for="price">Price (\u20B9)</label><input id="price" type="number" placeholder="0"/></div></div> <div class="field note svelte-z6jk0z"><label for="instructions">Special instructions</label><textarea id="instructions" placeholder="Editing style, reference links, delivery notes..."></textarea></div>`);
          },
          $$slots: {
            footer: true,
            default: true
          }
        });
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
var init_NewOrderModal = __esm({
  ".svelte-kit/output/server/chunks/NewOrderModal.js"() {
    init_server();
    init_Modal();
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/dashboard/_page.svelte.js
var page_svelte_exports2 = {};
__export(page_svelte_exports2, {
  default: () => _page2
});
function Package_check($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "package-check" },
    sanitize_props($$props),
    {
      /**
      * @component @name PackageCheck
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjJWMTIiIC8+CiAgPHBhdGggZD0ibTE2IDE3IDIgMiA0LTQiIC8+CiAgPHBhdGggZD0iTTIxIDExLjEyN1Y4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzI5bDcgNGEyIDIgMCAwIDAgMiAuMDAxbDEuMzItLjc1MyIgLz4KICA8cGF0aCBkPSJNMy4yOSA3IDEyIDEybDguNzEtNSIgLz4KICA8cGF0aCBkPSJtNy41IDQuMjcgOC45OTcgNS4xNDgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/package-check
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M12 22V12" }],
        ["path", { "d": "m16 17 2 2 4-4" }],
        ["path", { "d": "M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753" }],
        ["path", { "d": "M3.29 7 12 12l8.71-5" }],
        ["path", { "d": "m7.5 4.27 8.997 5.148" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let showNewOrder = false;
    let toast = false;
    function saved() {
      toast = true;
      setTimeout(() => toast = false, 2600);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      PageHeader($$renderer3, {
        eyebrow: "Wednesday, 15 July",
        title: "Good morning \u{1F44B}",
        action: "New order",
        onclick: () => showNewOrder = true
      });
      $$renderer3.push(`<!----> <section class="stat-grid"><div class="card stat-card"><p>Active orders</p><div class="stat-row"><strong>12</strong><span class="stat-icon">`);
      Clipboard_list($$renderer3, { size: 17 });
      $$renderer3.push(`<!----></span></div></div> <div class="card stat-card"><p>Waiting review</p><div class="stat-row"><strong>3</strong><span class="stat-icon">`);
      Clock_3($$renderer3, { size: 17 });
      $$renderer3.push(`<!----></span></div></div> <div class="card stat-card"><p>Ready delivery</p><div class="stat-row"><strong>2</strong><span class="stat-icon">`);
      Package_check($$renderer3, { size: 17 });
      $$renderer3.push(`<!----></span></div></div></section> <section class="card active-orders svelte-13ofds2"><div class="card-header svelte-13ofds2"><h2>Active orders</h2><a href="/orders" class="svelte-13ofds2">View all `);
      Arrow_up_right($$renderer3, { size: 12 });
      $$renderer3.push(`<!----></a></div> <!--[-->`);
      const each_array = ensure_array_like(orders.slice(0, 3));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let order = each_array[$$index];
        $$renderer3.push(`<a class="order-row svelte-13ofds2"${attr("href", "/orders/" + order.id)}><span class="order-mark svelte-13ofds2"${attr_style("", { background: order.color })}></span> <div class="order-main svelte-13ofds2"><strong class="svelte-13ofds2">${escape_html(order.project)}</strong><small class="svelte-13ofds2">${escape_html(order.customer)} \xB7 ${escape_html(order.workType)}</small></div> `);
        StatusBadge($$renderer3, { status: order.status });
        $$renderer3.push(`<!----> <div class="order-progress svelte-13ofds2"><div class="progress-label"><span>Progress</span><b class="svelte-13ofds2">${escape_html(order.progress)}%</b></div><div class="progress"><span${attr_style("", { width: order.progress + "%" })}></span></div></div> <span class="due svelte-13ofds2">Due ${escape_html(order.due)}</span> `);
        Arrow_up_right($$renderer3, { size: 15 });
        $$renderer3.push(`<!----></a>`);
      }
      $$renderer3.push(`<!--]--></section> `);
      NewOrderModal($$renderer3, {
        onsaved: saved,
        get open() {
          return showNewOrder;
        },
        set open($$value) {
          showNewOrder = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (toast) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="toast svelte-13ofds2">`);
        Check($$renderer3, { size: 15 });
        $$renderer3.push(`<!----> Order created and synced to Sheets</div>`);
      } else $$renderer3.push("<!--[-1-->");
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
var init_page_svelte2 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/dashboard/_page.svelte.js"() {
    init_server();
    init_data();
    init_Icon();
    init_arrow_up_right();
    init_check();
    init_clipboard_list();
    init_clock_3();
    init_PageHeader();
    init_StatusBadge();
    init_NewOrderModal();
  }
});

// .svelte-kit/output/server/nodes/6.js
var __exports7 = {};
__export(__exports7, {
  component: () => component6,
  fonts: () => fonts7,
  imports: () => imports7,
  index: () => index7,
  stylesheets: () => stylesheets7
});
var index7, component_cache6, component6, imports7, stylesheets7, fonts7;
var init__7 = __esm({
  ".svelte-kit/output/server/nodes/6.js"() {
    index7 = 6;
    component6 = async () => component_cache6 ??= (await Promise.resolve().then(() => (init_page_svelte2(), page_svelte_exports2))).default;
    imports7 = ["_app/immutable/nodes/6.DfMxYuu-.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/BA-gQueA.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/DtfShkjJ.js", "_app/immutable/chunks/BHMvLVQ6.js", "_app/immutable/chunks/DrsDWILO.js", "_app/immutable/chunks/BFw9YDNL.js", "_app/immutable/chunks/DzC8rXwR2.js", "_app/immutable/chunks/B5Blcxre.js", "_app/immutable/chunks/Bs8raLH6.js"];
    stylesheets7 = ["_app/immutable/assets/Modal.CU3ovBLu.css", "_app/immutable/assets/NewOrderModal.BgJqdN0w.css", "_app/immutable/assets/6.C8ti9aZf.css"];
    fonts7 = [];
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/editors/_page.svelte.js
var page_svelte_exports3 = {};
__export(page_svelte_exports3, {
  default: () => _page3
});
function Copy($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "copy" },
    sanitize_props($$props),
    {
      /**
      * @component @name Copy
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHg9IjgiIHk9IjgiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/copy
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["rect", {
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }], ["path", { "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Link_2($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "link-2" },
    sanitize_props($$props),
    {
      /**
      * @component @name Link2
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAxN0g3QTUgNSAwIDAgMSA3IDdoMiIgLz4KICA8cGF0aCBkPSJNMTUgN2gyYTUgNSAwIDEgMSAwIDEwaC0yIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSIxMiIgeTI9IjEyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/link-2
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M9 17H7A5 5 0 0 1 7 7h2" }],
        ["path", { "d": "M15 7h2a5 5 0 1 1 0 10h-2" }],
        ["line", {
          "x1": "8",
          "x2": "16",
          "y1": "12",
          "y2": "12"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page3($$renderer) {
  let copied = "";
  PageHeader($$renderer, {
    eyebrow: "People doing the work",
    title: "Editors",
    action: "Add editor"
  });
  $$renderer.push(`<!----> <div class="editor-grid svelte-6liokk"><!--[-->`);
  const each_array = ensure_array_like(editors);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let editor = each_array[$$index];
    $$renderer.push(`<article class="card editor-card svelte-6liokk"><div class="editor-top svelte-6liokk"><span class="editor-avatar svelte-6liokk">${escape_html(editor.initials)}</span><span${attr_class("availability svelte-6liokk", void 0, { "available": editor.available })}><i class="svelte-6liokk"></i>${escape_html(editor.available ? "Available" : "At capacity")}</span></div><h2 class="svelte-6liokk">${escape_html(editor.name)}</h2><p class="svelte-6liokk">${escape_html(editor.specialty)}</p><div class="editor-meta svelte-6liokk"><span><strong class="svelte-6liokk">${escape_html(editor.activeTasks)}</strong> Active tasks</span><span>${escape_html(editor.phone)}</span></div><div class="editor-actions svelte-6liokk"><a${attr("href", "/editor/" + editor.token)} class="svelte-6liokk">`);
    Link_2($$renderer, { size: 13 });
    $$renderer.push(`<!----> Open portal</a><button class="svelte-6liokk">`);
    if (copied === editor.id) {
      $$renderer.push("<!--[0-->");
      $$renderer.push(`<span class="copied svelte-6liokk">Copied</span>`);
    } else {
      $$renderer.push("<!--[-1-->");
      Copy($$renderer, { size: 13 });
    }
    $$renderer.push(`<!--]--></button><a${attr("href", "https://wa.me/" + editor.phone.replace(/\D/g, ""))} aria-label="WhatsApp" class="svelte-6liokk">`);
    Message_circle($$renderer, { size: 13 });
    $$renderer.push(`<!----></a></div></article>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
var init_page_svelte3 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/editors/_page.svelte.js"() {
    init_server();
    init_data();
    init_Icon();
    init_message_circle();
    init_PageHeader();
  }
});

// .svelte-kit/output/server/nodes/7.js
var __exports8 = {};
__export(__exports8, {
  component: () => component7,
  fonts: () => fonts8,
  imports: () => imports8,
  index: () => index8,
  stylesheets: () => stylesheets8
});
var index8, component_cache7, component7, imports8, stylesheets8, fonts8;
var init__8 = __esm({
  ".svelte-kit/output/server/nodes/7.js"() {
    index8 = 7;
    component7 = async () => component_cache7 ??= (await Promise.resolve().then(() => (init_page_svelte3(), page_svelte_exports3))).default;
    imports8 = ["_app/immutable/nodes/7.BI1LKFWY.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/BYaaJhau.js", "_app/immutable/chunks/DrsDWILO.js"];
    stylesheets8 = ["_app/immutable/assets/7.CJqieTBh.css"];
    fonts8 = [];
  }
});

// .svelte-kit/output/server/chunks/download.js
function Download($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "download" },
    sanitize_props($$props),
    {
      /**
      * @component @name Download
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMTVWMyIgLz4KICA8cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNCIgLz4KICA8cGF0aCBkPSJtNyAxMCA1IDUgNS01IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/download
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M12 15V3" }],
        ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
        ["path", { "d": "m7 10 5 5 5-5" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_download = __esm({
  ".svelte-kit/output/server/chunks/download.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/invoices/_page.svelte.js
var page_svelte_exports4 = {};
__export(page_svelte_exports4, {
  default: () => _page4
});
function _page4($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    PageHeader($$renderer2, {
      eyebrow: "Bills and payment tracking",
      title: "Invoices",
      action: "New invoice"
    });
    $$renderer2.push(`<!----> <div class="invoice-summary svelte-1lsvxo4"><div class="svelte-1lsvxo4"><span class="svelte-1lsvxo4">Outstanding</span><strong class="svelte-1lsvxo4">${escape_html(money(37500))}</strong></div><div class="svelte-1lsvxo4"><span class="svelte-1lsvxo4">Collected this month</span><strong class="svelte-1lsvxo4">${escape_html(money(64200))}</strong></div><button class="secondary svelte-1lsvxo4">`);
    Download($$renderer2, { size: 13 });
    $$renderer2.push(`<!----> Export .xlsx</button></div> <div class="card table-wrap"><table class="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(orders);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let order = each_array[$$index];
      $$renderer2.push(`<tr><td><strong>INV-${escape_html(order.id.slice(-4))}</strong><small>${escape_html(order.project)}</small></td><td>${escape_html(order.customer)}</td><td>${escape_html(money(order.price))}</td><td>${escape_html(money(order.paid))}</td><td>${escape_html(money(order.price - order.paid))}</td><td>`);
      StatusBadge($$renderer2, { status: order.paid === order.price ? "Paid" : order.paid ? "Partially paid" : "Unpaid" });
      $$renderer2.push(`<!----></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> <div class="sheet-note svelte-1lsvxo4">`);
    Sheet($$renderer2, { size: 14 });
    $$renderer2.push(`<!----><span>Payment changes are written to Google Sheets immediately.</span></div>`);
  });
}
var init_page_svelte4 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/invoices/_page.svelte.js"() {
    init_server();
    init_data();
    init_download();
    init_sheet();
    init_PageHeader();
    init_StatusBadge();
  }
});

// .svelte-kit/output/server/nodes/8.js
var __exports9 = {};
__export(__exports9, {
  component: () => component8,
  fonts: () => fonts9,
  imports: () => imports9,
  index: () => index9,
  stylesheets: () => stylesheets9
});
var index9, component_cache8, component8, imports9, stylesheets9, fonts9;
var init__9 = __esm({
  ".svelte-kit/output/server/nodes/8.js"() {
    index9 = 8;
    component8 = async () => component_cache8 ??= (await Promise.resolve().then(() => (init_page_svelte4(), page_svelte_exports4))).default;
    imports9 = ["_app/immutable/nodes/8.DuBvHhfR.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/HclGiUj8.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/C7fyHnmN.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/D9BcqJA9.js", "_app/immutable/chunks/DrsDWILO.js", "_app/immutable/chunks/BFw9YDNL.js"];
    stylesheets9 = ["_app/immutable/assets/8.DQIJkm4H.css"];
    fonts9 = [];
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/orders/_page.svelte.js
var page_svelte_exports5 = {};
__export(page_svelte_exports5, {
  default: () => _page5
});
function Sliders_horizontal($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "sliders-horizontal" },
    sanitize_props($$props),
    {
      /**
      * @component @name SlidersHorizontal
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgNUgzIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOUgzIiAvPgogIDxwYXRoIGQ9Ik0xNCAzdjQiIC8+CiAgPHBhdGggZD0iTTE2IDE3djQiIC8+CiAgPHBhdGggZD0iTTIxIDEyaC05IiAvPgogIDxwYXRoIGQ9Ik0yMSAxOWgtNSIgLz4KICA8cGF0aCBkPSJNMjEgNWgtNyIgLz4KICA8cGF0aCBkPSJNOCAxMHY0IiAvPgogIDxwYXRoIGQ9Ik04IDEySDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/sliders-horizontal
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M10 5H3" }],
        ["path", { "d": "M12 19H3" }],
        ["path", { "d": "M14 3v4" }],
        ["path", { "d": "M16 17v4" }],
        ["path", { "d": "M21 12h-9" }],
        ["path", { "d": "M21 19h-5" }],
        ["path", { "d": "M21 5h-7" }],
        ["path", { "d": "M8 10v4" }],
        ["path", { "d": "M8 12H3" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page5($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let showNew = false;
    let query = "";
    const filtered = derived(() => orders.filter((o2) => (o2.project + o2.customer + o2.status).toLowerCase().includes(query.toLowerCase())));
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      PageHeader($$renderer3, {
        eyebrow: "Customer \u2192 editor \u2192 delivery",
        title: "Orders",
        action: "New order",
        onclick: () => showNew = true
      });
      $$renderer3.push(`<!----> <div class="list-tools svelte-16rmzhf"><div class="filter svelte-16rmzhf">`);
      Search($$renderer3, { size: 15 });
      $$renderer3.push(`<!----><input${attr("value", query)} placeholder="Search orders" aria-label="Search orders" class="svelte-16rmzhf"/></div><button class="secondary svelte-16rmzhf">`);
      Sliders_horizontal($$renderer3, { size: 13 });
      $$renderer3.push(`<!----> Filter</button></div> <div class="card table-wrap"><table class="data-table"><thead><tr><th>Project</th><th>Customer</th><th>Due date</th><th>Status</th><th>Value</th><th></th></tr></thead><tbody><!--[-->`);
      const each_array = ensure_array_like(filtered());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let order = each_array[$$index];
        $$renderer3.push(`<tr><td><strong>${escape_html(order.project)}</strong><small>${escape_html(order.id)} \xB7 ${escape_html(order.workType)}</small></td><td>${escape_html(order.customer)}</td><td>${escape_html(order.due)}</td><td>`);
        StatusBadge($$renderer3, { status: order.status });
        $$renderer3.push(`<!----></td><td>${escape_html(money(order.price))}</td><td><a class="open-button"${attr("href", "/orders/" + order.id)}>Open</a></td></tr>`);
      }
      $$renderer3.push(`<!--]--></tbody></table></div> `);
      NewOrderModal($$renderer3, {
        get open() {
          return showNew;
        },
        set open($$value) {
          showNew = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
var init_page_svelte5 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/orders/_page.svelte.js"() {
    init_server();
    init_data();
    init_Icon();
    init_search();
    init_PageHeader();
    init_StatusBadge();
    init_NewOrderModal();
  }
});

// .svelte-kit/output/server/nodes/9.js
var __exports10 = {};
__export(__exports10, {
  component: () => component9,
  fonts: () => fonts10,
  imports: () => imports10,
  index: () => index10,
  stylesheets: () => stylesheets10
});
var index10, component_cache9, component9, imports10, stylesheets10, fonts10;
var init__10 = __esm({
  ".svelte-kit/output/server/nodes/9.js"() {
    index10 = 9;
    component9 = async () => component_cache9 ??= (await Promise.resolve().then(() => (init_page_svelte5(), page_svelte_exports5))).default;
    imports10 = ["_app/immutable/nodes/9.vkRbvdqv.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/Bo1B5_Fi.js", "_app/immutable/chunks/DrsDWILO.js", "_app/immutable/chunks/BFw9YDNL.js", "_app/immutable/chunks/DzC8rXwR2.js", "_app/immutable/chunks/B5Blcxre.js", "_app/immutable/chunks/Bs8raLH6.js"];
    stylesheets10 = ["_app/immutable/assets/Modal.CU3ovBLu.css", "_app/immutable/assets/NewOrderModal.BgJqdN0w.css", "_app/immutable/assets/9.BaZwWGsX.css"];
    fonts10 = [];
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/orders/_id_/_page.ts.js
var page_ts_exports2 = {};
__export(page_ts_exports2, {
  load: () => load2
});
var load2;
var init_page_ts2 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/orders/_id_/_page.ts.js"() {
    init_data();
    init_exports();
    load2 = ({ params }) => {
      const order = orders.find((o2) => o2.id === params.id);
      if (!order) error(404, "Order not found");
      return { order };
    };
  }
});

// .svelte-kit/output/server/chunks/file-text.js
function Circle($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "circle" },
    sanitize_props($$props),
    {
      /**
      * @component @name Circle
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/circle
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["circle", {
        "cx": "12",
        "cy": "12",
        "r": "10"
      }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function File_text($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "file-text" },
    sanitize_props($$props),
    {
      /**
      * @component @name FileText
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIgLz4KICA8cGF0aCBkPSJNMTAgOUg4IiAvPgogIDxwYXRoIGQ9Ik0xNiAxM0g4IiAvPgogIDxwYXRoIGQ9Ik0xNiAxN0g4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/file-text
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" }],
        ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }],
        ["path", { "d": "M10 9H8" }],
        ["path", { "d": "M16 13H8" }],
        ["path", { "d": "M16 17H8" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_file_text = __esm({
  ".svelte-kit/output/server/chunks/file-text.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/chunks/external-link.js
function External_link($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "external-link" },
    sanitize_props($$props),
    {
      /**
      * @component @name ExternalLink
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM2g2djYiIC8+CiAgPHBhdGggZD0iTTEwIDE0IDIxIDMiIC8+CiAgPHBhdGggZD0iTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/external-link
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M15 3h6v6" }],
        ["path", { "d": "M10 14 21 3" }],
        ["path", { "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
var init_external_link = __esm({
  ".svelte-kit/output/server/chunks/external-link.js"() {
    init_server();
    init_Icon();
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/orders/_id_/_page.svelte.js
var page_svelte_exports6 = {};
__export(page_svelte_exports6, {
  default: () => _page6
});
function Ellipsis($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "ellipsis" },
    sanitize_props($$props),
    {
      /**
      * @component @name Ellipsis
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE5IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iNSIgY3k9IjEyIiByPSIxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/ellipsis
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["circle", {
          "cx": "12",
          "cy": "12",
          "r": "1"
        }],
        ["circle", {
          "cx": "19",
          "cy": "12",
          "r": "1"
        }],
        ["circle", {
          "cx": "5",
          "cy": "12",
          "r": "1"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Indian_rupee($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "indian-rupee" },
    sanitize_props($$props),
    {
      /**
      * @component @name IndianRupee
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAzaDEyIiAvPgogIDxwYXRoIGQ9Ik02IDhoMTIiIC8+CiAgPHBhdGggZD0ibTYgMTMgOC41IDgiIC8+CiAgPHBhdGggZD0iTTYgMTNoMyIgLz4KICA8cGF0aCBkPSJNOSAxM2M2LjY2NyAwIDYuNjY3LTEwIDAtMTAiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/indian-rupee
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M6 3h12" }],
        ["path", { "d": "M6 8h12" }],
        ["path", { "d": "m6 13 8.5 8" }],
        ["path", { "d": "M6 13h3" }],
        ["path", { "d": "M9 13c6.667 0 6.667-10 0-10" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Paperclip($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "paperclip" },
    sanitize_props($$props),
    {
      /**
      * @component @name Paperclip
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgNi04LjQxNCA4LjU4NmEyIDIgMCAwIDAgMi44MjkgMi44MjlsOC40MTQtOC41ODZhNCA0IDAgMSAwLTUuNjU3LTUuNjU3bC04LjM3OSA4LjU1MWE2IDYgMCAxIDAgOC40ODUgOC40ODVsOC4zNzktOC41NTEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/paperclip
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Plus($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "plus" },
    sanitize_props($$props),
    {
      /**
      * @component @name Plus
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plus
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page6($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const order = data.order;
    let tab = "Overview";
    const timeline = [
      [
        "Received",
        "12 Jul \xB7 10:24",
        "done"
      ],
      [
        "Assigned",
        "12 Jul \xB7 14:10",
        "done"
      ],
      [
        "Editing",
        "In progress",
        "current"
      ],
      [
        "Review",
        "Next",
        ""
      ],
      [
        "Completed",
        "\u2014",
        ""
      ]
    ];
    $$renderer2.push(`<div class="detail-top svelte-2yql63"><a href="/orders" class="back svelte-2yql63">`);
    Arrow_left($$renderer2, { size: 16 });
    $$renderer2.push(`<!----> Orders</a><div class="svelte-2yql63"><button class="secondary svelte-2yql63">`);
    Message_circle($$renderer2, { size: 14 });
    $$renderer2.push(`<!----> WhatsApp</button><button class="primary">Mark ready</button><button class="icon-button svelte-2yql63">`);
    Ellipsis($$renderer2, { size: 17 });
    $$renderer2.push(`<!----></button></div></div> <header class="order-heading svelte-2yql63"><div class="project-icon svelte-2yql63">PW</div><div><div class="title-line svelte-2yql63"><h1 class="svelte-2yql63">${escape_html(order.project)}</h1>`);
    StatusBadge($$renderer2, { status: order.status });
    $$renderer2.push(`<!----></div><p class="svelte-2yql63">${escape_html(order.id)} \xB7 ${escape_html(order.customer)}</p></div></header> <div class="tabs svelte-2yql63"><!--[-->`);
    const each_array = ensure_array_like([
      "Overview",
      "Files",
      "Activity"
    ]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<button${attr_class("svelte-2yql63", void 0, { "active": tab === item })}>${escape_html(item)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="detail-grid svelte-2yql63"><div class="main-col svelte-2yql63"><section class="card"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Tasks</h2><p class="svelte-2yql63">${escape_html(order.tasks.filter((t2) => t2.status === "Completed").length)} of ${escape_html(order.tasks.length)} completed</p></div><button class="secondary svelte-2yql63">`);
      Plus($$renderer2, { size: 13 });
      $$renderer2.push(`<!----> Add task</button></div> <div class="task-list"><!--[-->`);
      const each_array_1 = ensure_array_like(order.tasks);
      for (let index17 = 0, $$length = each_array_1.length; index17 < $$length; index17++) {
        let task = each_array_1[index17];
        $$renderer2.push(`<div class="task-row svelte-2yql63"><span${attr_class("svelte-2yql63", void 0, {
          "complete": task.status === "Completed",
          "activeTask": task.status === "In progress" || task.status === "Ready for review"
        })}>`);
        if (task.status === "Completed") {
          $$renderer2.push("<!--[0-->");
          Check($$renderer2, { size: 13 });
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span>${escape_html(index17 + 1)}</span>`);
        }
        $$renderer2.push(`<!--]--></span><div class="task-name svelte-2yql63"><strong class="svelte-2yql63">${escape_html(task.name)}</strong><small class="svelte-2yql63">${escape_html(task.assignee)}</small></div>`);
        StatusBadge($$renderer2, { status: task.status });
        $$renderer2.push(`<!----><div class="task-progress svelte-2yql63"><div class="progress"><span${attr_style("", { width: task.progress + "%" })}></span></div><small class="svelte-2yql63">${escape_html(task.progress)}%</small></div><span class="task-due svelte-2yql63">${escape_html(task.due)}</span><button class="dots svelte-2yql63">`);
        Ellipsis($$renderer2, { size: 15 });
        $$renderer2.push(`<!----></button></div>`);
      }
      $$renderer2.push(`<!--]--></div></section> <section class="card timeline-card svelte-2yql63"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Timeline</h2><p class="svelte-2yql63">Customer-visible progress</p></div></div><div class="timeline svelte-2yql63"><!--[-->`);
      const each_array_2 = ensure_array_like(timeline);
      for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
        let step = each_array_2[i];
        $$renderer2.push(`<div${attr_class("timeline-step svelte-2yql63", void 0, {
          "done": step[2] === "done",
          "current": step[2] === "current"
        })}><span class="svelte-2yql63">`);
        if (step[2] === "done") {
          $$renderer2.push("<!--[0-->");
          Check($$renderer2, { size: 12 });
        } else if (step[2] === "current") {
          $$renderer2.push("<!--[1-->");
          Clock_3($$renderer2, { size: 12 });
        } else {
          $$renderer2.push("<!--[-1-->");
          Circle($$renderer2, { size: 9 });
        }
        $$renderer2.push(`<!--]--></span><div class="svelte-2yql63"><strong class="svelte-2yql63">${escape_html(step[0])}</strong><small class="svelte-2yql63">${escape_html(step[1])}</small></div>`);
        if (i < timeline.length - 1) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<i class="svelte-2yql63"></i>`);
        } else $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div></section> <section class="card activity-card"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Recent activity</h2><p class="svelte-2yql63">Latest updates for this order</p></div></div><div class="activity svelte-2yql63"><div class="svelte-2yql63"><span class="activity-icon purple svelte-2yql63">`);
      Clock_3($$renderer2, { size: 13 });
      $$renderer2.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Meera updated Colour correction to 70%</strong><small class="svelte-2yql63">Today, 11:42</small></p></div><div class="svelte-2yql63"><span class="activity-icon svelte-2yql63">`);
      Paperclip($$renderer2, { size: 13 });
      $$renderer2.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Reference files were added</strong><small class="svelte-2yql63">Yesterday, 18:16</small></p></div><div class="svelte-2yql63"><span class="activity-icon green svelte-2yql63">`);
      Check($$renderer2, { size: 13 });
      $$renderer2.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Culling was approved by admin</strong><small class="svelte-2yql63">14 Jul, 16:08</small></p></div></div></section></div><aside class="side-col svelte-2yql63"><section class="card info-card svelte-2yql63"><h2 class="svelte-2yql63">Order details</h2><dl class="svelte-2yql63"><div class="svelte-2yql63"><dt class="svelte-2yql63">Customer</dt><dd class="svelte-2yql63">${escape_html(order.customer)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Work type</dt><dd class="svelte-2yql63">${escape_html(order.workType)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Files received</dt><dd class="svelte-2yql63">${escape_html(order.files)} files</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Delivery date</dt><dd class="svelte-2yql63">${escape_html(order.due)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Source files</dt><dd class="svelte-2yql63"><a${attr("href", "https://" + order.fileLink)} class="svelte-2yql63">Open folder `);
      External_link($$renderer2, { size: 11 });
      $$renderer2.push(`<!----></a></dd></div></dl></section> <section class="card people-card svelte-2yql63"><h2 class="svelte-2yql63">Assigned editors</h2><!--[-->`);
      const each_array_3 = ensure_array_like([...new Set(order.tasks.filter((t2) => t2.assignee !== "Unassigned").map((t2) => t2.assignee))]);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let editor = each_array_3[$$index_3];
        $$renderer2.push(`<div class="person svelte-2yql63"><span class="svelte-2yql63">${escape_html(editor.split(" ").map((n2) => n2[0]).join(""))}</span><div class="svelte-2yql63"><strong class="svelte-2yql63">${escape_html(editor)}</strong><small class="svelte-2yql63">${escape_html(order.tasks.find((t2) => t2.assignee === editor)?.name)}</small></div></div>`);
      }
      $$renderer2.push(`<!--]--><button class="add-person svelte-2yql63">`);
      Plus($$renderer2, { size: 13 });
      $$renderer2.push(`<!----> Assign editor</button></section> <section class="card invoice-card svelte-2yql63"><div class="invoice-title svelte-2yql63"><span class="svelte-2yql63">`);
      File_text($$renderer2, { size: 15 });
      $$renderer2.push(`<!----></span><div class="svelte-2yql63"><h2 class="svelte-2yql63">Invoice</h2><small class="svelte-2yql63">INV-2026-0088</small></div>`);
      StatusBadge($$renderer2, { status: order.paid === order.price ? "Paid" : "Partially paid" });
      $$renderer2.push(`<!----></div><div class="amount svelte-2yql63"><small class="svelte-2yql63">Total</small><strong class="svelte-2yql63">${escape_html(money(order.price))}</strong></div><div class="payment-bar svelte-2yql63"><span class="svelte-2yql63"${attr_style("", { width: order.paid / order.price * 100 + "%" })}></span></div><div class="paid-row svelte-2yql63"><span>Paid ${escape_html(money(order.paid))}</span><span>Balance ${escape_html(money(order.price - order.paid))}</span></div><button class="invoice-button svelte-2yql63">`);
      Indian_rupee($$renderer2, { size: 13 });
      $$renderer2.push(`<!----> Record payment</button></section></aside></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
var init_page_svelte6 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/orders/_id_/_page.svelte.js"() {
    init_server();
    init_data();
    init_Icon();
    init_arrow_left();
    init_check();
    init_file_text();
    init_clock_3();
    init_external_link();
    init_message_circle();
    init_StatusBadge();
  }
});

// .svelte-kit/output/server/nodes/10.js
var __exports11 = {};
__export(__exports11, {
  component: () => component10,
  fonts: () => fonts11,
  imports: () => imports11,
  index: () => index11,
  stylesheets: () => stylesheets11,
  universal: () => page_ts_exports2,
  universal_id: () => universal_id2
});
var index11, component_cache10, component10, universal_id2, imports11, stylesheets11, fonts11;
var init__11 = __esm({
  ".svelte-kit/output/server/nodes/10.js"() {
    init_page_ts2();
    index11 = 10;
    component10 = async () => component_cache10 ??= (await Promise.resolve().then(() => (init_page_svelte6(), page_svelte_exports6))).default;
    universal_id2 = "src/routes/(admin)/orders/[id]/+page.ts";
    imports11 = ["_app/immutable/nodes/10.D0VwbRpJ.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/DTBFfHl0.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/wN3GlxJf.js", "_app/immutable/chunks/BHMvLVQ6.js", "_app/immutable/chunks/DAFc8Izj.js", "_app/immutable/chunks/BYaaJhau.js", "_app/immutable/chunks/Bin8K3vy.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BFw9YDNL.js"];
    stylesheets11 = ["_app/immutable/assets/10.ClXYmQT_.css"];
    fonts11 = [];
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/settings/_page.svelte.js
var page_svelte_exports7 = {};
__export(page_svelte_exports7, {
  default: () => _page7
});
function Hard_drive($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "hard-drive" },
    sanitize_props($$props),
    {
      /**
      * @component @name HardDrive
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMTZoLjAxIiAvPgogIDxwYXRoIGQ9Ik0yLjIxMiAxMS41NzdhMiAyIDAgMCAwLS4yMTIuODk2VjE4YTIgMiAwIDAgMCAyIDJoMTZhMiAyIDAgMCAwIDItMnYtNS41MjdhMiAyIDAgMCAwLS4yMTItLjg5NkwxOC41NSA1LjExQTIgMiAwIDAgMCAxNi43NiA0SDcuMjRhMiAyIDAgMCAwLTEuNzkgMS4xMXoiIC8+CiAgPHBhdGggZD0iTTIxLjk0NiAxMi4wMTNIMi4wNTQiIC8+CiAgPHBhdGggZD0iTTYgMTZoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/hard-drive
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M10 16h.01" }],
        ["path", { "d": "M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }],
        ["path", { "d": "M21.946 12.013H2.054" }],
        ["path", { "d": "M6 16h.01" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Table_properties($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "table-properties" },
    sanitize_props($$props),
    {
      /**
      * @component @name TableProperties
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM3YxOCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0yMSA5SDMiIC8+CiAgPHBhdGggZD0iTTIxIDE1SDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/table-properties
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M15 3v18" }],
        ["rect", {
          "width": "18",
          "height": "18",
          "x": "3",
          "y": "3",
          "rx": "2"
        }],
        ["path", { "d": "M21 9H3" }],
        ["path", { "d": "M21 15H3" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page7($$renderer) {
  PageHeader($$renderer, {
    eyebrow: "Studio and integrations",
    title: "Settings"
  });
  $$renderer.push(`<!----> <div class="settings-grid svelte-19my2un"><section class="card settings-card svelte-19my2un"><h2 class="svelte-19my2un">Studio profile</h2><p class="svelte-19my2un">Used on invoices, portals and outgoing messages.</p> <div class="form-grid"><div class="field"><label for="studio-name">Studio name</label><input id="studio-name" value="Arvind Studio"/></div> <div class="field"><label for="studio-whatsapp">WhatsApp number</label><input id="studio-whatsapp" value="+91 98765 00000"/></div> <div class="field"><label for="studio-email">Email</label><input id="studio-email" value="hello@arvindstudio.in"/></div> <div class="field"><label for="studio-gst">GSTIN</label><input id="studio-gst" placeholder="Add GST number"/></div></div> <button class="primary svelte-19my2un">Save changes</button></section> <section class="card integrations svelte-19my2un"><h2 class="svelte-19my2un">Integrations</h2><p class="svelte-19my2un">Connect the services StudioFlow uses.</p> <div class="svelte-19my2un"><span class="integration-icon green svelte-19my2un">`);
  Sheet($$renderer, { size: 17 });
  $$renderer.push(`<!----></span><p class="svelte-19my2un"><strong class="svelte-19my2un">Google Sheets</strong><small class="svelte-19my2un">StudioFlow Master Sheet</small></p><a class="view-data svelte-19my2un" href="/settings/sheets">`);
  Table_properties($$renderer, { size: 11 });
  $$renderer.push(`<!----> View data</a></div> <div class="svelte-19my2un"><span class="integration-icon svelte-19my2un">`);
  Message_circle($$renderer, { size: 17 });
  $$renderer.push(`<!----></span><p class="svelte-19my2un"><strong class="svelte-19my2un">WhatsApp Cloud API</strong><small class="svelte-19my2un">7 automatic message types</small></p><span class="connected svelte-19my2un">`);
  Check($$renderer, { size: 11 });
  $$renderer.push(`<!----> Connected</span></div> <div class="svelte-19my2un"><span class="integration-icon gray svelte-19my2un">`);
  Hard_drive($$renderer, { size: 17 });
  $$renderer.push(`<!----></span><p class="svelte-19my2un"><strong class="svelte-19my2un">Cloudflare R2</strong><small class="svelte-19my2un">Optional file storage</small></p><button class="svelte-19my2un">Connect `);
  External_link($$renderer, { size: 10 });
  $$renderer.push(`<!----></button></div></section></div>`);
}
var init_page_svelte7 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/settings/_page.svelte.js"() {
    init_server();
    init_Icon();
    init_check();
    init_external_link();
    init_message_circle();
    init_sheet();
    init_PageHeader();
  }
});

// .svelte-kit/output/server/nodes/11.js
var __exports12 = {};
__export(__exports12, {
  component: () => component11,
  fonts: () => fonts12,
  imports: () => imports12,
  index: () => index12,
  stylesheets: () => stylesheets12
});
var index12, component_cache11, component11, imports12, stylesheets12, fonts12;
var init__12 = __esm({
  ".svelte-kit/output/server/nodes/11.js"() {
    index12 = 11;
    component11 = async () => component_cache11 ??= (await Promise.resolve().then(() => (init_page_svelte7(), page_svelte_exports7))).default;
    imports12 = ["_app/immutable/nodes/11.DMzGucr-.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/DAFc8Izj.js", "_app/immutable/chunks/BYaaJhau.js", "_app/immutable/chunks/D9BcqJA9.js", "_app/immutable/chunks/DrsDWILO.js"];
    stylesheets12 = ["_app/immutable/assets/11.i_cEkFMC.css"];
    fonts12 = [];
  }
});

// .svelte-kit/output/server/chunks/googleSheets.js
async function appendSheetRow(sheet, values) {
  if (!private_env.GOOGLE_SHEETS_ID || !private_env.GOOGLE_SHEETS_ACCESS_TOKEN) return {
    synced: false,
    mode: "demo"
  };
  const range = encodeURIComponent(`${sheet}!A:Z`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${private_env.GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    headers: headers2(),
    body: JSON.stringify({ values: [values] })
  });
  if (!response.ok) throw new Error(`Google Sheets sync failed: ${response.status}`);
  return {
    synced: true,
    mode: "live"
  };
}
async function logActivity(action, entity, detail) {
  return appendSheetRow("Activity Logs", [
    (/* @__PURE__ */ new Date()).toISOString(),
    action,
    entity,
    detail
  ]);
}
async function readSheetValues(sheet) {
  if (!private_env.GOOGLE_SHEETS_ID || !private_env.GOOGLE_SHEETS_ACCESS_TOKEN) return null;
  const range = encodeURIComponent(`${sheet}!A:Z`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${private_env.GOOGLE_SHEETS_ID}/values/${range}`, { headers: headers2() });
  if (!response.ok) throw new Error(`Google Sheets read failed: ${response.status}`);
  return (await response.json()).values || [];
}
var headers2;
var init_googleSheets = __esm({
  ".svelte-kit/output/server/chunks/googleSheets.js"() {
    init_shared_server();
    headers2 = () => ({
      Authorization: `Bearer ${private_env.GOOGLE_SHEETS_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    });
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/settings/sheets/_page.server.ts.js
var page_server_ts_exports = {};
__export(page_server_ts_exports, {
  load: () => load3
});
var definitions, load3;
var init_page_server_ts = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/settings/sheets/_page.server.ts.js"() {
    init_googleSheets();
    init_data();
    definitions = [
      {
        name: "Customers",
        columns: [
          "Customer ID",
          "Name",
          "Business",
          "Phone",
          "Email",
          "Projects",
          "Pending"
        ],
        demo: customers.map((c2) => [
          c2.id,
          c2.name,
          c2.business,
          c2.phone,
          c2.email,
          c2.projects,
          c2.pending
        ])
      },
      {
        name: "Orders",
        columns: [
          "Order ID",
          "Customer",
          "Project",
          "Work type",
          "Files",
          "Due date",
          "Price",
          "Status"
        ],
        demo: orders.map((o2) => [
          o2.id,
          o2.customer,
          o2.project,
          o2.workType,
          o2.files,
          o2.due,
          o2.price,
          o2.status
        ])
      },
      {
        name: "Tasks",
        columns: [
          "Task ID",
          "Order ID",
          "Task",
          "Editor",
          "Due date",
          "Progress",
          "Status"
        ],
        demo: orders.flatMap((o2) => o2.tasks.map((t2) => [
          t2.id,
          o2.id,
          t2.name,
          t2.assignee,
          t2.due,
          `${t2.progress}%`,
          t2.status
        ]))
      },
      {
        name: "Editors",
        columns: [
          "Editor ID",
          "Name",
          "Speciality",
          "Phone",
          "Active tasks",
          "Availability"
        ],
        demo: editors.map((e3) => [
          e3.id,
          e3.name,
          e3.specialty,
          e3.phone,
          e3.activeTasks,
          e3.available ? "Available" : "At capacity"
        ])
      },
      {
        name: "Invoices",
        columns: [
          "Invoice ID",
          "Order ID",
          "Customer",
          "Project",
          "Total",
          "Paid",
          "Balance",
          "Status"
        ],
        demo: orders.map((o2) => [
          `INV-${o2.id.slice(-4)}`,
          o2.id,
          o2.customer,
          o2.project,
          o2.price,
          o2.paid,
          o2.price - o2.paid,
          o2.paid === o2.price ? "Paid" : o2.paid ? "Partially paid" : "Unpaid"
        ])
      },
      {
        name: "Payments",
        columns: [
          "Payment ID",
          "Invoice ID",
          "Customer",
          "Amount",
          "Date",
          "Method"
        ],
        demo: orders.filter((o2) => o2.paid > 0).map((o2, i) => [
          `PAY-00${i + 1}`,
          `INV-${o2.id.slice(-4)}`,
          o2.customer,
          o2.paid,
          "15 Jul 2026",
          i % 2 ? "UPI" : "Bank transfer"
        ])
      },
      {
        name: "Activity Logs",
        columns: [
          "Time",
          "Action",
          "Entity",
          "Details"
        ],
        demo: [
          [
            "15 Jul, 11:42",
            "Task updated",
            "TSK-102",
            "Colour correction \xB7 70%"
          ],
          [
            "14 Jul, 16:08",
            "Task approved",
            "TSK-101",
            "Culling approved by admin"
          ],
          [
            "12 Jul, 14:10",
            "Order assigned",
            "ORD-2026-0041",
            "Editors notified on WhatsApp"
          ]
        ]
      },
      {
        name: "Settings",
        columns: ["Key", "Value"],
        demo: [
          ["Studio name", "Arvind Studio"],
          ["Google Sheets sync", "Demo mode"],
          ["WhatsApp notifications", "Demo mode"],
          ["Default currency", "INR"]
        ]
      }
    ];
    load3 = async () => {
      const liveResults = await Promise.all(definitions.map(async (sheet) => {
        try {
          return await readSheetValues(sheet.name);
        } catch {
          return null;
        }
      }));
      return {
        live: liveResults.some((result) => result !== null),
        sheets: definitions.map((sheet, index17) => {
          const values = liveResults[index17];
          if (values && values.length > 0) return {
            name: sheet.name,
            columns: values[0].map(String),
            rows: values.slice(1).map((row) => row.map(String))
          };
          return {
            name: sheet.name,
            columns: sheet.columns,
            rows: sheet.demo.map((row) => row.map(String))
          };
        })
      };
    };
  }
});

// .svelte-kit/output/server/entries/pages/(admin)/settings/sheets/_page.svelte.js
var page_svelte_exports8 = {};
__export(page_svelte_exports8, {
  default: () => _page8
});
function Circle_alert($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "circle-alert" },
    sanitize_props($$props),
    {
      /**
      * @component @name CircleAlert
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjgiIHkyPSIxMiIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMi4wMSIgeTE9IjE2IiB5Mj0iMTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/circle-alert
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["circle", {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }],
        ["line", {
          "x1": "12",
          "x2": "12",
          "y1": "8",
          "y2": "12"
        }],
        ["line", {
          "x1": "12",
          "x2": "12.01",
          "y1": "16",
          "y2": "16"
        }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Refresh_cw($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "refresh-cw" },
    sanitize_props($$props),
    {
      /**
      * @component @name RefreshCw
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAxMmE5IDkgMCAwIDEgOS05IDkuNzUgOS43NSAwIDAgMSA2Ljc0IDIuNzRMMjEgOCIgLz4KICA8cGF0aCBkPSJNMjEgM3Y1aC01IiAvPgogIDxwYXRoIGQ9Ik0yMSAxMmE5IDkgMCAwIDEtOSA5IDkuNzUgOS43NSAwIDAgMS02Ljc0LTIuNzRMMyAxNiIgLz4KICA8cGF0aCBkPSJNOCAxNkgzdjUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/refresh-cw
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }],
        ["path", { "d": "M21 3v5h-5" }],
        ["path", { "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }],
        ["path", { "d": "M8 16H3v5" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page8($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let active = "Customers";
    const selected = derived(() => data.sheets.find((sheet) => sheet.name === active) ?? data.sheets[0]);
    head("3vj1xo", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sheets data \u2014 StudioFlow</title>`);
      });
    });
    $$renderer2.push(`<div class="sheet-heading svelte-3vj1xo"><div><a href="/settings" class="svelte-3vj1xo">`);
    Arrow_left($$renderer2, { size: 14 });
    $$renderer2.push(`<!----> Settings</a><h1 class="svelte-3vj1xo">Google Sheets data</h1><p class="svelte-3vj1xo">View every table used by the StudioFlow workflow.</p></div> <button class="secondary svelte-3vj1xo">`);
    Refresh_cw($$renderer2, { size: 13 });
    $$renderer2.push(`<!----> Refresh</button></div> <div${attr_class("mode-notice svelte-3vj1xo", void 0, { "live": data.live })}>`);
    if (data.live) {
      $$renderer2.push("<!--[0-->");
      Sheet($$renderer2, { size: 14 });
      $$renderer2.push(`<!----><span><strong class="svelte-3vj1xo">Live Google Sheets</strong> \u2014 showing synchronized spreadsheet data.</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      Circle_alert($$renderer2, { size: 14 });
      $$renderer2.push(`<!----><span><strong class="svelte-3vj1xo">Demo data</strong> \u2014 add Google Sheets credentials to show your real spreadsheet here.</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="sheet-tabs svelte-3vj1xo" role="tablist" aria-label="Google Sheets tables"><!--[-->`);
    const each_array = ensure_array_like(data.sheets);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sheet = each_array[$$index];
      $$renderer2.push(`<button${attr_class("svelte-3vj1xo", void 0, { "active": active === sheet.name })}>${escape_html(sheet.name)}<span class="svelte-3vj1xo">${escape_html(sheet.rows.length)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="card table-wrap sheet-table svelte-3vj1xo"><table class="data-table"><thead><tr><!--[-->`);
    const each_array_1 = ensure_array_like(selected().columns);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let column = each_array_1[$$index_1];
      $$renderer2.push(`<th>${escape_html(column)}</th>`);
    }
    $$renderer2.push(`<!--]--></tr></thead><tbody>`);
    const each_array_2 = ensure_array_like(selected().rows);
    if (each_array_2.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
        let row = each_array_2[$$index_3];
        $$renderer2.push(`<tr><!--[-->`);
        const each_array_3 = ensure_array_like(selected().columns);
        for (let index17 = 0, $$length2 = each_array_3.length; index17 < $$length2; index17++) {
          each_array_3[index17];
          $$renderer2.push(`<td class="svelte-3vj1xo">${escape_html(row[index17] ?? "\u2014")}</td>`);
        }
        $$renderer2.push(`<!--]--></tr>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<tr><td${attr("colspan", selected().columns.length)} class="svelte-3vj1xo">No rows in this sheet yet.</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div>`);
  });
}
var init_page_svelte8 = __esm({
  ".svelte-kit/output/server/entries/pages/(admin)/settings/sheets/_page.svelte.js"() {
    init_server();
    init_Icon();
    init_arrow_left();
    init_sheet();
  }
});

// .svelte-kit/output/server/nodes/12.js
var __exports13 = {};
__export(__exports13, {
  component: () => component12,
  fonts: () => fonts13,
  imports: () => imports13,
  index: () => index13,
  server: () => page_server_ts_exports,
  server_id: () => server_id,
  stylesheets: () => stylesheets13
});
var index13, component_cache12, component12, server_id, imports13, stylesheets13, fonts13;
var init__13 = __esm({
  ".svelte-kit/output/server/nodes/12.js"() {
    init_page_server_ts();
    index13 = 12;
    component12 = async () => component_cache12 ??= (await Promise.resolve().then(() => (init_page_svelte8(), page_svelte_exports8))).default;
    server_id = "src/routes/(admin)/settings/sheets/+page.server.ts";
    imports13 = ["_app/immutable/nodes/12.YLuw1h-k.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/DTBFfHl0.js", "_app/immutable/chunks/D9BcqJA9.js"];
    stylesheets13 = ["_app/immutable/assets/12.B1WdVMQ5.css"];
    fonts13 = [];
  }
});

// .svelte-kit/output/server/entries/pages/customer/_token_/_page.ts.js
var page_ts_exports3 = {};
__export(page_ts_exports3, {
  load: () => load4
});
var load4;
var init_page_ts3 = __esm({
  ".svelte-kit/output/server/entries/pages/customer/_token_/_page.ts.js"() {
    init_data();
    init_exports();
    load4 = ({ params }) => {
      const customer = customers.find((c2) => c2.token === params.token);
      if (!customer) error(404, "This secure customer link is invalid or has expired.");
      const customerOrders = orders.filter((o2) => o2.customer === customer.business);
      return {
        customer,
        orders: customerOrders.length ? customerOrders : [orders[0]]
      };
    };
  }
});

// .svelte-kit/output/server/chunks/PortalHeader.js
function PortalHeader($$renderer, $$props) {
  let { label = "" } = $$props;
  $$renderer.push(`<header class="portal-header svelte-cxitux"><a href="/" class="brand svelte-cxitux"><span class="mark svelte-cxitux"><span></span><span></span><span></span></span><strong>StudioFlow</strong></a>`);
  if (label) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<span class="portal-label svelte-cxitux">${escape_html(label)}</span>`);
  } else $$renderer.push("<!--[-1-->");
  $$renderer.push(`<!--]--></header>`);
}
var init_PortalHeader = __esm({
  ".svelte-kit/output/server/chunks/PortalHeader.js"() {
    init_server();
  }
});

// .svelte-kit/output/server/entries/pages/customer/_token_/_page.svelte.js
var page_svelte_exports9 = {};
__export(page_svelte_exports9, {
  default: () => _page9
});
function _page9($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let selected = data.orders[0];
    const steps = derived(() => [
      ["Files received", "done"],
      ["Work assigned", "done"],
      ["Editing in progress", selected.progress > 30 ? "done" : "current"],
      ["Quality review", selected.status === "Waiting Review" ? "current" : selected.progress >= 100 ? "done" : ""],
      ["Ready for delivery", selected.status === "Ready Delivery" ? "current" : ""],
      ["Delivered", selected.status === "Completed" ? "done" : ""]
    ]);
    head("1fflwz", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.customer.business)} \u2014 StudioFlow</title>`);
      });
    });
    PortalHeader($$renderer2, { label: "Customer portal" });
    $$renderer2.push(`<!----> <main class="customer-main svelte-1fflwz"><div class="hello svelte-1fflwz"><p class="svelte-1fflwz">Hello ${escape_html(data.customer.name.split(" ")[0])} \u{1F44B}</p><h1 class="svelte-1fflwz">Your projects</h1><span class="svelte-1fflwz">Track progress, invoices and deliveries in one place.</span></div>`);
    if (data.orders.length > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="project-switch svelte-1fflwz"><!--[-->`);
      const each_array = ensure_array_like(data.orders);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let order = each_array[$$index];
        $$renderer2.push(`<button${attr_class("svelte-1fflwz", void 0, { "active": selected.id === order.id })}>${escape_html(order.project)}</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else $$renderer2.push("<!--[-1-->");
    $$renderer2.push(`<!--]--><section class="project-card card svelte-1fflwz"><div class="project-head svelte-1fflwz"><div class="svelte-1fflwz"><span class="svelte-1fflwz">${escape_html(selected.workType)}</span><h2 class="svelte-1fflwz">${escape_html(selected.project)}</h2><p class="svelte-1fflwz">${escape_html(selected.id)} \xB7 Delivery ${escape_html(selected.due)}</p></div><span class="percent svelte-1fflwz"><strong class="svelte-1fflwz">${escape_html(selected.progress)}%</strong> complete</span></div><div class="customer-progress svelte-1fflwz"><!--[-->`);
    const each_array_1 = ensure_array_like(steps());
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let step = each_array_1[i];
      $$renderer2.push(`<div${attr_class("svelte-1fflwz", void 0, {
        "done": step[1] === "done",
        "current": step[1] === "current"
      })}><span class="svelte-1fflwz">`);
      if (step[1] === "done") {
        $$renderer2.push("<!--[0-->");
        Check($$renderer2, { size: 13 });
      } else if (step[1] === "current") {
        $$renderer2.push("<!--[1-->");
        Clock_3($$renderer2, { size: 13 });
      } else {
        $$renderer2.push("<!--[-1-->");
        Circle($$renderer2, { size: 9 });
      }
      $$renderer2.push(`<!--]--></span><strong class="svelte-1fflwz">${escape_html(step[0])}</strong>`);
      if (i < steps().length - 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<i class="svelte-1fflwz"></i>`);
      } else $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></section><div class="customer-grid svelte-1fflwz"><section class="card invoice svelte-1fflwz"><div class="section-title svelte-1fflwz"><span class="svelte-1fflwz">`);
    File_text($$renderer2, { size: 16 });
    $$renderer2.push(`<!----></span><div><h2 class="svelte-1fflwz">Invoice</h2><p class="svelte-1fflwz">INV-${escape_html(selected.id.slice(-4))}</p></div><button class="svelte-1fflwz">`);
    Download($$renderer2, { size: 13 });
    $$renderer2.push(`<!----> Download</button></div><div class="money-grid svelte-1fflwz"><div class="svelte-1fflwz"><span class="svelte-1fflwz">Total</span><strong class="svelte-1fflwz">${escape_html(money(selected.price))}</strong></div><div class="svelte-1fflwz"><span class="svelte-1fflwz">Paid</span><strong class="green svelte-1fflwz">${escape_html(money(selected.paid))}</strong></div><div class="svelte-1fflwz"><span class="svelte-1fflwz">Balance</span><strong class="svelte-1fflwz">${escape_html(money(selected.price - selected.paid))}</strong></div></div></section><section class="card delivery svelte-1fflwz"><div class="section-title svelte-1fflwz"><span class="svelte-1fflwz">`);
    Download($$renderer2, { size: 16 });
    $$renderer2.push(`<!----></span><div><h2 class="svelte-1fflwz">Project files</h2><p class="svelte-1fflwz">${escape_html(selected.status === "Ready Delivery" ? "Your files are ready" : "Available after final approval")}</p></div></div>`);
    if (selected.status === "Ready Delivery" || selected.status === "Completed") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", "https://" + selected.fileLink)} class="svelte-1fflwz">Download files `);
      Arrow_up_right($$renderer2, { size: 13 });
      $$renderer2.push(`<!----></a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="locked svelte-1fflwz">Delivery link will appear here</span>`);
    }
    $$renderer2.push(`<!--]--></section></div><a class="whatsapp svelte-1fflwz"${attr("href", "https://wa.me/" + data.customer.phone.replace(/\D/g, ""))}>`);
    Message_circle($$renderer2, { size: 16 });
    $$renderer2.push(`<!----> Chat with the studio on WhatsApp</a><p class="privacy svelte-1fflwz">This private link shows only your projects, payments and approved progress updates.</p></main>`);
  });
}
var init_page_svelte9 = __esm({
  ".svelte-kit/output/server/entries/pages/customer/_token_/_page.svelte.js"() {
    init_server();
    init_data();
    init_arrow_up_right();
    init_check();
    init_file_text();
    init_clock_3();
    init_download();
    init_message_circle();
    init_PortalHeader();
  }
});

// .svelte-kit/output/server/nodes/13.js
var __exports14 = {};
__export(__exports14, {
  component: () => component13,
  fonts: () => fonts14,
  imports: () => imports14,
  index: () => index14,
  stylesheets: () => stylesheets14,
  universal: () => page_ts_exports3,
  universal_id: () => universal_id3
});
var index14, component_cache13, component13, universal_id3, imports14, stylesheets14, fonts14;
var init__14 = __esm({
  ".svelte-kit/output/server/nodes/13.js"() {
    init_page_ts3();
    index14 = 13;
    component13 = async () => component_cache13 ??= (await Promise.resolve().then(() => (init_page_svelte9(), page_svelte_exports9))).default;
    universal_id3 = "src/routes/customer/[token]/+page.ts";
    imports14 = ["_app/immutable/nodes/13.1AMgrpJw.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/BA-gQueA.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/wN3GlxJf.js", "_app/immutable/chunks/BHMvLVQ6.js", "_app/immutable/chunks/C7fyHnmN.js", "_app/immutable/chunks/BYaaJhau.js", "_app/immutable/chunks/Bin8K3vy.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/Q3PT6wG92.js"];
    stylesheets14 = ["_app/immutable/assets/PortalHeader.BUoidquO.css", "_app/immutable/assets/13.DqlUsqX7.css"];
    fonts14 = [];
  }
});

// .svelte-kit/output/server/entries/pages/editor/_token_/_page.ts.js
var page_ts_exports4 = {};
__export(page_ts_exports4, {
  load: () => load5
});
var load5;
var init_page_ts4 = __esm({
  ".svelte-kit/output/server/entries/pages/editor/_token_/_page.ts.js"() {
    init_data();
    init_exports();
    load5 = ({ params }) => {
      const editor = editors.find((e3) => e3.token === params.token);
      if (!editor) error(404, "This secure editor link is invalid or has expired.");
      return {
        editor,
        tasks: orders.flatMap((order) => order.tasks.filter((task) => task.assignee === editor.name).map((task) => ({
          ...task,
          orderId: order.id,
          project: order.project,
          customer: order.customer,
          workType: order.workType,
          fileLink: order.fileLink
        })))
      };
    };
  }
});

// .svelte-kit/output/server/entries/pages/editor/_token_/_page.svelte.js
var page_svelte_exports10 = {};
__export(page_svelte_exports10, {
  default: () => _page10
});
function Calendar_days($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "calendar-days" },
    sanitize_props($$props),
    {
      /**
      * @component @name CalendarDays
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgogIDxwYXRoIGQ9Ik04IDE0aC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMTRoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xNiAxNGguMDEiIC8+CiAgPHBhdGggZD0iTTggMThoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOGguMDEiIC8+CiAgPHBhdGggZD0iTTE2IDE4aC4wMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/calendar-days
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [
        ["path", { "d": "M8 2v4" }],
        ["path", { "d": "M16 2v4" }],
        ["rect", {
          "width": "18",
          "height": "18",
          "x": "3",
          "y": "4",
          "rx": "2"
        }],
        ["path", { "d": "M3 10h18" }],
        ["path", { "d": "M8 14h.01" }],
        ["path", { "d": "M12 14h.01" }],
        ["path", { "d": "M16 14h.01" }],
        ["path", { "d": "M8 18h.01" }],
        ["path", { "d": "M12 18h.01" }],
        ["path", { "d": "M16 18h.01" }]
      ],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page10($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("u0moss", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.editor.name)}\u2019s work \u2014 StudioFlow</title>`);
      });
    });
    PortalHeader($$renderer2, { label: "Editor portal" });
    $$renderer2.push(`<!----> <main class="portal-main svelte-u0moss">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="welcome svelte-u0moss"><span class="avatar svelte-u0moss">${escape_html(data.editor.initials)}</span><div><p class="svelte-u0moss">Welcome back</p><h1 class="svelte-u0moss">${escape_html(data.editor.name)}</h1></div></div><div class="work-title svelte-u0moss"><h2 class="svelte-u0moss">Today\u2019s tasks</h2><span class="svelte-u0moss">${escape_html(data.tasks.length)} assigned</span></div><div class="task-cards svelte-u0moss"><!--[-->`);
      const each_array = ensure_array_like(data.tasks);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let task = each_array[$$index];
        $$renderer2.push(`<button class="task-card svelte-u0moss"><div class="task-card-top svelte-u0moss"><div><span class="customer svelte-u0moss">${escape_html(task.customer)}</span><h3 class="svelte-u0moss">${escape_html(task.project)}</h3></div>`);
        StatusBadge($$renderer2, { status: task.status });
        $$renderer2.push(`<!----></div><p class="svelte-u0moss">${escape_html(task.name)}</p><div class="task-footer svelte-u0moss"><span class="svelte-u0moss">`);
        Calendar_days($$renderer2, { size: 13 });
        $$renderer2.push(`<!----> Due ${escape_html(task.due)}</span><span class="open svelte-u0moss">Open `);
        Arrow_up_right($$renderer2, { size: 13 });
        $$renderer2.push(`<!----></span></div></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></main>`);
  });
}
var init_page_svelte10 = __esm({
  ".svelte-kit/output/server/entries/pages/editor/_token_/_page.svelte.js"() {
    init_server();
    init_Icon();
    init_arrow_up_right();
    init_StatusBadge();
    init_PortalHeader();
  }
});

// .svelte-kit/output/server/nodes/14.js
var __exports15 = {};
__export(__exports15, {
  component: () => component14,
  fonts: () => fonts15,
  imports: () => imports15,
  index: () => index15,
  stylesheets: () => stylesheets15,
  universal: () => page_ts_exports4,
  universal_id: () => universal_id4
});
var index15, component_cache14, component14, universal_id4, imports15, stylesheets15, fonts15;
var init__15 = __esm({
  ".svelte-kit/output/server/nodes/14.js"() {
    init_page_ts4();
    index15 = 14;
    component14 = async () => component_cache14 ??= (await Promise.resolve().then(() => (init_page_svelte10(), page_svelte_exports10))).default;
    universal_id4 = "src/routes/editor/[token]/+page.ts";
    imports15 = ["_app/immutable/nodes/14.3dHCjEw5.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/CLCK4qzv.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/BA-gQueA.js", "_app/immutable/chunks/DeGbxgRJ.js", "_app/immutable/chunks/Bin8K3vy.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BFw9YDNL.js", "_app/immutable/chunks/Q3PT6wG92.js"];
    stylesheets15 = ["_app/immutable/assets/PortalHeader.BUoidquO.css", "_app/immutable/assets/14.CNh56ABv.css"];
    fonts15 = [];
  }
});

// .svelte-kit/output/server/entries/pages/login/_page.server.ts.js
var page_server_ts_exports2 = {};
__export(page_server_ts_exports2, {
  actions: () => actions
});
var actions;
var init_page_server_ts2 = __esm({
  ".svelte-kit/output/server/entries/pages/login/_page.server.ts.js"() {
    init_auth();
    init_exports();
    actions = { default: async ({ request, cookies, url }) => {
      const form = await request.formData();
      const email2 = String(form.get("email") || "");
      if (!validCredentials(email2, String(form.get("password") || ""))) return fail(400, {
        invalid: true,
        email: email2
      });
      cookies.set("studioflow_session", await createSession(email2), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: url.protocol === "https:",
        maxAge: 3600 * 24 * 14
      });
      redirect(303, "/dashboard");
    } };
  }
});

// .svelte-kit/output/server/entries/pages/login/_page.svelte.js
var page_svelte_exports11 = {};
__export(page_svelte_exports11, {
  default: () => _page11
});
function Arrow_right($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "arrow-right" },
    sanitize_props($$props),
    {
      /**
      * @component @name ArrowRight
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJtMTIgNSA3IDctNyA3IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/arrow-right
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "m12 5 7 7-7 7" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Shield_check($$renderer, $$props) {
  Icon($$renderer, spread_props([
    { name: "shield-check" },
    sanitize_props($$props),
    {
      /**
      * @component @name ShieldCheck
      * @description Lucide SVG icon component, renders SVG Element with children.
      *
      * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA4Ljk1YTEgMSAwIDAgMS0uNjctLjAxQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMSAxLTFjMiAwIDQuNS0xLjIgNi4yNC0yLjcyYTEuMTcgMS4xNyAwIDAgMSAxLjUyIDBDMTQuNTEgMy44MSAxNyA1IDE5IDVhMSAxIDAgMCAxIDEgMXoiIC8+CiAgPHBhdGggZD0ibTkgMTIgMiAyIDQtNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/shield-check
      * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
      *
      * @param {Object} props - Lucide icons props and any valid SVG attribute
      * @returns {FunctionalComponent} Svelte component
      *
      */
      iconNode: [["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { "d": "m9 12 2 2 4-4" }]],
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page11($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { form } = $$props;
    let loading = false;
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign in \u2014 StudioFlow</title>`);
      });
    });
    PortalHeader($$renderer2, {});
    $$renderer2.push(`<!----> <main class="login svelte-1x05zx6"><div class="login-mark svelte-1x05zx6">`);
    Shield_check($$renderer2, { size: 19 });
    $$renderer2.push(`<!----></div><h1 class="svelte-1x05zx6">Welcome back</h1><p class="svelte-1x05zx6">Sign in to manage your studio\u2019s editing work.</p><form method="POST" class="svelte-1x05zx6"><div class="field"><label for="email">Email</label><input id="email" name="email" type="email"${attr("value", form?.email || "admin@studioflow.app")} required=""/></div><div class="field"><label for="password">Password</label><input id="password" name="password" type="password" value="studioflow" required=""/></div>`);
    if (form?.invalid) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="error svelte-1x05zx6">Email or password is incorrect.</div>`);
    } else $$renderer2.push("<!--[-1-->");
    $$renderer2.push(`<!--]--><button class="primary svelte-1x05zx6"${attr("disabled", loading, true)}>${escape_html("Sign in")} `);
    Arrow_right($$renderer2, { size: 14 });
    $$renderer2.push(`<!----></button></form><span class="demo svelte-1x05zx6">Demo access is prefilled for this local MVP.</span></main>`);
  });
}
var init_page_svelte11 = __esm({
  ".svelte-kit/output/server/entries/pages/login/_page.svelte.js"() {
    init_server();
    init_client();
    init_Icon();
    init_PortalHeader();
  }
});

// .svelte-kit/output/server/nodes/15.js
var __exports16 = {};
__export(__exports16, {
  component: () => component15,
  fonts: () => fonts16,
  imports: () => imports16,
  index: () => index16,
  server: () => page_server_ts_exports2,
  server_id: () => server_id2,
  stylesheets: () => stylesheets16
});
var index16, component_cache15, component15, server_id2, imports16, stylesheets16, fonts16;
var init__16 = __esm({
  ".svelte-kit/output/server/nodes/15.js"() {
    init_page_server_ts2();
    index16 = 15;
    component15 = async () => component_cache15 ??= (await Promise.resolve().then(() => (init_page_svelte11(), page_svelte_exports11))).default;
    server_id2 = "src/routes/login/+page.server.ts";
    imports16 = ["_app/immutable/nodes/15.CUURRXfJ.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/DxrAsuHp.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BZ4SA-SZ.js", "_app/immutable/chunks/xihTtKlq.js", "_app/immutable/chunks/Dp0m8DlN.js", "_app/immutable/chunks/Q3PT6wG92.js"];
    stylesheets16 = ["_app/immutable/assets/PortalHeader.BUoidquO.css", "_app/immutable/assets/15.DWc4Vr39.css"];
    fonts16 = [];
  }
});

// .svelte-kit/output/server/entries/endpoints/api/customers/_server.ts.js
var server_ts_exports = {};
__export(server_ts_exports, {
  POST: () => POST
});
var POST;
var init_server_ts = __esm({
  ".svelte-kit/output/server/entries/endpoints/api/customers/_server.ts.js"() {
    init_googleSheets();
    init_auth();
    init_exports();
    POST = async ({ request, cookies }) => {
      if (!await verifySession(cookies.get("studioflow_session"))) return json({
        ok: false,
        error: "Unauthorized"
      }, { status: 401 });
      const input = await request.json();
      if (!String(input.name || "").trim() || !String(input.phone || "").trim()) return json({
        ok: false,
        error: "Customer name and phone number are required."
      }, { status: 400 });
      const customer = {
        id: `CUST-${`${Date.now()}`.slice(-5)}`,
        name: String(input.name).trim(),
        business: String(input.business || input.name).trim(),
        phone: String(input.phone).trim(),
        email: String(input.email || "").trim(),
        projects: 0,
        pending: 0,
        token: `cust-${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`
      };
      const sync = await appendSheetRow("Customers", [
        customer.id,
        customer.name,
        customer.business,
        customer.phone,
        input.whatsapp || customer.phone,
        customer.email,
        input.address || "",
        input.gst || "",
        0,
        0,
        customer.token
      ]);
      await logActivity("Customer created", customer.id, customer.business);
      return json({
        ok: true,
        customer,
        sync
      }, { status: 201 });
    };
  }
});

// .svelte-kit/output/server/entries/endpoints/api/orders/_server.ts.js
var server_ts_exports2 = {};
__export(server_ts_exports2, {
  POST: () => POST2
});
var POST2;
var init_server_ts2 = __esm({
  ".svelte-kit/output/server/entries/endpoints/api/orders/_server.ts.js"() {
    init_googleSheets();
    init_auth();
    init_exports();
    POST2 = async ({ request, cookies }) => {
      if (!await verifySession(cookies.get("studioflow_session"))) return json({
        ok: false,
        error: "Unauthorized"
      }, { status: 401 });
      const order = await request.json();
      const result = await appendSheetRow("Orders", [
        order.id,
        order.customer,
        order.project,
        order.workType,
        order.files,
        order.due,
        order.price,
        "Received"
      ]);
      await logActivity("Order created", order.id, order.project);
      return json({
        ok: true,
        sync: result
      }, { status: 201 });
    };
  }
});

// .svelte-kit/output/server/entries/endpoints/api/tasks/_id_/_server.ts.js
var server_ts_exports3 = {};
__export(server_ts_exports3, {
  PATCH: () => PATCH
});
var PATCH;
var init_server_ts3 = __esm({
  ".svelte-kit/output/server/entries/endpoints/api/tasks/_id_/_server.ts.js"() {
    init_googleSheets();
    init_data();
    init_exports();
    PATCH = async ({ params, request }) => {
      const update = await request.json();
      const editor = editors.find((item) => item.token === update.token);
      const task = orders.flatMap((order) => order.tasks).find((item) => item.id === params.id);
      if (!editor || !task || task.assignee !== editor.name) return json({
        ok: false,
        error: "Invalid or expired task access"
      }, { status: 403 });
      const result = await appendSheetRow("Task Updates", [
        (/* @__PURE__ */ new Date()).toISOString(),
        params.id,
        update.status,
        update.progress,
        update.notes || ""
      ]);
      await logActivity("Task updated", params.id, `${update.status} \xB7 ${update.progress}%`);
      return json({
        ok: true,
        sync: result
      });
    };
  }
});

// .svelte-kit/output/server/index.js
init_internal3();
init_shared();
init_internal2();

// .svelte-kit/output/server/chunks/utils.js
init_shared();
init_exports();
init_internal();
init_server2();

// node_modules/set-cookie-parser/lib/set-cookie.js
var defaultParseOptions = {
  decodeValues: true,
  map: false,
  silent: false,
  split: "auto"
  // auto = split strings but not arrays
};
function isForbiddenKey(key2) {
  return typeof key2 !== "string" || key2 in {};
}
function createNullObj() {
  return /* @__PURE__ */ Object.create(null);
}
function isNonEmptyString(str) {
  return typeof str === "string" && !!str.trim();
}
function parseString(setCookieValue, options2) {
  var parts = setCookieValue.split(";").filter(isNonEmptyString);
  var nameValuePairStr = parts.shift();
  if (!nameValuePairStr) {
    return null;
  }
  var parsed = parseNameValuePair(nameValuePairStr);
  var name = parsed.name;
  var value = parsed.value;
  options2 = options2 ? Object.assign({}, defaultParseOptions, options2) : defaultParseOptions;
  if (isForbiddenKey(name)) {
    return null;
  }
  try {
    value = options2.decodeValues ? decodeURIComponent(value) : value;
  } catch (e3) {
    console.error(
      "set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.",
      e3
    );
  }
  var cookie = createNullObj();
  cookie.name = name;
  cookie.value = value;
  parts.forEach(function(part) {
    var sides = part.split("=");
    var key2 = sides.shift().trim().toLowerCase();
    if (isForbiddenKey(key2)) {
      return;
    }
    var value2 = sides.join("=").trim();
    if (key2 === "expires") {
      cookie.expires = new Date(value2);
    } else if (key2 === "max-age") {
      var n2 = parseInt(value2, 10);
      if (!Number.isNaN(n2)) cookie.maxAge = n2;
    } else if (key2 === "secure") {
      cookie.secure = true;
    } else if (key2 === "httponly") {
      cookie.httpOnly = true;
    } else if (key2 === "samesite") {
      cookie.sameSite = value2;
    } else if (key2 === "partitioned") {
      cookie.partitioned = true;
    } else if (key2) {
      cookie[key2] = value2;
    }
  });
  return cookie;
}
function parseNameValuePair(nameValuePairStr) {
  var name = "";
  var value = "";
  var nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}
function parseSetCookie(input, options2) {
  options2 = options2 ? Object.assign({}, defaultParseOptions, options2) : defaultParseOptions;
  if (!input) {
    if (!options2.map) {
      return [];
    } else {
      return createNullObj();
    }
  }
  if (input.headers) {
    if (typeof input.headers.getSetCookie === "function") {
      input = input.headers.getSetCookie();
    } else if (input.headers["set-cookie"]) {
      input = input.headers["set-cookie"];
    } else {
      var sch = input.headers[Object.keys(input.headers).find(function(key2) {
        return key2.toLowerCase() === "set-cookie";
      })];
      if (!sch && input.headers.cookie && !options2.silent) {
        console.warn(
          "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
        );
      }
      input = sch;
    }
  }
  var split = options2.split;
  var isArray = Array.isArray(input);
  if (split === "auto") {
    split = !isArray;
  }
  if (!isArray) {
    input = [input];
  }
  input = input.filter(isNonEmptyString);
  if (split) {
    input = input.map(splitCookiesString).flat();
  }
  if (!options2.map) {
    return input.map(function(str) {
      return parseString(str, options2);
    }).filter(Boolean);
  } else {
    var cookies = createNullObj();
    return input.reduce(function(cookies2, str) {
      var cookie = parseString(str, options2);
      if (cookie && !isForbiddenKey(cookie.name)) {
        cookies2[cookie.name] = cookie;
      }
      return cookies2;
    }, cookies);
  }
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  var cookiesStrings = [];
  var pos = 0;
  var start;
  var ch;
  var lastComma;
  var nextStart;
  var cookiesSeparatorFound;
  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }
  function notSpecialChar() {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  }
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}
parseSetCookie.parseSetCookie = parseSetCookie;
parseSetCookie.parse = parseSetCookie;
parseSetCookie.parseString = parseString;
parseSetCookie.splitCookiesString = splitCookiesString;

// .svelte-kit/output/server/chunks/utils.js
init_devalue();
var ENDPOINT_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD"
];
var PAGE_METHODS = [
  "GET",
  "POST",
  "HEAD"
];
var decoder = new TextDecoder();
function set_nested_value(object, path_string, value) {
  if (path_string.startsWith("n:")) {
    path_string = path_string.slice(2);
    value = value === "" ? void 0 : parseFloat(value);
  } else if (path_string.startsWith("b:")) {
    path_string = path_string.slice(2);
    value = value === "on";
  }
  deep_set(object, split_path(path_string), value);
}
var DELETE_KEY = {};
function convert_formdata(data) {
  const result = {};
  for (let key2 of data.keys()) {
    const is_array2 = key2.endsWith("[]");
    let values = data.getAll(key2);
    if (is_array2) key2 = key2.slice(0, -2);
    values = values.filter((entry) => typeof entry === "string" || entry.name !== "" || entry.size > 0);
    if (values.length === 0 && !is_array2) continue;
    if (key2.startsWith("n:")) {
      key2 = key2.slice(2);
      values = values.map((v) => v === "" ? void 0 : parseFloat(v));
    } else if (key2.startsWith("b:")) {
      key2 = key2.slice(2);
      values = values.map((v) => v === "on");
    }
    if (values.length > 1 && !is_array2) throw new Error(`Form cannot contain duplicated keys \u2014 "${key2}" has ${values.length} values`);
    set_nested_value(result, key2, is_array2 ? values : values[0]);
  }
  return result;
}
var BINARY_FORM_CONTENT_TYPE = "application/x-sveltekit-formdata";
var BINARY_FORM_VERSION = 0;
var HEADER_BYTES = 7;
async function deserialize_binary_form(request) {
  if (request.headers.get("content-type") !== "application/x-sveltekit-formdata") {
    const form_data = await request.formData();
    return {
      data: convert_formdata(form_data),
      meta: {},
      form_data
    };
  }
  if (!request.body) throw deserialize_error("no body");
  const reader = request.body.getReader();
  const chunks = [];
  function get_chunk(index17) {
    if (index17 in chunks) return chunks[index17];
    let i = chunks.length;
    while (i <= index17) {
      chunks[i] = reader.read().then((chunk) => chunk.value);
      i++;
    }
    return chunks[index17];
  }
  async function get_buffer(offset, length) {
    let start_chunk;
    let chunk_start = 0;
    let chunk_index;
    for (chunk_index = 0; ; chunk_index++) {
      const chunk = await get_chunk(chunk_index);
      if (!chunk) return null;
      const chunk_end = chunk_start + chunk.byteLength;
      if (offset >= chunk_start && offset < chunk_end) {
        start_chunk = chunk;
        break;
      }
      chunk_start = chunk_end;
    }
    if (offset + length <= chunk_start + start_chunk.byteLength) return start_chunk.subarray(offset - chunk_start, offset + length - chunk_start);
    const chunks2 = [start_chunk.subarray(offset - chunk_start)];
    let cursor = start_chunk.byteLength - offset + chunk_start;
    while (cursor < length) {
      chunk_index++;
      let chunk = await get_chunk(chunk_index);
      if (!chunk) return null;
      if (chunk.byteLength > length - cursor) chunk = chunk.subarray(0, length - cursor);
      chunks2.push(chunk);
      cursor += chunk.byteLength;
    }
    const buffer2 = new Uint8Array(length);
    cursor = 0;
    for (const chunk of chunks2) {
      buffer2.set(chunk, cursor);
      cursor += chunk.byteLength;
    }
    return buffer2;
  }
  const header = await get_buffer(0, HEADER_BYTES);
  if (!header) throw deserialize_error("too short");
  if (header[0] !== BINARY_FORM_VERSION) throw deserialize_error(`got version ${header[0]}, expected version ${BINARY_FORM_VERSION}`);
  const header_view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  const data_length = header_view.getUint32(1, true);
  const file_offsets_length = header_view.getUint16(5, true);
  const data_buffer = await get_buffer(HEADER_BYTES, data_length);
  if (!data_buffer) throw deserialize_error("data too short");
  let file_offsets;
  let files_start_offset;
  if (file_offsets_length > 0) {
    const file_offsets_buffer = await get_buffer(HEADER_BYTES + data_length, file_offsets_length);
    if (!file_offsets_buffer) throw deserialize_error("file offset table too short");
    const parsed_offsets = JSON.parse(decoder.decode(file_offsets_buffer));
    if (!Array.isArray(parsed_offsets) || parsed_offsets.some((n2) => typeof n2 !== "number" || !Number.isInteger(n2) || n2 < 0)) throw deserialize_error("invalid file offset table");
    file_offsets = parsed_offsets;
    files_start_offset = HEADER_BYTES + data_length + file_offsets_length;
  }
  const file_spans = [];
  const [data, meta] = parse(decoder.decode(data_buffer), { File: ([name, type, size, last_modified, index17]) => {
    if (typeof name !== "string" || typeof type !== "string" || typeof size !== "number" || typeof last_modified !== "number" || typeof index17 !== "number") throw deserialize_error("invalid file metadata");
    let offset = file_offsets[index17];
    if (offset === void 0) throw deserialize_error("duplicate file offset table index");
    file_offsets[index17] = void 0;
    offset += files_start_offset;
    file_spans.push({
      offset,
      size
    });
    return new Proxy(new LazyFile(name, type, size, last_modified, get_chunk, offset), { getPrototypeOf() {
      return File.prototype;
    } });
  } });
  file_spans.sort((a, b) => a.offset - b.offset || a.size - b.size);
  for (let i = 1; i < file_spans.length; i++) {
    const previous = file_spans[i - 1];
    const current2 = file_spans[i];
    const previous_end = previous.offset + previous.size;
    if (previous_end < current2.offset) throw deserialize_error("gaps in file data");
    if (previous_end > current2.offset) throw deserialize_error("overlapping file data");
  }
  (async () => {
    let has_more = true;
    while (has_more) has_more = !!await get_chunk(chunks.length);
  })().catch(noop2);
  return {
    data,
    meta,
    form_data: null
  };
}
function deserialize_error(message) {
  return new SvelteKitError(400, "Bad Request", `Could not deserialize binary form: ${message}`);
}
var LazyFile = class LazyFile2 {
  /** @type {(index: number) => Promise<Uint8Array<ArrayBuffer> | undefined>} */
  #get_chunk;
  /** @type {number} */
  #offset;
  /**
  * @param {string} name
  * @param {string} type
  * @param {number} size
  * @param {number} last_modified
  * @param {(index: number) => Promise<Uint8Array<ArrayBuffer> | undefined>} get_chunk
  * @param {number} offset
  */
  constructor(name, type, size, last_modified, get_chunk, offset) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.lastModified = last_modified;
    this.webkitRelativePath = "";
    this.#get_chunk = get_chunk;
    this.#offset = offset;
    this.arrayBuffer = this.arrayBuffer.bind(this);
    this.bytes = this.bytes.bind(this);
    this.slice = this.slice.bind(this);
    this.stream = this.stream.bind(this);
    this.text = this.text.bind(this);
  }
  /** @type {ArrayBuffer | undefined} */
  #buffer;
  async arrayBuffer() {
    this.#buffer ??= await new Response(this.stream()).arrayBuffer();
    return this.#buffer;
  }
  async bytes() {
    return new Uint8Array(await this.arrayBuffer());
  }
  /**
  * @param {number=} start
  * @param {number=} end
  * @param {string=} contentType
  */
  slice(start = 0, end = this.size, contentType = this.type) {
    if (start < 0) start = Math.max(this.size + start, 0);
    else start = Math.min(start, this.size);
    if (end < 0) end = Math.max(this.size + end, 0);
    else end = Math.min(end, this.size);
    const size = Math.max(end - start, 0);
    return new LazyFile2(this.name, contentType, size, this.lastModified, this.#get_chunk, this.#offset + start);
  }
  stream() {
    let cursor = 0;
    let chunk_index = 0;
    return new ReadableStream({
      start: async (controller2) => {
        let chunk_start = 0;
        let start_chunk;
        for (chunk_index = 0; ; chunk_index++) {
          const chunk = await this.#get_chunk(chunk_index);
          if (!chunk) return null;
          const chunk_end = chunk_start + chunk.byteLength;
          if (this.#offset >= chunk_start && this.#offset < chunk_end) {
            start_chunk = chunk;
            break;
          }
          chunk_start = chunk_end;
        }
        if (this.#offset + this.size <= chunk_start + start_chunk.byteLength) {
          controller2.enqueue(start_chunk.subarray(this.#offset - chunk_start, this.#offset + this.size - chunk_start));
          controller2.close();
        } else {
          controller2.enqueue(start_chunk.subarray(this.#offset - chunk_start));
          cursor = start_chunk.byteLength - this.#offset + chunk_start;
        }
      },
      pull: async (controller2) => {
        chunk_index++;
        let chunk = await this.#get_chunk(chunk_index);
        if (!chunk) {
          controller2.error("incomplete file data");
          controller2.close();
          return;
        }
        if (chunk.byteLength > this.size - cursor) chunk = chunk.subarray(0, this.size - cursor);
        controller2.enqueue(chunk);
        cursor += chunk.byteLength;
        if (cursor >= this.size) controller2.close();
      }
    });
  }
  async text() {
    return decoder.decode(await this.arrayBuffer());
  }
};
var path_regex = /^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/;
function split_path(path) {
  if (!path_regex.test(path)) throw new Error(`Invalid path ${path}`);
  return path.split(/\.|\[|\]/).filter(Boolean);
}
function check_prototype_pollution(key2) {
  if (key2 === "__proto__" || key2 === "constructor" || key2 === "prototype") throw new Error(`Invalid key "${key2}"`);
}
function deep_set(object, keys, value) {
  let current2 = object;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key2 = keys[i];
    check_prototype_pollution(key2);
    const is_array2 = /^\d+$/.test(keys[i + 1]);
    const inner = Object.hasOwn(current2, key2) ? current2[key2] : void 0;
    const exists = inner != null;
    if (exists && is_array2 !== Array.isArray(inner)) throw new Error(`Invalid array key ${keys[i + 1]}`);
    if (!exists) {
      if (value === DELETE_KEY) return;
      current2[key2] = is_array2 ? [] : {};
    }
    current2 = current2[key2];
  }
  const final_key = keys[keys.length - 1];
  check_prototype_pollution(final_key);
  if (value === DELETE_KEY) delete current2[final_key];
  else current2[final_key] = value;
}
function negotiate(accept, types) {
  const parts = [];
  accept.split(",").forEach((str, i) => {
    const match = /([^/ \t]+)\/([^; \t]+)[ \t]*(?:;[ \t]*q=([0-9.]+))?/.exec(str);
    if (match) {
      const [, type, subtype, q = "1"] = match;
      parts.push({
        type,
        subtype,
        q: +q,
        i
      });
    }
  });
  parts.sort((a, b) => {
    if (a.q !== b.q) return b.q - a.q;
    if (a.subtype === "*" !== (b.subtype === "*")) return a.subtype === "*" ? 1 : -1;
    if (a.type === "*" !== (b.type === "*")) return a.type === "*" ? 1 : -1;
    return a.i - b.i;
  });
  let accepted;
  let min_priority = Infinity;
  for (const mimetype of types) {
    const [type, subtype] = mimetype.split("/");
    const priority = parts.findIndex((part) => (part.type === type || part.type === "*") && (part.subtype === subtype || part.subtype === "*"));
    if (priority !== -1 && priority < min_priority) {
      accepted = mimetype;
      min_priority = priority;
    }
  }
  return accepted;
}
function get_set_cookies(headers3) {
  if (typeof headers3.getSetCookie === "function") return headers3.getSetCookie();
  const set_cookie = headers3.get("set-cookie");
  return set_cookie ? splitCookiesString(set_cookie) : [];
}
function is_content_type(request, ...types) {
  const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
  return types.includes(type.toLowerCase());
}
function is_form_content_type(request) {
  return is_content_type(request, "application/x-www-form-urlencoded", "multipart/form-data", "text/plain", BINARY_FORM_CONTENT_TYPE);
}
var escape_html_attr_dict = {
  "&": "&amp;",
  '"': "&quot;"
};
var escape_html_dict = {
  "&": "&amp;",
  "<": "&lt;"
};
var escape_html_attr_regex = new RegExp(`[${Object.keys(escape_html_attr_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
var escape_html_regex = new RegExp(`[${Object.keys(escape_html_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
function escape_html2(str, is_attr) {
  const dict = is_attr ? escape_html_attr_dict : escape_html_dict;
  return str.replace(is_attr ? escape_html_attr_regex : escape_html_regex, (match) => {
    if (match.length === 2) return match;
    return dict[match] ?? `&#${match.charCodeAt(0)};`;
  });
}
function method_not_allowed(mod, method) {
  return text(`${method} method not allowed`, {
    status: 405,
    headers: { allow: allowed_methods(mod).join(", ") }
  });
}
function allowed_methods(mod) {
  const allowed = ENDPOINT_METHODS.filter((method) => method in mod);
  if ("GET" in mod && !("HEAD" in mod)) allowed.push("HEAD");
  return allowed;
}
function get_global_name(options2) {
  return `__sveltekit_${options2.version_hash}`;
}
function static_error_page(options2, status, message) {
  return text(options2.templates.error({
    status,
    message: escape_html2(message)
  }), {
    headers: { "content-type": "text/html; charset=utf-8" },
    status
  });
}
async function handle_fatal_error(event, state2, options2, error2) {
  error2 = error2 instanceof HttpError ? error2 : coalesce_to_error(error2);
  const status = get_status(error2);
  const body = await handle_error_and_jsonify(event, state2, options2, error2);
  const type = negotiate(event.request.headers.get("accept") || "text/html", ["application/json", "text/html"]);
  if (event.isDataRequest || type === "application/json") return json(body, { status });
  return static_error_page(options2, status, body.message);
}
async function handle_error_and_jsonify(event, state2, options2, error2) {
  if (error2 instanceof HttpError) return {
    message: "Unknown Error",
    ...error2.body
  };
  const status = get_status(error2);
  const message = get_message(error2);
  return await with_request_store({
    event,
    state: state2
  }, () => options2.hooks.handleError({
    error: error2,
    event,
    status,
    message
  })) ?? { message };
}
function redirect_response(status, location) {
  return new Response(void 0, {
    status,
    headers: { location }
  });
}
function clarify_devalue_error(event, error2) {
  if (error2.path) return `Data returned from \`load\` while rendering ${event.route.id} is not serializable: ${error2.message} (${error2.path}). If you need to serialize/deserialize custom types, use transport hooks: https://svelte.dev/docs/kit/hooks#Universal-hooks-transport.`;
  if (error2.path === "") return `Data returned from \`load\` while rendering ${event.route.id} is not a plain object`;
  return error2.message;
}
function serialize_uses(node) {
  const uses = {};
  if (node.uses && node.uses.dependencies.size > 0) uses.dependencies = Array.from(node.uses.dependencies);
  if (node.uses && node.uses.search_params.size > 0) uses.search_params = Array.from(node.uses.search_params);
  if (node.uses && node.uses.params.size > 0) uses.params = Array.from(node.uses.params);
  if (node.uses?.parent) uses.parent = 1;
  if (node.uses?.route) uses.route = 1;
  if (node.uses?.url) uses.url = 1;
  return uses;
}
function has_prerendered_path(manifest2, pathname) {
  return manifest2._.prerendered_routes.has(pathname) || pathname.at(-1) === "/" && manifest2._.prerendered_routes.has(pathname.slice(0, -1));
}
function format_server_error(status, error2, event) {
  const formatted_text = `
\x1B[1;31m[${status}] ${event.request.method} ${event.url.pathname}\x1B[0m`;
  if (status === 404) return formatted_text;
  return `${formatted_text}
${error2.stack}`;
}
function get_node_type(node_id) {
  const filename = node_id?.split("/")?.at(-1);
  if (!filename) return "unknown";
  return filename.split(".").slice(0, -1).join(".");
}
function create_replacer(transport) {
  const replacer = (thing) => {
    for (const key2 in transport) {
      const encoded = transport[key2].encode(thing);
      if (encoded) return `app.decode('${key2}', ${uneval(encoded, replacer)})`;
    }
  };
  return replacer;
}

// .svelte-kit/output/server/index.js
init_shared_server();
init_exports2();
init_server();
init_index_server();
init_exports();
init_internal();
init_server2();
init_devalue();
var import_cookie = __toESM(require_cookie(), 1);
function with_resolvers() {
  let resolve2;
  let reject;
  return {
    promise: new Promise((res, rej) => {
      resolve2 = res;
      reject = rej;
    }),
    resolve: resolve2,
    reject
  };
}
var NULL_BODY_STATUS = [
  101,
  103,
  204,
  205,
  304
];
var IN_WEBCONTAINER2 = !!globalThis.process?.versions?.webcontainer;
var s = JSON.stringify;
async function render_endpoint(event, event_state, mod, state2) {
  const method = event.request.method;
  let handler = mod[method] || mod.fallback;
  if (method === "HEAD" && !mod.HEAD && mod.GET) handler = mod.GET;
  if (!handler) return method_not_allowed(mod, method);
  const prerender = mod.prerender ?? state2.prerender_default;
  if (prerender && (mod.POST || mod.PATCH || mod.PUT || mod.DELETE)) throw new Error("Cannot prerender endpoints that have mutative methods");
  if (state2.prerendering && !state2.prerendering.inside_reroute && !prerender) if (state2.depth > 0) throw new Error(`${event.route.id} is not prerenderable`);
  else return new Response(void 0, { status: 204 });
  try {
    const response = await with_request_store({
      event,
      state: event_state
    }, () => handler(event));
    if (!(response instanceof Response)) throw new Error(`Invalid response from route ${event.url.pathname}: handler should return a Response object`);
    if (state2.prerendering && (!state2.prerendering.inside_reroute || prerender)) {
      const cloned = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });
      cloned.headers.set("x-sveltekit-prerender", String(prerender));
      if (state2.prerendering.inside_reroute && prerender) {
        cloned.headers.set("x-sveltekit-routeid", encodeURI(event.route.id));
        state2.prerendering.dependencies.set(event.url.pathname, {
          response: cloned,
          body: null
        });
      } else return cloned;
    }
    return response;
  } catch (e3) {
    if (e3 instanceof Redirect) return new Response(void 0, {
      status: e3.status,
      headers: { location: e3.location }
    });
    throw e3;
  }
}
function is_endpoint_request(event) {
  const { method, headers: headers3 } = event.request;
  if (ENDPOINT_METHODS.includes(method) && !PAGE_METHODS.includes(method)) return true;
  if (method === "POST" && headers3.get("x-sveltekit-action") === "true") return false;
  return negotiate(event.request.headers.get("accept") ?? "*/*", ["*", "text/html"]) !== "text/html";
}
function compact(arr) {
  return arr.filter(
    /** @returns {val is NonNullable<T>} */
    (val) => val != null
  );
}
var DATA_SUFFIX = "/__data.json";
var HTML_DATA_SUFFIX = ".html__data.json";
function has_data_suffix2(pathname) {
  return pathname.endsWith(DATA_SUFFIX) || pathname.endsWith(HTML_DATA_SUFFIX);
}
function add_data_suffix2(pathname) {
  if (pathname.endsWith(".html")) return pathname.replace(/\.html$/, HTML_DATA_SUFFIX);
  return pathname.replace(/\/$/, "") + DATA_SUFFIX;
}
function strip_data_suffix2(pathname) {
  if (pathname.endsWith(HTML_DATA_SUFFIX)) return pathname.slice(0, -16) + ".html";
  return pathname.slice(0, -12);
}
var ROUTE_SUFFIX = "/__route.js";
function has_resolution_suffix2(pathname) {
  return pathname.endsWith(ROUTE_SUFFIX);
}
function add_resolution_suffix2(pathname) {
  return pathname.replace(/\/$/, "") + ROUTE_SUFFIX;
}
function strip_resolution_suffix2(pathname) {
  return pathname.slice(0, -11);
}
var noop_span = {
  spanContext() {
    return noop_span_context;
  },
  setAttribute() {
    return this;
  },
  setAttributes() {
    return this;
  },
  addEvent() {
    return this;
  },
  setStatus() {
    return this;
  },
  updateName() {
    return this;
  },
  end() {
    return this;
  },
  isRecording() {
    return false;
  },
  recordException() {
    return this;
  },
  addLink() {
    return this;
  },
  addLinks() {
    return this;
  }
};
var noop_span_context = {
  traceId: "",
  spanId: "",
  traceFlags: 0
};
async function record_span({ name, attributes: attributes2, fn }) {
  return fn(noop_span);
}
function is_action_json_request(event) {
  return negotiate(event.request.headers.get("accept") ?? "*/*", ["application/json", "text/html"]) === "application/json" && event.request.method === "POST";
}
async function handle_action_json_request(event, event_state, options2, server2) {
  const actions2 = server2?.actions;
  if (!actions2) {
    const no_actions_error = new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`);
    return action_json({
      type: "error",
      error: await handle_error_and_jsonify(event, event_state, options2, no_actions_error)
    }, {
      status: no_actions_error.status,
      headers: { allow: "GET" }
    });
  }
  check_named_default_separate(actions2);
  try {
    const data = await call_action(event, event_state, actions2);
    if (data instanceof ActionFailure) return action_json({
      type: "failure",
      status: data.status,
      data: stringify_action_response(data.data, event.route.id, options2.hooks.transport)
    });
    else return action_json({
      type: "success",
      status: data ? 200 : 204,
      data: stringify_action_response(data, event.route.id, options2.hooks.transport)
    });
  } catch (e3) {
    const err = normalize_error(e3);
    if (err instanceof Redirect) return action_json_redirect(err);
    return action_json({
      type: "error",
      error: await handle_error_and_jsonify(event, event_state, options2, check_incorrect_fail_use(err))
    }, { status: get_status(err) });
  }
}
function check_incorrect_fail_use(error2) {
  return error2 instanceof ActionFailure ? /* @__PURE__ */ new Error('Cannot "throw fail()". Use "return fail()"') : error2;
}
function action_json_redirect(redirect2) {
  return action_json({
    type: "redirect",
    status: redirect2.status,
    location: redirect2.location
  });
}
function action_json(data, init2) {
  return json(data, init2);
}
function is_action_request(event) {
  return event.request.method === "POST";
}
async function handle_action_request(event, event_state, server2) {
  const actions2 = server2?.actions;
  if (!actions2) {
    event.setHeaders({ allow: "GET" });
    return {
      type: "error",
      error: new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`)
    };
  }
  check_named_default_separate(actions2);
  try {
    const data = await call_action(event, event_state, actions2);
    if (data instanceof ActionFailure) return {
      type: "failure",
      status: data.status,
      data: data.data
    };
    else return {
      type: "success",
      status: 200,
      data
    };
  } catch (e3) {
    const err = normalize_error(e3);
    if (err instanceof Redirect) return {
      type: "redirect",
      status: err.status,
      location: err.location
    };
    return {
      type: "error",
      error: check_incorrect_fail_use(err)
    };
  }
}
function check_named_default_separate(actions2) {
  if (actions2.default && Object.keys(actions2).length > 1) throw new Error("When using named actions, the default action cannot be used. See the docs for more info: https://svelte.dev/docs/kit/form-actions#named-actions");
}
async function call_action(event, event_state, actions2) {
  const url = new URL(event.request.url);
  let name = "default";
  for (const param of url.searchParams) if (param[0].startsWith("/")) {
    name = param[0].slice(1);
    if (name === "default") throw new Error('Cannot use reserved action name "default"');
    break;
  }
  const action = actions2[name];
  if (!action) throw new SvelteKitError(404, "Not Found", `No action with name '${name}' found`);
  if (!is_form_content_type(event.request)) throw new SvelteKitError(415, "Unsupported Media Type", `Form actions expect form-encoded data \u2014 received ${event.request.headers.get("content-type")}`);
  return record_span({
    name: "sveltekit.form_action",
    attributes: {
      "sveltekit.form_action.name": name,
      "http.route": event.route.id || "unknown"
    },
    fn: async (current2) => {
      const traced_event = merge_tracing(event, current2);
      const result = await with_request_store({
        event: traced_event,
        state: event_state
      }, () => action(traced_event));
      if (result instanceof ActionFailure) current2.setAttributes({
        "sveltekit.form_action.result.type": "failure",
        "sveltekit.form_action.result.status": result.status
      });
      return result;
    }
  });
}
function uneval_action_response(data, route_id, transport) {
  const replacer = create_replacer(transport);
  return try_serialize(data, (value) => uneval(value, replacer), route_id);
}
function stringify_action_response(data, route_id, transport) {
  const encoders = Object.fromEntries(Object.entries(transport).map(([key2, value]) => [key2, value.encode]));
  return try_serialize(data, (value) => stringify(value, encoders), route_id);
}
function try_serialize(data, fn, route_id) {
  try {
    return fn(data);
  } catch (e3) {
    const error2 = e3;
    if (data instanceof Response) throw new Error(`Data returned from action inside ${route_id} is not serializable. Form actions need to return plain objects or fail(). E.g. return { success: true } or return fail(400, { message: "invalid" });`, { cause: e3 });
    if ("path" in error2) {
      let message = `Data returned from action inside ${route_id} is not serializable: ${error2.message}`;
      if (error2.path !== "") message += ` (data.${error2.path})`;
      throw new Error(message, { cause: e3 });
    }
    throw error2;
  }
}
function create_async_iterator() {
  let resolved = -1;
  let returned = -1;
  const deferred2 = [];
  return {
    iterate: (transform = (x) => x) => {
      return { [Symbol.asyncIterator]() {
        return { next: async () => {
          const next2 = deferred2[++returned];
          if (!next2) return {
            value: null,
            done: true
          };
          return {
            value: transform(await next2.promise),
            done: false
          };
        } };
      } };
    },
    add: (promise) => {
      const next2 = with_resolvers();
      next2.promise.catch(noop2);
      deferred2.push(next2);
      promise.then((value) => {
        deferred2[++resolved].resolve(value);
      }, (error2) => {
        deferred2[++resolved].reject(error2);
      });
    }
  };
}
function server_data_serializer(event, event_state, options2) {
  let promise_id = 1;
  let max_nodes = -1;
  const iterator = create_async_iterator();
  const global = get_global_name(options2);
  function get_replacer(index17) {
    return function replacer(thing) {
      if (typeof thing?.then === "function") {
        const id = promise_id++;
        const promise = thing.then(
          /** @param {any} data */
          (data) => ({ data })
        ).catch(
          /** @param {any} error */
          async (error2) => ({ error: await handle_error_and_jsonify(event, event_state, options2, error2) })
        ).then(
          /**
          * @param {{data: any; error: any}} result
          */
          async ({ data, error: error2 }) => {
            let str;
            try {
              str = uneval(error2 ? [, error2] : [data], replacer);
            } catch {
              error2 = await handle_error_and_jsonify(event, event_state, options2, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
              str = uneval([, error2], replacer);
            }
            return {
              index: index17,
              str: `${global}.resolve(${id}, ${str.includes("app.decode") ? `(app) => ${str}` : `() => ${str}`})`
            };
          }
        );
        iterator.add(promise);
        return `${global}.defer(${id})`;
      } else for (const key2 in options2.hooks.transport) {
        const encoded = options2.hooks.transport[key2].encode(thing);
        if (encoded) return `app.decode('${key2}', ${uneval(encoded, replacer)})`;
      }
    };
  }
  const strings = [];
  return {
    set_max_nodes(i) {
      max_nodes = i;
    },
    add_node(i, node) {
      try {
        if (!node) {
          strings[i] = "null";
          return;
        }
        const payload2 = {
          type: "data",
          data: node.data,
          uses: serialize_uses(node)
        };
        if (node.slash) payload2.slash = node.slash;
        strings[i] = uneval(payload2, get_replacer(i));
      } catch (e3) {
        e3.path = e3.path.slice(1);
        throw new Error(clarify_devalue_error(event, e3), { cause: e3 });
      }
    },
    get_data(csp) {
      const open = `<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>`;
      const close = `<\/script>
`;
      return {
        data: `[${compact(max_nodes > -1 ? strings.slice(0, max_nodes) : strings).join(",")}]`,
        chunks: promise_id > 1 ? iterator.iterate(({ index: index17, str }) => {
          if (max_nodes > -1 && index17 >= max_nodes) return "";
          return open + str + close;
        }) : null
      };
    }
  };
}
function server_data_serializer_json(event, event_state, options2) {
  let promise_id = 1;
  const iterator = create_async_iterator();
  const reducers = {
    ...Object.fromEntries(Object.entries(options2.hooks.transport).map(([key2, value]) => [key2, value.encode])),
    /** @param {any} thing */
    Promise: (thing) => {
      if (typeof thing?.then !== "function") return;
      const id = promise_id++;
      let key2 = "data";
      const promise = thing.catch(
        /** @param {any} e */
        async (e3) => {
          key2 = "error";
          return handle_error_and_jsonify(event, event_state, options2, e3);
        }
      ).then(
        /** @param {any} value */
        async (value) => {
          let str;
          try {
            str = stringify(value, reducers);
          } catch {
            const error2 = await handle_error_and_jsonify(event, event_state, options2, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
            key2 = "error";
            str = stringify(error2, reducers);
          }
          return `{"type":"chunk","id":${id},"${key2}":${str}}
`;
        }
      );
      iterator.add(promise);
      return id;
    }
  };
  const strings = [];
  return {
    add_node(i, node) {
      try {
        if (!node) {
          strings[i] = "null";
          return;
        }
        if (node.type === "error" || node.type === "skip") {
          strings[i] = JSON.stringify(node);
          return;
        }
        strings[i] = `{"type":"data","data":${stringify(node.data, reducers)},"uses":${JSON.stringify(serialize_uses(node))}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
      } catch (e3) {
        e3.path = "data" + e3.path;
        throw new Error(clarify_devalue_error(event, e3), { cause: e3 });
      }
    },
    get_data() {
      return {
        data: `{"type":"data","nodes":[${strings.join(",")}]}
`,
        chunks: promise_id > 1 ? iterator.iterate() : null
      };
    }
  };
}
async function load_server_data({ event, event_state, state: state2, node, parent }) {
  if (!node?.server) return null;
  let is_tracking = true;
  const uses = {
    dependencies: /* @__PURE__ */ new Set(),
    params: /* @__PURE__ */ new Set(),
    parent: false,
    route: false,
    url: false,
    search_params: /* @__PURE__ */ new Set()
  };
  const load6 = node.server.load;
  const slash = node.server.trailingSlash;
  if (!load6) return {
    type: "data",
    data: null,
    uses,
    slash
  };
  const url = make_trackable(event.url, () => {
    if (is_tracking) uses.url = true;
  }, (param) => {
    if (is_tracking) uses.search_params.add(param);
  });
  if (state2.prerendering) disable_search(url);
  return {
    type: "data",
    data: await record_span({
      name: "sveltekit.load",
      attributes: {
        "sveltekit.load.node_id": node.server_id || "unknown",
        "sveltekit.load.node_type": get_node_type(node.server_id),
        "sveltekit.load.environment": "server",
        "http.route": event.route.id || "unknown"
      },
      fn: async (current2) => {
        const traced_event = merge_tracing(event, current2);
        return await with_request_store({
          event: traced_event,
          state: event_state
        }, () => load6.call(null, {
          ...traced_event,
          fetch: (info, init2) => {
            new URL(info instanceof Request ? info.url : info, event.url);
            return event.fetch(info, init2);
          },
          /** @param {string[]} deps */
          depends: (...deps) => {
            for (const dep of deps) {
              const { href } = new URL(dep, event.url);
              uses.dependencies.add(href);
            }
          },
          params: new Proxy(event.params, { get: (target, key2) => {
            if (is_tracking) uses.params.add(key2);
            return target[key2];
          } }),
          parent: async () => {
            if (is_tracking) uses.parent = true;
            return parent();
          },
          route: new Proxy(event.route, { get: (target, key2) => {
            if (is_tracking) uses.route = true;
            return target[key2];
          } }),
          url,
          untrack(fn) {
            is_tracking = false;
            try {
              return fn();
            } finally {
              is_tracking = true;
            }
          }
        }));
      }
    }) ?? null,
    uses,
    slash
  };
}
async function load_data({ event, event_state, fetched, node, parent, server_data_promise, state: state2, resolve_opts, csr }) {
  const server_data_node = await server_data_promise;
  const load6 = node?.universal?.load;
  if (!load6) return server_data_node?.data ?? null;
  return await record_span({
    name: "sveltekit.load",
    attributes: {
      "sveltekit.load.node_id": node.universal_id || "unknown",
      "sveltekit.load.node_type": get_node_type(node.universal_id),
      "sveltekit.load.environment": "server",
      "http.route": event.route.id || "unknown"
    },
    fn: async (current2) => {
      const traced_event = merge_tracing(event, current2);
      return await with_request_store({
        event: traced_event,
        state: {
          ...event_state,
          is_in_universal_load: true
        }
      }, () => load6.call(null, {
        url: event.url,
        params: event.params,
        data: server_data_node?.data ?? null,
        route: event.route,
        fetch: create_universal_fetch(event, state2, fetched, csr, resolve_opts),
        setHeaders: event.setHeaders,
        depends: noop2,
        parent,
        untrack: (fn) => fn(),
        tracing: traced_event.tracing
      }));
    }
  }) ?? null;
}
function create_universal_fetch(event, state2, fetched, csr, resolve_opts) {
  const universal_fetch = async (input, init2) => {
    const cloned_body = input instanceof Request && input.body ? input.clone().body : null;
    const cloned_headers = input instanceof Request && [...input.headers].length ? new Headers(input.headers) : init2?.headers;
    let response = await event.fetch(input, init2);
    const url = new URL(input instanceof Request ? input.url : input, event.url);
    const same_origin = url.origin === event.url.origin;
    let dependency;
    if (same_origin) {
      if (state2.prerendering) {
        dependency = {
          response,
          body: null
        };
        state2.prerendering.dependencies.set(url.pathname, dependency);
      }
    } else if (url.protocol === "https:" || url.protocol === "http:") if ((input instanceof Request ? input.mode : init2?.mode ?? "cors") === "no-cors") response = new Response("", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    else {
      const acao = response.headers.get("access-control-allow-origin");
      if (!acao || acao !== event.url.origin && acao !== "*") throw new Error(`CORS error: ${acao ? "Incorrect" : "No"} 'Access-Control-Allow-Origin' header is present on the requested resource`);
    }
    let teed_body;
    const proxy2 = new Proxy(response, { get(response2, key2, receiver) {
      async function push_fetched(body, is_b64) {
        const status_number = Number(response2.status);
        if (isNaN(status_number)) throw new Error(`response.status is not a number. value: "${response2.status}" type: ${typeof response2.status}`);
        fetched.push({
          url: same_origin ? url.href.slice(event.url.origin.length) : url.href,
          method: event.request.method,
          request_body: input instanceof Request && cloned_body ? await stream_to_string(cloned_body) : init2?.body,
          request_headers: cloned_headers,
          response_body: body,
          response: response2,
          is_b64
        });
      }
      if (key2 === "body") {
        if (response2.body === null) return null;
        if (teed_body) return teed_body;
        const [a, b] = response2.body.tee();
        (async () => {
          let result = /* @__PURE__ */ new Uint8Array();
          for await (const chunk of a) {
            const combined = new Uint8Array(result.length + chunk.length);
            combined.set(result, 0);
            combined.set(chunk, result.length);
            result = combined;
          }
          if (dependency) dependency.body = new Uint8Array(result);
          push_fetched(base64_encode2(result), true);
        })().catch(noop2);
        return teed_body = b;
      }
      if (key2 === "arrayBuffer") return async () => {
        const buffer2 = await response2.arrayBuffer();
        const bytes2 = new Uint8Array(buffer2);
        if (dependency) dependency.body = bytes2;
        if (buffer2 instanceof ArrayBuffer) await push_fetched(base64_encode2(bytes2), true);
        return buffer2;
      };
      async function text2() {
        const body = await response2.text();
        if (body === "" && NULL_BODY_STATUS.includes(response2.status)) {
          await push_fetched(void 0, false);
          return;
        }
        if (!body || typeof body === "string") await push_fetched(body, false);
        if (dependency) dependency.body = body;
        return body;
      }
      if (key2 === "text") return text2;
      if (key2 === "json") return async () => {
        const body = await text2();
        return body ? JSON.parse(body) : void 0;
      };
      const value = Reflect.get(response2, key2, response2);
      if (value instanceof Function) return Object.defineProperties(
        /**
        * @this {any}
        */
        function() {
          return Reflect.apply(value, this === receiver ? response2 : this, arguments);
        },
        {
          name: { value: value.name },
          length: { value: value.length }
        }
      );
      return value;
    } });
    if (csr) {
      const get2 = response.headers.get;
      response.headers.get = (key2) => {
        const lower = key2.toLowerCase();
        const value = get2.call(response.headers, lower);
        if (value && !lower.startsWith("x-sveltekit-")) {
          if (!resolve_opts.filterSerializedResponseHeaders(lower, value)) throw new Error(`Failed to get response header "${lower}" \u2014 it must be included by the \`filterSerializedResponseHeaders\` option: https://svelte.dev/docs/kit/hooks#Server-hooks-handle (at ${event.route.id})`);
        }
        return value;
      };
    }
    return proxy2;
  };
  return (input, init2) => {
    const response = universal_fetch(input, init2);
    response.catch(noop2);
    return response;
  };
}
async function stream_to_string(stream) {
  let result = "";
  const reader = stream.getReader();
  const decoder2 = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      result += decoder2.decode();
      break;
    }
    result += decoder2.decode(value, { stream: true });
  }
  return result;
}
var replacements2 = {
  "<": "\\u003C",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var pattern = new RegExp(`[${Object.keys(replacements2).join("")}]`, "g");
function serialize_data(fetched, filter, prerendering = false) {
  const headers3 = {};
  let cache_control = null;
  let age = null;
  let varyAny = false;
  for (const [key2, value] of fetched.response.headers) {
    if (filter(key2, value)) headers3[key2] = value;
    if (key2 === "cache-control") cache_control = value;
    else if (key2 === "age") age = value;
    else if (key2 === "vary" && value.trim() === "*") varyAny = true;
  }
  const payload2 = {
    status: fetched.response.status,
    statusText: fetched.response.statusText,
    headers: headers3,
    body: fetched.response_body
  };
  const safe_payload = JSON.stringify(payload2).replace(pattern, (match) => replacements2[match]);
  const attrs = [
    'type="application/json"',
    "data-sveltekit-fetched",
    `data-url="${escape_html2(fetched.url, true)}"`
  ];
  if (fetched.is_b64) attrs.push("data-b64");
  if (fetched.request_headers || fetched.request_body) {
    const values = [];
    if (fetched.request_headers) values.push([...new Headers(fetched.request_headers)].join(","));
    if (fetched.request_body) values.push(fetched.request_body);
    attrs.push(`data-hash="${hash(...values)}"`);
  }
  if (!prerendering && fetched.method === "GET" && cache_control && !varyAny) {
    const match = /s-maxage=(\d+)/g.exec(cache_control) ?? /max-age=(\d+)/g.exec(cache_control);
    if (match) {
      const ttl = +match[1] - +(age ?? "0");
      attrs.push(`data-ttl="${ttl}"`);
    }
  }
  return `<script ${attrs.join(" ")}>${safe_payload}<\/script>`;
}
function sha2562(data) {
  if (!key[0]) precompute();
  const out = init.slice(0);
  const array2 = encode2(data);
  for (let i = 0; i < array2.length; i += 16) {
    const w = array2.subarray(i, i + 16);
    let tmp;
    let a;
    let b;
    let out0 = out[0];
    let out1 = out[1];
    let out2 = out[2];
    let out3 = out[3];
    let out4 = out[4];
    let out5 = out[5];
    let out6 = out[6];
    let out7 = out[7];
    for (let i2 = 0; i2 < 64; i2++) {
      if (i2 < 16) tmp = w[i2];
      else {
        a = w[i2 + 1 & 15];
        b = w[i2 + 14 & 15];
        tmp = w[i2 & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i2 & 15] + w[i2 + 9 & 15] | 0;
      }
      tmp = tmp + out7 + (out4 >>> 6 ^ out4 >>> 11 ^ out4 >>> 25 ^ out4 << 26 ^ out4 << 21 ^ out4 << 7) + (out6 ^ out4 & (out5 ^ out6)) + key[i2];
      out7 = out6;
      out6 = out5;
      out5 = out4;
      out4 = out3 + tmp | 0;
      out3 = out2;
      out2 = out1;
      out1 = out0;
      out0 = tmp + (out1 & out2 ^ out3 & (out1 ^ out2)) + (out1 >>> 2 ^ out1 >>> 13 ^ out1 >>> 22 ^ out1 << 30 ^ out1 << 19 ^ out1 << 10) | 0;
    }
    out[0] = out[0] + out0 | 0;
    out[1] = out[1] + out1 | 0;
    out[2] = out[2] + out2 | 0;
    out[3] = out[3] + out3 | 0;
    out[4] = out[4] + out4 | 0;
    out[5] = out[5] + out5 | 0;
    out[6] = out[6] + out6 | 0;
    out[7] = out[7] + out7 | 0;
  }
  const bytes2 = new Uint8Array(out.buffer);
  reverse_endianness(bytes2);
  return btoa(String.fromCharCode(...bytes2));
}
var init = /* @__PURE__ */ new Uint32Array(8);
var key = /* @__PURE__ */ new Uint32Array(64);
function precompute() {
  function frac(x) {
    return (x - Math.floor(x)) * 4294967296;
  }
  let prime = 2;
  for (let i = 0; i < 64; prime++) {
    let is_prime = true;
    for (let factor = 2; factor * factor <= prime; factor++) if (prime % factor === 0) {
      is_prime = false;
      break;
    }
    if (is_prime) {
      if (i < 8) init[i] = frac(prime ** (1 / 2));
      key[i] = frac(prime ** (1 / 3));
      i++;
    }
  }
}
function reverse_endianness(bytes2) {
  for (let i = 0; i < bytes2.length; i += 4) {
    const a = bytes2[i + 0];
    const b = bytes2[i + 1];
    const c2 = bytes2[i + 2];
    const d = bytes2[i + 3];
    bytes2[i + 0] = d;
    bytes2[i + 1] = c2;
    bytes2[i + 2] = b;
    bytes2[i + 3] = a;
  }
}
function encode2(str) {
  const encoded = text_encoder3.encode(str);
  const length = encoded.length * 8;
  const size = 512 * Math.ceil((length + 65) / 512);
  const bytes2 = new Uint8Array(size / 8);
  bytes2.set(encoded);
  bytes2[encoded.length] = 128;
  reverse_endianness(bytes2);
  const words = new Uint32Array(bytes2.buffer);
  words[words.length - 2] = Math.floor(length / 4294967296);
  words[words.length - 1] = length;
  return words;
}
var array = /* @__PURE__ */ new Uint8Array(16);
function generate_nonce() {
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}
var quoted = /* @__PURE__ */ new Set([
  "self",
  "unsafe-eval",
  "unsafe-hashes",
  "unsafe-inline",
  "none",
  "strict-dynamic",
  "report-sample",
  "wasm-unsafe-eval",
  "script"
]);
var crypto_pattern = /^(nonce|sha\d\d\d)-/;
var BaseProvider = class {
  /** @type {boolean} */
  #use_hashes;
  /** @type {boolean} */
  #script_needs_csp;
  /** @type {boolean} */
  #script_src_needs_csp;
  /** @type {boolean} */
  #script_src_elem_needs_csp;
  /** @type {boolean} */
  #style_needs_csp;
  /** @type {boolean} */
  #style_src_needs_csp;
  /** @type {boolean} */
  #style_src_attr_needs_csp;
  /** @type {boolean} */
  #style_src_elem_needs_csp;
  /** @type {import('types').CspDirectives} */
  #directives;
  /** @type {Set<import('types').Csp.Source>} */
  #script_src;
  /** @type {Set<import('types').Csp.Source>} */
  #script_src_elem;
  /** @type {Set<import('types').Csp.Source>} */
  #style_src;
  /** @type {Set<import('types').Csp.Source>} */
  #style_src_attr;
  /** @type {Set<import('types').Csp.Source>} */
  #style_src_elem;
  /** @type {boolean} */
  script_needs_nonce;
  /** @type {boolean} */
  style_needs_nonce;
  /** @type {boolean} */
  script_needs_hash;
  /** @type {string} */
  #nonce;
  /**
  * @param {boolean} use_hashes
  * @param {import('types').CspDirectives} directives
  * @param {string} nonce
  */
  constructor(use_hashes, directives, nonce) {
    this.#use_hashes = use_hashes;
    this.#directives = directives;
    const d = this.#directives;
    this.#script_src = /* @__PURE__ */ new Set();
    this.#script_src_elem = /* @__PURE__ */ new Set();
    this.#style_src = /* @__PURE__ */ new Set();
    this.#style_src_attr = /* @__PURE__ */ new Set();
    this.#style_src_elem = /* @__PURE__ */ new Set();
    const effective_script_src = d["script-src"] || d["default-src"];
    const script_src_elem = d["script-src-elem"];
    const effective_style_src = d["style-src"] || d["default-src"];
    const style_src_attr = d["style-src-attr"];
    const style_src_elem = d["style-src-elem"];
    const style_needs_csp = (directive) => !!directive && !directive.some((value) => value === "unsafe-inline");
    const script_needs_csp = (directive) => !!directive && (!directive.some((value) => value === "unsafe-inline") || directive.some((value) => value === "strict-dynamic"));
    this.#script_src_needs_csp = script_needs_csp(effective_script_src);
    this.#script_src_elem_needs_csp = script_needs_csp(script_src_elem);
    this.#style_src_needs_csp = style_needs_csp(effective_style_src);
    this.#style_src_attr_needs_csp = style_needs_csp(style_src_attr);
    this.#style_src_elem_needs_csp = style_needs_csp(style_src_elem);
    this.#script_needs_csp = this.#script_src_needs_csp || this.#script_src_elem_needs_csp;
    this.#style_needs_csp = this.#style_src_needs_csp || this.#style_src_attr_needs_csp || this.#style_src_elem_needs_csp;
    this.script_needs_nonce = this.#script_needs_csp && !this.#use_hashes;
    this.style_needs_nonce = this.#style_needs_csp && !this.#use_hashes;
    this.script_needs_hash = this.#script_needs_csp && this.#use_hashes;
    this.#nonce = nonce;
  }
  /** @param {string} content */
  add_script(content) {
    if (!this.#script_needs_csp) return;
    const source2 = this.#use_hashes ? `sha256-${sha2562(content)}` : `nonce-${this.#nonce}`;
    if (this.#script_src_needs_csp) this.#script_src.add(source2);
    if (this.#script_src_elem_needs_csp) this.#script_src_elem.add(source2);
  }
  /** @param {`sha256-${string}`[]} hashes */
  add_script_hashes(hashes) {
    for (const hash2 of hashes) {
      if (this.#script_src_needs_csp) this.#script_src.add(hash2);
      if (this.#script_src_elem_needs_csp) this.#script_src_elem.add(hash2);
    }
  }
  /** @param {string} content */
  add_style(content) {
    if (!this.#style_needs_csp) return;
    const source2 = this.#use_hashes ? `sha256-${sha2562(content)}` : `nonce-${this.#nonce}`;
    if (this.#style_src_needs_csp) this.#style_src.add(source2);
    if (this.#style_src_attr_needs_csp) this.#style_src_attr.add(source2);
    if (this.#style_src_elem_needs_csp) {
      const sha256_empty_comment_hash = "sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=";
      const d = this.#directives;
      if (d["style-src-elem"] && !d["style-src-elem"].includes(sha256_empty_comment_hash) && !this.#style_src_elem.has(sha256_empty_comment_hash)) this.#style_src_elem.add(sha256_empty_comment_hash);
      if (source2 !== sha256_empty_comment_hash) this.#style_src_elem.add(source2);
    }
  }
  /**
  * @param {boolean} [is_meta]
  */
  get_header(is_meta = false) {
    const header = [];
    const directives = { ...this.#directives };
    if (this.#style_src.size > 0) directives["style-src"] = [...directives["style-src"] || directives["default-src"] || [], ...this.#style_src];
    if (this.#style_src_attr.size > 0) directives["style-src-attr"] = [...directives["style-src-attr"] || [], ...this.#style_src_attr];
    if (this.#style_src_elem.size > 0) directives["style-src-elem"] = [...directives["style-src-elem"] || [], ...this.#style_src_elem];
    if (this.#script_src.size > 0) directives["script-src"] = [...directives["script-src"] || directives["default-src"] || [], ...this.#script_src];
    if (this.#script_src_elem.size > 0) directives["script-src-elem"] = [...directives["script-src-elem"] || [], ...this.#script_src_elem];
    for (const key2 in directives) {
      if (is_meta && (key2 === "frame-ancestors" || key2 === "report-uri" || key2 === "sandbox")) continue;
      const value = directives[key2];
      if (!value) continue;
      const directive = [key2];
      if (Array.isArray(value)) value.forEach((value2) => {
        if (quoted.has(value2) || crypto_pattern.test(value2)) directive.push(`'${value2}'`);
        else directive.push(value2);
      });
      header.push(directive.join(" "));
    }
    return header.join("; ");
  }
};
var CspProvider = class extends BaseProvider {
  get_meta() {
    const content = this.get_header(true);
    if (!content) return;
    return `<meta http-equiv="content-security-policy" content="${escape_html2(content, true)}">`;
  }
};
var CspReportOnlyProvider = class extends BaseProvider {
  /**
  * @param {boolean} use_hashes
  * @param {import('types').CspDirectives} directives
  * @param {string} nonce
  */
  constructor(use_hashes, directives, nonce) {
    super(use_hashes, directives, nonce);
    if (Object.values(directives).filter((v) => !!v).length > 0) {
      const has_report_to = directives["report-to"]?.length ?? false;
      const has_report_uri = directives["report-uri"]?.length ?? false;
      if (!has_report_to && !has_report_uri) throw Error("`content-security-policy-report-only` must be specified with either the `report-to` or `report-uri` directives, or both");
    }
  }
};
var Csp = class {
  /** @readonly */
  nonce = generate_nonce();
  /** @type {CspProvider} */
  csp_provider;
  /** @type {CspReportOnlyProvider} */
  report_only_provider;
  /**
  * @param {import('./types.js').CspConfig} config
  * @param {import('./types.js').CspOpts} opts
  */
  constructor({ mode, directives, reportOnly }, { prerender }) {
    const use_hashes = mode === "hash" || mode === "auto" && prerender;
    this.csp_provider = new CspProvider(use_hashes, directives, this.nonce);
    this.report_only_provider = new CspReportOnlyProvider(use_hashes, reportOnly, this.nonce);
  }
  get script_needs_hash() {
    return this.csp_provider.script_needs_hash || this.report_only_provider.script_needs_hash;
  }
  get script_needs_nonce() {
    return this.csp_provider.script_needs_nonce || this.report_only_provider.script_needs_nonce;
  }
  get style_needs_nonce() {
    return this.csp_provider.style_needs_nonce || this.report_only_provider.style_needs_nonce;
  }
  /** @param {string} content */
  add_script(content) {
    this.csp_provider.add_script(content);
    this.report_only_provider.add_script(content);
  }
  /** @param {`sha256-${string}`[]} hashes */
  add_script_hashes(hashes) {
    this.csp_provider.add_script_hashes(hashes);
    this.report_only_provider.add_script_hashes(hashes);
  }
  /** @param {string} content */
  add_style(content) {
    this.csp_provider.add_style(content);
    this.report_only_provider.add_style(content);
  }
};
function generate_route_object(route, url, client) {
  const { errors, layouts, leaf } = route;
  const nodes = [
    ...errors,
    ...layouts.map((l) => l?.[1]),
    leaf[1]
  ].filter((n2) => typeof n2 === "number").map((n2) => `'${n2}': () => ${create_client_import(client.nodes?.[n2], url)}`).join(",\n		");
  return [
    `{
	id: ${s(route.id)}`,
    `errors: ${s(route.errors)}`,
    `layouts: ${s(route.layouts)}`,
    `leaf: ${s(route.leaf)}`,
    `nodes: {
		${nodes}
	}
}`
  ].join(",\n	");
}
function create_client_import(import_path, url) {
  if (!import_path) return "Promise.resolve({})";
  if (import_path[0] === "/") return `import('${import_path}')`;
  if (assets !== "") return `import('${assets}/${import_path}')`;
  let path = get_relative_path(url.pathname, `${base}/${import_path}`);
  if (path[0] !== ".") path = `./${path}`;
  return `import('${path}')`;
}
async function resolve_route(resolved_path, url, manifest2) {
  if (!manifest2._.client?.routes) return text("Server-side route resolution disabled", { status: 400 });
  const matchers = await manifest2._.matchers();
  const result = find_route(resolved_path, manifest2._.client.routes, matchers);
  return create_server_routing_response(result?.route ?? null, result?.params ?? {}, url, manifest2._.client).response;
}
function create_server_routing_response(route, params, url, client) {
  const headers3 = new Headers({ "content-type": "application/javascript; charset=utf-8" });
  if (route) {
    const csr_route = generate_route_object(route, url, client);
    const body = `${create_css_import(route, url, client)}
export const route = ${csr_route}; export const params = ${JSON.stringify(params)};`;
    return {
      response: text(body, { headers: headers3 }),
      body
    };
  } else return {
    response: text("", { headers: headers3 }),
    body: ""
  };
}
function create_css_import(route, url, client) {
  const { errors, layouts, leaf } = route;
  let css = "";
  for (const node of [
    ...errors,
    ...layouts.map((l) => l?.[1]),
    leaf[1]
  ]) {
    if (typeof node !== "number") continue;
    const node_css = client.css?.[node];
    for (const css_path of node_css ?? []) css += `'${assets || base}/${css_path}',`;
  }
  if (!css) return "";
  return `${create_client_import(client.start, url)}.then(x => x.load_css([${css}]));`;
}
async function handle_remote_call(event, state2, options2, manifest2, id) {
  return record_span({
    name: "sveltekit.remote.call",
    attributes: { "sveltekit.remote.call.id": id },
    fn: (current2) => {
      const traced_event = merge_tracing(event, current2);
      return with_request_store({
        event: traced_event,
        state: state2
      }, () => handle_remote_call_internal(traced_event, state2, options2, manifest2, id));
    }
  });
}
async function handle_remote_call_internal(event, state2, options2, manifest2, id) {
  const [hash2, name, additional_args] = id.split("/");
  const remotes = manifest2._.remotes;
  if (!remotes[hash2]) error(404);
  const fn = (await remotes[hash2]()).default[name];
  if (!fn) error(404);
  const internals = fn.__;
  const transport = options2.hooks.transport;
  event.tracing.current.setAttributes({
    "sveltekit.remote.call.type": internals.type,
    "sveltekit.remote.call.name": internals.name
  });
  const headers3 = state2.prerendering ? void 0 : { "cache-control": "private, no-store" };
  try {
    const data = {};
    switch (internals.type) {
      case "query_live": {
        let send = function(controller2, payload3) {
          controller2.enqueue(encoder.encode("data: " + JSON.stringify(payload3) + "\n\n"));
        };
        if (event.request.method !== "GET") throw new SvelteKitError(405, "Method Not Allowed", `\`query.live\` functions must be invoked via GET request, not ${event.request.method}`);
        const payload2 = new URL(event.request.url).searchParams.get("payload");
        const generator = internals.run(event, state2, parse_remote_arg(payload2, transport));
        const encoder = new TextEncoder();
        let closed = false;
        let result = void 0;
        async function cancel() {
          if (closed) return;
          closed = true;
          await generator.return(void 0);
        }
        event.request.signal.addEventListener("abort", cancel, { once: true });
        return new Response(new ReadableStream({
          async pull(controller2) {
            if (event.request.signal.aborted) {
              await cancel();
              controller2.close();
              return;
            }
            try {
              while (true) {
                const { value, done } = await generator.next();
                if (done) {
                  await cancel();
                  controller2.close();
                  return;
                }
                if (result !== (result = stringify2(value, transport))) {
                  send(controller2, {
                    type: "result",
                    result
                  });
                  return;
                }
              }
            } catch (error2) {
              if (!event.request.signal.aborted) if (error2 instanceof Redirect) send(controller2, {
                type: "redirect",
                location: error2.location
              });
              else {
                const status = error2 instanceof HttpError || error2 instanceof SvelteKitError ? error2.status : 500;
                send(controller2, {
                  type: "error",
                  error: await handle_error_and_jsonify(event, state2, options2, error2),
                  status
                });
              }
              await cancel();
              controller2.close();
            }
          },
          cancel
        }), { headers: {
          "cache-control": "private, no-store",
          "content-type": "text/event-stream"
        } });
      }
      case "query_batch": {
        if (event.request.method !== "POST") throw new SvelteKitError(405, "Method Not Allowed", `\`query.batch\` functions must be invoked via POST request, not ${event.request.method}`);
        const { payloads } = await event.request.json();
        const args = await Promise.all(payloads.map((payload2) => parse_remote_arg(payload2, transport)));
        data._ = await with_request_store({
          event,
          state: state2
        }, () => internals.run(args, options2));
        break;
      }
      case "form": {
        if (event.request.method !== "POST") throw new SvelteKitError(405, "Method Not Allowed", `\`form\` functions must be invoked via POST request, not ${event.request.method}`);
        if (!is_form_content_type(event.request)) throw new SvelteKitError(415, "Unsupported Media Type", `\`form\` functions expect form-encoded data \u2014 received ${event.request.headers.get("content-type")}`);
        const { data: input, meta, form_data } = await deserialize_binary_form(event.request);
        state2.remote.requested = create_requested_map(meta.remote_refreshes);
        if (additional_args && !("id" in input)) input.id = JSON.parse(decodeURIComponent(additional_args));
        const fn2 = internals.fn;
        data._ = await with_request_store({
          event,
          state: {
            ...state2,
            is_in_remote_form_or_command: true
          }
        }, () => fn2(input, meta, form_data));
        if (data._.issues) return json({
          type: "result",
          data: stringify2(data, transport)
        }, { headers: headers3 });
        break;
      }
      case "command": {
        const { payload: payload2, refreshes } = await event.request.json();
        state2.remote.requested = create_requested_map(refreshes);
        const arg = parse_remote_arg(payload2, transport);
        data._ = await with_request_store({
          event,
          state: {
            ...state2,
            is_in_remote_form_or_command: true
          }
        }, () => fn(arg));
        break;
      }
      case "prerender":
        data._ = await with_request_store({
          event,
          state: state2
        }, () => fn(parse_remote_arg(additional_args, transport)));
        break;
      case "query": {
        const payload2 = new URL(event.request.url).searchParams.get("payload");
        data._ = await with_request_store({
          event,
          state: state2
        }, () => fn(parse_remote_arg(payload2, transport)));
        break;
      }
    }
    await collect_remote_data(data, event, state2, options2);
    return json({
      type: "result",
      data: stringify2(data, transport)
    }, { headers: headers3 });
  } catch (error2) {
    if (error2 instanceof Redirect) return json({
      type: "result",
      data: stringify2(await collect_remote_data({ redirect: error2.location }, event, state2, options2), transport)
    }, { headers: headers3 });
    const status = error2 instanceof HttpError || error2 instanceof SvelteKitError ? error2.status : 500;
    return json({
      type: "error",
      error: await handle_error_and_jsonify(event, state2, options2, error2),
      status
    }, {
      status: state2.prerendering ? status : void 0,
      headers: { "cache-control": "private, no-store" }
    });
  }
}
async function collect_remote_data(data, event, state2, options2) {
  async function convert_error(error2) {
    return [error2 instanceof HttpError || error2 instanceof SvelteKitError ? error2.status : 500, await handle_error_and_jsonify(event, state2, options2, error2)];
  }
  const promises = [];
  if (state2.remote.explicit) for (const [remote_key, { internals, promise }] of state2.remote.explicit) {
    data.r = true;
    const type = internals.type === "query_live" ? "l" : internals.type[0];
    await promise.then((v) => {
      ((data[type] ??= {})[remote_key] ??= {}).v = v;
    }, async (e3) => {
      if (e3 instanceof Redirect) return;
      ((data[type] ??= {})[remote_key] ??= {}).e = await convert_error(e3);
    });
  }
  await Promise.all(promises);
  if (state2.remote.implicit) for (const [internals, record] of state2.remote.implicit) {
    if (!internals.id) continue;
    for (const key2 in record) {
      const remote_key = internals.type === "form" ? key2 : create_remote_key(internals.id, key2);
      const type = internals.type === "query_live" ? "l" : internals.type[0];
      const promise = state2.remote.data?.get(internals)?.[key2] ?? record[key2]();
      let resolved = true;
      await Promise.race([Promise.resolve(promise).then((v) => {
        if (resolved) ((data[type] ??= {})[remote_key] ??= {}).v = v;
      }, (e3) => {
        if (e3 instanceof Redirect) return;
        if (resolved) promises.push(convert_error(e3).then((e4) => {
          ((data[type] ??= {})[remote_key] ??= {}).e = e4;
        }));
      }), Promise.resolve().then(() => resolved = false)]);
    }
  }
  await Promise.all(promises);
  return data;
}
function create_requested_map(refreshes) {
  const requested = /* @__PURE__ */ new Map();
  for (const key2 of refreshes ?? []) {
    const parts = split_remote_key(key2);
    const existing = requested.get(parts.id);
    if (existing) existing.push(parts.payload);
    else requested.set(parts.id, [parts.payload]);
  }
  return requested;
}
async function handle_remote_form_post(event, state2, manifest2, id) {
  return record_span({
    name: "sveltekit.remote.form.post",
    attributes: { "sveltekit.remote.form.post.id": id },
    fn: (current2) => {
      const traced_event = merge_tracing(event, current2);
      return with_request_store({
        event: traced_event,
        state: state2
      }, () => handle_remote_form_post_internal(traced_event, state2, manifest2, id));
    }
  });
}
async function handle_remote_form_post_internal(event, state2, manifest2, id) {
  const [hash2, name, ...rest] = id.split("/");
  const action_id = rest.join("/");
  let form = (await manifest2._.remotes[hash2]?.())?.default[name];
  if (!form) {
    event.setHeaders({ allow: "GET" });
    return {
      type: "error",
      error: new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`)
    };
  }
  if (action_id) form = with_request_store({
    event,
    state: state2
  }, () => form.for(JSON.parse(action_id)));
  try {
    const fn = form.__.fn;
    const { data, meta, form_data } = await deserialize_binary_form(event.request);
    if (action_id && !("id" in data)) data.id = JSON.parse(decodeURIComponent(action_id));
    await with_request_store({
      event,
      state: {
        ...state2,
        is_in_remote_form_or_command: true
      }
    }, () => fn(data, meta, form_data));
    return {
      type: "success",
      status: 200
    };
  } catch (e3) {
    const err = normalize_error(e3);
    if (err instanceof Redirect) return {
      type: "redirect",
      status: err.status,
      location: err.location
    };
    return {
      type: "error",
      error: check_incorrect_fail_use(err)
    };
  }
}
function get_remote_id(url) {
  return url.pathname.startsWith(`${base}/_app/remote/`) && url.pathname.replace(`${base}/_app/remote/`, "");
}
function get_remote_action(url) {
  return url.searchParams.get("/remote");
}
var updated = {
  ...readable(false),
  check: () => false
};
async function render_response({ branch: branch2, fetched, options: options2, manifest: manifest2, state: state2, page_config, status, error: error2 = null, event, event_state, resolve_opts, action_result, data_serializer, error_components }) {
  if (state2.prerendering) {
    if (options2.csp.mode === "nonce") throw new Error('Cannot use prerendering if config.kit.csp.mode === "nonce"');
    if (options2.app_template_contains_nonce) throw new Error("Cannot use prerendering if page template contains %sveltekit.nonce%");
  }
  const { client } = manifest2._;
  const modulepreloads = new Set(client?.imports);
  const stylesheets17 = new Set(client?.stylesheets);
  const fonts17 = new Set(client?.fonts);
  const link_headers = /* @__PURE__ */ new Set();
  const inline_styles = /* @__PURE__ */ new Map();
  let rendered;
  const form_value = action_result?.type === "success" || action_result?.type === "failure" ? action_result.data ?? null : null;
  let base$1 = base;
  let assets$1 = assets;
  let base_expression = s(base);
  const csp = new Csp(options2.csp, { prerender: !!state2.prerendering });
  if (!state2.prerendering?.fallback) {
    base$1 = (event.isDataRequest ? add_data_suffix2(event.url.pathname) : event.url.pathname).slice(base.length).split("/").slice(2).map(() => "..").join("/") || ".";
    base_expression = `new URL(${s(base$1)}, location).pathname.slice(0, -1)`;
    if (!assets || assets[0] === "/" && assets !== "/_svelte_kit_assets") assets$1 = base$1;
  } else if (options2.hash_routing) base_expression = "new URL('.', location).pathname.slice(0, -1)";
  if (page_config.ssr) {
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        updated
      },
      constructors: await Promise.all(branch2.map(({ node }) => {
        if (!node.component) throw new Error(`Missing +page.svelte component for route ${event.route.id}`);
        return node.component();
      })),
      form: form_value
    };
    if (error_components) {
      if (error2) props.error = error2;
      props.errors = error_components;
    }
    let data2 = {};
    for (let i = 0; i < branch2.length; i += 1) {
      data2 = {
        ...data2,
        ...branch2[i].data
      };
      props[`data_${i}`] = data2;
    }
    props.page = {
      error: error2,
      params: event.params,
      route: event.route,
      status,
      url: event.url,
      data: data2,
      form: form_value,
      state: {}
    };
    const render_opts = {
      context: /* @__PURE__ */ new Map([["__request__", { page: props.page }]]),
      csp: csp.script_needs_nonce ? { nonce: csp.nonce } : { hash: csp.script_needs_hash },
      transformError: error_components ? async (e3) => {
        if (isRedirect(e3)) throw e3;
        const transformed2 = await handle_error_and_jsonify(event, event_state, options2, e3);
        props.page.error = props.error = error2 = transformed2;
        props.page.status = status = get_status(e3);
        return transformed2;
      } : void 0
    };
    globalThis.fetch;
    try {
      rendered = await with_request_store({
        event,
        state: {
          ...event_state,
          is_in_render: true
        }
      }, async () => {
        override({
          base: base$1,
          assets: assets$1
        });
        const maybe_promise = options2.root.render(props, render_opts);
        const rendered2 = options2.async && "then" in maybe_promise ? maybe_promise.then((r3) => r3) : maybe_promise;
        if (options2.async) reset();
        const { head: head3, html: html2, css, hashes } = options2.async ? await rendered2 : rendered2;
        if (hashes) csp.add_script_hashes(hashes.script);
        return {
          head: head3,
          html: html2,
          css,
          hashes
        };
      });
    } finally {
      reset();
    }
  } else rendered = {
    head: "",
    html: "",
    css: {
      code: "",
      map: null
    },
    hashes: { script: [] }
  };
  for (const { node } of branch2) {
    for (const url of node.imports) modulepreloads.add(url);
    for (const url of node.stylesheets) stylesheets17.add(url);
    for (const url of node.fonts) fonts17.add(url);
    if (node.inline_styles && !client?.inline) Object.entries(await node.inline_styles()).forEach(([filename, css]) => {
      if (typeof css === "string") {
        inline_styles.set(filename, css);
        return;
      }
      inline_styles.set(filename, css(`${assets$1}/${app_dir}/immutable/assets`, assets$1));
    });
  }
  const head2 = new Head(rendered.head, !!state2.prerendering);
  let body = rendered.html;
  const prefixed = (path) => {
    if (path.startsWith("/")) return base + path;
    return `${assets$1}/${path}`;
  };
  const style = client?.inline ? client.inline?.style : Array.from(inline_styles.values()).join("\n");
  if (style) {
    const attributes2 = [];
    if (csp.style_needs_nonce) attributes2.push(`nonce="${csp.nonce}"`);
    csp.add_style(style);
    head2.add_style(style, attributes2);
  }
  for (const dep of stylesheets17) {
    const path = prefixed(dep);
    const attributes2 = ['rel="stylesheet"'];
    if (inline_styles.has(dep)) attributes2.push("disabled", 'media="(max-width: 0)"');
    else if (resolve_opts.preload({
      type: "css",
      path
    })) link_headers.add(`<${encodeURI(path)}>; rel="preload"; as="style"; nopush`);
    head2.add_stylesheet(path, attributes2);
  }
  for (const dep of fonts17) {
    const path = prefixed(dep);
    if (resolve_opts.preload({
      type: "font",
      path
    })) {
      const ext = dep.slice(dep.lastIndexOf(".") + 1);
      head2.add_link_tag(path, [
        'rel="preload"',
        'as="font"',
        `type="font/${ext}"`,
        "crossorigin"
      ]);
      link_headers.add(`<${encodeURI(path)}>; rel="preload"; as="font"; type="font/${ext}"; crossorigin; nopush`);
    }
  }
  const global = get_global_name(options2);
  const { data, chunks } = data_serializer.get_data(csp);
  if (page_config.ssr && page_config.csr) body += `
			${fetched.map((item) => serialize_data(item, resolve_opts.filterSerializedResponseHeaders, !!state2.prerendering)).join("\n			")}`;
  if (page_config.csr && client) {
    const route = client.routes?.find((r3) => r3.id === event.route.id) ?? null;
    const load_env_eagerly = client.uses_env_dynamic_public && !!state2.prerendering;
    if (load_env_eagerly) modulepreloads.add(`${app_dir}/env.js`);
    if (!client.inline) {
      const included_modulepreloads = Array.from(modulepreloads, (dep) => prefixed(dep)).filter((path) => resolve_opts.preload({
        type: "js",
        path
      }));
      for (const path of included_modulepreloads) {
        link_headers.add(`<${encodeURI(path)}>; rel="modulepreload"; nopush`);
        if (options2.preload_strategy !== "modulepreload") head2.add_script_preload(path);
        else head2.add_link_tag(path, ['rel="modulepreload"']);
      }
    }
    if (client.routes && state2.prerendering && !state2.prerendering.fallback) {
      const pathname = add_resolution_suffix2(event.url.pathname);
      state2.prerendering.dependencies.set(pathname, create_server_routing_response(route, event.params, new URL(pathname, event.url), client));
    }
    const blocks = [];
    const properties = [`base: ${base_expression}`];
    if (assets) properties.push(`assets: ${s(assets)}`);
    if (client.uses_env_dynamic_public) properties.push(`env: ${load_env_eagerly ? "null" : s(public_env)}`);
    if (chunks) {
      blocks.push("const deferred = new Map();");
      properties.push(`defer: (id) => new Promise((fulfil, reject) => {
							deferred.set(id, { fulfil, reject });
						})`);
      let app_declaration = "";
      if (Object.keys(options2.hooks.transport).length > 0) if (client.inline) app_declaration = `const app = ${global}.app.app;`;
      else if (client.app) app_declaration = `const app = await import(${s(prefixed(client.app))});`;
      else app_declaration = `const { app } = await import(${s(prefixed(client.start))});`;
      const prelude = app_declaration ? `${app_declaration}
							const [data, error] = fn(app);` : `const [data, error] = fn();`;
      properties.push(`resolve: async (id, fn) => {
							${prelude}

							const try_to_resolve = () => {
								if (!deferred.has(id)) {
									setTimeout(try_to_resolve, 0);
									return;
								}
								const { fulfil, reject } = deferred.get(id);
								deferred.delete(id);
								if (error) reject(error);
								else fulfil(data);
							}
							try_to_resolve();
						}`);
    }
    blocks.push(`${global} = {
						${properties.join(",\n						")}
					};`);
    const args = ["element"];
    blocks.push("const element = document.currentScript.parentElement;");
    if (page_config.ssr) {
      const serialized = {
        form: "null",
        error: "null"
      };
      if (form_value) serialized.form = uneval_action_response(form_value, event.route.id, options2.hooks.transport);
      if (error2) serialized.error = uneval(error2);
      const hydrate2 = [
        `node_ids: [${branch2.map(({ node }) => node.index).join(", ")}]`,
        `data: ${data}`,
        `form: ${serialized.form}`,
        `error: ${serialized.error}`
      ];
      if (status !== 200) hydrate2.push(`status: ${status}`);
      if (client.routes) {
        if (route) {
          const stringified = generate_route_object(route, event.url, client).replaceAll("\n", "\n							");
          hydrate2.push(`params: ${uneval(event.params)}`, `server_route: ${stringified}`);
        }
      } else if (options2.embedded) hydrate2.push(`params: ${uneval(event.params)}`, `route: ${s(event.route)}`);
      const indent = "	".repeat(load_env_eagerly ? 7 : 6);
      args.push(`{
${indent}	${hydrate2.join(`,
${indent}	`)}
${indent}}`);
    }
    const remote_data = await collect_remote_data({}, event, event_state, options2);
    const serialized_data = Object.keys(remote_data).length > 0 ? `${global}.data = ${uneval(remote_data, create_replacer(options2.hooks.transport))};

						` : "";
    const boot = client.inline ? `${client.inline.script}

					${serialized_data}${global}.app.start(${args.join(", ")});` : client.app ? `Promise.all([
						import(${s(prefixed(client.start))}),
						import(${s(prefixed(client.app))})
					]).then(([kit, app]) => {
						${serialized_data}kit.start(app, ${args.join(", ")});
					});` : `import(${s(prefixed(client.start))}).then((app) => {
						${serialized_data}app.start(${args.join(", ")})
					});`;
    if (load_env_eagerly) blocks.push(`import(${s(`${base$1}/${app_dir}/env.js`)}).then(({ env }) => {
						${global}.env = env;

						${boot.replace(/\n/g, "\n	")}
					});`);
    else blocks.push(boot);
    if (options2.service_worker) {
      let opts = "";
      if (options2.service_worker_options != null) opts = `, ${s({ ...options2.service_worker_options })}`;
      blocks.push(`if ('serviceWorker' in navigator) {
						const script_url = '${prefixed("service-worker.js")}';
						const policy = globalThis?.window?.trustedTypes?.createPolicy(
							'sveltekit-trusted-url',
							{ createScriptURL(url) { return url; } }
						);
						const sanitised = policy?.createScriptURL(script_url) ?? script_url;
						addEventListener('load', function () {
							navigator.serviceWorker.register(sanitised${opts});
						});
					}`);
    }
    const init_app2 = `
				{
					${blocks.join("\n\n					")}
				}
			`;
    csp.add_script(init_app2);
    body += `
			<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>${init_app2}<\/script>
		`;
  }
  const headers3 = new Headers({
    "x-sveltekit-page": "true",
    "content-type": "text/html"
  });
  if (state2.prerendering) {
    const csp_headers = csp.csp_provider.get_meta();
    if (csp_headers) head2.add_http_equiv(csp_headers);
    if (state2.prerendering.cache) head2.add_http_equiv(`<meta http-equiv="cache-control" content="${state2.prerendering.cache}">`);
  } else {
    const csp_header = csp.csp_provider.get_header();
    if (csp_header) headers3.set("content-security-policy", csp_header);
    const report_only_header = csp.report_only_provider.get_header();
    if (report_only_header) headers3.set("content-security-policy-report-only", report_only_header);
    if (link_headers.size) headers3.set("link", Array.from(link_headers).join(", "));
  }
  const html = options2.templates.app({
    head: head2.build(),
    body,
    assets: assets$1,
    nonce: csp.nonce,
    env: public_env
  });
  const transformed = await resolve_opts.transformPageChunk({
    html,
    done: true
  }) || "";
  if (!chunks) headers3.set("etag", `"${hash(transformed)}"`);
  return !chunks ? text(transformed, {
    status,
    headers: headers3
  }) : new Response(new ReadableStream({
    async start(controller2) {
      controller2.enqueue(text_encoder3.encode(transformed + "\n"));
      for await (const chunk of chunks) if (chunk.length) controller2.enqueue(text_encoder3.encode(chunk));
      controller2.close();
    },
    type: "bytes"
  }), { headers: headers3 });
}
var Head = class {
  #rendered;
  #prerendering;
  /** @type {string[]} */
  #http_equiv = [];
  /** @type {string[]} */
  #link_tags = [];
  /** @type {string[]} */
  #script_preloads = [];
  /** @type {string[]} */
  #style_tags = [];
  /** @type {string[]} */
  #stylesheet_links = [];
  /**
  * @param {string} rendered
  * @param {boolean} prerendering
  */
  constructor(rendered, prerendering) {
    this.#rendered = rendered;
    this.#prerendering = prerendering;
  }
  build() {
    return [
      ...this.#http_equiv,
      ...this.#link_tags,
      ...this.#script_preloads,
      this.#rendered,
      ...this.#style_tags,
      ...this.#stylesheet_links
    ].join("\n		");
  }
  /**
  * @param {string} style
  * @param {string[]} attributes
  */
  add_style(style, attributes2) {
    this.#style_tags.push(`<style${attributes2.length ? " " + attributes2.join(" ") : ""}>${style}</style>`);
  }
  /**
  * @param {string} href
  * @param {string[]} attributes
  */
  add_stylesheet(href, attributes2) {
    this.#stylesheet_links.push(`<link href="${href}" ${attributes2.join(" ")}>`);
  }
  /** @param {string} href */
  add_script_preload(href) {
    this.#script_preloads.push(`<link rel="preload" as="script" crossorigin="anonymous" href="${href}">`);
  }
  /**
  * @param {string} href
  * @param {string[]} attributes
  */
  add_link_tag(href, attributes2) {
    if (!this.#prerendering) return;
    this.#link_tags.push(`<link href="${href}" ${attributes2.join(" ")}>`);
  }
  /** @param {string} tag */
  add_http_equiv(tag) {
    if (!this.#prerendering) return;
    this.#http_equiv.push(tag);
  }
};
var PageNodes = class {
  /** All layout nodes and the page node, if any */
  data;
  /**
  * @param {Array<import('types').SSRNode | undefined>} nodes
  */
  constructor(nodes) {
    this.data = nodes;
  }
  layouts() {
    return this.data.slice(0, -1);
  }
  page() {
    return this.data.at(-1);
  }
  validate() {
    for (const layout of this.layouts()) if (layout) {
      validate_layout_server_exports(layout.server, layout.server_id);
      validate_layout_exports(layout.universal, layout.universal_id);
    }
    const page3 = this.page();
    if (page3) {
      validate_page_server_exports(page3.server, page3.server_id);
      validate_page_exports(page3.universal, page3.universal_id);
    }
  }
  /**
  * @template {'prerender' | 'ssr' | 'csr' | 'trailingSlash'} Option
  * @param {Option} option
  * @returns {Value | undefined}
  */
  #get_option(option) {
    return this.data.reduce((value, node) => {
      return node?.universal?.[option] ?? node?.server?.[option] ?? value;
    }, void 0);
  }
  csr() {
    return this.#get_option("csr") ?? true;
  }
  ssr() {
    return this.#get_option("ssr") ?? true;
  }
  prerender() {
    return this.#get_option("prerender") ?? false;
  }
  trailing_slash() {
    return this.#get_option("trailingSlash") ?? "never";
  }
  get_config() {
    let current2 = {};
    for (const node of this.data) {
      if (!node?.universal?.config && !node?.server?.config) continue;
      current2 = {
        ...current2,
        ...node?.universal?.config,
        ...node?.server?.config
      };
    }
    return Object.keys(current2).length ? current2 : void 0;
  }
  should_prerender_data() {
    return this.data.some((node) => node?.server?.load || node?.server?.trailingSlash !== void 0);
  }
};
async function respond_with_error({ event, event_state, options: options2, manifest: manifest2, state: state2, status, error: error2, resolve_opts }) {
  if (event.request.headers.get("x-sveltekit-error")) return static_error_page(
    options2,
    status,
    /** @type {Error} */
    error2.message
  );
  const fetched = [];
  try {
    const branch2 = [];
    const default_layout = await manifest2._.nodes[0]();
    const nodes = new PageNodes([default_layout]);
    const ssr = nodes.ssr();
    const csr = nodes.csr();
    const data_serializer = server_data_serializer(event, event_state, options2);
    if (ssr) {
      state2.error = true;
      const server_data_promise = load_server_data({
        event,
        event_state,
        state: state2,
        node: default_layout,
        parent: async () => ({})
      });
      const server_data = await server_data_promise;
      data_serializer.add_node(0, server_data);
      const data = await load_data({
        event,
        event_state,
        fetched,
        node: default_layout,
        parent: async () => ({}),
        resolve_opts,
        server_data_promise,
        state: state2,
        csr
      });
      branch2.push({
        node: default_layout,
        server_data,
        data
      }, {
        node: await manifest2._.nodes[1](),
        data: null,
        server_data: null
      });
    }
    return await render_response({
      options: options2,
      manifest: manifest2,
      state: state2,
      page_config: {
        ssr,
        csr
      },
      status,
      error: await handle_error_and_jsonify(event, event_state, options2, error2),
      branch: branch2,
      error_components: [],
      fetched,
      event,
      event_state,
      resolve_opts,
      data_serializer
    });
  } catch (e3) {
    if (e3 instanceof Redirect) return redirect_response(e3.status, e3.location);
    return static_error_page(options2, get_status(e3), (await handle_error_and_jsonify(event, event_state, options2, e3)).message);
  }
}
var MAX_DEPTH = 10;
async function render_page(event, event_state, page3, options2, manifest2, state2, nodes, resolve_opts) {
  if (state2.depth > MAX_DEPTH) return text(`Not found: ${event.url.pathname}`, { status: 404 });
  if (is_action_json_request(event)) return handle_action_json_request(event, event_state, options2, (await manifest2._.nodes[page3.leaf]())?.server);
  try {
    const leaf_node = nodes.page();
    let status = 200;
    let action_result = void 0;
    if (is_action_request(event)) {
      const remote_id = get_remote_action(event.url);
      if (remote_id) action_result = await handle_remote_form_post(event, event_state, manifest2, remote_id);
      else action_result = await handle_action_request(event, event_state, leaf_node.server);
      if (action_result?.type === "redirect") return redirect_response(action_result.status, action_result.location);
      if (action_result?.type === "error") status = get_status(action_result.error);
      if (action_result?.type === "failure") status = action_result.status;
    }
    const should_prerender = nodes.prerender();
    if (should_prerender) {
      if (leaf_node.server?.actions) throw new Error("Cannot prerender pages with actions");
    } else if (state2.prerendering) return new Response(void 0, { status: 204 });
    state2.prerender_default = should_prerender;
    const should_prerender_data = nodes.should_prerender_data();
    const data_pathname = add_data_suffix2(event.url.pathname);
    const fetched = [];
    const ssr = nodes.ssr();
    const csr = nodes.csr();
    if (ssr === false && !(state2.prerendering && should_prerender_data)) return await render_response({
      branch: compact(nodes.data).map((node) => {
        return {
          node,
          data: null,
          server_data: null
        };
      }),
      fetched,
      page_config: {
        ssr: false,
        csr
      },
      status,
      error: null,
      event,
      event_state,
      options: options2,
      manifest: manifest2,
      state: state2,
      resolve_opts,
      data_serializer: server_data_serializer(event, event_state, options2)
    });
    const branch2 = [];
    let load_error = null;
    const data_serializer = server_data_serializer(event, event_state, options2);
    const data_serializer_json = state2.prerendering && should_prerender_data ? server_data_serializer_json(event, event_state, options2) : null;
    const server_promises = nodes.data.map((node, i) => {
      if (load_error) throw load_error;
      return Promise.resolve().then(async () => {
        try {
          if (node === leaf_node && action_result?.type === "error") throw action_result.error;
          const server_data = await load_server_data({
            event,
            event_state,
            state: state2,
            node,
            parent: async () => {
              const data = {};
              for (let j = 0; j < i; j += 1) {
                const parent = await server_promises[j];
                if (parent) Object.assign(data, parent.data);
              }
              return data;
            }
          });
          if (node) data_serializer.add_node(i, server_data);
          data_serializer_json?.add_node(i, server_data);
          return server_data;
        } catch (e3) {
          load_error = e3;
          throw load_error;
        }
      });
    });
    const load_promises = nodes.data.map((node, i) => {
      if (load_error) throw load_error;
      return Promise.resolve().then(async () => {
        try {
          return await load_data({
            event,
            event_state,
            fetched,
            node,
            parent: async () => {
              const data = {};
              for (let j = 0; j < i; j += 1) Object.assign(data, await load_promises[j]);
              return data;
            },
            resolve_opts,
            server_data_promise: server_promises[i],
            state: state2,
            csr
          });
        } catch (e3) {
          load_error = e3;
          throw load_error;
        }
      });
    });
    for (const p of server_promises) p.catch(noop2);
    for (const p of load_promises) p.catch(noop2);
    for (let i = 0; i < nodes.data.length; i += 1) {
      const node = nodes.data[i];
      if (node) try {
        const server_data = await server_promises[i];
        const data = await load_promises[i];
        branch2.push({
          node,
          server_data,
          data
        });
      } catch (e3) {
        const err = normalize_error(e3);
        if (err instanceof Redirect) {
          if (state2.prerendering && should_prerender_data) {
            const body = JSON.stringify({
              type: "redirect",
              location: err.location
            });
            state2.prerendering.dependencies.set(data_pathname, {
              response: text(body),
              body
            });
          }
          return redirect_response(err.status, err.location);
        }
        const status2 = get_status(err);
        const error2 = await handle_error_and_jsonify(event, event_state, options2, err);
        while (i--) if (page3.errors[i]) {
          const index17 = page3.errors[i];
          const node2 = await manifest2._.nodes[index17]();
          let j = i;
          while (!branch2[j]) j -= 1;
          data_serializer.set_max_nodes(j + 1);
          const layouts = compact(branch2.slice(0, j + 1));
          const nodes2 = new PageNodes(layouts.map((layout) => layout.node));
          const error_branch = layouts.concat({
            node: node2,
            data: null,
            server_data: null
          });
          return await render_response({
            event,
            event_state,
            options: options2,
            manifest: manifest2,
            state: state2,
            resolve_opts,
            page_config: {
              ssr: nodes2.ssr(),
              csr: nodes2.csr()
            },
            status: status2,
            error: error2,
            error_components: await load_error_components(options2, ssr, error_branch, page3, manifest2),
            branch: error_branch,
            fetched,
            data_serializer
          });
        }
        return static_error_page(options2, status2, error2.message);
      }
      else branch2.push(null);
    }
    if (state2.prerendering && data_serializer_json) {
      let { data, chunks } = data_serializer_json.get_data();
      if (chunks) for await (const chunk of chunks) data += chunk;
      state2.prerendering.dependencies.set(data_pathname, {
        response: text(data),
        body: data
      });
    }
    return await render_response({
      event,
      event_state,
      options: options2,
      manifest: manifest2,
      state: state2,
      resolve_opts,
      page_config: {
        csr,
        ssr
      },
      status,
      error: null,
      branch: compact(branch2),
      action_result,
      fetched,
      data_serializer: !ssr ? server_data_serializer(event, event_state, options2) : data_serializer,
      error_components: await load_error_components(options2, ssr, branch2, page3, manifest2)
    });
  } catch (e3) {
    if (e3 instanceof Redirect) return redirect_response(e3.status, e3.location);
    return await respond_with_error({
      event,
      event_state,
      options: options2,
      manifest: manifest2,
      state: state2,
      status: e3 instanceof HttpError ? e3.status : 500,
      error: e3,
      resolve_opts
    });
  }
}
async function load_error_components(options2, ssr, branch2, page3, manifest2) {
  let error_components;
  if (options2.server_error_boundaries && ssr) {
    let last_idx = -1;
    error_components = await Promise.all(branch2.map((b, i) => {
      if (i === 0) return void 0;
      if (!b) return null;
      i--;
      while (i > last_idx + 1 && page3.errors[i] === void 0) i -= 1;
      last_idx = i;
      const idx = page3.errors[i];
      if (idx == null) return void 0;
      return manifest2._.nodes[idx]?.().then((e3) => e3.component?.()).catch(() => void 0);
    }).filter((e3) => e3 !== null));
  }
  return error_components;
}
async function render_data(event, event_state, route, options2, manifest2, state2, invalidated_data_nodes, trailing_slash) {
  if (!route.page) return new Response(void 0, { status: 404 });
  try {
    const node_ids = [...route.page.layouts, route.page.leaf];
    const invalidated = invalidated_data_nodes ?? node_ids.map(() => true);
    let aborted = false;
    const url = new URL(event.url);
    url.pathname = normalize_path(url.pathname, trailing_slash);
    const new_event = {
      ...event,
      url
    };
    const functions = node_ids.map((n2, i) => {
      return once2(async () => {
        try {
          if (aborted) return { type: "skip" };
          const node = n2 == void 0 ? n2 : await manifest2._.nodes[n2]();
          return load_server_data({
            event: new_event,
            event_state,
            state: state2,
            node,
            parent: async () => {
              const data2 = {};
              for (let j = 0; j < i; j += 1) {
                const parent = await functions[j]();
                if (parent) Object.assign(data2, parent.data);
              }
              return data2;
            }
          });
        } catch (e3) {
          aborted = true;
          throw e3;
        }
      });
    });
    const promises = functions.map(async (fn, i) => {
      if (!invalidated[i]) return { type: "skip" };
      return fn();
    });
    let length = promises.length;
    const nodes = await Promise.all(promises.map((p, i) => p.catch(async (error2) => {
      if (error2 instanceof Redirect) throw error2;
      length = Math.min(length, i + 1);
      return {
        type: "error",
        error: await handle_error_and_jsonify(event, event_state, options2, error2),
        status: error2 instanceof HttpError || error2 instanceof SvelteKitError ? error2.status : void 0
      };
    })));
    const data_serializer = server_data_serializer_json(event, event_state, options2);
    for (let i = 0; i < nodes.length; i++) data_serializer.add_node(i, nodes[i]);
    const { data, chunks } = data_serializer.get_data();
    if (!chunks) return json_response(data);
    return new Response(new ReadableStream({
      async start(controller2) {
        controller2.enqueue(text_encoder3.encode(data));
        for await (const chunk of chunks) controller2.enqueue(text_encoder3.encode(chunk));
        controller2.close();
      },
      type: "bytes"
    }), { headers: {
      "content-type": "text/sveltekit-data",
      "cache-control": "private, no-store"
    } });
  } catch (e3) {
    const error2 = normalize_error(e3);
    if (error2 instanceof Redirect) return redirect_json_response(error2);
    else return json_response(await handle_error_and_jsonify(event, event_state, options2, error2), 500);
  }
}
function json_response(json2, status = 200) {
  return text(typeof json2 === "string" ? json2 : JSON.stringify(json2), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store"
    }
  });
}
function redirect_json_response(redirect2) {
  return json_response({
    type: "redirect",
    location: redirect2.location
  });
}
var INVALID_COOKIE_CHARACTER_REGEX = /[\x00-\x1F\x7F()<>@,;:"/[\]?={} \t]/;
function validate_options(options2) {
  if (options2?.path === void 0) throw new Error("You must specify a `path` when setting, deleting or serializing cookies");
}
function generate_cookie_key(domain, path, name) {
  return `${domain || ""}${path}?${encodeURIComponent(name)}`;
}
function get_cookies(request, url) {
  const header = request.headers.get("cookie") ?? "";
  const initial_cookies = (0, import_cookie.parse)(header, { decode: (value) => value });
  let normalized_url;
  const new_cookies = /* @__PURE__ */ new Map();
  const defaults = {
    httpOnly: true,
    sameSite: "lax",
    secure: url.hostname === "localhost" && url.protocol === "http:" ? false : true
  };
  const cookies = {
    /**
    * @param {string} name
    * @param {import('cookie').CookieParseOptions} [opts]
    */
    get(name, opts) {
      const best_match = Array.from(new_cookies.values()).filter((c2) => {
        return c2.name === name && domain_matches(url.hostname, c2.options.domain) && path_matches(url.pathname, c2.options.path);
      }).sort((a, b) => b.options.path.length - a.options.path.length)[0];
      if (best_match) return best_match.options.maxAge === 0 ? void 0 : best_match.value;
      return (0, import_cookie.parse)(header, { decode: opts?.decode })[name];
    },
    /**
    * @param {import('cookie').CookieParseOptions} [opts]
    */
    getAll(opts) {
      const cookies2 = (0, import_cookie.parse)(header, { decode: opts?.decode });
      const lookup = /* @__PURE__ */ new Map();
      for (const c2 of new_cookies.values()) if (domain_matches(url.hostname, c2.options.domain) && path_matches(url.pathname, c2.options.path)) {
        const existing = lookup.get(c2.name);
        if (!existing || c2.options.path.length > existing.options.path.length) lookup.set(c2.name, c2);
      }
      for (const c2 of lookup.values()) cookies2[c2.name] = c2.value;
      return Object.entries(cookies2).map(([name, value]) => ({
        name,
        value
      }));
    },
    /**
    * @param {string} name
    * @param {string} value
    * @param {import('./page/types.js').Cookie['options']} options
    */
    set(name, value, options2) {
      const illegal_characters = name.match(INVALID_COOKIE_CHARACTER_REGEX);
      if (illegal_characters) console.warn(`The cookie name "${name}" will be invalid in SvelteKit 3.0 as it contains ${illegal_characters.join(" and ")}. See RFC 2616 for more details https://datatracker.ietf.org/doc/html/rfc2616#section-2.2`);
      validate_options(options2);
      set_internal(name, value, {
        ...defaults,
        ...options2
      });
    },
    /**
    * @param {string} name
    *  @param {import('./page/types.js').Cookie['options']} options
    */
    delete(name, options2) {
      validate_options(options2);
      cookies.set(name, "", {
        ...options2,
        maxAge: 0
      });
    },
    /**
    * @param {string} name
    * @param {string} value
    *  @param {import('./page/types.js').Cookie['options']} options
    */
    serialize(name, value, options2) {
      validate_options(options2);
      let path = options2.path;
      if (!options2.domain || options2.domain === url.hostname) {
        if (!normalized_url) throw new Error("Cannot serialize cookies until after the route is determined");
        path = resolve(normalized_url, path);
      }
      return (0, import_cookie.serialize)(name, value, {
        ...defaults,
        ...options2,
        path
      });
    }
  };
  function get_cookie_header(destination, header2) {
    const combined_cookies = { ...initial_cookies };
    for (const cookie of new_cookies.values()) {
      if (!domain_matches(destination.hostname, cookie.options.domain)) continue;
      if (!path_matches(destination.pathname, cookie.options.path)) continue;
      const encoder = cookie.options.encode || encodeURIComponent;
      combined_cookies[cookie.name] = encoder(cookie.value);
    }
    if (header2) {
      const parsed = (0, import_cookie.parse)(header2, { decode: (value) => value });
      for (const name in parsed) combined_cookies[name] = parsed[name];
    }
    return Object.entries(combined_cookies).map(([name, value]) => `${name}=${value}`).join("; ");
  }
  const internal_queue = [];
  function set_internal(name, value, options2) {
    if (!normalized_url) {
      internal_queue.push(() => set_internal(name, value, options2));
      return;
    }
    let path = options2.path;
    if (!options2.domain || options2.domain === url.hostname) path = resolve(normalized_url, path);
    const cookie_key = generate_cookie_key(options2.domain, path, name);
    const cookie = {
      name,
      value,
      options: {
        ...options2,
        path
      }
    };
    new_cookies.set(cookie_key, cookie);
  }
  function set_trailing_slash(trailing_slash) {
    normalized_url = normalize_path(url.pathname, trailing_slash);
    internal_queue.forEach((fn) => fn());
  }
  return {
    cookies,
    new_cookies,
    get_cookie_header,
    set_internal,
    set_trailing_slash
  };
}
function domain_matches(hostname, constraint) {
  if (!constraint) return true;
  const normalized = constraint[0] === "." ? constraint.slice(1) : constraint;
  if (hostname === normalized) return true;
  return hostname.endsWith("." + normalized);
}
function path_matches(path, constraint) {
  if (!constraint) return true;
  const normalized = constraint.endsWith("/") ? constraint.slice(0, -1) : constraint;
  if (path === normalized) return true;
  return path.startsWith(normalized + "/");
}
function add_cookies_to_headers(headers3, cookies) {
  for (const new_cookie of cookies) {
    const { name, value, options: options2 } = new_cookie;
    headers3.append("set-cookie", (0, import_cookie.serialize)(name, value, options2));
    if (options2.path.endsWith(".html")) {
      const path = add_data_suffix2(options2.path);
      headers3.append("set-cookie", (0, import_cookie.serialize)(name, value, {
        ...options2,
        path
      }));
    }
  }
}
function create_fetch({ event, options: options2, manifest: manifest2, state: state2, get_cookie_header, set_internal }) {
  const server_fetch = async (info, init2) => {
    const original_request = normalize_fetch_input(info, init2, event.url);
    let mode = (info instanceof Request ? info.mode : init2?.mode) ?? "cors";
    let credentials = (info instanceof Request ? info.credentials : init2?.credentials) ?? "same-origin";
    return options2.hooks.handleFetch({
      event,
      request: original_request,
      fetch: async (info2, init3) => {
        const request = normalize_fetch_input(info2, init3, event.url);
        const url = new URL(request.url);
        if (!request.headers.has("origin")) request.headers.set("origin", event.url.origin);
        if (info2 !== original_request) {
          mode = (info2 instanceof Request ? info2.mode : init3?.mode) ?? "cors";
          credentials = (info2 instanceof Request ? info2.credentials : init3?.credentials) ?? "same-origin";
        }
        if ((request.method === "GET" || request.method === "HEAD") && (mode === "no-cors" && url.origin !== event.url.origin || url.origin === event.url.origin)) request.headers.delete("origin");
        const decoded = decodeURIComponent(url.pathname);
        if (url.origin !== event.url.origin || base && decoded !== base && !decoded.startsWith(`${base}/`)) {
          if (`.${url.hostname}`.endsWith(`.${event.url.hostname}`) && credentials !== "omit") {
            const cookie = get_cookie_header(url, request.headers.get("cookie"));
            if (cookie) request.headers.set("cookie", cookie);
          }
          return fetch(request);
        }
        const prefix = assets || base;
        const filename = (decoded.startsWith(prefix) ? decoded.slice(prefix.length) : decoded).slice(1);
        const filename_html = `${filename}/index.html`;
        const is_asset = manifest2.assets.has(filename) || filename in manifest2._.server_assets;
        const is_asset_html = manifest2.assets.has(filename_html) || filename_html in manifest2._.server_assets;
        if (is_asset || is_asset_html) {
          const file = is_asset ? filename : filename_html;
          if (state2.read) {
            const type = is_asset ? manifest2.mimeTypes[filename.slice(filename.lastIndexOf("."))] : "text/html";
            return new Response(state2.read(file), { headers: type ? { "content-type": type } : {} });
          } else if (read_implementation && file in manifest2._.server_assets) {
            const length = manifest2._.server_assets[file];
            const type = manifest2.mimeTypes[file.slice(file.lastIndexOf("."))];
            return new Response(read_implementation(file), { headers: {
              "Content-Length": "" + length,
              "Content-Type": type
            } });
          }
          return await fetch(request);
        }
        if (has_prerendered_path(manifest2, base + decoded)) return await fetch(request);
        if (credentials !== "omit") {
          const cookie = get_cookie_header(url, request.headers.get("cookie"));
          if (cookie) request.headers.set("cookie", cookie);
          const authorization = event.request.headers.get("authorization");
          if (authorization && !request.headers.has("authorization")) request.headers.set("authorization", authorization);
        }
        if (!request.headers.has("accept")) request.headers.set("accept", "*/*");
        if (!request.headers.has("accept-language")) request.headers.set("accept-language", event.request.headers.get("accept-language"));
        const response = await internal_fetch(request, options2, manifest2, state2);
        for (const str of get_set_cookies(response.headers)) {
          const { name, value, ...options3 } = parseString(str, { decodeValues: false });
          set_internal(name, value, {
            path: options3.path ?? (url.pathname.split("/").slice(0, -1).join("/") || "/"),
            encode: (value2) => value2,
            ...options3
          });
        }
        return response;
      }
    });
  };
  return (input, init2) => {
    const response = server_fetch(input, init2);
    response.catch(noop2);
    return response;
  };
}
function normalize_fetch_input(info, init2, url) {
  if (info instanceof Request) return info;
  return new Request(typeof info === "string" ? new URL(info, url) : info, init2);
}
async function internal_fetch(request, options2, manifest2, state2) {
  if (request.signal) {
    if (request.signal.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    let remove_abort_listener = noop2;
    const abort_promise = new Promise((_, reject) => {
      const on_abort = () => {
        reject(new DOMException("The operation was aborted.", "AbortError"));
      };
      request.signal.addEventListener("abort", on_abort, { once: true });
      remove_abort_listener = () => request.signal.removeEventListener("abort", on_abort);
    });
    const result = await Promise.race([respond(request, options2, manifest2, {
      ...state2,
      depth: state2.depth + 1
    }), abort_promise]);
    remove_abort_listener();
    return result;
  } else return await respond(request, options2, manifest2, {
    ...state2,
    depth: state2.depth + 1
  });
}
var payload;
var etag;
var headers;
function get_public_env(request) {
  const script = request.url.endsWith(".script.js");
  const env = public_env;
  payload ??= uneval(env);
  etag ??= `W/${Date.now()}`;
  headers ??= new Headers({
    "content-type": "application/javascript; charset=utf-8",
    etag
  });
  if (request.headers.get("if-none-match") === etag) return new Response(void 0, {
    status: 304,
    headers
  });
  if (script) return new Response(`globalThis.__sveltekit_sw={env:${payload}}`, { headers });
  return new Response(`export const env=${payload}`, { headers });
}
var default_transform = ({ html }) => html;
var default_filter = () => false;
var default_preload = ({ type }) => type === "js" || type === "css";
var page_methods = /* @__PURE__ */ new Set([
  "GET",
  "HEAD",
  "POST"
]);
var allowed_page_methods = /* @__PURE__ */ new Set([
  "GET",
  "HEAD",
  "OPTIONS"
]);
var respond = propagate_context(internal_respond);
async function internal_respond(request, options2, manifest2, state2) {
  const url = new URL(request.url);
  const is_route_resolution_request = has_resolution_suffix2(url.pathname);
  const is_data_request = has_data_suffix2(url.pathname);
  const remote_id = get_remote_id(url);
  {
    const request_origin = request.headers.get("origin");
    if (remote_id) {
      if (request.method !== "GET" && request_origin !== url.origin) return json({ message: "Cross-site remote requests are forbidden" }, { status: 403 });
    } else if (options2.csrf_check_origin) {
      if (is_form_content_type(request) && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request_origin !== url.origin && (!request_origin || !options2.csrf_trusted_origins.includes(request_origin))) {
        const message = `Cross-site ${request.method} form submissions are forbidden`;
        const opts = { status: 403 };
        if (request.headers.get("accept") === "application/json") return json({ message }, opts);
        return text(message, opts);
      }
    }
  }
  if (options2.hash_routing && url.pathname !== base + "/" && url.pathname !== "/[fallback]") return text("Not found", { status: 404 });
  let invalidated_data_nodes;
  if (is_route_resolution_request)
    url.pathname = strip_resolution_suffix2(url.pathname);
  else if (is_data_request) {
    url.pathname = strip_data_suffix2(url.pathname) + (url.searchParams.get("x-sveltekit-trailing-slash") === "1" ? "/" : "") || "/";
    url.searchParams.delete(TRAILING_SLASH_PARAM);
    invalidated_data_nodes = url.searchParams.get(INVALIDATED_PARAM)?.split("").map((node) => node === "1");
    url.searchParams.delete(INVALIDATED_PARAM);
  } else if (remote_id) {
    url.pathname = request.headers.get("x-sveltekit-pathname") ?? base;
    url.search = request.headers.get("x-sveltekit-search") ?? "";
  }
  const headers3 = {};
  const { cookies, new_cookies, get_cookie_header, set_internal, set_trailing_slash } = get_cookies(request, url);
  const event_state = {
    prerendering: state2.prerendering,
    transport: options2.hooks.transport,
    handleValidationError: options2.hooks.handleValidationError,
    tracing: { record_span },
    remote: {
      data: null,
      explicit: null,
      implicit: null,
      forms: null,
      requested: null,
      batches: null,
      live_iterators: null
    },
    is_in_remote_function: false,
    is_in_remote_form_or_command: false,
    is_in_remote_query: false,
    is_in_render: false,
    is_in_universal_load: false
  };
  const event = {
    cookies,
    fetch: null,
    getClientAddress: state2.getClientAddress || (() => {
      throw new Error(`@sveltejs/adapter-cloudflare does not specify getClientAddress. Please raise an issue`);
    }),
    locals: {},
    params: {},
    platform: state2.platform,
    request,
    route: { id: null },
    setHeaders: (new_headers) => {
      for (const key2 in new_headers) {
        const lower = key2.toLowerCase();
        const value = new_headers[key2];
        if (lower === "set-cookie") throw new Error("Use `event.cookies.set(name, value, options)` instead of `event.setHeaders` to set cookies");
        else if (lower in headers3) if (lower === "server-timing") headers3[lower] += ", " + value;
        else throw new Error(`"${key2}" header is already set`);
        else {
          headers3[lower] = value;
          if (state2.prerendering && lower === "cache-control") state2.prerendering.cache = value;
        }
      }
    },
    url,
    isDataRequest: is_data_request,
    isSubRequest: state2.depth > 0,
    isRemoteRequest: !!remote_id
  };
  event.fetch = create_fetch({
    event,
    options: options2,
    manifest: manifest2,
    state: state2,
    get_cookie_header,
    set_internal
  });
  if (state2.emulator?.platform) event.platform = await state2.emulator.platform({
    config: {},
    prerender: !!state2.prerendering?.fallback
  });
  let resolved_path = url.pathname;
  if (!remote_id) {
    const prerendering_reroute_state = state2.prerendering?.inside_reroute;
    try {
      if (state2.prerendering) state2.prerendering.inside_reroute = true;
      resolved_path = await options2.hooks.reroute({
        url: new URL(url),
        fetch: event.fetch
      }) ?? url.pathname;
    } catch {
      return text("Internal Server Error", { status: 500 });
    } finally {
      if (state2.prerendering) state2.prerendering.inside_reroute = prerendering_reroute_state;
    }
  }
  let resolve_opts = {
    transformPageChunk: default_transform,
    filterSerializedResponseHeaders: default_filter,
    preload: default_preload
  };
  let trailing_slash = "never";
  let page_nodes;
  try {
    resolved_path = decode_pathname(resolved_path);
  } catch {
    resolved_path = null;
    return await handle2();
  }
  if (resolved_path !== decode_pathname(url.pathname) && !state2.prerendering?.fallback && has_prerendered_path(manifest2, resolved_path)) {
    const url2 = new URL(request.url);
    url2.pathname = is_data_request ? add_data_suffix2(resolved_path) : is_route_resolution_request ? add_resolution_suffix2(resolved_path) : resolved_path;
    try {
      const response = await fetch(url2, request);
      const headers4 = new Headers(response.headers);
      if (headers4.has("content-encoding")) {
        headers4.delete("content-encoding");
        headers4.delete("content-length");
      }
      return new Response(response.body, {
        headers: headers4,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error2) {
      return await handle_fatal_error(event, event_state, options2, error2);
    }
  }
  let route = null;
  if (base && !state2.prerendering?.fallback) {
    if (!resolved_path.startsWith(base)) return text("Not found", { status: 404 });
    resolved_path = resolved_path.slice(base.length) || "/";
  }
  if (is_route_resolution_request) return resolve_route(resolved_path, new URL(request.url), manifest2);
  if (resolved_path === `/_app/env.js` || resolved_path === `/_app/env.script.js`) return get_public_env(request);
  if (!remote_id && resolved_path.startsWith(`/_app`)) {
    const headers4 = new Headers();
    headers4.set("cache-control", "public, max-age=0, must-revalidate");
    return text("Not found", {
      status: 404,
      headers: headers4
    });
  }
  if (!state2.prerendering?.fallback) {
    const matchers = await manifest2._.matchers();
    const result = find_route(resolved_path, manifest2._.routes, matchers);
    if (result) {
      route = result.route;
      event.route = { id: route.id };
      event.params = result.params;
    }
  }
  try {
    page_nodes = route?.page ? new PageNodes(await load_page_nodes(route.page, manifest2)) : void 0;
    if (route && !remote_id) {
      if (url.pathname === base || url.pathname === base + "/") trailing_slash = "always";
      else if (page_nodes) trailing_slash = page_nodes.trailing_slash();
      else if (route.endpoint) trailing_slash = (await route.endpoint()).trailingSlash ?? "never";
      if (!is_data_request) {
        const normalized = normalize_path(url.pathname, trailing_slash);
        if (normalized !== url.pathname && !state2.prerendering?.fallback) return new Response(void 0, {
          status: 308,
          headers: {
            "x-sveltekit-normalize": "1",
            location: (normalized.startsWith("//") ? url.origin + normalized : normalized) + (url.search === "?" ? "" : url.search)
          }
        });
      }
      if (state2.before_handle || state2.emulator?.platform) {
        let config = {};
        let prerender = false;
        if (route.endpoint) {
          const node = await route.endpoint();
          config = node.config ?? config;
          prerender = node.prerender ?? prerender;
        } else if (page_nodes) {
          config = page_nodes.get_config() ?? config;
          prerender = page_nodes.prerender();
        }
        if (state2.emulator?.platform) event.platform = await state2.emulator.platform({
          config,
          prerender
        });
        if (state2.before_handle) return await state2.before_handle(event, config, prerender, handle2);
      }
    }
    return await handle2();
  } catch (e3) {
    if (e3 instanceof Redirect) try {
      const response = is_data_request || remote_id ? redirect_json_response(e3) : route?.page && is_action_json_request(event) ? action_json_redirect(e3) : redirect_response(e3.status, e3.location);
      add_cookies_to_headers(response.headers, new_cookies.values());
      return response;
    } catch (err) {
      return await handle_fatal_error(event, event_state, options2, err);
    }
    return await handle_fatal_error(event, event_state, options2, e3);
  }
  async function handle2() {
    set_trailing_slash(trailing_slash);
    if (state2.prerendering && !state2.prerendering.fallback && !state2.prerendering.inside_reroute) disable_search(url);
    const response = await record_span({
      name: "sveltekit.handle.root",
      attributes: {
        "http.route": event.route.id || "unknown",
        "http.method": event.request.method,
        "http.url": event.url.href,
        "sveltekit.is_data_request": is_data_request,
        "sveltekit.is_sub_request": event.isSubRequest
      },
      fn: async (root_span) => {
        const traced_event = {
          ...event,
          tracing: {
            enabled: false,
            root: root_span,
            current: root_span
          }
        };
        return await with_request_store({
          event: traced_event,
          state: event_state
        }, () => options2.hooks.handle({
          event: traced_event,
          resolve: (event2, opts) => {
            return record_span({
              name: "sveltekit.resolve",
              attributes: { "http.route": event2.route.id || "unknown" },
              fn: (resolve_span) => {
                return with_request_store(null, () => resolve2(merge_tracing(event2, resolve_span), page_nodes, opts).then((response2) => {
                  for (const key2 in headers3) {
                    const value = headers3[key2];
                    response2.headers.set(key2, value);
                  }
                  add_cookies_to_headers(response2.headers, new_cookies.values());
                  if (state2.prerendering && event2.route.id !== null) response2.headers.set("x-sveltekit-routeid", encodeURI(event2.route.id));
                  resolve_span.setAttributes({
                    "http.response.status_code": response2.status,
                    "http.response.body.size": response2.headers.get("content-length") || "unknown"
                  });
                  return response2;
                }));
              }
            });
          }
        }));
      }
    });
    if (response.status === 200 && response.headers.has("etag")) {
      let if_none_match_value = request.headers.get("if-none-match");
      if (if_none_match_value?.startsWith('W/"')) if_none_match_value = if_none_match_value.substring(2);
      const etag2 = response.headers.get("etag");
      if (if_none_match_value === etag2) {
        const headers4 = new Headers({ etag: etag2 });
        for (const key2 of [
          "cache-control",
          "content-location",
          "date",
          "expires",
          "vary"
        ]) {
          const value = response.headers.get(key2);
          if (value) headers4.set(key2, value);
        }
        for (const cookie of get_set_cookies(response.headers)) headers4.append("set-cookie", cookie);
        return new Response(void 0, {
          status: 304,
          headers: headers4
        });
      }
    }
    if (is_data_request && response.status >= 300 && response.status <= 308) {
      const location = response.headers.get("location");
      if (location) return redirect_json_response(new Redirect(response.status, location));
    }
    return response;
  }
  async function resolve2(event2, page_nodes2, opts) {
    try {
      if (opts) resolve_opts = {
        transformPageChunk: opts.transformPageChunk || default_transform,
        filterSerializedResponseHeaders: opts.filterSerializedResponseHeaders || default_filter,
        preload: opts.preload || default_preload
      };
      if (resolved_path === null) return await respond_with_error({
        event: event2,
        event_state,
        options: options2,
        manifest: manifest2,
        state: state2,
        status: 400,
        error: new SvelteKitError(400, "Malformed URI", `Failed to decode URI: ${event2.url.pathname}`),
        resolve_opts
      });
      if (options2.hash_routing || state2.prerendering?.fallback) return await render_response({
        event: event2,
        event_state,
        options: options2,
        manifest: manifest2,
        state: state2,
        page_config: {
          ssr: false,
          csr: true
        },
        status: 200,
        error: null,
        branch: [{
          node: await manifest2._.nodes[0](),
          data: null,
          server_data: null
        }],
        fetched: [],
        resolve_opts,
        data_serializer: server_data_serializer(event2, event_state, options2)
      });
      if (remote_id) return await handle_remote_call(event2, event_state, options2, manifest2, remote_id);
      if (route) {
        const method = event2.request.method;
        let response2;
        if (is_data_request) response2 = await render_data(event2, event_state, route, options2, manifest2, state2, invalidated_data_nodes, trailing_slash);
        else if (route.endpoint && (!route.page || !state2.prerendering && is_endpoint_request(event2))) response2 = await render_endpoint(event2, event_state, await route.endpoint(), state2);
        else if (route.page) if (!page_nodes2) throw new Error("page_nodes not found. This should never happen");
        else if (page_methods.has(method)) response2 = await render_page(event2, event_state, route.page, options2, manifest2, state2, page_nodes2, resolve_opts);
        else {
          const allowed_methods2 = new Set(allowed_page_methods);
          if ((await manifest2._.nodes[route.page.leaf]())?.server?.actions) allowed_methods2.add("POST");
          if (method === "OPTIONS") response2 = new Response(null, {
            status: 204,
            headers: { allow: Array.from(allowed_methods2.values()).join(", ") }
          });
          else response2 = method_not_allowed([...allowed_methods2].reduce((acc, curr) => {
            acc[curr] = true;
            return acc;
          }, {}), method);
        }
        else throw new Error("Route is neither page nor endpoint. This should never happen");
        if (request.method === "GET" && route.page && route.endpoint) {
          const vary = response2.headers.get("vary")?.split(",")?.map((v) => v.trim().toLowerCase());
          if (!(vary?.includes("accept") || vary?.includes("*"))) {
            response2 = new Response(response2.body, {
              status: response2.status,
              statusText: response2.statusText,
              headers: new Headers(response2.headers)
            });
            response2.headers.append("Vary", "Accept");
          }
        }
        return response2;
      }
      if (state2.error && event2.isSubRequest) {
        const headers4 = new Headers(request.headers);
        headers4.set("x-sveltekit-error", "true");
        return await fetch(request, { headers: headers4 });
      }
      if (state2.error) return text("Internal Server Error", { status: 500 });
      if (state2.depth === 0) return await respond_with_error({
        event: event2,
        event_state,
        options: options2,
        manifest: manifest2,
        state: state2,
        status: 404,
        error: new SvelteKitError(404, "Not Found", `Not found: ${event2.url.pathname}`),
        resolve_opts
      });
      if (state2.prerendering) return text("not found", { status: 404 });
      const response = await fetch(request);
      return new Response(response.body, response);
    } catch (e3) {
      return await handle_fatal_error(event2, event_state, options2, e3);
    } finally {
      event2.cookies.set = () => {
        throw new Error("Cannot use `cookies.set(...)` after the response has been generated");
      };
      event2.setHeaders = () => {
        throw new Error("Cannot use `setHeaders(...)` after the response has been generated");
      };
    }
  }
}
function load_page_nodes(page3, manifest2) {
  return Promise.all([...page3.layouts.map((n2) => n2 == void 0 ? n2 : manifest2._.nodes[n2]()), manifest2._.nodes[page3.leaf]()]);
}
function propagate_context(fn) {
  return async (req, ...rest) => {
    return fn(req, ...rest);
  };
}
function filter_env(env, allowed, disallowed) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith(allowed) && (disallowed === "" || !k.startsWith(disallowed))));
}
var init_promise;
var current = null;
var Server = class {
  /** @type {import('types').SSROptions} */
  #options;
  /** @type {import('@sveltejs/kit').SSRManifest} */
  #manifest;
  /** @param {import('@sveltejs/kit').SSRManifest} manifest */
  constructor(manifest2) {
    this.#options = options;
    this.#manifest = manifest2;
    if (IN_WEBCONTAINER2) {
      const respond2 = this.respond.bind(this);
      this.respond = async (...args) => {
        const { promise, resolve: resolve2 } = with_resolvers();
        const previous = current;
        current = promise;
        await previous;
        return respond2(...args).finally(resolve2);
      };
    }
    set_manifest(manifest2);
  }
  /**
  * @param {import('@sveltejs/kit').ServerInitOptions} opts
  */
  async init({ env, read }) {
    const { env_public_prefix, env_private_prefix } = this.#options;
    set_private_env(filter_env(env, env_private_prefix, env_public_prefix));
    set_public_env(filter_env(env, env_public_prefix, env_private_prefix));
    if (read) {
      const wrapped_read = (file) => {
        const result = read(file);
        if (result instanceof ReadableStream) return result;
        else return new ReadableStream({ async start(controller2) {
          try {
            const stream = await Promise.resolve(result);
            if (!stream) {
              controller2.close();
              return;
            }
            const reader = stream.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller2.enqueue(value);
            }
            controller2.close();
          } catch (error2) {
            controller2.error(error2);
          }
        } });
      };
      set_read_implementation(wrapped_read);
    }
    await (init_promise ??= (async () => {
      try {
        const module = await get_hooks();
        this.#options.hooks = {
          handle: module.handle || (({ event, resolve: resolve2 }) => resolve2(event)),
          handleError: module.handleError || (({ status, error: error2, event }) => {
            const error_message = format_server_error(status, error2, event);
            console.error(error_message);
          }),
          handleFetch: module.handleFetch || (({ request, fetch: fetch2 }) => fetch2(request)),
          handleValidationError: module.handleValidationError || (({ issues }) => {
            console.error("Remote function schema validation failed:", issues);
            return { message: "Bad Request" };
          }),
          reroute: module.reroute || noop2,
          transport: module.transport || {}
        };
        module.transport && Object.fromEntries(Object.entries(module.transport).map(([k, v]) => [k, v.decode]));
        if (module.init) await module.init();
      } catch (e3) {
        throw e3;
      }
    })());
  }
  /**
  * @param {Request} request
  * @param {import('types').RequestOptions} options
  */
  async respond(request, options2) {
    return respond(request, this.#options, this.#manifest, {
      ...options2,
      error: false,
      depth: 0
    });
  }
};

// .svelte-kit/cloudflare-tmp/manifest.js
var manifest = (() => {
  function __memo(fn) {
    let value;
    return () => value ??= value = fn();
  }
  return {
    appDir: "_app",
    appPath: "_app",
    assets: /* @__PURE__ */ new Set(["robots.txt"]),
    mimeTypes: { ".txt": "text/plain" },
    _: {
      client: { start: "_app/immutable/entry/start.4E8FEKlo.js", app: "_app/immutable/entry/app.B4wrufvS.js", imports: ["_app/immutable/entry/start.4E8FEKlo.js", "_app/immutable/chunks/DxrAsuHp.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/BuFlayix.js", "_app/immutable/chunks/BZ4SA-SZ.js", "_app/immutable/entry/app.B4wrufvS.js", "_app/immutable/chunks/liYEefaB.js", "_app/immutable/chunks/HclGiUj8.js", "_app/immutable/chunks/xihTtKlq.js"], stylesheets: [], fonts: [], uses_env_dynamic_public: false },
      nodes: [
        __memo(() => Promise.resolve().then(() => (init__(), __exports))),
        __memo(() => Promise.resolve().then(() => (init__2(), __exports2))),
        __memo(() => Promise.resolve().then(() => (init__3(), __exports3))),
        __memo(() => Promise.resolve().then(() => (init__4(), __exports4))),
        __memo(() => Promise.resolve().then(() => (init__5(), __exports5))),
        __memo(() => Promise.resolve().then(() => (init__6(), __exports6))),
        __memo(() => Promise.resolve().then(() => (init__7(), __exports7))),
        __memo(() => Promise.resolve().then(() => (init__8(), __exports8))),
        __memo(() => Promise.resolve().then(() => (init__9(), __exports9))),
        __memo(() => Promise.resolve().then(() => (init__10(), __exports10))),
        __memo(() => Promise.resolve().then(() => (init__11(), __exports11))),
        __memo(() => Promise.resolve().then(() => (init__12(), __exports12))),
        __memo(() => Promise.resolve().then(() => (init__13(), __exports13))),
        __memo(() => Promise.resolve().then(() => (init__14(), __exports14))),
        __memo(() => Promise.resolve().then(() => (init__15(), __exports15))),
        __memo(() => Promise.resolve().then(() => (init__16(), __exports16)))
      ],
      remotes: {},
      routes: [
        {
          id: "/",
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 4 },
          endpoint: null
        },
        {
          id: "/api/customers",
          pattern: /^\/api\/customers\/?$/,
          params: [],
          page: null,
          endpoint: __memo(() => Promise.resolve().then(() => (init_server_ts(), server_ts_exports)))
        },
        {
          id: "/api/orders",
          pattern: /^\/api\/orders\/?$/,
          params: [],
          page: null,
          endpoint: __memo(() => Promise.resolve().then(() => (init_server_ts2(), server_ts_exports2)))
        },
        {
          id: "/api/tasks/[id]",
          pattern: /^\/api\/tasks\/([^/]+?)\/?$/,
          params: [{ "name": "id", "optional": false, "rest": false, "chained": false }],
          page: null,
          endpoint: __memo(() => Promise.resolve().then(() => (init_server_ts3(), server_ts_exports3)))
        },
        {
          id: "/(admin)/customers",
          pattern: /^\/customers\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 5 },
          endpoint: null
        },
        {
          id: "/customer/[token]",
          pattern: /^\/customer\/([^/]+?)\/?$/,
          params: [{ "name": "token", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0, 3], errors: [1, ,], leaf: 13 },
          endpoint: null
        },
        {
          id: "/(admin)/dashboard",
          pattern: /^\/dashboard\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 6 },
          endpoint: null
        },
        {
          id: "/(admin)/editors",
          pattern: /^\/editors\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 7 },
          endpoint: null
        },
        {
          id: "/editor/[token]",
          pattern: /^\/editor\/([^/]+?)\/?$/,
          params: [{ "name": "token", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0], errors: [1], leaf: 14 },
          endpoint: null
        },
        {
          id: "/(admin)/invoices",
          pattern: /^\/invoices\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 8 },
          endpoint: null
        },
        {
          id: "/login",
          pattern: /^\/login\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 15 },
          endpoint: null
        },
        {
          id: "/(admin)/orders",
          pattern: /^\/orders\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 9 },
          endpoint: null
        },
        {
          id: "/(admin)/orders/[id]",
          pattern: /^\/orders\/([^/]+?)\/?$/,
          params: [{ "name": "id", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 10 },
          endpoint: null
        },
        {
          id: "/(admin)/settings",
          pattern: /^\/settings\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 11 },
          endpoint: null
        },
        {
          id: "/(admin)/settings/sheets",
          pattern: /^\/settings\/sheets\/?$/,
          params: [],
          page: { layouts: [0, 2], errors: [1, ,], leaf: 12 },
          endpoint: null
        }
      ],
      prerendered_routes: /* @__PURE__ */ new Set([]),
      matchers: async () => {
        return {};
      },
      server_assets: {}
    }
  };
})();
var prerendered = /* @__PURE__ */ new Set([]);
var base_path = "";

// .svelte-kit/cloudflare/_worker.js
async function e(e3, t2) {
  let n2 = "string" != typeof t2 && "HEAD" === t2.method;
  n2 && (t2 = new Request(t2, { method: "GET" }));
  let r3 = await e3.match(t2);
  return n2 && r3 && (r3 = new Response(null, r3)), r3;
}
function t(e3, t2, n2, o2) {
  return ("string" == typeof t2 || "GET" === t2.method) && r2(n2) && (n2.headers.has("Set-Cookie") && (n2 = new Response(n2.body, n2)).headers.append("Cache-Control", "private=Set-Cookie"), o2.waitUntil(e3.put(t2, n2.clone()))), n2;
}
var n = /* @__PURE__ */ new Set([200, 203, 204, 300, 301, 404, 405, 410, 414, 501]);
function r2(e3) {
  if (!n.has(e3.status)) return false;
  if (~(e3.headers.get("Vary") || "").indexOf("*")) return false;
  let t2 = e3.headers.get("Cache-Control") || "";
  return !/(private|no-cache|no-store)/i.test(t2);
}
function o(n2) {
  return async function(r3, o2) {
    let a = await e(n2, r3);
    if (a) return a;
    o2.defer(((e3) => {
      t(n2, r3, e3, o2);
    }));
  };
}
var server = new Server(manifest);
var app_path = `/${manifest.appPath}`;
var immutable = `${app_path}/immutable/`;
var version_file = `${app_path}/version.json`;
var origin;
var initialized;
var worker_default = {
  /**
   * @param {Request} req
   * @param {{ ASSETS: { fetch: typeof fetch } }} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(req, env2, ctx) {
    const defaultCache = globalThis.caches?.default;
    if (!origin) {
      origin = new URL(req.url).origin;
    }
    if (!initialized) {
      initialized = server.init({
        env: env2,
        read: async (file) => {
          const url = `${origin}/${file}`;
          const response = await env2.ASSETS.fetch(url);
          if (!response.ok) throw new Error(`read(...) failed: could not fetch ${url}`);
          return response.body;
        }
      });
    }
    await initialized;
    let pragma = req.headers.get("cache-control") || "";
    let res = defaultCache && !pragma.includes("no-cache") ? await e(defaultCache, req) : void 0;
    if (res) return res;
    let { pathname, search } = new URL(req.url);
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
    }
    const stripped_pathname = pathname.replace(/\/$/, "");
    let is_static_asset = false;
    const filename = stripped_pathname.slice(base_path.length + 1);
    if (filename) {
      is_static_asset = manifest.assets.has(filename) || manifest.assets.has(filename + "/index.html") || filename in manifest._.server_assets || filename + "/index.html" in manifest._.server_assets;
    }
    let location = pathname.at(-1) === "/" ? stripped_pathname : pathname + "/";
    if (is_static_asset || prerendered.has(pathname) || pathname === version_file || pathname.startsWith(immutable)) {
      res = await env2.ASSETS.fetch(req);
    } else if (location && prerendered.has(location)) {
      if (search) location += search;
      res = new Response("", {
        status: 308,
        headers: {
          location
        }
      });
    } else {
      res = await server.respond(req, {
        platform: {
          env: env2,
          ctx,
          context: ctx,
          // deprecated in favor of ctx
          // @ts-expect-error webworker types from worktop are not compatible with Cloudflare Workers types
          caches: globalThis.caches,
          // @ts-expect-error the type is correct but ts is confused because platform.cf uses the type from index.ts while req.cf uses the type from index.d.ts
          cf: req.cf
        },
        getClientAddress() {
          return (
            /** @type {string} */
            req.headers.get("cf-connecting-ip")
          );
        }
      });
    }
    pragma = res.headers.get("cache-control") || "";
    return defaultCache && pragma && res.status < 400 ? t(defaultCache, req, res, ctx) : res;
  }
};
export {
  worker_default as default
};
/**
* @license lucide-svelte v1.0.1 - ISC
*
* ISC License
* 
* Copyright (c) 2026 Lucide Icons and Contributors
* 
* Permission to use, copy, modify, and/or distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
* 
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
* 
* ---
* 
* The following Lucide icons are derived from the Feather project:
* 
* airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
* 
* The MIT License (MIT) (for the icons listed above)
* 
* Copyright (c) 2013-present Cole Bemis
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* 
*/
/**
* @license lucide-svelte v1.0.1 - ISC
*
* ISC License
*
* Copyright (c) 2026 Lucide Icons and Contributors
*
* Permission to use, copy, modify, and/or distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
*
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*
* ---
*
* The following Lucide icons are derived from the Feather project:
*
* airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
*
* The MIT License (MIT) (for the icons listed above)
*
* Copyright (c) 2013-present Cole Bemis
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
*/
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
