/* 
  - properly sets a pointer
  - allows adding event to pointed object
  - allows adding parent listener to pointed object
  - remove pointed object also removes inherited listeners
  - changing pointer value also changes pointed object
*/

var pointers = (function(){
  return function(describe,it,expect,spy)
  {
    var methods = [
          setsCorrectData,
          firesCorrectEvents,
          allowsBubbledListeners,
          removesPointerAndListener,
          syncedPointervalues,
          removesPointer
        ];
    
    function runCategory(key, listener, subListener, fromKey)
    {
      describe(key+':'+(fromKey || 'null'), function(){
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key, listener, subListener, fromKey);
        }
      });
    }
    
    function getLayer(obj, key)
    {
      var __scopeArray = key.split('.'),
          __retObj = obj,
          __len = __scopeArray.length,
          __x = 0;

      for(__x;__x<(__len - 1);__x++)
      {
        if(typeof __retObj[__scopeArray[__x]] === 'object') __retObj = __retObj[__scopeArray[__x]];
      }

      return __retObj;
    }
    
    function getKey(key)
    {
      return (typeof key === 'string' ? key.substring(key.lastIndexOf('.') + 1, key.length) : key.toString());
    }
    
    var testObject = {
      test: 'help',
      events: {
        onhelp: function(){},
      },
      items: [
        {
          color: 'blue',
          help: false,
        },
        {
          color: 'red',
          help: true,
        }
      ]
    }
    
    var pointerObject = {
      applied: {
        something: 'cool',
        items: [
          {
            color: 'red'
          },
          {
            color: 'orange'
          }
        ]
      }
    }
    
    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function setsCorrectData(key, listener, subListener, fromKey)
    {
      it("Should correctly set the pointer on the object", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey);
        
        fromKey = getKey(fromKey);
        
        custom.setPointer(key, pointer, fromKey);
        expect(custom[key]).to.equal(pointer[fromKey]);
        done();
      });
    }
    
    function firesCorrectEvents(key, listener, subListener, fromKey)
    {
      it("Should correctly fire an event on the pointer object", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey),
            cb = spy();
        
        fromKey = getKey(fromKey);
        
        custom.setPointer(key, pointer, fromKey);
        custom[key].addEventListener(listener,cb);
        
        pointer[fromKey][listener] = 'something else';
        expect(cb.callCount).to.equal(1);
        done();
      });
    }
    
    function allowsBubbledListeners(key, listener, subListener, fromKey)
    {
      it("Should correctly fire bubbled events on the pointer object", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey),
            cb = spy();
        
        fromKey = getKey(fromKey);
        
        custom.setPointer(key, pointer, fromKey);
        custom.addEventListener(subListener,cb);
        
        pointer[fromKey][subListener] = 'orange';
        
        expect(cb.callCount).to.equal(1);
        done();
      });
    }
    
    function removesPointerAndListener(key, listener, subListener, fromKey)
    {
      it("Should correctly remove a pointer and remove its corresponding listeners", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey),
            cb = spy();
        
        fromKey = getKey(fromKey);
        
        custom.addEventListener(subListener,cb);
        
        custom.del(key);
        
        pointer[fromKey][subListener] = 'orange';
        
        expect(cb.callCount).to.equal(0);
        done();
      });
    }
    
    function syncedPointervalues(key, listener, subListener, fromKey)
    {
      it("Should correctly sync changes on pointer", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey);
        
        fromKey = getKey(fromKey);
        
        custom.setPointer(key, pointer, fromKey);
        
        pointer[fromKey][listener] = 'what else';
        
        expect(custom[key][listener]).to.equal(pointer[fromKey][listener]);
        done();
      });
    }
    
    function removesPointer(key, listener, subListener, fromKey)
    {
      it("Should correctly remove a pointer", function(done){
        var custom = frytki(testObject),
            pointer = getLayer(frytki(pointerObject), fromKey);
        
        fromKey = getKey(fromKey);
        
        custom.setPointer(key, pointer, fromKey);
        
        pointer[fromKey][listener] = 'what else';
        
        custom.removePointer(key);
        
        pointer[fromKey][listener] = 'something else';
        
        expect(custom[key]).to.equal(undefined);
        done();
      });
    }
    
    /* ENDREGION */
    
    describe("Pointers:",function(){
      runCategory('extra','something', 'items', 'applied');
      runCategory('test','color', 'color', 'applied.items.0');
    });
  }
}());