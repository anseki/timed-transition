/*
 * TimedTransition
 * https://github.com/anseki/timed-transition
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';

const
  STATE_STOPPED = 0,
  STATE_DELAYING = 1,
  STATE_PLAYING = 2,

  PREFIX = 'timed',
  EVENT_TYPE_RUN = `${PREFIX}TransitionRun`,
  EVENT_TYPE_START = `${PREFIX}TransitionStart`,
  EVENT_TYPE_END = `${PREFIX}TransitionEnd`,
  EVENT_TYPE_CANCEL = `${PREFIX}TransitionCancel`,

  IS_EDGE = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,

  isObject = (() => {
    const toString = {}.toString,
      fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
    return obj => {
      let proto, constr;
      return obj && toString.call(obj) === '[object Object]' &&
        (!(proto = Object.getPrototypeOf(obj)) ||
          (constr = proto.hasOwnProperty('constructor') && proto.constructor) &&
          typeof constr === 'function' && fnToString.call(constr) === objFnString);
    };
  })(),
  isFinite = Number.isFinite || (value => typeof value === 'number' && window.isFinite(value)),

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

let insId = 0;

// [DEBUG]
const traceLog = [];
const STATE_TEXT = {};
STATE_TEXT[STATE_STOPPED] = 'STATE_STOPPED';
STATE_TEXT[STATE_DELAYING] = 'STATE_DELAYING';
STATE_TEXT[STATE_PLAYING] = 'STATE_PLAYING';
function roundTime(timeValue) { return Math.round(timeValue / 200) * 200; } // for traceLog
// [/DEBUG]

/**
 * @param {props} props - `props` of instance.
 * @param {string} type - One of EVENT_TYPE_*.
 * @returns {void}
 */
