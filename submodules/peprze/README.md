# Peprze
> Promise shim and functionality extender

[![NPM version][npm-image]][npm-url]

Table of contents
=================

   * [What is it?](#what-is-it)
   * [Installation](#installation)
   * How to use it:
      * [Getting started](#getting-started)
   * [Examples](#examples)
   * [How to contribute](#how-to-contribute)
   * [License](#license)
   
What is it?
==========
This library allows to use promises in older browsers as well as add extra functionality to promises that allows promise functionality in the kaleo library set

Installation
============
This libray can be installed using:

 * [NPM](https://www.npmjs.com) :  `npm install peprze --save`
 * [Bower](https://bower.io/) : `bower install peprze --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add peprze`
 
Getting started
============
The script can be loaded both in the head and in the body. 
All functionality is automatically loaded as soon as the file is loaded.
*Note: include this script before any other scripts for proper implementation* 
```
 <script src="/(node_modules|bower_modules)/peprze/peprze.min.js"></script>
```

To start using it is as simple as instancing a new promise in the same way as native promises
```
 var test = new Promise(function(resolve, reject){
  /* Do async here */
 })
```

Examples
========
#### Fetching files
Using Xhr to fetch files using promises
```
function fetchfile(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  
  return new Promise(function(resolve, reject){
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        if(xhr.status === 200) {
          resolve(xhr.responseText);
        }
        else {
          reject(new Error(xhr.status));
        }
      }
    }
    
    xhr.send();
  });
}
```

How to contribute
=================
If You would like to contribute here are the steps

1. Clone Repo: [Peprze Github Repo](https://github.com/keleko34/peprze)
2. Install any necessary dev dependencies
3. build the project `npm run build`
4. test your changes don't break anything `npm test`
5. Make a pull request on github for your changes :)

License
=======
You can view the license here: [License](https://github.com/keleko34/peprze/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/peprze
[npm-image]: https://img.shields.io/npm/v/peprze.svg