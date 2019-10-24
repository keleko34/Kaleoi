var async = true,
    runTests = true;

console.calculateTime = function(func,cycles)
{
  var times = [],
      start,
      end;
  
  for(var x=0,len=cycles;x<len;x++)
  {
    start = performance.now();
    func();
    end = performance.now();
    times.push((end-start));
  }
  
  return ((times.reduce(function(a, b) { return a + b; }) / times.length) * 1000).toFixed(2)+'ms';
}

/* PERFS */
var creationObjectPerf = new Benchmark.Suite('creationObject'),
    creationJSONPerf = new Benchmark.Suite('creationJSON'),
    
    CreateKonnektDT = KBWindow.CreateKonnektDT;

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
    },
    testJSON = '{"test":"help","events":{"onhelp":{}},"items":[{"color":"blue","help":false},{"color":"red","help": true}]}';

if(runTests)
{
  creationObjectPerf
  .add('KonnektDT#creationObject', function(){
    CreateKonnektDT(testObject);
  })
  .add('Frytki#creationObject', function(){
    frytki(testObject);
  })
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest')[0].toString() + '******');
  })
  // run async
  .run({ 'async': async });
  
  creationJSONPerf
  .add('KonnektDT#creationJSON', function(){
    CreateKonnektDT(testJSON);
  })
  .add('Frytki#creationJSON', function(){
    frytki(testJSON);
  })
  .on('cycle', function(event) {
    console.log(String(event.target),event);
  })
  .on('complete', function() {
    console.log('*****Fastest is ' + this.filter('fastest')[0].toString() + '******');
  })
  // run async
  .run({ 'async': async });
}