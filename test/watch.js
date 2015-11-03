describe("watch", function() {



  var fw = window.fw;





  describe("when watching a simple property", function() {


    var object, callResults, handler1, handler2;

    handler1 = function () {
      callResults.handler1 = {
        args: arguments
      };
    };

    handler2 = function () {
      callResults.handler2 = {
        args: arguments
      };
    };



    beforeEach(function(){

      object = {
        propName : 'initial value',
        nonWatchedProp : 'initial value'
      };

      callResults = {};

      fw.watch(object, 'propName', handler1);
      fw.watch(object, 'propName', handler2);

    });



    it("should call the watch handlers if setting a new value on a WATCHED property", function() {
      object.propName = 'new value';
      expect(callResults.handler1).toBeDefined();
      expect(callResults.handler2).toBeDefined();
    });


    it("should NOT call handlers on a NON WATCHED property", function() {
      object.nonWatchedProp = 'new value';
      expect(callResults.handler1).toBeUndefined();
      expect(callResults.handler2).toBeUndefined();
    });

    it("should NOT call handlers on an UNWATCHED property", function() {
      fw.unwatch(object, 'propName');
      object.propName = 'new value';
      expect(callResults.handler1).toBeUndefined();
      expect(callResults.handler2).toBeUndefined();
    });

    it("should NOT call an UNWATCHED handler", function() {
      fw.unwatch(object, 'propName', handler2);
      object.propName = 'new value';
      expect(callResults.handler1).toBeDefined();
      expect(callResults.handler2).toBeUndefined();
    });



  });




  // ============================================ WATCHING METHODS ============================================ //


  describe(".watchMethod() on array", function() {


    var array, callResults, handler1, handler2, handler3;

    handler1 = function () {
      callResults.handler1 = {
        args: arguments
      };
    };

    handler2 = function () {
      callResults.handler2 = {
        args: arguments
      };
    };

    handler3 = function () {
      callResults.handler3 = {
        args: arguments
      };
    };



    beforeEach(function(){
      array = [];
      callResults = {};
    });



    it("should call the watch handlers if calling the method", function() {

      fw.watchMethod(array, 'push', handler1);
      fw.watchMethod(array, 'push', handler2);

      array.push(1);

      expect(callResults.handler1).toBeDefined();
      expect(callResults.handler2).toBeDefined();

      expect(callResults.handler1.args[0].args[0]).toBe(1);
      expect(callResults.handler1.args[0].method).toBe('push');
      expect(callResults.handler1.args[0].object).toBe(array);

      expect(callResults.handler2.args[0].args[0]).toBe(1);
      expect(callResults.handler2.args[0].method).toBe('push');
      expect(callResults.handler2.args[0].object).toBe(array);
    });


    it("can be set on different methods", function() {

      fw.watchMethod(array, 'push', handler1);
      fw.watchMethod(array, 'slice', handler2);

      array.push(1);
      array.slice(0, 1);

      expect(callResults.handler1).toBeDefined();
      expect(callResults.handler2).toBeDefined();

      expect(callResults.handler1.args[0].args[0]).toBe(1);
      expect(callResults.handler1.args[0].method).toBe('push');
      expect(callResults.handler1.args[0].object).toBe(array);

      expect(callResults.handler2.args[0].args[0]).toBe(0);
      expect(callResults.handler2.args[0].args[1]).toBe(1);
      expect(callResults.handler2.args[0].method).toBe('slice');
      expect(callResults.handler2.args[0].object).toBe(array);
    });




    describe('.unwatchMethod()', function () {

      beforeEach(function(){
        fw.watchMethod(array, 'push', handler1);
        fw.watchMethod(array, 'slice', handler2);
        fw.watchMethod(array, 'slice', handler3);
      });


      describe('when called with no method specified', function () {


        it ('should unwatch all methods', function () {

          fw.unwatchMethod(array);

          array.push(1);
          array.slice(0, 1);

          expect(callResults.handler1).toBeUndefined();
          expect(callResults.handler2).toBeUndefined();
          expect(callResults.handler3).toBeUndefined();
        });
      });



      describe('when called specifying a method', function () {


        it ('should unwatch just that method', function () {

          fw.unwatchMethod(array, 'push');

          array.push(1);
          array.slice(0, 1);

          expect(callResults.handler1).toBeUndefined();
          expect(callResults.handler2).toBeDefined();
          expect(callResults.handler3).toBeDefined();
        });
      });


      describe('when called specifying a method and a function', function () {


        it ('should unwatch just that function', function () {

          fw.unwatchMethod(array, 'slice', handler3);

          array.push(1);
          array.slice(0, 1);

          expect(callResults.handler1).toBeDefined();
          expect(callResults.handler2).toBeDefined();
          expect(callResults.handler3).toBeUndefined();
        });
      });

    });


  });





});
