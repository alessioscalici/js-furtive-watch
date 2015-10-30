
(function(root){
  'use strict';

  if (!root) {
    throw 'Cannot install module "watch" on a falsy element';
  }


  var fw = root.fw || {}, // the static functions container
    WP_BACKUP = '$$propBackup', // the name of the property used to store the watched properties data
    WP_HANDLERS = '$$propWatch';  // the name of the property used to store the watch handlers



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
            obj[WP_HANDLERS][prop][i](obj, prop, obj[WP_BACKUP][prop], v);
          }
          obj[WP_BACKUP][prop] = v;
        }
      });

    }

    // add the watch handler
    obj[WP_HANDLERS][prop].push(func);

  };





  /*
    THE PROP PARAMETER
    pippo - watch property pippo
    pippo.child - watch property child on pippo as parent
    array[].property - watch property on every element of the array
    array.0.property - watch property on element 0 of the array
    array.push() - watch the ‘push’ method of array
  */
  fw.watch = function watch(obj, prop, func) {
    if (!obj) {
      console.warn('Calling "watch" on a falsy object');
      return;
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

  // WATCH METHODS
  fw.watchMethod = function (obj, method, func) {

    // prepare the object to watch methods
    if (!obj[WM_HANDLERS]) {
      Object.defineProperty(obj, WM_BACKUP, { configurable: true, enumerable: false, writable: true, value: {} });
      Object.defineProperty(obj, WM_HANDLERS, { configurable: true, enumerable: false, writable: true, value: {} });
    }

    // if this method was never watched
    if (!obj[WM_HANDLERS][method]) {
      obj[WM_HANDLERS][method] = [];
      obj[WM_BACKUP][method] = obj[method];
      obj[method] = function () {
        var mod = {
          method: method,
          array: this,
          args: arguments
        };
        for (var i = 0, ii = obj[WM_HANDLERS][method].length; i < ii; ++i) {
          obj[WM_HANDLERS][method][i](mod);
        }
        this[WM_BACKUP][method].apply(this, arguments);
      };
      Object.defineProperty(obj, method, { configurable: true, enumerable: false });
    }

    // add the binding
    obj[WM_HANDLERS][method].push(func);

  };

  fw.unwatchMethod = function (obj, method, func) {

    /*if (!obj || !(obj[WM_HANDLERS]) || ( method && !(obj[WM_HANDLERS][method]))) {
      return;
    }*/

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



})(window);

