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
  function Exploration(canvas, width, height) {
    if (width === void 0) {
      width = 400;
    }

    if (height === void 0) {
      height = 400;
    }

    this.animated = false; // assume not unless proven otherwise

    this.paused = false;
    this.updateTime = 1000;
    this.lastUpdated = Date.now();
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.components = [];
    this.outputComponents = []; // sizing

    canvas.width = width;
    canvas.height = height; // TS-safe way of putting a random debug name

    var id = Math.floor(Math.random() * 1e6);
    Object.defineProperty(window, "exploration" + id, {
      value: this
    });
    console.log(id, this);
  } // todo: addComponent() maybe?


  Exploration.prototype.render = function (isDark) {
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
        (_a = comp.inputWires[j]) === null || _a === void 0 ? void 0 : _a.render(this.context, position, isDark);
      }

      this.components[i].render(this.context, isDark);
      this.context.restore();
    }

    if (typeof this.afterRender === "function") {
      this.afterRender();
    }
  };

  Exploration.prototype.onClick = function (canvasX, canvasY) {
    var needsUpdate = false;

    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i];
      var offsetX = canvasX - component.position.x;
      var offsetY = canvasY - component.position.y;

      if (Math.abs(offsetX) < component.size.x / 2 && Math.abs(offsetY) < component.size.y / 2 && component.onClick) {
        needsUpdate || (needsUpdate = component.onClick(offsetX, offsetY));
      }
    }

    if (needsUpdate && !this.animated) {
      // Non-animated ones re-update the whole tree
      this.update();
    }
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
    }

    this.animationFrame = requestAnimationFrame(this.updateLoop.bind(this));
  };

  Exploration.prototype.update = function () {
    // call beforeUpdate if needed
    for (var i = 0; i < this.components.length; i++) {
      var comp = this.components[i];

      if (typeof comp.beforeUpdate === "function") {
        comp.beforeUpdate();
      }
    } // Recursively loop backwards through the tree
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

    for (var i = 0; i < this.outputComponents.length; i++) {//console.log("After Update: ", this.outputComponents[i].position, savedState[i].bits, this.outputComponents[i].state.bits)
    } //console.warn("UPDATE FINISHED");


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
},{}],"dark.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBitColor = getBitColor;
exports.getApplianceColor = getApplianceColor;
exports.getStrokeColor = getStrokeColor;
exports.getTextColor = getTextColor;

// dark.ts
// order of params is important here
function getBitColor(bit, dark) {
  if (dark) {
    return bit ? "#00aa00" : "#770000";
  } else {
    return bit ? "#33ff33" : "#990000";
  }
}

function getApplianceColor(dark) {
  return dark ? "#333333" : "#cccccc";
}

function getStrokeColor(dark) {
  return dark ? "#aaa" : "#222";
}

function getTextColor(dark) {
  return dark ? "#888" : "#333";
}
},{}],"InputBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

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
      bits: [value]
    };
    this.inputSockets = []; // it is input, it needs no input from elsewhere

    this.inputWires = [];
    this.outputSockets = [{
      x: 0,
      y: 0
    }];
    this.linkedBits = [];
  }

  InputBit.prototype.render = function (ctx, isDark) {
    ctx.fillStyle = (0, _dark.getBitColor)(this.state.bits[0], isDark);
    ctx.strokeStyle = "2px solid " + (0, _dark.getStrokeColor)(isDark);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size.x / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  ;

  InputBit.prototype.onClick = function (_offsetX, _offsetY) {
    console.log("[InputBit] clicked");
    this.state.bits[0] = !this.state.bits[0]; // also update everything else

    for (var _i = 0, _a = this.linkedBits; _i < _a.length; _i++) {
      var otherBit = _a[_i];
      otherBit.state.bits[0] = this.state.bits[0];
    } // bits will be updated when everything is


    return true;
  };

  ;

  InputBit.prototype.evaluate = function (_) {
    return this.state.bits;
  };

  return InputBit;
}();

var _default = InputBit;
exports.default = _default;
},{"./dark":"dark.ts"}],"OutputBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

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

  OutputBit.prototype.render = function (ctx, isDark) {
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.fillStyle = "black";
    ctx.fillRect(left, top, this.size.x, this.size.y);
    ctx.fillStyle = (0, _dark.getBitColor)(this.state.bits[0], isDark);
    ctx.fillRect(left + this.size.x * 0.1, top + this.size.y * 0.1, this.size.x * 0.8, this.size.y * 0.8);
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
},{"./dark":"dark.ts"}],"Adder.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

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
    } // carry input


    this.inputSockets.push({
      x: this.size.x * 3 / 8,
      y: 0
    });
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

  Adder.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = isDark ? "#333333" : "#cccccc";
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
      ctx.fillStyle = isDark ? "#223388" : "#3333cc";
      ctx.beginPath();
      ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      /*ctx.fillStyle = "black";
      ctx.fillText(String(i), this.position.x + socket.x, this.position.y + socket.y - 15);*/
    }

    for (var i = 0; i < this.outputSockets.length; i++) {
      var socket = this.outputSockets[i];
      ctx.fillStyle = isDark ? "#666666" : "#333333";
      ctx.strokeStyle = (0, _dark.getBitColor)(this.state.bits[i], isDark);
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
      num1 += (wire1 && wire1.toComponent.state.bits[wire1.toOutput] ? 1 : 0) * (1 << i);
      num2 += (wire2 && wire2.toComponent.state.bits[wire2.toOutput] ? 1 : 0) * (1 << i);
    }

    var textSize = Math.round(Math.min(this.size.x * 0.125, this.size.y * 0.5));
    ctx.font = textSize + "px monospace";
    ctx.fillStyle = (0, _dark.getTextColor)(isDark);
    ctx.fillText(String(num1) + " + " + String(num2), this.position.x, this.position.y);
    var carryWire = this.inputWires[2 * this.numBits];

    if (carryWire && carryWire.get()) {
      ctx.font = Math.round(textSize * 0.5) + "px monospace";
      ctx.fillText("(+1 carry in)", this.position.x, this.position.y + this.size.y * 0.25);
    }

    ctx.restore();
  };

  Adder.prototype.evaluate = function (bits) {
    var num1 = 0,
        num2 = 0; // cheating here but that's not the point

    for (var i = 0; i < this.numBits; i++) {
      num1 += Number(bits[i]) * (1 << i);
      num2 += Number(bits[i + this.numBits]) * (1 << i);
    } // add plus the carry


    var answer = num1 + num2 + (bits[2 * this.numBits] ? 1 : 0);
    var answerBits = Array(this.numBits + 1);

    for (var i = 0; i <= this.numBits; i++) {
      answerBits[i] = (answer & 1 << i) > 0;
    }

    if (this.position.x === 430 && this.numBits === 4) console.log("Adder gives ", answerBits, "with input", bits);
    return answerBits;
  };

  Adder.prototype.beforeUpdate = function () {
    // The simulation was having some bugs without this
    var inputs = [];

    for (var i = 0; i <= 2 * this.numBits; i++) {
      var wire = this.inputWires[i];
      inputs.push(wire ? wire.get() : false);
    }

    console.log("num inputs: ", inputs.length);
    this.state.bits = this.evaluate(inputs);
  };

  return Adder;
}();

var _default = Adder;
exports.default = _default;
},{"./dark":"dark.ts"}],"Wire.ts":[function(require,module,exports) {
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
    } // in case you want the wire to bend


    this.waypoints = [];
    this.toComponent = to;
    this.toOutput = toOutput;
    this.waypoints = waypoints;
    this.color = options.color;
    this.darkColor = options.darkColor;
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

  Wire.prototype.render = function (ctx, from, isDark) {
    if (!this.toComponent) return;
    ctx.save();

    if (isDark && this.darkColor) {
      ctx.strokeStyle = this.darkColor;
    } else if (this.color) {
      ctx.strokeStyle = this.color;
    } else {
      ctx.strokeStyle = isDark ? "#606468" : "#333";
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    for (var i = 0; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }

    var endOffset = this.toComponent.outputSockets[this.toOutput];

    if (!endOffset) {
      console.error(this, this.toComponent, this.toOutput);
    }

    ctx.lineTo(endOffset.x + this.toComponent.position.x, endOffset.y + this.toComponent.position.y);
    ctx.stroke();
    ctx.lineWidth = 6;

    for (var i = 0; i < this.waypoints.length; i++) {
      if (this.waypoints[i].node) {
        ctx.beginPath();
        ctx.arc(this.waypoints[i].x, this.waypoints[i].y, 1, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  return Wire;
}();

var _default = Wire;
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

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
    this.symbol = "";
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
    var sine = Math.sin(this.rotation); // transform [??0.3, -0.5]

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
    return false;
  };

  ;

  Gate.prototype.render = function (ctx, isDark) {
    ctx.save(); // base

    ctx.fillStyle = isDark ? "#333" : "#ccc";
    ctx.strokeStyle = isDark ? "#aaa" : "black";
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
    ctx.rotate(-this.rotation);
    ctx.font = Math.round(this.size.y * 0.6) + "px monospace";
    ctx.fillStyle = isDark ? "#939699" : "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  };

  return Gate;
}();

var AndGate =
/** @class */
function (_super) {
  __extends(AndGate, _super);

  function AndGate(x, y, size, degrees) {
    var _this = _super.call(this, x, y, size, degrees, 2) || this;

    _this.symbol = "&";
    return _this;
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
    var _this = _super.call(this, x, y, size, degrees, 2) || this;

    _this.symbol = "O";
    return _this;
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
    var _this = _super.call(this, x, y, size, degrees, 2) || this;

    _this.symbol = "X";
    return _this;
  }

  XorGate.prototype.drawGate = function (ctx) {
    var s = this.size.x; // do the or's path...

    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * -0.35);
    ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
    ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.35);
    ctx.quadraticCurveTo(s * 0, s * -0.15, s * 0.4, s * -0.35);
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
}(Gate);

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

  Not.prototype.render = function (ctx, isDark) {
    Gate.prototype.render.call(this, ctx, isDark);
  };

  ;

  Not.prototype.evaluate = function (bits) {
    return [!bits[0]];
  };

  ;
  return Not;
}(Gate);

exports.Not = Not;
},{}],"Display.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Display.ts
//
// Given a set of bits, displays its value as a signed or unsigned integer.
var Display =
/** @class */
function () {
  // I think this only works on components with exactly 1 output
  function Display(x, y, components, signed, size) {
    if (signed === void 0) {
      signed = false;
    }

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
    this.signed = signed;
    this.components = components;
    this.state = {
      // unused
      bits: []
    }; // unused, it doesn't use wires because they make visual clutter

    this.inputSockets = [];
    this.outputSockets = [];
    this.inputWires = [];
  }

  Display.prototype.getValue = function () {
    var totalValue = 0;

    for (var i = 0; i < this.components.length; i++) {
      var comp = this.components[i];
      var value = (comp.state.bits[0] ? 1 : 0) << i; // use 2's complement if signed on the last bit

      if (i == this.components.length - 1) {
        if (this.signed === "signmag") {
          // MSB flips sign if on
          totalValue *= value == 0 ? 1 : -1;
        } else if (this.signed === "1comp") {
          // 1's complement is equivalent to MSB value -2^n+1
          totalValue -= value ? value - 1 : 0;
        } else if (this.signed === true || this.signed === "2comp") {
          // 2's complement is equivalent to MSB value -2^n
          totalValue -= value;
        } else {
          // unsigned
          totalValue += value;
        }
      } else {
        // all other bits are normal
        totalValue += value;
      }
    }

    var displayText = String(totalValue); // negative zero

    if (displayText === "0" && this.components[this.components.length - 1].state.bits[0]) {
      displayText = "-0";
    }

    return displayText;
  };

  Display.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = isDark ? "#333" : "#cccccc";
    ctx.strokeStyle = isDark ? "#999" : "#000";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + this.size.x, top);
    ctx.lineTo(left + this.size.x, top + this.size.y);
    ctx.lineTo(left, top + this.size.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // get the state

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = Math.round(this.size.y * 4 / 5) + "px monospace";
    ctx.fillStyle = isDark ? "#909396" : "#000";
    ctx.fillText(this.getValue(), this.position.x, this.position.y);
    ctx.restore();
  };

  Display.prototype.evaluate = function (_) {
    return [];
  };

  return Display;
}();

var _default = Display;
exports.default = _default;
},{}],"AdderExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Gates = require("./Gates");

var _Display = _interopRequireDefault(require("./Display"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AdderExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var AdderExploration =
/** @class */
function (_super) {
  __extends(AdderExploration, _super);

  function AdderExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 640, 400) || this;

    var adder = new _Adder.default(520, 200, 4);

    _this.components.push(adder);

    for (var i = 0; i < 4; i++) {
      var bit = new _InputBit.default(adder.position.x - 100 + i * 25, 30);
      adder.inputWires.unshift(new _Wire.default(bit, 0, [{
        x: bit.position.x + 12.5,
        y: 120 - i * 20
      }, {
        x: bit.position.x,
        y: 120 - i * 20
      }]));

      _this.components.push(bit);

      var bit2 = new _InputBit.default(adder.position.x + 100 - i * 25, 30);
      adder.inputWires.push(new _Wire.default(bit2, 0, [{
        x: bit2.position.x - 12.5,
        y: 120 - i * 20
      }, {
        x: bit2.position.x,
        y: 120 - i * 20
      }]));

      _this.components.push(bit2);
    }

    for (var i = 0; i < 5; i++) {
      var output = new _OutputBit.default(adder.position.x + 37.5 - i * 25, 300);
      output.inputWires.push(new _Wire.default(adder, i, []));

      _this.components.push(output);

      _this.outputComponents.push(output);
    } // colors are nice


    var blue = {
      color: "rgba(96,96,160,1)"
    };
    var fakeCarry = new _InputBit.default(370, 200, false, 20);

    _this.components.push(fakeCarry);

    var rightInputA = [];
    var rightInputB = [];
    var rightOutput = [];
    var carryOuts = [];

    for (var i = 0; i < 4; i++) {
      var bitA = new _InputBit.default(290 - i * 70, 30);
      rightInputA.push(bitA);
      var bitB = new _InputBit.default(bitA.position.x + 40, 90);
      rightInputB.push(bitB); // full adder

      var x1 = (bitA.position.x + bitB.position.x) / 2;
      var y1 = bitB.position.y + 60;
      var and = new _Gates.AndGate(x1 - 18, y1, 24, 0);
      and.inputWires.push(new _Wire.default(bitA, 0, []));
      and.inputWires.push(new _Wire.default(bitB, 0, []));
      var xor = new _Gates.XorGate(x1 + 18, y1, 24, 0);
      xor.inputWires.push(new _Wire.default(bitA, 0, []));
      xor.inputWires.push(new _Wire.default(bitB, 0, []));
      var outBit = new _OutputBit.default(x1, 300, 20);
      rightOutput.push(outBit);

      if (i >= 0) {
        var previous = i == 0 ? fakeCarry : carryOuts[i - 1]; // need a second phase of the adder

        var and2 = new _Gates.AndGate(x1, y1 + 50, 24, 0);
        and2.inputWires.push(new _Wire.default(xor, 0, []));
        and2.inputWires.push(new _Wire.default(previous, 0, [{
          x: and2.position.x + 5,
          y: and2.position.y - 15
        }, {
          x: and2.position.x + 38,
          y: and2.position.y - 15
        }, {
          x: and2.position.x + 38,
          y: previous.position.y + 15
        }, {
          x: previous.position.x,
          y: previous.position.y + 15
        }], blue));
        var xor2 = new _Gates.XorGate(x1 + 20, y1 + 80, 24, 0);
        xor2.inputWires.push(new _Wire.default(xor, 0, []));
        xor2.inputWires.push(new _Wire.default(previous, 0, [{
          x: xor2.position.x + 5,
          y: and2.position.y - 15
        }, {
          x: and2.position.x + 38,
          y: and2.position.y - 15
        }, {
          x: and2.position.x + 38,
          y: previous.position.y + 15
        }, {
          x: previous.position.x,
          y: previous.position.y + 15
        }], blue));
        var or2 = new _Gates.OrGate(x1 - 15, y1 + 80, 24, 0);
        or2.inputWires.push(new _Wire.default(and, 0, []));
        or2.inputWires.push(new _Wire.default(and2, 0, []));
        carryOuts[i] = or2;
        outBit.inputWires.push(new _Wire.default(xor2, 0, []));

        _this.components.push(or2, and2, xor2);
      } else {
        carryOuts[i] = and;
        outBit.inputWires.push(new _Wire.default(xor, 0, []));
      }

      _this.components.push(and, xor, outBit);
    }

    var finalCarry = new _OutputBit.default(30, 250, 20);
    finalCarry.inputWires.push(new _Wire.default(carryOuts[3], 0, []));
    rightOutput.push(finalCarry);

    (_a = _this.components).push.apply(_a, __spreadArray(__spreadArray([finalCarry], rightInputA), rightInputB));

    var displayA = new _Display.default(35, 30, rightInputA);
    var displayB = new _Display.default(35, 90, rightInputB);
    var displayResult = new _Display.default(200, 350, rightOutput, false, 40);

    _this.components.push(displayA, displayB, displayResult);

    (_b = _this.outputComponents).push.apply(_b, rightOutput);

    return _this;
  }

  return AdderExploration;
}(_Exploration.default);

