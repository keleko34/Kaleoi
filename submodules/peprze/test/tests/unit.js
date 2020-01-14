mocha.setup('bdd');

(function(describe,it,expect,spy){
  /* mocha tests */
  
  function xhr(url, cb)
  {
    var __xhr = new XMLHttpRequest();
    __xhr.open('GET', url, cb);
    
    __xhr.onreadystatechange = function()
    {
      if(__xhr.readyState === 4)
      {
          if(__xhr.status === 200)
          {
            cb(null, __xhr.responseText);
          }
          else
          {
            cb(new Error("File not found ERR:" + __xhr.status));
          }
      }
    }
    
    __xhr.send();
  }
  
  function getFile(url)
  {
    return new Promise(function(resolve, reject){
      xhr(url, function(err, file){
        if(err) return reject(err);
        return resolve(file);
      })
    });
  }
  
  function getFiles(url, url2, url3)
  {
    return getFile(url)
    .then(function(a){
      return getFile(url2)
      .then(function(b){
        return 'test';
      })
    })
    .then(function(a, b){
      return getFile(url3)
      .then(function(c){
        return 'test2';
      })
    })
    .then(function(a, b, c){
      return a + '-' + b + '-' + c;
    })
  }
  
  describe("Promise:", function(){
    
    describe("Promise resolves:", function(){
      it('Should properly resolve a promise', function(done){
        getFile('/test/tests/files/a.js')
        .then(function(v){
          expect(v).to.equal('a');
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      });
      
      it('Should properly resolve multiple then statements', function(done){
        getFile('/test/tests/files/a.js')
        .then(function(){
          
          return 'test';
        })
        .then(function(v){
          expect(v).to.equal('test');
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      });
      
      it('Should properly resolve a returned promise', function(done){
        getFile('/test/tests/files/a.js')
        .then(function(){
          return getFile('/test/tests/files/b.js');
        })
        .then(function(v, p){
          expect(v).to.equal('a');
          expect(p).to.equal('b');
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      });
      
      it('Should properly resolve a returned promise with its own returned promise', function(done){
        getFile('/test/tests/files/a.js')
        .then(function(){
          return getFiles('/test/tests/files/a.js', '/test/tests/files/b.js', '/test/tests/files/b.js');
        })
        .then(function(v, p){
          expect(v).to.equal('a');
          expect(p).to.equal('a-test-test2');
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      })
      
      it('Should properly create an immediate resolve promise', function(done){
        Promise.resolve('a')
        .then(function(v){
          expect(v).to.equal('a');
          done();
        })
      })
    });
    
    describe("Promise rejects:", function(){
      it('Should properly reject a promise', function(done){
        getFile('/test/tests/files/c.js')
        .then(function(v){
          expect(v).to.equal('c');
          done();
        })
        .catch(function(err){
          expect(err instanceof Error).to.equal(true);
          done();
        })
      });
      
      it('Should properly reject multiple catch statements', function(done){
        getFile('/test/tests/files/c.js')
        .then(function(v){
          expect(v).to.equal('c');
          done();
        })
        .catch(function(){
          return 'test';
        })
        .catch(function(err){
          expect(err).to.equal('test');
          done();
        })
      });
      
      it('Should properly reject a returned promise', function(done){
        getFile('/test/tests/files/a.js')
        .then(function(){
          return getFile('/test/tests/files/c.js')
          .catch(function(err){
            expect(err instanceof Error).to.equal(true);
            done();
          })
        })
        .then(function(v){
          expect(v).to.equal('c');
          done();
        })
      });
      
      it('Should properly create an immediate reject promise', function(done){
        Promise.reject('a')
        .catch(function(v){
          expect(v).to.equal('a');
          done();
        })
      })
    });
    
    describe("Promise finally:", function(){
        it('Should properly call finally after all then statements have finished', function(done){
          var cb = spy();
          
          getFile('/test/tests/files/a.js')
          .then(cb)
          .then(cb)
          .finally(function(v){
            expect(v).to.equal('a');
            expect(cb.callCount).to.equal(2);
            done();
          })
        })
      
        it('Should properly call finally after all catch statements have finished', function(done){
          var cb = spy();
          
          getFile('/test/tests/files/c.js')
          .catch(cb)
          .catch(cb)
          .finally(function(v){
            expect(v instanceof Error).to.equal(true);
            expect(cb.callCount).to.equal(2);
            done();
          })
        })
      
        it('Should properly call finally even after inner returned promises', function(done){
          var cb = spy();
          
          getFile('/test/tests/files/a.js')
          .then(function(v){
            
            return getFile('/test/tests/files/b.js')
            .then(cb);
          })
          .then(cb)
          .finally(function(a, b){
            expect(a).to.equal('a');
            expect(b).to.equal('b');
            expect(cb.callCount).to.equal(2);
            done();
          })
        })
    });
    
    describe("Promise all, race:", function(){
      it('Should properly run all promises in async and return all content', function(done){
        
        var promises = [getFile('/test/tests/files/a.js'), getFile('/test/tests/files/b.js'), getFile('/test/tests/files/b.js')];
        
        Promise.all(promises)
        .then(function(a, b, c){
          expect(a).to.equal('a');
          expect(b).to.equal('b');
          expect(c).to.equal('b');
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      });
      
      it('Should properly use the race method to return the first promise content', function(done){
        var promises = [getFile('/test/tests/files/a.js'), getFile('/test/tests/files/b.js')];
        
        Promise.race(promises)
        .then(function(v){
          expect(['a','b'].indexOf(v)).to.not.equal(-1);
          done();
        })
        .catch(function(){
          expect(false).to.equal(true);
          done();
        })
      });
    });
  })
  
  
  mocha.run();
}(describe,it,chai.expect,sinon.spy));