(function () {
    var UA = navigator.userAgent.toLowerCase();
    var browser = {
        DEVICE_DESKTOP: 0,
        DEVICE_IPAD: 1,
        DEVICE_PHONE: 2
    };

    function parseBrowserName(reg) {
        var matches = UA.match(reg);

        if (null == matches || 0 == matches.length)
            return 0;

        var b = matches[0];

        var c = b.indexOf("/");
        b = b.substring(c + 1, b.length);
        return "" == b ? 0 : parseInt(b);
    }

    function parseBrowserVersion(reg) {
        var matches = UA.match(reg);
        if (null == matches || 0 == matches.length)
            return 0;
        var b = matches[0].replace("_", ".").match(/\d+\.?\d?/);
        if (null == b || 0 == b.length)
            return 0;
        var version = b[0];
        return "" == version ? 0 : parseFloat(version);
    }

    browser.webkit = /webkit/.test(UA);
    browser.mozilla = /firefox/.test(UA);
    browser.firefox = browser.mozilla;
    browser.msie = /msie/.test(UA) || /trident/.test(UA) || /edge/.test(UA);
    browser.edge = /edge/.test(UA);
    browser.opera = /opera/.test(UA) || /opr/.test(UA);
    browser.chrome = /chrome/.test(UA) && !browser.opera && !browser.edge;
    browser.uc = /ucbrowser/.test(UA);
    browser.safari = /safari/.test(UA) && !browser.chrome && !browser.uc && !browser.opera;
    browser.wechat = /mqqbrowser/.test(UA);
    browser.version = 0;

    if (browser.firefox) browser.version = parseBrowserVersion(/firefox\/\d+/);
    if (browser.msie) {
        var matches = UA.match(/msie\s?\d+\.0/);
        var version = '';
        if (matches == null) {
            matches = UA.match(/trident\/\d+\.0/);
            if (matches && matches.length) {
                version = matches[0];
                browser.version = parseInt(version.replace("trident/", "")) + 4;
            } else {
                matches = UA.match(/edge\/\d+\.0/);
                if (matches && matches.length) {
                    version = version = matches[0];
                    browser.version = parseInt(version.replace("edge/", ""));
                }
            }
        }

        browser.version = parseInt(matches[0].replace("msie", ""));
    }

    browser.opera && (browser.version = parseBrowserVersion(/opera\/\d+/) || parseBrowserVersion(/opr\/\d+/));
    browser.chrome && (browser.version = parseBrowserVersion(/chrome\/\d+/));
    browser.uc && (browser.version = parseBrowserVersion(/ucbrowser\/\d+/));
    browser.safari && (browser.version = parseBrowserVersion(/safari\/\d+/));

    var ipad = /pad/.test(UA) || /ipod/.test(UA)
        , iPhone = /iphone/.test(UA)
        , winPhone = /wpdesktop/.test(UA) || /windows phone/.test(UA)
        , blackberry = /blackberry/.test(UA)
        , mobile = /mobile/.test(UA) || /phone/.test(UA);

    browser.device = browser.DEVICE_DESKTOP;
    if (ipad) {
        browser.device = browser.DEVICE_IPAD;
    } else if (iPhone || winPhone || blackberry || mobile) {
        browser.device = browser.DEVICE_PHONE
    }

    browser.isIPhone = iPhone;
    browser.isIPad = ipad;


    browser.prefix = (browser.webkit || browser.opera || browser.uc)
        ? '-webkit-'
        : browser.mozilla
            ? '-moz-'
            : browser.msie
                ? '-ms-'
                : '-webkit-';

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


    function forEach(arr, executor, context) {
        var i = 0, ii = 0;
        if (!isFunction(executor) || !isArray(arr) || !(ii = arr.length)) return;

        for (; i < ii; i++) {
            executor.apply(context || arr[i], [arr[i], i, arr]);
        }
    }

    function map(arr, callback/*, thisArg*/) {

        var T, A, k;

        if (arr == null) {
            throw new TypeError('this is null or not defined');
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

    /**
   * Fits a rectangle into anothers rectangles bounds
   * Ref: http://www.frontcoded.com/javascript-fit-rectange-into-bounds.html
   * @param rect
   * @param bounds
   * @returns {width: Number, height: Number}
   */
    function fitRectIntoBounds(rect, bounds) {
        var rectRatio = rect.width / rect.height;
        var boundsRatio = bounds.width / bounds.height;

        var newDimensions = {};

        // Rect is more landscape than bounds - fit to width
        if (rectRatio > boundsRatio) {
            newDimensions.width = bounds.width;
            newDimensions.height = rect.height * (bounds.width / rect.width);
        }
        // Rect is more portrait than bounds - fit to height
        else {
            newDimensions.width = rect.width * (bounds.height / rect.height);
            newDimensions.height = bounds.height;
        }

        return newDimensions;
    }



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
            initialInUnit = elem.nodeType && (!isAutoPx(prop) || unit !== "px" && +initial) && rcssNum.exec(dom.css(elem, prop));

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
                dom.style(elem, prop, initialInUnit + unit);
                if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
                    maxIterations = 0;
                }
                initialInUnit = initialInUnit / scale;

            }

            initialInUnit = initialInUnit * 2;
            dom.style(elem, prop, initialInUnit + unit);

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
                        elems[i], key, raw ?
                        value :
                        value.call(elems[i], i, fn(elems[i], key))
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
                ret = dom.style(elem, name, null);
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
                delta += dom.css(elem, box + cssExpand[i], true, styles);
            }

            // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
            if (!isBorderBox) {

                // Add padding
                delta += dom.css(elem, "padding" + cssExpand[i], true, styles);

                // For "border" or "margin", add border
                if (box !== "padding") {
                    delta += dom.css(elem, "border" + cssExpand[i] + "Width", true, styles);

                    // But still keep track of it otherwise
                } else {
                    extra += dom.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }

                // If we get here with a border-box (content + padding + border), we're seeking "content" or
                // "padding" or "margin"
            } else {

                // For "content", subtract padding
                if (box === "content") {
                    delta -= dom.css(elem, "padding" + cssExpand[i], true, styles);
                }

                // For "content" or "padding", subtract border
                if (box !== "margin") {
                    delta -= dom.css(elem, "border" + cssExpand[i] + "Width", true, styles);
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
                dom.css(elem, "boxSizing", false, styles) === "border-box",
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

            isBorderBox = dom.css(elem, "boxSizing", false, styles) === "border-box";

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

    forEach(["height", "width"], function (val, i) {
        cssHooks[val] = {
            get: function (elem, computed, extra) {
                if (computed) {

                    // Certain elements can have dimension info if we invisibly show them
                    // but it must have a current display style that would benefit
                    return rdisplayswap.test(dom.css(elem, "display")) &&

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
                        dom.css(elem, "boxSizing", false, styles) === "border-box",
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
                    value = dom.css(elem, val);
                }

                return setPositiveNumber(elem, value, subtract);
            }
        };
    }, this);

    forEach(['margin', 'padding', 'border-Width'], function (val, i) {
        val = val.split('-');

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
    }, this);


})();
