/* Translates latex equations to javascript */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY

// Some code that does stuff
%{
  if(!yy.MathNode){
    yy.MathNode = (function () {
        function MathNode(type, arg) {
            console.log("Object created")
            this.type = type;
            for(i=0;i<arg.length;i++)
                if(arg[i].type)
                    arg[i].type();
        }
        MathNode.prototype.doAdd = function(){
            console.log("doAdd");
        }
        MathNode.prototype.doSub = function(){
            console.log("doSub");
        }
        MathNode.prototype.toString = function(){
            this.type();
        }
        MathNode.prototype.isSimulator = function(){
            return true;
        }
        MathNode.prototype.doMul = function(){
            console.log("doMul");
        }
        MathNode.prototype.doDiv = function(){
            console.log("doDiv");
        }
        MathNode.prototype.doSqrt = function(){
            console.log("doSqrt");
        }
        MathNode.prototype.doNthRoot = function(){
            console.log("doNthRoot");
        }
        MathNode.prototype.doPow = function(){
            console.log("doPow");
        }
        MathNode.prototype.doLn = function(){
            console.log("doLn");
        }
        MathNode.prototype.doLog10 = function(){
            console.log("doLog10");
        }
        MathNode.prototype.doLogBase = function(){
            console.log("doLogBase");
        }
        MathNode.prototype.doLogBase = function(){
            console.log("doLogBase");
        }
        MathNode.prototype.doParen = function(){
            console.log("doParen");
        }
       
        
        MathNode.prototype.doAssign = function(){
            console.log("doAssign");
        }
        MathNode.prototype.doNumber = function(){
            console.log("doNumber");
        }
        MathNode.prototype.doVar = function(){
            console.log("doVar");
        }

        MathNode.prototype.doPowOp = function(){
            console.log("doPowOp");
        }
        
        MathNode.prototype.doOp = function(){
            console.log("doOp");
        }

        MathNode.prototype.doPowLn = function(){
            console.log("doPowLn");
        }
        MathNode.prototype.doPowLog10 = function(){
            console.log("doPowLog10");
        }
        MathNode.prototype.doPowLogBase = function(){
            console.log("doPowLogBase");
        }
        return MathNode;
    }());
  }
  yy.addNode = function(type, arg) { 
  var args = [];
  for(var i=1;i<arguments.length;i++)
        args.push(arguments[i]);
  
        var n = new yy.MathNode(type, args);
        if(n.isSimulator)
            type();
        return n;
  }; 

%}

%%


// Basic operators
<INITIAL,ARRAY>("+")                   { return 'ADD'; }
<INITIAL,ARRAY>("-")                   { return 'SUB'; }
<INITIAL,ARRAY>("\\cdot")              { return 'MUL'; }
<INITIAL,ARRAY>("\\frac")              { return 'FRAC'; }
// Exponential stuff
<INITIAL,ARRAY>("\\sqrt")              { return 'SQRT'; }
<INITIAL,ARRAY>("^")                   { return 'POW'; }
<INITIAL,ARRAY>("\\ln")                { return 'LN'; }
<INITIAL,ARRAY>("\\log_")              {  return 'LOGBASE'; }
<INITIAL,ARRAY>("\\log")               { return 'LOG10'; }

// Brackets 
<INITIAL,ARRAY>("\\left(")             { return 'LPAREN'; }
<INITIAL,ARRAY>("\\right)")            { return 'RPAREN'; }
<INITIAL,ARRAY>("{")                   { return 'LCURL'; }
<INITIAL,ARRAY>("}")                   { return 'RCURL'; }
<INITIAL,ARRAY>("[")                   { return 'LSQ'; }
<INITIAL,ARRAY>("]")                   { return 'RSQ'; }

// Logic stuff
<INITIAL,ARRAY>("=")                   {return 'EQUAL';}

