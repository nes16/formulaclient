"use strict";
var MathNode = (function () {
    function MathNode(type, args) {
        this.type = type;
        this.args = args;
        this.isMathNode = true;
        this.isLhs = false;
        console.log('Arguments length - ' + args.length);
        if (this.isVar()) {
            this.token = args[0];
        }
        if (this.isAssign()) {
            this.args[0].isLhs = true;
        }
    }
    MathNode.prototype.prepare2Arg = function () {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
    };
    ;
    MathNode.prototype.prepare1Arg = function () {
        this.args[0].type.call(this.args[0]);
    };
    ;
    MathNode.prototype.method = function (p1) {
        console.log('Using object var - ' + this.args);
    };
    ;
    MathNode.prototype.doAdd = function () {
        this.prepare2Arg();
        console.log("Add - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val + this.args[1].val;
    };
    ;
    MathNode.prototype.doSub = function () {
        this.prepare2Arg();
        console.log("Sub - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val - this.args[1].val;
    };
    ;
    MathNode.prototype.doMul = function () {
        this.prepare2Arg();
        console.log("Mul - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val * this.args[1].val;
    };
    ;
    MathNode.prototype.doDiv = function () {
        this.prepare2Arg();
        console.log("Div - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val / this.args[1].val;
    };
    ;
    MathNode.prototype.doSqrt = function () {
        this.prepare1Arg();
        console.log("Sqrt - " + this.args[0].val);
        this.val = Math.sqrt(this.args[0].val);
    };
    ;
    MathNode.prototype.doNthRoot = function () {
        this.prepare2Arg();
        console.log("nthRoot - " + this.args[0].val, +"-" + this.args[1].val);
        this.val = Math.pow(this.args[1].val, 1.0 / this.args[0].val);
    };
    ;
    MathNode.prototype.doPow = function () {
        this.prepare2Arg();
        console.log("Pow - " + this.args[0].val + "-" + this.args[1].val);
        this.val = Math.pow(this.args[0].val, this.args[1].val);
    };
    ;
    MathNode.prototype.doLn = function () {
        this.prepare1Arg();
        console.log("Ln - " + this.args[0].val);
        this.val = Math.log(this.args[0]);
    };
    ;
    MathNode.prototype.doLog10 = function () {
        this.prepare1Arg();
        console.log("Log10 - " + this.args[0].val);
        this.val = Math.log10(this.args[0]);
    };
    ;
    MathNode.prototype.doLogBase = function () {
        this.prepare2Arg();
        console.log("Logbase - " + this.args[0].val + ',' + this.args[1].val);
        this.val = Math.log(this.args[1]) / Math.ln(this.args[0]);
    };
    ;
    MathNode.prototype.doParen = function () {
        this.prepare1Arg();
        console.log("Paran - " + this.args[0].val);
        this.val = this.args[0].val;
    };
    ;
    MathNode.prototype.doSin = function () {
        this.prepare1Arg();
        console.log("Sin - " + this.args[0].val);
        this.val = Math.sin(this.args[0]);
    };
    ;
    MathNode.prototype.doCos = function () {
        this.prepare1Arg();
        console.log("Cos - " + this.args[0].val);
        this.val = Math.cos(this.args[0]);
    };
    ;
    MathNode.prototype.doTan = function () {
        this.prepare1Arg();
        console.log("Tan - " + this.args[0].val);
        this.val = Math.tan(this.args[0]);
    };
    ;
    MathNode.prototype.doCsc = function () {
        this.prepare1Arg();
        console.log("Csc - " + this.args[0].val);
        this.val = 1 / Math.sin(this.args[0]);
    };
    ;
    MathNode.prototype.doSec = function () {
        this.prepare1Arg();
        console.log("Sec - " + this.args[0].val);
        this.val = 1 / Math.cos(this.args[0]);
    };
    ;
    MathNode.prototype.doCot = function () {
        this.prepare1Arg();
        console.log("Cot - " + this.args[0].val);
        this.val = 1 / Math.tan(this.args[0]);
    };
    ;
    MathNode.prototype.doArcSin = function () {
        this.prepare1Arg();
        console.log("ArcSin - " + this.args[0].val);
        this.val = Math.asin(this.args[0]);
    };
    MathNode.prototype.doArcCos = function () {
        this.prepare1Arg();
        console.log("ArcCos - " + this.args[0].val);
        this.val = Math.acos(this.args[0]);
    };
    MathNode.prototype.doArcTan = function () {
        this.prepare1Arg();
        console.log("ArcTan - " + this.args[0].val);
        this.val = Math.atan(this.args[0]);
    };
    MathNode.prototype.doArcCsc = function () {
        this.prepare1Arg();
        console.log("ArcCsc - " + this.args[0].val);
        this.val = Math.asin(1 / this.args[0]);
    };
    MathNode.prototype.doArcSec = function () {
        this.prepare1Arg();
        console.log("ArcSec - " + this.args[0].val);
        this.val = Math.acos(1 / this.args[0]);
    };
    MathNode.prototype.doArcCot = function () {
        this.prepare1Arg();
        console.log("ArcCot - " + this.args[0].val);
        this.val = Math.atan(1 / this.args[0]);
    };
    MathNode.prototype.doSinh = function () {
        this.prepare1Arg();
        console.log("Sinh - " + this.args[0].val);
        this.val = Math.sinh(this.args[0]);
    };
    MathNode.prototype.doCosh = function () {
        this.prepare1Arg();
        console.log("Cosh - " + this.args[0].val);
        this.val = Math.cosh(this.args[0]);
    };
    MathNode.prototype.doTanh = function () {
        this.prepare1Arg();
        console.log("Tanh - " + this.args[0].val);
        this.val = Math.tanh(this.args[0]);
    };
    MathNode.prototype.doCsch = function () {
        this.prepare1Arg();
        console.log("Csch - " + this.args[0].val);
        this.val = 1 / Math.sinh(this.args[0]);
    };
    MathNode.prototype.doSech = function () {
        this.prepare1Arg();
        console.log("Sech - " + this.args[0].val);
        this.val = 1 / Math.cosh(this.args[0]);
    };
    MathNode.prototype.doCoth = function () {
        this.prepare1Arg();
        console.log("Coth - " + this.args[0].val);
        this.val = 1 / Math.tanh(this.args[0]);
    };
    MathNode.prototype.doAssign = function () {
        this.prepare2Arg();
        console.log("Assign - " + this.args[0].val + ',' + this.args[1].val);
        this.val = this.args[0] = this.args[1];
    };
    MathNode.prototype.doNumber = function () {
        this.val = parseFloat(this.args[0]);
        console.log("Number - " + this.val);
    };
    ;
    MathNode.prototype.doVar = function () {
        return 1;
    };
    ;
    MathNode.prototype.isAssign = function () {
        return this.type === this.doAssign;
    };
    MathNode.prototype.isVar = function () {
        //TODO:check the logic
        return this.type === this.doVar;
    };
    MathNode.prototype.traverseNode = function (node, list) {
        if (node.isVar()) {
            var token = node.token;
            if (list[token] != null) {
                list[token].nodes.push(node);
            }
            else {
                list[token] = { nodes: [node] };
            }
        }
        else {
            for (var i = 0, len = node.args.length; i < len; i++) {
                if (node.args[i].isMathNode)
                    this.traverseNode(node.args[i], list);
            }
        }
    };
    ;
    return MathNode;
}());
exports.MathNode = MathNode;
