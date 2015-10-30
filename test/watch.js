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


    it("should NOT call the watch handlers if setting a new value on a NON WATCHED property", function() {
      object.nonWatchedProp = 'new value';
      expect(callResults.handler1).toBeUndefined();
      expect(callResults.handler2).toBeUndefined();
    });

    it("should NOT call the watch handlers if setting a new value on an UNWATCHED property", function() {
      fw.unwatch(object, 'propName');
      object.propName = 'new value';
      expect(callResults.handler1).toBeUndefined();
      expect(callResults.handler2).toBeUndefined();
    });

    it("should NOT call an unwatched handler", function() {
      fw.unwatch(object, 'propName', handler2);
      object.propName = 'new value';
      expect(callResults.handler1).toBeDefined();
      expect(callResults.handler2).toBeUndefined();
    });



  });






});

/*



var tests = {
  'watched property handler fired' : 'failed',
  'watched undefined property handler fired' : 'failed',
  'unwatched property handler not fired' : 'success'
};

function Person (name, age) {
  this.name = name;
  this.age = age;
}

var o = new Person('Mario', 32);


o.age = 20;
o.name = 'No fire';



fw.watch(o, 'age', function (obj, prop, from, to) { tests['watched property handler fired'] = 'success'; });
fw.watch(o, 'lillo', function (obj, prop, from, to) { tests['watched undefined property handler fired'] = 'success'; });


var handler = function (obj, prop, from, to) { tests['unwatched property handler not fired'] = 'failed'; };
fw.watch(o, 'name', handler);
fw.unwatch(o, 'name', handler);

o.age = 6;
o.name = 'No fire';
o.lillo = 'Fire';


fw.unwatch(o);


o.age = 100;
o.name = 'No fire 2';




console.log('TESTS', tests);



// watch method (watch different funcs)

var array = ['pippo', 'pluto', 'paperino'];

function pippo (mod) {
   console.log('PIPPO', mod);
}
fw.watchMethod(array, 'unshift', function (mod) { console.log('FIRED unshift', mod); });
fw.watchMethod(array, 'unshift', function (mod) { console.log('FIRED unshift 2', mod); });
fw.watchMethod(array, 'unshift', pippo);
fw.watchMethod(array, 'push', function (mod) { console.log('FIRED push', mod); });

fw.unwatchMethod(array);

console.log(Object.keys(array), array);


array.unshift('qui', 'quo', 'qua');
array.push('qui', 'quo', 'qua');

 */