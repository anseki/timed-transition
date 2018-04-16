describe('child window', function() {
  'use strict';

  var window, document, utils, TimedTransition, traceLog, insProps, pageDone,
    frame, frameWindow, frameDocument,
    STATE_STOPPED, STATE_DELAYING, STATE_PLAYING,
    avoidList;

  beforeAll(function(beforeDone) {
    loadPage('spec/window/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      TimedTransition = window.TimedTransition;
      traceLog = TimedTransition.traceLog;
      insProps = TimedTransition.insProps;
      STATE_STOPPED = TimedTransition.STATE_STOPPED;
      STATE_DELAYING = TimedTransition.STATE_DELAYING;
      STATE_PLAYING = TimedTransition.STATE_PLAYING;

      jasmine.addMatchers(utils.customMatchers);

      frame = document.getElementById('iframe1');
      frameWindow = frame.contentWindow;
      frameDocument = frame.contentDocument;

      pageDone = done;

      function childLoaded() {
        // for Webkit bug, getComputedStyle can't get list
        avoidList =
          frameWindow.getComputedStyle(frameDocument.getElementById('elm-duration-class'), '')
            .transitionDuration !== '1s, 2s';
        beforeDone();
      }
      // Wait for child frame
      if (frameDocument.readyState === 'complete') {
        childLoaded();
      } else {
        frameDocument.addEventListener('DOMContentLoaded', childLoaded, false);
      }
    });
  });

  afterAll(function() {
    pageDone();
  });

  describe('options', function() {

    describe('pseudoElement', function() {
      var transition;

      beforeAll(function(done) {
        transition = new TimedTransition(frameDocument.getElementById('elm-plain'));
        done();
      });

      it('default', function(done) {
        expect(transition.element).toBe(frameDocument.getElementById('elm-plain'));
        expect(transition.element.ownerDocument.defaultView).toBe(frameWindow);

        expect(transition.pseudoElement).toBe('');
        expect(insProps[transition._id].options.pseudoElement).toBe(''); // Passed value

        done();
      });

      it('Update - string', function(done) {
        transition.pseudoElement = '::2';
        expect(transition.pseudoElement).toBe('::2');
        expect(insProps[transition._id].options.pseudoElement).toBe('::2'); // Passed value

        done();
      });

      it('Update - another string', function(done) {
        transition.pseudoElement = '::5';
        expect(transition.pseudoElement).toBe('::5');
        expect(insProps[transition._id].options.pseudoElement).toBe('::5'); // Passed value

        done();
      });

      it('Update - default', function(done) {
        transition.pseudoElement = '';
        expect(transition.pseudoElement).toBe('');
        expect(insProps[transition._id].options.pseudoElement).toBe(''); // Passed value

        done();
      });

      it('Update - Invalid value -> ignored', function(done) {
        transition.pseudoElement = '::3';
        expect(transition.pseudoElement).toBe('::3');
        expect(insProps[transition._id].options.pseudoElement).toBe('::3'); // Passed value

        transition.pseudoElement = true;
        expect(transition.pseudoElement).toBe('::3');
        expect(insProps[transition._id].options.pseudoElement).toBe('::3'); // Passed value

        done();
      });

      it('Update another option -> ignored', function(done) {
        transition.duration = '5s';
        expect(transition.pseudoElement).toBe('::3');
        expect(insProps[transition._id].options.pseudoElement).toBe('::3'); // Passed value

        done();
      });
    });

    describe('property', function() {
      var transition;

      beforeAll(function(done) {
        transition = new TimedTransition(frameDocument.getElementById('elm-plain'));
        done();
      });

      it('default', function(done) {
        expect(insProps[transition._id].lastParseAsCss.property).toBe('all'); // Not updated
        expect(transition.property).toBe('');
        expect(insProps[transition._id].options.property).toBe(''); // Passed value

        done();
      });

      it('Update - string', function(done) {
        transition.property = 'margin-top';
        expect(transition.property).toBe('margin-top');
        expect(insProps[transition._id].options.property).toBe('margin-top'); // Passed value

        done();
      });

      it('Update - another string', function(done) {
        transition.property = 'margin-right';
        expect(transition.property).toBe('margin-right');
        expect(insProps[transition._id].options.property).toBe('margin-right'); // Passed value

        done();
      });

      it('Update - default index -> not updated', function(done) {
        transition.property = 'margin';
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        insProps[transition._id].lastParseAsCss.property = '-';
        transition.property = 0;
        expect(insProps[transition._id].lastParseAsCss.property).toBe('all'); // Not updated
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        done();
      });

      it('Update - default string', function(done) {
        transition.property = '';
        expect(transition.property).toBe('');
        expect(insProps[transition._id].options.property).toBe(''); // Passed value

        done();
      });

      it('Update - Invalid value -> ignored', function(done) {
        transition.property = 'margin';
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        insProps[transition._id].lastParseAsCss.property = '-';
        transition.property = true;
        expect(insProps[transition._id].lastParseAsCss.property).toBe(null);
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        done();
      });

      it('Update another option -> ignored', function(done) {
        transition.property = 'margin';
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        transition.duration = '5s';
        expect(transition.property).toBe('margin');
        expect(insProps[transition._id].options.property).toBe('margin'); // Passed value

        done();
      });

      it('Get by class', function(done) {
        var transitionSp =
          new TimedTransition(frameDocument.getElementById('elm-property-class'));

        expect(transitionSp.element).toBe(frameDocument.getElementById('elm-property-class'));
        expect(transition.element.ownerDocument.defaultView).toBe(frameWindow);

        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe('margin-top');
        expect(transitionSp.property).toBe('margin-top');
        expect(insProps[transitionSp._id].options.property).toBe('margin-top'); // Passed value

        done();
      });

      it('Get by style, index', function(done) {
        var transitionSp =
          new TimedTransition(frameDocument.getElementById('elm-property-style'), {property: 2});

        expect(transitionSp.element).toBe(frameDocument.getElementById('elm-property-style'));
        expect(transition.element.ownerDocument.defaultView).toBe(frameWindow);

        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe('padding-bottom');
        expect(transitionSp.property).toBe('padding-bottom');
        expect(insProps[transitionSp._id].options.property).toBe('padding-bottom'); // Passed value

        // Re-get
        insProps[transitionSp._id].lastParseAsCss.property = '-';
        transitionSp.property = 1;
        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe('padding-right');
        expect(transitionSp.property).toBe('padding-right');
        expect(insProps[transitionSp._id].options.property).toBe('padding-right'); // Passed value

        insProps[transitionSp._id].lastParseAsCss.property = '-';
        transitionSp.property = false; // Not string
        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe(null);
        expect(transitionSp.property).toBe('padding-right');
        expect(insProps[transitionSp._id].options.property).toBe('padding-right'); // Passed value

        insProps[transitionSp._id].lastParseAsCss.property = '-';
        transitionSp.property = 4; // Over index
        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe(null);
        expect(transitionSp.property).toBe('padding-right');
        expect(insProps[transitionSp._id].options.property).toBe('padding-right'); // Passed value

        insProps[transitionSp._id].lastParseAsCss.property = '-';
        transitionSp.property = -1; // No index
        expect(insProps[transitionSp._id].lastParseAsCss.property).toBe(null);
        expect(transitionSp.property).toBe('padding-right');
        expect(insProps[transitionSp._id].options.property).toBe('padding-right'); // Passed value

        done();
      });
    });

    describe('duration', function() {
      var transition;

      beforeAll(function(done) {
        transition = new TimedTransition(frameDocument.getElementById('elm-plain'));
        done();
      });

      it('default', function(done) {
        expect(insProps[transition._id].lastParseAsCss.duration).toBe('0s'); // Not updated
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        done();
      });

      it('Update - string', function(done) {
        transition.duration = '5s';
        expect(transition.duration).toBe('5s');
        expect(insProps[transition._id].options.duration).toBe('5s'); // Passed value
        expect(insProps[transition._id].duration).toBe(5000);

        done();
      });

      it('Update - another string', function(done) {
        transition.duration = '3s';
        expect(transition.duration).toBe('3s');
        expect(insProps[transition._id].options.duration).toBe('3s'); // Passed value
        expect(insProps[transition._id].duration).toBe(3000);

        transition.duration = ' 0 ';
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        transition.duration = ' 0.000 ';
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        transition.duration = '1200ms';
        expect(transition.duration).toBe('1200ms');
        expect(insProps[transition._id].options.duration).toBe('1200ms'); // Passed value
        expect(insProps[transition._id].duration).toBe(1200);

        transition.duration = ' 0s ';
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        transition.duration = '  8s  ';
        expect(transition.duration).toBe('8s');
        expect(insProps[transition._id].options.duration).toBe('8s'); // Passed value
        expect(insProps[transition._id].duration).toBe(8000);

        // Invalid
        transition.duration = 'foo';
        expect(transition.duration).toBe('8s');
        expect(insProps[transition._id].options.duration).toBe('8s'); // Passed value
        expect(insProps[transition._id].duration).toBe(8000);

        // Invalid
        transition.duration = '';
        expect(transition.duration).toBe('8s');
        expect(insProps[transition._id].options.duration).toBe('8s'); // Passed value
        expect(insProps[transition._id].duration).toBe(8000);

        // Invalid
        transition.duration = '-500ms';
        expect(transition.duration).toBe('8s');
        expect(insProps[transition._id].options.duration).toBe('8s'); // Passed value
        expect(insProps[transition._id].duration).toBe(8000);

        done();
      });

      it('Update - default index', function(done) {
        transition.duration = '3s';
        expect(transition.duration).toBe('3s');
        expect(insProps[transition._id].options.duration).toBe('3s'); // Passed value
        expect(insProps[transition._id].duration).toBe(3000);

        insProps[transition._id].lastParseAsCss.duration = '-';
        transition.duration = 0;
        expect(insProps[transition._id].lastParseAsCss.duration).toBe('0s');
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        done();
      });

      it('Update - default string', function(done) {
        transition.duration = '0s';
        expect(transition.duration).toBe('0s');
        expect(insProps[transition._id].options.duration).toBe('0s'); // Passed value
        expect(insProps[transition._id].duration).toBe(0);

        done();
      });

      it('Update - Invalid value -> ignored', function(done) {
        transition.duration = '2s';
        expect(transition.duration).toBe('2s');
        expect(insProps[transition._id].options.duration).toBe('2s'); // Passed value
        expect(insProps[transition._id].duration).toBe(2000);

        insProps[transition._id].lastParseAsCss.duration = '-';
        transition.duration = true;
        expect(insProps[transition._id].lastParseAsCss.duration).toBe(null);
        expect(transition.duration).toBe('2s');
        expect(insProps[transition._id].options.duration).toBe('2s'); // Passed value
        expect(insProps[transition._id].duration).toBe(2000);

        done();
      });

      it('Update another option -> ignored', function(done) {
        transition.duration = '2s';
        expect(transition.duration).toBe('2s');
        expect(insProps[transition._id].options.duration).toBe('2s'); // Passed value
        expect(insProps[transition._id].duration).toBe(2000);

        transition.property = 'margin';
        expect(transition.duration).toBe('2s');
        expect(insProps[transition._id].options.duration).toBe('2s'); // Passed value
        expect(insProps[transition._id].duration).toBe(2000);

        done();
      });

      it('Get by class, index', function(done) {
        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-0').add('duration-avoidList-1');
        }
        var transitionSp =
          new TimedTransition(frameDocument.getElementById('elm-duration-class'),
            {duration: avoidList ? 0 : 1});

        expect(transitionSp.element).toBe(frameDocument.getElementById('elm-duration-class'));
        expect(transition.element.ownerDocument.defaultView).toBe(frameWindow);

        expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe('2s');
        expect(transitionSp.duration).toBe('2s');
        expect(insProps[transitionSp._id].options.duration).toBe('2s'); // Passed value
        expect(insProps[transitionSp._id].duration).toBe(2000);

        // Re-get
        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-1').add('duration-avoidList-0');
        }
        insProps[transitionSp._id].lastParseAsCss.duration = '-';
        transitionSp.duration = 0;
        expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe('1s');
        expect(transitionSp.duration).toBe('1s');
        expect(insProps[transitionSp._id].options.duration).toBe('1s'); // Passed value
        expect(insProps[transitionSp._id].duration).toBe(1000);

        insProps[transitionSp._id].lastParseAsCss.duration = '-';
        transitionSp.duration = false; // Not string
        expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe(null);
        expect(transitionSp.duration).toBe('1s');
        expect(insProps[transitionSp._id].options.duration).toBe('1s'); // Passed value
        expect(insProps[transitionSp._id].duration).toBe(1000);

        insProps[transitionSp._id].lastParseAsCss.duration = '-';
        transitionSp.duration = 4; // Over index
        expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe(null);
        expect(transitionSp.duration).toBe('1s');
        expect(insProps[transitionSp._id].options.duration).toBe('1s'); // Passed value
        expect(insProps[transitionSp._id].duration).toBe(1000);

        insProps[transitionSp._id].lastParseAsCss.duration = '-';
        transitionSp.duration = -1; // No index
        expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe(null);
        expect(transitionSp.duration).toBe('1s');
        expect(insProps[transitionSp._id].options.duration).toBe('1s'); // Passed value
        expect(insProps[transitionSp._id].duration).toBe(1000);

        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-0', 'duration-avoidList-1');
        }

        done();
      });
    });

    describe('delay', function() {
      var transition;

      beforeAll(function(done) {
        transition = new TimedTransition(frameDocument.getElementById('elm-plain'));
        done();
      });

      it('default', function(done) {
        expect(insProps[transition._id].lastParseAsCss.delay).toBe('0s'); // Not updated
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        done();
      });

      it('Update - string', function(done) {
        transition.delay = '5s';
        expect(transition.delay).toBe('5s');
        expect(insProps[transition._id].options.delay).toBe('5s'); // Passed value
        expect(insProps[transition._id].delay).toBe(5000);

        done();
      });

      it('Update - another string', function(done) {
        transition.delay = '3s';
        expect(transition.delay).toBe('3s');
        expect(insProps[transition._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transition._id].delay).toBe(3000);

        transition.delay = ' 0 ';
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        transition.delay = ' 0.000 ';
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        transition.delay = '1200ms';
        expect(transition.delay).toBe('1200ms');
        expect(insProps[transition._id].options.delay).toBe('1200ms'); // Passed value
        expect(insProps[transition._id].delay).toBe(1200);

        transition.delay = ' 0s ';
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        transition.delay = '  8s  ';
        expect(transition.delay).toBe('8s');
        expect(insProps[transition._id].options.delay).toBe('8s'); // Passed value
        expect(insProps[transition._id].delay).toBe(8000);

        // Invalid
        transition.delay = 'foo';
        expect(transition.delay).toBe('8s');
        expect(insProps[transition._id].options.delay).toBe('8s'); // Passed value
        expect(insProps[transition._id].delay).toBe(8000);

        // Invalid
        transition.delay = '';
        expect(transition.delay).toBe('8s');
        expect(insProps[transition._id].options.delay).toBe('8s'); // Passed value
        expect(insProps[transition._id].delay).toBe(8000);

        // Not invalid
        transition.delay = '-500ms';
        expect(transition.delay).toBe('-500ms');
        expect(insProps[transition._id].options.delay).toBe('-500ms'); // Passed value
        expect(insProps[transition._id].delay).toBe(-500);

        transition.delay = '-3s';
        expect(transition.delay).toBe('-3s');
        expect(insProps[transition._id].options.delay).toBe('-3s'); // Passed value
        expect(insProps[transition._id].delay).toBe(-3000);

        done();
      });

      it('Update - default index', function(done) {
        transition.delay = '3s';
        expect(transition.delay).toBe('3s');
        expect(insProps[transition._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transition._id].delay).toBe(3000);

        insProps[transition._id].lastParseAsCss.delay = '-';
        transition.delay = 0;
        expect(insProps[transition._id].lastParseAsCss.delay).toBe('0s');
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        done();
      });

      it('Update - default string', function(done) {
        transition.delay = '0s';
        expect(transition.delay).toBe('0s');
        expect(insProps[transition._id].options.delay).toBe('0s'); // Passed value
        expect(insProps[transition._id].delay).toBe(0);

        done();
      });

      it('Update - Invalid value -> ignored', function(done) {
        transition.delay = '2s';
        expect(transition.delay).toBe('2s');
        expect(insProps[transition._id].options.delay).toBe('2s'); // Passed value
        expect(insProps[transition._id].delay).toBe(2000);

        insProps[transition._id].lastParseAsCss.delay = '-';
        transition.delay = true;
        expect(insProps[transition._id].lastParseAsCss.delay).toBe(null);
        expect(transition.delay).toBe('2s');
        expect(insProps[transition._id].options.delay).toBe('2s'); // Passed value
        expect(insProps[transition._id].delay).toBe(2000);

        done();
      });

      it('Update another option -> ignored', function(done) {
        transition.delay = '2s';
        expect(transition.delay).toBe('2s');
        expect(insProps[transition._id].options.delay).toBe('2s'); // Passed value
        expect(insProps[transition._id].delay).toBe(2000);

        transition.property = 'margin';
        expect(transition.delay).toBe('2s');
        expect(insProps[transition._id].options.delay).toBe('2s'); // Passed value
        expect(insProps[transition._id].delay).toBe(2000);

        done();
      });

      it('Get by class, index', function(done) {
        var transitionSp =
          new TimedTransition(frameDocument.getElementById('elm-delay-class'), {delay: 0});

        expect(transitionSp.element).toBe(frameDocument.getElementById('elm-delay-class'));
        expect(transition.element.ownerDocument.defaultView).toBe(frameWindow);

        expect(insProps[transitionSp._id].lastParseAsCss.delay).toBe('3s');
        expect(transitionSp.delay).toBe('3s');
        expect(insProps[transitionSp._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transitionSp._id].delay).toBe(3000);

        transition.delay = '2s';
        expect(transition.delay).toBe('2s');
        expect(insProps[transition._id].options.delay).toBe('2s'); // Passed value
        expect(insProps[transition._id].delay).toBe(2000);

        // Re-get
        insProps[transitionSp._id].lastParseAsCss.delay = '-';
        transitionSp.delay = 0;
        expect(insProps[transitionSp._id].lastParseAsCss.delay).toBe('3s');
        expect(transitionSp.delay).toBe('3s');
        expect(insProps[transitionSp._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transitionSp._id].delay).toBe(3000);

        insProps[transitionSp._id].lastParseAsCss.delay = '-';
        transitionSp.delay = false; // Not string
        expect(insProps[transitionSp._id].lastParseAsCss.delay).toBe(null);
        expect(transitionSp.delay).toBe('3s');
        expect(insProps[transitionSp._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transitionSp._id].delay).toBe(3000);

        insProps[transitionSp._id].lastParseAsCss.delay = '-';
        transitionSp.delay = 4; // Over index
        expect(insProps[transitionSp._id].lastParseAsCss.delay).toBe(null);
        expect(transitionSp.delay).toBe('3s');
        expect(insProps[transitionSp._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transitionSp._id].delay).toBe(3000);

        insProps[transitionSp._id].lastParseAsCss.delay = '-';
        transitionSp.delay = -1; // No index
        expect(insProps[transitionSp._id].lastParseAsCss.delay).toBe(null);
        expect(transitionSp.delay).toBe('3s');
        expect(insProps[transitionSp._id].options.delay).toBe('3s'); // Passed value
        expect(insProps[transitionSp._id].delay).toBe(3000);

        done();
      });
    });

    describe('initOn', function() {
      it('default', function(done) {
        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-1').add('duration-avoidList-0');
        }
        var transition = new TimedTransition(frameDocument.getElementById('elm-duration-class'));
        expect(insProps[transition._id].duration).toBe(1000);
        expect(insProps[transition._id].delay).toBe(0);
        expect(insProps[transition._id].state).toBe(TimedTransition.STATE_STOPPED);
        expect(insProps[transition._id].isOn).toBe(false);
        expect(insProps[transition._id].runTime).toBe(0);
        expect(insProps[transition._id].startTime).toBe(0);
        expect(insProps[transition._id].currentPosition).toBe(0);

        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-0', 'duration-avoidList-1');
        }

        done();
      });

      it('true', function(done) {
        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-1').add('duration-avoidList-0');
        }
        var transition = new TimedTransition(frameDocument.getElementById('elm-duration-class'), null, true);
        expect(insProps[transition._id].duration).toBe(1000);
        expect(insProps[transition._id].delay).toBe(0);
        expect(insProps[transition._id].state).toBe(TimedTransition.STATE_STOPPED);
        expect(insProps[transition._id].isOn).toBe(true); // Changed
        expect(insProps[transition._id].runTime).toBe(0);
        expect(insProps[transition._id].startTime).toBe(0);
        expect(insProps[transition._id].currentPosition).toBe(1000); // Changed

        if (avoidList) {
          window.mClassList(frameDocument.getElementById('elm-duration-class'))
            .remove('duration-avoidList-0', 'duration-avoidList-1');
        }

        done();
      });
    });

  });

  describe('flow', function() {

    describe('no delay', function() {
      var transition,
        DURATION = 5000,
        DURATION_S = DURATION / 1000,
        LESS_PLAY = 2000,
        LESS_PLAY_S = LESS_PLAY / 1000,
        WAIT = 1000;

      beforeAll(function(done) {
        var element = frameDocument.getElementById('target-nodelay');
        transition = utils.getInstance(element);
        utils.setupListener(element);
        done();
      });

      it('play', function(done) {
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
              'currentPosition:0',
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + transition._id, 'isOn:false',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</on>',

              '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
              'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
              'currentPosition:' + DURATION,
              'CANCEL', '</fixCurrentPosition>',

              '<abort>', '_id:' + transition._id, 'isOn:true',
              'CANCEL', '</abort>',

              'state:STATE_DELAYING',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'type:timedTransitionRun',
              '</fireEvent>',

              '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:0',
              'currentPosition:' + DURATION,
              'state:STATE_PLAYING',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionStart',
              '</fireEvent>',

              'durationLeft:' + DURATION,
              '</finishDelaying>',

              '</off>',

              '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'state:STATE_STOPPED',

              '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
              'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
              'currentPosition:' + DURATION,
              'type:timedTransitionEnd',
              '</fireEvent>',

              '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            utils.addLog('OFF', transition);
            transition.off();

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:0',
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</on>',

                '<off>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:false',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'currentPosition:0', 'currentPosition:' + LESS_PLAY,
                '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + LESS_PLAY,
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
                'currentPosition:' + LESS_PLAY,
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
                'currentPosition:' + LESS_PLAY,
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + LESS_PLAY,
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + LESS_PLAY,
                '</finishDelaying>',

                '</off>',

                '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + LESS_PLAY,
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:false', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + LESS_PLAY,
                'type:timedTransitionEnd',
                '</fireEvent>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            utils.addLog('ON', transition);
            transition.on();

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:' + DURATION,
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</off>',

                '<on>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:false',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'currentPosition:' + DURATION, 'currentPosition:' + (DURATION - LESS_PLAY),
                '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + (DURATION - LESS_PLAY),
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
                'currentPosition:' + (DURATION - LESS_PLAY),
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:0',
                'currentPosition:' + (DURATION - LESS_PLAY),
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + (DURATION - LESS_PLAY),
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + (DURATION - (DURATION - LESS_PLAY)),
                '</finishDelaying>',

                '</on>',

                '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + (DURATION - LESS_PLAY),
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:true', 'runTime:' + (logTime + LESS_PLAY), 'startTime:' + (logTime + LESS_PLAY),
                'currentPosition:' + (DURATION - LESS_PLAY),
                'type:timedTransitionEnd',
                '</fireEvent>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('ON(force)', transition);
          transition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:true',
              'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

              'STOP(force)',

              '<abort>', '_id:' + transition._id, 'isOn:false',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            utils.addLog('ON(force)', transition);
            transition.on(true);

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:0',
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</on>',

                '<on>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:true',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

                'STOP(force)',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:0',
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            utils.addLog('ON(force)', transition);
            transition.on(true);

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:' + DURATION,
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</off>',

                '<on>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:true',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,

                'STOP(force)',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('OFF(force)', transition);
          transition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:true',
              'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

              'STOP(force)',

              '<abort>', '_id:' + transition._id, 'isOn:true',
              'CANCEL', '</abort>',

              '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            utils.addLog('OFF(force)', transition);
            transition.off(true);

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:' + DURATION,
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</off>',

                '<off>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:true',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,

                'STOP(force)',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            utils.addLog('OFF(force)', transition);
            transition.off(true);

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:0',
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</on>',

                '<off>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:true',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',

                'STOP(force)',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:0',
                'type:timedTransitionCancel',
                '</fireEvent>',

                '</abort>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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

      // Other cases

      it('play -> play', function(done) {
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            utils.addLog('ON', transition);
            transition.on();

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:false', 'runTime:0', 'startTime:0', 'currentPosition:0',

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:0',
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:false',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:0', 'currentPosition:0',
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</on>',

                '<on>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:false',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'CANCEL', '</on>',

                '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:true', 'runTime:' + logTime, 'startTime:' + logTime, 'currentPosition:0',
                'type:timedTransitionEnd',
                '</fireEvent>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:true',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          var logTime = TimedTransition.roundTime(Date.now());
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            utils.addLog('OFF', transition);
            transition.off();

            setTimeout(function() {
              expect(traceLog).toEqual([
                '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
                'isOn:true', 'runTime:0', 'startTime:0', 'currentPosition:' + DURATION,

                '<fixCurrentPosition>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'currentPosition:' + DURATION,
                'CANCEL', '</fixCurrentPosition>',

                '<abort>', '_id:' + transition._id, 'isOn:true',
                'CANCEL', '</abort>',

                'state:STATE_DELAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'type:timedTransitionRun',
                '</fireEvent>',

                '<finishDelaying>', '_id:' + transition._id, 'state:STATE_DELAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:0',
                'currentPosition:' + DURATION,
                'state:STATE_PLAYING',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionStart',
                '</fireEvent>',

                'durationLeft:' + DURATION,
                '</finishDelaying>',

                '</off>',

                '<off>', '_id:' + transition._id, 'state:STATE_PLAYING', 'force:false',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'CANCEL', '</off>',

                '<finishPlaying>', '_id:' + transition._id, 'state:STATE_PLAYING',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'state:STATE_STOPPED',

                '<fireEvent>', '_id:' + transition._id, 'state:STATE_STOPPED',
                'isOn:false', 'runTime:' + logTime, 'startTime:' + logTime,
                'currentPosition:' + DURATION,
                'type:timedTransitionEnd',
                '</fireEvent>',

                '<finishAll/>', '_id:' + transition._id, 'isOn:false',
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

      it('play after play', function(done) {
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('ON', transition);
          transition.on();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('OFF', transition);
          transition.off();

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:false',
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
        transition.on(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('ON(force)', transition);
          transition.on(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<on>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:true',
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
        transition.off(true);
        setTimeout(function() {
          traceLog.length = 0;
          utils.initLog();

          utils.addLog('OFF(force)', transition);
          transition.off(true);

          setTimeout(function() {
            expect(traceLog).toEqual([
              '<off>', '_id:' + transition._id, 'state:STATE_STOPPED', 'force:true',
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
});
