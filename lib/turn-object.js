(function () {
    'use strict';

    var has3d,

        hasRot,

        vendor = '',

        version = '4.1.0',

        PI = Math.PI,

        A90 = PI / 2,

        isTouch = 'ontouchstart' in window,

        mouseEvents = (isTouch) ?
            {
                down: 'touchstart',
                move: 'touchmove',
                up: 'touchend',
                over: 'touchstart',
                out: 'touchend'
            }
            :
            {
                down: 'mousedown',
                move: 'mousemove',
                up: 'mouseup',
                over: 'mouseover',
                out: 'mouseout'
            },

        // Contansts used for each corner
        //   | tl * tr |
        // l | *     * | r
        //   | bl * br |

        corners = {
            backward: ['bl', 'tl'],
            forward: ['br', 'tr'],
            all: ['tl', 'bl', 'tr', 'br', 'l', 'r']
        },

        // Display values

        displays = ['single', 'double'],

        // Direction values

        directions = ['ltr', 'rtl'],

        // Default options

        turnOptions = {

            // Enables hardware acceleration

            acceleration: true,

            // Display

            display: 'double',

            // Duration of transition in milliseconds

            duration: 600,

            // First page

            page: 1,

            // Enables gradients

            gradients: true,

            // Corners used when turning the page

            turnCorners: 'bl,br',

            // Events

            when: null
        },

        flipOptions = {

            // Size of the active zone of each corner

            cornerSize: 100

        },

        // Number of pages in the DOM, minimum value: 6

        pagesInDOM = 6;

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
                    if (typeof obj[key] === 'object'){
                    if(obj[key] instanceof Array == true)
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

    function inArray( elem, array ) {
        if ( array.indexOf ) {
            return array.indexOf( elem );
        }
    
        for ( var i = 0, length = array.length; i < length; i++ ) {
            if ( array[ i ] === elem ) {
                return i;
            }
        }
    
        return -1;
    }

    function dec(that, methods, args) {
    
        if (!args[0] || typeof(args[0])=='object')
          return methods.init.apply(that, args);
      
        else if (methods[args[0]])
          return methods[args[0]].apply(that, Array.prototype.slice.call(args, 1));
      
        else
          throw turnError(args[0] + ' is not a method or property');
      
      }
      
      
      // Attributes for a layer
      
      function divAtt(top, left, zIndex, overf) {
          
        return {'css': {
          position: 'absolute',
          top: top,
          left: left,
          'overflow': overf || 'hidden',
          zIndex: zIndex || 'auto'
        }
      };
            
      }
      
      // Gets a 2D point from a bezier curve of four points
      
      function bezier(p1, p2, p3, p4, t) {
      
        var a = 1 - t,
          b = a * a * a,
          c = t * t * t;
          
        return point2D(Math.round(b*p1.x + 3*t*a*a*p2.x + 3*t*t*a*p3.x + c*p4.x),
          Math.round(b*p1.y + 3*t*a*a*p2.y + 3*t*t*a*p3.y + c*p4.y));
      
      }
        
      // Converts an angle from degrees to radians
      
      function rad(degrees) {
        
        return degrees/180*PI;
      
      }
      
      // Converts an angle from radians to degrees
      
      function deg(radians) {
        
        return radians/PI*180;
      
      }
      
      // Gets a 2D point
      
      function point2D(x, y) {
        
        return {x: x, y: y};
      
      }
      
      // Webkit 534.3 on Android wrongly repaints elements that use overflow:hidden + rotation
      
      function rotationAvailable() {
        var parts;
      
        if ((parts = /AppleWebkit\/([0-9\.]+)/i.exec(navigator.userAgent))) {
          var webkitVersion = parseFloat(parts[1]);
          return (webkitVersion>534.3);
        } else {
          return true;
        }
      }
      
      // Returns the traslate value
      
      function translate(x, y, use3d) {
        
        return (has3d && use3d) ? ' translate3d(' + x + 'px,' + y + 'px, 0px) '
        : ' translate(' + x + 'px, ' + y + 'px) ';
      
      }
      
      // Returns the rotation value
      
      function rotate(degrees) {
        
        return ' rotate(' + degrees + 'deg) ';
      
      }
      
      // Checks if a property belongs to an object
      
      function has(property, object) {
        
        return Object.prototype.hasOwnProperty.call(object, property);
      
      }
      
      // Gets the CSS3 vendor prefix
      
      function getPrefix() {
      
        var vendorPrefixes = ['Moz','Webkit','Khtml','O','ms'],
        len = vendorPrefixes.length,
        vendor = '';
      
        while (len--)
          if ((vendorPrefixes[len] + 'Transform') in document.body.style)
            vendor='-'+vendorPrefixes[len].toLowerCase()+'-';
      
        return vendor;
      
      }
      
      // Detects the transitionEnd Event
      
      function getTransitionEnd() {
      
        var t,
          el = document.createElement('fakeelement'),
          transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MSTransition':'transitionend',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
          };
      
        for (t in transitions) {
          if (el.style[t] !== undefined) {
            return transitions[t];
          }
        }
      }
      
      // Gradients
      
      function gradient(obj, p0, p1, colors, numColors) {
      
        var j, cols = [];
      
        if (vendor=='-webkit-') {
      
          for (j = 0; j<numColors; j++)
            cols.push('color-stop('+colors[j][0]+', '+colors[j][1]+')');
          
          obj.css({'background-image':
              '-webkit-gradient(linear, '+
              p0.x+'% '+
              p0.y+'%,'+
              p1.x+'% '+
              p1.y+'%, '+
              cols.join(',') + ' )'});
        } else {
          
          p0 = {x:p0.x/100 * obj.width(), y:p0.y/100 * obj.height()};
          p1 = {x:p1.x/100 * obj.width(), y:p1.y/100 * obj.height()};
      
          var dx = p1.x-p0.x,
            dy = p1.y-p0.y,
            angle = Math.atan2(dy, dx),
            angle2 = angle - Math.PI/2,
            diagonal = Math.abs(obj.width()*Math.sin(angle2))+Math.abs(obj.height()*Math.cos(angle2)),
            gradientDiagonal = Math.sqrt(dy*dy + dx*dx),
            corner = point2D((p1.x<p0.x) ? obj.width() : 0, (p1.y<p0.y) ? obj.height() : 0),
            slope = Math.tan(angle),
            inverse = -1/slope,
            x = (inverse*corner.x - corner.y - slope*p0.x + p0.y)/(inverse-slope),
            c = {x: x, y: inverse*x - inverse*corner.x + corner.y},
            segA = (Math.sqrt( Math.pow(c.x-p0.x,2) + Math.pow(c.y-p0.y,2)));
      
            for (j = 0; j<numColors; j++)
              cols.push(' '+colors[j][1]+' '+((segA + gradientDiagonal*colors[j][0])*100/diagonal)+'%');
      
            obj.css({'background-image': vendor+'linear-gradient(' + (-angle) + 'rad,' + cols.join(',') + ')'});
        }
      }
      
      
      // Triggers an event
      
      function trigger(eventName, context, args) {
      
        var event = $.Event(eventName);
        context.trigger(event, args);
        if (event.isDefaultPrevented())
          return 'prevented';
        else if (event.isPropagationStopped())
          return 'stopped';
        else
          return '';
      }
      
      // JS Errors
      
      function turnError(message) {
      
        function TurnJsError(message) {
          this.name = "TurnJsError";
          this.message = message;
        }
      
        TurnJsError.prototype = new Error();
        TurnJsError.prototype.constructor = TurnJsError;
        return new TurnJsError(message);
      
      }
      
      // Find the offset of an element ignoring its transformation
      
      function findPos(obj) {
      
        var offset = {top: 0, left: 0};
      
        do{
          offset.left += obj.offsetLeft;
          offset.top += obj.offsetTop;
        } while ((obj = obj.offsetParent));
      
        return offset;
      
      }
      
      // Checks if there's hard page compatibility
      // IE9 is the only browser that does not support hard pages
      
      function hasHardPage() {
        return (navigator.userAgent.indexOf('MSIE 9.0')==-1);
      }
      
      // Request an animation
      
      window.requestAnim = (function() {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
          };
      
      })();

    function TurnObject() {
        TurnObject.prototype.init.apply(this, arguments);
    }

    TurnObject.prototype.data = function() {
        if(arguments.length == 0) {
             if(!this._data) this._data = {};

             return this._data;
        }
    }

    TurnObject.prototype.init = function (container, options) {
        // Define constants

        has3d = 'WebKitCSSMatrix' in window || 'MozPerspective' in document.body.style;
        hasRot = rotationAvailable();
        vendor = getPrefix();

        this._data = {};


        var i, that = this, pageNum = 0, data = this.data(), ch = this.children();

        // Set initial configuration

        options = extend({
            width: this.width(),
            height: this.height(),
            direction: this.attr('dir') || this.css('direction') || 'ltr'
        }, turnOptions, options);

        data.opts = options;
        data.pageObjs = {};
        data.pages = {};
        data.pageWrap = {};
        data.pageZoom = {};
        data.pagePlace = {};
        data.pageMv = [];
        data.zoom = 1;
        data.totalPages = options.pages || 0;
        data.eventHandlers = {
            touchStart: turnMethods._touchStart.bind(this),
            touchMove: turnMethods._touchMove.bind(this),
            touchEnd: turnMethods._touchEnd.bind(this),
            start: turnMethods._eventStart.bind(this)
        };



        // Add event listeners

        if (options.when)
            for (i in options.when)
                if (has(i, options.when))
                    this.on(i, options.when[i]);

        // Set the css

        this.css({ position: 'relative', width: options.width, height: options.height });

        // Set the initial display

        //this.turn('display', options.display);
        turnMethods.display.call(this, options.display);

        // Set the direction

        if (options.direction !== '') {
            //this.turn('direction', options.direction);
            turnMethods.direction.call(this, options.direction);
        }

        // Prevent blue screen problems of switching to hardware acceleration mode
        // By forcing hardware acceleration for ever

        if (has3d && !isTouch && options.acceleration)
            this.transform(translate(0, 0, true));

        // Add pages from the DOM

        for (i = 0; i < ch.length; i++) {
            if ($(ch[i]).attr('ignore') != '1') {
                //this.turn('addPage', ch[i], ++pageNum);
                turnMethods.addPage.call(this, ch[i], ++pageNum);
            }
        }

        // Event listeners

        $(this).on(mouseEvents.down, data.eventHandlers.touchStart).
            on('end', turnMethods._eventEnd).
            on('pressed', turnMethods._eventPressed).
            on('released', turnMethods._eventReleased).
            on('flip', turnMethods._flip);

        $(this).parent().on('start', data.eventHandlers.start);

        $(document).on(mouseEvents.move, data.eventHandlers.touchMove).
            on(mouseEvents.up, data.eventHandlers.touchEnd);

        // Set the initial page

        //this.turn('page', options.page);
        turnMethods.page.call(this, options.page);

        // This flipbook is ready

        data.done = true;

        return this;
    }
})();