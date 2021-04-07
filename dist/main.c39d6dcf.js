// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"Exploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Exploration.ts
//
// This might be something a little more interesting
var Exploration =
/** @class */
function () {
  function Exploration(canvas) {
    this.paused = false;
    this.updateTime = 1000;
    this.lastUpdated = Date.now();
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.components = [];
    this.outputComponents = []; // TS-safe way of putting a random debug name

    var id = Math.floor(Math.random() * 1e6);
    Object.defineProperty(window, "exploration" + id, {
      value: this
    });
    console.log(id, this);
  } // todo: addComponent() maybe?


  Exploration.prototype.render = function () {
    var _a;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.components.length; i++) {
      this.context.save(); // render wires first

      var comp = this.components[i];

      for (var j = 0; j < comp.inputWires.length; j++) {
        var position = {
          x: comp.position.x + comp.inputSockets[j].x,
          y: comp.position.y + comp.inputSockets[j].y
        };
        (_a = comp.inputWires[j]) === null || _a === void 0 ? void 0 : _a.render(this.context, position);
      }

      this.components[i].render(this.context);
      this.context.restore();
    }
  };

  Exploration.prototype.onClick = function (canvasX, canvasY) {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      var offsetX = canvasX - component.position.x;
      var offsetY = canvasY - component.position.y;

      if (Math.abs(offsetX) < component.size.x / 2 && Math.abs(offsetY) < component.size.y / 2) {
        component.onClick(offsetX, offsetY);
      }
    } // Right now I have nothing better than re-updating the whole tree


    this.update();
  };

  Exploration.prototype.pause = function () {
    this.paused = true;
    cancelAnimationFrame(this.animationFrame);
  };

  Exploration.prototype.resume = function () {
    this.paused = false;
    this.animationFrame = requestAnimationFrame(this.updateLoop.bind(this));
  };

  Exploration.prototype.updateLoop = function () {
    // Not paused or turned off, and been long enough since last update
    if (!this.paused && this.updateTime > 0 && Date.now() - this.lastUpdated > this.updateTime) {
      this.update();
      this.animationFrame = requestAnimationFrame(this.updateLoop.bind(this));
    }
  };

  Exploration.prototype.update = function () {
    // Recursively loop backwards through the tree
    // stores a hash of component indices because we have to check the same component multiple times
    // We hash anything that is listed as an output component
    var visitedNodes = {};
    var savedState = [];

    for (var i = 0; i < this.outputComponents.length; i++) {
      var comp = this.outputComponents[i];
      var old = [];

      for (var j = 0; j < comp.state.bits.length; j++) {
        old.push(comp.state.bits[j]);
      }

      savedState.push({
        bits: old
      });
    }

    for (var i = 0; i < this.outputComponents.length; i++) {
      this.updateComponent(this.outputComponents[i], visitedNodes, savedState);
    }

    for (var i = 0; i < this.outputComponents.length; i++) {
      console.log("After Update: ", this.outputComponents[i].position, savedState[i].bits, this.outputComponents[i].state.bits);
    }

    console.warn("UPDATE FINISHED");
    this.lastUpdated = Date.now();
  };

  Exploration.prototype.updateComponent = function (component, visitedNodes, savedState) {
    var index = this.components.indexOf(component); // if this gets too slow I can add IDs

    if (!visitedNodes[index]) {
      visitedNodes[index] = true; // prevents infinite loops, although cyclic explorations are invalid anyway
      // has not been visited, so we need to evaluate it
      //console.log("visiting " + String(index), component);

      var parentBits = [];

      for (var i = 0; i < component.inputWires.length; i++) {
        var wire = component.inputWires[i];

        if (wire) {
          var to = wire.toComponent;

          if (!to) {
            parentBits.push(false); // null = 0
          } else {
            this.updateComponent(wire.toComponent, visitedNodes, savedState); // all we need is this one bit
            // (note: null or missing wires give a 0)
            // did we save it?

            var ocIndex = this.outputComponents.indexOf(to);

            if (ocIndex >= 0) {
              //console.log("Using saved state", ocIndex, savedState[ocIndex].bits);
              // Use the stored state instead of updating immediately
              parentBits.push(savedState[ocIndex].bits[wire.toOutput]);
            } else {
              parentBits.push(to.state.bits[wire.toOutput]);
            }
          }
        } else {
          // no wire = 0
          parentBits.push(false);
        }
      } // Update the component's state.


      component.state.bits = component.evaluate(parentBits);
    }
  };

  return Exploration;
}();

