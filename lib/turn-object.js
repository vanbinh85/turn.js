(function() {
    'use strict';
    
    var has3d,
      
      hasRot,
    
      vendor = '',
      
      version = '4.1.0',
    
      PI = Math.PI,
    
      A90 = PI/2,
    
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

      function TurnObject(){
        TurnObject.prototype.init.apply(this, arguments);
      }

      TurnObject.prototype.init = function(options)
})();