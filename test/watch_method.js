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

    beforeEach(function () {
      object = {
        testMethod : function () {}
      };
    });

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

  });


  // =========================================== OBJECT STATUS =========================================== //
  describe("[object status]", function() {

    beforeEach(function () {
      object = {
        testMethod : function () {}
      };
    });

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





    }); // end calling handlers



    // =========================================== UNWATCH SPECIFIC METHOD HANDLER =========================================== //
    // xdescribe("[unwatch handler]", function() {


    //   var testUnwatchHandler = function () {


    //     it("should deactivate only the specified handler", function() {

    //       var prevVal = element.job;
    //       element.job = 'monster';

    //       expect(callStack.length).toBe(1);
    //       expect(callStack[0].handlerId).toBe('jobHandler2');
    //       expect(callStack[0].mod.property).toBe('job');
    //       expect(callStack[0].mod.from).toBe(prevVal);
    //       expect(callStack[0].mod.to).toBe('monster');
    //       expect(callStack[0].mod.object).toBe(element);

    //     });

    //   };


    //   beforeEach(function() {
    //     callStack = [];
    //     array = [
    //       { name: 'Mario', job: 'plumber' },
    //       { name: 'Luigi', job: 'plumber' }
    //     ];

    //     fw.watchArray(array, 'job', handlerGen('jobHandler'));
    //     fw.watchArray(array, 'job', handlerGen('jobHandler2'));

    //   });


    //   describe("on an existing element", function() {
    //     beforeEach(function() {
    //       element = array[0];
    //       fw.unwatchArray(array, 'job', handlers.jobHandler);
    //     });
    //     testUnwatchHandler();
    //   });

    //   describe("on a new element added with push() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.push(element);
    //       fw.unwatchArray(array, 'job', handlers.jobHandler);
    //     });
    //     testUnwatchHandler();
    //   });

    //   describe("on a new element added with push() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array, 'job', handlers.jobHandler);
    //       array.push(element);
    //     });
    //     testUnwatchHandler();
    //   });

    //   describe("on a new element added with unshift() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.unshift(element);
    //       fw.unwatchArray(array, 'job', handlers.jobHandler);
    //     });
    //     testUnwatchHandler();
    //   });

    //   describe("on a new element added with unshift() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array, 'job', handlers.jobHandler);
    //       array.unshift(element);
    //     });
    //     testUnwatchHandler();
    //   });




    //   describe("should not deactivate any handler", function() {

    //     beforeEach(function() {
    //       element = array[0];
    //     });

    //     it("if the provided handler is not an handler", function() {


    //       fw.unwatchArray(array, 'job', function(){});

    //       var prevVal = element.job;
    //       element.job = 'monster';

    //       expect(callStack.length).toBe(2);
    //       expect(callStack[0].handlerId).toBe('jobHandler');
    //       expect(callStack[0].mod.property).toBe('job');
    //       expect(callStack[0].mod.from).toBe(prevVal);
    //       expect(callStack[0].mod.to).toBe('monster');
    //       expect(callStack[0].mod.object).toBe(element);
    //       expect(callStack[1].handlerId).toBe('jobHandler2');
    //       expect(callStack[1].mod.property).toBe('job');
    //       expect(callStack[1].mod.from).toBe(prevVal);
    //       expect(callStack[1].mod.to).toBe('monster');
    //       expect(callStack[1].mod.object).toBe(element);

    //     });

    //     it("if the provided handler is an element handler but not an array handler", function() {


    //       fw.watch(element, 'job', handlerGen('elementHandler'));
    //       fw.unwatchArray(array, 'job', handlers.elementHandler);

    //       var prevVal = element.job;
    //       element.job = 'monster';

    //       expect(callStack.length).toBe(3);
    //       expect(callStack[0].handlerId).toBe('jobHandler');
    //       expect(callStack[0].mod.property).toBe('job');
    //       expect(callStack[0].mod.from).toBe(prevVal);
    //       expect(callStack[0].mod.to).toBe('monster');
    //       expect(callStack[0].mod.object).toBe(element);
    //       expect(callStack[1].handlerId).toBe('jobHandler2');
    //       expect(callStack[1].mod.property).toBe('job');
    //       expect(callStack[1].mod.from).toBe(prevVal);
    //       expect(callStack[1].mod.to).toBe('monster');
    //       expect(callStack[1].mod.object).toBe(element);
    //       expect(callStack[2].handlerId).toBe('elementHandler');
    //       expect(callStack[2].mod.property).toBe('job');
    //       expect(callStack[2].mod.from).toBe(prevVal);
    //       expect(callStack[2].mod.to).toBe('monster');
    //       expect(callStack[2].mod.object).toBe(element);

    //     });
    //   });




    // }); // end unwatch handler




    // // =========================================== UNWATCH PROPERTY =========================================== //
    // xdescribe("[unwatch property]", function() {


    //   var testUnwatchProperty = function () {


    //     it("should deactivate all the handlers for the specified property", function() {
    //       var prevVal = element.job;
    //       element.job = 'monster';
    //       expect(callStack.length).toBe(0);
    //     });


    //     it("should deactivate only the handlers for the specified property", function() {
    //       var prevVal = element.name;
    //       element.job = 'monster';
    //       element.name = 'Bower';

    //       expect(callStack.length).toBe(1);
    //       expect(callStack[0].handlerId).toBe('nameHandler');
    //       expect(callStack[0].mod.property).toBe('name');
    //       expect(callStack[0].mod.from).toBe(prevVal);
    //       expect(callStack[0].mod.to).toBe('Bower');
    //       expect(callStack[0].mod.object).toBe(element);
    //     });

    //   };


    //   beforeEach(function() {
    //     callStack = [];
    //     array = [
    //       { name: 'Mario', job: 'plumber' },
    //       { name: 'Luigi', job: 'plumber' }
    //     ];

    //     fw.watchArray(array, 'job', handlerGen('jobHandler'));
    //     fw.watchArray(array, 'job', handlerGen('jobHandler2'));
    //     fw.watchArray(array, 'name', handlerGen('nameHandler'));

    //   });


    //   describe("on an existing element", function() {
    //     beforeEach(function() {
    //       element = array[0];
    //       fw.unwatchArray(array, 'job');
    //     });
    //     testUnwatchProperty();
    //   });

    //   describe("on a new element added with push() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.push(element);
    //       fw.unwatchArray(array, 'job');
    //     });
    //     testUnwatchProperty();
    //   });

    //   describe("on a new element added with push() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array, 'job');
    //       array.push(element);
    //     });
    //     testUnwatchProperty();
    //   });

    //   describe("on a new element added with unshift() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.unshift(element);
    //       fw.unwatchArray(array, 'job');
    //     });
    //     testUnwatchProperty();
    //   });

    //   describe("on a new element added with unshift() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array, 'job');
    //       array.unshift(element);
    //     });
    //     testUnwatchProperty();
    //   });



    // }); // end unwatch property



    // // =========================================== UNWATCH ARRAY =========================================== //
    // xdescribe("[unwatch array]", function() {


    //   var testUnwatchArray = function () {


    //     it("should deactivate all the handlers for the specified array", function() {
    //       element.job = 'monster';
    //       element.name = 'Bower';
    //       expect(callStack.length).toBe(0);
    //     });


    //     it("should deactivate only the array handlers, not individual member handlers", function() {

    //       fw.watch(element, 'name', handlerGen('elementHandler'));
    //       fw.unwatchArray(array);

    //       var prevVal = element.name;
    //       element.job = 'monster';
    //       element.name = 'Bower';

    //       expect(callStack.length).toBe(1);
    //       expect(callStack[0].handlerId).toBe('elementHandler');
    //       expect(callStack[0].mod.property).toBe('name');
    //       expect(callStack[0].mod.from).toBe(prevVal);
    //       expect(callStack[0].mod.to).toBe('Bower');
    //       expect(callStack[0].mod.object).toBe(element);
    //     });

    //   };


    //   beforeEach(function() {
    //     callStack = [];
    //     array = [
    //       { name: 'Mario', job: 'plumber' },
    //       { name: 'Luigi', job: 'plumber' }
    //     ];

    //     fw.watchArray(array, 'job', handlerGen('jobHandler'));
    //     fw.watchArray(array, 'job', handlerGen('jobHandler2'));
    //     fw.watchArray(array, 'name', handlerGen('nameHandler'));

    //   });


    //   describe("on an existing element", function() {
    //     beforeEach(function() {
    //       element = array[0];
    //       fw.unwatchArray(array);
    //     });
    //     testUnwatchArray();
    //   });

    //   describe("on a new element added with push() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.push(element);
    //       fw.unwatchArray(array);
    //     });
    //     testUnwatchArray();
    //   });

    //   describe("on a new element added with push() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array);
    //       array.push(element);
    //     });
    //     testUnwatchArray();
    //   });

    //   describe("on a new element added with unshift() BEFORE unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       array.unshift(element);
    //       fw.unwatchArray(array);
    //     });
    //     testUnwatchArray();
    //   });

    //   describe("on a new element added with unshift() AFTER unwatching", function() {
    //     beforeEach(function() {
    //       element = { name: 'Bower', job: 'monster' };
    //       fw.unwatchArray(array);
    //       array.unshift(element);
    //     });
    //     testUnwatchArray();
    //   });



    // }); // end unwatch array

  }); // end calling handlers


});
