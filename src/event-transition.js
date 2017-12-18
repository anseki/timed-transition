/*
 * TimedTransition
 * https://github.com/anseki/timed-transition
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';

const
  STATE_STOPPED = 0, STATE_DELAYING = 1, STATE_PLAYING = 2,

  EVENT_TYPE_RUN = 'timedTransitionRun',
  EVENT_TYPE_START = 'timedTransitionStart',
  EVENT_TYPE_END = 'timedTransitionEnd',
  EVENT_TYPE_CANCEL = 'timedTransitionCancel',

  isObject = (() => {
    const toString = {}.toString, fnToString = {}.hasOwnProperty.toString,
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
   * @property {Element} element - Target element.
   * @property {number} duration - Milliseconds from `transition-duration`.
   * @property {number} delay - Milliseconds from `transition-delay`.
   * @property {number} currentPosition - A time elapsed from initial state, in milliseconds.
   * @property {boolean} isReversing - The current playing is reversing when STATE_PLAYING.
   * @property {boolean} isOn - `on` was called and `off` is not called yet. It is changed by only on/off.
   * @property {number} runTime - 0, or Date.now() when EVENT_TYPE_RUN.
   * @property {number} startTime - 0, or Date.now() when EVENT_TYPE_START. It might not be runTime + delay.
   * @property {number} timer - Timer ID.
   * @property {number} state - Current state.
   * @property {Object} options - Options.
   */

  /** @type {Object.<_id: number, props>} */
  insProps = {};

let insId = 0;

// [DEBUG]
window.insProps = insProps;
// [/DEBUG]

/**
 * @param {props} props - `props` of instance.
 * @param {string} type - One of EVENT_TYPE_*.
 * @returns {void}
 */
function fireEvent(props, type) {
  const elapsedTime = (
      type === EVENT_TYPE_RUN || type === EVENT_TYPE_START ?
        Math.min(Math.max(-props.delay, 0), props.duration) :
      // The value for transitionend might NOT be transition-duration. (csswg.org may be wrong)
      props.startTime ? Date.now() - props.startTime : 0
    ) / 1000;

  let event;
  try {
    event = new TransitionEvent(type, {
      propertyName: props.options.property,
      pseudoElement: props.options.pseudoElement,
      elapsedTime: elapsedTime,
      bubbles: true,
      cancelable: false
    });
  } catch (error) {
    event = document.createEvent('TransitionEvent');
    event.initTransitionEvent(type, true, false, props.options.property, elapsedTime);
    event.pseudoElement = props.options.pseudoElement;
  }
  props.element.dispatchEvent(event);
}

/**
 * Finish the "on/off" immediately by isOn.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixState(props) {
  props.currentPosition = props.isOn ? props.duration : 0;
  props.runTime = 0;
  props.startTime = 0;
  props.state = STATE_STOPPED;
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixCurrentPosition(props) {
  if (props.state !== STATE_PLAYING) { return; }
  const playingTime = Date.now() - props.startTime;
  props.currentPosition = props.isOn ?
    Math.min(props.currentPosition + playingTime, props.duration) :
    Math.max(props.currentPosition - playingTime, 0);
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function finishPlaying(props) {
  if (props.state !== STATE_PLAYING) { return; }

  fireEvent(props, EVENT_TYPE_END);

  fixState(props);
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function finishDelaying(props) {
  if (props.state !== STATE_DELAYING) { return; }

  props.startTime = Date.now();
  props.state = STATE_PLAYING;
  fireEvent(props, EVENT_TYPE_START);
  props.isReversing = !props.isOn;

  const durationLeft = props.duration - props.currentPosition;
  if (durationLeft > 0) {
    props.timer = setTimeout(() => { finishPlaying(props); }, durationLeft);
  } else {
    finishPlaying(props);
  }
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function cancelAction(props) {
  clearTimeout(props.timer);
  if (props.state !== STATE_STOPPED) {
    fireEvent(props, EVENT_TYPE_CANCEL);
  }
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip transition.
 * @returns {void}
 */
