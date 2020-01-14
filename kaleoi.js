window.__KaleoiExtensions__ = {
  config: {},
  components: {},
  model: {}
}

window.kaleoi = (function(){
  
  /* LOCALS */
  /* REGION */
  var __config = __KaleoiExtensions__.config,
      __components = __KaleoiExtensions__.components,
      __model = __KaleoiExtensions__.model,
      __slice = Array.prototype.slice,
      __mapTypes = [          
          /* Creates a data bind (dom Two-way bind if it is not dirty) */
          'standard',
          
          /* Creates a data bind to the event property */
          'event',
          
          /* Creates a data bind to the stylesheet textContent, possible types: standard, attr, full */
          'stylesheet',
          
          /* Creates a data bind to the style object, possible types: standard, attr, full */
          'style',
          
          /* Creates an attr name and value data bind */
          'attr',
          
          /* Creates an array looped data bind */
          'loop',
          
          /* Creates a component name based data bind */
          'node',
          
          /* Passes a data bind to a sub component */
          'pointer'
      ];
  
  /* helps event bind name checks */
  var __EventList__ = Object.keys(HTMLElement.prototype).filter(function(v){return (v.indexOf('on') === 0);})
      .concat([
        'onDOMContentLoaded','onDOMAttributeNameChanged',
        'onDOMAttrModified','onDOMCharacterDataModified',
        'onDOMNodeInserted','onDOMNodeRemoved',
        'onDOMSubtreeModified'])
      .map(function(v){ return (v.toLowerCase()); });
  
  /* ENDREGION */
  
  /* REGEX */
  /* REGION */
  
  var __matchThisVariable = /(var[\s+]?(.*?)[\s+]?=[\s+]?this([;]?))/g,
      __matchThisProperties = /(this\.(.*?)([\s;=]))/g,
      __matchThisPropertiesVariable = '($variable\.(.*?)([\s;=]))',
      __replaceFunctionName = /^(function)\s?(.*?)\((.[\r\n]*?)+$/;
  
  /* ENDREGION */
  
  /* ERRORS */
  /* REGION */
  
  /* Throws an error if a bind does not match the desired [prop, value] or {prop:value} format */
  function ERROR_PROPERTYBIND(data, value, func)
  {
    if(!value || typeof value !== 'object')
    {
      var funcName = (typeof func === 'function' ? ' Function::' + getFunctionName(func) : '')
      throw new Error(value + ' does not match the [prop, value] or {prop:value} format' + funcName + ' on component ' + data.title);
    }
    return true;
  }
  
  /* ENDREGION */
  
  /* SUB MODULES */
  /* REGION */
  
  /*
   ** Fetches all the required sub modules if they do not exist already
   ** Note: No promise used as solone is a promise shim for older browsers
   */
  function getSubModules(cb)
  {
    /* Gets the local path by this script tag src location */
    var __localpath = getLocalPath(),

        /* Filters already loaded scripts */
        __modules = ['solone', 'czosnek', 'frytki', 'pikantny', 'peprze']
        .filter(function(v){
          return (!scriptExists(v));
        }),
        __fetched = [],
        __script,
        len = __modules.length,
        x = 0;
    
    /* If all script modules have been loaded we run the callback  */
    if(!len) solone.init(cb);
    
    /* when the file loads we add it to fetched, we run the callback when all modules have been loaded */
    function onload()
    {
      if(this.title === 'solone')
      {
        solone.init(function(){
          __fetched.push(1);
          if(__fetched.length === len) return cb();
        })
      }
      else
      {
        __fetched.push(1);
        if(__fetched.length === len) return cb();
      }
    }

    for(x;x<len;x++)
    {
        __script = document.createElement('script');
        __script.setAttribute('src', __localpath + '/' + __modules[x] + '/' + __modules[x] + '.js');
        __script.setAttribute('type', 'text/javascript');
        __script.setAttribute('title', __modules[x]);
        __script.onload = onload;

        /* The IE madness is real IE ONLY */
        __script.onreadystatechange = function()
        {
          if(this.readyState === 'complete') onload.call(this);
        }
        
        __script.onerror = function(err)
        {
            console.error('ERR! Script '+__localpath + '/' + __modules[x] + '/' + __modules[x] +'.js' + ' failed to load', err);
        }
        
        document.head.appendChild(__script);
    }
  }

  /* ENDREGION */
  
  /* FILE HANDLING */
  /* REGION */
  
  /* creates a js script tag based off text */
  function createScript(title, script)
  {
    var sc = document.createElement('script');
    sc.title = title;
    sc.type = 'text/javascript';
    sc.textContent = script;
    document.head.appendChild(sc);
    return sc;
  }

  /* Fetches a file (component, etc) using GET XMLHttpRequest */
  function fetchFile(url, headers)
  {
    return new Promise(function(resolve, reject){
    
      var __xhr = new XMLHttpRequest();

      __xhr.open('GET', url, true);

      /* Set headers for the request if they have been passed */
      if(headers)
      {
        var keys = Object.keys(headers),
            len = keys.length,
            x = 0;

        for(x;x<len;x++)
        {
          __xhr.setRequestHeader(v, headers[keys[x]]);
        }
      }
      
      __xhr.onreadystatechange = function()
      {
        if(__xhr.readyState === 4)
        {
          if(__xhr.status === 200)
          {
            resolve(__xhr.responseText);
          }
          else
          {
            reject(new Error(__xhr.status));
          }
        }
      }
      
      __xhr.send();
    });
  }
  
  /* Checks if a given script containing a keyword exists already in the dom */
  function scriptExists(title)
  {
    var scripts = document.querySelectorAll('script'),
        len = scripts.length,
          x = 0;
    for(x;x<len;x++)
    {
      if(scripts[x].src.indexOf(title) !== -1) return true;
    }
    return false;
  }
  
  /* Gets the local path based on the included script src tag */
  function getLocalPath()
  {
    var scripts = document.querySelectorAll('script'),
        len = scripts.len,
        x = 0;
    for(x;x<len;x++)
    {
      if(scripts[x].src.indexOf('kaleoi') !== -1) return (scripts[x].src.substring(0, scripts[x].src.indexOf('/kaleoi')))
    }
    return '/node_modules';
  }
  
  /* ENDREGION */
  
  /* HANDLING CONFIGS */
  /* REGION */
  
  /* Copies config items to the main config object used in the framework */
  function mapConfigs(configs)
  {
    var __configs = __KaleoiExtensions__.config;
    
    /* loop passed configs to attach */
    Object.keys(configs)
      .forEach(function(k){

        /* add to the already existing config object */
        if(__configs[k] && typeof __configs[k] === 'object')
        {
          if(__configs[k].length)
          {
            __configs[k].concat(configs[k]);
          }
          else
          {
            Object.keys(configs[k]).forEach(function(key){
              __configs[k][key] = configs[k][key];
            })
          }
        }
        else
        {
          __configs[k] = configs[k];
        }
      });
  }
  
  /* Fetches Framework config and local project config and local auth-client config */
  function fetchConfigs()
  {
    var __config = __KaleoiExtensions__.config,
        __prefix = (__config.prefix || '');
    
    /* Fetch global, local, and local auth */
    return Promise.all([
      fetchFile('/node_modules/kaleoi/config.js'),
      fetchFile(__prefix + '/config.js'),
      fetchFile(__prefix + '/auth-client.js')
    ])
    .then(function(nodeConfig, localConfig, auth){

      /* load config scripts, update the global config and clean up */
      var script = createScript('config_setup', ''),
          script_auth = createScript('auth', auth);
      
      script.textContent = nodeConfig.replace('module.exports', '\r\nvar node_config')
      + localConfig.replace('module.exports', '\r\nvar local_config');
      
      mapConfigs(node_config);
      
      mapConfigs(local_config);
      
      /* Cleanup */
      node_config = null;
      local_config = null;
      document.head.removeChild(script);
      document.head.removeChild(script_auth);
    })
    .catch(function(){
      console.error('Failed to fetch configs', arguments);
    });
  }
  
  /* ENDREGION */
  
  /* HELPER METHODS */
  /* REGION */
  
  /* get the last key on a Object string, eg obj.obj.key */
  function getKey(key)
  {
    return (key.split('.').pop());
  }
  
  /* universal descriptor */
  function getDescriptor(value, writable, enumerable, redefinable)
  {
    return {
        value:value,
        writable:!!writable,
        enumerable:!!enumerable,
        configurable:!!redefinable
    }
  }
  
  /* shallow copy from one object to another */
  function copy(obj1, obj2)
  {
    var keys = Object.keys(obj2),
        len = keys.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      obj1[keys[x]] = obj2[keys[x]];
    }
    return obj1;
  }
  
  /* bind all methods on an object to a bindable object */
  function bindMethods(bindable, obj)
  {
    var keys = Object.keys(obj),
        len = keys.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      if(typeof obj[keys[x]] === 'function') obj[keys[x]] = obj[keys[x]].bind(bindable);
    }
    
    return obj;
  }
  
  /* shallow checks all properties if they have getter/setter descriptors, if not it creates them  */
  function convertStaticsToObservables(obj)
  {
    var keys = Object.keys(obj),
        len = keys.length,
        x = 0;
    for(x;x<len;x++)
    {
      if(!obj.isObservable(obj, keys[x])) obj.set(keys[x], obj[keys[x]], true);
    }
    return obj;
  }
  
  /* Parses the attributes object into simple object */
  function parseAttributes(node)
  {
    var __attr = __slice.call(node.attributes),
        __obj = {},
        len = __attr.length,
        x = 0;
    for(x;x<len;x++)
    {
      __obj[__attr[x].name] = __attr[x].value;
    }
    return __obj;
  }
  
  /* Parses a function to see if the `this` keyword was used and what properties were used from it */
  function getFunctionVariables(func)
  {
    var funcString = func.toString(),
        /* maps var if someone used inside a function: var keyword = this; */
        matchVariable = funcString.match(__matchThisVariable),
        /* maps all the properties used from `this` keyword */
        matchProperties = funcString.match(__matchThisProperties),
        variable,
        rx,
        variableProperties = [];
    
    /* if a variable was used we fetch all used properties using this variable term */
    if(matchVariable)
    {
      variable = matchVariable[0].replace(__matchThisVariable, '$2');
      rx = new RegExp(__matchThisPropertiesVariable.replace('$variable', variable),'g');
      variableProperties = funcString.match(rx)
      .map(function(v){
        return v.replace(rx, '$2');
      });
    }
    /* fetches all the properties used with the `this` keyword */
    if(matchProperties)
    {
      return matchProperties
      .map(function(v){
        return v.replace(__matchThisProperties, '$2');
      })
      .concat(variableProperties);
    }
    
    return variableProperties;
  }
  
  /* gets the name of the function */
  function getFunctionName(func)
  {
    return (func.name || func.toString().replace(__replaceFunctionName, '$2') || func.toString());
  }
  
  function getFullStylePropertyName(name)
  {
    return name.replace(/([A-Z])/g, '-$1');
  }

  /* ENDREGION */
  
  /* HANDLING EVENT MESSAGING */
  /* REGION */
  
  /* alerts handle holding the newest value in the case of any new listens happen */
  var __alerts = {},
      
      /* holds all the listeners for all components */
      __eventbus = {};
  
  /* listen to key on the evnt bus, fires method when an alert happens */
  function listen(key, func)
  {
    if(!__eventbus[key]) __eventbus[key] = [];
    __eventbus[key].push(func);
    if(__alerts[key]) func(__alerts[key]);
    return Kaleoi;
  }
  
  /* stop listening to alerts */
  function unlisten(key, func)
  {
    var event = __eventbus[key]
    if(event)
    {
      var len = event.length,
          x = 0;
      
      for(x;x<len;x++)
      {
        if(event[x] === func)
        {
          event.splice(x,1);
          break;
        }
      }
    }
    return Kaleoi;
  }
  
  /* run all listener methods with the new value */
  function alert(key, value)
  {
    var event = __eventbus[key];
    if(event)
    {
      var len = event.length,
          x = 0;
      for(x;x<len;x++)
      {
        event[x](value);
      }
    }
    __alerts[key] = value;
    return Kaleoi;
  }
  
  /* ENDREGION */
  
  /* HANDLING STORAGE */
  /* REGION */
  
  /* Fetch JSON string data from the storage to attach to a data object */
  function getStorage(type, key, obj)
  {
    var __data = (type !== 'model' ? window[type + 'Storage'].getItem(key) : __model.get(key))
    if(__data) copy(obj, (typeof __data === 'string' ? JSON.parse(__data) : __data));
    return obj;
  }
  
  /* Set a JSON string data to storage from a data object */
  function setStorage(type, key, obj)
  {
    window[type + 'Storage'].setItem(key, JSON.stringify(obj));
    return obj;
  }
  
  /* Set data from storage, if storage/model data does not exist we set it */
  function storageHelper(key, filters, data)
  {
    /* priority: model <= session <= local, model being of most importance */
    var storageType = ((filters.model.length && 'model') || (filters.session.length && 'session') || (filters.local.length && 'local')),

        /* Get the property for accessing the stored data */
        storageKey = (['local', 'session'].indexOf(storageType) !== -1 ? storageType + 'Storage' : storageType),

        /* Check if the storage contains the data we want */
        storeGet = (storageKey && (storageKey !== 'model' ? window[storageKey].getItem(filters[storageType][0]) : __model.get(key)));
    
    /* If we have any stored data */
    if(storageType)
    {
      /* If we have any data we can fetch from storage */
      if(storeGet !== undefined)
      {
        return data.set(key, (typeof storeGet === 'string' ? JSON.parse(storeGet) : storeGet));
      }

      /* Set the storage with the current data */
      if(storageType !== 'model')
      {
         return window[storageKey].setItem(filters[storageType], data.get(key));
      }

      /* Set the model with the current data */
      return (__model.set(filters[storageType], data.get(key)));
    }
  }
  
  /* ENDREGION */
  
  /* HANDLING COMPONENTS VIEW MODEL DATA  */
  /* REGION */
  
  function handleParams(vm, params)
  {
    var keys = Object.keys(params),
        len = keys.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      vm[keys[x]] = params[keys[x]];
    }
    
    return vm;
  }
  
  /* helps to extend the functionality of each component class */
  function wrap_component(title, component)
  {
    function Component_wrapper(expanded, innerHTML, params)
    {
      /* SET EXTRA FUNCTIONALITY DEFAULTS */
      Object.defineProperties(this, {
        /* Whether the data in this component should be stored in session storage */
        sessionStorage: getDescriptor(false, true),

        /* Whether the data in this component should be stored in local storage */
        localStorage: getDescriptor(false, true),

        /* Whether the data in this component should be stored in the model */
        store: getDescriptor(false, true),

        /* Whether this component is allowed to have multiple copies of itself as child components (recursive) */
        multiple: getDescriptor(false, true),

        /* extends the filters */
        filters: getDescriptor(copy({}, __config.filters)),
        
        /* COMPONENT INNER CHILD NODES */
        innerHTML: getDescriptor((innerHTML || ''), true),
        
        /* THE ACTUAL EXPANDED COMPONENT NODES */
        component: getDescriptor(expanded, true),
        
        /* This method runs after the component has fully rendered */
        onfinish: getDescriptor(function(){}, true),
        
        /* Make a copy of the frytki extensions */
        __frytkiExtensions__: getDescriptor(frytki().__frytkiExtensions__, true)
      })
      
      /* CREATE OVERWRITE */
      component.apply(this, arguments);
      
      /* BIND FILTERS TO THIS */
      this.filters = bindMethods(this, this.filters);
      
      /* FETCH STORAGE VALUES */
      if(this.localStorage)
      {
        getStorage('local', this.name, this);
        /* listen for any update and update the storage */
        this.addEventListener('*update', (function(){
          setStorage('local', this.name, this);
        }).bind(this))
      }
      
      if(this.sessionStorage)
      {
        getStorage('session', this.name, this);
        /* listen for any update and update the storage */
        this.addEventListener('*update', (function(){
          setStorage('session', this.name, this);
        }).bind(this))
      }
      
      if(this.store)
      {
        getStorage('model', this.name, this);
        /* listen for any update and update the storage */
        this.addEventListener('*update', (function(){
          setStorage('model', this.name, this);
        }).bind(this))
      }
      
      /* If any params were passed we add them to the object */
      if(params) handleParams(this, params);
      
      /* BIND SUB METHODS TO THIS */
      bindMethods(this, this);
      
      /* OVERWRITE ALL ENUMERABLE PROPERTIES TO BE OBSERVABLE */
      return convertStaticsToObservables(this);
    }
    
    /* Inherit from frytki */
    Component_wrapper.prototype = frytki();
    
    /* COPY PROTOTYPES FROM COMPONENT */
    Component_wrapper.prototype = copy(Component_wrapper.prototype, component.prototype);
    
    /* SET EXTRA PROTOTYPE FUNCTIONALITY */
    Component_wrapper.prototype.name = title;
    Component_wrapper.prototype.listen = listen;
    Component_wrapper.prototype.unlisten = unlisten;
    Component_wrapper.prototype.alert = alert;
    
    return Component_wrapper;
  }
  
  /* Fetch the component view model file and wrap the component with extra functionality */
  function fetchComponentVM(title)
  {
    var __exists = !!__components[title];
    
    return solone(title)
    .then(function(component){
      
      var __html = component.prototype.__extensionsHTML__,
          __css = component.prototype.__extensionsCSS__;
      
      /* ATTACH AND PROCESS EXTRA FUNCTIONALITY */
      if(!__exists) __components[title] = wrap_component(title, component);
      
      czosnek.register(title, __html, __css);
      
      return __components[title];
    })
    .catch(function(){
      throw new Error('ERR! Failed to retrieve component ' + title);
    })
  }
  
  /* ENDREGION */
  
  /* HANDLING COMPONENTS */
  /* REGION */
  
  /* Fetches from the server all the components that do not exist yet */
  function fetchUnknownComponents(components)
  {
    return Promise.all(components.map(function(v){
      return fetchComponentVM(v);
    }));
  }
  
  /* Check which components have not been fetched yet */
  function checkIfComponentsFetched(components)
  {
    var __unfetched = [],
        __title,
        len = components.length,
        x = 0;
    for(x;x<len;x++)
    {
      __title = components[x].nodeName.toLowerCase();
      if(!czosnek.isRegistered(__title)) __unfetched.push(__title);
    }
    return __unfetched;
  }
  
  /* Fetch all sub components and map them */
  function createComponents(node)
  {
    /* Parses html string for elements that are not normal DOM elements */
    var __unknown = czosnek.getUnknown(node),

        /* Checks which components have not been fetched from the server */
        __unfetched = checkIfComponentsFetched(__unknown),
        len = __unknown.length,
        x = 0;
    
    /* If any components are not fetched from the server we fetch them and then map them */
    if(__unfetched.length)
    {
      fetchUnknownComponents(__unfetched)
      .then(function(){ for(x;x<len;x++) { mapComponent(__unknown[x]) } })
      .catch(function(e){
        console.error('Failed to fetch components: ', __unfetched, e);
      });
    }
    /* else if we just map all components  */
    else if(__unknown.length)
    {
       for(x;x<len;x++)
       {
         mapComponent(__unknown[x]);
       }
    }
  }
  
  /* Method to individually fetch a component and return it */
  function createComponent(node)
  {
    var title = node.nodeName.toLowerCase();
    return new Promise(function(resolve, reject){
      if(!czosnek.isRegistered(title)) {
        fetchComponentVM(title)
        .then(function(){ return mapComponent(node) })
        .then(function(map){ resolve(map.component) })
        .catch(function(e){
          e.message = 'Failed to fetch component: ' + title;
          reject(e);
        })
      }
      else
      {
        resolve(mapComponent(node).component);
      }
    })
  }
  
  /* Removes a component from the dom and destructs all maps */
  function removeComponent(component)
  {
    component.__CzosnekRoot__.destruct();
    component.parentElement.removeChild(component);
  }
  
  /* ENDREGION */
  
  /* HANDLING MAPS */
  /* REGION */
  
  function mapComponent(component)
  {
    var __title = component.nodeName.toLowerCase(),
        __map = new czosnek(__title),
        __maps = __map.maps,
        __params = parseAttributes(component),
        __innerHTML = component.childNodes,
        __expanded = __map.component,
        __vm = new __components[__title](__expanded, __innerHTML, __params),
        len = __maps.length,
        x = 0;
    
    Object.defineProperty(__expanded, '__KaleoiExtensions__', getDescriptor({
      title: __title,
      vm: __vm,
      params: __params,
      root: __expanded
    }))
    
    if(component.parentElement) component.parentElement.replaceChild(__expanded, component);
    
    for(x;x<len;x++){ handleMaps(__maps[x], __vm) }
    
    if(__vm.onfinish) __vm.onfinish();
    createComponents(__expanded);
    return __map;
  }
  
  function runThroughFilters(value, filters, filterFuncs)
  {
    var len = filters.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      value = (filterFuncs[filters[x]] ? filterFuncs[filters[x]](value) : value);
    }
    
    return value;
  }
  
  function handleMaps(map, data)
  {
    /*see map types in locals */
    var mapType = __mapTypes.indexOf(map.type);
    
    /* overwrite data with stored data if was used */
    storageHelper(map.key, map.filters, data);
    
    map.value = data.get(map.key);
    
    if(map.mapValues && map.mapValues.length)
    {
      var len = map.mapValues.length,
          x = 0;
      for(x;x<len;x++)
      {
        handleMaps(map.mapValues[x], data);
      }
    }
    
    if(!map.value) return (!!console.error('Component: ' + data.name, new Error('You are missing the viewmodel property of ' + map.key)));
    
    if(typeof map.value === 'function') map.value = map.value.bind(data);
    if(typeof map.value === 'object') map.value = copy(map.value, {});
    /* set stop bind method, (stops updates to prevent stack overflow) */
    map.stop = ((map.local && map.local.stop) ? map.local.stop.bind(map.local) : map.node.stop.bind(map.node));
    
    if(!map.isPropertyValue)
    {
      switch(mapType)
      {
        case 0:
          return handleStandard(map, data);
        case 1:
          return handleEvent(map, data);
        case 2:
          return handleStyleSheet(map, data);
        case 3:
          return handleStyle(map, data);
        case 4:
          return handleAttr(map, data);
        case 5:
          return handleLoop(map, data);
        case 6:
          return handleNode(map, data);
        case 7:
          return handlePointer(map, data);
      } 
    }
  }
  
  function parseAttrNameValue(val, data, attrValue, next)
  {
    if(typeof val === 'string')
    {
      if(val.indexOf(':') !== -1) return val;
      if(attrValue) return val + ':' + attrValue + (next && next.indexOf(';') !== -1 ? '' : ';');
    }
    else if(val && typeof val === 'object')
    {
      var __key = Object.keys(val)[0];
      if(attrValue !== undefined)
      {
        if(val.length) return val[0] + ':' + attrValue + (next && next.indexOf(';') !== -1 ? '' : ';');
        if(__key) return __key + ':' + attrValue + (next && next.indexOf(';') !== -1 ? '' : ';');
      }
      else
      {
        if(val.length === 2) return val[0] + ':' + val[1] + (next && next.indexOf(';') !== -1 ? '' : ';');
        if(__key) return __key + ':' + val[__key] + (next && next.indexOf(';') !== -1 ? '' : ';');
      }
    }
    return ERROR_PROPERTYBIND(data, val, parseAttrNameValue);
  }
  
  /* SPECIAL CASE LISTENERS */
  
  /* PROPERTIES INSIDE COMPUTE FUNCTIONS */
  /* adds the listeners for properties that were used in compute functions */
  function addInnerFunctionListeners(map, data, func)
  {
    var __layer,
        __key,
        __inner = getFunctionVariables(func),
        len = __inner.length,
        x = 0;
    
    if(!map.subfunctionlistener) map.subfunctionlistener = subFunctionListener(map, data);
    
    for(x;x<len;x++)
    {
      __layer = data.findLayer(__inner[x]);
      __key = getKey(__inner[x])
      __layer.addEventListener(__key,map.subfunctionlistener);
    }
  }
  
  /* removes the listeners for properties that were used in compute functions */
  function removeInnerFunctionListeners(map, data, func)
  {
    var __layer,
        __key,
        __inner = getFunctionVariables(func),
        len = __inner.length,
        x = 0;
    for(x;x<len;x++)
    {
      __layer = data.findLayer(__inner[x]);
      __key = getKey(__inner[x])
      __layer.removeEventListener(__key,map.datalistener);
    }
  }
  
  function subFunctionListener(map, data)
  {
    return function subFunctionListener(e)
    {
      e.value = map.value;
      return map.datafunctionlistener.call(data, e);
    }
  }
  
  /* PROPERTIES INSIDE OBJECTS */
  
  function addSubDataListeners(map, data, layer, dbkey)
  {
    var __obj = layer[dbkey],
        __keys = Object.keys(__obj),
        x = 0,
        len = __keys.length;
    
    if(!map.subdatalistener) map.subdatalistener = subDataListener(map, data);
    
    for(x;x<len;x++)
    {
      __obj.addEventListener(__keys[x], map.subdatalistener);
    }
  }
  
  function removeSubDataListeners(map, data, layer, dbkey)
  {
    var __obj = layer[dbkey],
        __keys = Object.keys(__obj),
        x = 0,
        len = __keys.length;
    
    for(x;x<len;x++)
    {
      __obj.removeEventListener(__keys[x], map.subdatalistener);
    }
  }
  
  function subDataListener(map, data)
  {
    return function subDataListener(e)
    {
      e.value = map.value;
      e.subchange = true;
      return map[(typeof map.value === 'function' ? 'datafunctionlistener' : 'datalistener')].call(data, e);
    }
  }
  
  /* STANDARD */
  /* REGION */
  function handleStandard(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    map.local[map.localAttr] = loopStandardValue(map.mapText, data);
    if(!map.isInsert)
    {
      map.datalistener = standardDataListener(map, data, __layer, __key);
      map.datafunctionlistener = standardFunctionDataListener(map, data, __layer, __key);
      map.domlistener = standardDomListener(map, data, __layer, __key);
      map.domfunctionlistener = standardFunctionDomListener(map, data, __layer, __key);
      
      if(typeof map.value === 'function')
      {
        __layer.addEventListener(__key, map.datafunctionlistener);
        if(!map.isDirty) map.node.addEventListener(map.listener, map.domfunctionlistener);
      }
      else
      {
        __layer.addEventListener(__key, map.datalistener);
        if(!map.isDirty) map.node.addEventListener(map.listener, map.domlistener);
      }
    }
  }
  
  function loopStandardValue(mapText, data)
  {
    var __text = '',
        __map,
        __val,
        __dataFilters = data.filters,
        x = 0,
        len = mapText.length;
    for(x;x<len;x++)
    {
      __map = mapText[x];
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else if(__map.value !== undefined)
      {
        __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
        __text += __val;
        if(__map.isInsert)
        {
          __map.mapText[x] = __val;
          __map.maps[__map.mapIndex] = __val;
        }
      }
    }
    return __text;
  }
  
  function standardDataListener(map, data, layer, dbkey)
  {
    /* So when the event fires and we use a debugger we have the name of the method */
    return function standardDataListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        if(!map.isDirty) map.node.removeEventListener(map.localAttr + 'update', map.domlistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* Set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
        
        /* Add the dom listeners */
        if(!map.isDirty) map.node.addEventListener(map.localAttr, map.domfunctionlistener);
      }
      else
      {
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  
  function standardFunctionDataListener(map, data, layer, dbkey)
  {
    return function standardFunctionDataListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        if(!map.isDirty) map.node.removeEventListener(map.localAttr, map.domfunctionlistener);
        
        /* Add new data listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
        
        /* Add dom listener */
        if(!map.isDirty) map.node.addEventListener(map.localAttr + 'update', map.domlistener);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  
  function standardDomListener(map, data, layer, dbkey)
  {
    return function standardDomListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        map.node.removeEventListener(map.localAttr + 'update', map.domlistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Set the data property */
        layer.stop()[dbkey] = map.value;
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* Set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
        
        /* Add the dom listeners */
        map.node.addEventListener(map.localAttr, map.domfunctionlistener);
      }
      else
      {
        map.value = e.value;
        layer.stop()[dbkey] = map.value;
      }
    }
  }
  
  function standardFunctionDomListener(map, data, layer, dbkey)
  {
    return function standardFunctionDomListener(e)
    {
      /* if this is a stopped event we want to stop the changes */
      if(e.stopped) return (e.srcElement.__pikantnyExtensions__.stop = undefined);
      
      if(typeof e.value !== 'function')
      {
        /* remove the listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        map.node.removeEventListener(map.localAttr, map.domfunctionlistener);
        
        /* set the data value */
        map.value = e.value;
        layer.stop()[dbkey] = map.value;
        
        /* add the listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        map.node.addEventListener(map.localAttr, map.domlistener);
      }
      else
      {
        e.preventDefault();
        
        /* remove the inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind function to the viewmodel and set data */
        map.value = (e.value).bind(data);
        layer.stop()[dbkey] = map.value;
        
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  /* ENDREGION */
  
  /* EVENT */
  /* REGION */
  function handleEvent(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    /* Error if the wrong type */
    if(typeof __layer[__key] !== 'function') return ERROR_PROPERTYBIND(data, __layer[__key], handleEvent);
    
    /* Set the event */
    map.node[map.property] = map.value;
    
    if(!map.insert)
    {
      map.datalistener = eventDataListener(map, data, __layer, __key);
      map.domlistener = eventDomListener(map, data, __layer, __key);
      
      __layer.addEventListener(__key, map.datalistener);
      map.node.addEventListener(map.property, map.domlistener);
    }
  }
  
  function eventDataListener(map, data, layer, dbkey)
  {
    return function eventDataListener(e)
    {
      if(typeof e.value !== 'function')
      {
        e.preventDefault();
        return ERROR_PROPERTYBIND(data, layer[dbkey], eventDataListener);
      }
      else
      {
        map.value = e.value.bind(data);
        map.node.stop()[map.property] = map.value;
      }
    }
  }
  
  function eventDomListener(map, data, layer, dbkey)
  {
    return function eventDomListener(e)
    {
      if(typeof e.value !== 'function')
      {
        e.preventDefault();
        return ERROR_PROPERTYBIND(data, layer[dbkey], eventDomListener);
      }
      else
      {
        map.value = e.value.bind(data);
        layer.stop()[dbkey] = map.value;
      }
    }
  }
  /* ENDREGION */
  
  /* STYLESHEET */
  /* stylesheet has 4 types, full style, full prop style, prop name, string (eg. anywhere other than the above) */
  function handleStyleSheet(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    map.local[map.localAttr] = loopStylesheetValue(map.mapText, data);
    if(!map.isInsert)
    {
      if(map.isFullStyle)
      {
        map.datalistener = stylesheetDataFullStyleListener(map, data, __layer, __key);
        map.datafunctionlistener = stylesheetFunctionDataFullStyleListener(map, data, __layer, __key);
        if(typeof map.value !== 'function') addSubDataListeners(map, data, __layer, __key);
      }
      else if(map.isFullProp)
      {
        map.datalistener = styelsheetDataFullPropListener(map, data, __layer, __key);
        map.datafunctionlistener = styelsheetFunctionDataFullPropListener(map, data, __layer, __key);
        if(typeof map.value !== 'function') addSubDataListeners(map, data, __layer, __key);
      }
      else if(map.isProperty)
      {
        map.datalistener = stylesheetDataPropListener(map, data, __layer, __key);
        map.datafunctionlistener = stylesheetFunctionDataPropListener(map, data, __layer, __key);
      }
      else
      {
        map.datalistener = stylesheetDataListener(map, data, __layer, __key);
        map.datafunctionlistener = stylesheetFunctionDataListener(map, data, __layer, __key);
      }
      
      if(typeof map.value === 'function')
      {
        __layer.addEventListener(__key, map.datafunctionlistener);
      }
      else
      {
        __layer.addEventListener(__key + 'update', map.datalistener);
      }
    }
  }
  
  /* this loops over property name binds associated values */
  function loopStyleSheetAttributeValues(mapText, data)
  {
    var __text = '',
        __map,
        __val,
        __dataFilters = data.filters,
        x = 0,
        len = mapText.length;
    for(x;x<len;x++)
    {
      __map = mapText[x];
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else
      {
        __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
        __text += __val;
        if(__map.isInsert)
        {
          __map.mapText[x] = __val;
          __map.maps[__map.mapIndex] = __val;
        }
      }
    }
    return __text;
  }
  
  /* This loops all the stylesheet binds */
  function loopStylesheetValue(mapText, data)
  {
    var __text = '',
        __map,
        __val,
        __dataFilters = data.filters,
        x = 0,
        len = mapText.length;
    for(x;x<len;x++)
    {
      __map = mapText[x];
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else if(__map.value)
      {
        /* full map style */
        if(__map.isFullStyle)
        {
          __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);

          if(!__val || typeof __val !== 'object') return ERROR_PROPERTYBIND(data, __val, loopStylesheetValue);

          __val = JSON.stringify(__val, null, 2)
          .replace(/[{}",]/g, '')
          .replace(/[\r\n]/g, ';\r\n')
          .replace(';', '');

          __text += __val;
          if(__map.isInsert)
          {
            __map.mapText[x] = __val;
            __map.maps[__map.mapIndex] = __val;
          }
        }
        /* full property style */
        else if(__map.isFullProp)
        {
          __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
          __val = parseAttrNameValue(__val, data, undefined, mapText[(x + 1)]);
          __text += (__val || '');
          if(__map.isInsert)
          {
            __map.mapText[x] = __val;
            __map.maps[__map.mapIndex] = __val;
          }
        }
        /* style property name */
        else if(__map.isProperty)
        {
          var __attrValue = loopStyleSheetAttributeValues(__map.values, data);

          __val = runThroughFilters(typeof __map.value === 'function' ? __map.value(__attrValue) : __map.value, __map.filters.filters, __dataFilters);
          __val = parseAttrNameValue(__val, data, __attrValue, mapText[(x + 1)]);
          __text += (__val || '');
          if(__map.isInsert)
          {
            __map.mapText[x] = __val;
            __map.maps[__map.mapIndex] = __val;
          }
        }
        /* standard string */
        else
        {
          __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
          __text += __val;
          if(__map.isInsert)
          {
            __map.mapText[x] = __val;
            __map.maps[__map.mapIndex] = __val;
          }
        }
      }
    }
    return __text;
  }
  
  function stylesheetDataListener(map, data, layer, dbkey)
  {
    return function stylesheetDataListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* Set the dom property */
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
      else
      {
        map.value = e.value;
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
    }
  }
  
  function stylesheetFunctionDataListener(map, data, layer, dbkey)
  {
    return function stylesheetFunctionDataListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  
  function stylesheetDataFullStyleListener(map, data, layer, dbkey)
  {
    return function stylesheetDataFullStyleListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        removeSubDataListeners(map, data, layer, dbkey);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* Set the dom property */
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
      else
      {
        if(typeof e.value !== 'object') return ERROR_PROPERTYBIND(data, e.value, stylesheetDataFullStyleListener);
        map.value = e.value;

        if(!e.subchange) addSubDataListeners(map, data, layer, dbkey);
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
    }
  }
  
  function stylesheetFunctionDataFullStyleListener(map, data, layer, dbkey)
  {
    return function stylesheetFunctionDataFullStyleListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        addSubDataListeners(map, data, layer, dbkey);
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }

  function styelsheetDataFullPropListener(map, data, layer, dbkey)
  {
    return function styelsheetDataFullPropListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        removeSubDataListeners(map, data, layer, dbkey);

        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);

        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);

        /* Set the dom property */
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
      else
      {
        if(typeof e.value !== 'object') return ERROR_PROPERTYBIND(data, e.value, styelsheetDataFullPropListener);
        map.value = e.value;

        if(!e.subchange) addSubDataListeners(map, data, layer, dbkey);
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
    }
  }
  
  function styelsheetFunctionDataFullPropListener(map, data, layer, dbkey)
  {
    return function styelsheetFunctionDataFullPropListener(e)
    {
      if(typeof e.value !== 'function')
      {
         /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        addSubDataListeners(map, data, layer, dbkey);
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  
  function stylesheetDataPropListener(map, data, layer, dbkey)
  {
    return function stylesheetDataPropListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* Set the dom property */
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
      else
      {
        map.value = e.value;
        map.stop()[map.localAttr] = loopStylesheetValue(map.mapText, data);
      }
    }
  }
  
  function stylesheetFunctionDataPropListener(map, data, layer, dbkey)
  {
    return function stylesheetFunctionDataPropListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);
        
        /* set the dom property */
        map.stop()[map.localAttr] = loopStandardValue(map.mapText, data);
      }
    }
  }
  
  /* STYLE */
  /* style refers to the elements inline style property: full style, full prop style, prop name, string */
  function handleStyle(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    if(map.isFullStyle)
    {
      loopFullStyle(map, data);
      if(!map.isInsert)
      {
        map.datalistener = styleDataFullListener(map, data, __layer, __key);
        map.datafunctionlistener = styleFunctionFullListener(map, data, __layer, __key);
        if(typeof map.value !== 'function') addSubDataListeners(map, data, __layer, __key);
      }
    }
    else if(map.isFullProp)
    {
      loopStyleFullProperty(map, data);
      if(!map.isInsert)
      {
        map.datalistener = styleFullPropDataListener(map, data, __layer, __key);
        map.datafunctionlistener = styleFullPropFunctionListener(map, data, __layer, __key);
        if(typeof map.value !== 'function') addSubDataListeners(map, data, __layer, __key);
      }
    }
    else if(map.isProperty)
    {
      loopStylePropertyName(map, data);
      if(!map.isInsert)
      {
        map.datalistener = stylePropDataListener(map, data, __layer, __key);
        map.datafunctionlistener = stylePropFunctionListener(map, data, __layer, __key);
      }
    }
    else
    {
      map.stop().style[map.property] = loopStyleValue(map.mapText, data);
      if(!map.isInsert)
      {
        map.datalistener = styleDataListener(map, data, __layer, __key);
        map.datafunctionlistener = styleFunctionListener(map, data, __layer, __key);
      }
    }

    if(!map.isInsert)
    {
      if(typeof map.value === 'function')
      {
        __layer.addEventListener(__key, map.datafunctionlistener);
      }
      else
      {
        __layer.addEventListener(__key + 'update', map.datalistener);
      }
    }
  }

  function loopFullStyle(map, data)
  {
    var __dataFilters = data.filters,
        __val = runThroughFilters(typeof map.value === 'function' ? map.value() : map.value, map.filters.filters, __dataFilters),
        __keys = Object.keys(__val),
        len = __keys.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      map.stop().style[__keys[x]] = __val[__keys[x]];
    }
  }
  
  function loopStyleValue(mapText, data)
  {
    var __text = '',
        __map,
        __val,
        __dataFilters = data.filters,
        x = 0,
        len = mapText.length;

    for(x;x<len;x++)
    {
      __map = mapText[x];
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else
      {
        __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
        __text += __val;
        if(__map.isInsert)
        {
          __map.mapText[x] = __val;
          __map.maps[__map.mapIndex] = __val;
        }
      }
    }

    return __text;
  }

  function unsetStylePropertyName(map, data)
  {
    var __dataFilters = data.filters,
        __val = runThroughFilters(typeof map.value === 'function' ? map.value() : map.value, map.filters.filters, __dataFilters);

    map.node.style.removeProperty(getFullStylePropertyName(__val));
  }

  function loopStylePropertyName(map, data)
  {
    var __dataFilters = data.filters,
        __val = runThroughFilters(typeof map.value === 'function' ? map.value() : map.value, map.filters.filters, __dataFilters);

    map.stop().style[__val] = loopStylePropertyValue(map.values, data);
  }

  function loopStylePropertyValue(mapText, data)
  {
    var __text = '',
        __map,
        __val,
        __dataFilters = data.filters,
        x = 0,
        len = mapText.length;

    for(x;x<len;x++)
    {
      __map = mapText[x];
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else
      {
        __val = runThroughFilters(typeof __map.value === 'function' ? __map.value() : __map.value, __map.filters.filters, __dataFilters);
        __text += __val;
        if(__map.isInsert)
        {
          __map.mapText[x] = __val;
          __map.maps[__map.mapIndex] = __val;
        }
      }
    }

    return __text;
  }

  function loopStyleFullProperty(map, data)
  {
    var __dataFilters = data.filters,
        __val = runThroughFilters(typeof map.value === 'function' ? map.value() : map.value, map.filters.filters, __dataFilters);
        __subValues = loopStylePropertyValue(map.values, data);
    
    map.stop().style[__val] = __subValues;
  }

  function styleDataFullListener(map, data, layer, dbkey)
  {
    return function styleDataFullListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        removeSubDataListeners(map, data, layer, dbkey);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);

        loopFullStyle(map, data);
      }
      else
      {
        if(typeof e.value !== 'object') return ERROR_PROPERTYBIND(data, e.value, styleDataFullListener);
        map.value = e.value;

        if(!e.subchange) addSubDataListeners(map, data, layer, dbkey);
        loopFullStyle(map, data);
      }
    }
  }

  function styleFunctionFullListener(map, data, layer, dbkey)
  {
    return function styleFunctionFullListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        addSubDataListeners(map, data, layer, dbkey);
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;

        loopFullStyle(map, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);

        loopFullStyle(map, data);
      }
    }
  }

  function styleDataListener(map, data, layer, dbkey)
  {
    var __mapText = map.mapText;
    return function styleDataListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);

        map.stop().style[map.property] = loopStyleValue(__mapText, data);
      }
      else
      {
        map.value = e.value;
        map.stop().style[map.property] = loopStyleValue(__mapText, data);
      }
    }
  }

  function styleFunctionListener(map, data, layer, dbkey)
  {
    var __mapText = map.mapText;
    return function styleFunctionListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;

        map.stop().style[map.property] = loopStyleValue(__mapText, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);

        map.stop().style[map.property] = loopStyleValue(__mapText, data);
      }
    }
  }

  function stylePropDataListener(map, data, layer, dbkey)
  {
    return function stylePropDataListener(e)
    {
      unsetStylePropertyName(map, data);
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);

        loopStylePropertyName(map, data);
      }
      else
      {
        map.value = e.value;
        loopStylePropertyName(map, data);
      }
    }
  }

  function stylePropFunctionListener(map, data, layer, dbkey)
  {
    return function stylePropFunctionListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;

        loopStylePropertyName(map, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);

        loopStylePropertyName(map, data);
      }
    }
  }

  function styleFullPropDataListener(map, data, layer, dbkey)
  {
    return function styleFullPropDataListener(e)
    {
      if(typeof e.value === 'function')
      {
        /* Remove old listeners */
        layer.removeEventListener(dbkey + 'update', map.datalistener);
        removeSubDataListeners(map, data, layer, dbkey);
        
        /* bind function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* Add the new data listeners */
        layer.addEventListener(dbkey, map.datafunctionlistener);
        addInnerFunctionListeners(map, data, map.value);

        loopStyleFullProperty(map, data);
      }
      else
      {
        map.value = e.value;
        loopStyleFullProperty(map, data);
      }
    }
  }

  function styleFullPropFunctionListener(map, data, layer, dbkey)
  {
    return function styleFullPropFunctionListener(e)
    {
      if(typeof e.value !== 'function')
      {
        /* Remove listeners */
        removeInnerFunctionListeners(map, data, map.value);
        layer.removeEventListener(dbkey, map.datafunctionlistener);
        
        /* Add new data listeners */
        addSubDataListeners(map, data, layer, dbkey);
        layer.addEventListener(dbkey + 'update', map.datalistener);
        
        /* set the dom property */
        map.value = e.value;

        loopStyleFullProperty(map, data);
      }
      else
      {
        /* Remove inner listeners */
        removeInnerFunctionListeners(map, data, map.value);
        
        /* bind the new function to the viewmodel */
        map.value = (e.value).bind(data);
        
        /* add new inner listeners */
        addInnerFunctionListeners(map, data, map.value);

        loopStyleFullProperty(map, data);
      }
    }
  }

  /* ATTRIBUTE NAME */
  function handleAttr(map, data)
  {
    
  }
  
  /* LOOP */
  function handleLoop(map, data)
  {
    
  }
  
  /* NODE */
  function handleNode(map, data)
  {
    
  }
  
  /* COMPONENT ATTRIBUTE [POINTER] */
  function handlePointer(map, data)
  {
    
  }
  /* ENDREGION */
  
  function Kaleoi(config)
  { 
    return getSubModules(function(){
        
        fetchConfigs()
        .then(function(){
          if(config) mapConfigs(config);
          
          solone.useBackend = (!!__config.backendRouting);
          solone.prefix(__config.prefix);
          
          /* SET INITIAL MODEL */
          __model = __KaleoiExtensions__.model = frytki(__KaleoiExtensions__.model);

          /* START COMPONENT CREATION PROCESS */
          createComponents(document.body);
        })
        .catch(function(){
          throw new Error("ERR! Failed constructor");
        })
    })
  }
  
  Object.defineProperties(Kaleoi, {
    createComponent: getDescriptor(createComponent),
    removeComponent: getDescriptor(removeComponent)
  })
  
  return Kaleoi;
}())