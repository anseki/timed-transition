/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * TimedTransition
 * https://github.com/anseki/timed-transition
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */
import CSSPrefix from 'cssprefix';

var STATE_STOPPED = 0,
    STATE_DELAYING = 1,
    STATE_PLAYING = 2,
    PREFIX = 'timed',
    EVENT_TYPE_RUN = "".concat(PREFIX, "TransitionRun"),
    EVENT_TYPE_START = "".concat(PREFIX, "TransitionStart"),
    EVENT_TYPE_END = "".concat(PREFIX, "TransitionEnd"),
    EVENT_TYPE_CANCEL = "".concat(PREFIX, "TransitionCancel"),
    IS_EDGE = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
    isFinite = Number.isFinite || function (value) {
  return typeof value === 'number' && window.isFinite(value);
},

/**
 * An object that has properties of instance.
 * @typedef {Object} props
 * @property {Object} options - Options.
 * @property {Element} element - Target element.
 * @property {Window} window - Window that contains target element.
 * @property {number} duration - Milliseconds from `transition-duration`.
 * @property {number} delay - Milliseconds from `transition-delay`.
 * @property {number} state - Current state.
 * @property {boolean} isOn - `on` was called and `off` is not called yet. It is changed by only on/off.
 * @property {number} runTime - 0, or Date.now() when EVENT_TYPE_RUN.
 * @property {number} startTime - 0, or Date.now() when EVENT_TYPE_START. It might not be runTime + delay.
 * @property {number} currentPosition - A time elapsed from initial state, in milliseconds.
 * @property {boolean} isReversing - The current playing is reversing when STATE_PLAYING.
 * @property {number} timer - Timer ID.
 */

/** @type {Object.<_id: number, props>} */
insProps = {};

var insId = 0;
/**
 * @param {props} props - `props` of instance.
 * @param {string} type - One of EVENT_TYPE_*.
 * @returns {void}
 */

function fireEvent(props, type) {
  var initTime = Math.min(Math.max(-props.delay, 0), props.duration),
      elapsedTime = (initTime + ( // The value for transitionend might NOT be transition-duration. (csswg.org may be wrong)
  (type === EVENT_TYPE_END || type === EVENT_TYPE_CANCEL) && props.startTime ? Date.now() - props.startTime : 0)) / 1000;
  var event;

  try {
    event = new props.window.TransitionEvent(type, {
      propertyName: props.options.property,
      pseudoElement: props.options.pseudoElement,
      elapsedTime: elapsedTime,
      bubbles: true,
      cancelable: false
    }); // Edge bug, can't set pseudoElement

    if (IS_EDGE) {
      event.pseudoElement = props.options.pseudoElement;
    }
  } catch (error) {
    event = props.window.document.createEvent('TransitionEvent');
    event.initTransitionEvent(type, true, false, props.options.property, elapsedTime);
    event.pseudoElement = props.options.pseudoElement;
  }

  event.timedTransition = props.ins;
  props.element.dispatchEvent(event);
}
/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function fixCurrentPosition(props) {
  if (props.state !== STATE_PLAYING) {
    return;
  }

  var playingTime = Date.now() - props.startTime;
  props.currentPosition = props.isOn ? Math.min(props.currentPosition + playingTime, props.duration) : Math.max(props.currentPosition - playingTime, 0);
}
/**
 * Finish the "on/off" immediately by isOn.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function finishAll(props) {
  props.state = STATE_STOPPED;
  props.runTime = 0;
  props.startTime = 0;
  props.currentPosition = props.isOn ? props.duration : 0;
}
/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function finishPlaying(props) {
  if (props.state !== STATE_PLAYING) {
    return;
  }

  props.state = STATE_STOPPED;
  fireEvent(props, EVENT_TYPE_END);
  finishAll(props);
}
/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function finishDelaying(props) {
  if (props.state !== STATE_DELAYING) {
    return;
  }

  props.state = STATE_PLAYING;
  props.startTime = Date.now();
  props.isReversing = !props.isOn;
  fireEvent(props, EVENT_TYPE_START);
  var durationLeft = props.isOn ? props.duration - props.currentPosition : props.currentPosition;

  if (durationLeft > 0) {
    props.timer = setTimeout(function () {
      finishPlaying(props);
    }, durationLeft);
  } else {
    finishPlaying(props);
  }
}
/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function abort(props) {
  clearTimeout(props.timer);

  if (props.state === STATE_STOPPED) {
    return;
  }

  props.state = STATE_STOPPED;
  fireEvent(props, EVENT_TYPE_CANCEL);
}
/**
 * @param {props} props - `props` of instance.
 * @param {boolean} force - Skip transition.
 * @param {Array} args - Arguments that are passed to procToOn.
 * @returns {void}
 */