;
var _default = Exploration;
exports.default = _default;
},{}],"Wire.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Wire.ts
// not sure a wire really is a component but it uses them
var Wire =
/** @class */
function () {
  function Wire(to, toOutput, waypoints, options) {
    if (waypoints === void 0) {
      waypoints = [];
    }

    if (options === void 0) {
      options = {};
    }

    var _a; // in case you want the wire to bend


    this.waypoints = [];
    this.toComponent = to;
    this.toOutput = toOutput;
    this.waypoints = waypoints;
    this.color = (_a = options.color) !== null && _a !== void 0 ? _a : "#333";
  }

  Wire.prototype.get = function () {
    // empty wire is zero
    if (!this.toComponent) return false; // coerce undefined to false

    return this.toComponent.state.bits[this.toOutput] || false;
  };

  Wire.prototype.addWaypoint = function (x, y) {
    this.waypoints.push({
      x: x,
      y: y
    });
  };

  Wire.prototype.render = function (ctx, from) {
    if (!this.toComponent) return;
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    for (var i = 0; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }

    var endOffset = this.toComponent.outputSockets[this.toOutput];
    ctx.lineTo(endOffset.x + this.toComponent.position.x, endOffset.y + this.toComponent.position.y);
    ctx.stroke();
    ctx.restore();
  };

  return Wire;
}();

var _default = Wire;
exports.default = _default;
},{}],"ChoiceGate.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// RegisterBit.ts
//
// Has an "on" input and an "off" input.
// Does nothing if both are on or both are off.
var ChoiceGate =
/** @class */
function () {
  // bits=8 means an 8-bit plus 8-bit
  function ChoiceGate(x, y, size) {
    if (size === void 0) {
      size = 30;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size * 2,
      y: size
    };
    this.state = {
      bits: [false]
    };
    var offset = size * 0.44;
    this.inputSockets = [{
      x: -this.size.x * 1 / 3,
      y: 0
    }, {
      x: -offset,
      y: -this.size.y / 2
    }, {
      x: +offset,
      y: -this.size.y / 2
    }];
    this.outputSockets = [{
      x: 0,
      y: size / 2
    }];
    this.inputWires = [];
  }

  ChoiceGate.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  ChoiceGate.prototype.render = function (ctx) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.size.x * 1.0, 0);
    ctx.lineTo(this.size.x * 0.67, this.size.y);
    ctx.lineTo(this.size.x * 0.33, this.size.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // red input

    ctx.restore();
  }; // If the "set" input is on, change to the "what" input


  ChoiceGate.prototype.evaluate = function (bits) {
    return [bits[0] ? bits[1] : bits[2]];
  };

  return ChoiceGate;
}();

var _default = ChoiceGate;
exports.default = _default;
},{}],"InputBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// InputBit.ts
// Can be clicked to change state
var InputBit =
/** @class */
function () {
  function InputBit(x, y, value, size) {
    if (value === void 0) {
      value = false;
    }

    if (size === void 0) {
      size = 20;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size,
      y: size
    };
    this.state = {
      active: value,
      bits: [value]
    };
    this.inputSockets = []; // it is input, it needs no input from elsewhere

    this.inputWires = [];
    this.outputSockets = [{
      x: 0,
      y: 0
    }];
  }

  InputBit.prototype.render = function (ctx) {
    if (this.state.active !== this.state.bits[0]) {
      // panic
      throw new Error("[InputBit.render] State does not match bit array");
    }

    ctx.fillStyle = this.state.active ? "#33ff33" : "#990000";
    ctx.strokeStyle = "2px solid black";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size.x / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  ;

  InputBit.prototype.onClick = function (_offsetX, _offsetY) {
    console.log("[InputBit] clicked");
    this.state.active = !this.state.active;
    this.state.bits[0] = this.state.active; // bits will be updated when everything is
  };

  ;

  InputBit.prototype.evaluate = function (_) {
    return [this.state.active];
  };

  return InputBit;
}();

var _default = InputBit;
exports.default = _default;
},{}],"OutputBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// OutputBit.ts
// Need a good way to distinguish from InputBits
var OutputBit =
/** @class */
function () {
  function OutputBit(x, y, size) {
    if (size === void 0) {
      size = 20;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size,
      y: size
    };
    this.state = {
      bits: [false]
    };
    this.inputSockets = [{
      x: 0,
      y: 0
    }]; // this might be convenient

    this.outputSockets = [{
      x: 0,
      y: 0
    }];
    this.inputWires = [];
  }

  OutputBit.prototype.render = function (ctx) {
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.fillStyle = "black";
    ctx.fillRect(left, top, this.size.x, this.size.y);
    ctx.fillStyle = this.state.bits[0] ? "#33ff33" : "#990000";
    ctx.fillRect(left + this.size.x * 0.1, top + this.size.y * 0.1, this.size.x * 0.8, this.size.y * 0.8);
  };

  ;

  OutputBit.prototype.onClick = function (offsetX, offsetY) {
    return;
  };

  ;

  OutputBit.prototype.evaluate = function (bits) {
    //console.log(bits);
    //console.log("evaluating", this.position);
    return bits;
  };

  ;
  return OutputBit;
}();

