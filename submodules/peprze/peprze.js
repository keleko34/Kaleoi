window.Promise = (function(){
  
  function setDescriptor(value, writable, enumerable, redefinable)
  {
    return {
      value: value,
      writable: !!writable,
      enumerable: !!enumerable,
      configurable: !!redefinable
    }
  }
  
  function setSetterDescriptor(get, set, enumerable, redefinable)
  {
    return {
      get: get,
      set: set,
      enumerable: !!enumerable,
      configurable: !!redefinable
    }
  }
  
  function Promise(control)
  { 
    Object.defineProperties(this, {
      __value: setDescriptor([], true),
      __resolve: setDescriptor([], true),
      __reject: setDescriptor([], true),
      __rejected: setDescriptor(false, true),
      __awaiting: setDescriptor(true, true),
      __fulfilled: setDescriptor(false, true),
      __aborted: setDescriptor(false, true),
      __base: setDescriptor(undefined, true),
      __control: setDescriptor(control),
      __finished: setDescriptor(undefined, true),
      __passed: setDescriptor(undefined, true)
    });
    
    Object.defineProperties(this, {
		value: setSetterDescriptor(function(){ return this.__value[0]; }, function(){}, true),
		control: setSetterDescriptor(function(){ return this.__control; }, function(){}, true),
		fulfilled: setSetterDescriptor(function(){ return this.__fulfilled; }, function(){}, true)
	});
    
    setTimeout((function(){
      this.__control.call(this, this.resolve.bind(this), this.reject.bind(this));
    }).bind(this), 0);
  }
  
  function promiseResolve()
  {
    var args = arguments;
    return new Promise(function(resolve){ resolve.apply(this, args); })
  }
  
  function promiseReject()
  {
    var args = arguments;
    return new Promise(function(resolve, reject){ reject.apply(this, args); })
  }
  
  function next(promise, method)
  {
    var __self = this,
        __resolves = this.__resolve,
        __rejects = this.__reject,
        __finished = this.__finished,
        __base = this.__base,
        __values = method.__value;

    Object.defineProperty(__values,__values.length, setSetterDescriptor(function(){ return promise.__value[0]; }, function(){}, true, true));

    this.__fulfilled = this.fulfilled = this.__aborted = true;
    this.__resolve = [];
    this.__reject = [];
    this.__passed = promise;

    promise.__resolve = promise.__resolve.concat(__resolves);
    promise.__reject = promise.__reject.concat(__rejects);
    promise.__base = __base;
    
    if(__finished)
    {
      var __promFinished = promise.__finished;
      promise.__finished = function()
      {
        if(__promFinished) __promFinished.apply(this, arguments);
        __finished.apply((__base || __self), __values);
      }
    }

    if(promise.fulfilled && !promise.__aborted) promise[promise.rejected ? 'reject' : 'resolve'].call(promise);
  }
  
  function execute(type, value)
  {
    this.__awaiting = false;
    
    if(value !== undefined) this.__value[0] = value;
    
    if(type) this.__rejected = true;
    
    var __value,
        __method = this[(!type ? '__resolve' : '__reject')].splice(0,1)[0];
    
    if(__method)
    {
      __value = __method.apply((this.__base || this), __method.__value);
      
      if(__value instanceof Promise) return next.call(this, __value, __method);
      
      if(__value !== undefined) __method.__value[0] = __value;
      this[(!type ? 'resolve' : 'reject')].call(this, __value);
    }
    else
    {
      this.__fulfilled = this.fulfilled = true;
      if(this.__finished)
      {
        __value = this.__finished.apply(this, this.__finished.__value);
        
        if(__value instanceof Promise) return next.call(this, __value, this.__finished);
        
        if(__value !== undefined) this.__value[0] = __value;
      }
    }
  }
  
  function resolve(v)
  {
    return execute.call(this, 0, v);
  }
  
  function reject(v)
  {
    return execute.call(this, 1, v);
  }
  
  function then(func, err)
  {
    var __self = this;
    
    this.__resolve.push(func);
    Object.defineProperty(func, '__value', setSetterDescriptor((function(){ return this.__value; }).bind(this),function(){}, false, true));
    if(err)
    {
      this.__reject.push(err);
      Object.defineProperty(err, '__value', setSetterDescriptor((function(){ return this.__value; }).bind(this),function(){}, false, true));
    }
    if(this.__fulfilled && !this.__aborted && !this.__rejected) this.resolve();
    if(this.__aborted)
    {
      this.__passed.then(function(){
        __self.resolve(__self.value);
      });
    }
    return this;
  }
  
  function error(func)
  {
    var __self = this;
    
    this.__reject.push(func);
    Object.defineProperty(func, '__value', setSetterDescriptor((function(){ return this.__value; }).bind(this),function(){}, false, true));
    if(this.__fulfilled && !this.__aborted && this.__rejected) this.resolve();
    if(this.__aborted)
    {
      this.__passed.catch(function(){
        __self.reject(__self.value);
      });
    }
    return this;
  }
  
  function all(promises)
  {
    return new Promise(function(resolve, reject){
      var self = this,
          x = 0,
          len = promises.length,
          rejected = false,
          fulfilled = 0;
      
      for(x;x<len;x++)
      {
        promises[x]
        .then(function(){
          fulfilled += 1;
          if(fulfilled === len)
          {
            self.__value = promises.map(function(promise){ return promise.value; });
            (rejected ? reject : resolve).apply((self.__base || self));
          }
        })
        .catch(function(){
          fulfilled += 1;
          rejected = true;
          if(fulfilled === len)
          {
            self.__value = promises.map(function(promise){ return promise.value; });
            reject.apply((self.__base || self));
          }
        })
      }
    });
  }
  
  function race(promises)
  {
    return new Promise(function(resolve, reject){
      var self = this,
          x = 0,
          len = promises.length,
          fulfilled = false;
      
      for(x;x<len;x++)
      {
        promises[x]
        .then(function(v){
          if(!fulfilled) resolve.apply((self.__base || self), [v]);
          fulfilled = true;
        })
        .catch(function(v){
          if(!fulfilled) reject.apply((self.__base || self), [v]);
          fulfilled = true;
        })
      }
    });
  }
  
  function finish(func)
  {
    this.__finished = func;
    Object.defineProperty(func, '__value', setSetterDescriptor((function(){ return this.__value; }).bind(this),function(){}));
  }
  
  Object.defineProperties(Promise.prototype, {
    resolve: setDescriptor(resolve),
    reject: setDescriptor(reject),
    then: setDescriptor(then, false, true),
    catch: setDescriptor(error, false, true),
    finally: setDescriptor(finish, false, true)
  })
  
  Object.defineProperties(Promise, {
    all: setDescriptor(all, false, true),
    race: setDescriptor(race, false, true),
    resolve: setDescriptor(promiseResolve, false, true),
    reject: setDescriptor(promiseReject, false, true)
  })
  
  return Promise;
}())