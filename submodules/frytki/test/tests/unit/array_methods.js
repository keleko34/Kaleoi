var arrayMethods = (function(){
  return function(describe,it,expect,spy)
  {
    var methods = [
      returnsCorrectValue,
      setsCorrectData,
      firesEvents,
      preventDataChange,
      bypassBlocksEvents,
    ];
    
    function copy(obj)
    {
      var __obj = {},
          __keys = Object.keys(obj),
          len = __keys.length,
          x = 0;
      for(x;x<len;x++)
      {
        __obj[__keys[x]] = obj[__keys[x]];
      }
      return __obj;
    }
    
    function runCategory(method, data)
    {
      var __arguments = Array.prototype.slice.call(arguments).slice(2);
      
      describe(method+':', function(){
        // trackTestTime.call(this,key);
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](method,data,__arguments);
        }
      });
    }
    
    var exampleDate = [1,2,3,4,5,6,7,8,9];
    
    function returnsCorrectValue(method, data, args)
    {
      it("Should return the same value as it's vanilla counterpart",function(done){
        var dt = data.slice(),
            custom = frytki(JSON.stringify(data)),
            original = Array.prototype[method],
            retOriginal = original.apply(dt, args),
            retCustom = custom[method].apply(custom, args);
        if(typeof retOriginal === 'object') {
          retCustom = JSON.stringify(copy(retCustom))
          retOriginal = JSON.stringify(copy(retOriginal))
        }
        expect(retCustom).to.equal(retOriginal);
        done();
      });
    }
    
    function setsCorrectData(method, data, args)
    {
      it("Should set the same data as it's vanilla counterpart",function(done){
        var dt = data.slice(),
            custom = frytki(JSON.stringify(data)),
            original = Array.prototype[method];
        
            original.apply(dt, args);
            custom[method].apply(custom, args);
        var outputOriginal = JSON.stringify(copy(dt)),
            outputCustom = JSON.stringify(copy(custom));
        expect(custom.length).to.equal(dt.length);
        expect(outputCustom).to.equal(outputOriginal);
        done();
      });
    }
    
    function firesEvents(method, data, args)
    {
      it("Should fire an event after the method has been run",function(done){
        var custom = frytki(JSON.stringify(data)),
            cb = spy();
        custom.addEventListener(((method !== 'push' && method !== 'pop') ? '0' : custom.length - (method === 'pop' ? 1 : 0)), cb);
        custom[method].apply(custom, args);
        expect(cb.callCount).to.equal(1);
        done();
      });
    }
    
    function preventDataChange(method, data, args)
    {
      it("Should allow us to prevent the changes of a method", function(done){
        var custom = frytki(JSON.stringify(data)),
            original = frytki(JSON.stringify(data)),
            cb = function(e){ e.preventDefault(); };
        custom.addEventListener('*', cb);
        custom[method].apply(custom, args);
        
        expect(JSON.stringify(custom)).to.equal(JSON.stringify(original));
        
        done();
      })
    }
    
    function bypassBlocksEvents(method, data, args)
    {
      it("If a bypass method is used the bypass should be fired instead of atached events",function(done){
        var custom = frytki(JSON.stringify(data)),
            cb = spy(),
            bypass = spy();
        
        custom.__frytkiExtensions__.bypass =  bypass;
        
        custom.addEventListener(((method !== 'push' && method !== 'pop') ? '0' : custom.length - (method === 'pop' ? 1 : 0)), cb);
        custom[method].apply(custom, args);
        expect(cb.callCount).to.equal(0);
        expect(bypass.callCount).to.equal(1);
        done();
      });
    }
    
    describe("Array methods",function(){
      runCategory('sort', exampleDate.slice(), function(a, b){
        return a > b ? -1 : 1;
      });
      runCategory('splice', exampleDate.slice(), 0, 2, 100, 101, 102);
      runCategory('shift', exampleDate.slice());
      runCategory('unshift', exampleDate.slice(), 1, 2, 3);
      runCategory('push', exampleDate.slice(), 100);
      runCategory('pop', exampleDate.slice());
      runCategory('reverse', exampleDate.slice());
      if(Array.prototype.fill) runCategory('fill', exampleDate.slice(), 100, 0, 4);
      if(Array.prototype.copyWithin) runCategory('copyWithin', exampleDate.slice(), 0, 3, 5);
    });
  }
}());