# Frytki
> Unique data binding library for dynamic fast data binding

[![NPM version][npm-image]][npm-url] [![Gitter][gitter-image]][gitter-url]

Table of contents
=================

   * [What is it?](#what-is-it)
   * [Installation](#installation)
   * How to use it:
      * [Getting started](#getting-started)
      * [Mixed objects](#mixed-objects)
      * [Data binding](#data-binding)
      * [Functions](#functions)
      * [Handling JSON](#handling-json)
      * [Pointers](#pointers)
      * [Event object](#event-object)
   * [Examples](#examples)
   * [How to contribute](#how-to-contribute)
   * [License](#license)
   
What is it?
==========
This library allows you to use event listeners in such a manner as standard events to listen to changes on any data set or data structure combining the methodology of arrays and objects as one.

Installation
============
This libray can be installed using:

 * [NPM](https://www.npmjs.com) :  `npm install frytki --save`
 * [Bower](https://bower.io/) : `bower install frytki --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add frytki`
 
Getting started
============
The script can be loaded both in the head and in the body. 
All functionality is automatically loaded as soon as the file is loaded.
```
 <script src="/(node_modules|bower_modules)/frytki/frytki.min.js"></script>
```

To start using it is as simple as just passing data or json into the frytki method
#### Object
```
 var obj = { arr: [20, 40, 50], obj: { num: 500, str: "string" } };
 var data = frytki(obj);
 
 data.addEventListener('num', console.log);
```

#### JSON
```
 var json = '{ "arr": ["20", "40", "50"], "obj": { "num": "500", "str": "string" } }';
 var data = frytki(json);
 
 data.addEventListener('num', console.log);
```

When listening for data events there are two different types of listeners, the pre data update listener and the post data update listener. By simply adding `update` to the end of any listener your event will fire post data update meaning the object will have already changed and updated
```
 data.addEventListener('numupdate', console.log);
```

Mixed objects
==========
Frytki objects act both as arrays and as objects allowing for unique and quick non parsing abilities. Array methods will only effect numerical indexes as an array should whil object methods effect all properties as they should.

Example:
```
var obj = { obj: { num: 500 } };
var data = frytki(obj);

data.push("text");

console.log(data.keys()); // (2) ["0", "obj"]
console.log(data.length); // 1
```

Data binding
==========
Data binding allows you to listen for the changes of any changes on an object the same way you would listen to an event on the dom, this includes bubbling and preventing default changes. Data binding comes in two forms a pre data update and a post data update. Post data means the object has already been updated with the new value and can onlybe reverted by changing again. WHile a pre update event can prevent the value from being set.

Bubbling:
```
var obj = { obj: { num: 500, inner: { str: "string" } } };
var data = frytki(obj);

data.addEventListener("str", console.log);

data.obj.inner.str = "char"; // changeEvent
```


Prevent Default:
```
  var obj = { obj: { num: 500, inner: { str: "string" } } };
  var data = frytki(obj);

  data.addEventListener("str", function(e){ e.preventDefault(); return false; });

  data.obj.inner.str = "char";

  console.log(data.obj.inner.str); // "string"
```

Listening to events also allows for listening to when new data is created or deleted

```
var data = frytki();
data.addEventListener("create", console.log);
data.addEventListener("delete", console.log);

data.add("text","string") // eventObject
data.del("text") // eventObject
```

Functions
==========
All functions you would find on an object or array are included in the frytki mixed data object, special not on Array mutation functions, these methods will not call the changes until they have finished process the changes for the data and then will fire all associated change events.

Standard methods that allow you to interact with your observable data, not using these methods will result in non observable data

- add|create(key, value) (required to add new observable properties)
- set(key, value) (can be used to set or create a value)
- del|remove(key) (deletes an observable property and all associated events)

Handling JSON
==========
Built in parsing methods allow for easy conversion of JSON data from and to observable data. using JSON.stringify even on circular objects will result in a clean json string that replaces circular values with "[Circular key_name]"

```
 var json = '{ "arr": ["20", "40", "50"], "obj": { "num": "500", "str": "string" } }';
 var data = frytki(json);
 
 or
 
 var data = frytki.parse(json);
```

Pointers
==========
Pointers allow us to reference outside objects within our own data object and not change the structure. Events are also passed to these other objects but when removed, the events are also removed with them.

```
  var obj = { obj: { num: 500, inner: { str: "string" } } };
  var outsideObj = { text: "writing" };
  var data = frytki(obj);

  data.addPointer("outside", outsideObj, "text");

  outsideObj.text = "reading";

  console.log(data.outside); // "reading"
```

Event object
============
The event object that is passed to each of these fired events allow for similar functionality as that of a standard DOM event listener

#### event.preventDefault()
When called from a pre data update event, this method can be used to prevent the data from updating
```
 data.addEventListener('num', function(e){ e.preventDefault(); });
```

#### event.stop()
When called from a pre data update event, this method can be used to stop the post data update events from firing
```
 data.addEventListener('num', function(e){ e.stop(); });
 
 // this will not fire
 data.addEventListener('numupdate', console.log);
```

#### event.stopPropogation()
When called no bubbled listeners after the current one will fire, including post data updates

#### event.stopImmediatePropogation()
When called no listeners after the current one will fire, including post data updates

#### event.value
Shows the value that is being set

#### event.oldValue
Shows the previous value of the item being set

#### event.srcObject
The original object that fired the event

#### event.parent
The parent object of this property if any

All other event properties follow the same guideline as a standard Event object

Examples
========
#### Updating dom from json data
```
var json = fetchDataFromServer();
var data = frytki(json);
var node = document.querySelector(node);

node.innerHTML = data.title;

data.addEventListener("titleupdate", function(e){ 
  node.innerHTML = e.value;
});
```

How to contribute
=================
If You would like to contribute here are the steps

1. Clone Repo: [Frytki Github Repo](https://github.com/keleko34/frytki)
2. Install any necessary dev dependencies
3. build the project `npm run build`
4. test your changes don't break anything `npm test`
5. Make a pull request on github for your changes :)

License
=======
You can view the license here: [License](https://github.com/keleko34/pikantny/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/frytki
[npm-image]: https://img.shields.io/npm/v/frytki.svg
[gitter-url]: https://gitter.im/frytki/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/frytki/Lobby.svg