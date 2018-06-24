describe('options', function() {
  'use strict';

  var window, document, TimedTransition, insProps, pageDone, avoidList;

  beforeAll(function(beforeDone) {
    loadPage('spec/options.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      TimedTransition = window.TimedTransition;
      insProps = TimedTransition.insProps;

      // for Webkit bug, getComputedStyle can't get list
      avoidList =
        window.getComputedStyle(document.getElementById('elm-duration-class'), '')
          .transitionDuration !== '1s, 2s';

      pageDone = done;
      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  describe('pseudoElement', function() {
    var transition;

    beforeAll(function(done) {
      transition = new TimedTransition(document.getElementById('elm-plain'));
      done();
    });

    it('default', function(done) {
      expect(transition.element).toBe(document.getElementById('elm-plain'));

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
      transition = new TimedTransition(document.getElementById('elm-plain'));
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
        new TimedTransition(document.getElementById('elm-property-class'));

      expect(transitionSp.element).toBe(document.getElementById('elm-property-class'));

      expect(insProps[transitionSp._id].lastParseAsCss.property).toBe('margin-top');
      expect(transitionSp.property).toBe('margin-top');
      expect(insProps[transitionSp._id].options.property).toBe('margin-top'); // Passed value

      done();
    });

    it('Get by style, index', function(done) {
      var transitionSp =
        new TimedTransition(document.getElementById('elm-property-style'), {property: 2});

      expect(transitionSp.element).toBe(document.getElementById('elm-property-style'));

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
      transition = new TimedTransition(document.getElementById('elm-plain'));
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
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-0').add('duration-avoidList-1');
      }
      var transitionSp =
        new TimedTransition(document.getElementById('elm-duration-class'),
          {duration: avoidList ? 0 : 1});

      expect(transitionSp.element).toBe(document.getElementById('elm-duration-class'));

      expect(insProps[transitionSp._id].lastParseAsCss.duration).toBe('2s');
      expect(transitionSp.duration).toBe('2s');
      expect(insProps[transitionSp._id].options.duration).toBe('2s'); // Passed value
      expect(insProps[transitionSp._id].duration).toBe(2000);

      // Re-get
      if (avoidList) {
        window.mClassList(document.getElementById('elm-duration-class'))
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
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-0', 'duration-avoidList-1');
      }

      done();
    });
  });

  describe('delay', function() {
    var transition;

    beforeAll(function(done) {
      transition = new TimedTransition(document.getElementById('elm-plain'));
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
        new TimedTransition(document.getElementById('elm-delay-class'), {delay: 0});

      expect(transitionSp.element).toBe(document.getElementById('elm-delay-class'));

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

  describe('procToOn', function() {
    var transition;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      transition = new TimedTransition(document.getElementById('elm-plain'));
      done();
    });

    it('default', function(done) {
      expect(typeof transition.procToOn).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      transition.procToOn = fnc1;
      expect(transition.procToOn).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      transition.procToOn = fnc2;
      expect(transition.procToOn).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      transition.procToOn = null;
      expect(typeof transition.procToOn).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      transition.procToOn = fnc1;
      expect(transition.procToOn).toBe(fnc1);

      transition.procToOn = 5;
      expect(transition.procToOn).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      transition.duration = 5;
      expect(transition.procToOn).toBe(fnc1);

      done();
    });
  });

  describe('procToOff', function() {
    var transition;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      transition = new TimedTransition(document.getElementById('elm-plain'));
      done();
    });

    it('default', function(done) {
      expect(typeof transition.procToOff).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      transition.procToOff = fnc1;
      expect(transition.procToOff).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      transition.procToOff = fnc2;
      expect(transition.procToOff).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      transition.procToOff = null;
      expect(typeof transition.procToOff).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      transition.procToOff = fnc1;
      expect(transition.procToOff).toBe(fnc1);

      transition.procToOff = 5;
      expect(transition.procToOff).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      transition.duration = 5;
      expect(transition.procToOff).toBe(fnc1);

      done();
    });
  });

  describe('initOn', function() {
    it('default', function(done) {
      if (avoidList) {
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-1').add('duration-avoidList-0');
      }
      var transition = new TimedTransition(document.getElementById('elm-duration-class'));
      expect(insProps[transition._id].duration).toBe(1000);
      expect(insProps[transition._id].delay).toBe(0);
      expect(insProps[transition._id].state).toBe(TimedTransition.STATE_STOPPED);
      expect(insProps[transition._id].isOn).toBe(false);
      expect(insProps[transition._id].runTime).toBe(0);
      expect(insProps[transition._id].startTime).toBe(0);
      expect(insProps[transition._id].currentPosition).toBe(0);

      if (avoidList) {
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-0', 'duration-avoidList-1');
      }

      done();
    });

    it('true', function(done) {
      if (avoidList) {
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-1').add('duration-avoidList-0');
      }
      var transition = new TimedTransition(document.getElementById('elm-duration-class'), null, true);
      expect(insProps[transition._id].duration).toBe(1000);
      expect(insProps[transition._id].delay).toBe(0);
      expect(insProps[transition._id].state).toBe(TimedTransition.STATE_STOPPED);
      expect(insProps[transition._id].isOn).toBe(true); // Changed
      expect(insProps[transition._id].runTime).toBe(0);
      expect(insProps[transition._id].startTime).toBe(0);
      expect(insProps[transition._id].currentPosition).toBe(1000); // Changed

      if (avoidList) {
        window.mClassList(document.getElementById('elm-duration-class'))
          .remove('duration-avoidList-0', 'duration-avoidList-1');
      }

      done();
    });
  });

  describe('window', function() {
    it('should get window via element.ownerDocument.defaultView', function() {
      var element = document.createElement('div'),
        transition = new TimedTransition(element);
      expect(element.ownerDocument.defaultView).toBe(window); // element: HTML Element
      expect(insProps[transition._id].window).toBe(element.ownerDocument.defaultView); // defaultView
    });

    it('should get window via current window', function() {
      // element: SVG Element
      var element = (new DOMParser()).parseFromString('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>', 'image/svg+xml').documentElement,
        transition = new TimedTransition(element);
      expect(element.ownerDocument.defaultView).toBe(null);
      expect(insProps[transition._id].window).toBe(window); // current window
    });

    it('should get window via options.window', function() {
      // element: SVG Element
      var element = (new DOMParser()).parseFromString('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>', 'image/svg+xml').documentElement,
        optWin = 'WINDOW',
        transition = new TimedTransition(element, {
          window: optWin,
          // To avoid calling getComputedStyle
          property: 'PROP',
          duration: 'DUR',
          delay: 'DEL'
        });
      expect(element.ownerDocument.defaultView).toBe(null);
      expect(insProps[transition._id].window).toBe(optWin); // options.window
    });
  });

});