function _on(props, force, args) {
  if (props.isOn && props.state === STATE_STOPPED || props.isOn && props.state !== STATE_STOPPED && !force) {
    return;
  }
  /*
    Cases:
      - Done `off` or playing to `off`, regardless of `force`
      - Playing to `on` and `force`
  */


  if (props.options.procToOn) {
    args.unshift(!!force);
    props.options.procToOn.apply(props.ins, args);
  }

  if (force || !props.isOn && props.state === STATE_DELAYING || -props.delay > props.duration) {
    // The delay must have not changed before turning over.
    abort(props);
    props.isOn = true;
    finishAll(props);
  } else {
    fixCurrentPosition(props);
    abort(props);
    props.state = STATE_DELAYING;
    props.isOn = true;
    props.runTime = Date.now();
    props.startTime = 0;
    fireEvent(props, EVENT_TYPE_RUN);

    if (props.delay > 0) {
      props.timer = setTimeout(function () {
        finishDelaying(props);
      }, props.delay);
    } else {
      if (props.delay < 0) {
        // Move the position to the right.
        props.currentPosition = Math.min(props.currentPosition - props.delay, props.duration);
      }

      finishDelaying(props);
    }
  }
}
/**
 * @param {props} props - `props` of instance.
 * @param {boolean} force - Skip transition.
 * @param {Array} args - Arguments that are passed to procToOff.
 * @returns {void}
 */


function _off(props, force, args) {
  if (!props.isOn && props.state === STATE_STOPPED || !props.isOn && props.state !== STATE_STOPPED && !force) {
    return;
  }
  /*
    Cases:
      - Done `on` or playing to `on`, regardless of `force`
      - Playing to `off` and `force`
  */


  if (props.options.procToOff) {
    args.unshift(!!force);
    props.options.procToOff.apply(props.ins, args);
  }

  if (force || props.isOn && props.state === STATE_DELAYING || -props.delay > props.duration) {
    // The delay must have not changed before turning over.
    abort(props);
    props.isOn = false;
    finishAll(props);
  } else {
    fixCurrentPosition(props);
    abort(props);
    props.state = STATE_DELAYING;
    props.isOn = false;
    props.runTime = Date.now();
    props.startTime = 0;
    fireEvent(props, EVENT_TYPE_RUN);

    if (props.delay > 0) {
      props.timer = setTimeout(function () {
        finishDelaying(props);
      }, props.delay);
    } else {
      if (props.delay < 0) {
        // Move the position to the left.
        props.currentPosition = Math.max(props.currentPosition + props.delay, 0);
      }

      finishDelaying(props);
    }
  }
}
/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */


function _setOptions(props, newOptions) {
  var options = props.options;

  function parseAsCss(option) {
    var optionValue = typeof newOptions[option] === 'number' // From CSS
    ? (props.window.getComputedStyle(props.element, '')[CSSPrefix.getName("transition-".concat(option))] || '').split(',')[newOptions[option]] : newOptions[option];
    return typeof optionValue === 'string' ? optionValue.trim() : null;
  } // pseudoElement


  if (typeof newOptions.pseudoElement === 'string') {
    options.pseudoElement = newOptions.pseudoElement;
  } // property


  {
    var value = parseAsCss('property');

    if (typeof value === 'string' && value !== 'all' && value !== 'none') {
      options.property = value;
    }
  } // duration, delay

  ['duration', 'delay'].forEach(function (option) {
    var value = parseAsCss(option);

    if (typeof value === 'string') {
      var matches, timeValue;

      if (/^[0.]+$/.test(value)) {
        // This is invalid for CSS.
        options[option] = '0s';
        props[option] = 0;
      } else if ((matches = /^(.+?)(m)?s$/.exec(value)) && isFinite(timeValue = parseFloat(matches[1])) && (option !== 'duration' || timeValue >= 0)) {
        options[option] = "".concat(timeValue).concat(matches[2] || '', "s");
        props[option] = timeValue * (matches[2] ? 1 : 1000);
      }
    }
  }); // procToOn, procToOff

  ['procToOn', 'procToOff'].forEach(function (option) {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = void 0;
    }
  });
}