var _default = AdderExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Gates":"Gates.ts","./Display":"Display.ts"}],"AdderFailExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AdderExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var AdderFailExploration =
/** @class */
function (_super) {
  __extends(AdderFailExploration, _super);

  function AdderFailExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 400, 300) || this;

    var adder = new _Adder.default(200, 170, 4);

    _this.components.push(adder);

    var inputA = [];
    var inputB = [];

    for (var i = 0; i < 4; i++) {
      var y = 105 - i * 15;
      var bitA = new _InputBit.default(adder.position.x - 100 + i * 25, 30);
      adder.inputWires.unshift(new _Wire.default(bitA, 0, [{
        x: bitA.position.x + 12.5,
        y: 105 - i * 15
      }, {
        x: bitA.position.x,
        y: 105 - i * 15
      }]));
      inputA.unshift(bitA);
      var bitB = new _InputBit.default(adder.position.x + 100 - i * 25, 30);
      adder.inputWires.push(new _Wire.default(bitB, 0, [{
        x: bitB.position.x - 12.5,
        y: 105 - i * 15
      }, {
        x: bitB.position.x,
        y: 105 - i * 15
      }]));
      inputB.push(bitB);
    }

    var outputBits = [];

    for (var i = 0; i < 4; i++) {
      var output = new _OutputBit.default(adder.position.x + 37.5 - i * 25, 260);
      output.inputWires.push(new _Wire.default(adder, i, []));
      outputBits.push(output);
    }

    (_a = _this.components).push.apply(_a, __spreadArray(__spreadArray(__spreadArray([], inputA), inputB), outputBits));

    var displayA = new _Display.default(35, 30, inputA, "signmag");
    var displayB = new _Display.default(365, 30, inputB, "signmag");
    var displayResult = new _Display.default(320, 260, outputBits, "signmag", 40);

    _this.components.push(displayA, displayB, displayResult);

    (_b = _this.outputComponents).push.apply(_b, outputBits);

    return _this;
  }

  return AdderFailExploration;
}(_Exploration.default);

var _default = AdderFailExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts"}],"Text.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Text.ts
//
// Simple text display
var Text =
/** @class */
function () {
  function Text(x, y, size, text, options) {
    if (options === void 0) {
      options = {};
    }

    this.state = {
      bits: []
    };
    this.inputSockets = [];
    this.outputSockets = [];
    this.inputWires = [];
    this.onClick = undefined;

    this.evaluate = function () {
      return [];
    };

    this.beforeUpdate = undefined;
    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: 0,
      y: size
    };
    this.text = text;
    this.options = options;
  }

  Text.prototype.render = function (ctx, isDark) {
    ctx.save();
    var message = typeof this.text === "function" ? this.text() : this.text;
    ctx.font = this.size.y + "px monospace"; // if function, call it; if string, use it; if undefined, default to #333

    ctx.fillStyle = typeof this.options.color === "function" ? this.options.color() : typeof this.options.color === "string" ? this.options.color : isDark ? "#909396" : "#333"; // positioning

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, this.position.x, this.position.y);
    ctx.restore();
  };

  return Text;
}();

var _default = Text;
exports.default = _default;
},{}],"BinaryExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// BinaryExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var BinaryExploration =
/** @class */
function (_super) {
  __extends(BinaryExploration, _super);

  function BinaryExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 480, 240) || this;

    var NUM_BITS = 6;
    var bitArray = [];

    for (var i = 0; i < NUM_BITS; i++) {
      var bit = new _InputBit.default(440 - 80 * i, 80, false, 30);
      bitArray.push(bit);
      var text = new _Text.default(bit.position.x, bit.position.y / 2, 30, String(Math.pow(2, i)));

      _this.components.push(text);
    }

    (_a = _this.components).push.apply(_a, bitArray);

    (_b = _this.outputComponents).push.apply(_b, bitArray);

    var display = new _Display.default(240, 160, bitArray, false, 48);

    _this.components.push(display);

    _this.outputComponents.push(display);

    return _this;
  }

  return BinaryExploration;
}(_Exploration.default);

var _default = BinaryExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./Display":"Display.ts","./Text":"Text.ts"}],"ChoiceGate.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

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
    var offset = size * 0.5;
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

  ChoiceGate.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = (0, _dark.getApplianceColor)(isDark);
    ctx.strokeStyle = (0, _dark.getStrokeColor)(isDark);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.size.x * 1.0, 0);
    ctx.lineTo(this.size.x * 0.67, this.size.y);
    ctx.lineTo(this.size.x * 0.33, this.size.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // red input

    var sx = this.size.x;
    ctx.fillStyle = "rgb(0, 204, 0, 0.75)";
    ctx.beginPath();
    ctx.arc(sx * 0.25, 1, sx * 0.15, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgb(153, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.arc(sx * 0.75, 1, sx * 0.15, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  }; // If the "set" input is on, change to the "what" input


  ChoiceGate.prototype.evaluate = function (bits) {
    return [bits[0] ? bits[1] : bits[2]];
  };

  return ChoiceGate;
}();

var _default = ChoiceGate;
exports.default = _default;
},{"./dark":"dark.ts"}],"UserGates.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BinarySwitch = exports.NotSwitch = void 0;

// NotSwitch.ts
//
// Switch between NOT gate and simple wire
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}(); // NOTE: Make this abstract


var UserGate =
/** @class */
function () {
  function UserGate(x, y, size, rotation, bits, numGates) {
    this.symbol = "";
    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: size,
      y: size
    };
    this.state = {
      bits: [false],
      whichGate: 0
    };
    this.numGates = numGates;
    this.rotation = rotation * Math.PI / 180;
    var cosine = Math.cos(this.rotation);
    var sine = Math.sin(this.rotation); // transform [??0.3, -0.5]

    if (bits == 2) {
      this.inputSockets = [{
        x: size * (-0.15 * cosine + 0.5 * sine),
        y: size * (-0.5 * cosine - 0.15 * sine)
      }, {
        x: size * (0.15 * cosine + 0.5 * sine),
        y: size * (-0.5 * cosine + 0.15 * sine)
      }];
    } else {
      this.inputSockets = [{
        x: size * 0.5 * sine,
        y: size * -0.5 * cosine
      }];
    }

    this.outputSockets = [{
      x: size * -0.5 * sine,
      y: size * 0.5 * cosine
    }];
    this.inputWires = [];
  }

  UserGate.prototype.onClick = function (offsetX, offsetY) {
    // rotate them
    var cosine = Math.cos(this.rotation);
    var sine = Math.sin(this.rotation); // the sizes are both the same

    var realX = (offsetX * cosine + offsetY * sine) / this.size.x;
    var realY = (offsetY * cosine - offsetY * sine) / this.size.y;

    if (-0.3 < realY && realY < 0.3) {
      if (-0.5 < realX && realX < -0.3) {
        this.state.whichGate = (this.state.whichGate - 1 + this.numGates) % this.numGates;
        return true;
      }

      if (0.3 < realX && realX < 0.5) {
        this.state.whichGate = (this.state.whichGate + 1) % this.numGates;
        return true;
      }
    }

    return false;
  };

  ;

  UserGate.prototype.render = function (ctx, isDark) {
    ctx.save(); // base

    ctx.fillStyle = isDark ? "#222" : "#ddd";
    ctx.strokeStyle = isDark ? "#aaa" : "black";
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
    } // this is new


    var sx = this.size.x,
        sy = this.size.y;
    ctx.beginPath();
    ctx.moveTo(0, sy * -0.5);
    ctx.lineTo(sx * 0.4, sy * -0.5);
    ctx.arcTo(sx * 0.5, sy * -0.5, sx * 0.5, sy * -0.4, sy * 0.1);
    ctx.lineTo(sx * 0.5, sy * 0.4);
    ctx.arcTo(sx * 0.5, sy * 0.5, sx * 0.4, sy * 0.5, sy * 0.1);
    ctx.lineTo(sx * -0.4, sy * 0.5);
    ctx.arcTo(sx * -0.5, sy * 0.5, sx * -0.5, sy * 0.4, sy * 0.1);
    ctx.lineTo(sx * -0.5, sy * -0.4);
    ctx.arcTo(sx * -0.5, sy * -0.5, sx * -0.4, sy * -0.5, sy * 0.1);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    this.drawGate(ctx); // arrow buttons

    ctx.fillStyle = isDark ? "#939699" : "#333";
    ctx.beginPath();
    ctx.moveTo(sx * 0.5, 0);
    ctx.lineTo(sx * 0.3, sy * -0.3);
    ctx.lineTo(sx * 0.3, sy * +0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx * -0.5, 0);
    ctx.lineTo(sx * -0.3, sy * -0.3);
    ctx.lineTo(sx * -0.3, sy * +0.3);
    ctx.fill();
    ctx.rotate(-this.rotation);
    ctx.font = Math.round(this.size.y * 0.4) + "px monospace";
    ctx.fillStyle = isDark ? "#939699" : "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  };

  ;
  return UserGate;
}();

; // binary, as in operator, as in takes two inputs (and/or/xor)

var BinarySwitch =
/** @class */
function (_super) {
  __extends(BinarySwitch, _super);

  function BinarySwitch(x, y, size, rotation) {
    return _super.call(this, x, y, size, rotation, 2, 3) || this;
  }

  BinarySwitch.prototype.drawGate = function (ctx) {
    var s = this.size.y * 0.6; // wire in

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.size.y * +0.5);
    var xOffset = this.size.x * 0.15;
    ctx.moveTo(-xOffset, 0);
    ctx.lineTo(-xOffset, this.size.y * -0.5);
    ctx.moveTo(xOffset, 0);
    ctx.lineTo(xOffset, this.size.y * -0.5);
    ctx.stroke();

    switch (this.state.whichGate) {
      case 0:
        // and
        ctx.beginPath();
        ctx.moveTo(s * 0.4, -s * 0.4);
        ctx.lineTo(s * 0.4, 0);
        ctx.arc(0, 0, s * 0.4, 0, Math.PI);
        ctx.lineTo(-s * 0.4, -s * 0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        this.symbol = "&";
        break;

      case 1:
        // or
        ctx.beginPath();
        ctx.moveTo(s * 0.4, s * -0.4);
        ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
        ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.4);
        ctx.quadraticCurveTo(s * 0, s * -0.2, s * 0.4, s * -0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        this.symbol = "O";
        break;

      case 2:
        // xor
        // do the or's path...
        ctx.beginPath();
        ctx.moveTo(s * 0.4, s * -0.35);
        ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
        ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.35);
        ctx.quadraticCurveTo(s * 0, s * -0.15, s * 0.4, s * -0.35);
        ctx.closePath();
        ctx.stroke();
        ctx.fill(); // and the extra thing

        ctx.beginPath();
        ctx.moveTo(s * -0.4, s * -0.5);
        ctx.quadraticCurveTo(s * 0, s * -0.3, s * 0.4, s * -0.5);
        ctx.stroke();
        this.symbol = "X";
        break;
    }
  };

  BinarySwitch.prototype.evaluate = function (bits) {
    switch (this.state.whichGate) {
      case 0:
        return [bits[0] && bits[1]];

      case 1:
        return [bits[0] || bits[1]];

      case 2:
        return [bits[0] !== bits[1]];

      default:
        throw new Error("Invalid state " + this.state.whichGate);
    }
  };

  ;
  return BinarySwitch;
}(UserGate);

exports.BinarySwitch = BinarySwitch;

var NotSwitch =
/** @class */
function (_super) {
  __extends(NotSwitch, _super);

  function NotSwitch(x, y, size, rotation) {
    var _this = _super.call(this, x, y, size, rotation, 1, 2) || this;

    _this.state = {
      bits: [false],
      whichGate: 0
    };
    return _this;
  }

  NotSwitch.prototype.drawGate = function (ctx) {
    var s = this.size.y * 0.75; // wire in

    ctx.beginPath();
    ctx.moveTo(0, this.size.y * -0.5);
    ctx.lineTo(0, this.size.y * +0.5);
    ctx.stroke();

    if (this.state.whichGate === 1) {
      // triangle for the not
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
    }
  };

  NotSwitch.prototype.evaluate = function (bits) {
    return [this.state.whichGate === 1 ? !bits[0] : bits[0]];
  };

  return NotSwitch;
}(UserGate);

