var base = process.cwd().replace(/\\/g,'/'),
    fs = require('fs'),
    closureCompiler = require('google-closure-compiler-js').compile,
    flags = {};

console.log("Building Peprze Library...");

flags.jsCode = [{src: fs.readFileSync(base+'/peprze.js','utf8')}];
flags.compilationLevel = 'SIMPLE';
fs.unlinkSync(base+'/peprze.min.js');
fs.writeFileSync(base+'/peprze.min.js',closureCompiler(flags).compiledCode);

console.log("Finished Building Minified Library..");