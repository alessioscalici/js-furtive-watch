describe("[watch - array]", function() {



  var fw = window.fw;

  var array, callStack, handlers, newElement, element;

  var handlerGen = function (handlerId) {
    var handler = function (mod) {
      callStack.push({
        mod: mod,
        handlerId: handlerId
      });
    };
    handlers[handlerId] = handler;
    return handler;
  };


  beforeEach(function(){
    array = [
      { name: 'Mario', job: 'plumber' },
      { name: 'Luigi', job: 'plumber' }
    ];
    callStack = [];
    handlers = {};
    newElement = null;
  });



  // =========================================== CALLING HANDLERS =========================================== //

  describe("[calling handlers]", function() {


    var testCallingHandlers = function () {

      it("should call the handlers if changing a watched property", function() {

        var prevVal = element.job;
        element.job = 'level boss';

        expect(callStack.length).toBe(1);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe(prevVal);
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(element);
      });


      it("should call ALL the handlers if changing a watched property", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));

        var prevVal = element.job;
        element.job = 'level boss';

        expect(callStack.length).toBe(2);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe(prevVal);
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(element);
        expect(callStack[1].handlerId).toBe('jobHandler2');
        expect(callStack[1].mod.property).toBe('job');
        expect(callStack[1].mod.from).toBe(prevVal);
        expect(callStack[1].mod.to).toBe('level boss');
        expect(callStack[1].mod.object).toBe(element);
      });

      it("should NOT call the handlers if changing a NON WATCHED property", function() {
        element.name = 'Super Bower';
        expect(callStack.length).toBe(0);
      });

    };


    beforeEach(function() {
      callStack = [];
      array = [
        { name: 'Mario', job: 'plumber' },
        { name: 'Luigi', job: 'plumber' }
      ];
    });


    describe("on an existing element", function() {

      beforeEach(function() {

        element = array[0];
        fw.watchArray(array, 'job', handlerGen('jobHandler'));

      });

      testCallingHandlers();

    });

    describe("on a new element added with push()", function() {

      beforeEach(function() {

        element = { name: 'Bower', job: 'monster' };
        fw.watchArray(array, 'job', handlerGen('jobHandler'));
        array.push(element);

      });

      testCallingHandlers();

    });

    describe("on a new element added with unshift()", function() {

      beforeEach(function() {

        element = { name: 'Bower', job: 'monster' };
        fw.watchArray(array, 'job', handlerGen('jobHandler'));
        array.unshift(element);

      });

      testCallingHandlers();

    });


  }); // end calling handlers



  // =========================================== UNWATCH SPECIFIC ARRAY HANDLER =========================================== //
  describe("[unwatch handler]", function() {


    var testUnwatchHandler = function () {


      it("should deactivate only the specified handler", function() {

        var prevVal = element.job;
        element.job = 'monster';

        expect(callStack.length).toBe(1);
        expect(callStack[0].handlerId).toBe('jobHandler2');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe(prevVal);
        expect(callStack[0].mod.to).toBe('monster');
        expect(callStack[0].mod.object).toBe(element);

      });

    };


    beforeEach(function() {
      callStack = [];
      array = [
        { name: 'Mario', job: 'plumber' },
        { name: 'Luigi', job: 'plumber' }
      ];

      fw.watchArray(array, 'job', handlerGen('jobHandler'));
      fw.watchArray(array, 'job', handlerGen('jobHandler2'));

    });


    describe("on an existing element", function() {
      beforeEach(function() {
        element = array[0];
        fw.unwatchArray(array, 'job', handlers.jobHandler);
      });
      testUnwatchHandler();
    });

    describe("on a new element added with push() BEFORE unwatching", function() {
      beforeEach(function() {
        element = { name: 'Bower', job: 'monster' };
        array.push(element);
        fw.unwatchArray(array, 'job', handlers.jobHandler);
      });
      testUnwatchHandler();
    });

    describe("on a new element added with push() AFTER unwatching", function() {
      beforeEach(function() {
        element = { name: 'Bower', job: 'monster' };
        fw.unwatchArray(array, 'job', handlers.jobHandler);
        array.push(element);
      });
      testUnwatchHandler();
    });

    describe("on a new element added with unshift() BEFORE unwatching", function() {
      beforeEach(function() {
        element = { name: 'Bower', job: 'monster' };
        array.unshift(element);
        fw.unwatchArray(array, 'job', handlers.jobHandler);
      });
      testUnwatchHandler();
    });

    describe("on a new element added with unshift() AFTER unwatching", function() {
      beforeEach(function() {
        element = { name: 'Bower', job: 'monster' };
        fw.unwatchArray(array, 'job', handlers.jobHandler);
        array.unshift(element);
      });
      testUnwatchHandler();
    });




    describe("should not deactivate any handler", function() {

      beforeEach(function() {
        element = array[0];
      });

      it("if the provided handler is not an handler", function() {


        fw.unwatchArray(array, 'job', function(){});

        var prevVal = element.job;
        element.job = 'monster';

        expect(callStack.length).toBe(2);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe(prevVal);
        expect(callStack[0].mod.to).toBe('monster');
        expect(callStack[0].mod.object).toBe(element);
        expect(callStack[1].handlerId).toBe('jobHandler2');
        expect(callStack[1].mod.property).toBe('job');
        expect(callStack[1].mod.from).toBe(prevVal);
        expect(callStack[1].mod.to).toBe('monster');
        expect(callStack[1].mod.object).toBe(element);

      });

      it("if the provided handler is an element handler but not an array handler", function() {


        fw.watch(element, 'job', handlerGen('elementHandler'));
        fw.unwatchArray(array, 'job', handlers.elementHandler);

        var prevVal = element.job;
        element.job = 'monster';

        expect(callStack.length).toBe(3);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe(prevVal);
        expect(callStack[0].mod.to).toBe('monster');
        expect(callStack[0].mod.object).toBe(element);
        expect(callStack[1].handlerId).toBe('jobHandler2');
        expect(callStack[1].mod.property).toBe('job');
        expect(callStack[1].mod.from).toBe(prevVal);
        expect(callStack[1].mod.to).toBe('monster');
        expect(callStack[1].mod.object).toBe(element);
        expect(callStack[2].handlerId).toBe('elementHandler');
        expect(callStack[2].mod.property).toBe('job');
        expect(callStack[2].mod.from).toBe(prevVal);
        expect(callStack[2].mod.to).toBe('monster');
        expect(callStack[2].mod.object).toBe(element);

      });
    });




  }); // end unwatch handler





  describe('UNWATCH ARRAY', function () {



    // FIXME TO IMPLEMENT
    xdescribe("GLOBAL: .unwatchArray(array)", function() {



      it("should NOT call the watch handlers on existing elements", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));
        fw.watchArray(array, 'name', handlerGen('nameHandler2'));
        fw.watchArray(array, 'name', handlerGen('nameHandler3'));
        fw.watchArray(array, 'undefinedProp', handlerGen('undefinedPropHandler'));

        fw.unwatchArray(array);

        array[0].name = 'Bower';
        array[0].job = 'monster';
        expect(callStack.length).toBe(0);
      });

    });

    // FIXME TO IMPLEMENT
    describe("PROPERTY: .unwatchArray(array, 'propertyName')", function() {


      it("should NOT call the watch handlers for the specified property", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));

        fw.unwatchArray(array, 'job');

        array[0].job = 'monster';

        expect(callStack.length).toBe(0);

      });

      it("should still call the watch handlers for other properties", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));
        fw.watchArray(array, 'name', handlerGen('nameHandler'));

        fw.unwatchArray(array, 'job');

        array[0].name = 'Bower';
        array[0].job = 'monster';

        expect(callStack.length).toBe(1);
        expect(callStack[0].handlerId).toBe('nameHandler');
        expect(callStack[0].mod.property).toBe('name');
        expect(callStack[0].mod.from).toBe('Mario');
        expect(callStack[0].mod.to).toBe('Bower');
        expect(callStack[0].mod.object).toBe(array[0]);

      });

    });




  });




});
