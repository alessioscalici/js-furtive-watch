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


  // =========================================== ERRORS =========================================== //
  describe("[watchArray() errors]", function() {
    it("should throw an error if the first parameter is not an array", function() {
      var error = undefined;
      try {
        var notAnArray = {};
        fw.watchArray(notAnArray, 'name', function () {});
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    });

    it("should throw an error if the first parameter is undefined", function() {
      var error = undefined;
      try {
        var notAnArray = {};
        fw.watchArray(undefined, 'name', function () {});
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    });

    it("should throw an error if the second parameter is not a string", function() {
      var error = undefined;
      try {
        var notAnArray = {};
        fw.watchArray(array, 48, function () {});
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    });

    it("should throw an error if the second parameter is undefined", function() {
      var error = undefined;
      try {
        var notAnArray = {};
        fw.watchArray(array, undefined, function () {});
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    });

    it("should throw an error if the third parameter is not a function", function() {
      var error = undefined;
      try {
        var notAnArray = {};
        fw.watchArray(array, 'name', 46);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    });

  });


  // =========================================== ARRAY STATUS =========================================== //
  describe("[array status]", function() {


    var arraysEqual = function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;

      // If you don't care about the order of the elements inside
      // the array, you should sort both arrays here.
      a.sort();
      b.sort();

      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }

    it("Object.keys() should remain the same after setting a watch", function() {
      var keysBefore = Object.keys(array);
      fw.watchArray(array, 'name', function () {});
      var keysAfter = Object.keys(array);
      expect(arraysEqual(keysBefore, keysAfter)).toBe(true);
    });

    it("array should have the non enumerable internal properties", function() {

      expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
      expect(array[fw.WA_HANDLERS]).toBeUndefined();

      fw.watchArray(array, 'name', function () {});

      expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
      expect(array[fw.WA_HANDLERS]).toBeDefined();
    });

    describe("unwatchArray ", function() {

      it("[handler] should remove internal properties if removing the last handler", function() {

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();

        var handler = function () {};
        var handler2 = function () {};

        fw.watchArray(array, 'name', handler);
        fw.watchArray(array, 'job', handler2);

        expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
        expect(array[fw.WA_HANDLERS]).toBeDefined();

        fw.unwatchArray(array, 'name', handler);

        expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
        expect(array[fw.WA_HANDLERS]).toBeDefined();

        fw.unwatchArray(array, 'job', handler2);

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();
      });


      it("[property] should remove internal properties if removing the last handler", function() {

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();

        var handler = function () {};
        var handler2 = function () {};

        fw.watchArray(array, 'name', handler);
        fw.watchArray(array, 'job', handler2);

        expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
        expect(array[fw.WA_HANDLERS]).toBeDefined();

        fw.unwatchArray(array, 'name');

        expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
        expect(array[fw.WA_HANDLERS]).toBeDefined();

        fw.unwatchArray(array, 'job');

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();
      });


      it("[array] should remove internal properties", function() {

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();

        var handler = function () {};
        var handler2 = function () {};

        fw.watchArray(array, 'name', handler);
        fw.watchArray(array, 'job', handler2);

        expect(array[fw.WA_METHOD_HANDLER]).toBeDefined();
        expect(array[fw.WA_HANDLERS]).toBeDefined();

        fw.unwatchArray(array);

        expect(array[fw.WA_METHOD_HANDLER]).toBeUndefined();
        expect(array[fw.WA_HANDLERS]).toBeUndefined();
      });
    });


  });

  // =========================================== CALLING HANDLERS =========================================== //

  describe("[calling handlers]", function() {
    describe("[basic features]", function() {


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




    // =========================================== UNWATCH PROPERTY =========================================== //
    describe("[unwatch property]", function() {


      var testUnwatchProperty = function () {


        it("should deactivate all the handlers for the specified property", function() {
          var prevVal = element.job;
          element.job = 'monster';
          expect(callStack.length).toBe(0);
        });


        it("should deactivate only the handlers for the specified property", function() {
          var prevVal = element.name;
          element.job = 'monster';
          element.name = 'Bower';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('nameHandler');
          expect(callStack[0].mod.property).toBe('name');
          expect(callStack[0].mod.from).toBe(prevVal);
          expect(callStack[0].mod.to).toBe('Bower');
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
        fw.watchArray(array, 'name', handlerGen('nameHandler'));

      });


      describe("on an existing element", function() {
        beforeEach(function() {
          element = array[0];
          fw.unwatchArray(array, 'job');
        });
        testUnwatchProperty();
      });

      describe("on a new element added with push() BEFORE unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          array.push(element);
          fw.unwatchArray(array, 'job');
        });
        testUnwatchProperty();
      });

      describe("on a new element added with push() AFTER unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          fw.unwatchArray(array, 'job');
          array.push(element);
        });
        testUnwatchProperty();
      });

      describe("on a new element added with unshift() BEFORE unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          array.unshift(element);
          fw.unwatchArray(array, 'job');
        });
        testUnwatchProperty();
      });

      describe("on a new element added with unshift() AFTER unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          fw.unwatchArray(array, 'job');
          array.unshift(element);
        });
        testUnwatchProperty();
      });



    }); // end unwatch property



    // =========================================== UNWATCH ARRAY =========================================== //
    describe("[unwatch array]", function() {


      var testUnwatchArray = function () {


        it("should deactivate all the handlers for the specified array", function() {
          element.job = 'monster';
          element.name = 'Bower';
          expect(callStack.length).toBe(0);
        });


        it("should deactivate only the array handlers, not individual member handlers", function() {

          fw.watch(element, 'name', handlerGen('elementHandler'));
          fw.unwatchArray(array);

          var prevVal = element.name;
          element.job = 'monster';
          element.name = 'Bower';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('elementHandler');
          expect(callStack[0].mod.property).toBe('name');
          expect(callStack[0].mod.from).toBe(prevVal);
          expect(callStack[0].mod.to).toBe('Bower');
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
        fw.watchArray(array, 'name', handlerGen('nameHandler'));

      });


      describe("on an existing element", function() {
        beforeEach(function() {
          element = array[0];
          fw.unwatchArray(array);
        });
        testUnwatchArray();
      });

      describe("on a new element added with push() BEFORE unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          array.push(element);
          fw.unwatchArray(array);
        });
        testUnwatchArray();
      });

      describe("on a new element added with push() AFTER unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          fw.unwatchArray(array);
          array.push(element);
        });
        testUnwatchArray();
      });

      describe("on a new element added with unshift() BEFORE unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          array.unshift(element);
          fw.unwatchArray(array);
        });
        testUnwatchArray();
      });

      describe("on a new element added with unshift() AFTER unwatching", function() {
        beforeEach(function() {
          element = { name: 'Bower', job: 'monster' };
          fw.unwatchArray(array);
          array.unshift(element);
        });
        testUnwatchArray();
      });



    }); // end unwatch array

  }); // end calling handlers


});
