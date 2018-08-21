/* exported utils */
/* eslint-env browser */
/* eslint no-var: off, prefer-arrow-callback: off, object-shorthand: off */

var utils = (function() {
  'use strict';

  var DEFAULT_INTERVAL = 10;

  function intervalExec(list) {
    var interval = 1, // default value for first
      index = -1;

    function execNext() {
      var fnc;
      while (++index <= list.length - 1) {
        if (typeof list[index] === 'number') {
          interval = list[index];
        } else if (typeof list[index] === 'function') {
          fnc = list[index];
          break;
        }
      }
      if (fnc) {
        setTimeout(function() {
          fnc();
          interval = DEFAULT_INTERVAL;
          execNext();
        }, interval);
      }
    }

    execNext();
  }

  /**
   * An object that is a log record.
   * @typedef {Object} rec
   * @property {number} time - From startTime, in milliseconds.
   * @property {number} state - instance.state
   * @property {boolean} isReversing - instance.isReversing
   * @property {string} message - A message other than event.
   * @property {string} evtType - event.type
   * @property {string} evtPropertyName - event.propertyName
   * @property {string} evtPseudoElement - event.pseudoElement
   * @property {number} evtElapsedTime - event.elapsedTime
   * @property {boolean} evtBubbles - event.bubbles
   * @property {boolean} evtCancelable - event.cancelable
   */

  var TOLERANCE = {time: 200, evtElapsedTime: 0.2},
    eventLog = [],
    TimedTransition = window.TimedTransition,
    startTime;

  function listener(event) {
    var curTime = Date.now() - startTime,
      instance = event.timedTransition;
    eventLog.push({
      time: curTime,
      state: instance.state,
      isReversing: instance.isReversing,
      evtType: event.type,
      evtPropertyName: event.propertyName,
      evtPseudoElement: event.pseudoElement,
      evtElapsedTime: event.elapsedTime,
      evtBubbles: event.bubbles,
      evtCancelable: event.cancelable
    });

    var timeText = ('00' + (curTime / 1000).toFixed(2)).substr(-5) + 's';
    console.log('%s [%s] <%s> propertyName: %s elapsedTime: %f',
      TimedTransition.STATE_TEXT[instance.state],
      timeText,
      event.type,
      event.propertyName,
      event.elapsedTime);
  }

  function addLog(message, instance) {
    var curTime = Date.now() - startTime;
    eventLog.push({
      time: curTime,
      state: instance.state,
      isReversing: instance.isReversing,
      message: message
    });

    var timeText = ('00' + (curTime / 1000).toFixed(2)).substr(-5) + 's';
    console.log('%s [%s] %s', TimedTransition.STATE_TEXT[instance.state], timeText, message);
  }

  function initLog() {
    eventLog.length = 0;
    startTime = Date.now();
    return startTime;
  }

  function setupListener(target) {
    ['Run', 'Start', 'End', 'Cancel'].forEach(function(type) {
      target.addEventListener('timedTransition' + type, listener, true);
    });
  }

  function getInstance(element) {
    return new TimedTransition(element, {
      procToOn: function(force) {
        var classList = window.mClassList(element);
        classList.toggle('force', force);
        classList.add('on');
      },
      procToOff: function(force) {
        var classList = window.mClassList(element);
        classList.toggle('force', force);
        classList.remove('on');
      }
    });
  }

  /*
  logArray = [
    [time, state, isReversing, evtType, evtElapsedTime],
    [time, state, isReversing, null, null, message],
    ...
  ]
  */
  function makeExpectedLog(propertyName, pseudoElement, bubbles, cancelable, logArray) {
    return logArray.reduce(function(expectedLog, recArray) {
      var recHash = ['time', 'state', 'isReversing', 'evtType', 'evtElapsedTime', 'message']
          .reduce(function(recHash, recKey, i) {
            recHash[recKey] = recArray[i];
            return recHash;
          }, {}),
        rec = {
          // Common
          time: recHash.time,
          state: recHash.state,
          isReversing: recHash.isReversing
        };
      if (typeof recHash.message === 'string') {
        rec.message = recHash.message;
      } else {
        rec.evtType = recHash.evtType;
        rec.evtElapsedTime = recHash.evtElapsedTime;
        // Static
        rec.evtPropertyName = propertyName;
        rec.evtPseudoElement = pseudoElement;
        rec.evtBubbles = bubbles;
        rec.evtCancelable = cancelable;
      }
      expectedLog.push(rec);
      return expectedLog;
    }, []);
  }

  var types = {
    time: 'number',
    state: 'number',
    isReversing: 'boolean',
    message: 'string',
    evtType: 'string',
    evtPropertyName: 'string',
    evtPseudoElement: 'string',
    evtElapsedTime: 'number',
    evtBubbles: 'boolean',
    evtCancelable: 'boolean'
  };
  function toBeEventLog(actual, expected) {
    if (!Array.isArray(actual)) { return {pass: false, message: '`actual` is not Array'}; }
    if (!Array.isArray(expected)) { return {pass: false, message: '`expected` is not Array'}; }

    var recLen = Math.max(actual.length, expected.length);
    for (var i = 0; i < recLen; i++) {
      var acRec = actual[i],
        exRec = expected[i];
      if (!acRec) { return {pass: false, message: '`actual[' + i + ']` is not record'}; }
      if (!exRec) { return {pass: false, message: '`expected[' + i + ']` is not record'}; }

      var recKeys = ['time', 'state'].concat(
          exRec.state === TimedTransition.STATE_PLAYING ? ['isReversing'] : []
        ).concat(
          typeof exRec.message === 'string' ? ['message'] :
          ['evtType', 'evtPropertyName', 'evtPseudoElement',
            'evtElapsedTime', 'evtBubbles', 'evtCancelable']
        ),
        keysLen = recKeys.length;

      for (var j = 0; j < keysLen; j++) {
        var recKey = recKeys[j],
          acValue = acRec[recKey],
          exValue = exRec[recKey];
        // Type
        if ((typeof acValue) !== types[recKey]) {
          return {pass: false,
            message: '`actual[' + i + '].' + recKey + '`: `' +
              acValue + '`(' + (typeof acValue) + ') is not ' + types[recKey]};
        }
        if ((typeof exValue) !== types[recKey]) {
          return {pass: false,
            message: '`expected[' + i + '].' + recKey + '`: `' +
              exValue + '`(' + (typeof exValue) + ') is not ' + types[recKey]};
        }
        // Near number
        if (TOLERANCE[recKey]) {
          if (Math.abs(acValue - exValue) > TOLERANCE[recKey]) {
            return {pass: false,
              message: 'There is the difference between `actual[' + i + '].' + recKey + '`: `' +
                acValue + '` and `expected[' + i + '].' + recKey + '`: `' + exValue + '`.'};
          }
        } else if (acValue !== exValue) {
          return {pass: false,
            message: '`actual[' + i + '].' + recKey + '`: `' +
              acValue + '` is not `expected[' + i + '].' + recKey + '`: `' + exValue + '`.'};
        }
      }
    }

    return {pass: true};
  }

  var customMatchers = {
    toBeEventLog: function() { return {compare: toBeEventLog}; }
  };

  return {
    intervalExec: intervalExec,
    eventLog: eventLog,
    addLog: addLog,
    initLog: initLog,
    setupListener: setupListener,
    getInstance: getInstance,
    makeExpectedLog: makeExpectedLog,
    customMatchers: customMatchers
  };
})();
