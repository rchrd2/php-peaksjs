import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import Konva from 'konva/lib/Core';
import { Animation } from 'konva/lib/Animation';
import WaveformData from 'waveform-data';

var eventemitter3 = {exports: {}};

(function (module) {

  var has = Object.prototype.hasOwnProperty,
      prefix = '~';
  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */

  function Events() {} //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //


  if (Object.create) {
    Events.prototype = Object.create(null); //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //

    if (!new Events().__proto__) prefix = false;
  }
  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */


  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */


  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once),
        evt = prefix ? prefix + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */


  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
  }
  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */


  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */


  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;
    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };
  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */


  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
        handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };
  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */


  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
        listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };
  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */


  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;

        case 2:
          return listeners.fn.call(listeners.context, a1), true;

        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;

        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;

        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
          j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;

          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;

          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;

          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;

          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };
  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return this;

    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      } //
      // Reset the array, or remove it completely if we have no more listeners.
      //


      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
    }

    return this;
  };
  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  }; //
  // Alias methods names because people roll like that.
  //


  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
  // Expose the prefix.
  //

  EventEmitter.prefixed = prefix; //
  // Allow `EventEmitter` to be imported as module namespace.
  //

  EventEmitter.EventEmitter = EventEmitter; //
  // Expose the module.
  //

  {
    module.exports = EventEmitter;
  }
})(eventemitter3);

var EventEmitter = eventemitter3.exports;

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/**
 * @file
 *
 * Defines the {@link Cue} class.
 *
 * @module cue
 */

/**
 * A cue represents an event to be triggered at some point on the media
 * timeline.
 *
 * @class
 * @alias Cue
 *
 * @param {Number} time Cue time, in seconds.
 * @param {Number} type Cue mark type, either <code>Cue.POINT</code>,
 *   <code>Cue.SEGMENT_START</code>, or <code>Cue.SEGMENT_END</code>.
 * @param {String} id The id of the {@link Point} or {@link Segment}.
 */
function Cue(time, type, id) {
  this.time = time;
  this.type = type;
  this.id = id;
}
/**
  * @constant
  * @type {Number}
  */


Cue.POINT = 0;
Cue.SEGMENT_START = 1;
Cue.SEGMENT_END = 2;
/**
 * Callback function for use with Array.prototype.sort().
 *
 * @static
 * @param {Cue} a
 * @param {Cue} b
 * @return {Number}
 */

Cue.sorter = function (a, b) {
  return a.time - b.time;
};

function zeroPad(number, precision) {
  number = number.toString();

  while (number.length < precision) {
    number = '0' + number;
  }

  return number;
}
/**
 * Returns a formatted time string.
 *
 * @param {Number} time The time to be formatted, in seconds.
 * @param {Number} precision Decimal places to which time is displayed
 * @returns {String}
 */


function formatTime(time, precision) {
  var result = [];
  var fractionSeconds = Math.floor(time % 1 * Math.pow(10, precision));
  var seconds = Math.floor(time);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);

  if (hours > 0) {
    result.push(hours); // Hours
  }

  result.push(minutes % 60); // Mins

  result.push(seconds % 60); // Seconds

  for (var i = 0; i < result.length; i++) {
    result[i] = zeroPad(result[i], 2);
  }

  result = result.join(':');

  if (precision > 0) {
    result += '.' + zeroPad(fractionSeconds, precision);
  }

  return result;
}
/**
 * Rounds the given value up to the nearest given multiple.
 *
 * @param {Number} value
 * @param {Number} multiple
 * @returns {Number}
 *
 * @example
 * roundUpToNearest(5.5, 3); // returns 6
 * roundUpToNearest(141.0, 10); // returns 150
 * roundUpToNearest(-5.5, 3); // returns -6
 */

function roundUpToNearest(value, multiple) {
  if (multiple === 0) {
    return 0;
  }

  var multiplier = 1;

  if (value < 0.0) {
    multiplier = -1;
    value = -value;
  }

  var roundedUp = Math.ceil(value);
  return multiplier * ((roundedUp + multiple - 1) / multiple | 0) * multiple;
}
function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}
function objectHasProperty(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}
function extend(to, from) {
  for (var key in from) {
    if (objectHasProperty(from, key)) {
      to[key] = from[key];
    }
  }

  return to;
}
/**
 * Checks whether the given array contains values in ascending order.
 *
 * @param {Array<Number>} array The array to test
 * @returns {Boolean}
 */

function isInAscendingOrder(array) {
  if (array.length === 0) {
    return true;
  }

  var value = array[0];

  for (var i = 1; i < array.length; i++) {
    if (value >= array[i]) {
      return false;
    }

    value = array[i];
  }

  return true;
}
/**
 * Checks whether the given value is a number.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isNumber(value) {
  return typeof value === 'number';
}
/**
 * Checks whether the given value is a finite number.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isFinite(value) {
  if (typeof value !== 'number') {
    return false;
  } // Check for NaN and infinity
  // eslint-disable-next-line no-self-compare


  if (value !== value || value === Infinity || value === -Infinity) {
    return false;
  }

  return true;
}
/**
 * Checks whether the given value is a valid timestamp.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isValidTime(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
/**
 * Checks whether the given value is a valid object.
 *
 * @param {Object|Array} value The value to test
 * @returns {Boolean}
 */

function isObject(value) {
  return value !== null && _typeof(value) === 'object' && !Array.isArray(value);
}
/**
 * Checks whether the given value is a valid string.
 *
 * @param {String} value The value to test
 * @returns {Boolean}
 */

function isString(value) {
  return typeof value === 'string';
}
/**
 * Checks whether the given value is a valid ArrayBuffer.
 *
 * @param {ArrayBuffer} value The value to test
 * @returns {Boolean}
 */

function isArrayBuffer(value) {
  return Object.prototype.toString.call(value).includes('ArrayBuffer');
}
/**
 * Checks whether the given value is null or undefined.
 *
 * @param {Object} value The value to test
 * @returns {Boolean}
 */

function isNullOrUndefined(value) {
  return value === undefined || value === null;
}
/**
 * Checks whether the given value is a function.
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isFunction(value) {
  return typeof value === 'function';
}
/**
 * Checks whether the given value is a boolean.
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isBoolean(value) {
  return value === true || value === false;
}
/**
 * Checks whether the given value is a valid HTML element.
 *
 * @param {HTMLElement} value The value to test
 * @returns {Boolean}
 */

function isHTMLElement(value) {
  return value instanceof HTMLElement;
}
/**
 * Checks whether the given value is an array
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isArray(value) {
  return Array.isArray(value);
}
/**
 * Checks whether the given value is a valid linear gradient color
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isLinearGradientColor(value) {
  return isObject(value) && objectHasProperty(value, 'linearGradientStart') && objectHasProperty(value, 'linearGradientEnd') && objectHasProperty(value, 'linearGradientColorStops') && isNumber(value.linearGradientStart) && isNumber(value.linearGradientEnd) && isArray(value.linearGradientColorStops) && value.linearGradientColorStops.length === 2;
}

var isHeadless = /HeadlessChrome/.test(navigator.userAgent);

function windowIsVisible() {
  if (isHeadless || navigator.webdriver) {
    return false;
  }

  return (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && 'visibilityState' in document && document.visibilityState === 'visible';
}

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
var eventTypes = {
  forward: {},
  reverse: {}
};
var EVENT_TYPE_POINT = 0;
var EVENT_TYPE_SEGMENT_ENTER = 1;
var EVENT_TYPE_SEGMENT_EXIT = 2;
eventTypes.forward[Cue.POINT] = EVENT_TYPE_POINT;
eventTypes.forward[Cue.SEGMENT_START] = EVENT_TYPE_SEGMENT_ENTER;
eventTypes.forward[Cue.SEGMENT_END] = EVENT_TYPE_SEGMENT_EXIT;
eventTypes.reverse[Cue.POINT] = EVENT_TYPE_POINT;
eventTypes.reverse[Cue.SEGMENT_START] = EVENT_TYPE_SEGMENT_EXIT;
eventTypes.reverse[Cue.SEGMENT_END] = EVENT_TYPE_SEGMENT_ENTER;
var eventNames = {};
eventNames[EVENT_TYPE_POINT] = 'points.enter';
eventNames[EVENT_TYPE_SEGMENT_ENTER] = 'segments.enter';
eventNames[EVENT_TYPE_SEGMENT_EXIT] = 'segments.exit';
/**
 * Given a cue instance, returns the corresponding {@link Point}
 * {@link Segment}.
 *
 * @param {Peaks} peaks
 * @param {Cue} cue
 * @return {Point|Segment}
 * @throws {Error}
 */

function getPointOrSegment(peaks, cue) {
  switch (cue.type) {
    case Cue.POINT:
      return peaks.points.getPoint(cue.id);

    case Cue.SEGMENT_START:
    case Cue.SEGMENT_END:
      return peaks.segments.getSegment(cue.id);

    default:
      throw new Error('getPointOrSegment: id not found?');
  }
}
/**
 * CueEmitter is responsible for emitting <code>points.enter</code>,
 * <code>segments.enter</code>, and <code>segments.exit</code> events.
 *
 * @class
 * @alias CueEmitter
 *
 * @param {Peaks} peaks Parent {@link Peaks} instance.
 */


function CueEmitter(peaks) {
  this._cues = [];
  this._peaks = peaks;
  this._previousTime = -1;
  this._updateCues = this._updateCues.bind(this); // Event handlers:

  this._onPlaying = this.onPlaying.bind(this);
  this._onSeeked = this.onSeeked.bind(this);
  this._onTimeUpdate = this.onTimeUpdate.bind(this);
  this._onAnimationFrame = this.onAnimationFrame.bind(this);
  this._rAFHandle = null;
  this._activeSegments = {};

  this._attachEventHandlers();
}
/**
 * This function is bound to all {@link Peaks} events relating to mutated
 * [Points]{@link Point} or [Segments]{@link Segment}, and updates the
 * list of cues accordingly.
 *
 * @private
 */


CueEmitter.prototype._updateCues = function () {
  var self = this;

  var points = self._peaks.points.getPoints();

  var segments = self._peaks.segments.getSegments();

  self._cues.length = 0;
  points.forEach(function (point) {
    self._cues.push(new Cue(point.time, Cue.POINT, point.id));
  });
  segments.forEach(function (segment) {
    self._cues.push(new Cue(segment.startTime, Cue.SEGMENT_START, segment.id));

    self._cues.push(new Cue(segment.endTime, Cue.SEGMENT_END, segment.id));
  });

  self._cues.sort(Cue.sorter);

  var time = self._peaks.player.getCurrentTime();

  self._updateActiveSegments(time);
};
/**
 * Emits events for any cues passed through during media playback.
 *
 * @param {Number} time The current time on the media timeline.
 * @param {Number} previousTime The previous time on the media timeline when
 *   this function was called.
 */


CueEmitter.prototype._onUpdate = function (time, previousTime) {
  var isForward = time > previousTime;
  var start;
  var end;
  var step;

  if (isForward) {
    start = 0;
    end = this._cues.length;
    step = 1;
  } else {
    start = this._cues.length - 1;
    end = -1;
    step = -1;
  } // Cues are sorted


  for (var i = start; isForward ? i < end : i > end; i += step) {
    var cue = this._cues[i];

    if (isForward ? cue.time > previousTime : cue.time < previousTime) {
      if (isForward ? cue.time > time : cue.time < time) {
        break;
      } // Cue falls between time and previousTime


      var marker = getPointOrSegment(this._peaks, cue);
      var eventType = isForward ? eventTypes.forward[cue.type] : eventTypes.reverse[cue.type];

      if (eventType === EVENT_TYPE_SEGMENT_ENTER) {
        this._activeSegments[marker.id] = marker;
      } else if (eventType === EVENT_TYPE_SEGMENT_EXIT) {
        delete this._activeSegments[marker.id];
      }

      this._peaks.emit(eventNames[eventType], marker);
    }
  }
}; // the next handler and onAnimationFrame are bound together
// when the window isn't in focus, rAF is throttled
// falling back to timeUpdate


CueEmitter.prototype.onTimeUpdate = function (time) {
  if (windowIsVisible()) {
    return;
  }

  if (this._peaks.player.isPlaying() && !this._peaks.player.isSeeking()) {
    this._onUpdate(time, this._previousTime);
  }

  this._previousTime = time;
};

CueEmitter.prototype.onAnimationFrame = function () {
  var time = this._peaks.player.getCurrentTime();

  if (!this._peaks.player.isSeeking()) {
    this._onUpdate(time, this._previousTime);
  }

  this._previousTime = time;

  if (this._peaks.player.isPlaying()) {
    this._rAFHandle = requestAnimationFrame(this._onAnimationFrame);
  }
};

CueEmitter.prototype.onPlaying = function () {
  this._previousTime = this._peaks.player.getCurrentTime();
  this._rAFHandle = requestAnimationFrame(this._onAnimationFrame);
};

CueEmitter.prototype.onSeeked = function (time) {
  this._previousTime = time;

  this._updateActiveSegments(time);
};

function getSegmentIdComparator(id) {
  return function compareSegmentIds(segment) {
    return segment.id === id;
  };
}
/**
 * The active segments is the set of all segments which overlap the current
 * playhead position. This function updates that set and emits
 * <code>segments.enter</code> and <code>segments.exit</code> events.
 */


CueEmitter.prototype._updateActiveSegments = function (time) {
  var self = this;

  var activeSegments = self._peaks.segments.getSegmentsAtTime(time); // Remove any segments no longer active.


  for (var id in self._activeSegments) {
    if (objectHasProperty(self._activeSegments, id)) {
      var segment = activeSegments.find(getSegmentIdComparator(id));

      if (!segment) {
        self._peaks.emit('segments.exit', self._activeSegments[id]);

        delete self._activeSegments[id];
      }
    }
  } // Add new active segments.


  activeSegments.forEach(function (segment) {
    if (!(segment.id in self._activeSegments)) {
      self._activeSegments[segment.id] = segment;

      self._peaks.emit('segments.enter', segment);
    }
  });
};

var triggerUpdateOn = Array('points.update', 'points.dragmove', 'points.add', 'points.remove', 'points.remove_all', 'segments.update', 'segments.dragged', 'segments.add', 'segments.remove', 'segments.remove_all');

CueEmitter.prototype._attachEventHandlers = function () {
  this._peaks.on('player.timeupdate', this._onTimeUpdate);

  this._peaks.on('player.playing', this._onPlaying);

  this._peaks.on('player.seeked', this._onSeeked);

  for (var i = 0; i < triggerUpdateOn.length; i++) {
    this._peaks.on(triggerUpdateOn[i], this._updateCues);
  }

  this._updateCues();
};

CueEmitter.prototype._detachEventHandlers = function () {
  this._peaks.off('player.timeupdate', this._onTimeUpdate);

  this._peaks.off('player.playing', this._onPlaying);

  this._peaks.off('player.seeked', this._onSeeked);

  for (var i = 0; i < triggerUpdateOn.length; i++) {
    this._peaks.off(triggerUpdateOn[i], this._updateCues);
  }
};

CueEmitter.prototype.destroy = function () {
  if (this._rAFHandle) {
    cancelAnimationFrame(this._rAFHandle);
    this._rAFHandle = null;
  }

  this._detachEventHandlers();

  this._previousTime = -1;
};

/**
 * @file
 *
 * Defines the {@link Point} class.
 *
 * @module point
 */
var pointOptions = ['peaks', 'id', 'time', 'labelText', 'color', 'editable'];

function validatePoint(options, context) {
  if (!isValidTime(options.time)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.points.' + context + ': time should be a numeric value');
  }

  if (options.time < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.points.' + context + ': time should not be negative');
  }

  if (isNullOrUndefined(options.labelText)) {
    // Set default label text
    options.labelText = '';
  } else if (!isString(options.labelText)) {
    throw new TypeError('peaks.points.' + context + ': labelText must be a string');
  }

  if (!isBoolean(options.editable)) {
    throw new TypeError('peaks.points.' + context + ': editable must be true or false');
  }

  if (options.color && !isString(options.color) && !isLinearGradientColor(options.color)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.points.' + context + ': color must be a string or a valid linear gradient object');
  }
}
/**
 * A point is a single instant of time, with associated label and color.
 *
 * @class
 * @alias Point
 *
 * @param {Peaks} peaks A reference to the Peaks instance.
 * @param {String} id A unique identifier for the point.
 * @param {Number} time Point time, in seconds.
 * @param {String} labelText Point label text.
 * @param {String} color Point marker color.
 * @param {Boolean} editable If <code>true</code> the segment start and
 *   end times can be adjusted via the user interface.
 * @param {*} data Optional application specific data.
 */


function Point(options) {
  validatePoint(options, 'add()');
  this._peaks = options.peaks;
  this._id = options.id;
  this._time = options.time;
  this._labelText = options.labelText;
  this._color = options.color;
  this._editable = options.editable;

  this._setUserData(options);
}

Point.prototype._setUserData = function (options) {
  for (var key in options) {
    if (objectHasProperty(options, key) && pointOptions.indexOf(key) === -1) {
      this[key] = options[key];
    }
  }
};

Object.defineProperties(Point.prototype, {
  id: {
    enumerable: true,
    get: function get() {
      return this._id;
    }
  },
  time: {
    enumerable: true,
    get: function get() {
      return this._time;
    }
  },
  labelText: {
    get: function get() {
      return this._labelText;
    }
  },
  color: {
    enumerable: true,
    get: function get() {
      return this._color;
    }
  },
  editable: {
    enumerable: true,
    get: function get() {
      return this._editable;
    }
  }
});

Point.prototype.update = function (options) {
  var opts = {
    time: this.time,
    labelText: this.labelText,
    color: this.color,
    editable: this.editable
  };
  extend(opts, options);
  validatePoint(opts, 'update()');
  this._time = opts.time;
  this._labelText = opts.labelText;
  this._color = opts.color;
  this._editable = opts.editable;

  this._setUserData(options);

  this._peaks.emit('points.update', this);
};
/**
 * Returns <code>true</code> if the point lies with in a given time range.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Boolean}
 */


Point.prototype.isVisible = function (startTime, endTime) {
  return this.time >= startTime && this.time < endTime;
};

Point.prototype._setTime = function (time) {
  this._time = time;
};

/**
 * @file
 *
 * Defines the {@link WaveformPoints} class.
 *
 * @module waveform-points
 */
/**
 * Point parameters.
 *
 * @typedef {Object} PointOptions
 * @global
 * @property {Number} point Point time, in seconds.
 * @property {Boolean=} editable If <code>true</code> the point time can be
 *   adjusted via the user interface.
 *   Default: <code>false</code>.
 * @property {String=} color Point marker color.
 *   Default: a random color.
 * @property {String=} labelText Point label text.
 *   Default: an empty string.
 * @property {String=} id A unique point identifier.
 *   Default: an automatically generated identifier.
 */

/**
 * Handles all functionality related to the adding, removing and manipulation
 * of points. A point is a single instant of time.
 *
 * @class
 * @alias WaveformPoints
 *
 * @param {Peaks} peaks The parent Peaks object.
 */

function WaveformPoints(peaks) {
  this._peaks = peaks;
  this._points = [];
  this._pointsById = {};
  this._pointIdCounter = 0;
}
/**
 * Returns a new unique point id value.
 *
 * @returns {String}
 */


WaveformPoints.prototype._getNextPointId = function () {
  return 'peaks.point.' + this._pointIdCounter++;
};
/**
 * Adds a new point object.
 *
 * @private
 * @param {Point} point
 */


WaveformPoints.prototype._addPoint = function (point) {
  this._points.push(point);

  this._pointsById[point.id] = point;
};
/**
 * Creates a new point object.
 *
 * @private
 * @param {PointOptions} options
 * @returns {Point}
 */


WaveformPoints.prototype._createPoint = function (options) {
  var pointOptions = {
    peaks: this._peaks
  };
  extend(pointOptions, options);

  if (isNullOrUndefined(pointOptions.id)) {
    pointOptions.id = this._getNextPointId();
  }

  if (isNullOrUndefined(pointOptions.labelText)) {
    pointOptions.labelText = '';
  }

  if (isNullOrUndefined(pointOptions.editable)) {
    pointOptions.editable = false;
  }

  return new Point(pointOptions);
};
/**
 * Returns all points.
 *
 * @returns {Array<Point>}
 */


WaveformPoints.prototype.getPoints = function () {
  return this._points;
};
/**
 * Returns the point with the given id, or <code>null</code> if not found.
 *
 * @param {String} id
 * @returns {Point|null}
 */


WaveformPoints.prototype.getPoint = function (id) {
  return this._pointsById[id] || null;
};
/**
 * Returns all points within a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Array<Point>}
 */


WaveformPoints.prototype.find = function (startTime, endTime) {
  return this._points.filter(function (point) {
    return point.isVisible(startTime, endTime);
  });
};
/**
 * Adds one or more points to the timeline.
 *
 * @param {PointOptions|Array<PointOptions>} pointOrPoints
 *
 * @returns Point|Array<Point>
 */


WaveformPoints.prototype.add = function () {
  var self = this;
  var arrayArgs = Array.isArray(arguments[0]);
  var points = arrayArgs ? arguments[0] : Array.prototype.slice.call(arguments);
  points = points.map(function (pointOptions) {
    var point = self._createPoint(pointOptions);

    if (objectHasProperty(self._pointsById, point.id)) {
      throw new Error('peaks.points.add(): duplicate id');
    }

    return point;
  });
  points.forEach(function (point) {
    self._addPoint(point);
  });

  this._peaks.emit('points.add', points);

  return arrayArgs ? points : points[0];
};
/**
 * Returns the indexes of points that match the given predicate.
 *
 * @private
 * @param {Function} predicate Predicate function to find matching points.
 * @returns {Array<Number>} An array of indexes into the points array of
 *   the matching elements.
 */


