
(function(root, moduleName){
  'use strict';

  if (!root) {
    throw 'Cannot install module "watch" on a falsy element';
  }


  var fw = root[moduleName] || {}, // the static functions container
    WP_BACKUP = '$$propBackup', // the name of the property used to store the watched properties data
    WP_HANDLERS = '$$propWatch';  // the name of the property used to store the watch handlers

  fw.WP_BACKUP = WP_BACKUP;
  fw.WP_HANDLERS = WP_HANDLERS;

  root[moduleName] = fw;


  var watchProp = function watchProp(obj, prop, func) {

    // prepare the object to have whatched properties
    if (!obj[WP_HANDLERS]) {
      Object.defineProperty(obj, WP_BACKUP, { configurable: true, enumerable: false, writable: true, value: {} });
      Object.defineProperty(obj, WP_HANDLERS, { configurable: true, enumerable: false, writable: true, value: {} });
    }

    // prepare the object to whatch this property
    if (!obj[WP_HANDLERS][prop]) {

      obj[WP_BACKUP][prop] = obj[prop];
      delete obj[prop];
      obj[WP_HANDLERS][prop] = [];

      Object.defineProperty(obj, prop, {
        enumerable: true,
        //writable: false,
        configurable: true,
        get : function () {
          return obj[WP_BACKUP][prop];
        },
        set : function (v) {
          for (var i = 0, ii = obj[WP_HANDLERS][prop].length; i < ii; ++i) {
            var mod = {
              object: obj,
              property: prop,
              from: obj[WP_BACKUP][prop],
              to: v
            };
            obj[WP_HANDLERS][prop][i](mod);
          }
          obj[WP_BACKUP][prop] = v;
        }
      });

    }

    // add the watch handler
    obj[WP_HANDLERS][prop].push(func);

  };





  /*
    THE PROP PARAMETER (TODO)
    pippo - watch property pippo
    pippo.child - watch property child on pippo as parent
    array[].property - watch property on every element of the array
    array.0.property - watch property on element 0 of the array
    array.push() - watch the ‘push’ method of array
  */
  fw.watch = function watch(obj, prop, func) {
    if (!obj) {
      throw ('watch: obj should be a valid object');
    }
    if (!(typeof prop === 'string')) {
      throw ('watch: prop should be a string');
    }
    if (!(typeof func === 'function')) {
      throw ('watch: func should be a function');
    }
    watchProp(obj, prop, func);
  };

  var unwatchProp = function unwatchProp(obj, prop, func) {

    if (obj[WP_HANDLERS] && obj[WP_HANDLERS][prop]) {
      if (func) {
        obj[WP_HANDLERS][prop].splice(obj[WP_HANDLERS][prop].indexOf(func), 1);
      } else {
        obj[WP_HANDLERS][prop].length = 0; // delete all handlers
      }

      // clean the property if there are no more handlers
      if (obj[WP_HANDLERS][prop].length === 0) {
        Object.defineProperty(obj, prop, {
          enumerable: true,
          writable: true,
          configurable: true,
          value: obj[WP_BACKUP][prop]
        });
        delete obj[WP_BACKUP][prop];
        delete obj[WP_HANDLERS][prop];
      }
    }
  };


  fw.unwatch = function unwatch(obj, prop, func) {
    if (!prop) {
      for (var k in obj[WP_HANDLERS]) {
        if (obj[WP_HANDLERS].hasOwnProperty(k)) {
          unwatchProp(obj, k);
        }
      }
    } else {
      unwatchProp(obj, prop, func);
    }

    // clean object if there are no more watchers
    if (Object.keys(obj[WP_HANDLERS]).length === 0) {
      delete obj[WP_BACKUP];
      delete obj[WP_HANDLERS];
    }
  };




  var WM_BACKUP = '$$methods',
      WM_HANDLERS = '$$methodHandlers';

  fw.WM_BACKUP = WM_BACKUP;
  fw.WM_HANDLERS = WM_HANDLERS;

  // WATCH METHODS
  fw.watchMethod = function (obj, method, func) {

    if (!obj || typeof obj !== 'object') {
      throw ('watch: obj should be a valid object');
    }
    if (!(typeof method === 'string')) {
      throw ('watch: method should be a string');
    }
    if (!(typeof func === 'function')) {
      throw ('watch: func should be a function');
    }

    // TODO support method redefinition
    if (!(typeof obj[method] === 'function')) {
      throw ('watch: the watched method should be a function');
    }

    // prepare the object to watch methods
    if (!obj[WM_HANDLERS]) {
      Object.defineProperty(obj, WM_BACKUP, { configurable: true, enumerable: false, writable: true, value: {} });
      Object.defineProperty(obj, WM_HANDLERS, { configurable: true, enumerable: false, writable: true, value: {} });
    }

    // if this method was never watched
    if (!obj[WM_HANDLERS][method]) {
      obj[WM_HANDLERS][method] = [];
      obj[WM_BACKUP][method] = obj[method];
      var methodEnumerable = obj.propertyIsEnumerable(method);
      obj[method] = function () {
        var mod = {
          method: method,
          object: this,
          args: arguments //Array.prototype.slice.call(arguments)
        };
        for (var i = 0, ii = obj[WM_HANDLERS][method].length; i < ii; ++i) {
          obj[WM_HANDLERS][method][i](mod);
        }
        this[WM_BACKUP][method].apply(this, arguments);
      };
      Object.defineProperty(obj, method, { configurable: true, enumerable: methodEnumerable });
    }

    // add the binding
    obj[WM_HANDLERS][method].push(func);

  };

  fw.unwatchMethod = function (obj, method, func) {

    if (!obj) {
      throw 'first argument invalid';
    }

    if (!(obj[WM_HANDLERS]) || ( method && !(obj[WM_HANDLERS][method]))) {
      return;
    }

    if (!method) {
      for (var m in obj[WM_HANDLERS]) {
        if (obj[WM_HANDLERS].hasOwnProperty(m)) {
          obj[m] = obj[WM_BACKUP][m];
        }
      }
      delete obj[WM_HANDLERS];
      delete obj[WM_BACKUP];
      return;
    }

    if (typeof func === 'function') {
      obj[WM_HANDLERS][method].splice(obj[WM_HANDLERS][method].indexOf(func), 1);
    } else {
      obj[WM_HANDLERS][method].length = 0; // delete all handlers
    }

    if (obj[WM_HANDLERS][method].length === 0) {
      obj[method] = obj[WM_BACKUP][method];
      delete obj[WM_HANDLERS][method];
      delete obj[WM_BACKUP][method];
    }

    if (Object.keys(obj[WM_HANDLERS]).length === 0) {
      delete obj[WM_HANDLERS];
      delete obj[WM_BACKUP];
    }

  };





  var WA_HANDLERS = '$$elemHandlers',
    WA_METHOD_HANDLER = '$$arrayMethodHandler',
    newElementsHandler = function (self) {
      return function (mod) {
        // for each unshift() / push() argument
        for (var i = 0, ii = mod.args.length; i < ii; ++i) {
          if (mod.args[i]) {
            // for each watched property
            for (var prop in self[WA_HANDLERS]) {
              if (self[WA_HANDLERS].hasOwnProperty(prop)) {
                // for each handler
                for (var j = 0, jj = self[WA_HANDLERS][prop].length; j < jj; ++j) {
                  fw.watch(mod.args[i], prop, self[WA_HANDLERS][prop][j]);
                }
              }
            }
          }
        }
      };
    };

  fw.WA_HANDLERS = WA_HANDLERS;
  fw.WA_METHOD_HANDLER = WA_METHOD_HANDLER;



  fw.watchArray = function (obj, prop, func) {

    if (!(obj && obj.constructor === Array)) {
      throw 'watchArray: obj must be an Array';
    }
    if (!(typeof prop === 'string')) {
      throw 'watchArray: prop must be a string';
    }
    if (!(typeof func === 'function')) {
      throw 'watchArray: func must be a function';
    }

    // prepare the array to watch element properties
    if (!obj[WA_HANDLERS]) {
      Object.defineProperty(obj, WA_HANDLERS, { configurable: true, enumerable: false, writable: true, value: {} });
      Object.defineProperty(obj, WA_METHOD_HANDLER, { configurable: true, enumerable: false, writable: true, value: newElementsHandler(obj) });
      fw.watchMethod(obj, 'push', obj[WA_METHOD_HANDLER]);
      fw.watchMethod(obj, 'unshift', obj[WA_METHOD_HANDLER]);
    }

    // prepare the array to watch this property
    if (!obj[WA_HANDLERS][prop]) {
      obj[WA_HANDLERS][prop] = [];
    }


    obj[WA_HANDLERS][prop].push(func);


    for (var i = 0, ii = obj.length; i < ii; ++i ) {
      fw.watch(obj[i], prop, func);
    }


  };



  fw.unwatchArray = function (obj, prop, func) {
    if (!obj || !obj[WA_HANDLERS]) {
      return;
    }

    var unwatchElems = function (arr, prop, func) {
        // for each element of the array, unwatch the specified handler
        for (var i = 0, ii = arr.length; i < ii; ++i ) {
          fw.unwatch(arr[i], prop, func);
        }
      },
      unwatchProp = function (arr, prop) {
        // for each ARRAY handler for this property, unwatch all elements
        for (var j = 0, aux = obj[WA_HANDLERS][prop], jj = aux.length; j < jj; ++j ) {
          unwatchElems(arr, prop, aux[j]);
        }
      };

    if (!prop) {
      // unwatch all properties

      // for each ARRAY watched property
      for (var k in obj[WA_HANDLERS]) {
        if (obj[WA_HANDLERS].hasOwnProperty(k)) {
          unwatchProp(obj, k);
        }
      }

      obj[WA_HANDLERS] = {}; // remove all array handlers

    } else if (!func) {
      // unwatch only this property
      unwatchProp(obj, prop);
      delete obj[WA_HANDLERS][prop]; // remove all array handlers for this property
    } else {
      // unwatch only this handler
      var ar = obj[WA_HANDLERS][prop],
        indexOfFunc = ar.indexOf(func);
      if (indexOfFunc === -1) { // handler not found
        return;
      }
      ar.splice(indexOfFunc, 1); // remove the single array handler
      unwatchElems(obj, prop, func);

      // delete array handlers array for this property if it's empty
      if (obj[WA_HANDLERS][prop].length === 0) {
        delete obj[WA_HANDLERS][prop];
      }
    }



    // clean the array if there are no more handlers
    if (Object.keys(obj[WA_HANDLERS]).length === 0) {
      fw.unwatchMethod(obj, 'push', obj[WA_METHOD_HANDLER]);
      fw.unwatchMethod(obj, 'unshift', obj[WA_METHOD_HANDLER]);
      delete obj[WA_HANDLERS];
      delete obj[WA_METHOD_HANDLER];
    }

  };



})(window, 'fw');

