
describe('flow', function() {
  'use strict';

  var window, document, utils, TimedTransition, traceLog, pageDone,
    STATE_STOPPED, STATE_DELAYING, STATE_PLAYING;

  beforeAll(function(beforeDone) {
    loadPage('spec/flow.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      TimedTransition = window.TimedTransition;
      traceLog = TimedTransition.traceLog;
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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:0',
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + DURATION,
            '</finishDelaying>',

            '</on>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:' + DURATION,
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + DURATION,
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + DURATION,
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + DURATION,
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + DURATION,
            '</finishDelaying>',

            '</off>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + DURATION,
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + DURATION,
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:0', 'currentPosition:' + LESS_PLAY,
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + LESS_PLAY,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + LESS_PLAY,
              '</finishDelaying>',

              '</off>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + LESS_PLAY,
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + DURATION, 'currentPosition:' + (DURATION - LESS_PLAY),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (DURATION - LESS_PLAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - (DURATION - LESS_PLAY)),
              '</finishDelaying>',

              '</on>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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

    it('play(force)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('ON(force)', timedTransition);
        timedTransition.on(true);

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:true',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            'STOP(force)',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</on>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON(force)']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);

    it('play -> play(force)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</on>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:true',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:0',
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

    it('revers -> play(force)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:true',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

    it('revers(force)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('OFF(force)', timedTransition);
        timedTransition.off(true);

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:true',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            'STOP(force)',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</off>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF(force)']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);

    it('revers -> revers(force)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</off>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:true',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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

    it('play -> revers(force)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:true',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:0',
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:0',
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'type:timedTransitionRun',
            '</fireEvent>',

            '</on>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:0',
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + DURATION,
            '</finishDelaying>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:0',
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:0',
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:' + DURATION,
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
            'type:timedTransitionRun',
            '</fireEvent>',

            '</off>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:' + DURATION,
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + DURATION,
            '</finishDelaying>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:' + DURATION,
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
            'currentPosition:' + DURATION,
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:0', 'currentPosition:' + LESS_PLAY,
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:0',
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:0',
              'currentPosition:' + LESS_PLAY,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + LESS_PLAY,
              '</finishDelaying>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + LESS_PLAY,
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + LESS_PLAY,
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + DURATION, 'currentPosition:' + (DURATION - LESS_PLAY),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:0',
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:0',
              'currentPosition:' + (DURATION - LESS_PLAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - (DURATION - LESS_PLAY)),
              '</finishDelaying>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + (logTime + DELAY + LESS_PLAY),
              'startTime:' + (logTime + DELAY + LESS_PLAY + DELAY),
              'currentPosition:' + (DURATION - LESS_PLAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',

              'STOP(DELAYING)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(DELAYING)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

    it('delay(before play) -> play(force)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:true',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

    it('delay(before play) -> revers(force)', function(done) {
      timedTransition.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:true',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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

    it('delay(before revers) -> play(force)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON(force)', timedTransition);
          timedTransition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:true',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

    it('delay(before revers) -> revers(force)', function(done) {
      timedTransition.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('OFF(force)', timedTransition);
          timedTransition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_DELAYING', 'force:true',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(force)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:0',
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + NDELAY,
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + (DURATION - NDELAY),
            '</finishDelaying>',

            '</on>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:' + DURATION,
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + DURATION,
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + (DURATION - NDELAY),
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + (DURATION - NDELAY),
            '</finishDelaying>',

            '</off>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + NDELAY,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + NDELAY, 'currentPosition:' + (NDELAY + LESS_PLAY),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (NDELAY + LESS_PLAY),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (NDELAY + LESS_PLAY - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (NDELAY + LESS_PLAY - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (NDELAY + LESS_PLAY - NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (NDELAY + LESS_PLAY - NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + (DURATION - NDELAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY + NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY + NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - (DURATION - NDELAY - LESS_PLAY + NDELAY)),
              '</finishDelaying>',

              '</on>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY + NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY + NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:0',
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + NDELAY,
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + (DURATION - NDELAY),
            '</finishDelaying>',

            '</on>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'currentPosition:' + DURATION,
            'CANCEL', '</fixCurrentPosition>',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            'state:STATE_DELAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + DURATION,
            'type:timedTransitionRun',
            '</fireEvent>',

            '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:0',
            'currentPosition:' + (DURATION - NDELAY),
            'state:STATE_PLAYING',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'type:timedTransitionStart',
            '</fireEvent>',

            'durationLeft:' + (DURATION - NDELAY),
            '</finishDelaying>',

            '</off>',

            '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'state:STATE_STOPPED',

            '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
            'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
            'currentPosition:' + (DURATION - NDELAY),
            'type:timedTransitionEnd',
            '</fireEvent>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</finishPlaying>'
          ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + NDELAY,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + NDELAY, 'currentPosition:' + (NDELAY + LESS_PLAY1),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (NDELAY + LESS_PLAY1),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY1),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY1 - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (NDELAY + LESS_PLAY1 - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (NDELAY + LESS_PLAY1 - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (NDELAY + LESS_PLAY1 - NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (NDELAY + LESS_PLAY1 - NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + (DURATION - NDELAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1 + NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1 + NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - (DURATION - NDELAY - LESS_PLAY1 + NDELAY)),
              '</finishDelaying>',

              '</on>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1 + NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY1), 'startTime:' + (logTime + LESS_PLAY1),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY1 + NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + NDELAY,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:' + NDELAY,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + NDELAY, 'currentPosition:' + (NDELAY + LESS_PLAY2),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (NDELAY + LESS_PLAY2),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY2),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:0',
              'currentPosition:' + (NDELAY + LESS_PLAY2 - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (NDELAY + LESS_PLAY2 - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (NDELAY + LESS_PLAY2 - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (NDELAY + LESS_PLAY2 - NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (NDELAY + LESS_PLAY2 - NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - NDELAY),
              '</finishDelaying>',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY),

              '<fixCurrentPosition>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'currentPosition:' + (DURATION - NDELAY),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2),
              '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2),
              'type:timedTransitionCancel',
              '</fireEvent>',

              '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2),
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:0',
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2 + NDELAY),
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2 + NDELAY),
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + (DURATION - (DURATION - NDELAY - LESS_PLAY2 + NDELAY)),
              '</finishDelaying>',

              '</on>',

              '<finishPlaying>', '_id:' + timedTransition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2 + NDELAY),
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + (logTime + LESS_PLAY2), 'startTime:' + (logTime + LESS_PLAY2),
              'currentPosition:' + (DURATION - NDELAY - LESS_PLAY2 + NDELAY),
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

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
      DURATION = 5000,
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
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

            'STOP(over-duration)',

            '<abort>', '_id:' + timedTransition._id, 'isOn:false',
            'CANCEL', '</abort>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
            'state:STATE_STOPPED',

            '</on>'
          ]);

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
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

            'STOP(over-duration)',

            '<abort>', '_id:' + timedTransition._id, 'isOn:true',
            'CANCEL', '</abort>',

            '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
            'state:STATE_STOPPED',

            '</off>'
          ]);

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
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('ON', timedTransition);
        timedTransition.on();

        setTimeout(function() {
          utils.addLog('OFF', timedTransition);
          timedTransition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              'STOP(over-duration)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>',

              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(over-duration)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>'
            ]);

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
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('OFF', timedTransition);
        timedTransition.off();

        setTimeout(function() {
          utils.addLog('ON', timedTransition);
          timedTransition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(over-duration)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:true',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</off>',

              '<on>', '_id:' + timedTransition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              'STOP(over-duration)',

              '<abort>', '_id:' + timedTransition._id, 'isOn:false',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + timedTransition._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</on>'
            ]);

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

  describe('Other cases', function() {
    var timedTransitionNodelay, timedTransitionDelay3s,
      DURATION = 5000, DURATION_S = DURATION / 1000,
      DELAY = 3000,
      LESS_DELAY = DELAY - 1000,
      LESS_PLAY = 2000,
      WAIT = 1000;

    beforeAll(function(done) {
      var elementNodelay = document.getElementById('target-nodelay'),
        elementDelay3s = document.getElementById('target-delay-3s');
      timedTransitionNodelay = utils.getInstance(elementNodelay);
      utils.setupListener(elementNodelay);
      timedTransitionDelay3s = utils.getInstance(elementDelay3s);
      utils.setupListener(elementDelay3s);
      done();
    });

    it('play -> play', function(done) {
      timedTransitionNodelay.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransitionNodelay);
        timedTransitionNodelay.on();

        setTimeout(function() {
          utils.addLog('ON', timedTransitionNodelay);
          timedTransitionNodelay.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransitionNodelay._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransitionNodelay._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</on>',

              '<on>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'CANCEL', '</on>',

              '<finishPlaying>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransitionNodelay._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, false, null, null, 'ON'],
                [DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
              ]));

            done();
          }, DURATION - LESS_PLAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, DURATION + 1000);

    it('revers -> revers', function(done) {
      timedTransitionNodelay.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransitionNodelay);
        timedTransitionNodelay.off();

        setTimeout(function() {
          utils.addLog('OFF', timedTransitionNodelay);
          timedTransitionNodelay.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransitionNodelay._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + timedTransitionNodelay._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</off>',

              '<off>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'CANCEL', '</off>',

              '<finishPlaying>', '_id:' + timedTransitionNodelay._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransitionNodelay._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [0, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [LESS_PLAY, STATE_PLAYING, true, null, null, 'OFF'],
                [DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
              ]));

            done();
          }, DURATION - LESS_PLAY + 100);
        }, LESS_PLAY);

      }, 100);
    }, DURATION + 1000);

    it('delay(before play) -> play', function(done) {
      timedTransitionDelay3s.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('ON', timedTransitionDelay3s);
        timedTransitionDelay3s.on();

        setTimeout(function() {
          utils.addLog('ON', timedTransitionDelay3s);
          timedTransitionDelay3s.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransitionDelay3s._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '</on>',

              '<on>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING', 'force:false',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'CANCEL', '</on>',

              '<finishDelaying>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '<finishPlaying>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:0',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:0',
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransitionDelay3s._id, 'isOn:true',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'ON'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'ON'],
                [DELAY, STATE_PLAYING, false, 'timedTransitionStart', 0],
                [DELAY + DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
              ]));

            done();
          }, DELAY + DURATION - LESS_DELAY + 100);
        }, LESS_DELAY);

      }, 100);
    }, DELAY + DURATION + 1000);

    it('delay(before revers) -> revers', function(done) {
      timedTransitionDelay3s.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        var logTime = TimedTransition.roundTime(Date.now());
        utils.initLog();

        utils.addLog('OFF', timedTransitionDelay3s);
        timedTransitionDelay3s.off();

        setTimeout(function() {
          utils.addLog('OFF', timedTransitionDelay3s);
          timedTransitionDelay3s.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + timedTransitionDelay3s._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '</off>',

              '<off>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING', 'force:false',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'CANCEL', '</off>',

              '<finishDelaying>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0', 'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '<finishPlaying>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + DURATION,
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + timedTransitionDelay3s._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + (logTime + DELAY),
              'currentPosition:' + DURATION,
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + timedTransitionDelay3s._id, 'isOn:false',
              'state:STATE_STOPPED',

              '</finishPlaying>'
            ]);

            expect(utils.eventLog).toBeEventLog(
              utils.makeExpectedLog('margin-left', '', true, false, [
                // [time, state, isReversing, evtType, evtElapsedTime],
                // [time, state, isReversing, null, null, message],
                [0, STATE_STOPPED, null, null, null, 'OFF'],
                [0, STATE_DELAYING, null, 'timedTransitionRun', 0],
                [LESS_DELAY, STATE_DELAYING, null, null, null, 'OFF'],
                [DELAY, STATE_PLAYING, true, 'timedTransitionStart', 0],
                [DELAY + DURATION, STATE_STOPPED, null, 'timedTransitionEnd', DURATION_S]
              ]));

            done();
          }, DELAY + DURATION - LESS_DELAY + 100);
        }, LESS_DELAY);

      }, 100);
    }, DELAY + DURATION + 1000);

    it('play after play', function(done) {
      timedTransitionNodelay.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('ON', timedTransitionNodelay);
        timedTransitionNodelay.on();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,
            'CANCEL', '</on>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);

    it('revers after revers', function(done) {
      timedTransitionNodelay.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('OFF', timedTransitionNodelay);
        timedTransitionNodelay.off();

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:false',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',
            'CANCEL', '</off>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);

    it('play(force) after play', function(done) {
      timedTransitionNodelay.on(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('ON(force)', timedTransitionNodelay);
        timedTransitionNodelay.on(true);

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<on>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:true',
            'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,
            'CANCEL', '</on>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'ON(force)']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);

    it('revers(force) after revers', function(done) {
      timedTransitionNodelay.off(true);
      setTimeout(function() {
        traceLog.length = 0;
        utils.initLog();

        utils.addLog('OFF(force)', timedTransitionNodelay);
        timedTransitionNodelay.off(true);

        setTimeout(function() {
          expect(traceLog).toEqual([
            '<off>', '_id:' + timedTransitionNodelay._id, 'state:STATE_STOPPED', 'force:true',
            'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',
            'CANCEL', '</off>'
          ]);

          expect(utils.eventLog).toBeEventLog(
            utils.makeExpectedLog('margin-left', '', true, false, [
              // [time, state, isReversing, evtType, evtElapsedTime],
              // [time, state, isReversing, null, null, message],
              [0, STATE_STOPPED, null, null, null, 'OFF(force)']
            ]));

          done();
        }, WAIT + 100);

      }, 100);
    }, WAIT + 1000);
  });
});