WaveformPoints.prototype._findPoint = function (predicate) {
  var indexes = [];

  for (var i = 0, length = this._points.length; i < length; i++) {
    if (predicate(this._points[i])) {
      indexes.push(i);
    }
  }

  return indexes;
};
/**
 * Removes the points at the given array indexes.
 *
 * @private
 * @param {Array<Number>} indexes The array indexes to remove.
 * @returns {Array<Point>} The removed {@link Point} objects.
 */


WaveformPoints.prototype._removeIndexes = function (indexes) {
  var removed = [];

  for (var i = 0; i < indexes.length; i++) {
    var index = indexes[i] - removed.length;

    var itemRemoved = this._points.splice(index, 1)[0];

    delete this._pointsById[itemRemoved.id];
    removed.push(itemRemoved);
  }

  return removed;
};
/**
 * Removes all points that match a given predicate function.
 *
 * After removing the points, this function emits a
 * <code>points.remove</code> event with the removed {@link Point}
 * objects.
 *
 * @private
 * @param {Function} predicate A predicate function that identifies which
 *   points to remove.
 * @returns {Array<Point>} The removed {@link Points} objects.
 */


WaveformPoints.prototype._removePoints = function (predicate) {
  var indexes = this._findPoint(predicate);

  var removed = this._removeIndexes(indexes);

  this._peaks.emit('points.remove', removed);

  return removed;
};
/**
 * Removes the given point.
 *
 * @param {Point} point The point to remove.
 * @returns {Array<Point>} The removed points.
 */


WaveformPoints.prototype.remove = function (point) {
  return this._removePoints(function (p) {
    return p === point;
  });
};
/**
 * Removes any points with the given id.
 *
 * @param {String} id
 * @returns {Array<Point>} The removed {@link Point} objects.
 */


WaveformPoints.prototype.removeById = function (pointId) {
  return this._removePoints(function (point) {
    return point.id === pointId;
  });
};
/**
 * Removes any points at the given time.
 *
 * @param {Number} time
 * @returns {Array<Point>} The removed {@link Point} objects.
 */


WaveformPoints.prototype.removeByTime = function (time) {
  return this._removePoints(function (point) {
    return point.time === time;
  });
};
/**
 * Removes all points.
 *
 * After removing the points, this function emits a
 * <code>points.remove_all</code> event.
 */


WaveformPoints.prototype.removeAll = function () {
  this._points = [];
  this._pointsById = {};

  this._peaks.emit('points.remove_all');
};

/**
 * @file
 *
 * Defines the {@link Segment} class.
 *
 * @module segment
 */
var segmentOptions = ['peaks', 'id', 'startTime', 'endTime', 'labelText', 'color', 'editable'];

function validateSegment(options, context) {
  if (!isValidTime(options.startTime)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': startTime should be a valid number');
  }

  if (!isValidTime(options.endTime)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': endTime should be a valid number');
  }

  if (options.startTime < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': startTime should not be negative');
  }

  if (options.endTime < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': endTime should not be negative');
  }

  if (options.endTime < options.startTime) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': endTime should not be less than startTime');
  }

  if (isNullOrUndefined(options.labelText)) {
    // Set default label text
    options.labelText = '';
  } else if (!isString(options.labelText)) {
    throw new TypeError('peaks.segments.' + context + ': labelText must be a string');
  }

  if (!isBoolean(options.editable)) {
    throw new TypeError('peaks.segments.' + context + ': editable must be true or false');
  }

  if (options.color && !isString(options.color) && !isLinearGradientColor(options.color)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': color must be a string or a valid linear gradient object');
  }
}
/**
 * A segment is a region of time, with associated label and color.
 *
 * @class
 * @alias Segment
 *
 * @param {Peaks} peaks A reference to the Peaks instance.
 * @param {String} id A unique identifier for the segment.
 * @param {Number} startTime Segment start time, in seconds.
 * @param {Number} endTime Segment end time, in seconds.
 * @param {String} labelText Segment label text.
 * @param {String | LinearGradientColor} color Segment waveform color.
 * @param {Boolean} editable If <code>true</code> the segment start and
 *   end times can be adjusted via the user interface.
 * @param {*} data Optional application specific data.
 */


function Segment(options) {
  validateSegment(options, 'add()');
  this._peaks = options.peaks;
  this._id = options.id;
  this._startTime = options.startTime;
  this._endTime = options.endTime;
  this._labelText = options.labelText;
  this._color = options.color;
  this._editable = options.editable;

  this._setUserData(options);
}

Segment.prototype._setUserData = function (options) {
  for (var key in options) {
    if (objectHasProperty(options, key) && segmentOptions.indexOf(key) === -1) {
      this[key] = options[key];
    }
  }
};

Object.defineProperties(Segment.prototype, {
  id: {
    enumerable: true,
    get: function get() {
      return this._id;
    }
  },
  startTime: {
    enumerable: true,
    get: function get() {
      return this._startTime;
    }
  },
  endTime: {
    enumerable: true,
    get: function get() {
      return this._endTime;
    }
  },
  labelText: {
    enumerable: true,
    get: function get() {
      return this._labelText;
    }
  },
  color: {
    enumerable: true,
    get: function get() {
      return this._color;
    }
  },
  editable: {
    enumerable: true,
    get: function get() {
      return this._editable;
    }
  }
});

Segment.prototype.update = function (options) {
  var opts = {
    startTime: this.startTime,
    endTime: this.endTime,
    labelText: this.labelText,
    color: this.color,
    editable: this.editable
  };
  extend(opts, options);
  validateSegment(opts, 'update()');
  this._startTime = opts.startTime;
  this._endTime = opts.endTime;
  this._labelText = opts.labelText;
  this._color = opts.color;
  this._editable = opts.editable;

  this._setUserData(options);

  this._peaks.emit('segments.update', this);
};
/**
 * Returns <code>true</code> if the segment overlaps a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Boolean}
 *
 * @see http://wiki.c2.com/?TestIfDateRangesOverlap
 */


Segment.prototype.isVisible = function (startTime, endTime) {
  return this.startTime < endTime && startTime < this.endTime;
};

Segment.prototype._setStartTime = function (time) {
  this._startTime = time;
};

Segment.prototype._setEndTime = function (time) {
  this._endTime = time;
};

/**
 * @file
 *
 * Defines the {@link WaveformSegments} class.
 *
 * @module waveform-segments
 */
/**
 * Segment parameters.
 *
 * @typedef {Object} SegmentOptions
 * @global
 * @property {Number} startTime Segment start time, in seconds.
 * @property {Number} endTime Segment end time, in seconds.
 * @property {Boolean=} editable If <code>true</code> the segment start and
 *   end times can be adjusted via the user interface.
 *   Default: <code>false</code>.
 * @property {String=} color Segment waveform color.
 *   Default: a random color.
 * @property {String=} labelText Segment label text.
 *   Default: an empty string.
 * @property {String=} id A unique segment identifier.
 *   Default: an automatically generated identifier.
 */

/**
 * Handles all functionality related to the adding, removing and manipulation
 * of segments.
 *
 * @class
 * @alias WaveformSegments
 *
 * @param {Peaks} peaks The parent Peaks object.
 */

function WaveformSegments(peaks) {
  this._peaks = peaks;
  this._segments = [];
  this._segmentsById = {};
  this._segmentIdCounter = 0;
  this._colorIndex = 0;
}
/**
 * Returns a new unique segment id value.
 *
 * @private
 * @returns {String}
 */


WaveformSegments.prototype._getNextSegmentId = function () {
  return 'peaks.segment.' + this._segmentIdCounter++;
};

var colors = ['#001f3f', // navy
'#0074d9', // blue
'#7fdbff', // aqua
'#39cccc', // teal
'#ffdc00', // yellow
'#ff851b', // orange
'#ff4136', // red
'#85144b', // maroon
'#f012be', // fuchsia
'#b10dc9' // purple
];
/**
 * @private
 * @returns {String}
 */

WaveformSegments.prototype._getSegmentColor = function () {
  if (this._peaks.options.randomizeSegmentColor) {
    if (++this._colorIndex === colors.length) {
      this._colorIndex = 0;
    }

    return colors[this._colorIndex];
  } else {
    return this._peaks.options.segmentColor;
  }
};
/**
 * Adds a new segment object.
 *
 * @private
 * @param {Segment} segment
 */


WaveformSegments.prototype._addSegment = function (segment) {
  this._segments.push(segment);

  this._segmentsById[segment.id] = segment;
};
/**
 * Creates a new segment object.
 *
 * @private
 * @param {SegmentOptions} options
 * @return {Segment}
 */


WaveformSegments.prototype._createSegment = function (options) {
  // Watch for anyone still trying to use the old
  // createSegment(startTime, endTime, ...) API
  if (!isObject(options)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.add(): expected a Segment object parameter');
  }

  var segmentOptions = {
    peaks: this._peaks
  };
  extend(segmentOptions, options);

  if (isNullOrUndefined(segmentOptions.id)) {
    segmentOptions.id = this._getNextSegmentId();
  }

  if (isNullOrUndefined(segmentOptions.color)) {
    segmentOptions.color = this._getSegmentColor();
  }

  if (isNullOrUndefined(segmentOptions.labelText)) {
    segmentOptions.labelText = '';
  }

  if (isNullOrUndefined(segmentOptions.editable)) {
    segmentOptions.editable = false;
  }

  return new Segment(segmentOptions);
};
/**
 * Returns all segments.
 *
 * @returns {Array<Segment>}
 */


WaveformSegments.prototype.getSegments = function () {
  return this._segments;
};
/**
 * Returns the segment with the given id, or <code>null</code> if not found.
 *
 * @param {String} id
 * @returns {Segment|null}
 */


WaveformSegments.prototype.getSegment = function (id) {
  return this._segmentsById[id] || null;
};
/**
 * Returns all segments that overlap a given point in time.
 *
 * @param {Number} time
 * @returns {Array<Segment>}
 */


WaveformSegments.prototype.getSegmentsAtTime = function (time) {
  return this._segments.filter(function (segment) {
    return time >= segment.startTime && time < segment.endTime;
  });
};
/**
 * Returns all segments that overlap a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 *
 * @returns {Array<Segment>}
 */


WaveformSegments.prototype.find = function (startTime, endTime) {
  return this._segments.filter(function (segment) {
    return segment.isVisible(startTime, endTime);
  });
};
/**
 * Adds one or more segments to the timeline.
 *
 * @param {SegmentOptions|Array<SegmentOptions>} segmentOrSegments
 *
 * @returns Segment|Array<Segment>
 */


WaveformSegments.prototype.add = function () {
  var self = this;
  var arrayArgs = Array.isArray(arguments[0]);
  var segments = arrayArgs ? arguments[0] : Array.prototype.slice.call(arguments);
  segments = segments.map(function (segmentOptions) {
    var segment = self._createSegment(segmentOptions);

    if (objectHasProperty(self._segmentsById, segment.id)) {
      throw new Error('peaks.segments.add(): duplicate id');
    }

    return segment;
  });
  segments.forEach(function (segment) {
    self._addSegment(segment);
  });

  this._peaks.emit('segments.add', segments);

  return arrayArgs ? segments : segments[0];
};
/**
 * Returns the indexes of segments that match the given predicate.
 *
 * @private
 * @param {Function} predicate Predicate function to find matching segments.
 * @returns {Array<Number>} An array of indexes into the segments array of
 *   the matching elements.
 */


WaveformSegments.prototype._findSegment = function (predicate) {
  var indexes = [];

  for (var i = 0, length = this._segments.length; i < length; i++) {
    if (predicate(this._segments[i])) {
      indexes.push(i);
    }
  }

  return indexes;
};
/**
 * Removes the segments at the given array indexes.
 *
 * @private
 * @param {Array<Number>} indexes The array indexes to remove.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */


WaveformSegments.prototype._removeIndexes = function (indexes) {
  var removed = [];

  for (var i = 0; i < indexes.length; i++) {
    var index = indexes[i] - removed.length;

    var itemRemoved = this._segments.splice(index, 1)[0];

    delete this._segmentsById[itemRemoved.id];
    removed.push(itemRemoved);
  }

  return removed;
};
/**
 * Removes all segments that match a given predicate function.
 *
 * After removing the segments, this function also emits a
 * <code>segments.remove</code> event with the removed {@link Segment}
 * objects.
 *
 * @private
 * @param {Function} predicate A predicate function that identifies which
 *   segments to remove.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */


WaveformSegments.prototype._removeSegments = function (predicate) {
  var indexes = this._findSegment(predicate);

  var removed = this._removeIndexes(indexes);

  this._peaks.emit('segments.remove', removed);

  return removed;
};
/**
 * Removes the given segment.
 *
 * @param {Segment} segment The segment to remove.
 * @returns {Array<Segment>} The removed segment.
 */


WaveformSegments.prototype.remove = function (segment) {
  return this._removeSegments(function (s) {
    return s === segment;
  });
};
/**
 * Removes any segments with the given id.
 *
 * @param {String} id
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */


WaveformSegments.prototype.removeById = function (segmentId) {
  return this._removeSegments(function (segment) {
    return segment.id === segmentId;
  });
};
/**
 * Removes any segments with the given start time, and optional end time.
 *
 * @param {Number} startTime Segments with this start time are removed.
 * @param {Number?} endTime If present, only segments with both the given
 *   start time and end time are removed.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */


WaveformSegments.prototype.removeByTime = function (startTime, endTime) {
  endTime = typeof endTime === 'number' ? endTime : 0;
  var fnFilter;

  if (endTime > 0) {
    fnFilter = function fnFilter(segment) {
      return segment.startTime === startTime && segment.endTime === endTime;
    };
  } else {
    fnFilter = function fnFilter(segment) {
      return segment.startTime === startTime;
    };
  }

  return this._removeSegments(fnFilter);
};
/**
 * Removes all segments.
 *
 * After removing the segments, this function emits a
 * <code>segments.remove_all</code> event.
 */


WaveformSegments.prototype.removeAll = function () {
  this._segments = [];
  this._segmentsById = {};

  this._peaks.emit('segments.remove_all');
};

/**
 * @file
 *
 * Defines the {@link KeyboardHandler} class.
 *
 * @module keyboard-handler
 */
var nodes = ['OBJECT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'];
var SPACE = 32,
    TAB = 9,
    LEFT_ARROW = 37,
    RIGHT_ARROW = 39;
var keys = [SPACE, TAB, LEFT_ARROW, RIGHT_ARROW];
/**
 * Configures keyboard event handling.
 *
 * @class
 * @alias KeyboardHandler
 *
 * @param {EventEmitter} eventEmitter
 */

function KeyboardHandler(eventEmitter) {
  this.eventEmitter = eventEmitter;
  this._handleKeyEvent = this._handleKeyEvent.bind(this);
  document.addEventListener('keydown', this._handleKeyEvent);
  document.addEventListener('keypress', this._handleKeyEvent);
  document.addEventListener('keyup', this._handleKeyEvent);
}
/**
 * Keyboard event handler function.
 *
 * @note Arrow keys only triggered on keydown, not keypress.
 *
 * @param {KeyboardEvent} event
 * @private
 */


KeyboardHandler.prototype._handleKeyEvent = function handleKeyEvent(event) {
  if (nodes.indexOf(event.target.nodeName) === -1) {
    if (keys.indexOf(event.type) > -1) {
      event.preventDefault();
    }

    if (event.type === 'keydown' || event.type === 'keypress') {
      switch (event.keyCode) {
        case SPACE:
          this.eventEmitter.emit('keyboard.space');
          break;

        case TAB:
          this.eventEmitter.emit('keyboard.tab');
          break;
      }
    } else if (event.type === 'keyup') {
      switch (event.keyCode) {
        case LEFT_ARROW:
          if (event.shiftKey) {
            this.eventEmitter.emit('keyboard.shift_left');
          } else {
            this.eventEmitter.emit('keyboard.left');
          }

          break;

        case RIGHT_ARROW:
          if (event.shiftKey) {
            this.eventEmitter.emit('keyboard.shift_right');
          } else {
            this.eventEmitter.emit('keyboard.right');
          }

          break;
      }
    }
  }
};

KeyboardHandler.prototype.destroy = function () {
  document.removeEventListener('keydown', this._handleKeyEvent);
  document.removeEventListener('keypress', this._handleKeyEvent);
  document.removeEventListener('keyup', this._handleKeyEvent);
};

/**
 * @file
 *
 * Implementation of {@link Player} adapter based on the HTML5 media element.
 *
 * @module player-medialement
 */

/**
 * A wrapper for interfacing with the HTML5 media element API.
 * Initializes the player for a given media element.
 *
 * @class
 * @alias MediaElementPlayer
 * @param {HTMLMediaElement} mediaElement The HTML <code>&lt;audio&gt;</code>
 *   or <code>&lt;video&gt;</code> element to associate with the
 *   {@link Peaks} instance.
 */
function MediaElementPlayer(peaks, mediaElement) {
  var self = this;
  self._peaks = peaks;
  self._listeners = [];
  self._mediaElement = mediaElement;
}
/**
 * Adds an event listener to the media element.
 *
 * @private
 * @param {String} type The event type to listen for.
 * @param {Function} callback An event handler function.
 */


MediaElementPlayer.prototype._addMediaListener = function (type, callback) {
  this._listeners.push({
    type: type,
    callback: callback
  });

  this._mediaElement.addEventListener(type, callback);
};

MediaElementPlayer.prototype.init = function (player) {
  var self = this;
  self._player = player;
  self._listeners = [];
  self._duration = self.getDuration();
  self._isPlaying = false;

  self._addMediaListener('timeupdate', function () {
    self._peaks.emit('player.timeupdate', self.getCurrentTime());
  });

  self._addMediaListener('playing', function () {
    self._isPlaying = true;

    self._peaks.emit('player.playing', self.getCurrentTime());
  });

  self._addMediaListener('pause', function () {
    self._isPlaying = false;

    self._peaks.emit('player.pause', self.getCurrentTime());
  });

  self._addMediaListener('ended', function () {
    self._peaks.emit('player.ended');
  });

  self._addMediaListener('seeked', function () {
    self._peaks.emit('player.seeked', self.getCurrentTime());
  });

  self._addMediaListener('canplay', function () {
    self._peaks.emit('player.canplay');
  });

  self._addMediaListener('error', function (event) {
    self._peaks.emit('player.error', event.target.error);
  });

  self._interval = null; // If the media element has preload="none", clicking to seek in the
  // waveform won't work, so here we force the media to load.

  if (self._mediaElement.readyState === HTMLMediaElement.HAVE_NOTHING) {
    self._mediaElement.load();
  }
};
/**
 * Cleans up the player object, removing all event listeners from the
 * associated media element.
 */


MediaElementPlayer.prototype.destroy = function () {
  for (var i = 0; i < this._listeners.length; i++) {
    var listener = this._listeners[i];

    this._mediaElement.removeEventListener(listener.type, listener.callback);
  }

  this._listeners.length = 0;
  this._mediaElement = null;
};

MediaElementPlayer.prototype.play = function () {
  return this._mediaElement.play();
};

MediaElementPlayer.prototype.pause = function () {
  this._mediaElement.pause();
};

MediaElementPlayer.prototype.isPlaying = function () {
  return this._isPlaying;
};

MediaElementPlayer.prototype.isSeeking = function () {
  return this._mediaElement.seeking;
};

MediaElementPlayer.prototype.getCurrentTime = function () {
  return this._mediaElement.currentTime;
};

MediaElementPlayer.prototype.getDuration = function () {
  return this._mediaElement.duration;
};

MediaElementPlayer.prototype.seek = function (time) {
  this._mediaElement.currentTime = time;
};

/**
 * @file
 *
 * A general audio player class which interfaces with external audio players.
 * The default audio player in Peaks.js is {@link MediaElementPlayer}.
 *
 * @module player
 */

function getAllPropertiesFrom(adapter) {
  var allProperties = [];
  var obj = adapter;

  while (obj) {
    Object.getOwnPropertyNames(obj).forEach(function (p) {
      allProperties.push(p);
    });
    obj = Object.getPrototypeOf(obj);
  }

  return allProperties;
}

function validateAdapter(adapter) {
  var publicAdapterMethods = ['init', 'destroy', 'play', 'pause', 'isPlaying', 'isSeeking', 'getCurrentTime', 'getDuration', 'seek'];
  var allProperties = getAllPropertiesFrom(adapter);
  publicAdapterMethods.forEach(function (method) {
    if (!allProperties.includes(method)) {
      throw new TypeError('Peaks.init(): Player method ' + method + ' is undefined');
    }

    if (typeof adapter[method] !== 'function') {
      throw new TypeError('Peaks.init(): Player method ' + method + ' is not a function');
    }
  });
}
/**
 * A wrapper for interfacing with an external player API.
 *
 * @class
 * @alias Player
 *
 * @param {Peaks} peaks The parent {@link Peaks} object.
 * @param {Adapter} adapter The player adapter.
 */


function Player(peaks, adapter) {
  this._peaks = peaks;
  this._playingSegment = false;
  this._segment = null;
  this._loop = false;
  this._playSegmentTimerCallback = this._playSegmentTimerCallback.bind(this);
  validateAdapter(adapter);
  this._adapter = adapter;

  this._adapter.init(peaks);
}
/**
 * Cleans up the player object.
 */


Player.prototype.destroy = function () {
  this._adapter.destroy();
};
/**
 * Starts playback.
 * @returns {Promise}
 */


Player.prototype.play = function () {
  return this._adapter.play();
};
/**
 * Pauses playback.
 */


Player.prototype.pause = function () {
  this._adapter.pause();
};
/**
 * @returns {Boolean} <code>true</code> if playing, <code>false</code>
 * otherwise.
 */


Player.prototype.isPlaying = function () {
  return this._adapter.isPlaying();
};
/**
 * @returns {boolean} <code>true</code> if seeking
 */


Player.prototype.isSeeking = function () {
  return this._adapter.isSeeking();
};
/**
 * Returns the current playback time position, in seconds.
 *
 * @returns {Number}
 */


Player.prototype.getCurrentTime = function () {
  return this._adapter.getCurrentTime();
};
/**
 * Returns the media duration, in seconds.
 *
 * @returns {Number}
 */