exports.NotSwitch = NotSwitch;
},{}],"AnswerChecker.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _dark = require("./dark");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AnswerChecker.ts
//
// Runs through all possible combinations of given input bits.
var AnswerChecker =
/** @class */
function () {
  function AnswerChecker(exploration, x, y, inputs, outputs, checkFunction) {
    this.exploration = exploration;
    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: 160,
      y: 90
    };
    this.inputSockets = [];
    this.outputSockets = [];
    this.inputWires = [];
    this.inputs = inputs;
    this.outputs = outputs;
    this.checkFunction = checkFunction;
    this.state = {
      bits: [],
      running: false,
      counter: -1,
      win: false,
      lose: false,
      loseCorrectAnswer: [],
      loseWrongAnswer: []
    };
    this.timer = -1;
  }

  AnswerChecker.prototype.onClick = function (offsetX, offsetY) {
    if (offsetX >= -60 && offsetX <= 60 && Math.abs(offsetY + 17) <= 20) {
      this.launch();
      return true;
    }

    return false;
  };

  AnswerChecker.prototype.launch = function () {
    if (this.state.running) {
      clearTimeout(this.timer);
      this.state.running = false;
      this.state.counter = -1;
    } else {
      this.state.running = true;
      this.state.win = false;
      this.state.lose = false;
      this.state.counter = -1;
      this.nextTest();
    }
  };

  AnswerChecker.prototype.nextTest = function () {
    this.state.counter++;
    console.log("testing with", this.state.counter);

    if (this.state.counter >= 1 << this.inputs.length) {
      this.state.win = true;
      this.state.running = false;
      return;
    } // set all the bits


    var inputBits = [];

    for (var i = 0; i < this.inputs.length; i++) {
      var bit = Boolean(this.state.counter >> i & 1); // it's either a single input or an array

      var array = this.inputs[i];

      if (array instanceof _InputBit.default) {
        array = [array];
      }

      for (var j = 0; j < array.length; j++) {
        array[j].state.bits[0] = bit;
      }

      inputBits.push(bit);
    } // update the exploration


    this.exploration.update(); // check it

    var outputBits = this.checkFunction(inputBits);

    for (var i = 0; i < this.outputs.length; i++) {
      if (outputBits[i] != this.outputs[i].state.bits[0]) {
        this.state.lose = true;
        this.state.running = false;
        this.state.loseCorrectAnswer = outputBits;
        this.state.loseWrongAnswer = this.outputs.map(function (x) {
          return x.state.bits[0];
        });
        return;
      }
    } // if it survived...


    var timeDelay = 1000;
    var escalation = 2;

    while (escalation < this.state.counter - 1) {
      escalation++;
    }

    timeDelay = 1000 / (escalation - 1);
    this.timer = window.setTimeout(this.nextTest.bind(this), timeDelay);
  };

  AnswerChecker.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = (0, _dark.getApplianceColor)(isDark);
    ctx.beginPath();
    var r = Math.min(this.size.y * 0.2, this.size.x * 0.1);
    var w = this.size.x,
        h = this.size.y;
    ctx.moveTo(w * 0.5, 0);
    ctx.arcTo(w * 1.0, 0, w * 1.0, h * 0.5, r);
    ctx.arcTo(w * 1.0, h * 1.0, w * 0.5, h * 1.0, r);
    ctx.arcTo(0, h * 1.0, 0, h * 0.5, r);
    ctx.arcTo(0, 0, w * 0.5, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // test button
    // red = stopped or failed, green = win, yellow = running

    if (this.state.win) {
      ctx.fillStyle = isDark ? "#228822" : "#33cc33";
      ctx.strokeStyle = isDark ? "#006600" : "#009900";
    } else if (this.state.running) {
      ctx.fillStyle = isDark ? "#999922" : "#eeee22";
      ctx.strokeStyle = isDark ? "#666600" : "#999900";
    } else {
      ctx.fillStyle = isDark ? "#993333" : "#cc3333";
      ctx.strokeStyle = isDark ? "#660000" : "#990000";
    }

    ctx.lineWidth = 6;
    ctx.beginPath();
    var y = 28;
    r = 30;
    ctx.moveTo(80, y - 20);
    ctx.lineTo(120, y - 20);
    ctx.arc(120, y, 20, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(40, y + 20);
    ctx.arc(40, y, 20, Math.PI / 2, 3 * Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isDark ? "#999" : "#000";
    ctx.font = "30px monospace";
    ctx.textAlign = "center";
    ctx.fillText(this.state.running ? "STOP" : "TEST", 80, y + 9);
    ctx.font = "20px sans-serif";
    var message;

    if (this.state.win) {
      message = "Good job!";
    } else if (this.state.lose) {
      message = "";
      ctx.font = (this.inputs.length < 4 ? "16" : "14") + "px sans-serif";
      ctx.fillText("Oops! That should", 80, 67);
      var correct = this.state.loseCorrectAnswer.map(Number).join("");
      var wrong = this.state.loseWrongAnswer.map(Number).join("");
      ctx.fillText("be [" + correct + "], not [" + wrong + "].", 80, 84);
    } else if (this.state.running) {
      message = this.state.counter + 1 + " of " + (1 << this.inputs.length);
    } else {
      message = "are you ready?";
      ctx.font = "18px sans-serif";
    }

    ctx.fillText(message, 80, 76);
    ctx.restore();
  };

  AnswerChecker.prototype.evaluate = function (bits) {
    return [];
  };

  return AnswerChecker;
}();

var _default = AnswerChecker;
exports.default = _default;
},{"./InputBit":"InputBit.ts","./dark":"dark.ts"}],"ChoiceExploration.ts":[function(require,module,exports) {
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

var _UserGates = require("./UserGates");

var _AnswerChecker = _interopRequireDefault(require("./AnswerChecker"));

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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

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

    var inputChoice = new _InputBit.default(20, 100, false, 30);
    var inputIf = new _InputBit.default(90, 70, false, 30);
    var inputElse = new _InputBit.default(150, 70, false, 30);
    var inverterLeft = new _UserGates.NotSwitch(50, 135, 40, 0);

    _this.components.push(inverterLeft);

    inverterLeft.inputWires.push(new _Wire.default(inputChoice, 0, [{
      x: inverterLeft.position.x,
      y: inputChoice.position.y,
      node: true
    }, {
      x: inputChoice.position.x,
      y: inputChoice.position.y
    }]));
    var inverterRight = new _UserGates.NotSwitch(125, 135, 40, 0);

    _this.components.push(inverterRight);

    inverterRight.inputWires.push(new _Wire.default(inputChoice, 0, [{
      x: inverterRight.position.x,
      y: inputChoice.position.y
    }, {
      x: inputChoice.position.x,
      y: inputChoice.position.y
    }])); // recursive components are a bit weird

    var andIf = new _UserGates.BinarySwitch(inverterLeft.position.x + 9, 210, 60, 0);
    var andElse = new _UserGates.BinarySwitch(141, 210, 60, 0);
    var or = new _UserGates.BinarySwitch(100, 300, 60, 0);
    andIf.inputWires = [new _Wire.default(inverterLeft, 0, []), new _Wire.default(inputIf, 0, [{
      x: andIf.position.x + 9,
      y: 170
    }, {
      x: inputIf.position.x,
      y: 170
    }])];
    andElse.inputWires = [new _Wire.default(inverterRight, 0, [{
      x: andElse.position.x - 9,
      y: 170
    }, {
      x: inverterRight.position.x,
      y: 170
    }]), new _Wire.default(inputElse, 0, [{
      x: andElse.position.x + 9,
      y: 170
    }, {
      x: inputElse.position.x,
      y: 170
    }])];
    or.inputWires = [new _Wire.default(andIf, 0, []), new _Wire.default(andElse, 0, [])];

    _this.components.push(andIf, andElse, or);

    _this.components.push(inputChoice, inputIf, inputElse); // for people to debug their circuits


    var helpLeft = new _OutputBit.default(andIf.position.x, andIf.position.y + 35, 10);
    helpLeft.inputWires.push(new _Wire.default(andIf, 0));
    var helpRight = new _OutputBit.default(andElse.position.x, andElse.position.y + 35, 10);
    helpRight.inputWires.push(new _Wire.default(andElse, 0));

    _this.components.push(helpLeft, helpRight);

    _this.outputComponents.push(helpLeft, helpRight);

    var output = new _OutputBit.default(100, 345, 30);
    output.inputWires.push(new _Wire.default(or, 0));

    _this.components.push(output);

    _this.outputComponents.push(output); // the simplified version


    var inputChoice2 = new _InputBit.default(240, 160, false, 30);
    var inputIf2 = new _InputBit.default(280, 120, false, 30);
    var inputElse2 = new _InputBit.default(320, 120, false, 30);
    var choice = new _ChoiceGate.default(300, 200, 40);
    var output2 = new _OutputBit.default(300, 250, 30);
    choice.inputWires.push(new _Wire.default(inputChoice2, 0, [{
      x: inputChoice2.position.x,
      y: choice.position.y
    }]));
    choice.inputWires.push(new _Wire.default(inputIf2, 0));
    choice.inputWires.push(new _Wire.default(inputElse2, 0));
    output2.inputWires.push(new _Wire.default(choice, 0));

    _this.components.push(choice, output2, inputChoice2, inputIf2, inputElse2);

    _this.outputComponents.push(output2);

    var checker = new _AnswerChecker.default(_this, 310, 350, [[inputChoice, inputChoice2], [inputIf, inputIf2], [inputElse, inputElse2]], [output], function (bits) {
      return [bits[0] ? bits[1] : bits[2]];
    });

    _this.components.push(checker);

    _this.outputComponents.push(checker);

    return _this;
  }

  return ChoiceExploration;
}(_Exploration.default);

var _default = ChoiceExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./ChoiceGate":"ChoiceGate.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./UserGates":"UserGates.ts","./AnswerChecker":"AnswerChecker.ts"}],"Clock.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

// Clock.ts
//
// These clocks can have an arbitrary period.
var Clock =
/** @class */
function () {
  //
  function Clock(x, y, width, height) {
    if (width === void 0) {
      width = 50;
    }

    if (height === void 0) {
      height = 50;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: width,
      y: height
    }; // because .fill() isn't supported?!

    var bitArray = Array(2).map(function (_) {
      return false;
    });
    this.state = {
      bits: bitArray,
      clock: -1
    };
    this.numBits = 2; // "power supply" or more accurately a way to reset the clock

    this.inputSockets = [{
      x: 0,
      y: -this.size.y / 2 - 1
    }];
    this.outputSockets = [];
    var spacing = width / 2;

    for (var i = 0; i < 2; i++) {
      this.outputSockets.push({
        x: (i - 1 / 2) * spacing,
        y: this.size.y / 2
      });
    }

    this.inputWires = [];
  }

  Clock.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = (0, _dark.getApplianceColor)(isDark);
    ctx.beginPath();
    var r = Math.min(this.size.y * 0.2, this.size.x * 0.1);
    var w = this.size.x,
        h = this.size.y;
    ctx.moveTo(w * 0.5, 0);
    ctx.arcTo(w * 1.0, 0, w * 1.0, h * 0.5, r);
    ctx.arcTo(w * 1.0, h * 1.0, w * 0.5, h * 1.0, r);
    ctx.arcTo(0, h * 1.0, 0, h * 0.5, r);
    ctx.arcTo(0, 0, w * 0.5, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // power

    ctx.translate(w / 2, 0); // move origin to top-middle

    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.lineTo(2, -1);
    ctx.lineTo(-2, -1);
    ctx.lineTo(-2, -5);
    ctx.stroke(); // clock

    ctx.fillStyle = isDark ? "#555555" : "#e0e0e4";
    r = Math.min(w / 3, h / 3);
    ctx.translate(0, h / 2); // move origin to center

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke(); // ticks

    ctx.save();
    var angle = 2 * Math.PI / this.numBits;

    for (var i = 0; i < this.numBits; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, -r * 0.8 + 1);
      ctx.stroke();
      ctx.rotate(angle);
    }

    ctx.restore(); // hand

    ctx.save();
    ctx.rotate(this.state.clock * angle);
    ctx.lineWidth *= 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, r * 0.25);
    ctx.lineTo(0, -r * 0.8);
    ctx.stroke();
    ctx.lineWidth *= 5 / 3;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore(); // outputs

    for (var i = 0; i < this.outputSockets.length; i++) {
      var socket = this.outputSockets[i];
      ctx.fillStyle = (0, _dark.getBitColor)(i == this.state.clock, isDark);
      ctx.beginPath();
      ctx.arc(socket.x, socket.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }; // Evaluation: the clock's state is set on


  Clock.prototype.evaluate = function (bits) {
    var result = [];

    for (var i = 0; i < this.numBits; i++) {
      result.push(i == this.state.clock);
    }

    return result;
  };

  Clock.prototype.beforeUpdate = function () {
    var _a;

    if ((_a = this.inputWires[0]) === null || _a === void 0 ? void 0 : _a.get()) {
      this.state.clock = (this.state.clock + 1) % this.numBits;
    } else {
      this.state.clock = -1;
    }
  };

  return Clock;
}();

var _default = Clock;
exports.default = _default;
},{"./dark":"dark.ts"}],"ClockExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Clock = _interopRequireDefault(require("./Clock"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ClockExploration.ts
//
// Exploration of a clock, more meant to illustrate the time-based explorations.
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

// pass the components and output components arrays
function makeClock(x, y, components, outputComponents) {
  var clock = new _Clock.default(x, y, 100, 60);
  var powerButton = new _InputBit.default(x, y - 100, true, 40);
  clock.inputWires.push(new _Wire.default(powerButton, 0));
  components.push(clock, powerButton);

  for (var i = 0; i < 2; i++) {
    var output = new _OutputBit.default(x + clock.outputSockets[i].x, y + 100);
    output.inputWires.push(new _Wire.default(clock, i));
    components.push(output);
    outputComponents.push(output);
  }
}

var ClockExploration =
/** @class */
function (_super) {
  __extends(ClockExploration, _super);

  function ClockExploration(canvas) {
    var _this = _super.call(this, canvas, 300, 300) || this;

    _this.animated = true;
    makeClock(150, 150, _this.components, _this.outputComponents);
    return _this;
  }

  return ClockExploration;
}(_Exploration.default);

var _default = ClockExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts"}],"RegisterBit.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

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

    var offset = size * 0.45;
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

  RegisterBit.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = (0, _dark.getBitColor)(this.state.bits[0], isDark);
    ctx.beginPath();
    ctx.moveTo(this.size.x * 0.5, 0);
    ctx.lineTo(this.size.x * 1.0, this.size.y * 0.5);
    ctx.lineTo(this.size.x * 0.5, this.size.y);
    ctx.lineTo(this.size.x * 0.0, this.size.y * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // load input

    ctx.fillStyle = isDark ? "#446666" : "#ccffff";
    ctx.strokeStyle = (0, _dark.getStrokeColor)(isDark);
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
},{"./dark":"dark.ts"}],"Subtractor.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

// Adder.ts
var Subtractor =
/** @class */
function () {
  // bits=8 means an 8-bit plus 8-bit
  function Subtractor(x, y, bits, width, height) {
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

    var spacing = width / (2 * bits + 1);

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

  Subtractor.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = (0, _dark.getApplianceColor)(isDark);
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + this.size.x * 0.46, top);
    ctx.lineTo(left + this.size.x * 0.5, top + this.size.x * 0.05);
    ctx.lineTo(left + this.size.x * 0.54, top);
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
      ctx.fillText(String(i), this.position.x + socket.x * 0.95, this.position.y + socket.y + 10);
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
      num1 += (wire1 && wire1.get() ? 1 : 0) * (1 << i);
      num2 += (wire2 && wire2.get() ? 1 : 0) * (1 << i);
    }

    var textSize = Math.round(Math.min(this.size.x * 0.125, this.size.y * 0.5));
    ctx.font = textSize + "px monospace";
    ctx.fillStyle = "black";
    ctx.fillText(String(num1) + " - " + String(num2), this.position.x, this.position.y);
    ctx.restore();
  };

  Subtractor.prototype.evaluate = function (bits) {
    var num1 = 0,
        num2 = 0; // cheating here but that's not the point

    for (var i = 0; i < this.numBits; i++) {
      num1 += Number(bits[i]) * (1 << i);
      num2 += Number(bits[i + this.numBits]) * (1 << i);
    }

    var answer = num1 - num2;
    var answerBits = Array(this.numBits + 1);

    for (var i = 0; i <= this.numBits; i++) {
      answerBits[i] = (answer & 1 << i) != 0;
    } //console.log(answerBits);


    return answerBits;
  };

  Subtractor.prototype.beforeUpdate = function () {
    // The simulation was having some bugs without this
    this.state.bits = this.evaluate(this.inputWires.map(function (wire) {
      return wire ? wire.get() : false;
    }));
  };

  return Subtractor;
}();

var _default = Subtractor;
exports.default = _default;
},{"./dark":"dark.ts"}],"Countdown.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dark = require("./dark");

// Countdown.ts
//
// These clocks can have an arbitrary period.
var Countdown =
/** @class */
function () {
  //
  function Countdown(x, y, cap, width, height) {
    if (width === void 0) {
      width = 60;
    }

    if (height === void 0) {
      height = 50;
    }

    this.position = {
      x: x,
      y: y
    };
    this.size = {
      x: width,
      y: height
    }; // because .fill() isn't supported?!

    var bitArray = Array(2).map(function (_) {
      return false;
    });
    this.state = {
      bits: bitArray,
      count: cap
    };
    this.startValue = cap;
    this.numBits = 2; // "power supply" or more accurately a way to reset the clock

    this.inputSockets = [{
      x: 0,
      y: -this.size.y / 2 - 1
    }, {
      x: -this.size.x / 2,
      y: -this.size.y / 2
    }];
    this.outputSockets = [{
      x: 0,
      y: this.size.y / 2
    }];
    this.inputWires = [];
  }

  Countdown.prototype.render = function (ctx, isDark) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2;
    ctx.translate(left, top); // base

    ctx.fillStyle = (0, _dark.getApplianceColor)(isDark);
    ctx.beginPath();
    var r = Math.min(this.size.y * 0.2, this.size.x * 0.1);
    var w = this.size.x,
        h = this.size.y;
    ctx.moveTo(w * 0.5, 0);
    ctx.arcTo(w * 1.0, 0, w * 1.0, h * 0.5, r);
    ctx.arcTo(w * 1.0, h * 1.0, w * 0.5, h * 1.0, r);
    ctx.arcTo(0, h * 1.0, 0, h * 0.5, r);
    ctx.arcTo(0, 0, w * 0.5, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // clock icon

    r = Math.min(w / 8, h / 8);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.6, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.stroke(); // power

    ctx.translate(w / 2, 0); // move origin to top-middle

    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.lineTo(2, -1);
    ctx.lineTo(-2, -1);
    ctx.lineTo(-2, -5);
    ctx.stroke();
    r *= 0.8;
    ctx.lineWidth *= 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(r * 0.4, r * 0.5);
    ctx.lineTo(-r * 0.8, r * 1.5);
    ctx.lineTo(r * 0.8, r * 1.5);
    ctx.lineTo(-r * 0.4, r * 2.5);
    ctx.stroke();
    ctx.lineWidth /= 2; // clock

    ctx.fillStyle = (0, _dark.getTextColor)(isDark);
    ctx.font = String(Math.round(this.size.y * 0.6)) + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.state.count.toString(), 0, h * 0.50);
    ctx.translate(0, h / 2); // outputs

    ctx.fillStyle = (0, _dark.getBitColor)(this.state.count == 0, isDark);
    ctx.beginPath();
    ctx.arc(0, h / 2, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }; // Evaluation: we give a "1" output when it expires


  Countdown.prototype.evaluate = function (bits) {
    return [this.state.count == 0];
  };

  Countdown.prototype.beforeUpdate = function () {
    var _a, _b; // 0 = the power button, if off it resets


    if ((_a = this.inputWires[0]) === null || _a === void 0 ? void 0 : _a.get()) {
      // 1 = the clock input, if off it holds
      if ((_b = this.inputWires[1]) === null || _b === void 0 ? void 0 : _b.get()) {
        this.state.count--;
        if (this.state.count < 0) this.state.count = 0;
      }
    } else {
      this.state.count = this.startValue;
    }
  };

  return Countdown;
}();

var _default = Countdown;
exports.default = _default;
},{"./dark":"dark.ts"}],"DividerExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _RegisterBit = _interopRequireDefault(require("./RegisterBit"));