function on(props, force) {
  if (props.isOn && props.state === STATE_STOPPED ||
      props.isOn && props.state !== STATE_STOPPED && !force) {
    return;
  }
  /*
    Cases:
      - Done `off` or playing to `off`, regardless of `force`
      - Playing to `on` and `force`
  */

  cancelAction(props);
  if (props.options.procToOn) { props.options.procToOn.call(props.ins, !!force); }

  if (force || !props.isOn && props.state === STATE_DELAYING ||
      -props.delay > props.duration) { // The delay must have not changed before turning over.
    props.isOn = true;
    fixState(props);

  } else {
    fixCurrentPosition(props);

    props.isOn = true;
    props.runTime = Date.now();
    props.startTime = 0;
    props.state = STATE_DELAYING;
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
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip transition.
 * @returns {void}
 */
function off(props, force) {
  if (!props.isOn && props.state === STATE_STOPPED ||
      !props.isOn && props.state !== STATE_STOPPED && !force) {
    return;
  }
  /*
    Cases:
      - Done `on` or playing to `on`, regardless of `force`
      - Playing to `off` and `force`
  */

  cancelAction(props);
  if (props.options.procToOff) { props.options.procToOff.call(props.ins, !!force); }

  if (force || props.isOn && props.state === STATE_DELAYING ||
      -props.delay > props.duration) { // The delay must have not changed before turning over.
    props.isOn = false;
    fixState(props);

  } else {
    fixCurrentPosition(props);

    props.isOn = false;
    props.runTime = Date.now();
    props.startTime = 0;
    props.state = STATE_DELAYING;
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
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function setOptions(props, newOptions) {
  const options = props.options;

  // property
  if (typeof newOptions.property === 'string') {
    options.property = newOptions.property;
  }

  // pseudoElement
  if (typeof newOptions.pseudoElement === 'string') {
    options.pseudoElement = newOptions.pseudoElement;
  }

  // duration, delay
  ['duration', 'delay'].forEach(option => {
    let value;
    if (typeof newOptions[option] === 'string') {
      value = newOptions[option].trim();
    } else if (newOptions.hasOwnProperty(option)) { // From CSS
      value =
        (getComputedStyle(props.element, '')[CSSPrefix.getName(`transition-${option}`)] || '')
        .split(/\s+/)[typeof newOptions[option] === 'number' ? newOptions[option] : 0].trim();
    }
    if (typeof value === 'string') {
      let matches, timeValue;
      if (/^0+$/.test(value)) { // This is invalid for CSS.
        options[option] = '0s';
        props[option] = 0;
      } else if ((matches = /^(.+)(m)?s$/.exec(value)) &&
          isFinite((timeValue = parseFloat(matches[1]))) &&
          (option !== 'duration' || timeValue >= 0)) {
        options[option] = `${timeValue}${matches[2] || ''}s`;
        props[option] = timeValue / (matches[2] ? 1 : 1000);
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
        property: '',
        pseudoElement: ''
      },
      duration: 0,
      delay: 0,
      isOn: !!initOn
    };

    Object.defineProperty(this, '_id', {value: ++insId});
    props._id = this._id;
    insProps[this._id] = props;

    if (!element.nodeType || element.nodeType !== Node.ELEMENT_NODE ||
        element.ownerDocument.defaultView !== window) {
      throw new Error('This `element` is not accepted.');
    }
    props.element = element;
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    // Default options
    if (!options.hasOwnProperty('duration')) { options.duration = 0; }
    if (!options.hasOwnProperty('delay')) { options.delay = 0; }

    setOptions(props, options);
    fixState(props);
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
   * @returns {TimedTransition} Current instance itself.
   */
  off(force) {
    off(insProps[this._id], force);
    return this;
  }

  get state() { return insProps[this._id].state; }

  get isReversing() { return insProps[this._id].isReversing; }

  get property() { return insProps[this._id].options.property; }
  set property(value) { setOptions(insProps[this._id], {property: value}); }

  get pseudoElement() { return insProps[this._id].options.pseudoElement; }
  set pseudoElement(value) { setOptions(insProps[this._id], {pseudoElement: value}); }

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

export default TimedTransition;