Player.prototype.getDuration = function () {
  return this._adapter.getDuration();
};
/**
 * Seeks to a given time position within the media.
 *
 * @param {Number} time The time position, in seconds.
 */


Player.prototype.seek = function (time) {
  if (!isValidTime(time)) {
    this._peaks.logger('peaks.player.seek(): parameter must be a valid time, in seconds');

    return;
  }

  this._adapter.seek(time);
};
/**
 * Plays the given segment.
 *
 * @param {Segment} segment The segment denoting the time region to play.
 * @param {Boolean} loop If true, playback is looped.
 */


Player.prototype.playSegment = function (segment, loop) {
  var self = this;

  if (!segment || !isValidTime(segment.startTime) || !isValidTime(segment.endTime)) {
    return Promise.reject(new Error('peaks.player.playSegment(): parameter must be a segment object'));
  }

  self._segment = segment;
  self._loop = loop; // Set audio time to segment start time

  self.seek(segment.startTime);

  self._peaks.once('player.playing', function () {
    if (!self._playingSegment) {
      self._playingSegment = true; // We need to use requestAnimationFrame here as the timeupdate event
      // doesn't fire often enough.

      window.requestAnimationFrame(self._playSegmentTimerCallback);
    }
  }); // Start playing audio


  return self.play();
};

Player.prototype._playSegmentTimerCallback = function () {
  if (!this.isPlaying()) {
    this._playingSegment = false;
    return;
  } else if (this.getCurrentTime() >= this._segment.endTime) {
    if (this._loop) {
      this.seek(this._segment.startTime);
    } else {
      this.pause();

      this._peaks.emit('player.ended');

      this._playingSegment = false;
      return;
    }
  }

  window.requestAnimationFrame(this._playSegmentTimerCallback);
};

/**
 * @file
 *
 * Defines the {@link DefaultPointMarker} class.
 *
 * @module default-point-marker
 */
/**
 * Creates a point marker handle.
 *
 * @class
 * @alias DefaultPointMarker
 *
 * @param {CreatePointMarkerOptions} options
 */

function DefaultPointMarker(options) {
  this._options = options;
}

DefaultPointMarker.prototype.init = function (group) {
  var handleWidth = 10;
  var handleHeight = 20;
  var handleX = -(handleWidth / 2) + 0.5; // Place in the middle of the marker
  // Label

  if (this._options.view === 'zoomview') {
    // Label - create with default y, the real value is set in fitToView().
    this._label = new Text({
      x: 2,
      y: 0,
      text: this._options.point.labelText,
      textAlign: 'left',
      fontFamily: this._options.fontFamily || 'sans-serif',
      fontSize: this._options.fontSize || 10,
      fontStyle: this._options.fontStyle || 'normal',
      fill: '#000'
    });
  } // Handle - create with default y, the real value is set in fitToView().


  if (this._options.draggable) {
    this._handle = new Rect({
      x: handleX,
      y: 0,
      width: handleWidth,
      height: handleHeight,
      fill: this._options.color
    });
  } // Line - create with default y and points, the real values
  // are set in fitToView().


  this._line = new Line({
    x: 0,
    y: 0,
    stroke: this._options.color,
    strokeWidth: 1
  }); // Time label

  if (this._handle) {
    // Time - create with default y, the real value is set in fitToView().
    this._time = new Text({
      x: -24,
      y: 0,
      text: this._options.layer.formatTime(this._options.point.time),
      fontFamily: this._options.fontFamily,
      fontSize: this._options.fontSize,
      fontStyle: this._options.fontStyle,
      fill: '#000',
      textAlign: 'center'
    });

    this._time.hide();
  }

  if (this._handle) {
    group.add(this._handle);
  }

  group.add(this._line);

  if (this._label) {
    group.add(this._label);
  }

  if (this._time) {
    group.add(this._time);
  }

  this.fitToView();
  this.bindEventHandlers(group);
};

DefaultPointMarker.prototype.bindEventHandlers = function (group) {
  var self = this;

  if (self._handle) {
    self._handle.on('mouseover touchstart', function () {
      // Position text to the left of the marker
      self._time.setX(-24 - self._time.getWidth());

      self._time.show();
    });

    self._handle.on('mouseout touchend', function () {
      self._time.hide();
    });

    group.on('dragstart', function () {
      self._time.setX(-24 - self._time.getWidth());

      self._time.show();
    });
    group.on('dragend', function () {
      self._time.hide();
    });
  }
};

DefaultPointMarker.prototype.fitToView = function () {
  var height = this._options.layer.getHeight();

  this._line.points([0.5, 0, 0.5, height]);

  if (this._label) {
    this._label.y(12);
  }

  if (this._handle) {
    this._handle.y(height / 2 - 10.5);
  }

  if (this._time) {
    this._time.y(height / 2 - 5);
  }
};

DefaultPointMarker.prototype.timeUpdated = function (time) {
  if (this._time) {
    this._time.setText(this._options.layer.formatTime(time));
  }
};

/**
 * @file
 *
 * Defines the {@link DefaultSegmentMarker} class.
 *
 * @module default-segment-marker
 */
/**
 * Creates a segment marker handle.
 *
 * @class
 * @alias DefaultSegmentMarker
 *
 * @param {CreateSegmentMarkerOptions} options
 */

function DefaultSegmentMarker(options) {
  this._options = options;
}

DefaultSegmentMarker.prototype.init = function (group) {
  var handleWidth = 10;
  var handleHeight = 20;
  var handleX = -(handleWidth / 2) + 0.5; // Place in the middle of the marker

  var xPosition = this._options.startMarker ? -24 : 24;
  var time = this._options.startMarker ? this._options.segment.startTime : this._options.segment.endTime; // Label - create with default y, the real value is set in fitToView().

  this._label = new Text({
    x: xPosition,
    y: 0,
    text: this._options.layer.formatTime(time),
    fontFamily: this._options.fontFamily,
    fontSize: this._options.fontSize,
    fontStyle: this._options.fontStyle,
    fill: '#000',
    textAlign: 'center'
  });

  this._label.hide(); // Handle - create with default y, the real value is set in fitToView().


  this._handle = new Rect({
    x: handleX,
    y: 0,
    width: handleWidth,
    height: handleHeight,
    fill: this._options.color,
    stroke: this._options.color,
    strokeWidth: 1
  }); // Vertical Line - create with default y and points, the real values
  // are set in fitToView().

  this._line = new Line({
    x: 0,
    y: 0,
    stroke: this._options.color,
    strokeWidth: 1
  });
  group.add(this._label);
  group.add(this._line);
  group.add(this._handle);
  this.fitToView();
  this.bindEventHandlers(group);
};

DefaultSegmentMarker.prototype.bindEventHandlers = function (group) {
  var self = this;
  var xPosition = self._options.startMarker ? -24 : 24;

  if (self._options.draggable) {
    group.on('dragstart', function () {
      if (self._options.startMarker) {
        self._label.setX(xPosition - self._label.getWidth());
      }

      self._label.show();
    });
    group.on('dragend', function () {
      self._label.hide();
    });
  }

  self._handle.on('mouseover touchstart', function () {
    if (self._options.startMarker) {
      self._label.setX(xPosition - self._label.getWidth());
    }

    self._label.show();
  });

  self._handle.on('mouseout touchend', function () {
    self._label.hide();
  });
};

DefaultSegmentMarker.prototype.fitToView = function () {
  var height = this._options.layer.getHeight();

  this._label.y(height / 2 - 5);

  this._handle.y(height / 2 - 10.5);

  this._line.points([0.5, 0, 0.5, height]);
};

DefaultSegmentMarker.prototype.timeUpdated = function (time) {
  this._label.setText(this._options.layer.formatTime(time));
};

/**
 * @file
 *
 * Factory functions for creating point and segment marker handles.
 *
 * @module marker-factories
 */
/**
 * Parameters for the {@link createSegmentMarker} function.
 *
 * @typedef {Object} CreateSegmentMarkerOptions
 * @global
 * @property {Segment} segment
 * @property {Boolean} draggable If true, marker is draggable.
 * @property {Boolean} startMarker
 * @property {String} color
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 * @property {Layer} layer
 * @property {String} view
 */

/**
 * Creates a left or right side segment marker handle.
 *
 * @param {CreateSegmentMarkerOptions} options
 * @returns {Marker}
 */

function createSegmentMarker(options) {
  if (options.view === 'zoomview') {
    return new DefaultSegmentMarker(options);
  }

  return null;
}
/**
 * Parameters for the {@link createSegmentLabel} function.
 *
 * @typedef {Object} SegmentLabelOptions
 * @global
 * @property {Segment} segment The {@link Segment} object associated with this
 *   label.
 * @property {String} view The name of the view that the label is being
 *   created in, either <code>zoomview</code> or <code>overview</code>.
 * @property {SegmentsLayer} layer
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 */

/**
 * Creates a Konva object that renders information about a segment, such as
 * its label text.
 *
 * @param {SegmentLabelOptions} options
 * @returns {Konva.Text}
 */

function createSegmentLabel(options) {
  return new Text({
    x: 12,
    y: 12,
    text: options.segment.labelText,
    textAlign: 'center',
    fontFamily: options.fontFamily || 'sans-serif',
    fontSize: options.fontSize || 12,
    fontStyle: options.fontStyle || 'normal',
    fill: '#000'
  });
}
/**
 * Parameters for the {@link createPointMarker} function.
 *
 * @typedef {Object} CreatePointMarkerOptions
 * @global
 * @property {Point} point
 * @property {Boolean} draggable If true, marker is draggable.
 * @property {String} color
 * @property {Layer} layer
 * @property {String} view
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 */

/**
 * Creates a point marker handle.
 *
 * @param {CreatePointMarkerOptions} options
 * @returns {Marker}
 */

function createPointMarker(options) {
  return new DefaultPointMarker(options);
}

/**
 * @file
 *
 * Defines the {@link HighlightLayer} class.
 *
 * @module highlight-layer
 */
/**
 * Creates the highlight region that shows the position of the zoomable
 * waveform view in the overview waveform.
 *
 * @class
 * @alias HighlightLayer
 *
 * @param {WaveformOverview} view
 * @param {Number} offset
 * @param {String} color
 */

function HighlightLayer(view, offset, color) {
  this._view = view;
  this._offset = offset;
  this._color = color;
  this._layer = new Konva.Layer({
    listening: false
  });
  this._highlightRect = null;
  this._startTime = null;
  this._endTime = null;
}

HighlightLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};

HighlightLayer.prototype.showHighlight = function (startTime, endTime) {
  if (!this._highlightRect) {
    this._createHighlightRect(startTime, endTime);
  }

  this._update(startTime, endTime);
};
/**
 * Updates the position of the highlight region.
 *
 * @param {Number} startTime The start of the highlight region, in seconds.
 * @param {Number} endTime The end of the highlight region, in seconds.
 */


HighlightLayer.prototype._update = function (startTime, endTime) {
  this._startTime = startTime;
  this._endTime = endTime;

  var startOffset = this._view.timeToPixels(startTime);

  var endOffset = this._view.timeToPixels(endTime);

  this._highlightRect.setAttrs({
    x: startOffset,
    width: endOffset - startOffset
  });
};

HighlightLayer.prototype._createHighlightRect = function (startTime, endTime) {
  this._startTime = startTime;
  this._endTime = endTime;

  var startOffset = this._view.timeToPixels(startTime);

  var endOffset = this._view.timeToPixels(endTime); // Create with default y and height, the real values are set in fitToView().


  this._highlightRect = new Rect({
    startOffset: 0,
    y: 0,
    width: endOffset - startOffset,
    stroke: this._color,
    strokeWidth: 1,
    height: 0,
    fill: this._color,
    opacity: 0.3,
    cornerRadius: 2
  });
  this.fitToView();

  this._layer.add(this._highlightRect);
};

HighlightLayer.prototype.removeHighlight = function () {
  if (this._highlightRect) {
    this._highlightRect.destroy();

    this._highlightRect = null;
  }
};

HighlightLayer.prototype.updateHighlight = function () {
  if (this._highlightRect) {
    this._update(this._startTime, this._endTime);
  }
};

HighlightLayer.prototype.fitToView = function () {
  if (this._highlightRect) {
    var height = this._view.getHeight();

    var offset = clamp(this._offset, 0, Math.floor(height / 2));

    this._highlightRect.setAttrs({
      y: offset,
      height: height - offset * 2
    });
  }
};

/**
 * @file
 *
 * Defines the {@link MouseDragHandler} class.
 *
 * @module mouse-drag-handler
 */

function getMarkerObject(obj) {
  while (obj.parent !== null) {
    if (obj.parent instanceof Konva.Layer) {
      return obj;
    }

    obj = obj.parent;
  }

  return null;
}
/**
 * An object to receive callbacks on mouse drag events. Each function is
 * called with the current mouse X position, relative to the stage's
 * container HTML element.
 *
 * @typedef {Object} MouseDragHandlers
 * @global
 * @property {Function} onMouseDown Mouse down event handler.
 * @property {Function} onMouseMove Mouse move event handler.
 * @property {Function} onMouseUp Mouse up event handler.
 */

/**
 * Creates a handler for mouse events to allow interaction with the waveform
 * views by clicking and dragging the mouse.
 *
 * @class
 * @alias MouseDragHandler
 *
 * @param {Konva.Stage} stage
 * @param {MouseDragHandlers} handlers
 */


function MouseDragHandler(stage, handlers) {
  this._stage = stage;
  this._handlers = handlers;
  this._dragging = false;
  this._mouseDown = this._mouseDown.bind(this);
  this._mouseUp = this._mouseUp.bind(this);
  this._mouseMove = this._mouseMove.bind(this);

  this._stage.on('mousedown', this._mouseDown);

  this._stage.on('touchstart', this._mouseDown);

  this._lastMouseClientX = null;
}
/**
 * Mouse down event handler.
 *
 * @param {MouseEvent} event
 */


MouseDragHandler.prototype._mouseDown = function (event) {
  var marker = getMarkerObject(event.target); // Avoid interfering with drag/drop of point and segment markers.

  if (marker && marker.attrs.draggable) {
    return;
  }

  this._lastMouseClientX = Math.floor(event.type === 'touchstart' ? event.evt.touches[0].clientX : event.evt.clientX);

  if (this._handlers.onMouseDown) {
    var mouseDownPosX = this._getMousePosX(this._lastMouseClientX);

    this._handlers.onMouseDown(mouseDownPosX);
  } // Use the window mousemove and mouseup handlers instead of the
  // Konva.Stage ones so that we still receive events if the user moves the
  // mouse outside the stage.


  window.addEventListener('mousemove', this._mouseMove, false);
  window.addEventListener('touchmove', this._mouseMove, false);
  window.addEventListener('mouseup', this._mouseUp, false);
  window.addEventListener('touchend', this._mouseUp, false);
  window.addEventListener('blur', this._mouseUp, false);
};
/**
 * Mouse move event handler.
 *
 * @param {MouseEvent} event
 */


MouseDragHandler.prototype._mouseMove = function (event) {
  var clientX = Math.floor(event.type === 'touchmove' ? event.changedTouches[0].clientX : event.clientX); // Don't update on vertical mouse movement.

  if (clientX === this._lastMouseClientX) {
    return;
  }

  this._lastMouseClientX = clientX;
  this._dragging = true;

  if (this._handlers.onMouseMove) {
    var mousePosX = this._getMousePosX(clientX);

    this._handlers.onMouseMove(mousePosX);
  }
};
/**
 * Mouse up event handler.
 *
 * @param {MouseEvent} event
 */


MouseDragHandler.prototype._mouseUp = function (event) {
  var clientX;

  if (event.type === 'touchend') {
    clientX = Math.floor(event.changedTouches[0].clientX);

    if (event.cancelable) {
      event.preventDefault();
    }
  } else {
    clientX = Math.floor(event.clientX);
  }

  if (this._handlers.onMouseUp) {
    var mousePosX = this._getMousePosX(clientX);

    this._handlers.onMouseUp(mousePosX);
  }

  window.removeEventListener('mousemove', this._mouseMove, false);
  window.removeEventListener('touchmove', this._mouseMove, false);
  window.removeEventListener('mouseup', this._mouseUp, false);
  window.removeEventListener('touchend', this._mouseUp, false);
  window.removeEventListener('blur', this._mouseUp, false);
  this._dragging = false;
};
/**
 * @returns {Number} The mouse X position, relative to the container that
 * received the mouse down event.
 *
 * @private
 * @param {Number} clientX Mouse client X position.
 */


MouseDragHandler.prototype._getMousePosX = function (clientX) {
  var containerPos = this._stage.getContainer().getBoundingClientRect();

  return clientX - containerPos.left;
};
/**
 * Returns <code>true</code> if the mouse is being dragged, i.e., moved with
 * the mouse button held down.
 *
 * @returns {Boolean}
 */


MouseDragHandler.prototype.isDragging = function () {
  return this._dragging;
};

/**
 * @file
 *
 * Defines the {@link PlayheadLayer} class.
 *
 * @module playhead-layer
 */
/**
 * Creates a Konva.Layer that displays a playhead marker.
 *
 * @class
 * @alias PlayheadLayer
 *
 * @param {Object} options
 * @param {Player} options.player
 * @param {WaveformOverview|WaveformZoomView} options.view
 * @param {Boolean} options.showPlayheadTime If <code>true</code> The playback time position
 *   is shown next to the playhead.
 * @param {String} options.playheadColor
 * @param {String} options.playheadTextColor
 * @param {String} options.playheadFontFamily
 * @param {Number} options.playheadFontSize
 * @param {String} options.playheadFontStyle
 */

function PlayheadLayer(options) {
  this._player = options.player;
  this._view = options.view;
  this._playheadPixel = 0;
  this._playheadLineAnimation = null;
  this._playheadVisible = false;
  this._playheadColor = options.playheadColor;
  this._playheadTextColor = options.playheadTextColor;
  this._playheadFontFamily = options.playheadFontFamily;
  this._playheadFontSize = options.playheadFontSize;
  this._playheadFontStyle = options.playheadFontStyle;
  this._playheadLayer = new Konva.Layer();

  this._createPlayhead(this._playheadColor);

  if (options.showPlayheadTime) {
    this._createPlayheadText(this._playheadTextColor);
  }

  this.fitToView();
  this.zoomLevelChanged();
}
/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */


PlayheadLayer.prototype.addToStage = function (stage) {
  stage.add(this._playheadLayer);
};
/**
 * Decides whether to use an animation to update the playhead position.
 *
 * If the zoom level is such that the number of pixels per second of audio is
 * low, we can use timeupdate events from the HTMLMediaElement to
 * set the playhead position. Otherwise, we use an animation to update the
 * playhead position more smoothly. The animation is CPU intensive, so we
 * avoid using it where possible.
 */


PlayheadLayer.prototype.zoomLevelChanged = function () {
  var pixelsPerSecond = this._view.timeToPixels(1.0);

  var time;
  this._useAnimation = pixelsPerSecond >= 5;

  if (this._useAnimation) {
    if (this._player.isPlaying() && !this._playheadLineAnimation) {
      // Start the animation
      this._start();
    }
  } else {
    if (this._playheadLineAnimation) {
      // Stop the animation
      time = this._player.getCurrentTime();
      this.stop(time);
    }
  }
};
/**
 * Resizes the playhead UI objects to fit the available space in the
 * view.
 */


PlayheadLayer.prototype.fitToView = function () {
  var height = this._view.getHeight();

  this._playheadLine.points([0.5, 0, 0.5, height]);

  if (this._playheadText) {
    this._playheadText.y(12);
  }
};
/**
 * Creates the playhead UI objects.
 *
 * @private
 * @param {String} color
 */


PlayheadLayer.prototype._createPlayhead = function (color) {
  // Create with default points, the real values are set in fitToView().
  this._playheadLine = new Line({
    stroke: color,
    strokeWidth: 1
  });
  this._playheadGroup = new Konva.Group({
    x: 0,
    y: 0
  });

  this._playheadGroup.add(this._playheadLine);

  this._playheadLayer.add(this._playheadGroup);
};

PlayheadLayer.prototype._createPlayheadText = function (color) {
  var time = this._player.getCurrentTime();

  var text = this._view.formatTime(time); // Create with default y, the real value is set in fitToView().


  this._playheadText = new Text({
    x: 2,
    y: 0,
    text: text,
    fontSize: this._playheadFontSize,
    fontFamily: this._playheadFontFamily,
    fontStyle: this._playheadFontStyle,
    fill: color,
    align: 'right'
  });

  this._playheadGroup.add(this._playheadText);
};
/**
 * Updates the playhead position.
 *
 * @param {Number} time Current playhead position, in seconds.
 */


PlayheadLayer.prototype.updatePlayheadTime = function (time) {
  this._syncPlayhead(time);

  if (this._player.isPlaying()) {
    this._start();
  }
};
/**
 * Updates the playhead position.
 *
 * @private
 * @param {Number} time Current playhead position, in seconds.
 */


PlayheadLayer.prototype._syncPlayhead = function (time) {
  var pixelIndex = this._view.timeToPixels(time);

  var frameOffset = this._view.getFrameOffset();

  var width = this._view.getWidth();

  var isVisible = pixelIndex >= frameOffset && pixelIndex <= frameOffset + width;
  this._playheadPixel = pixelIndex;

  if (isVisible) {
    var playheadX = this._playheadPixel - frameOffset;

    if (!this._playheadVisible) {
      this._playheadVisible = true;

      this._playheadGroup.show();
    }

    this._playheadGroup.setX(playheadX);

    if (this._playheadText) {
      var text = this._view.formatTime(time);

      var playheadTextWidth = this._playheadText.getTextWidth();

      this._playheadText.setText(text);

      if (playheadTextWidth + playheadX > width - 2) {
        this._playheadText.setX(-playheadTextWidth - 2);
      } else if (playheadTextWidth + playheadX < width) {
        this._playheadText.setX(2);
      }
    }
  } else {
    if (this._playheadVisible) {
      this._playheadVisible = false;

      this._playheadGroup.hide();
    }
  }

  if (this._view.playheadPosChanged) {
    this._view.playheadPosChanged(time);
  }
};
/**
 * Starts a playhead animation in sync with the media playback.
 *
 * @private
 */


