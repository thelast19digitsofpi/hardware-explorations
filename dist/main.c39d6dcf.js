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

    if (typeof this.afterRender === "function") {
      this.afterRender();
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
      /*ctx.fillStyle = "black";
      ctx.fillText(String(i), this.position.x + socket.x, this.position.y + socket.y - 15);*/
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

  Adder.prototype.beforeUpdate = function () {
    // The simulation was having some bugs without this
    this.state.bits = this.evaluate(this.inputWires.map(function (wire) {
      return wire ? wire.get() : false;
    }));
  };

  return Adder;
}();

var _default = Adder;
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
    ctx.rotate(-this.rotation);
    ctx.font = Math.round(this.size.y * 0.6) + "px monospace";
    ctx.fillStyle = "#333";
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

  Not.prototype.render = function (ctx) {
    Gate.prototype.render.call(this, ctx);
  };

  ;

  Not.prototype.onClick = function (_, __) {};

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
  // bits=8 means an 8-bit plus 8-bit
  // note that I'm thinking about using this for InputBits, OutputBits, and RegisterBits
  // and those only have one state to get
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

  Display.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  Display.prototype.render = function (ctx) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + this.size.x, top);
    ctx.lineTo(left + this.size.x, top + this.size.y);
    ctx.lineTo(left, top + this.size.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke(); // get the state

    var totalValue = 0;

    for (var i = 0; i < this.components.length; i++) {
      var comp = this.components[i];
      var value = (comp.state.bits[0] ? 1 : 0) << i; // use 2's complement if signed on the last bit

      totalValue += this.signed && i == this.components.length - 1 ? -value : value;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = Math.round(this.size.y * 4 / 5) + "px monospace";
    ctx.fillStyle = "#000";
    ctx.fillText(String(totalValue), this.position.x, this.position.y);
    ctx.restore();
  };

  Display.prototype.evaluate = function (bits) {
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
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Gates":"Gates.ts","./Display":"Display.ts"}],"Text.ts":[function(require,module,exports) {
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

    this.onClick = function () {};

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

  Text.prototype.render = function (ctx) {
    ctx.save();
    var message = typeof this.text === "function" ? this.text() : this.text;
    ctx.font = this.size.y + "px monospace"; // if function, call it; if string, use it; if undefined, default to #333

    ctx.fillStyle = typeof this.options.color === "function" ? this.options.color() : this.options.color || "#333"; // positioning

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

    var inputChoice = new _InputBit.default(50, 90, false, 30);
    var inputElse = new _InputBit.default(100, 90, false, 30);
    var inputIf = new _InputBit.default(150, 90, false, 30);

    _this.components.push(inputChoice, inputIf, inputElse);

    var inverter = new _Gates.Not(115, 150, 30, 0);

    _this.components.push(inverter);

    inverter.inputWires.push(new _Wire.default(inputChoice, 0, [{
      x: 115,
      y: 125
    }, {
      x: 50,
      y: 125
    }])); // recursive components are a bit weird

    var andIf = new _Gates.AndGate(125, 200, 50, 0);
    var andElse = new _Gates.AndGate(75, 200, 50, 0);
    var or = new _Gates.OrGate(100, 250, 50, 0);
    andIf.inputWires = [new _Wire.default(inverter, 0, []), new _Wire.default(inputIf, 0, [{
      x: 135,
      y: 170
    }, {
      x: 150,
      y: 170
    }])];
    andElse.inputWires = [new _Wire.default(inputChoice, 0, [{
      x: 65,
      y: 170
    }, {
      x: 50,
      y: 170
    }]), new _Wire.default(inputElse, 0, [{
      x: 85,
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


    var inputChoice2 = new _InputBit.default(240, 120, false, 30);
    var inputIf2 = new _InputBit.default(280, 120, false, 30);
    var inputElse2 = new _InputBit.default(320, 120, false, 30);
    var choice = new _ChoiceGate.default(300, 200, 40);
    var output2 = new _OutputBit.default(300, 250);
    choice.inputWires.push(new _Wire.default(inputChoice2, 0, [{
      x: inputChoice2.position.x,
      y: choice.position.y
    }]));
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
},{}],"Subtractor.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

  Subtractor.prototype.onClick = function (_offsetX, _offsetY) {
    return;
  };

  ;

  Subtractor.prototype.render = function (ctx) {
    ctx.save();
    var left = this.position.x - this.size.x / 2;
    var top = this.position.y - this.size.y / 2; // base

    ctx.fillStyle = "#cccccc";
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
      num1 += (wire1.toComponent.state.bits[wire1.toOutput] ? 1 : 0) * (1 << i);
      num2 += (wire2.toComponent.state.bits[wire2.toOutput] ? 1 : 0) * (1 << i);
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
},{}],"Clock.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Clock.ts
//
// These clocks can have an arbitrary period.
var ChoiceGate =
/** @class */
function () {
  //
  function ChoiceGate(x, y, bits, width, height) {
    if (width === void 0) {
      width = 100;
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

    var bitArray = Array(bits).map(function (_) {
      return false;
    });
    this.state = {
      bits: bitArray,
      clock: -1
    };
    this.numBits = bits; // "power supply" or more accurately a way to reset the clock

    this.inputSockets = [{
      x: 0,
      y: -this.size.y / 2 - 1
    }];
    this.outputSockets = [];
    var spacing = width / bits;

    for (var i = 0; i < bits; i++) {
      this.outputSockets.push({
        x: (i - bits / 2 + 1 / 2) * spacing,
        y: this.size.y / 2
      });
    }

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

    ctx.fillStyle = "#e0e0e4";
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
      ctx.fillStyle = i == this.state.clock ? "#33ff33" : "#990000";
      ctx.beginPath();
      ctx.arc(socket.x, socket.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }; // Evaluation: the clock's state is set on


  ChoiceGate.prototype.evaluate = function (bits) {
    var result = [];

    for (var i = 0; i < this.numBits; i++) {
      result.push(i == this.state.clock);
    }

    return result;
  };

  ChoiceGate.prototype.beforeUpdate = function () {
    var _a;

    if ((_a = this.inputWires[0]) === null || _a === void 0 ? void 0 : _a.get()) {
      this.state.clock = (this.state.clock + 1) % this.numBits;
    } else {
      this.state.clock = -1;
    }
  };

  return ChoiceGate;
}();

var _default = ChoiceGate;
exports.default = _default;
},{}],"DividerExploration.ts":[function(require,module,exports) {
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
      ctx.save(); // get the clock cycle

      var cycle = _this.countdown.state.clock;

      if (cycle >= 0 && cycle < 2 * _this.numBits + 3) {
        var n = cycle + 1 >> 1;

        _this.drawRemainderGuide(n + 5, n + 0, "#33c", "Remainder");

        if (n > 1) {
          _this.drawRemainderGuide(n - 2, Math.max(n - 7, 0), "#990", "Quotient");
        }
      }

      ctx.restore(); // not sure where to put this

      if (cycle == 2 * _this.numBits + 3) {
        _this.startButton.state.active = false;
        _this.startButton.state.bits = [false];
      }
    };

    canvas.width = 800;
    canvas.height = 600; // A lot of the same stuff happens compared to Multiplier...

    var BITS = 6;
    _this.numBits = BITS;
    var startButton = new _InputBit.default(695, 40, false, 50);
    _this.startButton = startButton;
    var startNot = new _Gates.Not(startButton.position.x - 50, 40, 30, 90);
    startNot.inputWires.push(new _Wire.default(startButton, 0));

    _this.components.push(startNot);

    var clockX = 690;
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

    _this.outputComponents.push(clockBit); // ironic that I called the above a "clock"
    // when the clock strikes 2*BITS + 4 it will end the operation
    // but I add one more to avoid confusion


    var countdown = new _Clock.default(750, 230, 2 * BITS + 4, 80, 50);
    countdown.inputWires.push(new _Wire.default(startButton, 0, [{
      x: countdown.position.x,
      y: countdown.position.y - 40
    }, {
      x: countdown.position.x,
      y: 40
    }]));
    _this.countdown = countdown;
    var subtractor = new _Subtractor.default(210, 180, BITS, 260, 80); //this.outputComponents.push(subtractor);
    // Also not really a register.

    var remainderRegister = [];
    _this.remainderRight = 680;
    _this.remainderSpacing = 52;

    for (var i = 0; i < 2 * BITS + 1; i++) {
      var reg = new _OutputBit.default(_this.remainderRight - _this.remainderSpacing * i, 460, 20);
      remainderRegister.push(reg);

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
      color: "rgba(0, 128, 128, 0.35)"
    };
    var blue = {
      color: "rgba(32, 64, 128, 0.8)"
    };
    var blueFaded = {
      color: "rgba(32, 64, 128, 0.4)"
    }; //const yellow = {color: "rgba(160, 160, 0)"};
    // Input Numbers (N/D). D = divisor, N = dividend

    var inputN = [];
    var inputD = [];

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(340 - i * 25, 40);

      _this.components.push(input);

      inputN.push(input); // in case we need it
    }

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(340 - i * 25, 110);

      _this.components.push(input);

      inputD.push(input);
    } // Wires from the registers to the subtractor.


    for (var i = 0; i < BITS; i++) {
      var d = 3;
      var bit = remainderRegister[i + BITS]; // basically, we want the most significant bit to be highest

      var y1 = bit.position.y + 15 + d * (BITS - i);
      var y2 = subtractor.position.y - 70;
      subtractor.inputWires.push(new _Wire.default(bit, 0, [{
        x: subtractor.position.x + subtractor.inputSockets[i].x - 30 + d * i,
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
      // space them a bit

      var choice = new _ChoiceGate.default(remainderRegister[i + BITS].position.x, y + 50, 10); // choice depends on whether or not the carry bit is positive or negative

      choice.inputWires.push(new _Wire.default(subtractor, BITS, [{
        x: choice.position.x - 15,
        y: choice.position.y
      }, {
        x: choice.position.x - 15,
        y: choice.position.y - 20
      }, {
        x: subtractor.position.x - subtractor.size.x / 2,
        y: choice.position.y - 20
      }, {
        x: subtractor.position.x - subtractor.size.x / 2,
        y: subtractor.position.y
      }], {
        color: "#888"
      })); // if negative, we just re-use the remainder register

      var regBit = remainderRegister[i + BITS];
      choice.inputWires.push(new _Wire.default(regBit, 0, [{
        x: choice.position.x + 5,
        y: choice.position.y - 10
      }, {
        x: choice.position.x + 20,
        y: choice.position.y - 10
      }, {
        x: choice.position.x + 20,
        y: regBit.position.y
      }], purple)); // otherwise we use the subtraction

      choice.inputWires.push(new _Wire.default(subtractor, i, [{
        x: choice.position.x + 5,
        y: choice.position.y - 30
      }]));
      subtractorChoiceGates.push(choice);

      _this.components.push(choice);
    } // Shifting the Remainder Register
    // includes many wires
    // also includes register for holding the quotient input


    var fullRow = [];

    for (var i = 0; i <= 2 * BITS; i++) {
      var regBit = remainderRegister[i];
      /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
      this.components.push(or);
      regBit.inputWires.push(new Wire(or, 0));*/
      // This is the middle (full) row

      var choice = new _ChoiceGate.default(regBit.position.x + (i < BITS ? 5 : -1), regBit.position.y - 100, 14); // Selection Wire (from clock's NOT)

      choice.inputWires.push(new _Wire.default(clockAnd, 0, [{
        x: choice.position.x - 18,
        y: choice.position.y
      }, {
        x: choice.position.x - 18,
        y: choice.position.y - 40
      }, {
        x: 580 - 2 * i,
        y: choice.position.y - 50 - 1 * i
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
          x: regBit.position.x - 19,
          y: choice.position.y - 25
        }, {
          x: regBit.position.x - 19,
          y: regBit.position.y
        }], purple));
      } // Shifting


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
        var holdWrite = new _OutputBit.default(choice.position.x + 30, choice.position.y - 25, 20);
        var notY = subtractorChoiceGates[0].position.y - 20;
        var not = new _Gates.Not(500, notY, 30, -90);
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

        holdWrite.inputWires.push(new _Wire.default(not, 0, [], teal)); // maybe?
        //choice.inputWires[1] = new Wire(holdWrite, 0, [], purple);

        choice.inputWires.push(new _Wire.default(holdWrite, 0, [], teal));

        _this.components.push(not, holdWrite);

        _this.outputComponents.push(holdWrite);
      }

      _this.components.push(choice);

      fullRow.push(choice);
    } // Computing the Quotient
    // The second input register that is actually a register.

    /*let divisorRegister: RegisterBit[] = [];
    let divisorRegisterChoice = [];
    for (let i = 0; i < BITS; i++) {
        const reg = new RegisterBit(inputD[i].position.x - 4, 150, 20);
        subtractor.inputWires.push(new Wire(reg, 0));
        divisorRegister.push(reg);
        this.components.push(reg);
        this.outputComponents.push(reg);
    }
    // Wiring Divisor (denominator) to the Registers
    for (let i = 0; i < BITS; i++) {
        const reg = divisorRegister[i];
        const or = new OrGate(reg.position.x - 9, reg.position.y - 25, 20, 0);
        const choice = new ChoiceGate(reg.position.x + 9, reg.position.y - 55, 12);
        reg.inputWires.push(new Wire(or, 0), new Wire(choice, 0));
         const wirePath = [
            {x: reg.position.x - 13, y: choice.position.y},
            {x: reg.position.x - 13, y: startNot.position.y},
        ];
        or.inputWires.push(new Wire(startNot, 0, wirePath, {color: "rgba(100, 100, 130, 0.75)"}));
        or.inputWires.push(new Wire(clockNot, 0, [
            {x: or.position.x + 10, y: or.position.y - 18 - i/2},
            {x: clockNot.position.x - 40, y: or.position.y - 18 - i},
        ], tealFaded));
         // choice gate is [0] ? [1] : [2]
        // the selection comes first
        choice.inputWires.push(new Wire(startNot, 0, wirePath, {color: "rgba(100, 100, 130, 0.75)"}));
         // If the clock is off, the registers need to use the input bits
        choice.inputWires.push(new Wire(inputD[i], 0));
        // Else, move up
        choice.inputWires.push(new Wire(divisorRegister[i+1] || null, 0, [
            {x: reg.position.x + 15, y: choice.position.y - 15},
            {x: reg.position.x - 22, y: choice.position.y - 15},
            {x: reg.position.x - 22, y: reg.position.y + 10},
        ]));
         this.components.push(or, choice);
    }*/
    // Wiring Dividend to seed the remainder register
    // (blue wires)


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
        y: choice.position.y + 15
      }, {
        x: 770,
        y: choice.position.y + 15
      }, {
        x: 770,
        y: countdown.position.y + 40
      }, {
        x: clockX - 30,
        y: countdown.position.y + 40
      }, {
        x: clockX - 30,
        y: startButton.position.y + (startButton.position.x - clockX + 30)
      }], blue)); // If power is on, make it come from the teal/purple stuff

      choice.inputWires.push(new _Wire.default(fullRow[i], 0)); // Otherwise, set it to the input

      var d = 3;
      var y1 = countdown.position.y + 50;
      var y2 = inBit.position.y + 30;
      choice.inputWires.push(new _Wire.default(inBit, 0, [{
        x: choice.position.x + 6,
        y: choice.position.y - 10 - d * i
      }, {
        x: 760 - d * i,
        y: choice.position.y - 10 - d * i
      }, {
        x: 760 - d * i,
        y: y1 + d * i
      }, {
        x: clockX - 40 - d * i,
        y: y1 + d * i
      }, {
        x: clockX - 40 - d * i,
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
        x: and.position.x + 13,
        y: and.position.y - 20
      }, {
        x: and.position.x + 13,
        y: and.position.y + 15
      }, {
        x: 770,
        y: and.position.y + 15
      }, {
        x: 770,
        y: countdown.position.y + 40
      }, {
        x: clockX - 30,
        y: countdown.position.y + 40
      }, {
        x: clockX - 30,
        y: startButton.position.y + (startButton.position.x - clockX + 30)
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


      bit.inputWires.push(new _Wire.default(countdown, 14, [{
        x: bit.position.x - 15,
        y: bit.position.y - 15
      }, {
        x: bit.position.x - 15,
        y: bit.position.y - 30
      }, {
        x: 790,
        y: bit.position.y - 30
      }, {
        x: 790,
        y: countdown.position.y + 40
      }, {
        x: countdown.position.x + countdown.outputSockets[14].x,
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


    var displayN = new _Display.default(inputN[0].position.x + 50, inputN[0].position.y, inputN, false, 30);
    var displayD = new _Display.default(inputD[0].position.x + 50, inputD[0].position.y, inputD, false, 30);
    var displayQ = new _Display.default(557, 540, finalAnswer.slice(0, BITS), false, 30);
    var displayR = new _Display.default(200, 540, finalAnswer.slice(BITS, 2 * BITS), false, 30); // rendering trick, because input wires are drawn with a component
    // so pushing these last makes them render last so it looks cleaner

    _this.components.push(subtractor, countdown, startButton, displayN, displayD, displayQ, displayR);

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
    ctx.fillStyle = color;
    ctx.font = "30px monospace";
    ctx.strokeText(text, (x1 + x2) / 2, y + 25);
    ctx.fillText(text, (x1 + x2) / 2, y + 25);
  };

  return DividerExploration;
}(_Exploration.default);

var _default = DividerExploration;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./RegisterBit":"RegisterBit.ts","./Subtractor":"Subtractor.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./Display":"Display.ts","./Gates":"Gates.ts","./ChoiceGate":"ChoiceGate.ts"}],"FullAdderGates.ts":[function(require,module,exports) {
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

var FullAdderExploration1 =
/** @class */
function (_super) {
  __extends(FullAdderExploration1, _super);

  function FullAdderExploration1(canvas) {
    var _this = _super.call(this, canvas, 400, 400) || this;

    var inputA = new _InputBit.default(80, 50, false, 30);
    var inputB = new _InputBit.default(200, 50, false, 30);
    var inputC = new _InputBit.default(300, 200, false, 30);
    var output1 = new _OutputBit.default(200, 340, 30);
    var output2 = new _OutputBit.default(100, 340, 30);
    var and1 = new _Gates.AndGate(inputA.position.x + 10, 140, 50, 0);
    and1.inputWires.push(new _Wire.default(inputA, 0));
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
    var xor2 = new _Gates.XorGate(200, 280, 50, 0);
    xor2.inputWires.push(new _Wire.default(xor1, 0));
    xor2.inputWires.push(new _Wire.default(inputC, 0, [{
      x: xor2.position.x + 10,
      y: inputC.position.y,
      node: true
    }]));
    output1.inputWires.push(new _Wire.default(xor2, 0));
    var and2 = new _Gates.AndGate(output2.position.x + 30, 230, 50, 0);
    and2.inputWires.push(new _Wire.default(xor1, 0, [{
      x: and2.position.x - 10,
      y: 180
    }, {
      x: xor1.position.x,
      y: 180,
      node: true
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

    _this.components.push(output1, output2, and1, xor1, and2, xor2, or2, inputA, inputB, inputC); // for ease of visualization


    var aid1 = new _OutputBit.default(xor1.position.x, xor1.position.y + 27, 12);
    aid1.inputWires.push(new _Wire.default(xor1, 0));
    var aid2 = new _OutputBit.default(and1.position.x, and1.position.y + 27, 12);
    aid2.inputWires.push(new _Wire.default(and1, 0));
    var aid3 = new _OutputBit.default(and2.position.x, and2.position.y + 27, 12);
    aid3.inputWires.push(new _Wire.default(and2, 0));

    _this.components.push(aid1, aid2, aid3); // Number Display


    var displayResult = new _Display.default(320, 340, [output1, output2], false, 42);

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


    _this.outputComponents.push(output1, output2, aid1, aid2);

    return _this;
  }

  return FullAdderExploration1;
}(_Exploration.default);

var _default = FullAdderExploration1;
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
},{"./Exploration":"Exploration.ts","./Wire":"Wire.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Gates":"Gates.ts"}],"HalfAdderCheat.ts":[function(require,module,exports) {
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

var HalfAdderCheat =
/** @class */
function (_super) {
  __extends(HalfAdderCheat, _super);

  function HalfAdderCheat(canvas) {
    var _this = _super.call(this, canvas, 300, 300) || this;

    var inputA = new _InputBit.default(100, 40, false, 30);
    var inputB = new _InputBit.default(200, 40, false, 30);
    var output1 = new _OutputBit.default(150, 240, 30);
    var output2 = new _OutputBit.default(75, 240, 30);
    var adder = new _Adder.default(150, 150, 1, 200, 100);

    _this.components.push(adder, inputA, inputB, output1, output2);

    adder.inputWires.push(new _Wire.default(inputA, 0));
    adder.inputWires.push(new _Wire.default(inputB, 0));
    output1.inputWires.push(new _Wire.default(adder, 0));
    output2.inputWires.push(new _Wire.default(adder, 1));
    var displayResult = new _Display.default(240, 250, [output1, output2], false, 40);

    _this.components.push(displayResult);

    _this.outputComponents.push(output1, output2);

    var text1 = new _Text.default(150, 275, 24, "1", {
      color: '#333'
    });
    var text2 = new _Text.default(75, 275, 24, "2", {
      color: '#333'
    });

    _this.components.push(text1, text2);

    return _this;
  }

  return HalfAdderCheat;
}(_Exploration.default);

var _default = HalfAdderCheat;
exports.default = _default;
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Display":"Display.ts","./Text":"Text.ts"}],"MultiplierExploration.ts":[function(require,module,exports) {
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
      var cycle = _this.countdown.state.clock;

      if (cycle >= 0) {
        var n = cycle + 1 >> 1;

        if (n <= 5) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          var west = _this.regRight - _this.regSpacing * (5 - n) - 20;
          var north = 340,
              south = 480;
          var east = _this.regRight + 22;
          ctx.beginPath();
          ctx.moveTo(west, north);
          ctx.lineTo(east, north);
          ctx.lineTo(east, south);
          ctx.lineTo(west, south);
          ctx.fill();
        } // product value


        var productValue = 0;

        for (var i = 0; i < _this.numBits + n; i++) {
          var bit = _this.productRegister[i + (6 - n)];
          productValue += Number(bit.state.bits[0]) * (1 << i);
        }

        _this.drawProductGuide(2 * _this.numBits, _this.numBits - n, "#33c", "Product (" + productValue + ")");
      }

      if (cycle == 2 * _this.numBits + 1) {
        _this.startButton.state.active = false;
        _this.startButton.state.bits = [false];
      }
    };

    canvas.width = 800;
    canvas.height = 600;
    var BITS = 6;
    _this.numBits = BITS;
    var startButton = new _InputBit.default(760, 40, false, 50);
    _this.startButton = startButton;
    var startNot = new _Gates.Not(680, 40, 30, 90);
    startNot.inputWires.push(new _Wire.default(startButton, 0));

    _this.components.push(startNot);

    var clockX = 755;
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

    _this.outputComponents.push(clockBit); // ironic that I called the above a "clock"
    // when the clock strikes 2*BITS + 1 it will end the operation


    var countdown = new _Clock.default(730, 260, 14, 80, 50);
    countdown.inputWires.push(new _Wire.default(startButton, 0, [{
      x: countdown.position.x,
      y: countdown.position.y - 40
    }, {
      x: 705,
      y: countdown.position.y - 40
    }, {
      x: 705,
      y: 40
    }]));
    _this.countdown = countdown;
    var adder = new _Adder.default(180, 190, BITS, 270, 90); //this.outputComponents.push(adder);
    // The "Register" that really isn't.
    // The Add and Shift steps should be successfully separated...

    var productRegister = [];
    _this.regRight = 730;
    _this.regSpacing = 55;

    for (var i = 0; i < 2 * BITS + 1; i++) {
      var reg = new _OutputBit.default(_this.regRight - _this.regSpacing * i, 430, 20);
      productRegister.push(reg);

      _this.outputComponents.unshift(reg); // todo: is needed?


      _this.components.push(reg);
    } // Wire Coloring


    var purple = {
      color: "rgb(128, 32, 128)"
    };
    var purpleFaded = {
      color: "rgba(128, 0, 128, 0.4)"
    };
    var teal = {
      color: "rgb(0, 128, 128)"
    };
    var tealFaded = {
      color: "rgba(0, 128, 128, 0.35)"
    }; // Wires from the registers to the adder.

    for (var i = 0; i < BITS; i++) {
      var d = 3;
      var bit = productRegister[i + BITS]; // basically, we want the most significant bit to be highest

      var y1 = bit.position.y + 15 + d * (BITS - i);
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


    var adderChoiceGates = [];

    for (var i = 0; i <= BITS; i++) {
      // and gate
      //const x = adder.position.x + adder.outputSockets[i].x;
      var y = adder.position.y + adder.outputSockets[0].y; // put them all on the same line
      // space them a bit

      var choice = new _ChoiceGate.default(productRegister[i + BITS].position.x + 7, y + 50, 10); // this will be input 0 temporarily but we will unshift later

      choice.inputWires.push(new _Wire.default(adder, i));
      adderChoiceGates.push(choice);

      _this.components.push(choice);
    } // Shifting the Multiplication Register


    for (var i = 0; i < 2 * BITS + 1; i++) {
      var regBit = productRegister[i];
      /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
      this.components.push(or);
      regBit.inputWires.push(new Wire(or, 0));*/

      var choice = new _ChoiceGate.default(regBit.position.x, regBit.position.y - 60, 14); // Selection Wire (from clock's NOT)

      choice.inputWires.push(new _Wire.default(clockNot, 0, [{
        x: choice.position.x - 18,
        y: choice.position.y
      }, {
        x: choice.position.x - 18,
        y: choice.position.y - 24
      }, {
        x: 630 - 2 * i,
        y: choice.position.y - 60 - i
      }], tealFaded)); // Shifting

      if (i < 2 * BITS) {
        choice.inputWires.push(new _Wire.default(productRegister[i + 1], 0, [{
          x: regBit.position.x - 7,
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

      if (i >= BITS) {
        // Upper Half of the Register: Conditionally connect to the adder.
        choice.inputWires.push(new _Wire.default(adderChoiceGates[i - BITS], 0, [], purple));
      } else {
        // Lower Half of the Register: Connect to itself.
        choice.inputWires.push(new _Wire.default(regBit, 0, [{
          x: regBit.position.x + 7,
          y: choice.position.y - 20
        }, {
          x: regBit.position.x + 20,
          y: choice.position.y - 20
        }, {
          x: regBit.position.x + 20,
          y: regBit.position.y
        }], purple));
      }

      _this.components.push(choice);

      regBit.inputWires.push(new _Wire.default(choice, 0));
    } // Input Numbers (A and B).


    var inputA = [];
    var inputB = [];

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(320 - i * 30, 60, false, 25);

      _this.components.push(input);

      adder.inputWires.push(new _Wire.default(input, 0));
      inputA.push(input); // in case we need it
    }

    for (var i = 0; i < BITS; i++) {
      var input = new _InputBit.default(630 - i * 50, 60, false, 25);

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
        color: "rgb(127, 127, 127)"
      })); // Else wire

      var outBit = productRegister[i + BITS];
      choice.inputWires.push(new _Wire.default(outBit, 0, [{
        x: choice.position.x + 4,
        y: choice.position.y - 10
      }, {
        x: choice.position.x + 11,
        y: choice.position.y - 10
      }, {
        x: outBit.position.x + 18,
        y: 305 + 2 * i
      }, {
        x: outBit.position.x + 18,
        y: outBit.position.y - 18
      }], purpleFaded));
    } // Answer Register


    var finalAnswer = [];

    for (var i = 0; i <= 2 * BITS; i++) {
      var offset = 5;
      var bit = new _RegisterBit.default(productRegister[i].position.x + offset, 530, 30);

      _this.components.push(bit);

      _this.outputComponents.push(bit); // set wire: on at the 12th clock cycle


      bit.inputWires.push(new _Wire.default(countdown, 12, [{
        x: bit.position.x - 15,
        y: bit.position.y - 15
      }, {
        x: bit.position.x - 15,
        y: bit.position.y - 30
      }, {
        x: 780,
        y: bit.position.y - 30
      }, {
        x: 780,
        y: countdown.position.y + 40
      }, {
        x: countdown.position.x + countdown.outputSockets[12].x,
        y: countdown.position.y + 40
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


    var displayA = new _Display.default(245, 25, inputA, false, 30);
    var displayB = new _Display.default(510, 20, inputB, false, 30);
    var displayEnd = new _Display.default(400, 575, finalAnswer, false, 48);
    displayEnd.size.x = 2 * displayEnd.size.y; // rendering trick, because input wires are drawn with a component
    // so pushing these last makes them render last so it looks cleaner

    _this.components.push(adder, countdown, startButton, displayA, displayB, displayEnd);

    _this.productRegister = productRegister;
    return _this;
  }

  MultiplierExploration.prototype.drawProductGuide = function (left, right, color, text) {
    var ctx = this.context;
    var x1 = this.regRight - left * this.regSpacing - 15;
    var x2 = this.regRight - right * this.regSpacing + 15;
    var y = 460;
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
    ctx.lineWidth = 2;
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
},{"./Exploration":"Exploration.ts","./InputBit":"InputBit.ts","./OutputBit":"OutputBit.ts","./RegisterBit":"RegisterBit.ts","./Adder":"Adder.ts","./Wire":"Wire.ts","./Clock":"Clock.ts","./Display":"Display.ts","./Gates":"Gates.ts","./ChoiceGate":"ChoiceGate.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

var _AdderExploration = _interopRequireDefault(require("./AdderExploration"));

var _BinaryExploration = _interopRequireDefault(require("./BinaryExploration"));

var _ChoiceExploration = _interopRequireDefault(require("./ChoiceExploration"));

var _DividerExploration = _interopRequireDefault(require("./DividerExploration"));

var _FullAdderGates = _interopRequireDefault(require("./FullAdderGates"));

var _GateExploration = _interopRequireDefault(require("./GateExploration"));

var _HalfAdderCheat = _interopRequireDefault(require("./HalfAdderCheat"));

var _MultiplierExploration = _interopRequireDefault(require("./MultiplierExploration"));

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
    pauseButton_1.addEventListener("click", function () {
      exploration.pause();
      pauseButton_1.disabled = true;
      resumeButton_1.disabled = false;
    });
    pauseButton_1.disabled = true;
    var resumeButton_1 = controls.querySelector("#resume-" + id);
    resumeButton_1.addEventListener("click", function () {
      exploration.resume();
      pauseButton_1.disabled = false;
      resumeButton_1.disabled = true;
    });
    controls.querySelector("#step-" + id).addEventListener("click", exploration.update.bind(exploration)); //exploration.resume();
  }

  return exploration;
} // Explorations


var ALL_EXPLORATIONS = [];
ALL_EXPLORATIONS.push(createExploration('binary-basic', _BinaryExploration.default), createExploration('adder', _AdderExploration.default), createExploration('gates', _GateExploration.default), //ALL_EXPLORATIONS.push(createExploration('subtractor', SubtractorExploration));
createExploration('choice', _ChoiceExploration.default), createExploration('half-adder-cheat', _HalfAdderCheat.default), createExploration('gates-again', _GateExploration.default), createExploration('full-adder1', _FullAdderGates.default)); //ALL_EXPLORATIONS.push(createExploration('clock', ClockExploration));

ALL_EXPLORATIONS.push(createExploration('multiplier-full', _MultiplierExploration.default));
ALL_EXPLORATIONS.push(createExploration('divider-full', _DividerExploration.default)); //ALL_EXPLORATIONS.push(createExploration('3', RegisterExploration));

function renderLoop() {
  // TODO: Put this in exploration
  for (var i = 0; i < ALL_EXPLORATIONS.length; i++) {
    var exploration = ALL_EXPLORATIONS[i];

    if (exploration) {
      exploration.render();
    }
  }

  requestAnimationFrame(renderLoop);
}

renderLoop(); // some other stuff

function fillInteractiveTable(table) {
  if (table === null) return;
  var html = "<input type=\"number\" min=\"0\" max=\"1\" size=\"3\" />";
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
},{"./AdderExploration":"AdderExploration.ts","./BinaryExploration":"BinaryExploration.ts","./ChoiceExploration":"ChoiceExploration.ts","./DividerExploration":"DividerExploration.ts","./FullAdderGates":"FullAdderGates.ts","./GateExploration":"GateExploration.ts","./HalfAdderCheat":"HalfAdderCheat.ts","./MultiplierExploration":"MultiplierExploration.ts"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56903" + '/');

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