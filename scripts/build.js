var base = process.cwd().replace(/\\/g,'/'),
    fs = require('fs'),
    closureCompiler = require('google-closure-compiler-js'),
    flags = {};

console.log("Building Kaleoi Library...");

flags.jsCode = [{src: fs.readFileSync(base+'/kaleoi.js','utf8')}];
flags.compilationLevel = 'SIMPLE';
flags.rewritePolyfills = false;

fs.unlinkSync(base+'/kaleoi.min.js');
fs.writeFileSync(base+'/kaleoi.min.js',closureCompiler(flags).compiledCode);

console.log("Finished Building Minified Kaleoi Library..");