PlayheadLayer.prototype._start = function () {
  var self = this;

  if (self._playheadLineAnimation) {
    self._playheadLineAnimation.stop();

    self._playheadLineAnimation = null;
  }

  if (!self._useAnimation) {
    return;
  }

  var lastPlayheadPosition = null;
  self._playheadLineAnimation = new Animation(function () {
    var time = self._player.getCurrentTime();

    var playheadPosition = self._view.timeToPixels(time);

    if (playheadPosition !== lastPlayheadPosition) {
      self._syncPlayhead(time);

      lastPlayheadPosition = playheadPosition;
    }
  }, self._playheadLayer);

  self._playheadLineAnimation.start();
};

PlayheadLayer.prototype.stop = function (time) {
  if (this._playheadLineAnimation) {
    this._playheadLineAnimation.stop();

    this._playheadLineAnimation = null;
  }

  this._syncPlayhead(time);
};
/**
 * Returns the position of the playhead marker, in pixels relative to the
 * left hand side of the waveform view.
 *
 * @return {Number}
 */


PlayheadLayer.prototype.getPlayheadOffset = function () {
  return this._playheadPixel - this._view.getFrameOffset();
};

PlayheadLayer.prototype.getPlayheadPixel = function () {
  return this._playheadPixel;
};

PlayheadLayer.prototype.showPlayheadTime = function (show) {
  if (show) {
    if (!this._playheadText) {
      // Create it
      this._createPlayheadText(this._playheadTextColor);

      this.fitToView();
    }
  } else {
    if (this._playheadText) {
      this._playheadText.remove();

      this._playheadText.destroy();

      this._playheadText = null;
    }
  }
};

PlayheadLayer.prototype.updatePlayheadText = function () {
  if (this._playheadText) {
    var time = this._player.getCurrentTime();

    var text = this._view.formatTime(time);

    this._playheadText.setText(text);
  }
};

PlayheadLayer.prototype.destroy = function () {
  if (this._playheadLineAnimation) {
    this._playheadLineAnimation.stop();

    this._playheadLineAnimation = null;
  }
};

/**
 * @file
 *
 * Defines the {@link PointMarker} class.
 *
 * @module point-marker
 */
/**
 * Parameters for the {@link PointMarker} constructor.
 *
 * @typedef {Object} PointMarkerOptions
 * @global
 * @property {Point} point Point object with timestamp.
 * @property {Boolean} draggable If true, marker is draggable.
 * @property {Marker} marker
 * @property {Function} onDblClick
 * @property {Function} onDragStart
 * @property {Function} onDragMove Callback during mouse drag operations.
 * @property {Function} onDragEnd
 * @property {Function} onMouseEnter
 * @property {Function} onMouseLeave
 */

/**
 * Creates a point marker handle.
 *
 * @class
 * @alias PointMarker
 *
 * @param {PointMarkerOptions} options
 */

function PointMarker(options) {
  this._point = options.point;
  this._marker = options.marker;
  this._draggable = options.draggable;
  this._onClick = options.onClick;
  this._onDblClick = options.onDblClick;
  this._onDragStart = options.onDragStart;
  this._onDragMove = options.onDragMove;
  this._onDragEnd = options.onDragEnd;
  this._onMouseEnter = options.onMouseEnter;
  this._onMouseLeave = options.onMouseLeave;
  this._dragBoundFunc = this._dragBoundFunc.bind(this);
  this._group = new Konva.Group({
    draggable: this._draggable,
    dragBoundFunc: this._dragBoundFunc
  });

  this._bindDefaultEventHandlers();

  this._marker.init(this._group);
}

PointMarker.prototype._bindDefaultEventHandlers = function () {
  var self = this;

  self._group.on('dragstart', function () {
    self._onDragStart(self._point);
  });

  self._group.on('dragmove', function () {
    self._onDragMove(self._point);
  });

  self._group.on('dragend', function () {
    self._onDragEnd(self._point);
  });

  self._group.on('click', function () {
    self._onClick(self._point);
  });

  self._group.on('dblclick', function () {
    self._onDblClick(self._point);
  });

  self._group.on('mouseenter', function () {
    self._onMouseEnter(self._point);
  });

  self._group.on('mouseleave', function () {
    self._onMouseLeave(self._point);
  });
};

PointMarker.prototype._dragBoundFunc = function (pos) {
  // Allow the marker to be moved horizontally but not vertically.
  return {
    x: pos.x,
    y: this._group.getAbsolutePosition().y
  };
};
/**
 * @param {Konva.Layer} layer
 */


PointMarker.prototype.addToLayer = function (layer) {
  layer.add(this._group);
};

PointMarker.prototype.fitToView = function () {
  this._marker.fitToView();
};

PointMarker.prototype.getPoint = function () {
  return this._point;
};

PointMarker.prototype.getX = function () {
  return this._group.getX();
};

PointMarker.prototype.getWidth = function () {
  return this._group.getWidth();
};

PointMarker.prototype.setX = function (x) {
  this._group.setX(x);
};

PointMarker.prototype.timeUpdated = function (time) {
  if (this._marker.timeUpdated) {
    this._marker.timeUpdated(time);
  }
};

PointMarker.prototype.destroy = function () {
  if (this._marker.destroy) {
    this._marker.destroy();
  }

  this._group.destroyChildren();

  this._group.destroy();
};

/**
 * @file
 *
 * Defines the {@link PointsLayer} class.
 *
 * @module points-layer
 */
var defaultFontFamily$1 = 'sans-serif';
var defaultFontSize$1 = 10;
var defaultFontShape$1 = 'normal';
/**
 * Creates a Konva.Layer that displays point markers against the audio
 * waveform.
 *
 * @class
 * @alias PointsLayer
 *
 * @param {Peaks} peaks
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Boolean} allowEditing
 */

function PointsLayer(peaks, view, allowEditing) {
  this._peaks = peaks;
  this._view = view;
  this._allowEditing = allowEditing;
  this._pointMarkers = {};
  this._layer = new Konva.Layer();
  this._onPointsDrag = this._onPointsDrag.bind(this);
  this._onPointHandleClick = this._onPointHandleClick.bind(this);
  this._onPointHandleDblClick = this._onPointHandleDblClick.bind(this);
  this._onPointHandleDragStart = this._onPointHandleDragStart.bind(this);
  this._onPointHandleDragMove = this._onPointHandleDragMove.bind(this);
  this._onPointHandleDragEnd = this._onPointHandleDragEnd.bind(this);
  this._onPointHandleMouseEnter = this._onPointHandleMouseEnter.bind(this);
  this._onPointHandleMouseLeave = this._onPointHandleMouseLeave.bind(this);
  this._onPointsUpdate = this._onPointsUpdate.bind(this);
  this._onPointsAdd = this._onPointsAdd.bind(this);
  this._onPointsRemove = this._onPointsRemove.bind(this);
  this._onPointsRemoveAll = this._onPointsRemoveAll.bind(this);

  this._peaks.on('points.update', this._onPointsUpdate);

  this._peaks.on('points.add', this._onPointsAdd);

  this._peaks.on('points.remove', this._onPointsRemove);

  this._peaks.on('points.remove_all', this._onPointsRemoveAll);

  this._peaks.on('points.dragstart', this._onPointsDrag);

  this._peaks.on('points.dragmove', this._onPointsDrag);

  this._peaks.on('points.dragend', this._onPointsDrag);
}
/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */


PointsLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};

PointsLayer.prototype.enableEditing = function (enable) {
  this._allowEditing = enable;
};

PointsLayer.prototype.formatTime = function (time) {
  return this._view.formatTime(time);
};

PointsLayer.prototype._onPointsUpdate = function (point) {
  var frameStartTime = this._view.getStartTime();

  var frameEndTime = this._view.getEndTime();

  this._removePoint(point);

  if (point.isVisible(frameStartTime, frameEndTime)) {
    this._addPointMarker(point);
  }

  this.updatePoints(frameStartTime, frameEndTime);
};

PointsLayer.prototype._onPointsAdd = function (points) {
  var self = this;

  var frameStartTime = self._view.getStartTime();

  var frameEndTime = self._view.getEndTime();

  points.forEach(function (point) {
    if (point.isVisible(frameStartTime, frameEndTime)) {
      self._addPointMarker(point);
    }
  });
  self.updatePoints(frameStartTime, frameEndTime);
};

PointsLayer.prototype._onPointsRemove = function (points) {
  var self = this;
  points.forEach(function (point) {
    self._removePoint(point);
  });
};

PointsLayer.prototype._onPointsRemoveAll = function () {
  this._layer.removeChildren();

  this._pointMarkers = {};
};

PointsLayer.prototype._onPointsDrag = function (point) {
  this._updatePoint(point);
};
/**
 * Creates the Konva UI objects for a given point.
 *
 * @private
 * @param {Point} point
 * @returns {PointMarker}
 */


PointsLayer.prototype._createPointMarker = function (point) {
  var editable = this._allowEditing && point.editable;

  var marker = this._peaks.options.createPointMarker({
    point: point,
    draggable: editable,
    color: point.color ? point.color : this._peaks.options.pointMarkerColor,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily$1,
    fontSize: this._peaks.options.fontSize || defaultFontSize$1,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape$1,
    layer: this,
    view: this._view.getName()
  });

  return new PointMarker({
    point: point,
    draggable: editable,
    marker: marker,
    onClick: this._onPointHandleClick,
    onDblClick: this._onPointHandleDblClick,
    onDragStart: this._onPointHandleDragStart,
    onDragMove: this._onPointHandleDragMove,
    onDragEnd: this._onPointHandleDragEnd,
    onMouseEnter: this._onPointHandleMouseEnter,
    onMouseLeave: this._onPointHandleMouseLeave
  });
};

PointsLayer.prototype.getHeight = function () {
  return this._view.getHeight();
};
/**
 * Adds a Konva UI object to the layer for a given point.
 *
 * @private
 * @param {Point} point
 * @returns {PointMarker}
 */


