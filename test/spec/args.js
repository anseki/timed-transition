describe('arguments of on/off', function() {
  'use strict';

  var pageDone, transition,
    args = {};

  function procToOn(force, arg1, arg2) {
    args = {fnc: 'procToOn', force: force, arg1: arg1, arg2: arg2, argLen: arguments.length};
  }

  function procToOff(force, arg1, arg2) {
    args = {fnc: 'procToOff', force: force, arg1: arg1, arg2: arg2, argLen: arguments.length};
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
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off();
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');
  });

  it('(false)', function() {
    transition.off(true);
    initIns();

    transition.on(false);
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off(false);
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');
  });

  it('(true)', function() {
    transition.off(true);
    initIns();

    transition.on(true);
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');

    transition.on(true);
    initIns();

    transition.off(true);
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('FALSE');
  });

  it('(options1)', function() {
    transition.off(true);
    initIns();

    transition.on({property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off({property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');
  });

  it('(false, options1)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');
  });

  it('(true, options1)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL1'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL1');
  });

  it('(options2)', function() {
    transition.off(true);
    initIns();

    transition.on({property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off({property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');
  });

  it('(false, options2)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');
  });

  it('(true, options2)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL2'});
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(args.arg1).not.toBeDefined();
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(1);
    expect(transition.property).toBe('VAL2');
  });

  it('(false, options, arg1)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL1'}, 'ARG1');
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(2);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL1'}, 'ARG1');
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(2);
    expect(transition.property).toBe('VAL1');
  });

  it('(true, options, arg1)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL1'}, 'ARG1');
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(2);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL1'}, 'ARG1');
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).not.toBeDefined();
    expect(args.argLen).toBe(2);
    expect(transition.property).toBe('VAL1');
  });

  it('(false, options, arg1, arg2)', function() {
    transition.off(true);
    initIns();

    transition.on(false, {property: 'VAL1'}, 'ARG1', 'ARG2');
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(false);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).toBe('ARG2');
    expect(args.argLen).toBe(3);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(false, {property: 'VAL1'}, 'ARG1', 'ARG2');
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(false);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).toBe('ARG2');
    expect(args.argLen).toBe(3);
    expect(transition.property).toBe('VAL1');
  });

  it('(true, options, arg1, arg2)', function() {
    transition.off(true);
    initIns();

    transition.on(true, {property: 'VAL1'}, 'ARG1', 'ARG2');
    expect(args.fnc).toBe('procToOn');
    expect(args.force).toBe(true);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).toBe('ARG2');
    expect(args.argLen).toBe(3);
    expect(transition.property).toBe('VAL1');

    transition.on(true);
    initIns();

    transition.off(true, {property: 'VAL1'}, 'ARG1', 'ARG2');
    expect(args.fnc).toBe('procToOff');
    expect(args.force).toBe(true);
    expect(args.arg1).toBe('ARG1');
    expect(args.arg2).toBe('ARG2');
    expect(args.argLen).toBe(3);
    expect(transition.property).toBe('VAL1');
  });

});
