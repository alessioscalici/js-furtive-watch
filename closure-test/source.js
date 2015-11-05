
var Person = function Person(name, age) {
  this.name = name;
  this.age = age;
};



var carlo = new Person('Carlo', 30);


Object.defineProperty(carlo, '_name', { configurable: true, enumerable: false, writable: true, value: carlo.name });
Object.defineProperty(carlo, 'name', { configurable: true, enumerable: true, get: function () { return this._name }, set: function (v) {  console.log('setting name'); this._name = v; } });


carlo.name = 'Castaneda';
//console.log(carlo.name);



