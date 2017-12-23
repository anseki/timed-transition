# TimedTransition

[![npm](https://img.shields.io/npm/v/timed-transition.svg)](https://www.npmjs.com/package/timed-transition) [![GitHub issues](https://img.shields.io/github/issues/anseki/timed-transition.svg)](https://github.com/anseki/timed-transition/issues) [![dependencies](https://img.shields.io/badge/dependencies-No%20dependency-brightgreen.svg)](package.json) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE-MIT)

The simple shim for [Transition Events](https://drafts.csswg.org/css-transitions/#transition-events) with [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions), that transparently intercepts difference between browsers.

The CSS transitions are very useful and easy, to style web pages for dynamic visual design.  
However, when you use that with JavaScript to control its behavior or doing something, you will meet various nasty problems. For example, there are some problems with Transition Events, CSS `opacity` property, etc.  
Those are caused by wrong implementation in web browsers. Unfortunately, the worst one is Google Chrome that is most popular one. On the other hand, Mozilla Firefox is almost perfect. See "[Browsers and Problems](#browsers-and-problems)".

This shim fires the Transition Events correctly according to [standard specification](https://drafts.csswg.org/css-transitions/#event-transitionevent) with timer driven.

## Usage

A simple case without TimedTransition is here:

```css
#target {
  width: 100px;
  height: 100px;
  background-color: blue;

  transition-property: margin-left;
  transition-duration: 3s;
}
```

```js
// Event Listener
function printLog(event) {
  console.log('[%s] <%s> propertyName: %s elapsedTime: %f pseudoElement: %s',
    Date.now(),
    event.type,
    event.propertyName,
    event.elapsedTime,
    event.pseudoElement);
}

var element = document.getElementById('target');

// Prepare
['transitionrun', 'transitionstart',
    'transitionend', 'transitioncancel'].forEach(function(type) {
  element.addEventListener(type, printLog, true);
});

// START Transition
element.style.marginLeft = '600px';

// REVERSE Transition
setTimeout(function() {
  element.style.marginLeft = '0';
}, 4000);
```

The code above doesn't work correctly in many web browsers.  
Then, it is solved by using TimedTransition:

Load TimedTransition into your web page.

```html
<script src="timed-transition.min.js"></script>
```

And replace the code above with:

```js
// Prepare

// Create new instance
var transition = new TimedTransition(element, {
  // This is called by `transition.on()`.
  procToOn: function() { element.style.marginLeft = '600px'; },
  // This is called by `transition.off()`.
  procToOff: function() { element.style.marginLeft = '0'; }
});

// Event types are prefixed with `timed`.
['timedTransitionRun', 'timedTransitionStart',
    'timedTransitionEnd', 'timedTransitionCancel'].forEach(function(type) {
  element.addEventListener(type, printLog, true);
});

// START Transition
transition.on();

// REVERSE Transition
setTimeout(function() {
  transition.off();
}, 4000);
```

Result in the console:

```
[20:40:15] <timedTransitionRun> propertyName: margin-left elapsedTime: 0.000000 pseudoElement:
[20:40:15] <timedTransitionStart> propertyName: margin-left elapsedTime: 0.000000 pseudoElement:
[20:40:18] <timedTransitionEnd> propertyName: margin-left elapsedTime: 3.001000 pseudoElement:
[20:40:19] <timedTransitionRun> propertyName: margin-left elapsedTime: 0.000000 pseudoElement:
[20:40:19] <timedTransitionStart> propertyName: margin-left elapsedTime: 0.000000 pseudoElement:
[20:40:22] <timedTransitionEnd> propertyName: margin-left elapsedTime: 3.020060 pseudoElement:
```

Note that you should consider cross-browser compatibility if you will use CSS `transition-*` properties or `element.classList`. See "[Cross-Browser](#cross-browser)".

## Constructor

```js
transition = new TimedTransition(element[, options[, initOn]])
```

The `element` argument is an element that transitions are applied and events are dispatched.

The `options` argument is an Object that can have properties as [options](#options). You can also change the options by [`setOptions`](#setoptions) or [`on`](#on) methods or [properties](#properties) of the TimedTransition instance.  
For example, construct new TimedTransition instance with `duration` option:

```js
var transition = new TimedTransition(document.getElementById('target'), {duration: '400ms'});
```

By default, a CSS property that is animated is regarded as an initial value that is not changed at this time. If `true` is specified for the `initOn` argument, it is regarded as a changed value.  
For example, in the example code at the beginning of this document, the `margin-left` property of the element that will be animated is initially `0`. If you want to construct new TimedTransition instance after changing the property, specify `true` for the `initOn` argument.

```js
element.style.marginLeft = '600px';
var transition = new TimedTransition(element, null, true);
// TimedTransition regards current value as a changed value, not an initial value.
```

## Methods

### `on`

```js
self = transition.on([force][, options])
```

Make the transition run to become the changed CSS property.  
If a function is specified for the [`procToOn`](#options-proctoon-proctooff) option, it is called. Then, a timer is started for events.

If `true` is specified for `force` argument, change the state immediately without the transition. For example, this is used to show something immediately.  
The `procToOn` function is called with `force` argument. Then, `timedTransitionCancel` event is fired if the transition is running now, and other events are not fired.

If `options` argument is specified, call [`setOptions`](#setoptions) method and make the transition run. It works the same as:

```js
transition.setOptions(options).on();
```

### `off`

```js
self = transition.off([force])
```

Make the transition run to become the initial CSS property.  
If a function is specified for the [`procToOff`](#options-proctoon-proctooff) option, it is called. Then, a timer is started for events.

If `true` is specified for `force` argument, change the state immediately without the transition. For example, this is used to hide something immediately.  
The `procToOff` function is called with `force` argument. Then, `timedTransitionCancel` event is fired if the transition is running now, and other events are not fired.

### `setOptions`

```js
self = transition.setOptions(options)
```

Set one or more options.  
The `options` argument is an Object that can have properties as [options](#options).

## Options

### <a name="options-property"></a>`property`

*Type:* number or string  
*Default:* A value that is got by `0` when constructing instance

A value that is set to `propertyName` property of [Event object](https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent) that is passed to event listeners.

If a number is specified, a value is got from current [CSS `transition-property` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-property) of the element. The number indicates an index of the list that is the CSS value.  
For example:

```css
#target {
  transition-property: margin-left, opacity, color;
}
```

```js
var transition = new TimedTransition(element);
// Initially `margin-left` (index: 0) is got, by default.
// Specify `{property: 1}` for second argument if `opacity` is required.

transition.property = 1; // `opacity` is got and set.
transition.property = 2; // `color` is got and set.
```

If a string is specified, the string itself is set regardless of current CSS `transition-property` property of the element. For example, this is used to set something to the Event object, or specify a value when the CSS `transition-property` property is `all` that can not be resolved.

### <a name="options-duration"></a>`duration`

*Type:* number or string  
*Default:* A value that is got by `0` when constructing instance

A value as [CSS `transition-duration` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration). This is used to control timing for events.  
This can be a number or a string and it is parsed by the same way as [`property`](#options-property) option.

### <a name="options-delay"></a>`delay`

*Type:* number or string  
*Default:* A value that is got by `0` when constructing instance

A value as [CSS `transition-delay` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay). This is used to control timing for events. This might be a negative value.  
This can be a number or a string and it is parsed by the same way as [`property`](#options-property) option.

### <a name="options-proctoon-proctooff"></a>`procToOn`, `procToOff`

*Type:* function or `undefined`  
*Default:* `undefined`

Functions to change a CSS property that is animated. The `procToOn` function is called by [`on`](#on) method, and the `procToOff` function is called by [`off`](#off) method.  
These are used to get the timing of the events right with the transition. Therefore, changing the CSS property in these functions is better than changing it at other point.

These functions might be passed `true` for `force` argument that is first argument. That is `force` argument that is passed to [`on`](#on) or [`off`](#off) method. The `true` means that changing the CSS property immediately without the transition is required.

In the functions, `this` refers to the current TimedTransition instance.

For example:

```js
transition.setOptions({
  procToOn: function(force) {
    this.element.style.transitionProperty = force ? 'none' : 'margin-left';
    // Or, this.element.style.transitionDuration = force ? '0' : '3s';
    this.element.style.marginLeft = '600px';
  },
  procToOff: function(force) {
    this.element.style.transitionProperty = force ? 'none' : 'margin-left';
    this.element.style.marginLeft = '0';
  }
});
```

Note that you should consider cross-browser compatibility if you will use CSS `transition-*` properties or `element.classList`. See "[Cross-Browser](#cross-browser)".

### <a name="options-pseudoelement"></a>`pseudoElement`

*Type:* string  
*Default:* `''`

A string that is set to `pseudoElement` property of [Event object](https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent) that is passed to event listeners.  
It starting with `'::'`, containing the name of the pseudo-element the animation runs on.

## Properties

### `state`

*Type:* number  
*Read-only*

A number to indicate current state of the TimedTransition instance.  
It is one of the following static constant values:

- `TimedTransition.STATE_STOPPED` (`0`): The transition is not running.
- `TimedTransition.STATE_DELAYING` (`1`): The transition is waiting until the [`delay`](#options-delay) elapses.
- `TimedTransition.STATE_PLAYING` (`2`): The transition is playing, to the forward or the reverse.

For example:

```js
startButton.addEventListener('click', function() {
  if (transition.state === TimedTransition.STATE_STOPPED) {
    transition.on();
  }
}, false);
```

### `isReversing`

*Type:* boolean  
*Read-only*

When the transition is playing, indicate that the animation runs to the reverse.  
Note that It's meaningless when the transition is not playing.

### `element`

*Type:* Element  
*Read-only*

Reference to the element that is passed to the [constructor](#constructor).

### `property`

Get or set [`property`](#options-property) option.

### `duration`

Get or set [`duration`](#options-duration) option.

### `delay`

Get or set [`delay`](#options-delay) option.

### `procToOn`, `procToOff`

Get or set [`procToOn`, `procToOff`](#options-proctoon-proctooff) options.

### `pseudoElement`

Get or set [`pseudoElement`](#options-pseudoelement) option.

## Supported Transition Events

TimedTransition fires the Transition Events correctly according to [standard specification](https://drafts.csswg.org/css-transitions/#event-transitionevent), and each event type is prefixed with `timed`.

- `timedTransitionRun`
- `timedTransitionStart`
- `timedTransitionEnd`
- `timedTransitionCancel`

Also, an [Event object](https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent) that is passed to event listeners has properties according to standard specification, in addition, it has `timedTransition` property that refers to the current TimedTransition instance.

- `propertyName`
- `pseudoElement`
- `elapsedTime`
- `bubbles`
- `cancelable`
- `timedTransition`

For example:

```js
element.addEventListener('timedTransitionStart', function(event) {
  if (event.propertyName === 'margin-left') {
    console.log('I am moving to the ' +
      (event.timedTransition.isReversing ? 'left' : 'right') + '!');
  }
}, true);
```

## Browsers and Problems

- Blink (Google Chrome and others) doesn't support any Transition Events except `transitionend`.
- Webkit (Apple Safari and others) doesn't support any Transition Events except `transitionend`.
- Microsoft Edge and Trident (Microsoft Internet Explorer) don't support `transitionrun` and `transitioncancel` Transition Events.
- The animation might not start immediately even if `transition-delay` is zero, and `transitionend` event is not fired even if you make the playing direction turn at this time. This problem will be solved by `transitionstart` event but Blink doesn't support it, and any event is not fired.
- In Gecko (Mozilla Firefox and others), if the playing direction that is the forward or the reverse is turned when CSS `opacity` property is being animated, only `transitioncancel` event is fired and the transition is aborted (`opacity` property is changed immediately).
- In Microsoft Edge and Trident, `transitionstart` event is not fired when the playing direction is turned.
- In Microsoft Edge and Trident, `transition-delay` is ignored when the playing direction is turned.
- In Microsoft Edge and Trident, incorrect value is set to `event.elapsedTime` when `transition-delay` has a negative value.
- In Microsoft Edge and Trident, the playing direction is not turned correctly when `transition-delay` has a negative value.
- In Trident, the playing direction is not turned correctly when CSS `opacity` property is being animated.
- And more...

## Cross-Browser

These may help you for cross-browser compatibility.

- [mClassList](https://github.com/anseki/m-class-list) for `classList`
- [CSSPrefix](https://github.com/anseki/cssprefix) for CSS properties
