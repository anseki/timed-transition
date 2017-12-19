
describe('flow', function() {
  'use strict';

  var window, document, utils, TimedTransition, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/flow.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      TimedTransition = window.TimedTransition;
      pageDone = done;

      jasmine.addMatchers(utils.customMatchers);

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  describe('no delay', function() {
    var timedTransition;

    beforeAll(function(done) {
      var element = document.getElementById('target-nodelay');
      timedTransition = utils.getInstance(element);
      utils.setupListener(element);
      done();
    });

    it('play', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
              [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
              [5000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 + 100);

      }, 100);
    }, 5000 + 1000);

    it('revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
              [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
              [5000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 + 100);

      }, 100);
    }, 5000 + 1000);

    it('play -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
                [2000, TimedTransition.STATE_PLAYING, false, null, null, 'OFF'],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [2000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [2000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
                [4000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 2000 + 100);
        }, 2000);

      }, 100);
    }, 2000 + 2000 + 1000);

    it('revers -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
                [2000, TimedTransition.STATE_PLAYING, true, null, null, 'ON'],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [2000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [2000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
                [4000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 2000 + 100);
        }, 2000);

      }, 100);
    }, 2000 + 2000 + 1000);
  });

  describe('delay: 3s', function() {
    var timedTransition;

    beforeAll(function(done) {
      var element = document.getElementById('target-delay-3s');
      timedTransition = utils.getInstance(element);
      utils.setupListener(element);
      done();
    });

    it('delay -> play', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
              [3000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
              [8000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 3000 + 5000 + 100);

      }, 100);
    }, 3000 + 5000 + 1000);

    it('delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
              [3000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
              [8000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 3000 + 5000 + 100);

      }, 100);
    }, 3000 + 5000 + 1000);

    it('delay -> play -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [3000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
                [5000, TimedTransition.STATE_PLAYING, false, null, null, 'OFF'],
                [5000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [5000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [8000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
                [10000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 3000 + 2000 + 100);
        }, 3000 + 2000);

      }, 100);
    }, 3000 + 2000 + 3000 + 2000 + 1000);

    it('delay -> revers -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [3000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 0],
                [5000, TimedTransition.STATE_PLAYING, true, null, null, 'ON'],
                [5000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [5000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [8000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 0],
                [10000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 3000 + 2000 + 100);
        }, 3000 + 2000);

      }, 100);
    }, 3000 + 2000 + 3000 + 2000 + 1000);

    it('delay(before play) -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [2000, TimedTransition.STATE_DELAYING, null, null, null, 'OFF'],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, 100);
        }, 3000 - 1000);

      }, 100);
    }, 3000 - 1000 + 1000);

    it('delay(before revers) -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 0],
                [2000, TimedTransition.STATE_DELAYING, null, null, null, 'ON'],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, 100);
        }, 3000 - 1000);

      }, 100);
    }, 3000 - 1000 + 1000);
  });

  describe('delay: -3s', function() {
    var timedTransition;

    beforeAll(function(done) {
      var element = document.getElementById('target-delay-m3s');
      timedTransition = utils.getInstance(element);
      utils.setupListener(element);
      done();
    });

    it('nega-delay -> play', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
              [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 3],
              [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 - 3000 + 100);

      }, 100);
    }, 5000 - 3000 + 1000);

    it('nega-delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
              [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 3],
              [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 - 3000 + 100);

      }, 100);
    }, 5000 - 3000 + 1000);

    it('nega-delay -> play -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
                [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 3],
                [1000, TimedTransition.STATE_PLAYING, false, null, null, 'OFF'],
                [1000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 4],
                [1000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
                [1000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 3],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 4]
              ]));

            done();
          }, 1000 + 100);
        }, 5000 - 3000 - 1000);

      }, 100);
    }, 5000 - 3000 - 1000 + 1000 + 1000);

    it('nega-delay -> revers -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
                [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 3],
                [1000, TimedTransition.STATE_PLAYING, true, null, null, 'ON'],
                [1000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 4],
                [1000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 3],
                [1000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 3],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 4]
              ]));

            done();
          }, 1000 + 100);
        }, 5000 - 3000 - 1000);

      }, 100);
    }, 5000 - 3000 - 1000 + 1000 + 1000);
  });

  describe('delay: -1s', function() {
    var timedTransition;

    beforeAll(function(done) {
      var element = document.getElementById('target-delay-m1s');
      timedTransition = utils.getInstance(element);
      utils.setupListener(element);
      done();
    });

    it('nega-delay -> play', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
              [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 1],
              [4000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 - 1000 + 100);

      }, 100);
    }, 5000 - 1000 + 1000);

    it('nega-delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
              [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
              [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 1],
              [4000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 5]
            ]));

          done();
        }, 5000 - 1000 + 100);

      }, 100);
    }, 5000 - 1000 + 1000);

    it('nega-delay -> play -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 1],
                [1000, TimedTransition.STATE_PLAYING, false, null, null, 'OFF'],
                [1000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [1000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [1000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 1],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 1000 + 100);
        }, 5000 - 1000 - 3000);

      }, 100);
    }, 5000 - 1000 - 3000 + 1000 + 1000);

    it('nega-delay -> revers -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 1],
                [1000, TimedTransition.STATE_PLAYING, true, null, null, 'ON'],
                [1000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 2],
                [1000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [1000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 1],
                [2000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 2]
              ]));

            done();
          }, 1000 + 100);
        }, 5000 - 1000 - 3000);

      }, 100);
    }, 5000 - 1000 - 3000 + 1000 + 1000);

    it('nega-delay -> play -> turn (2)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [0, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 1],
                [3000, TimedTransition.STATE_PLAYING, false, null, null, 'OFF'],
                [3000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 4],
                [3000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [3000, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 1],
                [6000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 4]
              ]));

            done();
          }, 3000 + 100);
        }, 5000 - 1000 - 1000);

      }, 100);
    }, 5000 - 1000 - 1000 + 3000 + 1000);

    it('nega-delay -> revers -> turn (2)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [0, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [0, TimedTransition.STATE_PLAYING, true, 'timedTransitionStart', 1],
                [3000, TimedTransition.STATE_PLAYING, true, null, null, 'ON'],
                [3000, TimedTransition.STATE_STOPPED, null, 'timedTransitionCancel', 4],
                [3000, TimedTransition.STATE_DELAYING, null, 'timedTransitionRun', 1],
                [3000, TimedTransition.STATE_PLAYING, false, 'timedTransitionStart', 1],
                [6000, TimedTransition.STATE_STOPPED, null, 'timedTransitionEnd', 4]
              ]));

            done();
          }, 3000 + 100);
        }, 5000 - 1000 - 1000);

      }, 100);
    }, 5000 - 1000 - 1000 + 3000 + 1000);
  });

  describe('delay: -8s', function() {
    var timedTransition;

    beforeAll(function(done) {
      var element = document.getElementById('target-delay-m8s');
      timedTransition = utils.getInstance(element);
      utils.setupListener(element);
      done();
    });

    it('nega-delay(over duration) -> play', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON']
            ]));

          done();
        }, 100);

      }, 100);
    }, 1000);

    it('nega-delay(over duration) -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.traceLog).toBeTraceLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF']
            ]));

          done();
        }, 100);

      }, 100);
    }, 1000);

    it('nega-delay(over duration) -> play -> turn', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'ON'],
                [1000, TimedTransition.STATE_STOPPED, null, null, null, 'OFF']
              ]));

            done();
          }, 100);
        }, 5000 - 3000 - 1000);

      }, 100);
    }, 5000 - 3000 - 1000 + 1000);

    it('nega-delay(over duration) -> revers -> turn', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(utils.traceLog).toBeTraceLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, TimedTransition.STATE_STOPPED, null, null, null, 'OFF'],
                [1000, TimedTransition.STATE_STOPPED, null, null, null, 'ON']
              ]));

            done();
          }, 100);
        }, 5000 - 3000 - 1000);

      }, 100);
    }, 5000 - 3000 - 1000 + 1000);
  });
});
