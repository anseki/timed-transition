
describe('flow', function() {
  'use strict';

  var window, document, utils, TimedTransition, pageDone,
    STATE_STOPPED, STATE_DELAYING, STATE_PLAYING;

  beforeAll(function(beforeDone) {
    loadPage('spec/flow.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      TimedTransition = window.TimedTransition;
      STATE_STOPPED = TimedTransition.STATE_STOPPED;
      STATE_DELAYING = TimedTransition.STATE_DELAYING;
      STATE_PLAYING = TimedTransition.STATE_PLAYING;

      jasmine.addMatchers(utils.customMatchers);

      pageDone = done;
      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  describe('no delay', function() {
    var timedTransition,
      DURATION = 5000, DURATION_S = DURATION / 1000,
      LESS_PLAY = 2000, LESS_PLAY_S = LESS_PLAY / 1000,
      WAIT = 1000;

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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
              [0, STATE_PLAYING, false, 'timedTransitionStart', 0],
              [DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION + 100);

      }, 100);
    }, DURATION + 1000);

    it('revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
              [0, STATE_PLAYING, true, 'timedTransitionStart', 0],
              [DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION + 100);

      }, 100);
    }, DURATION + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, false, null, null, 'OFF'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S],
                [LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_PLAY, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [LESS_PLAY + LESS_PLAY, STATE_STOPPED, null, 'timedTransitionEnd', LESS_PLAY_S]
              ]));

            done();
          }, LESS_PLAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + LESS_PLAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, true, null, null, 'ON'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S],
                [LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_PLAY, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [LESS_PLAY + LESS_PLAY, STATE_STOPPED, null, 'timedTransitionEnd', LESS_PLAY_S]
              ]));

            done();
          }, LESS_PLAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + LESS_PLAY + 1000);

    it('play -> cancel(on)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, false, null, null, 'ON(force)'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S]
              ]));

            done();
          }, WAIT);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + WAIT + 1000);

    it('play -> cancel(off)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, false, null, null, 'OFF(force)'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S]
              ]));

            done();
          }, WAIT);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + WAIT + 1000);

    it('revers -> cancel(on)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, true, null, null, 'ON(force)'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S]
              ]));

            done();
          }, WAIT);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + WAIT + 1000);

    it('revers -> cancel(off)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, true, null, null, 'OFF(force)'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S]
              ]));

            done();
          }, WAIT);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + WAIT + 1000);
  });

  describe('delay: 3s', function() {
    var timedTransition,
      DURATION = 5000, DURATION_S = DURATION / 1000,
      DELAY = 3000,
      LESS_DELAY = DELAY - 1000,
      LESS_PLAY = 2000, LESS_PLAY_S = LESS_PLAY / 1000,
      WAIT = 1000;

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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
              [DELAY, STATE_PLAYING, false, 'timedTransitionStart', 0],
              [DELAY + DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DELAY + DURATION + 100);

      }, 100);
    }, DELAY + DURATION + 1000);

    it('delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
              [DELAY, STATE_PLAYING, true, 'timedTransitionStart', 0],
              [DELAY + DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DELAY + DURATION + 100);

      }, 100);
    }, DELAY + DURATION + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [DELAY, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [DELAY + LESS_PLAY, STATE_PLAYING, false, null, null, 'OFF'],
                [DELAY + LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S],
                [DELAY + LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [DELAY + LESS_PLAY + DELAY, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [DELAY + LESS_PLAY + DELAY + LESS_PLAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', LESS_PLAY_S]
              ]));

            done();
          }, DELAY + LESS_PLAY + 100);
        }, DELAY + LESS_PLAY);

      }, 100);
    }, DELAY + LESS_PLAY + DELAY + LESS_PLAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [DELAY, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [DELAY + LESS_PLAY, STATE_PLAYING, true, null, null, 'ON'],
                [DELAY + LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', LESS_PLAY_S],
                [DELAY + LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [DELAY + LESS_PLAY + DELAY, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [DELAY + LESS_PLAY + DELAY + LESS_PLAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', LESS_PLAY_S]
              ]));

            done();
          }, DELAY + LESS_PLAY + 100);
        }, DELAY + LESS_PLAY);

      }, 100);
    }, DELAY + LESS_PLAY + DELAY + LESS_PLAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'OFF'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'ON'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);

    it('delay(before play) -> cancel(on)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'ON(force)'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);

    it('delay(before play) -> cancel(off)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'OFF(force)'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);

    it('delay(before revers) -> cancel(on)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'ON(force)'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);

    it('delay(before revers) -> cancel(off)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'OFF(force)'],
                [LESS_DELAY, STATE_STOPPED, null, 'timedTransitionCancel', 0]
              ]));

            done();
          }, WAIT);
        }, LESS_DELAY);

      }, 100);
    }, LESS_DELAY + WAIT + 1000);
  });

  describe('delay: -3s', function() {
    var timedTransition,
      DURATION = 5000, DURATION_S = DURATION / 1000,
      NDELAY = 3000, NDELAY_S = NDELAY / 1000,
      LESS_PLAY = 1000, LESS_PLAY_S = LESS_PLAY / 1000;

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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
              [0, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
              [DURATION - NDELAY, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION - NDELAY + 100);

      }, 100);
    }, DURATION - NDELAY + 1000);

    it('nega-delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
              [0, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
              [DURATION - NDELAY, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION - NDELAY + 100);

      }, 100);
    }, DURATION - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY, STATE_PLAYING, false, null, null, 'OFF'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY_S],
                [LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY + NDELAY + LESS_PLAY - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + NDELAY + LESS_PLAY - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY, STATE_PLAYING, true, null, null, 'ON'],
                [LESS_PLAY, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY_S],
                [LESS_PLAY, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY + NDELAY + LESS_PLAY - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, LESS_PLAY + NDELAY + LESS_PLAY - NDELAY + 1000);
  });

  describe('delay: -1s', function() {
    var timedTransition,
      DURATION = 5000, DURATION_S = DURATION / 1000,
      NDELAY = 1000, NDELAY_S = NDELAY / 1000,
      LESS_PLAY1 = 1000, LESS_PLAY1_S = LESS_PLAY1 / 1000,
      LESS_PLAY2 = 3000, LESS_PLAY2_S = LESS_PLAY2 / 1000;

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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
              [0, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
              [DURATION - NDELAY, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION - NDELAY + 100);

      }, 100);
    }, DURATION - NDELAY + 1000);

    it('nega-delay -> revers', function(done) {
      timedTransition.on(true);
      setTimeout(function() {

        utils.initLog();
        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF'],
              [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
              [0, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
              [DURATION - NDELAY, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
            ]));

          done();
        }, DURATION - NDELAY + 100);

      }, 100);
    }, DURATION - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY1, STATE_PLAYING, false, null, null, 'OFF'],
                [LESS_PLAY1, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY1_S],
                [LESS_PLAY1, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY1, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY1 + NDELAY + LESS_PLAY1 - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY1_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY1 /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY1);

      }, 100);
    }, LESS_PLAY1 + NDELAY + LESS_PLAY1 - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY1, STATE_PLAYING, true, null, null, 'ON'],
                [LESS_PLAY1, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY1_S],
                [LESS_PLAY1, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY1, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY1 + NDELAY + LESS_PLAY1 - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY1_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY1 /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY1);

      }, 100);
    }, LESS_PLAY1 + NDELAY + LESS_PLAY1 - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY2, STATE_PLAYING, false, null, null, 'OFF'],
                [LESS_PLAY2, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY2_S],
                [LESS_PLAY2, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY2, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY2 + NDELAY + LESS_PLAY2 - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY2_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY2 /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY2);

      }, 100);
    }, LESS_PLAY2 + NDELAY + LESS_PLAY2 - NDELAY + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [0, STATE_PLAYING, true, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY2, STATE_PLAYING, true, null, null, 'ON'],
                [LESS_PLAY2, STATE_STOPPED, null, 'timedTransitionCancel', NDELAY_S + LESS_PLAY2_S],
                [LESS_PLAY2, STATE_DELAYING, null, 'timedTransitionRun', NDELAY_S],
                [LESS_PLAY2, STATE_PLAYING, false, 'timedTransitionStart', NDELAY_S],
                [LESS_PLAY2 + NDELAY + LESS_PLAY2 - NDELAY,
                  STATE_STOPPED, null, 'timedTransitionEnd', NDELAY_S + LESS_PLAY2_S]
              ]));

            done();
          }, NDELAY + LESS_PLAY2 /* <- turning position */ - NDELAY + 100);
        }, LESS_PLAY2);

      }, 100);
    }, LESS_PLAY2 + NDELAY + LESS_PLAY2 - NDELAY + 1000);
  });

  describe('delay: -8s', function() {
    var timedTransition,
      WAIT = 1000;

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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON']
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
          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF']
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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [WAIT, STATE_STOPPED, null, null, null, 'OFF']
              ]));

            done();
          }, WAIT);
        }, WAIT);

      }, 100);
    }, WAIT + WAIT + 1000);

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
            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [WAIT, STATE_STOPPED, null, null, null, 'ON']
              ]));

            done();
          }, WAIT);
        }, WAIT);

      }, 100);
    }, WAIT + WAIT + 1000);
  });
});