var _default = OutputBit;
exports.default = _default;
},{}],"Gates.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Not = exports.XorGate = exports.OrGate = exports.AndGate = void 0;

// Gates.ts
var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var Gate =
/** @class */
function () {
  // bits=8 means an 8-bit plus 8-bit
  function Gate(x, y, size, rotation, bits) {
    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size,
      y: size
    };
    this.state = {
      bits: [false]
    };
    this.rotation = rotation * Math.PI / 180;
    var cosine = Math.cos(this.rotation);
    var sine = Math.sin(this.rotation); // transform [±0.3, -0.5]

    if (bits == 2) {
      this.inputSockets = [{
        x: size * (-0.2 * cosine + 0.5 * sine),
        y: size * (-0.5 * cosine - 0.2 * sine)
      }, {
        x: size * (0.2 * cosine + 0.5 * sine),
        y: size * (-0.5 * cosine + 0.2 * sine)
      }];
    } else {
      this.inputSockets = [{
        x: size * 0.5 * sine,
        y: size * -0.5 * cosine
      }];
    }

    this.outputSockets = [{
      x: size * -0.4 * sine,
      y: size * 0.4 * cosine
    }];
    this.inputWires = [];
  }

  Gate.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  Gate.prototype.render = function (ctx) {
    ctx.save(); // base

    ctx.fillStyle = "#cccccc";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation); // draw the wires coming in

    ctx.beginPath();

    if (this.inputSockets.length === 2) {
      ctx.moveTo(this.size.x * -0.2, this.size.y * -0.5);
      ctx.lineTo(this.size.x * -0.2, 0);
      ctx.moveTo(this.size.x * 0.2, this.size.y * -0.5);
      ctx.lineTo(this.size.x * 0.2, 0);
      ctx.stroke();
    }

    this.drawGate(ctx);
    ctx.restore();
  };

  return Gate;
}();

var AndGate =
/** @class */
function (_super) {
  __extends(AndGate, _super);

  function AndGate(x, y, size, degrees) {
    return _super.call(this, x, y, size, degrees, 2) || this;
  }

  AndGate.prototype.drawGate = function (ctx) {
    ctx.beginPath();
    ctx.moveTo(this.size.x * 0.4, -this.size.y * 0.4);
    ctx.lineTo(this.size.x * 0.4, 0);
    ctx.arc(0, 0, this.size.x * 0.4, 0, Math.PI);
    ctx.lineTo(-this.size.x * 0.4, -this.size.y * 0.4);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  ;

  AndGate.prototype.evaluate = function (bits) {
    return [bits[0] && bits[1]];
  };

  ;
  return AndGate;
}(Gate);

exports.AndGate = AndGate;

var OrGate =
/** @class */
function (_super) {
  __extends(OrGate, _super);

  function OrGate(x, y, size, degrees) {
    return _super.call(this, x, y, size, degrees, 2) || this;
  }

  OrGate.prototype.drawGate = function (ctx) {
    var s = this.size.x;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * -0.4);
    ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
    ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.4);
    ctx.quadraticCurveTo(s * 0, s * -0.2, s * 0.4, s * -0.4);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  ;

  OrGate.prototype.evaluate = function (bits) {
    return [bits[0] || bits[1]];
  };

  ;
  return OrGate;
}(Gate);

exports.OrGate = OrGate;