var _Subtractor = _interopRequireDefault(require("./Subtractor"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Clock = _interopRequireDefault(require("./Clock"));

var _Display = _interopRequireDefault(require("./Display"));

var _Gates = require("./Gates");

var _ChoiceGate = _interopRequireDefault(require("./ChoiceGate"));

var _Countdown = _interopRequireDefault(require("./Countdown"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// DividerExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
/*

steps:
1. Start with dividend (numerator) in RIGHT half of remainder register
2. Shift the remainder left
3. Send the LEFT half in for subtraction
4. If the result is negative, write it, else keep the remainder as is
5. Put the opposite of the sign bit on the new 1 position
6. Go back to step 2, although when the larger clock strikes, record the results (I expect it to be 2*6+3 or 3*6+5 cycles).

next steps:
- carry from the subtractor needs to enter the choice gates
- on purple, we get the subtraction results, and if the sign bit is off, we insert it into the register
- also on purple, that sign bit needs to shift the LEFT

I think I need to totally reconfigure the remainder part

Remainder register:
- If power button is off, set to zero (6-12) or numerator (0-5)
- If power button is on:
    - on purple we may receive a subtraction, but this only applies to bits 6-12
    - on green we need to shift left, setting a carry bit. (This will require an additional register.)



*/


var DividerExploration =
/** @class */
function (_super) {
  __extends(DividerExploration, _super);

  function DividerExploration(canvas) {
    var _this = _super.call(this, canvas) || this;

    _this.animated = true;

    _this.afterRender = function () {
      // display the quotient
      var ctx = _this.context;
      ctx.save();
      var B = _this.numBits; // get the clock cycle

      var cycle = _this.countdown.state.count;
      var n = cycle + (1 - _this.clock.state.clock);

      if (n <= B + 1 && _this.clock.state.clock >= 0) {
        var rValue = 0,
            qValue = 0;
        var rOffset = B + 2 - n; // a quirk of my hardware

        for (var i = 0; i < B; i++) {
          var bit = _this.remainderRegister[i + rOffset];
          rValue += Number(bit.state.bits[0]) * (1 << i);
        }

        for (var i = 0; i < B - n; i++) {
          var bit = _this.remainderRegister[i];
          qValue += Number(bit.state.bits[0]) * (1 << i + n - 1);
        }

        _this.drawRemainderGuide(rOffset + _this.numBits - 1, rOffset, "#33c", "Remainder (" + rValue + ")");

        if (n <= B) {
          _this.drawRemainderGuide(B - n, 0, "#990", "Quotient (" + qValue + ")");
        }
      }

      ctx.restore(); // not sure where to put this

      if (cycle == 0) {
        _this.startButton.state.bits = [false];
        if (!_this.paused) _this.paused = true;
      }
    };

    canvas.width = 720;
    canvas.height = 600; // A lot of the same stuff happens compared to Multiplier...

    var BITS = 5;
    _this.numBits = BITS;
    var startButton = new _InputBit.default(660, 40, false, 50);
    _this.startButton = startButton; // probably more user friendly

    var thisExploration = _this;

    startButton.onClick = function () {
      thisExploration.update(); // get the bits ready

      startButton.constructor.prototype.onClick.apply(startButton, arguments);

      if (startButton.state.bits[0]) {
        setTimeout(function () {
          thisExploration.resume();
        }, 1000);
      }

      return true;
    };

    var clockX = startButton.position.x;
    var clock = new _Clock.default(clockX, 125, 50, 50);
    clock.inputWires.push(new _Wire.default(startButton, 0));

    _this.components.push(clock);

    _this.clock = clock; // when this clock strikes 2*BITS + 4 it will end the operation
    // but I add one more to avoid confusion

    var countdown = new _Countdown.default(clockX + 20, 220, BITS + 1, 60, 45);
    countdown.inputWires.push(new _Wire.default(startButton, 0, [{
      x: countdown.position.x,
      y: countdown.position.y - 40
    }, {
      x: startButton.position.x + 40,
      y: countdown.position.y - 40
    }, {
      x: startButton.position.x + 40,
      y: startButton.position.y
    }]));
    countdown.inputWires.push(new _Wire.default(clock, 1));
    _this.countdown = countdown;
    var subtractor = new _Subtractor.default(210, 180, BITS, 11 * 26, 90); //this.outputComponents.push(subtractor);
    // Also not really a register.

    var remainderRegister = [];
    _this.remainderRight = 585;
    _this.remainderSpacing = 54;

    for (var i = 0; i < 2 * BITS + 1; i++) {
      var reg = new _OutputBit.default(_this.remainderRight - _this.remainderSpacing * i, 460, 20);
      remainderRegister.push(reg);

      _this.outputComponents.unshift(reg); // todo: is needed?


      _this.components.push(reg);
    } // Wire Coloring


    var purple = {
      color: "rgb(128, 32, 128)",
      darkColor: "rgba(160, 48, 160)"
    };
    var purpleFaded = {
      color: "rgba(128, 0, 128, 0.25)",
      darkColor: "rgba(160, 40, 160, 0.33)"
    };
    var teal = {
      color: "rgb(0, 128, 128)"
    };
    var tealFaded = {
      color: "rgba(0, 128, 128, 0.35)"
    };
    var blue = {
      color: "rgba(32, 64, 128, 0.8)",
      darkColor: "rgba(96, 112, 160, 0.8)"
    };
    var blueFaded = {
      color: "rgba(32, 64, 128, 0.4)",
      darkColor: "rgba(96, 112, 160, 0.4)"
    }; //const yellow = {color: "rgba(160, 160, 0)"};
    // Input Numbers (N/D). D = divisor, N = dividend

    var inputN = [];
    var inputD = [];

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(subtractor.position.x + subtractor.inputSockets[BITS + i].x, 30, false, 22);

      _this.components.push(input);

      inputN.push(input); // in case we need it
    }

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(inputN[i].position.x, 95, false, 22);

      _this.components.push(input);

      inputD.push(input);
    } // Wires from the registers to the subtractor.


    for (var i = 0; i < BITS; i++) {
      var d = 2;
      var bit = remainderRegister[i + BITS]; // basically, we want the most significant bit to be highest

      var y1 = bit.position.y + 15 + d * (BITS - i);
      var y2 = subtractor.position.y - 70;
      subtractor.inputWires.push(new _Wire.default(bit, 0, [{
        x: subtractor.position.x + subtractor.inputSockets[i].x - 0,
        y: y2 + d * i
      }, {
        x: 3 + d * i,
        y: y2 + d * i
      }, {
        x: 3 + d * i,
        y: y1
      }, {
        x: bit.position.x,
        y: y1
      }], {
        color: "rgba(128, 0, 128, 0.75)"
      }));
    } // The other subtractor registers (to the divisor)


    for (var i = 0; i < BITS; i++) {
      subtractor.inputWires.push(new _Wire.default(inputD[i], 0));
    } // Choice Gates coming out of the subtractor (writes if subtracted).


    var subtractorChoiceGates = [];

    for (var i = 0; i < BITS; i++) {
      //const x = subtractor.position.x + subtractor.outputSockets[i].x;
      var y = subtractor.position.y + subtractor.outputSockets[0].y; // put them all on the same line
      // space them out a little

      var choice = new _ChoiceGate.default(remainderRegister[i + BITS].position.x - 2, y + 60, 14); // choice depends on whether or not the carry bit is positive or negative

      choice.inputWires.push(new _Wire.default(subtractor, BITS, [{
        x: choice.position.x - 20,
        y: choice.position.y
      }, {
        x: choice.position.x - 20,
        y: choice.position.y - 25
      }, {
        x: subtractor.position.x - subtractor.size.x / 2,
        y: choice.position.y - 25
      }, {
        x: subtractor.position.x - subtractor.size.x / 2,
        y: subtractor.position.y
      }], {
        color: "#888"
      })); // if negative, we just re-use the remainder register

      var regBit = remainderRegister[i + BITS];
      choice.inputWires.push(new _Wire.default(regBit, 0, [{
        x: choice.position.x - 7,
        y: choice.position.y - 17
      }, {
        x: regBit.position.x + 20,
        y: choice.position.y - 17
      }, {
        x: regBit.position.x + 20,
        y: regBit.position.y
      }], purple)); // otherwise we use the subtraction

      var y2 = choice.position.y - 32 - Math.round(Math.abs(i - BITS / 2)) * 4;
      choice.inputWires.push(new _Wire.default(subtractor, i, [{
        x: choice.position.x + 7,
        y: y2
      }, {
        x: subtractor.position.x + subtractor.outputSockets[i].x,
        y: y2
      }]));
      subtractorChoiceGates.push(choice);

      _this.components.push(choice);
    } // Shifting the Remainder Register
    // wires:
    // (1) the faded purple wires from the clock control
    // includes many wires
    // also includes register for holding the quotient input


    var fullRow = [];

    for (var i = 0; i <= 2 * BITS; i++) {
      var regBit = remainderRegister[i];
      /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
      this.components.push(or);
      regBit.inputWires.push(new Wire(or, 0));*/
      // This is the middle (full) row

      var choice = new _ChoiceGate.default(regBit.position.x + (i < BITS ? 5 : -1), regBit.position.y - 95, 14); // Selection Wire (from clock's left end)

      choice.inputWires.push(new _Wire.default(clock, 0, [{
        x: choice.position.x - 18,
        y: choice.position.y
      }, {
        x: choice.position.x - 18,
        y: choice.position.y - 40
      }, {
        x: 540 - 2 * i,
        y: choice.position.y - 50 - 1 * i
      }, {
        x: clockX - 60,
        y: clock.position.y + clock.size.y / 2
      }], purpleFaded)); // Purple action

      if (i >= BITS && i < 2 * BITS) {
        // Upper Half of the Register: Conditionally connect to the subtractor.
        choice.inputWires.push(new _Wire.default(subtractorChoiceGates[i - BITS], 0, [], purple));
      } else {
        // Lower Half of the Register: Connect to itself.
        choice.inputWires.push(new _Wire.default(regBit, 0, [{
          x: choice.position.x - 7,
          y: choice.position.y - 25
        }, {
          x: regBit.position.x - 18,
          y: choice.position.y - 25
        }, {
          x: regBit.position.x - 18,
          y: regBit.position.y
        }], purple));
      } // Shifting and the Ones Bit


      if (i > 0) {
        choice.inputWires.push(new _Wire.default(remainderRegister[i - 1], 0, [{
          x: choice.position.x + 7,
          y: choice.position.y - 25
        }, {
          x: regBit.position.x + 26,
          y: choice.position.y - 25
        }, {
          x: regBit.position.x + 26,
          y: regBit.position.y + 0
        }], teal));
      } else {
        var holdWrite = new _OutputBit.default(choice.position.x + 7, choice.position.y - 40, 20);
        var notY = subtractorChoiceGates[0].position.y - 25;
        var not = new _Gates.Not(_this.remainderRight - _this.remainderSpacing * 1.5, notY, 40, -90);
        not.inputWires.push(new _Wire.default(subtractor, BITS, [{
          x: subtractor.position.x - subtractor.size.x / 2,
          y: notY
        }, {
          x: subtractor.position.x - subtractor.size.x / 2,
          y: subtractor.position.y
        }], {
          color: "#888"
        })); // set on green
        //holdWrite.inputWires.push(new Wire(clockNot, 0, [], teal));
        // value is negated result of subtraction

        holdWrite.inputWires.push(new _Wire.default(not, 0, [{
          x: holdWrite.position.x,
          y: not.position.y
        }], teal)); // maybe?
        //choice.inputWires[1] = new Wire(holdWrite, 0, [], purple);

        choice.inputWires.push(new _Wire.default(holdWrite, 0, [], teal));

        _this.components.push(not, holdWrite);

        _this.outputComponents.push(holdWrite);
      }

      _this.components.push(choice);

      fullRow.push(choice);
    } // Computing the Quotient
    // The second input register that is actually a register.
    // Wiring Dividend to seed the remainder register
    // (blue wires, including faded ones)


    var blueRightEdge = _this.remainderRight + 33 + 2 * BITS;
    var dividendChoice = [];

    for (var i = 0; i < BITS; i++) {
      var regBit = remainderRegister[i];
      var inBit = inputN[i]; // This is the one close to the lowest 6 registers

      var choice = new _ChoiceGate.default(regBit.position.x + 3, regBit.position.y - 50, 12); // Wire coming from the start button

      choice.inputWires.push(new _Wire.default(startButton, 0, [{
        x: choice.position.x - 15,
        y: choice.position.y
      }, {
        x: choice.position.x - 15,
        y: choice.position.y + 15,
        node: true
      }, {
        x: blueRightEdge,
        y: choice.position.y + 15
      }, {
        x: blueRightEdge,
        y: startButton.position.y + (startButton.position.x - blueRightEdge)
      }], blue)); // If power is on, make it come from the teal/purple stuff

      choice.inputWires.push(new _Wire.default(fullRow[i], 0)); // Otherwise, set it to the input

      var d = 2;
      var y1 = fullRow[0].position.y - 70 - d * BITS;
      var y2 = inBit.position.y + 30;
      var x1 = _this.remainderRight + 24 + d * BITS;
      choice.inputWires.push(new _Wire.default(inBit, 0, [{
        x: choice.position.x + 6,
        y: choice.position.y - 10 - d * i
      }, {
        x: x1 - d * i,
        y: choice.position.y - 10 - d * i
      }, {
        x: x1 - d * i,
        y: y1 + d * i
      }, {
        x: clockX - 90 - d * i,
        y: y1 + d * i
      }, {
        x: clockX - 90 - d * i,
        y: y2 + d * i
      }, {
        x: inBit.position.x,
        y: y2 + d * i
      }], blueFaded));

      _this.components.push(choice);

      dividendChoice.push(choice);
      regBit.inputWires.push(new _Wire.default(choice, 0));
    } // Clearing the "remainder" (heh heh) of the register
    // (blue wires)


    for (var i = 0; i <= BITS; i++) {
      var regBit = remainderRegister[i + BITS];
      var and = new _Gates.AndGate(regBit.position.x, regBit.position.y - 50, 24, 0); // similar to above, use the full row if the power is on

      and.inputWires.push(new _Wire.default(fullRow[i + BITS], 0));
      and.inputWires.push(new _Wire.default(startButton, 0, [{
        x: and.position.x + 5,
        y: and.position.y - 20
      }, {
        x: and.position.x + 14,
        y: and.position.y - 20
      }, {
        x: and.position.x + 14,
        y: and.position.y + 15,
        node: i < BITS
      }, {
        x: blueRightEdge,
        y: and.position.y + 15
      }, {
        x: blueRightEdge,
        y: startButton.position.y + (startButton.position.x - blueRightEdge)
      }], blue));

      _this.components.push(and);

      regBit.inputWires.push(new _Wire.default(and, 0));
    } // Control Wire from the final register bit to the subtractor's output

    /*const regLSB = divisorRegister[0];
    for (let i = 0; i <= BITS; i++) {
        const choice = subtractorChoiceGates[i];
        // Selector Wire
        choice.inputWires.unshift(new Wire(regLSB, 0, [
            {x: choice.position.x - 13, y: choice.position.y},
            {x: choice.position.x - 13, y: choice.position.y - 20},
            {x: 282, y: choice.position.y - 20},
            {x: 282, y: regLSB.position.y + 20},
            {x: regLSB.position.x, y: regLSB.position.y + 20},
        ], {color: "rgb(127, 127, 127)"}));
        choice.inputWires.unshift(null);
         // Else wire
        const outBit = remainderRegister[i + BITS];
        choice.inputWires.push(new Wire(outBit, 0, [
            {x: choice.position.x + 5, y: choice.position.y - 10},
            {x: outBit.position.x + 19, y: choice.position.y - 10},
            {x: outBit.position.x + 19, y: outBit.position.y - 19},
        ], purpleFaded));
    }*/
    // Answer Register


    var finalAnswer = [];

    for (var i = 0; i < 2 * BITS; i++) {
      var offset = i < BITS ? 5 : -10;
      var from = remainderRegister[i + (i >= BITS ? 1 : 0)];
      var bit = new _RegisterBit.default(from.position.x + offset, 580, 25);

      _this.components.push(bit);

      _this.outputComponents.push(bit); // set wire: on at the 14th clock cycle


      var x1 = countdown.position.x + countdown.outputSockets[0].x;
      bit.inputWires.push(new _Wire.default(countdown, 0, [{
        x: bit.position.x - 15,
        y: bit.position.y - 15
      }, {
        x: bit.position.x - 15,
        y: bit.position.y - 30
      }, {
        x: x1,
        y: bit.position.y - 30
      }, {
        x: x1,
        y: countdown.position.y + 40
      }], {
        color: "rgb(128, 128, 128)"
      })); // what wire: from the corresponding from the product "register"

      var diagonal = 15;
      bit.inputWires.push(new _Wire.default(from, 0, [{
        x: bit.position.x + diagonal,
        y: bit.position.y - diagonal
      }, {
        x: from.position.x + diagonal + offset,
        y: from.position.y + diagonal + offset
      }]));
      finalAnswer.push(bit);
    } // finally, add displays


    var displayN = new _Display.default(inputN[0].position.x + 54, inputN[0].position.y, inputN, false, 36);
    var displayD = new _Display.default(inputD[0].position.x + 54, inputD[0].position.y, inputD, false, 36);
    var displayQ = new _Display.default(557, 540, finalAnswer.slice(0, BITS), false, 30);
    var displayR = new _Display.default(200, 540, finalAnswer.slice(BITS, 2 * BITS), false, 30); // rendering trick, because input wires are drawn with a component
    // so pushing these last makes them render last so it looks cleaner

    _this.components.push(subtractor, countdown, startButton, displayN, displayD, displayQ, displayR);

    _this.remainderRegister = remainderRegister;
    return _this;
  }

  DividerExploration.prototype.drawRemainderGuide = function (left, right, color, text) {
    var ctx = this.context;
    var x1 = this.remainderRight - left * this.remainderSpacing - 15;
    var x2 = this.remainderRight - right * this.remainderSpacing + 15;
    var y = 480;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "none";
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 + 10, y + 10);
    ctx.lineTo(x2 - 10, y + 10);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.33)";
    ctx.lineWidth = 8;
    ctx.fillStyle = color;
    ctx.font = "30px monospace";
    ctx.strokeText(text, (x1 + x2) / 2, y + 25);
    ctx.fillText(text, (x1 + x2) / 2, y + 25);
  };

  return DividerExploration;
}(_Exploration.default);