PointsLayer.prototype._addPointMarker = function (point) {
  var pointMarker = this._createPointMarker(point);

  this._pointMarkers[point.id] = pointMarker;
  pointMarker.addToLayer(this._layer);
  return pointMarker;
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleDragMove = function (point) {
  var pointMarker = this._pointMarkers[point.id];
  var markerX = pointMarker.getX();

  if (markerX >= 0 && markerX < this._view.getWidth()) {
    var offset = markerX + pointMarker.getWidth();

    point._setTime(this._view.pixelOffsetToTime(offset));

    pointMarker.timeUpdated(point.time);
  }

  this._peaks.emit('points.dragmove', point);
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleMouseEnter = function (point) {
  this._peaks.emit('points.mouseenter', point);
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleMouseLeave = function (point) {
  this._peaks.emit('points.mouseleave', point);
};

PointsLayer.prototype._onPointHandleClick = function (point) {
  this._peaks.emit('points.click', point);
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleDblClick = function (point) {
  this._peaks.emit('points.dblclick', point);
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleDragStart = function (point) {
  this._peaks.emit('points.dragstart', point);
};
/**
 * @param {Point} point
 */


PointsLayer.prototype._onPointHandleDragEnd = function (point) {
  this._peaks.emit('points.dragend', point);
};
/**
 * Updates the positions of all displayed points in the view.
 *
 * @param {Number} startTime The start of the visible range in the view,
 *   in seconds.
 * @param {Number} endTime The end of the visible range in the view,
 *   in seconds.
 */


PointsLayer.prototype.updatePoints = function (startTime, endTime) {
  // Update all points in the visible time range.
  var points = this._peaks.points.find(startTime, endTime);

  points.forEach(this._updatePoint.bind(this)); // TODO: in the overview all points are visible, so no need to check

  this._removeInvisiblePoints(startTime, endTime);
};
/**
 * @private
 * @param {Point} point
 */


PointsLayer.prototype._updatePoint = function (point) {
  var pointMarker = this._findOrAddPointMarker(point);

  var pointMarkerOffset = this._view.timeToPixels(point.time);

  var pointMarkerX = pointMarkerOffset - this._view.getFrameOffset();

  pointMarker.setX(pointMarkerX);
};
/**
 * @private
 * @param {Point} point
 * @return {PointMarker}
 */


PointsLayer.prototype._findOrAddPointMarker = function (point) {
  var pointMarker = this._pointMarkers[point.id];

  if (!pointMarker) {
    pointMarker = this._addPointMarker(point);
  }

  return pointMarker;
};
/**
 * Remove any points that are not visible, i.e., are outside the given time
 * range.
 *
 * @private
 * @param {Number} startTime The start of the visible time range, in seconds.
 * @param {Number} endTime The end of the visible time range, in seconds.
 * @returns {Number} The number of points removed.
 */


PointsLayer.prototype._removeInvisiblePoints = function (startTime, endTime) {
  var count = 0;

  for (var pointId in this._pointMarkers) {
    if (objectHasProperty(this._pointMarkers, pointId)) {
      var point = this._pointMarkers[pointId].getPoint();

      if (!point.isVisible(startTime, endTime)) {
        this._removePoint(point);

        count++;
      }
    }
  }

  return count;
};
/**
 * Removes the UI object for a given point.
 *
 * @private
 * @param {Point} point
 */


PointsLayer.prototype._removePoint = function (point) {
  var pointMarker = this._pointMarkers[point.id];

  if (pointMarker) {
    pointMarker.destroy();
    delete this._pointMarkers[point.id];
  }
};
/**
 * Toggles visibility of the points layer.
 *
 * @param {Boolean} visible
 */


PointsLayer.prototype.setVisible = function (visible) {
  this._layer.setVisible(visible);
};

PointsLayer.prototype.destroy = function () {
  this._peaks.off('points.update', this._onPointsUpdate);

  this._peaks.off('points.add', this._onPointsAdd);

  this._peaks.off('points.remove', this._onPointsRemove);

  this._peaks.off('points.remove_all', this._onPointsRemoveAll);

  this._peaks.off('points.dragstart', this._onPointsDrag);

  this._peaks.off('points.dragmove', this._onPointsDrag);

  this._peaks.off('points.dragend', this._onPointsDrag);
};

PointsLayer.prototype.fitToView = function () {
  for (var pointId in this._pointMarkers) {
    if (objectHasProperty(this._pointMarkers, pointId)) {
      var pointMarker = this._pointMarkers[pointId];
      pointMarker.fitToView();
    }
  }
};

PointsLayer.prototype.draw = function () {
  this._layer.draw();
};

/**
 * @file
 *
 * Defines the {@link SegmentMarker} class.
 *
 * @module segment-marker
 */
/**
 * Parameters for the {@link SegmentMarker} constructor.
 *
 * @typedef {Object} SegmentMarkerOptions
 * @global
 * @property {Segment} segment
 * @property {SegmentShape} segmentShape
 * @property {Boolean} draggable If true, marker is draggable.
 * @property {Boolean} startMarker If <code>true</code>, the marker indicates
 *   the start time of the segment. If <code>false</code>, the marker
 *   indicates the end time of the segment.
 * @property {Function} onDrag
 * @property {Function} onDragStart
 * @property {Function} onDragEnd
 */

/**
 * Creates a Left or Right side segment handle marker.
 *
 * @class
 * @alias SegmentMarker
 *
 * @param {SegmentMarkerOptions} options
 */

function SegmentMarker(options) {
  this._segment = options.segment;
  this._marker = options.marker;
  this._segmentShape = options.segmentShape;
  this._draggable = options.draggable;
  this._layer = options.layer;
  this._startMarker = options.startMarker;
  this._onDrag = options.onDrag;
  this._onDragStart = options.onDragStart;
  this._onDragEnd = options.onDragEnd;
  this._dragBoundFunc = this._dragBoundFunc.bind(this);
  this._group = new Konva.Group({
    draggable: this._draggable,
    dragBoundFunc: this._dragBoundFunc
  });

  this._bindDefaultEventHandlers();

  this._marker.init(this._group);
}

SegmentMarker.prototype._bindDefaultEventHandlers = function () {
  var self = this;

  if (self._draggable) {
    self._group.on('dragmove', function () {
      self._onDrag(self);
    });

    self._group.on('dragstart', function () {
      self._onDragStart(self);
    });

    self._group.on('dragend', function () {
      self._onDragEnd(self);
    });
  }
};

SegmentMarker.prototype._dragBoundFunc = function (pos) {
  var marker;
  var limit;

  if (this._startMarker) {
    marker = this._segmentShape.getEndMarker();
    limit = marker.getX() - marker.getWidth();

    if (pos.x > limit) {
      pos.x = limit;
    }
  } else {
    marker = this._segmentShape.getStartMarker();
    limit = marker.getX() + marker.getWidth();

    if (pos.x < limit) {
      pos.x = limit;
    }
  }

  return {
    x: pos.x,
    y: this._group.getAbsolutePosition().y
  };
};

SegmentMarker.prototype.addToLayer = function (layer) {
  layer.add(this._group);
};

SegmentMarker.prototype.fitToView = function () {
  this._marker.fitToView();
};

SegmentMarker.prototype.getSegment = function () {
  return this._segment;
};

SegmentMarker.prototype.getX = function () {
  return this._group.getX();
};

SegmentMarker.prototype.getWidth = function () {
  return this._group.getWidth();
};

SegmentMarker.prototype.isStartMarker = function () {
  return this._startMarker;
};

SegmentMarker.prototype.setX = function (x) {
  this._group.setX(x);
};

SegmentMarker.prototype.timeUpdated = function (time) {
  if (this._marker.timeUpdated) {
    this._marker.timeUpdated(time);
  }
};

SegmentMarker.prototype.destroy = function () {
  if (this._marker.destroy) {
    this._marker.destroy();
  }

  this._group.destroyChildren();

  this._group.destroy();
};

/**
 * @file
 *
 * Defines the {@link WaveformShape} class.
 *
 * @module waveform-shape
 */
/**
 * Waveform shape options.
 *
 * @typedef {Object} WaveformShapeOptions
 * @global
 * @property {String | LinearGradientColor} color Waveform color.
 * @property {WaveformOverview|WaveformZoomView} view The view object
 *   that contains the waveform shape.
 * @property {Segment?} segment If given, render a waveform image
 *   covering the segment's time range. Otherwise, render the entire
 *   waveform duration.
 */

/**
 * Creates a Konva.Shape object that renders a waveform image.
 *
 * @class
 * @alias WaveformShape
 *
 * @param {WaveformShapeOptions} options
 */

function WaveformShape(options) {
  this._color = options.color;
  var shapeOptions = {};

  if (isString(options.color)) {
    shapeOptions.fill = options.color;
  } else if (isLinearGradientColor(options.color)) {
    var startY = options.view._height * (options.color.linearGradientStart / 100);
    var endY = options.view._height * (options.color.linearGradientEnd / 100);
    shapeOptions.fillLinearGradientStartPointY = startY;
    shapeOptions.fillLinearGradientEndPointY = endY;
    shapeOptions.fillLinearGradientColorStops = [0, options.color.linearGradientColorStops[0], 1, options.color.linearGradientColorStops[1]];
  } else {
    throw new TypeError('Unknown type for color property');
  }

  this._shape = new Konva.Shape(shapeOptions);
  this._view = options.view;
  this._segment = options.segment;

  this._shape.sceneFunc(this._sceneFunc.bind(this));

  this._shape.hitFunc(this._waveformShapeHitFunc.bind(this));
} // WaveformShape.prototype = Object.create(Konva.Shape.prototype);


WaveformShape.prototype.setSegment = function (segment) {
  this._segment = segment;
};

WaveformShape.prototype.setWaveformColor = function (color) {
  if (isString(color)) {
    this._shape.fill(color);

    this._shape.fillLinearGradientStartPointY(null);

    this._shape.fillLinearGradientEndPointY(null);

    this._shape.fillLinearGradientColorStops(null);
  } else if (isLinearGradientColor(color)) {
    this._shape.fill(null);

    var startY = this._view._height * (color.linearGradientStart / 100);
    var endY = this._view._height * (color.linearGradientEnd / 100);

    this._shape.fillLinearGradientStartPointY(startY);

    this._shape.fillLinearGradientEndPointY(endY);

    this._shape.fillLinearGradientColorStops([0, color.linearGradientColorStops[0], 1, color.linearGradientColorStops[1]]);
  } else {
    throw new TypeError('Unknown type for color property');
  }
};

WaveformShape.prototype.fitToView = function () {
  this.setWaveformColor(this._color);
};

WaveformShape.prototype._sceneFunc = function (context) {
  var frameOffset = this._view.getFrameOffset();

  var width = this._view.getWidth();

  var height = this._view.getHeight();

  this._drawWaveform(context, this._view.getWaveformData(), frameOffset, this._segment ? this._view.timeToPixels(this._segment.startTime) : frameOffset, this._segment ? this._view.timeToPixels(this._segment.endTime) : frameOffset + width, width, height);
};
/**
 * Draws a waveform on a canvas context.
 *
 * @param {Konva.Context} context The canvas context to draw on.
 * @param {WaveformData} waveformData The waveform data to draw.
 * @param {Number} frameOffset The start position of the waveform shown
 *   in the view, in pixels.
 * @param {Number} startPixels The start position of the waveform to draw,
 *   in pixels.
 * @param {Number} endPixels The end position of the waveform to draw,
 *   in pixels.
 * @param {Number} width The width of the waveform area, in pixels.
 * @param {Number} height The height of the waveform area, in pixels.
 */


WaveformShape.prototype._drawWaveform = function (context, waveformData, frameOffset, startPixels, endPixels, width, height) {
  if (startPixels < frameOffset) {
    startPixels = frameOffset;
  }

  var limit = frameOffset + width;

  if (endPixels > limit) {
    endPixels = limit;
  }

  if (endPixels > waveformData.length - 1) {
    endPixels = waveformData.length - 1;
  }

  var channels = waveformData.channels;
  var waveformTop = 0;
  var waveformHeight = Math.floor(height / channels);

  for (var i = 0; i < channels; i++) {
    if (i === channels - 1) {
      waveformHeight = height - (channels - 1) * waveformHeight;
    }

    this._drawChannel(context, waveformData.channel(i), frameOffset, startPixels, endPixels, waveformTop, waveformHeight);

    waveformTop += waveformHeight;
  }
};
/**
 * Draws a single waveform channel on a canvas context.
 *
 * @param {Konva.Context} context The canvas context to draw on.
 * @param {WaveformDataChannel} channel The waveform data to draw.
 * @param {Number} frameOffset The start position of the waveform shown
 *   in the view, in pixels.
 * @param {Number} startPixels The start position of the waveform to draw,
 *   in pixels.
 * @param {Number} endPixels The end position of the waveform to draw,
 *   in pixels.
 * @param {Number} top The top of the waveform channel area, in pixels.
 * @param {Number} height The height of the waveform channel area, in pixels.
 */


WaveformShape.prototype._drawChannel = function (context, channel, frameOffset, startPixels, endPixels, top, height) {
  var x, amplitude;

  var amplitudeScale = this._view.getAmplitudeScale();

  var lineX, lineY;
  context.beginPath();

  for (x = startPixels; x <= endPixels; x++) {
    amplitude = channel.min_sample(x);
    lineX = x - frameOffset + 0.5;
    lineY = top + WaveformShape.scaleY(amplitude, height, amplitudeScale) + 0.5;
    context.lineTo(lineX, lineY);
  }

  for (x = endPixels; x >= startPixels; x--) {
    amplitude = channel.max_sample(x);
    lineX = x - frameOffset + 0.5;
    lineY = top + WaveformShape.scaleY(amplitude, height, amplitudeScale) + 0.5;
    context.lineTo(lineX, lineY);
  }

  context.closePath();
  context.fillShape(this._shape);
};

WaveformShape.prototype._waveformShapeHitFunc = function (context) {
  if (!this._segment) {
    return;
  }

  var frameOffset = this._view.getFrameOffset();

  var viewWidth = this._view.getWidth();

  var viewHeight = this._view.getHeight();

  var startPixels = this._view.timeToPixels(this._segment.startTime);

  var endPixels = this._view.timeToPixels(this._segment.endTime);

  var offsetY = 10;
  var hitRectHeight = viewHeight - 2 * offsetY;

  if (hitRectHeight < 0) {
    hitRectHeight = 0;
  }

  var hitRectLeft = startPixels - frameOffset;
  var hitRectWidth = endPixels - startPixels;

  if (hitRectLeft < 0) {
    hitRectWidth -= -hitRectLeft;
    hitRectLeft = 0;
  }

  if (hitRectLeft + hitRectWidth > viewWidth) {
    hitRectWidth -= hitRectLeft + hitRectWidth - viewWidth;
  }

  context.beginPath();
  context.rect(hitRectLeft, offsetY, hitRectWidth, hitRectHeight);
  context.closePath();
  context.fillStrokeShape(this._shape);
};

WaveformShape.prototype.addToLayer = function (layer) {
  layer.add(this._shape);
};

WaveformShape.prototype.destroy = function () {
  this._shape.destroy();

  this._shape = null;
};

WaveformShape.prototype.on = function (event, handler) {
  this._shape.on(event, handler);
};
/**
 * Scales the waveform data for drawing on a canvas context.
 *
 * @see {@link https://stats.stackexchange.com/questions/281162}
 *
 * @todo Assumes 8-bit waveform data (-128 to 127 range)
 *
 * @param {Number} amplitude The waveform data point amplitude.
 * @param {Number} height The height of the waveform, in pixels.
 * @param {Number} scale Amplitude scaling factor.
 * @returns {Number} The scaled waveform data point.
 */


WaveformShape.scaleY = function (amplitude, height, scale) {
  var y = -(height - 1) * (amplitude * scale + 128) / 255 + (height - 1);
  return clamp(Math.floor(y), 0, height - 1);
};

/**
 * @file
 *
 * Defines the {@link SegmentShape} class.
 *
 * @module segment-shape
 */
var defaultFontFamily = 'sans-serif';
var defaultFontSize = 10;
var defaultFontShape = 'normal';
/**
 * Creates a waveform segment shape with optional start and end markers.
 *
 * @class
 * @alias SegmentShape
 *
 * @param {Segment} segment
 * @param {Peaks} peaks
 * @param {SegmentsLayer} layer
 * @param {WaveformOverview|WaveformZoomView} view
 */

function SegmentShape(segment, peaks, layer, view) {
  this._segment = segment;
  this._peaks = peaks;
  this._layer = layer;
  this._view = view;
  this._label = null;
  this._startMarker = null;
  this._endMarker = null;
  this._color = segment.color;
  this._waveformShape = new WaveformShape({
    color: segment.color,
    view: view,
    segment: segment
  });
  this._onMouseEnter = this._onMouseEnter.bind(this);
  this._onMouseLeave = this._onMouseLeave.bind(this);
  this._onClick = this._onClick.bind(this);
  this._onDblClick = this._onDblClick.bind(this); // Set up event handlers to show/hide the segment label text when the user
  // hovers the mouse over the segment.

  this._waveformShape.on('mouseenter', this._onMouseEnter);

  this._waveformShape.on('mouseleave', this._onMouseLeave);

  this._waveformShape.on('click', this._onClick);

  this._waveformShape.on('dblclick', this._onDblClick); // Event handlers for markers


  this._onSegmentHandleDrag = this._onSegmentHandleDrag.bind(this);
  this._onSegmentHandleDragStart = this._onSegmentHandleDragStart.bind(this);
  this._onSegmentHandleDragEnd = this._onSegmentHandleDragEnd.bind(this);
  this._label = this._peaks.options.createSegmentLabel({
    segment: segment,
    view: this._view.getName(),
    layer: this._layer,
    fontFamily: this._peaks.options.fontFamily,
    fontSize: this._peaks.options.fontSize,
    fontStyle: this._peaks.options.fontStyle
  });

  if (this._label) {
    this._label.hide();
  }

  this._createMarkers();
}

SegmentShape.prototype.updatePosition = function () {
  var segmentStartOffset = this._view.timeToPixels(this._segment.startTime);

  var segmentEndOffset = this._view.timeToPixels(this._segment.endTime);

  var frameStartOffset = this._view.getFrameOffset();

  var startPixel = segmentStartOffset - frameStartOffset;
  var endPixel = segmentEndOffset - frameStartOffset;
  var marker = this.getStartMarker();

  if (marker) {
    marker.setX(startPixel - marker.getWidth());
  }

  marker = this.getEndMarker();

  if (marker) {
    marker.setX(endPixel);
  }
};

SegmentShape.prototype.getSegment = function () {
  return this._segment;
};

SegmentShape.prototype.getStartMarker = function () {
  return this._startMarker;
};

SegmentShape.prototype.getEndMarker = function () {
  return this._endMarker;
};

SegmentShape.prototype.addToLayer = function (layer) {
  this._waveformShape.addToLayer(layer);

  if (this._label) {
    layer.add(this._label);
  }

  if (this._startMarker) {
    this._startMarker.addToLayer(layer);
  }

  if (this._endMarker) {
    this._endMarker.addToLayer(layer);
  }
};

SegmentShape.prototype._createMarkers = function () {
  var editable = this._layer.isEditingEnabled() && this._segment.editable;

  if (!editable) {
    return;
  }

  var startMarker = this._peaks.options.createSegmentMarker({
    segment: this._segment,
    draggable: editable,
    startMarker: true,
    color: this._peaks.options.segmentStartMarkerColor,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily,
    fontSize: this._peaks.options.fontSize || defaultFontSize,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape,
    layer: this._layer,
    view: this._view.getName()
  });

  if (startMarker) {
    this._startMarker = new SegmentMarker({
      segment: this._segment,
      segmentShape: this,
      draggable: editable,
      startMarker: true,
      marker: startMarker,
      onDrag: this._onSegmentHandleDrag,
      onDragStart: this._onSegmentHandleDragStart,
      onDragEnd: this._onSegmentHandleDragEnd
    });
  }

  var endMarker = this._peaks.options.createSegmentMarker({
    segment: this._segment,
    draggable: editable,
    startMarker: false,
    color: this._peaks.options.segmentEndMarkerColor,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily,
    fontSize: this._peaks.options.fontSize || defaultFontSize,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape,
    layer: this._layer,
    view: this._view.getName()
  });

  if (endMarker) {
    this._endMarker = new SegmentMarker({
      segment: this._segment,
      segmentShape: this,
      draggable: editable,
      startMarker: false,
      marker: endMarker,
      onDrag: this._onSegmentHandleDrag,
      onDragStart: this._onSegmentHandleDragStart,
      onDragEnd: this._onSegmentHandleDragEnd
    });
  }
};

SegmentShape.prototype._onMouseEnter = function () {
  if (this._label) {
    this._label.moveToTop();

    this._label.show();
  }

  this._peaks.emit('segments.mouseenter', this._segment);
};

SegmentShape.prototype._onMouseLeave = function () {
  if (this._label) {
    this._label.hide();
  }

  this._peaks.emit('segments.mouseleave', this._segment);
};

SegmentShape.prototype._onClick = function () {
  this._peaks.emit('segments.click', this._segment);
};

SegmentShape.prototype._onDblClick = function () {
  this._peaks.emit('segments.dblclick', this._segment);
};
/**
 * @param {SegmentMarker} segmentMarker
 */


SegmentShape.prototype._onSegmentHandleDrag = function (segmentMarker) {
  var width = this._view.getWidth();

  var startMarker = segmentMarker.isStartMarker();

  var startMarkerX = this._startMarker.getX();

  var endMarkerX = this._endMarker.getX();

  if (startMarker && startMarkerX >= 0) {
    var startMarkerOffset = startMarkerX + this._startMarker.getWidth();

    this._segment._setStartTime(this._view.pixelOffsetToTime(startMarkerOffset));

    segmentMarker.timeUpdated(this._segment.startTime);
  }

  if (!startMarker && endMarkerX < width) {
    var endMarkerOffset = endMarkerX;

    this._segment._setEndTime(this._view.pixelOffsetToTime(endMarkerOffset));

    segmentMarker.timeUpdated(this._segment.endTime);
  }

  this._peaks.emit('segments.dragged', this._segment, startMarker);
};
/**
 * @param {SegmentMarker} segmentMarker
 */


SegmentShape.prototype._onSegmentHandleDragStart = function (segmentMarker) {
  var startMarker = segmentMarker.isStartMarker();

  this._peaks.emit('segments.dragstart', this._segment, startMarker);
};
/**
 * @param {SegmentMarker} segmentMarker
 */


SegmentShape.prototype._onSegmentHandleDragEnd = function (segmentMarker) {
  var startMarker = segmentMarker.isStartMarker();

  this._peaks.emit('segments.dragend', this._segment, startMarker);
};

SegmentShape.prototype.fitToView = function () {
  if (this._startMarker) {
    this._startMarker.fitToView();
  }

  if (this._endMarker) {
    this._endMarker.fitToView();
  }

  this._waveformShape.setWaveformColor(this._color);
};

SegmentShape.prototype.destroy = function () {
  this._waveformShape.destroy();

  if (this._label) {
    this._label.destroy();
  }

  if (this._startMarker) {
    this._startMarker.destroy();
  }

  if (this._endMarker) {
    this._endMarker.destroy();
  }
};

/**
 * @file
 *
 * Defines the {@link SegmentsLayer} class.
 *
 * @module segments-layer
 */
/**
 * Creates a Konva.Layer that displays segment markers against the audio
 * waveform.
 *
 * @class
 * @alias SegmentsLayer
 *
 * @param {Peaks} peaks
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Boolean} allowEditing
 */

function SegmentsLayer(peaks, view, allowEditing) {
  this._peaks = peaks;
  this._view = view;
  this._allowEditing = allowEditing;
  this._segmentShapes = {};
  this._layer = new Konva.Layer();
  this._onSegmentsUpdate = this._onSegmentsUpdate.bind(this);
  this._onSegmentsAdd = this._onSegmentsAdd.bind(this);
  this._onSegmentsRemove = this._onSegmentsRemove.bind(this);
  this._onSegmentsRemoveAll = this._onSegmentsRemoveAll.bind(this);
  this._onSegmentsDragged = this._onSegmentsDragged.bind(this);

  this._peaks.on('segments.update', this._onSegmentsUpdate);

  this._peaks.on('segments.add', this._onSegmentsAdd);

  this._peaks.on('segments.remove', this._onSegmentsRemove);

  this._peaks.on('segments.remove_all', this._onSegmentsRemoveAll);

  this._peaks.on('segments.dragged', this._onSegmentsDragged);
}
/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */


SegmentsLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};

SegmentsLayer.prototype.enableEditing = function (enable) {
  this._allowEditing = enable;
};

SegmentsLayer.prototype.isEditingEnabled = function () {
  return this._allowEditing;
};

SegmentsLayer.prototype.formatTime = function (time) {
  return this._view.formatTime(time);
};

SegmentsLayer.prototype._onSegmentsUpdate = function (segment) {
  var redraw = false;
  var segmentShape = this._segmentShapes[segment.id];

  var frameStartTime = this._view.getStartTime();

  var frameEndTime = this._view.getEndTime();

  if (segmentShape) {
    this._removeSegment(segment);

    redraw = true;
  }

  if (segment.isVisible(frameStartTime, frameEndTime)) {
    this._addSegmentShape(segment);

    redraw = true;
  }

  if (redraw) {
    this.updateSegments(frameStartTime, frameEndTime);
  }
};

SegmentsLayer.prototype._onSegmentsAdd = function (segments) {
  var self = this;

  var frameStartTime = self._view.getStartTime();

  var frameEndTime = self._view.getEndTime();

  segments.forEach(function (segment) {
    if (segment.isVisible(frameStartTime, frameEndTime)) {
      self._addSegmentShape(segment);
    }
  });
  self.updateSegments(frameStartTime, frameEndTime);
};

SegmentsLayer.prototype._onSegmentsRemove = function (segments) {
  var self = this;
  segments.forEach(function (segment) {
    self._removeSegment(segment);
  });
};

SegmentsLayer.prototype._onSegmentsRemoveAll = function () {
  this._layer.removeChildren();

  this._segmentShapes = {};
};

SegmentsLayer.prototype._onSegmentsDragged = function (segment) {
  this._updateSegment(segment);
};
/**
 * Creates the Konva UI objects for a given segment.
 *
 * @private
 * @param {Segment} segment
 * @returns {SegmentShape}
 */


SegmentsLayer.prototype._createSegmentShape = function (segment) {
  return new SegmentShape(segment, this._peaks, this, this._view);
};
/**
 * Adds a Konva UI object to the layer for a given segment.
 *
 * @private
 * @param {Segment} segment
 * @returns {SegmentShape}
 */


SegmentsLayer.prototype._addSegmentShape = function (segment) {
  var segmentShape = this._createSegmentShape(segment);

  segmentShape.addToLayer(this._layer);
  this._segmentShapes[segment.id] = segmentShape;
  return segmentShape;
};
/**
 * Updates the positions of all displayed segments in the view.
 *
 * @param {Number} startTime The start of the visible range in the view,
 *   in seconds.
 * @param {Number} endTime The end of the visible range in the view,
 *   in seconds.
 */


SegmentsLayer.prototype.updateSegments = function (startTime, endTime) {
  // Update segments in visible time range.
  var segments = this._peaks.segments.find(startTime, endTime);

  segments.forEach(this._updateSegment.bind(this)); // TODO: in the overview all segments are visible, so no need to check

  this._removeInvisibleSegments(startTime, endTime);
};
/**
 * @private
 * @param {Segment} segment
 */


SegmentsLayer.prototype._updateSegment = function (segment) {
  var segmentShape = this._findOrAddSegmentShape(segment);

  segmentShape.updatePosition();
};
/**
 * @private
 * @param {Segment} segment
 */


SegmentsLayer.prototype._findOrAddSegmentShape = function (segment) {
  var segmentShape = this._segmentShapes[segment.id];

  if (!segmentShape) {
    segmentShape = this._addSegmentShape(segment);
  }

  return segmentShape;
};
/**
 * Removes any segments that are not visible, i.e., are not within and do not
 * overlap the given time range.
 *
 * @private
 * @param {Number} startTime The start of the visible time range, in seconds.
 * @param {Number} endTime The end of the visible time range, in seconds.
 * @returns {Number} The number of segments removed.
 */


SegmentsLayer.prototype._removeInvisibleSegments = function (startTime, endTime) {
  var count = 0;

  for (var segmentId in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentId)) {
      var segment = this._segmentShapes[segmentId].getSegment();

      if (!segment.isVisible(startTime, endTime)) {
        this._removeSegment(segment);

        count++;
      }
    }
  }

  return count;
};
/**
 * Removes the given segment from the view.
 *
 * @param {Segment} segment
 */


SegmentsLayer.prototype._removeSegment = function (segment) {
  var segmentShape = this._segmentShapes[segment.id];

  if (segmentShape) {
    segmentShape.destroy();
    delete this._segmentShapes[segment.id];
  }
};
/**
 * Toggles visibility of the segments layer.
 *
 * @param {Boolean} visible
 */


SegmentsLayer.prototype.setVisible = function (visible) {
  this._layer.setVisible(visible);
};

SegmentsLayer.prototype.destroy = function () {
  this._peaks.off('segments.update', this._onSegmentsUpdate);

  this._peaks.off('segments.add', this._onSegmentsAdd);

  this._peaks.off('segments.remove', this._onSegmentsRemove);

  this._peaks.off('segments.remove_all', this._onSegmentsRemoveAll);

  this._peaks.off('segments.dragged', this._onSegmentsDragged);
};

SegmentsLayer.prototype.fitToView = function () {
  for (var segmentId in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentId)) {
      var segmentShape = this._segmentShapes[segmentId];
      segmentShape.fitToView();
    }
  }
};

SegmentsLayer.prototype.draw = function () {
  this._layer.draw();
};

SegmentsLayer.prototype.getHeight = function () {
  return this._layer.getHeight();
};

/**
 * @file
 *
 * Defines the {@link WaveformAxis} class.
 *
 * @module waveform-axis
 */
/**
 * Creates the waveform axis shapes and adds them to the given view layer.
 *
 * @class
 * @alias WaveformAxis
 *
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Object} options
 * @param {String} options.axisGridlineColor
 * @param {String} options.axisLabelColor
 * @param {String} options.axisLabelFontFamily
 * @param {Number} options.axisLabelFontSize
 * @param {String} options.axisLabelFontStyle
 */

function WaveformAxis(view, options) {
  var self = this;
  self._axisGridlineColor = options.axisGridlineColor;
  self._axisLabelColor = options.axisLabelColor;
  self._axisLabelFont = WaveformAxis._buildFontString(options.axisLabelFontFamily, options.axisLabelFontSize, options.axisLabelFontStyle);
  self._axisShape = new Konva.Shape({
    sceneFunc: function sceneFunc(context) {
      self.drawAxis(context, view);
    }
  });
}

WaveformAxis._buildFontString = function (fontFamily, fontSize, fontStyle) {
  if (!fontSize) {
    fontSize = 11;
  }

  if (!fontFamily) {
    fontFamily = 'sans-serif';
  }

  if (!fontStyle) {
    fontStyle = 'normal';
  }

  return fontStyle + ' ' + fontSize + 'px ' + fontFamily;
};

WaveformAxis.prototype.addToLayer = function (layer) {
  layer.add(this._axisShape);
};
/**
 * Returns number of seconds for each x-axis marker, appropriate for the
 * current zoom level, ensuring that markers are not too close together
 * and that markers are placed at intuitive time intervals (i.e., every 1,
 * 2, 5, 10, 20, 30 seconds, then every 1, 2, 5, 10, 20, 30 minutes, then
 * every 1, 2, 5, 10, 20, 30 hours).
 *
 * @param {WaveformOverview|WaveformZoomView} view
 * @returns {Number}
 */


WaveformAxis.prototype.getAxisLabelScale = function (view) {
  var baseSecs = 1; // seconds

  var steps = [1, 2, 5, 10, 20, 30];
  var minSpacing = 60;
  var index = 0;
  var secs;

  for (;;) {
    secs = baseSecs * steps[index];
    var pixels = view.timeToPixels(secs);

    if (pixels < minSpacing) {
      if (++index === steps.length) {
        baseSecs *= 60; // seconds -> minutes -> hours

        index = 0;
      }
    } else {
      break;
    }
  }

  return secs;
};
/**
 * Draws the time axis and labels onto a view.
 *
 * @param {Konva.Context} context The context to draw on.
 * @param {WaveformOverview|WaveformZoomView} view
 */


WaveformAxis.prototype.drawAxis = function (context, view) {
  var currentFrameStartTime = view.getStartTime(); // Draw axis markers

  var markerHeight = 10; // Time interval between axis markers (seconds)

  var axisLabelIntervalSecs = this.getAxisLabelScale(view); // Time of first axis marker (seconds)

  var firstAxisLabelSecs = roundUpToNearest(currentFrameStartTime, axisLabelIntervalSecs); // Distance between waveform start time and first axis marker (seconds)

  var axisLabelOffsetSecs = firstAxisLabelSecs - currentFrameStartTime; // Distance between waveform start time and first axis marker (pixels)

  var axisLabelOffsetPixels = view.timeToPixels(axisLabelOffsetSecs);
  context.setAttr('strokeStyle', this._axisGridlineColor);
  context.setAttr('lineWidth', 1); // Set text style

  context.setAttr('font', this._axisLabelFont);
  context.setAttr('fillStyle', this._axisLabelColor);
  context.setAttr('textAlign', 'left');
  context.setAttr('textBaseline', 'bottom');
  var secs = firstAxisLabelSecs;
  var x;
  var width = view.getWidth();
  var height = view.getHeight();

  for (;;) {
    // Position of axis marker (pixels)
    x = axisLabelOffsetPixels + view.timeToPixels(secs - firstAxisLabelSecs);

    if (x >= width) {
      break;
    }

    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, 0 + markerHeight);
    context.moveTo(x + 0.5, height);
    context.lineTo(x + 0.5, height - markerHeight);
    context.stroke(); // precision = 0, drops the fractional seconds

    var label = formatTime(secs, 0);
    var labelWidth = context.measureText(label).width;
    var labelX = x - labelWidth / 2;
    var labelY = height - 1 - markerHeight;

    if (labelX >= 0) {
      context.fillText(label, labelX, labelY);
    }

    secs += axisLabelIntervalSecs;
  }
};