var XorGate =
/** @class */
function (_super) {
  __extends(XorGate, _super);

  function XorGate(x, y, size, degrees) {
    return _super.call(this, x, y, size, degrees, 2) || this;
  }

  XorGate.prototype.drawGate = function (ctx) {
    var s = this.size.x; // do the or's path...

    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * -0.4);
    ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
    ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.4);
    ctx.quadraticCurveTo(s * 0, s * -0.2, s * 0.4, s * -0.4);
    ctx.closePath();
    ctx.stroke();
    ctx.fill(); // and the extra thing

    ctx.beginPath();
    ctx.moveTo(s * -0.4, s * -0.5);
    ctx.quadraticCurveTo(s * 0, s * -0.3, s * 0.4, s * -0.5);
    ctx.stroke();
  };

  ;

  XorGate.prototype.evaluate = function (bits) {
    return [bits[0] !== bits[1]];
  };

  ;
  return XorGate;
}(Gate); // Doesn't extend Gate because it only has 1 input and is smaller


exports.XorGate = XorGate;

var Not =
/** @class */
function (_super) {
  __extends(Not, _super);

  function Not(x, y, size, degrees) {
    return _super.call(this, x, y, size, degrees, 1) || this;
  }

  Not.prototype.drawGate = function (ctx) {
    var s = this.size.y; // wire in

    ctx.beginPath();
    ctx.moveTo(0, s * -0.5);
    ctx.lineTo(0, 0);
    ctx.stroke(); // triangle for the not

    ctx.beginPath();
    ctx.moveTo(0, s * 0.2);
    ctx.lineTo(s * -0.25, s * -0.35);
    ctx.lineTo(s * 0.25, s * -0.35);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, s * 0.3, s * 0.1, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  };

  Not.prototype.render = function (ctx) {
    Gate.prototype.render.call(this, ctx);
  };

  ;

  Not.prototype.onClick = function (offsetX, offsetY) {};

  ;

  Not.prototype.evaluate = function (bits) {
    return [!bits[0]];
  };

  ;
  return Not;
}(Gate);

exports.Not = Not;
},{}],"ChoiceExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _ChoiceGate = _interopRequireDefault(require("./ChoiceGate"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Gates = require("./Gates");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ChoiceExploration
//
// Exploration that shows how a multiplexer works.
// I called it a "choice gate" because "multiplexer" and "multiplier" look too similar.
var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var ChoiceExploration =
/** @class */
function (_super) {
  __extends(ChoiceExploration, _super);

  function ChoiceExploration(canvas) {
    var _this = _super.call(this, canvas) || this;

    var inputChoice = new _InputBit.default(50, 100);
    var inputElse = new _InputBit.default(100, 100);
    var inputIf = new _InputBit.default(150, 100);

    _this.components.push(inputChoice, inputIf, inputElse);

    var inverter = new _Gates.Not(50, 150, 30, 0);

    _this.components.push(inverter);

    inverter.inputWires.push(new _Wire.default(inputChoice, 0)); // recursive components are a bit weird

    var andIf = new _Gates.AndGate(140, 170, 50, 0);
    var andElse = new _Gates.AndGate(80, 200, 50, 0);
    var or = new _Gates.OrGate(100, 250, 50, 0);
    andIf.inputWires = [new _Wire.default(inputChoice, 0, [{
      x: 130,
      y: 125
    }, {
      x: 50,
      y: 125
    }]), new _Wire.default(inputIf, 0, [])];
    andElse.inputWires = [new _Wire.default(inverter, 0, [{
      x: 70,
      y: 170
    }, {
      x: 50,
      y: 170
    }]), new _Wire.default(inputElse, 0, [{
      x: 90,
      y: 170
    }, {
      x: 100,
      y: 170
    }])];
    or.inputWires = [new _Wire.default(andElse, 0, []), new _Wire.default(andIf, 0, [])];

    _this.components.push(andIf, andElse, or);

    var output = new _OutputBit.default(100, 300);
    output.inputWires.push(new _Wire.default(or, 0));

    _this.components.push(output);

    _this.outputComponents.push(output); // the simplified version


    var inputChoice2 = new _InputBit.default(250, 150);
    var inputIf2 = new _InputBit.default(300, 150);
    var inputElse2 = new _InputBit.default(350, 150);
    var choice = new _ChoiceGate.default(300, 200, 40);
    var output2 = new _OutputBit.default(300, 250);
    choice.inputWires.push(new _Wire.default(inputChoice2, 0));
    choice.inputWires.push(new _Wire.default(inputIf2, 0));
    choice.inputWires.push(new _Wire.default(inputElse2, 0));
    output2.inputWires.push(new _Wire.default(choice, 0));

    _this.components.push(inputChoice2, inputIf2, inputElse2, choice, output2);

    _this.outputComponents.push(output2);

    return _this;
  }

  return ChoiceExploration;
}(_Exploration.default);