var _default = DividerExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./RegisterBit":"RegisterBit.ts","./Subtractor":"Subtractor.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./Display":"Display.ts","./Gates":"Gates.ts","./ChoiceGate":"ChoiceGate.ts","./Countdown":"Countdown.ts"}],"FullAdderGates.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

var _Gates = require("./Gates");

var _UserGates = require("./UserGates");

var _AnswerChecker = _interopRequireDefault(require("./AnswerChecker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FullAdderGates.ts
//
// Still just one bit each. That is, three total (A,B,carry).
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var FullAdderExploration1 =
/** @class */
function (_super) {
  __extends(FullAdderExploration1, _super);

  function FullAdderExploration1(canvas) {
    var _this = _super.call(this, canvas, 480, 400) || this;

    var inputA = new _InputBit.default(40, 50, false, 32);
    var inputB = new _InputBit.default(160, 50, false, 32);
    var inputC = new _InputBit.default(240, 180, false, 32);
    var output1 = new _OutputBit.default(inputB.position.x - 1, 340, 30);
    var output2 = new _OutputBit.default(inputA.position.x + 19, 340, 30);
    var and1 = new _Gates.AndGate(inputA.position.x + 10, 125, 50, 0);
    and1.inputWires.push(new _Wire.default(inputA, 0));
    and1.inputWires.push(new _Wire.default(inputB, 0, [{
      x: and1.position.x + 10,
      y: and1.position.y - 35
    }]));
    var xor1 = new _Gates.XorGate(inputB.position.x - 10, 125, 50, 0);
    xor1.inputWires.push(new _Wire.default(inputA, 0, [{
      x: xor1.position.x - 10,
      y: and1.position.y - 35
    }]));
    xor1.inputWires.push(new _Wire.default(inputB, 0));
    var xor2 = new _UserGates.BinarySwitch(output1.position.x, 280, 60, 0);
    xor2.inputWires.push(new _Wire.default(xor1, 0));
    xor2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: xor2.position.x + 9,
      y: inputC.position.y,
      node: true
    }]));
    output1.inputWires.push(new _Wire.default(xor2, 0));
    var and2 = new _UserGates.BinarySwitch(output2.position.x + 30, 220, 60, 0);
    and2.inputWires.push(new _Wire.default(xor1, 0, [{
      x: and2.position.x - 9,
      y: 165
    }, {
      x: xor1.position.x,
      y: 165,
      node: true
    }]));
    and2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: and2.position.x + 9,
      y: inputC.position.y
    }])); // or gate for the "2" output

    var or2 = new _UserGates.BinarySwitch(output2.position.x, output2.position.y - 44, 60, 0);
    or2.inputWires.push(new _Wire.default(and1, 0));
    or2.inputWires.push(new _Wire.default(and2, 0, [// add 12 because of the output bit
    {
      x: or2.position.x + 9,
      y: (and2.position.y + or2.position.y + 6) / 2
    }, {
      x: and2.position.x,
      y: (and2.position.y + or2.position.y + 6) / 2
    }]));
    output2.inputWires.push(new _Wire.default(or2, 0));

    _this.components.push(output1, output2, and1, xor1, and2, xor2, or2, inputA, inputB, inputC); // for ease of visualization


    var aid1 = new _OutputBit.default(xor1.position.x, xor1.position.y + 27, 12);
    aid1.inputWires.push(new _Wire.default(xor1, 0));
    var aid2 = new _OutputBit.default(and1.position.x, and1.position.y + 27, 12);
    aid2.inputWires.push(new _Wire.default(and1, 0));
    var aid3 = new _OutputBit.default(and2.position.x, and2.position.y + 30, 12);
    aid3.inputWires.push(new _Wire.default(and2, 0));

    _this.components.push(aid1, aid2, aid3); // Number Display


    var displayResult = new _Display.default(220, 340, [output1, output2], false, 42);

    _this.components.push(displayResult);

    var labelA = new _Text.default(inputA.position.x, 20, 30, "A");
    var labelB = new _Text.default(inputB.position.x, 20, 30, "B");
    var labelC = new _Text.default(inputC.position.x, inputC.position.y - 40, 30, "C");
    var text1 = new _Text.default(output1.position.x, 375, 30, "1", {
      color: '#333'
    });
    var text2 = new _Text.default(output2.position.x, 375, 30, "2", {
      color: '#333'
    });

    _this.components.push(labelA, labelB, labelC, text1, text2); // Updating


    _this.outputComponents.push(output1, output2, aid1, aid2, aid3); // The Answer


    var correctAdder = new _Adder.default(370, 200, 1, 140);
    var rightInputA = new _InputBit.default(correctAdder.position.x + correctAdder.inputSockets[0].x, 120, false, 25);
    var rightInputB = new _InputBit.default(correctAdder.position.x + correctAdder.inputSockets[1].x, 120, false, 25);
    var rightInputC = new _InputBit.default(460, 200, false, 25);

    _this.components.push(correctAdder, rightInputA, rightInputB, rightInputC);

    var rightOutput1 = new _OutputBit.default(correctAdder.position.x, 270, 25);
    var rightOutput2 = new _OutputBit.default(correctAdder.position.x + correctAdder.outputSockets[1].x, 270, 25);
    rightOutput1.inputWires.push(new _Wire.default(correctAdder, 0));
    rightOutput2.inputWires.push(new _Wire.default(correctAdder, 1));

    _this.components.push(rightOutput1, rightOutput2);

    _this.outputComponents.push(rightOutput1, rightOutput2);

    var helpText1 = new _Text.default(correctAdder.position.x, 60, 20, "Can you make the");
    var helpText2 = new _Text.default(correctAdder.position.x, 80, 20, "left side do this?");

    _this.components.push(helpText1, helpText2);

    correctAdder.inputWires = [new _Wire.default(rightInputA, 0), new _Wire.default(rightInputB, 0), new _Wire.default(rightInputC, 0)];

    _this.components.push(new _AnswerChecker.default(_this, 380, 345, [[inputA, rightInputA], [inputB, rightInputB], [inputC, rightInputC]], [output2, output1], function (bits) {
      return [Number(bits[0]) + Number(bits[1]) + Number(bits[2]) >= 2, Boolean(bits[0] !== bits[1]) !== bits[2]];
    }));

    return _this;
  }

  return FullAdderExploration1;
}(_Exploration.default);

var _default = FullAdderExploration1;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts","./Gates":"Gates.ts","./UserGates":"UserGates.ts","./AnswerChecker":"AnswerChecker.ts"}],"FullSubtractorGates.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

var _Gates = require("./Gates");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FullAdderGates.ts
//
// Still just one bit each. That is, three total (A,B,carry).
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var FullSubtractorExploration1 =
/** @class */
function (_super) {
  __extends(FullSubtractorExploration1, _super);

  function FullSubtractorExploration1(canvas) {
    var _this = _super.call(this, canvas, 400, 400) || this;

    var inputA = new _InputBit.default(80, 50, false, 30);
    var inputB = new _InputBit.default(200, 50, false, 30);
    var inputC = new _InputBit.default(300, 200, false, 30);
    var output1 = new _OutputBit.default(200, 340, 30);
    var output2 = new _OutputBit.default(100, 340, 30);
    var notA1 = new _Gates.Not(inputA.position.x, inputA.position.y + 40, 30, 0);
    notA1.inputWires.push(new _Wire.default(inputA, 0));
    var and1 = new _Gates.AndGate(inputA.position.x + 10, 140, 50, 0);
    and1.inputWires.push(new _Wire.default(notA1, 0));
    and1.inputWires.push(new _Wire.default(inputB, 0, [{
      x: and1.position.x + 10,
      y: and1.position.y - 40
    }]));
    var xor1 = new _Gates.XorGate(inputB.position.x - 10, 140, 50, 0);
    xor1.inputWires.push(new _Wire.default(inputA, 0, [{
      x: xor1.position.x - 10,
      y: and1.position.y - 40
    }]));
    xor1.inputWires.push(new _Wire.default(inputB, 0));
    var notX1 = new _Gates.Not(xor1.position.x - 30, 180, 30, 90);
    notX1.inputWires.push(new _Wire.default(xor1, 0, [{
      x: xor1.position.x,
      y: notX1.position.y,
      node: true
    }]));
    var notX1Aid = new _OutputBit.default(notX1.position.x - 25, notX1.position.y, 12);
    notX1Aid.inputWires.push(new _Wire.default(notX1, 0));
    var xor2 = new _Gates.XorGate(200, 280, 50, 0);
    xor2.inputWires.push(new _Wire.default(xor1, 0));
    xor2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: xor2.position.x + 10,
      y: inputC.position.y,
      node: true
    }]));
    output1.inputWires.push(new _Wire.default(xor2, 0));
    var and2 = new _Gates.AndGate(output2.position.x + 30, 230, 50, 0);
    and2.inputWires.push(new _Wire.default(notX1, 0, [{
      x: and2.position.x - 10,
      y: notX1.position.y
    }]));
    and2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: and2.position.x + 10,
      y: inputC.position.y
    }])); // or gate for the "2" output

    var or2 = new _Gates.OrGate(output2.position.x, output2.position.y - 44, 50, 0);
    or2.inputWires.push(new _Wire.default(and1, 0, [{
      x: or2.position.x - 10,
      y: and1.position.y + 30
    }, {
      x: and1.position.x,
      y: and1.position.y + 30
    }]));
    or2.inputWires.push(new _Wire.default(and2, 0, [// add 12 because of the output bit
    {
      x: or2.position.x + 10,
      y: (and2.position.y + or2.position.y + 12) / 2
    }, {
      x: and2.position.x,
      y: (and2.position.y + or2.position.y + 12) / 2
    }]));
    output2.inputWires.push(new _Wire.default(or2, 0));

    _this.components.push(output1, output2, notA1, notX1, and1, xor1, and2, xor2, or2, inputA, inputB, inputC); // for ease of visualization


    var aid1 = new _OutputBit.default(xor1.position.x, xor1.position.y + 27, 12);
    aid1.inputWires.push(new _Wire.default(xor1, 0));
    var aid2 = new _OutputBit.default(and1.position.x, and1.position.y + 27, 12);
    aid2.inputWires.push(new _Wire.default(and1, 0));
    var aid3 = new _OutputBit.default(and2.position.x, and2.position.y + 27, 12);
    aid3.inputWires.push(new _Wire.default(and2, 0));

    _this.components.push(aid1, aid2, aid3, notX1Aid); // Number Display


    var displayResult = new _Display.default(320, 340, [output1, output2], "2comp", 42);

    _this.components.push(displayResult);

    var labelA = new _Text.default(inputA.position.x, 20, 30, "A");
    var labelB = new _Text.default(inputB.position.x, 20, 30, "B");
    var labelC = new _Text.default(inputC.position.x, inputC.position.y - 40, 30, "C");
    var text1 = new _Text.default(output1.position.x, 375, 30, "1");
    var text2 = new _Text.default(output2.position.x, 375, 30, "Borrow");

    _this.components.push(labelA, labelB, labelC, text1, text2); // Updating


    _this.outputComponents.push(output1, output2, aid1, aid2, aid3, notX1Aid);

    return _this;
  }

  return FullSubtractorExploration1;
}(_Exploration.default);

var _default = FullSubtractorExploration1;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts","./Gates":"Gates.ts"}],"GateExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Gates = require("./Gates");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// GateExploration
//
// Basic exploration of AND, OR, XOR, and NOT gates
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var GateExploration =
/** @class */
function (_super) {
  __extends(GateExploration, _super);

  function GateExploration(canvas) {
    var _this = _super.call(this, canvas, 480, 240) || this;

    var types = [_Gates.AndGate, _Gates.OrGate, _Gates.XorGate];

    for (var i = 0; i < 3; i++) {
      var bit1 = new _InputBit.default(i * 120 + 60, 40, false, 30);
      var bit2 = new _InputBit.default(i * 120 + 120, 40, false, 30);
      var gate = new types[i](i * 120 + 90, 120, 60, 0);
      gate.inputWires.push(new _Wire.default(bit1, 0, [{
        x: gate.position.x - 12,
        y: gate.position.y - 40
      }, {
        x: bit1.position.x,
        y: gate.position.y - 40
      }]));
      gate.inputWires.push(new _Wire.default(bit2, 0, [{
        x: gate.position.x + 12,
        y: gate.position.y - 40
      }, {
        x: bit2.position.x,
        y: gate.position.y - 40
      }]));
      var out = new _OutputBit.default(i * 120 + 90, 200, 30);
      out.inputWires.push(new _Wire.default(gate, 0));

      _this.components.push(gate, bit1, bit2, out);

      _this.outputComponents.push(out);
    }

    var notInput = new _InputBit.default(420, 40, false, 30);
    var notGate = new _Gates.Not(420, 120, 60, 0);
    notGate.inputWires.push(new _Wire.default(notInput, 0));
    var notOutput = new _OutputBit.default(420, 200, 30);
    notOutput.inputWires.push(new _Wire.default(notGate, 0));

    _this.components.push(notGate, notInput, notOutput);

    _this.outputComponents.push(notOutput);

    return _this;
  }

  return GateExploration;
}(_Exploration.default);

var _default = GateExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Gates":"Gates.ts"}],"HalfAdderBuild.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Text = _interopRequireDefault(require("./Text"));

var _UserGates = require("./UserGates");

