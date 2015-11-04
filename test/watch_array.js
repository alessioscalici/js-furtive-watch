describe("watch - array elements", function() {



  var fw = window.fw;

  var array, callStack, handlers, newElement;

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



  describe("when watching an array element property", function() {



    it("should call the watch handlers if setting a new value on a WATCHED element property", function() {

      fw.watchArray(array, 'name', handlerGen('nameHandler'));

      array[0].name = 'Bower';

      expect(callStack.length).toBe(1);
      expect(callStack[0].handlerId).toBe('nameHandler');
      expect(callStack[0].mod.property).toBe('name');
      expect(callStack[0].mod.from).toBe('Mario');
      expect(callStack[0].mod.to).toBe('Bower');
      expect(callStack[0].mod.object).toBe(array[0]);

    });



    describe("when a NEW ELEMENT is added with push()", function() {

      var newElement;

      beforeEach(function() {
        callStack = [];

        array = [
          { name: 'Mario', job: 'plumber' },
          { name: 'Luigi', job: 'plumber' }
        ];

        newElement = { name: 'Bower', job: 'monster' };
        fw.watchArray(array, 'job', handlerGen('jobHandler'));
        array.push(newElement);

      });


      it("should call the watch handlers if setting a new value on a watched NEW ELEMENT property", function() {

        newElement.job = 'level boss';

        expect(callStack.length).toBe(1);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe('monster');
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(newElement);
      });


      it("should call ALL the watch handlers if setting a new value on a watched NEW ELEMENT property", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));

        newElement.job = 'level boss';

        expect(callStack.length).toBe(2);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe('monster');
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(newElement);
        expect(callStack[1].handlerId).toBe('jobHandler2');
        expect(callStack[1].mod.property).toBe('job');
        expect(callStack[1].mod.from).toBe('monster');
        expect(callStack[1].mod.to).toBe('level boss');
        expect(callStack[1].mod.object).toBe(newElement);
      });

      it("should NOT call the watch handlers if setting a new value on a NON watched NEW ELEMENT property", function() {
        newElement.name = 'Super Bower';
        expect(callStack.length).toBe(0);
      });

    });




    describe("when a NEW ELEMENT is added with unshift()", function() {

      var newElement;

      beforeEach(function() {
        callStack = [];

        array = [
          { name: 'Mario', job: 'plumber' },
          { name: 'Luigi', job: 'plumber' }
        ];

        newElement = { name: 'Bower', job: 'monster' };
        fw.watchArray(array, 'job', handlerGen('jobHandler'));
        array.unshift(newElement);

      });


      it("should call the watch handlers if setting a new value on a watched NEW ELEMENT property", function() {

        newElement.job = 'level boss';

        expect(callStack.length).toBe(1);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe('monster');
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(newElement);
      });


      it("should call ALL the watch handlers if setting a new value on a watched NEW ELEMENT property", function() {

        fw.watchArray(array, 'job', handlerGen('jobHandler2'));

        newElement.job = 'level boss';

        expect(callStack.length).toBe(2);
        expect(callStack[0].handlerId).toBe('jobHandler');
        expect(callStack[0].mod.property).toBe('job');
        expect(callStack[0].mod.from).toBe('monster');
        expect(callStack[0].mod.to).toBe('level boss');
        expect(callStack[0].mod.object).toBe(newElement);
        expect(callStack[1].handlerId).toBe('jobHandler2');
        expect(callStack[1].mod.property).toBe('job');
        expect(callStack[1].mod.from).toBe('monster');
        expect(callStack[1].mod.to).toBe('level boss');
        expect(callStack[1].mod.object).toBe(newElement);
      });

      it("should NOT call the watch handlers if setting a new value on a NON watched NEW ELEMENT property", function() {
        newElement.name = 'Super Bower';
        expect(callStack.length).toBe(0);
      });

    });

  });




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




    describe("HANDLER: .unwatchArray(array, 'propertyName', handler)", function() {


      describe("should deactivate only the specified handler", function() {

        it("on an existing element", function() {


          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));

          fw.unwatchArray(array, 'job', handlers.jobHandler);

          array[0].job = 'monster';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('jobHandler2');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('plumber');
          expect(callStack[0].mod.to).toBe('monster');
          expect(callStack[0].mod.object).toBe(array[0]);

        });

        it("on new element pushed before unwatching", function() {

          newElement = { name: 'Bower', job: 'monster' };

          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));


          array.push(newElement);

          fw.unwatchArray(array, 'job', handlers.jobHandler);

          newElement.job = 'level boss';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('jobHandler2');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('monster');
          expect(callStack[0].mod.to).toBe('level boss');
          expect(callStack[0].mod.object).toBe(newElement);

        });

        it("on new element pushed after unwatching", function() {

          newElement = { name: 'Bower', job: 'monster' };

          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));

          fw.unwatchArray(array, 'job', handlers.jobHandler);

          array.push(newElement);


          newElement.job = 'level boss';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('jobHandler2');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('monster');
          expect(callStack[0].mod.to).toBe('level boss');
          expect(callStack[0].mod.object).toBe(newElement);

        });


        it("on new element unshifted before unwatching", function() {

          newElement = { name: 'Bower', job: 'monster' };

          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));


          array.unshift(newElement);

          fw.unwatchArray(array, 'job', handlers.jobHandler);

          newElement.job = 'level boss';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('jobHandler2');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('monster');
          expect(callStack[0].mod.to).toBe('level boss');
          expect(callStack[0].mod.object).toBe(newElement);

        });

        it("on new element unshifted after unwatching", function() {

          newElement = { name: 'Bower', job: 'monster' };

          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));


          fw.unwatchArray(array, 'job', handlers.jobHandler);

          array.unshift(newElement);


          newElement.job = 'level boss';

          expect(callStack.length).toBe(1);
          expect(callStack[0].handlerId).toBe('jobHandler2');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('monster');
          expect(callStack[0].mod.to).toBe('level boss');
          expect(callStack[0].mod.object).toBe(newElement);

        });


      });


      describe("should not deactivate any handler", function() {

        it("if the provided handler is not an handler", function() {


          fw.watchArray(array, 'job', handlerGen('jobHandler'));
          fw.watchArray(array, 'job', handlerGen('jobHandler2'));

          fw.unwatchArray(array, 'job', function(){});

          array[0].job = 'monster';

          expect(callStack.length).toBe(2);
          expect(callStack[0].handlerId).toBe('jobHandler');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('plumber');
          expect(callStack[0].mod.to).toBe('monster');
          expect(callStack[0].mod.object).toBe(array[0]);
          expect(callStack[1].handlerId).toBe('jobHandler2');
          expect(callStack[1].mod.property).toBe('job');
          expect(callStack[1].mod.from).toBe('plumber');
          expect(callStack[1].mod.to).toBe('monster');
          expect(callStack[1].mod.object).toBe(array[0]);

        });

        it("if the provided handler is an element handler but not an array handler", function() {


          fw.watchArray(array, 'job', handlerGen('arrayHandler'));
          fw.watch(array[0], 'job', handlerGen('elementHandler'));

          fw.unwatchArray(array, 'job', handlers.elementHandler);

          array[0].job = 'monster';

          expect(callStack.length).toBe(2);
          expect(callStack[0].handlerId).toBe('arrayHandler');
          expect(callStack[0].mod.property).toBe('job');
          expect(callStack[0].mod.from).toBe('plumber');
          expect(callStack[0].mod.to).toBe('monster');
          expect(callStack[0].mod.object).toBe(array[0]);
          expect(callStack[1].handlerId).toBe('elementHandler');
          expect(callStack[1].mod.property).toBe('job');
          expect(callStack[1].mod.from).toBe('plumber');
          expect(callStack[1].mod.to).toBe('monster');
          expect(callStack[1].mod.object).toBe(array[0]);

        });
      });



    });



  });




});