var _default = ChoiceExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./ChoiceGate":"ChoiceGate.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Gates":"Gates.ts"}],"RegisterBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// RegisterBit.ts
//
// Has an "on" input and an "off" input.
// Does nothing if both are on or both are off.
var RegisterBit =
/** @class */
function () {
  // bits=8 means an 8-bit plus 8-bit
  function RegisterBit(x, y, size) {
    if (size === void 0) {
      size = 30;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size,
      y: size
    };
    this.state = {
      bits: [false]
    }; // [0] is the off switch and [1] is the on switch

    var offset = size * 0.44;
    this.inputSockets = [{
      x: -offset,
      y: -offset
    }, {
      x: offset,
      y: -offset
    }];
    this.outputSockets = [{
      x: 0,
      y: size / 2
    }];
    this.inputWires = [];
  }

  RegisterBit.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  RegisterBit.prototype.render = function (ctx) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = this.state.bits[0] ? "#33ff33" : "#990000";
    ctx.beginPath();
    ctx.moveTo(this.size.x * 0.5, 0);
    ctx.lineTo(this.size.x * 1.0, this.size.y * 0.5);
    ctx.lineTo(this.size.x * 0.5, this.size.y);
    ctx.lineTo(this.size.x * 0.0, this.size.y * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // red input

    ctx.fillStyle = "#ccffff";
    ctx.beginPath();
    ctx.arc(this.size.x * 0.25, this.size.y * 0.25, this.size.x * 0.25, 135 * Math.PI / 180, 315 * Math.PI / 180);
    ctx.fill();
    ctx.stroke();
    /*ctx.fillStyle = "#33ff33";
    ctx.beginPath();
    ctx.arc(this.size.x * 0.75, this.size.y * 0.25, this.size.x * 0.25, -135*Math.PI/180, 45*Math.PI/180);
    ctx.fill();
    ctx.stroke();*/

    if (this.inputWires[0] && this.inputWires[0].get()) {
      ctx.beginPath();
      ctx.moveTo(this.size.x * 0.75, this.size.y * 0.25);
      ctx.lineTo(this.size.x * 1.0, 0);
      ctx.stroke();
    }

    ctx.restore();
  }; // If the "set" input is on, change to the "what" input


  RegisterBit.prototype.evaluate = function (bits) {
    return bits[0] ? [bits[1]] : this.state.bits;
  };

  return RegisterBit;
}();

var _default = RegisterBit;
exports.default = _default;
},{}],"Adder.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adder.ts
var Adder =
/** @class */
function () {
  // bits=8 means an 8-bit plus 8-bit
  function Adder(x, y, bits, width, height) {
    if (width === void 0) {
      width = bits * 50;
    }

    if (height === void 0) {
      height = width / 2;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: width,
      y: height
    };
    this.state = {
      bits: []
    };
    this.numBits = bits;
    this.inputSockets = []; // spacing between the bits

    var spacing = width / (2 * bits);

    for (var i = 0; i < bits; i++) {
      this.inputSockets.push({
        x: -spacing * (i + 0.5) + width / 2,
        y: -this.size.y / 2
      });
      this.inputSockets.unshift({
        x: spacing * (i + 0.5) - width / 2,
        y: -this.size.y / 2
      });
    }

    this.outputSockets = [];

    for (var i = 0; i < bits; i++) {
      this.outputSockets.push({
        x: -spacing * (i - (bits - 1) / 2),
        y: this.size.y / 2
      });
    } // carry


    this.outputSockets.push({
      x: -this.size.x * 0.375,
      y: 0
    });
    this.inputWires = [];
  }

  Adder.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  Adder.prototype.render = function (ctx) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + this.size.x, top);
    ctx.lineTo(left + this.size.x * 0.75, top + this.size.y);
    ctx.lineTo(left + this.size.x * 0.25, top + this.size.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var i = 0; i < this.inputSockets.length; i++) {
      var socket = this.inputSockets[i];
      ctx.fillStyle = "#3333cc";
      ctx.beginPath();
      ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.fillText(String(i), this.position.x + socket.x, this.position.y + socket.y - 15);
    }

    for (var i = 0; i < this.outputSockets.length; i++) {
      var socket = this.outputSockets[i];
      ctx.fillStyle = "#333333";
      ctx.strokeStyle = this.state.bits[i] ? '#33ff33' : '#990000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    var num1 = 0,
        num2 = 0;

    for (var i = 0; i < this.numBits; i++) {
      var wire1 = this.inputWires[i],
          wire2 = this.inputWires[i + this.numBits];
      num1 += (wire1.toComponent.state.bits[wire1.toOutput] ? 1 : 0) * (1 << i);
      num2 += (wire2.toComponent.state.bits[wire2.toOutput] ? 1 : 0) * (1 << i);
    }

    var textSize = Math.round(Math.min(this.size.x * 0.125, this.size.y * 0.5));
    ctx.font = textSize + "px monospace";
    ctx.fillStyle = "black";
    ctx.fillText(String(num1) + " + " + String(num2), this.position.x, this.position.y);
    ctx.restore();
  };

  Adder.prototype.evaluate = function (bits) {
    var num1 = 0,
        num2 = 0; // cheating here but that's not the point

    for (var i = 0; i < this.numBits; i++) {
      num1 += Number(bits[i]) * (1 << i);
      num2 += Number(bits[i + this.numBits]) * (1 << i);
    }

    var answer = num1 + num2;
    var answerBits = Array(this.numBits + 1);

    for (var i = 0; i <= this.numBits; i++) {
      answerBits[i] = (answer & 1 << i) > 0;
    } //console.log(answerBits);


    return answerBits;
  };

  return Adder;
}();

