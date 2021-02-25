import * as Util from './utils'
import { browser } from './browser';
/// element.classList on IE<9 needs to include polyfill.js
class HTMLElementWrapper {
    constructor(public nativeElement: HTMLElement) {}

    addClass(...classes:string[]): HTMLElementWrapper {
        this.nativeElement.classList.add(...classes);
        return this;
    }

    removeClass(...classes:string[]): HTMLElementWrapper {
        this.nativeElement.classList.remove(...classes);
        return this;
    }

    hasClass(className): boolean {
        return this.nativeElement.classList.contains(className);
    }

    /**
     * Inserts the a new element before this element.
     * @param insertedElement The inserted element.
     */
    after(insertedElement: HTMLElement | HTMLElementWrapper): HTMLElementWrapper {
        if(insertedElement instanceof HTMLElementWrapper) {
            insertedElement = insertedElement.nativeElement;
        }
        this.nativeElement.insertAdjacentElement('afterend', insertedElement);
        return this;
    }

    before(insertedElement: HTMLElement | HTMLElementWrapper): HTMLElementWrapper {
        if(insertedElement instanceof HTMLElementWrapper) {
            insertedElement = insertedElement.nativeElement;
        }
        this.nativeElement.insertAdjacentElement('beforebegin', insertedElement);
        return this;
    }

    append(element: HTMLElement| HTMLElementWrapper): HTMLElementWrapper {
        if(element instanceof HTMLElementWrapper) {
            element = element.nativeElement;
        }
        this.nativeElement.appendChild(element);
        return this;
    }

    prepend(element: HTMLElement | HTMLElementWrapper): HTMLElementWrapper {
        if(element instanceof HTMLElementWrapper) {
            element = element.nativeElement;
        }
        this.nativeElement.insertBefore(element, this.nativeElement.firstChild);
        return this;
    }

    appendTo(parentEl: HTMLElement | HTMLElementWrapper): HTMLElementWrapper {
        if(parentEl instanceof HTMLElementWrapper) {
            parentEl = parentEl.nativeElement;
        }
        parentEl.appendChild(this.nativeElement);
        return this;
    }

    prependTo(parentEl: HTMLElement | HTMLElementWrapper): HTMLElementWrapper {
        if(parentEl instanceof HTMLElementWrapper) {
            parentEl = parentEl.nativeElement;
        }
        parentEl.insertBefore(this.nativeElement, parentEl.firstChild);
        return this;
    }

    next(): HTMLElementWrapper {
        return new HTMLElementWrapper(<HTMLElement>this.nativeElement.nextElementSibling);
    }

    prev(): HTMLElementWrapper {
        return new HTMLElementWrapper(<HTMLElement>this.nativeElement.previousElementSibling);
    }

    get children(): HTMLCollection {
        return this.nativeElement.children;
    }

    clone(): HTMLElementWrapper {
        return new HTMLElementWrapper(this.nativeElement.cloneNode(true) as HTMLElement);
    }

    contains(child: HTMLElement | HTMLElementWrapper): boolean {
        return child && this.nativeElement !== child && this.nativeElement.contains(<Node>child);
    }

    find(selector: string): NodeListOf<Element> {
        return this.nativeElement.querySelectorAll(selector);
    }

    empty(): void {
        while(this.nativeElement.firstChild) {
            this.nativeElement.removeChild(this.nativeElement.firstChild);
        }
    }

    remove(): void {
        this.nativeElement.parentNode.removeChild(this.nativeElement);  
    }

    filter(selector: string, filterFn: (value: HTMLElement, index: number, arr: []) => HTMLElement ): Element[] {
        filterFn = Util.isFunction(filterFn) ? filterFn : void 0;
        return Array.prototype.filter.apply(this.nativeElement.querySelectorAll(selector), filterFn);
	}
	show() {
		this.nativeElement.style.display = 'block';
		return this;
	}

	hide() {
		this.nativeElement.style.display = 'none';
		return this;
	}
    
