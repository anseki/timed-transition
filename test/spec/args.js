describe('arguments of on/off', function() {
  'use strict';

  var pageDone, transition,
    args = {};

  function procToOn(force) {
    args = {fnc: 'procToOn', force: force};
  }

  function procToOff(force) {
    args = {fnc: 'procToOff', force: force};
  }

  function initIns() {
    args = {};
    transition.property = 'FALSE';
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/flow.html', function(pageWindow, pageDocument, pageBody, done) {
      transition = new pageWindow.TimedTransition(
        pageDocument.getElementById('target-nodelay'),
        {procToOn: procToOn, procToOff: procToOff});

      pageDone = done;
      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('()', function() {
    transition.off(true);
    initIns();

    transition.on();
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off();
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('FALSE');
  });

  it('(false)', function() {
    transition.off(true);
    initIns();

    transition.on(false);
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off(false);
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('FALSE');
  });

  it('(true)', function() {
    transition.off(true);
    initIns();

    transition.on(true);
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off(true);
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('FALSE');
  });

  it('(options1)', function() {
    transition.off(true);
    initIns();

    transition.on({property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off({property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL1');
  });

  it('(false, options1)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL1');
  });

  it('(true, options1)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('VAL1');
  });

  it('(options2)', function() {
    transition.off(true);
    initIns();

    transition.on({property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off({property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL2');
  });

  it('(false, options2)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(transition.property).toBe('VAL2');
  });

  it('(true, options2)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(transition.property).toBe('VAL2');
  });

});
