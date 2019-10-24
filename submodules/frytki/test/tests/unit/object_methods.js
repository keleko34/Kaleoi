var objectMethods = (function(){
  return function(describe,it,expect,spy,timer)
  {
    var methods = [
      setsCorrectData,
      firesEvents,
      preventDataChange,
    ];
    
    function getExampleData()
    {
      return {
        test: "hello",
        me: {
          name: "tester",
          age: 50,
          likes: [
            "frytki",
            "stuff"
          ]
        },
        help: function(){},
        isHelp: true
      }
    }
    
    function runCategory(method, compare, listener)
    {
      var __arguments = Array.prototype.slice.call(arguments).slice(3);
      
      describe(method+':', function(){
        
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](method, compare, listener, __arguments);
        }
      });
    }
    
    function setsCorrectData(method, compare, listener, args)
    {
      it("Should properly set the data",function(done){
        var data = frytki(getExampleData());
        data[method].apply(data, args);
        
        var outputCompare = JSON.stringify(compare),
            outputData = JSON.stringify(data);
        
        expect(outputData).to.equal(outputCompare);
        done();
      });
    }
    
    function firesEvents(method, compare, listener, args)
    {
      it("Should properly fire the events associaed with said data",function(done){
        var data = frytki(getExampleData()),
            cb = spy();
        
        data.addEventListener(listener,cb);
        data[method].apply(data, args);
        
        expect(cb.callCount).to.equal(1);
        done();
      });
    }
    
    function preventDataChange(method, compare, listener, args)
    {
      it("Should allow preventing the changes of the data",function(done){
        var data = frytki(getExampleData());
        
        data.addEventListener('*', function(e){ e.preventDefault(); });
        data[method].apply(data, args);
        
        var outputCompare = JSON.stringify(frytki(getExampleData())),
            outputData = JSON.stringify(data);
        
        expect(outputData).to.equal(outputCompare);
        done();
      });
    }
    
    describe("Object Methods",function(){
      
      runCategory('set',{
        test: "hello",
        me: 'goodbye',
        help: function(){},
        isHelp: true
      }, 'me', 'me','goodbye');
      
      runCategory('setPointer',{
        test: "hello",
        me: {
          name: "tester",
          age: 50,
          likes: {
            "0": "frytki",
            "1": "stuff"
          }
        },
        help: function(){},
        isHelp: true,
        extra: 'cool'
      }, 'extra', 'extra',frytki({
        stuff: 'cool'
      }), 'stuff');
      
      runCategory('remove',{
        test: "hello",
        help: function(){},
        isHelp: true
      }, 'me', 'me');
      
      runCategory('del',{
        test: "hello",
        help: function(){},
        isHelp: true
      }, 'me', 'me');
      
      runCategory('move',{
        test: "hello",
        me: 'goodbye',
        help: function(){},
        isHelp: true
      }, 'me', { me: 'goodbye' }, 'me');
      
      runCategory('copy',{
        test: "hello",
        me: 'goodbye',
        help: function(){},
        isHelp: true
      }, 'me', { me: 'goodbye' }, 'me');
      
      runCategory('merge',{
        test: "hello",
        me: 'goodbye',
        help: function(){},
        isHelp: true,
        greeting: 'hello'
      }, 'me', { me: 'goodbye', greeting: 'hello' });
      
    });
  }
}());