var _AnswerChecker = _interopRequireDefault(require("./AnswerChecker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// HalfAdderCheat.ts
//
// The finished product with no accompanying circuit.
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var HalfAdderBuild =
/** @class */
function (_super) {
  __extends(HalfAdderBuild, _super);

  function HalfAdderBuild(canvas) {
    var _this = _super.call(this, canvas, 480, 320) || this; // left side


    var adder = new _Adder.default(120, 160, 1, 180, 80);
    var inputA = new _InputBit.default(adder.position.x + adder.inputSockets[0].x, 60, false, 30);
    var inputB = new _InputBit.default(adder.position.x + adder.inputSockets[1].x, 60, false, 30);
    var output1 = new _OutputBit.default(adder.position.x + adder.outputSockets[0].x, 260, 30);
    var output2 = new _OutputBit.default(adder.position.x + adder.outputSockets[1].x, 260, 30);

    _this.components.push(adder, inputA, inputB, output1, output2);

    adder.inputWires.push(new _Wire.default(inputA, 0));
    adder.inputWires.push(new _Wire.default(inputB, 0));
    output1.inputWires.push(new _Wire.default(adder, 0));
    output2.inputWires.push(new _Wire.default(adder, 1)); // const displayResult = new Display(180, 240, [output1, output2], false, 40);
    // this.components.push(displayResult);

    _this.outputComponents.push(output1, output2);

    var thisIsYourTarget = new _Text.default(adder.position.x, 30, 18, "Can you make this...");
    var text1 = new _Text.default(output1.position.x, 295, 30, "1");
    var text2 = new _Text.default(output2.position.x, 295, 30, "2");

    _this.components.push(thisIsYourTarget, text1, text2); // right side


    var x2 = 390;
    var userA = new _InputBit.default(x2 - 45, 60, false, 30);
    var userB = new _InputBit.default(x2 + 45, 60, false, 30);
    var switch1 = new _UserGates.BinarySwitch(userB.position.x - 9, 160, 60, 0);
    switch1.state.whichGate = 1;
    var switch2 = new _UserGates.BinarySwitch(userA.position.x + 9, 160, 60, 0);
    switch2.state.whichGate = 1;
    switch1.inputWires.push(new _Wire.default(userA, 0));
    switch1.inputWires.push(new _Wire.default(userB, 0));
    switch2.inputWires.push(new _Wire.default(userA, 0));
    switch2.inputWires.push(new _Wire.default(userB, 0));
    var userOutput1 = new _OutputBit.default(switch1.position.x, 260, 30);
    var userOutput2 = new _OutputBit.default(switch2.position.x, 260, 30);
    userOutput1.inputWires.push(new _Wire.default(switch1, 0));
    userOutput2.inputWires.push(new _Wire.default(switch2, 0));
    var thisIsYourCanvas = new _Text.default(x2, 30, 18, "...on this side?");

    _this.components.push(thisIsYourCanvas, switch1, switch2, userA, userB, userOutput1, userOutput2);

    _this.outputComponents.push(userOutput1, userOutput2);

    var userText1 = new _Text.default(userOutput1.position.x, 295, 30, "1");
    var userText2 = new _Text.default(userOutput2.position.x, 295, 30, "2");

    _this.components.push(userText1, userText2);

    var testButton = new _AnswerChecker.default(_this, 235, 270, [[userA, inputA], [userB, inputB]], [userOutput2, userOutput1], function (bits) {
      return [bits[0] && bits[1], bits[0] !== bits[1]];
    });

    _this.components.push(testButton); // Link the bits for easy comparison


    inputA.linkedBits.push(userA);
    userA.linkedBits.push(inputA);
    inputB.linkedBits.push(userB);
    userB.linkedBits.push(inputB);
    return _this;
  }

  return HalfAdderBuild;
}(_Exploration.default);

var _default = HalfAdderBuild;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Text":"Text.ts","./UserGates":"UserGates.ts","./AnswerChecker":"AnswerChecker.ts"}],"MakeALUExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _UserGates = require("./UserGates");

var _Text = _interopRequireDefault(require("./Text"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MakeALUExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var MakeALUExploration =
/** @class */
function (_super) {
  __extends(MakeALUExploration, _super);

  function MakeALUExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 500, 500) || this;

    var adder = new _Adder.default(180, 280, 4, 288, 120);

    _this.components.push(adder); // need this up here...


    var operBit = new _InputBit.default(460, 70, false, 40);
    var inputA = [],
        inputB = [];

    for (var i = 0; i < 4; i++) {
      var bit = new _InputBit.default(30 + 36 * i, 60, false, 25);
      adder.inputWires.unshift(new _Wire.default(bit, 0, [{
        x: adder.position.x + adder.inputSockets[3 - i].x,
        y: bit.position.y + 120 - 25 * i
      }, {
        x: bit.position.x,
        y: bit.position.y + 120 - 25 * i
      }]));

      _this.components.push(bit);

      inputA.unshift(bit); // right side is more complicated

      var bit2 = new _InputBit.default(380 - 60 * i, 60, false, 25);
      var gate = new _UserGates.BinarySwitch(bit2.position.x + 6, bit2.position.y + 70, 40, 0);
      gate.inputWires.push(new _Wire.default(bit2, 0));
      gate.inputWires.push(new _Wire.default(operBit, 0, [{
        x: gate.position.x + 6,
        y: gate.position.y - 30,
        node: i !== 3
      }, {
        x: operBit.position.x,
        y: gate.position.y - 30,
        node: true
      }]));
      adder.inputWires.push(new _Wire.default(gate, 0, [{
        x: adder.position.x + adder.inputSockets[4 + i].x,
        y: gate.position.y + 70 - 10 * i
      }, {
        x: gate.position.x,
        y: gate.position.y + 70 - 10 * i
      }]));

      _this.components.push(gate, bit2);

      inputB.push(bit2);
    } // operation control


    var operSwitch = new _UserGates.NotSwitch(operBit.position.x, operBit.position.y + 100, 50, 0);
    operSwitch.state.whichGate = 1; // start you off with the wrong gate, heh heh

    var operText1 = new _Text.default(operBit.position.x, operBit.position.y - 50, 20, "OPER");
    var operText2 = new _Text.default(operBit.position.x, operBit.position.y - 32, 20, function () {
      return operBit.state.bits[0] ? "(SUB)" : "(ADD)";
    });
    operSwitch.inputWires.push(new _Wire.default(operBit, 0));
    adder.inputWires.push(new _Wire.default(operSwitch, 0, [{
      x: operSwitch.position.x,
      y: adder.position.y
    }]));

    _this.components.push(operSwitch, operBit, operText1, operText2);

    var outputBits = [];

    for (var i = 0; i < 4; i++) {
      var output = new _OutputBit.default(adder.position.x + adder.outputSockets[i].x, 410, 25);
      output.inputWires.push(new _Wire.default(adder, i, []));
      outputBits.push(output);
    }

    (_a = _this.outputComponents).push.apply(_a, outputBits);

    (_b = _this.components).push.apply(_b, outputBits); // Displays


    var displayA = new _Display.default((inputA[1].position.x + inputA[2].position.x) / 2, 25, inputA, true);
    var displayB = new _Display.default((inputB[1].position.x + inputB[2].position.x) / 2, 25, inputB, true);

    _this.components.push(displayA, displayB, new _Display.default(adder.position.x, 460, outputBits, true, 50)); // Error


    var calc1 = new _Text.default(370, 430, 30, function () {
      var a = Number(displayA.getValue());
      var b = Number(displayB.getValue());
      var op = operBit.state.bits[0];
      var raw = op ? a + b : a - b; // add 8, mod 16, then subtract 8 makes it return in -8..7

      var overflow = (raw + 24) % 16 - 8;
      return "Actual: " + overflow + (raw === overflow ? "" : "*");
    });
    var overflowNote = new _Text.default(370, 460, 20, "* means overflow");

    _this.components.push(calc1, overflowNote);

    return _this;
  }

  return MakeALUExploration;
}(_Exploration.default);

var _default = MakeALUExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./UserGates":"UserGates.ts","./Text":"Text.ts"}],"MultiplierExploration.ts":[function(require,module,exports) {
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

var _Clock = _interopRequireDefault(require("./Clock"));

var _Display = _interopRequireDefault(require("./Display"));

var _Gates = require("./Gates");

var _ChoiceGate = _interopRequireDefault(require("./ChoiceGate"));

var _Text = _interopRequireDefault(require("./Text"));

var _Countdown = _interopRequireDefault(require("./Countdown"));

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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

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

    _this.animated = true;

    _this.afterRender = function () {
      var ctx = _this.context;
      var cycle = _this.countdown.state.count;

      if (_this.startButton.state.bits[0]) {
        var n = _this.numBits - cycle + 1;

        if (n <= 5) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          var west = _this.regRight - _this.regSpacing * (5 - n) - 20;
          var north = 329,
              south = 479;
          var east = _this.regRight + 22;
          ctx.fillRect(west, north, east - west, south - north);
        }

        if (n <= 6) {
          // product value
          var productValue = 0;

          for (var i = 0; i < _this.numBits + n; i++) {
            var bit = _this.productRegister[i + (6 - n)];
            productValue += Number(bit.state.bits[0]) * (1 << i);
          }

          _this.drawProductGuide(2 * _this.numBits - 1, _this.numBits - n, "#33c", "Product (" + productValue + ")");
        }
      }

      if (_this.countdown.state.count == 0) {
        _this.startButton.state.bits = [false];
        _this.paused = true; // but clear the register first

        var update = _this.update.bind(_this);

        for (var _i = 0, _a = _this.productRegister; _i < _a.length; _i++) {
          var bit = _a[_i];
          bit.state.bits[0] = false;
        }
      }
    };

    canvas.width = 720;
    canvas.height = 600;
    var BITS = 6;
    _this.numBits = BITS;
    var startButton = new _InputBit.default(680, 60, false, 50);
    _this.startButton = startButton;
    var startText = new _Text.default(startButton.position.x, startButton.position.y - 35, 24, function () {
      return startButton.state.bits[0] ? "ABORT" : "START";
    });

    _this.components.push(startText);

    var thisExploration = _this;

    startButton.onClick = function () {
      thisExploration.update();
      startButton.constructor.prototype.onClick.apply(startButton, arguments);

      if (startButton.state.bits[0]) {
        thisExploration.resume();
      }

      return true;
    };

    var clockX = startButton.position.x; // not gate adjusting the initial register

    var startNot = new _Gates.Not(startButton.position.x - 60, 40, 30, 90);
    startNot.inputWires.push(new _Wire.default(startButton, 0));

    _this.components.push(startNot);

    var clock = new _Clock.default(clockX, 150);
    clock.inputWires.push(new _Wire.default(startButton, 0));
    _this.clock = clock; //this.components.push(clock); // do it later
    //this.outputComponents.push(clock);
    // when the clock strikes 2*BITS + 1 it will end the operation

    var countdown = new _Countdown.default(clockX + 5, 260, _this.numBits, 50, 50);
    countdown.inputWires.push(new _Wire.default(startButton, 0, [{
      x: countdown.position.x,
      y: countdown.position.y - 40
    }, {
      x: clockX + 30,
      y: countdown.position.y - 40
    }, {
      x: clockX + 30,
      y: startButton.position.y
    }]));
    countdown.inputWires.push(new _Wire.default(clock, 1));
    _this.countdown = countdown;
    var adder = new _Adder.default(170, 175, BITS, 270, 100); //this.outputComponents.push(adder);
    // The "Register" that really isn't.
    // The Add and Shift steps should be successfully separated...

    var productRegister = [];
    _this.regRight = 610;
    _this.regSpacing = 50;

    for (var i = 0; i < 2 * BITS; i++) {
      var reg = new _OutputBit.default(_this.regRight - _this.regSpacing * i, 400, 20);
      productRegister.push(reg);

      _this.outputComponents.unshift(reg); // todo: is needed?


      _this.components.push(reg);
    } // Wire Coloring


    var purple = {
      color: "rgb(128, 32, 128)",
      darkColor: "rgb(160, 80, 160)"
    };
    var purpleFaded = {
      color: "rgba(128, 0, 128, 0.4)",
      darkColor: "rgba(160, 80, 160, 0.6)"
    };
    var teal = {
      color: "rgb(0, 128, 128)"
    };
    var tealFaded = {
      color: "rgba(0, 128, 128, 0.35)"
    }; // Wires from the registers to the adder.
    // (deep purple, left)

    for (var i = 0; i < BITS; i++) {
      var d = 2;
      var bit = productRegister[i + BITS - 1]; // basically, we want the most significant bit to be highest

      var y1 = bit.position.y + 15 + d * (BITS - i);
      var y2 = adder.position.y - adder.size.y / 2 - 15 - d * BITS;
      adder.inputWires.push(new _Wire.default(bit, 0, [{
        x: adder.position.x + adder.inputSockets[i].x,
        y: y2 + d * i
      }, {
        x: 10 + d * i,
        y: y2 + d * i
      }, {
        x: 10 + d * i,
        y: y1
      }, {
        x: bit.position.x,
        y: y1
      }], {
        color: "rgba(128, 0, 128, 0.75)",
        darkColor: "rgba(160, 80, 160, 0.67)"
      }));
    } // And Gates coming out of the adder (for the clock).


    var adderChoiceGates = [];

    for (var i = 0; i <= BITS; i++) {
      // and gate
      //const x = adder.position.x + adder.outputSockets[i].x;
      var y = adder.position.y + adder.outputSockets[0].y; // put them all on the same line
      // space them a bit

      var choice = new _ChoiceGate.default(productRegister[i + BITS - 1].position.x - 7, y + 50, 10); // this will be input 0 temporarily but we will unshift later

      var x2 = adder.position.x + adder.outputSockets[i].x;
      var y2 = y + 10 + 4 * i;
      if (choice.position.x < x2) y2 = y + 20;
      choice.inputWires.push(new _Wire.default(adder, i, [{
        x: choice.position.x + choice.inputSockets[1].x,
        y: y2
      }, {
        x: x2,
        y: y2
      }]));
      adderChoiceGates.push(choice);

      _this.components.push(choice);
    } // Shifting the Multiplication Register


    for (var i = 0; i < 2 * BITS; i++) {
      var regBit = productRegister[i];
      /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
      this.components.push(or);
      regBit.inputWires.push(new Wire(or, 0));*/

      var choice = new _ChoiceGate.default(regBit.position.x, regBit.position.y - 40, 14); // Selection Wire (from clock's NOT)

      choice.inputWires.push(new _Wire.default(clock, 1, [{
        x: choice.position.x - 18,
        y: choice.position.y
      }, {
        x: choice.position.x - 18,
        y: choice.position.y - 38 - 2 * i
      }, {
        x: 630 - 2 * i,
        y: choice.position.y - 38 - 2 * i
      }, {
        x: clock.position.x - 40,
        y: clock.position.y + clock.size.y / 2
      }], tealFaded));

      if (i >= BITS - 1) {
        // Upper Half of the Register: Conditionally connect to the adder.
        choice.inputWires.push(new _Wire.default(adderChoiceGates[i - BITS + 1], 0, [], purple));
      } else {
        // Lower Half of the Register: Connect to itself.
        choice.inputWires.push(new _Wire.default(regBit, 0, [{
          x: regBit.position.x - 7,
          y: choice.position.y - 30
        }, {
          x: regBit.position.x + 20,
          y: choice.position.y - 30
        }, {
          x: regBit.position.x + 20,
          y: regBit.position.y
        }], purple));
      } // Shifting


      if (i < 2 * BITS - 1) {
        choice.inputWires.push(new _Wire.default(productRegister[i + 1], 0, [{
          x: regBit.position.x + 7,
          y: choice.position.y - 20
        }, {
          x: regBit.position.x - 24,
          y: choice.position.y - 20
        }, {
          x: regBit.position.x - 24,
          y: regBit.position.y
        }], teal));
      } else {
        choice.inputWires.push(null);
      }

      _this.components.push(choice);

      regBit.inputWires.push(new _Wire.default(choice, 0));
    } // Input Numbers (A and B).


    var inputA = [];
    var inputB = [];

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(310 - i * 30, 60, false, 25);

      _this.components.push(input);

      adder.inputWires.push(new _Wire.default(input, 0));
      inputA.push(input); // in case we need it
    }

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(610 - i * 50, 60, false, 25);

      _this.components.push(input);

      inputB.push(input);
    } // The second input register that is actually a register.


    var multiplierRegister = [];
    var multiplierRegisterChoice = [];

    for (var i = 0; i < BITS; i++) {
      var reg = new _RegisterBit.default(inputB[i].position.x - 3, 170, 20);
      multiplierRegister.push(reg);

      _this.components.push(reg);

      _this.outputComponents.push(reg);
    } // Wiring to the Multiplier Register


    for (var i = 0; i < BITS; i++) {
      var reg = multiplierRegister[i];
      var or = new _Gates.OrGate(reg.position.x - 9, reg.position.y - 25, 20, 0);
      var choice = new _ChoiceGate.default(reg.position.x + 9, reg.position.y - 60, 12);
      reg.inputWires.push(new _Wire.default(or, 0), new _Wire.default(choice, 0)); // wire path for the OR and the selection bit

      var wirePath = [{
        x: reg.position.x - 13,
        y: choice.position.y,
        node: true
      }, {
        x: reg.position.x - 13,
        y: startNot.position.y,
        node: i < BITS - 1
      }];
      or.inputWires.push(new _Wire.default(startNot, 0, wirePath, {
        color: "rgba(100, 100, 130, 0.75)"
      }));
      or.inputWires.push(new _Wire.default(clock, 1, [{
        x: or.position.x + 10,
        y: or.position.y - 18 - i / 2
      }, {
        x: clock.position.x - 60,
        y: or.position.y - 18 - i
      }, {
        x: clock.position.x - 40,
        y: clock.position.y + clock.size.y / 2,
        node: true
      }], tealFaded)); // choice gate is [0] ? [1] : [2]
      // the selection comes first

      choice.inputWires.push(new _Wire.default(startNot, 0, wirePath, {
        color: "rgba(100, 100, 130, 0.75)"
      })); // If the clock is off, the registers need to use the input bits

      choice.inputWires.push(new _Wire.default(inputB[i], 0)); // Otherwise hold

      choice.inputWires.push(new _Wire.default(multiplierRegister[i + 1] || null, 0, [{
        x: reg.position.x + 15,
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
    // Also the wiring between the product register and the choice gates


    var regLSB = multiplierRegister[0];

    for (var i = 0; i <= BITS; i++) {
      var choice = adderChoiceGates[i]; // Selector Wire

      choice.inputWires.unshift(new _Wire.default(regLSB, 0, [{
        x: choice.position.x - 13,
        y: choice.position.y
      }, {
        x: choice.position.x - 13,
        y: choice.position.y - 20
      }, {
        x: 400,
        y: choice.position.y - 20
      }, {
        x: 400,
        y: regLSB.position.y + 20
      }, {
        x: regLSB.position.x,
        y: regLSB.position.y + 20
      }], {
        color: "#7f7f7f",
        darkColor: "#555"
      })); // Else wire

      var outBit = productRegister[i + BITS - 1];
      choice.inputWires.push(new _Wire.default(outBit, 0, [{
        x: choice.position.x + 5,
        y: choice.position.y - 10
      }, {
        x: outBit.position.x + 17,
        y: choice.position.y - 10
      }, {
        x: outBit.position.x + 17,
        y: outBit.position.y - 18
      }], purpleFaded));
    } // Answer Register


    var finalAnswer = [];

    for (var i = 0; i < 2 * BITS; i++) {
      var offset = 5;
      var bit = new _RegisterBit.default(productRegister[i].position.x + offset, 510, 30);

      _this.components.push(bit);

      _this.outputComponents.push(bit); // set wire: on at the 12th clock cycle


      bit.inputWires.push(new _Wire.default(countdown, 0, [{
        x: bit.position.x - 15,
        y: bit.position.y - 15
      }, {
        x: bit.position.x - 15,
        y: bit.position.y - 30
      }, {
        x: countdown.position.x + countdown.outputSockets[0].x,
        y: bit.position.y - 30
      }], {
        color: "rgb(128, 128, 128)"
      })); // what wire: from the corresponding from the product "register"

      var from = productRegister[i];
      var diagonal = 16;
      bit.inputWires.push(new _Wire.default(from, 0, [{
        x: bit.position.x + diagonal,
        y: bit.position.y - diagonal
      }, {
        x: from.position.x + diagonal + offset,
        y: from.position.y + diagonal + offset
      }]));
      finalAnswer.push(bit);
    } // finally, add displays


    var displayA = new _Display.default((inputA[0].position.x + inputA[BITS - 1].position.x) / 2, 25, inputA, false, 30);
    var displayB = new _Display.default((inputB[0].position.x + inputB[BITS - 1].position.x) / 2, 20, inputB, false, 30);
    var displayEnd = new _Display.default(375, 565, finalAnswer, false, 60);
    displayEnd.size.x = 2 * displayEnd.size.y; // rendering trick, because input wires are drawn with a component
    // so pushing these last makes them render last so it looks cleaner

    _this.components.push(adder, countdown, startButton, displayA, displayB, displayEnd, clock);

    _this.productRegister = productRegister;
    return _this;
  }

  MultiplierExploration.prototype.drawProductGuide = function (left, right, color, text) {
    var ctx = this.context;
    var x1 = this.regRight - left * this.regSpacing - 15;
    var x2 = this.regRight - right * this.regSpacing + 15;
    var y = 435;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "none";
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 + 10, y + 10);
    ctx.lineTo(x2 - 10, y + 10);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 16;
    ctx.fillStyle = color;
    ctx.font = "30px monospace";
    ctx.strokeText(text, (x1 + x2) / 2, y + 25);
    ctx.fillText(text, (x1 + x2) / 2, y + 25);
    ctx.restore();
  };

  return MultiplierExploration;
}(_Exploration.default);

var _default = MultiplierExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./RegisterBit":"RegisterBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./Display":"Display.ts","./Gates":"Gates.ts","./ChoiceGate":"ChoiceGate.ts","./Text":"Text.ts","./Countdown":"Countdown.ts"}],"MultiplierNaiveExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Gates = require("./Gates");

var _Display = _interopRequireDefault(require("./Display"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MultiplierNaiveExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var MultiplierNaiveExploration =
/** @class */
function (_super) {
  __extends(MultiplierNaiveExploration, _super);

  function MultiplierNaiveExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 600, 600) || this;

    var blue = {
      color: "rgba(32,32,128,0.75)"
    };
    var teal = {
      color: "rgba(96,160,160,1)"
    };
    var numBits = 4;
    var inputA = [],
        inputB = [],
        outputBits = [];

    for (var i = 0; i < numBits; i++) {
      var bitA = new _InputBit.default(140 - 35 * i, 30, false, 30);
      inputA.push(bitA);
      var bitB = new _InputBit.default(465 - 35 * i, 30, false, 30);
      inputB.push(bitB);
    }

    var adders = [];

    for (var i = 0; i < numBits; i++) {
      var adder = new _Adder.default(430 - 75 * i, 170 + 105 * i, numBits, 200, 60);
      adders.push(adder);

      for (var j = 0; j < numBits; j++) {
        var and = new _Gates.AndGate(adder.position.x + adder.inputSockets[j].x, adder.position.y - adder.size.y / 2 - 20, 20, 0);
        and.inputWires.push(new _Wire.default(inputA[i], 0, [{
          x: and.position.x - 6,
          y: and.position.y - 20
        }, {
          x: inputA[i].position.x,
          y: and.position.y - 20
        }], blue));
        var d1 = 24 + 3 * i - (8 + i) * j;
        and.inputWires.push(new _Wire.default(inputB[j], 0, i > 0 ? [{
          x: and.position.x + 4,
          y: and.position.y - 28
        }, {
          x: and.position.x + 4 - d1,
          y: and.position.y - 28 - d1
        }, {
          x: and.position.x + 4 - d1,
          y: inputB[j].position.y + 30 + 8 * j,
          node: true
        }, {
          x: inputB[j].position.x,
          y: inputB[j].position.y + 30 + 8 * j,
          node: true
        }] : [// don't need the bending
        {
          x: and.position.x + 4,
          y: and.position.y - 28
        }, {
          x: inputB[j].position.x,
          y: inputB[j].position.y + 30 + 8 * j
        }, {
          x: inputB[j].position.x,
          y: inputB[j].position.y + 30 + 8 * j,
          node: true
        }], teal));

        _this.components.push(and);

        adder.inputWires.push(new _Wire.default(and, 0));
      }

      if (i > 0) {
        for (var j = 0; j < numBits; j++) {
          adder.inputWires.push(new _Wire.default(adders[i - 1], j + 1));
        }
      } else {
        for (var j = 0; j < numBits; j++) {
          adder.inputWires.push(null);
        }
      }
    }

    for (var i = 0; i < 2 * numBits; i++) {
      var outBit = new _OutputBit.default(440 - 50 * i, 570, 25);

      if (i < numBits) {
        outBit.inputWires.push(new _Wire.default(adders[i], 0));
      } else {
        outBit.inputWires.push(new _Wire.default(adders[numBits - 1], i - numBits + 1));
      }

      outputBits.push(outBit);
    }

    var displayA = new _Display.default(200, 30, inputA, false, 32);
    var displayB = new _Display.default(525, 30, inputB, false, 32);
    var displayOutput = new _Display.default(550, 570, outputBits, false, 40);

    (_a = _this.components).push.apply(_a, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], outputBits), adders), inputA), inputB));

    _this.components.push(displayA, displayB, displayOutput);

    (_b = _this.outputComponents).push.apply(_b, outputBits);

    return _this;
  }

  return MultiplierNaiveExploration;
}(_Exploration.default);

