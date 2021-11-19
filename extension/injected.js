(() => {
  const isFuncProperty = (obj, key) => {
    if (key === "constructor" || key === "prototype") {
      // except constructor
      return false;
    }
    let is = false;
    try {
      is = typeof obj[key] === "function";
    } catch (e) {
      // ignore
    }
    return is;
  };

  const NativeFunctionChecker = () => {
    const aliasMap = {
      "String.prototype.trimLeft": "trimStart",
      "String.prototype.trimRight": "trimEnd",
      "Date.prototype.toGMTString": "toUTCString",
      "Set.prototype.keys": "values",
    };
    const nativeFunctionString = (canonicalName) => {
      let funcName = canonicalName.split(".").pop();
      if (Object.prototype.hasOwnProperty.call(aliasMap, canonicalName)) {
        funcName = aliasMap[canonicalName];
      }
      return `function ${funcName}() { [native code] }`;
    };
    const isNativeFunc = (func, canonicalName) => {
      const funcExpression = func.toString().replace(/\s+/g, " ");
      const expected = nativeFunctionString(canonicalName);
      const is = funcExpression === expected;
      return is;
    };
    return isNativeFunc;
  };

  function listOverwrittenGlobalFunctions() {
    const globals = [
      "Object",
      "Function",
      "Array",
      "String",
      "RegExp",
      "Number",
      "Math",
      "Date",
      "Promise",
      "Symbol",
      "Map",
      "Set",
      "WeakMap",
      "WeakSet",
      "ArrayBuffer",
      "DataView",
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Uint16Array",
      "Int32Array",
      "Uint32Array",
      "Float32Array",
      "Float64Array",
      "Reflect",
      "JSON",
    ];
    const isNativeFunc = NativeFunctionChecker();
    const overwrittens = [];
    for (const klassName of globals) {
      const klass = window[klassName];
      for (const funcName of Object.getOwnPropertyNames(klass)) {
        if (isFuncProperty(klass, funcName)) {
          const func = klass[funcName];
          const canonicalName = `${klassName}.${funcName}`;
          if (!isNativeFunc(func, canonicalName)) {
            overwrittens.push(canonicalName);
          }
        }
      }

      if (!klass.prototype) {
        continue;
      }
      for (const funcName of Object.getOwnPropertyNames(klass.prototype)) {
        if (isFuncProperty(klass.prototype, funcName)) {
          const func = klass.prototype[funcName];
          const canonicalName = `${klassName}.prototype.${funcName}`;
          if (!isNativeFunc(func, canonicalName)) {
            overwrittens.push(canonicalName);
          }
        }
      }
    }

    return overwrittens;
  }

  setTimeout(() => {
    try {
      console.debug("[global-pollution-detector] executing")
      const overwrittens = listOverwrittenGlobalFunctions();
      console.debug("[global-pollution-detector] done")
      console.debug(overwrittens)
      window.postMessage({
        type: "RESPONSE_OVERWRITTEN_FUNCTIONS",
        payload: overwrittens,
      });
    } catch (err) {
      console.error(err)
    }
  }, 100);
})();
