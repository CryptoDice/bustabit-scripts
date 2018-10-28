// bit-exo.com V3.2.0
// Copyright 2016-2018 bit-exo.com

///////////////////////
// All trademarks,trade names,images,contents,snippets,codes,including text
// and graphics appearing on the site are intellectual property of their
// respective owners, including in some instances,"bit-exo.com".
// All rights reserved.
//contact: admin@bit-exo.com
// Below is the list of owners/sites where elements of this site were based on.

// http://untitled-dice.github.io/,
// https://classic.plinkopot.com
// https://sat.oshi.xyz
/////////////////////////////
"use strict";


var config = {
  app_name: 'Bit-Exo',
  recaptcha_sitekey: '6LefHRcTAAAAAGwCE3EB_5A_L3Ay3wVZUCISid-D', //Bit-Exo
  mp_browser_uri: 'https://www.moneypot.com',
  mp_api_uri: 'https://api.moneypot.com',
  chat_uri: '//socket.moneypot.com',

 app_id: 926, //Bit-Exo
 redirect_uri: 'https://bit-exo.com/',
 be_api_uri: 'https://bit-exo.com/',
 be_uri: '//bit-exo.com',
 api_uri: 'https://bit-exo.com/api',
 
 // app_id: 588, //Rockcino
 // redirect_uri: 'https://127.0.0.1:3131/', //Rockcino
 // be_api_uri: 'https://127.0.0.1:3131/', //Rockcino
 // be_uri: '//127.0.0.1:3131', //Rockcino
 // api_uri: 'https://127.0.0.1:3131/api',

  force_https_redirect: true,
  house_edge: 0.01,
  chat_buffer_size: 99,
  // - The amount of bets to show on screen in each tab
  bet_buffer_size: 50,
  debug: false
};

var socket;

if (config.force_https_redirect && window.location.protocol !== "https:") {
  window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
}

// Generates UUID for uniquely tagging components
var genUuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};
//////////////////////////////////
///helper functions
var helpers = {};
// For displaying HH:MM timestamp in chat
//
// String (Date JSON) -> String
helpers.formatDateToTime = function(dateJson) {
  var date = new Date(dateJson);
  return _.padLeft(date.getHours().toString(), 2, '0') +
    ':' +
    _.padLeft(date.getMinutes().toString(), 2, '0')+
      ':' +
      _.padLeft(date.getSeconds().toString(), 2, '0');
};

// Number -> Number in range (0, 1)
helpers.multiplierToWinProb = function(multiplier) {
  console.assert(typeof multiplier === 'number');
  console.assert(multiplier > 0);

  // For example, n is 0.99 when house edge is 1%
  var n = 1.0 - betStore.state.house_edge;//config.house_edge;

  return n / multiplier;
};

helpers.WinProbtoMultiplier = function(winProb) {
  console.assert(typeof winProb === 'number');
  console.assert(winProb > 0);

  // For example, n is 0.99 when house edge is 1%
  var n = 1.0 - betStore.state.house_edge;//config.house_edge;

  return n / winProb;
};

helpers.calcNumber = function(cond, winProb) {
  console.assert(cond === '<' || cond === '>');
  console.assert(typeof winProb === 'number');
  //((winProb * - 100)*-1).toFixed(4).toString() + '>n>' + (((winProb * -100) + 100 )-betStore.state.house_edge).toFixed(4).toString()
  if (cond === '<') {
    return winProb * 100;
  } else {
    return 99.9999 - (winProb * 100);
  }
};

helpers.convNumtoStr = function(num) {
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num / 100).toFixed(2).toString();
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num * 0.00000001).toFixed(8).toString();
    case 'DOGE':
    case 'BXO':
    case 'CLAM':
        return (num * 1).toFixed(8).toString();
    default:
        return (num / 100).toFixed(2);
  }
};

helpers.convNumtoStrBets = function(num) {
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num / 100).toFixed(2).toString();
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num * 0.00000001).toFixed(8).toString();
    //case 'DOGE':
    //case 'BXO':
    //    return (num * 1).toFixed(2).toString();  
    default:
        return (num * 0.00000001).toFixed(8).toString();
  }
};

helpers.convSatstoCointype = function(num){
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num / 100).toFixed(2);
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num * 0.00000001).toFixed(8);
    case 'DOGE':
    case 'BXO':
    case 'CLAM':
        return (num * 1).toFixed(8);  
    default:
        return (num / 100).toFixed(2);
  }
};

helpers.convSatstoCointypeJP = function(num){
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num / 100).toFixed(2);
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num * 0.00000001).toFixed(8);
    case 'DOGE':
    case 'BXO':
    case 'CLAM':
        return (num * 1).toFixed(2);
    default:
        return (num * 0.00000001).toFixed(8);
  }
};

helpers.convCoinTypetoSats = function (num){
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num * 100);
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num / 0.00000001);
    case 'DOGE':
    case 'BXO':
    case 'CLAM':
        return num * 1;  
    default:
        return (num * 100);
  }
};

helpers.wagertotal = function(num) {
  switch(worldStore.state.coin_type){
    case 'BITS':
        return (num * 1).toFixed(2).toString();
    case 'BTC':
    case 'LTC':
    case 'DASH':
    case 'ADK':
    case 'GRLC':
    case 'FLASH':
    case 'ETH':
    case 'MBI':
    case 'WAVES':
        return (num * 0.000001).toFixed(8).toString();
    case 'CLAM':
        return (num/1000000).toFixed(8).toString();
    case 'BXO':
        return (num/10000).toFixed(8).toString();    
    default:
        return (num * 1).toFixed(2).toString();
  }
};

helpers.betToNum = function(num, coin){
  switch(coin){
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'ADK':
      case 'FLASH':
      case 'GRLC':
      case 'ETH':
      case 'MBI':
      case 'WAVES':
          if (worldStore.state.coin_mode == 'BITS'){
              return (num/100).toFixed(2);
          }else{
              return (num * 0.00000001).toFixed(8);
          }
          break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
          return (num * 1).toFixed(8);        
  }
};

helpers.roleToLabelElement = function(user) {
  switch(user.role) {
    case 'ADMIN':
      return el.span({className: 'label label-danger'}, 'MP Staff');
    case 'MOD':
      if (user.uname == 'iisurge'){
        return el.span({className: 'label label-info'}, 'Bot Master');
      }else{
        return el.span({className: 'label label-info'}, 'Mod');
      }
    case 'OWNER':
      return el.span({className: 'label label-danger'}, 'Admin');
    case 'BOT':
      return el.span({className: 'label label-primary'}, 'Bot');
    case 'JACKPOT':
      return el.span({className: 'label label-success'},'JACKPOT');
    case 'TIP':
      return el.span({className: 'label label-success'},'TIP');  
    case 'PM':
      return el.span({className: 'label label-warning'},'PM');
    default:
      if ((user.uname == 'Chatbot')||(user.uname == 'chatbot')){
        return el.span({className: 'label label-primary'}, 'Bot');
      }else {
        return '';
      }
  }
};

// -> Object
helpers.getHashParams = function() {
  var hashParams = {};
  var e,
      a = /\+/g,  // Regex for replacing addition symbol with a space
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
      q = window.location.search.substring(1);
  while (e = r.exec(q))
    hashParams[d(e[1])] = d(e[2]);
  return hashParams;
};

// getPrecision('1') -> 0
// getPrecision('.05') -> 2
// getPrecision('25e-100') -> 100
// getPrecision('2.5e-99') -> 100
helpers.getPrecision = function(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
    // Adjust for scientific notation.
    (match[2] ? +match[2] : 0));
};

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
helpers.decimalAdjust = function(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

helpers.round10 = function(value, exp) {
  return helpers.decimalAdjust('round', value, exp);
};

helpers.floor10 = function(value, exp) {
  return helpers.decimalAdjust('floor', value, exp);
};

helpers.ceil10 = function(value, exp) {
  return helpers.decimalAdjust('ceil', value, exp);
};

// [String] -> [Float]
helpers.toFloats = function(arr) {
  console.assert(_.isArray(arr));
  return arr.map(function(str) {
    console.assert(_.isString(str));
    return parseFloat(str, 10);
  });
};

// Adds commas to a number, returns string
helpers.commafy = function(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};


helpers.payTableToEdge = (function() {
  var binom = function(n,k) {
    k = Math.min(k, n - k);
    console.assert(k >= 0);

    var r = 1;
    for (var i = 0; i < k; ++i)
      r = (r * (n - i)) / (i + 1);
    return r;
  };

  return function _payTableToEdge(table) {
    var possibilities = Math.pow(2, table.length-1);
    var ev = -1;
    table.forEach(function(payout, i) {
      var x = binom(table.length-1, i);
      // console.log('There is a: ' + x + ' in ' + possibilities + ' of it landing on ' + payout);
      var prob = x/possibilities;
      ev += prob * payout;
    });
    // console.log('House edge: ', -ev*100, '%');
    return -ev*100;
  };
})();

helpers.isValidPayout = (function() {
  var re = /^(\d\.\d{0,2})$|^(\d\d\.\d{0,1})$|^(\d{1,4})$/;
  return function _isValidPayout(str) {
    return re.test(str);
  };
})();

helpers.payTablEdgeSlots = (function() {
  var probs = [0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.009, 0.009, 0.009, 0.09];
  return function _payTableToEdgeSlots(table) {
    var ev = 0;
    for (x = 0; x< table.length; x++){
      ev += (table[x]/(1/probs[x]));
    }
    var he = (ev -1)*-1;
    return he*100;
  };
})();
// API abstraction
//
var apiCall = (function() {
  var o = {};
  // method: 'GET' | 'POST' | ...
  // endpoint: '/tokens/abcd-efgh-...'
  var noop = function() {};
  var makeAPIRequest = function(method, bodyParams, endpoint, callbacks, overrideOpts) {
  var url = config.api_uri + endpoint;
    var ajaxOpts = {
      url:      url,
      dataType: 'json', // data type of response
      timeout: 15000,
      method:   method,
      data:     bodyParams,// ? JSON.stringify(bodyParams) : undefined,
      // By using text/plain, even though this is a JSON request,
      // we avoid preflight request. (Moneypot explicitly supports this)
     // headers: {
     //   'Content-Type': 'text/plain'
     // },
      // Callbacks
      success:  callbacks.success || noop,
      error:    callbacks.error || noop,
      complete: callbacks.complete || noop
    };

    $.ajax(_.merge({}, ajaxOpts, overrideOpts || {}));
  };
  // gRecaptchaResponse is string response from google server
  // `callbacks.success` signature	is fn({ claim_id: Int, amoutn: Satoshis })
  o.claimFaucet = function(gRecaptchaResponse, callbacks) {
    console.log('Hitting POST /claim-faucet');
    var endpoint = '/claim-faucet';
    var body = { response: gRecaptchaResponse };
    makeMPRequest('POST', body, endpoint, callbacks);
  };

  o.getTokenInfo = function(token, callbacks){
      console.log('Token GET');
      var endpoint = '/token?accessToken=' + token;
      makeAPIRequest('GET', undefined, endpoint, callbacks);
  };

  o.getAuthData = function(callbacks){
      console.log('AuthData GET');
      var endpoint = '/authdata';
      makeAPIRequest('GET', undefined, endpoint, callbacks);
  };

  o.placeDiceBet = function(bodyParams, callbacks) {
    var endpoint = '/dicebet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placePlinkoBet = function(bodyParams, callbacks) {
    var endpoint = '/plinkobet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeRouletteBet = function(bodyParams, callbacks) {
    var endpoint = '/roulettebet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeBitsweepBet = function(bodyParams, callbacks) {
    var endpoint = '/bitsweepbet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeSlotsBet = function(bodyParams, callbacks) {
    var endpoint = '/slotsbet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeBitClimberBet = function(bodyParams, callbacks) {
    var endpoint = '/bitclimberbet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeSlidersBet = function(bodyParams, callbacks) {
    var endpoint = '/slidersbet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  o.placeWonderBet = function(bodyParams, callbacks) {
    var endpoint = '/wonderbet';
    makeAPIRequest('POST', bodyParams, endpoint, callbacks);
  };

  return o;
})();


// Manage auth_id //////////////////////////////////////
//
// - If auth_id is in url, save it into localStorage.
//   `expires_in` (seconds until expiration) will also exist in url
//   so turn it into a date that we can compare

var access_token, expires_in, expires_at;
var refer_name = helpers.getHashParams().ref;
if (refer_name){
  localStorage.setItem('refname', refer_name);
}
var confidential_token = helpers.getHashParams().confidential_token;
if(confidential_token) {
  if(config.debug){console.log('[token manager] confidential_token in hash params');}
  localStorage.access_token = null;
  localStorage.expires_at = null;
  access_token = confidential_token;
 // confidential_token = null;
}else if (localStorage.access_token) {
  if(config.debug){console.log('[token manager] access_token in localStorage');}
  expires_at = localStorage.expires_at;
  // Only get access_token from localStorage if it expires  <old>
  // in a week or more. access_tokens are valid for two weeks <old>
  //<now> use access token if expires > todays date <now>
  //if (expires_at && new Date(expires_at) > new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))) {
  if (expires_at && new Date(expires_at) > new Date(Date.now())) {
    access_token = localStorage.access_token;
    if(config.debug){console.log('[token manager] token not stale');}
  } else {
    if(config.debug){console.log('[token manager] token stale removing from local store');}
    localStorage.removeItem('expires_at');
    localStorage.removeItem('access_token');
  }
} else {
  if(config.debug){console.log('[token manager] no confidential_token');}
}

// Scrub fragment params from url.
if (window.history && window.history.replaceState) {
  window.history.replaceState({}, document.title, window.location.pathname);
} else {
  // For browsers that don't support html5 history api, just do it the old
  // fashioned way that leaves a trailing '#' in the url
  window.location.hash = '#';
}


if ((confidential_token!= undefined)&&(confidential_token != null)){
    if (config.debug){console.log('Token Api: ' + confidential_token);}
    apiCall.getTokenInfo(confidential_token, {
        success: function(data) {
          console.log('Success TokenInfo: ', data);
          if (data.user){
              //access_token = data.token;
                expires_in = data.expires_in;
                expires_at = new Date(Date.now() + (1000 * 60 * 60 * 24 * 7));
              localStorage.setItem('access_token', data.token);
              localStorage.setItem('expires_at', expires_at); 
           var user = data.user;
           //Dispatcher.sendAction('SIGNAL READY');
           Dispatcher.sendAction('USER_LOGIN', user);
          }
        },
        error: function(xhr) {
          console.log('Error Token Api');
          if (xhr.responseJSON && xhr.responseJSON) {
            alert(xhr.responseJSON.error);
          } else {
            alert('Access Token Error: Internal Error');
          }
        },
        complete: function() {
         console.log('Complete TokenInfo');
      //   Dispatcher.sendAction('STOP_LOADING');
        // connectToChatServer();
        }
      });
  
}else{
 // console.log('no token connecting to chat');
 // connectToChatServer();
}


////////////////////////////////////////////////
//document.body.appendChild(document.createElement('script')).src="../app/dice.js";
//requirejs(['app/dice'],function(dice){});
//console.log('loaded script');

var Dispatcher = new (function() {
  // Map of actionName -> [Callback]
  this.callbacks = {};

  var self = this;

  // Hook up a store's callback to receive dispatched actions from dispatcher
  this.registerCallback = function(actionName, cb) {
    //console.log('[Dispatcher] registering callback for:', actionName);

    if (!self.callbacks[actionName]) {
      self.callbacks[actionName] = [cb];
    } else {
      self.callbacks[actionName].push(cb);
    }
  };

  this.sendAction = function(actionName, payload) {
    //console.log('[Dispatcher] received action:', actionName, payload);

    // Ensure this action has 1+ registered callbacks
    if (!self.callbacks[actionName]) {
      throw new Error('Unsupported actionName: ' + actionName);
    }

    // Dispatch payload to each registered callback for this action
    self.callbacks[actionName].forEach(function(cb) {
      cb(payload);
    });
  };
});

////////////////////////////////////////////////////////////

var Store = function(storeName, initState, initCallback) {
  this.state = initState;
  this.emitter = new EventEmitter();
  // Execute callback immediately once store (above state) is setup
  // This callback should be used by the store to register its callbacks
  // to the dispatcher upon initialization
  initCallback.call(this);
  var self = this;
  // Allow components to listen to store events (i.e. its 'change' event)
  this.on = function(eventName, cb) {
    self.emitter.on(eventName, cb);
  };
  this.off = function(eventName, cb) {
    self.emitter.off(eventName, cb);
  };
};

//var chat_ignorelist = localStorage.ignorelist;

if (localStorage.ignorelist){
  var chat_ignorelist = [];
  var list_t = localStorage.ignorelist.split(",");
  for (var x = 0; x < list_t.length; x++){
    chat_ignorelist.push(list_t[x]);
  }
}else{
 var chat_ignorelist = [];
}

if (localStorage.hideChatBets){
  var ChatBets = JSON.parse(localStorage.getItem('hideChatBets'));
}else{
  var ChatBets = {
    BTC: true,
    LTC: true,
    DASH: true,
    ADK: true,
    GRLC: true,
    FLASH: true,
    ETH: true,
    MBI: true,
    WAVES: true,
    DOGE: true,
    BXO: true,
    CLAM: true
  }
}


var linkmute = true;
var chatStore = new Store('chat', {
  messages: new CBuffer(config.chat_buffer_size),
  pm_messages:[],
  currTab: 'MAIN',
  waitingForServer: false,
  userList: {},
  showChat: true,
  showUserList: false,
  loadingInitialMessages: true,
  sent_to: 0,
  message_key: genUuid(),
  newmsg: false,
  chatinit: false,
  delete_tab: false,
  newmessages: 0,
  chat_room: 'ENGLISH_RM'
  }, function() {
  var self = this;
  Dispatcher.registerCallback('CHANGE_CHAT_ROOM', function(room_name) {
    console.assert(typeof room_name === 'string');

    if (room_name == 'ENGLISH_RM'){
      socket.emit('join_CHAT_ROOM', room_name, function(err, messagedata) {
          if (err){
            console.log('socket_error join_CHAT_ROOM',err);
          }else {
            console.log('socket success join_CHAT_ROOM',room_name);
            var messages = messagedata.map(function(message) {
              message.id = genUuid();
              return message;
            });
            delete self.state.messages;
            self.state.messages = new CBuffer(config.chat_buffer_size);
            self.state.messages.push.apply(self.state.messages, messages);
            self.state.messages.toArray().map(function(m) { m.id = genUuid();});
          }
          self.state.chat_room = room_name;

          self.state.currTab = 'MAIN';
          console.log('CHANGED_CHAT_ROOM',room_name);
          self.emitter.emit('change', self.state);
          self.emitter.emit('init',self.state);
      });
    }else {
    if(self.state.pm_messages.length > 0){
    for (var x = 0; x <= self.state.pm_messages.length; x++){
      if (x < self.state.pm_messages.length){
        if(self.state.pm_messages[x].name == room_name){

          if (self.state.currTab != room_name){
            Dispatcher.sendAction('CHANGE_CHATTAB', room_name);
          }
          break;
        }
      }
        else if(x == self.state.pm_messages.length){
          //self.state.pm_messages[x].push(message);
          socket.emit('join_CHAT_ROOM', room_name, function(err, messagedata) {
              if (err){
                console.log('socket_error join_CHAT_ROOM',err);
              }else {
                console.log('socket success join_CHAT_ROOM',room_name);
                var messages = messagedata.map(function(message) {
                  message.id = genUuid();
                  return message;
                });
                delete self.state.pm_messages[x];
                self.state.pm_messages[x] = new CBuffer(config.chat_buffer_size);
                self.state.pm_messages[x].name = room_name;
                self.state.pm_messages[x].new_message = true;

                self.state.pm_messages[x].push.apply(self.state.pm_messages[x], messages);
                self.state.pm_messages[x].toArray().map(function(m) { m.id = genUuid();});
              }
              self.state.chat_room = room_name;
              Dispatcher.sendAction('CHANGE_CHATTAB', room_name);
              //self.state.currTab = 'MAIN';
              console.log('CHANGED_CHAT_ROOM',room_name);
            //  self.emitter.emit('change', self.state);
            //  self.emitter.emit('init',self.state);
          });
          break;
        }
      }
    }else{
      //self.state.pm_messages[0].push(message);
      socket.emit('join_CHAT_ROOM', room_name, function(err, messagedata) {
          if (err){
            console.log('socket_error join_CHAT_ROOM',err);
          }else {
            console.log('socket success join_CHAT_ROOM',room_name);
            var messages = messagedata.map(function(message) {
              message.id = genUuid();
              return message;
            });
            self.state.pm_messages[0] = new CBuffer(config.chat_buffer_size);
            self.state.pm_messages[0].name = room_name;
            self.state.pm_messages[0].new_message = true;

            self.state.pm_messages[0].push.apply(self.state.pm_messages[0], messages);
            self.state.pm_messages[0].toArray().map(function(m) { m.id = genUuid();});
          }
          self.state.chat_room = room_name;
          Dispatcher.sendAction('CHANGE_CHATTAB', room_name);
          //self.state.currTab = 'MAIN';
          console.log('CHANGED_CHAT_ROOM',room_name);
        //  self.emitter.emit('change', self.state);
        //  self.emitter.emit('init',self.state);
      });


    }
  }



  });


  Dispatcher.registerCallback('CHANGE_CHATTAB', function(tabName) {
    console.assert(typeof tabName === 'string');
    self.state.currTab = tabName;

    for(x = 0; x< self.state.pm_messages.length; x++){
      if (tabName == self.state.pm_messages[x].name){
        self.state.pm_messages[x].new_message = false;
      }
    }
    if (self.state.delete_tab)
      {
      self.state.currTab = 'MAIN';
      self.state.messages.new_message = false;
      self.state.delete_tab = false;
      }
    if ((self.state.currTab == 'MAIN')||(tabName == 'MAIN')){
      self.state.messages.new_message = false;
      self.state.newmessages = 0;
    }
    console.log('CHANGE_CHATTAB');
    self.emitter.emit('change', self.state);
    self.emitter.emit('init',self.state);
  });

  Dispatcher.registerCallback('REMOVE_CHATTAB', function(tabName) {
    console.assert(typeof tabName === 'string');
    self.state.delete_tab = true;
    self.state.currTab = 'MAIN';


    switch(tabName){
      case 'RUSSIAN_RM'://
      case 'FRENCH_RM':
      case 'SPANISH_RM'://
      case 'PORTUGUESE_RM'://
      //case 'DUTCH_RM':
      case 'GERMAN_RM'://
      case 'HINDI_RM'://
      //case 'CHINESE_RM':
      //case 'JAPANESE_RM':
      //case 'KOREAN_RM':
      case 'FILIPINO_RM'://
      case 'INDONESIAN_RM'://
      case 'MODS_RM'://
        socket.emit('leave_CHAT_ROOM', tabName);
        break;
      default:
        socket.emit('close_pm', tabName);
        break;
    }

    for(x = 0; x< self.state.pm_messages.length; x++){
      if (tabName == self.state.pm_messages[x].name){
        self.state.pm_messages.splice(x,1);
      }
    }
    console.log('REMOVE_CHATTAB');
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_INPUT_STRING', function(uname) {

    textinput.state.text += uname + ' ';
    self.emitter.emit('change', self.state);
  });
  Dispatcher.registerCallback('CLEAR_INPUT_STRING', function() {
    self.state.input_string = '';
    self.emitter.emit('inputchange', self.state);
  });

  Dispatcher.registerCallback('SET_NEWMSG', function() {
    self.state.newmsg = true;
    self.emitter.emit('change', self.state);
  });
  Dispatcher.registerCallback('CLEAR_NEWMSG', function() {
    self.state.newmsg = false;
    self.emitter.emit('change', self.state);
  });


  // `data` is object received from socket auth
  Dispatcher.registerCallback('INIT_CHAT', function(data) {
    if(config.debug){console.log('[ChatStore] received INIT_CHAT');}
    // Give each one unique id
      //self.state.message_key = genUuid();
    var messages = data.chat.messages.map(function(message) {
      message.id = genUuid();//self.state.message_key;
      //self.state.message_key = genUuid();
      return message;
    });

    // Reset the CBuffer since this event may fire multiple times,
    // e.g. upon every reconnection to chat-server.
    //self.state.messages.empty();
    delete self.state.messages;
    self.state.messages = new CBuffer(config.chat_buffer_size);
    self.state.messages.push.apply(self.state.messages, messages);
    self.state.messages.toArray().map(function(m) { m.id = genUuid();}); //console.log(m.id);});

    // Indicate that we're done with initial fetch
    self.state.loadingInitialMessages = false;

    // Load userList

    for (var x = 0; x < data.chat.userlist.length; x++){
      self.state.userList[data.chat.userlist[x].uname] = data.chat.userlist[x];
    }
    linkmute = true;
    setTimeout(function(){linkmute = false;},3000);

    self.emitter.emit('change', self.state);
    self.emitter.emit('init');
  });

  Dispatcher.registerCallback('NEW_MESSAGE', function(message) {
    if(config.debug){console.log('[ChatStore] received NEW_MESSAGE');}
    message.id = self.state.message_key;

    if (message.user.role == 'PM'){
      if (message.receiver == worldStore.state.user.uname){
        if(self.state.pm_messages.length > 0){
        for (var x = 0; x <= self.state.pm_messages.length; x++){
          if (x < self.state.pm_messages.length){
            if(self.state.pm_messages[x].name == message.user.uname){
              self.state.pm_messages[x].push(message);
              if (self.state.currTab != message.user.uname){
                self.state.pm_messages[x].new_message = true;
              }
              break;
            }
          }else if(x == self.state.pm_messages.length){
              self.state.pm_messages[x] = new CBuffer(config.chat_buffer_size);
              self.state.pm_messages[x].name = message.user.uname;
              self.state.pm_messages[x].new_message = true;
              self.state.pm_messages[x].push(message);
              break;
            }
          }
        }else{
          self.state.pm_messages[0] = new CBuffer(config.chat_buffer_size);
          self.state.pm_messages[0].name = message.user.uname;
          self.state.pm_messages[0].new_message = true;
          self.state.pm_messages[0].push(message);
        }

      }else {
        if(self.state.pm_messages.length > 0){
        for (var x = 0; x <= self.state.pm_messages.length; x++){
          if (x < self.state.pm_messages.length){
            if(self.state.pm_messages[x].name == message.receiver){
              self.state.pm_messages[x].push(message);
              if (self.state.currTab != message.receiver){
                self.state.pm_messages[x].new_message = true;
              }
              break;
            }
          }
            else if(x == self.state.pm_messages.length){
              self.state.pm_messages[x] = new CBuffer(config.chat_buffer_size);
              self.state.pm_messages[x].name = message.receiver;
              self.state.pm_messages[x].new_message = true;
              self.state.pm_messages[x].push(message);
              break;
            }
          }
        }else{
          self.state.pm_messages[0] = new CBuffer(config.chat_buffer_size);
          self.state.pm_messages[0].name = message.receiver;
          self.state.pm_messages[0].new_message = true;
          self.state.pm_messages[0].push(message);
        }
      }
    }else{
      //self.state.messages.push(message);
      if (message.room == undefined){
        self.state.messages.push(message);
        if (self.state.currTab != 'MAIN'){
          self.state.messages.new_message = true;
          self.state.newmessages++;
          switch(self.state.currTab){
            case 'RUSSIAN_RM':
            case 'FRENCH_RM':
            case 'SPANISH_RM':
            case 'PORTUGUESE_RM':
           // case 'DUTCH_RM':
            case 'GERMAN_RM':
            case 'HINDI_RM':
           // case 'CHINESE_RM':
            //case 'JAPANESE_RM':
            //case 'KOREAN_RM':
            case 'FILIPINO_RM':
            case 'INDONESIAN_RM':
            case 'MODS_RM':
              if(self.state.pm_messages.length > 0){
                for (var x = 0; x < self.state.pm_messages.length; x++){
                  if(self.state.pm_messages[x].name == self.state.currTab){
                    self.state.pm_messages[x].push(message);
                    break;
                    }
                  }
                }
              break;
          }
        }else {
          self.state.newmessages = 0;
        }
      }else if( (message.room != 'ENGLISH_RM')&&(message.room != 'GLOBAL_RM')){
        if(self.state.pm_messages.length > 0){
        for (var x = 0; x <= self.state.pm_messages.length; x++){
          if (x < self.state.pm_messages.length){
            if(self.state.pm_messages[x].name == message.room){
              self.state.pm_messages[x].push(message);
              if (self.state.currTab != message.room){
                self.state.pm_messages[x].new_message = true;
              }
              break;
            }
          }
            else if(x == self.state.pm_messages.length){
              self.state.pm_messages[x] = new CBuffer(config.chat_buffer_size);
              self.state.pm_messages[x].name = message.room;
              self.state.pm_messages[x].new_message = true;
              self.state.pm_messages[x].push(message);
              break;
            }
          }
        }else{
          self.state.pm_messages[0] = new CBuffer(config.chat_buffer_size);
          self.state.pm_messages[0].name = message.room;
          self.state.pm_messages[0].new_message = true;
          self.state.pm_messages[0].push(message);
        }
      }else if (message.room == 'GLOBAL_RM'){
        self.state.messages.push(message);

        if (self.state.currTab != 'MAIN'){
          self.state.messages.new_message = true
          self.state.newmessages++;
          switch(self.state.currTab){
            case 'RUSSIAN_RM':
            case 'FRENCH_RM':
            case 'SPANISH_RM':
            case 'PORTUGUESE_RM':
           // case 'DUTCH_RM':
            case 'GERMAN_RM':
            case 'HINDI_RM':
           // case 'CHINESE_RM':
           // case 'JAPANESE_RM':
           // case 'KOREAN_RM':
            case 'FILIPINO_RM':
            case 'INDONESIAN_RM':
            case 'MODS_RM':
              if(self.state.pm_messages.length > 0){
                for (var x = 0; x < self.state.pm_messages.length; x++){
                  if(self.state.pm_messages[x].name == self.state.currTab){
                    self.state.pm_messages[x].push(message);
                    break;
                    }
                  }
                }
              break;
          }
        }else{
          self.state.newmessages = 0;
        }
      }else {
        self.state.messages.push(message);
        if (self.state.currTab != 'MAIN'){
          self.state.messages.new_message = true
          self.state.newmessages++;
        }else {
          self.state.newmessages = 0;
        }
      }
    }

    if ((self.state.showChat == false)){
      self.state.newmessages++;
    }else {
      self.state.newmessages = 0;
    }

    self.state.message_key = genUuid();
    self.state.waitingForServer = false;

    self.emitter.emit('change', self.state);
    self.emitter.emit('new_message');

  });

  Dispatcher.registerCallback('TOGGLE_CHAT_USERLIST', function() {
    if(config.debug){console.log('[ChatStore] received TOGGLE_CHAT_USERLIST');}
    self.state.showUserList = !self.state.showUserList;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_CHAT', function() {
    console.log('[ChatStore] received TOGGLE_CHAT');
    self.state.showChat = !self.state.showChat;
    if (self.state.showChat){
      self.state.newmessages = 0;
      setTimeout(function(){self.emitter.emit('init');},250);
    }
    self.emitter.emit('toggle_chat', self.state);
  });

  // user is { id: Int, uname: String, role: 'admin' | 'mod' | 'owner' | 'member' }
  Dispatcher.registerCallback('USER_JOINED', function(user) {
    if(config.debug){console.log('[ChatStore] received USER_JOINED:', user);}
    var match = false;

    for (var x = 0; x < Object.keys(self.state.userList).length; x++)
      {
        if (self.state.userList[x] != undefined){
          if (self.state.userList[x].uname == user.uname){
                match = true;
              }
          }else if (self.state.userList[user.uname] != undefined){
            if (self.state.userList[user.uname].uname == user.uname){
              match = true;
            }
          }
      }
    if (match == false){
    self.state.userList[user.uname] = user;
    self.emitter.emit('change', self.state);
    }
  });

  // user is { id: Int, uname: String, role: 'admin' | 'mod' | 'owner' | 'member' }
  Dispatcher.registerCallback('USER_LEFT', function(user) {
    if(config.debug){console.log('[ChatStore] received USER_LEFT:', user);}

    for (var x = 0; x < Object.keys(self.state.userList).length; x++)
      {
        if (self.state.userList[x] != undefined){
          if (self.state.userList[x].uname == user.uname){
                delete self.state.userList[x];
              }
          }else if (self.state.userList[user.uname] != undefined){
            if (self.state.userList[user.uname].uname == user.uname){
              delete self.state.userList[user.uname];
            }
          }
      }


    self.emitter.emit('change', self.state);
  });

  // Message is { text: String }
  Dispatcher.registerCallback('SEND_MESSAGE', function(text) {
    if (text.substring(0, 1) == '/') {
      // TIP CODE HERE
    Dispatcher.sendAction('PARSE_COMMAND',text);
    }
    else{
      console.log('[ChatStore] received SEND_MESSAGE');
      self.state.waitingForServer = true;
      self.emitter.emit('change', self.state);
      var room_name = 'ENGLISH_RM';
      switch(self.state.currTab){
        case 'MAIN':
          room_name = 'ENGLISH_RM';
          break;
        case 'RUSSIAN_RM':
        case 'FRENCH_RM':
        case 'SPANISH_RM':
        case 'PORTUGUESE_RM':
       // case 'DUTCH_RM':
        case 'GERMAN_RM':
        case 'HINDI_RM':
       // case 'CHINESE_RM':
       // case 'JAPANESE_RM':
       // case 'KOREAN_RM':
        case 'FILIPINO_RM':
        case 'INDONESIAN_RM':
        case 'MODS_RM':
          room_name = self.state.currTab;
          break;
      }

      socket.emit('new_message', { text: text, room: room_name }, function(err) {
          if (err) { alert('Chat Error: ' + err); }
          });
      }
    });

    Dispatcher.registerCallback('SEND_TIP',function(text){
      var error = null;
      var send_private = false;
      var tipres = text.split(" ");
      var coin_type_send = tipres[3];
      var tipamount;
      var tipto = tipres[1];
      var d = new Date();

      if ((tipres[4] === 'PRIVATE')||(tipres[4] === 'private')){
      send_private = true;
      }

      if (coin_type_send != undefined){
        switch(coin_type_send){
          case 'BITS':
          case 'bits':
          case 'bit':
            coin_type_send = 'BITS';
            tipamount = Math.round((parseFloat(tipres[2]) * 100));
            break;  
          case 'BTC':
          case 'btc':
            coin_type_send = 'BTC';
            tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
            break;
          case 'LTC':
          case 'ltc':
            coin_type_send = 'LTC';
            tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
            break;
          case 'DASH':
          case 'dash':
            coin_type_send = 'DASH';
            tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
            break;
          case 'ADK':
          case 'adk':
            coin_type_send = 'ADK';
            tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
            break;
          case 'GRLC':
          case 'grlc':
            coin_type_send = 'GRLC';
            tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
            break;
            case 'FLASH':
            case 'flash':
              coin_type_send = 'FLASH';
              tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
              break;
            case 'ETH':
            case 'eth':
              coin_type_send = 'ETH';
              tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
              break;
            case 'MBI':
            case 'mbi':
                coin_type_send = 'MBI';
                tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
                break;
            case 'WAVES':
            case 'waves':
              coin_type_send = 'WAVES';
              tipamount = Math.round((parseFloat(tipres[2]) / 0.00000001));
              break;           
          case 'DOGE':
          case 'doge':
            coin_type_send = 'DOGE';
            tipamount = parseFloat(tipres[2]).toFixed(2);
            break;
          case 'BXO':
          case 'bxo':
            coin_type_send = 'BXO';
            tipamount = parseFloat(tipres[2]).toFixed(4);
            break;
            case 'CLAM':
            case 'clam':
              coin_type_send = 'CLAM';
              tipamount = parseFloat(tipres[2]).toFixed(8);
              break;    
          default:
            error = "Invalid Coin Type use BITS,BTC,LTC,DASH,ADK,GRLC,FLASH,ETH,MBI,WAVES,CLAM,BXO or DOGE";
            break;
        }
      }else{
        error = "Invalid Coin Type use BITS,BTC,LTC,DASH,ADK,GRLC,FLASH,ETH,MBI,WAVES,CLAM,BXO or DOGE";
      }

      switch(coin_type_send){
            case 'BITS':
              if (worldStore.state.user.balances.btc < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 1 BIT";
              }
              break;
            case 'BTC':
              if (worldStore.state.user.balances.btc < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 BTC";
              }
              break;
              case 'LTC':
              if (worldStore.state.user.balances.ltc < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 LTC";
              }
              break;
              case 'DASH':
              if (worldStore.state.user.balances.dash < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 DASH";
              }
              break;
              case 'ADK':
              if (worldStore.state.user.balances.adk < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 ADK";
              }
              break;
              case 'GRLC':
              if (worldStore.state.user.balances.grlc < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 GRLC";
              }
              break;
              case 'FLASH':
              if (worldStore.state.user.balances.flash < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 FLASH";
              }
              break;
              case 'ETH':
              if (worldStore.state.user.balances.eth < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 ETH";
              }
              break;
              case 'MBI':
              if (worldStore.state.user.balances.mbi < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 MBI";
              }
              break;
              case 'WAVES':
              if (worldStore.state.user.balances.waves < tipamount){
                error = "BALANCE TOO LOW"
              }else if ((tipamount < 100) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.000001 WAVES";
              }
              break;    
            case 'DOGE':
              if (worldStore.state.user.balances.doge < tipamount){
                error = "BALANCE TOO LOW";
              }
              else if((tipamount < 1) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 1 DOGE";
              }
              break;
            case 'BXO':
              if (worldStore.state.user.balances.bxo < tipamount){
                error = "BALANCE TOO LOW";
              }
              else if((tipamount < 0.1) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.1 BXO";
              }
              break;
              case 'CLAM':
              if (worldStore.state.user.balances.clam < tipamount){
                error = "BALANCE TOO LOW";
              }
              else if((tipamount < 0.00001) || (tipamount == undefined)){
                error = "MUST SEND MORE THAN 0.00001 CLAM";
              }
              break;  
          }

      if (!error){
        var params = {
            uname: tipto,
            amount: tipamount,
            private: send_private,
            type: coin_type_send
          };
        socket.emit('send_tip', params, function(err, data) {
          if (err) {
            console.log('[socket] send_tip error:', err);
            return;
          }
          switch(coin_type_send){
            case 'BTC':
            case 'BITS':
            Dispatcher.sendAction('UPDATE_USER', { balances: {btc: worldStore.state.user.balances.btc - tipamount}});
              break;
            case 'LTC':
            Dispatcher.sendAction('UPDATE_USER', { balances: {ltc: worldStore.state.user.balances.ltc - tipamount}});
              break;
            case 'DASH':
            Dispatcher.sendAction('UPDATE_USER', { balances: {dash: worldStore.state.user.balances.dash - tipamount}});
              break;
            case 'ADK':
            Dispatcher.sendAction('UPDATE_USER', { balances: {adk: worldStore.state.user.balances.adk - tipamount}});
              break;
            case 'GRLC':
            Dispatcher.sendAction('UPDATE_USER', { balances: {grlc: worldStore.state.user.balances.grlc - tipamount}});
              break;
            case 'FLASH':
            Dispatcher.sendAction('UPDATE_USER', { balances: {flash: worldStore.state.user.balances.flash - tipamount}});
              break;
            case 'ETH':
            Dispatcher.sendAction('UPDATE_USER', { balances: {eth: worldStore.state.user.balances.eth - tipamount}});
              break;
              case 'MBI':
              Dispatcher.sendAction('UPDATE_USER', { balances: {mbi: worldStore.state.user.balances.mbi - tipamount}});
                break;
                case 'WAVES':
            Dispatcher.sendAction('UPDATE_USER', { balances: {waves: worldStore.state.user.balances.waves - tipamount}});
              break;              
            case 'DOGE':
            Dispatcher.sendAction('UPDATE_USER', { balances: {doge: worldStore.state.user.balances.doge - tipamount}});
              break;
            case 'BXO':
            Dispatcher.sendAction('UPDATE_USER', { balances: {bxo: worldStore.state.user.balances.bxo - tipamount}});
              break;
              case 'CLAM':
            Dispatcher.sendAction('UPDATE_USER', { balances: {clam: worldStore.state.user.balances.clam - tipamount}});
              break;  
          }

          console.log('Successfully made tip: '+tipres[2]+' to '+tipto);

          text = "Sent: "+tipres[2] + " " + coin_type_send + " to " +tipto;
          if (send_private){
            text += ' PRIVATELY';
            Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "TIP", uname: worldStore.state.user.uname, level:worldStore.state.user.level} });
          }else{ }
        });
      }else {
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:error, created_at: d.toJSON(),user:{role: "TIP", uname: "ERROR"}});
      }
    });

    // /rain [amount] [coin]
    Dispatcher.registerCallback('SEND_RAIN',function(text){
      var error = null;
      var tipres = text.split(" ");
      var coin_type_send = tipres[2];
      var totalrain;  //in sats
      var tipamount;  //in sats
      var tipto;// = tipres[1];
      var tiplist = [];
      var d = new Date();
      var balance = 0;

      if (coin_type_send != undefined){
        switch(coin_type_send){
          case 'BITS':
          case 'bits':
          case 'bit':
            coin_type_send  = 'BITS';
            totalrain = Math.round((parseFloat(tipres[1]) * 100));
            balance = worldStore.state.user.balances.btc;
            break;
          case 'BTC':
          case 'btc':
            coin_type_send = 'BTC';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.btc;
            break;
          case 'LTC':
          case 'ltc':
            coin_type_send = 'LTC';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.ltc;
            break;
          case 'DASH':
          case 'dash':
            coin_type_send = 'DASH';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.dash;
            break;
          case 'ADK':
          case 'adk':
            coin_type_send = 'ADK';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.adk;
            break;
          case 'GRLC':
          case 'grlc':
            coin_type_send = 'GRLC';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.grlc;
            break;
          case 'FLASH':
          case 'flash':
            coin_type_send = 'FLASH';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.flash;
            break;
          case 'ETH':
          case 'eth':
            coin_type_send = 'ETH';
            totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
            balance = worldStore.state.user.balances.eth;
            break;
            case 'MBI':
            case 'mbi':
              coin_type_send = 'MBI';
              totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
              balance = worldStore.state.user.balances.mbi;
              break;
              case 'WAVES':
              case 'WAVES':
                coin_type_send = 'WAVES';
                totalrain = Math.round((parseFloat(tipres[1]) / 0.00000001));
                balance = worldStore.state.user.balances.waves;
                break;                   
          case 'DOGE':
          case 'doge':
            coin_type_send = 'DOGE';
            totalrain = parseFloat(tipres[1]);
            balance = worldStore.state.user.balances.doge;
            break;
            case 'BXO':
            case 'bxo':
              coin_type_send = 'BXO';
              totalrain = parseFloat(tipres[1]);
              balance = worldStore.state.user.balances.bxo;
              break;
              case 'CLAM':
              case 'clam':
                coin_type_send = 'CLAM';
                totalrain = parseFloat(tipres[1]);
                balance = worldStore.state.user.balances.clam;
                break;  
          default:
            error = "Invalid Coin Type use BITS, BTC, LTC, DASH, ADK, GRLC, FLASH, ETH, MBI, WAVES, CLAM, DOGE or BXO";
            break;
        }
      }else{
        error = "Invalid Coin Type use BITS, BTC, LTC, DASH, ADK, GRLC, FLASH, ETH, MBI, WAVES, CLAM, DOGE or BXO";
      }

      if (Object.keys(chatStore.state.userList).length > 1){
        tipamount = totalrain / (Object.keys(chatStore.state.userList).length - 1);
        _.values(chatStore.state.userList).map(function(u) {
            if (u.uname != worldStore.state.user.uname)
              {
                tiplist.push(u.uname);
              }
        })

      }else {
        error = "NOT ENOUGH USERS TO RAIN";
        tipamount = 0;
      }
      if (balance < totalrain){
        error = "BALANCE TOO LOW TO RAIN";
        tipamount = 0;
      }
      else if (balance < tipamount){
          error = "BALANCE TOO LOW TO FINISH RAINING";
          tipamount = 0;
        }
      else if (tipamount < 100){
           if ((coin_type_send == 'BITS')||(coin_type_send == 'BTC')){ 
              error = worldStore.state.coin_type === 'BITS' ? "MUST SEND MORE THAN 1 BIT TO EACH USER" : "MUST SEND MORE THAN 0.000001 BTC TO EACH USER";
              tipamount = 0;
           }else if (coin_type_send == 'DOGE'){
             if (tipamount < 1){
               error = 'MUST SEND MORE THAN 1 DOGE TO EACH USER';
               tipamount = 0;
             }
           }else if (coin_type_send == 'BXO'){
            if (tipamount < 0.1){
              error = 'MUST SEND MORE THAN 0.1 BXO TO EACH USER';
              tipamount = 0;
            }
          }else if (coin_type_send == 'CLAM'){
            if (tipamount < 0.00001){
              error = 'MUST SEND MORE THAN 0.00001 CLAM TO EACH USER';
              tipamount = 0;
            }
          }else{
             error = 'MUST SEND MORE THAN 0.000001 ' + coin_type_send + ' TO EACH USER';
           }
        }

      // send tip to moneypot
      if ((!error) && (tipamount > 0)){

        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text: "Sending Rain to Users", created_at: d.toJSON(),user:{role: "BOT", uname: "RAINBOT"} });

        tipto = tiplist[self.state.sent_to];

        var params = {
            amount: totalrain,
            type: coin_type_send
          };
        socket.emit('send_rain', params, function(err, data) {
            if (err) {
              console.log('[socket] send_rain error:', err);
              Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:err, created_at: d.toJSON(),user:{role: "BOT", uname: "ERROR"}});
              return;
            }
            switch(coin_type_send){
              case 'BITS':
              case 'BTC':
                Dispatcher.sendAction('UPDATE_USER', { balances: {btc: worldStore.state.user.balances.btc - totalrain}});
                break;
              case 'LTC':
              Dispatcher.sendAction('UPDATE_USER', { balances: {ltc: worldStore.state.user.balances.ltc - totalrain}});
              break;
              case 'DASH':
              Dispatcher.sendAction('UPDATE_USER', { balances: {dash: worldStore.state.user.balances.dash - totalrain}});
              break;
              case 'ADK':
              Dispatcher.sendAction('UPDATE_USER', { balances: {adk: worldStore.state.user.balances.adk - totalrain}});
              break;
              case 'GRLC':
              Dispatcher.sendAction('UPDATE_USER', { balances: {grlc: worldStore.state.user.balances.grlc - totalrain}});
              break;
              case 'FLASH':
              Dispatcher.sendAction('UPDATE_USER', { balances: {flash: worldStore.state.user.balances.flash - totalrain}});
              break;
              case 'ETH':
              Dispatcher.sendAction('UPDATE_USER', { balances: {eth: worldStore.state.user.balances.eth - totalrain}});
              break;
              case 'MBI':
              Dispatcher.sendAction('UPDATE_USER', { balances: {mbi: worldStore.state.user.balances.mbi - totalrain}});
              break;
              case 'WAVES':
              Dispatcher.sendAction('UPDATE_USER', { balances: {waves: worldStore.state.user.balances.waves - totalrain}});
              break;
              case 'DOGE':
              Dispatcher.sendAction('UPDATE_USER', { balances: {doge: worldStore.state.user.balances.doge - totalrain}});
              break;
              case 'BXO':
              Dispatcher.sendAction('UPDATE_USER', { balances: {bxo: worldStore.state.user.balances.bxo - totalrain}});
              break;
              case 'CLAM':
              Dispatcher.sendAction('UPDATE_USER', { balances: {clam: worldStore.state.user.balances.clam - totalrain}});
              break;
            }
           
            console.log('Successfully sent rain:', data);

          });

      }else {
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:error, created_at: d.toJSON(),user:{role: "BOT", uname: "ERROR"}});
      }

    });

    function changeCSS(cssFile, cssLinkIndex) {
      var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);
      var newlink = document.createElement("link");
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", cssFile);
      document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
      }

    Dispatcher.registerCallback('PARSE_COMMAND',function(text){
      var error = null;
      var tipres = text.split(" ");
      var totalrain;
      var d = new Date();
      var coin_type_send = tipres[2];


      if (text.substring(0, 4) == "/tip") {
        Dispatcher.sendAction('SEND_TIP',text);
      }
      else if (text.substring(0, 5) == "/rain"){
        self.state.sent_to = 0;
        Dispatcher.sendAction('SEND_RAIN',text);
      }else if (text.substring(0, 6) == "/light"){
        changeCSS('https://bootswatch.com/sandstone/bootstrap.min.css', 0);
      }
      else if (text.substring(0, 5) == "/dark"){
        changeCSS('https://bootswatch.com/cyborg/bootstrap.min.css', 0);
      }
      else if (text.substring(0, 5) == "/help"){
        text = "Commands Available:";
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "BOT", uname: "HELP"} });
        text = "/tip [user] [amount] [type]";
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "BOT", uname: "HELP"} });
        text = "/rain [amount] [type]";
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "BOT", uname: "HELP"} });
        text = "/light and /dark";
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "BOT", uname: "HELP"} });
        text = "/pm [user] [message]";
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:text, created_at: d.toJSON(),user:{role: "BOT", uname: "HELP"} });
      }else if (text.substring(0, 7) == "/ignore"){
        chat_ignorelist.push(tipres[1]);
        localStorage.setItem('ignorelist', chat_ignorelist);
        Dispatcher.sendAction('NEW_MESSAGE', {channel: "lobby", text:'Ignoring: ' + tipres[1], created_at: d.toJSON(),user:{role: "BOT", uname: "SYSTEM"}});
      }
      else {  // SEND lINE MESSAGE IF COMMAND NOT RECOGNIZED
        console.log('Chat Command Not Recognized');
        self.state.waitingForServer = true;
        self.emitter.emit('change', self.state);
        socket.emit('new_message', { text: text }, function(err) {
          if (err) {
            alert('Chat Error: ' + err);
          }
        });
      }
    });

});


var firstseed = Math.floor(Math.random()*(Math.pow(2,32)-1));

if (localStorage.ROW1){
  var storedpaytables = {
  'ROW1': [],//localStorage.ROW1.split(","),
  'ROW2': [],//localStorage.ROW2.split(","),
  'ROW3': [],//localStorage.ROW3.split(","),
  'ROW4': [],//localStorage.ROW4.split(","),
  'ROW5': []//localStorage.ROW5.split(",")
  };

  var temphold = localStorage.ROW1.split(",");
  temphold.map(function(n){storedpaytables.ROW1.push(parseFloat(n));});
  if (helpers.payTableToEdge(storedpaytables.ROW1) < 1.00){
    storedpaytables.ROW1 = [2, 1.9, 1.8, 1.54, 1.45, 1.2, 1, 0.9, 0.8, 0.9, 1, 1.2, 1.45, 1.53, 1.8, 1.9, 2];
  }
  
  temphold = localStorage.ROW2.split(",");
  temphold.map(function(n){storedpaytables.ROW2.push(parseFloat(n));});
  if (helpers.payTableToEdge(storedpaytables.ROW2) < 1.00){
    storedpaytables.ROW2 = [3, 1.5, 1.4, 1.31, 1.19, 0.2, 1.1, 1.1, 1.1, 1.1, 1.1, 0.2, 1.19, 1.31, 1.4, 1.5, 3];
  }
  temphold = localStorage.ROW3.split(",");
  temphold.map(function(n){storedpaytables.ROW3.push(parseFloat(n));});
  if (helpers.payTableToEdge(storedpaytables.ROW3) < 1.00){
    storedpaytables.ROW3 = [23, 9, 3, 2, 1.5, 1.2, 1.1, 1, 0.4, 1, 1.1, 1.2, 1.5, 2, 3, 9, 23];
  }
  temphold = localStorage.ROW4.split(",");
  temphold.map(function(n){storedpaytables.ROW4.push(parseFloat(n));});
  if (helpers.payTableToEdge(storedpaytables.ROW4) < 1.00){
    storedpaytables.ROW4 = [121, 47, 13, 5, 2.98, 1.4, 1, 0.5, 0.3, 0.5, 1, 1.4, 2.99, 5, 13, 47, 121];
  }
  temphold = localStorage.ROW5.split(",");
  temphold.map(function(n){storedpaytables.ROW5.push(parseFloat(n));});
  if (helpers.payTableToEdge(storedpaytables.ROW5) < 1.00){
    storedpaytables.ROW5 = [999, 100, 25, 5, 1.46, 0, 1.1, 1.1, 0, 1.1, 1.1, 0, 1.45, 5, 25, 100, 999];
  }

}else {
    var storedpaytables = {
    'ROW1': [2, 1.9, 1.8, 1.54, 1.45, 1.2, 1, 0.9, 0.8, 0.9, 1, 1.2, 1.45, 1.53, 1.8, 1.9, 2],
    'ROW2': [3, 1.5, 1.4, 1.31, 1.19, 0.2, 1.1, 1.1, 1.1, 1.1, 1.1, 0.2, 1.19, 1.31, 1.4, 1.5, 3],
    'ROW3': [23, 9, 3, 2, 1.5, 1.2, 1.1, 1, 0.4, 1, 1.1, 1.2, 1.5, 2, 3, 9, 23],
    'ROW4': [121, 47, 13, 5, 2.98, 1.4, 1, 0.5, 0.3, 0.5, 1, 1.4, 2.99, 5, 13, 47, 121],
    'ROW5': [999, 100, 25, 5, 1.46, 0, 1.1, 1.1, 0, 1.1, 1.1, 0, 1.45, 5, 25, 100, 999]
  };
}

if (localStorage.TABLE4){
  var storedpaytables_slots = {
    'TABLE1': [200, 100, 90, 75, 40, 25, 15, 15, 10, 10, 20, 10, 4, 1],
    'TABLE2': [50, 50, 40, 40, 40, 25, 25, 20, 10, 10, 30, 20, 4, 2],
    'TABLE3': [300, 60, 60, 50, 40, 25, 15, 15, 10, 5, 20, 10, 4, 1],
    'TABLE4': []//localStorage.ROW5.split(",")
  };

  var temphold = localStorage.TABLE4.split(",");
  temphold.map(function(n){storedpaytables_slots.TABLE4.push(parseFloat(n));});

}else {
    var storedpaytables_slots = {
      'TABLE1': [200, 100, 90, 75, 40, 25, 15, 15, 10, 10, 20, 10, 4, 1],
      'TABLE2': [50, 50, 40, 40, 40, 25, 25, 20, 10, 10, 30, 20, 4, 2],
      'TABLE3': [300, 60, 60, 50, 40, 25, 15, 15, 10, 5, 20, 10, 4, 1],
      'TABLE4': [200, 100, 90, 75, 40, 25, 15, 15, 10, 10, 20, 10, 4, 1]
  };
}

function randomUint32() {
  if (window && window.crypto && window.crypto.getRandomValues && Uint32Array) {
      var o = new Uint32Array(1);
      window.crypto.getRandomValues(o);
      return o[0];
  } else {
      console.warn('Falling back to pseudo-random client seed');
      return Math.floor(Math.random() * Math.pow(2, 32));
  }
}

var betStore = new Store('bet', {
  nextHash: undefined,
  lastHash: undefined,
  lastSalt: undefined,
  lastSecret: undefined,
  lastSeed: undefined,
  lastid: undefined,
  raw_outcome: undefined,
  wager: {
    str: '0.000001',
    num: 0.000001,
    error: undefined
  },
  ChanceInput: {
    str: '49.5000',
    num: 49.5000,
    error: undefined
  },
  multiplier: {
    str: '2.0000',
    num: 2.0000,
    error: undefined
  },
  clientSeed: {
    num: firstseed,
    str: firstseed.toString(),
    error:null
  },
  randomseed: false,
  pay_tables: storedpaytables,
  slots_tables: storedpaytables_slots,
  house_edge: config.house_edge,
  hotkeysEnabled: false,
  betVelocity: 150,
  rt_Outcome:{
    str: '14',
    num: 14,
    background: '#B50B32'
  },
  rt_TotalWager: 0,
  rt_ChipSize: 1,
  RollHistory:[3,21,1,26,16,0,8,23,7,10,0,16,5,24,13,18,3],
  rt_stats:[2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7,2.7],
  BombSelect: 5,
  BS_Game:{
    state: 'STOP',
    bombs: 5,
    cleared: 0,
    stake: 100, //in sats
    next: 100, //in sats
  },
  bc_start_multi: {
    str: '1.01',
    num: 1.01,
    error: undefined
  },
  bc_step_size: {
    str: '0.01',
    num: 0.01,
    error: undefined
  },
  bc_stop_multi: {
    str: '5.00',
    num: 5.00,
    error: undefined
  },
  bc_target_direction: '<',
  bc_game_running: false,
  bc_multi: 1.01,
  bc_wager: 1.00,
  bc_base: 1.00,
  bitclimber_delay:undefined,
  bc_game_runout_en:true,
  bc_game_runout:false,
  sliderPos: 75.0000,
  sliderStart:50.0000,
  sliderEnd: 100.0000,
  sliderPos2: 25.0000,
  sliderStart2: 0.0000,
  sliderEnd2: 50.0000,
  activesliders: 2,
  wagerW2: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW4: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW8: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW16: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW24: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW48: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
  wagerW48b: {
    str: '0.000000',
    num: 0.000000,
    error: undefined
  },
}, function() {
  var self = this;

  Dispatcher.registerCallback('UPDATE_SLIDER_POS', function(newPos) {
    //self.state.sliderPos = newPos;
    var position = newPos;
    var winProb = helpers.multiplierToWinProb(betStore.state.multiplier.num);
    var range = ((winProb * - 100)*-1).toFixed(4);
    var rangesplit;

    if(self.state.activesliders == 1){
    rangesplit = range/2;


    if (position < rangesplit){
      position = rangesplit;
    }else if (position > (100 - rangesplit)){
      position = 100 - rangesplit;
    }

    self.state.sliderStart = (position - rangesplit).toFixed(4);
    self.state.sliderEnd =  (position + rangesplit).toFixed(4);
    self.state.sliderPos = position;
  }else{
    rangesplit = range/4;

    if (position[0] < rangesplit){ //CHECK MIN
      position[0] = rangesplit;
    }else if (position[0] > (100 - (rangesplit * 3))){ //CHECK MAX
      position[0] = 100 - (rangesplit * 3);
      position[1] = 100 - rangesplit;
    }else if((position[0] + rangesplit) > (position[1] - rangesplit)){ //CHECK INTERFERANCE
      if (position[1] >= (100 - rangesplit)){
        position[0] = 100 - (rangesplit * 3);
        position[1] = 100 - rangesplit;
      }else {
        position[1] = position[0] + (rangesplit * 2);
        if (position[1] > (100 - rangesplit)){
          position[1] = 100 - rangesplit;
          position[0] = 100 - (rangesplit * 3);
        }
      }
    }

    if (position[1] > (100 - rangesplit)){
      position[1] = 100 - rangesplit;
    }
    self.state.sliderStart = (position[0] - rangesplit).toFixed(4);
    self.state.sliderEnd =  (position[0] + rangesplit).toFixed(4);
    self.state.sliderPos = position[0];
    self.state.sliderStart2 = (position[1] - rangesplit).toFixed(4);
    self.state.sliderEnd2 =  (position[1] + rangesplit).toFixed(4);
    self.state.sliderPos2 = position[1];

  }
    self.emitter.emit('slider_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_SLIDER_COUNT', function(new_count) {
    //self.state.sliderPos = newPos;
    self.state.activesliders = new_count;

    if (self.state.activesliders == 2){
      var position1 = 25;
      var position2 = 75;
      var winProb = helpers.multiplierToWinProb(betStore.state.multiplier.num);
      var range = ((winProb * - 100)*-1).toFixed(4);
      var rangesplit = range/4;

      if (position1 < rangesplit){
        position1 = rangesplit;
      }else if (position1 > (100 - rangesplit)){
        position1 = 100 - rangesplit;
      }

      if (position2 < rangesplit){
        position2 = rangesplit;
      }else if (position2 > (100 - rangesplit)){
        position2 = 100 - rangesplit;
      }

      self.state.sliderStart = (position1 - rangesplit).toFixed(4);
      self.state.sliderEnd =  (position1 + rangesplit).toFixed(4);
      self.state.sliderPos = position1;

      self.state.sliderStart2 = (position2 - rangesplit).toFixed(4);
      self.state.sliderEnd2 = (position2 + rangesplit).toFixed(4);
      self.state.sliderPos2 = position2;
    }else {
      self.state.activesliders = 1; //SANITY CHECK;
      var position = 50;
      var winProb = helpers.multiplierToWinProb(betStore.state.multiplier.num);
      var range = ((winProb * - 100)*-1).toFixed(4);
      var rangesplit = range/2;

      if (position < rangesplit){
        position = rangesplit;
      }else if (position > (100 - rangesplit)){
        position = 100 - rangesplit;
      }

      self.state.sliderStart = (position - rangesplit).toFixed(4);
      self.state.sliderEnd =  (position + rangesplit).toFixed(4);
      self.state.sliderPos = position;
    //  self.state.sliderStart2 = undefined;
    //  self.state.sliderEnd2 = undefined;
    //  self.state.sliderPos2 = undefined;
    }
    self.emitter.emit('change', self.state);
    self.emitter.emit('slider_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_BC_START_MULTI', function(newMult) {
    self.state.bc_start_multi = _.merge({}, self.state.bc_start_multi, newMult);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_BC_STEP_SIZE', function(newMult) {
    self.state.bc_step_size = _.merge({}, self.state.bc_step_size, newMult);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_BC_STOP_MULTI', function(newMult) {
    self.state.bc_stop_multi = _.merge({}, self.state.bc_stop_multi, newMult);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_BC_TARGET', function() {
    if (self.state.bc_target_direction == '<'){
      self.state.bc_target_direction = '>';
    }else {
      self.state.bc_target_direction = '<';
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('START_BITCLIMBER', function() {
    self.state.bc_game_running = true;
    self.state.bc_multi = self.state.bc_start_multi.num;
    self.state.bc_wager = self.state.wager.num;
    self.state.bc_base = self.state.wager.num;
    self.state.bc_game_runout = false;
    data2 = undefined;

    data2 = {
        labels: labelfill(1),//labelfill(config.bet_buffer_size),//['a','b','c','d'],
        datasets: [ {
                label: "dataset1",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
                pointColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: bcbasefill2(1)//rand(-32, 1000, 50)
              } ]
    };

    //Place_BitClimber_Bet();
    self.state.bitclimber_delay = setTimeout(Place_BitClimber_Bet(), 250);
    self.emitter.emit('change', self.state);
    self.emitter.emit('BitClimber_change', self.state);
  });

  Dispatcher.registerCallback('STOP_BITCLIMBER', function() {
    self.state.bc_game_running = false;
    clearTimeout(self.state.bitclimber_delay);
    self.emitter.emit('change', self.state);
    self.emitter.emit('BitClimber_change', self.state);
  });

  Dispatcher.registerCallback('CASH_OUT_BITCLIMBER', function() {
    //self.state.bc_game_running = false;
    //clearTimeout(self.state.bitclimber_delay);
    self.state.bc_game_runout = true;

    self.emitter.emit('change', self.state);
    self.emitter.emit('BitClimber_change', self.state);
  });

  Dispatcher.registerCallback('NEW_BC_DATAPOINT', function(newnum) {
    data2.labels.push(' ');
    data2.datasets[0].data.push(newnum);
    self.emitter.emit('BitClimber_change', self.state);
  });

  Dispatcher.registerCallback('BITCLIMBER_FUNCTION', function(bet) {
    var num = Number(self.state.bc_multi) + Number(self.state.bc_start_multi.num - 1);//self.state.bc_step_size.num;
    self.state.bc_multi = num.toFixed(2);//+= self.state.bc_step_size.num;
    var wager = helpers.convCoinTypetoSats(self.state.bc_wager)
    wager += bet.profit;

    if ((self.state.bc_multi > self.state.bc_stop_multi.num)||(self.state.bc_game_running == false)){
      if (self.state.bc_game_runout_en){
        self.state.bc_game_runout = true;
        if ((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')||(worldStore.state.coin_type == 'CLAM')){
          self.state.bc_wager = helpers.convSatstoCointype(0.000001);
        }else{
          self.state.bc_wager = helpers.convSatstoCointype(1);
        } 
        if (self.state.bc_game_running == true){
          self.state.bitclimber_delay = setTimeout(Place_BitClimber_Bet(), 250);
        }else {
          Dispatcher.sendAction('STOP_BITCLIMBER');
        }
      }else{
      Dispatcher.sendAction('STOP_BITCLIMBER');
      if (AutobetStore.state.Run_Autobet){
        if(config.debug){console.log('Auto_bet routine enabled');}
        Dispatcher.sendAction('AUTOBET_ROUTINE',bet);
      }
      }

    }else {
      self.state.bc_wager = helpers.convSatstoCointype(wager);
      self.state.bitclimber_delay = setTimeout(Place_BitClimber_Bet(), 250);
    }
    self.emitter.emit('change', self.state);
    //self.emitter.emit('BitClimber_change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_BC_RUNOUT', function(){
    self.state.bc_game_runout_en = !self.state.bc_game_runout_en;
    if (self.state.bc_game_runout_en){
      console.log('runout_enabled');
    }else {
      console.log('runout_disabled');
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('SET_BOMBSELECT', function(num){
    if ((num > 0)&&(num < 25))
      {self.state.BombSelect = num;
        if ((num == 1)&&(self.state.house_edge > 0.039)){
          Dispatcher.sendAction('INC_HOUSE_EDGE');
        }
    self.emitter.emit('change', self.state);}

  });

  Dispatcher.registerCallback('START_BITSWEEP', function(){
    if ((self.state.BombSelect == 1)&&(self.state.house_edge > 0.039)){
      Dispatcher.sendAction('INC_HOUSE_EDGE');
    }
    self.state.BS_Game.state = 'RUNNING';
    self.state.BS_Game.bombs = self.state.BombSelect;
    self.state.BS_Game.cleared = 0;
    var chance = (25-self.state.BS_Game.bombs-self.state.BS_Game.cleared)/(25-self.state.BS_Game.cleared);
    self.state.BS_Game.stake = helpers.convCoinTypetoSats(self.state.wager.num);
    self.state.BS_Game.next = (self.state.BS_Game.stake * helpers.WinProbtoMultiplier(chance)) - self.state.BS_Game.stake;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('GET_NEXT_BITSWEEP', function(){
    self.state.BS_Game.cleared += 1;
    if (25-self.state.BS_Game.bombs-self.state.BS_Game.cleared <= 0){
      Dispatcher.sendAction('STOP_BITSWEEP');
    }
    else{
        var chance = (25-self.state.BS_Game.bombs-self.state.BS_Game.cleared)/(25-self.state.BS_Game.cleared);
        self.state.BS_Game.stake = self.state.BS_Game.stake + self.state.BS_Game.next;
        self.state.BS_Game.next = (self.state.BS_Game.stake * helpers.WinProbtoMultiplier(chance)) - self.state.BS_Game.stake;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('STOP_BITSWEEP', function(){
    self.state.BS_Game.state = 'STOP';
    self.state.BS_Game.stake = helpers.convCoinTypetoSats(self.state.wager.num);
    ShowAllBombs(self.state.BS_Game.cleared, self.state.BS_Game.bombs);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_RND_SEED', function(){
    self.state.randomseed = !self.state.randomseed;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_PAY_TABLES', function(data) {
    self.state.pay_tables.ROW1 = data.ROW1;
    self.state.pay_tables.ROW2 = data.ROW2;
    self.state.pay_tables.ROW3 = data.ROW3;
    self.state.pay_tables.ROW4 = data.ROW4;
    self.state.pay_tables.ROW5 = data.ROW5;
    //localStorage.paytables = self.state.pay_tables;

    localStorage.ROW1 = data.ROW1;
    localStorage.ROW2 = data.ROW2;
    localStorage.ROW3 = data.ROW3;
    localStorage.ROW4 = data.ROW4;
    localStorage.ROW5 = data.ROW5;
    self.emitter.emit('change_plinko', self.state);
    Dispatcher.sendAction('UPDATE_PLINKO');
  });

  Dispatcher.registerCallback('UPDATE_PAY_TABLES_SLOTS', function(data) {

    self.state.slots_tables.TABLE4 = data.TABLE4;

    localStorage.TABLE4 = data.TABLE4;
    self.emitter.emit('change_plinko', self.state);
    Dispatcher.sendAction('UPDATE_PLINKO');
  });
  ////////////
  Dispatcher.registerCallback('UPDATE_ROLLHISTORY', function(newroll){
    var color;
    self.state.RollHistory.shift();
    self.state.RollHistory.push(newroll);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_RT_STATS', function(stats){
    self.state.rt_stats = stats;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_CHIPSIZE', function(newsize){
    self.state.rt_ChipSize = newsize;//_.merge({}, self.state.rt_ChipSize, newsize);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_TOTALWAGER', function(newwager){
    self.state.rt_TotalWager = newwager;//_.merge({}, self.state.rt_TotalWager, newwager);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_RT_OUTCOME', function(newOutcome) {
    self.state.rt_Outcome = _.merge({}, self.state.rt_Outcome, newOutcome);
    var n = parseInt(self.state.rt_Outcome.str, 10);
    if (isNaN(n)) {

    } else {
      self.state.rt_Outcome.str = n;
      self.state.rt_Outcome.num = n;
    }

    switch(self.state.rt_Outcome.num){
      case 0:
        self.state.rt_Outcome.background = '#009901';
        break;
      case 1:
      case 3:
      case 5:
      case 7:
      case 9:
      case 12:
      case 14:
      case 16:
      case 18:
      case 19:
      case 21:
      case 23:
      case 25:
      case 27:
      case 30:
      case 32:
      case 34:
      case 36:
        self.state.rt_Outcome.background = '#B50B32';
        break;
      default:
        self.state.rt_Outcome.background = 'black';
        break;
      }
    self.emitter.emit('change', self.state);
  });
  ////////////
  Dispatcher.registerCallback('SET_HOUSE_EDGE', function(new_edge){ //worldStore.state.currGameTab
    var he_limit = 0.05;
    if ((worldStore.state.currGameTab == 'BITSWEEP')&&(self.state.BombSelect == 1)){
      he_limit = 0.039;
    }else {
      he_limit = 0.05;
    }

    if (new_edge < he_limit){
      if(new_edge >= 0.008){
          self.state.house_edge = new_edge;
        }else{
          self.state.house_edge = 0.008;
        }
      }else{
          self.state.house_edge = he_limit;
      }

    var winProb = helpers.multiplierToWinProb(self.state.multiplier.num);
    Dispatcher.sendAction('UPDATE_CHANCE_IN', {
            num: (winProb*100).toFixed(4),
            str: (winProb*100).toFixed(4).toString(),
            error: null
          });

    Dispatcher.sendAction('UPDATE_BANKROLL');
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_CLIENT_SEED', function(newSeed) {
    self.state.clientSeed = _.merge({}, self.state.clientSeed, newSeed);

    var n = parseInt(self.state.clientSeed.str, 10);

    // If n is a number, ensure it's at least 1
    if (isFinite(n)) {
      n = Math.max(n, 0);
      self.state.clientSeed.str = n.toString();
    }

    // Ensure clientSeed is a number
    if (isNaN(n) || /[^\d]/.test(n.toString())) {
      self.state.clientSeed.error = 'INVALID_SEED';
    // Ensure clientSeed is less than max seed
  } else if (n > 4294967295) {
      self.state.clientSeed.error = 'SEED_TOO_HIGH';
      self.state.clientSeed.num = n;
    } else {
      // clientSeed is valid
      self.state.clientSeed.error = null;
      self.state.clientSeed.str = n.toString();
      self.state.clientSeed.num = n;
    }

    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('SET_NEXT_HASH', function(hexString) {
    self.state.nextHash = hexString;
    next_hash = hexString;
    self.emitter.emit('change', self.state);
    self.emitter.emit('lastfair_change', self.state);
  });

  Dispatcher.registerCallback('SET_LAST_FAIR', function(last_params) {
    self.state.lastHash = last_params.hash;
    self.state.lastSalt = last_params.salt;
    self.state.lastSecret = last_params.secret;
    self.state.lastSeed = last_params.seed;
    self.state.lastid = last_params.id;
    self.emitter.emit('lastfair_change', self.state);
  });

  Dispatcher.registerCallback('CALC_RAW_OUTCOME',function(){
    self.state.raw_outcome = ((self.state.lastSecret+self.state.lastSeed) % 4294967296);
    self.emitter.emit('lastfair_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_LAST_HASH', function(str){
    self.state.lastHash = str;
    self.emitter.emit('lastfair_change', self.state);
  });
  Dispatcher.registerCallback('UPDATE_LAST_SALT', function(str){
    self.state.lastSalt = str;
    self.emitter.emit('lastfair_change', self.state);
  });
  Dispatcher.registerCallback('UPDATE_LAST_SECRET', function(str){
    self.state.lastSecret = str;
    self.emitter.emit('lastfair_change', self.state);
  });
  Dispatcher.registerCallback('UPDATE_LAST_SEED', function(str){
    self.state.lastSeed = str;
    self.emitter.emit('lastfair_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER', function(newWager) {
    self.state.wager = _.merge({}, self.state.wager, newWager);
    //console.log('UPDATE_WAGER');
    var n = parseFloat(self.state.wager.str, 10);

    var isFloatRegexp = /^(\d*\.)?\d+$/;
    if (worldStore.state.user){
      var balance = worldStore.state.user.balances.btc;
    }else{
      var balance = 0.00;
    }
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.btc;
        }
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.01){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n * 100 > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(2).toString();
          self.state.wager.num = n;
        }
        break;
      case 'BTC':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.btc;
        }
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'LTC':
          if (worldStore.state.user){
            balance = worldStore.state.user.balances.ltc;
          }
          if (isNaN(n)) {
            self.state.wager.error = 'INVALID_WAGER';
          // Ensure user can afford balance
          } else if (n < 0.00000001){
            self.state.wager.error = 'WAGER_TOO_LOW';
          } else if (helpers.getPrecision(n) > 8) {
            self.state.wager.error = 'WAGER_TOO_PRECISE';
          } else if (n / 0.00000001 > balance) {
            self.state.wager.error = 'CANNOT_AFFORD_WAGER';
            self.state.wager.num = n;
          } else {
            // wagerString is valid
            self.state.wager.error = null;
            self.state.wager.str = n.toFixed(8).toString();
            self.state.wager.num = n;
          }
          break;
          case 'DASH':
            if (worldStore.state.user){
              balance = worldStore.state.user.balances.dash;
            }
            if (isNaN(n)) {
              self.state.wager.error = 'INVALID_WAGER';
            // Ensure user can afford balance
            } else if (n < 0.00000001){
              self.state.wager.error = 'WAGER_TOO_LOW';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.wager.error = 'WAGER_TOO_PRECISE';
            } else if (n / 0.00000001 > balance) {
              self.state.wager.error = 'CANNOT_AFFORD_WAGER';
              self.state.wager.num = n;
            } else {
              // wagerString is valid
              self.state.wager.error = null;
              self.state.wager.str = n.toFixed(8).toString();
              self.state.wager.num = n;
            }
            break;
      case 'ADK':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.adk;
        }
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
      break;
      case 'GRLC':
      if (worldStore.state.user){
        balance = worldStore.state.user.balances.grlc;
      }
      if (isNaN(n)) {
        self.state.wager.error = 'INVALID_WAGER';
      // Ensure user can afford balance
      } else if (n < 0.00000001){
        self.state.wager.error = 'WAGER_TOO_LOW';
      } else if (helpers.getPrecision(n) > 8) {
        self.state.wager.error = 'WAGER_TOO_PRECISE';
      } else if (n / 0.00000001 > balance) {
        self.state.wager.error = 'CANNOT_AFFORD_WAGER';
        self.state.wager.num = n;
      } else {
        // wagerString is valid
        self.state.wager.error = null;
        self.state.wager.str = n.toFixed(8).toString();
        self.state.wager.num = n;
      }
    break;
    case 'FLASH':
    if (worldStore.state.user){
      balance = worldStore.state.user.balances.flash;
    }
    if (isNaN(n)) {
      self.state.wager.error = 'INVALID_WAGER';
    // Ensure user can afford balance
    } else if (n < 0.00000001){
      self.state.wager.error = 'WAGER_TOO_LOW';
    } else if (helpers.getPrecision(n) > 8) {
      self.state.wager.error = 'WAGER_TOO_PRECISE';
    } else if (n / 0.00000001 > balance) {
      self.state.wager.error = 'CANNOT_AFFORD_WAGER';
      self.state.wager.num = n;
    } else {
      // wagerString is valid
      self.state.wager.error = null;
      self.state.wager.str = n.toFixed(8).toString();
      self.state.wager.num = n;
    }
  break;
  case 'ETH':
  case 'MBI':
  case 'WAVES':
  if (worldStore.state.user){
    balance = worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()];
  }
  if (isNaN(n)) {
    self.state.wager.error = 'INVALID_WAGER';
  // Ensure user can afford balance
  } else if (n < 0.00000001){
    self.state.wager.error = 'WAGER_TOO_LOW';
  } else if (helpers.getPrecision(n) > 8) {
    self.state.wager.error = 'WAGER_TOO_PRECISE';
  } else if (n / 0.00000001 > balance) {
    self.state.wager.error = 'CANNOT_AFFORD_WAGER';
    self.state.wager.num = n;
  } else {
    // wagerString is valid
    self.state.wager.error = null;
    self.state.wager.str = n.toFixed(8).toString();
    self.state.wager.num = n;
  }
break;             
      case 'DOGE':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.doge;
        }
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
      case 'BXO':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.bxo;
        }
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;    
        case 'CLAM':
        if (worldStore.state.user){
          balance = worldStore.state.user.balances.clam;
        }
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > balance) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT', function(newWager) {
    self.state.wager = _.merge({}, self.state.wager, newWager);

    var n = parseFloat(self.state.wager.str, 10);

    var isFloatRegexp = /^(\d*\.)?\d+$/;

    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.01){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n * 100 > worldStore.state.user.balances.btc) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(2).toString();
          self.state.wager.num = n;
        }
        break;
      case 'BTC':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.btc) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'LTC':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.ltc) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'DASH':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.dash) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'ADK':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.adk) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'GRLC':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.grlc) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'FLASH':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances.flash) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.00000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n / 0.00000001 > worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()]) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.wager.num = n;
        }
        break;    
      case 'DOGE':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > worldStore.state.user.balances.doge) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(2).toString();
          self.state.wager.num = n;
        }
        break;
      case 'BXO':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > worldStore.state.user.balances.bxo) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(2).toString();
          self.state.wager.num = n;
        }
        break;
        case 'CLAM':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wager.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0.000001){
          self.state.wager.error = 'WAGER_TOO_LOW';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wager.error = 'WAGER_TOO_PRECISE';
        } else if (n > worldStore.state.user.balances.clam) {
          self.state.wager.error = 'CANNOT_AFFORD_WAGER';
          self.state.wager.num = n;
        } else {
          // wagerString is valid
          self.state.wager.error = null;
          //self.state.wager.str = n.toFixed(2).toString();
          self.state.wager.num = n;
        }
        break;    
    }
    self.emitter.emit('change', self.state);
  });

  //////////////WonderW
  Dispatcher.registerCallback('UPDATE_WAGER_SOFT2', function(newWager) {
    self.state.wagerW2 = _.merge({}, self.state.wagerW2, newWager);
    var n = parseFloat(self.state.wagerW2.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW2.error = null;
          self.state.wagerW2.num = n;
        }
        break;
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'ADK':
      case 'GRLC':
      case 'FLASH':
      case 'ETH':
      case 'MBI':
      case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW2.error = null;
          self.state.wagerW2.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW2.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW2.error = null;
          self.state.wagerW2.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT4', function(newWager) {
    self.state.wagerW4 = _.merge({}, self.state.wagerW4, newWager);
    var n = parseFloat(self.state.wagerW4.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW4.error = null;
          self.state.wagerW4.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW4.error = null;
          self.state.wagerW4.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW4.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW4.error = null;
          self.state.wagerW4.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT8', function(newWager) {
    self.state.wagerW8 = _.merge({}, self.state.wagerW8, newWager);
    var n = parseFloat(self.state.wagerW8.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW8.error = null;
          self.state.wagerW8.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW8.error = null;
          self.state.wagerW8.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW8.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW8.error = null;
          self.state.wagerW8.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT16', function(newWager) {
    self.state.wagerW16 = _.merge({}, self.state.wagerW16, newWager);
    var n = parseFloat(self.state.wagerW16.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW16.error = null;
          self.state.wagerW16.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW16.error = null;
          self.state.wagerW16.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW16.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW16.error = null;
          self.state.wagerW16.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT24', function(newWager) {
    self.state.wagerW24 = _.merge({}, self.state.wagerW24, newWager);
    var n = parseFloat(self.state.wagerW24.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW24.error = null;
          self.state.wagerW24.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW24.error = null;
          self.state.wagerW24.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW24.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW24.error = null;
          self.state.wagerW24.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT48', function(newWager) {
    self.state.wagerW48 = _.merge({}, self.state.wagerW48, newWager);
    var n = parseFloat(self.state.wagerW48.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48.error = null;
          self.state.wagerW48.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':
        if (isNaN(n)) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48.error = null;
          self.state.wagerW48.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW48.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48.error = null;
          self.state.wagerW48.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WAGER_SOFT48b', function(newWager) {
    self.state.wagerW48b = _.merge({}, self.state.wagerW48b, newWager);
    var n = parseFloat(self.state.wagerW48b.str, 10);
    var isFloatRegexp = /^(\d*\.)?\d+$/;
    switch(worldStore.state.coin_type){
      case 'BITS':
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48b.error = null;
          self.state.wagerW48b.num = n;
        }
        break;
        case 'BTC':
        case 'LTC':
        case 'DASH':
        case 'ADK':
        case 'GRLC':
        case 'FLASH':
        case 'ETH':
        case 'MBI':
        case 'WAVES':        
        if (isNaN(n)) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48b.error = null;
          self.state.wagerW48b.num = n;
        }
        break;
      case 'DOGE':
      case 'BXO':
      case 'CLAM':
        if (isNaN(n)) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        // Ensure user can afford balance
        } else if (n < 0){
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.wagerW48b.error = 'INVALID_WAGER';
        } else {
          // wagerString is valid
          self.state.wagerW48b.error = null;
          self.state.wagerW48b.num = n;
        }
        break;
    }
    self.emitter.emit('change', self.state);
  });


  /////
  Dispatcher.registerCallback('UPDATE_MULTIPLIER', function(newMult) {
    self.state.multiplier = _.merge({}, self.state.multiplier, newMult);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_CHANCE_IN', function(newChance) {
    self.state.ChanceInput = _.merge({}, self.state.ChanceInput, newChance);

   /* Dispatcher.sendAction('UPDATE_MULTIPLIER', {
        num: helpers.WinProbtoMultiplier(self.state.ChanceInput.num/100),
        str: helpers.WinProbtoMultiplier(self.state.ChanceInput.num/100).toFixed(4).toString(),
        error: null
      }); */

    self.emitter.emit('change', self.state);
  });

});


//var access_token = localStorage.access_token;
// The general store that holds all things until they are separated
// into smaller stores for performance.
var worldStore = new Store('world', {
  connection: 'DISCONNECTED',
  news_info: 'Welcome to Bit-Exo',
  input_2fa: '',
  login_name:'Enter Name',
  isLoading: true,
  user: undefined,
  auth_id:undefined,////////TODO CHECK
  accessToken: access_token,
  hotkeysEnabled: false,
  currTab: 'HELP',
  currGameTab: 'DICE',
  coin_type:'BTC',
  plinko_loaded: false,
  bitsweep_loaded: false,
  slots_loaded: false,
  roulette_loaded: false,
  bitclimber_loaded: false,
  sliders_loaded: false,
  poker_loaded: false,
  spnpoker_loaded : false,
  wonderw_loaded: false,
  ShowChart: false,
  btc_usd: 7175.00,
  btc_eur: 6082.00,
  first_bet: false,
  bets: new CBuffer(config.bet_buffer_size),
  allBets: new CBuffer(config.bet_buffer_size),
  LiveGraph: false,
  grecaptcha: undefined,
  bankroll: { 
              btc:{wagered:0,balance:0,invested:0},
              ltc:{wagered:0,balance:0,invested:0},
              dash:{wagered:0,balance:0,invested:0},
              adk:{wagered:0,balance:0,invested:0},
              grlc:{wagered:0,balance:0,invested:0},
              flash:{wagered:0,balance:0,invested:0},
              eth:{wagered:0,balance:0,invested:0},
              mbi:{wagered:0,balance:0,invested:0},
              waves:{wagered:0,balance:0,invested:0},
              bxo:{wagered:0,balance:0,invested:0},
              doge:{wagered:0,balance:0,invested:0},
              clam:{wagered:0,balance:0,invested:0}
            },
  bankrollbalance: 0.0,
  bankrollwagered: 0.0,
  bankrollinvested: 0.0,
  filterwager: {
    str: '0',
    num: 0.0,
    error: undefined
  },
  filterprofit: {
    str: '0',
    num: 0.0,
    error: undefined
  },
  filteruser: {
    str: 'User',
    error: undefined
  },
  filtergame: 'ALL GAMES',
  filtercurrency: 'ALL CURRENCY',
  revealed_balance: 0,
  showPayoutEditor: false,
  showClassic: true,
  currentAppwager: 0,
  jackpots:{
   /* jp_btc_low: 0,
    jp_btc_high: 0,
    jp_ltc_low: 0,
    jp_ltc_high: 0,
    jp_dash_low: 0,
    jp_dash_high: 0,
    jp_adk_low: 0,
    jp_adk_high: 0,
    jp_grlc_low: 0,
    jp_grlc_high: 0,
    jp_flash_low: 0,
    jp_flash_high: 0,
    jp_eth_low:0,
    jp_eth_high:0,
    jp_mbi_low:0,
    jp_mbi_high:0,
    jp_waves_low:0,
    jp_waves_high:0 */
    jp_doge_low: 0,
    jp_doge_high: 0,
    jp_bxo_low: 0,
    jp_bxo_high: 0,
    jp_clam_low: 0,
    jp_clam_high: 0
  },
  jackpotlist: {
   /* lowwins: new CBuffer(10),
    highwins: new CBuffer(10),
    lowwinsLTC: new CBuffer(10),
    highwinsLTC: new CBuffer(10),
    lowwinsDASH: new CBuffer(10),
    highwinsDASH: new CBuffer(10),
    lowwinsADK: new CBuffer(10),
    highwinsADK: new CBuffer(10),
    lowwinsGRLC: new CBuffer(10),
    highwinsGRLC: new CBuffer(10),
    lowwinsFLASH: new CBuffer(10),
    highwinsFLASH: new CBuffer(10), */
    lowwinsDOGE: new CBuffer(10),
    highwinsDOGE: new CBuffer(10),
    lowwinsBXO: new CBuffer(10),
    highwinsBXO: new CBuffer(10),
    lowwinsCLAM: new CBuffer(10),
    highwinsCLAM: new CBuffer(10)
  },
  /*
  jackpotdoge: 0,
  jackpotdogelist: [{
    _id:'1',
    id: '1',
    created_at: 'NO DATA        ',
    kind: 'DICE',
    uname: 'CouldbeYou',
    prize: 0,
    currency: 'DOGE'
  }],
  jackpotdoge2: 0,
  jackpotdogelist2: [{
    _id:'2',
    id: '2',
    created_at: 'NO DATA        ',
    kind: 'DICE',
    uname: 'CouldbeYou',
    prize: 0,
    currency: 'DOGE'
  }], */
  //TODO Expand for other currencies
  biggestwins: new CBuffer(10),
  biggestlosses: new CBuffer(10),
  biggestwagered: new CBuffer(11),
  biggestprofit: new CBuffer(10),
  biggestjackpots: new CBuffer(10),
  weeklydata: {},
  weeklydataLTC:{},
  weeklydataDASH:{},
  weeklydataADK:{},
  weeklydataGRLC:{},
  weeklydataFLASH:{},
  weeklydataETH:{},
  weeklydataMBI:{},
  weeklydataWAVES:{},
  weeklydatapoker: {},
  weeklydatadoge: {},
  weeklydataBXO: {},
  weeklydataCLAM:{},
  reftxdata: [{
               _id:'1',
               created_at:'NO DATA       ',
               amt:0,
               status:'PENDING'
             }],
  refwd: {
    str: '0',
    num: 0.0,
    error: undefined
  },
  referred_users:[],
  dicestats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  plinkostats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  Roulettestats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  bitsweepstats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  slotsstats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  BitClimberstats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  Slidersstats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  WonderWstats:{
    bets: 0,
    wins: 0,
    loss: 0,
    wager: 0,
    profit:0
  },
  activePucks: {},
  // Pucks to render
  // Remove from this when they're done animating
  renderedPucks: {},
  // Used to show the latest X bets in the My Bets tab
  pucks: new CBuffer(50),
  plinko_running: false,
  animate_enable: true,
  rt_spin_running: false,
  slots_table: 1,
  slots_paytable: [200,100,90,75,40,25,15,15,10,10,20,10,4,1],
  pkr:{
    Player: undefined,
    location:'Bit-Exo',
    avatar: 1,
    balance: undefined,
    gender: 'Male'
  },
  pkruname: {
    Player:'temp',
    error: undefined
  },
  pokertxdata: [{
               _id:'1',
               created_at:'NO DATA       ',
               amt:0,
               type:'DEP',
               status:'PENDING'
             }],
  pokertx: {
    str: '1',
    num: 1,
    error: undefined
  },
  isRefreshingpkr: false,
  poker_sessionKey: '',
  spingo1: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo2: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo3: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo4: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo5: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo6: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo7: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingo8: {
    entered:false,
    registered: 0,
    autoreg_en:false,
    autoreg_num: 0
  },
  spingodata: {
   games: undefined,
   lastgames:[{game:1, gameID: 'No Data', outcome:'0x', poolsize:0}],
   next_hash: 'x',
   last_hash: 'x',
   lastbet: undefined
  },
  playsounds: true,

  doge_invest_app: {
    invested: 0,
    wagered: 0,
    profit: 0,
    max_profit: 0
  },
  doge_invest_user: {
    invested: 0,
    wagered: 0,
    profit: 0,
    kelly: 0,
    share: 0,
    locktime: 0
  },
  doge_rec_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address'
  }],
  doge_send_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address',
    status: 'PENDING'
  }],
  doge_tips_data: [{
    created_at: 'No Data',
    amount: 0,
    sender: 'No Data',
    receiver: 'No Data'
  }],
  bxo_invest_app: {
    invested: 0,
    wagered: 0,
    profit: 0,
    max_profit: 0
  },
  bxo_invest_user: {
    invested: 0,
    wagered: 0,
    profit: 0,
    kelly: 0,
    share: 0,
    locktime: 0
  },
  bxo_rec_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address'
  }],
  bxo_send_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address',
    status: 'PENDING'
  }],
  bxo_tips_data: [{
    created_at: 'No Data',
    amount: 0,
    sender: 'No Data',
    receiver: 'No Data'
  }],
  clam_invest_app: {
    invested: 0,
    wagered: 0,
    profit: 0,
    max_profit: 0
  },
  clam_invest_user: {
    invested: 0,
    wagered: 0,
    profit: 0,
    kelly: 0,
    share: 0,
    locktime: 0
  },
  clam_rec_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address'
  }],
  clam_send_tx: [{
    created_at: 'No Data',
    amount: 0,
    txid: 'No ID',
    address: 'No Address',
    status: 'PENDING'
  }],
  clam_tips_data: [{
    created_at: 'No Data',
    amount: 0,
    sender: 'No Data',
    receiver: 'No Data'
  }],
  pkrstat:{
    Logins:0,
    FilledSeats:0,
    OccupiedTables:0,
    UpTime:'OFFLINE'
  },
  confirm_btc:false
}, function() {
  var self = this;
  Dispatcher.registerCallback('CONFIRM_BTC', function(){
    self.state.confirm_btc = true;
    self.emitter.emit('change', self.state);
  });
  Dispatcher.registerCallback('POKER_STATS', function(){
    if (socket){
      socket.emit('get_poker_status', function(err, data){
        if (!err){
          self.state.pkrstat = data;
        }else{
          self.state.pkrstat = {
            Logins:0,
            FilledSeats:0,
            OccupiedTables:0,
            UpTime:'OFFLINE'
          }
        }
        self.emitter.emit('change', self.state);
      });

    }else{
      self.state.pkrstat = {
        Logins:0,
        FilledSeats:0,
        OccupiedTables:0,
        UpTime:'OFFLINE'
      }
      self.emitter.emit('change', self.state);
    }
    
  });
  Dispatcher.registerCallback('Set_Connection', function(status){
    console.log('New Conn status: ' + status);
    self.state.connection = status;
    self.emitter.emit('change', self.state);
  });
  Dispatcher.registerCallback('Set_Accesstoken', function(newtoken){
    self.state.accessToken = newtoken;
  });
  Dispatcher.registerCallback('GET_DOGE_INVESTMENTS', function(){
    if (config.debug){console.log('Getting Doge Investments');}
    if (socket){
      socket.emit('get_doge_investments', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success getting doge investments', data);}
          if (data){
            if(data.app){
              self.state.doge_invest_app = data.app;
            } 
            if (data.user){
              self.state.doge_invest_user = data.user;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error get_doge_investments', err);
        }
      });
    }
    
  }); 
  
  Dispatcher.registerCallback('GET_BXO_INVESTMENTS', function(){
    if (config.debug){console.log('Getting BXO Investments');}
    if (socket){
      socket.emit('get_bxo_investments', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success getting bxo investments', data);}
          if (data){
            if(data.app){
              self.state.bxo_invest_app = data.app;
            } 
            if (data.user){
              self.state.bxo_invest_user = data.user;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error get_bxo_investments', err);
        }
      });
    }
  });

  Dispatcher.registerCallback('GET_CLAM_INVESTMENTS', function(){
    if (config.debug){console.log('Getting CLAM Investments');}
    if (socket){
      socket.emit('get_clam_investments', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success getting clam investments', data);}
          if (data){
            if(data.app){
              self.state.clam_invest_app = data.app;
            } 
            if (data.user){
              self.state.clam_invest_user = data.user;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error get_clam_investments', err);
        }
      });
    }
  });

  Dispatcher.registerCallback('GET_TX_HISTORY', function(){
    if (config.debug){console.log('Getting doge tx history');}
    if (socket){
      socket.emit('Get_Doge_Tx', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success Get_Doge_Tx', data);}
          if (data){
            if ((data.rec_tx) && (data.rec_tx != 'NO DATA')){
              self.state.doge_rec_tx = data.rec_tx;
            }
            if ((data.send_tx) && (data.send_tx != 'NO DATA')){
              self.state.doge_send_tx = data.send_tx;
            }
            if ((data.tip_data) && (data.tip_data != 'NO DATA')){
              self.state.doge_tips_data = data.tip_data;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error Get_Doge_Tx', err);
        }
      });
    }
  }); 

  Dispatcher.registerCallback('GET_BXO_TX_HISTORY', function(){
    if (config.debug){console.log('Getting bxo tx history');}
    if (socket){
      socket.emit('Get_BXO_Tx', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success Get_BXO_Tx', data);}
          if (data){
            if ((data.rec_tx) && (data.rec_tx != 'NO DATA')){
              self.state.bxo_rec_tx = data.rec_tx;
            }
            if ((data.send_tx) && (data.send_tx != 'NO DATA')){
              self.state.bxo_send_tx = data.send_tx;
            }
            if ((data.tip_data) && (data.tip_data != 'NO DATA')){
              self.state.bxo_tips_data = data.tip_data;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error Get_bxo_Tx', err);
        }
      });
    }
  });

  Dispatcher.registerCallback('GET_CLAM_TX_HISTORY', function(){
    if (config.debug){console.log('Getting clam tx history');}
    if (socket){
      socket.emit('Get_CLAM_Tx', function(err, data){
        if (!err){
          if (config.debug){console.log('[socket] success Get_CLAM_Tx', data);}
          if (data){
            if ((data.rec_tx) && (data.rec_tx != 'NO DATA')){
              self.state.clam_rec_tx = data.rec_tx;
            }
            if ((data.send_tx) && (data.send_tx != 'NO DATA')){
              self.state.clam_send_tx = data.send_tx;
            }
            if ((data.tip_data) && (data.tip_data != 'NO DATA')){
              self.state.clam_tips_data = data.tip_data;
            }
            self.emitter.emit('change', self.state);
          }
        }else{
          console.log('[socket] error Get_clam_Tx', err);
        }
      });
    }
  });
  
  Dispatcher.registerCallback('TOGGLE_MUTE',function(){
    self.state.playsounds = !self.state.playsounds;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('ENABLE_AUTOREG',function(game){
    console.log('Auto Reg: ' + game);
    switch(game){
      case 1:
        if (!!self.state.spingo1.autoreg_en){
          self.state.spingo1.autoreg_en = false;
        }else if (self.state.spingo1.autoreg_num > 0){
          self.state.spingo1.autoreg_en = true;
          if (self.state.spingo1.entered == false){
              $('#game-1')[0].click(); //id: 'bet-hi',
              self.state.spingo1.autoreg_num = self.state.spingo1.autoreg_num -1;
              if (self.state.spingo1.autoreg_num == 0){
                self.state.spingo1.autoreg_en = false;
              }
          }
        }
        break;
      case 2:
        if (!!self.state.spingo2.autoreg_en){
          self.state.spingo2.autoreg_en = false;
        }else if (self.state.spingo2.autoreg_num > 0){
          self.state.spingo2.autoreg_en = true;
          if (self.state.spingo2.entered == false){
            $('#game-2')[0].click(); //id: 'bet-hi',
              self.state.spingo2.autoreg_num = self.state.spingo2.autoreg_num -1;
              if (self.state.spingo2.autoreg_num == 0){
                self.state.spingo2.autoreg_en = false;
              }
          }

        }
        break;
      case 3:
        if (!!self.state.spingo3.autoreg_en){
          self.state.spingo3.autoreg_en = false;
        }else if (self.state.spingo3.autoreg_num > 0){
          self.state.spingo3.autoreg_en = true;
          if (self.state.spingo3.entered == false){
            $('#game-3')[0].click(); //id: 'bet-hi',
              self.state.spingo3.autoreg_num = self.state.spingo3.autoreg_num -1;
              if (self.state.spingo3.autoreg_num == 0){
                self.state.spingo3.autoreg_en = false;
              }
          }

        }
        break;
       case 4:
        if (!!self.state.spingo4.autoreg_en){
          self.state.spingo4.autoreg_en = false;
        }else if (self.state.spingo4.autoreg_num > 0){
          self.state.spingo4.autoreg_en = true;
          if (self.state.spingo4.entered == false){
            $('#game-4')[0].click(); //id: 'bet-hi',
              self.state.spingo4.autoreg_num = self.state.spingo4.autoreg_num -1;
              if (self.state.spingo4.autoreg_num == 0){
                self.state.spingo4.autoreg_en = false;
              }
          }

        }
        break;
       case 5:
        if (!!self.state.spingo5.autoreg_en){
          self.state.spingo5.autoreg_en = false;
        }else if (self.state.spingo5.autoreg_num > 0){
          self.state.spingo5.autoreg_en = true;
          if (self.state.spingo5.entered == false){
            $('#game-5')[0].click(); //id: 'bet-hi',
              self.state.spingo5.autoreg_num = self.state.spingo5.autoreg_num -1;
              if (self.state.spingo5.autoreg_num == 0){
                self.state.spingo5.autoreg_en = false;
              }
          }

        }
        break;
       case 6:
        if (!!self.state.spingo6.autoreg_en){
          self.state.spingo6.autoreg_en = false;
        }else if (self.state.spingo6.autoreg_num > 0){
          self.state.spingo6.autoreg_en = true;
          if (self.state.spingo6.entered == false){
            $('#game-6')[0].click(); //id: 'bet-hi',
              self.state.spingo6.autoreg_num = self.state.spingo6.autoreg_num -1;
              if (self.state.spingo6.autoreg_num == 0){
                self.state.spingo6.autoreg_en = false;
              }
          }

        }
        break;
       case 7:
        if (!!self.state.spingo7.autoreg_en){
          self.state.spingo7.autoreg_en = false;
        }else if (self.state.spingo7.autoreg_num > 0){
          self.state.spingo7.autoreg_en = true;
          if (self.state.spingo7.entered == false){
            $('#game-7')[0].click(); //id: 'bet-hi',
              self.state.spingo7.autoreg_num = self.state.spingo7.autoreg_num -1;
              if (self.state.spingo7.autoreg_num == 0){
                self.state.spingo7.autoreg_en = false;
              }
          }

        }
        break;
       case 8:
        if (!!self.state.spingo8.autoreg_en){
          self.state.spingo8.autoreg_en = false;
        }else if (self.state.spingo8.autoreg_num > 0){
          self.state.spingo8.autoreg_en = true;
          if (self.state.spingo8.entered == false){
            $('#game-8')[0].click(); //id: 'bet-hi',
              self.state.spingo8.autoreg_num = self.state.spingo8.autoreg_num -1;
              if (self.state.spingo8.autoreg_num == 0){
                self.state.spingo8.autoreg_en = false;
              }
          }

        }
        break;   
    }

    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('GET_POKER_ACCOUNT',function(){

    if(config.debug){  console.log('Emitting Socket for Get Poker Account');}
    if ((socket) && (self.state.user)){
      var params = {
        uname: worldStore.state.user.uname
      };
      socket.emit('get_poker_account', params, function(err, data) {
        if(config.debug){  console.log('Socket returned for Get Poker Account');}
        Dispatcher.sendAction('STOP_REFRESHING_POKER');
        if (err) {
          console.log('[socket] Get Poker Account failure:', err);
          return;
        }
        console.log('[socket] get_poker_account success:', data);

   //     Dispatcher.sendAction('UPDATE_POKER', bet.next_hash);
       if(data.Player != undefined){
         Dispatcher.sendAction('UPDATE_POKER', { Player: data.Player, balance: data.Balance, avatar: data.Avatar, location: data.Location, gender: data.Gender});
         if(config.debug){  console.log('Emitting Socket for get_session_key');}
          socket.emit('get_session_key', function(err, key) {
             if(config.debug){  console.log('Socket returned for get_session_key');}
               //self.setState({ waitingForServer: false });
             if (err) {
               console.log('[socket] get_session_key failure:', err);
               //self.setState({ waitingForServer: false });
               return;
             }
             console.log('[socket] get_session_key success:', key);
             //data.Player
             self.state.poker_sessionKey = key.SessionKey;
             self.emitter.emit('change', self.state);
          });
        }
      });
      Dispatcher.sendAction('GET_POKER_TX');
      
    }
    //self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('GET_SLOTSGO_DATA',function(){
      if(config.debug){  console.log('Emitting Socket for Spin Go Data');}
      socket.emit('get_slotsgo_data', function(err, data) {
        if (err){
          console.log('Socket Error get_slotsgo_data',err);
        }else{
          console.log('[socket] get slotsgo data success',data);
          self.state.spingodata = _.merge({}, self.state.spingodata, data);
          if (data.next_hash){
            self.state.spingodata.next_hash = data.next_hash;
          }
          if (data.games.game1.players != undefined){
          if (data.games.game1.players.length < 3){
              self.state.spingo1.registered = data.games.game1.players.length;
              for (var x = 0; x < data.games.game1.players.length; x++){
                if (data.games.game1.players[x] == self.state.user.pkruname){
                  self.state.spingo1.entered = true;
                }
              }        
            }else{
              self.state.spingo1.registered = 0;
              self.state.spingo1.entered = false;
            } 
          }else{
            self.state.spingo1.registered = 0;
            self.state.spingo1.entered = false;
          }
          if (data.games.game2.players != undefined){
          if (data.games.game2.players.length < 3){
              self.state.spingo2.registered = data.games.game2.players.length;
              for (var x = 0; x < data.games.game2.players.length; x++){
                if (data.games.game2.players[x] == self.state.user.pkruname){
                  self.state.spingo2.entered = true;
                }
              }        
            }else{
              self.state.spingo2.registered = 0;
              self.state.spingo2.entered = false;
            } 
          }else{
            self.state.spingo2.registered = 0;
            self.state.spingo2.entered = false;
          }
          if (data.games.game3.players != undefined){
          if (data.games.game3.players.length < 3){
              self.state.spingo3.registered = data.games.game3.players.length;
              for (var x = 0; x < data.games.game3.players.length; x++){
                if (data.games.game3.players[x] == self.state.user.pkruname){
                  self.state.spingo3.entered = true;
                }
              }        
            }else{
              self.state.spingo3.registered = 0;
              self.state.spingo3.entered = false;
            } 
          }else{
            self.state.spingo3.registered = 0;
            self.state.spingo3.entered = false;
          }
          if (data.games.game4.players != undefined){
          if (data.games.game4.players.length < 3){
              self.state.spingo4.registered = data.games.game4.players.length;
              for (var x = 0; x < data.games.game4.players.length; x++){
                if (data.games.game4.players[x] == self.state.user.pkruname){
                  self.state.spingo4.entered = true;
                }
              }        
            }else{
              self.state.spingo4.registered = 0;
              self.state.spingo4.entered = false;
            } 
          }else{
            self.state.spingo4.registered = 0;
            self.state.spingo4.entered = false;
          }
          if (data.games.game5.players != undefined){
          if (data.games.game5.players.length < 3){
              self.state.spingo5.registered = data.games.game5.players.length;
              for (var x = 0; x < data.games.game5.players.length; x++){
                if (data.games.game5.players[x] == self.state.user.pkruname){
                  self.state.spingo5.entered = true;
                }
              }        
            }else{
              self.state.spingo5.registered = 0;
              self.state.spingo5.entered = false;
            } 
          }else{
            self.state.spingo5.registered = 0;
            self.state.spingo5.entered = false;
          }
          if (data.games.game6.players != undefined){
          if (data.games.game6.players.length < 3){
              self.state.spingo6.registered = data.games.game6.players.length;
              for (var x = 0; x < data.games.game6.players.length; x++){
                if (data.games.game6.players[x] == self.state.user.pkruname){
                  self.state.spingo6.entered = true;
                }
              }        
            }else{
              self.state.spingo6.registered = 0;
              self.state.spingo6.entered = false;
            } 
          }else{
            self.state.spingo6.registered = 0;
            self.state.spingo6.entered = false;
          }
          if (data.games.game7.players != undefined){
          if (data.games.game7.players.length < 3){
              self.state.spingo7.registered = data.games.game7.players.length;
              for (var x = 0; x < data.games.game7.players.length; x++){
                if (data.games.game7.players[x] == self.state.user.pkruname){
                  self.state.spingo7.entered = true;
                }
              }        
            }else{
              self.state.spingo7.registered = 0;
              self.state.spingo7.entered = false;
            } 
          }else{
            self.state.spingo7.registered = 0;
            self.state.spingo7.entered = false;
          }
          if (data.games.game8.players != undefined){
          if (data.games.game8.players.length < 3){
              self.state.spingo8.registered = data.games.game8.players.length;
              for (var x = 0; x < data.games.game8.players.length; x++){
                if (data.games.game8.players[x] == self.state.user.pkruname){
                  self.state.spingo8.entered = true;
                }
              }        
            }else{
              self.state.spingo8.registered = 0;
              self.state.spingo8.entered = false;
            } 
          }else{
            self.state.spingo8.registered = 0;
            self.state.spingo8.entered = false;
          }
          self.emitter.emit('change', self.state);
        }
      });
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG1', function(num){
    if (num < 5){
        self.state.spingo1.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG2', function(num){
    if (num < 5){
        self.state.spingo2.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG3', function(num){
    if (num < 5){
        self.state.spingo3.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG4', function(num){
    if (num < 5){
        self.state.spingo4.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG5', function(num){
    if (num < 5){
        self.state.spingo5.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG6', function(num){
    if (num < 5){
        self.state.spingo6.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG7', function(num){
    if (num < 5){
        self.state.spingo7.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOREG8', function(num){
    if (num < 5){
        self.state.spingo8.autoreg_num = num;
    }else{
      console.log('num too big: ' + num);
    }
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_SLOTS_GO', function(data){
    
    console.log('New Slots n Go Update: ', data);
    
    //if (self.state.currGameTab == 'SPNPOKER'){
      if (data.bet){
        self.state.spingodata.last_hash = data.bet.hash;
        self.state.spingodata.next_hash = data.bet.next_hash;
        self.state.spingodata.lastbet = data.bet;
        if (data.bet.img != 12){
          var wheel1 = data.bet.img;
          var wheel2 = data.bet.img; 
        }else{
          var wheel1 = Math.floor(Math.random() * 11);
          var wheel2 = wheel1 + 3;
            if(wheel2 > 11){
              wheel2 = 1;
            }
        }
        spinswheelspkr(wheel1, wheel2, data.bet);
        for (var x = 0; x < data.game.players.length; x++){
          if (self.state.user){
            if (self.state.user.pkruname){
              if (self.state.user.pkruname == data.game.players[x]){
                if (!!self.state.playsounds){
                  var audio = new Audio('res/ding.mp3');
                  audio.play();
                }
                switch (data.game.game){
                  case 1:
                    self.state.spingo1.registered = 0;
                    self.state.spingo1.entered = false;
                    ;
                    if (self.state.spingo1.autoreg_en == true){
                        $('#game-1')[0].click(); //id: 'bet-hi',
                        self.state.spingo1.autoreg_num = self.state.spingo1.autoreg_num -1;
                        if (self.state.spingo1.autoreg_num == 0){
                          self.state.spingo1.autoreg_en = false;
                        }
                    }
                    break;
                  case 2:
                    self.state.spingo2.registered = 0;
                    self.state.spingo2.entered = false;
                    if (self.state.spingo2.autoreg_en == true){
                        $('#game-2')[0].click(); //id: 'bet-hi',
                        self.state.spingo2.autoreg_num = self.state.spingo2.autoreg_num -1;
                        if (self.state.spingo2.autoreg_num == 0){
                          self.state.spingo2.autoreg_en = false;
                        }
                    }
                    break;
                  case 3:
                    self.state.spingo3.registered = 0;
                    self.state.spingo3.entered = false;
                    if (self.state.spingo3.autoreg_en == true){
                        $('#game-3')[0].click(); //id: 'bet-hi',
                        self.state.spingo3.autoreg_num = self.state.spingo3.autoreg_num -1;
                        if (self.state.spingo3.autoreg_num == 0){
                          self.state.spingo3.autoreg_en = false;
                        }
                    }
                    break;
                  case 4:
                    self.state.spingo4.registered = 0;
                    self.state.spingo4.entered = false;
                    if (self.state.spingo4.autoreg_en == true){
                        $('#game-4')[0].click(); //id: 'bet-hi',
                        self.state.spingo4.autoreg_num = self.state.spingo4.autoreg_num -1;
                        if (self.state.spingo4.autoreg_num == 0){
                          self.state.spingo4.autoreg_en = false;
                        }
                    }
                    break;
                  case 5:
                    self.state.spingo5.registered = 0;
                    self.state.spingo5.entered = false;
                    if (self.state.spingo5.autoreg_en == true){
                        $('#game-5')[0].click(); //id: 'bet-hi',
                        self.state.spingo5.autoreg_num = self.state.spingo5.autoreg_num -1;
                        if (self.state.spingo5.autoreg_num == 0){
                          self.state.spingo5.autoreg_en = false;
                        }
                    }
                    break;
                  case 6:
                    self.state.spingo6.registered = 0;
                    self.state.spingo6.entered = false;
                    if (self.state.spingo6.autoreg_en == true){
                        $('#game-6')[0].click(); //id: 'bet-hi',
                        self.state.spingo6.autoreg_num = self.state.spingo6.autoreg_num -1;
                        if (self.state.spingo6.autoreg_num == 0){
                          self.state.spingo6.autoreg_en = false;
                        }
                    }
                    break;
                  case 7:
                    self.state.spingo7.registered = 0;
                    self.state.spingo7.entered = false;
                    if (self.state.spingo7.autoreg_en == true){
                        $('#game-7')[0].click(); //id: 'bet-hi',
                        self.state.spingo7.autoreg_num = self.state.spingo7.autoreg_num -1;
                        if (self.state.spingo7.autoreg_num == 0){
                          self.state.spingo7.autoreg_en = false;
                        }
                    }
                    break;
                  case 8:
                    self.state.spingo8.registered = 0;
                    self.state.spingo8.entered = false;
                    if (self.state.spingo8.autoreg_en == true){
                        $('#game-8')[0].click(); //id: 'bet-hi',
                        self.state.spingo8.autoreg_num = self.state.spingo8.autoreg_num -1;
                        if (self.state.spingo8.autoreg_num == 0){
                          self.state.spingo8.autoreg_en = false;
                        }
                    }
                    break;          
                }
              }
            }
          }
        } 
        self.state.spingodata.lastgames.push(data.game);
        if (self.state.spingodata.lastgames.length > 10){
            self.state.spingodata.lastgames.shift();
        }
      switch (data.game.game){
        case 1:
          self.state.spingodata.games.game1 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo1.registered = 0
          }else{
            self.state.spingo1.registered = data.game.players.length;          
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo1.entered = true;
                  }
                }
              }
            }

          }
          break;
        case 2:
          self.state.spingodata.games.game2 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo2.registered = 0
          }else{
            self.state.spingo2.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo2.entered = true;
                  }
                }
              }
            }
          }
          break;
        case 3:
          self.state.spingodata.games.game3 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo3.registered = 0
          }else{
            self.state.spingo3.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo3.entered = true;
                  }
                }
              }
            }
          }
          break;
          case 4:
          self.state.spingodata.games.game4 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo4.registered = 0
          }else{
            self.state.spingo4.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo4.entered = true;
                  }
                }
              }
            }
          }
          break;
          case 5:
          self.state.spingodata.games.game5 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo5.registered = 0
          }else{
            self.state.spingo5.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo5.entered = true;
                  }
                }
              }
            }
          }
          break;
          case 6:
          self.state.spingodata.games.game6 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo6.registered = 0
          }else{
            self.state.spingo6.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo6.entered = true;
                  }
                }
              }
            }
          }
          break;
          case 7:
          self.state.spingodata.games.game7 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo7.registered = 0
          }else{
            self.state.spingo7.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo7.entered = true;
                  }
                }
              }
            }
          }
          break;
          case 8:
          self.state.spingodata.games.game8 = data.game;
          if (data.game.players.length > 2){
            self.state.spingo8.registered = 0
          }else{
            self.state.spingo8.registered = data.game.players.length;
            for (var x = 0; x < data.game.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.game.players[x]){
                    self.state.spingo8.entered = true;
                  }
                }
              }
            }
          }
          break;
      }  
      }else{
        var isthere = false;
      switch (data.game){
        case 1:
          self.state.spingodata.games.game1 = data;
          if (data.players.length > 2){
            self.state.spingo1.registered = 0
          }else{
            self.state.spingo1.registered = data.players.length;          
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo1.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo1.entered = false;
            }
          }
          break;
        case 2:
          self.state.spingodata.games.game2 = data;
          if (data.players.length > 2){
            self.state.spingo2.registered = 0
          }else{
            self.state.spingo2.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo2.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo2.entered = false;
            }
          }
          break;
        case 3:
          self.state.spingodata.games.game3 = data;
          if (data.players.length > 2){
            self.state.spingo3.registered = 0
          }else{
            self.state.spingo3.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo3.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo3.entered = false;
            }
          }
          break;
          case 4:
          self.state.spingodata.games.game4 = data;
          if (data.players.length > 2){
            self.state.spingo4.registered = 0
          }else{
            self.state.spingo4.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo4.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo4.entered = false;
            }
          }
          break;
          case 5:
          self.state.spingodata.games.game5 = data;
          if (data.players.length > 2){
            self.state.spingo5.registered = 0
          }else{
            self.state.spingo5.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo5.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo5.entered = false;
            }
          }
          break;
          case 6:
          self.state.spingodata.games.game6 = data;
          if (data.players.length > 2){
            self.state.spingo6.registered = 0
          }else{
            self.state.spingo6.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo6.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo6.entered = false;
            }
          }
          break;
          case 7:
          self.state.spingodata.games.game7 = data;
          if (data.players.length > 2){
            self.state.spingo7.registered = 0
          }else{
            self.state.spingo7.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo7.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo7.entered = false;
            }
          }
          break;
          case 8:
          self.state.spingodata.games.game8 = data;
          if (data.players.length > 2){
            self.state.spingo8.registered = 0
          }else{
            self.state.spingo8.registered = data.players.length;
            for (var x = 0; x < data.players.length; x++){
              if (self.state.user){
                if (self.state.user.pkruname){
                  if (self.state.user.pkruname == data.players[x]){
                    self.state.spingo8.entered = true;
                    isthere = true;
                  }
                }
              }
            }
            if (isthere == false){
              self.state.spingo8.entered = false;
            }
          }
          break;
      }
    }
  // }
    

    self.emitter.emit('change', self.state);
    });


    Dispatcher.registerCallback('START_REFRESHING_POKER', function() {
    self.state.isRefreshingpkr = true;
    self.emitter.emit('change', self.state);

      Dispatcher.sendAction('GET_POKER_ACCOUNT');
    /*
    var Payload = {
      app_id: 588,
      access_token: worldStore.state.accessToken
    };
    socket.emit('access_token_data', Payload, function(err, data) {
      if (err) {
        console.log('Error access_token_data:', err);
        Dispatcher.sendAction('STOP_REFRESHING_USER');
        return;
      }
        if(config.debug){console.log('Successfully loaded user from access_token_data:', data);}
      if (data.auth != undefined){
      var user = data.auth.user;
      self.state.user = user;

      self.emitter.emit('change', self.state);
      self.emitter.emit('user_update');
      }*/
      //Dispatcher.sendAction('STOP_REFRESHING_POKER');
    //});

  });

  Dispatcher.registerCallback('STOP_REFRESHING_POKER', function() {
    self.state.isRefreshingpkr = false;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_POKER',function(data) {
      self.state.pkr = _.merge({}, self.state.pkr, data);
      self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_TEMP_POKER',function(data) {
    self.state.pkruname = _.merge({}, self.state.pkruname, data);

      //self.state.pkruname.Player.replaceAll("[^a-zA-Z0-9-_]","");

      if (self.state.pkruname.Player.length > 12){
        self.state.pkruname.error = 'NAME TOO LONG';
      }else if (self.state.pkruname.Player.length < 3) {
        self.state.pkruname.error = 'NAME TOO SHORT';
      }else{
        self.state.pkruname.error = undefined;
      }

      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('UPDATE_POKERTX', function(newamnt) {
      self.state.pokertx = _.merge({}, self.state.pokertx, newamnt);

      var n = parseInt(self.state.pokertx.str, 10);

      var isFloatRegexp = /^(\d*\.)?\d+$/;

      if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
        self.state.pokertx.error = 'INVALID_AMOUNT';
      } else if (n < 1){
        self.state.pokertx.error = 'INVALID_AMOUNT';
      } else if (helpers.getPrecision(n) > 0) {
        self.state.pokertx.error = 'INVALID_AMOUNT';
      } else {
        self.state.pokertx.error = null;
        self.state.pokertx.str = n.toString();
        self.state.pokertx.num = n;
      }
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('POKER_DEPOSIT',function(){
      var userbalance = self.state.user.balances.bxo;
      if(config.debug){  console.log('Emitting Socket for poker_deposit');}
      if ((socket) && (self.state.user) && (self.state.pokertx.num <= userbalance) && (!self.state.pokertx.error)){
          var params = {
            dep_amt: self.state.pokertx.num
          };
          socket.emit('poker_deposit', params, function(err, data) {
            if(config.debug){  console.log('Socket returned for poker_deposit');}
            if (err) {
              console.log('[socket] poker_deposit failure:', err);
              self.emitter.emit('change', self.state);
              return;
            }
            console.log('[socket] poker_deposit success:', data);
            self.state.user.balances.bxo = self.state.user.balances.bxo - data.amt;
            Dispatcher.sendAction('UPDATE_POKER', {balance: data.Balance});
            self.state.pokertxdata.push(data);
            if (self.state.pokertxdata.length > 10){
              self.state.pokertxdata.shift();
            }
            self.emitter.emit('change', self.state);
          });
        }
    });

    Dispatcher.registerCallback('REQ_POKER_WD',function(){
      var balance = self.state.pkr.balance;
      if(config.debug){  console.log('Emitting Socket for req_poker_wd');}
      if ((socket) && (self.state.user) && (self.state.pokertx.num <= balance) && (!self.state.pokertx.error)){
          var params = {
            wd_amt: self.state.pokertx.num
          };
          socket.emit('req_poker_wd', params, function(err, data) {
            if(config.debug){  console.log('Socket returned for poker_deposit');}
            if (err) {
              console.log('[socket] req_poker_wd failure:', err);
              self.emitter.emit('change', self.state);
              return;
            }
            console.log('[socket] req_poker_wd success:', data);
            Dispatcher.sendAction('UPDATE_POKER', {balance: data.Balance});
            if (data.status != 'PENDING'){
              self.state.user.balances.bxo += data.amt;
            }
            self.state.pokertxdata.push(data);
            if (self.state.pokertxdata.length > 10){
              self.state.pokertxdata.shift();
            }
            self.emitter.emit('change', self.state);
          });
        }
    });

    Dispatcher.registerCallback('GET_POKER_TX',function(){
      if(config.debug){  console.log('Emitting Socket for get_poker_tx');}
      if ((socket) && (self.state.user)){
          socket.emit('get_poker_tx', function(err, data) {
            if(config.debug){  console.log('Socket returned for get_poker_tx');}
            if (err) {
              console.log('[socket] get_poker_tx failure:', err);
              self.emitter.emit('change', self.state);
              return;
            }
            console.log('[socket] get_poker_tx success:', data);

            self.state.pokertxdata = data;
            self.emitter.emit('change', self.state);
          });
        }
    });

    Dispatcher.registerCallback('GET_SESSION_KEY',function(){
      if(config.debug){  console.log('Emitting Socket for get_poker_tx');}
      if ((socket) && (self.state.user)){
        if(config.debug){  console.log('Emitting Socket for get_session_key');}
        socket.emit('get_session_key', function(err, key) {
            if(config.debug){  console.log('Socket returned for get_session_key');}
              //self.setState({ waitingForServer: false });
            if (err) {
              console.log('[socket] get_session_key failure:', err);
              //self.setState({ waitingForServer: false });
              return;
            }
            console.log('[socket] get_session_key success:', key);
            //data.Player
            self.state.poker_sessionKey = key.SessionKey;
            self.emitter.emit('change', self.state);
        });
        }
    });

    Dispatcher.registerCallback('UPDATE_FAUCET_TIMER',function(){
      self.emitter.emit('faucet_timer_update', self.state);
    });

    Dispatcher.registerCallback('START_ROULETTE',function(){
      self.state.rt_spin_running = true;
    });

    Dispatcher.registerCallback('STOP_ROULETTE',function(){
      self.state.rt_spin_running = false;
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('UPDATE_NEWS_INFO', function(data) {

    self.state.news_info = data.text;
    self.emitter.emit('news_info_update', self.state);
    });

    Dispatcher.registerCallback('GET_NEWS_INFO', function() {

      if (socket){
        socket.emit('get_news_info', function(err, data) {
        if (err) {
          console.log('[socket] news info error:', err);
          return;
        }
        console.log('[socket] Successfully retrived news info', data);
        if (data[0]){
        self.state.news_info = data[0].text;
        }else{
        self.state.news_info = data.text;
        }
        self.emitter.emit('news_info_update', self.state);
        });
      }
    });

    Dispatcher.registerCallback('SET_REFER_NAME', function(refname) {
      //localStorage.refname = null;
      localStorage.removeItem('refname');
    socket.emit('set_ref_id',refname);
    });

    Dispatcher.registerCallback('GET_REF_TX',function(){

    if (socket){
      socket.emit('get_ref_tx', function(err, data) {
      if (err) {
        console.log('[socket] get_ref_tx error:', err);
        return;
      }
      console.log('[socket] get_ref_tx Successfully retrived data:', data);

      self.state.reftxdata = data;

      self.emitter.emit('change_ref_data', self.state);
      });
    }

    });

    Dispatcher.registerCallback('GET_REFERRED_USERS',function(){
    if (socket){
      socket.emit('get_user_refs',function(err,data){
        if (err) {
          console.log('[socket] get_user_refs error:', err);
          return;
        }
        console.log('[socket] get_user_refs Successfully retrived data:', data);

        self.state.referred_users = data;

        self.emitter.emit('change_ref_data', self.state);
      });
    }
    });

    Dispatcher.registerCallback('REQ_REF_WD',function(params){

    if (socket){

      console.log('[socket] sending withdraw request', params)

      socket.emit('request_ref_wd', params, function(err, data) {
      if (err) {
        console.log('[socket] request_ref_wd error:', err);
        alert('Error REF WTD: ' + JSON.stringify(err));
        return;
      }
      console.log('[socket] request_ref_wd Successfully sent request for wd: ', data);

      //self.state.reftxdata.push(data);
      Dispatcher.sendAction('GET_REF_TX', null);

      self.emitter.emit('change_ref_data', self.state);
      });
    }

    });

    Dispatcher.registerCallback('UPDATE_REF_WD', function(newamnt) {
    self.state.refwd = _.merge({}, self.state.refwd, newamnt);
    if (self.state.user){
      var balance = self.state.user.refprofit - self.state.user.refpaid;
    }else{
      var balance = 0;
    }
    var n = parseFloat(self.state.refwd.str, 10);

    var isFloatRegexp = /^(\d*\.)?\d+$/;

    switch(worldStore.state.coin_type){
      case 'BITS':
        if (self.state.user){
          balance = self.state.user.refprofit - self.state.user.refpaid;
        }else{
          var balance = 0;
        }
        if (isNaN(n) || !isFloatRegexp.test(n.toString())) {
          self.state.refwd.error = 'INVALID_AMT';
        // Ensure user can afford balance
        } else if (n < 500){
          self.state.refwd.error = 'INVALID_AMT';
        } else if (helpers.getPrecision(n) > 2) {
          self.state.refwd.error = 'INVALID_AMT';
        } else if (n * 100 > balance) {
          self.state.refwd.error = 'CANNOT_AFFORD';
          self.state.refwd.num = n;
        } else {
          // wagerString is valid
          self.state.refwd.error = null;
          //self.state.wager.str = n.toFixed(2).toString();
          self.state.refwd.num = n;
        }
        break;
      case 'BTC':
        if (self.state.user){
          balance = self.state.user.refprofit - self.state.user.refpaid;
        }else{
          var balance = 0;
        }
        if (isNaN(n)) {
          self.state.refwd.error = 'INVALID_AMT';
        // Ensure user can afford balance
        } else if (n < 0.0005){
          self.state.refwd.error = 'INVALID_AMT';
        } else if (helpers.getPrecision(n) > 8) {
          self.state.refwd.error = 'INVALID_AMT';
        } else if (n / 0.00000001 > balance) {
          self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
          self.state.refwd.num = n;
        } else {
          // wagerString is valid
          self.state.refwd.error = null;
          //self.state.wager.str = n.toFixed(8).toString();
          self.state.refwd.num = n;
        }
        break;
        case 'LTC':
          if (self.state.user){
            balance = self.state.user.refprofitLTC - self.state.user.refpaidLTC;
          }else{
            var balance = 0;
          }
          if (isNaN(n)) {
            self.state.refwd.error = 'INVALID_AMT';
          // Ensure user can afford balance
          } else if (n < 0.05){
            self.state.refwd.error = 'INVALID_AMT';
          } else if (helpers.getPrecision(n) > 8) {
            self.state.refwd.error = 'INVALID_AMT';
          } else if (n / 0.00000001 > balance) {
            self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
            self.state.refwd.num = n;
          } else {
            // wagerString is valid
            self.state.refwd.error = null;
            //self.state.wager.str = n.toFixed(8).toString();
            self.state.refwd.num = n;
          }
          break;
          case 'DASH':
            if (self.state.user){
              balance = self.state.user.refprofitDASH - self.state.user.refpaidDASH;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'ADK':
            if (self.state.user){
              balance = self.state.user.refprofitADK - self.state.user.refpaidADK;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'GRLC':
            if (self.state.user){
              balance = self.state.user.refprofitGRLC - self.state.user.refpaidGRLC;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'FLASH':
            if (self.state.user){
              balance = self.state.user.refprofitFLASH - self.state.user.refpaidFLASH;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'ETH':
            if (self.state.user){
              balance = self.state.user.refprofitETH - self.state.user.refpaidETH;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'MBI':
            if (self.state.user){
              balance = self.state.user.refprofitMBI - self.state.user.refpaidMBI;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'WAVES':
            if (self.state.user){
              balance = self.state.user.refprofitWAVES - self.state.user.refpaidWAVES;
            }else{
              var balance = 0;
            }
            if (isNaN(n)) {
              self.state.refwd.error = 'INVALID_AMT';
            // Ensure user can afford balance
            } else if (n < 0.01){
              self.state.refwd.error = 'INVALID_AMT';
            } else if (helpers.getPrecision(n) > 8) {
              self.state.refwd.error = 'INVALID_AMT';
            } else if (n / 0.00000001 > balance) {
              self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
              self.state.refwd.num = n;
            } else {
              // wagerString is valid
              self.state.refwd.error = null;
              //self.state.wager.str = n.toFixed(8).toString();
              self.state.refwd.num = n;
            }
            break;
            case 'DOGE':
              if (self.state.user){
                balance = self.state.user.refprofitDOGE - self.state.user.refpaidDOGE;
              }else{
                var balance = 0;
              }
              if (isNaN(n)) {
                self.state.refwd.error = 'INVALID_AMT';
              // Ensure user can afford balance
              } else if (n < 2000){
                self.state.refwd.error = 'INVALID_AMT';
              } else if (helpers.getPrecision(n) > 2) {
                self.state.refwd.error = 'INVALID_AMT';
              } else if (n > balance) {
                self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
                self.state.refwd.num = n;
              } else {
                // wagerString is valid
                self.state.refwd.error = null;
                //self.state.wager.str = n.toFixed(8).toString();
                self.state.refwd.num = n;
              }
              break;
            case 'BXO':
              if (self.state.user){
                balance = self.state.user.refprofitBXO - self.state.user.refpaidBXO;
              }else{
                var balance = 0;
              }
              if (isNaN(n)) {
                self.state.refwd.error = 'INVALID_AMT';
              // Ensure user can afford balance
              } else if (n < 500){
                self.state.refwd.error = 'INVALID_AMT';
              } else if (helpers.getPrecision(n) > 2) {
                self.state.refwd.error = 'INVALID_AMT';
              } else if (n > balance) {
                self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
                self.state.refwd.num = n;
              } else {
                // wagerString is valid
                self.state.refwd.error = null;
                //self.state.wager.str = n.toFixed(8).toString();
                self.state.refwd.num = n;
              }
            break;
            case 'CLAM':
              if (self.state.user){
                balance = self.state.user.refprofitCLAM - self.state.user.refpaidCLAM;
              }else{
                var balance = 0;
              }
              if (isNaN(n)) {
                self.state.refwd.error = 'INVALID_AMT';
              // Ensure user can afford balance
              } else if (n < 1){
                self.state.refwd.error = 'INVALID_AMT';
              } else if (helpers.getPrecision(n) > 4) {
                self.state.refwd.error = 'INVALID_AMT';
              } else if (n > balance) {
                self.state.refwd.error = 'CANNOT_AFFORD_WAGER';
                self.state.refwd.num = n;
              } else {
                // wagerString is valid
                self.state.refwd.error = null;
                //self.state.wager.str = n.toFixed(8).toString();
                self.state.refwd.num = n;
              }
            break;    
    }
    self.emitter.emit('change_ref_data', self.state);
    });

    Dispatcher.registerCallback('TOGGLE_ANIMATION',function(){
      self.state.animate_enable = !self.state.animate_enable;
    });

    Dispatcher.registerCallback('SET_SLOTS_TABLE',function(table){
      self.state.slots_table = table;

      switch(self.state.slots_table){
        case 1:
          self.state.slots_paytable = betStore.state.slots_tables.TABLE1;
          break;
        case 2:
          self.state.slots_paytable = betStore.state.slots_tables.TABLE2;
          break;
        case 3:
          self.state.slots_paytable = betStore.state.slots_tables.TABLE3;
          break;
        case 4:
          self.state.slots_paytable = betStore.state.slots_tables.TABLE4;
          break;
        default:
          self.state.slots_table = 1;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE1;
        break;
      }
      self.emitter.emit('change_slots', self.state);

      skanvas.renderAll();
      setTimeout(function(){
      skanvas.renderWheels();
      },50);

    });

    Dispatcher.registerCallback('TOGGLE_SLOTS_TABLE',function(){
      switch(self.state.slots_table){
        case 1:
          self.state.slots_table = 2;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE2;
          break;
        case 2:
          self.state.slots_table = 3;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE3;
          break;
        case 3:
          self.state.slots_table = 1;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE1;
          break;
        default:
        self.state.slots_table = 1;
        break;
      }
      self.emitter.emit('change_slots', self.state);

      skanvas.renderAll();
      setTimeout(function(){
      skanvas.renderWheels();
      },50);

    });

    Dispatcher.registerCallback('TOGGLE_SLOTS_TABLE_DN',function(){
      switch(self.state.slots_table){
        case 3:
          self.state.slots_table = 2;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE2;
          break;
        case 1:
          self.state.slots_table = 3;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE3;
          break;
        case 2:
          self.state.slots_table = 1;
          self.state.slots_paytable = betStore.state.slots_tables.TABLE1;
          break;
        default:
        self.state.slots_table = 1;
        break;
      }
      self.emitter.emit('change_slots', self.state);

      skanvas.renderAll();
      setTimeout(function(){
      skanvas.renderWheels();
      },50);

      });

    Dispatcher.registerCallback('TOGGLE_CHART',function(){
      self.state.ShowChart = !self.state.ShowChart;
      if (self.state.ShowChart){
      if(worldStore.state.user != undefined){
        if (worldStore.state.bets.data[worldStore.state.bets.end] == null){
          var params = {
            uname: worldStore.state.user.uname
          };
          socket.emit('list_user_bets', params, function(err, bets) {
            if (err) {
              if(config.debug){console.log('[socket] list_user_bets failure:', err);}
              self.emitter.emit('show_chart', self.state);
              return;
            }
            if(config.debug){console.log('[socket] list_user_bets success:', bets);}
            data1.datasets[0].data = [];
            data1.labels = [];
            bets.map(function(bet){
              bet.meta = {
                cond: bet.kind == 'DICE' ? bet.cond : '<',
                number: bet.kind == 'DICE' ? bet.target : 99.99,
                hash: 0,//bet.hash,
                isFair: true//CryptoJS.SHA256(bet.secret + '|' + bet.salt).toString() === hash
              };

              if (bet.kind != 'DICE')
                {
                bet.outcome = '-';
                }
              bet.meta.kind = bet.kind;

              Dispatcher.sendAction('NEW_CHART_DATAPOINT_QUIET',bet.profit/100);

            //  console.log('DATA_POINT: ' + helpers.convSatstoCointype(bet.profit));
            });

          //  Dispatcher.sendAction('INIT_USER_BETS', bets);
            self.emitter.emit('show_chart', self.state);
            Dispatcher.sendAction('INIT_USER_BETS', bets);
          });

        }else{
          data1.datasets[0].data = [];
          data1.labels = [];
          worldStore.state.bets.toArray().map(function(bet){

            Dispatcher.sendAction('NEW_CHART_DATAPOINT_QUIET',bet.profit/100);

            console.log('DATA_POINT: ' + helpers.convSatstoCointype(bet.profit));
          });
          self.emitter.emit('show_chart', self.state);
        }
      }else{
        self.emitter.emit('show_chart', self.state);
      }
    }else {
      self.emitter.emit('show_chart', self.state);
    }

    });


    Dispatcher.registerCallback('NEW_CHART_DATAPOINT', function(newnum) {
      var n;
      if (data1.datasets[0].data.length > 0){
      n = (Number(data1.datasets[0].data[data1.datasets[0].data.length - 1]) + Number(newnum)).toFixed(8);
      }else {
      n = newnum;
      }
      if (data1.labels.length < 101){
        data1.labels.push(' ');
      }
      else{
        data1.datasets[0].data.shift();
      }
      data1.datasets[0].data.push(n);
      self.emitter.emit('chart_change', self.state);
      self.emitter.emit('bet_history_change', self.state);
    });


    Dispatcher.registerCallback('NEW_CHART_DATAPOINT_QUIET', function(newnum) {
      var n;
      if (data1.datasets[0].data.length > 0){
      n = (Number(data1.datasets[0].data[data1.datasets[0].data.length - 1]) + Number(newnum)).toFixed(8);
      }else {
      n = newnum;
      }
      if (data1.labels.length < 100){
        data1.labels.push(' ');
      }
      else{
        data1.datasets[0].data.shift();
      }
      data1.datasets[0].data.push(n);
      //self.emitter.emit('chart_change', self.state);
      //self.emitter.emit('bet_history_change', self.state);
    });


    Dispatcher.registerCallback('LOAD_CHART_DATA', function() {

    //  data1.datasets[0].data = getuserbets(config.bet_buffer_size);

      //self.emitter.emit('bet_history_change', self.state);

      if(worldStore.state.user != undefined){
      if (worldStore.state.bets.data[worldStore.state.bets.end] == null){
        var params = {
          uname: worldStore.state.user.uname
        };
        socket.emit('list_user_bets', params, function(err, bets) {
          if (err) {
            if(config.debug){console.log('[socket] list_user_bets failure:', err);}
            self.emitter.emit('show_chart', self.state);
            return;
          }
          if(config.debug){console.log('[socket] list_user_bets success:', bets);}
          data1.datasets[0].data = [];
          data1.labels = [];
          bets.map(function(bet){
            bet.meta = {
              cond: bet.kind == 'DICE' ? bet.cond : '<',
              number: bet.kind == 'DICE' ? bet.target : 99.99,
              hash: 0,//bet.hash,
              isFair: true//CryptoJS.SHA256(bet.secret + '|' + bet.salt).toString() === hash
            };

            if (bet.kind != 'DICE')
              {
              bet.outcome = '-';
              }
            bet.meta.kind = bet.kind;

            Dispatcher.sendAction('NEW_CHART_DATAPOINT_QUIET',bet.profit/100);

            console.log('DATA_POINT: ' + helpers.convSatstoCointype(bet.profit));
          });

        //  Dispatcher.sendAction('INIT_USER_BETS', bets);
          self.emitter.emit('bet_history_change', self.state);
          Dispatcher.sendAction('INIT_USER_BETS', bets);
        });

      }else{
        data1.datasets[0].data = [];
        data1.labels = [];
        worldStore.state.bets.toArray().map(function(bet){

          Dispatcher.sendAction('NEW_CHART_DATAPOINT_QUIET',bet.profit/100);

        });
        self.emitter.emit('bet_history_change', self.state);
      }
    }else{
      self.emitter.emit('bet_history_change', self.state);
    }


    });

    Dispatcher.registerCallback('UPDATE_HISTORY', function() { //worldStore.state.chartbusy
      self.emitter.emit('bet_history_change', self.state);
    });

    Dispatcher.registerCallback('TOGGLE_LIVE_CHART', function() {
      self.state.LiveGraph = !self.state.LiveGraph;
      self.emitter.emit('bet_history_change', self.state);
    });

    Dispatcher.registerCallback('TOGGLE_HOTKEYS', function() {
      self.state.hotkeysEnabled = !self.state.hotkeysEnabled;
      self.emitter.emit('hotkeys_change', self.state);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('DISABLE_HOTKEYS', function() {
      self.state.hotkeysEnabled = false;
      self.emitter.emit('hotkeys_change', self.state);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('INIT_USER', function(data) {
    self.state.user = data.user;
    self.emitter.emit('change', self.state);
    });

    // data is object, note, assumes user is already an object
    Dispatcher.registerCallback('UPDATE_USER', function(data) {
      self.state.user = _.merge({}, self.state.user, data);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('USER_LOGOUT', function() {
      self.state.user = undefined;
      self.state.accessToken = undefined;
      localStorage.removeItem('expires_at');
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_id');
      localStorage.removeItem('doge_token');
      //self.state.bets.empty();
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('START_LOADING', function() {
      self.state.isLoading = true;
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('STOP_LOADING', function() {
      self.state.isLoading = false;
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('GRECAPTCHA_LOADED', function(_grecaptcha) {
      self.state.grecaptcha = _grecaptcha;
      self.emitter.emit('grecaptcha_loaded');
    });

    Dispatcher.registerCallback('UPDATE_FILTER_WAGER', function(newfilter) {
      self.state.filterwager = _.merge({}, self.state.filterwager, newfilter);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('UPDATE_FILTER_PROFIT', function(newfilter) {
      self.state.filterprofit= _.merge({}, self.state.filterprofit, newfilter);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('UPDATE_FILTER_USER', function(newfilter) {
      self.state.filteruser= _.merge({}, self.state.filteruser, newfilter);
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('SET_GAME_FILTER',function(game){
      self.state.filtergame = game;
      self.emitter.emit('change', self.state);
    });

    Dispatcher.registerCallback('SET_CURRENCY_FILTER',function(curr){
      self.state.filtercurrency = curr;
      self.emitter.emit('change', self.state);
    });

  ////////////////////////////////////////////////////////////////////////
  Dispatcher.registerCallback('MARK_PLINKO_LOADED', function() {
    self.state.plinko_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_ROULETTE_LOADED', function() {
    self.state.roulette_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_BITSWEEP_LOADED', function() {
    self.state.bitsweep_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_SLOTS_LOADED', function() {
    self.state.slots_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_BITCLIMBER_LOADED', function() {
    self.state.bitclimber_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_SLIDERS_LOADED', function() {
    self.state.sliders_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_POKER_LOADED', function() {
    self.state.poker_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_SPNPOKER_LOADED', function() {
    self.state.spnpoker_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('MARK_WONDERW_LOADED', function() {
    self.state.wonderw_loaded = true;
    self.emitter.emit('change_game_tab', self.state);
  });
  Dispatcher.registerCallback('SET_FIRST', function(data) {
    self.state.first_bet = true;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('CHANGE_TAB', function(tabName) {
    console.assert(typeof tabName === 'string');
    self.state.currTab = tabName;
    if (socket){
      if (tabName == 'ALL_BETS'){
        socket.emit('join_ALL_BETS');
      }else{
        socket.emit('leave_ALL_BETS');
      }
    }
    self.emitter.emit('change_tab', self.state);
  });

  Dispatcher.registerCallback('CHANGE_GAME_TAB', function(GametabName) {
    console.assert(typeof GametabName === 'string');
    self.state.currGameTab = GametabName;
    self.state.Stop_Autobet = true;
    if ((GametabName == 'POKER')||(GametabName == 'SLOTSPKR')){
      Dispatcher.sendAction('GET_POKER_ACCOUNT');
      if (GametabName == 'SLOTSPKR'){
        Dispatcher.sendAction('GET_SLOTSGO_DATA');
      }
    }
    self.emitter.emit('change_game_tab', self.state);
  });

  Dispatcher.registerCallback('CHANGE_COIN_TYPE', function(coin_type) {
    console.assert(typeof coin_type === 'string');
    var convertcoin = function(num, cur_type, chn_type){
      if(cur_type != chn_type){
        switch(cur_type){
          case 'BITS':
            switch(chn_type){
              case 'BTC':
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'FLASH':
              case 'ETH':
              case 'MBI':
              case 'WAVES':
                return  (num * 0.000001).toFixed(8);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
          }
          break;
          case 'BTC':
            switch(chn_type){
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'FLASH':
              case 'ETH':
              case 'MBI':
              case 'WAVES':
                return (num * 1).toFixed(8);
              case 'BITS':
                return  (num * 1000000).toFixed(2);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
            }
          break;
          case 'LTC':
          switch(chn_type){
            case 'BTC':
            self.state.confirm_btc = false;
            case 'DASH':
            case 'ADK':
            case 'GRLC':
            case 'FLASH':
            case 'ETH':
            case 'MBI':
            case 'WAVES':
              return (num * 1).toFixed(8);
            case 'BITS':
            self.state.confirm_btc = false;
              return  (num * 1000000).toFixed(2);
            case 'DOGE':
            case 'BXO':
            case 'CLAM':
              return (num * 1).toFixed(8);  
          }
        break;
            case 'DASH':
            switch(chn_type){
              case 'BTC':
              self.state.confirm_btc = false;
              case 'LTC':
              case 'ADK':
              case 'GRLC':
              case 'FLASH':
              case 'ETH':
              case 'MBI':
              case 'WAVES':
                return (num * 1).toFixed(8);  
              case 'BITS':
              self.state.confirm_btc = false;
                return  (num * 1000000).toFixed(2);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
            }
          break;
          case 'ADK':
          switch(chn_type){
            case 'BTC':
              self.state.confirm_btc = false;
            case 'LTC':
            case 'DASH':
            case 'GRLC':
            case 'FLASH':
            case 'ETH':
            case 'MBI':
              case 'WAVES':
              return (num * 1).toFixed(8);  
            case 'BITS':
              self.state.confirm_btc = false;
              return  (num * 1000000).toFixed(2);
            case 'DOGE':
            case 'BXO':
            case 'CLAM':
              return (num * 1).toFixed(8);  
          }
        break;
          case 'GRLC':
          switch(chn_type){
            case 'BTC':
            self.state.confirm_btc = false;
            case 'LTC':
            case 'DASH':
            case 'ADK':
            case 'FLASH':
            case 'ETH':
            case 'MBI':
              case 'WAVES':
              return (num * 1).toFixed(8);  
            case 'BITS':
            self.state.confirm_btc = false;
              return  (num * 1000000).toFixed(2);
            case 'DOGE':
            case 'BXO':
            case 'CLAM':
              return (num * 1).toFixed(8);  
          }
          break;
          case 'FLASH':
            switch(chn_type){
              case 'BTC':
              self.state.confirm_btc = false;
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'ETH':
              case 'MBI':
              case 'WAVES':
                return (num * 1).toFixed(8);  
              case 'BITS':
              self.state.confirm_btc = false;
                return  (num * 1000000).toFixed(2);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
            }
          break;
          case 'ETH':
            switch(chn_type){
              case 'BTC':
              self.state.confirm_btc = false;
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'MBI':
              case 'WAVES':
                return (num * 1).toFixed(8);  
              case 'BITS':
              self.state.confirm_btc = false;
                return  (num * 1000000).toFixed(2);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
            }
          break;
          case 'MBI':
          switch(chn_type){
            case 'BTC':
            self.state.confirm_btc = false;
            case 'LTC':
            case 'DASH':
            case 'ADK':
            case 'GRLC':
            case 'ETH':
            case 'WAVES':
              return (num * 1).toFixed(8);  
            case 'BITS':
            self.state.confirm_btc = false;
              return  (num * 1000000).toFixed(2);
            case 'DOGE':
            case 'BXO':
            case 'CLAM':
              return (num * 1).toFixed(8);  
          }
        break;
        case 'WAVES':
            switch(chn_type){
              case 'BTC':
              self.state.confirm_btc = false;
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'MBI':
              case 'ETH':
                return (num * 1).toFixed(8);  
              case 'BITS':
              self.state.confirm_btc = false;
                return  (num * 1000000).toFixed(2);
              case 'DOGE':
              case 'BXO':
              case 'CLAM':
                return (num * 1).toFixed(8);  
            }
          break;

          case 'DOGE':
            switch(chn_type){
              case 'BITS':
              self.state.confirm_btc = false;
                return  (num * 1).toFixed(2);
              case 'BXO':
              case 'CLAM':
                return  (num * 1).toFixed(8);
              case 'BTC':
              self.state.confirm_btc = false;
              case 'LTC':
              case 'DASH':
              case 'ADK':
              case 'GRLC':
              case 'FLASH':
              case 'ETH':
              case 'MBI':
              case 'WAVES':
                return (num * 1).toFixed(8);
            }
          break;
          case 'BXO':
          switch(chn_type){
            case 'BITS':
            self.state.confirm_btc = false;
            return  (num * 1).toFixed(2);
            case 'DOGE':
            case 'CLAM':
              return  (num * 1).toFixed(8);
            case 'BTC':
            self.state.confirm_btc = false;
            case 'LTC':
            case 'DASH':
            case 'ADK':
            case 'GRLC':
            case 'FLASH':
            case 'ETH':
            case 'MBI':
              case 'WAVES':
              return (num * 1).toFixed(8);
          }
        break;
        case 'CLAM':
          switch(chn_type){
            case 'BITS':
            self.state.confirm_btc = false;
            return  (num * 1).toFixed(2);
            case 'DOGE':
            case 'BXO':
              return  (num * 1).toFixed(8);
            case 'BTC':
            self.state.confirm_btc = false;
            case 'LTC':
            case 'DASH':
            case 'ADK':
            case 'GRLC':
            case 'FLASH':
            case 'ETH':
            case 'MBI':
              case 'WAVES':
              return (num * 1).toFixed(8);
          }
        break;
        }
      }else {
        return num;
      }
    };


    var temp = convertcoin(betStore.state.wager.num, self.state.coin_type, coin_type);
    //var temp_pkr = convertcoin(self.state.pokertx.num, self.state.coin_type, coin_type);
    var temp_ash = convertcoin(AutobetStore.state.stophigher.num, self.state.coin_type, coin_type);
    var temp_asl = convertcoin(AutobetStore.state.stoplower.num, self.state.coin_type, coin_type);
    var temp_fw = convertcoin(self.state.filterwager.num, self.state.coin_type, coin_type);
    var temp_fp = convertcoin(self.state.filterprofit.num, self.state.coin_type, coin_type);


    var temp_wd = convertcoin(self.state.refwd.num, self.state.coin_type, coin_type);

    var temp_w2 = convertcoin(betStore.state.wagerW2.num, self.state.coin_type, coin_type);
    var temp_w4 = convertcoin(betStore.state.wagerW4.num, self.state.coin_type, coin_type);
    var temp_w8 = convertcoin(betStore.state.wagerW8.num, self.state.coin_type, coin_type);
    var temp_w16 = convertcoin(betStore.state.wagerW16.num, self.state.coin_type, coin_type);
    var temp_w24 = convertcoin(betStore.state.wagerW24.num, self.state.coin_type, coin_type);
    var temp_w48 = convertcoin(betStore.state.wagerW48.num, self.state.coin_type, coin_type);
    var temp_w48b = convertcoin(betStore.state.wagerW48b.num, self.state.coin_type, coin_type);

    self.state.coin_type = coin_type;

    if ((coin_type == 'USD')||(coin_type == 'EUR')){
      betStore.state.rt_ChipSize = 0.10;
    }else {
      betStore.state.rt_ChipSize = 1;
    }

    Dispatcher.sendAction('UPDATE_WAGER', { str: temp.toString() });

    Dispatcher.sendAction('UPDATE_AUTO_STOPHIGHER', { str: temp_ash.toString(),
                                                    num: temp_ash
                                                    });
    Dispatcher.sendAction('UPDATE_AUTO_STOPLOWER', { str: temp_asl.toString(),
                                                    num: temp_asl
                                                    });
    Dispatcher.sendAction('UPDATE_FILTER_WAGER', { str: temp_fw.toString(),
                                                    num: temp_fw
                                                    });
    Dispatcher.sendAction('UPDATE_FILTER_PROFIT', { str: temp_fp.toString(),
                                                    num: temp_fp
                                                    });
    Dispatcher.sendAction('UPDATE_REF_WD', { str: temp_wd.toString(),
                                                    num: temp_wd
                                                  });

    Dispatcher.sendAction('UPDATE_WAGER_SOFT2',{str: temp_w2.toString(),
                                                  num: temp_w2});                                              
    Dispatcher.sendAction('UPDATE_WAGER_SOFT4',{str: temp_w4.toString(),
                                                  num: temp_w4});
    Dispatcher.sendAction('UPDATE_WAGER_SOFT8',{str: temp_w8.toString(),
                                                  num: temp_w8});
    Dispatcher.sendAction('UPDATE_WAGER_SOFT16',{str: temp_w16.toString(),
                                                  num: temp_w16});
    Dispatcher.sendAction('UPDATE_WAGER_SOFT24',{str: temp_w24.toString(),
                                                  num: temp_w24});
    Dispatcher.sendAction('UPDATE_WAGER_SOFT48',{str: temp_w48.toString(),
                                                  num: temp_w48});
    Dispatcher.sendAction('UPDATE_WAGER_SOFT48b',{str: temp_w48b.toString(),
                                                  num: temp_w48b});                                                                                                                                                                                        


    self.emitter.emit('change', self.state);
    self.emitter.emit('new_all_bet', self.state);
    self.emitter.emit('new_user_bet', self.state);
    self.emitter.emit('app_info_update', self.state);
    self.emitter.emit('biggest_info_update', self.state);
    self.emitter.emit('change_weekly_wager', self.state);
  });

  Dispatcher.registerCallback('START_REFRESHING_USER', function() {
    self.state.isRefreshingUser = true;
    self.emitter.emit('change', self.state);

    var Payload = {
      app_id: 588,
      access_token: worldStore.state.accessToken,
      currency: worldStore.state.coin_type
    };
    socket.emit('access_token_data', Payload, function(err, data) {
      if (err) {
        console.log('Error access_token_data:', err);
        Dispatcher.sendAction('STOP_REFRESHING_USER');
        return;
      }
      // if(config.debug){
          console.log('Successfully loaded user data refresh user:', data);
      //  }
      if (data.user != undefined){
      var user = data.user;
      self.state.user = user;
    // self.state.user.balance = parseFloat(user.balance);
      self.emitter.emit('change', self.state);
      self.emitter.emit('user_update');
      }
      Dispatcher.sendAction('STOP_REFRESHING_USER');
    });

  });

  Dispatcher.registerCallback('STOP_REFRESHING_USER', function() {
    self.state.isRefreshingUser = false;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('USER_LOGIN', function(user) {
    self.state.user = user;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_USER', function(data) {
    self.state.user = _.merge({}, self.state.user, data);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('STOP_REFRESHING_USER', function() {
    self.state.isRefreshingUser = false;
    self.emitter.emit('change', self.state);
  });

  /*
  Dispatcher.registerCallback('GET_BTC_TICKER',function(){
    if(config.debug){console.log('getting btc info');}
    if (socket){
      socket.emit('exch_rates', function(err, data) {
        if (err) {
          console.log('[socket] ticker data error:', err);
          return;
        }
        if(config.debug){console.log('[socket] Successfully retrived ticker data', data);}
        self.state.btc_usd = data.btc_usd;
        self.state.btc_eur = data.btc_eur;
        self.emitter.emit('app_info_update', self.state);
      });
    }

  });
  */

Dispatcher.registerCallback('UPDATE_APP_INFO', function() {

socket.emit('app_info', function(err, data) {
  if (err) {
    console.log('[socket] app_info error:', err);
    return;
  }
  if(config.debug){console.log('[socket] app_info success:', data);}
  self.state.currentAppwager = data.wagered;

  socket.emit('jackpot_data', function(err, jpdata) {
    if (err) {
      console.log('[socket] jackpot_data error:', err);
      return;
    }
    if(config.debug){console.log('[socket] jackpot_data success:', jpdata);}
    if(data != null){
   // console.assert(_.isArray(jpdata.lowwins));
    /*
    self.state.jackpotlist.lowwins.empty();
    self.state.jackpotlist.lowwins.push.apply(self.state.jackpotlist.lowwins, jpdata.lowwins);
    self.state.jackpotlist.highwins.empty();
    self.state.jackpotlist.highwins.push.apply(self.state.jackpotlist.highwins, jpdata.highwins);

    self.state.jackpotlist.lowwinsLTC.empty();
    self.state.jackpotlist.lowwinsLTC.push.apply(self.state.jackpotlist.lowwinsLTC, jpdata.lowwinsltc);
    self.state.jackpotlist.highwinsLTC.empty();
    self.state.jackpotlist.highwinsLTC.push.apply(self.state.jackpotlist.highwinsLTC, jpdata.highwinsltc);
    
    self.state.jackpotlist.lowwinsDASH.empty();
    self.state.jackpotlist.lowwinsDASH.push.apply(self.state.jackpotlist.lowwinsDASH, jpdata.lowwinsdash);
    self.state.jackpotlist.highwinsDASH.empty();
    self.state.jackpotlist.highwinsDASH.push.apply(self.state.jackpotlist.highwinsDASH, jpdata.highwinsdash);
      */
    self.state.jackpotlist.lowwinsDOGE.empty();
    self.state.jackpotlist.lowwinsDOGE.push.apply(self.state.jackpotlist.lowwinsDOGE, jpdata.lowwinsdoge);
    self.state.jackpotlist.highwinsDOGE.empty();
    self.state.jackpotlist.highwinsDOGE.push.apply(self.state.jackpotlist.highwinsDOGE, jpdata.highwinsdoge);

    self.state.jackpotlist.lowwinsBXO.empty();
    self.state.jackpotlist.lowwinsBXO.push.apply(self.state.jackpotlist.lowwinsBXO, jpdata.lowwinsbxo);
    self.state.jackpotlist.highwinsBXO.empty();
    self.state.jackpotlist.highwinsBXO.push.apply(self.state.jackpotlist.highwinsBXO, jpdata.highwinsbxo);

    self.state.jackpotlist.lowwinsCLAM.empty();
    self.state.jackpotlist.lowwinsCLAM.push.apply(self.state.jackpotlist.lowwinsCLAM, jpdata.lowwinsclam);
    self.state.jackpotlist.highwinsCLAM.empty();
    self.state.jackpotlist.highwinsCLAM.push.apply(self.state.jackpotlist.highwinsCLAM, jpdata.highwinsclam);
      /*
    if (jpdata.jackpotdoge){
      if (config.debug){console.log('Doge Jp Data', jpdata);}
      self.state.jackpotdoge = jpdata.jackpotdoge.potsize;
      self.state.jackpots.jp_doge_high = jpdata.jackpotdoge.potsize;
      if ((jpdata.jackpotdoge2.potsize != null)&&(jpdata.jackpotdoge2.potsize != undefined)){
        self.state.jackpotdoge2 = jpdata.jackpotdoge2.potsize;
        self.state.jackpots.jp_doge_low = jpdata.jackpotdoge2.potsize;;
      }else{
        self.state.jackpotdoge2 = 0;
      }
      self.state.jackpotdogelist = [];
      self.state.jackpotdogelist2 = [];

      self.state.jackpotdogelist.push(jpdata.jackpotdoge.list);
      self.state.jackpotdogelist2.push(jpdata.jackpotdoge2.list);
    }

    if (jpdata.jackpotbxo){
      if (config.debug){console.log('BXO Jp Data', jpdata);}
      self.state.jackpots.jp_bxo_low = jpdata.jackpotbxo.jp_bxo_low;
      self.state.jackpots.jp_bxo_high = jpdata.jackpotbxo.jp_bxo_high;
    } */

    }

    console.log('getting jackpots');
    socket.emit('get_jackpots', function(err, jackpot_data){
      if (err){
        console.log('Error getting Jackpots', err);
        self.emitter.emit('app_info_update', self.state);
      }else{
      //  console.log('Jackpot Data', jackpot_data);
      if(config.debug){console.log('[socket] get_jackpots success:', jackpot_data);}
        for (var x = 0; x < jackpot_data.length; x++){
        /*  if (jackpot_data[x].type == 'btc_low'){
            self.state.jackpots.jp_btc_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'btc_high'){
            self.state.jackpots.jp_btc_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'ltc_low'){
            self.state.jackpots.jp_ltc_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'ltc_high'){
            self.state.jackpots.jp_ltc_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'dash_low'){
            self.state.jackpots.jp_dash_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'dash_high'){
            self.state.jackpots.jp_dash_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'adk_low'){
            self.state.jackpots.jp_adk_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'adk_high'){
            self.state.jackpots.jp_adk_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'grlc_low'){
            self.state.jackpots.jp_grlc_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'grlc_high'){
            self.state.jackpots.jp_grlc_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'flash_low'){
            self.state.jackpots.jp_flash_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'flash_high'){
            self.state.jackpots.jp_flash_high = jackpot_data[x].prize;
          } */
          if (jackpot_data[x].type == 'doge_low'){
            self.state.jackpots.jp_doge_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'doge_high'){
            self.state.jackpots.jp_doge_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'bxo_low'){
            self.state.jackpots.jp_bxo_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'bxo_high'){
            self.state.jackpots.jp_bxo_high = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'clam_low'){
            self.state.jackpots.jp_clam_low = jackpot_data[x].prize;
          }
          if (jackpot_data[x].type == 'clam_high'){
            self.state.jackpots.jp_clam_high = jackpot_data[x].prize;
          }
        }
         

      }
      self.emitter.emit('app_info_update', self.state);
      self.emitter.emit('app_info_update', self.state);
    });

    //self.emitter.emit('app_info_update', self.state);
    });

  });

});

Dispatcher.registerCallback('UPDATE_BIGGEST_INFO', function() {
  socket.emit('biggestwin_info', function(err, data) {
  if (err) {
    console.log('[socket] app_info erro:', err);
    return;
  }
  console.log('[socket] biggestwin_info success:', data);
  self.state.biggestwins.empty();
  self.state.biggestlosses.empty();
  self.state.biggestwagered.empty();
  self.state.biggestprofit.empty();
  self.state.biggestjackpots.empty();
  self.state.biggestwins.push.apply(self.state.biggestwins, data.biggestwins);
  self.state.biggestlosses.push.apply(self.state.biggestlosses, data.biggestlosses);
  self.state.biggestwagered.push.apply(self.state.biggestwagered, data.biggestwagered);
  self.state.biggestprofit.push.apply(self.state.biggestprofit, data.biggestprofit);
  self.state.biggestjackpots.push.apply(self.state.biggestjackpots, data.biggestjackpots);

  self.emitter.emit('biggest_info_update', self.state);
  });

});


Dispatcher.registerCallback('UPDATE_BANKROLL',function(){
    self.emitter.emit('change', self.state);
    if (socket){
      socket.emit('bankroll_data', function(err, bankroll) {
        if (err) {
          console.log('Error bankroll_data:', err);
          return;
        }
        if(config.debug){console.log('Successfully loaded bankroll_data:', bankroll);}
        self.state.bankroll = bankroll;
        self.emitter.emit('change', self.state);
      });
    }
  });

  Dispatcher.registerCallback('RESET_BET_STATS', function(type) {

    switch(type){
      case 'DICE':
        self.state.dicestats.bets = 0;
        self.state.dicestats.wins = 0;
        self.state.dicestats.loss = 0;
        self.state.dicestats.wager = 0;
        self.state.dicestats.profit = 0;
        break;
      case 'PLINKO':
        self.state.plinkostats.bets = 0;
        self.state.plinkostats.wins = 0;
        self.state.plinkostats.loss = 0;
        self.state.plinkostats.wager = 0;
        self.state.plinkostats.profit = 0;
        break;
      case 'ROULETTE':
        self.state.Roulettestats.bets = 0;
        self.state.Roulettestats.wins = 0;
        self.state.Roulettestats.loss = 0;
        self.state.Roulettestats.wager = 0;
        self.state.Roulettestats.profit = 0;
        break;
      case 'BITSWEEP':
        self.state.bitsweepstats.bets = 0;
        self.state.bitsweepstats.wins = 0;
        self.state.bitsweepstats.loss = 0;
        self.state.bitsweepstats.wager = 0;
        self.state.bitsweepstats.profit = 0;
        break;
      case 'SLOTS':
        self.state.slotsstats.bets = 0;
        self.state.slotsstats.wins = 0;
        self.state.slotsstats.loss = 0;
        self.state.slotsstats.wager = 0;
        self.state.slotsstats.profit = 0;
        break;
      case 'BITCLIMBER':
        self.state.BitClimberstats.bets = 0;
        self.state.BitClimberstats.wins = 0;
        self.state.BitClimberstats.loss = 0;
        self.state.BitClimberstats.wager = 0;
        self.state.BitClimberstats.profit = 0;
        break;
      case 'SLIDERS':
        self.state.Slidersstats.bets = 0;
        self.state.Slidersstats.wins = 0;
        self.state.Slidersstats.loss = 0;
        self.state.Slidersstats.wager = 0;
        self.state.Slidersstats.profit = 0;
        break;
      case 'WONDERW':
        self.state.WonderWstats.bets = 0;
        self.state.WonderWstats.wins = 0;
        self.state.WonderWstats.loss = 0;
        self.state.WonderWstats.wager = 0;
        self.state.WonderWstats.profit = 0; 
        break;
      default:
      self.state.dicestats.bets = 0;
      self.state.dicestats.wins = 0;
      self.state.dicestats.loss = 0;
      self.state.dicestats.wager = 0;
      self.state.dicestats.profit = 0;
      self.state.plinkostats.bets = 0;
      self.state.plinkostats.wins = 0;
      self.state.plinkostats.loss = 0;
      self.state.plinkostats.wager = 0;
      self.state.plinkostats.profit = 0;
      self.state.Roulettestats.bets = 0;
      self.state.Roulettestats.wins = 0;
      self.state.Roulettestats.loss = 0;
      self.state.Roulettestats.wager = 0;
      self.state.Roulettestats.profit = 0;
      self.state.bitsweepstats.bets = 0;
      self.state.bitsweepstats.wins = 0;
      self.state.bitsweepstats.loss = 0;
      self.state.bitsweepstats.wager = 0;
      self.state.bitsweepstats.profit = 0;
      self.state.slotsstats.bets = 0;
      self.state.slotsstats.wins = 0;
      self.state.slotsstats.loss = 0;
      self.state.slotsstats.wager = 0;
      self.state.slotsstats.profit = 0;
      self.state.BitClimberstats.bets = 0;
      self.state.BitClimberstats.wins = 0;
      self.state.BitClimberstats.loss = 0;
      self.state.BitClimberstats.wager = 0;
      self.state.BitClimberstats.profit = 0;
      self.state.Slidersstats.bets = 0;
      self.state.Slidersstats.wins = 0;
      self.state.Slidersstats.loss = 0;
      self.state.Slidersstats.wager = 0;
      self.state.Slidersstats.profit = 0;
      self.state.WonderWstats.bets = 0;
      self.state.WonderWstats.wins = 0;
      self.state.WonderWstats.loss = 0;
      self.state.WonderWstats.wager = 0;
      self.state.WonderWstats.profit = 0;
        break;
    }
    self.emitter.emit('new_user_bet', self.state);
  });

  Dispatcher.registerCallback('NEW_BET', function(bet) {
    console.assert(typeof bet === 'object');
  //  self.state.bets.shift();
    self.state.bets.push(bet);
    if ((self.state.LiveGraph)||(self.state.ShowChart))
      {
      Dispatcher.sendAction('NEW_CHART_DATAPOINT',bet.profit/100);
      //Dispatcher.sendAction('UPDATE_USERSTATS');
      }
    switch(bet.meta.kind){
      case 'DICE':
        self.state.dicestats.bets++;
        if (bet.profit > 0){
          self.state.dicestats.wins++;
        }else {
          self.state.dicestats.loss++;
        }
        self.state.dicestats.wager += bet.wager;
        self.state.dicestats.profit += bet.profit;
        break;
      case 'PLINKO':
        self.state.plinkostats.bets++;
        if (bet.profit > 0){
          self.state.plinkostats.wins++;
        }else {
          self.state.plinkostats.loss++;
        }
        self.state.plinkostats.wager += bet.wager;
        self.state.plinkostats.profit += bet.profit;
        break;
      case 'ROULETTE':
      self.state.Roulettestats.bets++;
      if (bet.profit > 0){
        self.state.Roulettestats.wins++;
      }else {
        self.state.Roulettestats.loss++;
      }
      self.state.Roulettestats.wager += bet.wager;
      self.state.Roulettestats.profit += bet.profit;
      break;
      case 'BITSWEEP':
        self.state.bitsweepstats.bets++;
        if (bet.profit > 0){
          self.state.bitsweepstats.wins++;
        }else {
          self.state.bitsweepstats.loss++;
        }
        self.state.bitsweepstats.wager += bet.wager;
        self.state.bitsweepstats.profit += bet.profit;
      break;
      case 'SLOTS':
        self.state.slotsstats.bets++;
        if (bet.profit > 0){
          self.state.slotsstats.wins++;
        }else {
          self.state.slotsstats.loss++;
        }
        self.state.slotsstats.wager += bet.wager;
        self.state.slotsstats.profit += bet.profit;
      break;
      case 'BITCLIMBER':
        self.state.BitClimberstats.bets++;
        if (bet.profit > 0){
          self.state.BitClimberstats.wins++;
        }else {
          self.state.BitClimberstats.loss++;
        }
        self.state.BitClimberstats.wager += bet.wager;
        self.state.BitClimberstats.profit += bet.profit;
      break;
      case 'SLIDERS':
      self.state.Slidersstats.bets++;
      if (bet.profit > 0){
        self.state.Slidersstats.wins++;
      }else {
        self.state.Slidersstats.loss++;
      }
      self.state.Slidersstats.wager += bet.wager;
      self.state.Slidersstats.profit += bet.profit;
      break;
      case 'WONDERW':
      self.state.WonderWstats.bets++;
      if (bet.profit > 0){
        self.state.WonderWstats.wins++;
      }else {
        self.state.WonderWstats.loss++;
      }
      self.state.WonderWstats.wager += bet.wager;
      self.state.WonderWstats.profit += bet.profit;
      break;
      default:
      
        break;
    }
    self.emitter.emit('new_user_bet', self.state);
  });

  Dispatcher.registerCallback('NEW_ALL_BET', function(betarray) {
    var wasnew = false;

    betarray.map(function(bet){
      self.state.currentAppwager += bet.wager;
      self.emitter.emit('app_info_update', self.state);
    if ((helpers.convSatstoCointype(bet.profit) <  worldStore.state.filterprofit.num) && (worldStore.state.filterprofit.num != 0) && (worldStore.state.filterprofit.num != null) && (!worldStore.state.filterprofit.error))
      {
      return;
      }
    else if ((helpers.convSatstoCointype(bet.wager) <  worldStore.state.filterwager.num) && (worldStore.state.filterwager.num != 0) && (worldStore.state.filterwager.num != null) && (!worldStore.state.filterwager.error))
        {
        return;
        }
    else if ((worldStore.state.filteruser.str != 'User')&&(worldStore.state.filteruser.str != ''))
        {
            var filtername = worldStore.state.filteruser.str.toLowerCase();
            var big = bet.uname.substring(0,filtername.length);
            var lowsub = big.toLowerCase();
            if (lowsub != filtername){
                return;
            }else {
              self.state.allBets.push(bet);
              wasnew = true;
            }
        }
    else if((worldStore.state.filtergame != 'ALL GAMES') && (worldStore.state.filtergame != bet.kind)){
      return;
      }
    else if((worldStore.state.filtercurrency != 'ALL CURRENCY') && (worldStore.state.filtercurrency != bet.currency)){
      return;
      }
    else{
    //self.state.allBets.shift();
    self.state.allBets.push(bet);
    wasnew = true;
    //self.emitter.emit('new_all_bet', self.state);
    }
  });

  if (wasnew){
    self.emitter.emit('new_all_bet', self.state);
  }

});

Dispatcher.registerCallback('INIT_ALL_BETS', function(bets) {
  console.assert(_.isArray(bets));

  delete self.state.allBets;
  self.state.allBets = new CBuffer(config.bet_buffer_size);

  self.state.allBets.push.apply(self.state.allBets, bets);
  self.emitter.emit('change', self.state);
  self.emitter.emit('new_all_bet', self.state);
});

Dispatcher.registerCallback('INIT_USER_BETS', function(newbets) {
  console.assert(_.isArray(newbets));

  delete self.state.bets;
  self.state.bets = new CBuffer(config.bet_buffer_size);

  self.state.bets.push.apply(self.state.bets, newbets);
  self.emitter.emit('change', self.state);
  self.emitter.emit('new_user_bet', self.state);
});

Dispatcher.registerCallback('LOAD_BET_HISTORY', function(bets) {
  console.assert(_.isArray(bets));
  self.state.bethistory.push.apply(self.state.bethistory, bets);
  self.emitter.emit('change', self.state);
});

Dispatcher.registerCallback('GET_WEEKLY_WAGER',function(){

      socket.emit('get_weekly_wager', function(err, data) {
        if (err) {
          console.log('Error get_weekly_wager:', err);
          return;
        }
        if(config.debug){console.log('Successfully got weekly wager:' ,  data);}
      //  var user = data.user;
      //  self.state.user = user;
        self.state.weeklydata = data.btc;
        self.state.weeklydataLTC = data.ltc;
        self.state.weeklydataDASH = data.dash;
        self.state.weeklydataADK = data.adk;
        self.state.weeklydataGRLC = data.grlc;
        self.state.weeklydataFLASH = data.flash;
        self.state.weeklydataETH = data.eth;
        self.state.weeklydataMBI = data.mbi;
        self.state.weeklydataWAVES = data.waves;
        self.state.weeklydataBXO = data.bxo;
        self.state.weeklydatadoge = data.doge;
        self.state.weeklydataCLAM = data.clam;
        self.emitter.emit('change_weekly_wager', self.state);
      });
    });
///////
Dispatcher.registerCallback('GET_WEEKLY_POKER',function(){

      socket.emit('get_weekly_poker', function(err, data) {
        if (err) {
          console.log('Error get_weekly_poker:', err);
          return;
        }
        if(config.debug){console.log('Successfully got weekly poker:' ,  data);}
      //  var user = data.user;
      //  self.state.user = user;
        self.state.weeklydatapoker = data;
        self.emitter.emit('change_weekly_wager', self.state);
      });
    });

Dispatcher.registerCallback('GET_WEEKLY_DOGE',function(){

      socket.emit('get_weekly_doge', function(err, data) {
        if (err) {
          console.log('Error get_weekly_doge:', err);
          return;
        }
        console.log('Successfully got weekly doge:' ,  data);
      //  var user = data.user;
      //  self.state.user = user;
        self.state.weeklydatadoge = data;
        self.emitter.emit('change_weekly_wager', self.state);
      });
    });    

Dispatcher.registerCallback('UPDATE_PLINKO', function() { //worldStore.state.chartbusy
self.emitter.emit('plinko_game_change', self.state);
});

Dispatcher.registerCallback('TOGGLE_PAYOUT_EDITOR', function() {
self.state.showPayoutEditor = !self.state.showPayoutEditor;
self.emitter.emit('plinko_payout_change', self.state);
self.emitter.emit('plinko_game_change', self.state);
self.emitter.emit('change', self.state);

if (self.state.showPayoutEditor){
  setTimeout(function(){
    location.href = "#";
    location.href = "#p_editor";
  },250);
}
});
// data.color: 'red' | 'green' | ...
// data.path: Array of 'L' and 'R'
// data.wager_satoshis: Int
// data.profit_satoshis: Int (satoshis)
// data.isTest: Bool - for 0 wager pucks that shouldn't hit the Moneypot
//   server. Intended to let unloggedin users play with the site.
// data.isFair: Bool
Dispatcher.registerCallback('SPAWN_PUCK', function(data) {

var path = data.path || generatePath();
var puck = new Puck({
  path: path,
  color: data.color,
  wager_satoshis: data.wager_satoshis,
  profit_satoshis: data.profit_satoshis,
  isTest: data.isTest,
  bet: data.bet,
  isFair: data.isFair,
  // When puck hits a peg
  onPeg: function(puck) {
  },
  // As soon as puck lands in a slot
  onSlot: function(puck) {

    delete worldStore.state.activePucks[puck.id];
    // ignore test pucks
    if (puck.isTest) {
      return;
    }
    Dispatcher.sendAction('UPDATE_REVEALED_BALANCE', data.profit_satoshis);
    // And also force wager validation now that balance is updated
    Dispatcher.sendAction('UPDATE_WAGER', {
      str: betStore.state.wager.str
    });
    Dispatcher.sendAction('NEW_BET', puck.bet);
  //  Dispatcher.sendAction('NEW_ALL_BET', puck.bet);
  },
  // When puck is finished animating and must be removed from board
  onComplete: function(puck) {
    delete worldStore.state.renderedPucks[puck.id];
    if (!worldStore.state.first_bet)
      {Dispatcher.sendAction('SET_FIRST');}
    self.emitter.emit('plinko_render_change', self.state);
    self.emitter.emit('change', self.state);
  }
});

// Don't add testpucks to history
if (!puck.isTest) {
  worldStore.state.pucks.push(puck);
}

worldStore.state.activePucks[puck.id] = puck;

worldStore.state.renderedPucks[puck.id] = puck;
self.emitter.emit('plinko_render_change', self.state);

puck.run();
self.emitter.emit('change', self.state);
});

Dispatcher.registerCallback('SET_REVEALED_BALANCE', function() {
var stillAnimatingPucks = _.keys(worldStore.state.renderedPucks).length > 0;
if (stillAnimatingPucks)
  {
  self.state.revealed_balance = self.state.revealed_balance;
}else{
  //
  if (worldStore.state.coin_type == 'BITS'){
    self.state.revealed_balance = self.state.user.balances.btc;
  }else{
    self.state.revealed_balance = self.state.user.balances[worldStore.state.coin_type.toLowerCase()];
  }
  /* //commented out to be more dynamic with coin_type
  switch (worldStore.state.coin_type){
    
    case 'BTC':
      self.state.revealed_balance = self.state.user.balances.btc;
    break;
    case 'LTC':
    self.state.revealed_balance = self.state.user.balances.ltc;
    break;
    case 'DASH':
    self.state.revealed_balance = self.state.user.balances.dash;
    break;
    case 'ADK':
    self.state.revealed_balance = self.state.user.balances.adk;
    break;
    case 'GRLC':
    self.state.revealed_balance = self.state.user.balances.grlc;
    break;
    case 'FLASH':
    self.state.revealed_balance = self.state.user.balances.flash;
    break;
    case 'ETH':
    self.state.revealed_balance = self.state.user.balances.eth;
    break;
    case 'DOGE':
      self.state.revealed_balance = self.state.user.balances.doge;
    break;
    case 'BXO':
    self.state.revealed_balance = self.state.user.balances.bxo;
    break;
  }
  */
}
});

Dispatcher.registerCallback('UPDATE_REVEALED_BALANCE', function(profit) {
  self.state.revealed_balance = self.state.revealed_balance + profit;
});

});//end worldStore


///Autobet code/////////////////////////////////////////////////////////////////
var AutobetStore = new Store('autobet', {
  ShowAutobet: false,  //FOR HIDING forms
  Run_Autobet: false,  //Enables Auto Wagering
  Stop_Autobet: false, //Flag to stop Before hititng wager
  AutobetBase: 0.00,
  AutobetBaseW2: 0.00,
  AutobetBaseW4: 0.00,
  AutobetBaseW8: 0.00,
  AutobetBaseW16: 0.00,
  AutobetBaseW24: 0.00,
  AutobetBaseW48: 0.00,
  AutobetBaseW48b: 0.00,
  Auto_cond:'<',
  stoplower: {
    str: ' ',
    num: 0,
    error:null
  },
  stophigher: {
    str: ' ',
    num: 0,
    error:null
  },
  autodelay: {
    str: '10',
    num: 10,
    error:null
  },
  dice_delay:undefined,
  P_rowsel: 1,
  lossmul:{
    str: '2.0000',
    num: 2.0000,
    error:null
  },
  losstarget:{
    str: '1',
    num: 1,
    error:null
  },
  lossmode: 'DO NOTHING',
  losscounter: 0,
  ///
  winmul:{
    str: '2.0000',
    num: 2.0000,
    error:null
  },
  wintarget:{
    str: '1',
    num: 1,
    error:null
  },
  winmode: 'RESET TO BASE',
  wincounter: 0,
  ///
  switch1: {
    str: '1',
    num: 1,
    wincount:0,
    losscount:0,
    betcount:0,
    cont_loss:0,
    cont_win:0,
    type:'WINS',
    mode:'CHANGE TARGET',
    enable:false,
    error: undefined
  },
  switch2: {
    str: '1',
    num: 1,
    wincount:0,
    losscount:0,
    betcount:0,
    cont_loss:0,
    cont_win:0,
    type:'LOSS',
    mode:'STOP AUTO',
    enable:false,
    error: undefined
  },
  switch3: {
    str: '1',
    num: 1,
    wincount:0,
    losscount:0,
    betcount:0,
    cont_loss:0,
    cont_win:0,
    type:'BETS',
    mode:'STOP AUTO',
    enable:false,
    error: undefined
  },
  Auto_betcount: 0,
  Auto_wincount: 0,
  Auto_losscount: 0,
  Auto_wagered: 0,
  Auto_profit: 0,
  Stop_on_win:false
  /////////////////////

}, function() {
  var self = this;

  Dispatcher.registerCallback('TOGGLE_STOP_ON_WIN', function() {
    self.state.Stop_on_win = !self.state.Stop_on_win;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('CHANGE_P_ROW', function(row) {
    self.state.P_rowsel = row;
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_SHOW_AUTO', function() {
    self.state.ShowAutobet = !self.state.ShowAutobet;
    self.emitter.emit('change', self.state);
    self.emitter.emit('chat_size',self.state);
  });

  Dispatcher.registerCallback('TOGGLE_AUTO_COND', function() {
    self.state.Auto_cond = self.state.Auto_cond === '<' ? '>':'<';
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTO_STOPHIGHER', function(newstop) {
    self.state.stophigher = _.merge({}, self.state.stophigher, newstop);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTO_STOPLOWER', function(newstop) {
    self.state.stoplower = _.merge({}, self.state.stoplower, newstop);
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTOBET_DELAY', function(newsize){
    self.state.autodelay.num = newsize;
    self.state.autodelay.str = newsize.toString();
    self.emitter.emit('change', self.state);
  });


  Dispatcher.registerCallback('SET_LOSS_MODE', function(mode) {
    self.state.lossmode = mode;
    self.emitter.emit('loss_change', self.state);
  });

  Dispatcher.registerCallback('SET_WIN_MODE', function(mode) {
    self.state.winmode = mode;
    self.emitter.emit('win_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTO_MULTIPLIER_ONLOSS', function(newMult) {
    self.state.lossmul = _.merge({}, self.state.lossmul, newMult);
    self.emitter.emit('loss_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_AUTO_MULTIPLIER_ONWIN', function(newMult) {
    self.state.winmul = _.merge({}, self.state.winmul, newMult);
    self.emitter.emit('win_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_LOSS_TARGET', function(newsize){
    self.state.losstarget.num = newsize;
    self.state.losstarget.str = newsize.toString();
    self.emitter.emit('loss_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_WIN_TARGET', function(newsize){
    self.state.wintarget.num = newsize;
    self.state.wintarget.str = newsize.toString();
    self.emitter.emit('win_change', self.state);
  });

  Dispatcher.registerCallback('TOGGLE_DSWITCH1_ENABLE', function(){
    self.state.switch1.enable = !self.state.switch1.enable;
    self.state.switch1.betcount = 0;
    self.state.switch1.losscount = 0;
    self.state.switch1.wincount = 0;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('TOGGLE_DSWITCH2_ENABLE', function(){
    self.state.switch2.enable = !self.state.switch2.enable;
    self.state.switch2.betcount = 0;
    self.state.switch2.losscount = 0;
    self.state.switch2.wincount = 0;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('TOGGLE_DSWITCH3_ENABLE', function(){
    self.state.switch3.enable = !self.state.switch3.enable;
    self.state.switch3.betcount = 0;
    self.state.switch3.losscount = 0;
    self.state.switch3.wincount = 0;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_D_SW1_MODE', function(mode){
    self.state.switch1.mode = mode;
    self.state.switch1.betcount = 0;
    self.state.switch1.losscount = 0;
    self.state.switch1.wincount = 0;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_DSWITCH1_TYPE', function(type){
    self.state.switch1.type = type;
    self.state.switch1.betcount = 0;
    self.state.switch1.losscount = 0;
    self.state.switch1.wincount = 0;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_D_SW2_MODE', function(mode){
    self.state.switch2.mode = mode;
    self.state.switch2.betcount = 0;
    self.state.switch2.losscount = 0;
    self.state.switch2.wincount = 0;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_DSWITCH2_TYPE', function(type){
    self.state.switch2.type = type;
    self.state.switch2.betcount = 0;
    self.state.switch2.losscount = 0;
    self.state.switch2.wincount = 0;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_D_SW3_MODE', function(mode){
    self.state.switch3.mode = mode;
    self.state.switch3.betcount = 0;
    self.state.switch3.losscount = 0;
    self.state.switch3.wincount = 0;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('SET_DSWITCH3_TYPE', function(type){
    self.state.switch3.type = type;
    self.state.switch3.betcount = 0;
    self.state.switch3.losscount = 0;
    self.state.switch3.wincount = 0;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win = 0;
    self.emitter.emit('switch_change',self.state);
  });

  Dispatcher.registerCallback('UPDATE_SWITCH1_TARGET', function(newsize){
    self.state.switch1.num = newsize;
    self.state.switch1.str = newsize.toString();
    self.state.switch1.betcount = 0;
    self.state.switch1.losscount = 0;
    self.state.switch1.wincount = 0;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win = 0;
    self.emitter.emit('switch_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_SWITCH2_TARGET', function(newsize){
    self.state.switch2.num = newsize;
    self.state.switch2.str = newsize.toString();
    self.state.switch2.betcount = 0;
    self.state.switch2.losscount = 0;
    self.state.switch2.wincount = 0;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win = 0;
    self.emitter.emit('switch_change', self.state);
  });

  Dispatcher.registerCallback('UPDATE_SWITCH3_TARGET', function(newsize){
    self.state.switch3.num = newsize;
    self.state.switch3.str = newsize.toString();
    self.state.switch3.betcount = 0;
    self.state.switch3.losscount = 0;
    self.state.switch3.wincount = 0;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win = 0;
    self.emitter.emit('switch_change', self.state);
  });


  Dispatcher.registerCallback('START_RUN_AUTO', function(){
    console.log('start auto bet');
    self.state.AutobetBase = betStore.state.wager.num;
    self.state.AutobetBaseW2 = betStore.state.wagerW2.num;
    self.state.AutobetBaseW4 = betStore.state.wagerW4.num;
    self.state.AutobetBaseW8 = betStore.state.wagerW8.num;
    self.state.AutobetBaseW16 = betStore.state.wagerW16.num;
    self.state.AutobetBaseW24 = betStore.state.wagerW24.num;
    self.state.AutobetBaseW48 = betStore.state.wagerW48.num;
    self.state.AutobetBaseW48b = betStore.state.wagerW48b.num;


    self.state.losscounter = 0;
    self.state.wincounter = 0;

    self.state.switch1.wincount = 0;
    self.state.switch1.losscount = 0;
    self.state.switch1.betcount = 0;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win = 0;

    self.state.switch2.wincount = 0;
    self.state.switch2.losscount = 0;
    self.state.switch2.betcount = 0;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win = 0;

    self.state.switch3.wincount = 0;
    self.state.switch3.losscount = 0;
    self.state.switch3.betcount = 0;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win = 0;

    self.state.Auto_betcount = 0;
    self.state.Auto_wincount = 0;
    self.state.Auto_losscount = 0;
    self.state.Auto_wagered = 0;
    self.state.Auto_profit = 0;

    self.state.Run_Autobet = true;
    self.state.Stop_Autobet = false;
    if (worldStore.state.currGameTab == 'ROULETTE'){
      GetBaseWager();
    }
    self.emitter.emit('change', self.state);

  Dispatcher.sendAction('PLACE_AUTO_BET');

  });

  Dispatcher.registerCallback('STOP_RUN_AUTO', function(){
    console.log('Stop Dice Auto Bet');
    self.state.Run_Autobet = false;
    self.state.Stop_Autobet = true;
    clearTimeout(self.state.dice_delay);
    Dispatcher.sendAction('RETURN_AUTO_BASE');
    self.emitter.emit('change', self.state);
  });

  Dispatcher.registerCallback('RETURN_AUTO_BASE', function() {
    if (worldStore.state.currGameTab == 'ROULETTE'){
      ResetBaseWager();
    }else if(worldStore.state.currGameTab == 'WONDERW'){
      var newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW2).toFixed(2) : (self.state.AutobetBaseW2).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT2',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW4).toFixed(2) : (self.state.AutobetBaseW4).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT4',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW8).toFixed(2) : (self.state.AutobetBaseW8).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT8',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW16).toFixed(2) : (self.state.AutobetBaseW16).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT16',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW24).toFixed(2) : (self.state.AutobetBaseW24).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT24',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW48).toFixed(2) : (self.state.AutobetBaseW48).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT48',{str: newWager.toString(), num: newWager});
        newWager = worldStore.state.coin_type === 'BITS' ? (self.state.AutobetBaseW48b).toFixed(2) : (self.state.AutobetBaseW48b).toFixed(8);
        Dispatcher.sendAction('UPDATE_WAGER_SOFT48b',{str: newWager.toString(), num: newWager});
    }else{
    var n = self.state.AutobetBase;
    Dispatcher.sendAction('UPDATE_WAGER', { str: n.toString() });
    }
    self.emitter.emit('change', self.state);
  });

  function dice_bet(){
    /* //commented out to be more dynamic with coin_type
    switch(worldStore.state.coin_type){
      case 'BTC':
      case 'BITS':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.btc);
      break;
      case 'LTC':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.ltc);
      break;
      case 'DASH':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.dash);
      break;
      case 'ADK':
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.adk);
      break;
      case 'GRLC':
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.grlc);
      break;
      case 'FLASH':
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.flash);
      break;
      case 'ETH':
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.eth);
      break;
      case 'DOGE':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.doge);
      break;
      case 'BXO':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.bxo);
      break;
    }
    //var balance = helpers.convSatstoCointype(worldStore.state.user.balance);
    */

    if (worldStore.state.coin_type == 'BITS'){
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.btc);
    }else{
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()]);
    }



    if (self.state.Stop_Autobet){
        console.log('Stop Auto Bet Stop_Autobet set');
         Dispatcher.sendAction('STOP_RUN_AUTO');
       }
    else if ((AutobetStore.state.lossmul.error) || (AutobetStore.state.winmul.error) ||(AutobetStore.state.stoplower.error) || (AutobetStore.state.stophigher.error)){
      Dispatcher.sendAction('STOP_RUN_AUTO');
    }   
    else if (balance >= betStore.state.wager.num){
        switch(worldStore.state.currGameTab){
          case 'DICE':
            if (self.state.Auto_cond === '>'){
              $('#bet-hi')[0].click();
            }else {
              $('#bet-lo')[0].click();
            }
          break;
          case 'PLINKO':
            switch(self.state.P_rowsel){
              case 1:  // Bet ROW1
                $('#bet-ROW1').click();
                break;
              case 2:  // Bet ROW2
                $('#bet-ROW2').click();
                break;
              case 3:  // Bet ROW3
                $('#bet-ROW3').click();
                break;
              case 4:  // Bet ROW4
                $('#bet-ROW4').click();
                break;
              case 5:  // Bet ROW5
                $('#bet-ROW5').click();
                break;
              default:
                self.state.P_rowsel = 1;
                $('#bet-ROW1').click();
                break;
            }
          break;
          case 'ROULETTE':
            $('#RT-SPIN').click();
          break;
          case 'SLOTS':
            $('#SL-START').click();
          break;
          case 'BITCLIMBER':
            $('#BC-START').click();
          break;
          case 'SLIDERS':
            $('#sld-bet').click();
          break;
          case 'WONDERW':
            $('#WW-START').click();
          break;
        }
    }else {
      console.log('Balance too Low to Continue');
       Dispatcher.sendAction('STOP_RUN_AUTO');
    }
  };

  Dispatcher.registerCallback('PLACE_AUTO_BET', function() {
    if (self.state.Stop_Autobet){
      console.log('Stop Auto Bet Stop_Autobet set');
      Dispatcher.sendAction('STOP_RUN_AUTO');
    }else if (self.state.Run_Autobet){
      self.state.dice_delay = setTimeout(dice_bet, self.state.autodelay.num);
    }else{
      console.log('Stop auto bet Stop_Autobet not set, Run_Autobet not set ERROR IN MODE');
      Dispatcher.sendAction('STOP_RUN_AUTO');
    }
  self.emitter.emit('change', self.state);
  });

  function switch_red(){
    console.log('Switch red');

    var Red_BetSize = 0;
    var Red_Wager = document.getElementsByClassName('R_CHIP');
    for (var x = 0; x < Red_Wager.length; x++){
      if (Red_Wager[0].children.length > 0){
        Red_BetSize = parseInt(Red_Wager[0].children[0].innerHTML);
        var numbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        removeChipSpecial(Red_Wager[0], numbers, 2, Red_BetSize);
      }
    }

    var Black_BetSize = 0;
    var Black_Wager = document.getElementsByClassName('B_CHIP');
    for (var x = 0; x < Black_Wager.length; x++){
      if (Black_Wager[0].children.length > 0){
        Black_BetSize = parseInt(Black_Wager[0].children[0].innerHTML);
        var numbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
        removeChipSpecial(Black_Wager[0], numbers, 2, Black_BetSize);
      }
    }

    if (Black_BetSize > 0){
      Red_Wager = document.getElementsByClassName('R_CHIP');
      for (var x = 0; x < Red_Wager.length; x++){
          var numbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
          addChipSpecial(Red_Wager[0],"halfChip", numbers, 2, Black_BetSize);
      }
    }

    if (Red_BetSize > 0){
      Black_Wager = document.getElementsByClassName('B_CHIP');
      for (var x = 0; x < Black_Wager.length; x++){
          var numbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
          addChipSpecial(Black_Wager[0],"halfChip", numbers, 2, Red_BetSize);
      }
    }

  }

  function switch_odd(){
    console.log('Switch odd');
    var odd_BetSize = 0;
    var odd_Wager = document.getElementsByClassName('O_CHIP');
    for (var x = 0; x < odd_Wager.length; x++){
      if (odd_Wager[0].children.length > 0){
        odd_BetSize = parseInt(odd_Wager[0].children[0].innerHTML);
        var numbers = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35];
        removeChipSpecial(odd_Wager[0], numbers, 2, odd_BetSize);
      }
    }

    var even_BetSize = 0;
    var even_Wager = document.getElementsByClassName('E_CHIP');
    for (var x = 0; x < even_Wager.length; x++){
      if (even_Wager[0].children.length > 0){
        even_BetSize = parseInt(even_Wager[0].children[0].innerHTML);
        var numbers = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36];
        removeChipSpecial(even_Wager[0], numbers, 2, even_BetSize);
      }
    }

    if (even_BetSize > 0){
      odd_Wager = document.getElementsByClassName('O_CHIP');
      for (var x = 0; x < odd_Wager.length; x++){
          var numbers = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35];
          addChipSpecial(odd_Wager[0],"halfChip", numbers, 2, even_BetSize);
      }
    }

    if (odd_BetSize > 0){
      even_Wager = document.getElementsByClassName('E_CHIP');
      for (var x = 0; x < even_Wager.length; x++){
          var numbers = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36];
          addChipSpecial(even_Wager[0],"halfChip", numbers, 2, odd_BetSize);
      }
    }
  }

  function switch_S18(){
    console.log('Switch S18');
    var S18_BetSize = 0;
    var S18_Wager = document.getElementsByClassName('S18_CHIP');
    for (var x = 0; x < S18_Wager.length; x++){
      if (S18_Wager[0].children.length > 0){
        S18_BetSize = parseInt(S18_Wager[0].children[0].innerHTML);
        var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
        removeChipSpecial(S18_Wager[0], numbers, 2, S18_BetSize);
      }
    }

    var S36_BetSize = 0;
    var S36_Wager = document.getElementsByClassName('S36_CHIP');
    for (var x = 0; x < S36_Wager.length; x++){
      if (S36_Wager[0].children.length > 0){
        S36_BetSize = parseInt(S36_Wager[0].children[0].innerHTML);
        var numbers = [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];
        removeChipSpecial(S36_Wager[0], numbers, 2, S36_BetSize);
      }
    }

    if (S36_BetSize > 0){
      S18_Wager = document.getElementsByClassName('S18_CHIP');
      for (var x = 0; x < S18_Wager.length; x++){
          var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
          addChipSpecial(S18_Wager[0],"halfChip", numbers, 2, S36_BetSize);
      }
    }

    if (S18_BetSize > 0){
      S36_Wager = document.getElementsByClassName('S36_CHIP');
      for (var x = 0; x < S36_Wager.length; x++){
          var numbers = [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];
          addChipSpecial(S36_Wager[0],"halfChip", numbers, 2, S18_BetSize);
      }
    }
  }

  function switch_D12(){
    console.log('Switch D12');

    var D12_BetSize = 0;
    var D12_Wager = document.getElementsByClassName('D12_CHIP');
    for (var x = 0; x < D12_Wager.length; x++){
      if (D12_Wager[0].children.length > 0){
        D12_BetSize = parseInt(D12_Wager[0].children[0].innerHTML);
        var numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
        removeChipSpecial(D12_Wager[0], numbers, 3, D12_BetSize);
      }
    }

    var D24_BetSize = 0;
    var D24_Wager = document.getElementsByClassName('D24_CHIP');
    for (var x = 0; x < D24_Wager.length; x++){
      if (D24_Wager[0].children.length > 0){
        D24_BetSize = parseInt(D24_Wager[0].children[0].innerHTML);
        var numbers = [13,14,15,16,17,18,19,20,21,22,23,24];
        removeChipSpecial(D24_Wager[0], numbers, 3, D24_BetSize);
      }
    }

    var D36_BetSize = 0;
    var D36_Wager = document.getElementsByClassName('D36_CHIP');
    for (var x = 0; x < D36_Wager.length; x++){
      if (D36_Wager[0].children.length > 0){
        D36_BetSize = parseInt(D36_Wager[0].children[0].innerHTML);
        var numbers = [25,26,27,28,29,30,31,32,33,34,35,36];
        removeChipSpecial(D36_Wager[0], numbers, 3, D36_BetSize);
      }
    }
  ////////////////////
  if (D36_BetSize > 0){
    D12_Wager = document.getElementsByClassName('D12_CHIP');
    for (var x = 0; x < D12_Wager.length; x++){
        var numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
        addChipSpecial(D12_Wager[0],"dozenChip", numbers, 3, D36_BetSize);
    }
  }

  if (D24_BetSize > 0){
    D36_Wager = document.getElementsByClassName('D36_CHIP');
    for (var x = 0; x < D36_Wager.length; x++){
        var numbers = [25,26,27,28,29,30,31,32,33,34,35,36];
        addChipSpecial(D36_Wager[0],"dozenChip", numbers, 3, D24_BetSize);
    }
  }

  if (D12_BetSize > 0){
    D24_Wager = document.getElementsByClassName('D24_CHIP');
    for (var x = 0; x < D24_Wager.length; x++){
        var numbers = [13,14,15,16,17,18,19,20,21,22,23,24];
        addChipSpecial(D24_Wager[0],"dozenChip", numbers, 3, D12_BetSize);
    }
  }

  }

  function switch_row(){
    console.log('Switch row');

    var R1_BetSize = 0;
    var R1_Wager = document.getElementsByClassName('R1_CHIP');
    for (var x = 0; x < R1_Wager.length; x++){
      if (R1_Wager[0].children.length > 0){
        R1_BetSize = parseInt(R1_Wager[0].children[0].innerHTML);
        var numbers = [3,6,9,12,15,18,21,24,27,30,33,36];
        removeChipSpecial(R1_Wager[0], numbers, 3, R1_BetSize);
      }
    }

    var R2_BetSize = 0;
    var R2_Wager = document.getElementsByClassName('R2_CHIP');
    for (var x = 0; x < R2_Wager.length; x++){
      if (R2_Wager[0].children.length > 0){
        R2_BetSize = parseInt(R2_Wager[0].children[0].innerHTML);
        var numbers = [2,5,8,11,14,17,20,23,26,29,32,35];
        removeChipSpecial(R2_Wager[0], numbers, 3, R2_BetSize);
      }
    }

    var R3_BetSize = 0;
    var R3_Wager = document.getElementsByClassName('R3_CHIP');
    for (var x = 0; x < R3_Wager.length; x++){
      if (R3_Wager[0].children.length > 0){
        R3_BetSize = parseInt(R3_Wager[0].children[0].innerHTML);
        var numbers = [1,4,7,10,13,16,19,22,25,28,31,34];
        removeChipSpecial(R3_Wager[0], numbers, 3, R3_BetSize);
      }
    }
  ////////////////////
  if (R1_BetSize > 0){
    R2_Wager = document.getElementsByClassName('R2_CHIP');
    for (var x = 0; x < R2_Wager.length; x++){
        var numbers = [2,5,8,11,14,17,20,23,26,29,32,35];
        addChipSpecial(R2_Wager[0],"dozenChip", numbers, 3, R1_BetSize);
    }
  }

  if (R2_BetSize > 0){
    R3_Wager = document.getElementsByClassName('R3_CHIP');
    for (var x = 0; x < R3_Wager.length; x++){
        var numbers = [1,4,7,10,13,16,19,22,25,28,31,34];
        addChipSpecial(R3_Wager[0],"dozenChip", numbers, 3, R2_BetSize);
    }
  }

  if (R3_BetSize > 0){
    R1_Wager = document.getElementsByClassName('R1_CHIP');
    for (var x = 0; x < R1_Wager.length; x++){
        var numbers = [3,6,9,12,15,18,21,24,27,30,33,36];
        addChipSpecial(R1_Wager[0],"dozenChip", numbers, 3, R3_BetSize);
    }
  }


  }

  function switch1function(bet){
    console.log('Switch 1 function');
    var execute = false;

    self.state.switch1.betcount++;

    if (bet.profit < 0){
    self.state.switch1.losscount++;
    self.state.switch1.cont_loss++;
    self.state.switch1.cont_win = 0;
    }else {
    self.state.switch1.wincount++;
    self.state.switch1.cont_loss = 0;
    self.state.switch1.cont_win++;
    }

    switch(self.state.switch1.type){
      case 'WINS':
          if (self.state.switch1.wincount >= self.state.switch1.num){
            execute = true;
            self.state.switch1.betcount = 0;
            self.state.switch1.losscount = 0;
            self.state.switch1.wincount = 0;
          }
        break;
      case 'LOSS':
          if (self.state.switch1.losscount >= self.state.switch1.num){
            execute = true;
            self.state.switch1.betcount = 0;
            self.state.switch1.losscount = 0;
            self.state.switch1.wincount = 0;
          }
        break;
      case 'BETS':
          if (self.state.switch1.betcount >= self.state.switch1.num){
            execute = true;
            self.state.switch1.betcount = 0;
            self.state.switch1.losscount = 0;
            self.state.switch1.wincount = 0;
          }
        break;
      case 'C.LOSS':
        if (self.state.switch1.cont_loss >= self.state.switch1.num){
          execute = true;
          self.state.switch1.betcount = 0;
          self.state.switch1.losscount = 0;
          self.state.switch1.wincount = 0;
          self.state.switch1.cont_loss = 0;
          self.state.switch1.cont_win = 0;
        }
        break;
      case 'C.WINS':
        if (self.state.switch1.cont_win >= self.state.switch1.num){
          execute = true;
          self.state.switch1.betcount = 0;
          self.state.switch1.losscount = 0;
          self.state.switch1.wincount = 0;
          self.state.switch1.cont_loss = 0;
          self.state.switch1.cont_win = 0;
        }
        break;
    }

  /////////////////////////
    if (execute){
      switch (self.state.switch1.mode){
        case 'TABLE +':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE');
           break;
        case 'TABLE -':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE_DN');
           break;
        case 'RED/BLACK':
          switch_red();
          break;
        case 'ODD/EVEN':
          switch_odd();
          break;
        case '1-18/19-36':
          switch_S18();
          break;
        case '1-12/13-24/25-36':
          switch_D12();
          break;
        case 'ROW':
          switch_row();
          break;
        case 'ROW +':
          self.state.P_rowsel++;
          if(self.state.P_rowsel > 5){
            self.state.P_rowsel =  1;
          }
          break;
        case 'ROW -':
          self.state.P_rowsel--;
          if(self.state.P_rowsel < 1){
            self.state.P_rowsel =  5;
          }
          break;
        case 'STOP AUTO':
          self.state.Stop_Autobet = true;
          break;
        case 'CHANGE TARGET':
          Dispatcher.sendAction('TOGGLE_AUTO_COND');
          Dispatcher.sendAction( 'TOGGLE_BC_TARGET');
            if(worldStore.state.currGameTab == 'SLIDERS'){
              if (betStore.state.activesliders == 1){
              Dispatcher.sendAction('UPDATE_SLIDER_POS',Math.random()*(99.9999));
              }else {
              var positions = [(Math.random()*(99.9999)),(Math.random()*(99.9999))];
              Dispatcher.sendAction('UPDATE_SLIDER_POS',positions);
              }
              $("#ex1").slider('destroy');
              init_slider();
            }
          break;
        case 'RESET TO BASE':
          Dispatcher.sendAction('RETURN_AUTO_BASE');
          break;
        default:

          break;
        }
    }
    //////////////////

  }


  function switch2function(bet){
    console.log('Switch 2 function');
    var execute = false;

    self.state.switch2.betcount++;

    if (bet.profit < 0){
    self.state.switch2.losscount++;
    self.state.switch2.cont_loss++;
    self.state.switch2.cont_win = 0;
    }else {
    self.state.switch2.wincount++;
    self.state.switch2.cont_loss = 0;
    self.state.switch2.cont_win++;
    }

    switch(self.state.switch2.type){
      case 'WINS':
          if (self.state.switch2.wincount >= self.state.switch2.num){
            execute = true;
            self.state.switch2.betcount = 0;
            self.state.switch2.losscount = 0;
            self.state.switch2.wincount = 0;
          }
        break;
      case 'LOSS':
          if (self.state.switch2.losscount >= self.state.switch2.num){
            execute = true;
            self.state.switch2.betcount = 0;
            self.state.switch2.losscount = 0;
            self.state.switch2.wincount = 0;
          }
        break;
      case 'BETS':
          if (self.state.switch2.betcount >= self.state.switch2.num){
            execute = true;
            self.state.switch2.betcount = 0;
            self.state.switch2.losscount = 0;
            self.state.switch2.wincount = 0;
          }
        break;
      case 'C.LOSS':
        if (self.state.switch2.cont_loss >= self.state.switch2.num){
          execute = true;
          self.state.switch2.betcount = 0;
          self.state.switch2.losscount = 0;
          self.state.switch2.wincount = 0;
          self.state.switch2.cont_loss = 0;
          self.state.switch2.cont_win = 0;
        }
        break;
      case 'C.WINS':
        if (self.state.switch2.cont_win >= self.state.switch2.num){
          execute = true;
          self.state.switch2.betcount = 0;
          self.state.switch2.losscount = 0;
          self.state.switch2.wincount = 0;
          self.state.switch2.cont_loss = 0;
          self.state.switch2.cont_win = 0;
        }
        break;
    }

    if (execute){
      switch (self.state.switch2.mode){
        case 'TABLE +':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE');
           break;
        case 'TABLE -':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE_DN');
           break;
        case 'RED/BLACK':
          switch_red();
          break;
        case 'ODD/EVEN':
          switch_odd();
          break;
        case '1-18/19-36':
          switch_S18();
          break;
        case '1-12/13-24/25-36':
          switch_D12();
          break;
        case 'ROW':
          switch_row();
          break;
        case 'ROW +':
          self.state.P_rowsel++;
          if(self.state.P_rowsel > 5){
            self.state.P_rowsel =  1;
          }
          break;
        case 'ROW -':
          self.state.P_rowsel--;
          if(self.state.P_rowsel < 1){
            self.state.P_rowsel =  5;
          }
          break;
        case 'STOP AUTO':
          self.state.Stop_Autobet = true;
          break;
        case 'CHANGE TARGET':
          Dispatcher.sendAction('TOGGLE_AUTO_COND');
          Dispatcher.sendAction( 'TOGGLE_BC_TARGET');
          if(worldStore.state.currGameTab == 'SLIDERS'){
            if (betStore.state.activesliders == 1){
            Dispatcher.sendAction('UPDATE_SLIDER_POS',Math.random()*(99.9999));
            }else {
            var positions = [(Math.random()*(99.9999)),(Math.random()*(99.9999))];
            Dispatcher.sendAction('UPDATE_SLIDER_POS',positions);
            }
            $("#ex1").slider('destroy');
            init_slider();
          }
          break;
        case 'RESET TO BASE':
          Dispatcher.sendAction('RETURN_AUTO_BASE');
          break;
        default:

          break;
        }
    }

  }

  function switch3function(bet){
    console.log('Switch 3 function');
    var execute = false;

    self.state.switch3.betcount++;

    if (bet.profit < 0){
    self.state.switch3.losscount++;
    self.state.switch3.cont_loss++;
    self.state.switch3.cont_win = 0;
    }else {
    self.state.switch3.wincount++;
    self.state.switch3.cont_loss = 0;
    self.state.switch3.cont_win++;
    }

    switch(self.state.switch3.type){
      case 'WINS':
          if (self.state.switch3.wincount >= self.state.switch3.num){
            execute = true;
            self.state.switch3.betcount = 0;
            self.state.switch3.losscount = 0;
            self.state.switch3.wincount = 0;
          }
        break;
      case 'LOSS':
          if (self.state.switch3.losscount >= self.state.switch3.num){
            execute = true;
            self.state.switch3.betcount = 0;
            self.state.switch3.losscount = 0;
            self.state.switch3.wincount = 0;
          }
        break;
      case 'BETS':
          if (self.state.switch3.betcount >= self.state.switch3.num){
            execute = true;
            self.state.switch3.betcount = 0;
            self.state.switch3.losscount = 0;
            self.state.switch3.wincount = 0;
          }
        break;
      case 'C.LOSS':
        if (self.state.switch3.cont_loss >= self.state.switch3.num){
          execute = true;
          self.state.switch3.betcount = 0;
          self.state.switch3.losscount = 0;
          self.state.switch3.wincount = 0;
          self.state.switch3.cont_loss = 0;
          self.state.switch3.cont_win = 0;
        }
        break;
      case 'C.WINS':
        if (self.state.switch3.cont_win >= self.state.switch3.num){
          execute = true;
          self.state.switch3.betcount = 0;
          self.state.switch3.losscount = 0;
          self.state.switch3.wincount = 0;
          self.state.switch3.cont_loss = 0;
          self.state.switch3.cont_win = 0;
        }
        break;
    }

    if (execute){
      switch (self.state.switch3.mode){
        case 'TABLE +':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE');
           break;
        case 'TABLE -':
           Dispatcher.sendAction('TOGGLE_SLOTS_TABLE_DN');
           break;
        case 'RED/BLACK':
          switch_red();
          break;
        case 'ODD/EVEN':
          switch_odd();
          break;
        case '1-18/19-36':
          switch_S18();
          break;
        case '1-12/13-24/25-36':
          switch_D12();
          break;
        case 'ROW':
          switch_row();
          break;
        case 'ROW +':
          self.state.P_rowsel++;
          if(self.state.P_rowsel > 5){
            self.state.P_rowsel =  1;
          }
          break;
        case 'ROW -':
          self.state.P_rowsel--;
          if(self.state.P_rowsel < 1){
            self.state.P_rowsel =  5;
          }
          break;
        case 'STOP AUTO':
          self.state.Stop_Autobet = true;
          break;
        case 'CHANGE TARGET':
          Dispatcher.sendAction('TOGGLE_AUTO_COND');
          Dispatcher.sendAction( 'TOGGLE_BC_TARGET');
          if(worldStore.state.currGameTab == 'SLIDERS'){
            if (betStore.state.activesliders == 1){
            Dispatcher.sendAction('UPDATE_SLIDER_POS',Math.random()*(99.9999));
            }else {
            var positions = [(Math.random()*(99.9999)),(Math.random()*(99.9999))];
            Dispatcher.sendAction('UPDATE_SLIDER_POS',positions);
            }
            $("#ex1").slider('destroy');
            init_slider();
          }
          break;
        case 'RESET TO BASE':
          Dispatcher.sendAction('RETURN_AUTO_BASE');
          break;
        default:

          break;
        }
    }

  }


  Dispatcher.registerCallback('AUTOBET_ROUTINE', function(bet) {
    self.state.Auto_betcount++;
    self.state.Auto_wagered += bet.wager;
    self.state.Auto_profit += bet.profit;

    /* //commented out to be more dynamic with coin_type
    switch(worldStore.state.coin_type){
      case 'BTC':
      case 'BITS':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.btc);
        break;
      case 'LTC':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.ltc);
        break;
      case 'DASH':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.dash);
        break;
        case 'ADK':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.adk);
        break;
        case 'GRLC':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.grlc);
        break;
        case 'FLASH':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.flash);
        break;
        case 'ETH':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.eth);
        break;  
      case 'DOGE':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.doge);
        break;
      case 'BXO':
        var balance = helpers.convSatstoCointype(worldStore.state.user.balances.bxo);
        break;  
    }
    //var balance = helpers.convSatstoCointype(worldStore.state.user.balance);
    */

   if (worldStore.state.coin_type == 'BITS'){
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances.btc);
    }else{
      var balance = helpers.convSatstoCointype(worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()]);
    }



    if (bet.profit > 0){//WIN STATE
      self.state.Auto_wincount++;
      self.state.wincounter++;
      if ((balance >= self.state.stophigher.num) && (self.state.stophigher.num != 0)){
          self.state.Stop_Autobet = true;
          console.log('STOP AUTO FROM WIN, BALANCE > STOP HIGHER');
        }
      if (self.state.Stop_on_win){
          self.state.Stop_on_win = false;
          self.state.Stop_Autobet = true;
          console.log('STOP AUTO FROM NEXT WIN');
      }  
      if (self.state.wincounter >= self.state.wintarget.num){
        switch(self.state.winmode){
          case 'MULTIPLY':
            self.state.wincounter = 0;
            if(worldStore.state.currGameTab == 'ROULETTE'){
              MultiplyAllChips(self.state.winmul.num);
            }else if (worldStore.state.currGameTab == 'WONDERW'){
              var n;
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW2.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW2.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT2',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW4.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW4.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT4',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW8.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW8.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT8',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW16.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW16.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT16',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW24.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW24.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT24',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW48.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW48.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT48',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW48b.num * self.state.winmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW48b.num * self.state.winmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT48b',{str: n.toString(), num: n});
            }else{
              var n;
              if (worldStore.state.coin_type === 'BITS'){
                n = (betStore.state.wager.num * self.state.winmul.num).toFixed(2);
              }else {
                n = (betStore.state.wager.num * self.state.winmul.num).toFixed(8);
              }
        //      if (n > balance){
        //        console.log('BALANCE TOO LOW TO COVER NEXT BET Balance: ' + balance + ' Wager: ' + n);
        //        self.state.Stop_Autobet = true;
        //      }else{
                Dispatcher.sendAction('UPDATE_WAGER', { str: n.toString() });
        //      }
            }
            break;
          case 'RESET TO BASE':
            self.state.wincounter = 0;
            Dispatcher.sendAction('RETURN_AUTO_BASE');
            break;
          case 'STOP AUTO':
            self.state.wincounter = 0;
            self.state.Stop_Autobet = true;
            console.log('STOP AUTO FROM WIN');
            break;
          case 'DO NOTHING':
          default:
            break;
        }
      }
      if (self.state.lossmode == 'DO NOTHING'){
        self.state.losscounter = 0;
      }
      self.emitter.emit('win_change', self.state);
    }else{//LOSS STATE
      self.state.Auto_losscount++;
      self.state.losscounter++;
      if((balance <= self.state.stoplower.num) && (self.state.stoplower.num != 0)){
        self.state.Stop_Autobet = true;
        console.log('STOP AUTO FROM BALANCE < STOP LOWER');
      }
      if (self.state.losscounter >= self.state.losstarget.num){
        switch(self.state.lossmode){
          case 'MULTIPLY':
            self.state.losscounter = 0;
            if(worldStore.state.currGameTab == 'ROULETTE'){
              MultiplyAllChips(self.state.lossmul.num);
            }else if (worldStore.state.currGameTab == 'WONDERW'){
              var n;
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW2.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW2.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT2',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW4.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW4.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT4',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW8.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW8.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT8',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW16.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW16.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT16',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW24.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW24.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT24',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW48.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW48.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT48',{str: n.toString(), num: n});
              if (worldStore.state.coin_type === 'BITS'){n = (betStore.state.wagerW48b.num * self.state.lossmul.num).toFixed(2);
              }else {n = (betStore.state.wagerW48b.num * self.state.lossmul.num).toFixed(8);}
              Dispatcher.sendAction('UPDATE_WAGER_SOFT48b',{str: n.toString(), num: n});
            }else{
              var n;
              if (worldStore.state.coin_type === 'BITS'){
                n = (betStore.state.wager.num * self.state.lossmul.num).toFixed(2);
              }else {
                n = (betStore.state.wager.num * self.state.lossmul.num).toFixed(8);
              }
            //  if (n > balance){
            //    console.log('BALANCE TOO LOW TO COVER NEXT BET Balance: ' + balance.toString() + ' Wager: ' + n.toString());
            //    self.state.Stop_Autobet = true;
            //  }else{
                Dispatcher.sendAction('UPDATE_WAGER', { str: n.toString() });
            //  }
            }
            break;
          case 'RESET TO BASE':
            self.state.losscounter = 0;
            Dispatcher.sendAction('RETURN_AUTO_BASE');
            break;
          case 'STOP AUTO':
            self.state.losscounter = 0;
            self.state.Stop_Autobet = true;
            console.log('STOP AUTO FROM LOSS');
            break;
          case 'DO NOTHING':
          default:
            break;
        }
      }
      if (self.state.winmode == 'DO NOTHING'){
        self.state.wincounter = 0;
      }
    self.emitter.emit('loss_change', self.state);
    }


    if (self.state.switch1.enable){
      switch1function(bet);
    }

    if (self.state.switch2.enable){
      switch2function(bet);
    }

    if ((self.state.switch3.enable)&&(worldStore.state.currGameTab != 'DICE')){
      switch3function(bet);
    }

  Dispatcher.sendAction('PLACE_AUTO_BET');
  self.emitter.emit('change', self.state);
  });

});

var UserBox = React.createClass({
  displayName: 'UserBox',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  _onLogout: function() {
    Dispatcher.sendAction('USER_LOGOUT');
  },
  _onRefreshUser: function() {
    Dispatcher.sendAction('START_REFRESHING_USER');
  },
  _openWithdrawPopup: function() {
    if ((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')||(worldStore.state.coin_type == 'CLAM')){
      $('#withdrawModal').modal('show');
    }else{
    var coin = worldStore.state.coin_type.toLowerCase();
    var windowUrl = config.mp_browser_uri + '/dialog/withdraw?app_id=' + config.app_id + '&coin=' + coin;
    var windowName = 'manage-auth';
    var windowOpts = [
      'width=420',
      'height=550',
      'left=100',
      'top=100'
    ].join(',');
    var windowRef = window.open(windowUrl, windowName, windowOpts);
    windowRef.focus();
    return false;
    }
  },
  _openDepositPopup: function() {

    if (worldStore.state.coin_type == 'BITS'){
      if (dep_qrcode != undefined){
        dep_qrcode.clear();
        dep_qrcode.makeCode(worldStore.state.user.addresses.btc);
      }
    }else{
      if (dep_qrcode != undefined){
        dep_qrcode.clear();
        dep_qrcode.makeCode(worldStore.state.user.addresses[worldStore.state.coin_type.toLowerCase()]);
      }
    }
    $('#depositModal').modal('show');

    /*
    if (worldStore.state.coin_type == 'DOGE'){
      if (dep_qrcode != undefined){
          dep_qrcode.clear();
          if (worldStore.state.user.dogeaddress){
            dep_qrcode.makeCode(worldStore.state.user.dogeaddress);
          }
        }
      $('#depositModal').modal('show');
    }else if (worldStore.state.coin_type == 'BXO'){
      if (dep_qrcodeBXO != undefined){
          dep_qrcodeBXO.clear();
          if(worldStore.state.user.bxoaddress){
            dep_qrcodeBXO.makeCode(worldStore.state.user.bxoaddress);
          }
        }
      $('#depositBXOModal').modal('show');
    }else if (worldStore.state.coin_type == 'CLAM'){
      if (dep_qrcodeCLAM != undefined){
          dep_qrcodeCLAM.clear();
          if(worldStore.state.user.clamaddress){
            dep_qrcodeCLAM.makeCode(worldStore.state.user.clamaddress);
          }
        }
      $('#depositCLAMModal').modal('show');
    }else{
    var coin = worldStore.state.coin_type.toLowerCase();
    var windowUrl = config.mp_browser_uri + '/dialog/deposit?app_id=' + config.app_id + '&coin=' + coin;
    var windowName = 'manage-auth';
    var windowOpts = [
      'width=420',
      'height=550',
      'left=100',
      'top=100'
    ].join(',');
    var windowRef = window.open(windowUrl, windowName, windowOpts);
    windowRef.focus();
    return false;
    }
    */


  },
  _onClick: function() {
   $('dropdown-toggle').dropdown();
  },
  _ClickBE:function(){
    $('#dogeModal').modal('show');
  },
  _ClickMP:function(){
    $('#mpModal').modal('show');
  },
  _onPopover: function() {
  // $('popover-btn').popover();
   $(function () {
     $('[data-toggle="popover"]').popover();
   });

   //console.log('hover POP');
  },
  _onPophide: function() {
   $('popover-btn').popover('hide');
   //console.log('mouseout POP');
  },
  _ActionClick: function(type){
    return function(){
      console.log('click action ' + type);
    };

  },

  render: function() {

    var innerNode;
    var nav_balance;
    var nav_uncbalance = 0;

    var stillAnimatingPucks = _.keys(worldStore.state.renderedPucks).length > 0;

    if (worldStore.state.isLoading) {
      innerNode = el.li(
        {className: 'navbar-text navbar-right'},
        'Loading...'
      );
    } else if (worldStore.state.user) {
            
      if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running)
        {
        nav_balance = worldStore.state.revealed_balance;
      }else{
        if (worldStore.state.coin_type == 'BITS'){
          nav_balance = worldStore.state.user.balances.btc;
          if (worldStore.state.user.unconfirmed.btc != 0){
            nav_uncbalance = worldStore.state.user.unconfirmed.btc;
          }else{
            nav_uncbalance = 0;
          }
        }else{
          nav_balance = worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()];
          if (worldStore.state.user.unconfirmed[worldStore.state.coin_type.toLowerCase()] != 0){
            nav_uncbalance = worldStore.state.user.unconfirmed[worldStore.state.coin_type.toLowerCase()];
          }else{
            nav_uncbalance = 0;
          }
      }
        /* //commented out to be more dynamic with coin_type
        switch(worldStore.state.coin_type){
          case 'BTC':
          case 'BITS':
            nav_balance = worldStore.state.user.balances.btc;
            if (worldStore.state.user.unconfirmed.btc != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.btc;
            }else{
              nav_uncbalance = 0;
            }
            break;
          case 'LTC':
            nav_balance = worldStore.state.user.balances.ltc;
            if (worldStore.state.user.unconfirmed.ltc != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.ltc;
            }else{
              nav_uncbalance = 0;
            }
            break;
          case 'DASH':
            nav_balance = worldStore.state.user.balances.dash;
            if (worldStore.state.user.unconfirmed.dash != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.dash;
            }else{
              nav_uncbalance = 0;
            }
            break;
            case 'ADK':
            nav_balance = worldStore.state.user.balances.adk;
            if (worldStore.state.user.unconfirmed.adk != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.adk;
            }else{
              nav_uncbalance = 0;
            }
            break;
            case 'GRLC':
            nav_balance = worldStore.state.user.balances.grlc;
            if (worldStore.state.user.unconfirmed.grlc != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.grlc;
            }else{
              nav_uncbalance = 0;
            }
            break;
            case 'FLASH':
            nav_balance = worldStore.state.user.balances.flash;
            if (worldStore.state.user.unconfirmed.flash != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.flash;
            }else{
              nav_uncbalance = 0;
            }
            break;
            case 'ETH':
            nav_balance = worldStore.state.user.balances.eth;
            if (worldStore.state.user.unconfirmed.eth != 0){
              nav_uncbalance = worldStore.state.user.unconfirmed.eth;
            }else{
              nav_uncbalance = 0;
            }
            break;   
          case 'DOGE':
            nav_balance = worldStore.state.user.balances.doge;
            break;
          case 'BXO':
            nav_balance = worldStore.state.user.balances.bxo;
            break;  
        }
        */
      }

      innerNode =  //el.ul(
        //{className: 'nav navbar-nav'},
        el.li(
          {className:'dropdown navbar-right'},
          el.a(
              {
                role:'button',
                className:'dropdown-toggle',
                "data-toggle":'dropdown',
                "aria-haspopup":'true',
                "aria-expanded":'false',
                onClick:this._onClick,
                style:{fontWeight:'bold',color:'lightgray'}
              },
              worldStore.state.user.uname,// + ', ' + 'Bal: '+ helpers.convNumtoStr(nav_balance) + ' '+  worldStore.state.coin_type + ' ',

              ((nav_uncbalance == 0)||(nav_uncbalance) == undefined )?
               '' : el.span( {  //type:'button',
                          id:'popover-btn',
                          'data-container':'body',
                          'data-trigger':'hover',
                          'data-toggle':'popover',
                          'data-placement':'bottom',
                          'data-content':  helpers.convNumtoStr(nav_uncbalance) + ' ' + worldStore.state.coin_type +' pending',
                           onMouseOver:this._onPopover
                        //  onMouseOut:this._onPophide
                          },
                el.span({className: 'glyphicon glyphicon-plus', style: { color: '#e67e22'}})
              ),
              el.span({className: 'glyphicon glyphicon-collapse-down'})
            ),
            el.ul({className:'dropdown-menu'},
              el.li(null, el.a({onClick: this._openDepositPopup},'DEPOSIT ',el.span({className: 'glyphicon glyphicon-save'}))),
              el.li(null, el.a({onClick: this._openWithdrawPopup},'WITHDRAW ',el.span({className: 'glyphicon glyphicon-open'}))),
              worldStore.state.user.dogelogin ? el.li(null, el.a({onClick: this._ClickBE},'Bit-Exo Settings',el.span({className: 'glyphicon glyphicon-cog'}))) : el.li(null, el.a({onClick: this._ClickBE},'Bit-Exo Login',el.span({className: 'glyphicon glyphicon-log-in'}))),
              el.li(null, el.a(
                 {
                  href: config.mp_browser_uri + '/apps/overview/' + config.app_id,
                  target: '_blank'
                 },
                 'VIEW ON MONEYPOT ', el.span({className: 'glyphicon glyphicon-new-window'})
                 )
              ),
              el.li(null, el.a({onClick: this._onLogout},'LOGOUT ',el.span({className: 'glyphicon glyphicon-log-out'})))
            )
        //)
      )

    } else {
      // User needs to login
     /* innerNode = el.li({className: 'nav navbar-right'},
          el.a(
            {
              href: config.mp_browser_uri + '/oauth/authorize' +
                '?app_id=' + config.app_id +
                '&redirect_uri=' + config.redirect_uri + '&response_type=confidential',
            },
            'Login with Moneypot ',el.span({className: 'glyphicon glyphicon-log-in'})
          )
      );*/
      innerNode = el.li(
        {className:'dropdown'},
        el.a({
              role:'button',
              className:'dropdown-toggle',
              "data-toggle":'dropdown',
              "aria-haspopup":'true',
              "aria-expanded":'false',
              onClick:this._onClick,
              style:{fontWeight:'bold',color:'lightgray'}
            },
            'LOGIN/REGISTER',
            el.span({className: 'glyphicon glyphicon-collapse-down'})
          ),
          el.ul({className:'dropdown-menu'},
            /* el.li(null, el.a({ href: config.mp_browser_uri + '/oauth/authorize' + '?app_id=' + config.app_id +
                              '&redirect_uri=' + config.redirect_uri + '&response_type=confidential',
                              },
                              'With Moneypot ',el.span({className: 'glyphicon glyphicon-log-in'})
                            )
            ), */
            el.li(null, el.a({onClick: this._ClickMP},'Login/Sign Up',el.span({className: 'glyphicon glyphicon-log-in'}))),
           // el.li(null, el.a({onClick: this._ClickBE},'Bit-Exo Login',el.span({className: 'glyphicon glyphicon-log-in'}))),
            el.li(null, el.a(
               {
                href: config.mp_browser_uri + '/apps/overview/' + config.app_id,
                target: '_blank'
               },
               'VIEW ON MONEYPOT ', el.span({className: 'glyphicon glyphicon-new-window'})
               )
            )
          )
    )

    }

    return innerNode;
  }
});


var Navbar = React.createClass({
  displayName: 'Navbar',
  _onStoreChange: function() {
    //$('collapse').collapse('show');
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
    worldStore.on('change_game_tab', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
    worldStore.off('change_game_tab', this._onStoreChange);
  },
  _onClick: function() {
   $('dropdown-toggle').dropdown();
  },
  _ActionClick: function(type){
    return function(){
      console.log('click action ' + type);
      Dispatcher.sendAction('CHANGE_GAME_TAB', type);
    };
  },
  _ActionClickCoin: function(type){
    return function(){
      if(config.debug){console.log('click action ' + type);}
      
      if ((type != worldStore.state.coin_type)&&(worldStore.state.user)){
        Dispatcher.sendAction('RESET_BET_STATS','ALL');
        if ((type == 'DOGE')&&((worldStore.state.coin_type != 'DOGE')||(worldStore.state.coin_type != 'BXO')||(worldStore.state.coin_type != 'CLAM'))){
          if (worldStore.state.user.dogelogin){
            setTimeout(function(){
              gethashfromsocket();
            },250);
          }else{
            $('#dogeModal').modal('show');
          }
        }else if ((type == 'BXO')&&((worldStore.state.coin_type != 'DOGE')||(worldStore.state.coin_type != 'BXO')||(worldStore.state.coin_type != 'CLAM'))){
          if (worldStore.state.user.dogelogin){
            setTimeout(function(){
              gethashfromsocket();
            },250);
          }else{
            $('#dogeModal').modal('show');
          }
        }else if ((type == 'CLAM')&&((worldStore.state.coin_type != 'DOGE')||(worldStore.state.coin_type != 'BXO')||(worldStore.state.coin_type != 'CLAM'))){
          if (worldStore.state.user.dogelogin){
            setTimeout(function(){
              gethashfromsocket();
            },250);
          }else{
            $('#dogeModal').modal('show');
          }
        }else if (((type != 'BXO')&&(type != 'DOGE'))&&((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')||(worldStore.state.coin_type == 'CLAM'))){
          setTimeout(function(){
            gethashfromsocket();
          },250);
        }

        /*
        if ((type == 'DOGE') && (worldStore.state.coin_type != 'DOGE')){
          Dispatcher.sendAction('RESET_BET_STATS','ALL');
          if (worldStore.state.user){
            Dispatcher.sendAction('UPDATE_USER', {
              balance: 0
            });
            if (worldStore.state.user.dogelogin){
              Dispatcher.sendAction('START_REFRESHING_USER');
            }
            setTimeout(function(){
              if (worldStore.state.user.dogelogin){
                Dispatcher.sendAction('START_REFRESHING_USER');
              }
            gethashfromsocket();},500);
          }
        }else if ((worldStore.state.coin_type == 'DOGE') && (type != 'DOGE')){
          Dispatcher.sendAction('RESET_BET_STATS','ALL');
          if (worldStore.state.user){
            Dispatcher.sendAction('UPDATE_USER', {
                balance: 0
              });
            setTimeout(function(){
              Dispatcher.sendAction('START_REFRESHING_USER');
              gethashfromsocket();},500);
          }
        }
        */
      }
      
      Dispatcher.sendAction('CHANGE_COIN_TYPE', type);
      if (type =='DOGE'){
        Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
       // $('#dogeModal').modal('show');
      }else if (type == 'BXO'){
        Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
      }else if (type == 'CLAM'){
        Dispatcher.sendAction('GET_CLAM_INVESTMENTS', null);
      }
  /*    if ((type == 'DOGE')||(type == 'LTC')||(type == 'DASH')){
        if  ((worldStore.state.currGameTab == 'POKER')||(worldStore.state.currGameTab == 'SLOTSPKR')){
          Dispatcher.sendAction('CHANGE_GAME_TAB', 'DICE');
        }
        if (type =='DOGE'){
          Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
          $('#dogeModal').modal('show');
        }
       // var testbox = document.getElementsByClassName('dogeModal');
       // console.log(testbox);
      } */
    };
  },
  _gotoJP: function(){
      console.log('CHANGE TO JP TAB');
      Dispatcher.sendAction('CHANGE_TAB', 'JACKPOT');
      setTimeout(function(){
        location.href = "#";
        location.href = "#jp_tab";
      },250);
  },
  render: function() {
   // var jackpotsize1;
  //  var jackpotsize2;

    //var jp_node;
    var conn_node;
    var balance = '0.00000000';
    var stillAnimatingPucks = _.keys(worldStore.state.renderedPucks).length > 0;
    if (worldStore.state.user){
      if ((worldStore.state.coin_type != 'DOGE')&&(worldStore.state.coin_type != 'BXO')&&(worldStore.state.coin_type != 'CLAM')&&(worldStore.state.coin_type != 'BITS')){
        balance = (worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()] * 0.00000001).toFixed(8);
      }else if (worldStore.state.coin_type == 'BITS'){
        balance = (worldStore.state.user.balances.btc / 100).toFixed(2);
      }else{
        balance = (worldStore.state.user.balances[worldStore.state.coin_type.toLowerCase()] * 1).toFixed(8)
      }
    }
      /*
    switch (worldStore.state.coin_type){
      case 'BTC':
        if (worldStore.state.user){
          if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
            balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
          }else{
            balance = (worldStore.state.user.balances.btc * 0.00000001).toFixed(8);
          }
        }
        jackpotsize1 = worldStore.state.jackpots.jp_btc_high;
        jackpotsize2 = worldStore.state.jackpots.jp_btc_low;
      break;
      case 'BITS':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance/100).toFixed(2);
        }else{
          balance = (worldStore.state.user.balances.btc/100).toFixed(2);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_btc_high;
        jackpotsize2 = worldStore.state.jackpots.jp_btc_low;
      break;
      case 'LTC':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
        }else{
          balance = (worldStore.state.user.balances.ltc * 0.00000001).toFixed(8);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_ltc_high;
        jackpotsize2 = worldStore.state.jackpots.jp_ltc_low;
      break;
      case 'DASH':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
        }else{
          balance = (worldStore.state.user.balances.dash * 0.00000001).toFixed(8);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_dash_high;
        jackpotsize2 = worldStore.state.jackpots.jp_dash_low;
      break;
      case 'ADK':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
        }else{
          balance = (worldStore.state.user.balances.adk * 0.00000001).toFixed(8);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_adk_high;
        jackpotsize2 = worldStore.state.jackpots.jp_adk_low;
      break;
      case 'GRLC':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
        }else{
          balance = (worldStore.state.user.balances.grlc * 0.00000001).toFixed(8);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_grlc_high;
        jackpotsize2 = worldStore.state.jackpots.jp_grlc_low;
      break;
      case 'FLASH':
      if (worldStore.state.user){
        if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
          balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
        }else{
          balance = (worldStore.state.user.balances.flash * 0.00000001).toFixed(8);
        }
      }
        jackpotsize1 = worldStore.state.jackpots.jp_flash_high;
        jackpotsize2 = worldStore.state.jackpots.jp_flash_low;
      break;
      case 'DOGE':
        if (worldStore.state.user){
          if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
            balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
          }else{
            balance = (worldStore.state.user.balances.doge * 0.00000001).toFixed(8);
          }
        }
        jackpotsize1 = worldStore.state.jackpots.jp_doge_high;
        jackpotsize2 = worldStore.state.jackpots.jp_doge_low;
      break;
      case 'BXO':
        if (worldStore.state.user){
          if (stillAnimatingPucks||worldStore.state.rt_spin_running||worldStore.state.plinko_running){
            balance = (worldStore.state.revealed_balance * 0.00000001).toFixed(8);
          }else{
            balance = (worldStore.state.user.balances.bxo * 0.00000001).toFixed(8);
          }
        }
        jackpotsize1 = worldStore.state.jackpots.jp_bxo_high;
        jackpotsize2 = worldStore.state.jackpots.jp_bxo_low;
      break;
    } */

   /* jp_node = el.a({
                role:'button',
                className:'btn btn-block btn-success',
                onClick: this._gotoJP
              },
              el.div({style:{marginTop:'-11px',fontWeight:'bold', color:'white'}}, 'Jackpot 1: ' + helpers.commafy(helpers.convSatstoCointype(jackpotsize1).toString()) + ' ' + worldStore.state.coin_type),
              el.div({style:{marginBottom:'-11px',fontWeight:'bold', color:'white'}}, 'Jackpot 2: ' + helpers.commafy(helpers.convSatstoCointype(jackpotsize2).toString()) + ' ' + worldStore.state.coin_type)
              )
     */       
    conn_node = el.a(null,
      'Status: ',
       worldStore.state.connection == 'CONNECTED' ? el.span({className: 'glyphicon glyphicon-ok-circle', style:{color:'green'}}) : el.span({className: 'glyphicon glyphicon-ban-circle', style:{color:'red'}})
    )
  /*  if (worldStore.state.user){
      if (worldStore.state.user.role == 'OWNER'){
        var pkrnode = el.li(null, el.a({role:'button',onClick: this._ActionClick('POKER')},'POKER'));
      }else{
        var pkrnode = '';
      }
    }else{
      var pkrnode = '';
    } */         
    return el.div({className:'navbar navbar-default'},
      el.div({className:'container-fluid'},
        el.div({className:'navbar-header'},
          el.button({type:"button", className:"navbar-toggle", "data-toggle":"collapse", "data-target":"#myNavbar"},
            el.span({className: "icon-bar"}),
            el.span({className: "icon-bar"}),
            el.span({className: "icon-bar"})                       
          ),
          el.a({className: 'navbar-brand', href:'/'}, 'Welcome to ',
           el.span({style:{color:'red', fontWeight:'bold'}},config.app_name)
          ),
          el.li({className:'nav navbar-nav navbar-right visible-xs-block h5'},balance + ' ' + worldStore.state.coin_type)
        ),
        
        el.div({className:"collapse navbar-collapse", id:"myNavbar"},
        el.div({className:'nav navbar-nav col-sm-4 col-md-6'},
        el.li(
          {className:'dropdown navbar-left'},
          el.a(
              {
                role:'button',
                className:'dropdown-toggle',
                "data-toggle":'dropdown',
                "aria-haspopup":'true',
                "aria-expanded":'false',
                onClick:this._onClick,
                style:{fontWeight:'bold',color:'lightgray'} 
              },
              'GAME: '+ worldStore.state.currGameTab + ' ', el.span({className:'caret'},'')
            ),
            el.ul({className:'dropdown-menu'},
              el.li(null, el.a({role:'button',onClick: this._ActionClick('DICE')},'DICE')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('PLINKO')},'PLINKO')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('ROULETTE')},'ROULETTE')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('BITSWEEP')},'BITSWEEP')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('SLOTS')},'SLOTS')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('BITCLIMBER')},'BITCLIMBER')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('SLIDERS')},'SLIDERS')),
              el.li(null, el.a({role:'button',onClick: this._ActionClick('POKER')},'POKER')),
        //    worldStore.state.coin_type == 'DOGE' ? '' : el.li(null, el.a({role:'button',onClick: this._ActionClick('SLOTSPKR')},'SLOTS & GO POKER')),
            el.li(null, el.a({role:'button',onClick: this._ActionClick('WONDERW')},'WONDER WHEEL'))
            )
          ),
          el.li({className:'hidden-xs hidden-sm navbar-left'},
            conn_node
          ),

        //  el.li({className:'hidden-xs hidden-sm navbar-right'}, jp_node)
        ),
        el.div({className:'nav navbar-nav navbar-right'},
          el.li({className:'dropdown'},
            el.a({
                  role:'button',
                  className:'dropdown-toggle',
                  "data-toggle":'dropdown',
                  "aria-haspopup":'true',
                  "aria-expanded":'false',
                  onClick:this._onClick,
                  style:{fontWeight:'bold',color:'lightgray'} 
                  },
                  balance + ' ' +worldStore.state.coin_type + ' ', el.span({className:'caret'},'')
            ),
            el.ul({className:'dropdown-menu'},
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('BTC')},(worldStore.state.user ? (worldStore.state.user.balances.btc * 0.00000001).toFixed(8) :'0.00000000') + ' BTC')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('BITS')},(worldStore.state.user ? (worldStore.state.user.balances.btc/100).toFixed(2) :'0.00000000') +' BITS')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('LTC')},(worldStore.state.user ? (worldStore.state.user.balances.ltc * 0.00000001).toFixed(8) :'0.00000000') +' LTC')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('DASH')},(worldStore.state.user ? (worldStore.state.user.balances.dash * 0.00000001).toFixed(8) :'0.00000000') +' DASH')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('ADK')},(worldStore.state.user ? (worldStore.state.user.balances.adk * 0.00000001).toFixed(8) :'0.00000000') +' ADK')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('GRLC')},(worldStore.state.user ? (worldStore.state.user.balances.grlc * 0.00000001).toFixed(8) :'0.00000000') +' GRLC')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('FLASH')},(worldStore.state.user ? (worldStore.state.user.balances.flash * 0.00000001).toFixed(8) :'0.00000000') +' FLASH')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('ETH')},(worldStore.state.user ? (worldStore.state.user.balances.eth * 0.00000001).toFixed(8) :'0.00000000') +' ETH')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('MBI')},(worldStore.state.user ? (worldStore.state.user.balances.mbi * 0.00000001).toFixed(8) :'0.00000000') +' MBI')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('WAVES')},(worldStore.state.user ? (worldStore.state.user.balances.waves * 0.00000001).toFixed(8) :'0.00000000') +' WAVES')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('DOGE')},(worldStore.state.user ? (worldStore.state.user.balances.doge * 1).toFixed(8) :'0.00000000') +' DOGE')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('BXO')},(worldStore.state.user ? (worldStore.state.user.balances.bxo * 1).toFixed(8) :'0.00000000') +' BXO')),
              el.li(null, el.a({role:'button',onClick: this._ActionClickCoin('CLAM')},(worldStore.state.user ? (worldStore.state.user.balances.clam * 1).toFixed(8) :'0.00000000') +' CLAM'))
            )
          ),
          React.createElement(UserBox, null)
        )
        )
      )
    ); 
  }
});

var Newsbar = React.createClass({
  displayName: 'Newsbar',
  _onStoreChange: function() {
    this.forceUpdate();
    var self = this;
    setTimeout(function(){
      self.forceUpdate();
    },5000);
  },
  componentDidMount: function() {
    worldStore.on('news_info_update', this._onStoreChange);
    //chatStore.on('new_message', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('news_info_update', this._onStoreChange);
    //chatStore.off('new_message', this._onStoreChange);
  },
   render: function() {
     return el.div(
       null,
       el.div({className:'panel panel-warning'},
        el.div({className:'panel-body'},
        el.div({className:'text-center'},
          el.span({style:{color:'lightgray',fontWeight:'bold'}},
             filteredmessage(worldStore.state.news_info, {level:10, role:'OWNER'})
            )
          )
        )
       )
     );
   }
 });



 var GameBox = React.createClass({
   displayName: 'GameBox',
   _onStoreChange: function() {
     this.forceUpdate();
   },
   componentDidMount: function() {
     worldStore.on('change_game_tab', this._onStoreChange);
   },
   componentWillUnmount: function() {
     worldStore.off('change_game_tab', this._onStoreChange);
   },
    render: function() {
      var innerNode;

      switch(worldStore.state.currGameTab){
        case 'DICE':
          console.log('Loading Dice');
          innerNode = el.div(null,React.createElement(DiceGameTabContent, null));
          break;
        case 'PLINKO':
          if (worldStore.state.plinko_loaded){
            innerNode = el.div(null,React.createElement(PlinkoGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Plinko');
            document.body.appendChild(document.createElement('script')).src="../app/plinko.js";
          }
          break;
        case 'ROULETTE':
          if (worldStore.state.roulette_loaded){
            innerNode = el.div(null,React.createElement(RouletteGameTabContent, null));
            clearAllChips();
            rt_buttongen = setInterval(buttongen, 100);
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Roulette');
            document.body.appendChild(document.createElement('script')).src="../app/roulette.js";
          }
          break;
        case 'BITSWEEP':
          if (worldStore.state.bitsweep_loaded){
            innerNode = el.div(null,React.createElement(BitsweepGameTabContent, null));
            BS_buttongen = setInterval(bsbuttongen, 100);
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Bitsweep');
            document.body.appendChild(document.createElement('script')).src="../app/bitsweep.js";
          }
          break;
        case 'SLOTS':
          if (worldStore.state.slots_loaded){
            innerNode = el.div(null,React.createElement(SlotsGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Slots');
            document.body.appendChild(document.createElement('script')).src="../app/slots.js";
          }
          break;
        case 'BITCLIMBER':
          if (worldStore.state.bitclimber_loaded){
            innerNode = el.div(null,React.createElement(BitClimberGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Bit Climber');
            document.body.appendChild(document.createElement('script')).src="../app/bitclimber.js";
          }
            break;
        case 'SLIDERS':
          if (worldStore.state.sliders_loaded){
            innerNode = el.div(null,React.createElement(SlidersGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Sliders');
            document.body.appendChild(document.createElement('script')).src="../app/sliders.js";
          }
            break;
        case 'POKER':
          if (worldStore.state.poker_loaded){
            innerNode = el.div(null,React.createElement(PokerGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Poker');
            document.body.appendChild(document.createElement('script')).src="../app/poker.js";
          }
            break;
        case 'SLOTSPKR':
          if (worldStore.state.spnpoker_loaded){
            innerNode = el.div(null,React.createElement(SpnPokerGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Loading Spin & Go Poker');
            document.body.appendChild(document.createElement('script')).src="../app/spnpoker.js";
          }
            break;
        case 'WONDERW':
          if (worldStore.state.wonderw_loaded){
            innerNode = el.div(null,React.createElement(WonderWGameTabContent, null));
          }else {
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
            console.log('Wonder Wheel');
            document.body.appendChild(document.createElement('script')).src="../app/wonderw.js";
          }
            break;    
        case 'LOADING':
            innerNode = el.div({className:'panel panel-primary'},el.span({className:'glyphicon glyphicon-refresh rotate'}));
          break;
        default:
          innerNode = el.div(null,React.createElement(ChatBoxInput, null));
          break;
      }

      return el.div(
        null,
        //el.div({className:'panel panel-primary'},
          innerNode
        //)
      );
    }
  });


  var emojilist = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉',
                 '😌','😍','😘','😗','😙','😚','😋','😜','😝','😛','🤑','🤗','🤓','😎',
                 '🤡','🤠','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩',
                 '😤','😠','😡','😶','😐','😑','😯','😦','😧','😮','😲','😵','😳','😱',
                 '😨','😰','😢','😥','🤤','😭','😓','😪','😴','🙄','🤔','🤥','😬','🤐',
                 '🤢','🤧','😷','🤒','🤕','😈','👿','👹','👺','💩','👻','💀','☠️','👽',
                 '👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','👐','🙌',
                 '👏','🙏','🤝','👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤘','👌','👈','👉',
                 '👆','👇','☝','️✋','🤚','🖐','🖖','👋','🤙','💪','🖕','✍️','🤳','💅','🖖',
                 '💄','💋','👄','👣','👀','👤','👥','👶','👦','👧','👨',
                 '👩','👱‍','👱','👴','👵','👲','👳','👮','👷','💂','👩‍🔬','👨‍🔬','👩‍🎨','👨‍🎨','👩‍🚒',
                 '👨‍🚒','👩‍🚀','👨‍🚀','🤶','🎅','👸',
                 '🤴','👰','🤵','👼','🙇','💁','🙅','🙆','🙋','🙎','🙍','💇','💆'];  

  var textinput;
  var ChatBoxInput = React.createClass({
    displayName: 'ChatBoxInput',
    Tag:'ChatBoxInput',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    componentDidMount: function() {
      chatStore.on('change', this._onStoreChange);
      worldStore.on('change', this._onStoreChange);
    },
    componentWillUnmount: function() {
      chatStore.off('change', this._onStoreChange);
      worldStore.off('change', this._onStoreChange);
    },
    //
    getInitialState: function() {
      return { text: '' };
    },
    // Whenever input changes
    _onChange: function(e) {
      this.setState({ text: e.target.value });
    },
    // When input contents are submitted to chat server
    _onSend: function() {
      var self = this;

      switch(chatStore.state.currTab){
        case 'MAIN':
        case 'RUSSIAN_RM':
        case 'FRENCH_RM':
        case 'SPANISH_RM':
        case 'PORTUGUESE_RM':
       // case 'DUTCH_RM':
        case 'GERMAN_RM':
        case 'HINDI_RM':
       // case 'CHINESE_RM':
       // case 'JAPANESE_RM':
       // case 'KOREAN_RM':
        case 'FILIPINO_RM':
        case 'INDONESIAN_RM':
        case 'MODS_RM':
          Dispatcher.sendAction('SEND_MESSAGE', this.state.text.substring(0,250));
          this.setState({ text: '' });
          break;
        default:
          var loadtext = '/pm ' + chatStore.state.currTab + ' ' + this.state.text.substring(0,250);
          console.log('sent on pm');
          Dispatcher.sendAction('SEND_MESSAGE', loadtext);
          this.setState({ text: '' });
          break;
      }


    },
    _onFocus: function() {
      // When users click the chat input, turn off bet hotkeys so they
      // don't accidentally bet
      if (worldStore.state.hotkeysEnabled) {
        Dispatcher.sendAction('DISABLE_HOTKEYS');
      }
    },
    _onKeyPress: function(e) {
      var ENTER = 13;
      if (e.which === ENTER) {
        if (this.state.text.trim().length > 0) {
          this._onSend();
        }
      }
    },
    _onClick: function() {
     $('dropdown-toggle').dropdown();
    },
    _ActionClick: function(type){
      return function(){
        console.log('click action ' + type);
        textinput.setState({ text: textinput.state.text + type });
      //  textinput.state.text += type;
      };
    },
    render: function() {
      textinput = this;
      var emj_row = Math.ceil(emojilist.length/6);
      var emj_pop = [];
      var emj_li = [];
      for (var x = 0; x < emj_row; x++){
        emj_li = [];
        for (var y = x * 6; y < ((x*6)+6); y++){
          emj_li.push(el.li({style:{fontWeight:'bold'}}, el.div({role:'button', onClick: this._ActionClick(emojilist[y])},emojilist[y])))
        }
        emj_pop.push(el.li(null,
                      el.ul({className:'list-inline', style:{marginBottom:'4px'}},
                          emj_li
                      )
                    )
          )
      }
      return (
        el.div(
          {className: 'row'},
          el.div(
            {className: 'col-md-9'},
            chatStore.state.loadingInitialMessages ?
              el.div(
                {
                  style: {marginTop: '7px'},
                  className: 'text-muted'
                },
                el.span(
                  {className: 'glyphicon glyphicon-refresh rotate'}
                ),
                ' Loading...'
              )
            :
            el.div({className:'input-group'},
              el.input(
                {
                  id: 'chat-input',
                  className: 'form-control',
                  type: 'text',
                  value: this.state.text,
                  placeholder: worldStore.state.user ?
                    'Click here and begin typing...' :
                    'Login to chat',
                  onChange: this._onChange,
                  onKeyPress: this._onKeyPress,
                  onFocus: this._onFocus,
                  ref: 'input',
                  // TODO: disable while fetching messages
                  disabled: !worldStore.state.user || chatStore.state.loadingInitialMessages
                }
              ),
              el.span({className:'input-group-btn'},el.div(
                {className:'dropup'},
                el.div(
                    {
                      role:'button',
                      className:'dropdown-toggle h6',
                      "data-toggle":'dropdown',
                      'data-container':'body',
                      "aria-haspopup":'true',
                      "aria-expanded":'false',
                      onClick:this._onClick,
                      style:{fontWeight:'bold'}
                    },
                    emojilist[0]
                  ), //
                  el.ul({className:'dropdown-menu'},
                    emj_pop
                    /*el.li(null,
                        el.ul({className:'list-inline'},
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F601}')},'\u{1F601}')),
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F602}')},'\u{1F602}')),
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F603}')},'\u{1F603}')),
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F604}')},'\u{1F604}')),
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F605}')},'\u{1F605}')),
                          el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F606}')},'\u{1F606}'))
                        )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F607}')},'\u{1F607}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F608}')},'\u{1F608}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F609}')},'\u{1F609}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60A}')},'\u{1F60A}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60B}')},'\u{1F60B}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60C}')},'\u{1F60C}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60D}')},'\u{1F60D}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60E}')},'\u{1F60E}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F60F}')},'\u{1F60F}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F610}')},'\u{1F610}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F611}')},'\u{1F611}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F612}')},'\u{1F612}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F613}')},'\u{1F613}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F614}')},'\u{1F614}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F615}')},'\u{1F615}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F616}')},'\u{1F616}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F617}')},'\u{1F617}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F618}')},'\u{1F618}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F619}')},'\u{1F619}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61A}')},'\u{1F61A}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61B}')},'\u{1F61B}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61C}')},'\u{1F61C}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61D}')},'\u{1F61D}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61E}')},'\u{1F61E}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F61F}')},'\u{1F61F}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F620}')},'\u{1F620}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F621}')},'\u{1F621}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F622}')},'\u{1F622}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F623}')},'\u{1F623}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F624}')},'\u{1F624}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F625}')},'\u{1F625}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F626}')},'\u{1F626}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F627}')},'\u{1F627}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F628}')},'\u{1F628}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F629}')},'\u{1F629}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62A}')},'\u{1F62A}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62B}')},'\u{1F62B}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62C}')},'\u{1F62C}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62D}')},'\u{1F62D}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62E}')},'\u{1F62E}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F62F}')},'\u{1F62F}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F630}')},'\u{1F630}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F631}')},'\u{1F631}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F631}')},'\u{1F632}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F633}')},'\u{1F633}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F634}')},'\u{1F634}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F635}')},'\u{1F635}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F636}')},'\u{1F636}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F637}')},'\u{1F637}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F638}')},'\u{1F638}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F639}')},'\u{1F639}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63A}')},'\u{1F63A}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63B}')},'\u{1F63B}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63C}')},'\u{1F63C}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63D}')},'\u{1F63D}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63E}')},'\u{1F63E}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F63F}')},'\u{1F63F}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F640}')},'\u{1F640}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F641}')},'\u{1F641}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F642}')},'\u{1F642}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F645}')},'\u{1F645}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F646}')},'\u{1F646}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F647}')},'\u{1F647}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F648}')},'\u{1F648}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F649}')},'\u{1F649}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64A}')},'\u{1F64A}'))
                      )
                    ),
                    el.li(null,
                      el.ul({className:'list-inline'},
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64B}')},'\u{1F64B}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64C}')},'\u{1F64C}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64D}')},'\u{1F64D}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64E}')},'\u{1F64E}')),
                        el.li({style:{fontWeight:'bold'}}, el.div({onClick: this._ActionClick('\u{1F64F}')},'\u{1F64F}'))
                      )
                    )*/
                  )
              ))
            )
          ),
          el.div(
            {className: 'col-md-3'},
            el.button(
              {
                type: 'button',
                className: 'btn btn-default btn-block',
                disabled: !worldStore.state.user ||
                  chatStore.state.waitingForServer ||
                  this.state.text.trim().length === 0,
                onClick: this._onSend
              },
              'Send'
            )
          )
        )
      );
    }
  });


  var ChatUserList = React.createClass({
    displayName: 'ChatUserList',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    _onUserListToggle: function() {
      Dispatcher.sendAction('TOGGLE_CHAT_USERLIST');
    },
    _onclick:function(uname){
      return  function () {
        Dispatcher.sendAction('UPDATE_INPUT_STRING',uname);
      }
    },
    render: function() {
      var self = this;
      var windowheight;
      var windowwidth;

      var GameEle = document.getElementsByClassName('Game_Box')
        if(GameEle[0]){
          windowheight = GameEle[0].firstChild.clientHeight - 200;
          windowwidth = GameEle[0].firstChild.clientWidth;
        }else{
          windowheight = 245;
          windowwidth = 1440;
        }
        if (windowheight < 245){
            windowheight = 245;
        }else if (windowheight > 700){
          windowheight = 700;
        }

        if (windowwidth < 770){
          windowheight = 245;
        }
      var listcopy = _.values(chatStore.state.userList);
      var sortedlist = [];
      if (listcopy.length > 1){
        for (x = 0; x < listcopy.length; x++){
          if (listcopy[x].role == 'OWNER'){
            sortedlist.push(listcopy[x]);
          }
        }
        for (x = 0; x < listcopy.length; x++){
          if (listcopy[x].role == 'MOD'){
            sortedlist.push(listcopy[x]);
          }
        }
        for (x = 0; x < listcopy.length; x++){
          if ((listcopy[x].role != 'OWNER')&&(listcopy[x].role != 'MOD')){
            sortedlist.push(listcopy[x]);
          }
        }

      }else {
        sortedlist = listcopy;
      }

      return (
      //  el.div(
      //    null,
            el.div(
              {className: 'chat-list list-unstyled', ref: 'chatListRef',style:{marginRight: '-10px', marginLeft:'-8px',height:windowheight.toString()+'px'}},
              //_.values(chatStore.state.userList).map(function(u) {
                sortedlist.map(function(u) {
                return el.li(
                  {
                    key: u.uname
                  },
                  helpers.roleToLabelElement(u),
                  ' ',
                  el.code({
                    //type: 'button',
                    //className: 'btn-xs',
                    disabled: !worldStore.state.user,
                    onClick: self._onclick(u.uname)
                    //style: {color:'red'}
                    },
                    u.uname
                  ),
                  el.code(null,u.level)
                );
              })
            )
      //  )
      );
    }
  });


  var filteredmessage = function (rawtext,user){
    var linktext = undefined;
    var stringbefore = '';
    var stringafter = '';
    var intext = rawtext + '';
    var splittextarray = intext.split(" ");
    var outputarray = [];
    
    for (var x = 0; x < splittextarray.length; x++){
      if ((splittextarray[x].substring(0, 7) == "http://")||(splittextarray[x].substring(0, 8) == "https://")){
        if (splittextarray[x].substring(0, 21) == "https://bit-exo.com/?"){
          outputarray.push(el.span({style:{color:'DarkGray'}},
            '<Link Blocked>'
          ));
        }else if ((user.level < 2)&&((user.role != 'MOD')||(user.role != 'OWNER')||(user.role != 'ADMIN'))){
            outputarray.push(el.span({style:{color:'DarkGray'}},
            '<Link Blocked>'
            ));
          }else{
            outputarray.push(el.span(null, el.a(
              {
                href: splittextarray[x],
                target: '_blank',
                disabled: chatStore.state.loadingInitialMessages
              }, splittextarray[x] + ' ')
            ));
          }
        }else if (splittextarray[x].substring(0, 3) == "ID:"){
        var trim = splittextarray[x];
        var temp = trim.slice(3);
        var link = 'https://www.moneypot.com/bets/'+ temp;
        outputarray.push(el.span(null, el.a(
          {
            href: link,
            target: '_blank',
            disabled: chatStore.state.loadingInitialMessages
          }, splittextarray[x] + ' ')
        ));
        }else if (splittextarray[x].substring(0, 4) == "BID:"){
        var trim = splittextarray[x];
        var temp = trim.slice(4);
        var link = 'https://bit-exo.com/bets/'+ temp;
        outputarray.push(el.span(null, el.a(
          {
            href: link,
            target: '_blank',
            disabled: chatStore.state.loadingInitialMessages
          }, splittextarray[x] + ' ')
        ));

      }else{
        outputarray.push(el.span({style:{color:'DarkGray'}},
            splittextarray[x] + ' '
          ));
      }
      
    }
    
   return el.span(null, outputarray);
    /*
    for (var x = 0; x < splittextarray.length; x++){
        if ((splittextarray[x].substring(0, 7) == "http://") || (splittextarray[x].substring(0, 8) == "https://") || (splittextarray[x].substring(0, 3) == "ID:")|| (splittextarray[x].substring(0, 4) == "BID:")){
            if (x > 0){
              for (var y = 0; y < x; y++){
                stringbefore += splittextarray[y] + ' ';
              }
            }
            if (splittextarray[x].substring(0, 21) == "https://bit-exo.com/?"){
              linktext = '<LINK BLOCKED>';
            }else if((user.level >= 2)||(splittextarray[x].substring(0, 3) == "ID:")||(splittextarray[x].substring(0, 4) == "BID:")||(user.role =='MOD')||(user.role =='OWNER')||(user.role =='ADMIN')){
              linktext = splittextarray[x];
            } else{
              linktext = '<LINK BLOCKED>';
            }

            for (var y = x+1; y < splittextarray.length; y++){
              stringafter += splittextarray[y] + ' ';
            }
          }
      }
    if (linktext == '<LINK BLOCKED>'){
      return el.span({style:{color:'DarkGray'}},stringbefore + linktext + ' ' + stringafter);
    }else if ((linktext)&&(!linkmute)){
      if (linktext.substring(0, 3) == "ID:"){
        var trim = linktext;
        var temp = trim.slice(3);
    //    trim.shift();
    //    trim.shift();
    //    trim.shift();
        var link = 'https://www.moneypot.com/bets/'+ temp;
      }else if (linktext.substring(0, 4) == "BID:"){
        var trim = linktext;
        var temp = trim.slice(4);
    //    trim.shift();
    //    trim.shift();
    //    trim.shift();
        var link = 'https://bit-exo.com/bets/'+ temp;
      }else {
        var link = linktext;
      }
      return el.span({style:{color:'DarkGray'}},stringbefore,
              el.span(null,
                  el.a(
                      {
                        href: link,
                        target: '_blank',
                        disabled: chatStore.state.loadingInitialMessages
                      }, linktext + ' '),
                      el.span({style:{color:'DarkGray'}},
                        stringafter
                      )
                    )
            );
    }else{
      return el.span({style:{color:'DarkGray'}},intext);
    }
    ////////
    */

  };

  var filteredlevel = function (level){
  
    var thislevel = level;
    if (thislevel == 0){
      return el.span({style:{color:'DarkGray'}},'');
    }else if (thislevel == 1){
      return el.span({className: 'glyphicon glyphicon-star-empty', style:{color:'Gold'}});
    }else if (thislevel == 2){
      return el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}});
    }else if (thislevel == 3){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star-empty', style:{color:'Gold'}})
        );
    }else if (thislevel == 4){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}})
        );
    }else if (thislevel == 5){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star-empty', style:{color:'Gold'}})
        );
    }else if (thislevel == 6){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}})
        );
    }else if (thislevel == 7){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star-empty', style:{color:'Gold'}})
        );
    }else if (thislevel == 8){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}})
        );
    }else if (thislevel == 9){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star-empty', style:{color:'Gold'}})
        );
    }else if (thislevel == 10){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Gold'}})
        );
    }else if (thislevel == 11){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}})
        );
    }else if (thislevel == 12){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}})
        );
    }else if (thislevel == 13){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}})
        );
    }else if (thislevel == 14){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}})
        );
    }else if (thislevel == 15){
      return el.span(null,
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}}),
          el.span({className: 'glyphicon glyphicon-star', style:{color:'Red'}})
        );
    }else{
      return el.span({style:{color:'DarkGray'}},'');
    }
  };


  var chatwindow;

  var ChatBox = React.createClass({
    displayName: 'ChatBox',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    _onNewMessage: function() {

      if (chatStore.state.showChat)
        {
         if (chatStore.state.newmsg == true){
           Dispatcher.sendAction('CLEAR_NEWMSG');
          }
        var node = ReactDOM.findDOMNode(this.refs.chatListRef);
        // Only scroll if user is within 100 pixels of last message
        var shouldScroll = function() {
          var distanceFromBottom = node.scrollHeight - ($(node).scrollTop() + $(node).innerHeight());
          console.log('DistanceFromBottom:', distanceFromBottom);
          return distanceFromBottom <= 150;
        };
        if (shouldScroll()) {
          this._scrollChat();
        }

        }else{
          if (chatStore.state.newmsg == false)
          Dispatcher.sendAction('SET_NEWMSG');
        }
    },
    _scrollChat: function() {
      var node = ReactDOM.findDOMNode(this.refs.chatListRef);
      if (node){$(node).scrollTop(node.scrollHeight);}
    },
    componentDidMount: function() {
      AutobetStore.on('chat_size',this._onStoreChange);
      chatStore.on('change', this._onStoreChange);
      chatStore.on('new_message', this._onNewMessage);
      chatStore.on('init', this._scrollChat);
    },
    componentWillUnmount: function() {
      AutobetStore.off('chat_size',this._onStoreChange);
      chatStore.off('change', this._onStoreChange);
      chatStore.off('new_message', this._onNewMessage);
      chatStore.off('init', this._scrollChat);
    },
    _onUserListToggle: function() {
      Dispatcher.sendAction('TOGGLE_CHAT_USERLIST');
    },
    _onChatToggle: function() {
      if (chatStore.state.showUserList)
        {Dispatcher.sendAction('TOGGLE_CHAT_USERLIST');}
      Dispatcher.sendAction('TOGGLE_CHAT');
    },
    _onclick:function(uname){
      return  function () {
        Dispatcher.sendAction('UPDATE_INPUT_STRING',uname);
      }
    },
    _onClickD: function() {
     $('dropdown-toggle').dropdown();
    },
    _onclick_room:function(room){
      return  function () {
        Dispatcher.sendAction('CHANGE_CHAT_ROOM',room);
      }
    },
     render: function() {
       var self = this;
       chatwindow = this;
       var innerNode;
      //chat-list
      //height: 245px;
      var language = 'ENGLISH';

      switch(chatStore.state.chat_room){
        case 'ENGLISH_RM':
          language = 'ENGLISH';
          break;
        case 'RUSSIAN_RM':
          language = 'РУССКИЙ';
          break;
        case 'FRENCH_RM':
          language = 'FRANÇAIS';
          break;
        case 'SPANISH_RM':
          language = 'ESPAÑOL';
          break;
        case 'PORTUGUESE_RM':
          language = 'PORTUGUÊS';
          break;
       // case 'DUTCH_RM':
       //   language = 'NEDERLANDS';
       //   break;
        case 'GERMAN_RM':
          language = 'DEUTSCH';
          break;
        case 'HINDI_RM':
          language = 'हिंदी';
          break;
       // case 'CHINESE_RM':
       //   language = '中文';
       //   break;
       // case 'JAPANESE_RM':
       //   language = '日本語';
       //   break;
       // case 'KOREAN_RM':
       //   language = '한국어';
       //   break;
        case 'FILIPINO_RM':
          language = 'FILIPINO';
          break;
        case 'INDONESIAN_RM':
          language = 'BAHASA INDONESIA';
          break;
        case 'MODS_RM':
          language = 'MOD CHAT';
          break;  
      }
      var dropMenuNode;
      if (worldStore.state.user){
        switch(worldStore.state.user.role) {
          case 'ADMIN':
          case 'MOD':
          case 'OWNER':
            dropMenuNode = el.li(null, el.a({onClick: this._onclick_room('MODS_RM')},'MOD CHAT'));
            break; 
        }
      }
      var windowheight;
      var windowwidth;
      var GameEle = document.getElementsByClassName('Game_Box')
        if(GameEle[0]){
          windowheight = GameEle[0].firstChild.clientHeight - 200;
          windowwidth = GameEle[0].firstChild.clientWidth;
        }else{
          windowheight = 245;
          windowwidth = 1440;
        }
        if (windowheight < 245){
            windowheight = 245;
        }else if (windowheight > 700){
          windowheight = 700;
        }
        if (windowwidth < 770){
          windowheight = 245;
        }
       if (chatStore.state.currTab ==  'MAIN'){
         innerNode = el.div({
                 className: 'chat-list list-unstyled ' + (chatStore.state.showUserList ? 'col-sm-8 col-md-9':'col-sm-12'),
                 ref: 'chatListRef',
                 style: {height:windowheight.toString()+'px'}
                },
                   chatStore.state.messages.toArray().map(function(m) {
                     if(chat_ignorelist){
                     for (var x = 0; x < chat_ignorelist.length; x++){
                       if (chat_ignorelist[x] == m.user.uname){
                         return;
                       }
                     }
                     }
                     
                     if(m.user.uname == 'BET BOT'){
                        var msg_array = m.text.split(" ");
                        console.log("Chat BET TYPE: " + msg_array[4]);
                        switch(msg_array[4]){
                          case 'BTC':
                            if (ChatBets.BTC == false){
                              return;
                            }
                          break;
                          case 'LTC':
                          if (ChatBets.LTC == false){
                            return;
                          }
                          break;
                          case 'DASH':
                          if (ChatBets.DASH == false){
                            return;
                          }
                          break;
                          case 'ADK':
                          if (ChatBets.ADK == false){
                            return;
                          }
                          break;
                          case 'GRLC':
                          if (ChatBets.GRLC == false){
                            return;
                          }
                          break;
                          case 'FLASH':
                          if (ChatBets.FLASH == false){
                            return;
                          }
                          break;
                          case 'ETH':
                          if (ChatBets.ETH == false){
                            return;
                          }
                          break;
                          case 'MBI':
                          if (ChatBets.MBI == false){
                            return;
                          }
                          break;
                          case 'WAVES':
                          if (ChatBets.WAVES == false){
                            return;
                          }
                          break;
                          case 'DOGE':
                          if (ChatBets.DOGE == false){
                            return;
                          }
                          break;
                          case 'BXO':
                          if (ChatBets.BXO == false){
                            return;
                          }
                          break;
                          case 'CLAM':
                          if (ChatBets.CLAM == false){
                            return;
                          }
                          break;
                        }
                      /**
                        * ChatBets = {
                            BTC: true,
                            LTC: true,
                            DASH: true,
                            ADK: true,
                            GRLC: true,
                            DOGE: true,
                            BXO: true
                          }
                        */


                     }

                     return el.div({
                         // Use message id as unique key
                         key: m.id,
                         style:{marginLeft:'-12px'}
                       },
                       el.span({
                           style: {
                            fontFamily: 'monospace'
                           }
                         },
                         helpers.formatDateToTime(m.created_at),
                         ' '
                       ),
                       m.user ? helpers.roleToLabelElement(m.user) : '',
                       m.user ? ' ' : '',
                       el.code({
                         disabled: !worldStore.state.user,
                         onClick: self._onclick(m.user.uname)
                         },
                         m.user ?  m.user.uname :
                           // If system message:
                           'SYSTEM :: ' + m.text
                       ),
                       //el.code(null,m.user.level),
                       m.user ?
                         // If chat message
                         el.span(null, ' ',
                          filteredlevel(m.user.level)) :
                         // If system message
                         '',
                       m.user ?
                         // If chat message
                         el.span(null, ' ',
                          filteredmessage(m.text,m.user)) :
                         // If system message
                         ''
                     );

                   })


           );
       }else{
         var x = 0;
         for (x = 0; x < chatStore.state.pm_messages.length; x++){
           if (chatStore.state.pm_messages[x].name == chatStore.state.currTab){
             innerNode = el.div({
                     className: 'chat-list list-unstyled ' + (chatStore.state.showUserList ? 'col-sm-8 col-md-9':'col-sm-12'),
                     ref: 'chatListRef',
                     style: {height:windowheight.toString()+'px'}},
                       chatStore.state.pm_messages[x].toArray().map(function(m) {

                         return el.div({
                             // Use message id as unique key
                             key: m.id,
                             style:{marginLeft:'-12px'}
                           },
                           el.span({
                               style: {
                                fontFamily: 'monospace'
                               }
                             },
                             helpers.formatDateToTime(m.created_at),
                             ' '
                           ),
                           m.user ? helpers.roleToLabelElement(m.user) : '',
                           m.user ? ' ' : '',
                           el.code({
                             disabled: !worldStore.state.user,
                             onClick: self._onclick(m.user.uname)
                             },
                             m.user ?  m.user.uname :
                               // If system message:
                               'SYSTEM :: ' + m.text
                           ),
                           m.user ?
                             // If chat message
                             el.span(null, ' ',
                              filteredlevel(m.user.level)) :
                             // If system message
                             '',
                           m.user ?
                             // If chat message
                             el.span(null, ' ',
                              filteredmessage(m.text,m.user)) :
                             // If system message
                             ''
                         );

                       })
               );
           }
         }


       }

       return el.div(
         null,
         el.div({className:'panel panel-danger'},
         el.div({className:'panel-heading'},'ChatBox ',
          el.span({className:'glyphicon glyphicon-fast-forward', onClick:this._onChatToggle}),
          el.span({className:'dropdown', style: {marginRight:'5px'}},
                el.button(
                             {
                               type:'button',
                               className:'btn btn-sm btn-danger dropdown-toggle',
                               style:{fontWeight: 'bold',marginBottom:'-10px',marginTop:'-10px'},
                               "data-toggle":'dropdown',
                               "aria-haspopup":'true',
                               "aria-expanded":'false',
                               onClick:this._onClickD
                             },
                             language, el.span({className:'caret'},'')
                           ),
                           el.ul({className:'dropdown-menu'},
                             el.li(null, el.a({onClick: this._onclick_room('ENGLISH_RM')},'ENGLISH')),
                             el.li(null, el.a({onClick: this._onclick_room('RUSSIAN_RM')},'РУССКИЙ')),
                             el.li(null, el.a({onClick: this._onclick_room('FRENCH_RM')},'FRANÇAIS')),
                             el.li(null, el.a({onClick: this._onclick_room('SPANISH_RM')},'ESPAÑOL')),
                             el.li(null, el.a({onClick: this._onclick_room('PORTUGUESE_RM')},'PORTUGUÊS')),
                            // el.li(null, el.a({onClick: this._onclick_room('DUTCH_RM')},'NEDERLANDS')),
                             el.li(null, el.a({onClick: this._onclick_room('GERMAN_RM')},'DEUTSCH')),
                             el.li(null, el.a({onClick: this._onclick_room('HINDI_RM')},'हिंदी')),
                            // el.li(null, el.a({onClick: this._onclick_room('CHINESE_RM')},'中文')),
                            // el.li(null, el.a({onClick: this._onclick_room('JAPANESE_RM')},'日本語')),
                            // el.li(null, el.a({onClick: this._onclick_room('KOREAN_RM')},'한국어')),
                             el.li(null, el.a({onClick: this._onclick_room('FILIPINO_RM')},'FILIPINO')),
                             el.li(null, el.a({onClick: this._onclick_room('INDONESIAN_RM')},'BAHASA INDONESIA')),
                             dropMenuNode
                           )
            ),
           el.div({className:'navbar-right', style: {marginRight:'5px'}},
           el.ul({className:'list-inline'},
               el.li({onClick:this._onUserListToggle},
                 el.span({className:'glyphicon glyphicon-user'}),
                 el.span({className:'badge'},Object.keys(chatStore.state.userList).length)
               )
             )
           )
          ),
          el.div({className:'panel-body'},
          el.div({className:'row'},
          el.div(
            {className: 'col-xs-12'},
            React.createElement(ChatTabs, null)
          ),
          innerNode,
            chatStore.state.showUserList ?
            el.div(
              {className: 'col-sm-4 col-md-3'},
              React.createElement(ChatUserList, null)
            ):''
            )
          ),
          el.div(
            {className: 'panel-footer'},
            React.createElement(ChatBoxInput, null)
          ),
          el.div({className: 'test-small'},'  Chat Rules: No begging/asking for loans or rain, and be polite. Violations may lead to a ban!')
         )
       );
     }
   });

   var ShowChat = React.createClass({
     displayName: 'ShowChat',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       chatStore.on('change', this._onStoreChange);
       chatStore.on('new_message', this._onStoreChange);
     },
     componentWillUnmount: function() {
       chatStore.off('change', this._onStoreChange);
       chatStore.off('new_message', this._onStoreChange);
     },
     _onChatToggle: function() {
       if (chatStore.state.showUserList)
         {Dispatcher.sendAction('TOGGLE_CHAT_USERLIST');}
       Dispatcher.sendAction('TOGGLE_CHAT');
     },

      render: function() {

        return el.div(
          null,
          el.div({className:'panel panel-primary'},
          el.div({className:'panel-heading'},'Chat ',
            el.span({className:'glyphicon glyphicon-fast-backward', onClick:this._onChatToggle}),
            el.span({className:'badge',style:chatStore.state.newmessages > 0 ? {backgroundColor:'gold'} : {}},chatStore.state.newmessages),

            el.div({className:'navbar-right', style: {marginRight:'5px'}},
            el.ul({className:'list-inline'},
                el.li(null,
                  el.span({className:'glyphicon glyphicon-user'}),
                  el.span({className:'badge'},Object.keys(chatStore.state.userList).length)
                )
              )
            )
           )
          )
        );
      }
    });


   var ChatTabs = React.createClass({
     displayName: 'ChatTabs',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
  //     worldStore.on('change_tab', this._onStoreChange);
  //     worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
  //     worldStore.off('change_tab', this._onStoreChange);
  //     worldStore.off('change', this._onStoreChange);
     },
     _makeTabChangeHandler: function(tabName) {
       var self = this;
       return function() {
         Dispatcher.sendAction('CHANGE_CHATTAB', tabName);
         setTimeout(function(){ chatwindow._scrollChat();},200);
       };
     },
     _removeTab:function(tabName){
       return function(){
         Dispatcher.sendAction('REMOVE_CHATTAB', tabName);
         setTimeout(function(){ chatwindow._scrollChat();},200);
       };
     },
     render: function() {
       var innerNode = [];

       innerNode.push(
        el.li(
         {className: chatStore.state.currTab === 'MAIN' ? 'bg-danger' : chatStore.state.messages.new_message ? 'bg-warning': ''},
         el.a(
           {
             href: 'javascript:void(0)',
             onClick: this._makeTabChangeHandler('MAIN')
           },
           'Main'
         )
       )
     );
     if(chatStore.state.pm_messages[0] != undefined){
     //chatStore.state.pm_messages.toArray.map(function(pm)
      for (var x = 0; x < chatStore.state.pm_messages.length; x++){
          var language = chatStore.state.pm_messages[x].name;
        switch(chatStore.state.pm_messages[x].name){
          case 'RUSSIAN_RM':
            language = 'РУССКИЙ';
            break;
          case 'FRENCH_RM':
            language = 'FRANÇAIS';
            break;
          case 'SPANISH_RM':
            language = 'ESPAÑOL';
            break;
          case 'PORTUGUESE_RM':
            language = 'PORTUGUÊS';
            break;
          case 'DUTCH_RM':
            language = 'NEDERLANDS';
            break;
          case 'GERMAN_RM':
            language = 'DEUTSCH';
            break;
          case 'HINDI_RM':
            language = 'हिंदी';
            break;
          case 'CHINESE_RM':
            language = '中文';
            break;
          case 'JAPANESE_RM':
            language = '日本語';
            break;
          case 'KOREAN_RM':
            language = '한국어';
            break;
          case 'FILIPINO_RM':
            language = 'FILIPINO';
            break;
          case 'INDONESIAN_RM':
            language = 'BAHASA INDONESIA';
            break;
        }
       innerNode.push(
         el.li(
          {className: chatStore.state.currTab === chatStore.state.pm_messages[x].name ? 'bg-danger' : chatStore.state.pm_messages[x].new_message ? 'btn-warning': ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler(chatStore.state.pm_messages[x].name)
            },
            language + ' ',
            el.span({className:'glyphicon glyphicon-remove-sign',
                     onClick: this._removeTab(chatStore.state.pm_messages[x].name)
                    },
                    ''
                  )
          )
        )

       );
     }
   //);
   }

       return el.ul(
         {className: 'nav nav-tabs', style:{marginTop:'-10px'}},
         innerNode
       );
     }
  });




//////////////////////
var Tabs = React.createClass({
  displayName: 'Tabs',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change_tab', this._onStoreChange);
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change_tab', this._onStoreChange);
    worldStore.off('change', this._onStoreChange);
  },
  _makeTabChangeHandler: function(tabName) {
    var self = this;
    return function() {
      if ((worldStore.state.user)&&(tabName == 'HISTORY')){
        Dispatcher.sendAction('GET_TX_HISTORY');
      }

    if ((worldStore.state.user)&&(tabName == 'STATS')){
       Dispatcher.sendAction('UPDATE_BANKROLL');
       Dispatcher.sendAction('START_REFRESHING_USER');
       //Dispatcher.sendAction('UPDATE_USERSTATS');
      }

      if (tabName == 'INVEST'){
        Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
      }

      Dispatcher.sendAction('CHANGE_TAB', tabName);
    };
  },
  render: function() {
    return el.ul(
      {className: 'nav nav-tabs'},
      el.li(
        {className: worldStore.state.currTab === 'ALL_BETS' ? 'bg-danger' : ''},
        el.a(
          {
            href: 'javascript:void(0)',
            onClick: this._makeTabChangeHandler('ALL_BETS')
          },
          'ALL BETS'
        )
      ),
      // Only show MY BETS tab if user is logged in
      !worldStore.state.user ? '' :
        el.li(
          {className: 'bot_mybets ' + (worldStore.state.currTab === 'MY_BETS' ? 'bg-danger' : '')},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('MY_BETS')
            },
            'MY BETS'
          )
        ),
      el.li(
        {className: worldStore.state.currTab === 'INVEST' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('INVEST')
            },
            el.strong({className:'label-success'}, ' INVEST ')
          )
        ),
        el.li(
          {className: worldStore.state.currTab === 'BUYBXO' ? 'bg-danger' : ''},
            el.a(
              {
                href: 'javascript:void(0)',
                onClick: this._makeTabChangeHandler('BUYBXO')
              },
              el.strong({className:'label-success'}, ' BUY BXO ')
            )
          ),   
      el.li(
        {className: worldStore.state.currTab === 'JACKPOT' ? 'bg-danger' : ''},
        el.a(
          {
            href: 'javascript:void(0)',
            onClick: this._makeTabChangeHandler('JACKPOT')
          },
          'JACKPOT'
        )
      ),
      // Display faucet tab even to guests so that they're aware that
      // this casino has one.
      !config.recaptcha_sitekey ? '' :
        el.li(
          {className: worldStore.state.currTab === 'FAUCET' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('FAUCET')
            },
            el.span(null, 'FAUCET ')
          )
        ),
      !worldStore.state.user ? '' :
        el.li(
          {className: worldStore.state.currTab === 'STATS' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('STATS')
            },
            'STATS'
          )
        ),
        el.li(
          {className: worldStore.state.currTab === 'BIGGEST' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('BIGGEST')
            },
            'BIGGEST'
          )
        ),
        el.li(
          {className: worldStore.state.currTab === 'WEEKLY' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('WEEKLY')
            },
            'WEEKLY'
          )
        ),
        el.li(
          {className: worldStore.state.currTab === 'HELP' ? 'bg-danger' : ''},
          el.a(
            {
              href: 'javascript:void(0)',
              onClick: this._makeTabChangeHandler('HELP')
            },
            'HELP & FAQ'
          )
        ),
        !worldStore.state.user ? '' :
          el.li(
            {className: (worldStore.state.currTab === 'SETTINGS' ? 'bg-danger' : '')},
            el.a(
              {
                href: 'javascript:void(0)',
                onClick: this._makeTabChangeHandler('SETTINGS')
              },
              'SETTINGS'
            )
          ),
        
        !worldStore.state.user ? '' :
          !worldStore.state.user.dogelogin ? '' : el.li(
            {className: (worldStore.state.currTab === 'HISTORY' ? 'bg-danger' :'')},
            el.a(
              {
                href: 'javascript:void(0)',
                onClick: this._makeTabChangeHandler('HISTORY')
              },
              'HISTORY'
            )
          )
    );
  }
});


var InvestTabContent = React.createClass({
  displayName: 'InvestTabContent',
  _onStoreChange: function(){
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  getInitialState: function() {
      return {currency:'DOGE', auth:'', amount:'', set_kelly:'', error:null, errorA:null};
     },
     _changeCurr: function(curr){
       var self = this;
       return function(){
      console.log('Change Curr');
       if (curr == 'DOGE'){
          Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
          self.setState({currency:curr});
          self.forceUpdate();
       }else if (curr == 'BXO'){
          Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
          self.setState({currency:curr});
          self.forceUpdate();
        }else if (curr == 'CLAM'){
          Dispatcher.sendAction('GET_CLAM_INVESTMENTS', null);
          self.setState({currency:curr});
          self.forceUpdate();
        }
      }
     },
     _onClick: function() {
      $('dropdown-toggle').dropdown();
     },
     _onClickMode: function(type) {
      var self = this;  
      return function(){
          console.log('Click Coin: ' + type);
         // self.setState({coin:coin});
         // setTimeout(function(){self._getRates();},100);
         if (socket){
          socket.emit('set_dividend_mode', type, function(err, data){
            if (!err){
              Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
            }else{
              console.log('[socket] error set_dividend_mode', err);
            }
          });
        }
        }
     },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _updateAmount: function(e){
       var str = e.target.value;
        var str = e.target.value;
        var num = parseFloat(str, 10);
        var isFloatRegexp = /^(\d*\.)?\d+$/;

        if (isNaN(num) || !isFloatRegexp.test(str)) {
            this.setState({errorA:'Invalid'});
        } else if (num < 0) { // Ensure amount is greater than 0.01
            this.setState({errorA:'Too Low'});
        } else if (helpers.getPrecision(num) > 8){
            this.setState({errorA:'Too Precise'});
        }else {
            this.setState({amount:str, errorA:null});
        }
       this.forceUpdate();
     },
     _updateKelly: function(e){
       var str = e.target.value;
       var num = parseFloat(str, 10);
       var isFloatRegexp = /^(\d*\.)?\d+$/;

       if (isNaN(num) || !isFloatRegexp.test(str)) {
            this.setState({error:'Invalid'});
        } else if (num < 0.5) { // Ensure amount is greater than 0.01
            this.setState({error:'Too Low'});
        } else if (helpers.getPrecision(num) > 1){
            this.setState({error:'Too Precise'});
        }else {
            this.setState({set_kelly:str, error:null});
        }
       this.forceUpdate();
     },
     _onSetKelly: function(){
        console.log('set kelly: ' + this.state.set_kelly);
        //'Set_Kelly'
         var k_params = {
              //uname: this.state.uname,
              kelly: (this.state.set_kelly/100),
              token2fa: this.state.auth
          };
          console.log('[Socket] Set_Kelly');
          if (this.state.currency == 'DOGE'){
            socket.emit('Set_Kelly', k_params, function(err, data){
              if (err){
                alert('Error Set_Kelly: ');
              }else{
                console.log('[socket] success Set_Kelly', data);  
                Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
              }
            });
          }else if (this.state.currency == 'BXO'){
              socket.emit('Set_Kelly_Bxo', k_params, function(err, data){
                if (err){
                  alert('Error Set_Kelly_bxo: ' + err);
                }else{
                  console.log('[socket] success Set_Kelly_bxo', data);  
                  Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
                }
              });
          }else if (this.state.currency == 'CLAM'){
            socket.emit('Set_Kelly_Clam', k_params, function(err, data){
              if (err){
                alert('Error Set_Kelly_Clam: ' + err);
              }else{
                console.log('[socket] success Set_Kelly_clam', data);  
                Dispatcher.sendAction('GET_CLAM_INVESTMENTS', null);
              }
            });
        }
     },
     _onClick_invest: function(){
        console.log('invest doge: ' + this.state.amount);
        var inv_params = {
              //uname: this.state.uname,
              amount: this.state.amount,
              token2fa: this.state.auth
          };
          if (this.state.currency == 'DOGE'){
            console.log('[Socket] Invest_Doge');
            socket.emit('Invest_Doge', inv_params, function(err, data){
              if (err){
                alert('Error Invest_Doge: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Invest_Doge', data);  
                Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
              }
            });
          }else if (this.state.currency == 'BXO'){
            console.log('[Socket] Invest_Bxo');
            socket.emit('Invest_Bxo', inv_params, function(err, data){
              if (err){
                alert('Error Invest_Bxo: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Invest_Bxo', data);  
                Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
              }
            });
          }else if (this.state.currency == 'CLAM'){
            console.log('[Socket] Invest_Clam');
            socket.emit('Invest_Clam', inv_params, function(err, data){
              if (err){
                alert('Error Invest_Clam: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Invest_Clam', data);  
                Dispatcher.sendAction('GET_CLAM_INVESTMENTS', null);
              }
            });
          }

     },
     _onClick_divest: function(){
        console.log('divest doge: ' + this.state.amount);
        var inv_params = {
              //uname: this.state.uname,
              amount: this.state.amount,
              token2fa: this.state.auth
          };
          if (this.state.currency == 'DOGE'){
            console.log('[Socket] Divest_Doge');
            socket.emit('Divest_Doge', inv_params, function(err, data){
              if (err){
                alert('Error Divest_Doge: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Divest_Doge', data);  
                Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
              }
            });
          }else if (this.state.currency == 'BXO'){
            console.log('[Socket] Divest_Bxo');
            socket.emit('Divest_Bxo', inv_params, function(err, data){
              if (err){
                alert('Error Divest_Bxo: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Divest_Bxo', data);  
                Dispatcher.sendAction('GET_BXO_INVESTMENTS', null);
              }
            });
          }else if (this.state.currency == 'CLAM'){
            console.log('[Socket] Divest_Clam');
            socket.emit('Divest_Clam', inv_params, function(err, data){
              if (err){
                alert('Error Divest_Clam: ' + JSON.stringify(err));
              }else{
                console.log('[socket] success Divest_Clam', data);  
                Dispatcher.sendAction('GET_CLAM_INVESTMENTS', null);
              }
            });
          }
     },
  render: function(){
    var app_invested = 0;
    var app_wager = 0;
    var app_invest_profit = 0;
    var app_max_profit = 0;
    var user_invested = 0;
    var user_profit = 0;
    var user_share = 0;

    var doge_dividend = 0;
    var doge_dividend_paid = 0;
    var clam_dividend = 0;
    var clam_dividend_paid = 0;

    var doge_dividend_paid_user = 0;
    var clam_dividend_paid_user = 0;

    var app_stake_profit = 0;
    var stake_profit = 0;

    if(this.state.currency == 'DOGE'){
      if(worldStore.state.doge_invest_app.invested){
        app_invested = worldStore.state.doge_invest_app.invested.toFixed(4);
        app_wager = worldStore.state.doge_invest_app.total_wager.toFixed(4);
        app_invest_profit = worldStore.state.doge_invest_app.investorprofit.toFixed(4);
        app_max_profit = worldStore.state.doge_invest_app.maxprofit.toFixed(4);
        app_stake_profit = 0;
        if (worldStore.state.doge_invest_user.invested){
          user_invested = worldStore.state.doge_invest_user.invested.toFixed(4);
          user_profit =  worldStore.state.doge_invest_user.profit.toFixed(4);
          user_share = (((worldStore.state.doge_invest_user.invested * worldStore.state.doge_invest_user.kelly)/worldStore.state.doge_invest_app.maxprofit) * 100).toFixed(2); 
          stake_profit = 0;
        }
      }
      var div_node;

    }else if(this.state.currency == 'BXO'){
      if(worldStore.state.bxo_invest_app.invested){
        app_invested = worldStore.state.bxo_invest_app.invested.toFixed(8);
        app_wager = worldStore.state.bxo_invest_app.total_wager.toFixed(8);
        app_invest_profit = worldStore.state.bxo_invest_app.investorprofit.toFixed(8);
        app_max_profit = worldStore.state.bxo_invest_app.maxprofit.toFixed(8);

        doge_dividend = worldStore.state.bxo_invest_app.dividend.toFixed(8);
        doge_dividend_paid = worldStore.state.bxo_invest_app.dividend_paid.toFixed(8);
        clam_dividend = worldStore.state.bxo_invest_app.dividend_clam.toFixed(8);
        clam_dividend_paid = worldStore.state.bxo_invest_app.dividend_paid_clam.toFixed(8);
        app_stake_profit = worldStore.state.bxo_invest_app.stake_profits.toFixed(8);
        if (worldStore.state.bxo_invest_user.invested){
          doge_dividend_paid_user = worldStore.state.bxo_invest_user.dividend_paid.toFixed(8);
          clam_dividend_paid_user = worldStore.state.bxo_invest_user.dividend_paid_clam.toFixed(8);
          user_invested = worldStore.state.bxo_invest_user.invested.toFixed(8);
          user_profit =  worldStore.state.bxo_invest_user.profit.toFixed(8);
          user_share = (((worldStore.state.bxo_invest_user.invested * worldStore.state.bxo_invest_user.kelly)/worldStore.state.bxo_invest_app.maxprofit) * 100).toFixed(2); 
          stake_profit = worldStore.state.bxo_invest_user.stake_profit.toFixed(8);
        }
      }
      var div_node = el.div({className:'col-xs-12 col-sm-6 col-md-4'},
        el.div(null, el.span({className:'h6'},'Doge Dividends: '),el.span({className:'text-small pull-right'}, doge_dividend + ' DOGE')),
        el.div(null, el.span({className:'h6'},'Doge Dividends Paid: '),el.span({className:'text-small pull-right'}, doge_dividend_paid + ' DOGE')),
        el.div(null, el.span({className:'h6'},'Clam Dividends: '),el.span({className:'text-small pull-right'}, clam_dividend + ' CLAM')),
        el.div(null, el.span({className:'h6'},'Clam Dividends Paid: '),el.span({className:'text-small pull-right'}, clam_dividend_paid + ' CLAM')),
        el.div(null, el.span({className:'h6'},'Your Doge Dividends: '),el.span({className:'text-small pull-right'}, doge_dividend_paid_user + ' DOGE')),
        el.div(null, el.span({className:'h6'},'Your Clam Dividends: '),el.span({className:'text-small pull-right'}, clam_dividend_paid_user + ' CLAM')),
        el.span({className:'dropdown'},
          el.button(
                {
                  type:'button',
                  className:'btn btn-sm btn-default dropdown-toggle',
                  style:{fontWeight: 'bold',marginTop:'5px'},
                  "data-toggle":'dropdown',
                  "aria-haspopup":'true',
                  "aria-expanded":'false',
                  onClick:this._onClick
                },
                'Dividend to: ' + worldStore.state.bxo_invest_user.div_mode, el.span({className:'caret'},'')
              ),
              el.ul({className:'dropdown-menu'},
                el.li(null, el.a({onClick: this._onClickMode('BALANCE')},'BALANCE')),
                el.li(null, el.a({onClick: this._onClickMode('INVEST')},'INVEST'))
              )
          )
      );
    }else if(this.state.currency == 'CLAM'){
      if(worldStore.state.clam_invest_app.invested){
        app_invested = worldStore.state.clam_invest_app.invested.toFixed(8);
        app_wager = worldStore.state.clam_invest_app.total_wager.toFixed(8);
        app_invest_profit = worldStore.state.clam_invest_app.investorprofit.toFixed(8);
        app_max_profit = worldStore.state.clam_invest_app.maxprofit.toFixed(8);
        app_stake_profit = worldStore.state.clam_invest_app.stake_profits.toFixed(8);
        if (worldStore.state.clam_invest_user.invested){
          user_invested = worldStore.state.clam_invest_user.invested.toFixed(8);
          user_profit =  worldStore.state.clam_invest_user.profit.toFixed(8);
          user_share = (((worldStore.state.clam_invest_user.invested * worldStore.state.clam_invest_user.kelly)/worldStore.state.clam_invest_app.maxprofit) * 100).toFixed(2); 
          stake_profit = worldStore.state.clam_invest_user.stake_profit.toFixed(8);
        }
      }
      var div_node;
    }

    var userNode;

    if (worldStore.state.user){
      if(worldStore.state.user.dogelogin){
        if (this.state.currency == 'DOGE'){
          var kellynode = el.strong(null, (worldStore.state.doge_invest_user.kelly * 100) + '%')
        }else if (this.state.currency == 'BXO'){
          var kellynode = el.strong(null, (worldStore.state.bxo_invest_user.kelly * 100) + '%')
        }else if (this.state.currency == 'CLAM'){
          var kellynode = el.strong(null, (worldStore.state.clam_invest_user.kelly * 100) + '%')
        }
        userNode = el.div({className:'well well-sm col-xs-12'},
                     // el.div({className:'col-xs-12 h5'},'Your Investments'),
                        el.div({className:'row'},
                        //el.div({className:'col-xs-12 col-sm-6 col-md-5'},
                          el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
                          el.h6({className:'h6', style:{marginBottom:'5px'}},'Your Invested: '),
                            el.span(null, el.strong(null, user_invested + ' ' + this.state.currency))
                          ),
                          el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
                          el.h6({className:'h6', style:{marginBottom:'5px'}},'Kelly: '),
                            el.span(null, kellynode)
                          ),
                          el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
                          el.h6({className:'h6', style:{marginBottom:'5px'}},'Your Profit: '),
                            el.span(null, el.strong(null, user_profit + ' ' + this.state.currency))
                          ),
                          el.div({className:'col-xs-12 col-sm-6 col-md-3'},
                            el.h6({className:'h6', style:{marginBottom:'5px'}},'Your Bankroll Share: '),
                            el.span(null, el.strong(null, user_share + '%'))
                          ),
                          this.state.currency != 'DOGE' ?  el.div({className:'col-xs-12 col-sm-6 col-md-3'},
                            el.h6({className:'h6', style:{marginBottom:'5px'}},'Your Stake Profit: '),
                            el.span(null, el.strong(null, stake_profit + ' ' + this.state.currency))
                          ):'',
                       // ),
                        el.hr({className:'col-xs-12'}),
                        el.div({className:'col-xs-12 col-sm-6 col-md-4'},
                          el.div({className:'row'},
                            el.div({className: 'form-group col-xs-9'},
                              el.div({className: 'input-group'},
                                el.span({className: 'input-group-addon'},'Kelly'),
                                el.input({
                                    type: 'text',
                                    value: this.state.set_kelly,
                                    style : {fontWeight: 'bold'},
                                    className: 'form-control input-sm',
                                    onChange: this._updateKelly
                                  }
                                )
                              )
                            ),
                            el.span({classname: 'col-xs-2'},
                              el.button(
                                {
                                  className: 'btn btn-default btn-sm',
                                  type: 'button',
                                  onClick: this._onSetKelly,
                                  disabled: this.state.error
                                },
                                'Update'
                              )
                            )
                          ),                
                        el.div({className: 'form-group'},
                            el.div({className: 'input-group'},
                              el.span({className: 'input-group-addon'},'Amount'),
                              el.input({
                                  type: 'number',
                                  min:'0.000001',
                                  step:'0.000001',
                                  value: this.state.amount,
                                  style : {fontWeight: 'bold'},
                                  className: 'form-control input-sm',
                                  onChange: this._updateAmount
                                }
                              )
                          ),
                          el.div({className:'btn-group btn-group-justified'},
                            el.div({className:'btn-group'},
                              el.button({
                                className:'btn btn-default btn-sm',
                                onClick: this._onClick_invest
                              },
                              'Invest'
                              )
                            ),
                            el.div({className:'btn-group'},
                              el.button({
                                className:'btn btn-default btn-sm',
                                onClick: this._onClick_divest
                              },
                              'Divest'
                              )
                            )
                          )
                        ),
                    el.div({className: 'form-group'},
                      el.div({className: 'input-group'},
                        el.span({className: 'input-group-addon'},'2fa'),
                        el.input({
                            type: 'text',
                            value: this.state.auth,
                            style : {fontWeight: 'bold'},
                            className: 'form-control input-sm',
                            onChange: this._update2fa
                          }
                        )
                      )
                    )
                   ),
                   div_node
                    ////
                  )
                ) 
      }else{      
        userNode = el.div({className:'well well-sm col-xs-12'},'Sign Up An Account with Bit-Exo to Invest in the Bankroll')
      }
    }else{
      userNode = el.div({className:'well well-sm col-xs-12'},'Sign Up An Account with Bit-Exo to Invest in the Bankroll')
    }


    var innerNode;
         innerNode = el.div({className:'row'},
         
          //  el.div({className:'col-xs-12 col-sm-6'},
              el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
                el.h6({className:'h6', style:{marginBottom:'5px'}},'Total Invested: '),
                el.span(null, el.strong(null, app_invested + ' ' + this.state.currency))
              ),
              el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
              el.h6({className:'h6', style:{marginBottom:'5px'}},'Total Wagered: '),
                el.span(null, el.strong(null, app_wager + ' ' + this.state.currency))
              ),
              el.div({className:'col-xs-12 col-sm-6 col-md-3 col-lg-2'},
              el.h6({className:'h6', style:{marginBottom:'5px'}},'Total Profit: '),
                el.span(null, el.strong(null, app_invest_profit + ' ' + this.state.currency))
              ),
              el.div({className:'col-xs-12 col-sm-6 col-md-3'},
              el.h6({className:'h6', style:{marginBottom:'5px'}},'Max Profit Per Bet: '),
                el.span(null, el.strong(null, app_max_profit + ' ' + this.state.currency))
              ),
              this.state.currency != 'DOGE' ? el.div({className:'col-xs-12 col-sm-6 col-md-3'},
                el.h6({className:'h6', style:{marginBottom:'5px'}},'Stake Profit: '),
                el.span(null, el.strong(null, app_stake_profit + ' ' + this.state.currency))
              ):'',              
          //  )
          )


    return el.div({id:'inv_tab'},
            el.div({className: 'panel panel-default'},
                el.div({className: 'panel-body'},
                  el.ul({className: 'nav nav-pills'},
                      el.li({className: this.state.currency == 'DOGE' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('DOGE')
                                },
                            'DOGE'
                          )
                    ),
                    el.li({className: this.state.currency == 'BXO' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('BXO')
                                },
                            'BXO'
                          )
                    ),
                    el.li({className: this.state.currency == 'CLAM' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('CLAM')
                                },
                            'CLAM'
                          )
                    )        
                  ),
                  el.div({className:'well well-sm col-xs-12'},
                   // el.div({className:'col-xs-12 h5'},'Invested With Bit-Exo'),
                    innerNode
                  ),
                  userNode,
                  el.div({className:'well well-sm col-xs-12'},
                    el.h5(null, 'Disclaimer:'),
                    el.p(null, 'Do not invest funds you can not afford to lose. It is possible to profit from investing but there is no guarantee. Bit-Exo takes 40% commission of the house edge on every bet made against the bankroll.  We do not charge a fee on stakes from BXO and CLAM and are payed out based on investors Bankroll Share. Dividends on DOGE and CLAM are payed out each sunday to BXO investors based on their share of Total Invested BXO.')
                  )
        )
      )
    );
  }

});


var TxHistoryTabContent = React.createClass({
  displayName: 'TxHistoryTabContent',
  _onStoreChange: function(){
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  getInitialState: function() {
    return {currency:'DOGE'};
   },
  _changeCurr: function(tab){
    var self = this;
    return function(){
      if (tab == 'DOGE'){
        Dispatcher.sendAction('GET_TX_HISTORY');
        self.setState({currency:tab});
        self.forceUpdate();
      }else if (tab == 'BXO'){ 
        Dispatcher.sendAction('GET_BXO_TX_HISTORY');
        self.setState({currency:tab});
        self.forceUpdate();
      }else if (tab == 'CLAM'){ 
        Dispatcher.sendAction('GET_CLAM_TX_HISTORY');
        self.setState({currency:tab});
        self.forceUpdate();
      }  
    }
  },
  render: function(){
    var innerNode;

    if (this.state.currency == 'DOGE'){
      innerNode = el.div(null,
        el.div({className:'well well-sm col-xs-12'},
          'Deposits',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.doge_rec_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at ? tx.created_at.substring(0,10):tx.created_on.substring(0,10)),
                  el.td(null, tx.amount.toFixed(2)),
                  el.td(null, tx.address),
                  el.td(null, 
                          el.a(
                          {
                            href: 'https://dogechain.info/tx/' + tx.txid,
                            target: '_blank'
                          },
                          tx.txid
                        )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Withdrawals',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Status'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.doge_send_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, (tx.amount * 1).toFixed(2)),
                  el.td(null, tx.status),
                  el.td(null, tx.address),
                  el.td(null, 
                      el.a(
                      {
                        href: 'https://dogechain.info/tx/' + tx.txid,
                        target: '_blank'
                      },
                      tx.txid
                    )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Tips',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'From/To')
              )
            ),
            el.tbody(null,
              worldStore.state.doge_tips_data.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? (tx.amount * -1).toFixed(2):(tx.amount * 1).toFixed(2)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? tx.receiver : tx.sender)
                );
              })

            )
          )
        )
      )
    }else if (this.state.currency == 'BXO'){
      innerNode = el.div(null,
        el.div({className:'well well-sm col-xs-12'},
          'Deposits',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.bxo_rec_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at ? tx.created_at.substring(0,10):tx.created_on.substring(0,10)),
                  el.td(null, tx.amount.toFixed(8)),
                  el.td(null, tx.address),
                  el.td(null, 
                          el.a(
                          {
                            href: 'https://explore.bit-exo.com/tx/' + tx.txid,
                            target: '_blank'
                          },
                          tx.txid
                        )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Withdrawals',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Status'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.bxo_send_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, (tx.amount * 1).toFixed(8)),
                  el.td(null, tx.status),
                  el.td(null, tx.address),
                  el.td(null, 
                      el.a(
                      {
                        href: 'https://explore.bit-exo.com/tx/' + tx.txid,
                        target: '_blank'
                      },
                      tx.txid
                    )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Tips',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'From/To')
              )
            ),
            el.tbody(null,
              worldStore.state.bxo_tips_data.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? (tx.amount * -1).toFixed(8):(tx.amount * 1).toFixed(8)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? tx.receiver : tx.sender)
                );
              })

            )
          )
        )
      )
    }else if (this.state.currency == 'CLAM'){
      innerNode = el.div(null,
        el.div({className:'well well-sm col-xs-12'},
          'Deposits',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.clam_rec_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at ? tx.created_at.substring(0,10):tx.created_on.substring(0,10)),
                  el.td(null, tx.amount.toFixed(8)),
                  el.td(null, tx.address),
                  el.td(null, 
                          el.a(
                          {
                            href: 'http://www.khashier.com/tx/' + tx.txid,
                            target: '_blank'
                          },
                          tx.txid
                        )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Withdrawals',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'Status'),
                el.th(null, 'Address'),
                el.th(null, 'Tx Id')
              )
            ),
            el.tbody(null,
              worldStore.state.clam_send_tx.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, (tx.amount * 1).toFixed(8)),
                  el.td(null, tx.status),
                  el.td(null, tx.address),
                  el.td(null, 
                      el.a(
                      {
                        href: 'http://www.khashier.com/tx/' + tx.txid,
                        target: '_blank'
                      },
                      tx.txid
                    )
                  )
                );
              })

            )
          )
        ),
        el.div({className:'well well-sm col-xs-12'},
          'Tips',
          el.table({className: 'table'},
            el.thead(null,
              el.tr(null,
                el.th(null, 'Date'),
                el.th(null, 'Amount'),
                el.th(null, 'From/To')
              )
            ),
            el.tbody(null,
              worldStore.state.clam_tips_data.map(function(tx){
                return el.tr({key: tx._id},
                  el.td(null, tx.created_at.substring(0,10)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? (tx.amount * -1).toFixed(8):(tx.amount * 1).toFixed(2)),
                  el.td(null, tx.sender == worldStore.state.user.uname.toLowerCase() ? tx.receiver : tx.sender)
                );
              })

            )
          )
        )
      )
    }
    return el.div(null,
            el.div({className: 'panel panel-default'},
                el.div({className: 'panel-body'},
                el.ul({className: 'nav nav-pills'},
                    el.li({className: this.state.currency == 'DOGE' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('DOGE')
                                },
                            'DOGE'
                          )
                    ),
                    el.li({className: this.state.currency == 'BXO' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('BXO')
                                },
                            'BXO'
                          )
                    ),
                    el.li({className: this.state.currency == 'CLAM' ? 'bg-danger' : ''},
                          el.a({
                            href: 'javascript:void(0)',
                                onClick: this._changeCurr('CLAM')
                                },
                            'CLAM'
                          )
                    )        
                  ),
                  innerNode
        )
      )
    );
  }

});


var MyBetsTabContent = React.createClass({
  displayName: 'MyBetsTabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('new_user_bet', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('new_user_bet', this._onStoreChange);
  },
  render: function() {
    return el.div(null,
      el.table(
        {className: 'table bot_bets'},
        el.thead(null,
          el.tr(null,
            el.th(null, 'ID'),
            el.th({className:'hidden-xs'}, 'Time'),
            el.th({className:'hidden-xs'}, 'Raw_Outcome'),
            el.th(null, 'Wager'),
            el.th(null, 'Target'),
            el.th(null, 'Roll'),
            el.th(null, 'Profit')
          )
        ),
        el.tbody(null,
          worldStore.state.bets.toArray().map(function(bet) {
              var type;
              if (bet.meta.kind == 'DICE'){
                  type = 'DICE';
                }else if (bet.meta.kind == 'PLINKO'){
                  type = 'PLINKO';
                }else if (bet.meta.kind == 'ROULETTE'){
                  type = 'ROULETTE';
                }else if (bet.meta.kind == 'SLOTS'){
                  type = 'SLOTS';
                }else if (bet.meta.kind == 'BITCLIMBER'){
                  type = 'BITCLIMBER';
                }else if (bet.meta.kind == 'SLIDERS'){
                  type = 'SLIDERS';
                }else if (bet.meta.kind == 'WONDERW'){
                  type = 'WONDERW';
                }else {
                 type = 'BITSWEEP';
                }

            return el.tr(
              {
                key: bet.bet_id || bet.id
              },
              // bet id
              el.td(null,
                ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                  {
                    href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                    target: '_blank'
                  },
                  bet.bet_id || bet.id
                ) : el.a(
                  {
                    //href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                    href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                    target: '_blank'
                  },
                  bet.bet_id || bet.id
                )
              ),
              // Time
              el.td({className:'hidden-xs'},
                helpers.formatDateToTime(bet.created_at)
              ),
              // User
              el.td({className:'hidden-xs'},
                bet.raw_outcome ? bet.raw_outcome : '--'
              ),
              // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, (((worldStore.state.coin_type == 'BITS')&&(bet.currency == 'BTC')) ? (bet.wager/100).toFixed(2) + ' BITS' : (bet.wager / 1e8).toFixed(8) + bet.currency) ),
              // target
              el.td(null,
                bet.meta.kind == 'DICE' ? bet.meta.cond + ' ' + bet.meta.number.toFixed(4) : bet.meta.kind == 'SLIDERS' ?  '<' + bet.target.start + '-' + bet.target.end + '>':type
              ),
              // roll
              el.td(null,
                ((bet.meta.kind == 'DICE')||(bet.meta.kind == 'SLIDERS')||(bet.meta.kind == 'BITCLIMBER')) ? bet.outcome + ' ' : '-',
                bet.meta.isFair ?
                  el.span(
                    {className: 'label label-success'}, 'Verified') : ''
              ),
              // Profit
              el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                bet.profit > 0 ? '+' : '',
                ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency : (((worldStore.state.coin_type == 'BITS')&&(bet.currency == 'BTC')) ? (bet.profit/100).toFixed(2) + ' BITS' : (bet.profit / 1e8).toFixed(8) + bet.currency)
              )
            );
          }).reverse()
        )
      )
    );
  }
});


var faucettimeout = 300;
var timer_running = false;
var faucet_int;

function faucet_timer(){
  if (faucettimeout > 1){
    faucettimeout -= 1;
      Dispatcher.sendAction('UPDATE_FAUCET_TIMER');
  }else {
    faucettimeout = 300;
    clearInterval(faucet_int);
    console.log('Timer Stopped for faucet');
    faucetstate.setState({
      faucetState: 'SHOW_RECAPTCHA',
      claimAmount: undefined
    });
    setTimeout(function(){Dispatcher.sendAction('UPDATE_FAUCET_TIMER');},1000);
    timer_running = false;
  }
};

var faucetstate;

var FaucetTabContent = React.createClass({
  displayName: 'FaucetTabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  getInitialState: function() {
    return {
      // SHOW_RECAPTCHA | SUCCESSFULLY_CLAIM | ALREADY_CLAIMED | WAITING_FOR_SERVER | NOT_ENOUGH_WAGER | NO_BUCKET_ASSIGNED
      faucetState: 'SHOW_RECAPTCHA',
      // :: Integer that's updated after the claim from the server so we
      // can show user how much the claim was worth without hardcoding it
      // - It will be in satoshis
      claimAmount: undefined
    };
  },
  // This function is extracted so that we can call it on update and mount
  // when the window.grecaptcha instance loads
  _renderRecaptcha: function() {
    worldStore.state.grecaptcha.render(
      'recaptcha-target',
      {
        sitekey: config.recaptcha_sitekey,
        callback: this._onRecaptchaSubmit
      }
    );
  },
  // `response` is the g-recaptcha-response returned from google
  _onRecaptchaSubmit: function(response) {
    var self = this;
    console.log('recaptcha submitted: ', response);

    self.setState({ faucetState: 'WAITING_FOR_SERVER' });

    var params = {
        response: response
      };
      socket.emit('claim_faucet', params, function(err, data) {
        if(config.debug){  console.log('Socket returned for claim_faucet');}
        Dispatcher.sendAction('STOP_REFRESHING_POKER');
        if (err) {
          console.log('[socket] claim_faucet failure:', err);
          if (err === 'FAUCET_ALREADY_CLAIMED'){
            self.setState({ faucetState: 'ALREADY_CLAIMED' });
          }else if ((err === 'NOT_ENOUGH_WAGER')||(err === 'NO_BUCKET_ASSIGNED')||(err === 'MAX_CLAIMS_REACHED')){
            self.setState({ faucetState: err });
          }else if (err === 'MAX_CLAIMS_REACHED'){
            self.setState({ faucetState: 'MAX_CLAIMS_REACHED' });
          }
          return;
        }
        console.log('[socket] claim_faucet success: ', data);
       /* Dispatcher.sendAction('UPDATE_USER', {
          balances: worldStore.state.user.balances.bxo + data.amount
        });
        */
        Dispatcher.sendAction('UPDATE_USER', {
          balances: {bxo: worldStore.state.user.balances.bxo + data.amount}
        });
        self.setState({
          faucetState: 'SUCCESSFULLY_CLAIMED',
          claimAmount: data.amount
        });
        faucettimeout = 300;
        if (timer_running == false){
          console.log('Timer Started for faucet');
          timer_running = true;
          faucet_int = setInterval(faucet_timer,1000);
        }
        
      });

    /*
    MoneyPot.claimFaucet(response, {
      // `data` is { claim_id: Int, amount: Satoshis }
      success: function(data) {
        Dispatcher.sendAction('UPDATE_USER', {
          balance: worldStore.state.user.balance + data.amount
        });
        Dispatcher.sendAction('START_REFRESHING_USER');
        self.setState({
          faucetState: 'SUCCESSFULLY_CLAIMED',
          claimAmount: data.amount
        });
        //TODO enable faucet timer
        faucettimeout = 300;
        if (timer_running == false){
          console.log('Timer Started for faucet');
          timer_running = true;
          faucet_int = setInterval(faucet_timer,1000);
          }
      },
      error: function(xhr, textStatus, errorThrown) {
        if (xhr.responseJSON && xhr.responseJSON.error === 'FAUCET_ALREADY_CLAIMED') {
          self.setState({ faucetState: 'ALREADY_CLAIMED' });
        }
      }
    });
    */
  },
  _ClickBE:function(){
    $('#dogeModal').modal('show');
  },
  // This component will mount before window.grecaptcha is loaded if user
  // clicks the Faucet tab before the recaptcha.js script loads, so don't assume
  // we have a grecaptcha instance
  componentDidMount: function() {
    if (worldStore.state.grecaptcha) {
      this._renderRecaptcha();
    }

    worldStore.on('grecaptcha_loaded', this._renderRecaptcha);
    worldStore.on('faucet_timer_update', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('grecaptcha_loaded', this._renderRecaptcha);
    worldStore.off('faucet_timer_update', this._onStoreChange);
  },
  render: function() {
    faucetstate = this;
    // If user is not logged in, let them know only logged-in users can claim
    if (!worldStore.state.user) {
      return el.div(null,
              el.div(
                {className: 'panel panel-default'},
                el.div({className: 'panel-body'},
                  el.p(
                    {className: 'lead'},
                    'You must login to claim faucet'
                  )
                )
              ),
              el.div(
                {className: 'panel panel-default'},
                el.div({className: 'panel-body'},
                  el.h6(null, 'Faucet Rules: '),
                  el.p(null, 'You may claim the faucet every 5 minutes up to a maximum of 10 times per day.'),
                  el.p(null, 'The faucet reward is caculated at 0.01 bxo + (0.01 * userlevel). Earn higher levels by wagering coins.'),
                  el.p(null, 'You must wager at least the value of your last claim before claiming again.')
                )
              )
      );
    }
    else if (worldStore.state.user.dogelogin){
    

    var innerNode;
    // SHOW_RECAPTCHA | SUCCESSFULLY_CLAIMED | ALREADY_CLAIMED | WAITING_FOR_SERVER
    switch(this.state.faucetState) {
      case 'SHOW_RECAPTCHA':
        innerNode = el.div(
          { id: 'recaptcha-target' },
          !!worldStore.state.grecaptcha ? '' : 'Loading...'
        );
        break;
      case 'SUCCESSFULLY_CLAIMED':
        innerNode = el.div(
          null,
          'Successfully claimed ' + this.state.claimAmount + ' bxo.' +
            // TODO: What's the real interval?
            ' You can claim again in 5 minutes.'
        );
        break;
      case 'ALREADY_CLAIMED':
        innerNode = el.div(
          null,
          'ALREADY_CLAIMED'
        );
        break;
      case 'WAITING_FOR_SERVER':
        innerNode = el.div(
          null,
          'WAITING_FOR_SERVER'
        );
        break;
      case 'NOT_ENOUGH_WAGER':
        innerNode = el.div(
          null,
          'YOU MUST WAGER PREVIOUSLY CLAIMED BITS FIRST'
        );
        break;
      case 'NO_BUCKET_ASSIGNED':
        innerNode = el.div(
          null,
          'FAUCET NOT FUNDED YET TRY AGAIN LATER'
        );  
        break; 
      case 'MAX_CLAIMS_REACHED':
        innerNode = el.div(
          null,
          'MAXIMUM NUMBER OF CLAIMS REACHED FOR TODAY, TRY DEPOSITING TO PLAY FURTHER'
        );
        break;     
      default:
        alert('Unhandled faucet state');
        return;
    }

    /*
    if ((worldStore.state.coin_type != 'BITS') && (worldStore.state.coin_type != 'BTC')){
      innerNode = el.div(null, 'Faucet Currently Unavailable for alt currencies')
    }*/

    return el.div(
              null,
              el.div(
                {className: 'panel panel-default'},
                el.div({className: 'panel-body'},
                /*  el.div({className:'text-center'},
                    el.img({src:"./res/banner.gif", height:"60", width:"477"})
                  ),*/
               //   el.div({className:'h6', style:{fontWeight:'bold'}},
               //    'Faucet Temporarily Unavailable'// (faucettimeout == 300) ? 'Ready to Claim' : 'You Must Wait: ' + faucettimeout.toString() + ' Seconds to Claim Again'
               //   ),
                innerNode
                ),
                el.div(
                  {className: 'panel panel-default'},
                  el.div({className: 'panel-body'},
                    el.h6(null, 'Faucet Rules: '),
                    el.p(null, 'You may claim the faucet every 5 minutes up to a maximum of 10 times per day.'),
                    el.p(null, 'The faucet reward is caculated at 0.01 bxo + (0.01 * userlevel). Earn higher levels by wagering coins.'),
                    el.p(null, 'You must wager at least the value of your last claim before claiming again.')
                  )
                )
              )
            );
    }else{
      return el.div(null,
        el.div(
          {className: 'panel panel-default'},
          el.div({className: 'panel-body'},
            el.p(
              {className: 'lead'},
              'You must login with or create a bit-exo site login to claim'
            ),
            el.button({type:'button', className:'btn btn-md btn-default', onClick: this._ClickBE}, 'Bit-Exo Login')
          ),
          el.div(
            {className: 'panel panel-default'},
            el.div({className: 'panel-body'},
              el.h6(null, 'Faucet Rules: '),
              el.p(null, 'You may claim the faucet every 5 minutes up to a maximum of 10 times per day.'),
              el.p(null, 'The faucet reward is caculated at 0.01 bxo + (0.01 bxo * userlevel). Earn higher levels by wagering coins.'),
              el.p(null, 'You must wager at least the value of your last claim before claiming again.')
            )
          )
        )
      );
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
var FilterUserInput = React.createClass({
  displayName:'FilterUserInput',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  _onFilterUserChange: function(e) {
    var str = e.target.value;
    Dispatcher.sendAction('UPDATE_FILTER_USER', { str: str });
  },
  render: function(){
    return el.div(null,
        el.div({className: 'col-xs-12 col-sm-6 col-lg-3',style:{marginBottom:'-5px'}},
        el.div(
          {className: 'form-group'},
          el.span(
            {className: 'input-group input-group-sm'},
            el.span({className: 'input-group-addon'},'User'),
            el.input(
              {
                value: worldStore.state.filteruser.str,
                type: 'text',
                className: 'form-control input-sm',
                onChange: this._onFilterUserChange,
                placeholder: 'User'
              }
            )
          )
        )
      )
    );
  }
});

var FilterWagerInput = React.createClass({
  displayName:'FilterWagerInput',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  _validateFilterWager: function(newStr) {
    var num = parseFloat(newStr, 10);

    // Ensure str is a number
    if (isNaN(num)) {
      Dispatcher.sendAction('UPDATE_FILTER_WAGER', {
        num: 0.0,
        error: null });
    } else if (num < 0) {
      Dispatcher.sendAction('UPDATE_FILTER_WAGER', {
      num: 0.0,
      error: null });
    } else {
      Dispatcher.sendAction('UPDATE_FILTER_WAGER', {
        num: num,
        error: null
      });
    }
  },
  _onFilterWagerChange: function(e) {
    var str = e.target.value;
    Dispatcher.sendAction('UPDATE_FILTER_WAGER', { str: str });
    this._validateFilterWager(str);
  },

  render: function(){
    return el.div(null,
        el.div({className: 'col-xs-12 col-sm-6 col-lg-3',style:{marginBottom:'-5px'}},
          el.div(
            {className: 'form-group'},
            el.span(
              {className: 'input-group input-group-sm'},
              el.span({className: 'input-group-addon'},'Wager >'),
              el.input(
                {
                  value: worldStore.state.filterwager.str,
                  type: 'text',
                  className: 'form-control input-sm',
                  onChange: this._onFilterWagerChange,
                  placeholder: 'bits'
                }
              ),
              el.span({className: 'input-group-addon'},worldStore.state.coin_type)
            )
          )
        )
      );
  }
});

var FilterProfitInput = React.createClass({
  displayName:'FilterProfitInput',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  _validateFilterProfit: function(newStr) {
    var num = parseFloat(newStr, 10);

    // Ensure str is a number
    if (isNaN(num)) {
      Dispatcher.sendAction('UPDATE_FILTER_PROFIT', {
        num: 0.0,
        error: null });
    } else if (num < 0) {
      Dispatcher.sendAction('UPDATE_FILTER_PROFIT', {
        num: 0.0,
        error: null });
    } else {
      Dispatcher.sendAction('UPDATE_FILTER_PROFIT', {
        num: num,
        error: null
      });
    }
  },
  _onFilterProfitChange: function(e) {
    var str = e.target.value;
    Dispatcher.sendAction('UPDATE_FILTER_PROFIT', { str: str });
    this._validateFilterProfit(str);
  },

  render: function(){
    return el.div(null,
      el.div({className: 'col-xs-12 col-sm-6 col-lg-3',style:{marginBottom:'-5px'}},
        el.div(
          {className: 'form-group'},
          el.span(
            {className: 'input-group input-group-sm'},
            el.span({className: 'input-group-addon'},'Profit >'),
            el.input(
              {
                value: worldStore.state.filterprofit.str,
                type: 'text',
                className: 'form-control input-sm',
                onChange: this._onFilterProfitChange,
                placeholder: 'bits'
              }
            ),
            el.span({className: 'input-group-addon'},worldStore.state.coin_type)
          )
        )
      )
    );
  }
});

var GameFilterSelect = React.createClass({
  displayName: 'GameFilterSelect',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  //_togglegamefilter: function(){
  //  Dispatcher.sendAction('TOGGLE_GAME_FILTER', null);
  //},
  _onClick: function() {
   $('dropdown-toggle').dropdown();
  },
  _ActionClick: function(type){
    return function(){
      console.log('click action ' + type);
      Dispatcher.sendAction('SET_GAME_FILTER', type);
    };

  },
  render: function() {
      //this.props.selected = colours[0];
      return el.div(null,
        el.div({className: 'col-xs-12 col-md-6 col-lg-3'},
        el.div (
          {className: 'btn-group input-group'},
          el.div({ className:'input-group-addon', style:{fontWeight:'bold'}},'Game'),
          el.button(
            {
              type:'button',
              className:'btn btn-md btn-danger dropdown-toggle',
              "data-toggle":'dropdown',
              "aria-haspopup":'true',
              "aria-expanded":'false',
              onClick:this._onClick
            },
            worldStore.state.filtergame , el.span({className:'caret'},'')
          ),
          el.ul({className:'dropdown-menu'},
            el.li(null, el.a({onClick: this._ActionClick('ALL GAMES')},'ALL GAMES')),
            el.li(null, el.a({onClick: this._ActionClick('DICE')},'DICE')),
            el.li(null, el.a({onClick: this._ActionClick('PLINKO')},'PLINKO')),
            el.li(null, el.a({onClick: this._ActionClick('ROULETTE')},'ROULETTE')),
            el.li(null, el.a({onClick: this._ActionClick('BITSWEEP')},'BITSWEEP')),
            el.li(null, el.a({onClick: this._ActionClick('SLOTS')},'SLOTS')),
            el.li(null, el.a({onClick: this._ActionClick('BITCLIMBER')},'BITCLIMBER')),
            el.li(null, el.a({onClick: this._ActionClick('SLIDERS')},'SLIDERS')),
            el.li(null, el.a({onClick: this._ActionClick('WONDERW')},'WONDERW'))
        )
        )
        )
      );
  }

});


var CurrencyFilterSelect = React.createClass({
  displayName: 'CurrencyFilterSelect',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  //_togglegamefilter: function(){
  //  Dispatcher.sendAction('TOGGLE_GAME_FILTER', null);
  //},
  _onClick: function() {
   $('dropdown-toggle').dropdown();
  },
  _ActionClick: function(type){
    return function(){
      console.log('click action ' + type);
      Dispatcher.sendAction('SET_CURRENCY_FILTER', type);
    };

  },
  render: function() {
      //this.props.selected = colours[0];
      return el.div(null,
        el.div({className: 'col-xs-12 col-md-6 col-lg-3'},
        el.div (
          {className: 'btn-group input-group'},
          el.div({ className:'input-group-addon', style:{fontWeight:'bold'}},'Currency'),
          el.button(
            {
              type:'button',
              className:'btn btn-md btn-danger dropdown-toggle',
              "data-toggle":'dropdown',
              "aria-haspopup":'true',
              "aria-expanded":'false',
              onClick:this._onClick
            },
            worldStore.state.filtercurrency , el.span({className:'caret'},'')
          ),
          el.ul({className:'dropdown-menu'},
            el.li(null, el.a({onClick: this._ActionClick('ALL CURRENCY')},'ALL CURRENCY')),
            el.li(null, el.a({onClick: this._ActionClick('BTC')},'BTC')),
            el.li(null, el.a({onClick: this._ActionClick('LTC')},'LTC')),
            el.li(null, el.a({onClick: this._ActionClick('DASH')},'DASH')),
            el.li(null, el.a({onClick: this._ActionClick('ADK')},'ADK')),
            el.li(null, el.a({onClick: this._ActionClick('GRLC')},'GRLC')),
            el.li(null, el.a({onClick: this._ActionClick('FLASH')},'FLASH')),
            el.li(null, el.a({onClick: this._ActionClick('ETH')},'ETH')),
            el.li(null, el.a({onClick: this._ActionClick('MBI')},'MBI')),
            el.li(null, el.a({onClick: this._ActionClick('WAVES')},'WAVES')),
            el.li(null, el.a({onClick: this._ActionClick('DOGE')},'DOGE')),
            el.li(null, el.a({onClick: this._ActionClick('BXO')},'BXO')),
            el.li(null, el.a({onClick: this._ActionClick('CLAM')},'CLAM')),
        )
        )
        )
      );
  }

});



var color_picker = function(number){
  var result = '';
  switch(number){
    case 0:
      result = '#009901';
      break;
    case 1:
    case 3:
    case 5:
    case 7:
    case 9:
    case 12:
    case 14:
    case 16:
    case 18:
    case 19:
    case 21:
    case 23:
    case 25:
    case 27:
    case 30:
    case 32:
    case 34:
    case 36:
      result = '#B50B32';
      break;
    default:
      result = 'black';
      break;
    }
  return result;
}


////////////////////////////////////////////////////////////////////////////////////////
var allbetdelay = false;
var renderallbet = true;

var AllBetsTabContent = React.createClass({
  displayName: 'AllBetsTabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('new_all_bet', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('new_all_bet', this._onStoreChange);
  },
  render: function() {
    return el.div(null,
      el.div(
        {className: 'panel panel-default'},
        el.div(
          {className: 'panel-body'},
          el.span({className: 'h6 col-xs-12 col-lg-2'},'Filter New Bets By:'),
          el.div(
            {className:'well well-sm col-xs-12 col-lg-10',style:{marginBottom:'-5px',marginTop:'-10'}},
            React.createElement(FilterUserInput, null),
            React.createElement(FilterWagerInput, null),
            React.createElement(FilterProfitInput, null),
            React.createElement(GameFilterSelect, null),
            React.createElement(CurrencyFilterSelect, null)
          )
        )
      ),
      el.table(
        {className: 'table', style: {marginTop: '-15px'}},
        el.thead(null,
          el.tr(null,
            el.th(null, 'ID'),
            el.th({className:'hidden-xs'}, 'Time'),
            el.th(null, 'User'),
            el.th(null, 'Wager'),
            el.th({className: 'text-right hidden-xs'}, 'Target'),
            el.th(null, 'Outcome'),
            el.th(
              {
                style: {paddingLeft: '50px'}
              },
              'Profit'
            )
          )
        ),
        el.tbody(null,
          worldStore.state.allBets.toArray().map(function(bet) {

            switch(bet.kind){
              case 'DICE':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                   /* el.a({
                        href: config.mp_browser_uri + '/users/' + bet.uname,
                        target: '_blank'
                      },
                      bet.uname
                    )
                    */
                   ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                    href: window.location.href + 'users/' + bet.uname,
                    target: '_blank'
                  },
                  bet.uname
                  ) : el.a({
                        href: config.mp_browser_uri + '/users/' + bet.uname,
                        target: '_blank'
                      },
                      bet.uname
                  )
                  ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.cond + bet.target.toFixed(4)
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    // progress bar container
                    el.div({className: 'progress',
                            style: {
                              minWidth: '100px',
                              position: 'relative',
                              marginBottom: 0,
                              height: '10px'
                            }
                      },
                      el.div({className: 'progress-bar ' + (bet.profit >= 0 ? 'progress-bar-success' : 'progress-bar-grey') ,
                              style: {
                                float: bet.cond === '<' ? 'left' : 'right',
                                width: bet.cond === '<' ?  bet.target.toString() + '%' : (100 - bet.target).toString() + '%'
                              }
                            }
                      ),
                      el.div({style: {position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      width: bet.outcome.toString() + '%',
                                      borderRight: '3px solid #333',
                                      height: '100%'
                                  }
                              }
                      )
                    ),
                    // arrow container
                    el.div({style:{ position: 'relative',
                                    width: '100%',
                                    height: '15px'
                                  }
                          },
                        // arrow
                        el.div({style: {position: 'absolute',
                                        top: 0,
                                        left: (bet.outcome - 1).toString() + '%'
                                      }
                              },
                            el.div({style: {width: '5em',marginLeft: '-10px'}},
                              el.span({style: {fontFamily: 'monospace'}},
                                bet.outcome
                              )
                            )
                        )
                    )
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
              case 'PLINKO':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    (bet.profit > 0) ? ((bet.profit+bet.wager)/bet.wager).toFixed(3) + 'X' : '0X'
                  ),
                  // Profit
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
              case 'ROULETTE':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    el.div ({className: 'col-xs-1 history_allbets', style:{background: color_picker(bet.outcome)}},bet.outcome.toString())
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
              case 'BITSWEEP':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    bet.profit > 0 ? el.span({className:'glyphicon glyphicon-bitcoin',style:{color:'green'}},'') : el.span({className:'glyphicon glyphicon-certificate',style:{color:'red'}},'')
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
              case 'SLOTS':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    (bet.profit > 0) ? ((bet.profit+bet.wager)/bet.wager).toFixed(0) + 'X' : (bet.profit == 0) ? '1X' : '0X'
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
              case 'BITCLIMBER':
              return el.tr({key: bet.id},
                // bet id
                el.td(null,
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                // Time
                el.td({className:'hidden-xs'},
                  helpers.formatDateToTime(bet.created_at)
                ),
                // User
                el.td(null,
                  /* el.a({
                       href: config.mp_browser_uri + '/users/' + bet.uname,
                       target: '_blank'
                     },
                     bet.uname
                   )
                   */
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                   href: window.location.href + 'users/' + bet.uname,
                   target: '_blank'
                 },
                 bet.uname
                 ) : el.a({
                       href: config.mp_browser_uri + '/users/' + bet.uname,
                       target: '_blank'
                     },
                     bet.uname
                 )
                 ),
                // Wager
                ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                // Target
                el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                  bet.kind
                ),
                // Visual
                el.td({style: {fontFamily: 'monospace'}},
                  bet.outcome + 'X'
                ),
                // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
              );
                break;
              case 'SLIDERS':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    // progress bar container
                    el.div({className: 'progress',
                            style: {
                              minWidth: '100px',
                              position: 'relative',
                              marginBottom: 0,
                              height: '10px'
                            }
                      },
                      el.div({className: 'progress-bar progress-bar-dark',
                              style: {
                                //float: 'left',
                                width: (bet.target.start).toString() + '%'
                              }
                            }
                      ),
                      el.div({className: 'progress-bar ' + (bet.profit >= 0 ? 'progress-bar-success' : 'progress-bar-grey') ,
                              style: {
                                //float: 'left',
                                width: (bet.target.end - bet.target.start).toString() + '%'
                              }
                            }
                      ),
                      el.div({className: 'progress-bar progress-bar-dark',
                              style: {
                                //float: 'left',
                                width: bet.target.start2 ? (bet.target.start2 - bet.target.end).toString() + '%' : (100- bet.target.end).toString() + '%'
                              }
                            }
                      ),
                      bet.target.start2 ? el.div({className: 'progress-bar ' + (bet.profit >= 0 ? 'progress-bar-success' : 'progress-bar-grey') ,
                              style: {
                                //float: 'left',
                                width: (bet.target.end2 - bet.target.start2).toString() + '%'
                              }
                            }
                      ) : '',
                     bet.target.start2 ?  el.div({className: 'progress-bar progress-bar-dark',
                              style: {
                                //float: 'left',
                                width: (100- bet.target.end2).toString() + '%'
                              }
                            }
                      ) : '',
                      el.div({style: {position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      width: bet.outcome.toString() + '%',
                                      borderRight: '3px solid #333',
                                      height: '100%'
                                  }
                              }
                      )
                    ),
                    // arrow container
                    el.div({style:{ position: 'relative',
                                    width: '100%',
                                    height: '15px'
                                  }
                          },
                        // arrow
                        el.div({style: {position: 'absolute',
                                        top: 0,
                                        left: (bet.outcome - 1).toString() + '%'
                                      }
                              },
                            el.div({style: {width: '5em',marginLeft: '-10px'}},
                              el.span({style: {fontFamily: 'monospace'}},
                                bet.outcome
                              )
                            )
                        )
                    )
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );
                break;
                case 'SLOTSGO':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    el.a({href: config.mp_browser_uri + '/bets/' + bet.id,
                        target: '_blank'
                      },
                      bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    el.a({
                        href: config.mp_browser_uri + '/users/' + bet.uname,
                        target: '_blank'
                      },
                      bet.uname
                    )
                  ),
                  // Wager
                  bet.currency == 'DOGE' ? el.td(null, bet.wager.toFixed(8) + ' DOGE') : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC' :worldStore.state.coin_type)),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    bet.outcome + 'X'
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    bet.currency == 'DOGE' ? bet.profit.toFixed(8) + ' DOGE': helpers.convNumtoStrBets(bet.profit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC' :worldStore.state.coin_type)
                  )
                );
                break;
                case 'WONDERW':
                return el.tr({key: bet.id},
                  // bet id
                  el.td(null,
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a(
                      { 
                        href: window.location.href + 'bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    ) : el.a(
                      {
                        href: config.mp_browser_uri + '/bets/' + (bet.bet_id || bet.id),
                        target: '_blank'
                      },
                      bet.bet_id || bet.id
                    )
                  ),
                  // Time
                  el.td({className:'hidden-xs'},
                    helpers.formatDateToTime(bet.created_at)
                  ),
                  // User
                  el.td(null,
                    /* el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                     )
                     */
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.a({
                     href: window.location.href + 'users/' + bet.uname,
                     target: '_blank'
                   },
                   bet.uname
                   ) : el.a({
                         href: config.mp_browser_uri + '/users/' + bet.uname,
                         target: '_blank'
                       },
                       bet.uname
                   )
                   ),
                  // Wager
                  ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? el.td(null, bet.wager.toFixed(8) + ' ' + bet.currency) : el.td(null, helpers.convNumtoStrBets(bet.wager) + ' ' + bet.currency),
                  // Target
                  el.td({className: 'text-right hidden-xs',style: {fontFamily: 'monospace'}},
                    bet.kind
                  ),
                  // Visual
                  el.td({style: {fontFamily: 'monospace'}},
                    bet.outcome
                  ),
                  // Profit
                  el.td( {style: {color: bet.profit > 0 ? 'green' : 'red',paddingLeft: '50px'}},
                    bet.profit > 0 ? '+' : '',
                    ((bet.currency == 'DOGE')||(bet.currency == 'BXO')||(bet.currency == 'CLAM')) ? bet.profit.toFixed(8) + ' ' + bet.currency: helpers.convNumtoStrBets(bet.profit) + ' ' + bet.currency
                  )
                );  
                break;
            }//END SWITCH

          }).reverse()
        )
      )
    );
  }
});

////////////////////////////////////////////////////////////////////////////////

function rand(min, max, num) {
          var rtn = [];
          while (rtn.length < num) {
            rtn.push((Math.random() * (max - min)) + min);
          }
          return rtn;
  }

function basefill(num) {
            var rtn = [];
            rtn.push(0);
            while (rtn.length < num) {
              rtn.push(100);
            }
            return rtn;
  }

function labelfill(num){
     var rtn = [];
     while (rtn.length < num){
       rtn.push(' ');
     }
     return rtn;
   }


function getuserbets(num){
  var runningprofit = worldStore.state.user.betted_profit;
  var add;
  var rtn = [];

  //list_user_bets
  var params = {
    uname: worldStore.state.user.uname
  }
  socket.emit('list_user_bets', params, function(err, bets) {
    if (err) {
      console.log('Error list_user_bets:', err);
      return;
    }
    console.log('Successfully loaded list_user_bets:', bets);
    var betsreversed = bets;
    console.log('[Loaded bets for chart]:', bets);
    for (add = 0; add < num; add++)
      {
        if (bets[add]){
          runningprofit = runningprofit - bets[add].profit;
        }else{break;}
      }
    for (add = 0; add < num; add++)
      {
        if (betsreversed[add]){
          runningprofit += betsreversed[add].profit;
          rtn.push(helpers.convSatstoCointype(runningprofit));
        }else{break;}
      }
    Dispatcher.sendAction('UPDATE_HISTORY');
  });

  return rtn;
  }

  var data1 = {
      labels: labelfill(50),//labelfill(config.bet_buffer_size),//['a','b','c','d'],
      datasets: [ {
              label: "dataset1",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
              pointColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: basefill(50)//rand(-32, 1000, 50)
            } ]
  };


var HistoryChart = React.createClass({
  displayName:'HistoryChart',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('bet_history_change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('bet_history_change', this._onStoreChange);
  },

  _onClick: function() {
    //Load profit history
    Dispatcher.sendAction('LOAD_CHART_DATA');
  },
  _onClickLiveToggle: function(){
    Dispatcher.sendAction('LOAD_CHART_DATA');
    Dispatcher.sendAction('TOGGLE_LIVE_CHART');//worldStore.state.LiveGraph
  },

  render: function() {
    console.log('[NewGraph]');
    //check if graph rising
    if (Number(data1.datasets[0].data[data1.datasets[0].data.length - 1]) > Number(data1.datasets[0].data[0]))
      {
      data1.datasets[0].strokeColor = "rgba(119,179,0, 0.8)";
      data1.datasets[0].pointColor = "rgba(119,179,0, 0.8)";
      }else{
        data1.datasets[0].strokeColor = "rgba(153,51,204, 0.8)";
        data1.datasets[0].pointColor = "rgba(153,51,204, 0.8)";
      }

    var props = { data: data1};
    var factory = React.createFactory(Chart.React['Line']);
    var options = {
        options:{
          animation: false,
          pointDot : false,
          pointHitDetectionRadius : 5,
          responsive: true,
          maintainAspectRatio: false,
          height: 75
          }
        };
    var _props = _.defaults({
      data: data1
    },options, props);
    var component = new factory(_props);

    return el.div(null,
              el.div({className:'col-xs-3'},
                el.button(
                    {
                      type: 'button',
                      className: 'btn btn-primary btn-md',
                      onClick: this._onClick
                    },
                    'Graph Last 50 Bets'
                  )
              ),
              el.div({className:'col-xs-3'},
                el.button(
                    {
                      type: 'button',
                      className: 'btn btn-info btn-md',
                      onClick: this._onClickLiveToggle
                    },
                    'Live Graph ',
                    worldStore.state.LiveGraph ?
                      el.span({className: 'label label-success'}, 'ENABLED') :
                      el.span({className: 'label label-default'}, 'DISABLED')
                  )
              ),
              el.div(null,
              component
              )
        );
    }

});


////////////////////////////////////////////////////////////////////////////////////

var MoneypotStats = React.createClass({
  displayName: 'MoneypotStats',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  render: function() {
    var doge_invest = 0;
    var doge_wager = 0;
    var doge_profits = 0;
    var mp_invest = 0;
    var mp_wager = 0;
    var mp_profit = 0;
    var maxprofit = 0;

    switch(worldStore.state.coin_type){
      
      case 'BITS':
        mp_invest = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll.btc.balance).toString());
        mp_wager =  helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll.btc.wagered).toString());
        mp_profit = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll.btc.balance - worldStore.state.bankroll.btc.invested).toString());
        maxprofit = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll.btc.balance * 0.005).toString());
        break;
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'ADK':
      case 'GRLC':
      case 'FLASH':
      case 'ETH':
      case 'MBI':
      case 'WAVES':
        mp_invest = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].balance).toString());
        mp_wager =  helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].wagered).toString());
        mp_profit = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].balance - worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].invested).toString());
        if ((worldStore.state.coin_type == 'GRLC')||(worldStore.state.coin_type == 'FLASH')){
          maxprofit = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].balance * 0.01).toString());
        }else{
          maxprofit = helpers.commafy(helpers.convSatstoCointype(worldStore.state.bankroll[worldStore.state.coin_type.toLowerCase()].balance * 0.005).toString());
        }
        break;
   
      case 'DOGE':
        if (worldStore.state.doge_invest_app.invested){
          mp_invest = worldStore.state.doge_invest_app.invested.toFixed(2);
          mp_wager = worldStore.state.doge_invest_app.total_wager.toFixed(2);
          mp_profit = worldStore.state.doge_invest_app.investorprofit.toFixed(2);
          maxprofit = worldStore.state.doge_invest_app.maxprofit.toFixed(2);
        }else{
          mp_invest = 0;
          mp_wager = 0;
          mp_profit = 0
          maxprofit = 0;;
        }
        break;
      case 'BXO':
        if (worldStore.state.bxo_invest_app.invested){
          mp_invest = worldStore.state.bxo_invest_app.invested.toFixed(4);
          mp_wager = worldStore.state.bxo_invest_app.total_wager.toFixed(4);
          mp_profit = worldStore.state.bxo_invest_app.investorprofit.toFixed(4);
          maxprofit = worldStore.state.bxo_invest_app.maxprofit.toFixed(4);
        }else{
          mp_invest = 0;
          mp_wager = 0;
          mp_profit = 0;
          maxprofit = 0;
        }
        break;
      case 'CLAM':
        if (worldStore.state.clam_invest_app.invested){
          mp_invest = worldStore.state.clam_invest_app.invested.toFixed(4);
          mp_wager = worldStore.state.clam_invest_app.total_wager.toFixed(4);
          mp_profit = worldStore.state.clam_invest_app.investorprofit.toFixed(4);
          maxprofit = worldStore.state.clam_invest_app.maxprofit.toFixed(4);
        }else{
          mp_invest = 0;
          mp_wager = 0;
          mp_profit = 0;
          maxprofit = 0;
        }
      break;     
    }

  //  if (worldStore.state.doge_invest_app.invested){
  //    doge_invest = worldStore.state.doge_invest_app.invested.toFixed(2);
  //    doge_wager = worldStore.state.doge_invest_app.total_wager.toFixed(2);
  //    doge_profits = worldStore.state.doge_invest_app.investorprofit.toFixed(2);
   // }

    /**
     * 
     * el.div({className:'col-xs-12 col-sm-6 col-md-3'},
                          el.h6({className:'h6', style:{marginBottom:'5px'}},'Your Invested: '),
                            el.span(null, el.strong(null, user_invested + ' ' + this.state.currency))
                          ),
     */

    return el.div(
          null,
        //  el.div(
        //    null,
        //    el.span(
        //      {className: 'h6', style: { fontWeight: 'bold',marginTop: '-25px' }},
        //      (((worldStore.state.coin_type =='DOGE')||(worldStore.state.coin_type =='BXO')) ? 'Bit-Exo':'Moneypot')
        //    )
        //  ),
          el.h6({className:'h6', style:{marginBottom:'5px'}},
            (((worldStore.state.coin_type =='DOGE')||(worldStore.state.coin_type =='BXO')||(worldStore.state.coin_type =='CLAM')) ? 'Bit-Exo':'Moneypot')
          ),
          el.div(
            {className: 'col-xs-12 well well-sm'},
            el.div({className:'row'},
            el.div(
              {className: 'col-xs-12 col-sm-4 col-md-3'},
              el.h6({className:'h6', style:{marginBottom:'5px'}}, 'Invested:'),
              el.span(null, el.strong(null, mp_invest + ' ' + worldStore.state.coin_type))
              //  el.span({style: { fontWeight: 'bold',marginTop: '-25px' }},
            //    'Invested: ' + (((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')) ? doge_invest + ' ' + worldStore.state.coin_type : helpers.commafy(helpers.convSatstoCointype(mp_invest).toString()) + ' ' + worldStore.state.coin_type )
            //  )
            ),
            el.div(
              {className: 'col-xs-12 col-sm-4 col-md-3'},
              el.h6({className:'h6', style:{marginBottom:'5px'}}, 'Wagered:'),
              el.span(null, el.strong(null, mp_wager + ' ' + worldStore.state.coin_type))
            //  el.span({style: { fontWeight: 'bold',marginTop: '-25px' }},
            //    'Wagered: ' + (((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')) ? doge_wager + ' ' + worldStore.state.coin_type : helpers.commafy(helpers.convSatstoCointype(mp_wager).toString()) + ' ' + worldStore.state.coin_type )
            //  )
            ),
            el.div(
              {className: 'col-xs-12 col-sm-4 col-md-3'},
              el.h6({className:'h6', style:{marginBottom:'5px'}}, 'Profit:'),
              el.span(null, el.strong(null, mp_profit + ' ' + worldStore.state.coin_type))
           //   el.span({style: { fontWeight: 'bold',marginTop: '-25px' }},
           //     'Profit: ' +  (((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')) ? doge_profits + ' ' + worldStore.state.coin_type : helpers.commafy(helpers.convSatstoCointype(mp_profit).toString()) + ' ' + worldStore.state.coin_type)
           //   )
            ),
            el.div(
              {className: 'col-xs-12 col-sm-4 col-md-3'},
              el.h6({className:'h6', style:{marginBottom:'5px'}}, 'Max Profit Per Bet:'),
              el.span(null, el.strong(null, maxprofit + ' ' + worldStore.state.coin_type))
           //   el.span({style: { fontWeight: 'bold',marginTop: '-25px' }},
           //     'Profit: ' +  (((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')) ? doge_profits + ' ' + worldStore.state.coin_type : helpers.commafy(helpers.convSatstoCointype(mp_profit).toString()) + ' ' + worldStore.state.coin_type)
           //   )
            )
            )
          )
    );

  }
});

var UserStatsDisplay = React.createClass({
  displayName: 'UserStatsDisplay',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
    worldStore.on('new_user_bet', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
    worldStore.off('new_user_bet', this._onStoreChange);
  },
  _resetstat:function(type){
    return function(){
      Dispatcher.sendAction('RESET_BET_STATS',type);
    }
  },
  render: function() {
    if (worldStore.state.user){
      if (worldStore.state.coin_type == 'BITS'){
          var wager_24 =  worldStore.state.user.stats.btc.wager24hour;
          var bet_count = worldStore.state.user.stats.btc.betted_count;
          var bet_wager = worldStore.state.user.stats.btc.betted_wager;
          var bet_profit = worldStore.state.user.stats.btc.betted_profit;
      }else{
          var wager_24 =  worldStore.state.user.stats[worldStore.state.coin_type.toLowerCase()].wager24hour;
          var bet_count = worldStore.state.user.stats[worldStore.state.coin_type.toLowerCase()].betted_count;
          var bet_wager = worldStore.state.user.stats[worldStore.state.coin_type.toLowerCase()].betted_wager;
          var bet_profit = worldStore.state.user.stats[worldStore.state.coin_type.toLowerCase()].betted_profit;
      }

      /*
      switch (worldStore.state.coin_type){
        case 'BTC':
        case 'BITS':
          var wager_24 =  worldStore.state.user.stats.btc.wager24hour;
          var bet_count = worldStore.state.user.stats.btc.betted_count;
          var bet_wager = worldStore.state.user.stats.btc.betted_wager;
          var bet_profit = worldStore.state.user.stats.btc.betted_profit;
        break;
        case 'LTC':
          var wager_24 =  worldStore.state.user.stats.ltc.wager24hour; 
          var bet_count = worldStore.state.user.stats.ltc.betted_count;
          var bet_wager = worldStore.state.user.stats.ltc.betted_wager;
          var bet_profit = worldStore.state.user.stats.ltc.betted_profit;
        break;
        case 'DASH':
          var wager_24 =  worldStore.state.user.stats.dash.wager24hour; 
          var bet_count = worldStore.state.user.stats.dash.betted_count;
          var bet_wager = worldStore.state.user.stats.dash.betted_wager;
          var bet_profit = worldStore.state.user.stats.dash.betted_profit;
        break;
        case 'ADK':
          var wager_24 =  worldStore.state.user.stats.adk.wager24hour; 
          var bet_count = worldStore.state.user.stats.adk.betted_count;
          var bet_wager = worldStore.state.user.stats.adk.betted_wager;
          var bet_profit = worldStore.state.user.stats.adk.betted_profit;
        break;
        case 'GRLC':
        var wager_24 =  worldStore.state.user.stats.grlc.wager24hour; 
        var bet_count = worldStore.state.user.stats.grlc.betted_count;
        var bet_wager = worldStore.state.user.stats.grlc.betted_wager;
        var bet_profit = worldStore.state.user.stats.grlc.betted_profit;
      break;
      case 'FLASH':
        var wager_24 =  worldStore.state.user.stats.flash.wager24hour; 
        var bet_count = worldStore.state.user.stats.flash.betted_count;
        var bet_wager = worldStore.state.user.stats.flash.betted_wager;
        var bet_profit = worldStore.state.user.stats.flash.betted_profit;
      break;
      case 'ETH':
        var wager_24 =  worldStore.state.user.stats.eth.wager24hour; 
        var bet_count = worldStore.state.user.stats.eth.betted_count;
        var bet_wager = worldStore.state.user.stats.eth.betted_wager;
        var bet_profit = worldStore.state.user.stats.eth.betted_profit;
      break;
        case 'DOGE':
          var wager_24 =  worldStore.state.user.stats.doge.wager24hour; 
          var bet_count = worldStore.state.user.stats.doge.betted_count;
          var bet_wager = worldStore.state.user.stats.doge.betted_wager;
          var bet_profit = worldStore.state.user.stats.doge.betted_profit;
        break;
        case 'BXO':
          var wager_24 =  worldStore.state.user.stats.bxo.wager24hour; 
          var bet_count = worldStore.state.user.stats.bxo.betted_count;
          var bet_wager = worldStore.state.user.stats.bxo.betted_wager;
          var bet_profit = worldStore.state.user.stats.bxo.betted_profit;
        break;  
      }
      */
      var level = worldStore.state.user.level;
      var levelwager = worldStore.state.user.levelwager;
      var remain_to_level = 100000000;
    }else{
      var wager_24 = 0;
      var bet_count = 0;
      var bet_wager = 0;
      var bet_profit = 0;

      var level = 0;
      var levelwager = 0;
      var remain_to_level = 100000000;
    }

    if (levelwager > 0){
      switch(level){
        case 0:
          var progress_wager = levelwager;
          var progress_per = (progress_wager/100000000) * 100;
          remain_to_level = 100000000 - progress_wager;
        break;
        case 1:
        var progress_wager = levelwager - 100000000;
          var progress_per = (progress_wager/100000000) * 100;
          remain_to_level = 100000000 - progress_wager;
        break;
        case 2:
        var progress_wager = levelwager - 200000000;
          var progress_per = (progress_wager/200000000) * 100;
          remain_to_level = 200000000 - progress_wager;
        break;
        case 3:
        var progress_wager = levelwager - 400000000;
          var progress_per = (progress_wager/400000000) * 100;
          remain_to_level = 400000000 - progress_wager;
        break;
        case 4:
        var progress_wager = levelwager - 800000000;
          var progress_per = (progress_wager/800000000) * 100;
          remain_to_level = 800000000 - progress_wager;
        break;
        case 5:
        var progress_wager = levelwager - 1600000000;
          var progress_per = (progress_wager/1600000000) * 100;
          remain_to_level = 1600000000 - progress_wager;
        break;
        case 6:
        var progress_wager = levelwager - 3200000000;
          var progress_per = (progress_wager/3200000000) * 100;
          remain_to_level = 3200000000 - progress_wager;
        break;
        case 7:
        var progress_wager = levelwager - 6400000000;
          var progress_per = (progress_wager/6400000000) * 100;
          remain_to_level = 6400000000 - progress_wager;
        break;
        case 8:
        var progress_wager = levelwager - 12800000000;
          var progress_per = (progress_wager/12800000000) * 100;
          remain_to_level = 12800000000 - progress_wager;
        break;
        case 9:
        var progress_wager = levelwager - 25600000000;
          var progress_per = (progress_wager/25600000000) * 100;
          remain_to_level = 25600000000 - progress_wager;
        break;
        case 10:
        var progress_wager = levelwager - 51200000000;
          var progress_per = (progress_wager/51200000000) * 100;
          remain_to_level = 51200000000 - progress_wager;
        break;
        case 11:
        var progress_wager = levelwager - 102400000000;
          var progress_per = (progress_wager/102400000000) * 100;
          remain_to_level = 102400000000 - progress_wager;
        break;
        case 12:
        var progress_wager = levelwager - 204800000000;
          var progress_per = (progress_wager/204800000000) * 100;
          remain_to_level = 204800000000 - progress_wager;
        break;
        case 13:
        var progress_wager = levelwager - 409600000000;
        var progress_per = (progress_wager/409600000000) * 100;
        remain_to_level = 409600000000 - progress_wager;
        break;
        case 14:
        var progress_wager = levelwager - 819200000000;
          var progress_per = (progress_wager/819200000000) * 100;
          remain_to_level = 819200000000 - progress_wager;
        break;
        case 15:
        var progress_wager = levelwager;
          var progress_per = 100;
          remain_to_level = 0;
        break;
      }
      var level_progress = el.div({className:'progress'},
        el.div({className:'progress-bar  progress-bar-success', role:"progressbar", 'aria-valuenow':progress_per, 'aria-valuemin':"0", 'aria-valuemax':"100", style:{width: progress_per +'%'}},progress_per.toFixed(3) + '%')
      )

    }else{
      var level_progress = el.div({className:'progress'},
        el.div({className:'progress-bar  progress-bar-success', role:"progressbar", 'aria-valuenow':"0", 'aria-valuemin':"0", 'aria-valuemax':"100", style:{width: '0%'}})
      )
    }
    return el.div(
          null,
          el.div(
            null,
            el.span(
              {className: 'h6', style: { fontWeight: 'bold',marginTop: '-25px' }},
              'Stats For: ',// + worldStore.state.user.uname
              el.span(null,
                  el.a(
                  {
                    href: config.mp_browser_uri + '/users/' + worldStore.state.user.uname,
                    target: '_blank'
                  },
                  worldStore.state.user.uname
                )
              )
            )
          ),
          el.div(
            {className: 'col-xs-12 col-sm-10 col-md-9 well well-sm'},
            el.div({className: 'row'},
              el.div(
                {className: 'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Bets: ' + bet_count//worldStore.state.user.stats.btc.betted_count//worldStore.state.userbetcount//worldStore.state.user.betted_count
                )
              ),
              el.div(
                {className: 'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Wagered: ' + helpers.commafy(helpers.convSatstoCointype(bet_wager).toString()) + ' ' + worldStore.state.coin_type
                )
              ),
              el.div(
                {className: 'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Profit: ' + helpers.commafy(helpers.convSatstoCointype(bet_profit).toString()) + ' ' + worldStore.state.coin_type
                )
              )
            ),
            el.div({className:'row'},
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Largest Win: ',
                  el.a(
                    {
                      href: config.mp_browser_uri + '/bets/' + worldStore.state.user.largestwin.id,
                      target: '_blank'
                    },
                    worldStore.state.user.largestwin.id
                  )
                )
              ),
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Profit: ' + helpers.commafy(helpers.convSatstoCointypeJP(worldStore.state.user.largestwin.amt).toString()) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)//worldStore.state.userbetcount//worldStore.state.user.betted_count
                )
              ),
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Game: ' + worldStore.state.user.largestwin.game
                )
              )
            ),
            el.div({className:'row'},
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Largest Loss: ',
                  el.a(
                    {
                      href: config.mp_browser_uri + '/bets/' + worldStore.state.user.largestloss.id,
                      target: '_blank'
                    },
                    worldStore.state.user.largestloss.id
                  )
                )
              ),
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Loss: ' + helpers.commafy(helpers.convSatstoCointypeJP(worldStore.state.user.largestloss.amt).toString()) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)//worldStore.state.userbetcount//worldStore.state.user.betted_count
                )
              ),
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  'Game: ' + worldStore.state.user.largestloss.game
                )
              )
            ),
            el.div({className:'row'},
              el.div({className:'col-xs-4'},
                el.span(
                  {style: { fontWeight: 'bold',marginTop: '-25px' }},
                  '24 Hour Wager: ' + helpers.commafy(helpers.convSatstoCointype(wager_24).toString()) + ' ' + worldStore.state.coin_type
                )
              )
            ),
            el.div({className:'row'},
              el.div({className:'col-xs-12 col-sm-6 col-md-4'},
              el.h6(null, 'Progress to Next Level: '),
                level_progress
              ),
              el.div({className:'col-xs-12 col-sm-4 col-md-3'},
                el.h6(null,'Your Wager Total: '),
                el.span(null, (levelwager * 0.00000001).toFixed(8) + ' BTC')
              ),
              el.div({className:'col-xs-12 col-sm-4 col-md-3'},
                el.h6(null,'Amount to Next Level: '),
                el.span(null, (remain_to_level * 0.00000001).toFixed(8) + ' BTC')
              ),
              el.div({className:'col-xs-12 col-sm-2'},
                el.h6(null,'Your Level: '),
                el.span({className:'glyphicon glyphicon-star', style:{color:'gold'}}),
                el.span({className:'text-bold'}, level)
              )
            ),
            el.div(null,
              el.div({className:'col-xs-12'},
                'RESET ALL GAMES ',
                el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('ALL')})
              ),
              el.div(
                {className:'well well-sm col-xs-12'},
                el.div({className:'row'},
                  el.div({className:'col-xs-4 col-sm-2'},'Dice Bets: ' + worldStore.state.dicestats.bets.toString()),
                  el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.dicestats.wins.toString()),
                  el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.dicestats.loss.toString()),
                  el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.dicestats.wager) + worldStore.state.coin_type),
                  el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.dicestats.profit) + worldStore.state.coin_type),
                  el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('DICE')}))
                  )  //(worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
              ),
              el.div(
                {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                el.div({className:'row'},
                  el.div({className:'col-xs-4 col-sm-2'},'Plinko Bets: ' + worldStore.state.plinkostats.bets.toString()),
                  el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.plinkostats.wins.toString()),
                  el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.plinkostats.loss.toString()),
                  el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.plinkostats.wager) + worldStore.state.coin_type),
                  el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.plinkostats.profit) + worldStore.state.coin_type),
                  el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('PLINKO')}))
                  )
              ),
              el.div(
                {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                el.div({className:'row'},
                  el.div({className:'col-xs-4 col-sm-2'},'Roulette Bets: ' + worldStore.state.Roulettestats.bets.toString()),
                  el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.Roulettestats.wins.toString()),
                  el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.Roulettestats.loss.toString()),
                  el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.Roulettestats.wager) + worldStore.state.coin_type),
                  el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.Roulettestats.profit) + worldStore.state.coin_type),
                  el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('ROULETTE')}))
                  )
                ),
                el.div(
                  {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                  el.div({className:'row'},
                    el.div({className:'col-xs-4 col-sm-2'},'BitSweep Bets: ' + worldStore.state.bitsweepstats.bets.toString()),
                    el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.bitsweepstats.wins.toString()),
                    el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.bitsweepstats.loss.toString()),
                    el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.bitsweepstats.wager) + worldStore.state.coin_type),
                    el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.bitsweepstats.profit) + worldStore.state.coin_type),
                    el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('BITSWEEP')}))
                    )
                  ),
                  el.div(
                    {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                    el.div({className:'row'},
                      el.div({className:'col-xs-4 col-sm-2'},'Slots Bets: ' + worldStore.state.slotsstats.bets.toString()),
                      el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.slotsstats.wins.toString()),
                      el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.slotsstats.loss.toString()),
                      el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.slotsstats.wager) + worldStore.state.coin_type),
                      el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.slotsstats.profit) + worldStore.state.coin_type),
                      el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('SLOTS')}))
                      )
                  ),
                  el.div(
                    {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                    el.div({className:'row'},
                      el.div({className:'col-xs-4 col-sm-2'},'BitClimber Bets: ' + worldStore.state.BitClimberstats.bets.toString()),
                      el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.BitClimberstats.wins.toString()),
                      el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.BitClimberstats.loss.toString()),
                      el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.BitClimberstats.wager) + worldStore.state.coin_type),
                      el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.BitClimberstats.profit) + worldStore.state.coin_type),
                      el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('BITCLIMBER')}))
                      )
                  ),
                  el.div(
                    {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                    el.div({className:'row'},
                      el.div({className:'col-xs-4 col-sm-2'},'Sliders Bets: ' + worldStore.state.Slidersstats.bets.toString()),
                      el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.Slidersstats.wins.toString()),
                      el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.Slidersstats.loss.toString()),
                      el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.Slidersstats.wager) + worldStore.state.coin_type),
                      el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.Slidersstats.profit) + worldStore.state.coin_type),
                      el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('SLIDERS')}))
                      )
                  ),
                  el.div(
                    {className:'well well-sm col-xs-12', style:{marginTop:'-15px'}},
                    el.div({className:'row'},
                      el.div({className:'col-xs-4 col-sm-2'},'Wonder Wheel Bets: ' + worldStore.state.WonderWstats.bets.toString()),
                      el.div({className:'col-xs-4 col-sm-1'},'Wins: ' + worldStore.state.WonderWstats.wins.toString()),
                      el.div({className:'col-xs-4 col-sm-2'},'Losses: ' + worldStore.state.WonderWstats.loss.toString()),
                      el.div({className:'col-xs-6 col-sm-3'},'Wagered: ' + helpers.convNumtoStr(worldStore.state.WonderWstats.wager) + worldStore.state.coin_type),
                      el.div({className:'col-xs-6 col-sm-3'},'Profit: ' + helpers.convNumtoStr(worldStore.state.WonderWstats.profit) + worldStore.state.coin_type),
                      el.div({className:'col-xs-1'}, el.span({className:'glyphicon glyphicon-refresh', onClick: this._resetstat('WONDERW')}))
                      )
                  )
            )

          )
    );

  }
});

////////////////////////////////////////////////////////////////////////////////////
var StatsTabContent = React.createClass({
  displayName: 'StatsTabContent',
  _onRefreshStat: function() {
    Dispatcher.sendAction('UPDATE_BANKROLL');
    //Dispatcher.sendAction('UPDATE_USERSTATS');
    Dispatcher.sendAction('START_REFRESHING_USER');
    Dispatcher.sendAction('LOAD_CHART_DATA');
  },
  render: function() {
    return el.div(
      null,
      el.div(
      {className: 'panel panel-default'},
      el.div(
        {className:'panel-heading'},
        el.span(
          {className: 'h6'},
          'Statistics:'
        ),
        el.button(
          {
            className: 'btn btn-link',
            title: 'Refresh Stats',
            onClick: this._onRefreshStat
          },
          el.span(
            {className: 'glyphicon glyphicon-refresh'}
          )
        )
      ),
      el.div(
        {className: 'panel-body'},
        React.createElement(MoneypotStats, null),
        /////////////////////////////////////
        el.div(
          {className: 'row'},
          el.div(
            {className: 'col-xs-12',style: {marginTop: '-15px'}},
            el.hr(null)
          )
        ),
        /////////////////////////////////////
        React.createElement(UserStatsDisplay, null),
        /////////////////////////////////////////////////////
        el.div(
          {className: 'row'},
          el.div(
            {className: 'col-xs-12',style: {marginTop: '-15px'}},
            el.hr(null)
          )
        ),
        el.div( // FOR graph
          null, //{className: 'col-xs-12'},
          React.createElement(HistoryChart, null)
        )
        /////////////////////////////////////////////////////
      )
    )
  );
  }
});
//////////////////////////////////////////////////////
var provably_fair_box = React.createClass({
displayName: 'provably_fair_box',
_onStoreChange: function() {
  this.forceUpdate();
},
componentDidMount: function() {
  betStore.on('lastfair_change', this._onStoreChange);
},
componentWillUnmount: function() {
  betStore.off('lastfair_change', this._onStoreChange);
},

_onEnterHash: function(e) {
  var str = e.target.value;
  Dispatcher.sendAction('UPDATE_LAST_HASH', str);
},
_onEnterSalt: function(e) {
  var str = e.target.value;
  Dispatcher.sendAction('UPDATE_LAST_SALT', str);
},
_onEnterSecret: function(e) {
  var str = e.target.value;
  Dispatcher.sendAction('UPDATE_LAST_SECRET', str);
},
_onEnterSeed: function(e) {
  var str = e.target.value;
  Dispatcher.sendAction('UPDATE_LAST_SEED', str);
},

_CalcRawOut: function() {
  Dispatcher.sendAction('CALC_RAW_OUTCOME');
},
render: function() {
  var fair;
  if (betStore.state.lastHash){
    if (worldStore.state.coin_type =='DOGE'){
      fair = CryptoJS.SHA256(betStore.state.lastSecret + '|' + betStore.state.lastSalt).toString() === betStore.state.lastHash
    }else{
      fair = CryptoJS.SHA256(betStore.state.lastSecret + betStore.state.lastSalt).toString() === betStore.state.lastHash
    }
  }

  return el.div(
    null,
    el.div({className:'h6'},'Provably Fair Calculator:'),
    el.div({className:'panel panel-default col-xs-12'},
      el.div({className: 'lead'},'Next Bet Hash: ',
        el.span({className: 'text', style:{fontWeight:'bold'}},betStore.state.nextHash ? betStore.state.nextHash : ' ')
        //betStore.state.lastid = id;
      ),
      el.div({className: 'lead',style:{ marginTop: '-10px'}},'Last Bet Hash: ',
        el.span(null, el.code(null,'SHA256(SECRET+SALT)'))
      ),
      el.div({className: 'form-group col-xs-12',style:{ marginTop: '-10px'}},
            el.span({className: 'input-group input-group-sm col-xs-12 col-md-8 col-lg-6'},
              el.input(
                {
                  value: betStore.state.lastHash,
                  type: 'text',
                  className: 'form-control input-sm',
                  style:{ fontWeight: 'bold'},
                  onChange: this._onEnterHash,
              //    disabled: !!worldStore.state.isLoading,
                  placeholder: 'hash'
                }
              ),
              betStore.state.lastHash ? el.span({className: 'input-group-addon'},
                  fair ?
                  el.span({className: 'glyphicon glyphicon-ok',style: {color:'green'}}) : el.span({className: 'glyphicon glyphicon-remove',style: {color:'red'}})
                ) : ' '
            )
      ),
      el.div({className: 'lead',style:{ marginTop: '-10px'}},'Last Bet Salt:'),
      el.div({className: 'form-group col-xs-12',style:{ marginTop: '-10px'}},
            el.span({className: 'input-group input-group-sm col-xs-12 col-md-8 col-lg-6'},
              el.input(
                {
                  value: betStore.state.lastSalt,
                  type: 'text',
                  className: 'form-control input-sm',
                  style:{ fontWeight: 'bold'},
                  onChange: this._onEnterSalt,
              //    disabled: !!worldStore.state.isLoading,
                  placeholder: 'salt'
                }
              )
            )
      ),
      el.div({className: 'lead',style:{ marginTop: '-10px'}},'Last Bet Secret:'),
      el.div({className: 'form-group col-xs-12',style:{ marginTop: '-10px'}},
            el.span({className: 'input-group input-group-sm col-xs-12 col-md-8 col-lg-6'},
              el.input(
                {
                  value: betStore.state.lastSecret,
                  type: 'text',
                  className: 'form-control input-sm',
                  style:{ fontWeight: 'bold'},
                  onChange: this._onEnterSecret,
              //    disabled: !!worldStore.state.isLoading,
                  placeholder: 'secret'
                }
              )
            )
      ),
      el.div({className: 'lead',style:{ marginTop: '-10px'}},'Last Bet Client Seed:'),
      el.div({className: 'form-group col-xs-12',style:{ marginTop: '-10px'}},
            el.span({className: 'input-group input-group-sm col-xs-12 col-md-8 col-lg-6'},
              el.input(
                {
                  value: betStore.state.lastSeed,
                  type: 'text',
                  className: 'form-control input-sm',
                  style:{ fontWeight: 'bold'},
                  onChange: this._onEnterSeed,
              //    disabled: !!worldStore.state.isLoading,
                  placeholder: 'seed'
                }
              )
            )
      ),
      //final_outcome = (outcome + client_seed) % 4294967296
      el.div({className:'col-xs-12 col-md-8 col-lg-6'},
        el.button(
          { id: 'RT-CLEAR',
            type: 'button',
            className: 'btn btn-primary btn-md',
            style: { fontWeight: 'bold'},
            onClick: this._CalcRawOut
            //disabled: !!this.state.waitingForServer
           },
           'Calculate Raw Outcome'
        ),
        el.span(null,
          el.code(null,'(Secret + Client_Seed) % 2^32')
        )
      ),
      el.div({className: 'form-group col-xs-12'},
            el.span({className: 'input-group input-group-sm col-xs-12 col-md-8 col-lg-6'},
              el.input(
                {
                  value: betStore.state.raw_outcome,
                  type: 'text',
                  className: 'form-control input-sm',
                  style:{ fontWeight: 'bold'},
                  onChange: null,//this._onFilterUserChange,
              //    disabled: !!worldStore.state.isLoading,
                  placeholder: 'Raw Outcome'
                }
              )
            )
      )

    )
  );
}

});



var HelpTabContent = React.createClass({
  displayName: 'HelpTabContent',
   render: function() {

     return el.div(
       null,
       el.div(
         {className:'panel panel-danger'},
         el.div(
           {className:'panel-body'},
           el.div(
           {className: 'h4 text-center'},
           'Welcome To Bit-Exo'
           ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'Legal Disclaimer:'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'Please ensure that gambling is legal in your jurisdiction, Bit-Exo is an Online Gaming site and may not be legal in all places. It is your responsibility to know your local laws.  By using this site you agree that it is legal to do so where you are.  Site bankrolls, user deposits/balances and bets are handled by the gaming company MoneyPot')
                )//end well
              ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'How do I play?'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'After you have funded your Bit-Exo app you can then change the wager amount and the multiplier to an amount of your choosing.  By pressing Bet High or Bet Low you initiate the betting sequence.  The result is shown below under the All Bets tab and under the My Bets Tab.  If you wish you can change the seed to a custom number from 0-4294967295 or enable it to make a random seed for each bet.')
                )//end well
              ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'How do I fund my account?'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'In order to play you will need a balance.  You can use the free faucet to try out some bets for free or you can fund your MoneyPot account.  You will need to sign-up for a free account with MoneyPot in order to play here.  After you have created an account you add the Bit-Exo casino app to you MoneyPot account.  There are two methods available to add funds at this point.  The more direct way is to deposit directly to your Bit-Exo account by clicking the deposit button at the top of the page and using the deposit address located there. The second is under your MoneyPot account page, you can find the deposit button to generate a new BTC deposit address.    Once your account is funded you can click on deposit from inside the app to bring coins over to play with.  Deposits are available to you after 1 confirmation.')
                )//end well
              ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'Can I play for free?'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'Currently there is no faucet available, check back soon.')
                )//end well
              ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'What if I can not stop?'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'If you have a problem gambling there are various services available.  Please see ',
              el.span(null,
                  el.a(
                      {
                        href: 'http://www.gamblinghelp.org',
                        target: '_blank'
                      },'gamblinghelp.org'),
              el.span(null, ', ',
              el.span(null,
                  el.a(
                      {
                        href: 'http://www.ncpgambling.org',
                        target: '_blank'
                      },'ncpgambling.org'),
               el.span(null, ' and ',
               el.span(null,
                   el.a(
                       {
                         href: 'http://www.helpguide.org',
                         target: '_blank'
                       },'helpguide.org'),
               el.span(null, ' or search google for many more.  Remember you can lose when playing and only risk what you are willing to lose. Bit-Exo is not responsible for mistaken bets or funds lost with MoneyPot.'
             )))))))
                )//end well
              ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'Tipping users:'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'If you wish to help someone out you can tip other users within Bit-Exo without having to withdraw your coins to Moneypot first.  Simply type /tip [username] [amount] [coin] (ex. /tip J_ROC 1000 BITS or /tip J_ROC 0.001 BTC) and the coins will be transferred instantly.  If the receiver wishes to see his balance update immediately they will have to click on the refresh balance button on top otherwise it will update automatically after 10 seconds. Optionally you may add "private" to the end of the tip and the tip will be sent silently in chat.  Please use caution when tipping users and do not loan coins to those you do not trust.'),
              el.p(null,'If you wish to help everyone out, you can Make it Rain!  Just type /rain amount type(eg. /rain 1000 bits) and the bot will tip all qualified users in chat with a share of the amount you sent.'),
              el.p(null,'Another option would be to /tip chatbot. Once this bot has received 1000 or more bits it will start a round of Chatlotto, picking active users at random for quizes with prizes'),
              el.p(null,'Rains are intended to reward active users on the site. In order to qualify for rain, you must be level 1 or higher, wager at least 5000 BITS / 0.005 BTC during the last 24 hours and must be active in chat during the last hour.'),
              el.p(null,'User Levels are advanced by wagering.  The different levels are: '),
              el.p({style:{marginTop:'-10px'}},'Level 0: 0 - 1 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 1: 1 - 2 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 2: 2 - 4 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 3: 4 - 8 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 4: 8 - 16 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 5: 16 - 32 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 6: 32 - 64 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 7: 64 - 128  BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 8: 128 - 256 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 9: 256 - 512 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 10: 512 - 1024 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 11: 1024 - 2048 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 12: 2048 - 4096 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 13: 4096 - 8192 BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 14: 8192 - 16384BTC'),
              el.p({style:{marginTop:'-10px'}},'Level 15: Over 16384 BTC'),
              el.p(null,'Levels are shown in chat with stars. An empty star is equal to 1 level and a full star is equal to 2 levels. So for example a user of level 3 would show 1 full and 1 empty star. Users level 11 and over are shown with full red stars.'),
              el.p(null,'What are levels used for?'),
              el.p(null,'For catching rain you must be level 1 or higher'),
              el.p(null,'In order to post links on the site you must be level 2 or higher'),
              el.p(null,'Chatlotto will only pick active users of level 2 or higher')
              )//end well
            ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'Provable Fairness:'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'Bets made are all provably fair.  How does this work? Before each bet is made a hash is generated by MoneyPot and is sent to the site, this is then combined with the bet+seed and sent back to the MoneyPot bet API and the result is then returned, win or lose to the casino.  A script on the casino verifies each bet to ensure that all bets are provably fair.'),
              React.createElement(provably_fair_box,null)
              ) //end well
            ),
            el.div(
              {className:'col-xs-12'},
              el.span({className: 'h6 text-left'},'Contact Info:'),
              el.div({className:'well well-sm col-xs-12'},
              el.p(null, 'If you need to get a hold of the site admins you can email us at:'),
              el.p(null, 'support@bit-exo.com or admin@bit-exo.com'),
              el.p(null, 'You can also leave us a message on our ',
                el.span(null,
                  el.a(
                      {
                        href: 'https://bitcointalk.org/index.php?topic=1359320.0',
                        target: '_blank'
                      },'thread'),
                      ' or joins us on ',
                      el.a(
                        {
                          href: 'https://discord.gg/011aeZCV0elmAnSOT',
                          target: '_blank'
                        },
                        'Discord'
                      )
                    ))
              ) //end well
            )
         )//end panel-body
       )
     );
   }
});

var JackpotTabContent = React.createClass({
  displayName: 'JackpotTabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('app_info_update', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('app_info_update', this._onStoreChange);
  },
  getInitialState: function() {
    return { currency: 'DOGE' };
  },
 /* _onClickBTC: function(){
    this.setState({ currency: 'BTC' });
    this.forceUpdate();
  },
  _onClickLTC: function(){
     this.setState({ currency: 'LTC' });
     this.forceUpdate();
   },
   _onClickDASH: function(){
     this.setState({ currency: 'DASH' });
     this.forceUpdate();
   },
   _onClickADK: function(){
     this.setState({ currency: 'ADK' });
     this.forceUpdate();
   },
   _onClickGRLC: function(){
    this.setState({ currency: 'GRLC' });
    this.forceUpdate();
  },
  _onClickFLASH: function(){
    this.setState({ currency: 'FLASH' });
    this.forceUpdate();
  },*/
    _onClickDOGE: function(){
     this.setState({ currency: 'DOGE' });
     this.forceUpdate();
   },
    _onClickBXO: function(){
     this.setState({ currency: 'BXO' });
     this.forceUpdate();
   },
   _onClickCLAM: function(){
    this.setState({ currency: 'CLAM' });
    this.forceUpdate();
  },
   render: function() {
     var jackpotsize1;
     var jackpotsize2;
     var jackpotdoge = worldStore.state.jackpots.jp_doge_high
     var jackpotdoge2 = worldStore.state.jackpots.jp_doge_low;
     var jackpotbxo = worldStore.state.jackpots.jp_bxo_high
     var jackpotbxo2 = worldStore.state.jackpots.jp_bxo_low;
     var jackpotclam = worldStore.state.jackpots.jp_clam_high
     var jackpotclam2 = worldStore.state.jackpots.jp_clam_low;
     var innerNode;


    if (this.state.currency == 'DOGE'){
        innerNode = el.div({className:'well well-sm col-xs-12'},
              el.div({className: 'text-center'},
              el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners DOGE Jackpot 1'),
                el.table(
                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                  el.thead(null,
                    el.tr(null,
                      el.th(null, 'Date'),
                      el.th(null, 'User'),
                      el.th(null, 'Game'),
                      el.th(null, 'Prize'),
                      el.th(null, 'ID')
                    )
                  ),
                  el.tbody(null,
                    worldStore.state.jackpotlist.highwinsDOGE.toArray().map(function(list) {
                     // console.log('List: ', list);
                      return el.tr({ key: list.id},
                         // Time
                         el.td(null,
                           list.created_at.substring(0,10)
                         ),
                         // User
                         el.td(null,
                           el.a({
                               href: config.mp_browser_uri + '/users/' + list.uname,
                               target: '_blank'
                             },
                             list.uname
                           )
                         ),
                         // Game
                         el.td(null,
                           list.kind
                         ),
                         // Prize
                         el.td(null,
                           (list.jprofit).toFixed(2) + ' DOGE'
                         ),
                        // bet id
                        el.td(null,
                          el.a({
                              href: window.location.href + 'bets/' + list.id,
                              target: '_blank'
                            },
                            list.id
                          )
                        )
                      );
                    }).reverse()
                  )
                )

              ),
              el.div({className: 'text-center'},
              el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners DOGE Jackpot 2'),
                el.table(
                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                  el.thead(null,
                    el.tr(null,
                      el.th(null, 'Date'),
                      el.th(null, 'User'),
                      el.th(null, 'Game'),
                      el.th(null, 'Prize'),
                      el.th(null, 'ID')
                    )
                  ),
                  el.tbody(null,
                    worldStore.state.jackpotlist.lowwinsDOGE.toArray().map(function(list) {
                      return el.tr({ key: list.id},
                         // Time
                         el.td(null,
                           list.created_at.substring(0,10)
                         ),
                         // User
                         el.td(null,
                           el.a({
                               href: config.mp_browser_uri + '/users/' + list.uname,
                               target: '_blank'
                             },
                             list.uname
                           )
                         ),
                         // Game
                         el.td(null,
                           list.kind
                         ),
                         // Prize
                         el.td(null,
                           (list.jprofit).toFixed(2) + ' DOGE'
                         ),
                        // bet id
                        el.td(null,
                          el.a({
                              href: window.location.href + 'bets/' + list.id,
                              target: '_blank'
                            },
                            list.id
                          )
                        )
                      );
                    }).reverse()
                  )
                )

              )

          )
    }else if (this.state.currency == 'BXO'){
      innerNode = el.div({className:'well well-sm col-xs-12'},
            el.div({className: 'text-center'},
            el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners BXO Jackpot 1'),
              el.table(
                {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                el.thead(null,
                  el.tr(null,
                    el.th(null, 'Date'),
                    el.th(null, 'User'),
                    el.th(null, 'Game'),
                    el.th(null, 'Prize'),
                    el.th(null, 'ID')
                  )
                ),
                el.tbody(null,
                  worldStore.state.jackpotlist.highwinsBXO.toArray().map(function(list) {
                    return el.tr({ key: list.id},
                       // Time
                       el.td(null,
                         list.created_at.substring(0,10)
                       ),
                       // User
                       el.td(null,
                         el.a({
                             href: config.mp_browser_uri + '/users/' + list.uname,
                             target: '_blank'
                           },
                           list.uname
                         )
                       ),
                       // Game
                       el.td(null,
                         list.kind
                       ),
                       // Prize
                       el.td(null,
                         (list.jprofit).toFixed(2) + ' BXO'
                       ),
                      // bet id
                      el.td(null,
                        el.a({
                            href: window.location.href + 'bets/' + list.id,
                            target: '_blank'
                          },
                          list.id
                        )
                      )
                    );
                  }).reverse()
                )
              )

            ),
            el.div({className: 'text-center'},
            el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners BXO Jackpot 2'),
              el.table(
                {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                el.thead(null,
                  el.tr(null,
                    el.th(null, 'Date'),
                    el.th(null, 'User'),
                    el.th(null, 'Game'),
                    el.th(null, 'Prize'),
                    el.th(null, 'ID')
                  )
                ),
                el.tbody(null,
                  worldStore.state.jackpotlist.lowwinsBXO.toArray().map(function(list) {
                    return el.tr({ key: list.id},
                       // Time
                       el.td(null,
                         list.created_at.substring(0,10)
                       ),
                       // User
                       el.td(null,
                         el.a({
                             href: config.mp_browser_uri + '/users/' + list.uname,
                             target: '_blank'
                           },
                           list.uname
                         )
                       ),
                       // Game
                       el.td(null,
                         list.kind
                       ),
                       // Prize
                       el.td(null,
                         (list.jprofit).toFixed(2) + ' BXO'
                       ),
                      // bet id
                      el.td(null,
                        el.a({
                            href: window.location.href + 'bets/' + list.id,
                            target: '_blank'
                          },
                          list.id
                        )
                      )
                    );
                  }).reverse()
                )
              )

            )

        )
  }else if (this.state.currency == 'CLAM'){
    innerNode = el.div({className:'well well-sm col-xs-12'},
          el.div({className: 'text-center'},
          el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners CLAM Jackpot 1'),
            el.table(
              {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
              el.thead(null,
                el.tr(null,
                  el.th(null, 'Date'),
                  el.th(null, 'User'),
                  el.th(null, 'Game'),
                  el.th(null, 'Prize'),
                  el.th(null, 'ID')
                )
              ),
              el.tbody(null,
                worldStore.state.jackpotlist.highwinsCLAM.toArray().map(function(list) {
                  return el.tr({ key: list.id},
                     // Time
                     el.td(null,
                       list.created_at.substring(0,10)
                     ),
                     // User
                     el.td(null,
                       el.a({
                           href: config.mp_browser_uri + '/users/' + list.uname,
                           target: '_blank'
                         },
                         list.uname
                       )
                     ),
                     // Game
                     el.td(null,
                       list.kind
                     ),
                     // Prize
                     el.td(null,
                       (list.jprofit).toFixed(8) + ' CLAM'
                     ),
                    // bet id
                    el.td(null,
                      el.a({
                          href: window.location.href + 'bets/' + list.id,
                          target: '_blank'
                        },
                        list.id
                      )
                    )
                  );
                }).reverse()
              )
            )

          ),
          el.div({className: 'text-center'},
          el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Previous Winners CLAM Jackpot 2'),
            el.table(
              {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
              el.thead(null,
                el.tr(null,
                  el.th(null, 'Date'),
                  el.th(null, 'User'),
                  el.th(null, 'Game'),
                  el.th(null, 'Prize'),
                  el.th(null, 'ID')
                )
              ),
              el.tbody(null,
                worldStore.state.jackpotlist.lowwinsCLAM.toArray().map(function(list) {
                  return el.tr({ key: list.id},
                     // Time
                     el.td(null,
                       list.created_at.substring(0,10)
                     ),
                     // User
                     el.td(null,
                       el.a({
                           href: config.mp_browser_uri + '/users/' + list.uname,
                           target: '_blank'
                         },
                         list.uname
                       )
                     ),
                     // Game
                     el.td(null,
                       list.kind
                     ),
                     // Prize
                     el.td(null,
                       (list.jprofit).toFixed(2) + ' CLAM'
                     ),
                    // bet id
                    el.td(null,
                      el.a({
                          href: window.location.href + 'bets/' + list.id,
                          target: '_blank'
                        },
                        list.id
                      )
                    )
                  );
                }).reverse()
              )
            )

          )

      )
}

     return el.div(
       {id:'jp_tab'},
       el.div({className:'panel panel-default'},
        el.div({className:'panel-body'},
          el.div({className:'well well-sm col-xs-12'},
            el.div({className: 'text-center h6'},'Doge Jackpot 1: ',
              el.span(null,
                jackpotdoge.toFixed(2) + ' DOGE'
              )
            ),
            el.div({className: 'text-center h6'},'Doge Jackpot 2: ',
              el.span(null,
                jackpotdoge2.toFixed(2) + ' DOGE'
              )
            ),
            el.div({className: 'text-center h6'},'BXO Jackpot 1: ',
            el.span(null,
              jackpotbxo.toFixed(2) + ' BXO'
            )
            ),
            el.div({className: 'text-center h6'},'BXO Jackpot 2: ',
              el.span(null,
                jackpotbxo2.toFixed(2) + ' BXO'
              )
            ),
            el.div({className: 'text-center h6'},'CLAM Jackpot 1: ',
            el.span(null,
              jackpotclam.toFixed(8) + ' CLAM'
            )
            ),
            el.div({className: 'text-center h6'},'CLAM Jackpot 2: ',
              el.span(null,
                jackpotclam2.toFixed(8) + ' CLAM'
              )
            )
          ),
          el.div({className:'well well-sm col-xs-12 col-sm-6'},
            el.table({className: 'table table-hover table-condensed text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
              el.thead(null,
                el.tr(null,
                      el.th(null, 'Jackpot'),
                      el.th(null, 'Min Wager'),
                      el.th(null, 'Best Chance'),
                      el.th(null, 'Raw_Outcome')
                )
              ),
              el.tbody(null,

                el.tr(null,
                  el.td(null, 'DOGE JP1'),
                  el.td(null, '1.00 DOGE'),
                  el.td(null, '1000.00+ DOGE'),
                  el.td(null, '>4294963000')
                ), 
                el.tr(null,
                  el.td(null, 'DOGE JP2'),
                  el.td(null, '1.00 DOGE'),
                  el.td(null, '100+ DOGE'),
                  el.td(null, '<4295')
                ),
                el.tr(null,
                  el.td(null, 'BXO JP1'),
                  el.td(null, '1.00 BXO'),
                  el.td(null, '1000.00+ BXO'),
                  el.td(null, '>4294963000')
                ),
                el.tr(null,
                  el.td(null, 'BXO JP2'),
                  el.td(null, '1.00 BXO'),
                  el.td(null, '100+ BXO'),
                  el.td(null, '<4295')
                ),
                el.tr(null,
                  el.td(null, 'CLAM JP1'),
                  el.td(null, '0.01 CLAM'),
                  el.td(null, '10.00+ CLAM'),
                  el.td(null, '>4294963000')
                ),
                el.tr(null,
                  el.td(null, 'CLAM JP2'),
                  el.td(null, '0.01 CLAM'),
                  el.td(null, '1.00+ CLAM'),
                  el.td(null, '<4295')
                )
              )
            )
          ),
          el.div(
            {className:'col-xs-12', style: {marginTop: '10px'}},
            el.ul(
              {className: 'nav nav-tabs'},
              el.li(
                {className: this.state.currency == 'DOGE' ? 'bg-danger' : ''},
                el.a(
                  {
                    href: 'javascript:void(0)',
                    onClick: this._onClickDOGE
                  },
                  'DOGE'
                )
              ),
              el.li(
                {className: this.state.currency == 'BXO' ? 'bg-danger' : ''},
                el.a(
                  {
                    href: 'javascript:void(0)',
                    onClick: this._onClickBXO
                  },
                  'BXO'
                )
              ),
              el.li(
                {className: this.state.currency == 'CLAM' ? 'bg-danger' : ''},
                el.a(
                  {
                    href: 'javascript:void(0)',
                    onClick: this._onClickCLAM
                  },
                  'CLAM'
                )
              )
            )
          ),
           innerNode,
          el.div({className:'well well-sm col-xs-12'},
            el.div({className: 'text-center'},
              el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Jackpot Rules'),
              el.p({className:'text-left'},
                'The Jackpots are available to any user betting on our casino and can be won on any game so you can continue to play your favorite game. The Jackpot amounts are progressive based on the sites wager.'
                ),// end P
                el.p({className:'text-left'},
                  'In order to qualify for Jackpot 1 your bets wager must be at least ',
                  el.span(null,
                     '1.00 DOGE',
                      el.span(null,
                        '.  The winner is determined by the Raw_Outcome of the wager.  A winning bet is one that the Raw_Outcome is greater than 4294963000 for bets ',
                        el.span(null,
                          '1000.00 DOGE',
                          el.span(null,
                            ' and above.  This works out to a chance of 1 in 1 Million Bets.  Bets less than ',
                            el.span(null,
                             '1000.00 DOGE',
                              el.span(null,
                                ' and above ',
                                el.span(null,
                                  '1.00 DOGE',
                                  el.span(null,
                                    ' can still win the jackpot but the lower your wager the more challenging it becomes with ',
                                    el.span(null,
                                      '10.00 DOGE',
                                      el.span(null,
                                        ' bets having 1% the chance a bet greater than or equal to ',
                                        el.span(null,
                                          '1000.00 DOGE',
                                          el.span(null,
                                              ' has. For example a bet of ',
                                              el.span(null,
                                                '10.00 DOGE',
                                                el.span(null,' would require a Raw_Outcome > 4294967252 in order to win.'
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                       )
                    )

                ),//end p
                el.p({className:'text-left'},
                  'In order to qualify for Jackpot 2 your bets wager must be at least ',
                  el.span(null,
                      '1.00 DOGE',
                      el.span(null,
                        '.  The winner is determined by the Raw_Outcome of the wager.  A winning bet is one that the Raw_Outcome is less than 4295 for bets ',
                        el.span(null,
                         '100.00 DOGE',
                          el.span(null,
                            ' and above.  This works out to a chance of 1 in 1 Million Bets.  Bets less than ',
                            el.span(null,
                              '100.00 DOGE',
                              el.span(null,
                                ' and above ',
                                el.span(null,
                                 '1.00 DOGE',
                                  el.span(null,
                                    ' can still win the jackpot but the lower your wager the more challenging it becomes with ',
                                    el.span(null,
                                      '1.00 DOGE',
                                      el.span(null,
                                        ' bets having 1% the chance a bet greater than or equal to ',
                                        el.span(null,
                                          '100.00 DOGE',
                                          el.span(null,
                                              ' has. For example a bet of ',
                                              el.span(null,
                                                '1.00 DOGE',
                                                el.span(null,' would require a Raw_Outcome < 42.9 in order to win.'
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                       )
                    )

                ),//end p
                el.p({className:'text-left'},
                  'To be fair to those who have wagered 90% of the Jackpot total will go to the winner and 10% will go to the highest wagered user for the day. The winner of each round will be announced in chat and the prizes will be manually transferred within 8 hours.'
                )
            )
          )
        )
       )
     );
   }
 });


 var BiggestTabContent = React.createClass({
   displayName: 'BiggestTabContent',
   _onStoreChange: function() {
     this.forceUpdate();
   },
   componentDidMount: function() {
     worldStore.on('biggest_info_update', this._onStoreChange);
   },
   componentWillUnmount: function() {
     worldStore.off('biggest_info_update', this._onStoreChange);
   },
    render: function() {
      var bigUser = '-';
      if (worldStore.state.user){
        bigUser = worldStore.state.user.uname;
      }
      return el.div(
        null,
        el.div({className:'panel panel-default'},
         el.div({className:'panel-body'},

           el.div({className:'well well-sm col-xs-12'},
             el.div({className: 'text-center'},
               el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Biggest Winning Bets'),
               el.span({className: 'text-center h6', style:{fontWeight:'bold'}}, ' (Last 24 Hours)'),
               el.table(
                 {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                 el.thead(
                   null,
                   el.tr(
                     null,
                     el.th(null, 'Time'),
                     el.th(null, 'User'),
                     el.th(null, 'Game'),
                     el.th(null, 'Wager'),
                     el.th(null, 'Profit'),
                     el.th(null, 'ID')
                   )
                 ),
                 el.tbody(
                   null,
                   worldStore.state.biggestwins.toArray().map(function(list) {
                     return el.tr(
                      { key: list.id},
                        // Time
                        el.td(
                          null,
                          helpers.formatDateToTime(list.created_at)//list.created_at.substring(0,10)
                        ),
                        // User
                        el.td(
                          null,
                          el.a(
                            {
                              href: config.mp_browser_uri + '/users/' + list.uname,
                              target: '_blank'
                            },
                            list.uname
                          )
                        ),
                        // Game
                        el.td(
                          null,
                          list.kind
                        ),
                        // Wager
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.wager) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                          //
                        ),
                        // Profit
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.profit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                       // bet id
                       el.td(
                         null,
                         el.a(
                           {
                             href: config.mp_browser_uri + '/bets/' + list.id,
                             target: '_blank'
                           },
                           list.id
                         )
                       )
                     );
                   }).reverse()
                 )
               )

             )
           ),
           el.div({className:'well well-sm col-xs-12'},
             el.div({className: 'text-center'},
               el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Biggest Losing Bets'),
               el.span({className: 'text-center h6', style:{fontWeight:'bold'}}, ' (Last 24 Hours)'),
               el.table(
                 {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                 el.thead(
                   null,
                   el.tr(
                     null,
                     el.th(null, 'Time'),
                     el.th(null, 'User'),
                     el.th(null, 'Game'),
                     el.th(null, 'Wager'),
                     el.th(null, 'Loss'),
                     el.th(null, 'ID')
                   )
                 ),
                 el.tbody(
                   null,
                   worldStore.state.biggestlosses.toArray().map(function(list) {
                     return el.tr(
                      { key: list.id},
                        // Time
                        el.td(
                          null,
                          helpers.formatDateToTime(list.created_at)//list.created_at.substring(0,10)
                        ),
                        // User
                        el.td(
                          null,
                          el.a(
                            {
                              href: config.mp_browser_uri + '/users/' + list.uname,
                              target: '_blank'
                            },
                            list.uname
                          )
                        ),
                        // Game
                        el.td(
                          null,
                          list.kind
                        ),
                        // Profit
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.wager) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                        // Profit
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.profit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                       // bet id
                       el.td(
                         null,
                         el.a(
                           {
                             href: config.mp_browser_uri + '/bets/' + list.id,
                             target: '_blank'
                           },
                           list.id
                         )
                       )
                     );
                   }).reverse()
                 )
               )

             )
           ),
           el.div({className:'well well-sm col-xs-12'},
             el.div({className: 'text-center'},
               el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Biggest Wagered'),
               el.span({className: 'text-center h6', style:{fontWeight:'bold'}}, ' (Last 24 Hours)'),
               el.table(
                 {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                 el.thead(
                   null,
                   el.tr(
                     null,
                     el.th(null, 'User'),
                     el.th(null, 'Wagered'),
                     el.th(null, 'Profit')
                   )
                 ),
                 el.tbody(
                   null,
                   worldStore.state.biggestwagered.toArray().map(function(list) {
                     return el.tr(
                      { key: list.uname//,
                        //style: (list.uname == bigUser) ? {color:'gold'} :''
                        },
                        // User
                        el.td(
                          null,
                          el.a(
                            {
                              href: config.mp_browser_uri + '/users/' + list.uname,
                              target: '_blank'
                            },
                            list.uname
                          )
                        ),
                        // Wager
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.wager) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                        // Profit
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.profit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        )
                     );
                   }).reverse()
                 )
               )

             )
           ),
           el.div({className:'well well-sm col-xs-12'},
             el.div({className: 'text-center'},
               el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Biggest Jackpot Wins'),
               el.table(
                 {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                 el.thead(
                   null,
                   el.tr(
                     null,
                     el.th(null, 'Date'),
                     el.th(null, 'User'),
                     el.th(null, 'Game'),
                     el.th(null, 'Prize'),
                     el.th(null, 'ID')
                   )
                 ),
                 el.tbody(
                   null,
                   worldStore.state.biggestjackpots.toArray().map(function(list) {
                     return el.tr(
                      { key: list.id},
                        // Time
                        el.td(
                          null,
                          list.created_at.substring(0,10)
                        ),
                        // User
                        el.td(
                          null,
                          el.a(
                            {
                              href: config.mp_browser_uri + '/users/' + list.uname,
                              target: '_blank'
                            },
                            list.uname
                          )
                        ),
                        // Game
                        el.td(
                          null,
                          list.kind
                        ),
                        // Prize
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.jprofit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                       // bet id
                       el.td(
                         null,
                         el.a(
                           {
                             href: config.mp_browser_uri + '/bets/' + list.id,
                             target: '_blank'
                           },
                           list.id
                         )
                       )
                     );
                   }).reverse()
                 )
               )

             )
           ),
           el.div({className:'well well-sm col-xs-12'},
             el.div({className: 'text-center'},
               el.span({className: 'text-center h5', style:{fontWeight:'bold'}}, 'Biggest Profits All Time'),
               el.table(
                 {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                 el.thead(
                   null,
                   el.tr(
                     null,
                     el.th(null, 'User'),
                     el.th(null, 'Wagered'),
                     el.th(null, 'Profit')
                   )
                 ),
                 el.tbody(
                   null,
                   worldStore.state.biggestprofit.toArray().map(function(list) {
                     return el.tr(
                      { key: list.uname},
                        // User
                        el.td(
                          null,
                          el.a(
                            {
                              href: config.mp_browser_uri + '/users/' + list.uname,
                              target: '_blank'
                            },
                            list.uname
                          )
                        ),
                        // Wager
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.wager) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        ),
                        // Profit
                        el.td(
                          null,
                          helpers.convNumtoStrBets(list.profit) + ' ' + (worldStore.state.coin_type == 'DOGE' ? 'BTC':worldStore.state.coin_type)
                        )
                     );
                   }).reverse()
                 )
               )

             )
           )
         )
        )
      );
    }
  });


var WeeklyWagerContent = React.createClass({
    displayName: 'WeeklyWagerContent',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    componentDidMount: function() {
      worldStore.on('change_weekly_wager', this._onStoreChange);
    },
    componentWillUnmount: function() {
      worldStore.off('change_weekly_wager', this._onStoreChange);
    },
    getInitialState: function() {
      return { game: 'BTC' };
    },
    _onClickPkr: function(){
      Dispatcher.sendAction('GET_WEEKLY_POKER');
      this.setState({ game: 'POKER' });
      this.forceUpdate();
    },
    _onClickMP: function(){
      this.setState({ game: 'BTC' });
      this.forceUpdate();
    },
    _onClickLTC: function(){
      this.setState({ game: 'LTC' });
      this.forceUpdate();
    },
    _onClickDASH: function(){
      this.setState({ game: 'DASH' });
      this.forceUpdate();
    },
    _onClickADK: function(){
      this.setState({ game: 'ADK' });
      this.forceUpdate();
    },
    _onClickGRLC: function(){
      this.setState({ game: 'GRLC' });
      this.forceUpdate();
    },
    _onClickFLASH: function(){
      this.setState({ game: 'FLASH' });
      this.forceUpdate();
    },
    _onClickETH: function(){
      this.setState({ game: 'ETH' });
      this.forceUpdate();
    },
    _onClickMBI: function(){
      this.setState({ game: 'MBI' });
      this.forceUpdate();
    },
    _onClickWAVES: function(){
      this.setState({ game: 'WAVES' });
      this.forceUpdate();
    },
    _onClickDoge: function(){
     // Dispatcher.sendAction('GET_WEEKLY_DOGE');
      this.setState({game:'DOGE'});
      this.forceUpdate();
    },
    _onClickBXO: function(){
     // Dispatcher.sendAction('GET_WEEKLY_BXO');
      this.setState({game:'BXO'});
      this.forceUpdate();
    },
    _onClickCLAM: function(){
      this.setState({ game: 'CLAM' });
      this.forceUpdate();
    },
     render: function() {

      var innerNode;

      if (this.state.game == 'POKER'){ //weeklydatapoker
        if (worldStore.state.weeklydatapoker[0] == undefined){
          innerNode = el.div({className:'panel-body'},
            'No weekly data yet'
          )
        }else{
          innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydatapoker.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.0025;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'Player'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.Player},
                                         // User
                                         el.td(
                                           null,
                                           player.Player
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           player.wager.toFixed(8) + ' BXO'
                                         ),
                                         el.td(
                                           null,
                                           (prizepool * multiplier).toFixed(8) + ' BXO'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
        }
      }else if (this.state.game == 'BTC'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydata.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           helpers.convNumtoStrBets(player.wager) + ' ' + (worldStore.state.coin_type == 'BITS' ? 'BITS':'BTC')
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           helpers.convNumtoStrBets(player.profit) + ' ' + (worldStore.state.coin_type == 'BITS' ? 'BITS':'BTC')
                                         ),
                                         el.td(
                                           null,
                                           helpers.convNumtoStrBets(prizepool * multiplier) + ' ' + (worldStore.state.coin_type == 'BITS' ? 'BITS':'BTC')
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'LTC'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataLTC.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                          null,
                                          (player.wager * 0.00000001).toFixed(8) + ' LTC'
                                        ),
                                        // Profit
                                        el.td(
                                          null,
                                          (player.profit* 0.00000001).toFixed(8) + ' LTC'
                                        ),
                                        el.td(
                                          null,
                                          ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' LTC'
                                        )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'DASH'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataDASH.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' DASH'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' DASH'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' DASH'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'ADK'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataADK.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' ADK'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' ADK'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' ADK'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'GRLC'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataGRLC.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' GRLC'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' GRLC'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' GRLC'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'FLASH'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataFLASH.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' FLASH'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' FLASH'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' FLASH'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'ETH'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataETH.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' ETH'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' ETH'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' ETH'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'MBI'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataMBI.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' MBI'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' MBI'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' MBI'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'WAVES'){
        innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataWAVES.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: config.mp_browser_uri + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           (player.wager * 0.00000001).toFixed(8) + ' WAVES'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           (player.profit* 0.00000001).toFixed(8) + ' WAVES'
                                         ),
                                         el.td(
                                           null,
                                           ((prizepool * multiplier) * 0.00000001).toFixed(8) + ' WAVES'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
      }else if (this.state.game == 'DOGE'){
        if (worldStore.state.weeklydatadoge == undefined){
          innerNode = el.div({className:'panel-body'},
            'No weekly data yet'
          )
        }else{
          innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydatadoge.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: "https://bit-exo.com" + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           player.wager.toFixed(8) + ' DOGE'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           player.profit.toFixed(8) + ' DOGE'
                                         ),
                                         el.td(
                                           null,
                                           (prizepool * multiplier).toFixed(8) + ' DOGE'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
        }

      }else if (this.state.game == 'BXO'){
        if (worldStore.state.weeklydataBXO == undefined){
          innerNode = el.div({className:'panel-body'},
            'No weekly data yet'
          )
        }else{
          innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataBXO.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: "https://bit-exo.com" + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           player.wager.toFixed(8) + ' BXO'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           player.profit.toFixed(8) + ' BXO'
                                         ),
                                         el.td(
                                           null,
                                           (prizepool * multiplier).toFixed(8) + ' BXO'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
        }

      }else{
        if (worldStore.state.weeklydataCLAM == undefined){
          innerNode = el.div({className:'panel-body'},
            'No weekly data yet'
          )
        }else{
          innerNode = el.div({className:'panel-body'},
                    //'worldStore.state.weeklydata',
                    worldStore.state.weeklydataCLAM.map(function(week){
                      var startdate = new Date(week.startdate);
                      var msofstart = startdate.getTime();
                      var enddate = (new Date(msofstart + 604800000)).toJSON();
                      var prizepool = week.totalwagered * 0.00075;
                      var place = 1;
                      return el.div({className:'well well-sm col-xs-12',
                                     key: week._id
                                    },
                                'Week Starting: ' + week.startdate.substring(0,10) + ' and Ending: ' + enddate.substring(0,10),
                                el.table(
                                  {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                                  el.thead(
                                    null,
                                    el.tr(
                                      null,
                                      el.th(null, 'User'),
                                      el.th(null, 'Wagered'),
                                      el.th(null, 'Profit'),
                                      el.th(null, 'Prize')
                                    )
                                  ),
                                  el.tbody(
                                    null,
                                    week.players.map(function(player) {
                                      switch(place){
                                        case 1:
                                          var multiplier = 0.5;
                                          break;
                                        case 2:
                                          var multiplier = 0.25;
                                          break;
                                        case 3:
                                          var multiplier = 0.1;
                                          break;
                                        case 11:
                                          var multiplier = 0;
                                          break;  
                                        default :
                                            var multiplier = 0.02;
                                          break;
                                      }
                                      place++;
                                      return el.tr(
                                       { key: player.uname},
                                         // User
                                         el.td(
                                           null,
                                           el.a(
                                             {
                                               href: "https://bit-exo.com" + '/users/' + player.uname,
                                               target: '_blank'
                                             },
                                             player.uname
                                           )
                                         ),
                                         // Wager
                                         el.td(
                                           null,
                                           player.wager.toFixed(8) + ' CLAM'
                                         ),
                                         // Profit
                                         el.td(
                                           null,
                                           player.profit.toFixed(8) + ' CLAM'
                                         ),
                                         el.td(
                                           null,
                                           (prizepool * multiplier).toFixed(8) + ' CLAM'
                                         )
                                      );
                                    })//.reverse()
                                  )
                                )
                             );
                    }).reverse()
                  )
        }

      }


       return el.div(
                null,
                el.div({className:'panel panel-default'},
                el.div(
                  {className:'col-xs-12', style: {marginTop: '10px'}},
                  el.ul(
                    {className: 'nav nav-tabs'},
                    el.li(
                      {className: this.state.game == 'BTC' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickMP
                        },
                        'BTC'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'LTC' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickLTC
                        },
                        'LTC'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'DASH' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickDASH
                        },
                        'DASH'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'ADK' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickADK
                        },
                        'ADK'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'GRLC' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickGRLC
                        },
                        'GRLC'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'FLASH' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickFLASH
                        },
                        'FLASH'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'ETH' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickETH
                        },
                        'ETH'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'MBI' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickMBI
                        },
                        'MBI'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'WAVES' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickWAVES
                        },
                        'WAVES'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'POKER' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickPkr
                        },
                        'POKER'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'DOGE' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickDoge
                        },
                        'DOGE'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'BXO' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickBXO
                        },
                        'BXO'
                      )
                    ),
                    el.li(
                      {className: this.state.game == 'CLAM' ? 'bg-danger' : ''},
                      el.a(
                        {
                          href: 'javascript:void(0)',
                          onClick: this._onClickCLAM
                        },
                        'CLAM'
                      )
                    )
                  )
                ),
                 innerNode 
                )
              );
            }
});


var Ref_Box = React.createClass({
    displayName: 'Ref_Box',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    componentDidMount: function() {
      worldStore.on('change', this._onStoreChange);
      worldStore.on('change_ref_data', this._onStoreChange);
    },
    componentWillUnmount: function() {
      worldStore.off('change', this._onStoreChange);
      worldStore.off('change_ref_data', this._onStoreChange);
    },
    _onChange: function(e) {
      var str = e.target.value;
      Dispatcher.sendAction('UPDATE_REF_WD', { str: str });
      //this._validateFilterWager(str);
    },
    _onClick: function(){
      if (worldStore.state.coin_type == 'BITS'){
        var currency = 'BTC';
      }else{
        var currency = worldStore.state.coin_type;
      }
      var params = {
        amt: helpers.convCoinTypetoSats(worldStore.state.refwd.num),
        currency: currency
      }
      Dispatcher.sendAction('REQ_REF_WD', params);
    },
    _onclick_copy: function(){
      //console.log('CLICK');
      var copyTextarea = document.querySelector('.js-reflink');
      var range = document.createRange();
      range.selectNode(copyTextarea);
      window.getSelection().addRange(range);
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
    },
     render: function() {
       var refprofit;// = worldStore.state.user.refprofit||0;
       var refpaid;// = worldStore.state.user.refpaid||0;
       var balance;// = refprofit - refpaid;
       var referrer;// = worldStore.state.user.ref||'--';

       var innerNode;
       var UserList = '';

       // TODO: Create error prop for each input
       var error = worldStore.state.refwd.error;

      // if (balance < 50000){
      //   error = 'BALANCE_TOO_LOW';
      // }
        var minwtd = '0.00050000 BTC';
       if (worldStore.state.user){
        switch(worldStore.state.coin_type){
          case 'BITS':
            if ((worldStore.state.user.refprofit != undefined)&&(worldStore.state.user.refprofit != null)){
              refprofit = (worldStore.state.user.refprofit/100).toFixed(2);
            }else{
              refprofit = 0.00;
            }
            if((worldStore.state.user.refpaid != undefined)&&(worldStore.state.user.refpaid != null)){
              refpaid = (worldStore.state.user.refpaid/100).toFixed(2);
            }else{
              refpaid = 0.00;
            }
            balance = (refprofit - refpaid).toFixed(2);
            referrer = worldStore.state.user.ref||'--';
            if (balance < 500){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '500.00 BITS';
            break;
          case 'BTC':
           // refprofit = (worldStore.state.user.refprofit * 0.00000001).toFixed(8)||'0.00000000';
           // refpaid = (worldStore.state.user.refpaid * 0.00000001).toFixed(8)||'0.00000000';
           // balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            if ((worldStore.state.user.refprofit != undefined)&&(worldStore.state.user.refprofit != null)){
              refprofit = (worldStore.state.user.refprofit * 0.00000001).toFixed(8);
            }else{
              refprofit = 0.00000000;
            }
            if((worldStore.state.user.refpaid != undefined)&&(worldStore.state.user.refpaid != null)){
              refpaid = (worldStore.state.user.refpaid * 0.00000001).toFixed(8);
            }else{
              refpaid = 0.00000000;
            }
            balance = (refprofit - refpaid).toFixed(8);

            referrer = worldStore.state.user.ref||'--';
            if (balance < 0.0005){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '0.00050000 BTC';
            break;
          case 'LTC':
          //  refprofit = (worldStore.state.user.refprofitLTC * 0.00000001).toFixed(8)||'0.00000000';
          //  refpaid = (worldStore.state.user.refpaidLTC * 0.00000001).toFixed(8)||'0.00000000';
          //  balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
          if ((worldStore.state.user.refprofitLTC != undefined)&&(worldStore.state.user.refprofitLTC != null)){
            refprofit = (worldStore.state.user.refprofitLTC * 0.00000001).toFixed(8);
          }else{
            refprofit = 0.00000000;
          }
          if((worldStore.state.user.refpaidLTC != undefined)&&(worldStore.state.user.refpaidLTC != null)){
            refpaid = (worldStore.state.user.refpaidLTC * 0.00000001).toFixed(8);
          }else{
            refpaid = 0.00000000;
          }
          balance = (refprofit - refpaid).toFixed(8);
            
          referrer = worldStore.state.user.ref||'--';
            if (balance < 0.05){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '0.05000000 LTC';
            break;
          case 'DASH':
         //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
         //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
         //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
         //   referrer = worldStore.state.user.ref||'--';
              if ((worldStore.state.user.refprofitDASH != undefined)&&(worldStore.state.user.refprofitDASH != null)){
                refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8);
              }else{
                refprofit = 0.00000000;
              }
              if((worldStore.state.user.refpaidDASH != undefined)&&(worldStore.state.user.refpaidDASH != null)){
                refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8);
              }else{
                refpaid = 0.00000000;
              }
             balance = (refprofit - refpaid).toFixed(8);
             referrer = worldStore.state.user.ref||'--';
            if (balance < 0.01){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '0.01000000 DASH';
            break;
            case 'ADK':
            //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            //   referrer = worldStore.state.user.ref||'--';
                 if ((worldStore.state.user.refprofitADK != undefined)&&(worldStore.state.user.refprofitADK != null)){
                   refprofit = (worldStore.state.user.refprofitADK * 0.00000001).toFixed(8);
                 }else{
                   refprofit = 0.00000000;
                 }
                 if((worldStore.state.user.refpaidADK != undefined)&&(worldStore.state.user.refpaidADK != null)){
                   refpaid = (worldStore.state.user.refpaidADK * 0.00000001).toFixed(8);
                 }else{
                   refpaid = 0.00000000;
                 }
                balance = (refprofit - refpaid).toFixed(8);
                referrer = worldStore.state.user.ref||'--';
               if (balance < 0.1){
                 error = 'BALANCE_TOO_LOW';
               }
               minwtd = '0.10000000 ADK';
               break;
          case 'GRLC':
          //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
          //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
          //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
          //   referrer = worldStore.state.user.ref||'--';
              if ((worldStore.state.user.refprofitGRLC != undefined)&&(worldStore.state.user.refprofitGRLC != null)){
                refprofit = (worldStore.state.user.refprofitGRLC * 0.00000001).toFixed(8);
              }else{
                refprofit = 0.00000000;
              }
              if((worldStore.state.user.refpaidGRLC != undefined)&&(worldStore.state.user.refpaidGRLC != null)){
                refpaid = (worldStore.state.user.refpaidGRLC * 0.00000001).toFixed(8);
              }else{
                refpaid = 0.00000000;
              }
              balance = (refprofit - refpaid).toFixed(8);
              referrer = worldStore.state.user.ref||'--';
            if (balance < 10.00){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '10.0000000 GRLC';
            break;
            case 'FLASH':
            //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            //   referrer = worldStore.state.user.ref||'--';
                if ((worldStore.state.user.refprofitFLASH != undefined)&&(worldStore.state.user.refprofitFLASH != null)){
                  refprofit = (worldStore.state.user.refprofitFLASH * 0.00000001).toFixed(8);
                }else{
                  refprofit = 0.00000000;
                }
                if((worldStore.state.user.refpaidFLASH != undefined)&&(worldStore.state.user.refpaidFLASH != null)){
                  refpaid = (worldStore.state.user.refpaidFLASH * 0.00000001).toFixed(8);
                }else{
                  refpaid = 0.00000000;
                }
                balance = (refprofit - refpaid).toFixed(8);
                referrer = worldStore.state.user.ref||'--';
              if (balance < 10.00){
                error = 'BALANCE_TOO_LOW';
              }
              minwtd = '10.0000000 FLASH';
              break;
              case 'ETH':
            //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            //   referrer = worldStore.state.user.ref||'--';
                if ((worldStore.state.user.refprofitETH != undefined)&&(worldStore.state.user.refprofitETH != null)){
                  refprofit = (worldStore.state.user.refprofitETH * 0.00000001).toFixed(8);
                }else{
                  refprofit = 0.00000000;
                }
                if((worldStore.state.user.refpaidETH != undefined)&&(worldStore.state.user.refpaidETH != null)){
                  refpaid = (worldStore.state.user.refpaidETH * 0.00000001).toFixed(8);
                }else{
                  refpaid = 0.00000000;
                }
                balance = (refprofit - refpaid).toFixed(8);
                referrer = worldStore.state.user.ref||'--';
              if (balance < 0.01){
                error = 'BALANCE_TOO_LOW';
              }
              minwtd = '0.0100000 ETH';
              break;
              case 'MBI':
            //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            //   referrer = worldStore.state.user.ref||'--';
                if ((worldStore.state.user.refprofitMBI != undefined)&&(worldStore.state.user.refprofitMBI != null)){
                  refprofit = (worldStore.state.user.refprofitMBI * 0.00000001).toFixed(8);
                }else{
                  refprofit = 0.00000000;
                }
                if((worldStore.state.user.refpaidMBI != undefined)&&(worldStore.state.user.refpaidMBI != null)){
                  refpaid = (worldStore.state.user.refpaidMBI * 0.00000001).toFixed(8);
                }else{
                  refpaid = 0.00000000;
                }
                balance = (refprofit - refpaid).toFixed(8);
                referrer = worldStore.state.user.ref||'--';
              if (balance < 100.00){
                error = 'BALANCE_TOO_LOW';
              }
              minwtd = '100.00 MBI';
              break;
              case 'WAVES':
            //   refprofit = (worldStore.state.user.refprofitDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   refpaid = (worldStore.state.user.refpaidDASH * 0.00000001).toFixed(8)||'0.00000000';
            //   balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            //   referrer = worldStore.state.user.ref||'--';
                if ((worldStore.state.user.refprofitWAVES != undefined)&&(worldStore.state.user.refprofitWAVES != null)){
                  refprofit = (worldStore.state.user.refprofitWAVES * 0.00000001).toFixed(8);
                }else{
                  refprofit = 0.00000000;
                }
                if((worldStore.state.user.refpaidWAVES != undefined)&&(worldStore.state.user.refpaidWAVES != null)){
                  refpaid = (worldStore.state.user.refpaidWAVES * 0.00000001).toFixed(8);
                }else{
                  refpaid = 0.00000000;
                }
                balance = (refprofit - refpaid).toFixed(8);
                referrer = worldStore.state.user.ref||'--';
              if (balance < 100.00){
                error = 'BALANCE_TOO_LOW';
              }
              minwtd = '100.00 WAVES';
              break;       
          case 'DOGE':
          //  refprofit = (worldStore.state.user.refprofitDOGE).toFixed(2)||'0.00';
          //  refpaid = (worldStore.state.user.refpaidDOGE * 1).toFixed(2)||'0.00';
          //  balance = (parseFloat(refprofit) - parseFloat(refpaid)).toFixed(2);
            if ((worldStore.state.user.refprofitDOGE != undefined)&&(worldStore.state.user.refprofitDOGE != null)){
              refprofit = (worldStore.state.user.refprofitDOGE).toFixed(2);
            }else{
              refprofit = 0.00;
            }
            if((worldStore.state.user.refpaidDOGE != undefined)&&(worldStore.state.user.refpaidDOGE != null)){
              refpaid = (worldStore.state.user.refpaidDOGE).toFixed(2);
            }else{
              refpaid = 0.00;
            }
            balance = (refprofit - refpaid).toFixed(2);

            referrer = worldStore.state.user.ref||'--';
            if (balance < 2000){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '2000.00 DOGE';
            break;
          case 'BXO':
            if ((worldStore.state.user.refprofitBXO != undefined)&&(worldStore.state.user.refprofitBXO != null)){
              refprofit = (worldStore.state.user.refprofitBXO).toFixed(2);
            }else{
              refprofit = 0.00;
            }
            if((worldStore.state.user.refpaidBXO != undefined)&&(worldStore.state.user.refpaidBXO != null)){
              refpaid = (worldStore.state.user.refpaidBXO).toFixed(2);
            }else{
              refpaid = 0.00;
            }
            balance = (refprofit - refpaid).toFixed(2);

            referrer = worldStore.state.user.ref||'--';
            if (balance < 500){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '500.00 BXO';
            break;
            case 'CLAM':
            if ((worldStore.state.user.refprofitCLAM != undefined)&&(worldStore.state.user.refprofitCLAM != null)){
              refprofit = (worldStore.state.user.refprofitCLAM).toFixed(8);
            }else{
              refprofit = 0.00;
            }
            if((worldStore.state.user.refpaidCLAM != undefined)&&(worldStore.state.user.refpaidCLAM != null)){
              refpaid = (worldStore.state.user.refpaidCLAM).toFixed(8);
            }else{
              refpaid = 0.00;
            }
            balance = (refprofit - refpaid).toFixed(8);

            referrer = worldStore.state.user.ref||'--';
            if (balance < 1){
              error = 'BALANCE_TOO_LOW';
            }
            minwtd = '1.00 CLAM';
            break;      
        }
       }else{
         refprofit = '--';
         refpaid = '--';
         balance = '--';
         referrer = '--';
       }

       if (worldStore.state.isLoading) {
         // If app is loading, then just disable button until state change
         innerNode = el.button(
           {type: 'button', disabled: true, className: 'btn btn-lg btn-block btn-default'},
           'Loading...'
         );
       } else if (error) {
         // If there's a betbox error, then render button in error state
         var errorTranslations = {
           'BALANCE_TOO_LOW':'Balance Too Low',
           'INVALID_SEED': 'Invalid Seed',
           'SEED_TOO_HIGH':'Seed too high',
           'CANNOT_AFFORD_WAGER': 'Balance too low',
           'INVALID_AMT': 'Invalid Amount',
           'INVALID_WAGER': 'Invalid Input',
           'WAGER_TOO_LOW': 'Wager too low',
           'WAGER_TOO_PRECISE': 'Wager too precise',
           'INVALID_MULTIPLIER': 'Invalid multiplier',
           'MULTIPLIER_TOO_PRECISE': 'Multiplier too precise',
           'MULTIPLIER_TOO_HIGH': 'Multiplier too high',
           'MULTIPLIER_TOO_LOW': 'Multiplier too low',
           'CHANCE_INVALID_CHARS': 'Invalid Characters in Chance',
           'CHANCE_TOO_LOW': 'Chance too low',
           'CHANCE_TOO_HIGH': 'Chance too high',
           'CHANCE_TOO_PRECISE': 'Chance too Precise'
         };

         innerNode = el.button(
           {type: 'button',
            disabled: true,
            className: 'btn btn-md btn-block btn-danger'},
           errorTranslations[error] || 'Invalid Amount'
         );
       }else {
         innerNode = el.button(
               {
                 //id: 'RT-CLEAR',
                   type: 'button',
                   className: 'btn btn-md btn-block btn-success',
                   style: { fontWeight: 'bold'},
                   onClick: this._onClick,
                   disabled: (worldStore.state.refwd.num == 0)
               },
              'Request Withdrawal'
             )
       }
       if (worldStore.state.referred_users){

         worldStore.state.referred_users.map(function(thisuser){
          UserList += ' ' + thisuser.uname + ',';
         });
       }else {
         UserList = ' ';
       }
       return el.div(
                null,
                el.div({className:'well well-sm'},
                  'Your Referral Link to Share:  ',
                  el.div({className:'text text-center js-reflink'},
                      'https://bit-exo.com/?ref=' + worldStore.state.user.uname + ' ',
                      el.button({
                                type: 'button',
                                className: 'btn btn-sm btn-default',
                                onClick: this._onclick_copy
                               //disabled:
                               },
                               el.span({className: 'glyphicon glyphicon-copy'})
                      )
                  ),

                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12',style: {marginTop: '-15px'}},
                      el.hr(null)
                    )
                  ),
                  //worldStore.state.referred_users
                  el.div({className:'row'},
                    el.div({className:'col-xs-12 col-md-4'},
                      el.span(null,
                        'No. Users Referred: ' + (worldStore.state.referred_users ? worldStore.state.referred_users.length : '0')
                      )
                    ),
                    el.div(null, 'Users Referred: ' + UserList)

                  ),

                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12',style: {marginTop: '-15px'}},
                      el.hr(null)
                    )
                  ),
                  el.div({className: 'row'},
                    el.span({className: 'col-xs-12 col-sm-4 col-md-3'},
                      'Profit: ' + refprofit + ' ' + worldStore.state.coin_type
                    ),
                    el.span({className: 'col-xs-12 col-sm-4 col-md-3'},
                      'Paid: ' + refpaid + ' ' + worldStore.state.coin_type
                    ),
                    el.span({className: 'col-xs-12 col-sm-4 col-md-3'},
                      'Balance: ' + balance + ' ' + worldStore.state.coin_type
                    ),
                    el.span({className: 'col-xs-12 col-sm-4 col-md-3'},
                     'Referred By: ' + referrer
                    )
                  ),
                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12',style: {marginTop: '-10px'}},
                      el.hr(null)
                    )
                  ),
                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12 col-sm-4 col-md-3',style: {marginTop: '-10px'}},
                      el.div(
                            {className: 'form-group'},
                            el.span({className: 'h6'},'Withdraw Amount'),
                            el.span(
                              {className: 'input-group input-group-sm'},
                            //  el.span({className: 'h6'},'Withdraw Amount'),//'input-group-addon'
                              el.input(
                                {
                                  value: worldStore.state.refwd.str,
                                  type: 'text',
                                  className: 'form-control input-sm',
                                  onChange: this._onChange,
                                  placeholder: 'Enter Amount'
                                }
                              ),  //minwtd
                              el.span({className: 'input-group-addon'},worldStore.state.coin_type)
                            ),
                            el.span({className:'text-small'},'Min WTD: ' + minwtd)
                          )
                    ),
                    el.div(
                      {className: 'col-xs-12 col-sm-4 col-md-3'},//style: {marginTop: '-10px'}},
                      innerNode
                    )
                  ),
                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12',style: {marginTop: '-10px'}},
                      el.hr(null)
                    )
                  ),
                //  el.div(
                //    {className: 'row'},
                //    el.div(
                //      {className: 'text-center'},
                //      'REFERAL WITHDRAWALS TEMPORARILY DISABLED'
                //    )
                //  ),
                  el.div(
                    {className: 'row'},
                    el.div(
                      {className: 'col-xs-12',style: {marginTop: '-10px'}},
                      el.hr(null)
                    )
                  ),

                  el.table(
                    {className: 'table text-left text-small', style: {fontWeight:'normal',marginTop:'5px'}},
                    el.thead(
                      null,
                      el.tr(
                        null,
                        el.th(null, 'Date'),
                        el.th(null, 'Amount'),
                        el.th(null, 'Status')
                      )
                    ),
                    el.tbody(
                      null,
                      worldStore.state.reftxdata.map(function(record) {
                        if (record.currency == 'DOGE'){
                            var thisamount = record.amt.toFixed(2);
                        }else if (record.currency == 'BXO'){
                            var thisamount = record.amt.toFixed(4);
                        }else if (record.currency == 'CLAM'){
                          var thisamount = record.amt.toFixed(8);
                        }else{
                          var thisamount = helpers.convNumtoStrBets(record.amt)
                        }
                        return el.tr(
                         { key: record._id},
                           // Date
                           el.td(
                             null,
                             record.created_at.substring(0,10)
                           ),
                           // Amount
                           el.td(
                             null,
                            //  (record.currency == 'DOGE' ? record.amt.toFixed(2) : helpers.convNumtoStrBets(record.amt)) + ' ' + (record.currency ? record.currency : 'BTC')
                            thisamount + ' ' + (record.currency ? record.currency : 'BTC') 
                            ),
                           // Status
                           el.td(
                             null,
                              el.span({className: 'label ' + (record.status == 'PAID' ? 'label-success':'label-warning')},record.status)
                             
                            )
                        );
                      }).reverse()
                    )
                  )


                )
              );
          }
  });


  var ThemeSelect = React.createClass({
    displayName: 'ThemeSelect',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    componentDidMount: function() {
      worldStore.on('change', this._onStoreChange);
    },
    componentWillUnmount: function() {
      worldStore.off('change', this._onStoreChange);
    },
    _onClick: function() {
     $('dropdown-toggle').dropdown();
    },
    _ActionClick: function(type){
      return function(){
        console.log('click action ' + type);
        changeCSS('https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/' + type + '/bootstrap.min.css', 0);
      };

    },
    _ActionClick2: function(){
      console.log('click action 2');
    },
    _ActionClick3: function(){
      console.log('click action 3');
    },
    render: function() {
     return el.div(
         null,
         el.div (
           {className: 'btn-group input-group'},
           el.div({ className:'input-group-addon', style:{fontWeight:'bold'}},'Themes'),
           el.button(
             {
               type:'button',
               className:'btn btn-md btn-primary dropdown-toggle',
               "data-toggle":'dropdown',
               "aria-haspopup":'true',
               "aria-expanded":'false',
               onClick:this._onClick
             },
             'Select', el.span({className:'caret'},'')
           ),
           el.ul({className:'dropdown-menu'},
             el.li(null, el.a({onClick: this._ActionClick('cerulean')},'Cerulean')),
             el.li(null, el.a({onClick: this._ActionClick('cosmo')},'Cosmo')),
             el.li(null, el.a({onClick: this._ActionClick('cyborg')},'Cyborg')),
             el.li(null, el.a({onClick: this._ActionClick('darkly')},'Darkly')),
             el.li(null, el.a({onClick: this._ActionClick('flatly')},'Flatly')),
             el.li(null, el.a({onClick: this._ActionClick('journal')},'Journal')),
             el.li(null, el.a({onClick: this._ActionClick('lumen')},'Lumen')),
             el.li(null, el.a({onClick: this._ActionClick('paper')},'Paper')),
             el.li(null, el.a({onClick: this._ActionClick('readable')},'Readable')),
             el.li(null, el.a({onClick: this._ActionClick('sandstone')},'Sandstone')),
             el.li(null, el.a({onClick: this._ActionClick('simplex')},'Simplex')),
             el.li(null, el.a({onClick: this._ActionClick('slate')},'Slate')),
             el.li(null, el.a({onClick: this._ActionClick('spacelab')},'Spacelab')),
             el.li(null, el.a({onClick: this._ActionClick('superhero')},'Superhero')),
             el.li(null, el.a({onClick: this._ActionClick('united')},'United')),
             el.li(null, el.a({onClick: this._ActionClick('yeti')},'Yeti'))
           )
         )
       );
     }

   });


var SettingsTabContent = React.createClass({
    displayName: 'SettingsTabContent',
    _onStoreChange: function() {
      this.forceUpdate();
    },
    componentDidMount: function() {
      worldStore.on('change', this._onStoreChange);
    },
    componentWillUnmount: function() {
      worldStore.off('change', this._onStoreChange);
    },
    getInitialState: function() {
      return { showToken: false };
    },
    _onClick: function(){
      if (!!this.state.showToken){
        this.setState({ showToken: false });
      }else{
        this.setState({ showToken: true });
      }
      this.forceUpdate();
    },
    _onclick_copy: function(){
      //console.log('CLICK');
      var copyTextarea = document.querySelector('.js-Actoken');
      var range = document.createRange();
      range.selectNode(copyTextarea);
      window.getSelection().addRange(range);
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
    },
    _onClick_ClearList: function(){
      chat_ignorelist = [];
      localStorage.removeItem('ignorelist');
      this.forceUpdate();
    },
    _onClickEnable:function(type){
      var self = this;
      return function(){
        console.log('ENABLE: ' + type);
        switch(type){
          case 'BTC':
            ChatBets.BTC = true;
          break;
          case 'LTC':
            ChatBets.LTC = true;
          break;
          case 'DASH':
            ChatBets.DASH = true;
          break;
          case 'ADK':
            ChatBets.ADK = true;
          break;
          case 'GRLC':
            ChatBets.GRLC = true;
          break;
          case 'FLASH':
          ChatBets.FLASH = true;
        break;
        case 'ETH':
          ChatBets.ETH = true;
        break;
        case 'MBI':
          ChatBets.MBI = true;
        break;
        case 'WAVES':
          ChatBets.WAVES = true;
        break;
          case 'DOGE':
            ChatBets.DOGE = true;
          break;
          case 'BXO':
            ChatBets.BXO = true;
          break;
          case 'CLAM':
            ChatBets.CLAM = true;
          break;
        }

        localStorage.setItem('hideChatBets', JSON.stringify(ChatBets));

        self.forceUpdate();
      }
    },
    _onClickDisable:function(type){
      var self = this;
      return function(){
        console.log('DISABLE: ' + type);
        switch(type){
          case 'BTC':
            ChatBets.BTC = false;
          break;
          case 'LTC':
            ChatBets.LTC = false;
          break;
          case 'DASH':
            ChatBets.DASH = false;
          break;
          case 'ADK':
            ChatBets.ADK = false;
          break;
          case 'GRLC':
            ChatBets.GRLC = false;
          break;
          case 'FLASH':
          ChatBets.FLASH = false;
        break;
        case 'ETH':
          ChatBets.ETH = false;
        break;
        case 'MBI':
          ChatBets.MBI = false;
        break;
        case 'WAVES':
          ChatBets.WAVES = false;
        break;
          case 'DOGE':
            ChatBets.DOGE = false;
          break;
          case 'BXO':
            ChatBets.BXO = false;
          break;
          case 'CLAM':
            ChatBets.CLAM = false;
          break;
        }

        localStorage.setItem('hideChatBets', JSON.stringify(ChatBets));

        self.forceUpdate();
      }
    },
     render: function() {

      /**
       * if (localStorage.hideChatBets){
  var ChatBets = JSON.parse(localStorage.getItem('hideChatBets'));
}else{
  var ChatBets = {
    BTC: true,
    LTC: true,
    DASH: true,
    ADK: true,
    GRLC: true,
    DOGE: true,
    BXO: true
  }
}
       */



       return el.div(
                null,
                el.div({className:'panel panel-default'},
                  el.div({className:'panel-body'},
                    el.div({className: 'col-xs-12'},
                      el.span({className: 'H6', style:{fontWeight:'bold'}}, 'IGNORED USERS'),
                      el.div({className:'well well-sm'},
                        chat_ignorelist.map(function(m){
                          return el.span({className:'text'}, m + ' ');
                        })
                      ),
                      el.button({className:'btn btn-sm btn-default', onClick:this._onClick_ClearList},'Clear List')
                    ),  
                    el.div({className:'col-xs-12'},el.hr()),
                    el.div({className: 'col-xs-12 col-md-8 col-lg-6'},
                      el.span({className: 'H6', style:{fontWeight:'bold'}},'DISPLAY BIG BETS IN CHAT'),
                      el.div({className:'well well-sm'},
                        el.table({className:'table table-bordered'},
                          el.thead(null,
                            el.tr(null,
                              el.th(null, 'Currency'),
                              el.th(null, 'Enabled'),
                              el.th(null, 'Disabled')
                            )
                          ),
                          el.tbody(null,
                            el.tr(null,
                              el.td(null,'BTC'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('BTC'), checked:ChatBets.BTC}),'')
                                )
                                ),
                              el.td(null,el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('BTC'), checked:!ChatBets.BTC}),'')
                              )
                              ),
                            ),
                            el.tr(null,
                              el.td(null,'LTC'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('LTC'), checked:ChatBets.LTC}),'')
                                )
                                ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('LTC'), checked:!ChatBets.LTC}),'')
                                )
                              ),
                            ),
                            el.tr(null,
                              el.td(null,'DASH'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('DASH'), checked:ChatBets.DASH}),'')
                                )
                                ),
                              el.td(null,
                                el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('DASH'), checked:!ChatBets.DASH}),'')
                                )
                              ),
                            ),
                            el.tr(null,
                              el.td(null,'ADK'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('ADK'), checked:ChatBets.ADK}),'')
                                )
                              ),
                              el.td(null,
                                el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('ADK'), checked:!ChatBets.ADK}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'GRLC'),
                              el.td(null, 
                                el.form(null,
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('GRLC'), checked:ChatBets.GRLC}),'')
                                )
                              ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('GRLC'), checked:!ChatBets.GRLC}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'FLASH'),
                              el.td(null, 
                                el.form(null,
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('FLASH'), checked:ChatBets.FLASH}),'')
                                )
                              ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('FLASH'), checked:!ChatBets.FLASH}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'ETH'),
                              el.td(null, 
                                el.form(null,
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('ETH'), checked:ChatBets.ETH}),'')
                                )
                              ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('ETH'), checked:!ChatBets.ETH}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'MBI'),
                              el.td(null, 
                                el.form(null,
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('MBI'), checked:ChatBets.MBI}),'')
                                )
                              ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('MBI'), checked:!ChatBets.MBI}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'WAVES'),
                              el.td(null, 
                                el.form(null,
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('WAVES'), checked:ChatBets.WAVES}),'')
                                )
                              ),
                              el.td(null, 
                                el.form(null,
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('WAVES'), checked:!ChatBets.WAVES}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'DOGE'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('DOGE'), checked:ChatBets.DOGE}),'')
                                )
                              ),
                              el.td(null,
                                el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('DOGE'), checked:!ChatBets.DOGE}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'BXO'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('BXO'), checked:ChatBets.BXO}),'')
                                )
                              ),
                              el.td(null,
                                el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('BXO'), checked:!ChatBets.BXO}),'')
                                )
                            ),
                            ),
                            el.tr(null,
                              el.td(null,'CLAM'),
                              el.td(null,
                                el.form(null, 
                                  el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickEnable('CLAM'), checked:ChatBets.CLAM}),'')
                                )
                              ),
                              el.td(null,
                                el.form(null, 
                                el.label({className:'radio-inline'},el.input({type:'radio', name:'optradio', onClick: this._onClickDisable('CLAM'), checked:!ChatBets.CLAM}),'')
                                )
                            ),
                            )
                          )
                        )
                      )
                    ),
                    el.div({className:'col-xs-12', style:{marginBottom:'5px'}},el.hr()),
                    el.div({className: 'col-xs-12'},
                      el.div({className:'well well-sm'},
                        el.div({className:'row'},
                        el.div({className:'col-xs-12 col-sm-4 col-lg-2'},
                          el.button({className:'btn btn-md btn-default', onClick: this._onClick},
                            !!this.state.showToken ? 'Hide Token':'Show Token'
                          )
                        ),
                        !!this.state.showToken ? el.span({className:'js-Actoken'}, worldStore.state.accessToken, 
                              el.button({
                                type: 'button',
                                className: 'btn btn-sm btn-default',
                                onClick: this._onclick_copy
                               //disabled:
                               },
                               el.span({className: 'glyphicon glyphicon-copy'}))) : '',
                        el.div({className:'col-xs-12 text', style:{color:'red'}},
                          'Caution, Do Not Share this token with anyone as it may be used to access your account on Bit-Exo'
                        )
                        )
                      )
                    ),
                    el.div({className:'col-xs-12', style:{marginBottom:'5px'}},el.hr()),
                    el.div({className:'col-xs-12'},
                    el.span({className: 'H6', style:{fontWeight:'bold'}}, 'REFERRAL INFO'),
                      React.createElement(Ref_Box, null)
                    ),
                    el.div({className:'col-xs-12'},el.hr()),
                    el.div({className:'col-xs-12 col-sm-4 col-md-3'},
                      React.createElement(ThemeSelect, null)
                    )

                )
              )
            );
          }
  });

var BuyBxoTabContent = React.createClass({
  displayName:'BuyBxoTabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change', this._onStoreChange);
    this._getRates();
    this._getHistory();
  },
  componentWillUnmount: function() {
    worldStore.off('change', this._onStoreChange);
  },
  getInitialState: function() {
    return { history:[{created_at:'NO DATE',bxo:0,coin:'BTC',status:'NO TX',total:0}],waitingForServer:false, amount: 0.0000000, total:0.0000000, coin:'BTC', rate:0.00002000, available:9500000, discount:0.35, avail_disc:350000 };
  },
  _getHistory:function(){
    var self = this;
   if (config.debug){console.log('Get History');}
    if (worldStore.state.user){
      if (worldStore.state.user.dogelogin){
        socket.emit('get_sale_history', function(err,data){
          if(!err){ 
            if (config.debug){console.log('Success Get_Sale_History: ' + JSON.stringify(data));}
            self.setState({history:data});
          }else{
            if (config.debug){console.log('error Get_Sale_History');}
          }
        });

      }
    }

  },
  _getRates:function(){
    var self = this;
    if (config.debug){console.log('Get Rates');}
    socket.emit('Get_BXO_Rates', self.state.coin, function(err,data){
      if(!err){ 
        if (config.debug){console.log('Got Rates: ' + JSON.stringify(data));}

        if (data.avail_disc > 0){
          var total = (self.state.amount * (data.rate - (data.rate * data.discount))).toFixed(8);
        }else{
          var total = (self.state.amount * data.rate).toFixed(8);
        }
        self.setState({total:total, coin:data.coin, rate:data.rate, available:data.available, discount:data.discount||0, avail_disc:data.avail_disc||0});
      }else{
        if (config.debug){console.log('error getting bxo rates');}
      }
    });
  },
  _onClick: function() {
    $('dropdown-toggle').dropdown();
   },
   _onClickCoin: function(coin) {
    var self = this;  
    return function(){
      if (config.debug){console.log('Click Coin: ' + coin);}
        self.setState({coin:coin});
        setTimeout(function(){self._getRates();},100);
      }
   },
   _onChangeAmount:function(e){
    var num = e.target.value;
    var total = 0;

    if (this.state.avail_disc > 0){
      total = (num * (this.state.rate - (this.state.rate * this.state.discount))).toFixed(8);
    }else{
      total = (num * this.state.rate).tofixed(8);
    }

    this.setState({total:total, amount:num})
   },
   _onChangeTotal:function(e){
    var total = e.target.value;
    var amount = 0;

    if (this.state.avail_disc > 0){
      amount = (total / (this.state.rate - (this.state.rate * this.state.discount))).toFixed(8);
    }else{
      amount = (total / this.state.rate).tofixed(8);
    }
    this.setState({total:total, amount:amount})

   },
   _onClickBalance:function(){
    var total = 0;
    var amount = 0;

    total = helpers.betToNum(worldStore.state.user.balances[this.state.coin.toLowerCase()],this.state.coin)

    if (config.debug){console.log('Total = ' + total);}

    if (this.state.avail_disc > 0){
      amount = (total / (this.state.rate - (this.state.rate * this.state.discount))).toFixed(8);
    }else{
      amount = (total / this.state.rate).tofixed(8);
    }

    if (config.debug){console.log('Amount = ' + amount);}
    this.setState({total:total, amount:amount})

   },
   _onClickBuy:function(){
     var self = this;

    if (this.state.amount > this.state.available){
      alert('You are requesting more BXO tokens than are available to buy')
    }else if (this.state.amount < 1){
      alert('You must buy more than 1 BXO at a time');
    }else if (this.state.total > worldStore.state.user.balances[this.state.coin.toLowerCase()]){
      alert('Balance too low please reduce buy amount');
    }else{
      var params = {
        total:parseFloat(this.state.total),
        coin:this.state.coin
      }
      if (config.debug){console.log('Buy params: ' + JSON.stringify(params));}
      this.setState({waitingForServer:true});
      socket.emit('buy_bxo_coins', params, function(err,data){
        self.setState({waitingForServer:false});
        if(!err){ 
          if (config.debug){ console.log('Bought Coins: ' + JSON.stringify(data));}

          var messagestring = ' You Just Bought '; 
         // alert(JSON.stringify(data));
          
          
          var amount = 0;
          var total = 0;

          for (var x = 0; x < data.length; x++){
            amount = amount + data[x].bxo;
            total = total +data[x].total;
            messagestring = messagestring + data[x].bxo.toFixed(8) + ' BXO at ' + data[x].rate.toFixed(8) + ' ' + data[x].coin + ' Total: ' + data[x].total.toFixed(8) + ' ' + data[x].coin + ' ';
          }
          alert(messagestring);
          //update balances
          if (self.state.coin == 'DOGE'){
            Dispatcher.sendAction('UPDATE_USER', {
              balances: {doge: worldStore.state.user.balances.doge - total}
            });
          }else if (self.state.coin == 'CLAM'){
            Dispatcher.sendAction('UPDATE_USER', {
              balances: {clam: worldStore.state.user.balances.clam - total}
            });
          }else if (self.state.coin == 'ETH'){
            Dispatcher.sendAction('UPDATE_USER', {
              balances: {eth: worldStore.state.user.balances.eth - (total * 100000000)}
            });
          }else if (self.state.coin == 'BTC'){
            Dispatcher.sendAction('UPDATE_USER', {
              balances: {btc: worldStore.state.user.balances.btc - (total * 100000000)}
            });
          }


          Dispatcher.sendAction('UPDATE_USER', {
            balances: {bxo: worldStore.state.user.balances.bxo + amount}
          });
          //get history
          self._getHistory();
          self._getRates();
        }else{
          console.log('error buy_bxo_coins' + JSON.stringify(err));
        }
      });
    }


   },
  _ClickBE:function(){
    $('#dogeModal').modal('show');
  },
  _ClickMP:function(){
    $('#mpModal').modal('show');
  },
  render: function(){
    var rate;
    var innerNode;
    var historyNode;

    if(this.state.avail_disc > 0){
      rate = (this.state.rate - (this.state.rate * this.state.discount)).toFixed(8);
    }else{
      rate = this.state.rate.toFixed(8);
    }

    if (worldStore.state.user){
      if (worldStore.state.user.dogelogin){

        if (this.state.history[0].created_at != 'NO DATE'){
          historyNode = el.div({className:'well well-sm'},
          el.div({className:'row'},
          el.div({className:'col-xs-12'},el.h6(null,'Purchase History')),
          el.div({className:'col-xs-12 col-md-8 col-lg-6'},
          el.table({className: 'table'},
          el.thead(null,
            el.tr(null,
              el.th(null, 'Date'),
              el.th(null, 'BXO'),
              el.th(null, 'Rate'),
              el.th(null, 'Coin'),
              el.th(null, 'Total'),
              el.th(null, 'Status'),
            )
          ),
          el.tbody(null,
            this.state.history.map(function(tx){
              return el.tr({key: tx._id},
                el.td(null, tx.created_at.substring(0,10)),
                el.td(null, tx.bxo.toFixed(8)),
                el.td(null, tx.rate.toFixed(8)),
                el.td(null, tx.coin),
                el.td(null, tx.total.toFixed(8)),
                el.td(null, tx.status)
              )
            })

          )
        )
          )
        )
      )
        }


        innerNode = el.div({className:'well well-sm'},
        el.div({className:'row'},
          el.div({className:'col-xs-12 col-sm-4 col-md-3 col-lg-2'},
            el.h6({style:{marginTop:'5px',marginBottom:'5px'}},'BXO Available:'),
            el.span(null,this.state.available + ' BXO')
          ),
          el.div({className:'col-xs-12 col-sm-3 col-md-2'},
            el.div({className:'dropdown'},
              el.button(
                          {
                            type:'button',
                            className:'btn btn-sm btn-default dropdown-toggle',
                            style:{fontWeight: 'bold',marginTop:'5px'},
                            "data-toggle":'dropdown',
                            "aria-haspopup":'true',
                            "aria-expanded":'false',
                            onClick:this._onClick
                          },
                          'Coin: ' + this.state.coin, el.span({className:'caret'},'')
                        ),
                        el.ul({className:'dropdown-menu'},
                          el.li(null, el.a({onClick: this._onClickCoin('BTC')},'BTC')),
                          el.li(null, el.a({onClick: this._onClickCoin('DOGE')},'DOGE')),
                          el.li(null, el.a({onClick: this._onClickCoin('ETH')},'ETH')),
                          el.li(null, el.a({onClick: this._onClickCoin('CLAM')},'CLAM'))
                        )
          )
          ),
          el.div({className:'col-xs-12 col-sm-4 col-md-3 col-lg-2'},
            el.h6({style:{marginTop:'5px',marginBottom:'5px'}},'BXO Rate:'),
            el.span(null,this.state.rate.toFixed(8) + ' ' + this.state.coin + '/BXO')
          ),
          el.div({className:'col-xs-12 col-sm-4 col-md-3 col-lg-2'},
            el.h6({style:{marginTop:'5px',marginBottom:'5px'}},'Discount Rate:'),
            el.span(null,(this.state.discount * 100) + '% ⥤ ' + (this.state.rate - (this.state.rate * this.state.discount)).toFixed(8) + ' ' + this.state.coin + '/BXO')
          ),
          el.div({className:'col-xs-12 col-sm-4 col-md-3 col-lg-2'},
            el.h6({style:{marginTop:'5px',marginBottom:'5px'}},'Discounted Remaining:'),
            el.span(null,this.state.avail_disc + ' BXO')
          )
          ),
          el.hr(),
          el.div({className:'row'},
          el.div({className:'col-xs-12 col-sm-4 col-md-3 col-lg-2'},
            el.h6({style:{marginTop:'5px',marginBottom:'5px'}},'Balances:'),
            el.div({onClick:this._onClickBalance},helpers.betToNum(worldStore.state.user.balances[this.state.coin.toLowerCase()], this.state.coin) + ' ' + this.state.coin),
            el.div(null,helpers.betToNum(worldStore.state.user.balances.bxo, 'BXO') + ' BXO')
          ),
          el.div({className:'col-xs-12 col-sm-4 col-md-3'},
            el.div({className:'input-group input-group-sm'},
              el.span({className:'input-group-addon', style:{color:'white'}},'Price'),
              el.input({type:'number',className:'form-control', style:{fontWeight:'bold'},value:rate}),
              el.span({className:'input-group-addon', style:{color:'white'}},this.state.coin)
            ),
            el.div({className:'input-group input-group-sm'},
              el.span({className:'input-group-addon', style:{color:'white'}},'Amount'),
              el.input({type:'number',className:'form-control', style:{fontWeight:'bold'},min:'0.000001', step:'0.000001', value:this.state.amount, onChange:this._onChangeAmount}),
              el.span({className:'input-group-addon', style:{color:'white'}},'BXO')
            ),
            el.hr({style:{marginTop:'3px', marginBottom:'3px'}}),
            el.div({className:'input-group input-group-sm'},
              el.span({className:'input-group-addon', style:{color:'white'}},'Total'),
              el.input({type:'number',className:'form-control', style:{fontWeight:'bold'}, min:'0.000001', step:'0.000001',value:this.state.total, onChange:this._onChangeTotal}),
              el.span({className:'input-group-addon', style:{color:'white'}},this.state.coin)
            )
          ),
          el.div({className:'col-xs-12 col-sm-4 col-md-3'},
            el.button({className:'btn btn-sm btn-success', onClick:this._onClickBuy, disabled:this.state.waitingForServer},'BUY COINS')
          )
          )
        )
      }else{
        innerNode = el.div({className:'well well-sm'},
          el.p(null,'You Must Create an Account/Login with Bit-Exo to be Able to Buy BXO Coins'),
          el.button({className:'btn btn-sm btn-default', onClick:this._ClickBE},'Login/Register') 
        )
      }
    }else{
      innerNode = el.div({className:'well well-sm'},
        el.p(null,'You Must Login to Buy Tokens'),
        el.button({className:'btn btn-sm btn-default', onClick:this._ClickMP},'Login/Register')  
      )
    }
    return el.div(null,
      el.div({className:'panel panel-default'},
        el.div({className:'panel-body'},
          el.h6(null,'Buy BXO Coins Direct'),
          el.div({className:'well well-sm'},
          el.span({className:'lead'},'BXO'),
           el.p(null, ' coins can be played with, traded with others, and sent to other wallets like any other coin. Owning BXO has the added benefit of earning a portion of the revenue from bets placed at Bit-Exo on alt coins that we manage.  We accept BTC, ETH, DOGE and CLAM for direct buy on site with others coming soon. Coins we receive from BXO tokens are used as seed bankrolls and for future site and token improvements.  All you need to do to earn dividends on alt coins is invest your BXO tokens in our bankroll. Dividends are payed out in each currency automatically on each sunday with an option to receive the payment as a credit to you balance or to automatically invest the payment.')
          ),
          innerNode,
          historyNode
        )
      )  
    )
  }
});


var TabContent = React.createClass({
  displayName: 'TabContent',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('change_tab', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('change_tab', this._onStoreChange);
  },
  render: function() {
    switch(worldStore.state.currTab) {
      case 'FAUCET':
        return React.createElement(FaucetTabContent, null);
      case 'MY_BETS':
      ////////////
        if (worldStore.state.bets.data[worldStore.state.bets.end] == null){
          var params = {
            uname: worldStore.state.user.uname
          };
          socket.emit('list_user_bets', params, function(err, bets) {
            if (err) {
              console.log('[socket] list_user_bets failure:', err);
              return;
            }
            console.log('[socket] list_user_bets success:', bets);
            bets.map(function(bet){
              bet.meta = {
                cond: bet.kind == 'DICE' ? bet.cond : '<',
                number: bet.kind == 'DICE' ? bet.target : 99.99,
                hash: 0,//bet.hash,
                isFair: true//CryptoJS.SHA256(bet.secret + '|' + bet.salt).toString() === hash
              };

              if (bet.kind != 'DICE')
                {
                bet.outcome = '-';
                }
              bet.meta.kind = bet.kind;
            })
            Dispatcher.sendAction('INIT_USER_BETS', bets);
          });
          }
        //////////////////
        return React.createElement(MyBetsTabContent, null);
      case 'ALL_BETS':
        return React.createElement(AllBetsTabContent, null);
      case 'STATS':
        return React.createElement(StatsTabContent, null);
      case 'JACKPOT':
          Dispatcher.sendAction('UPDATE_APP_INFO');
        return React.createElement(JackpotTabContent, null);
      case 'HELP':
        return React.createElement(HelpTabContent,null);
      case 'BIGGEST':
          Dispatcher.sendAction('UPDATE_BIGGEST_INFO');
        return React.createElement(BiggestTabContent,null);
      case 'WEEKLY':
          Dispatcher.sendAction('GET_WEEKLY_WAGER');
        return React.createElement(WeeklyWagerContent,null);
      case 'SETTINGS':
          Dispatcher.sendAction('GET_REF_TX');
          Dispatcher.sendAction('GET_REFERRED_USERS');
        return React.createElement(SettingsTabContent,null);
      case 'INVEST':
          return React.createElement(InvestTabContent, null);
      case 'HISTORY':
        return React.createElement(TxHistoryTabContent, null); 
      case 'BUYBXO':
         return React.createElement(BuyBxoTabContent,null);
      default:
        alert('Unsupported currTab value: ', worldStore.state.currTab);
        break;
    }
  }
});

var Footer = React.createClass({
  displayName: 'Footer',
  render: function() {
    //Dispatcher.sendAction('CHANGE_GAME_TAB', 'DICE_GAME');
    return el.div(
      {
        className: 'text-center text-muted',
        style: {
          marginTop: '200px'
        }
      },
      el.div({className:'link_list'},
          el.ul({className:'list-group'},
            el.li(null,
              el.a(
                {
                  href: 'https://bitcointalk.org/index.php?topic=1359320.0',
                  target: '_blank'
                },
                'Bitcointalk'
              )
            ),
            el.li(null,
              ' | ',
              el.a(
                {
                  href: 'https://discord.gg/s688mmK',
                  target: '_blank'
                },
                'Discord'
              )
            ),
            el.li(null,
            ' | Powered by ',
            el.a(
              {
                href: 'https://www.moneypot.com',
                target: '_blank'
              },
              'Moneypot'
            )
          )
        )
      )
    );
  }
});

//////////////////////
  function changeCSS(cssFile, cssLinkIndex) {
    var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);
    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);
    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
    }

   function basefill(num) {
               var rtn = [];
              // rtn.push(0);
               while (rtn.length < num) {
                 rtn.push(helpers.convSatstoCointype(0));
               }
               return rtn;
     }

   function labelfill(num){
        var rtn = [];
        while (rtn.length < num){
          rtn.push(' ');
        }
        return rtn;
      }

   var data1 = {
       labels: labelfill(100),//labelfill(config.bet_buffer_size),//['a','b','c','d'],
       datasets: [ {
               label: "dataset1",
               fillColor: "rgba(220,220,220,0.2)",
               strokeColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
               pointColor: "rgba(119,179,0, 0.8)",//"rgba(220,220,220,1)",
               pointStrokeColor: "#fff",
               pointHighlightFill: "#fff",
               pointHighlightStroke: "rgba(220,220,220,1)",
               data: basefill(100)//rand(-32, 1000, 50)
             } ]
   };

   var GameChart = React.createClass({
     displayName: 'GameChart',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('chart_change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('chart_change', this._onStoreChange);
     },
      render: function() {
        if(config.debug){console.log('[NewGraph]', data1);}
        //check if graph rising
        if (Number(data1.datasets[0].data[data1.datasets[0].data.length - 1]) > Number(data1.datasets[0].data[0]))
          {
          data1.datasets[0].strokeColor = "rgba(119,179,0, 0.8)";
          data1.datasets[0].pointColor = "rgba(119,179,0, 0.8)";
          }else{
            data1.datasets[0].strokeColor = "rgba(153,51,204, 0.8)";
            data1.datasets[0].pointColor = "rgba(153,51,204, 0.8)";
          }

        var props = { data: data1};
        var factory = React.createFactory(Chart.React['Line']);
        var options = {
            options:{
              animation: false,
              pointDot : false,
              pointHitDetectionRadius : 5,
              responsive: true,
              maintainAspectRatio: false,
              height: 75
              }
            };
        var _props = _.defaults({
          data: data1
        },options, props);

        var component = new factory(_props);
        return el.div(
          null,
          el.div({className:'panel panel-primary'},
            el.div({className:'panel-body',style:{marginBottom:'-15px',marginTop:'-15px'}},
            el.div({style:{marginBottom:'-15px',marginTop:'-15px'}},

            component

            )
            )
          )
        );
      }
    });


var LoginModal = React.createClass({
     displayName: 'LoginModal',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {login_name:'', password:'', auth:''};
     },
     _updatelogin: function(e){
       var str = e.target.value;
       this.setState({login_name:str});
       this.forceUpdate();
     },
     _updatePass: function(e){
       var str = e.target.value;
       this.setState({password:str});
       this.forceUpdate();
     },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _onKeyPress: function(e) {
      var ENTER = 13;
      if (e.which === ENTER) {
        if (this.state.password.trim().length > 0) {
          this._onClick_login();
        }
      }
    },
    _onClick_login: function(){
      console.log('DOGE LOGIN');

      var login_params = {
          uname: this.state.login_name,
          password: this.state.password,
          token2fa: this.state.auth
      };
      console.log('Login to Doge Account');
      socket.emit('Login_Doge', login_params, function(err, data){
        if (err){
          alert('Error Login_Doge: ' + err);
        }else{
          console.log('[socket] success Login_Doge ', data);  
          if (data){
              Dispatcher.sendAction('UPDATE_USER', data.user);
              Dispatcher.sendAction('SET_NEXT_HASH', data.hash);
              if (data.access_token){
                Dispatcher.sendAction('Set_Accesstoken', data.access_token);
              //  localStorage.setItem('access_token', data.access_token);

                expires_at = new Date(Date.now() + (604800 * 1000));
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('expires_at', expires_at);
              }
              localStorage.setItem('doge_token', data.user.dogelogin);
              if (data.user.dogeaddress){
                if (dep_qrcode != undefined){
                  dep_qrcode.clear();
                  dep_qrcode.makeCode(data.user.dogeaddress);
                }else{
                  dep_qrcode = new QRCode(document.getElementById("qrcode"), {text: data.user.dogeaddress, width: 90, height: 90});
                } 
              }
              $('#loginModal').modal('hide');
          }
        }
      });


    },

      render: function() {
        
        var innerNode;
        if (worldStore.state.user){
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'User Name'),
                      el.input({
                          type: 'text',
                          value: worldStore.state.user.uname,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          disabled: true
                         // onChange: this._onPlayerChange
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Password'),
                      el.input({
                          type: 'password',
                          value: this.state.password,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePass,
                          onKeyPress: this._onKeyPress
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'2fa'),
                      el.input({
                          type: 'text',
                          value: this.state.auth,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._update2fa,
                          onKeyPress: this._onKeyPress
                        }
                      )
                  )
                ),
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_login},'Login')//,
                //el.div({id:"qrcode"})
              )
            )
        }else{
          innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'User Name'),
                      el.input({
                          type: 'text',
                          value: this.state.login_name,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatelogin
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Password'),
                      el.input({
                          type: 'password',
                          value: this.state.password,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePass,
                          onKeyPress: this._onKeyPress
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'2fa'),
                      el.input({
                          type: 'text',
                          value: this.state.auth,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._update2fa,
                          onKeyPress: this._onKeyPress
                        }
                      )
                  )
                ),
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_login},'Login')//,
                //el.div({id:"qrcode"})
              )
            )
        }
        return el.div(null,
          el.div({className:"modal fade", id:"loginModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Login to Bit-Exo')
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var CreateUserModal = React.createClass({
     displayName: 'CreateUserModal',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {email:'', password:'', password_verify:''};
     },
     _onEmailChange: function(e){
       var str = e.target.value;
       this.setState({email:str});
       this.forceUpdate();
     },
     _updatePass: function(e){
       var str = e.target.value;
       this.setState({password:str});
       this.forceUpdate();
     },
     _updatePassV: function(e){
       var str = e.target.value;
       this.setState({password_verify:str});
       this.forceUpdate();
     },
     _onClick_create: function(){
       var create_params = {
          //uname: this.state.uname,
          email: this.state.email,
          password: this.state.password
      };
      console.log('Creating New Doge Account');
      socket.emit('Create_Doge_Account', create_params, function(err, data){
        if (err){
          alert('Error Creating User: ' + err);
        }else{
          console.log('[socket] success creating new doge account ', data);  
          if (data){
              Dispatcher.sendAction('UPDATE_USER', data.user);
              Dispatcher.sendAction('SET_NEXT_HASH', data.hash);
              //var qrcode = new QRCode(document.getElementById("qrcode"), {text: data.user.dogeaddress, width: 90, height: 90});
              if (data.user.dogeaddress){
                if (dep_qrcode != undefined){
                  dep_qrcode.clear();
                  dep_qrcode.makeCode(data.user.dogeaddress);
                }else{
                  dep_qrcode = new QRCode(document.getElementById("qrcode"), {text: data.user.dogeaddress, width: 90, height: 90});
                } 
              }
              $('#createModal').modal('hide');
              $('#depositModal').modal('show');
          }
        }
      });
     },
     _onKeyPress: function(e) {
       var ENTER = 13;
        if (e.which === ENTER) {
         if (this.state.password_verify != this.state.password || this.state.password.length < 3) {
           console.log('forms incomplete');
         }else{
          this._onClick_create();
         }
        }
      },
      render: function() {
        var result = owaspPasswordStrengthTest.test(this.state.password);
        //this.setState({result:result});
        var innerNode;
       //var self = this;
        if (worldStore.state.user){
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'User Name'),
                      el.input({
                          type: 'text',
                          value: worldStore.state.user.uname,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          disabled: true
                         // onChange: this._onPlayerChange
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Email'),
                      el.input({
                          type: 'text',
                          value: this.state.email,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._onEmailChange,
                          onKeyPress: this._onKeyPress
                        }
                      ),
                      el.span({className:'input-group-addon'},'Optional')
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Password'),
                      el.input({
                          type: 'password',
                          value: this.state.password,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePass,
                          onKeyPress: this._onKeyPress
                        }
                      ),
                      el.span({className:'input-group-addon glyphicon ' + (result.errors[0] ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (result.errors[0] ? 'red': 'green')}})
                  ),
                  result.errors[0] ? el.div({className:'text'},result.errors[0]) : ''
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Verify Pass'),
                      el.input({
                          type: 'password',
                          value: this.state.password_verify,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePassV,
                          onKeyPress: this._onKeyPress
                        }
                      ),
                      el.span({className:'input-group-addon glyphicon ' + (this.state.password_verify != this.state.password ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (this.state.password_verify != this.state.password ? 'red': 'green')}})
                  ),
                  this.state.password_verify != this.state.password ? el.div({className:'text'},'Passwords do not match') : ''
                ),
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_create, disabled: result.errors[0] || this.state.password_verify != this.state.password || this.state.password.length < 2},'Create User')//,
                //el.div({id:"qrcode"})
              )
            )
        }else{
          innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                 el.code(null,'You must be logged into moneypot first to create a doge account to prevent duplicate usernames.')
              )
            )
        }
        return el.div(null,
          el.div({className:"modal fade", id:"createModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Create New User')
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var dep_qrcode;

var DepositModal = React.createClass({
     displayName: 'DepositModal ',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
       console.log('qr');
       dep_qrcode = new QRCode(document.getElementById("qrcode"), {text: this.state.depositaddress, width: 90, height: 90});
      },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {depositaddress:'some dep add', waitingForServer:false};
     },
     _onClickNewAddress: function(){
      var self = this;
      self.setState({waitingForServer:true});
      /*
        socket.emit('Get_New_Doge_Address', function(err, data){
          if(err){
            alert('Error Getting New Doge Address:' + err);
          }else if (data){
            console.log('New Doge Address: ' + data);
            Dispatcher.sendAction('UPDATE_USER', {dogeaddress: data});
            if (dep_qrcode != undefined){
                dep_qrcode.clear();
                dep_qrcode.makeCode(data);
              }else{
                dep_qrcode = new QRCode(document.getElementById("qrcode"), {text: data, width: 90, height: 90});
              } 
          }
        });
        */
        if (worldStore.state.coin_type == 'BITS'){
          var get_coin = 'BTC';
        }else{
          var get_coin = worldStore.state.coin_type;
        }
       var g_param = {coin:get_coin}
       socket.emit('Get_New_Address', g_param, function(err, data){
        self.setState({waitingForServer:false});
        if(err){
          alert('Error Getting New Address:' + err);
        }else if (data){
          console.log('New ' + get_coin + ' Address: ' + data);
          switch(worldStore.state.coin_type){
            case 'BITS':
            case 'BTC':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{btc:data}});
            break;            
            case 'LTC':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{ltc:data}});
            break;
            case 'ADK':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{adk:data}});
            break;
            case 'DASH':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{dash:data}});
            break;
            case 'FLASH':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{flash:data}});
            break;
            case 'GRLC':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{grlc:data}});
            break;
            case 'ETH':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{eth:data}});
            break;
            case 'MBI':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{mbi:data}});
            break;
            case 'WAVES':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{waves:data}});
            break;
            case 'DOGE':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{doge:data}});
            break;
            case 'BXO':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{bxo:data}});
            break;
            case 'CLAM':
              Dispatcher.sendAction('UPDATE_USER', {addresses:{clam:data}});
            break;
            
          }
         // Dispatcher.sendAction('UPDATE_USER', {dogeaddress: data});

          if (dep_qrcode != undefined){
              dep_qrcode.clear();
              dep_qrcode.makeCode(data);
            }else{
              dep_qrcode = new QRCode(document.getElementById("qrcode"), {text: data, width: 90, height: 90});
            } 
        }
      });

     },
     _onClickMpForm:function(){
      var coin = worldStore.state.coin_type.toLowerCase();
      var windowUrl = config.mp_browser_uri + '/dialog/deposit?app_id=' + config.app_id + '&coin=' + coin;
      var windowName = 'manage-auth';
      var windowOpts = [
        'width=420',
        'height=550',
        'left=100',
        'top=100'
      ].join(',');
      var windowRef = window.open(windowUrl, windowName, windowOpts);
      windowRef.focus();
      return false;
      
      },
      _onclick_copy: function(){
      //console.log('CLICK');
      var copyTextarea = document.querySelector('.js-DepAdd');
      var range = document.createRange();
      range.selectNode(copyTextarea);
      window.getSelection().addRange(range);
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
    },
    /* _genQR: function(){
      
      if (qrcode){
        qrcode.clear();
        qrcode.makeCode("http://naver.com");
      } 
     var qrcode = new QRCode(document.getElementById("qrcode"), "http://jindo.dev.naver.com/collie");
     },*/
      render: function() {
        if (worldStore.state.user){
          if (worldStore.state.coin_type == 'BITS'){
            var depositaddress = worldStore.state.user.addresses.btc;
          }else{
            var depositaddress = worldStore.state.user.addresses[worldStore.state.coin_type.toLowerCase()];//worldStore.state.user.dogeaddress;
          }
        }else{
          var depositaddress = 'some addy';
        }

        if ((worldStore.state.coin_type != 'CLAM')&&(worldStore.state.coin_type != 'DOGE')&&(worldStore.state.coin_type != 'BXO')){
          var transferbutton = el.button({type:"button", className:"btn btn-primary", "data-dismiss":"modal", onClick:this._onClickMpForm},'Transfer from Moneypot');
        }else{
          var transferbutton;// = el.button({type:"button", className:"btn btn-primary", "data-dismiss":"modal", onClick:this._onClickMpForm},'Transfer from Moneypot');
        }

        var innerNode;
            innerNode = el.div({className:'row'},
             // el.div({className:'col-xs-12'},
                el.div({className: 'col-xs-12 col-sm-4 col-lg-3', id:"qrcode"}),
               // el.hr(null),
                el.div({className:'col-xs-12 col-sm-7'},el.hr(null), el.code({className:'js-DepAdd'}, depositaddress)),
              /*  el.div({className:'col-xs-3'},
                  el.button({
                            type: 'button',
                            className: 'btn btn-sm btn-default',
                            onClick: this._onclick_copy
                            },
                            el.span({className: 'glyphicon glyphicon-copy'})) 
                ),*/
                el.div({className:'col-xs-3 col-sm-1'}, el.button({type:'button', className:'btn btn-default', onClick: this._onClickNewAddress, disabled:this.state.waitingForServer},el.span({className:'glyphicon glyphicon-refresh ' + (this.state.waitingForServer ? 'rotate':'')})))
            //  )
            )

        return el.div(null,
          el.div({className:"modal fade", id:"depositModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Deposit ' + worldStore.state.coin_type)
                ),
                el.div({className:"modal-body", style:{backgroundColor:'gray'}},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Deposits are credited after confirmation. You may reuse existing deposit addresses after generating a new address.'),
                 transferbutton,
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });

    /*
    var dep_qrcodeBXO;
    var DepositModalBXO = React.createClass({
         displayName: 'DepositModalBXO',
         _onStoreChange: function() {
           this.forceUpdate();
         },
         componentDidMount: function() {
           worldStore.on('change', this._onStoreChange);
           console.log('qr');
           dep_qrcodeBXO = new QRCode(document.getElementById("qrcodebxo"), {text: this.state.depositaddress, width: 90, height: 90});
          },
         componentWillUnmount: function() {
           worldStore.off('change', this._onStoreChange);
         },
         getInitialState: function() {
          return {depositaddress:'some dep add'};
         },
         _onClickNewAddress: function(){
           var self = this;
           console.log('getting new bxo address');
            socket.emit('Get_New_Bxo_Address', function(err, data){
              if(err){
                alert('Error Getting New BXO Address:' + err);
              }else if (data){
                console.log('New BXO Address: ' + data);
                Dispatcher.sendAction('UPDATE_USER', {bxoaddress: data});
                if (dep_qrcodeBXO != undefined){
                    dep_qrcodeBXO.clear();
                    dep_qrcodeBXO.makeCode(data);
                  }else{
                    dep_qrcodeBXO = new QRCode(document.getElementById("qrcodebxo"), {text: data, width: 90, height: 90});
                }
                self.forceUpdate(); 
              }
            });
    
         },
          _onclick_copy: function(){
          //console.log('CLICK');
          var copyTextarea = document.querySelector('.js-DepAdd');
          var range = document.createRange();
          range.selectNode(copyTextarea);
          window.getSelection().addRange(range);
          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
          } catch (err) {
            console.log('Oops, unable to copy');
          }
        },
          render: function() {
            if (worldStore.state.user){
              var depositaddress = worldStore.state.user.bxoaddress;
            }else{
              var depositaddress = 'some addy';
            }
            var innerNode;
                innerNode = el.div({className:'row'},
                  el.div({className:'col-xs-12'},
                    el.div({className: 'col-xs-12 col-sm-6 col-lg-3', id:"qrcodebxo"}),
                    el.hr(null),
                    el.div({className:'col-xs-12 col-sm-6'}, el.code({className:'js-DepAdd'}, depositaddress)),
                  // el.div({className:'col-xs-3'},
                  //    el.button({
                  //              type: 'button',
                  //              className: 'btn btn-sm btn-default',
                  //              onClick: this._onclick_copy
                  //              },
                  //              el.span({className: 'glyphicon glyphicon-copy'})) 
                  //  ),
                    el.div({className:'col-xs-3'}, el.button({type:'button', className:'btn btn-default', onClick: this._onClickNewAddress},el.span({className:'glyphicon glyphicon-refresh'})))
                  )
                )
    
            return el.div(null,
              el.div({className:"modal fade", id:"depositBXOModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
                el.div({className:"modal-dialog", role:"document"},
                  el.div({className:"modal-content"},
                    el.div({className:"modal-header"},
                      el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                        el.span({'aria-hidden':"true"},
                        el.span({className:'glyphicon glyphicon-remove'})
                        )
                      ),
                      el.h4({className:'modal-title', id:'myModalLabel'},'Deposit BXO')
                    ),
                    el.div({className:"modal-body", style:{backgroundColor:'gray'}},
                    innerNode
                    ),
                    el.div({ className:"modal-footer"},
                     el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Deposits are credited after 6 confirmations. You may reuse existing deposit addresses after generating a new address.'),
                     el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                    )
                  )
                )
              )
            );
          }
        });    


        var dep_qrcodeCLAM;
        var DepositModalCLAM = React.createClass({
             displayName: 'DepositModalCLAM',
             _onStoreChange: function() {
               this.forceUpdate();
             },
             componentDidMount: function() {
               worldStore.on('change', this._onStoreChange);
               console.log('qr');
               dep_qrcodeCLAM = new QRCode(document.getElementById("qrcodeclam"), {text: this.state.depositaddress, width: 90, height: 90});
              },
             componentWillUnmount: function() {
               worldStore.off('change', this._onStoreChange);
             },
             getInitialState: function() {
              return {depositaddress:'some clam dep add'};
             },
             _onClickNewAddress: function(){
               var self = this;
               console.log('getting new clam address');
                socket.emit('Get_New_Clam_Address', function(err, data){
                  if(err){
                    alert('Error Getting New CLAM Address:' + err);
                  }else if (data){
                    console.log('New CLAM Address: ' + data);
                    Dispatcher.sendAction('UPDATE_USER', {clamaddress: data});
                    if (dep_qrcodeCLAM != undefined){
                        dep_qrcodeCLAM.clear();
                        dep_qrcodeCLAM.makeCode(data);
                      }else{
                        dep_qrcodeCLAM = new QRCode(document.getElementById("qrcodeclam"), {text: data, width: 90, height: 90});
                    }
                    self.forceUpdate(); 
                  }
                });
        
             },
              _onclick_copy: function(){
              //console.log('CLICK');
              var copyTextarea = document.querySelector('.js-DepAdd');
              var range = document.createRange();
              range.selectNode(copyTextarea);
              window.getSelection().addRange(range);
              try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
              } catch (err) {
                console.log('Oops, unable to copy');
              }
            },
              render: function() {
                if (worldStore.state.user){
                  var depositaddress = worldStore.state.user.clamaddress;
                }else{
                  var depositaddress = 'some addy';
                }
                var innerNode;
                    innerNode = el.div({className:'row'},
                      el.div({className:'col-xs-12'},
                        el.div({className: 'col-xs-12 col-sm-6 col-lg-3', id:"qrcodeclam"}),
                        el.hr(null),
                        el.div({className:'col-xs-12 col-sm-6'}, el.code({className:'js-DepAdd'}, depositaddress)),
                      //  el.div({className:'col-xs-3'},
                      //    el.button({
                      //              type: 'button',
                      //              className: 'btn btn-sm btn-default',
                      //              onClick: this._onclick_copy
                      //              },
                      //              el.span({className: 'glyphicon glyphicon-copy'})) 
                      //  ),
                        el.div({className:'col-xs-3'}, el.button({type:'button', className:'btn btn-default', onClick: this._onClickNewAddress},el.span({className:'glyphicon glyphicon-refresh'})))
                      )
                    )
        
                return el.div(null,
                  el.div({className:"modal fade", id:"depositCLAMModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
                    el.div({className:"modal-dialog", role:"document"},
                      el.div({className:"modal-content"},
                        el.div({className:"modal-header"},
                          el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                            el.span({'aria-hidden':"true"},
                            el.span({className:'glyphicon glyphicon-remove'})
                            )
                          ),
                          el.h4({className:'modal-title', id:'myModalLabel'},'Deposit CLAM')
                        ),
                        el.div({className:"modal-body", style:{backgroundColor:'gray'}},
                        innerNode
                        ),
                        el.div({ className:"modal-footer"},
                         el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Deposits are credited after 6 confirmations. You may reuse existing deposit addresses after generating a new address.'),
                         el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                        )
                      )
                    )
                  )
                );
              }
            }); 
*/

var wtd_obj;
var WithdrawModal = React.createClass({
     displayName: 'WithdrawModal ',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {auth:'', address:'', amount:''};
     },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _updateAddress: function(e){
       var str = e.target.value;
       this.setState({address:str});
       this.forceUpdate();
     },
     _updateAmount: function(e){
       var str = e.target.value;
       this.setState({amount:str});
       this.forceUpdate();
     },
     _onKeyPress: function(e) {
      var ENTER = 13;
        if (e.which === ENTER) {
         if (this.state.addresstrim().length > 0) {
           this._onClick_withdraw();
         }
        }
      },
      _onClick_withdraw: function(){
        var wd_params = {
          address: this.state.address,
          amount: this.state.amount,
          token2fa: this.state.auth
        };
        if (worldStore.state.coin_type == 'DOGE'){
          console.log('Withdrawing Doge');
          socket.emit('Withdraw_Doge', wd_params, function(err, data){
            if (err){
              alert('Error Withdraw_Doge: ' + err);
            }else{
              console.log('[socket] Success Withdraw_Doge: ', data);  
              if (data){
                 // Dispatcher.sendAction('UPDATE_USER', {balance: worldStore.state.user.balances.doge - wd_params.amount});
                  Dispatcher.sendAction('UPDATE_USER', { balances: {doge: worldStore.state.user.balances.doge - wd_params.amount}});
              }
                wtd_obj.setState({auth:''});
                wtd_obj.setState({address:''});
                wtd_obj.setState({amount:''});
                $('#withdrawModal').modal('hide');
            }
          });
        }else if (worldStore.state.coin_type == 'BXO'){
          console.log('Withdrawing BXO');
          socket.emit('Withdraw_BXO', wd_params, function(err, data){
            if (err){
              alert('Error Withdraw_BXO: ' + err);
            }else{
              console.log('[socket] Success Withdraw_BXO: ', data);  
              if (data){
                //  Dispatcher.sendAction('UPDATE_USER', {balance: worldStore.state.user.balances.bxo - wd_params.amount});
                Dispatcher.sendAction('UPDATE_USER', { balances: {bxo: worldStore.state.user.balances.bxo - wd_params.amount}});
              }
                wtd_obj.setState({auth:''});
                wtd_obj.setState({address:''});
                wtd_obj.setState({amount:''});
                $('#withdrawModal').modal('hide');
            }
          });
        }else if (worldStore.state.coin_type == 'CLAM'){
          console.log('Withdrawing CLAM');
          socket.emit('Withdraw_CLAM', wd_params, function(err, data){
            if (err){
              alert('Error Withdraw_CLAM: ' + err);
            }else{
              console.log('[socket] Success Withdraw_CLAM: ', data);  
              if (data){
                //  Dispatcher.sendAction('UPDATE_USER', {balance: worldStore.state.user.balances.bxo - wd_params.amount});
                Dispatcher.sendAction('UPDATE_USER', { balances: {clam: worldStore.state.user.balances.clam - wd_params.amount}});
              }
                wtd_obj.setState({auth:''});
                wtd_obj.setState({address:''});
                wtd_obj.setState({amount:''});
                $('#withdrawModal').modal('hide');
            }
          });
        }
      },
      render: function() {
        var innerNode;
        var wtd_fee;
        if (worldStore.state.coin_type == 'DOGE'){
          wtd_fee = 1;
        }else if(worldStore.state.coin_type == 'BXO'){
          wtd_fee = 0.0001;
        }else if(worldStore.state.coin_type == 'CLAM'){
          wtd_fee = 0.001;
        }

        wtd_obj = this;
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-12'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Address'),
                      el.input({
                          type: 'text',
                          value: this.state.address,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updateAddress
                        }
                      )
                  )
                )
              ),
              el.div({className:'row col-xs-12'},
                el.div({className:'col-xs-6 col-lg-4'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Amount'),
                      el.input({
                          type: 'text',
                          value: this.state.amount,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updateAmount
                        }
                      )
                    )
                  )
                ),
                el.div({className:'col-xs-6 col-lg-4'},
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'2fa'),
                      el.input({
                          type: 'text',
                          value: this.state.auth,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._update2fa,
                          onKeyPress: this._onKeyPress
                        }
                      )
                    )
                  )
                ),
                el.div({className:'col-xs-6 col-lg-3'},
                  el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_withdraw },'Withdraw')
                )
              )
            )

        return el.div(null,
          el.div({className:"modal fade", id:"withdrawModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Withdraw ' + worldStore.state.coin_type)
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 //worldStore.state.coin_type == 'DOGE' ? el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Enter Address and Amount and click withdraw, 1 doge will be taken from this amount for transaction fees.') : el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Enter Address and Amount and click withdraw, 0.0001 BXO will be taken from this amount for transaction fees.'),
                 el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Enter Address and Amount and click withdraw, ' + wtd_fee + ' ' + worldStore.state.coin_type + ' will be taken from this amount for transaction fees.'),
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var qrcode2fa;
var secret2fa;

var Auth2faModal = React.createClass({
     displayName: 'Auth2faModal ',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);

       qrcode2fa = new QRCode(document.getElementById("qrcode2fa"), {text: this.state.url2fa, width: 150, height: 150});
       console.log('qrcode: ' +  qrcode2fa);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {url2fa:'otpauth://totp/Bit-Exo:' + 'TEST' + '?secret=' + 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ' + '&issuer=Bit-Exo&algorithm=SHA1&digits=6&period=30', secret:'', auth:''};
     },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _onKeyPress: function(e) {
      var ENTER = 13;
      if (e.which === ENTER) {
      //  if (this.state.password.trim().length > 0) {
       //   this._onClick_login();
       // }
      }
    },
    _onClick_enable:function(){
      var params = {
        token2fa: this.state.auth
      }
      socket.emit('Enable_2fa', params, function(err, data){
          if (err){
            alert('Error Enable_2fa: ');
          }else{
            console.log('[socket] Success Enable_2fa: ', data);  
            if (data){
              $('#auth2faModal').modal('hide');
            }
          }
        });
    },
      render: function() {
        var innerNode;
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-12'},
                el.div({className: 'col-xs-12', id:"qrcode2fa"}),
                el.div({className:'col-xs-12'}, el.code(null, secret2fa)),
                el.div({className:'col-xs-12 col-sm-9 col-md-6 col-lg-4'},
                  el.div({className: 'form-group'},
                      el.div({className: 'input-group'},
                        el.span({className: 'input-group-addon'},'2fa'),
                        el.input({
                            type: 'text',
                            value: this.state.auth,
                            style : {fontWeight: 'bold'},
                            className: 'form-control input-sm',
                            onChange: this._update2fa
                          }
                        )
                    )
                  )
                ),
                el.button({type:"button", className:"btn btn-default", onClick: this._onClick_enable},'Enable 2fa')
              )
            )

        return el.div(null,
          el.div({className:"modal fade", id:"auth2faModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Enable 2fa')
                ),
                el.div({className:"modal-body", style:{backgroundColor:'gray'}},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.div({className:'col-xs-12 col-sm-10 col-md-7 text-left'},'Scan QR code and submit 2fa code to enable 2fa protection on you doge account. Works with Authy, Google Authenticator, MS Authenticator and GAuth'),
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var SettingsModal = React.createClass({
     displayName: 'SettingsModal ',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {auth:'', oldpassword:'', password:'', password_verify:'', email:''};
     },
     _updateemail: function(e){
        var str = e.target.value;
        this.setState({email:str});
        this.forceUpdate();
      },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _updateOldPass: function(e){
       var str = e.target.value;
       this.setState({oldpassword:str});
       this.forceUpdate();
     },
     _updatePass: function(e){
       var str = e.target.value;
       this.setState({password:str});
       this.forceUpdate();
     },
     _updatePassV: function(e){
       var str = e.target.value;
       this.setState({password_verify:str});
       this.forceUpdate();
     },
     _disable2fa: function(){
       console.log('disable 2fa');
       //TODO DISABLE 2FA
       
       var params = {
        token2fa: this.state.auth
      }
      socket.emit('Disable_2fa', params, function(err, data){
          if (err){
            alert('Error Disable_2fa: ');
          }else{
            console.log('[socket] Success Disable_2fa: ', data);  
            if (data){
              $('#settingsModal').modal('hide');
            }
          }
        });

       
     },
     _enable2fa: function(){
        //TODO GET 2FA URL
        socket.emit('Get_2fa', function(err, data){
          if (err){
            alert('Error Get_2fa: ');
          }else{
            console.log('[socket] Success Get_2fa: ', data);  
            if (data){
             //   Dispatcher.sendAction('UPDATE_USER', {balance: worldStore.state.user.balance - wd_params.amount});
            // if (qrcode){
                var idxS = data.indexOf('=');
                var idxE = data.indexOf('&');
                if ((idxS > 0)&&(idxE > 0)){
                  secret2fa = data.slice((idxS + 1), idxE);
                }             
                qrcode2fa.clear();
                qrcode2fa.makeCode(data);
            //  } 
              $('#settingsModal').modal('hide');
              $('#auth2faModal').modal('show');

            }
          }
        });

       // $('#settingsModal').modal('hide');
       // $('#auth2faModal').modal('show');
     },
     _onClick_update: function(){
      var params = {
        oldpassword: this.state.oldpassword,
        password: this.state.password,
        token2fa: this.state.auth,
        password_verify: this.state.password_verify
      }
      socket.emit('Change_Password', params, function(err, data){
          if (err){
            alert('Error Change_Password: ' + err);
          }else{
            console.log('[socket] Success Change_Password: ', data);  
            if (data){
              $('#settingsModal').modal('hide');
            }
          }
        });

     },
     _onClickEmail:function(){
      var params = {
        token2fa: this.state.auth,
        email: this.state.email
      }
      var self= this;
      socket.emit('Update_Email', params, function(err, data){
        if (err){
          alert('Error Update_Email: ' + err);
        }else{
          console.log('[socket] Success Update_Email: ', data);  
          // if (data){
         //   $('#settingsModal').modal('hide');
         // }

         Dispatcher.sendAction('UPDATE_USER',{email:self.state.email});

        }
      });
     },
      render: function() {
        if (worldStore.state.user){
          var email = worldStore.state.user.email;
          if (worldStore.state.user.auth2fa){
            var auth_enable = true;
          }else{
            var auth_enable = false;
          }
        }else{
          var auth_enable = false;
          var email = '';
        }
        

        var result = owaspPasswordStrengthTest.test(this.state.password);
        var innerNode;
         innerNode = el.div({className:'row'},
              el.div({className:'col-xs-12 col-sm-9 col-md-6'},
                 el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'2fa'),
                      el.input({
                          type: 'text',
                          value: this.state.auth,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._update2fa
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Old Password'),
                      el.input({
                          type: 'password',
                          value: this.state.oldpassword,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updateOldPass
                        }
                      )
                  )
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'New Password'),
                      el.input({
                          type: 'password',
                          value: this.state.password,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePass
                        }
                      ),
                      el.span({className:'input-group-addon glyphicon ' + (result.errors[0] ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (result.errors[0] ? 'red': 'green')}})
                  ),
                  result.errors[0] ? el.div({className:'text'},result.errors[0]) : ''
                ),
                el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'Verify Pass'),
                      el.input({
                          type: 'password',
                          value: this.state.password_verify,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._updatePassV
                        }
                      ),
                      el.span({className:'input-group-addon glyphicon ' + (this.state.password_verify != this.state.password ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (this.state.password_verify != this.state.password ? 'red': 'green')}})
                  ),
                  this.state.password_verify != this.state.password ? el.div({className:'text'},'Passwords do not match') : ''
                ),
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_update, disabled: result.errors[0] || this.state.password_verify != this.state.password || this.state.oldpassword.length < 2},'Update Password'),
                el.button({type: 'button', className:'btn btn-small btn-default', onClick: auth_enable ? this._disable2fa : this._enable2fa},auth_enable ? 'Disable 2fa' : 'Add 2fa'),
                el.div({className: 'form-group', style:{marginTop:'10px'}},
                  el.div({className: 'input-group'},
                    el.span({className: 'input-group-addon'},'Email'),
                    el.input({
                        type: 'text',
                        value: this.state.email,
                        style : {fontWeight: 'bold'},
                        className: 'form-control input-sm',
                        onChange: this._updateemail
                      }
                    ),
                    el.span({className:'input-group-btn'},
                      el.div(
                          {
                            role:'button',
                            className:'btn btn-sm btn-default',
                           // "data-toggle":'dropdown',
                           // 'data-container':'body',
                           // "aria-haspopup":'true',
                           // "aria-expanded":'false',
                            onClick:this._onClickEmail,
                            style:{fontWeight:'bold'}
                          },
                          'Update'
                      )
                    )
                  )
                ),
                el.div(null, 'Current Email: ' + email)
              )
            )
        
        return el.div(null,
          el.div({className:"modal fade", id:"settingsModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Bit-Exo Account Settings')
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var InvestModal = React.createClass({
     displayName: 'InvestModal',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     getInitialState: function() {
      return {auth:'', amount:'', set_kelly:'', error:null, errorA:null};
     },
     _update2fa: function(e){
       var str = e.target.value;
       this.setState({auth:str});
       this.forceUpdate();
     },
     _updateAmount: function(e){
       var str = e.target.value;
        var str = e.target.value;
        var num = parseFloat(str, 10);
        var isFloatRegexp = /^(\d*\.)?\d+$/;

        if (isNaN(num) || !isFloatRegexp.test(str)) {
            this.setState({errorA:'Invalid'});
        } else if (num < 0) { // Ensure amount is greater than 0.01
            this.setState({errorA:'Too Low'});
        } else if (helpers.getPrecision(num) > 1){
            this.setState({errorA:'Too Precise'});
        }else {
            this.setState({amount:str, errorA:null});
        }
       this.forceUpdate();
     },
     _updateKelly: function(e){
       var str = e.target.value;
       var num = parseFloat(str, 10);
       var isFloatRegexp = /^(\d*\.)?\d+$/;

       if (isNaN(num) || !isFloatRegexp.test(str)) {
            this.setState({error:'Invalid'});
        } else if (num < 0.5) { // Ensure amount is greater than 0.01
            this.setState({error:'Too Low'});
        } else if (helpers.getPrecision(num) > 1){
            this.setState({error:'Too Precise'});
        }else {
            this.setState({set_kelly:str, error:null});
        }
       this.forceUpdate();
     },
     _onSetKelly: function(){
        console.log('set kelly: ' + this.state.set_kelly);
        //'Set_Kelly'
         var k_params = {
              //uname: this.state.uname,
              kelly: (this.state.set_kelly/100),
              token2fa: this.state.auth
          };
          console.log('[Socket] Set_Kelly');
          socket.emit('Set_Kelly', k_params, function(err, data){
            if (err){
              alert('Error Set_Kelly: ');
            }else{
              console.log('[socket] success Set_Kelly', data);  
              Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
            }
          });
     },
     _onClick_invest: function(){
        console.log('invest doge: ' + this.state.amount);
        var inv_params = {
              //uname: this.state.uname,
              amount: this.state.amount,
              token2fa: this.state.auth
          };
          console.log('[Socket] Invest_Doge');
          socket.emit('Invest_Doge', inv_params, function(err, data){
            if (err){
              alert('Error Invest_Doge: ' + JSON.stringify(err));
            }else{
              console.log('[socket] success Invest_Doge', data);  
              Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
            }
          });

     },
     _onClick_divest: function(){
        console.log('divest doge: ' + this.state.amount);
        var inv_params = {
              //uname: this.state.uname,
              amount: this.state.amount,
              token2fa: this.state.auth
          };
          console.log('[Socket] Divest_Doge');
          socket.emit('Divest_Doge', inv_params, function(err, data){
            if (err){
              alert('Error Divest_Doge: ' + JSON.stringify(err));
            }else{
              console.log('[socket] success Divest_Doge', data);  
              Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
            }
          });

     },
      render: function() {
        var app_invested = 0;
        var app_wager = 0;
        var app_invest_profit = 0;
        var app_max_profit = 0;
        var user_invested = 0;
        var user_profit = 0;
        var user_share = 0;

        if(worldStore.state.doge_invest_app.invested){
          app_invested = worldStore.state.doge_invest_app.invested.toFixed(2);
          app_wager = worldStore.state.doge_invest_app.total_wager.toFixed(2);
          app_invest_profit = worldStore.state.doge_invest_app.investorprofit.toFixed(2);
          app_max_profit = worldStore.state.doge_invest_app.maxprofit.toFixed(2);
          if (worldStore.state.doge_invest_user.invested){
            user_invested = worldStore.state.doge_invest_user.invested.toFixed(2);
            user_profit =  worldStore.state.doge_invest_user.profit.toFixed(2);
            user_share = (((worldStore.state.doge_invest_user.invested * worldStore.state.doge_invest_user.kelly)/worldStore.state.doge_invest_app.maxprofit) * 100).toFixed(2); 
          }
        }

        /**
         * el.div(null,
                'Invested: ',
                el.span(null, worldStore.state.doge_invest_app.invested.toFixed(2))
              ),
              el.div(null,
                'Wagered: ',
                 el.span(null, worldStore.state.doge_invest_app.total_wager.toFixed(2))
              ),
              el.div(null,
                'Profit: ',
                el.span(null, worldStore.state.doge_invest_app.investorprofit.toFixed(2))
              ),
              el.div(null,
                'Max Profit Per Bet: ',
                el.span(null, worldStore.state.doge_invest_app.maxprofit.toFixed(2))
              ),
              el.hr(null),
              el.div(null,
                'Your Invested: ',
                el.span(null, worldStore.state.doge_invest_user.invested.toFixed(2))
              ),
              el.div(null,
                'Your Profit: ',
                el.span(null, worldStore.state.doge_invest_user.profit.toFixed(2))
              ),
              el.div(null,
                'Kelly: ',
                el.span(null, (worldStore.state.doge_invest_user.kelly * 100) + '%')
              ),
              el.div(null,
                'Your Bankroll Share: ',
                el.span(null, (((worldStore.state.doge_invest_user.invested * worldStore.state.doge_invest_user.kelly)/worldStore.state.doge_invest_app.maxprofit) * 100).toFixed(2) + '%')
         */

        var innerNode;
         innerNode = el.div({className:'row'},
                      el.div({className:'col-xs-12 col-sm-6'},
                        el.div({className:'row'},
                          el.div({className: 'form-group col-xs-9'},
                            el.div({className: 'input-group'},
                              el.span({className: 'input-group-addon'},'Kelly'),
                              el.input({
                                  type: 'text',
                                  value: this.state.set_kelly,
                                  style : {fontWeight: 'bold'},
                                  className: 'form-control input-sm',
                                  onChange: this._updateKelly
                                }
                              )
                            )
                          ),
                          el.span({classname: 'col-xs-2'},
                            el.button(
                              {
                                className: 'btn btn-default btn-sm',
                                type: 'button',
                                onClick: this._onSetKelly,
                                disabled: this.state.error
                              },
                              'Update'
                            )
                          )
                        ),                
                      el.div({className: 'form-group'},
                          el.div({className: 'input-group'},
                            el.span({className: 'input-group-addon'},'Amount'),
                            el.input({
                                type: 'text',
                                value: this.state.amount,
                                style : {fontWeight: 'bold'},
                                className: 'form-control input-sm',
                                onChange: this._updateAmount
                              }
                            )
                        ),
                        el.div({className:'btn-group btn-group-justified'},
                          el.div({className:'btn-group'},
                            el.button({
                              className:'btn btn-default btn-sm',
                              onClick: this._onClick_invest
                            },
                            'Invest'
                            )
                          ),
                          el.div({className:'btn-group'},
                            el.button({
                              className:'btn btn-default btn-sm',
                              onClick: this._onClick_divest
                            },
                            'Divest'
                            )
                          )
                        )
                      ),
                  el.div({className: 'form-group'},
                    el.div({className: 'input-group'},
                      el.span({className: 'input-group-addon'},'2fa'),
                      el.input({
                          type: 'text',
                          value: this.state.auth,
                          style : {fontWeight: 'bold'},
                          className: 'form-control input-sm',
                          onChange: this._update2fa
                        }
                      )
                  )
                )
            ),
            /**
             * app_invested = 0;
        var app_wager = 0;
        var app_invest_profit = 0;
        var app_max_profit = 0;
        var user_invested = 0;
        var user_profit = 0;
        var user_share = 0;
             */
            el.div({className:'col-xs-12 col-sm-6'},
              el.div(null,
                'Invested: ',
                el.span(null, app_invested)
              ),
              el.div(null,
                'Wagered: ',
                 el.span(null, app_wager)
              ),
              el.div(null,
                'Profit: ',
                el.span(null, app_invest_profit)
              ),
              el.div(null,
                'Max Profit Per Bet: ',
                el.span(null, app_max_profit)
              ),
              el.hr(null),
              el.div(null,
                'Your Invested: ',
                el.span(null, user_invested)
              ),
              el.div(null,
                'Your Profit: ',
                el.span(null, user_profit)
              ),
              el.div(null,
                'Kelly: ',
                el.span(null, (worldStore.state.doge_invest_user.kelly * 100) + '%')
              ),
              el.div(null,
                'Your Bankroll Share: ',
                el.span(null, user_share + '%')
              )
            )
          )
        
        return el.div(null,
          el.div({className:"modal fade", id:"investModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Invest Doge')
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    });


var DogeModal = React.createClass({
     displayName: 'DogeModal',
     _onStoreChange: function() {
       this.forceUpdate();
     },
     componentDidMount: function() {
       worldStore.on('change', this._onStoreChange);
     },
     componentWillUnmount: function() {
       worldStore.off('change', this._onStoreChange);
     },
     _onClick_login: function(){
        $('#dogeModal').modal('hide');
        $('#loginModal').modal('show');
     },
     _onClick_create: function(){
        $('#dogeModal').modal('hide');
        $('#createModal').modal('show');
     },
     _onClick_settings: function(){
        $('#dogeModal').modal('hide');
        $('#settingsModal').modal('show');
     },
     _onClick_invest: function(){
        Dispatcher.sendAction('GET_DOGE_INVESTMENTS', null);
        $('#dogeModal').modal('hide');
        Dispatcher.sendAction('CHANGE_TAB', 'INVEST');
        setTimeout(function(){
          location.href = "#";
          location.href = "#inv_tab";
        },250);
     },
     _onClick_logout: function(){
        socket.emit('Logout_Doge', function(err, data){
            if (err){
              alert('Error Logout_Doge: ');
            }else{
              console.log('[socket] success Logout_Doge', data);  
              Dispatcher.sendAction('CHANGE_COIN_TYPE', 'BTC');
              localStorage.removeItem('doge_token');
              $('#dogeModal').modal('hide');
              Dispatcher.sendAction('START_REFRESHING_USER');
            }
          });        
     },
      render: function() {
        var innerNode;
        if (worldStore.state.user){
          if (worldStore.state.user.dogelogin){
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6 col-sm-4 col-md-3 col-lg-3'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_invest},'Invest')
              ),
              el.div({className:'col-xs-6 col-sm-4 col-md-3 col-lg-3'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_settings},'Settings')
              ),
              el.div({className:'col-xs-6 col-sm-4 col-md-3 col-lg-3'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_logout},'Log Out')
              )
            )
          }else{
            innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_login},'Login'),
              ),
            worldStore.state.user.dogeuser ? '': el.div({className:'col-xs-6'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_create},'Create User')
              )
            )
          }
        }else{
          innerNode = el.div({className:'row'},
              el.div({className:'col-xs-6'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_login},'Login'),
              ),
              el.div({className:'col-xs-6'},
                el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_create},'Create User')
              )
            )
        }
        return el.div(null,
          el.div({className:"modal fade", id:"dogeModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
            el.div({className:"modal-dialog", role:"document"},
              el.div({className:"modal-content"},
                el.div({className:"modal-header"},
                  el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                    el.span({'aria-hidden':"true"},
                    el.span({className:'glyphicon glyphicon-remove'})
                    )
                  ),
                  el.h4({className:'modal-title', id:'myModalLabel'},'Bit-Exo Account')
                ),
                el.div({className:"modal-body"},
                innerNode
                ),
                el.div({ className:"modal-footer"},
                 el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                )
              )
            )
          )
        );
      }
    }); 


    var MpModal = React.createClass({
      displayName: 'MpModal',
      _onStoreChange: function() {
        this.forceUpdate();
      },
      componentDidMount: function() {
        worldStore.on('change', this._onStoreChange);
      },
      componentWillUnmount: function() {
        worldStore.off('change', this._onStoreChange);
      },
      _onClick_login: function(){
         $('#mpModal').modal('hide');
        /**
         * config.mp_browser_uri + '/oauth/authorize' +
                '?app_id=' + config.app_id +
                '&redirect_uri=' + config.redirect_uri + '&response_type=confidential'
         */
        window.location = config.mp_browser_uri + '/oauth/authorize?app_id=' + config.app_id + '&redirect_uri=' + config.redirect_uri + '&response_type=confidential'
      },
      _onClick_create: function(){
         $('#mpModal').modal('hide');
         $('#createMPModal').modal('show');
      },
      _onClick_loginBXO:function(){
        $('#mpModal').modal('hide');
        $('#loginModal').modal('show');
      },

       render: function() {
        /* var innerNode;
         innerNode = el.div({className:'row'},
               el.div({className:'col-xs-6'},
                 el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_login},'Login'),
               ),
               el.div({className:'col-xs-6'},
                 el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_create},'Create User')
               )
             )
             */
         return el.div(null,
           el.div({className:"modal fade", id:"mpModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
             el.div({className:"modal-dialog", role:"document"},
               el.div({className:"modal-content"},
                 el.div({className:"modal-header"},
                   el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                     el.span({'aria-hidden':"true"},
                     el.span({className:'glyphicon glyphicon-remove'})
                     )
                   ),
                   el.h4({className:'modal-title', id:'myModalLabel'},'Account Login / Registration')
                 ),
                 el.div({className:"modal-body"},
                  el.h6({style:{marginBottom:'5px'}},'Registering with Moneypot and Bit-Exo'),
                  el.p(null, 'Bit-Exo is an app that works with ',
                     el.span(null, el.a({href:'https://www.moneypot.com',target: '_blank'},'MoneyPot.com'),
                      el.span(null, ' to provide a wide variety of games in many supported curriences. Register with Moneypot to play or invest with BTC, LTC, ETH, DASH, ADK, GRLC, WAVES, or MBI. Additionally you can register with Bit-Exo to play or invest with DOGE, CLAM, XMR, and BXO (You must register with moneypot first)')
                    )
                  ),
                  el.div({className:'well well-sm'},
                    el.div({className:'row'},
                    el.div({className:'col-xs-12 col-sm-5 col-md-4'},
                        el.img({src:"./res/mp_400x400.jpg", height:"150", width:"150"})
                    ),
                    el.div({className:'col-xs-12 col-sm-7 col-md-8'},
                      el.div({className:'col-xs-12 col-md-6'},
                        el.button({type:'button', className:'btn btn-small btn-default',style:{marginBottom:'5px'}, onClick: this._onClick_login},'Login with Moneypot'),
                      ),
                      el.div({className:'col-xs-12 col-md-6'},
                        el.button({type:'button', className:'btn btn-small btn-default',style:{marginBottom:'5px'}, onClick: this._onClick_create},'Register with Moneypot')
                      )
                    )
                  )
                  ),
                  el.div({className:'well well-sm'},
                  el.div({className:'row'},
                    el.div({className:'col-xs-12 col-sm-5 col-md-4'},
                        el.img({src:"./res/logobxo.png", height:"150", width:"150"})
                    ),
                    el.div({className:'col-xs-12 col-sm-7 col-md-8'},
                      el.div({className:'col-xs-12 col-md-6',display:'inline-block','vertical-align':'middle'},
                        el.button({type:'button', className:'btn btn-small btn-default',style:{marginBottom:'5px'}, onClick: this._onClick_loginBXO},'Login with Bit-Exo'),
                      ),
                      el.div({className:'col-xs-12 col-md-6',display:'inline-block','vertical-align':'middle'},
                        el.button({type:'button', className:'btn btn-small btn-default',style:{marginBottom:'5px'}, onClick: this._onClick_create},'Register with Moneypot')
                      )
                    )
                  )
                  )
                 ),
                 el.div({ className:"modal-footer"},
                  el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                 )
               )
             )
           )
         );
       }
     });

     var CreateMpModal = React.createClass({
      displayName: 'CreateUserModal',
      _onStoreChange: function() {
        this.forceUpdate();
      },
      componentDidMount: function() {
        worldStore.on('change', this._onStoreChange);
      },
      componentWillUnmount: function() {
        worldStore.off('change', this._onStoreChange);
      },
      getInitialState: function() {
       return {uname:'', email:'', password:'', password_verify:'', terms:false, sync:true};
      },
      _onUnameChange: function(e){
        var str = e.target.value;
        this.setState({uname:str});
        this.forceUpdate();
      },
      _onEmailChange: function(e){
        var str = e.target.value;
        this.setState({email:str});
        this.forceUpdate();
      },
      _updatePass: function(e){
        var str = e.target.value;
        this.setState({password:str});
        this.forceUpdate();
      },
      _updatePassV: function(e){
        var str = e.target.value;
        this.setState({password_verify:str});
        this.forceUpdate();
      },
      _onClickTerms:function(){
        this.setState({terms:!this.state.terms});
        this.forceUpdate();
      },
      _onClickSync:function(){
        this.setState({sync:!this.state.sync});
        this.forceUpdate();
      },
      _onClick_create: function(){
        var create_params = {
           uname: this.state.uname,
           email: this.state.email,
           password: this.state.password,
           terms: this.state.terms,
           sync: this.state.sync
       };
       console.log('Creating New Moneypot Account');
       socket.emit('Create_Moneypot_Account', create_params, function(err, data){
         if (err){
           alert('Error Creating User: ' + JSON.stringify(err));
         }else{
           console.log('[socket] success creating new moneypot account ', data);  
           if (data){
            if (data.callback_url){
              window.location = data.callback_url;
            }else{
               Dispatcher.sendAction('UPDATE_USER', data.user);
               expires_at = new Date(Date.now() + (604800 * 1000));
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('expires_at', expires_at);
               gethashfromsocket();
               //  Dispatcher.sendAction('SET_NEXT_HASH', data.hash);
               //var qrcode = new QRCode(document.getElementById("qrcode"), {text: data.user.dogeaddress, width: 90, height: 90});
               $('#createMPModal').modal('hide');
              // $('#depositModal').modal('show');
              }
           }
         }
       });
      },
      _onKeyPress: function(e) {
       var ENTER = 13;
         if (e.which === ENTER) {
          if ((this.state.password_verify != this.state.password )|| (this.state.password.length < 8)||(this.state.uname.length < 3)) {
            console.log('forms incomplete');
          }else{
           this._onClick_create();
          }
         }
       },
       render: function() {
         var result = owaspPasswordStrengthTest.test(this.state.password);

          /*
         if (this.state.password.length < 8){
           result = 'Password must be at least 8 characters';
         }else if (this.state.password_verify != this.state.password){
           result = 'Passwords do not match';
         }
         */
         //this.setState({result:result});
         var innerNode;
        //var self = this;
             innerNode = el.div({className:'row'},
               el.div({className:'col-xs-12 col-sm-9 col-lg-6'},
                 el.div({className: 'form-group'},
                     el.div({className: 'input-group'},
                       el.span({className: 'input-group-addon'},'User Name'),
                       el.input({
                           type: 'text',
                           value: this.state.uname,
                           style : {fontWeight: 'bold'},
                           className: 'form-control input-sm',
                          // disabled: true,
                           onChange: this._onUnameChange
                         }
                       )
                   )
                 ),
                 el.div({className: 'form-group'},
                     el.div({className: 'input-group'},
                       el.span({className: 'input-group-addon'},'Email'),
                       el.input({
                           type: 'text',
                           value: this.state.email,
                           style : {fontWeight: 'bold'},
                           className: 'form-control input-sm',
                           onChange: this._onEmailChange,
                           onKeyPress: this._onKeyPress
                         }
                       ),
                       el.span({className:'input-group-addon'},'Optional')
                   )
                 ),
                 el.div({className: 'form-group'},
                     el.div({className: 'input-group'},
                       el.span({className: 'input-group-addon'},'Password'),
                       el.input({
                           type: 'password',
                           value: this.state.password,
                           style : {fontWeight: 'bold'},
                           className: 'form-control input-sm',
                           onChange: this._updatePass,
                           onKeyPress: this._onKeyPress
                         }
                       ),
                       el.span({className:'input-group-addon glyphicon ' + (result.errors[0] ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (result.errors[0] ? 'red': 'green')}})
                  ),
                  result.errors[0] ? el.div({className:'text'},result.errors[0]) : ''
                 ),
                 el.div({className: 'form-group'},
                     el.div({className: 'input-group'},
                       el.span({className: 'input-group-addon'},'Verify Pass'),
                       el.input({
                           type: 'password',
                           value: this.state.password_verify,
                           style : {fontWeight: 'bold'},
                           className: 'form-control input-sm',
                           onChange: this._updatePassV,
                           onKeyPress: this._onKeyPress
                         }
                       ),
                       el.span({className:'input-group-addon glyphicon ' + (this.state.password_verify != this.state.password ? 'glyphicon-remove': 'glyphicon-ok'), style: {color: (this.state.password_verify != this.state.password ? 'red': 'green')}})
                   ),
                   this.state.password_verify != this.state.password ? el.div({className:'text'},'Passwords do not match') : ''
                 ),
                 el.div({className:'col-xs-12'},
                  el.input(
                      {
                      //id: 'checkboxStyle',
                      //name: 'numberOfBet',
                      type: 'checkbox',
                      defaultChecked: (this.state.terms == true ? 'checked':''),
                      onChange: this._onClickTerms,
                      value: 'false'
                      }
                    ),
                  el.span(null, 'By registering you agree to Moneypots ',
                  el.a({href:'https://www.moneypot.com/user-agreement',target: '_blank'},'User Agreement'),
                  el.span(null,' and ',
                   el.a({href:'https://www.moneypot.com/privacy-policy',target: '_blank'},'Privacy Policy'),
                  )
                  )  
                ),
                el.div({className:'col-xs-12'},
                  el.input(
                      {
                      //id: 'checkboxStyle',
                      //name: 'numberOfBet',
                     // className:'custom-control-input',
                      type: 'checkbox',
                      defaultChecked: (this.state.sync == true ? 'checked':''),
                      onChange: this._onClickSync,
                      value: 'true'
                      }
                    ),
                  el.span(null, ' Automatically create a Bit-Exo account with same details as moneypot to play DOGE,BXO and CLAM')  
                ),
                 el.button({type:'button', className:'btn btn-small btn-default', onClick: this._onClick_create, disabled: result.errors[0] || this.state.password_verify != this.state.password || this.state.password.length < 8 || this.state.terms == false},'Create User')//,
                 //el.div({id:"qrcode"})
               )
             )

         return el.div(null,
           el.div({className:"modal fade", id:"createMPModal", tabindex:"-1", role:"dialog", "aria-labelledby":"myModalLabel"},
             el.div({className:"modal-dialog", role:"document"},
               el.div({className:"modal-content"},
                 el.div({className:"modal-header"},
                   el.button({type:"button", className:"close", 'data-dismiss':"modal", 'aria-label':"Close"},
                     el.span({'aria-hidden':"true"},
                     el.span({className:'glyphicon glyphicon-remove'})
                     )
                   ),
                   el.h4({className:'modal-title', id:'myModalLabel'},'Register with Moneypot')
                 ),
                 el.div({className:"modal-body"},
                  innerNode
                 ),
                 el.div({ className:"modal-footer"},
                  el.button({type:"button", className:"btn btn-default", "data-dismiss":"modal"},'Close')
                 )
               )
             )
           )
         );
       }
     });

var el = React.DOM;

var App = React.createClass({
  displayName: 'App',
  _onStoreChange: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    worldStore.on('show_chart', this._onStoreChange);
    chatStore.on('toggle_chat', this._onStoreChange);
  },
  componentWillUnmount: function() {
    worldStore.off('show_chart', this._onStoreChange);
    chatStore.off('toggle_chat', this._onStoreChange);
  },

  render: function() {
    return el.div(
      {className: 'container-fluid'},
      // Navbar
      React.createElement(DogeModal, null),
      React.createElement(MpModal, null),
      React.createElement(LoginModal, null),
      React.createElement(CreateUserModal, null),
      React.createElement(CreateMpModal, null),
      React.createElement(SettingsModal, null),
      React.createElement(DepositModal, null),
     // React.createElement(DepositModalBXO, null),
     // React.createElement(DepositModalCLAM, null),
      React.createElement(WithdrawModal, null),
      React.createElement(Auth2faModal, null), 
    //  React.createElement(InvestModal, null),

      React.createElement(Navbar, null),
      React.createElement(Newsbar, null),
      worldStore.state.ShowChart ? React.createElement(GameChart, null):'',
      el.div({className:'row'},
        el.div({className:'col-xs-12 col-lg-7 Game_Box'},
          React.createElement(GameBox, null)
        ),
        chatStore.state.showChat ? el.div({className:'col-xs-12 col-lg-5'}, //chatStore.state.showChat
          React.createElement(ChatBox, null)
        ) : el.div({className:'col-xs-12 col-lg-2 col-lg-offset-3'}, //chatStore.state.showChat
          React.createElement(ShowChat, null)
        ) ,
        // Tabs
        el.div(
          {className:'col-xs-12', style: {marginTop: '10px'}},
          React.createElement(Tabs, null)
        ),
        // Tab Contents
        el.div(
        {className:'col-xs-12'},
        React.createElement(TabContent, null)
      ),
        // Footer
        React.createElement(Footer, null)
      )
    );;
  }
});


ReactDOM.render(
  React.createElement(App, null),
  document.getElementById('app')
);

////////////////////
//GETHASH
function gethashfromsocket(){
  if ((worldStore.state.coin_type == 'DOGE')||(worldStore.state.coin_type == 'BXO')||(worldStore.state.coin_type == 'CLAM')){

    console.log('[socket] getting doge hash for: ' + worldStore.state.user.uname);
    var req_data;
    socket.emit('Get_Doge_Hash', function(err, data) {
      if (err) {
        console.log('[socket] doge hash error:', err);
        return;
      }
      console.log('[socket] doge hash success:', data);
      Dispatcher.sendAction('SET_NEXT_HASH', data);
    });

  }else{
    console.log('[socket] getting hash for: ' + worldStore.state.user.uname);
    var req_data;
    socket.emit('get_hash', req_data, function(err, data) {
      if (err) {
        console.log('[socket] hash error:', err);
        return;
      }
      console.log('[socket] hash success:', data);
      Dispatcher.sendAction('SET_NEXT_HASH', data.bet_hash);
    });
  }

}


////////////////////////////////////////////////////////////
// Hook up to chat server

function connectToChatServer() {
  if(config.debug){console.log('Connecting to chat server. AccessToken:',
              worldStore.state.accessToken);}

  socket = io(config.be_uri,{reconnectionAttempts:3});

  socket._connectTimer = setTimeout(function() {
    console.log('socket timedout stopping call for socket');
    socket.close();
    //TODO flag socket error
   // setTimeout(function(){connectToChatServer();},25000);
  }, 10000);

  socket.on('connect', function() {
    console.log('[socket] Connected');
    clearTimeout(socket._connectTimer);

    Dispatcher.sendAction('Set_Connection', 'CONNECTED');
    
    var authPayload = {
      app_id: config.app_id,
      access_token: worldStore.state.accessToken,
      json_token: worldStore.state.json_token,
      room: chatStore.state.chat_room
    };

    socket.emit('chat_init', authPayload, function(err, data) {
      if (err) {
        console.log('[socket] chat_init failure:', err);
        return;
      }
      if(config.debug){console.log('[socket] chat_init success:', data);}
      
      if(!!chatStore.state.loadingInitialMessages){ //was not connected to chat before
        if((data.user != undefined)&&(data.user != null)&&(data.user != 'no user')){
          Dispatcher.sendAction('UPDATE_USER',data.user.user);
          if (data.user.pkruname){
            Dispatcher.sendAction('UPDATE_TEMP_POKER', {Player: data.user.user.pkruname});  
          }else{
            Dispatcher.sendAction('UPDATE_TEMP_POKER', {Player: data.user.user.uname});
          }
          if (!betStore.state.nextHash){
            gethashfromsocket();
          }
          if(localStorage.refname){
            var ref = localStorage.refname;
            Dispatcher.sendAction('SET_REFER_NAME', ref);
          }
          socket.emit('get_user_pms', function(err, data) {
            if (err) {
              if(config.debug){console.log('[socket] get_user_pms failure:', err);}
              return;
            }
            if(config.debug){console.log('[socket] get_user_pms success:', data);}
            if(data != null){
                data.map(function(message){
                  if (worldStore.state.user.open_pm){
                    for (x = 0; x < worldStore.state.user.open_pm.length; x++){
                      if ((message.receiver == worldStore.state.user.open_pm[x])||(message.user.uname == worldStore.state.user.open_pm[x])){
                          Dispatcher.sendAction('NEW_MESSAGE', message);
                      }
                    }
                  }
                });
              }
          });
        }/* else if (localStorage.doge_token) {
          console.log('Attempting to login with doge token');
          var doge_token = localStorage.doge_token;
          socket.emit('Check_Doge_Token', doge_token, function(err, data){
            if (err){
              console.log('Error Check Doge Token: ', err);
            }else{
              Dispatcher.sendAction('CHANGE_COIN_TYPE','DOGE');
              console.log('User Loaded from doge token: ', data)
              Dispatcher.sendAction('UPDATE_USER',data);
            }
          });
        }*/
        console.log('Intializing Chat');

        Dispatcher.sendAction('INIT_CHAT', data);

        Dispatcher.sendAction('STOP_LOADING');
        Dispatcher.sendAction('UPDATE_APP_INFO');
        Dispatcher.sendAction('UPDATE_BANKROLL');
        Dispatcher.sendAction('GET_NEWS_INFO');
        Dispatcher.sendAction('GET_WEEKLY_WAGER');

        socket.emit('list_all_bets', function(err, data) {
          if (err) {
            if(config.debug){console.log('[socket] list_all_bets failure:', err);}
            return;
          }
          if(config.debug){console.log('[socket] list_all_bets success:', data);}
          if(data != null)
            {
              Dispatcher.sendAction('INIT_ALL_BETS', data);
            }
        });

      }else {
        console.log('reconnected to chat');
      }
    });//END CHAT INIT


    if(worldStore.state.currTab == 'ALL_BETS'){
      socket.emit('join_ALL_BETS');
    }

  });

  socket.on('disconnect', function() {
    //TODO flag socket error
    console.log('[socket] Disconnected');
    Dispatcher.sendAction('Set_Connection', 'DISCONNECTED');
  });

  socket.on('reconnect_failed', function() {
   // setTimeout(function(){connectToChatServer();},25000);
    //TODO flag socket error
    console.log('[socket] reconnection failed');
    Dispatcher.sendAction('Set_Connection', 'DISCONNECTED');
  });

  // message is { text: String, user: { role: String, uname: String} }
  socket.on('new_message', function(message) {
    console.log('[socket] Received chat message:', message);
    Dispatcher.sendAction('NEW_MESSAGE', message);
  });

  socket.on('user_joined', function(user) {
    console.log('[socket] User joined:', user);
    Dispatcher.sendAction('USER_JOINED', user);
  });

  // `user` is object { uname: String }
  socket.on('user_left', function(user) {
    console.log('[socket] User left:', user);
    Dispatcher.sendAction('USER_LEFT', user);
  });

  socket.on('new_all_bet', function(betarray) {
    if(config.debug){console.log('[socket] NEW_ALL_BET');}
      Dispatcher.sendAction('NEW_ALL_BET', betarray);
  });
  socket.on('new_news_info', function(data) {
    Dispatcher.sendAction('UPDATE_NEWS_INFO',data);
  });
  
  socket.on('update_slots_go', function(data) {
    Dispatcher.sendAction('UPDATE_SLOTS_GO',data);
  });
  // Received when your client doesn't comply with chat-server api
  socket.on('client_error', function(text) {
    console.warn('[socket] Client error:', text);
  });


}

connectToChatServer();

$(function () {
  $('[data-toggle="popover"]').popover();
});

// This function is passed to the recaptcha.js script and called when
// the script loads and exposes the window.grecaptcha object. We pass it
// as a prop into the faucet component so that the faucet can update when
// when grecaptcha is loaded.
function onRecaptchaLoad() {
  Dispatcher.sendAction('GRECAPTCHA_LOADED', grecaptcha);
}

$(document).on('keydown', function(e) {
  var H = 72, L = 76, C = 67, X = 88, A = 65, S = 83, D = 68, F = 70, G = 71, SPACE = 32, keyCode = e.which;

  // Bail is hotkeys aren't currently enabled to prevent accidental bets
  if (!worldStore.state.hotkeysEnabled) {
    return;
  }

  // Bail if it's not a key we care about
  if (keyCode !== H && keyCode !== L && keyCode !== X && keyCode !== C && keyCode !== A && keyCode !== S && keyCode !== D && keyCode !== F && keyCode !== G && keyCode !== SPACE) {
    return;
  }

  // TODO: Remind self which one I need and what they do ^_^;;
  e.stopPropagation();
  e.preventDefault();

  switch(keyCode) {
    case C:  // Increase wager
      if (((worldStore.state.currGameTab == 'PLINKO')||(worldStore.state.currGameTab == 'DICE')||(worldStore.state.currGameTab == 'SLIDERS')||(worldStore.state.currGameTab == 'SLOTS')||(worldStore.state.currGameTab == 'BITSWEEP')||(worldStore.state.currGameTab == 'BITCLIMBER'))&&(betStore.state.BS_Game.state != 'RUNNING')){
      var n = worldStore.state.coin_type === 'BITS' ? (betStore.state.wager.num * 2).toFixed(2) : (betStore.state.wager.num * 2).toFixed(8);
      Dispatcher.sendAction('UPDATE_WAGER', { str: n.toString() });
      }else if (worldStore.state.currGameTab == 'WONDERW'){
        $('#WW-Double').click();
      }else{
        $('#RT-DOUBLE').click();
      }
      break;
    case X:  // Decrease wager
      if (((worldStore.state.currGameTab == 'PLINKO')||(worldStore.state.currGameTab == 'DICE')||(worldStore.state.currGameTab == 'SLIDERS')||(worldStore.state.currGameTab == 'SLOTS')||(worldStore.state.currGameTab == 'BITSWEEP')||(worldStore.state.currGameTab == 'BITCLIMBER'))&&(betStore.state.BS_Game.state != 'RUNNING')){
      var newWager = worldStore.state.coin_type === 'BITS' ? (betStore.state.wager.num / 2).toFixed(2) : (betStore.state.wager.num / 2).toFixed(8);
      Dispatcher.sendAction('UPDATE_WAGER', { str: newWager.toString() });
      }else if (worldStore.state.currGameTab == 'WONDERW'){
        $('#WW-Half').click();
      }else{
        $('#RT-HALF').click();
      }
      break;
    case L:  // Bet lo
      $('#bet-lo').click();
      break;
    case H:  // Bet hi
      $('#bet-hi').click();
      break;
    case A:  // Bet ROW1
      $('#bet-ROW1').click();
      break;
    case S:  // Bet ROW2
      $('#bet-ROW2').click();
      break;
    case D:  // Bet ROW3
      $('#bet-ROW3').click();
      break;
    case F:  // Bet ROW4
      $('#bet-ROW4').click();
      break;
    case G:  // Bet ROW5
      $('#bet-ROW5').click();
      break;
    case SPACE: //SPIN ROULETTE
      if (worldStore.state.currGameTab == 'ROULETTE'){
      $('#RT-SPIN').click();
      }else if (worldStore.state.currGameTab == 'BITSWEEP'){
      $('#BS-START').click();
    }else if (worldStore.state.currGameTab == 'SLOTS'){
      $('#SL-START').click();
    }else if (worldStore.state.currGameTab == 'BITCLIMBER'){
      $('#BC-START').click();
    }else if (worldStore.state.currGameTab == 'SLIDERS'){
      $('#sld-bet').click();
    }else if (worldStore.state.currGameTab == 'WONDERW'){
      $('#WW-START').click();
    }
      break;
    default:
      return;
  }
});

window.addEventListener('message', function(event) {
  if (event.origin === config.mp_browser_uri && event.data === 'UPDATE_BALANCE') {
    Dispatcher.sendAction('START_REFRESHING_USER');
  }
}, false);
window.setInterval(function(){
    if ((worldStore.state.user) && (!AutobetStore.state.Run_Autobet)){
     // if (worldStore.state.coin_type == 'DOGE'){
     //   if (worldStore.state.user.dogelogin){
     //     console.log('refresh for under doge');
     //     Dispatcher.sendAction('START_REFRESHING_USER');
     //   }
   // }else{
       // console.log('refresh for under mp');
        Dispatcher.sendAction('START_REFRESHING_USER');
     // }
  /*  if (!betStore.state.nextHash){
        gethashfromsocket();
      }*/
    }
 }, 15000);

 window.setInterval(function(){
   Dispatcher.sendAction('UPDATE_APP_INFO');
  // Dispatcher.sendAction('GET_BTC_TICKER');
   if ((worldStore.state.user) && (!AutobetStore.state.Run_Autobet)){
   //Dispatcher.sendAction('START_REFRESHING_USER');
   if (!betStore.state.nextHash){
       gethashfromsocket();
     }
   }
},60000);


(function($) {
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);


$('#myModal').modal('show');