var _default = Adder;
exports.default = _default;
},{}],"MultiplierExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _RegisterBit = _interopRequireDefault(require("./RegisterBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Gates = require("./Gates");

var _ChoiceGate = _interopRequireDefault(require("./ChoiceGate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MultiplierExploration.ts
var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var MultiplierExploration =
/** @class */
function (_super) {
  __extends(MultiplierExploration, _super);

  function MultiplierExploration(canvas) {
    var _this = _super.call(this, canvas) || this;

    var BITS = 6;
    var startButton = new _InputBit.default(600, 40, false, 50);
    var startNot = new _Gates.Not(550, 40, 30, 90);
    startNot.inputWires.push(new _Wire.default(startButton, 0));

    _this.components.push(startNot);

    var clockX = 595;
    var clockAnd = new _Gates.AndGate(clockX, 100, 25, 0);
    var clockNot = new _Gates.Not(clockX, 150, 25, 0);
    var clockBit = new _OutputBit.default(clockX, 200);
    clockAnd.inputWires.push(new _Wire.default(clockNot, 0, [{
      x: clockX - 5,
      y: 75
    }, {
      x: clockX - 20,
      y: 75
    }, {
      x: clockX - 20,
      y: 175
    }, {
      x: clockX,
      y: 175
    }]));
    clockAnd.inputWires.push(new _Wire.default(startButton, 0));
    clockBit.inputWires.push(new _Wire.default(clockNot, 0));
    clockNot.inputWires.push(new _Wire.default(clockAnd, 0));

    _this.components.push(clockAnd, clockNot, clockBit);

    _this.outputComponents.push(clockBit);

    var adder = new _Adder.default(160, 190, BITS, 210, 90); // The "Register" that really isn't.
    // The Add and Shift steps should be successfully separated...

    var productRegister = [];

    for (var i = 0; i < 2 * BITS + 1; i++) {
      var reg = new _OutputBit.default(600 - 45 * i, 400, 20);
      productRegister.push(reg);

      _this.outputComponents.unshift(reg); // todo: is needed?


      _this.components.push(reg);
    } // Wire Coloring


    var purple = {
      color: "rgb(128, 32, 128)"
    };
    var purpleFaded = {
      color: "rgba(128, 0, 128, 0.25)"
    };
    var teal = {
      color: "rgb(0, 128, 128)"
    };
    var tealFaded = {
      color: "rgba(0, 128, 128, 0.25)"
    }; // Wires from the registers to the adder.

    for (var i = 0; i < BITS; i++) {
      var d = 3;
      var bit = productRegister[i + BITS]; // basically, we want the most significant bit to be highest

      var y1 = bit.position.y + 20 + d * (BITS - i);
      adder.inputWires.push(new _Wire.default(bit, 0, [{
        x: adder.position.x + adder.inputSockets[i].x,
        y: 110 + d * i
      }, {
        x: 10 + d * i,
        y: 110 + d * i
      }, {
        x: 10 + d * i,
        y: y1
      }, {
        x: bit.position.x,
        y: y1
      }], {
        color: "rgba(128, 0, 128, 0.75)"
      }));
    } // And Gates coming out of the adder (for the clock).


    var adderAndGates = [];

    for (var i = 0; i <= BITS; i++) {
      // and gate
      var x = adder.position.x + adder.outputSockets[i].x;
      var y = adder.position.y + adder.outputSockets[0].y; // put them all on the same line
      // space them a bit

      var and = new _Gates.AndGate(x + 4 * ((BITS - 1) / 2 - i), y + 40, 20, 0);
      and.inputWires.push(new _Wire.default(adder, i));
      adderAndGates.push(and);

      _this.components.push(and);
    } // Shifting the Multiplication Register


    for (var i = 0; i < 2 * BITS + 1; i++) {
      var regBit = productRegister[i];
      var or = new _Gates.OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);

      _this.components.push(or);

      regBit.inputWires.push(new _Wire.default(or, 0));
      var and1 = new _Gates.AndGate(regBit.position.x - 10, regBit.position.y - 60, 20, 0);
      and1.inputWires.push(new _Wire.default(clockNot, 0, [{
        x: regBit.position.x + 6,
        y: regBit.position.y - 100
      }, {
        x: 540 - 2 * i,
        y: regBit.position.y - 110 - 1 * i
      }], tealFaded)); // Shifting

      if (i < 2 * BITS) {
        and1.inputWires.push(new _Wire.default(productRegister[i + 1], 0, [{
          x: regBit.position.x - 6,
          y: regBit.position.y - 80
        }, {
          x: regBit.position.x - 21,
          y: regBit.position.y - 80
        }, {
          x: regBit.position.x - 21,
          y: regBit.position.y
        }], teal));
      }

      var and2 = new _Gates.AndGate(regBit.position.x + 10, regBit.position.y - 60, 20, 0);
      and2.inputWires.push(new _Wire.default(clockAnd, 0, [{
        x: regBit.position.x + 6,
        y: regBit.position.y - 100
      }, {
        x: 540 - 2 * i,
        y: regBit.position.y - 110 - 1 * i
      }], purpleFaded));

      _this.components.push(and1, and2);

      if (i >= BITS) {
        // Upper Half of the Register: Connect to the adder.
        and2.inputWires.push(new _Wire.default(adderAndGates[i - BITS], 0, [], purple));
      } else {
        // Lower Half of the Register: Connect to itself.
        and2.inputWires.push(new _Wire.default(regBit, 0, [{
          x: regBit.position.x + 14,
          y: regBit.position.y - 75
        }, {
          x: regBit.position.x + 21,
          y: regBit.position.y - 75
        }, {
          x: regBit.position.x + 21,
          y: regBit.position.y
        }], purple));
      }

      or.inputWires.push(new _Wire.default(and1, 0));
      or.inputWires.push(new _Wire.default(and2, 0));
    } // Input Numbers (A and B).


    var inputA = [];
    var inputB = [];

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(270 - i * 25, 60);

      _this.components.push(input);

      adder.inputWires.push(new _Wire.default(input, 0));
      inputA.push(input); // in case we need it
    }

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(540 - i * 45, 60);

      _this.components.push(input);

      inputB.push(input);
    } // The second input register that is actually a register.


    var multiplierRegister = [];
    var multiplierRegisterChoice = [];

    for (var i = 0; i < BITS; i++) {
      var reg = new _RegisterBit.default(inputB[i].position.x - 4, 170, 20);
      multiplierRegister.push(reg);

      _this.components.push(reg);

      _this.outputComponents.push(reg);
    } // Wiring to the Registers


    for (var i = 0; i < BITS; i++) {
      var reg = multiplierRegister[i];
      var or = new _Gates.OrGate(reg.position.x - 9, reg.position.y - 25, 20, 0);
      var choice = new _ChoiceGate.default(reg.position.x + 9, reg.position.y - 60, 12);
      reg.inputWires.push(new _Wire.default(or, 0), new _Wire.default(choice, 0));
      var wirePath = [{
        x: reg.position.x - 13,
        y: choice.position.y
      }, {
        x: reg.position.x - 13,
        y: startNot.position.y
      }];
      or.inputWires.push(new _Wire.default(startNot, 0, wirePath, {
        color: "rgba(100, 100, 130, 0.75)"
      }));
      or.inputWires.push(new _Wire.default(clockNot, 0, [{
        x: or.position.x + 10,
        y: or.position.y - 18 - i / 2
      }, {
        x: clockNot.position.x - 40,
        y: or.position.y - 18 - i
      }], tealFaded)); // choice gate is [0] ? [1] : [2]
      // the selection comes first

      choice.inputWires.push(new _Wire.default(startNot, 0, wirePath, {
        color: "rgba(100, 100, 130, 0.75)"
      })); // If the clock is off, the registers need to use the input bits

      choice.inputWires.push(new _Wire.default(inputB[i], 0)); // Otherwise use the

      choice.inputWires.push(new _Wire.default(multiplierRegister[i + 1] || null, 0, [{
        x: reg.position.x + 14,
        y: reg.position.y - 80
      }, {
        x: reg.position.x - 22,
        y: reg.position.y - 80
      }, {
        x: reg.position.x - 22,
        y: reg.position.y + 10
      }]));

      _this.components.push(or, choice);
    } // Control Wire from the final register bit to the adder's output


    var regLSB = multiplierRegister[0];

    for (var i = 0; i < BITS; i++) {
      var and = adderAndGates[i];
      console.log(regLSB);
      and.inputWires.push(new _Wire.default(regLSB, 0, [{
        x: and.position.x + 10,
        y: and.position.y - 20
      }, {
        x: 282,
        y: and.position.y - 20
      }, {
        x: 282,
        y: regLSB.position.y + 20
      }, {
        x: regLSB.position.x,
        y: regLSB.position.y + 20
      }], {
        color: "rgb(127, 127, 127)"
      }));
    }

    var testBit = new _OutputBit.default(640, 100);

    _this.components.push(testBit);

    _this.outputComponents.push(testBit);

    testBit.inputWires.push(new _Wire.default(clockAnd, 0, [], purple)); // rendering trick, because input wires are drawn with a component
    // so rendering these last makes it look cleaner

    _this.components.push(adder, startButton);

    return _this;
  }

  return MultiplierExploration;
}(_Exploration.default);

