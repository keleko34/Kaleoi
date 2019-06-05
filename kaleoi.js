window.__KaleoiExtensions__ = {
  config: {},
  components: {}
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
  
  function getSubModules(cb)
  {
    var __localpath = getLocalPath(),
        __modules = ['solone', 'czosnek', 'frytki', 'pikantny', 'peprze']
        .filter(function(v){
          return (!scriptExists(v));
        }),
        __fetched = [],
        __script,
        len = __modules.length,
        x = 0;
    
    if(!len) cb();
    
    for(x;x<len;x++)
    {
        __script = document.createElement('script');
        __script.setAttribute('src', __localpath + '/' + __modules[x] + '/' + __modules[x] + '.js');
        __script.setAttribute('type', 'text/javascript');
        __script.setAttribute('title', __modules[x]);
        __script.onload = function()
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
        __script.onerror = function(err)
        {
            console.error('ERR! Script '+__localpath + '/' + __modules[x] + '/init.js' + ' failed to load', err);
        }
        
        document.head.appendChild(__script);
    }
  }
  
  /* ENDREGION */
  
  /* FILE HANDLING */
  /* REGION */
  
  function createScript(title, script)
  {
    var sc = document.createElement('script');
    sc.title = title;
    sc.type = 'text/javascript';
    sc.textContent = script;
    document.head.appendChild(sc);
    return sc;
  }
  
  function fetchFile(url, headers)
  {
    return new Promise(function(resolve, reject){
    
      var __xhr = new XMLHttpRequest()

      __xhr.open('GET', url, true);

      if(headers)
      {
        Object.keys(headers)
        .forEach(function(v){
          __xhr.setRequestHeader(v, headers[v]);
        })
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
  
  function scriptExists(title)
  {
    var scripts = document.querySelectorAll('script'),
        len = scripts.len,
          x = 0;
    for(x;x<len;x++)
    {
      if(scripts[x].src.indexOf(title) !== -1) return true;
    }
    return false;
  }
  
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
    
    Object.keys(configs)
      .forEach(function(k){
        if(__configs[k] && typeof __configs[k] === 'object')
        {
          if(__configs[k].length)
          {
            __configs[k].concat(__configs[k]);
          }
          else
          {
            Object.keys(__configs[k]).forEach(function(key){
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
    
    return Promise.all([
      fetchFile('/node_modules/kaleoi/config.js'),
      fetchFile(__prefix + '/config.js'),
      fetchFile(__prefix + '/auth-client.js')
    ])
    .then(function(nodeConfig, localConfig, auth){
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
  
  function getKey(key)
  {
    return (key.split('.').pop());
  }
  
  function getDescriptor(value,writable,enumerable, redefinable)
  {
    return {
        value:value,
        writable:!!writable,
        enumerable:!!enumerable,
        configurable:!!redefinable
    }
  }
  
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
  
  function getFunctionVariables(func)
  {
    var funcString = func.toString(),
        matchVariable = funcString.match(__matchThisVariable),
        matchProperties = funcString.match(__matchThisProperties),
        variable,
        rx,
        variableProperties = [];
    
    if(matchVariable)
    {
      variable = matchVariable[0].replace(__matchThisVariable, '$2');
      rx = new RegExp(__matchThisPropertiesVariable.replace('$variable', variable),'g');
      variableProperties = funcString.match(rx)
      .map(function(v){
        return v.replace(rx, '$2');
      });
    }
    
    if(matchProperties)
    {
      return matchProperties
      .map(function(v){
        return v.replace(__matchThisProperties, '$2');
      })
      .concat(variableProperties);
    }
    
    return [];
  }
  
  function getFunctionName(func)
  {
    return (func.name || func.toString().replace(__replaceFunctionName, '$2') || func.toString());
  }
  
  /* ENDREGION */
  
  /* HANDLING EVENT MESSAGING */
  /* REGION */
  
  /* alerts handle holding the newest value in the case of any new listens happen */
  var __alerts = {},
      
      /* holds all the listeners for all components */
      __eventbus = {};
  
  function listen(key, func)
  {
    if(!__eventbus[key]) __eventbus[key] = [];
    __eventbus[key].push(func);
    if(__alerts[key]) func(__alerts[key]);
    return Kaleoi;
  }
  
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
  
  function getStorage(type, key, obj)
  {
    var __data = (type !== 'model' ? window[type + 'Storage'].getItem(key) : __model.get(key))
    if(__data) copy(obj, (typeof __data === 'string' ? JSON.parse(__data) : __data));
    return obj;
  }
  
  function setStorage(type, key, obj)
  {
    window[type + 'Storage'].setItem(key, JSON.stringify(obj));
    return obj;
  }
  
  function storageHelper(key, filters, data)
  {
    var storageType = ((filters.model.length && 'model') || (filters.session.length && 'session') || (filters.local.length && 'local')),
        storageKey = (['local', 'session'].indexOf(storageType) !== -1 ? storageType + 'Storage' : storageType), 
        storeGet = (storageKey && (storageKey !== 'model' ? window[storageKey].getItem(filters[storageType][0]) : __model.get(key)));
    
    if(storageType)
    {
      if(storeGet !== undefined)
      {
        return data.set(key, (typeof storeGet === 'string' ? JSON.parse(storeGet) : storeGet));
      }
      if(storageType !== 'model')
      {
         return window[storageKey].setItem(filters[storageType], data.get(key));
      }
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
  
  function wrap_component(title, component)
  {
    function component_wrapper(expanded, innerHTML, params)
    {
      /* SET EXTRA FUNCTIONALITY DEFAULTS */
      Object.defineProperties(this, {
        sessionStorage: getDescriptor(false, true),
        localStorage: getDescriptor(false, true),
        store: getDescriptor(false, true),
        multiple: getDescriptor(false, true),
        filters: getDescriptor(copy({}, __config.filters)),
        
        /* COMPONENT INNER CHILD NODES */
        innerHTML: getDescriptor((innerHTML || ''), true),
        
        /* THE ACTUAL EXPANDED COMPONENT NODES */
        component: getDescriptor(expanded, true),
        
        /* This method runs after the componetn has fully rendered */
        onfinish: getDescriptor(function(){}, true),
        
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
        this.addEventListener('*update', (function(){
          setStorage('local', this.name, this);
        }).bind(this))
      }
      
      if(this.sessionStorage)
      {
        getStorage('session', this.name, this);
        this.addEventListener('*update', (function(){
          setStorage('session', this.name, this);
        }).bind(this))
      }
      
      if(this.store)
      {
        getStorage('model', this.name, this);
        this.addEventListener('*update', (function(){
          setStorage('model', this.name, this);
        }).bind(this))
      }
      
      if(params) handleParams(this, params);
      
      /* BIND SUB METHODS TO THIS */
      bindMethods(this, this);
      
      /* TODO: check which properties are being overwritten to make sure no standard props are included */
      /* OVERWRITE ALL ENUMERABLE PROPERTIES TO BE OBSERVABLE */
      return convertStaticsToObservables(this);
    }
    
    /* Inherit from frytki */
    component_wrapper.prototype = frytki();
    
    /* COPY PROTOTYPES FROM COMPONENT */
    component_wrapper.prototype = copy(component_wrapper.prototype, component.prototype);
    
    /* SET EXTRA PROTOTYPE FUNCTIONALITY */
    component_wrapper.prototype.name = title;
    component_wrapper.prototype.listen = listen;
    component_wrapper.prototype.unlisten = unlisten;
    component_wrapper.prototype.alert = alert;
    
    return component_wrapper;
  }
  
  function fetchComponentVM(title)
  {
    var __exists = (!!__components[title]);
    
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
  
  function fetchUnknownComponents(components)
  {
    var __promises = components.map(function(v){
          return fetchComponentVM(v);
        })
    
    return Promise.all(__promises);
  }
  
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
  
  function createComponents(node)
  {
    var __unknown = czosnek.getUnknown(node),
        __unfetched = checkIfComponentsFetched(__unknown),
        len = __unknown.length,
        x = 0;
    
    if(__unfetched.length)
    {
      fetchUnknownComponents(__unfetched)
      .then(function(){ for(x;x<len;x++) { mapComponent(__unknown[x]) } })
      .catch(function(e){
        console.error('Failed to fetch components: ', __unfetched, e);
      })
    }
    else if(__unknown.length)
    {
       for(x;x<len;x++)
       {
         mapComponent(__unknown[x]);
       }
    }
  }
  
  function createComponent(node)
  {
    var title = node.nodeName.toLowerCase();
    return new Promise(function(resolve, reject){
      if(!czosnek.isRegistered(title)) {
        fetchComponentVM(title)
        .then(function(){ return mapComponent(node) })
        .then(function(map){ resolve(map.component) })
        .catch(function(e){
          console.error('Failed to fetch component: ', title, e);
          reject();
        })
      }
      else
      {
        resolve(mapComponent(node).component);
      }
    })
  }
  
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
        __map = (new czosnek(__title)),
        __maps = __map.maps,
        __params = parseAttributes(component),
        __innerHTML = component.childNodes,
        __expanded = __map.component,
        __vm = (new __components[__title](__expanded, __innerHTML, __params)),
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
  
  /* Hey doofus, it seems the styles are being set with two semi colons and [Object object] */
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

          __val = JSON.stringify(__val, null, 2).replace(/[{}"]/g, '');
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
        if(!e.subchange) removeSubDataListeners(map, data, layer, dbkey);
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
        
        layer.stop()[dbkey] = e.value;
        
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
        if(!e.subchange) removeSubDataListeners(map, data, layer, dbkey);
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
        
        layer.stop()[dbkey] = e.value;
        
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
  function handleStyle(map, data)
  {
    
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
  
  
  /* TODO: replace with map type equivelants */
  function runThroughMaps(mapText, data)
  {
    var __map,
        __text = '',
        __value,
        __values,
        len = mapText.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      __map = mapText[x];
      
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else if(__map.value !== undefined)
      {
        if(__map.values.length)
        {
          __values = runThroughValueMaps(__map, data);
          if(typeof __map.value === 'function')
          {
            __value = parseAttrNameReturn(__map.value.call(data, __values), __values);
          }
          else
          {
            __value = parseAttrNameReturn(__map.value, __values);
          }
          __value = runThroughFilters(__value, __map.filters.filters, data.filters);
          __text += (__value[0] + ':' + __value[1] + ';');
        }
        else if(__map.isFullStyle)
        {
          __value = (typeof __map.value === 'function' ? __map.value() : __map.value);
          if(typeof __value !== 'object')
          {
            console.error(new Error('A full class stylesheet bind must return an object of styles'))
            __value = '';
          }
          else
          {
            __value = parseAttrNameReturn(runThroughFilters(__value, __map.filters.filters, data.filters));
            __text += (__map.isInlineStyle ? __value[1] : (__value[0] + ':' + __value[1] + ';'));
          }
        }
        else if(__map.isFullProp)
        {
          __value = (typeof __map.value === 'function' ? __map.value() : __map.value);
          if(typeof __value !== 'object')
          {
            console.error(new Error('A full property stylesheet bind must return an object of style name and value'))
            __value = '';
          }
          else
          {
            __value = parseAttrNameReturn(__value, '');
          }
          __value = runThroughFilters(__value, __map.filters.filters, data.filters);
          __text += (__map.isInlineStyle ? __value[1] : (__value[0] + ':' + __value[1]));
        }
        else
        {
          __value = (typeof __map.value === 'function' ? __map.value() : __map.value);
          __text += runThroughFilters(__value, __map.filters.filters, data.filters);
        }
        if(__map.type === 'insert')
        {
          mapText[x] = runThroughFilters(__value, __map.filters.filters, data.filters)
        }
      }
    }
    return __text;
  }
  
  function runThroughValueMaps(map, data)
  {
    var __values = map.values,
        __map,
        __text = '',
        __value,
        len = __values.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      __map = __values[x];
      
      if(typeof __map === 'string')
      {
        __text += __map;
      }
      else
      {
        if(!__map.value) __map.value = data.get(__map.key);
        __value = (typeof __map.value === 'function' ? __map.value() : __map.value);
        __text += runThroughFilters(__value, __map.filters.filters, data.filters);
        if(__map.type === 'insert') {
          __values[x] = __value;
          __map.maps.splice(__map.mapIndex, 1);
        }
      }
    }
    
    return __text;
  }
  
  function handleMaps__old(map, data)
  {
    /*see map types in locals */
    var mapType = __mapTypes.indexOf(map.type);
    
    /* overwrite data with stored data if was used */
    storageHelper(map.key, map.filters, data);
    
    map.value = data.get(map.key);
    
    if(!map.value) return (!!console.error('Component: ' + data.name, new Error('You are missing the viewmodel property of ' + map.key)));
    
    if(!map.stop)
    {
      /* set stop bind method, (stops updates to prevent stack overflow) */
      map.stop = ((map.local && map.local.stop) ? map.local : ({ stop: function(){
        map.node.stop();
        return map.local;
      }}));
    }
    
    switch(mapType)
    {
      case 0:
        map.local[map.localAttr] = loopStandardMaps(map.mapText, data);
        if(!map.isInsert)
        {
          data.addEventListener(map.key, ((typeof map.value === 'function') ? DataFunctionListener(map, data) : DataListener(map, data)));
          
          if(!map.isDirty)
          {
            map.node.addEventListener(map.property, ((typeof map.value === 'function') ? DomFunctionListener(map, data) : DomListener(map, data)))
          }
        }
        return;
      case 1:
        if(typeof map.value !== 'function') return (!!console.error('Component: ' + data.name, new Error(map.key + ' is attempting to bind to an event but is not a function')))
        if(map.isInsert)
        {
          map.node[map.property] = map.value;
        }
        else
        {
          map.node[map.property] = map.value;
          data.addEventListener(map.key, DataEventListener(map, data));
          map.node.addEventListener(map.property, DomEventListener(map, data));
        }
        return;
      case 2:
        return stylesheet(map, data);
      case 3:
        return style(map, data);
    }
  }
  
  /* MAP TYPES */
  function insert(map, data)
  {
    var __key = map.key,
        __filters = map.filters,
        __item;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    if(!map.value) return (!!console.error('Component: ' + data.name, new Error('You are missing the binding property of ' + __key)));
    
    if(map.property === 'style')
    {
      if(map.isFullStyle)
      {
        var __val = (typeof map.value === 'function' ? map.value() : map.value),
            __keys = Object.keys((__val || {})),
            len = __keys.length,
            x = 0;
        
        for(x;x<len;x++)
        {
          map.local[__keys[x]] = runThroughFilters(__val[__keys[x]], map.filters.filters, data.filters);
        }
      }
      else if(map.isFullProp)
      {
        
      }
      else if(map.values.length)
      {
        __val = runThroughValueMaps(map, data),
        __item = parseAttrNameReturn(typeof map.value === 'function' ? map.value(__val) : map.value, __val);
        /* VALUE AND TEXT INSERT */
        map.local[__item[0]] = __item[1];
      }
      else
      {
        /* VALUE AND TEXT INSERT */
        map.local[map.localKey] = (typeof map.value === 'function' ? map.value() : map.value);
      }
    }
    else
    {
      map.local[map.localAttr] = runThroughMaps(map.mapText, data);
    }
  }
  
  function stylesheet(map, data)
  {
    var __key = map.key,
        __filters = map.filters;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    if(!map.value) return (!!console.error('Component: ' + data.name, new Error('You are missing the binding property of ' + __key)));
    /* VALUE AND TEXT INSERT */
    map.local[map.localAttr] = runThroughMaps(map.mapText, data);
    if(typeof map.value === 'function')
    {
      bindFunction(map, data);
    }
    else
    {
      bindData(map, data);
    }
    if(map.values.length) bindValuesData(__key, map, data);
  }
  
  function style(map, data)
  {
    var __key = map.key,
        __filters = map.filters,
        __keys = [],
        __val,
        __item,
        len,
        x = 0;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    if(!map.value) return (!!console.error('Component: ' + data.name, new Error('You are missing the binding property of ' + __key)));
    if(map.isFullStyle)
    {
      __val = (typeof map.value === 'function' ? map.value() : map.value)
      __keys = Object.keys((__val || {}));
      len = __keys.length;
      for(x;x<len;x++)
      {
        __item = __val[__keys[x]];
        map.local[__keys[x]] = runThroughFilters(__item, map.filters.filters, data.filters);
        if(typeof map.value === 'function')
        {
          bindFunction(map, data, __keys[x]);
          bindDomFunction(map, data, __keys[x]);
        }
        else
        {
          bindData(map, data, __keys[x]);
          bindDom(map, data, __keys[x])
        }
      }
    }
    else if(map.values.length || map.isFullProp)
    {
      __val = (map.isFullProp ? '' : runThroughValueMaps(map, data));
      __item = parseAttrNameReturn(typeof map.value === 'function' ? map.value(__val) : map.value, __val);
      
      /* VALUE AND TEXT INSERT */
      map.local[__item[0]] = __item[1];
      
      bindProperty(map, data);
    }
    else
    {
      /* VALUE AND TEXT INSERT */
      map.local[map.localKey] = (typeof map.value === 'function' ? map.value() : map.value);
      if(typeof map.value === 'function')
      {
        bindFunction(map, data, map.localKey);
        bindDomFunction(map, data, map.localKey);
      }
      else
      {
        bindData(map, data, map.localKey);
        bindDom(map, data, map.localKey)
      }
    }
  }
  
  /* ENDREGION */
  
  /* BIND HELPERS */
  /* REGION */
  
  /* adds all sub required listeners for style/attr property names */
  function addObjectPropertyListeners(map, data)
  {
    var __layer,
        __key,
        __value = data.get(map.key),
        __isFunction,
        __isDataObject = (__value && typeof __value === 'object'),
        maps = map.mapValues,
        item,
        prop = map.valueProp,
        len = maps.length,
        x = 0;
    for(x;x<len;x++)
    {
      item = maps[x];
      __layer = data.getLayer(item.key);
      __key = getKey(item.key);
      __value = __layer[__key];
      __isFunction = (typeof __value === 'function');
      
      /* set item.datalistener */
      item.datalistener = (__isFunction ? DataFunctionListener(map, data, __value) : DataListener(map, data, __value));
      __layer.addEventListener(__key + (__isFunction ? '' : 'update'), item.datalistener);
      if(!item.isDirty)
      {
        /* set item.domlistener */
        map.domlistener = DomListener(map, data);
        map.node.addEventListener(prop + (__isFunction ? '' : 'update'), map.domlistener);
      }
    }
    if(!maps || !maps.length)
    {
      /* set item.domlistener */
      map.domlistener = DomListener(map, data);
      map.node.addEventListener(prop + 'update', map.domlistener);
    }
    if(__isDataObject)
    {
      /* set map.secondlistener */
      map.secondlistener = DataPropertyValueListener(map);
      data.get(map.key).addEventListener('*update', map.secondlistener);
    }
  }
  
  /* removes all sub required listeners for style/attr property names */
  function removeObjectPropertyListeners(map, data)
  {
    var maps = map.mapValues,
        item,
        prop = map.valueprop,
        len = maps.length,
        x = 0;
    for(x;x<len;x++)
    {
      item = maps[x];
      data.removeEventListener(item.key, item.datalistener);
      if(!item.isDirty) map.node.removeEventListener(prop, item.domlistener);
      item.datalistener = undefined;
      item.domlistener = undefined;
    }
    if(map.domlistener)
    {
      map.node.removeEventListener(prop, map.domlistener);
      map.domlistener = undefined;
    }
    if(map.secondlistener)
    {
      data.get(map.key).removeEventListener('*update', map.secondlistener);
      map.secondlistener = undefined;
    }
  }
  
  /* ENDREGION */
  
  /* DATA LISTENERS (FOR UPDATING THE DOM) */
  /* REGION */
  
  /* this is meant for simple data binds */
  function DataListener(map, data, key)
  {
    return function(e)
    {
      if(typeof e.value === 'function')
      {
        data.removeEventListener(map.key + 'update', map.datalistener);
        if(!map.isDirty) map.node.removeEventListener((key || map.localAttr) + 'update', map.domlistener);
        map.value = (e.value).bind(data);

        /* Set new listeners */
        map.datalistener = DataFunctionListener(map, data, key);
        data.addEventListener(map.key, map.datalistener);
        addInnerFunctionListeners(map, data, map.value);
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
        if(!map.isDirty)
        {
          map.domlistener = DomFunctionListener(map, data, key);
          map.node.addEventListener((key || map.localAttr), map.domlistener);
        }
      }
      else
      {
        map.value = e.value;
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
    }
  }
  
  /* This is meant for simple compute function binds */
  function DataFunctionListener(map, data, key)
  {
    return function(e)
    {
      if(typeof e.value !== 'function')
      {
        removeInnerFunctionListeners(map, data, map.value);
        data.removeEventListener(map.key, map.datalistener);
        if(!map.isDirty) map.node.removeEventListener((key || map.localAttr), map.domlistener);
        
        /* Set new listeners */
        map.datalistener = DataListener(map, data, key);
        data.addEventListener(map.key + 'update', map.datalistener);
        if(!map.isDirty)
        {
          map.domlistener = DomListener(map, data, key);
          map.node.addEventListener((key || map.localAttr) + 'update', map.domlistener);
        }
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
      else
      {
        removeInnerFunctionListeners(map, data, map.value);
        map.value = (e.value).bind(data);
        addInnerFunctionListeners(map, data, map.value);
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
    }
  }
  
  function DataEventListener(map, data)
  {
    return function(e)
    {
      map.value = e.value.bind(data);
      map.stop()[map.localAttr] = map.value;
    }
  }
  
  /* This is meant for attr/style property name binds and their values */
  function DataPropertyListener(map, data)
  {
    var __mapValue = map.value,
        __val,
        __value,
        __obj;
    
    if(!map.stop)
    {
      /* set stop bind method, (stops updates to prevent stack overflow) */
      map.stop = ((map.local && map.local.stop) ? map.local : ({ stop: function(){
        map.node.stop();
        return map.local;
      }}));
    }
    
    /* initial value set */
    if(typeof __mapValue === 'function')
    {
      __val = runThroughValueMaps(map, data);
      __value = __mapValue(__val);
    }
    else
    {
      __value = (typeof __mapValue !== 'object' ? [__mapValue, ''] : __mapValue);
    }
    
    /* throw error if the value is not an object */
    ERROR_PROPERTYBIND(data, __value, __mapValue);
    
    __obj = parseAttrNameReturn(__value, __val);
    map.valueprop = __obj[0];
    addObjectPropertyListeners(map, data);
    setDomByPropValueArray(map, data, __obj);
    
    return function(e)
    {
      if(e.key !== getKey(map.key))
      {
        /* This is a object sub property, value was already mutated on map */
        return setDomByPropValueArray(map, data, parseAttrNameReturn(map.value));
      }
      
      /* if the value is undefined we delete the style or attribute */
      if(e.value)
      {
        if(typeof e.value === 'object')
        {
          map.value = e.value;
          __obj = parseAttrNameReturn(map.value);
          map.valueprop = __obj[0];
          
          return setDomByPropValueArray(map, data, __obj);
        }
        else if(typeof e.value === 'function')
        {
          /* Remove previous object based listeners */
          removeObjectPropertyListeners(map, data);
          
          map.value = (e.value).bind(data);
          
          /* get any associated values to pass into the function */
          __val = runThroughValueMaps(map, data);
          __value = map.value(__val);
          
          /* throw error if the value is not an object */
          ERROR_PROPERTYBIND(data, __value, map.value);
          
          __obj = parseAttrNameReturn(__value, __val);
          map.valueprop = __obj[0];
          
          addObjectPropertyListeners(map, data);
          
          return setDomByPropValueArray(map, data, __obj);
        }
        else
        {
          /* Remove previous object based listeners */
          removeObjectPropertyListeners(map, data);
          
          map.value = [e.value, ''];
          map.valueprop = e.value;
          
          /* re add property listeners */
          addObjectPropertyListeners(map, data);
          /* update as an empty string */
          return setDomByPropValueArray(map, data, map.value);
        }
      }
      else
      {
        /* Remove previous object based listeners */
        removeObjectPropertyListeners(map, data);
        
        return setDomByPropValueArray(map, data, undefined);
      }
    }
  }
  
  /* This is meant for listening to changes on a attr/style property name binds data sub object properties eg: {prop:value} or [prop, value] */
  function DataPropertyValueListener(map)
  {
    return function(e)
    {
      e.value = map.value;
      return map.datalistener.call(this, e);
    }
  }
  
  /* This is meant for object binds such as full style objects */
  function DataObjectListener(map, data, value)
  {
    return function(e)
    {
      
    }
  }
  
  /* this is meant for a simple non dirty dom data bind */
  function DomListener(map, data, key, layer, dbkey)
  {
    var __layer = (layer || data.findLayer(map.key)),
        __key = (dbkey || getKey(map.key));
    
    return function(e)
    {
      if(typeof e.value === 'function')
      {
        data.removeEventListener(map.key + 'update', map.datalistener);
        map.node.removeEventListener((key || map.localAttr) + 'update', map.domlistener);
        map.value = (e.value).bind(data);
        __layer.stop()[__key] = map.value;
        
        /* Set new listeners */
        map.datalistener = DataFunctionListener(map, data, key);
        data.addEventListener(map.key, map.datalistener);
        addInnerFunctionListeners(map, data, map.value);
        
        /* overwrite function */
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
        map.domlistener = DomFunctionListener(map, data, key, __layer, __key);
        map.node.addEventListener((key || map.localAttr), map.domlistener);
      }
      else
      {
        map.value = e.value;
        __layer.stop()[__key] = e.value;
      }
    }
  }
  
  /* this is meant for a simple non dirty dom compute function bind */
  function DomFunctionListener(map, data, key, layer, dbkey)
  {
    var __layer = (layer || data.findLayer(map.key)),
        __key = (dbkey || getKey(map.key));
    
    return function(e)
    {
      if(typeof e.value !== 'function')
      {
        removeInnerFunctionListeners(map, data, map.value);
        data.removeEventListener(map.key, map.datalistener);
        map.node.removeEventListener((key || map.localAttr), map.domlistener);
        
        map.value = e.value;
        __layer.stop()[__key] = map.value;
        
        map.datalistener = DataListener(map, data, key);
        data.addEventListener(map.key + 'update', map.datalistener);
        
        map.domlistener = DomListener(map, data, key, __layer, __key);
        map.node.addEventListener((key || map.localAttr), map.domlistener);
      }
      else
      {
        removeInnerFunctionListeners(map, data, map.value);
        map.value = (e.value).bind(data);
        __layer.stop()[__key] = map.value;
        addInnerFunctionListeners(map, data, map.value);
        
        map.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
    }
  }
  
  function DomEventListener(map, data, layer, dbkey)
  {
    var __layer = (layer || data.findLayer(map.key)),
        __key = (dbkey || getKey(map.key));
    
    return function(e)
    {
      map.value = runThroughFilters(e.value, map.filters.vm, data.filters).bind(data);
      __layer.stop()[__key] = map.value;
    }
  }
  
  /* ENDREGION */
  
  /* HELPERS FOR SETTING THE DOM */
  /* REGION */
  
  /* meant for property and value pair */
  function setDomByPropValueArray(map, data, value)
  {
    if(!value)
    {
      if(map.isInlineStyle)
      {
        map.stop()[map.valueprop] = '';
      }
      else
      {
        map.stop().removeAttribute(map.valueprop);
      }
    }
    else
    {
      if(map.isInlineStyle)
      {
        map.stop()[value[0]] = value[1];
      }
      else
      {
        map.stop().setAttribute(value[0], value[1]);
      }
    }
  }
  
  function setDomByObject(map, data, value)
  {
    
  }
  
  /* ENDREGION */
  
  /* HANDLING BINDS */
  /* REGION */
  
  /* ATTR/STYLE PROPERTY NAME BINDINGS */
  /* REGION */
  
  function addInnerPropertyValueListeners(map, data, property)
  {
    var isEvent = (__EventList__.indexOf(property) !== -1),
        __values = map.values,
        __item,
        __key,
        __filters,
        __hasMap = false,
        len = __values.length,
        x = 0;
    
    if(!len)
    {
      map.subvaluetextlistener = function(e)
      {
        if(typeof map.value !== 'function')
        {
          if(map.value.length)
          {
            map.value.stop()[1] = e.value;
          }
          else
          {
            var keys = Object.keys(map.value);
            map.value.stop()[keys[0]] = e.value;
          }
        }
        else
        {
          if(map.values.length) map.values[map.values.indexOf(e.oldValue)] = e.value;
        }
        e.value = map.value;
        return map.datalistener.call(data, e);
      }
      map.node.addEventListener(property, map.subvaluetextlistener);
    }
    else
    {
      for(x;x<len;x++)
      {
        __item = __values[x];
        if(typeof __item === 'object')
        {
          __hasMap = true;
          __item.localAttr = property;
          __item.isEvent = isEvent;
          __key = __item.key;
          __filters = __item.filters;

          /* overwrite data with stored data if was used */
          storageHelper(__key, __filters, data);

          __item.value = data.get(__key);

          /* VALUE AND TEXT INSERT */
          __item.local[__item.localAttr] = runThroughMaps(__item.mapText, data);
          if(typeof __item.value === 'function' && !__item.isEvent)
          {
            bindFunction(__item, data);
            if(!__item.isDirty) bindDomFunction(__item, data, property);
          }
          else
          {
            bindData(__item, data);
            if(!__item.isDirty) bindDom(__item, data, property);
          }
        }
      }
      if(!__hasMap)
      {
        map.subvaluetextlistener = function(e)
        {
          if(typeof map.value !== 'function')
          {
            if(map.value.length)
            {
              map.value.stop()[1] = e.value;
            }
            else
            {
              var keys = Object.keys(map.value);
              map.value.stop()[keys[0]] = e.value;
            }
          }
          else
          {
            if(map.values.length) map.values[map.values.indexOf(e.oldValue)] = e.value;
          }
          e.value = map.value;
          return map.datalistener.call(data, e);
        }
        map.node.addEventListener(property, map.subvaluetextlistener);
      }
    }
  }
  
  function removeInnerPropertyValueListeners(map, data, property)
  {
    var __values = map.values,
        __item,
        len = __values.length,
        x = 0;
    for(x;x<len;x++)
    {
      __item = __values[x];
      if(typeof __item === 'object')
      {
        if(typeof __item.value === 'function' && !__item.isEvent)
        {
          removeBindFunction(__item, data);
          if(!__item.isDirty) removeBindDomFunction(__item, data, __item.localAttr);
        }
        else
        {
          removeBindData(__item, data);
          if(!__item.isDirty) removeBindDom(__item, data, __item.localAttr);
        }
      }
    }
    
    if(map.subvaluetextlistener)
    {
      map.node.removeEventListener(property, map.subvaluetextlistener);
    }
  }
  
  function bindProperty(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key),
        __value = (__layer && __layer[__key]),
        __local = ((map.local && map.local.stop) ? map.local : ({ stop: function(){
          map.node.stop();
          return map.local;
        }})),
        __val = runThroughValueMaps(map, data),
        __isFunc = (typeof __value === 'function'),
        __item = parseAttrNameReturn(__isFunc ? map.value(__val) : map.value, __val);
    
    function listener(e)
    {
      removeBindProperty(map, data);
      map.value = e.value;
      __val = runThroughValueMaps(map, data);
      __item = parseAttrNameReturn((typeof map.value === 'function') ? map.value(__val) : map.value, __val);
      if(map.isInlineStyle)
      {
        __local.stop()[__item[0]] = __item[1];
      }
      else
      {
        map.node.stop().setAttribute(__item[0], __item[1]);
      }
      bindProperty(map, data);
    }
    
    function sublistener(e)
    {
      e.value = map.value;
      return map.datalistener.call(this, e);
    }
    
    if(__isFunc)
    {
      map.funclistener = listener
      map.datalistener = listener
      __layer.addEventListener(__key,map.funclistener);
      addInnerFunctionListeners(map, data, map.value);
    }
    else
    {
      map.datalistener = listener
      __layer.addEventListener(__key+'update',map.datalistener);
      if(typeof __layer[__key] === 'object')
      {
        map.sublistener = sublistener;
        __layer[__key].addEventListener('*update', map.sublistener);
      }
    }
    addInnerPropertyValueListeners(map, data, __item[0]);
  }
  
  function removeBindProperty(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key),
        __value = (__layer && __layer[__key]),
        __val = runThroughValueMaps(map, data),
        __isFunc = (typeof __value === 'function'),
        __item = parseAttrNameReturn(__isFunc ? map.value(__val) : map.value, __val);
    
    removeInnerPropertyValueListeners(map, data, __item[0]);
    if(__isFunc)
    {
      removeInnerFunctionListeners(map, data, map.value);
      __layer.removeEventListener(__key, map.funclistener);
    }
    else
    {
      __layer.removeEventListener(__key+'update', map.datalistener);
      if(typeof __layer[__key] === 'object') __layer[__key].removeEventListener('*update', map.sublistener);
    }
    
    if(map.isInlineStyle)
    {
      map.local[__item[0]] = '';
    }
    else
    {
      map.node.removeAttribute(__item[0]);
    }
  }
  
  /* ENDREGION */
  
  /* FUNCTION BINDS */
  /* REGION */
  
  function bindFunction(map, data, key)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key),
        __value = (__layer && __layer[__key]),
        __local = ((map.local && map.local.stop) ? map.local : ({ stop: function(){
          map.node.stop();
          return map.local;
        } }));
    
    map.funclistener = function(e)
    {
      /* if the value changes to a standard, then this bind is no longer computed */
      if(typeof e.value !== 'function')
      {
        /* remove binds */
        if(!map.isDirty) removeBindDomFunction(map, data, key);
        removeBindFunction(map, data);
        
        map.value = e.value;
        
        /* change to non computed */
        bindData(map, data, key);
        if(!map.isDirty) bindDom(map, data, key);
        
        /* refresh values */
        __local.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
      else
      {
        removeInnerFunctionListeners(map, data, map.value);
        addInnerFunctionListeners(map, data, e.value);
        map.value = e.value.bind(data);
        __local.stop()[(map.localAttr || key)] = runThroughMaps(map.mapText, data);
      }
    }
    
    map.datalistener = function()
    {
      __local.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
    }
    
    __layer.addEventListener(__key,map.funclistener);
    addInnerFunctionListeners(map, data, map.value);
  }
  
  function removeBindFunction(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    __layer.removeEventListener(__key,map.funclistener);
    removeInnerFunctionListeners(map, data, map.value);
  }
  
  function bindDomFunction(map, data, key)
  {
    map.domlistener = function(e)
    {
      /* if the value changes to a standard, then this bind is no longer computed */
      if(typeof e.value !== 'function')
      {
        /* remove binds */
        removeBindDomFunction(map, data, key);
        removeBindFunction(map, data);
        
        data.stop().set(map.key, runThroughFilters(e.value, map.filters.vmFilters, data.filters));
        map.value = data.get(map.key);
        
        /* change to non computed */
        bindData(map, data, key);
        bindDom(map, data, key);
      }
      else
      {
        e.preventDefault();
        removeInnerFunctionListeners(map, data, map.value);
        addInnerFunctionListeners(map, data, e.value);
        map.value = e.value.bind(data);
        data.stop().set(map.key, runThroughFilters(e.value, map.filters.vmFilters, data.filters));
      }
    }
    
    map.node.addEventListener((key || map.listener), map.domlistener);
  }
  
  function removeBindDomFunction(map, data, key)
  {
    map.node.removeEventListener((key || map.listener), map.domlistener);
  }
  
  /* ENDREGION */
  
  /* STANDARD PROPERTY BINDS */
  /* REGION */
  
  function bindData(map, data, key)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key),
        __local = ((map.local && map.local.stop) ? map.local : ({ stop: function(){ 
          map.node.stop();
          return map.local;
        } }));
    
    map.datalistener = function(e)
    {
      /* If value was set as a function then we need to change this to a computed bind */
      if(typeof e.value === 'function' && !map.isEvent)
      {
        if(!map.isDirty) removeBindDom(map, data, key);
        removeBindData(map, data, key);
        
        map.value = e.value.bind(data);
        
        /* change to computed */
        bindFunction(map, data, key);
        bindDomFunction(map, data, key);
        
        __local.stop()[(key || map.localAttr)] = runThroughMaps(map.mapText, data);
      }
      else
      {
        map.value = e.value;
        __local.stop()[(key || map.localAttr)] = (map.type === 'event' ? map.value : runThroughMaps(map.mapText, data));
      }
    }
    
    __layer.addEventListener(__key + "update",map.datalistener);
    if(__layer[__key] && typeof __layer[__key] === 'object')
    {
      map.sublistener = function(e)
      {
        e.value = map.value;
        return map.datalistener.call(this, e);
      }
      
      __layer[__key].addEventListener('*update', map.sublistener);
    }
  }
  
  function removeBindData(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    __layer.removeEventListener(__key + "update",map.datalistener);
  }
  
  function bindDom(map, data, key)
  {
    var __local = ((map.local && map.local.stop) ? map.local : { stop: function(){ return map.local } });
    
    map.domlistener = function(e)
    {
      /* If value was set as a function then we need to change this to a computed bind */
      if(typeof e.value === 'function' && !map.isEvent)
      {
        /* remove old binds */
        e.preventDefault();
        removeBindDom(map, data, key);
        removeBindData(map, data, key);
        data.stop().set(map.key, runThroughFilters(map.value, map.filters.vmFilters, data.filters));
        map.value = data.get(map.key).bind(data);
        
        /* change to computed */
        bindFunction(map, data, key);
        bindDomFunction(map, data, key);
        
        /* refresh values */
        __local.stop()[(map.localAttr || key)] = runThroughMaps(map.mapText, data);
      }
      else
      {
        map.value = e.value;
        data.stop().set(map.key, runThroughFilters(e.value, map.filters.vmFilters, data.filters));
      }
    }
    
    map.node.addEventListener((key || map.listener), map.domlistener);
  }
  
  function removeBindDom(map, data, key)
  {
    map.node.removeEventListener((key || map.listener), map.domlistener);
  }
  
  /* ENDREGION */
  
  /* TODO: convert properties on object to '-' format */
  function bindValuesData(key, map, data)
  {
    var localmap,
        len = map.values.length,
        x = 0;
    
    for(x;x<len;x++)
    {
      localmap = map.values[x];
      if(typeof localmap !== 'string')
      {
        localmap.value = data.get(localmap.key);
        if(typeof localmap.value === 'function')
        {
          bindFunction(localmap, data);
        }
        else
        {
          bindData(localmap, data);
        }
      }
    }
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