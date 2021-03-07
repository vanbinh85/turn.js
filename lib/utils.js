(function ($) {
    var cssPrefixes = ["Webkit", "Moz", "ms", "o"],
        emptyStyle = document.createElement("div").style,
        vendorProps = {},
        rdashAlpha = /-([a-z])/g,
        rmsPrefix = /^-ms-/,
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rcustomProp = /^--/,
        cssShow = { position: "absolute", visibility: "hidden", display: "block" },
        cssNormalTransform = {
            letterSpacing: "0",
            fontWeight: "400"
        },
        reliableTrDimensionsVal,
        isIE = document.documentMode,
        cssExpand = ["Top", "Right", "Bottom", "Left"],
        cssHooks = {},
        rcssNum = /^(?:([+-])=|)(" + pnum + ")([a-z%]*)$/i,
        ralphaStart = /^[a-z]/,
        pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
        rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
        rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;

        var dataStorage = {
            _storage: new WeakMap(),
            put: function (element, key, obj) {
                if (!this._storage.has(element)) {
                    this._storage.set(element, new Map());
                }
                this._storage.get(element).set(key, obj);
            },
            get: function (element, key) {
                return this._storage.get(element).get(key);
            },
            has: function (element, key) {
                return this._storage.has(element) && this._storage.get(element).has(key);
            },
            remove: function (element, key) {
                var ret = this._storage.get(element).delete(key);
                if (!this._storage.get(element).size === 0) {
                    this._storage.delete(element);
                }
                return ret;
            }
        }

    function map(arr, callback/*, thisArg*/) {

        var T, A, k;

        if (arr == null) {
            throw '@arr this is null or not defined';
        }

        // 1. Let O be the result of calling ToObject passing the |this| 
        //    value as the argument.
        var O = Object(arr);

        // 2. Let lenValue be the result of calling the Get internal 
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let A be a new array created as if by the expression new Array(len) 
        //    where Array is the standard built-in constructor with that name and 
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal 
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal 
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal 
                //     method of callback with T as the this value and argument 
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    }

    function forEach(arr, executor, context) {
        let i = 0, ii = 0;
        if (!isFunction(executor) || !isArray(arr) || !(ii = arr.length)) return;

        for (; i < ii; i++) {
            executor.apply(context || arr[i], [arr[i], i, arr]);
        }
    }

    function isString(str) {
        return Object.prototype.toString.apply(str) === '[object String]';
    }

    function isObject(obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    }

    function isArray(arr) {
        return Object.prototype.toString.apply(arr) === '[object Array]';
    }

    function isFunction(func) {
        return Object.prototype.toString.apply(func) === '[object Function]';
    }

    function isNumeric(num) {
        return Object.prototype.toString.apply(num) === '[object Number]';
    }

    function isBoolean(boolVal) {
        return Object.prototype.toString.apply(boolVal) === '[object Boolean]';
    }

    function deepExtend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];

            if (!obj) continue;

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') {
                        if (obj[key] instanceof Array == true)
                            out[key] = obj[key].slice(0);
                        else
                            out[key] = deepExtend(out[key], obj[key]);
                    }
                    else
                        out[key] = obj[key];
                }
            }
        }

        return out;
    }

    function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    }
    // Return a vendor-prefixed property or undefined
    function vendorPropName(name) {

        // Check for vendor prefixed names
        var capName = name[0].toUpperCase() + name.slice(1),
            i = cssPrefixes.length;

        while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in emptyStyle) {
                return name;
            }
        }
    }

    // Return a potentially-mapped vendor prefixed property
    function finalPropName(name) {
        var final = vendorProps[name];

        if (final) {
            return final;
        }
        if (name in emptyStyle) {
            return name;
        }
        return vendorProps[name] = vendorPropName(name) || name;
    }

    function fcamelCase(_all, letter) {
        return letter.toUpperCase();
    }

    function camelCase(string) {
        return string.replace(rdashAlpha, fcamelCase);
    }

    function cssCamelCase(string) {
        return camelCase(string.replace(rmsPrefix, "ms-"));
    }

    function isAutoPx(prop) {

        // The first test is used to ensure that:
        // 1. The prop starts with a lowercase letter (as we uppercase it for the second regex).
        // 2. The prop is not empty.
        return ralphaStart.test(prop) &&
            rautoPx.test(prop[0].toUpperCase() + prop.slice(1));
    };

    function getStyle(el, cssprop) {
        if (el.currentStyle) //IE
            return el.currentStyle[cssprop];
        else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
            return document.defaultView.getComputedStyle(el, "")[cssprop];
        else //try and get inline style
            return el.style[cssprop];
    }

    function adjustCSS(elem, prop, valueParts, tween) {
        var adjusted, scale,
            maxIterations = 20,
            currentValue = tween ?
                function () {
                    return tween.cur();
                } :
                function () {
                    return getStyle(elem, prop);
                },
            initial = currentValue(),
            unit = valueParts && valueParts[3] || (isAutoPx(prop) ? "px" : ""),

            // Starting value computation is required for potential unit mismatches
            initialInUnit = elem.nodeType && (!isAutoPx(prop) || unit !== "px" && +initial) && rcssNum.exec(domCss(elem, prop));

        if (initialInUnit && initialInUnit[3] !== unit) {

            // Support: Firefox <=54 - 66+
            // Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
            initial = initial / 2;

            unit = unit || initialInUnit[3];

            // Iteratively approximate from a nonzero starting point
            initialInUnit = +initial || 1;

            while (maxIterations--) {

                // Evaluate and update our best guess (doubling guesses that zero out).
                // Finish if the scale equals or crosses 1 (making the old*new product non-positive).
                domStyle(elem, prop, initialInUnit + unit);
                if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
                    maxIterations = 0;
                }
                initialInUnit = initialInUnit / scale;

            }

            initialInUnit = initialInUnit * 2;
            domStyle(elem, prop, initialInUnit + unit);

            // Make sure we update the tween properties later on
            valueParts = valueParts || [];
        }

        if (valueParts) {
            initialInUnit = +initialInUnit || +initial || 0;

            // Apply relative offset (+=/-=) if specified
            adjusted = valueParts[1] ?
                initialInUnit + (valueParts[1] + 1) * valueParts[2] :
                +valueParts[2];
            if (tween) {
                tween.unit = unit;
                tween.start = initialInUnit;
                tween.end = adjusted;
            }
        }
        return adjusted;
    }

    function toType(obj) {
        if (obj == null) {
            return obj + "";
        }

        return typeof obj;
    }

    var access = function (elems, fn, key, value, chainable, emptyGet, raw) {
        var i = 0,
            len = elems.length,
            bulk = key == null;

        // Sets many values
        if (toType(key) === "object") {
            chainable = true;
            for (i in key) {
                access(elems, fn, i, key[i], true, emptyGet, raw);
            }

            // Sets one value
        } else if (value !== undefined) {
            chainable = true;

            if (typeof value !== "function") {
                raw = true;
            }

            if (bulk) {

                // Bulk operations run against the entire set
                if (raw) {
                    fn.call(elems, value);
                    fn = null;

                    // ...except when executing function values
                } else {
                    bulk = fn;
                    fn = function (elem, _key, value) {
                        return bulk.call(elem, value);
                    };
                }
            }

            if (fn) {
                for (; i < len; i++) {
                    fn(
                        elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key))
                    );
                }
            }
        }

        if (chainable) {
            return elems;
        }

        // Gets
        if (bulk) {
            return fn.call(elems);
        }

        return len ? fn(elems[0], key) : emptyGet;
    };

    function getStyles(elem) {

        // Support: IE <=11+ (trac-14150)
        // In IE popup's `window` is the opener window which makes `window.getComputedStyle( elem )`
        // break. Using `elem.ownerDocument.defaultView` avoids the issue.
        var view = elem.ownerDocument.defaultView;

        // `document.implementation.createHTMLDocument( "" )` has a `null` `defaultView`
        // property; check `defaultView` truthiness to fallback to window in such a case.
        if (!view) {
            view = window;
        }

        return view.getComputedStyle(elem);
    };

    function isAttached(elem) {
        if (document.getRootNode) {
            return elem.getRootNode({ composed: true }) === elem.ownerDocument;
        }
        return elem.ownerDocument.contains(elem);
    };

    function curCSS(elem, name, computed) {
        var ret;

        computed = computed || getStyles(elem);

        // getPropertyValue is needed for `.css('--customProperty')` (gh-3144)
        if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];

            if (ret === "" && !isAttached(elem)) {
                ret = domStyle(elem, name, null);
            }
        }

        return ret !== undefined ?

            // Support: IE <=9 - 11+
            // IE returns zIndex value as an integer.
            ret + "" :
            ret;
    }

    function swap(elem, options, callback) {
        var ret, name,
            old = {};

        // Remember the old values, and insert the new ones
        for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }

        ret = callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem.style[name] = old[name];
        }

        return ret;
    }

    function setPositiveNumber(_elem, value, subtract) {

        // Any relative (+/-) values have already been
        // normalized at this point
        var matches = rcssNum.exec(value);
        return matches ?

            // Guard against undefined "subtract", e.g., when used as in cssHooks
            Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") :
            value;
    }

    function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
        var i = dimension === "width" ? 1 : 0,
            extra = 0,
            delta = 0;

        // Adjustment may not be necessary
        if (box === (isBorderBox ? "border" : "content")) {
            return 0;
        }

        for (; i < 4; i += 2) {

            // Both box models exclude margin
            if (box === "margin") {
                delta += domCss(elem, box + cssExpand[i], true, styles);
            }

            // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
            if (!isBorderBox) {

                // Add padding
                delta += domCss(elem, "padding" + cssExpand[i], true, styles);

                // For "border" or "margin", add border
                if (box !== "padding") {
                    delta += domCss(elem, "border" + cssExpand[i] + "Width", true, styles);

                    // But still keep track of it otherwise
                } else {
                    extra += domCss(elem, "border" + cssExpand[i] + "Width", true, styles);
                }

                // If we get here with a border-box (content + padding + border), we're seeking "content" or
                // "padding" or "margin"
            } else {

                // For "content", subtract padding
                if (box === "content") {
                    delta -= domCss(elem, "padding" + cssExpand[i], true, styles);
                }

                // For "content" or "padding", subtract border
                if (box !== "margin") {
                    delta -= domCss(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            }
        }

        // Account for positive content-box scroll gutter when requested by providing computedVal
        if (!isBorderBox && computedVal >= 0) {

            // offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
            // Assuming integer scroll gutter, subtract the rest and round down
            delta += Math.max(0, Math.ceil(
                elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
                computedVal -
                delta -
                extra -
                0.5

                // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
                // Use an explicit zero to avoid NaN (gh-3964)
            )) || 0;
        }

        return delta;
    }

    // Support: IE 11+, Edge 15 - 18+
    // IE/Edge misreport `getComputedStyle` of table rows with width/height
    // set in CSS while `offset*` properties report correct values.
    function reliableTrDimensions() {
        var table, tr, trChild;
        if (reliableTrDimensionsVal == null) {
            table = document.createElement("table");
            tr = document.createElement("tr");
            trChild = document.createElement("div");

            table.style.cssText = "position:absolute;left:-11111px";
            tr.style.height = "1px";
            trChild.style.height = "9px";

            document.documentElement
                .appendChild(table)
                .appendChild(tr)
                .appendChild(trChild);

            var trStyle = window.getComputedStyle(tr);
            reliableTrDimensionsVal = parseInt(trStyle.height) > 3;

            document.documentElement.removeChild(table);
        }
        return reliableTrDimensionsVal;
    }

    function nodeName(elem, name) {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    }

    function getWidthOrHeight(elem, dimension, extra) {

        // Start with computed style
        var styles = getStyles(elem),

            // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
            // Fake content-box until we know it's needed to know the true value.
            boxSizingNeeded = isIE || extra,
            isBorderBox = boxSizingNeeded &&
                domCss(elem, "boxSizing", false, styles) === "border-box",
            valueIsBorderBox = isBorderBox,

            val = curCSS(elem, dimension, styles),
            offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);

        // Return a confounding non-pixel value or feign ignorance, as appropriate.
        if (rnumnonpx.test(val)) {
            if (!extra) {
                return val;
            }
            val = "auto";
        }


        // Support: IE 9 - 11+
        // Use offsetWidth/offsetHeight for when box sizing is unreliable.
        // In those cases, the computed value can be trusted to be border-box.
        if ((isIE && isBorderBox ||

            // Support: IE 10 - 11+, Edge 15 - 18+
            // IE/Edge misreport `getComputedStyle` of table rows with width/height
            // set in CSS while `offset*` properties report correct values.
            !reliableTrDimensions() && nodeName(elem, "tr") ||

            // Fall back to offsetWidth/offsetHeight when value is "auto"
            // This happens for inline elements with no explicit setting (gh-3571)
            val === "auto") &&

            // Make sure the element is visible & connected
            elem.getClientRects().length) {

            isBorderBox = domCss(elem, "boxSizing", false, styles) === "border-box";

            // Where available, offsetWidth/offsetHeight approximate border box dimensions.
            // Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
            // retrieved value as a content box dimension.
            valueIsBorderBox = offsetProp in elem;
            if (valueIsBorderBox) {
                val = elem[offsetProp];
            }
        }

        // Normalize "" and auto
        val = parseFloat(val) || 0;

        // Adjust for the element's box model
        return (val +
            boxModelAdjustment(
                elem,
                dimension,
                extra || (isBorderBox ? "border" : "content"),
                valueIsBorderBox,
                styles,

                // Provide the current computed size to request scroll gutter calculation (gh-3589)
                val
            )
        ) + "px";
    }

    for (var i = 0, arr = ["height", "width"]; i < arr.length; i++) {
        var val = arr[i];
        cssHooks[val] = {
            get: function (elem, computed, extra) {
                if (computed) {

                    // Certain elements can have dimension info if we invisibly show them
                    // but it must have a current display style that would benefit
                    return rdisplayswap.test(domCss(elem, "display")) &&

                        // Support: Safari <=8 - 12+, Chrome <=73+
                        // Table columns in WebKit/Blink have non-zero offsetWidth & zero
                        // getBoundingClientRect().width unless display is changed.
                        // Support: IE <=11+
                        // Running getBoundingClientRect on a disconnected node
                        // in IE throws an error.
                        (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ?
                        swap(elem, cssShow, function () {
                            return getWidthOrHeight(elem, val, extra);
                        }) :
                        getWidthOrHeight(elem, val, extra);
                }
            },

            set: function (elem, value, extra) {
                var matches,
                    styles = getStyles(elem),

                    // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
                    isBorderBox = extra &&
                        domCss(elem, "boxSizing", false, styles) === "border-box",
                    subtract = extra ?
                        boxModelAdjustment(
                            elem,
                            val,
                            extra,
                            isBorderBox,
                            styles
                        ) :
                        0;

                // Convert to pixels if value adjustment is needed
                if (subtract && (matches = rcssNum.exec(value)) &&
                    (matches[3] || "px") !== "px") {

                    elem.style[val] = value;
                    value = domCss(elem, val);
                }

                return setPositiveNumber(elem, value, subtract);
            }
        };
    };

    for (var i = 0, arr = ['margin', 'padding', 'border-Width']; i < arr.length; i++) {
        var val = arr[i].split('-');

        let prefix = val[0],
            suffix = val.length > 1 ? val[1] : '';

        cssHooks[prefix + suffix] = {
            expand: function (value) {
                var i = 0,
                    expanded = {},

                    // Assumes a single number if not a string
                    parts = typeof value === "string" ? value.split(" ") : [value];

                for (; i < 4; i++) {
                    expanded[prefix + cssExpand[i] + suffix] =
                        parts[i] || parts[i - 2] || parts[0];
                }

                return expanded;
            }
        };

        if (prefix !== "margin") {
            cssHooks[prefix + suffix].set = setPositiveNumber;
        }
    };

    function domContains(el, child) {
        return el && child && el !== child && el.contains(child);
    }

    function domReady(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function domIsNode(o) {
        return (
            typeof Node === "object" ? o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    }

    //Returns true if it is a DOM element
    function domIsElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }

    function domStyle(elem, name, value, extra) {
        // Don't set styles on text and comment nodes
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }

        var ret,
            type,
            hooks,
            origName = cssCamelCase(name),
            isCustomProp = rcustomProp.test(name),
            style = elem.style;

        if (!isCustomProp) {
            name = finalPropName(origName);
        }

        // Gets hook for the prefixed version, then unprefixed version
        hooks = cssHooks[name] || cssHooks[origName];

        if (value !== undefined) {
            type = typeof value;

            if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
                value = adjustCSS(elem, name, ret);

                type = "number";
            }

            if (value == null || value !== value) {
                return;
            }

            // If the value is a number, add `px` for certain CSS properties
            if (type === "number") {
                value += ret && ret[3] || (isAutoPx(origName) ? "px" : "");
            }

            if (document.documentMode && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
            }

            if (isCustomProp) {
                style.setProperty(name, value);
            } else {
                style[name] = value;
            }

            // If a hook was provided, use that value, otherwise just set the specified value
            if (!hooks || !("set" in hooks) ||
                (value = hooks.set(elem, value, extra)) !== undefined) {

                if (isCustomProp) {
                    style.setProperty(name, value);
                } else {
                    style[name] = value;
                }
            }
        } else {
            // If a hook was provided get the non-computed value from there
            if (hooks && "get" in hooks &&
                (ret = hooks.get(elem, false, extra)) !== undefined) {

                return ret;
            }

            // Otherwise just get the value from the style object
            return style[name];
        }
    }

    function domCss(elem, name, extra, styles) {
        var val, num, hooks,
            origName = cssCamelCase(name),
            isCustomProp = rcustomProp.test(name);

        // Make sure that we're working with the right name. We don't
        // want to modify the value if it is a CSS custom property
        // since they are user-defined.
        if (!isCustomProp) {
            name = finalPropName(origName);
        }

        // Try prefixed name followed by the unprefixed name
        hooks = cssHooks[name] || cssHooks[origName];

        // If a hook was provided get the computed value from there
        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }

        // Convert "normal" to computed value
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
        }

        // Make numeric if forced or a qualifier was provided and val looks numeric
        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || isFinite(num) ? num || 0 : val;
        }

        return val;
    }

    function transformCSS(input) {
        var c = browser.safari && 10.3 <= browser.version
            , transform = ''
            , csses = []
            , transformParams = {};
        if (input.perspective !== undefined && input.perspective !== null && input.perspective != 0) {
            transform += "perspective(" + input.perspective + "px) ";
        }
        if (input.tran) {
            if (browser.msie && !c)
                transform += "translate(" + input.tran.x + "px," + input.tran.y + "px) ";
            else
                transform += "translate3d(" + input.tran.x + "px," + input.tran.y + "px,0px) ";
        }
        if (input.rotate) transform += "rotate(" + input.rotate + "deg) ";
        if (input.rotateY) transform += "rotateY(" + input.rotateY + "deg) ";
        if (input.rotateX) transform += "rotateX(" + input.rotateX + "deg) ";
        if (input.scale !== undefined && input.scale !== null && input.scale != 0) {
            if (browser.msie && !c)
                transform += "scale(" + input.scale + ") ";
            else
                transform += "scale3d(" + input.scale + "," + input.scale + ",1) ";
        }
        if (input.scaleX) transform += "scaleX(" + input.scaleX + ") ";
        if (input.scaleY) transform += "scaleY(" + input.scaleY + ") ";
        if (input.origin) {
            var origin = input.origin.x + "% " + input.origin.y + "%";
            csses = map(cssPrefixes, function (val) {
                return '-' + val.toLowerCase() + '-transform-origin'
            })
            csses.push('transform-origin');

            forEach(csses, function (val) {
                transformParams[val] = origin;
            });
        }

        if (transform && transform.length > 0) {
            csses = map(cssPrefixes, function (val) {
                return '-' + val.toLowerCase() + '-transform';
            });
            csses.push('transform');

            forEach(csses, function (val) {
                transformParams[val] = transform;
            });
        }

        return transformParams;
    }

    function domAttr(element, attrName, value) {
        if (isString(attrName)) {
            if (value !== null) {
                element.setAttribute(attrName, value);
            }
            else {
                element.getAttribute(attrName);
            }
        }

        if (isObject(attrName)) {
            for (const attr in attrName) {
                if (attrName.hasOwnProperty(attr)) {
                    element.setAttribute(attr, attrName[attr]);
                }
            }
        }
    }

    function domRemoveAttr(element, attr) {
        element.removeAttribute(attr);
    }

    function domAddClass(element) {
        forEach(Array.prototype.slice.call(arguments, 1), function (cls) {
            element.classList.add(cls);
        });
    }

    function domRemoveClass(element) {
        forEach(Array.prototype.slice.call(arguments, 1), function (cls) {
            element.classList.remove(cls);
        });
    }

    function domHasClass(element, cls) {
        return element.classList.contains(cls);
    }

    function domAppend (parent, child) {

        parent.appendChild(child);
        return parent;
    }

    function domPrepend(parent, element) {
        parent.insertBefore(element, this.parent.firstChild);
        return parent;
    }

    function domAppendTo(child, parent) {

        parent.appendChild(child);
        return child;
    }

   function domPrependTo(child, parent) {

        parent.insertBefore(child, parent.firstChild);
        return child;
    }

    function domRemove(element) {
        element.remove();
    }

    function domOffset(element) {
        var rect = element.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    function domPosition (element) {
        return {
            left: element.offsetLeft,
            top: element.offsetTop
        };
    }

    function domHeight(element) {
        if (arguments.length == 1) {
            return Math.max(element.clientHeight, element.offsetHeight);
        }

        function setHeight(el, val) {
            if (isFunction(val)) val = val();
            if (isString(val)) el.style.height = val;
            else el.style.height = val + "px";
        }

        setHeight(element, arguments[1]);
    }

    function domWidth (element) {
        if (arguments.length == 1) {
            return Math.max(element.clientWidth, element.offsetWidth);
        }

        function setWidth(el, val) {
            if (isFunction(val)) val = val();
            if (isString(val)) el.style.width = val;
            else el.style.width = val + "px";
        }

        setWidth(element, arguments[1]);
    }

    var isEventSupported = (function(){
        var TAGNAMES = {
          'select':'input','change':'input',
          'submit':'form','reset':'form',
          'error':'img','load':'img','abort':'img'
        }
        function isEventSupported(eventName) {
          var el = document.createElement(TAGNAMES[eventName] || 'div');
          eventName = 'on' + eventName;
          var isSupported = (eventName in el);
          if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
          }
          el = null;
          return isSupported;
        }
        return isEventSupported;
      })();

    function HTMLElementWrapper(nativeElement) {
        this.nativeElement = nativeElement;
        this.nativeElement.dataset = {};
    }

    HTMLElementWrapper.prototype.addClass = function () {

        forEach(Array.prototype.slice.call(arguments), function (cls) {
            this.nativeElement.classList.add(cls);
        }, this);

        return this;
    }

    HTMLElementWrapper.prototype.removeClass = function () {
        forEach(Array.prototype.slice.call(arguments), function (cls) {
            this.nativeElement.classList.remove(cls);
        }, this);

        return this;
    }

    HTMLElementWrapper.prototype.hasClass = function (className) {
        return this.nativeElement.classList.contains(className);
    }

    /**
     * Inserts the a new element before this element.
     * @param insertedElement The inserted element.
     */
    HTMLElementWrapper.prototype.after = function (insertedElement) {
        this.nativeElement.insertAdjacentElement('afterend', insertedElement);
        return this;
    }

    HTMLElementWrapper.prototype.before = function (insertedElement) {

        this.nativeElement.insertAdjacentElement('beforebegin', insertedElement);
        return this;
    }

    HTMLElementWrapper.prototype.append = function (element) {

        this.nativeElement.appendChild(element);
        return this;
    }

    HTMLElementWrapper.prototype.prepend = function (element) {

        this.nativeElement.insertBefore(element, this.nativeElement.firstChild);
        return this;
    }

    HTMLElementWrapper.prototype.appendTo = function (parentEl) {

        parentEl.appendChild(this.nativeElement);
        return this;
    }

    HTMLElementWrapper.prototype.prependTo = function (parentEl) {

        parentEl.insertBefore(this.nativeElement, parentEl.firstChild);
        return this;
    }

    HTMLElementWrapper.prototype.next = function () {
        return this.nativeElement.nextElementSibling;
    }

    HTMLElementWrapper.prototype.prev = function () {
        return this.nativeElement.previousElementSibling;
    }

    HTMLElementWrapper.prototype.children = function () {
        return this.nativeElement.children;
    }

    HTMLElementWrapper.prototype.clone = function () {
        return this.nativeElement.cloneNode(true);
    }

    HTMLElementWrapper.prototype.contains = function (child) {
        return child && this.nativeElement !== child && this.nativeElement.contains(child);
    }

    HTMLElementWrapper.prototype.find = function (selector) {
        return this.nativeElement.querySelectorAll(selector);
    }

    HTMLElementWrapper.prototype.empty = function () {
        while (this.nativeElement.firstChild) {
            this.nativeElement.removeChild(this.nativeElement.firstChild);
        }
    }

    HTMLElementWrapper.prototype.remove = function () {
        this.nativeElement.parentNode.removeChild(this.nativeElement);
        delete this.nativeElement;
    }

    HTMLElementWrapper.prototype.filter = function (selector, filterFn) {
        filterFn = isFunction(filterFn) ? filterFn : void 0;
        return Array.prototype.filter.apply(this.nativeElement.querySelectorAll(selector), filterFn);
    }
    HTMLElementWrapper.prototype.show = function () {
        this.nativeElement.style.display = 'block';
        return this;
    }

    HTMLElementWrapper.prototype.hide = function () {
        this.nativeElement.style.display = 'none';
        return this;
    }

    HTMLElementWrapper.prototype.attr = function (attrName, value) {
        if (isString(attrName)) {
            if (value !== null) {
                this.nativeElement.setAttribute(attrName, value);
            }
            else {
                return this.nativeElement.getAttribute(attrName);
            }
        }

        if (isObject(attrName)) {
            for (const attr in attrName) {
                if (attrName.hasOwnProperty(attr)) {
                    this.nativeElement.setAttribute(attr, attrName[attr]);
                }
            }
        }
    }

    HTMLElementWrapper.prototype.removeAttr = function (attrName) {
        this.nativeElement.removeAttribute(attrName);
    }

    HTMLElementWrapper.prototype.offset = function () {
        var rect = this.nativeElement.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    HTMLElementWrapper.prototype.position = function () {
        return {
            left: this.nativeElement.offsetLeft,
            top: this.nativeElement.offsetTop
        };
    }

    HTMLElementWrapper.prototype.height = function (h) {
        if (arguments.length == 0) {
            return Math.max(this.nativeElement.clientHeight, this.nativeElement.offsetHeight);
        }

        function setHeight(el, val) {
            if (isFunction(val)) val = val();
            if (isString(val)) el.style.height = val;
            else el.style.height = val + "px";
        }

        setHeight(this.nativeElement, h);
    }

    HTMLElementWrapper.prototype.width = function (w) {
        if (arguments.length == 0) {
            return Math.max((this.nativeElement).clientWidth, (this.nativeElement).offsetWidth);
        }

        function setWidth(el, val) {
            if (isFunction(val)) val = val();
            if (isString(val)) el.style.width = val;
            else el.style.width = val + "px";
        }

        setWidth(this.nativeElement, w);
    }

    HTMLElementWrapper.prototype.on = function (type, listener) {
        this.nativeElement.addEventListener(type, listener, false);
        return this;
    }

    HTMLElementWrapper.prototype.off = function (type, listener) {
        this.nativeElement.removeEventListener(type, listener, false);
        return this;
    }

    HTMLElementWrapper.prototype.trigger = function(type) {
        var args = Array.prototype.slice.call(arguments);
        var event;
        if(isEventSupported(type) && args.length == 1) {
            event = new Event(type, {
                view: window,
                bubbles: true,
                cancelable: true
              });
        }
        else {
            event = new CustomEvent(type, {
                view: window,
                bubbles: true,
                cancelable: true,
                detail: args.length > 1 ? args[1] : null
              });
        }

        this.nativeElement.dispatchEvent(event);
    }

    HTMLElementWrapper.prototype.css = function (name, value) {
        return access([this.nativeElement], function (elem, name, value) {
            var styles, len,
                map = {},
                i = 0;

            if (Array.isArray(name)) {
                styles = getStyles(elem);
                len = name.length;

                for (; i < len; i++) {
                    map[name[i]] = domCss(elem, name[i], false, styles);
                }

                return map;
            }

            return value !== undefined ?
                domStyle(elem, name, value) :
                domCss(elem, name);
        }, name, value, arguments.length > 1);
    }

    HTMLElementWrapper.prototype.data = function() {
        var args = Array.prototype.slice.call(arguments);
        if(args.length == 0) {
            return this.nativeElement.dataset;
        }

        if(args.length == 1) {
            if(this.nativeElement.dataset.hasOwnProperty(''+ args[0])) {
                return this.nativeElement.dataset[''+ args[0]];
            }
            return undefined;
        }
        
        if(args.length == 2) {
            this.nativeElement.dataset[''+args[0]] = args[1];
        }
    }

    HTMLElementWrapper.prototype.removeData = function() {
        delete this.nativeElement.dataset;
    }

    function Dictionary() {
        var items = {};
        var count = 0;
    
        this.add = function(key, value) {
            if(!items.hasOwnProperty(key))
                 count++;
    
            items[''+ key] = value;
        }
    
        this.containsKey = function(key) {
            return items.hasOwnProperty('' + key);
        }
    
        this.count = function() {
            return count;
        }
    
        this.item = function(key) {
            return items['' + key];
        }
    
        this.keys = function() {
            var keySet = [];
    
            for (var prop in items) {
                if (items.hasOwnProperty(prop)) {
                    keySet.push(prop);
                }
            }
    
            return keySet;
        }
    
        this.remove = function(key) {
            var val = items[''+key];
            delete items[''+key];
            count--;
            return val;
        }
    
        this.values = function() {
            var values = [];
    
            for (var prop in items) {
                if (items.hasOwnProperty(prop)) {
                    values.push(items[prop]);
                }
            }
    
            return values;
        }
    }


    $.HTMLElementWrapper = HTMLElementWrapper;
    $.isObject = isObject;
    $.isString = isString;
    $.isArray = isArray;
    $.isNumeric = isNumeric;
    $.isFunction = isFunction;
    $.forEach = forEach;
    $.transformCSS = transformCSS;
    $.map = map;
    $.extend = extend;
    $.deepExtend = deepExtend;
    $.domReady = domReady;
    $.css = domCss;
    $.style = domStyle;
    $.attr = domAttr;
    $.removeAttr = domRemoveAttr;
    $.addClass = domAddClass;
    $.removeClass = domRemoveClass;
    $.hasClass = domHasClass;
    $.append = domAppend;
    $.appendTo = domAppendTo;
    $.prepend = domPrepend;
    $.prependTo = domPrependTo;
    $.remove = domRemove;
    $.width = domWidth;
    $.height = domHeight;
    $.position = domPosition;
    $.offset = domOffset;
    $.create = function(el) { return new HTMLElementWrapper(el); }
})(window.TurnLib || (window.TurnLib = {}));