function fireEvent(props, type) {
  // [DEBUG]
  traceLog.push('<fireEvent>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`isOn:${props.isOn}`,
    `runTime:${roundTime(props.runTime)}`, `startTime:${roundTime(props.startTime)}`,
    `currentPosition:${roundTime(props.currentPosition)}`);
  traceLog.push(`type:${type}`);
  // [/DEBUG]
  const initTime = Math.min(Math.max(-props.delay, 0), props.duration),
    elapsedTime = (initTime +
      // The value for transitionend might NOT be transition-duration. (csswg.org may be wrong)
      ((type === EVENT_TYPE_END || type === EVENT_TYPE_CANCEL) && props.startTime
        ? Date.now() - props.startTime : 0)
    ) / 1000;

  let event;
  try {
    event = new props.window.TransitionEvent(type, {
      propertyName: props.options.property,
      pseudoElement: props.options.pseudoElement,
      elapsedTime,
      bubbles: true,
      cancelable: false
    });
    // Edge bug, can't set pseudoElement
    if (IS_EDGE) { event.pseudoElement = props.options.pseudoElement; }
  } catch (error) {
    event = props.window.document.createEvent('TransitionEvent');
    event.initTransitionEvent(type, true, false, props.options.property, elapsedTime);
    event.pseudoElement = props.options.pseudoElement;
  }
  event.timedTransition = props.ins;
  props.element.dispatchEvent(event);
  traceLog.push('</fireEvent>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixCurrentPosition(props) {
  // [DEBUG]
  traceLog.push('<fixCurrentPosition>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`currentPosition:${roundTime(props.currentPosition)}`);
  // [/DEBUG]
  if (props.state !== STATE_PLAYING) {
    traceLog.push('CANCEL', '</fixCurrentPosition>'); // [DEBUG/]
    return;
  }
  const playingTime = Date.now() - props.startTime;
  props.currentPosition = props.isOn
    ? Math.min(props.currentPosition + playingTime, props.duration) :
    Math.max(props.currentPosition - playingTime, 0);
  traceLog.push(`currentPosition:${roundTime(props.currentPosition)}`); // [DEBUG/]
  traceLog.push('</fixCurrentPosition>'); // [DEBUG/]
}

/**
 * Finish the "on/off" immediately by isOn.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function finishAll(props) {
  traceLog.push('<finishAll/>', `_id:${props._id}`, `isOn:${props.isOn}`); // [DEBUG/]
  props.state = STATE_STOPPED;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  props.runTime = 0;
  props.startTime = 0;
  props.currentPosition = props.isOn ? props.duration : 0;
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function finishPlaying(props) {
  // [DEBUG]
  traceLog.push('<finishPlaying>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`isOn:${props.isOn}`,
    `runTime:${roundTime(props.runTime)}`, `startTime:${roundTime(props.startTime)}`,
    `currentPosition:${roundTime(props.currentPosition)}`);
  // [/DEBUG]
  if (props.state !== STATE_PLAYING) {
    traceLog.push('CANCEL', '</finishPlaying>'); // [DEBUG/]
    return;
  }

  props.state = STATE_STOPPED;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  fireEvent(props, EVENT_TYPE_END);

  finishAll(props);
  traceLog.push('</finishPlaying>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function finishDelaying(props) {
  // [DEBUG]
  traceLog.push('<finishDelaying>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`isOn:${props.isOn}`,
    `runTime:${roundTime(props.runTime)}`, `startTime:${roundTime(props.startTime)}`,
    `currentPosition:${roundTime(props.currentPosition)}`);
  // [/DEBUG]
  if (props.state !== STATE_DELAYING) {
    traceLog.push('CANCEL', '</finishDelaying>'); // [DEBUG/]
    return;
  }

  props.state = STATE_PLAYING;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  props.startTime = Date.now();
  props.isReversing = !props.isOn;
  fireEvent(props, EVENT_TYPE_START);

  const durationLeft = props.isOn ? props.duration - props.currentPosition : props.currentPosition;
  traceLog.push(`durationLeft:${roundTime(durationLeft)}`); // [DEBUG/]
  if (durationLeft > 0) {
    props.timer = setTimeout(() => { finishPlaying(props); }, durationLeft);
  } else {
    finishPlaying(props);
  }
  traceLog.push('</finishDelaying>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function abort(props) {
  traceLog.push('<abort>', `_id:${props._id}`, `isOn:${props.isOn}`); // [DEBUG/]
  clearTimeout(props.timer);
  if (props.state === STATE_STOPPED) {
    traceLog.push('CANCEL', '</abort>'); // [DEBUG/]
    return;
  }

  props.state = STATE_STOPPED;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  fireEvent(props, EVENT_TYPE_CANCEL);
  traceLog.push('</abort>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip transition.
 * @returns {void}
 */
function on(props, force) {
  // [DEBUG]
  traceLog.push('<on>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`force:${!!force}`);
  traceLog.push(`isOn:${props.isOn}`,
    `runTime:${roundTime(props.runTime)}`, `startTime:${roundTime(props.startTime)}`,
    `currentPosition:${roundTime(props.currentPosition)}`);
  // [/DEBUG]
  if (props.isOn && props.state === STATE_STOPPED ||
      props.isOn && props.state !== STATE_STOPPED && !force) {
    traceLog.push('CANCEL', '</on>'); // [DEBUG/]
    return;
  }
  /*
    Cases:
      - Done `off` or playing to `off`, regardless of `force`
      - Playing to `on` and `force`
  */

  if (props.options.procToOn) { props.options.procToOn.call(props.ins, !!force); }

  if (force || !props.isOn && props.state === STATE_DELAYING ||
      -props.delay > props.duration) { // The delay must have not changed before turning over.
    // [DEBUG]
    traceLog.push(`STOP(${
      force ? 'force' :
      !props.isOn && props.state === STATE_DELAYING ? 'DELAYING' :
      'over-duration'})`);
    // [/DEBUG]
    abort(props);
    props.isOn = true;
    finishAll(props);

  } else {
    fixCurrentPosition(props);
    abort(props);

    props.state = STATE_DELAYING;
    traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
    props.isOn = true;
    props.runTime = Date.now();
    props.startTime = 0;
    fireEvent(props, EVENT_TYPE_RUN);

    if (props.delay > 0) {
      props.timer = setTimeout(() => { finishDelaying(props); }, props.delay);
    } else {
      if (props.delay < 0) { // Move the position to the right.
        props.currentPosition = Math.min(props.currentPosition - props.delay, props.duration);
      }
      finishDelaying(props);
    }
  }
  traceLog.push('</on>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip transition.
 * @returns {void}
 */
function off(props, force) {
  // [DEBUG]
  traceLog.push('<off>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`force:${!!force}`);
  traceLog.push(`isOn:${props.isOn}`,
    `runTime:${roundTime(props.runTime)}`, `startTime:${roundTime(props.startTime)}`,
    `currentPosition:${roundTime(props.currentPosition)}`);
  // [/DEBUG]
  if (!props.isOn && props.state === STATE_STOPPED ||
      !props.isOn && props.state !== STATE_STOPPED && !force) {
    traceLog.push('CANCEL', '</off>'); // [DEBUG/]
    return;
  }
  /*
    Cases:
      - Done `on` or playing to `on`, regardless of `force`
      - Playing to `off` and `force`
  */

  if (props.options.procToOff) { props.options.procToOff.call(props.ins, !!force); }

  if (force || props.isOn && props.state === STATE_DELAYING ||
      -props.delay > props.duration) { // The delay must have not changed before turning over.
    // [DEBUG]
    traceLog.push(`STOP(${
      force ? 'force' :
      props.isOn && props.state === STATE_DELAYING ? 'DELAYING' :
      'over-duration'})`);
    // [/DEBUG]
    abort(props);
    props.isOn = false;
    finishAll(props);

  } else {
    fixCurrentPosition(props);
    abort(props);

    props.state = STATE_DELAYING;
    traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
    props.isOn = false;
    props.runTime = Date.now();
    props.startTime = 0;
    fireEvent(props, EVENT_TYPE_RUN);

    if (props.delay > 0) {
      props.timer = setTimeout(() => { finishDelaying(props); }, props.delay);
    } else {
      if (props.delay < 0) { // Move the position to the left.
        props.currentPosition = Math.max(props.currentPosition + props.delay, 0);
      }
      finishDelaying(props);
    }
  }
  traceLog.push('</off>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function setOptions(props, newOptions) {
  const options = props.options;

  function parseAsCss(option) {
    const optionValue = typeof newOptions[option] === 'number' // From CSS
      ? (props.window.getComputedStyle(props.element, '')[
        CSSPrefix.getName(`transition-${option}`)] || '')
        .split(',')[newOptions[option]] :
      newOptions[option];
    // [DEBUG]
    props.lastParseAsCss[option] = typeof optionValue === 'string' ? optionValue.trim() : null;
    // [/DEBUG]
    return typeof optionValue === 'string' ? optionValue.trim() : null;
  }

  // pseudoElement
  if (typeof newOptions.pseudoElement === 'string') {
    options.pseudoElement = newOptions.pseudoElement;
  }

  // property
  {
    const value = parseAsCss('property');
    if (typeof value === 'string' && value !== 'all' && value !== 'none') {
      options.property = value;
    }
  }

  // duration, delay
  ['duration', 'delay'].forEach(option => {
    const value = parseAsCss(option);
    if (typeof value === 'string') {
      let matches, timeValue;
      if (/^[0.]+$/.test(value)) { // This is invalid for CSS.
        options[option] = '0s';
        props[option] = 0;
      } else if ((matches = /^(.+?)(m)?s$/.exec(value)) &&
          isFinite((timeValue = parseFloat(matches[1]))) &&
          (option !== 'duration' || timeValue >= 0)) {
        options[option] = `${timeValue}${matches[2] || ''}s`;
        props[option] = timeValue * (matches[2] ? 1 : 1000);
      }
    }
  });

  // procToOn, procToOff
  ['procToOn', 'procToOff'].forEach(option => {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = void 0;
    }
  });
}

class TimedTransition {
  /**
   * Create a `TimedTransition` instance.
   * @param {Element} element - Target element.
   * @param {Object} [options] - Options.
   * @param {boolean} [initOn] - Initial `on`.
   */
  constructor(element, options, initOn) {
    const props = {
      ins: this,
      options: { // Initial options (not default)
        pseudoElement: '',
        property: ''
      },
      duration: 0,
      delay: 0,
      isOn: !!initOn
    };
    props.lastParseAsCss = {}; // [DEBUG/]

    Object.defineProperty(this, '_id', {value: ++insId});
    props._id = this._id;
    insProps[this._id] = props;

    if (!element.nodeType || element.nodeType !== Node.ELEMENT_NODE) {
      throw new Error('This `element` is not accepted.');
    }
    props.element = element;
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }
    props.window = element.ownerDocument.defaultView || options.window || window;

    // Default options
    if (!options.hasOwnProperty('property')) { options.property = 0; }
    if (!options.hasOwnProperty('duration')) { options.duration = 0; }
    if (!options.hasOwnProperty('delay')) { options.delay = 0; }

    setOptions(props, options);
    finishAll(props);
  }

  remove() {
    const props = insProps[this._id];
    clearTimeout(props.timer);
    delete insProps[this._id];
  }

  /**
   * @param {Object} options - New options.
   * @returns {TimedTransition} Current instance itself.
   */
  setOptions(options) {
    if (isObject(options)) {
      setOptions(insProps[this._id], options);
    }
    return this;
  }

  /**
   * Set `on`.
   * @param {boolean} [force] - Set `on` it immediately without transition.
   * @param {Object} [options] - New options.
   * @returns {TimedTransition} Current instance itself.
   */
  on(force, options) {
    if (arguments.length < 2 && typeof force !== 'boolean') {
      options = force;
      force = false;
    }

    this.setOptions(options);
    on(insProps[this._id], force);
    return this;
  }

  /**
   * Set 'off'.
   * @param {boolean} [force] - Set `off` it immediately without transition.
   * @param {Object} [options] - New options.
   * @returns {TimedTransition} Current instance itself.
   */
  off(force, options) {
    if (arguments.length < 2 && typeof force !== 'boolean') {
      options = force;
      force = false;
    }

    this.setOptions(options);
    off(insProps[this._id], force);
    return this;
  }

  get state() { return insProps[this._id].state; }

  get element() { return insProps[this._id].element; }

  get isReversing() { return insProps[this._id].isReversing; }

  get pseudoElement() { return insProps[this._id].options.pseudoElement; }
  set pseudoElement(value) { setOptions(insProps[this._id], {pseudoElement: value}); }

  get property() { return insProps[this._id].options.property; }
  set property(value) { setOptions(insProps[this._id], {property: value}); }

  get duration() { return insProps[this._id].options.duration; }
  set duration(value) { setOptions(insProps[this._id], {duration: value}); }

  get delay() { return insProps[this._id].options.delay; }
  set delay(value) { setOptions(insProps[this._id], {delay: value}); }

  get procToOn() { return insProps[this._id].options.procToOn; }
  set procToOn(value) { setOptions(insProps[this._id], {procToOn: value}); }

  get procToOff() { return insProps[this._id].options.procToOff; }
  set procToOff(value) { setOptions(insProps[this._id], {procToOff: value}); }

  static get STATE_STOPPED() { return STATE_STOPPED; }
  static get STATE_DELAYING() { return STATE_DELAYING; }
  static get STATE_PLAYING() { return STATE_PLAYING; }
}

// [DEBUG]
TimedTransition.insProps = insProps;
TimedTransition.traceLog = traceLog;
TimedTransition.STATE_TEXT = STATE_TEXT;
TimedTransition.roundTime = roundTime;
// [/DEBUG]

export default TimedTransition;
