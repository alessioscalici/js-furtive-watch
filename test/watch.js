describe("watch", function() {



  var fw = window.fw;
  beforeEach(function(){



  });




  describe("when watching a simple property", function() {


    var object, callFlag;

    beforeEach(function(){

      object = {
        propName : 'initial value'
      };

      callFlag = false;

      fw.watch(object, 'propName', function () {
        callFlag = true;
      });

    });



    it("should call the watch handler", function() {

      object.propName = 'new value';
      expect(callFlag).toBe(true);

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