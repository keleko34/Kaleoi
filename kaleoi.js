window.__KaleoiExtensions__ = {
  config: {},
  components: {}
}

window.kaleoi = (function(){
  
  var __config = __KaleoiExtensions__.config,
      __components = __KaleoiExtensions__.components,
      __model = __KaleoiExtensions__.model,
      __slice = Array.prototype.slice;
  
  /* REGEX */
  /* REGION */
  
  var __matchThisVariable = /(var[\s+]?(.*?)[\s+]?=[\s+]?this([;]?))/g,
      __matchThisProperties = /(this\.(.*?)([\s;=]))/g,
      __matchThisPropertiesVariable = '($variable\.(.*?)([\s;=]))'
  
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
  
  function createStyle(title, style)
  {
    var st = document.createElement('style');
    st.title = title;
    st.type = 'text/css';
    st.textContent = style;
    document.head.appendChild(st);
    return st;
  }
  
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
  
  function parseAttrNameReturn(val, values, oldValue)
  {
    if(typeof val === 'string') return [val, values, oldValue];
    if(val.length)
    {
      if(val.length === 1) return val.slice().concat([values, oldValue]);
      if(val.length === 2) return val.slice().concat(oldValue);
      return val.slice();
    }
    if(typeof val === 'object')
    {
      var keys = Object.keys(val);
      return [keys[0], (val[keys[0]] || values), oldValue];
    }
    return [];
  }
  
  function getFunctionVariables(func)
  {
    var funcString = func.toString(),
        matchVariable = funcString.match(__matchThisVariable),
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
    
    return funcString.match(__matchThisProperties)
    .map(function(v){
      return v.replace(__matchThisProperties, '$2');
    })
    .concat(variableProperties);
  }
  
  function stringifyStylesheetObject(obj)
  {
    var keys = Object.keys(obj),
        text = '',
        len = keys.length,
        x = 0;
    for(x;x<len;x++)
    {
      text += keys[x] + ':' + obj[keys[x]] + ';'
    }
    return text;
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
    
    /* TODO: Possibly add root to each element in the component */
    
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
          __value = (typeof __map.value === 'function' ? __map.value.call(data, __map.funcValue) : __map.value);
          if(typeof __value !== 'object')
          {
            console.error(new Error('A full class stylesheet bind must return an object of styles'))
            __value = '';
          }
          else
          {
            __value = runThroughFilters(__value, __map.filters.filters, data.filters);
            __text += stringifyStylesheetObject(__value);
          }
        }
        else if(__map.isFullProp)
        {
          __value = (typeof __map.value === 'function' ? __map.value.call(data, __map.funcValue) : __map.value);
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
          __text += (__value[0] + ':' + __value[1]);
        }
        else
        {
          __value = (typeof __map.value === 'function' ? __map.value.call(data, __map.funcValue) : __map.value);
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
        __value = (typeof __map.value === 'function' ? __map.value.call(data, __map.funcValue) : __map.value);
        __text += runThroughFilters(__value, __map.filters.filters, data.filters);
        if(__map.type === 'insert') {
          __values[x] = __value;
          __map.maps.splice(__map.mapIndex, 1);
        }
      }
    }
    
    return __text;
  }
  
  /* TODO: extend function type values to listen to inside properties */
  function handleMaps(map, data)
  {
    switch(map.type)
    {
      case 'insert':
        return insert(map, data);
      case 'standard':
        return standard(map, data);
      case 'event':
        return event(map, data);
      case 'stylesheet':
        return stylesheet(map, data);
      case 'style':
        return style(map, data);
    }
  }
  
  /* MAP TYPES */
  function insert(map, data)
  {
    var __key = map.key,
        __filters = map.filters;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    map.local[map.localAttr] = runThroughMaps(map.mapText, data);
  }
  
  function standard(map, data)
  {
    var __key = map.key,
        __filters = map.filters;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    /* VALUE AND TEXT INSERT */
    map.local[map.localAttr] = runThroughMaps(map.mapText, data);
    
    if(!map.isDirty) bindDom(__key, map, data);
    if(typeof map.value === 'function' && !map.isEvent) bindFunction(map, data);
    bindData(__key, map, data);
  }
  
  function event(map, data)
  {
    var __key = map.key;
    
    map.local.removeAttribute(map.localAttr);
    
    map.value = data.get(__key);
    
    /* VALUE AND TEXT INSERT */
    map.local[map.localAttr] = map.value;
    
    bindDom(__key, map, data);
    bindData(__key, map, data);
  }
  
  function stylesheet(map, data)
  {
    var __key = map.key,
        __filters = map.filters;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    
    /* VALUE AND TEXT INSERT */
    map.local[map.localAttr] = runThroughMaps(map.mapText, data);
    if(typeof map.value === 'function')
    {
      bindFunction(map, data);
    }
    else
    {
      bindData(__key, map, data);
    }
    if(map.values.length) bindStylesheetData(__key, map, data);
  }
  
  function style(map, data)
  {
    var __key = map.key,
        __filters = map.filters,
        __keys = [],
        __item,
        len,
        x = 0;
    
    /* overwrite data with stored data if was used */
    storageHelper(__key, __filters, data);
    
    map.value = data.get(__key);
    __keys = Object.keys(map.value);
    len = __keys.length;
    
    /* VALUE AND TEXT INSERT */
    for(x;x<len;x++)
    {
      __item = map.value[__keys[x]];
      map.local[map.localAttr][__keys[x]] = runThroughStyleMap(__keys[x], __item);
      if(typeof __item === 'function') bindStyleFunction(map, __keys[x], __item);
      bindStyleData(map, __keys[x], __item);
      bindStyleDom(map, __keys[x], __item);
    }
  }
  
  /* ENDREGION */
  
  /* HANDLING BINDS */
  /* REGION */
  
  function getKey(key)
  {
    return (key.split('.').pop());
  }
  
  /* TODO: fix to watch inner function props */
  function bindFunction(map, data)
  {
    var __layer = data.findLayer(map.key),
        __key = getKey(map.key);
    
    map.funclistener = function(e)
    {
      if(typeof e.value !== 'function')
      {
        e.preventDefault();
        map.funcValue = e.value;
        (map.local.stop ? map.local.stop() : map.local)[map.localAttr] = runThroughMaps(map.mapText, data);
      }
    }
    
    /* TODO: fix to watch inner function props */
    map.datalistener = function(e)
    {
      (map.local.stop ? map.local.stop() : map.local)[map.localAttr] = runThroughMaps(map.mapText, data);
    }
    
    if(!__layer || !__layer[__key]) return (!!console.error('Component: ' + data.name, new Error('You are missing the binding property of ' + __key)));
    
    __layer.addEventListener(__key,map.funclistener);
  }
  
  function bindData(key, map, data)
  {
    map.datalistener = function(e)
    {
      map.value = e.value;
      (map.local.stop ? map.local.stop() : map.local)[map.localAttr] = (map.type === 'event' ? map.value : runThroughMaps(map.mapText, data));
    }
    
    var __layer = data.findLayer(key),
        __key = getKey(key);
    
    if(!__layer || !__layer[__key]) return (!!console.error('Component: ' + data.name, new Error('You are missing the binding property of ' + __key)));
    
    __layer.addEventListener(__key + "update",map.datalistener);
  }
  
  /* TODO: fix to watch inner function props */
  function bindStylesheetData(key, map, data)
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
          bindData(localmap.key, localmap, data);
        }
      }
    }
  }
  
  function removeBindData(key, map, data)
  {
    data.findLayer(key).removeEventListener(getKey(key) + "update", map.datalistener);
  }
  
  function bindDom(key, map, data)
  {
    map.domListener = function(e)
    {
      if(typeof map.value === 'function' && !map.isEvent && typeof e.value !== 'function')
      {
        map.funcValue = e.value;
        (map.local.stop ? map.local.stop() : map.local)[map.localAttr] = runThroughMaps(map.mapText, data);
      }
      else
      {
        map.value = e.value;
        data.stop().set(key, runThroughFilters(e.value, map.filters.vmFilters, data.filters));
      }
    }
    
    map.node.addEventListener(map.listener + "update", map.domListener);
  }
  
  function removeBindDom(key, map)
  {
    map.node.removeEventListener(map.listener + "update", map.domListener);
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