// Varibles numbers and constants
<INITIAL,ARRAY>([0-9]+(\.[0-9]+)?\b)   { return 'NUMBER'; }
<INITIAL,ARRAY>(\\(arc)?(sin|cos|tan|cot|sec|csc)h?)                            {return 'OPERATOR';}
<INITIAL,ARRAY>("\\pi")                      {return 'VAR'; }
<INITIAL,ARRAY>(([a-zA-Z][a-zA-Z0-9]*)(_[a-zA-Z0-9]|_\{[a-zA-Z0-9]{2,}\})?)       { return 'VAR'; }
<INITIAL,ARRAY>(\\theta(_[a-zA-Z0-9]|_\{[a-zA-Z0-9]{2,}\})?)          {return 'VAR'; }

// Other stuff to ignore 
<INITIAL,ARRAY>("$")                   {  }
<INITIAL,ARRAY>(\s+)                   {  }
<INITIAL,ARRAY><<EOF>>                 { return 'EOF'; }
<INITIAL,ARRAY>("\\ ")                 {  }


/lex

/* operator associations and precedence */

%left ADD SUB
%left MUL FRAC
%right POW SQRT SQRTBASE 
%left UMINUS
%right OPERATOR LN LOG10 LOGBASE

%left EQUALTO
%left IGNORE NUMBER


%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e
    : e ADD e           {$$ = yy.addNode(yy.MathNode.prototype.doAdd,$1,$3);}
    | e SUB e           {$$ = yy.addNode(yy.MathNode.prototype.doSub,$1,$3);}
    | e MUL e           {$$ = yy.addNode(yy.MathNode.prototype.doMul,$1,$3);}
    | FRAC e e          {$$ = yy.addNode(yy.MathNode.prototype.doDiv,$2,$3);}

    | SQRT e            {$$ = yy.addNode(yy.MathNode.prototype.doSqrt,$2);}
    | SQRT e e          {$$ = yy.addNode(yy.MathNode.prototype.doNthRoot,$2, $3);}
    | OPERATOR POW e e  {$$ = yy.addNode(yy.MathNode.prototype.doPowOp,  $1, $3, $4);}
    | LN POW e e              {$$ = yy.addNode(yy.MathNode.prototype.doPowLn,$3, $4);}
    | LOG10 POW e e           {$$ = yy.addNode(yy.MathNode.prototype.doPowLog10,$3, $4);}
    | LOGBASE e POW  e e      {$$ = yy.addNode(yy.MathNode.prototype.doPowLogBase,$2,$4, $5);}
    
    | e POW e           {$$ = yy.addNode(yy.MathNode.prototype.doPow,$1,$3);}
    | SUB e %prec UMINUS  {$$ = -$2;}
    | LN e              {$$ = yy.addNode(yy.MathNode.prototype.doLn,$2);}
    | LOG10 e           {$$ = yy.addNode(yy.MathNode.prototype.doLog10,$2);}
    | LOGBASE e e       {$$ = yy.addNode(yy.MathNode.prototype.doLogBase,$2,$3);}

    // Brackets
    | LPAREN  e RPAREN   {$$ = yy.addNode(yy.MathNode.prototype.doParen,$2);}
    | LCURL  e RCURL     {$$ = yy.addNode(yy.MathNode.prototype.doParen,$2);}
    | LSQ  e RSQ          {$$ = yy.addNode(yy.MathNode.prototype.doParen,$2);}

    // Trig
    | OPERATOR e              {$$ = yy.addNode(yy.MathNode.prototype.doOp, $1, $2);}
   
    // Logic
    | e EQUAL e          {$$ = yy.addNode(yy.MathNode.prototype.doAssign,$1,$3);}
    
    // Basics
    | NUMBER              {$$ = yy.addNode(yy.MathNode.prototype.doNumber, yytext);}
    | VAR                 {$$ = yy.addNode(yy.MathNode.prototype.doVar, yytext);}
    ;
    
    
    %%

    