var _default = MultiplierExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./RegisterBit":"RegisterBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Gates":"Gates.ts","./ChoiceGate":"ChoiceGate.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

var _ChoiceExploration = _interopRequireDefault(require("./ChoiceExploration"));

var _MultiplierExploration = _interopRequireDefault(require("./MultiplierExploration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createCanvas(width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
} // in milliseconds


var UPDATE_TIMES = [4000, 2500, 1600, 1000, 630, 400, 250];

function createExploration(id, width, height, type) {
  var element = document.getElementById(id);

  if (!element) {
    throw new Error("Document element " + id + " not found.");
  }

  var canvas = createCanvas(width, height);
  element.appendChild(canvas);
  var exploration = new type(canvas);
  exploration.update();
  canvas.addEventListener("click", function (event) {
    exploration.onClick(event.offsetX, event.offsetY);
  });
  var controls = document.createElement("div");
  controls.innerHTML = "\n        <form>\n            <p><strong>Speed:</strong> Slow\n                <input id=\"speed-" + id + "\" name=\"speed\" type=\"range\" min=\"0\" max=\"" + (UPDATE_TIMES.length - 1) + "\" />\n                Fast\n            </p>\n        </form>\n        <button id=\"pause-" + id + "\">Pause</button>\n        <button id=\"resume-" + id + "\">Resume</button>\n        <button id=\"step-" + id + "\">Step</button>\n    ";
  controls.querySelector("#speed-" + id).addEventListener("change", function (event) {
    exploration.updateTime = UPDATE_TIMES[Number(event.target.value)];
  });
  element.appendChild(controls);
  controls.querySelector("#pause-" + id).addEventListener("click", exploration.pause.bind(exploration));
  controls.querySelector("#resume-" + id).addEventListener("click", exploration.resume.bind(exploration));
  controls.querySelector("#step-" + id).addEventListener("click", exploration.update.bind(exploration));
  exploration.resume();
  return exploration;
} // Explorations


var ALL_EXPLORATIONS = []; //ALL_EXPLORATIONS.push(createExploration('1', 640, 480, AdderExploration));

ALL_EXPLORATIONS.push(createExploration('choice', 400, 400, _ChoiceExploration.default));
ALL_EXPLORATIONS.push(createExploration('multiplier-full', 640, 480, _MultiplierExploration.default)); //ALL_EXPLORATIONS.push(createExploration('3', 400, 400, RegisterExploration));

function renderLoop() {
  // TODO: Put this in exploration
  for (var i = 0; i < ALL_EXPLORATIONS.length; i++) {
    var exploration = ALL_EXPLORATIONS[i];
    exploration.render();
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();
},{"./ChoiceExploration":"ChoiceExploration.ts","./MultiplierExploration":"MultiplierExploration.ts"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63506" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.c39d6dcf.js.map