    attr(attrName: string | object, value: any = null): any {
        if(Util.isString(attrName)) {
            if(value !== null) {
                this.nativeElement.setAttribute(<string>attrName, value);
            }
            else {
                return this.nativeElement.getAttribute(<string>attrName);
            }
        }

        if(Util.isObject(attrName)) {
            for (const attr in <object>attrName) {
                if (attrName.hasOwnProperty(attr)) {
                    this.nativeElement.setAttribute(attr, attrName[attr]);
                }
            }
        }
    }

    removeAttr(attrName: string): void {
        this.nativeElement.removeAttribute(attrName);
    }

    offset() {
        var rect = this.nativeElement.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    position() {
        return {
            left: (<HTMLElement>this.nativeElement).offsetLeft, 
            top: (<HTMLElement>this.nativeElement).offsetTop
        };
    }

    height(h?: number): any {
        if(Util) {
            return Math.max((<HTMLElement>this.nativeElement).clientHeight, (<HTMLElement>this.nativeElement).offsetHeight);
        }

        function setHeight(el, val) {
            if (Util.isFunction(val)) val = val();
            if (Util.isString(val)) el.style.height = val;
            else el.style.height = val + "px";
        }
        
        setHeight(this.nativeElement, h);
    }

    width(w: number = null): any {
        if(w === null) {
            return Math.max((<HTMLElement>this.nativeElement).clientWidth, (<HTMLElement>this.nativeElement).offsetWidth);
        }

        function setWidth(el, val) {
            if (Util.isFunction(val)) val = val();
            if (Util.isString(val)) el.style.width = val;
            else el.style.width = val + "px";
        }
        
        setWidth(this.nativeElement, w);
    }

    on(type: any, listener: any) {
		if(type === 'onwheel') {
			Util.onWheel(this.nativeElement, listener);
		} else {
			this.nativeElement.addEventListener(type, listener);
		}
		return this;
    }

    off(type: any, listener: any) {
		if(type === 'onwheel') {
			Util.unWheel(this.nativeElement, listener);
		} else {
			this.nativeElement.removeEventListener(type, listener);
		}
		return this;
    }

    css( name, value?:any ): any {
		return access([this.nativeElement], function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = dom.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				dom.style( elem, name, value ) :
				dom.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
}

var cssPrefixes = [ "Webkit", "Moz", "ms", "o" ],
    emptyStyle = document.createElement( "div" ).style,
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
    isIE = (<any>document).documentMode,
    cssExpand = [ "Top", "Right", "Bottom", "Left" ],
    cssHooks = {},
    rcssNum = /^(?:([+-])=|)(" + pnum + ")([a-z%]*)$/i,
    ralphaStart = /^[a-z]/,
    pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source,
    rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" ),
    rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped vendor prefixed property
function finalPropName( name ) {
	var final = vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}

function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

function camelCase( string ) {
	return string.replace( rdashAlpha, fcamelCase );
}

function cssCamelCase( string ) {
	return camelCase( string.replace( rmsPrefix, "ms-" ) );
}

function isAutoPx( prop ) {

	// The first test is used to ensure that:
	// 1. The prop starts with a lowercase letter (as we uppercase it for the second regex).
	// 2. The prop is not empty.
	return ralphaStart.test( prop ) &&
		rautoPx.test( prop[ 0 ].toUpperCase() + prop.slice( 1 ) );
};

function getStyle(el, cssprop){
    if (el.currentStyle) //IE
        return el.currentStyle[cssprop];
    else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
        return document.defaultView.getComputedStyle(el, "")[cssprop];
    else //try and get inline style
        return el.style[cssprop];
}

function adjustCSS( elem, prop, valueParts, tween?:any ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return getStyle( elem, prop);
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( isAutoPx( prop ) ? "px" : "" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType && ( !isAutoPx( prop ) || unit !== "px" && +initial ) && rcssNum.exec(dom.css( elem, prop ));

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54 - 66+
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		(<any>initialInUnit) = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			dom.style(elem, prop, initialInUnit + unit);
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			(<any>initialInUnit) = (<any>initialInUnit) / scale;

		}

		(<any>initialInUnit) = (<any>initialInUnit) * 2;
		dom.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		(<any>initialInUnit) = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
        (<any>initialInUnit) + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}

function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	return typeof obj;
}

var access = function( elems, fn, key, value, chainable, emptyGet?:any, raw?:any ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( (<any>i) in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( typeof value !== "function" ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return (<any>bulk).call( elem, value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};

function getStyles( elem ) {

	// Support: IE <=11+ (trac-14150)
	// In IE popup's `window` is the opener window which makes `window.getComputedStyle( elem )`
	// break. Using `elem.ownerDocument.defaultView` avoids the issue.
	var view = elem.ownerDocument.defaultView;

	// `document.implementation.createHTMLDocument( "" )` has a `null` `defaultView`
	// property; check `defaultView` truthiness to fallback to window in such a case.
	if ( !view ) {
		view = window;
	}

	return view.getComputedStyle( elem );
};

function isAttached( elem ) {
    if(document.getRootNode) {
        return elem.getRootNode({composed: true}) === elem.ownerDocument;
    }
    return elem.ownerDocument.contains(elem);
};

function curCSS( elem, name, computed ) {
	var ret;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for `.css('--customProperty')` (gh-3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = dom.style( elem, name, null );
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}

function swap( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
}

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, (<any>matches)[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal?:any ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += dom.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += dom.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += dom.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += dom.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= dom.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= dom.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

// Support: IE 11+, Edge 15 - 18+
// IE/Edge misreport `getComputedStyle` of table rows with width/height
// set in CSS while `offset*` properties report correct values.
function reliableTrDimensions() {
	var table, tr, trChild;
	if ( reliableTrDimensionsVal == null ) {
		table = document.createElement( "table" );
		tr = document.createElement( "tr" );
		trChild = document.createElement( "div" );

		table.style.cssText = "position:absolute;left:-11111px";
		tr.style.height = "1px";
		trChild.style.height = "9px";

		document.documentElement
			.appendChild( table )
			.appendChild( tr )
			.appendChild( trChild );

		var trStyle = window.getComputedStyle( tr );
		reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

		document.documentElement.removeChild( table );
	}
	return reliableTrDimensionsVal;
}

function nodeName( elem, name ) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();  
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = isIE || extra,
		isBorderBox = boxSizingNeeded &&
			dom.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}

    
	// Support: IE 9 - 11+
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( isIE && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		!reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = dom.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

Util.forEach([ "height", "width" ], function(val, i) {
    cssHooks[val] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( dom.css( elem, "display" ) ) &&

					// Support: Safari <=8 - 12+, Chrome <=73+
					// Table columns in WebKit/Blink have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11+
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, val, extra );
						} ) :
						getWidthOrHeight( elem, val, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				isBorderBox = extra &&
					dom.css( elem, "boxSizing", false, styles ) === "border-box",
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
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ val ] = value;
				value = dom.css( elem, val );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
}, this);

Util.forEach(['margin', 'padding', 'border-Width'], function(val, i){
    val = val.split('-');

    let prefix = val[0],
        suffix = val.length > 1 ? val[1] : '';

    cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
}, this);


function dom(selector) {
    if(Util.isFunction(selector)) {
        dom.ready(selector);
    }

    if(dom.isNode(selector) || dom.isElement(selector)) {
        return new HTMLElementWrapper(<HTMLElement>selector);
    }

    var el = document.querySelector(selector);
    
    return el ? new HTMLElementWrapper(el) : void 0;
}

/**
 * Creates a dom element.
 * @param tagName The element name.
 * @param options Attributes applied to the dom element.
 */
dom.createElement = function(tagName: string, ...children:(HTMLElementWrapper[] | HTMLElement[])): HTMLElementWrapper {
	var el = document.createElement(tagName);
	if(children && children.length) {
		Util.forEach(children, function(child) {
			child = child.nativeElement || child;
			el.appendChild(child);
		});
	}

    return new HTMLElementWrapper(el);
}

/**
 * Creates a text node.
 * @param contentString The text content.
 */
dom.createTextElement = function(contentString) {
    return document.createTextNode(contentString);
}

dom.contains = function(el, child) {
    return el && child && el !== child && el.contains(child);
}

dom.ready = function(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
}

dom.isNode = function(o){
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
}
  
  //Returns true if it is a DOM element    
dom.isElement = function(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
}

dom.style = function(elem: HTMLElement, name, value, extra?:any) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
        return;
    }

    var ret, 
        type, 
        hooks,
		origName = cssCamelCase( name ),
		isCustomProp = rcustomProp.test( name ),
        style = elem.style;
    
    if ( !isCustomProp ) {
		name = finalPropName( origName );
    }
    
    // Gets hook for the prefixed version, then unprefixed version
	hooks = cssHooks[ name ] || cssHooks[ origName ];

    if ( value !== undefined ) {
        type = typeof value;

        if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
            value = adjustCSS( elem, name, ret );

            type = "number";
        }

        if ( value == null || value !== value ) {
            return;
        }

        // If the value is a number, add `px` for certain CSS properties
        if ( type === "number" ) {
            value += ret && ret[ 3 ] || ( isAutoPx( origName ) ? "px" : "" );
        }

        if ( (<any>document).documentMode && value === "" && name.indexOf( "background" ) === 0 ) {
            style[ name ] = "inherit";
        }

        if ( isCustomProp ) {
            style.setProperty( name, value );
        } else {
            style[ name ] = value;
        }

        // If a hook was provided, use that value, otherwise just set the specified value
		if ( !hooks || !( "set" in hooks ) ||
            ( value = hooks.set( elem, value, extra ) ) !== undefined ) {

            if ( isCustomProp ) {
                style.setProperty( name, value );
            } else {
                style[ name ] = value;
            }
        }
    } else {
        // If a hook was provided get the non-computed value from there
		if ( hooks && "get" in hooks && 
            ( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

            return ret;
        }

        // Otherwise just get the value from the style object
        return style[ name ];
    }
}

dom.css = function(elem, name, extra?:any, styles?:any) {
    var val, num, hooks,
			origName = cssCamelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
        }
        
        // Try prefixed name followed by the unprefixed name
		hooks = cssHooks[ name ] || cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
}

dom.getStyle = getStyle;

dom.transformCSS = function(input:any) {
    var c = browser.safari && 10.3 <= browser.version
	  ,transform = ''
	  ,csses = []
      , transformParams:any = {};
    if(input.perspective !== undefined && input.perspective !== null && input.perspective != 0) {
        transform += "perspective(" + input.perspective + "px) ";
    }
    if(input.tran) {
        if(browser.msie && !c)
			transform += "translate(" + input.tran.x + "px," + input.tran.y + "px) ";
        else 
			transform += "translate3d(" + input.tran.x + "px," + input.tran.y + "px,0px) ";
    } 
    if(input.rotate) transform += "rotate(" + input.rotate + "deg) ";
    if(input.rotateY) transform += "rotateY(" + input.rotateY + "deg) ";
    if(input.rotateX) transform += "rotateX(" + input.rotateX + "deg) ";
    if (input.scale !== undefined && input.scale !== null && input.scale != 0) {
        if(browser.msie && !c)
		transform += "scale(" + input.scale + ") ";
        else
		transform += "scale3d(" + input.scale + "," + input.scale + ",1) ";
    }
    if(input.scaleX) transform += "scaleX(" + input.scaleX + ") ";
    if(input.scaleY) transform += "scaleY(" + input.scaleY + ") ";
    if(input.origin) {
		var origin = input.origin.x + "% " + input.origin.y + "%";
		csses = Util.map(cssPrefixes, function(val) {
			return '-' + val.toLowerCase() + '-transform-origin'
		})
		csses.push('transform-origin');

		Util.forEach(csses, function(val) {
			transformParams[val] = origin;
		});
	}

	if(transform && transform.length > 0) {
		csses = Util.map(cssPrefixes, function(val) {
			return '-' + val.toLowerCase() + '-transform';
		});
		csses.push('transform');

		Util.forEach(csses, function(val) {
			transformParams[val] = transform;
		});
	}

    return transformParams;
}

export {
    dom,
    HTMLElementWrapper
}