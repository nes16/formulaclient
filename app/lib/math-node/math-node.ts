export class MathNode {
    type: any;
    isMathNode: boolean;
    isLhs: boolean;
    token: string;
    args: any;
    val: any;
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



    prepare2Arg() {
        this.args[0].type.call(this.args[0]);
        this.args[1].type.call(this.args[1]);
    };

    prepare1Arg() {
        this.args[0].type.call(this.args[0]);
    };

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
        this.val = Math.log(this.args[0]);
    };

    doLog10() {
        this.prepare1Arg();
        console.log("Log10 - " + this.args[0].val);
        this.val = Math.log10(this.args[0]);
    };

    doLogBase() {
        this.prepare2Arg();
        console.log("Logbase - " + this.args[0].val + ',' + this.args[1].val);
        this.val = Math.log(this.args[1])/(Math as any).ln(this.args[0]);
    };

    doParen() {
        this.prepare1Arg();
        console.log("Paran - " + this.args[0].val);
        this.val = this.args[0].val;
    };

    
    
    doSin() {
        this.prepare1Arg();
        console.log("Sin - " + this.args[0].val);
        this.val = Math.sin(this.args[0]);       
    };

    doCos() {
        this.prepare1Arg();
        console.log("Cos - " + this.args[0].val);
        this.val = Math.cos(this.args[0]);
    };

    doTan() {
        this.prepare1Arg();
        console.log("Tan - " + this.args[0].val);
        this.val = Math.tan(this.args[0]);
    };

    doCsc() {
        this.prepare1Arg();
        console.log("Csc - " + this.args[0].val);
        this.val = 1/Math.sin(this.args[0]);
    };

    doSec() {
        this.prepare1Arg();
        console.log("Sec - " + this.args[0].val);
        this.val = 1/Math.cos(this.args[0]);
    };

    doCot() {
        this.prepare1Arg();
        console.log("Cot - " + this.args[0].val);
        this.val = 1/Math.tan(this.args[0]);
    };

    doArcSin(){
        this.prepare1Arg();
        console.log("ArcSin - " + this.args[0].val);
        this.val = Math.asin(this.args[0]);
    }
    doArcCos(){
        this.prepare1Arg();
        console.log("ArcCos - " + this.args[0].val);
        this.val = Math.acos(this.args[0]);
    }
    doArcTan(){
        this.prepare1Arg();
        console.log("ArcTan - " + this.args[0].val);
        this.val = Math.atan(this.args[0]);
    }
    doArcCsc(){
        this.prepare1Arg();
        console.log("ArcCsc - " + this.args[0].val);
        this.val = Math.asin(1/this.args[0]);
    }
    doArcSec(){
        this.prepare1Arg();
        console.log("ArcSec - " + this.args[0].val);
        this.val = Math.acos(1/this.args[0]);
    }
    doArcCot(){
        this.prepare1Arg();
        console.log("ArcCot - " + this.args[0].val);
        this.val = Math.atan(1/this.args[0]);
    }

    doSinh(){
        this.prepare1Arg();
        console.log("Sinh - " + this.args[0].val);
        this.val = Math.sinh(this.args[0]);
    }
    doCosh(){
        this.prepare1Arg();
        console.log("Cosh - " + this.args[0].val);
        this.val = Math.cosh(this.args[0]);
    }
    doTanh(){
        this.prepare1Arg();
        console.log("Tanh - " + this.args[0].val);
        this.val = Math.tanh(this.args[0]);
    }
    doCsch(){
        this.prepare1Arg();
        console.log("Csch - " + this.args[0].val);
        this.val = 1/Math.sinh(this.args[0]);
    }
    doSech(){
        this.prepare1Arg();
        console.log("Sech - " + this.args[0].val);
        this.val = 1/Math.cosh(this.args[0]);
    }
    doCoth(){
        this.prepare1Arg();
        console.log("Coth - " + this.args[0].val);
        this.val = 1/Math.tanh(this.args[0]);
    }
    


    doAssign() {
        this.prepare2Arg();
        console.log("Assign - " + this.args[0].val + ',' + this.args[1].val);
        this.val = this.args[0] = this.args[1];
    }

    doNumber() {
        this.val = parseFloat(this.args[0]);
        console.log("Number - " + this.val);

    };

    doVar() {
        return 1;
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


