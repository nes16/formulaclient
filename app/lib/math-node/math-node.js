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
    
    MathNode.prototype.ops = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        arctan: Math.atan,
        arccos: Math.acos,
        arcsin: Math.asin,
        sinh: Math.sinh,
        cosh: Math.cosh,
        tanh: Math.tanh,
        cot: MathNode.prototype.cot,
        sec: MathNode.prototype.sec,
        css: MathNode.prototype.css,
        arccot: MathNode.prototype.arccot,
        arcsec: MathNode.prototype.arcsec,
        arccsc: MathNode.prototype.arccsc,
        coth: MathNode.prototype.coth,
        sech: MathNode.prototype.sech,
        csch: MathNode.prototype.csch,
    }

    MathNode.prototype.csc = function (val) {
        return 1 / Math.sin(val);
    };
    MathNode.prototype.sec = function () {
        return 1 / Math.cos(val);
    };
    MathNode.prototype.cot = function (val) {
        return  1 / Math.tan(val);
    };
    
    MathNode.prototype.arccsc = function (val) {
        return  Math.asin(1 / val);
    };
    MathNode.prototype.arcsec = function (val) {
        return  Math.acos(1 / val);
    };
    MathNode.prototype.arccot = function (val) {
        return  Math.atan(1 / val);
    };
    
    MathNode.prototype.docsch = function (val) {
        return  1 / Math.sinh(val);
    };
    MathNode.prototype.dosech = function (val) {
        return  1 / Math.cosh(val);
    };
    MathNode.prototype.docoth = function (val) {
        return  1 / Math.tanh(val);
    };

    MathNode.prototype.prepare2Arg = function () {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
    };

    MathNode.prototype.prepare3Arg = function () {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
        this.args[2].type.call(this.args[2]);
    };

    MathNode.prototype.prepare1Arg = function () {
        this.args[0].type.call(this.args[0]);
    };

    MathNode.prototype.prepareOpArg = function () {
        this.args[1].type.call(this.args[1]);
    };

    MathNode.prototype.preparePowOpArg = function(){
        this.args[1].type.call(this.args[1]);
        this.args[2].type.call(this.args[2]);
    }

    MathNode.prototype.method = function (p1) {
        console.log('Using object var - ' + this.args);
    };
    MathNode.prototype.doAdd = function () {
        this.prepare2Arg();
        console.log("Add - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val + this.args[1].val;
    };
    MathNode.prototype.doSub = function () {
        this.prepare2Arg();
        console.log("Sub - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val - this.args[1].val;
    };
    MathNode.prototype.doMul = function () {
        this.prepare2Arg();
        console.log("Mul - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val * this.args[1].val;
    };
    MathNode.prototype.doDiv = function () {
        this.prepare2Arg();
        console.log("Div - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val / this.args[1].val;
    };
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
        this.val = Math.log(this.args[0].val);
    };
    ;
    MathNode.prototype.doLog10 = function () {
        this.prepare1Arg();
        console.log("Log10 - " + this.args[0].val);
        this.val = Math.log10(this.args[0].val);
    };
    ;
    MathNode.prototype.doLogBase = function () {
        this.prepare2Arg();
        console.log("Logbase - " + this.args[0].val + ',' + this.args[1].val);
        this.val = Math.log(this.args[1].val) / Math.ln(this.args[0].val);
    };
    ;
    MathNode.prototype.doParen = function () {
        this.prepare1Arg();
        console.log("Paran - " + this.args[0].val);
        this.val = this.args[0].val;
    };
    
    
    MathNode.prototype.doAssign = function () {
        this.prepare2Arg();
        console.log("Assign - " + this.args[0].val + ',' + this.args[1].val);
        this.val = this.args[0].val = this.args[1].val;
    };
    MathNode.prototype.doNumber = function () {
        this.val = parseFloat(this.args[0]);
        console.log("Number - " + this.val);
    };
    
    MathNode.prototype.doVar = function () {
        return 1;
    };

    MathNode.prototype.doPowOp = function(){
        this.preparePowOpArg();
        console.log("Op - " + this.args[0] +", power - " + this.args[1].val + ", param - " + this.args[2].val);
        this.val = Math.pow(MathNode.ops[this.args[0]](this.args[2].val), this.args[1].val);
    }
    
    MathNode.prototype.doOp = function(){
        this.prepareOpArg();
        console.log("Op - " + this.args[0] +", param - " + this.args[1].val);
        this.val = MathNode.ops[this.args[0]](this.args[1].val);
    }

    MathNode.prototype.doPowLn = function(){
        this.prepare2Arg();
        console.log("Ln - power - " + this.args[0].val+", param - " + this.args[1].val);
        this.val = Math.pow(Math.log(this.args[1].val), this.args[0].val);
    }
    MathNode.prototype.doPowLog10 = function(){
        this.prepare2Arg();
        console.log("Log10 - power - " + this.args[0].val+", param - " + this.args[1].val);
        this.val = Math.pow(Math.log10(this.args[1].val), this.args[0].val);
    }
    MathNode.prototype.doPowLogBase = function(){
        this.prepare3Arg();
        console.log("Logbase - base - " + this.args[0].val+ ",power - " + this.args[1].val+", param - " + this.args[2].val);
        this.val = Math.pow(Math.log(this.args[2].val) / Math.ln(this.args[0].val), this.args[1].val);
    }

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