/**
 * @file
 *
 * Defines the {@link WaveformOverview} class.
 *
 * @module waveform-overview
 */
/**
 * Creates the overview waveform view.
 *
 * @class
 * @alias WaveformOverview
 *
 * @param {WaveformData} waveformData
 * @param {HTMLElement} container
 * @param {Peaks} peaks
 */

function WaveformOverview(waveformData, container, peaks) {
  var self = this;
  self._originalWaveformData = waveformData;
  self._container = container;
  self._peaks = peaks;
  self._options = peaks.options;
  self._viewOptions = peaks.options.overview; // Bind event handlers

  self._onTimeUpdate = self._onTimeUpdate.bind(this);
  self._onPlaying = self._onPlaying.bind(this);
  self._onPause = self._onPause.bind(this);
  self._onZoomviewDisplaying = self._onZoomviewDisplaying.bind(this);
  self._onWindowResize = self._onWindowResize.bind(this); // Register event handlers

  peaks.on('player.timeupdate', self._onTimeUpdate);
  peaks.on('player.playing', self._onPlaying);
  peaks.on('player.pause', self._onPause);
  peaks.on('zoomview.displaying', self._onZoomviewDisplaying);
  peaks.on('window_resize', self._onWindowResize);
  self._amplitudeScale = 1.0;
  self._timeLabelPrecision = self._viewOptions.timeLabelPrecision;
  self._width = container.clientWidth;
  self._height = container.clientHeight;
  self._data = waveformData;

  if (self._width !== 0) {
    try {
      self._data = waveformData.resample({
        width: self._width
      });
    } catch (error) {// This error usually indicates that the waveform length
      // is less than the container width
    }
  } // Disable warning: The stage has 6 layers.
  // Recommended maximum number of layers is 3-5.


  Konva.showWarnings = false;
  self._resizeTimeoutId = null;
  self._stage = new Konva.Stage({
    container: container,
    width: self._width,
    height: self._height
  });
  self._waveformLayer = new Konva.Layer({
    listening: false
  });
  self._waveformColor = self._viewOptions.waveformColor;
  self._playedWaveformColor = self._viewOptions.playedWaveformColor;

  self._createWaveform();

  self._segmentsLayer = new SegmentsLayer(peaks, self, false);

  self._segmentsLayer.addToStage(self._stage);

  self._pointsLayer = new PointsLayer(peaks, self, false);

  self._pointsLayer.addToStage(self._stage);

  self._highlightLayer = new HighlightLayer(self, self._viewOptions.highlightOffset, self._viewOptions.highlightColor);

  self._highlightLayer.addToStage(self._stage);

  self._createAxisLabels();

  self._playheadLayer = new PlayheadLayer({
    player: self._peaks.player,
    view: self,
    showPlayheadTime: self._viewOptions.showPlayheadTime,
    playheadColor: self._viewOptions.playheadColor,
    playheadTextColor: self._viewOptions.playheadTextColor,
    playheadFontFamily: self._viewOptions.fontFamily,
    playheadFontSize: self._viewOptions.fontSize,
    playheadFontStyle: self._viewOptions.fontStyle
  });

  self._playheadLayer.addToStage(self._stage);

  var time = self._peaks.player.getCurrentTime();

  this._playheadLayer.updatePlayheadTime(time);

  self._mouseDragHandler = new MouseDragHandler(self._stage, {
    onMouseDown: function onMouseDown(mousePosX) {
      mousePosX = clamp(mousePosX, 0, self._width);
      var time = self.pixelsToTime(mousePosX);

      var duration = self._getDuration(); // Prevent the playhead position from jumping by limiting click
      // handling to the waveform duration.


      if (time > duration) {
        time = duration;
      }

      self._playheadLayer.updatePlayheadTime(time);

      peaks.player.seek(time);
    },
    onMouseMove: function onMouseMove(mousePosX) {
      mousePosX = clamp(mousePosX, 0, self._width);
      var time = self.pixelsToTime(mousePosX);

      var duration = self._getDuration();

      if (time > duration) {
        time = duration;
      } // Update the playhead position. This gives a smoother visual update
      // than if we only use the player.timeupdate event.


      self._playheadLayer.updatePlayheadTime(time);

      self._peaks.player.seek(time);
    }
  });
  self._onClick = self._onClick.bind(this);
  self._onDblClick = self._onDblClick.bind(this);

  self._stage.on('click', self._onClick);

  self._stage.on('dblclick', self._onDblClick);
}

WaveformOverview.prototype._onClick = function (event) {
  this._clickHandler(event, 'overview.click');
};

WaveformOverview.prototype._onDblClick = function (event) {
  this._clickHandler(event, 'overview.dblclick');
};

WaveformOverview.prototype._clickHandler = function (event, eventName) {
  var pixelIndex = event.evt.layerX;
  var time = this.pixelsToTime(pixelIndex);

  this._peaks.emit(eventName, time);
};

WaveformOverview.prototype.getName = function () {
  return 'overview';
};

WaveformOverview.prototype._onTimeUpdate = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};

WaveformOverview.prototype._onPlaying = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};

WaveformOverview.prototype._onPause = function (time) {
  this._playheadLayer.stop(time);
};

WaveformOverview.prototype._onZoomviewDisplaying = function (startTime, endTime) {
  this.showHighlight(startTime, endTime);
};

WaveformOverview.prototype.showHighlight = function (startTime, endTime) {
  this._highlightLayer.showHighlight(startTime, endTime);
};

WaveformOverview.prototype._onWindowResize = function () {
  var self = this;

  if (self._resizeTimeoutId) {
    clearTimeout(self._resizeTimeoutId);
    self._resizeTimeoutId = null;
  } // Avoid resampling waveform data to zero width


  if (self._container.clientWidth !== 0) {
    self._width = self._container.clientWidth;

    self._stage.setWidth(self._width);

    self._resizeTimeoutId = setTimeout(function () {
      self._width = self._container.clientWidth;
      self._data = self._originalWaveformData.resample({
        width: self._width
      });

      self._stage.setWidth(self._width);

      self._updateWaveform();
    }, 500);
  }
};

WaveformOverview.prototype.setWaveformData = function (waveformData) {
  this._originalWaveformData = waveformData;

  if (this._width !== 0) {
    this._data = waveformData.resample({
      width: this._width
    });
  } else {
    this._data = waveformData;
  }

  this._updateWaveform();
};

WaveformOverview.prototype.playheadPosChanged = function (time) {
  if (this._playedWaveformShape) {
    this._playedSegment.endTime = time;
    this._unplayedSegment.startTime = time;

    this._waveformLayer.draw();
  }
};
/**
 * Returns the pixel index for a given time, for the current zoom level.
 *
 * @param {Number} time Time, in seconds.
 * @returns {Number} Pixel index.
 */


WaveformOverview.prototype.timeToPixels = function (time) {
  return Math.floor(time * this._data.sample_rate / this._data.scale);
};
/**
 * Returns the time for a given pixel index, for the current zoom level.
 *
 * @param {Number} pixels Pixel index.
 * @returns {Number} Time, in seconds.
 */


WaveformOverview.prototype.pixelsToTime = function (pixels) {
  return pixels * this._data.scale / this._data.sample_rate;
};
/**
 * Returns the time for a given pixel index, for the current zoom level.
 * (This is presented for symmetry with WaveformZoomview. Since WaveformOverview
 * doesn't scroll, its pixelOffsetToTime & pixelsToTime methods are identical.)
 *
 * @param {Number} pixels Pixel index.
 * @returns {Number} Time, in seconds.
 */


WaveformOverview.prototype.pixelOffsetToTime = WaveformOverview.prototype.pixelsToTime;
/**
 * @returns {Number} The start position of the waveform shown in the view,
 *   in pixels.
 */

WaveformOverview.prototype.getFrameOffset = function () {
  return 0;
};
/**
 * @returns {Number} The time at the leftmost edge
 */


WaveformOverview.prototype.getStartTime = function () {
  return 0;
};
/**
 * @returns {Number} The time at the rightmost edge
 */


WaveformOverview.prototype.getEndTime = function () {
  return this._getDuration();
};
/**
 * @returns {Number} The width of the view, in pixels.
 */


WaveformOverview.prototype.getWidth = function () {
  return this._width;
};
/**
 * @returns {Number} The height of the view, in pixels.
 */


WaveformOverview.prototype.getHeight = function () {
  return this._height;
};
/**
 * @returns {Number} The media duration, in seconds.
 */


WaveformOverview.prototype._getDuration = function () {
  return this._peaks.player.getDuration();
};
/**
 * Adjusts the amplitude scale of waveform shown in the view, which allows
 * users to zoom the waveform vertically.
 *
 * @param {Number} scale The new amplitude scale factor
 */


WaveformOverview.prototype.setAmplitudeScale = function (scale) {
  if (!isNumber(scale) || !isFinite(scale)) {
    throw new Error('view.setAmplitudeScale(): Scale must be a valid number');
  }

  this._amplitudeScale = scale;

  this._waveformLayer.draw();

  this._segmentsLayer.draw();
};

WaveformOverview.prototype.getAmplitudeScale = function () {
  return this._amplitudeScale;
};
/**
 * @returns {WaveformData} The view's waveform data.
 */


WaveformOverview.prototype.getWaveformData = function () {
  return this._data;
};

WaveformOverview.prototype._createWaveformShapes = function () {
  if (!this._waveformShape) {
    this._waveformShape = new WaveformShape({
      color: this._waveformColor,
      view: this
    });

    this._waveformShape.addToLayer(this._waveformLayer);
  }

  if (this._playedWaveformColor && !this._playedWaveformShape) {
    var time = this._peaks.player.getCurrentTime();

    this._playedSegment = {
      startTime: 0,
      endTime: time
    };
    this._unplayedSegment = {
      startTime: time,
      endTime: this._getDuration()
    };

    this._waveformShape.setSegment(this._unplayedSegment);

    this._playedWaveformShape = new WaveformShape({
      color: this._playedWaveformColor,
      view: this,
      segment: this._playedSegment
    });

    this._playedWaveformShape.addToLayer(this._waveformLayer);
  }
};

WaveformOverview.prototype._destroyPlayedWaveformShape = function () {
  this._waveformShape.setSegment(null);

  this._playedWaveformShape.destroy();

  this._playedWaveformShape = null;
  this._playedSegment = null;
  this._unplayedSegment = null;
};

WaveformOverview.prototype._createWaveform = function () {
  this._createWaveformShapes();

  this._stage.add(this._waveformLayer);
};

WaveformOverview.prototype._createAxisLabels = function () {
  this._axisLayer = new Konva.Layer({
    listening: false
  });
  this._axis = new WaveformAxis(this, {
    axisGridlineColor: this._viewOptions.axisGridlineColor,
    axisLabelColor: this._viewOptions.axisLabelColor,
    axisLabelFontFamily: this._viewOptions.fontFamily,
    axisLabelFontSize: this._viewOptions.fontSize,
    axisLabelFontStyle: this._viewOptions.fontStyle
  });

  this._axis.addToLayer(this._axisLayer);

  this._stage.add(this._axisLayer);
};

WaveformOverview.prototype.removeHighlightRect = function () {
  this._highlightLayer.removeHighlight();
};

WaveformOverview.prototype._updateWaveform = function () {
  this._waveformLayer.draw();

  this._axisLayer.draw();

  var playheadTime = this._peaks.player.getCurrentTime();

  this._playheadLayer.updatePlayheadTime(playheadTime);

  this._highlightLayer.updateHighlight();

  var frameStartTime = 0;
  var frameEndTime = this.pixelsToTime(this._width);

  this._pointsLayer.updatePoints(frameStartTime, frameEndTime);

  this._segmentsLayer.updateSegments(frameStartTime, frameEndTime);
};

WaveformOverview.prototype.setWaveformColor = function (color) {
  this._waveformColor = color;

  this._waveformShape.setWaveformColor(color);
};

WaveformOverview.prototype.setPlayedWaveformColor = function (color) {
  this._playedWaveformColor = color;

  if (color) {
    if (!this._playedWaveformShape) {
      this._createWaveformShapes();
    }

    this._playedWaveformShape.setWaveformColor(color);
  } else {
    if (this._playedWaveformShape) {
      this._destroyPlayedWaveformShape();
    }
  }
};

WaveformOverview.prototype.showPlayheadTime = function (show) {
  this._playheadLayer.showPlayheadTime(show);
};

WaveformOverview.prototype.setTimeLabelPrecision = function (precision) {
  this._timeLabelPrecision = precision;

  this._playheadLayer.updatePlayheadText();
};

WaveformOverview.prototype.formatTime = function (time) {
  return formatTime(time, this._timeLabelPrecision);
};

WaveformOverview.prototype.enableMarkerEditing = function (enable) {
  this._segmentsLayer.enableEditing(enable);

  this._pointsLayer.enableEditing(enable);
};

WaveformOverview.prototype.fitToContainer = function () {
  if (this._container.clientWidth === 0 && this._container.clientHeight === 0) {
    return;
  }

  var updateWaveform = false;

  if (this._container.clientWidth !== this._width) {
    this._width = this._container.clientWidth;

    this._stage.setWidth(this._width);

    try {
      this._data = this._originalWaveformData.resample({
        width: this._width
      });
      updateWaveform = true;
    } catch (error) {// Ignore, and leave this._data as it was
    }
  }

  this._height = this._container.clientHeight;

  this._stage.setHeight(this._height);

  this._waveformShape.fitToView();

  this._playheadLayer.fitToView();

  this._segmentsLayer.fitToView();

  this._pointsLayer.fitToView();

  this._highlightLayer.fitToView();

  if (updateWaveform) {
    this._updateWaveform();
  }

  this._stage.draw();
};

WaveformOverview.prototype.destroy = function () {
  if (this._resizeTimeoutId) {
    clearTimeout(this._resizeTimeoutId);
    this._resizeTimeoutId = null;
  }

  this._peaks.off('player.playing', this._onPlaying);

  this._peaks.off('player.pause', this._onPause);

  this._peaks.off('player.timeupdate', this._onTimeUpdate);

  this._peaks.off('zoomview.displaying', this._onZoomviewDisplaying);

  this._peaks.off('window_resize', this._onWindowResize);

  this._playheadLayer.destroy();

  this._segmentsLayer.destroy();

  this._pointsLayer.destroy();

  if (this._stage) {
    this._stage.destroy();

    this._stage = null;
  }
};

/**
 * @file
 *
 * Defines the {@link WaveformZoomView} class.
 *
 * @module waveform-zoomview
 */
/**
 * Creates a zoomable waveform view.
 *
 * @class
 * @alias WaveformZoomView
 *
 * @param {WaveformData} waveformData
 * @param {HTMLElement} container
 * @param {Peaks} peaks
 */

function WaveformZoomView(waveformData, container, peaks) {
  var self = this;
  self._originalWaveformData = waveformData;
  self._container = container;
  self._peaks = peaks;
  self._options = peaks.options;
  self._viewOptions = peaks.options.zoomview; // Bind event handlers

  self._onTimeUpdate = self._onTimeUpdate.bind(self);
  self._onPlaying = self._onPlaying.bind(self);
  self._onPause = self._onPause.bind(self);
  self._onWindowResize = self._onWindowResize.bind(self);
  self._onKeyboardLeft = self._onKeyboardLeft.bind(self);
  self._onKeyboardRight = self._onKeyboardRight.bind(self);
  self._onKeyboardShiftLeft = self._onKeyboardShiftLeft.bind(self);
  self._onKeyboardShiftRight = self._onKeyboardShiftRight.bind(self); // Register event handlers

  self._peaks.on('player.timeupdate', self._onTimeUpdate);

  self._peaks.on('player.playing', self._onPlaying);

  self._peaks.on('player.pause', self._onPause);

  self._peaks.on('window_resize', self._onWindowResize);

  self._peaks.on('keyboard.left', self._onKeyboardLeft);

  self._peaks.on('keyboard.right', self._onKeyboardRight);

  self._peaks.on('keyboard.shift_left', self._onKeyboardShiftLeft);

  self._peaks.on('keyboard.shift_right', self._onKeyboardShiftRight);

  self._enableAutoScroll = true;
  self._amplitudeScale = 1.0;
  self._timeLabelPrecision = self._viewOptions.timeLabelPrecision;
  self._data = null;
  self._pixelLength = 0;
  var initialZoomLevel = peaks.zoom.getZoomLevel();
  self._zoomLevelAuto = false;
  self._zoomLevelSeconds = null;
  self._resizeTimeoutId = null;

  self._resampleData({
    scale: initialZoomLevel
  });

  self._width = container.clientWidth;
  self._height = container.clientHeight; // The pixel offset of the current frame being displayed

  self._frameOffset = 0;
  self._stage = new Konva.Stage({
    container: container,
    width: self._width,
    height: self._height
  });
  self._waveformLayer = new Konva.Layer({
    listening: false
  });
  self._waveformColor = self._viewOptions.waveformColor;
  self._playedWaveformColor = self._viewOptions.playedWaveformColor;

  self._createWaveform();

  self._segmentsLayer = new SegmentsLayer(peaks, self, true);

  self._segmentsLayer.addToStage(self._stage);

  self._pointsLayer = new PointsLayer(peaks, self, true);

  self._pointsLayer.addToStage(self._stage);

  self._createAxisLabels();

  self._playheadLayer = new PlayheadLayer({
    player: self._peaks.player,
    view: self,
    showPlayheadTime: self._viewOptions.showPlayheadTime,
    playheadColor: self._viewOptions.playheadColor,
    playheadTextColor: self._viewOptions.playheadTextColor,
    playheadFontFamily: self._viewOptions.fontFamily,
    playheadFontSize: self._viewOptions.fontSize,
    playheadFontStyle: self._viewOptions.fontStyle
  });

  self._playheadLayer.addToStage(self._stage);

  var time = self._peaks.player.getCurrentTime();

  self._syncPlayhead(time);

  self._mouseDragHandler = new MouseDragHandler(self._stage, {
    onMouseDown: function onMouseDown(mousePosX) {
      this.initialFrameOffset = self._frameOffset;
      this.mouseDownX = mousePosX;
    },
    onMouseMove: function onMouseMove(mousePosX) {
      // Moving the mouse to the left increases the time position of the
      // left-hand edge of the visible waveform.
      var diff = this.mouseDownX - mousePosX;
      var newFrameOffset = this.initialFrameOffset + diff;

      if (newFrameOffset !== this.initialFrameOffset) {
        self._updateWaveform(newFrameOffset);
      }
    },
    onMouseUp: function onMouseUp() {
      // Set playhead position only on click release, when not dragging.
      if (!self._mouseDragHandler.isDragging()) {
        var time = self.pixelOffsetToTime(this.mouseDownX);

        var duration = self._getDuration(); // Prevent the playhead position from jumping by limiting click
        // handling to the waveform duration.


        if (time > duration) {
          time = duration;
        }

        self._playheadLayer.updatePlayheadTime(time);

        self._peaks.player.seek(time);
      }
    }
  });
  self._onWheel = self._onWheel.bind(self);
  self.setWheelMode(self._viewOptions.wheelMode);
  self._onClick = self._onClick.bind(this);
  self._onDblClick = self._onDblClick.bind(this);

  self._stage.on('click', self._onClick);

  self._stage.on('dblclick', self._onDblClick);
}

WaveformZoomView.prototype._onClick = function (event) {
  this._clickHandler(event, 'zoomview.click');
};

WaveformZoomView.prototype._onDblClick = function (event) {
  this._clickHandler(event, 'zoomview.dblclick');
};

WaveformZoomView.prototype._clickHandler = function (event, eventName) {
  var mousePosX = event.evt.layerX;
  var time = this.pixelOffsetToTime(mousePosX);

  this._peaks.emit(eventName, time);
};

WaveformZoomView.prototype.setWheelMode = function (mode) {
  if (mode !== this._wheelMode) {
    this._wheelMode = mode;

    switch (mode) {
      case 'scroll':
        this._stage.on('wheel', this._onWheel);

        break;

      case 'none':
        this._stage.off('wheel');

        break;
    }
  }
};

WaveformZoomView.prototype._onWheel = function (event) {
  var wheelEvent = event.evt;
  var delta = wheelEvent.shiftKey ? wheelEvent.deltaY : wheelEvent.deltaX;
  var offAxisDelta = wheelEvent.shiftKey ? wheelEvent.deltaX : wheelEvent.deltaY; // Ignore the event if it looks like the user is scrolling vertically
  // down the page

  if (Math.abs(delta) < Math.abs(offAxisDelta)) {
    return;
  }

  event.evt.preventDefault();
  var newFrameOffset = clamp(this._frameOffset + Math.floor(delta), 0, this._pixelLength - this._width);

  this._updateWaveform(newFrameOffset);
};

WaveformZoomView.prototype.getName = function () {
  return 'zoomview';
};

WaveformZoomView.prototype._onTimeUpdate = function (time) {
  if (this._mouseDragHandler.isDragging()) {
    return;
  }

  this._syncPlayhead(time);
};

WaveformZoomView.prototype._onPlaying = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};

WaveformZoomView.prototype._onPause = function (time) {
  this._playheadLayer.stop(time);
};