var _default = MultiplierNaiveExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Gates":"Gates.ts","./Display":"Display.ts"}],"OnesComplementExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AdderExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var OnesComplementExploration =
/** @class */
function (_super) {
  __extends(OnesComplementExploration, _super);

  function OnesComplementExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 400, 300) || this;

    var adder = new _Adder.default(200, 160, 4);

    _this.components.push(adder);

    var inputA = [];
    var inputB = [];

    for (var i = 0; i < 4; i++) {
      var y = 90 - i * 10;
      var bitA = new _InputBit.default(adder.position.x - 100 + i * 25, 30);
      adder.inputWires.unshift(new _Wire.default(bitA, 0, [{
        x: bitA.position.x + 12.5,
        y: y
      }, {
        x: bitA.position.x,
        y: y
      }]));
      inputA.unshift(bitA);
      var bitB = new _InputBit.default(adder.position.x + 100 - i * 25, 30);
      adder.inputWires.push(new _Wire.default(bitB, 0, [{
        x: bitB.position.x - 12.5,
        y: y
      }, {
        x: bitB.position.x,
        y: y
      }]));
      inputB.push(bitB);
    }

    var outputBits = [];

    for (var i = 0; i < 4; i++) {
      var output = new _OutputBit.default(adder.position.x + 37.5 - i * 25, 260);
      output.inputWires.push(new _Wire.default(adder, i, []));
      outputBits.push(output);
    }

    (_a = _this.components).push.apply(_a, __spreadArray(__spreadArray(__spreadArray([], inputA), inputB), outputBits));

    var displayA = new _Display.default(35, 30, inputA, "1comp");
    var displayB = new _Display.default(365, 30, inputB, "1comp");
    var displayResult = new _Display.default(200, 350, outputBits, "1comp", 40);
    var calc1 = new _Text.default(330, 230, 20, function () {
      var a = Number(displayA.getValue());
      var b = Number(displayB.getValue());
      return "Correct: " + (a + b);
    });
    var calc2 = new _Text.default(calc1.position.x, calc1.position.y + 25, 20, function () {
      var displayed = displayResult.getValue();
      return "Guess: " + displayed;
    });
    var calc3 = new _Text.default(calc2.position.x, calc2.position.y + 25, 20, function () {
      var a = Number(displayA.getValue());
      var b = Number(displayB.getValue());
      var sum = Number(displayResult.getValue());
      var error = sum - a - b;
      return "Error: " + (error <= 0 ? '' : '+') + error;
    });

    _this.components.push(displayA, displayB, displayResult, calc1, calc2, calc3);

    (_b = _this.outputComponents).push.apply(_b, outputBits);

    return _this;
  }

  return OnesComplementExploration;
}(_Exploration.default);

var _default = OnesComplementExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts"}],"RegisterExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _RegisterBit = _interopRequireDefault(require("./RegisterBit"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _ChoiceGate = _interopRequireDefault(require("./ChoiceGate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// RegisterExploration
//
// Exploration that shows how a register bit works.
// Most of these (not multipliers and dividers) have the expanded version on the left and a compact version on the right.
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var RegisterExploration =
/** @class */
function (_super) {
  __extends(RegisterExploration, _super);

  function RegisterExploration(canvas) {
    var _this = _super.call(this, canvas) || this;

    var inputSet = new _InputBit.default(40, 80, false, 30);

    _this.components.push(inputSet);

    var inputWhat = new _InputBit.default(140, 80, false, 30);

    _this.components.push(inputWhat);

    var choice = new _ChoiceGate.default(100, 200, 50);

    _this.components.push(choice);

    choice.inputWires.push(new _Wire.default(inputSet, 0, [{
      x: inputSet.position.x,
      y: choice.position.y
    }]));
    choice.inputWires.push(new _Wire.default(inputWhat, 0, [{
      x: choice.position.x + choice.inputSockets[1].x,
      y: choice.position.y - 70
    }, {
      x: inputWhat.position.x,
      y: choice.position.y - 70
    }]));
    choice.inputWires.push(new _Wire.default(choice, 0, [{
      x: choice.position.x + choice.inputSockets[2].x,
      y: choice.position.y - 50
    }, {
      x: choice.position.x + 60,
      y: choice.position.y - 50
    }, {
      x: choice.position.x + 60,
      y: choice.position.y + 50
    }, {
      x: choice.position.x,
      y: choice.position.y + 50,
      node: true
    }]));
    var output = new _OutputBit.default(100, 320, 32);
    output.inputWires.push(new _Wire.default(choice, 0));

    _this.components.push(output);

    _this.outputComponents.push(output); // the simplified version


    var inputOff2 = new _InputBit.default(250, 150, false, 32);
    var inputOn2 = new _InputBit.default(350, 150, false, 32);
    var register = new _RegisterBit.default(300, 200, 40);
    var output2 = new _OutputBit.default(300, 250);
    register.inputWires.push(new _Wire.default(inputOff2, 0));
    register.inputWires.push(new _Wire.default(inputOn2, 0));
    output2.inputWires.push(new _Wire.default(register, 0));

    _this.components.push(register, output2, inputOn2, inputOff2);

    _this.outputComponents.push(output2);

    return _this;
  }

  return RegisterExploration;
}(_Exploration.default);

var _default = RegisterExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./RegisterBit":"RegisterBit.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./ChoiceGate":"ChoiceGate.ts"}],"SignMagnitudeExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// BinaryExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var SignMagnitudeExploration =
/** @class */
function (_super) {
  __extends(SignMagnitudeExploration, _super);

  function SignMagnitudeExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 480, 240) || this;

    var NUM_BITS = 6;
    var bitArray = [];

    for (var i = 0; i < NUM_BITS; i++) {
      var bit = new _InputBit.default(440 - 80 * i, 80, false, 30);
      bitArray.push(bit);
      var text = new _Text.default(bit.position.x, bit.position.y / 2, 30, i == 5 ? "??" : String(Math.pow(2, i)));

      _this.components.push(text);
    }

    (_a = _this.components).push.apply(_a, bitArray);

    (_b = _this.outputComponents).push.apply(_b, bitArray);

    var display = new _Display.default(240, 160, bitArray, "signmag", 48);

    _this.components.push(display);

    _this.outputComponents.push(display);

    return _this;
  }

  return SignMagnitudeExploration;
}(_Exploration.default);

var _default = SignMagnitudeExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./Display":"Display.ts","./Text":"Text.ts"}],"SubtractorExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Gates = require("./Gates");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// adderExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var SubtractorExploration =
/** @class */
function (_super) {
  __extends(SubtractorExploration, _super);

  function SubtractorExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 400, 400) || this;

    var adder = new _Adder.default(200, 200, 4, 216);

    _this.components.push(adder);

    var inputA = [],
        inputB = [];

    for (var i = 0; i < 4; i++) {
      var bit = new _InputBit.default(adder.position.x + adder.inputSockets[3 - i].x, 60);
      adder.inputWires.unshift(new _Wire.default(bit, 0));

      _this.components.push(bit);

      inputA.unshift(bit);
      var bit2 = new _InputBit.default(adder.position.x + adder.inputSockets[4 + i].x, 60);
      var not = new _Gates.Not(bit2.position.x, bit2.position.y + 50, 30, 0);
      not.inputWires.push(new _Wire.default(bit2, 0));
      adder.inputWires.push(new _Wire.default(not, 0));

      _this.components.push(bit2, not);

      inputB.push(bit2);
    }

    var floatingNot = new _Gates.Not(320, 200, 30, 90);
    adder.inputWires.push(new _Wire.default(floatingNot, 0));

    _this.components.push(floatingNot);

    var outputBits = [];

    for (var i = 0; i < 4; i++) {
      var output = new _OutputBit.default(adder.position.x + adder.outputSockets[i].x, 310);
      output.inputWires.push(new _Wire.default(adder, i, []));
      outputBits.push(output);
    }

    (_a = _this.outputComponents).push.apply(_a, outputBits);

    (_b = _this.components).push.apply(_b, outputBits);

    _this.components.push(new _Display.default(150, 25, inputA, true));

    _this.components.push(new _Display.default(250, 25, inputB, true));

    _this.components.push(new _Display.default(adder.position.x, 360, outputBits, true, 40));

    return _this;
  }

  return SubtractorExploration;
}(_Exploration.default);

