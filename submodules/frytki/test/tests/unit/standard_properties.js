var standardProperties = (function(){
  return function(describe,it,expect,spy)
  {
    var methods = [
          defaultPropertyFunctionality,
          defaulPropertytListeners,
          defaultBubbledListeners,
          preValueSet,
          postValueSet,
          eventProperties,
          defaultPrevented,
          stopBubbledListeners,
          stopImmediateListeners,
          stopUpdateListeners,
          bubbleFromNewProperties
        ];
    
    function runCategory(key,value,parent,child)
    {
      describe(key+':', function(){
        // trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key,value,parent,child);
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
    
    var testJSON = '{"test":"help","events":{"onhelp":{}},"items":[{"color":"blue","help":false},{"color":"red","help": true}]}';
    
    /* INDIVIDUAL TESTS */
    /* REGION */
    
    function defaultPropertyFunctionality(key,value,obj)
    {
      it("Functionality of "+key+" should update as originally intended",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value;

        /* insert new value */
        __obj[__key] = __value;
        expect(__obj[__key]).to.equal(__value);

        /* reset value */
        __obj[__key] = __oldValue;
        expect(__obj[__key]).to.equal(__oldValue);
        done();
      });
    }
    
    function defaulPropertytListeners(key,value,obj)
    {
      it("Listeners should add, remove and fire upon update",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value,
            __cb = spy();

        __obj.addEventListener(__key,__cb);
        __obj[__key] = __value;
        expect(__cb.callCount).to.equal(1);

        __obj.removeEventListener(__key,__cb);
        __obj[__key] = __oldValue;
        expect(__cb.callCount).to.equal(1);
        done();
      });
    }
    
    function defaultBubbledListeners(key,value,obj,sub_key)
    {
      if(!sub_key) return;
      it("Listeners should fire upon update of a child element in a bubbled manner",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __sub_obj = __obj[__key],
            __oldValue = __sub_obj[sub_key],
            __value = value,
            __cb = spy();
        
        __obj.addEventListener(sub_key,__cb);
        __sub_obj[sub_key] = __value;
        expect(__cb.callCount).to.equal(1);

        __obj.removeEventListener(sub_key,__cb);
        __sub_obj[sub_key] = __oldValue;
        done();
      })
    }
    
    function preValueSet(key,value,obj)
    {
      it("An event should fire prior to the value being set",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value;
        
        function CV()
        {
          expect(__obj[__key]).to.equal(__oldValue);
        }

        __obj.addEventListener(__key,CV);
        __obj[__key] = __value;

        __obj.removeEventListener(__key,CV);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function postValueSet(key,value,obj)
    {
      it("An update event should fire after the value has been set",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value;
        
        function CV()
        {
          expect(__obj[__key]).to.equal(__value);
        }

        __obj.addEventListener(__key+'update',CV);
        __obj[__key] = __value;

        __obj.removeEventListener(__key+'update',CV);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function eventProperties(key,value,obj)
    {
      it("All event properties should exist on the passed event object",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value;
        
        function CV(e)
        {
          expect(e.oldValue).to.equal(__oldValue);
          expect(e.value).to.equal(__value);
          expect(e.cancelable).to.equal(true);
          expect(e.defaultPrevented).to.equal(false);
          expect(e.bubbles).to.equal(true);
          expect(e.attr.toString()).to.equal(__key);
          expect(e.target).to.equal(__obj);
          expect(e.stopped).to.equal(false);
          expect(typeof e.preventDefault).to.equal('function');
          expect(typeof e.stopPropagation).to.equal('function');
          expect(typeof e.stopImmediatePropagation).to.equal('function');
          expect(typeof e.stop).to.equal('function');
        }

        __obj.addEventListener(__key,CV);
        __obj[__key] = __value;

        __obj.removeEventListener(__key,CV);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function defaultPrevented(key,value,obj)
    {
      it("A value should not be set if event.preventDefault is called",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value;
        
        function CV(e)
        {
          e.preventDefault();
          expect(e.defaultPrevented).to.equal(true);
        }
        
        __obj.addEventListener(__key,CV);
        __obj[__key] = __value;
        expect(__obj[__key]).to.equal(__oldValue);
        
        __obj.removeEventListener(__key,CV);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function stopBubbledListeners(key,value,obj,sub_key)
    {
      if(!sub_key) return;
      it("Bubbled Parent listeners should not be called if event.stopPropogation is called",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __sub_obj = __obj[__key],
            __oldValue = __sub_obj[sub_key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopPropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __sub_obj.addEventListener(sub_key,CV);
        __obj.addEventListener(sub_key,__cb);
        __sub_obj[sub_key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __sub_obj.removeEventListener(sub_key,CV);
        __obj.removeEventListener(sub_key,__cb);
        __sub_obj[sub_key] = __oldValue;
        done();
      })
    }
    
    function stopImmediateListeners(key,value,obj)
    {
      it("After event.stopImmediatePropogation is called no other listeners should be fired",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value,
            __cb = spy();
        
        function CV(e)
        {
          e.stopImmediatePropagation();
          expect(e.bubbles).to.equal(false);
        }
        
        __obj.addEventListener(__key,CV);
        __obj.addEventListener(__key,__cb);
        __obj[__key] = __value;
        expect(__cb.callCount).to.equal(0);
        
        __obj.removeEventListener(__key,CV);
        __obj.removeEventListener(__key,__cb);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function stopUpdateListeners(key,value,obj)
    {
      it("After event.stop is called update listeners should not be fired",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __oldValue = __obj[__key],
            __value = value,
            __cb = spy(),
            __cb2 = spy();
        
        function CV(e)
        {
          e.stop();
          expect(e.stopped).to.equal(true);
        }
        
        __obj.addEventListener(__key,CV);
        __obj.addEventListener(__key+'update',__cb);
        __obj.addEventListener(__key+'update',__cb2);
        __obj[__key] = __value;
        expect(__cb.callCount).to.equal(0);
        expect(__cb2.callCount).to.equal(0);
        
        __obj.removeEventListener(__key,CV);
        __obj.removeEventListener(__key+'update',__cb);
        __obj.removeEventListener(__key+'update',__cb2);
        __obj[__key] = __oldValue;
        done();
      });
    }
    
    function bubbleFromNewProperties(key,value,obj)
    {
      it("When a new property is added it should also bubble the event",function(done){
        var __obj = getLayer(frytki(obj),key),
            __key = key.substring(key.lastIndexOf('.') + 1, key.length),
            __sub_key = __key + Date.now(),
            __sub_obj = __obj[__key],
            __value = value,
            __cb = spy();
        
        __obj.addEventListener(__sub_key,__cb);
        __sub_obj.add(__sub_key,5);
        __sub_obj[__sub_key] = __value;
        expect(__cb.callCount).to.equal(2);
        
        __obj.removeEventListener(__sub_key,__cb);
        __sub_obj.del(__sub_key);
        done();
      });
    }
    
    /* ENDREGION */
    
    describe("STANDARD PROPERTIES:",function(){
      runCategory("events","control",testObject,'onhelp');
      runCategory("items.0","test",testObject,'color');
    });
    
    describe("STANDARD JSON PARSED PROPERTIES:",function(){
      runCategory("events","control",testJSON,'onhelp');
      runCategory("items.0","test",testJSON,'color');
    });
  }
}());