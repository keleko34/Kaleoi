function BuildUnitTests()
{
  var expect = chai.expect,
      spy = sinon.spy;
  
  function createComponent(component)
  {
    var node = document.createElement(component);
        document.body.appendChild(node);
    return node;
  }
  
  describe('Text', function(){
    
    it('Should properly insert an item on a component', function(done){
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var insert = document.getElementById('standard_insert'),
            vm = component.__KaleoiExtensions__.vm;
        
        expect(insert.innerHTML).to.equal('test');
        vm.title = "something else";
        expect(insert.innerHTML).to.equal('test');
        kaleoi.removeComponent(component);
        done();
      })
    })
    
    it('Should properly two-way bind on a component', function(done){
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var bind = document.getElementById('standard_bind'),
            vm = component.__KaleoiExtensions__.vm;
        
        expect(bind.innerHTML).to.equal('test');
        vm.title = "something else";
        expect(bind.innerHTML).to.equal('something else');
        bind.innerHTML = "even something else";
        expect(vm.title).to.equal('even something else');
        kaleoi.removeComponent(component);
        done();
      })
    })
    
    it('Should properly single-way bind on a component that has a dirty bind', function(done){
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var bindOne = document.getElementById('standard_bind_oneway'),
            vm = component.__KaleoiExtensions__.vm;
        
        expect(bindOne.innerHTML).to.equal('mr test');
        vm.title = "something else";
        expect(bindOne.innerHTML).to.equal('mr something else');
        bindOne.innerHTML = "even something else";
        expect(vm.title).to.equal('something else');
        kaleoi.removeComponent(component);
        done();
      })
    })
    
    it('Should properly bind a function one way', function (done) {
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var func = document.getElementById('standard_bind_function');
        
        expect(func.innerHTML).to.equal('text');
        kaleoi.removeComponent(component);
        done();
      })
    });
    
    it('Should properly set a function input if the vm property is set', function (done) {
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var func = document.getElementById('standard_bind_function'),
            cb = spy(),
            vm = component.__KaleoiExtensions__.vm,
            ftest = vm.test;
        
        vm.test = function(){
          cb();
          return ftest.apply(this, arguments);
        }
        
        vm.test = 'another test';
        
        expect(func.innerHTML).to.equal('another test');
        expect(cb.callCount).to.equal(2); //first time is when the function was overwrote
        kaleoi.removeComponent(component);
        done();
      })
    });
    
    it('Should properly set a function input if there is a two-way bind and the dom is set', function (done) {
      kaleoi.createComponent(createComponent('standard'))
      .then(function(component){
        var func = document.getElementById('standard_bind_function'),
            cb = spy(),
            vm = component.__KaleoiExtensions__.vm,
            ftest = vm.test;
        
        vm.test = function(){
          cb();
          return ftest.apply(this, arguments);
        }
        
        func.innerHTML = 'test_something'
        
        expect(func.innerHTML).to.equal('test_something');
        expect(cb.callCount).to.equal(2); //first time is when the function was overwrote
        kaleoi.removeComponent(component);
        done();
      })
    });
  });
  
  describe('Event', function(){
    it('Should properly add an event and fire it', function(done){
      kaleoi.createComponent(createComponent('event'))
      .then(function(component){
        var vm = component.__KaleoiExtensions__.vm,
            cb = spy(),
            func = vm.click;
        
        vm.click = function()
        {
          cb();
          return func.apply(this, arguments);
        }
        
        expect(component.getAttribute('onClick')).to.equal(null);
        expect(typeof component.onclick).to.equal('function');
        
        component.dispatchEvent(new MouseEvent('click'))
        
        expect(cb.callCount).to.equal(1);
        kaleoi.removeComponent(component);
        done();
      })
    })
    
    it('Should properly update a two-way event bind and fire it', function(done){
      kaleoi.createComponent(createComponent('event'))
      .then(function(component){
        var vm = component.__KaleoiExtensions__.vm,
            cb = spy(),
            cb2 = spy(),
            cb3 = spy(),
            func = vm.click;
        
        vm.click = function()
        {
          cb();
          return func.apply(this, arguments);
        }
        
        expect(component.getAttribute('onClick')).to.equal(null);
        expect(typeof component.onclick).to.equal('function');
        
        component.dispatchEvent(new MouseEvent('click'))
        
        vm.click = function()
        {
          cb2();
          return func.apply(this, arguments);
        }
        
        component.dispatchEvent(new MouseEvent('click'))
        
        component.onclick = function()
        {
          cb3();
          return func.apply(this, arguments);
        }
        
        vm.click();
        
        expect(cb.callCount).to.equal(1);
        expect(cb2.callCount).to.equal(1);
        expect(cb3.callCount).to.equal(1);
        kaleoi.removeComponent(component);
        done();
      })
    })
  });
  
  describe('Stylesheet Global', function(){
    it('Should properly insert a style bind', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.color = 'rgb(24, 15, 0)';
        expect(getComputedStyle(componentA).color).to.equal('rgb(0, 0, 0)');
        expect(getComputedStyle(componentB).color).to.equal('rgb(0, 0, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly one way bind styles', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.color = 'rgb(24, 15, 0)';
        expect(getComputedStyle(componentA).backgroundColor).to.equal('rgb(24, 15, 0)');
        expect(getComputedStyle(componentB).backgroundColor).to.equal('rgb(24, 15, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly bind a function one-way', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA).fontSize).to.equal('16px');
        expect(getComputedStyle(componentB).fontSize).to.equal('16px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a function input if the vm property is set', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.fontSize = 18;
        expect(getComputedStyle(componentA).fontSize).to.equal('18px');
        expect(getComputedStyle(componentB).fontSize).to.equal('18px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name and Value as String)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA).marginTop).to.equal('12px');
        expect(getComputedStyle(componentB).marginTop).to.equal('12px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as Array and Value as Bind)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mB = '30px';
        expect(getComputedStyle(componentA).marginBottom).to.equal('30px');
        expect(getComputedStyle(componentB).marginBottom).to.equal('30px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as Object and Value as Bind)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mR = '40px';
        expect(getComputedStyle(componentA).marginRight).to.equal('40px');
        expect(getComputedStyle(componentB).marginRight).to.equal('40px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as String and Value as Mixed)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mL = 50;
        expect(getComputedStyle(componentA).marginLeft).to.equal('50px');
        expect(getComputedStyle(componentB).marginLeft).to.equal('50px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set all of a style classes properties', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA.children[1]).border).to.equal('1px solid rgb(255, 255, 255)');
        expect(getComputedStyle(componentB.children[1]).border).to.equal('1px solid rgb(255, 255, 255)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a inline full property bind (object)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA).fontWeight).to.equal('600');
        expect(getComputedStyle(componentB).fontWeight).to.equal('600');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a inline full property bind (function)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.decoration = 'line-through';
        expect(getComputedStyle(componentA).textDecoration).to.equal('line-through solid rgb(0, 0, 0)');
        expect(getComputedStyle(componentB).textDecoration).to.equal('line-through solid rgb(0, 0, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
  });
  
  describe('Stylesheet Local', function(){
    it('Should properly insert a style bind', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.color = 'rgb(24, 15, 0)';
        expect(getComputedStyle(componentA.children[0]).color).to.equal('rgb(0, 0, 0)');
        expect(getComputedStyle(componentB.children[0]).color).to.equal('rgb(0, 0, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly one way bind styles', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.color = 'rgb(24, 15, 0)';
        expect(getComputedStyle(componentA.children[0]).backgroundColor).to.equal('rgb(24, 15, 0)');
        expect(getComputedStyle(componentB.children[0]).backgroundColor).to.not.equal('rgb(24, 15, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly bind a function one-way', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA.children[0]).fontSize).to.equal('16px');
        expect(getComputedStyle(componentB.children[0]).fontSize).to.equal('16px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a function input if the vm property is set', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.fontSize = 18;
        expect(getComputedStyle(componentA.children[0]).fontSize).to.equal('18px');
        expect(getComputedStyle(componentB.children[0]).fontSize).to.not.equal('18px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name and Value as String)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        expect(getComputedStyle(componentA.children[0]).marginTop).to.equal('12px');
        expect(getComputedStyle(componentB.children[0]).marginTop).to.equal('12px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as Array and Value as Bind)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mB = '30px';
        expect(getComputedStyle(componentA.children[0]).marginBottom).to.equal('30px');
        expect(getComputedStyle(componentB.children[0]).marginBottom).to.not.equal('30px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as Object and Value as Bind)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mR = '40px';
        expect(getComputedStyle(componentA.children[0]).marginRight).to.equal('40px');
        expect(getComputedStyle(componentB.children[0]).marginRight).to.not.equal('40px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a custom style name and value (Name as String and Value as Mixed)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.mL = 50;
        expect(getComputedStyle(componentA.children[0]).marginLeft).to.equal('50px');
        expect(getComputedStyle(componentB.children[0]).marginLeft).to.not.equal('50px');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set all of a style classes properties', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.style = { border: '5px solid rgb(250, 250, 250)'};
        expect(getComputedStyle(componentA.children[1].children[0]).border).to.equal('5px solid rgb(250, 250, 250)');
        expect(getComputedStyle(componentB.children[1].children[0]).border).to.not.equal('5px solid rgb(250, 250, 250)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a inline full property bind (object)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.fontWeight = { 'font-weight': '800' }
        expect(getComputedStyle(componentA.children[0]).fontWeight).to.equal('800');
        expect(getComputedStyle(componentB.children[0]).fontWeight).to.not.equal('800');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
    
    it('Should properly set a inline full property bind (function)', function(done){
      kaleoi.createComponent(createComponent('stylesheet'))
      .then(function(){ return kaleoi.createComponent(createComponent('stylesheet')); })
      .then(function(componentA, componentB){
        componentA.__KaleoiExtensions__.vm.decoration = 'line-through';
        expect(getComputedStyle(componentA.children[0]).textDecoration).to.equal('line-through solid rgb(0, 0, 0)');
        expect(getComputedStyle(componentB.children[0]).textDecoration).to.not.equal('line-through solid rgb(0, 0, 0)');
        kaleoi.removeComponent(componentA);
        kaleoi.removeComponent(componentB);
        done();
      })
    })
  });
  
  describe('Style', function(){
    it('Should properly insert an entire inline style', function(done){
      kaleoi.createComponent(createComponent('style'))
      .then(function(component){
        expect(component.children[1].style.background).to.equal('#FFFFFF');
        component.__KaleoiExtensions__.vm.insertStyle = { background: '#000000' }
        expect(component.children[1].style.font).to.equal('#FFFFFF');
        kaleoi.removeComponent(component);
        done();
      })
    })
    it('Should properly set an entire inline style (object)', function(done){
      kaleoi.createComponent(createComponent('style'))
      .then(function(component){
        expect(component.style.font).to.equal('san serif');
        component.__KaleoiExtensions__.vm.style = { font: 'Open Sans' }
        expect(component.style.font).to.equal('Open Sans');
        kaleoi.removeComponent(component);
        done();
      })
    })
    
    it('Should properly set an entire inline style (function)', function(done){
      kaleoi.createComponent(createComponent('style'))
      .then(function(component){
        expect(component.children[0].style.fontSize).to.equal('24px');
        component.__KaleoiExtensions__.vm.fontSize = '30px'
        expect(component.children[0].style.fontSize).to.equal('30px');
        kaleoi.removeComponent(component);
        done();
      })
    })
  });
  
  describe('Attr', function(){
    
  });
  
  describe('Loop', function(){
    
  });
}