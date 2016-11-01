import { ValueProvider } from './value'
export class MathNode {
    type: any;
    isMathNode: boolean;
    isLhs: boolean;
    token: string;
    args: any;
    val: any;
    vp:ValueProvider;
    constructor(type, args){
        this.type = type;
        this.args = args;
        this.isMathNode = true;
        this.isLhs = false;
        console.log('Arguments length - ' + args.length);
        if (this.isVar()) {
            this.token = args[0];
        }
        if (this.isAssign()){
            this.args[0].isLhs = true;
        }
    }

    static ops = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        arctan: Math.atan,
        arccos: Math.acos,
        arcsin: Math.asin,
        sinh: Math.sinh,
        cosh: Math.cosh,
        tanh: Math.tanh,
        cot: MathNode.cot,
        sec: MathNode.sec,
        css: MathNode.csc,
        arccot: MathNode.arccot,
        arcsec: MathNode.arcsec,
        arccsc: MathNode.arccsc,
        coth: MathNode.coth,
        sech: MathNode.sech,
        csch: MathNode.csch,
    }

    static csc = function (val) {
        return 1 / Math.sin(val);
    };
    static sec = function (val) {
        return 1 / Math.cos(val);
    };
    static cot = function (val) {
        return  1 / Math.tan(val);
    };
    
    static arccsc = function (val) {
        return  Math.asin(1 / val);
    };
    static arcsec = function (val) {
        return  Math.acos(1 / val);
    };
    static arccot = function (val) {
        return  Math.atan(1 / val);
    };
    
    static csch = function (val) {
        return  1 / Math.sinh(val);
    };
    static sech = function (val) {
        return  1 / Math.cosh(val);
    };
    static coth = function (val) {
        return  1 / Math.tanh(val);
    };


    prepare2Arg() {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
    };

    prepare3Arg() {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
        this.args[2].type.call(this.args[2]);
    };
    
    prepare1Arg() {
        this.args[0].type.call(this.args[0]);
    };

    prepareOpArg(){
        this.args[1].type.call(this.args[1]);
    };

    preparePowOpArg(){
        this.args[1].type.call(this.args[1]);
        this.args[2].type.call(this.args[2]);
    }

    method(p1) {
        console.log('Using object var - ' + this.args);
    };

    doAdd() {
        this.prepare2Arg();
        console.log("Add - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val + this.args[1].val;
    };

    doSub() {
        this.prepare2Arg();
        console.log("Sub - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val - this.args[1].val;
    };

    doMul() {
        this.prepare2Arg();
        console.log("Mul - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val * this.args[1].val;
    };

    doDiv() {

        this.prepare2Arg();
        console.log("Div - " + this.args[0].val + "-" + this.args[1].val);
        this.val = this.args[0].val / this.args[1].val;
    };


    doSqrt() {

        this.prepare1Arg();
        console.log("Sqrt - " + this.args[0].val);
        this.val = Math.sqrt(this.args[0].val);
    };

    doNthRoot() {
        this.prepare2Arg();
        console.log("nthRoot - " + this.args[0].val, + "-" + this.args[1].val);
        this.val = Math.pow(this.args[1].val, 1.0/this.args[0].val);
    };


    doPow() {
        this.prepare2Arg();
        console.log("Pow - " + this.args[0].val + "-" + this.args[1].val);
        this.val = Math.pow(this.args[0].val, this.args[1].val);
    };

    doLn() {
        this.prepare1Arg();
        console.log("Ln - " + this.args[0].val);
        this.val = Math.log(this.args[0].val);
    };

    doLog10() {
        this.prepare1Arg();
        console.log("Log10 - " + this.args[0].val);
        this.val = Math.log10(this.args[0].val);
    };

    doLogBase() {
        this.prepare2Arg();
        console.log("Logbase - " + this.args[0].val + ',' + this.args[1].val);
        this.val = Math.log(this.args[1].val)/(Math as any).ln(this.args[0].val);
    };

    doParen() {
        this.prepare1Arg();
        console.log("Paran - " + this.args[0].val);
        this.val = this.args[0].val;
    };

    doPowOp(){
        this.preparePowOpArg();
        console.log("Op - " + this.args[0] +", power - " + this.args[1].val + ", param - " + this.args[2].val);
        this.val = Math.pow(MathNode.ops[this.args[0].slice(1)](this.args[2].val), this.args[1].val);
    }
    
    doOp(){
        this.prepareOpArg();
        console.log("Op - " + this.args[0] +", param - " + this.args[1].val);
        this.val = MathNode.ops[this.args[0].slice(1)](this.args[1].val);
    }

    doPowLn(){
        this.prepare2Arg();
        console.log("Ln - power - " + this.args[0].val+", param - " + this.args[1].val);
        this.val = Math.pow(Math.log(this.args[1].val), this.args[0].val);
    }
    doPowLog10(){
        this.prepare2Arg();
        console.log("Log10 - power - " + this.args[0].val+", param - " + this.args[1].val);
        this.val = Math.pow(Math.log10(this.args[1].val), this.args[0].val);
    }
    doPowLogBase(){
        this.prepare3Arg();
        console.log("Logbase - base - " + this.args[0].val+ ",power - " + this.args[1].val+", param - " + this.args[2].val);
        this.val = Math.pow(Math.log(this.args[2].val) / Math.log(this.args[0].val), this.args[1].val);
    }

    doAssign() {
        this.prepare2Arg();
        console.log("Assign - " + this.args[0].val + ',' + this.args[1].val);
        this.val = this.args[0].val = this.args[1].val;
    }

    doNumber() {
        this.val = parseFloat(this.args[0]);
        console.log("Number - " + this.val);

    };

    doVar() {
        if(this.vp)
            this.val = this.vp.getValue(this.token);
    };

    isAssign(){
        return this.type === this.doAssign;
    }

    isVar() {
        //TODO:check the logic
        return this.type === this.doVar;
    }

    traverseNode(node, list){
      if (node.isVar()) {
        var token = node.token;
        if (list[token] != null) {
          list[token].nodes.push(node);

        }
        else {
          list[token]={nodes:[node]};
        }
      }
      else{
       for (var i = 0, len = node.args.length; i < len; i++) {
          if(node.args[i].isMathNode)
            this.traverseNode(node.args[i], list);
        }
      }
    };
}