var _default = SubtractorExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Gates":"Gates.ts"}],"TwosCompAdderExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Adder = _interopRequireDefault(require("./Adder"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AdderExploration.ts
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var TwosCompAdderExploration =
/** @class */
function (_super) {
  __extends(TwosCompAdderExploration, _super);

  function TwosCompAdderExploration(canvas) {
    var _a, _b;

    var _this = _super.call(this, canvas, 400, 300) || this;

    var adder = new _Adder.default(200, 160, 4);

    _this.components.push(adder);

    var inputA = [];
    var inputB = [];

    for (var i = 0; i < 4; i++) {
      var y = 90 - i * 10;
      var bitA = new _InputBit.default(adder.position.x - 100 + i * 25, 30);
      adder.inputWires.unshift(new _Wire.default(bitA, 0, [{
        x: bitA.position.x + 12.5,
        y: y
      }, {
        x: bitA.position.x,
        y: y
      }]));
      inputA.unshift(bitA);
      var bitB = new _InputBit.default(adder.position.x + 100 - i * 25, 30);
      adder.inputWires.push(new _Wire.default(bitB, 0, [{
        x: bitB.position.x - 12.5,
        y: y
      }, {
        x: bitB.position.x,
        y: y
      }]));
      inputB.push(bitB);
    }

    var outputBits = [];

    for (var i = 0; i < 4; i++) {
      var output = new _OutputBit.default(adder.position.x + 37.5 - i * 25, 260);
      output.inputWires.push(new _Wire.default(adder, i, []));
      outputBits.push(output);
    }

    (_a = _this.components).push.apply(_a, __spreadArray(__spreadArray(__spreadArray([], inputA), inputB), outputBits));

    var displayA = new _Display.default(35, 30, inputA, "2comp");
    var displayB = new _Display.default(365, 30, inputB, "2comp");
    var displayResult = new _Display.default(200, 350, outputBits, "2comp", 40);
    var calc1 = new _Text.default(330, 230, 20, function () {
      var a = Number(displayA.getValue());
      var b = Number(displayB.getValue());
      return "Correct: " + (a + b);
    });
    var calc2 = new _Text.default(calc1.position.x, calc1.position.y + 25, 20, function () {
      var displayed = displayResult.getValue();
      return "Guess: " + displayed;
    });
    var calc3 = new _Text.default(calc2.position.x, calc2.position.y + 25, 20, function () {
      var a = Number(displayA.getValue());
      var b = Number(displayB.getValue());
      var sum = Number(displayResult.getValue());
      var error = sum - a - b;
      return "Error: " + (error <= 0 ? '' : '+') + error;
    });

    _this.components.push(displayA, displayB, displayResult, calc1, calc2, calc3);

    (_b = _this.outputComponents).push.apply(_b, outputBits);

    return _this;
  }

  return TwosCompAdderExploration;
}(_Exploration.default);

var _default = TwosCompAdderExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts"}],"FullAdderAnswer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Display = _interopRequireDefault(require("./Display"));

var _Text = _interopRequireDefault(require("./Text"));

var _Gates = require("./Gates");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FullAdderGates.ts
//
// Still just one bit each. That is, three total (A,B,carry).
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var FullAdderAnswer =
/** @class */
function (_super) {
  __extends(FullAdderAnswer, _super);

  function FullAdderAnswer(canvas) {
    var _this = _super.call(this, canvas, 300, 400) || this;

    var inputA = new _InputBit.default(40, 50, false, 32);
    var inputB = new _InputBit.default(160, 50, false, 32);
    var inputC = new _InputBit.default(250, 180, false, 32);
    var output1 = new _OutputBit.default(inputB.position.x - 1, 340, 30);
    var output2 = new _OutputBit.default(inputA.position.x + 19, 340, 30);
    var and1 = new _Gates.AndGate(inputA.position.x + 10, 125, 50, 0);
    and1.inputWires.push(new _Wire.default(inputA, 0));
    and1.inputWires.push(new _Wire.default(inputB, 0, [{
      x: and1.position.x + 10,
      y: and1.position.y - 35
    }]));
    var xor1 = new _Gates.XorGate(inputB.position.x - 10, 125, 50, 0);
    xor1.inputWires.push(new _Wire.default(inputA, 0, [{
      x: xor1.position.x - 10,
      y: and1.position.y - 35
    }]));
    xor1.inputWires.push(new _Wire.default(inputB, 0));
    var xor2 = new _Gates.XorGate(output1.position.x, 280, 45, 0);
    xor2.inputWires.push(new _Wire.default(xor1, 0));
    xor2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: xor2.position.x + 9,
      y: inputC.position.y,
      node: true
    }]));
    output1.inputWires.push(new _Wire.default(xor2, 0));
    var and2 = new _Gates.AndGate(output2.position.x + 30, 220, 45, 0);
    and2.inputWires.push(new _Wire.default(xor1, 0, [{
      x: and2.position.x - 9,
      y: 165
    }, {
      x: xor1.position.x,
      y: 165,
      node: true
    }]));
    and2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: and2.position.x + 9,
      y: inputC.position.y
    }])); // or gate for the "2" output

    var or2 = new _Gates.OrGate(output2.position.x, output2.position.y - 44, 45, 0);
    or2.inputWires.push(new _Wire.default(and1, 0));
    or2.inputWires.push(new _Wire.default(and2, 0, [// add 12 because of the output bit
    {
      x: or2.position.x + 9,
      y: (and2.position.y + or2.position.y + 6) / 2
    }, {
      x: and2.position.x,
      y: (and2.position.y + or2.position.y + 6) / 2
    }]));
    output2.inputWires.push(new _Wire.default(or2, 0));

    _this.components.push(output1, output2, and1, xor1, and2, xor2, or2, inputA, inputB, inputC); // for ease of visualization


    var aid1 = new _OutputBit.default(xor1.position.x, xor1.position.y + 27, 12);
    aid1.inputWires.push(new _Wire.default(xor1, 0));
    var aid2 = new _OutputBit.default(and1.position.x, and1.position.y + 27, 12);
    aid2.inputWires.push(new _Wire.default(and1, 0));
    var aid3 = new _OutputBit.default(and2.position.x, and2.position.y + 30, 12);
    aid3.inputWires.push(new _Wire.default(and2, 0));

    _this.components.push(aid1, aid2, aid3); // Number Display


    var displayResult = new _Display.default(240, 340, [output1, output2], false, 42);

    _this.components.push(displayResult);

    var labelA = new _Text.default(inputA.position.x, 20, 30, "A");
    var labelB = new _Text.default(inputB.position.x, 20, 30, "B");
    var labelC = new _Text.default(inputC.position.x, inputC.position.y - 40, 30, "C");
    var text1 = new _Text.default(output1.position.x, 375, 30, "1", {
      color: '#333'
    });
    var text2 = new _Text.default(output2.position.x, 375, 30, "2", {
      color: '#333'
    });

    _this.components.push(labelA, labelB, labelC, text1, text2); // Updating


    _this.outputComponents.push(output1, output2, aid1, aid2, aid3);

    return _this;
  }

  return FullAdderAnswer;
}(_Exploration.default);

var _default = FullAdderAnswer;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts","./Gates":"Gates.ts"}],"CountdownExploration.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Exploration = _interopRequireDefault(require("./Exploration"));

var _Wire = _interopRequireDefault(require("./Wire"));

var _Clock = _interopRequireDefault(require("./Clock"));

var _InputBit = _interopRequireDefault(require("./InputBit"));

var _OutputBit = _interopRequireDefault(require("./OutputBit"));

var _Countdown = _interopRequireDefault(require("./Countdown"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ClockExploration.ts
//
// Exploration of a clock, more meant to illustrate the time-based explorations.
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
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

// pass the components and output components arrays
var CountdownExploration =
/** @class */
function (_super) {
  __extends(CountdownExploration, _super);

  function CountdownExploration(canvas) {
    var _this = _super.call(this, canvas, 300, 300) || this;

    _this.animated = true;
    var power = new _InputBit.default(150, 60, false, 40);
    var clock = new _Clock.default(100, 130);

    _this.components.push(clock);

    clock.inputWires.push(new _Wire.default(power, 0, [{
      x: clock.position.x,
      y: power.position.y
    }]));
    var countdown = new _Countdown.default(200, 200, 5);
    countdown.inputWires.push(new _Wire.default(power, 0, [{
      x: countdown.position.x,
      y: power.position.y
    }]));
    countdown.inputWires.push(new _Wire.default(clock, 0, [{
      x: clock.position.x + clock.outputSockets[0].x,
      y: countdown.position.y + countdown.inputSockets[0].y
    }]));

    _this.components.push(countdown);

    var countdownOutput = new _OutputBit.default(countdown.position.x, 260, 30);

    _this.components.push(countdownOutput);

    countdownOutput.inputWires.push(new _Wire.default(countdown, 0));

    _this.components.push(power);

    _this.outputComponents.push(countdownOutput); // some logic


    var thisExploration = _this;

    power.onClick = function () {
      if (!power.state.bits[0]) {
        thisExploration.update();
        power.constructor.prototype.onClick.apply(power, arguments);
        thisExploration.resume();
      } else {
        thisExploration.pause();
        power.constructor.prototype.onClick.apply(power, arguments);
      }

      return true;
    };

    return _this;
    /*
    // on the right...
    const countdown = new Countdown(450, 200, 5);
    this.components.push(countdown);
     const countdownSwitch = new InputBit(countdown.position.x, 125, false, 40);
    this.components.push(countdownSwitch);
    countdown.inputWires.push(new Wire(countdownSwitch, 0));
     const countdownOutput = new OutputBit(countdown.position.x, 275, 30);
    this.components.push(countdownOutput);
    countdownOutput.inputWires.push(new Wire(countdown, 0));
    */

    /*
     // on the left...
    const numBits = 3;
    const start = 5;
     const powerLeft = new InputBit(100, 50, false, 42);
     const subtractor = new Subtractor(160, 200, numBits, 7 * 24, 80);
    for (let i = 0; i < numBits; i++) {
        if (i == 0) {
            const x1 = subtractor.position.x + subtractor.inputSockets[i].x;
            const y1 = 110;
            const comp = new Not(x1, y1, 30, 0);
            subtractor.inputWires.push(new Wire(comp, 0));
            this.components.push(comp);
        } else {
            subtractor.inputWires.push(new Wire(null, 0));
        }
    }
     // Subtractor self-wiring
    for (let i = 0; i < numBits; i++) {
        const d = 12 + 12*i;
        const y1 = subtractor.position.y + subtractor.size.y/2 + d + 10;
        const y2 = subtractor.position.y - subtractor.size.y/2 - d - 10;
        subtractor.inputWires.push(new Wire(subtractor, i, [
            {x: subtractor.position.x + subtractor.inputSockets[3+i].x, y: y2},
            {x: subtractor.position.x + subtractor.size.x/2 + d, y: y2},
            {x: subtractor.position.x + subtractor.size.x/2 + d, y: y1},
            {x: subtractor.position.x + subtractor.outputSockets[i].x, y: y1, node: true},
        ]))
    }
     this.components.push(subtractor, powerLeft);
     powerLeft.linkedBits.push(countdownSwitch);
    countdownSwitch.linkedBits.push(powerLeft);
    */
  }

  return CountdownExploration;
}(_Exploration.default);

var _default = CountdownExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Countdown":"Countdown.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

var _AdderExploration = _interopRequireDefault(require("./AdderExploration"));

var _AdderFailExploration = _interopRequireDefault(require("./AdderFailExploration"));

var _BinaryExploration = _interopRequireDefault(require("./BinaryExploration"));

var _ChoiceExploration = _interopRequireDefault(require("./ChoiceExploration"));

var _ClockExploration = _interopRequireDefault(require("./ClockExploration"));

var _DividerExploration = _interopRequireDefault(require("./DividerExploration"));

var _FullAdderGates = _interopRequireDefault(require("./FullAdderGates"));

var _FullSubtractorGates = _interopRequireDefault(require("./FullSubtractorGates"));

var _GateExploration = _interopRequireDefault(require("./GateExploration"));

var _HalfAdderBuild = _interopRequireDefault(require("./HalfAdderBuild"));

var _MakeALUExploration = _interopRequireDefault(require("./MakeALUExploration"));

var _MultiplierExploration = _interopRequireDefault(require("./MultiplierExploration"));

var _MultiplierNaiveExploration = _interopRequireDefault(require("./MultiplierNaiveExploration"));

var _OnesComplementExploration = _interopRequireDefault(require("./OnesComplementExploration"));

var _RegisterExploration = _interopRequireDefault(require("./RegisterExploration"));

var _SignMagnitudeExploration = _interopRequireDefault(require("./SignMagnitudeExploration"));

var _SubtractorExploration = _interopRequireDefault(require("./SubtractorExploration"));

var _TwosCompAdderExploration = _interopRequireDefault(require("./TwosCompAdderExploration"));

var _FullAdderAnswer = _interopRequireDefault(require("./FullAdderAnswer"));

var _CountdownExploration = _interopRequireDefault(require("./CountdownExploration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Alphabetized because... idunno
function createCanvas() {
  var canvas = document.createElement("canvas");
  return canvas;
} // in milliseconds


var UPDATE_TIMES = [4000, 2500, 1600, 1000, 630, 400, 250];

function createExploration(id, type) {
  var element = document.getElementById(id);

  if (!element) {
    console.warn("Document element " + id + " not found.");
    return;
  }

  element.className += " row";
  var canvasWrapper = document.createElement("div");
  canvasWrapper.className = "canvas-wrapper col-auto";
  var canvas = createCanvas();
  canvasWrapper.appendChild(canvas);
  element.appendChild(canvasWrapper);
  var exploration = new type(canvas);
  exploration.update();
  canvas.addEventListener("click", function (event) {
    exploration.onClick(event.offsetX, event.offsetY);
  }); // For animated explorations, have speed controls

  if (exploration.animated) {
    var controls = document.createElement("div");
    controls.className = "controls col-auto";
    controls.innerHTML = "\n            <h4>Speed</h4>\n            <p style=\"margin-top: 0\">\n                Slow\n                <input id=\"speed-" + id + "\" name=\"speed\" type=\"range\" min=\"0\" max=\"" + (UPDATE_TIMES.length - 1) + "\" />\n                Fast\n            </p>\n            <div class=\"buttons\">\n                <button id=\"pause-" + id + "\">Pause</button>\n                <button id=\"resume-" + id + "\">Play</button>\n                <button id=\"step-" + id + "\">Step</button>\n            </div>\n        "; // get those buttons

    controls.querySelector("#speed-" + id).addEventListener("change", function (event) {
      exploration.updateTime = UPDATE_TIMES[Number(event.target.value)];
    });
    element.appendChild(controls);
    var pauseButton_1 = controls.querySelector("#pause-" + id);

    exploration.pause = function () {
      exploration.constructor.prototype.pause.call(exploration);
      pauseButton_1.disabled = true;
      resumeButton_1.disabled = false;
    };

    pauseButton_1.addEventListener("click", exploration.pause);
    pauseButton_1.disabled = true;
    var resumeButton_1 = controls.querySelector("#resume-" + id);

    exploration.resume = function () {
      exploration.constructor.prototype.resume.call(exploration);
      pauseButton_1.disabled = false;
      resumeButton_1.disabled = true;
    };

    resumeButton_1.addEventListener("click", exploration.resume);
    controls.querySelector("#step-" + id).addEventListener("click", exploration.update.bind(exploration)); //exploration.resume();
  }

  return exploration;
} // Explorations
// {htmlId: Class}


var explorationMap = {
  // part 1 (and maybe part 2 as well)
  'binary-basic': _BinaryExploration.default,
  'adder': _AdderExploration.default,
  'gates': _GateExploration.default,
  'half-adder-build': _HalfAdderBuild.default,
  'gates-again': _GateExploration.default,
  'full-adder1': _FullAdderGates.default,
  'clock': _ClockExploration.default,
  // part 2
  'signmag': _SignMagnitudeExploration.default,
  'adder-fail': _AdderFailExploration.default,
  'full-subtractor1': _FullSubtractorGates.default,
  'full-adder-answer': _FullAdderAnswer.default,
  'ones-complement': _OnesComplementExploration.default,
  'twos-comp-adder': _TwosCompAdderExploration.default,
  'subtractor': _SubtractorExploration.default,
  'make-alu': _MakeALUExploration.default,
  // part 3
  'multiplier-naive': _MultiplierNaiveExploration.default,
  'choice': _ChoiceExploration.default,
  'register': _RegisterExploration.default,
  'countdown': _CountdownExploration.default,
  'multiplier-full': _MultiplierExploration.default,
  'divider-full': _DividerExploration.default
};
var ALL_EXPLORATIONS = [];

for (var id in explorationMap) {
  ALL_EXPLORATIONS.push(createExploration(id, explorationMap[id]));
}

var isDark = false;

function renderLoop() {
  // TODO: Put this in exploration
  for (var i = 0; i < ALL_EXPLORATIONS.length; i++) {
    var exploration = ALL_EXPLORATIONS[i];

    if (exploration) {
      exploration.render(isDark);
    }
  }

  requestAnimationFrame(renderLoop);
}

renderLoop(); // some other stuff

function fillInteractiveTable(table) {
  if (table === null) return;
  var html = "<input type=\"number\" min=\"0\" max=\"1\" size=\"4\" style=\"min-width: 3em\" />";
  var fillIn = table.tBodies[0].getElementsByTagName("tr");

  for (var i = 0; i < fillIn.length; i++) {
    var out1 = document.createElement("td");
    out1.innerHTML = html;
    var out2 = document.createElement("td");
    out2.innerHTML = html;
    fillIn[i].appendChild(out1);
    fillIn[i].appendChild(out2);
  }
}

fillInteractiveTable(document.getElementById("fill-in"));

function setDark(on) {
  if (on) {
    document.body.style.backgroundColor = "#212529";
    document.body.style.color = "#909396";
    isDark = true;
  } else {
    document.body.style.backgroundColor = "#fff";
    document.body.style.color = "#212519";
    isDark = false;
  }

  renderLoop();
}

setDark(false);
},{"./AdderExploration":"AdderExploration.ts","./AdderFailExploration":"AdderFailExploration.ts","./BinaryExploration":"BinaryExploration.ts","./ChoiceExploration":"ChoiceExploration.ts","./ClockExploration":"ClockExploration.ts","./DividerExploration":"DividerExploration.ts","./FullAdderGates":"FullAdderGates.ts","./FullSubtractorGates":"FullSubtractorGates.ts","./GateExploration":"GateExploration.ts","./HalfAdderBuild":"HalfAdderBuild.ts","./MakeALUExploration":"MakeALUExploration.ts","./MultiplierExploration":"MultiplierExploration.ts","./MultiplierNaiveExploration":"MultiplierNaiveExploration.ts","./OnesComplementExploration":"OnesComplementExploration.ts","./RegisterExploration":"RegisterExploration.ts","./SignMagnitudeExploration":"SignMagnitudeExploration.ts","./SubtractorExploration":"SubtractorExploration.ts","./TwosCompAdderExploration":"TwosCompAdderExploration.ts","./FullAdderAnswer":"FullAdderAnswer.ts","./CountdownExploration":"CountdownExploration.ts"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55541" + '/');

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
      console.log('[parcel] ??? Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] ????  ' + data.error.message + '\n' + data.error.stack);
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
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">????</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
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