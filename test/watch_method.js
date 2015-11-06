describe("[watch - method]", function() {



  var fw = window.fw;

  var object, callStack, handlers;

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
    object = {};
    callStack = [];
    handlers = {};
  });


  // =========================================== ERRORS =========================================== //
  describe("[watchMethod() errors]", function() {

    var executeErrorsTest = function () {

      it("should throw an error if the first parameter is not an object", function() {
        var error = undefined;
        try {
          fw.watchMethod(100, 'testMethod', function () {});
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });

      it("should throw an error if the first parameter is undefined", function() {
        var error = undefined;
        try {
          fw.watchMethod(undefined, 'testMethod', function () {});
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });

      // TODO support method redefinition
      it("should throw an error if the property is not defined as a method", function() {
        var error = undefined;
        try {
          fw.watchMethod(object, 'undefinedMethod', function () {});
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });

      it("should throw an error if the second parameter is not a string", function() {
        var error = undefined;
        try {
          fw.watchMethod(object, 100, function () {});
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });


      it("should throw an error if the second parameter is undefined", function() {
        var error = undefined;
        try {
          fw.watchMethod(object, undefined, function () {});
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });

      it("should throw an error if the third parameter is not a function", function() {
        var error = undefined;
        try {
          fw.watchMethod(object, 'testMethod', 46);
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
      });
    };



    describe("on an Object method defined in a property", function() {
      beforeEach(function() {
        object = {
          testMethod: function () {},
          unwatchedMethod: function () {},
        };
      });
      executeErrorsTest();
    });

    describe("on an Object method defined in prototype", function() {
      beforeEach(function() {
        var ObjectClass = function () {};

        ObjectClass.prototype.testMethod = function () {};
        ObjectClass.prototype.unwatchedMethod = function () {};

        object = new ObjectClass();
      });
      executeErrorsTest();
    });

  });


  // =========================================== OBJECT STATUS =========================================== //
  describe("[object status]", function() {

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

    var executeObjectStatusTest = function () {


      it("Object.keys() should remain the same after setting a watch", function() {
        var keysBefore = Object.keys(object);
        fw.watchMethod(object, 'testMethod', function () {});
        var keysAfter = Object.keys(object);

        expect(arraysEqual(keysBefore, keysAfter)).toBe(true);
      });


      it("object should have the non enumerable internal properties", function() {

        expect(object[fw.WM_BACKUP]).toBeUndefined();
        expect(object[fw.WM_HANDLERS]).toBeUndefined();

        fw.watchMethod(object, 'testMethod', function () {});

        expect(object[fw.WM_BACKUP]).toBeDefined();
        expect(object[fw.WM_HANDLERS]).toBeDefined();
      });

      describe("unwatchMethod ", function() {

        it("should remove internal properties if removing the last handler", function() {

          expect(object[fw.WM_BACKUP]).toBeUndefined();
          expect(object[fw.WM_HANDLERS]).toBeUndefined();

          var handler = function () {};
          var handler2 = function () {};

          fw.watchMethod(object, 'testMethod', handler);
          fw.watchMethod(object, 'testMethod', handler2);

          expect(object[fw.WM_BACKUP]).toBeDefined();
          expect(object[fw.WM_HANDLERS]).toBeDefined();

          fw.unwatchMethod(object, 'testMethod', handler);

          expect(object[fw.WM_BACKUP]).toBeDefined();
          expect(object[fw.WM_HANDLERS]).toBeDefined();

          fw.unwatchMethod(object, 'testMethod', handler2);

          expect(object[fw.WM_BACKUP]).toBeUndefined();
          expect(object[fw.WM_HANDLERS]).toBeUndefined();
        });

      });
    };


    describe("on an Object method defined in a property", function() {
      beforeEach(function() {
        object = {
          testMethod: function () {},
          unwatchedMethod: function () {},
        };
      });
      executeObjectStatusTest();
    });

    describe("on an Object method defined in prototype", function() {
      beforeEach(function() {
        var ObjectClass = function () {};

        ObjectClass.prototype.testMethod = function () {};
        ObjectClass.prototype.unwatchedMethod = function () {};

        object = new ObjectClass();
      });
      executeObjectStatusTest();
    });

  });

  // =========================================== CALLING HANDLERS =========================================== //

  describe("[calling handlers]", function() {
    describe("[basic features]", function() {


      var testCallingHandlers = function () {

        it("should call the handlers if calling a watched method", function() {

          var arg0 = 123, arg1 = true;
          object.testMethod(arg0, arg1);

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('methodHandler');
          expect(callStack[0].mod.method).toBe('testMethod');
          expect(callStack[0].mod.args[0]).toBe(arg0);
          expect(callStack[0].mod.args[1]).toBe(arg1);
          expect(callStack[0].mod.object).toBe(object);
        });

        it("should call the handlers if calling a watched method with apply()", function() {

          var arg0 = 123, arg1 = true;
          object.testMethod.apply(object, [arg0, arg1]);

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('methodHandler');
          expect(callStack[0].mod.method).toBe('testMethod');
          expect(callStack[0].mod.args[0]).toBe(arg0);
          expect(callStack[0].mod.args[1]).toBe(arg1);
          expect(callStack[0].mod.object).toBe(object);
        });

        it("should call the handlers if calling a watched method with call()", function() {

          var arg0 = 123, arg1 = true;
          object.testMethod.call(object, arg0, arg1);

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('methodHandler');
          expect(callStack[0].mod.method).toBe('testMethod');
          expect(callStack[0].mod.args[0]).toBe(arg0);
          expect(callStack[0].mod.args[1]).toBe(arg1);
          expect(callStack[0].mod.object).toBe(object);
        });


        it("should call ALL the handlers if calling a watched method", function() {

          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));

          var arg0 = 123, arg1 = true;
          object.testMethod(arg0, arg1);

          expect(callStack.length).toBe(2);
          expect(callStack[0].handlerId).toBe('methodHandler');
          expect(callStack[0].mod.method).toBe('testMethod');
          expect(callStack[0].mod.args[0]).toBe(arg0);
          expect(callStack[0].mod.args[1]).toBe(arg1);
          expect(callStack[0].mod.object).toBe(object);
          expect(callStack[1].handlerId).toBe('methodHandler2');
          expect(callStack[1].mod.method).toBe('testMethod');
          expect(callStack[1].mod.args[0]).toBe(arg0);
          expect(callStack[1].mod.args[1]).toBe(arg1);
          expect(callStack[1].mod.object).toBe(object);
        });

        it("should NOT call the handlers if calling a NON WATCHED method", function() {
          var arg0 = 123, arg1 = true;
          object.unwatchedMethod(object, arg0, arg1);
          expect(callStack.length).toBe(0);
        });

      };



      beforeEach(function() {
        callStack = [];
      });


      describe("on an Object method defined in a property", function() {
        beforeEach(function() {
          object = {
            testMethod: function () {},
            unwatchedMethod: function () {},
          };
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
        });
        testCallingHandlers();
      });

      describe("on an Object method defined in prototype", function() {
        beforeEach(function() {
          var ObjectClass = function () {};

          ObjectClass.prototype.testMethod = function () {};
          ObjectClass.prototype.unwatchedMethod = function () {};

          object = new ObjectClass();

          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
        });
        testCallingHandlers();
      });





    }); // end calling handlers



    // =========================================== UNWATCH SPECIFIC METHOD HANDLER =========================================== //
    describe("[unwatch handler]", function() {


      var testUnwatchHandler = function () {


        it("should deactivate only the specified handler", function() {

          fw.unwatchMethod(object, 'testMethod', handlers.methodHandler2);

          var arg0 = 123, arg1 = true;
          object.testMethod(arg0, arg1);

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('methodHandler');
          expect(callStack[0].mod.method).toBe('testMethod');
          expect(callStack[0].mod.args[0]).toBe(arg0);
          expect(callStack[0].mod.args[1]).toBe(arg1);
          expect(callStack[0].mod.object).toBe(object);

        });

      };


      describe("on an Object method defined in a property", function() {
        beforeEach(function() {
          object = {
            testMethod: function () {},
            unwatchedMethod: function () {},
          };
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
        });
        testUnwatchHandler();
      });

      describe("on an Object method defined in prototype", function() {
        beforeEach(function() {
          var ObjectClass = function () {};

          ObjectClass.prototype.testMethod = function () {};
          ObjectClass.prototype.unwatchedMethod = function () {};

          object = new ObjectClass();

          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
        });
        testUnwatchHandler();
      });


    }); // end unwatch handler




    // // =========================================== UNWATCH METHOD =========================================== //
    describe("[unwatch method]", function() {


      var testUnwatchMethod = function () {


        it("should deactivate all the handlers for the specified method", function() {

          object.testMethod();
          expect(callStack.length).toBe(2);

          fw.unwatchMethod(object, 'testMethod');

          callStack = [];
          object.testMethod();
          expect(callStack.length).toBe(0);
        });


        it("should deactivate only the handlers for the specified property", function() {

          object.testMethod();
          object.otherMethod();
          expect(callStack.length).toBe(3);

          fw.unwatchMethod(object, 'testMethod');

          callStack = [];

          object.testMethod();
          object.otherMethod();

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('otherMethodHandler');
          expect(callStack[0].mod.method).toBe('otherMethod');
          expect(callStack[0].mod.args.length).toBe(0);
          expect(callStack[0].mod.object).toBe(object);
        });

      };


      describe("on an Object method defined in a property", function() {
        beforeEach(function() {
          object = {
            testMethod: function () {},
            otherMethod: function () {},
            unwatchedMethod: function () {},
          };
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
          fw.watchMethod(object, 'otherMethod', handlerGen('otherMethodHandler'));
        });
        testUnwatchMethod();
      });

      describe("on an Object method defined in prototype", function() {
        beforeEach(function() {
          var ObjectClass = function () {};

          ObjectClass.prototype.testMethod = function () {};
          ObjectClass.prototype.otherMethod = function () {};
          ObjectClass.prototype.unwatchedMethod = function () {};

          object = new ObjectClass();

          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
          fw.watchMethod(object, 'otherMethod', handlerGen('otherMethodHandler'));
        });
        testUnwatchMethod();
      });



    }); // end unwatch method



    // // =========================================== UNWATCH OBJECT =========================================== //
    describe("[unwatch object]", function() {


      var testUnwatchObject = function () {


        it("should deactivate all the method handlers for the specified object", function() {

          object.testMethod();
          object.otherMethod();

          expect(callStack.length).toBe(3);

          fw.unwatchMethod(object);

          callStack = [];
          object.testMethod();
          object.otherMethod();

          expect(callStack.length).toBe(0);
        });


        it("should deactivate only the method handlers, not property handlers", function() {

          fw.watch(object, 'name', handlerGen('elementHandler'));
          fw.unwatchMethod(object);


          object.testMethod();
          object.otherMethod();

          var prevVal = object.name;
          object.name = 'Bower';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('elementHandler');
          expect(callStack[0].mod.property).toBe('name');
          expect(callStack[0].mod.from).toBe(prevVal);
          expect(callStack[0].mod.to).toBe('Bower');
          expect(callStack[0].mod.object).toBe(object);
        });

      };



      describe("on an Object method defined in a property", function() {
        beforeEach(function() {
          object = {
            testMethod: function () {},
            otherMethod: function () {},
            unwatchedMethod: function () {},
          };
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
          fw.watchMethod(object, 'otherMethod', handlerGen('otherMethodHandler'));
        });
        testUnwatchObject();
      });

      describe("on an Object method defined in prototype", function() {
        beforeEach(function() {
          var ObjectClass = function () {};

          ObjectClass.prototype.testMethod = function () {};
          ObjectClass.prototype.otherMethod = function () {};
          ObjectClass.prototype.unwatchedMethod = function () {};

          object = new ObjectClass();

          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler'));
          fw.watchMethod(object, 'testMethod', handlerGen('methodHandler2'));
          fw.watchMethod(object, 'otherMethod', handlerGen('otherMethodHandler'));
        });
        testUnwatchObject();
      });


    }); // end unwatch object

  }); // end calling handlers


});