var TimedTransition = /*#__PURE__*/function () {
  /**
   * Create a `TimedTransition` instance.
   * @param {Element} element - Target element.
   * @param {Object} [options] - Options.
   * @param {boolean} [initOn] - Initial `on`.
   */
  function TimedTransition(element, options, initOn) {
    _classCallCheck(this, TimedTransition);

    var props = {
      ins: this,
      options: {
        // Initial options (not default)
        pseudoElement: '',
        property: ''
      },
      duration: 0,
      delay: 0,
      isOn: !!initOn
    };
    Object.defineProperty(this, '_id', {
      value: ++insId
    });
    props._id = this._id;
    insProps[this._id] = props;

    if (!element.nodeType || element.nodeType !== Node.ELEMENT_NODE) {
      throw new Error('This `element` is not accepted.');
    }

    props.element = element;

    if (!options) {
      options = {};
    }

    props.window = element.ownerDocument.defaultView || options.window || window; // Default options

    if (!options.hasOwnProperty('property')) {
      options.property = 0;
    }

    if (!options.hasOwnProperty('duration')) {
      options.duration = 0;
    }

    if (!options.hasOwnProperty('delay')) {
      options.delay = 0;
    }

    _setOptions(props, options);

    finishAll(props);
  }

  _createClass(TimedTransition, [{
    key: "remove",
    value: function remove() {
      var props = insProps[this._id];
      clearTimeout(props.timer);
      delete insProps[this._id];
    }
    /**
     * @param {Object} options - New options.
     * @returns {TimedTransition} Current instance itself.
     */

  }, {
    key: "setOptions",
    value: function setOptions(options) {
      if (options) {
        _setOptions(insProps[this._id], options);
      }

      return this;
    }
    /**
     * Set `on`.
     * @param {boolean} [force] - Set `on` it immediately without transition.
     * @param {Object} [options] - New options.
     * @param {...{}} [args] - Arguments that are passed to procToOn.
     * @returns {TimedTransition} Current instance itself.
     */

  }, {
    key: "on",
    value: function on(force, options) {
      if (arguments.length < 2 && typeof force !== 'boolean') {
        options = force;
        force = false;
      }

      this.setOptions(options);

      _on(insProps[this._id], force, Array.prototype.slice.call(arguments, 2));

      return this;
    }
    /**
     * Set 'off'.
     * @param {boolean} [force] - Set `off` it immediately without transition.
     * @param {Object} [options] - New options.
     * @param {...{}} [args] - Arguments that are passed to procToOff.
     * @returns {TimedTransition} Current instance itself.
     */

  }, {
    key: "off",
    value: function off(force, options) {
      if (arguments.length < 2 && typeof force !== 'boolean') {
        options = force;
        force = false;
      }

      this.setOptions(options);

      _off(insProps[this._id], force, Array.prototype.slice.call(arguments, 2));

      return this;
    }
  }, {
    key: "state",
    get: function get() {
      return insProps[this._id].state;
    }
  }, {
    key: "element",
    get: function get() {
      return insProps[this._id].element;
    }
  }, {
    key: "isReversing",
    get: function get() {
      return insProps[this._id].isReversing;
    }
  }, {
    key: "pseudoElement",
    get: function get() {
      return insProps[this._id].options.pseudoElement;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        pseudoElement: value
      });
    }
  }, {
    key: "property",
    get: function get() {
      return insProps[this._id].options.property;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        property: value
      });
    }
  }, {
    key: "duration",
    get: function get() {
      return insProps[this._id].options.duration;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        duration: value
      });
    }
  }, {
    key: "delay",
    get: function get() {
      return insProps[this._id].options.delay;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        delay: value
      });
    }
  }, {
    key: "procToOn",
    get: function get() {
      return insProps[this._id].options.procToOn;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        procToOn: value
      });
    }
  }, {
    key: "procToOff",
    get: function get() {
      return insProps[this._id].options.procToOff;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        procToOff: value
      });
    }
  }], [{
    key: "STATE_STOPPED",
    get: function get() {
      return STATE_STOPPED;
    }
  }, {
    key: "STATE_DELAYING",
    get: function get() {
      return STATE_DELAYING;
    }
  }, {
    key: "STATE_PLAYING",
    get: function get() {
      return STATE_PLAYING;
    }
  }]);

  return TimedTransition;
}();

export default TimedTransition;