WaveformZoomView.prototype._onWindowResize = function () {
  var self = this;
  var width = self._container.clientWidth;

  if (!self._zoomLevelAuto) {
    self._width = width;

    self._stage.width(width);

    self._updateWaveform(self._frameOffset);
  } else {
    if (self._resizeTimeoutId) {
      clearTimeout(self._resizeTimeoutId);
      self._resizeTimeoutId = null;
    } // Avoid resampling waveform data to zero width


    if (width !== 0) {
      self._width = width;

      self._stage.width(width);

      self._resizeTimeoutId = setTimeout(function () {
        self._width = width;
        self._data = self._originalWaveformData.resample(width);

        self._stage.width(width);

        self._updateWaveform(self._frameOffset);
      }, 500);
    }
  }
};

WaveformZoomView.prototype._onKeyboardLeft = function () {
  this._keyboardScroll(-1, false);
};

WaveformZoomView.prototype._onKeyboardRight = function () {
  this._keyboardScroll(1, false);
};

WaveformZoomView.prototype._onKeyboardShiftLeft = function () {
  this._keyboardScroll(-1, true);
};

WaveformZoomView.prototype._onKeyboardShiftRight = function () {
  this._keyboardScroll(1, true);
};

WaveformZoomView.prototype._keyboardScroll = function (direction, large) {
  var increment;

  if (large) {
    increment = direction * this._width;
  } else {
    increment = direction * this.timeToPixels(this._options.nudgeIncrement);
  }

  this.scrollWaveform({
    pixels: increment
  });
};

WaveformZoomView.prototype.setWaveformData = function (waveformData) {
  this._originalWaveformData = waveformData; // Don't update the UI here, call setZoom().
};

WaveformZoomView.prototype.playheadPosChanged = function (time) {
  if (this._playedWaveformShape) {
    this._playedSegment.endTime = time;
    this._unplayedSegment.startTime = time;

    this._drawWaveformLayer();
  }
};

WaveformZoomView.prototype._syncPlayhead = function (time) {
  this._playheadLayer.updatePlayheadTime(time);

  if (this._enableAutoScroll) {
    // Check for the playhead reaching the right-hand side of the window.
    var pixelIndex = this.timeToPixels(time); // TODO: move this code to animation function?
    // TODO: don't scroll if user has positioned view manually (e.g., using
    // the keyboard)

    var endThreshold = this._frameOffset + this._width - 100;

    if (pixelIndex >= endThreshold || pixelIndex < this._frameOffset) {
      // Put the playhead at 100 pixels from the left edge
      this._frameOffset = pixelIndex - 100;

      if (this._frameOffset < 0) {
        this._frameOffset = 0;
      }

      this._updateWaveform(this._frameOffset);
    }
  }
};
/**
 * Changes the zoom level.
 *
 * @param {Number} scale The new zoom level, in samples per pixel.
 */


WaveformZoomView.prototype._getScale = function (duration) {
  return duration * this._data.sample_rate / this._width;
};

function isAutoScale(options) {
  return objectHasProperty(options, 'scale') && options.scale === 'auto' || objectHasProperty(options, 'seconds') && options.seconds === 'auto';
}

WaveformZoomView.prototype.setZoom = function (options) {
  var scale;

  if (isAutoScale(options)) {
    var seconds = this._peaks.player.getDuration();

    if (!isValidTime(seconds)) {
      return false;
    }

    this._zoomLevelAuto = true;
    this._zoomLevelSeconds = null;
    scale = this._getScale(seconds);
  } else {
    if (objectHasProperty(options, 'scale')) {
      this._zoomLevelSeconds = null;
      scale = options.scale;
    } else if (objectHasProperty(options, 'seconds')) {
      if (!isValidTime(options.seconds)) {
        return false;
      }

      this._zoomLevelSeconds = options.seconds;
      scale = this._getScale(options.seconds);
    }

    this._zoomLevelAuto = false;
  }

  if (scale < this._originalWaveformData.scale) {
    // eslint-disable-next-line max-len
    this._peaks.logger('peaks.zoomview.setZoom(): zoom level must be at least ' + this._originalWaveformData.scale);

    scale = this._originalWaveformData.scale;
  }

  var currentTime = this._peaks.player.getCurrentTime();

  var apexTime;

  var playheadOffsetPixels = this._playheadLayer.getPlayheadOffset();

  if (playheadOffsetPixels >= 0 && playheadOffsetPixels < this._width) {
    // Playhead is visible. Change the zoom level while keeping the
    // playhead at the same position in the window.
    apexTime = currentTime;
  } else {
    // Playhead is not visible. Change the zoom level while keeping the
    // centre of the window at the same position in the waveform.
    playheadOffsetPixels = Math.floor(this._width / 2);
    apexTime = this.pixelOffsetToTime(playheadOffsetPixels);
  }

  var prevScale = this._scale;

  this._resampleData({
    scale: scale
  });

  var apexPixel = this.timeToPixels(apexTime);
  this._frameOffset = apexPixel - playheadOffsetPixels;

  this._updateWaveform(this._frameOffset);

  this._playheadLayer.zoomLevelChanged(); // Update the playhead position after zooming.


  this._playheadLayer.updatePlayheadTime(currentTime); // var adapter = this.createZoomAdapter(currentScale, previousScale);
  // adapter.start(relativePosition);


  this._peaks.emit('zoom.update', scale, prevScale);

  return true;
};

WaveformZoomView.prototype._resampleData = function (options) {
  this._data = this._originalWaveformData.resample(options);
  this._scale = this._data.scale;
  this._pixelLength = this._data.length;
};

WaveformZoomView.prototype.getStartTime = function () {
  return this.pixelOffsetToTime(0);
};

WaveformZoomView.prototype.getEndTime = function () {
  return this.pixelOffsetToTime(this._width);
};

WaveformZoomView.prototype.setStartTime = function (time) {
  if (time < 0) {
    time = 0;
  }

  if (this._zoomLevelAuto) {
    time = 0;
  }

  this._updateWaveform(this.timeToPixels(time));
};
/**
 * Returns the pixel index for a given time, for the current zoom level.
 *
 * @param {Number} time Time, in seconds.
 * @returns {Number} Pixel index.
 */


WaveformZoomView.prototype.timeToPixels = function (time) {
  return Math.floor(time * this._data.sample_rate / this._data.scale);
};
/**
 * Returns the time for a given pixel index, for the current zoom level.
 *
 * @param {Number} pixels Pixel index.
 * @returns {Number} Time, in seconds.
 */


WaveformZoomView.prototype.pixelsToTime = function (pixels) {
  return pixels * this._data.scale / this._data.sample_rate;
};
/**
 * Returns the time for a given pixel offset (relative to the
 * current scroll position), for the current zoom level.
 *
 * @param {Number} offset Offset from left-visible-edge of view
 * @returns {Number} Time, in seconds.
 */


WaveformZoomView.prototype.pixelOffsetToTime = function (offset) {
  var pixels = this._frameOffset + offset;
  return pixels * this._data.scale / this._data.sample_rate;
};
/* var zoomAdapterMap = {
  'animated': AnimatedZoomAdapter,
  'static': StaticZoomAdapter
};

WaveformZoomView.prototype.createZoomAdapter = function(currentScale, previousScale) {
  var ZoomAdapter = zoomAdapterMap[this._viewOptions.zoomAdapter];

  if (!ZoomAdapter) {
    throw new Error('Invalid zoomAdapter: ' + this._viewOptions.zoomAdapter);
  }

  return ZoomAdapter.create(this, currentScale, previousScale);
}; */

/**
 * @returns {Number} The start position of the waveform shown in the view,
 *   in pixels.
 */


WaveformZoomView.prototype.getFrameOffset = function () {
  return this._frameOffset;
};
/**
 * @returns {Number} The width of the view, in pixels.
 */


WaveformZoomView.prototype.getWidth = function () {
  return this._width;
};
/**
 * @returns {Number} The height of the view, in pixels.
 */


WaveformZoomView.prototype.getHeight = function () {
  return this._height;
};
/**
 * @returns {Number} The media duration, in seconds.
 */


WaveformZoomView.prototype._getDuration = function () {
  return this._peaks.player.getDuration();
};
/**
 * Adjusts the amplitude scale of waveform shown in the view, which allows
 * users to zoom the waveform vertically.
 *
 * @param {Number} scale The new amplitude scale factor
 */


WaveformZoomView.prototype.setAmplitudeScale = function (scale) {
  if (!isNumber(scale) || !isFinite(scale)) {
    throw new Error('view.setAmplitudeScale(): Scale must be a valid number');
  }

  this._amplitudeScale = scale;

  this._drawWaveformLayer();

  this._segmentsLayer.draw();
};

WaveformZoomView.prototype.getAmplitudeScale = function () {
  return this._amplitudeScale;
};
/**
 * @returns {WaveformData} The view's waveform data.
 */


WaveformZoomView.prototype.getWaveformData = function () {
  return this._data;
};

WaveformZoomView.prototype._createWaveformShapes = function () {
  if (!this._waveformShape) {
    this._waveformShape = new WaveformShape({
      color: this._waveformColor,
      view: this
    });

    this._waveformShape.addToLayer(this._waveformLayer);
  }

  if (this._playedWaveformColor && !this._playedWaveformShape) {
    var time = this._peaks.player.getCurrentTime();

    this._playedSegment = {
      startTime: 0,
      endTime: time
    };
    this._unplayedSegment = {
      startTime: time,
      endTime: this._getDuration()
    };

    this._waveformShape.setSegment(this._unplayedSegment);

    this._playedWaveformShape = new WaveformShape({
      color: this._playedWaveformColor,
      view: this,
      segment: this._playedSegment
    });

    this._playedWaveformShape.addToLayer(this._waveformLayer);
  }
};

WaveformZoomView.prototype._destroyPlayedWaveformShape = function () {
  this._waveformShape.setSegment(null);

  this._playedWaveformShape.destroy();

  this._playedWaveformShape = null;
  this._playedSegment = null;
  this._unplayedSegment = null;
};

WaveformZoomView.prototype._createWaveform = function () {
  this._createWaveformShapes();

  this._stage.add(this._waveformLayer);

  this._peaks.emit('zoomview.displaying', 0, this.getEndTime());
};

WaveformZoomView.prototype._createAxisLabels = function () {
  this._axisLayer = new Konva.Layer({
    listening: false
  });
  this._axis = new WaveformAxis(this, {
    axisGridlineColor: this._viewOptions.axisGridlineColor,
    axisLabelColor: this._viewOptions.axisLabelColor,
    axisLabelFontFamily: this._viewOptions.fontFamily,
    axisLabelFontSize: this._viewOptions.fontSize,
    axisLabelFontStyle: this._viewOptions.fontStyle
  });

  this._axis.addToLayer(this._axisLayer);

  this._stage.add(this._axisLayer);
};
/**
 * Scrolls the region of waveform shown in the view.
 *
 * @param {Number} scrollAmount How far to scroll, in pixels
 */


WaveformZoomView.prototype.scrollWaveform = function (options) {
  var scrollAmount;

  if (objectHasProperty(options, 'pixels')) {
    scrollAmount = Math.floor(options.pixels);
  } else if (objectHasProperty(options, 'seconds')) {
    scrollAmount = this.timeToPixels(options.seconds);
  } else {
    throw new TypeError('view.scrollWaveform(): Missing umber of pixels or seconds');
  }

  this._updateWaveform(this._frameOffset + scrollAmount);
};
/**
 * Updates the region of waveform shown in the view.
 *
 * @param {Number} frameOffset The new frame offset, in pixels.
 */


WaveformZoomView.prototype._updateWaveform = function (frameOffset) {
  var upperLimit;

  if (this._pixelLength < this._width) {
    // Total waveform is shorter than viewport, so reset the offset to 0.
    frameOffset = 0;
    upperLimit = this._width;
  } else {
    // Calculate the very last possible position.
    upperLimit = this._pixelLength - this._width;
  }

  frameOffset = clamp(frameOffset, 0, upperLimit);
  this._frameOffset = frameOffset; // Display playhead if it is within the zoom frame width.

  var playheadPixel = this._playheadLayer.getPlayheadPixel();

  this._playheadLayer.updatePlayheadTime(this.pixelsToTime(playheadPixel));

  this._drawWaveformLayer();

  this._axisLayer.draw();

  var frameStartTime = this.getStartTime();
  var frameEndTime = this.getEndTime();

  this._pointsLayer.updatePoints(frameStartTime, frameEndTime);

  this._segmentsLayer.updateSegments(frameStartTime, frameEndTime);

  this._peaks.emit('zoomview.displaying', frameStartTime, frameEndTime);
};

WaveformZoomView.prototype._drawWaveformLayer = function () {
  this._waveformLayer.draw();
};

WaveformZoomView.prototype.setWaveformColor = function (color) {
  this._waveformColor = color;

  this._waveformShape.setWaveformColor(color);
};

WaveformZoomView.prototype.setPlayedWaveformColor = function (color) {
  this._playedWaveformColor = color;

  if (color) {
    if (!this._playedWaveformShape) {
      this._createWaveformShapes();
    }

    this._playedWaveformShape.setWaveformColor(color);
  } else {
    if (this._playedWaveformShape) {
      this._destroyPlayedWaveformShape();
    }
  }
};

WaveformZoomView.prototype.showPlayheadTime = function (show) {
  this._playheadLayer.showPlayheadTime(show);
};

WaveformZoomView.prototype.setTimeLabelPrecision = function (precision) {
  this._timeLabelPrecision = precision;

  this._playheadLayer.updatePlayheadText();
};

WaveformZoomView.prototype.formatTime = function (time) {
  return formatTime(time, this._timeLabelPrecision);
};

WaveformZoomView.prototype.enableAutoScroll = function (enable) {
  this._enableAutoScroll = enable;
};

WaveformZoomView.prototype.enableMarkerEditing = function (enable) {
  this._segmentsLayer.enableEditing(enable);

  this._pointsLayer.enableEditing(enable);
};

WaveformZoomView.prototype.fitToContainer = function () {
  if (this._container.clientWidth === 0 && this._container.clientHeight === 0) {
    return;
  }

  var updateWaveform = false;

  if (this._container.clientWidth !== this._width) {
    this._width = this._container.clientWidth;

    this._stage.width(this._width);

    var resample = false;
    var resampleOptions;

    if (this._zoomLevelAuto) {
      resample = true;
      resampleOptions = {
        width: this._width
      };
    } else if (this._zoomLevelSeconds !== null) {
      resample = true;
      resampleOptions = {
        scale: this._getScale(this._zoomLevelSeconds)
      };
    }

    if (resample) {
      try {
        this._resampleData(resampleOptions);

        updateWaveform = true;
      } catch (error) {// Ignore, and leave this._data as it was
      }
    }
  }

  this._height = this._container.clientHeight;

  this._stage.height(this._height);

  this._waveformShape.fitToView();

  this._playheadLayer.fitToView();

  this._segmentsLayer.fitToView();

  this._pointsLayer.fitToView();

  if (updateWaveform) {
    this._updateWaveform(this._frameOffset);
  }

  this._stage.draw();
};
/* WaveformZoomView.prototype.beginZoom = function() {
  // Fade out the time axis and the segments
  // this._axis.axisShape.setAttr('opacity', 0);

  if (this._pointsLayer) {
    this._pointsLayer.setVisible(false);
  }

  if (this._segmentsLayer) {
    this._segmentsLayer.setVisible(false);
  }
};

WaveformZoomView.prototype.endZoom = function() {
  if (this._pointsLayer) {
    this._pointsLayer.setVisible(true);
  }

  if (this._segmentsLayer) {
    this._segmentsLayer.setVisible(true);
  }

  var time = this._peaks.player.getCurrentTime();

  this.seekFrame(this.timeToPixels(time));
}; */


WaveformZoomView.prototype.destroy = function () {
  if (this._resizeTimeoutId) {
    clearTimeout(this._resizeTimeoutId);
    this._resizeTimeoutId = null;
  } // Unregister event handlers


  this._peaks.off('player.timeupdate', this._onTimeUpdate);

  this._peaks.off('player.playing', this._onPlaying);

  this._peaks.off('player.pause', this._onPause);

  this._peaks.off('window_resize', this._onWindowResize);

  this._peaks.off('keyboard.left', this._onKeyboardLeft);

  this._peaks.off('keyboard.right', this._onKeyboardRight);

  this._peaks.off('keyboard.shift_left', this._onKeyboardShiftLeft);

  this._peaks.off('keyboard.shift_right', this._onKeyboardShiftRight);

  this._playheadLayer.destroy();

  this._segmentsLayer.destroy();

  this._pointsLayer.destroy();

  if (this._stage) {
    this._stage.destroy();

    this._stage = null;
  }
};

/**
 * @file
 *
 * Defines the {@link ViewController} class.
 *
 * @module view-controller
 */
/**
 * Creates an object that allows users to create and manage waveform views.
 *
 * @class
 * @alias ViewController
 *
 * @param {Peaks} peaks
 */

function ViewController(peaks) {
  this._peaks = peaks;
  this._overview = null;
  this._zoomview = null;
}

ViewController.prototype.createOverview = function (container) {
  if (this._overview) {
    return this._overview;
  }

  var waveformData = this._peaks.getWaveformData();

  this._overview = new WaveformOverview(waveformData, container, this._peaks);

  if (this._zoomview) {
    this._overview.showHighlight(this._zoomview.getStartTime(), this._zoomview.getEndTime());
  }

  return this._overview;
};

ViewController.prototype.createZoomview = function (container) {
  if (this._zoomview) {
    return this._zoomview;
  }

  var waveformData = this._peaks.getWaveformData();

  this._zoomview = new WaveformZoomView(waveformData, container, this._peaks);
  return this._zoomview;
};

ViewController.prototype.destroyOverview = function () {
  if (!this._overview) {
    return;
  }

  if (!this._zoomview) {
    return;
  }

  this._overview.destroy();

  this._overview = null;
};

ViewController.prototype.destroyZoomview = function () {
  if (!this._zoomview) {
    return;
  }

  if (!this._overview) {
    return;
  }

  this._zoomview.destroy();

  this._zoomview = null;

  this._overview.removeHighlightRect();
};

ViewController.prototype.destroy = function () {
  if (this._overview) {
    this._overview.destroy();

    this._overview = null;
  }

  if (this._zoomview) {
    this._zoomview.destroy();

    this._zoomview = null;
  }
};

ViewController.prototype.getView = function (name) {
  if (isNullOrUndefined(name)) {
    if (this._overview && this._zoomview) {
      return null;
    } else if (this._overview) {
      return this._overview;
    } else if (this._zoomview) {
      return this._zoomview;
    } else {
      return null;
    }
  } else {
    switch (name) {
      case 'overview':
        return this._overview;

      case 'zoomview':
        return this._zoomview;

      default:
        return null;
    }
  }
};

/**
 * @file
 *
 * Defines the {@link ZoomController} class.
 *
 * @module zoom-controller
 */

/**
 * Creates an object to control zoom levels in a {@link WaveformZoomView}.
 *
 * @class
 * @alias ZoomController
 *
 * @param {Peaks} peaks
 * @param {Array<Integer>} zoomLevels
 */
function ZoomController(peaks, zoomLevels) {
  this._peaks = peaks;
  this._zoomLevels = zoomLevels;
  this._zoomLevelIndex = 0;
}

ZoomController.prototype.setZoomLevels = function (zoomLevels) {
  this._zoomLevels = zoomLevels;
  this.setZoom(0, true);
};
/**
 * Zoom in one level.
 */


ZoomController.prototype.zoomIn = function () {
  this.setZoom(this._zoomLevelIndex - 1);
};
/**
 * Zoom out one level.
 */


ZoomController.prototype.zoomOut = function () {
  this.setZoom(this._zoomLevelIndex + 1);
};
/**
 * Given a particular zoom level, triggers a resampling of the data in the
 * zoomed view.
 *
 * @param {number} zoomLevelIndex An index into the options.zoomLevels array.
 */


ZoomController.prototype.setZoom = function (zoomLevelIndex, forceUpdate) {
  if (zoomLevelIndex >= this._zoomLevels.length) {
    zoomLevelIndex = this._zoomLevels.length - 1;
  }

  if (zoomLevelIndex < 0) {
    zoomLevelIndex = 0;
  }

  if (!forceUpdate && zoomLevelIndex === this._zoomLevelIndex) {
    // Nothing to do.
    return;
  }

  this._zoomLevelIndex = zoomLevelIndex;

  var zoomview = this._peaks.views.getView('zoomview');

  if (!zoomview) {
    return;
  }

  zoomview.setZoom({
    scale: this._zoomLevels[zoomLevelIndex]
  });
};
/**
 * Returns the current zoom level index.
 *
 * @returns {Number}
 */


ZoomController.prototype.getZoom = function () {
  return this._zoomLevelIndex;
};
/**
 * Returns the current zoom level, in samples per pixel.
 *
 * @returns {Number}
 */


ZoomController.prototype.getZoomLevel = function () {
  return this._zoomLevels[this._zoomLevelIndex];
};

/**
 * @file
 *
 * Defines the {@link WaveformBuilder} class.
 *
 * @module waveform-builder
 */
var isXhr2 = ('withCredentials' in new XMLHttpRequest());
/**
 * Creates and returns a WaveformData object, either by requesting the
 * waveform data from the server, or by creating the waveform data using the
 * Web Audio API.
 *
 * @class
 * @alias WaveformBuilder
 *
 * @param {Peaks} peaks
 */

function WaveformBuilder(peaks) {
  this._peaks = peaks;
}
/**
 * Options for requesting remote waveform data.
 *
 * @typedef {Object} RemoteWaveformDataOptions
 * @global
 * @property {String=} arraybuffer
 * @property {String=} json
 */

/**
 * Options for supplying local waveform data.
 *
 * @typedef {Object} LocalWaveformDataOptions
 * @global
 * @property {ArrayBuffer=} arraybuffer
 * @property {Object=} json
 */

/**
 * Options for the Web Audio waveform builder.
 *
 * @typedef {Object} WaveformBuilderWebAudioOptions
 * @global
 * @property {AudioContext} audioContext
 * @property {AudioBuffer=} audioBuffer
 * @property {Number=} scale
 * @property {Boolean=} multiChannel
 */

/**
 * Options for [WaveformBuilder.init]{@link WaveformBuilder#init}.
 *
 * @typedef {Object} WaveformBuilderInitOptions
 * @global
 * @property {RemoteWaveformDataOptions=} dataUri
 * @property {LocalWaveformDataOptions=} waveformData
 * @property {WaveformBuilderWebAudioOptions=} webAudio
 * @property {Boolean=} withCredentials
 * @property {Array<Number>=} zoomLevels
 */

/**
 * Callback for receiving the waveform data.
 *
 * @callback WaveformBuilderInitCallback
 * @global
 * @param {Error} error
 * @param {WaveformData} waveformData
 */

/**
 * Loads or creates the waveform data.
 *
 * @private
 * @param {WaveformBuilderInitOptions} options
 * @param {WaveformBuilderInitCallback} callback
 */


WaveformBuilder.prototype.init = function (options, callback) {
  if (options.dataUri && (options.webAudio || options.audioContext) || options.waveformData && (options.webAudio || options.audioContext) || options.dataUri && options.waveformData) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): You may only pass one source (webAudio, dataUri, or waveformData) to render waveform data.'));
    return;
  }

  if (options.audioContext) {
    // eslint-disable-next-line max-len
    this._peaks.logger('Peaks.init(): The audioContext option is deprecated, please pass a webAudio object instead');

    options.webAudio = {
      audioContext: options.audioContext
    };
  }

  if (options.dataUri) {
    return this._getRemoteWaveformData(options, callback);
  } else if (options.waveformData) {
    return this._buildWaveformFromLocalData(options, callback);
  } else if (options.webAudio) {
    if (options.webAudio.audioBuffer) {
      return this._buildWaveformDataFromAudioBuffer(options, callback);
    } else {
      return this._buildWaveformDataUsingWebAudio(options, callback);
    }
  } else {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): You must pass an audioContext, or dataUri, or waveformData to render waveform data'));
  }
};
/* eslint-disable max-len */

/**
 * Fetches waveform data, based on the given options.
 *
 * @private
 * @param {Object} options
 * @param {String|Object} options.dataUri
 * @param {String} options.dataUri.arraybuffer Waveform data URL
 *   (binary format)
 * @param {String} options.dataUri.json Waveform data URL (JSON format)
 * @param {String} options.defaultUriFormat Either 'arraybuffer' (for binary
 *   data) or 'json'
 * @param {WaveformBuilderInitCallback} callback
 *
 * @see Refer to the <a href="https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md">data format documentation</a>
 *   for details of the binary and JSON waveform data formats.
 */

/* eslint-enable max-len */


WaveformBuilder.prototype._getRemoteWaveformData = function (options, callback) {
  var self = this;
  var dataUri = null;
  var requestType = null;
  var url;

  if (isObject(options.dataUri)) {
    dataUri = options.dataUri;
  } else if (isString(options.dataUri)) {
    // Backward compatibility
    dataUri = {};
    dataUri[options.dataUriDefaultFormat || 'json'] = options.dataUri;
  } else {
    callback(new TypeError('Peaks.init(): The dataUri option must be an object'));
    return;
  }

  ['ArrayBuffer', 'JSON'].some(function (connector) {
    if (window[connector]) {
      requestType = connector.toLowerCase();
      url = dataUri[requestType];
      return Boolean(url);
    }
  });

  if (!url) {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): Unable to determine a compatible dataUri format for this browser'));
    return;
  }

  var xhr = self._createXHR(url, requestType, options.withCredentials, function (event) {
    if (this.readyState !== 4) {
      return;
    }

    if (this.status !== 200) {
      callback(new Error('Unable to fetch remote data. HTTP status ' + this.status));
      return;
    }

    var waveformData = WaveformData.create(event.target.response);

    if (waveformData.channels !== 1 && waveformData.channels !== 2) {
      callback(new Error('Peaks.init(): Only mono or stereo waveforms are currently supported'));
      return;
    } else if (waveformData.bits !== 8) {
      callback(new Error('Peaks.init(): 16-bit waveform data is not supported'));
      return;
    }

    callback(null, waveformData);
  }, function () {
    callback(new Error('XHR Failed'));
  });

  xhr.send();
};
/* eslint-disable max-len */

/**
 * Creates a waveform from given data, based on the given options.
 *
 * @private
 * @param {Object} options
 * @param {Object} options.waveformData
 * @param {ArrayBuffer} options.waveformData.arraybuffer Waveform data (binary format)
 * @param {Object} options.waveformData.json Waveform data (JSON format)
 * @param {WaveformBuilderInitCallback} callback
 *
 * @see Refer to the <a href="https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md">data format documentation</a>
 *   for details of the binary and JSON waveform data formats.
 */

/* eslint-enable max-len */


WaveformBuilder.prototype._buildWaveformFromLocalData = function (options, callback) {
  var waveformData = null;
  var data = null;

  if (isObject(options.waveformData)) {
    waveformData = options.waveformData;
  } else {
    callback(new Error('Peaks.init(): The waveformData option must be an object'));
    return;
  }

  if (isObject(waveformData.json)) {
    data = waveformData.json;
  } else if (isArrayBuffer(waveformData.arraybuffer)) {
    data = waveformData.arraybuffer;
  }

  if (!data) {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): Unable to determine a compatible waveformData format'));
    return;
  }

  try {
    var createdWaveformData = WaveformData.create(data);

    if (createdWaveformData.channels !== 1 && createdWaveformData.channels !== 2) {
      callback(new Error('Peaks.init(): Only mono or stereo waveforms are currently supported'));
      return;
    } else if (createdWaveformData.bits !== 8) {
      callback(new Error('Peaks.init(): 16-bit waveform data is not supported'));
      return;
    }

    callback(null, createdWaveformData);
  } catch (err) {
    callback(err);
  }
};
/**
 * Creates waveform data using the Web Audio API.
 *
 * @private
 * @param {Object} options
 * @param {AudioContext} options.audioContext
 * @param {HTMLMediaElement} options.mediaElement
 * @param {WaveformBuilderInitCallback} callback
 */


WaveformBuilder.prototype._buildWaveformDataUsingWebAudio = function (options, callback) {
  var self = this;
  var audioContext = window.AudioContext || window.webkitAudioContext;

  if (!(options.webAudio.audioContext instanceof audioContext)) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): The webAudio.audioContext option must be a valid AudioContext'));
    return;
  }

  var webAudioOptions = options.webAudio;

  if (webAudioOptions.scale !== options.zoomLevels[0]) {
    webAudioOptions.scale = options.zoomLevels[0];
  } // If the media element has already selected which source to play, its
  // currentSrc attribute will contain the source media URL. Otherwise,
  // we wait for a canplay event to tell us when the media is ready.


  var mediaSourceUrl = self._peaks.options.mediaElement.currentSrc;

  if (mediaSourceUrl) {
    self._requestAudioAndBuildWaveformData(mediaSourceUrl, webAudioOptions, options.withCredentials, callback);
  } else {
    self._peaks.once('player.canplay', function () {
      self._requestAudioAndBuildWaveformData(self._peaks.options.mediaElement.currentSrc, webAudioOptions, options.withCredentials, callback);
    });
  }
};

WaveformBuilder.prototype._buildWaveformDataFromAudioBuffer = function (options, callback) {
  var webAudioOptions = options.webAudio;

  if (webAudioOptions.scale !== options.zoomLevels[0]) {
    webAudioOptions.scale = options.zoomLevels[0];
  }

  var webAudioBuilderOptions = {
    audio_buffer: webAudioOptions.audioBuffer,
    split_channels: webAudioOptions.multiChannel,
    scale: webAudioOptions.scale
  };
  WaveformData.createFromAudio(webAudioBuilderOptions, callback);
};
/**
 * Fetches the audio content, based on the given options, and creates waveform
 * data using the Web Audio API.
 *
 * @private
 * @param {url} The media source URL
 * @param {WaveformBuilderWebAudioOptions} webAudio
 * @param {Boolean} withCredentials
 * @param {WaveformBuilderInitCallback} callback
 */


WaveformBuilder.prototype._requestAudioAndBuildWaveformData = function (url, webAudio, withCredentials, callback) {
  var self = this;

  if (!url) {
    self._peaks.logger('Peaks.init(): The mediaElement src is invalid');

    return;
  }

  var xhr = self._createXHR(url, 'arraybuffer', withCredentials, function (event) {
    if (this.readyState !== 4) {
      return;
    }

    if (this.status !== 200) {
      callback(new Error('Unable to fetch remote data. HTTP status ' + this.status));
      return;
    }

    var webAudioBuilderOptions = {
      audio_context: webAudio.audioContext,
      array_buffer: event.target.response,
      split_channels: webAudio.multiChannel,
      scale: webAudio.scale
    };
    WaveformData.createFromAudio(webAudioBuilderOptions, callback);
  }, function () {
    callback(new Error('XHR Failed'));
  });

  xhr.send();
};
/**
 * @private
 * @param {String} url
 * @param {String} requestType
 * @param {Boolean} withCredentials
 * @param {Function} onLoad
 * @param {Function} onError
 *
 * @returns {XMLHttpRequest}
 */


WaveformBuilder.prototype._createXHR = function (url, requestType, withCredentials, onLoad, onError) {
  var xhr = new XMLHttpRequest(); // open an XHR request to the data source file

  xhr.open('GET', url, true);

  if (isXhr2) {
    try {
      xhr.responseType = requestType;
    } catch (e) {// Some browsers like Safari 6 do handle XHR2 but not the json
      // response type, doing only a try/catch fails in IE9
    }
  }

  xhr.onload = onLoad;
  xhr.onerror = onError;

  if (isXhr2 && withCredentials) {
    xhr.withCredentials = true;
  }

  return xhr;
};

/**
 * @file
 *
 * Defines the {@link Peaks} class.
 *
 * @module main
 */
/**
 * Initialises a new Peaks instance with default option settings.
 *
 * @class
 * @alias Peaks
 *
 * @param {Object} opts Configuration options
 */

function Peaks() {
  EventEmitter.call(this); // Set default options

  this.options = {
    zoomLevels: [512, 1024, 2048, 4096],
    mediaElement: null,
    mediaUrl: null,
    dataUri: null,
    dataUriDefaultFormat: 'json',
    withCredentials: false,
    waveformData: null,
    webAudio: null,
    nudgeIncrement: 1.0,
    segmentStartMarkerColor: '#aaaaaa',
    segmentEndMarkerColor: '#aaaaaa',
    randomizeSegmentColor: true,
    segmentColor: '#ff851b',
    pointMarkerColor: '#39cccc',
    createSegmentMarker: createSegmentMarker,
    createSegmentLabel: createSegmentLabel,
    createPointMarker: createPointMarker,
    // eslint-disable-next-line no-console
    logger: console.error.bind(console)
  };
  return this;
}

Peaks.prototype = Object.create(EventEmitter.prototype);
var defaultViewOptions = {
  playheadColor: '#111111',
  playheadTextColor: '#aaaaaa',
  axisGridlineColor: '#cccccc',
  axisLabelColor: '#aaaaaa',
  fontFamily: 'sans-serif',
  fontSize: 11,
  fontStyle: 'normal',
  timeLabelPrecision: 2
};
var defaultZoomviewOptions = {
  // showPlayheadTime:    true,
  waveformColor: 'rgba(0, 225, 128, 1)',
  wheelMode: 'none' // zoomAdapter:         'static'

};
var defaultOverviewOptions = {
  // showPlayheadTime:    false,
  waveformColor: 'rgba(0, 0, 0, 0.2)',
  highlightColor: '#aaaaaa',
  highlightOffset: 11
};

function getOverviewOptions(opts) {
  var overviewOptions = {};

  if (opts.containers && opts.containers.overview) {
    overviewOptions.container = opts.containers.overview;
  }

  if (opts.overviewWaveformColor) {
    overviewOptions.waveformColor = opts.overviewWaveformColor;
  }

  if (opts.overviewHighlightOffset) {
    overviewOptions.highlightOffset = opts.overviewHighlightOffset;
  }

  if (opts.overviewHighlightColor) {
    overviewOptions.highlightColor = opts.overviewHighlightColor;
  }

  if (opts.overview && opts.overview.showPlayheadTime) {
    overviewOptions.showPlayheadTime = opts.overview.showPlayheadTime;
  }

  var optNames = ['container', 'waveformColor', 'playedWaveformColor', 'playheadColor', 'playheadTextColor', 'timeLabelPrecision', 'axisGridlineColor', 'axisLabelColor', 'fontFamily', 'fontSize', 'fontStyle', 'highlightColor', 'highlightOffset'];
  optNames.forEach(function (optName) {
    if (opts.overview && objectHasProperty(opts.overview, optName)) {
      overviewOptions[optName] = opts.overview[optName];
    } else if (objectHasProperty(opts, optName)) {
      overviewOptions[optName] = opts[optName];
    } else if (objectHasProperty(defaultOverviewOptions, optName)) {
      overviewOptions[optName] = defaultOverviewOptions[optName];
    } else if (objectHasProperty(defaultViewOptions, optName)) {
      overviewOptions[optName] = defaultViewOptions[optName];
    }
  });
  return overviewOptions;
}

function getZoomviewOptions(opts) {
  var zoomviewOptions = {};

  if (opts.containers && opts.containers.zoomview) {
    zoomviewOptions.container = opts.containers.zoomview;
  }

  if (opts.zoomWaveformColor) {
    zoomviewOptions.waveformColor = opts.zoomWaveformColor;
  }

  if (opts.showPlayheadTime) {
    zoomviewOptions.showPlayheadTime = opts.showPlayheadTime;
  } else if (opts.zoomview && opts.zoomview.showPlayheadTime) {
    zoomviewOptions.showPlayheadTime = opts.zoomview.showPlayheadTime;
  }

  var optNames = ['container', 'waveformColor', 'playedWaveformColor', 'playheadColor', 'playheadTextColor', 'timeLabelPrecision', 'axisGridlineColor', 'axisLabelColor', 'fontFamily', 'fontSize', 'fontStyle', 'wheelMode'];
  optNames.forEach(function (optName) {
    if (opts.zoomview && objectHasProperty(opts.zoomview, optName)) {
      zoomviewOptions[optName] = opts.zoomview[optName];
    } else if (objectHasProperty(opts, optName)) {
      zoomviewOptions[optName] = opts[optName];
    } else if (objectHasProperty(defaultZoomviewOptions, optName)) {
      zoomviewOptions[optName] = defaultZoomviewOptions[optName];
    } else if (objectHasProperty(defaultViewOptions, optName)) {
      zoomviewOptions[optName] = defaultViewOptions[optName];
    }
  });
  return zoomviewOptions;
}

function extendOptions(to, from) {
  for (var key in from) {
    if (objectHasProperty(from, key) && objectHasProperty(to, key)) {
      to[key] = from[key];
    }
  }

  return to;
}
/**
 * Creates and initialises a new Peaks instance with the given options.
 *
 * @param {Object} opts Configuration options
 *
 * @return {Peaks}
 */


Peaks.init = function (opts, callback) {
  var instance = new Peaks();

  var err = instance._setOptions(opts);

  if (err) {
    callback(err);
    return;
  }

  var zoomviewContainer = instance.options.zoomview.container;
  var overviewContainer = instance.options.overview.container;

  if (!isHTMLElement(zoomviewContainer) && !isHTMLElement(overviewContainer)) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): The zoomview and/or overview container options must be valid HTML elements'));
    return;
  }

  if (zoomviewContainer && zoomviewContainer.clientWidth <= 0) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): Please ensure that the zoomview container is visible and has non-zero width'));
    return;
  }

  if (overviewContainer && overviewContainer.clientWidth <= 0) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): Please ensure that the overview container is visible and has non-zero width'));
    return;
  }

  if (opts.keyboard) {
    instance._keyboardHandler = new KeyboardHandler(instance);
  }

  var player = opts.player ? opts.player : new MediaElementPlayer(instance, instance.options.mediaElement);
  instance.player = new Player(instance, player);
  instance.segments = new WaveformSegments(instance);
  instance.points = new WaveformPoints(instance);
  instance.zoom = new ZoomController(instance, instance.options.zoomLevels);
  instance.views = new ViewController(instance); // Setup the UI components

  var waveformBuilder = new WaveformBuilder(instance);
  waveformBuilder.init(instance.options, function (err, waveformData) {
    if (err) {
      if (callback) {
        callback(err);
      }

      return;
    }

    instance._waveformData = waveformData;

    if (overviewContainer) {
      instance.views.createOverview(overviewContainer);
    }

    if (zoomviewContainer) {
      instance.views.createZoomview(zoomviewContainer);
    }

    instance._addWindowResizeHandler();

    if (opts.segments) {
      instance.segments.add(opts.segments);
    }

    if (opts.points) {
      instance.points.add(opts.points);
    }

    if (opts.emitCueEvents) {
      instance._cueEmitter = new CueEmitter(instance);
    } // Allow applications to attach event handlers before emitting events,
    // when initialising with local waveform data.


    setTimeout(function () {
      instance.emit('peaks.ready');
    }, 0);
    callback(null, instance);
  });
};

Peaks.prototype._setOptions = function (opts) {
  if (!isObject(opts)) {
    return new TypeError('Peaks.init(): The options parameter should be an object');
  }

  if (!opts.player) {
    if (!opts.mediaElement) {
      return new Error('Peaks.init(): Missing mediaElement option');
    }

    if (!(opts.mediaElement instanceof HTMLMediaElement)) {
      // eslint-disable-next-line max-len
      return new TypeError('Peaks.init(): The mediaElement option should be an HTMLMediaElement');
    }
  }

  if (opts.container) {
    // eslint-disable-next-line max-len
    return new Error('Peaks.init(): The container option has been removed, please use containers instead');
  }

  if (opts.logger && !isFunction(opts.logger)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): The logger option should be a function');
  }

  if (opts.segments && !Array.isArray(opts.segments)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): options.segments must be an array of segment objects');
  }

  if (opts.points && !Array.isArray(opts.points)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): options.points must be an array of point objects');
  }

  extendOptions(this.options, opts);
  this.options.overview = getOverviewOptions(opts);
  this.options.zoomview = getZoomviewOptions(opts);

  if (!Array.isArray(this.options.zoomLevels)) {
    return new TypeError('Peaks.init(): The zoomLevels option should be an array');
  } else if (this.options.zoomLevels.length === 0) {
    return new Error('Peaks.init(): The zoomLevels array must not be empty');
  } else {
    if (!isInAscendingOrder(this.options.zoomLevels)) {
      return new Error('Peaks.init(): The zoomLevels array must be sorted in ascending order');
    }
  }

  if (opts.logger) {
    this.logger = opts.logger;
  }
};
/**
 * Remote waveform data options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} RemoteWaveformDataOptions
 * @global
 * @property {String=} arraybuffer
 * @property {String=} json
 */

/**
 * Local waveform data options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} LocalWaveformDataOptions
 * @global
 * @property {ArrayBuffer=} arraybuffer
 * @property {Object=} json
 */

/**
 * Web Audio options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} WebAudioOptions
 * @global
 * @property {AudioContext=} audioContext
 * @property {AudioBuffer=} audioBuffer
 * @property {Number=} scale
 * @property {Boolean=} multiChannel
 */

/**
 * Options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} PeaksSetSourceOptions
 * @global
 * @property {String} mediaUrl
 * @property {RemoteWaveformDataOptions=} dataUri
 * @property {LocalWaveformDataOptions=} waveformData
 * @property {WebAudioOptions=} webAudio
 * @property {Boolean=} withCredentials
 * @property {Array<Number>=} zoomLevels
 */

/**
 * Changes the audio or video media source associated with the {@link Peaks}
 * instance.
 *
 * @param {PeaksSetSourceOptions} options
 * @param {Function} callback
 */


Peaks.prototype.setSource = function (options, callback) {
  var self = this;

  if (this.options.mediaElement && !options.mediaUrl) {
    // eslint-disable-next-line max-len
    callback(new Error('peaks.setSource(): options must contain a mediaUrl when using mediaElement'));
    return;
  }

  function reset() {
    self.removeAllListeners('player.canplay');
    self.removeAllListeners('player.error');
  }

  function playerErrorHandler(err) {
    reset(); // Return the MediaError object from the media element

    callback(err);
  }

  function playerCanPlayHandler() {
    reset();

    if (!options.zoomLevels) {
      options.zoomLevels = self.options.zoomLevels;
    }

    var waveformBuilder = new WaveformBuilder(self);
    waveformBuilder.init(options, function (err, waveformData) {
      if (err) {
        callback(err);
        return;
      }

      self._waveformData = waveformData;
      ['overview', 'zoomview'].forEach(function (viewName) {
        var view = self.views.getView(viewName);

        if (view) {
          view.setWaveformData(waveformData);
        }
      });
      self.zoom.setZoomLevels(options.zoomLevels);
      callback();
    });
  }

  self.once('player.canplay', playerCanPlayHandler);
  self.once('player.error', playerErrorHandler);

  if (this.options.mediaElement) {
    self.options.mediaElement.setAttribute('src', options.mediaUrl);
  } else {
    playerCanPlayHandler();
  }
};

Peaks.prototype.getWaveformData = function () {
  return this._waveformData;
};

Peaks.prototype._addWindowResizeHandler = function () {
  this._onResize = this._onResize.bind(this);
  window.addEventListener('resize', this._onResize);
};

Peaks.prototype._onResize = function () {
  this.emit('window_resize');
};

Peaks.prototype._removeWindowResizeHandler = function () {
  window.removeEventListener('resize', this._onResize);
};
/**
 * Cleans up a Peaks instance after use.
 */


Peaks.prototype.destroy = function () {
  this._removeWindowResizeHandler();

  if (this._keyboardHandler) {
    this._keyboardHandler.destroy();
  }

  if (this.views) {
    this.views.destroy();
  }

  if (this.player) {
    this.player.destroy();
  }

  if (this._cueEmitter) {
    this._cueEmitter.destroy();
  }
};

export { Peaks as default };
//# sourceMappingURL=peaks.esm.js.map
