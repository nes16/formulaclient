/* Translates latex equations to javascript */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY

// Some code that does stuff
%{
  addNode = function(type, arg) { 
  args = [];
  for(i=1;i<arguments.length;i++)
        args.push(arguments[i]);
  
  return new yy.MathNode(type, args);
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
<INITIAL,ARRAY>((\\log)(\space|\:|\ )*_([0-9]))  { yytext = this.matches[4]; return 'LOGBASE1'; }
<INITIAL,ARRAY>("\\log_")              {  return 'LOGBASE'; }
<INITIAL,ARRAY>("\\log")               { return 'LOG10'; }

// Trig functions 
<INITIAL,ARRAY>("\\sinh")               { return 'SINH'; }
<INITIAL,ARRAY>("\\cosh")               { return 'COSH'; }
<INITIAL,ARRAY>("\\tanh")               { return 'TANH'; }
<INITIAL,ARRAY>("\\csch")               { return 'CSCH'; }
<INITIAL,ARRAY>("\\sech")               { return 'SECH'; }
<INITIAL,ARRAY>("\\coth")               { return 'COTH'; }
<INITIAL,ARRAY>("\\sin")               { return 'SIN'; }
<INITIAL,ARRAY>("\\cos")               { return 'COS'; }
<INITIAL,ARRAY>("\\tan")               { return 'TAN'; }
<INITIAL,ARRAY>("\\csc")               { return 'CSC'; }
<INITIAL,ARRAY>("\\sec")               { return 'SEC'; }
<INITIAL,ARRAY>("\\cot")               { return 'COT'; }
<INITIAL,ARRAY>("\\arcsin")            { return 'ARCSIN'; }
<INITIAL,ARRAY>("\\arccos")               { return 'ARCCOS'; }
<INITIAL,ARRAY>("\\arctan")               { return 'ARCTAN'; }
<INITIAL,ARRAY>("\\arccsc")               { return 'ARCCSC'; }
<INITIAL,ARRAY>("\\arcsec")               { return 'ARCSEC'; }
<INITIAL,ARRAY>("\\arccot")               { return 'ARCCOT'; }

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
<INITIAL,ARRAY>(([a-zA-Z][a-zA-Z0-9]*)(_[a-zA-Z0-9]|_\{[a-zA-Z0-9]{2,}\})?)       { return 'VAR'; }
<INITIAL,ARRAY>("\\alpha")          {return 'VAR'; }
<INITIAL,ARRAY>("\\beta")           {return 'VAR'; }
<INITIAL,ARRAY>("\\delta")          {return 'VAR'; }
<INITIAL,ARRAY>("\\epsilon")        {return 'VAR'; }
<INITIAL,ARRAY>("\\varepsilon")     {return 'VAR'; }
<INITIAL,ARRAY>("\\eta")            {return 'VAR'; }
<INITIAL,ARRAY>("\\gamma")          {return 'VAR'; }
<INITIAL,ARRAY>("\\iota")           {return 'VAR'; }
<INITIAL,ARRAY>("\\kappa")          {return 'VAR'; }
<INITIAL,ARRAY>("\\lambda")         {return 'VAR'; }
<INITIAL,ARRAY>("\\mu")             {return 'VAR'; }
<INITIAL,ARRAY>("\\nu")             {return 'VAR'; }
<INITIAL,ARRAY>("\\omega")          {return 'VAR'; }
<INITIAL,ARRAY>("\\phi")            {return 'VAR'; }
<INITIAL,ARRAY>("\\varphi")         {return 'VAR'; }
<INITIAL,ARRAY>("\\pi")             {return 'VAR'; }
<INITIAL,ARRAY>("\\psi")            {return 'VAR'; }
<INITIAL,ARRAY>("\\rho")            {return 'VAR'; }
<INITIAL,ARRAY>("\\sigma")          {return 'VAR'; }
<INITIAL,ARRAY>("\\tau")            {return 'VAR'; }
<INITIAL,ARRAY>("\\theta")          {return 'VAR'; }
<INITIAL,ARRAY>("\\upsilon")        {return 'VAR'; }
<INITIAL,ARRAY>("\\xi")             {return 'VAR'; }
<INITIAL,ARRAY>("\\zeta")           {return 'VAR'; }
<INITIAL,ARRAY>("\\Delta")          {return 'VAR'; }
<INITIAL,ARRAY>("\\Gamma")          {return 'VAR'; }
<INITIAL,ARRAY>("\\Lambda")         {return 'VAR'; }
<INITIAL,ARRAY>("\\Omega")          {return 'VAR'; }
<INITIAL,ARRAY>("\\Phi")            {return 'VAR'; }
<INITIAL,ARRAY>("\\Pi")             {return 'VAR'; }
<INITIAL,ARRAY>("\\Psi")            {return 'VAR'; }
<INITIAL,ARRAY>("\\Sigma")          {return 'VAR'; }
<INITIAL,ARRAY>("\\Theta")          {return 'VAR'; }
<INITIAL,ARRAY>("\\Upsilon")        {return 'VAR'; }
<INITIAL,ARRAY>("\\Xi")             {return 'VAR'; }
<INITIAL,ARRAY>("\\aleph")          {return 'VAR'; }

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
%right SIN COS TAN CSC SEC COT ARCSIN ARCCOS ARCTAN ARCCSC ARCSEC ARCCOT SINH COSH TANH CSCH SECH COTH LN LOG10 LOGBASE1 LOGBASE

%left EQUALTO
%left IGNORE NUMBER


%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e
    : e ADD e           {$$ = addNode(yy.MathNode.prototype.doAdd,$1,$3);}
    | e SUB e           {$$ = addNode(yy.MathNode.prototype.doSub,$1,$3);}
    | e MUL e           {$$ = addNode(yy.MathNode.prototype.doMul,$1,$3);}
    | FRAC e e          {$$ = addNode(yy.MathNode.prototype.doDiv,$2,$3);}

    | SQRT e            {$$ = addNode(yy.MathNode.prototype.doSqrt,$2);}
    | SQRT e e          {$$ = addNode(yy.MathNode.prototype.doNthRoot,$2, $3);}
    | e POW e           {$$ = addNode(yy.MathNode.prototype.doPow,$1,$3);}
    | SUB e %prec UMINUS  {$$ = -$2;}
    | LN e              {$$ = addNode(yy.MathNode.prototype.doLn,$2);}
    | LOG10 e           {$$ = addNode(yy.MathNode.prototype.doLog10,$2);}
    | LOGBASE1 e       {$$ = addNode(yy.MathNode.prototype.doLogBase,$1,$2);}
    | LOGBASE e e       {$$ = addNode(yy.MathNode.prototype.doLogBase,$2,$3);}

    // Brackets
    | LPAREN  e RPAREN   {$$ = addNode(yy.MathNode.prototype.doParen,$2);}
    | LCURL  e RCURL     {$$ = addNode(yy.MathNode.prototype.doParen,$2);}
    | LSQ  e RSQ          {$$ = addNode(yy.MathNode.prototype.doParen,$2);}

    // Trig
    | SIN e              {$$ = addNode(yy.MathNode.prototype.doSin,$2);}
    | COS e              {$$ = addNode(yy.MathNode.prototype.doCos,$2);}
    | TAN e              {$$ = addNode(yy.MathNode.prototype.doTan,$2);}
    | CSC e              {$$ = addNode(yy.MathNode.prototype.doCsc,$2);}
    | SEC e              {$$ = addNode(yy.MathNode.prototype.doSec,$2);}
    | COT e              {$$ = addNode(yy.MathNode.prototype.doCot,$2);}
    | ARCSIN e              {$$ = addNode(yy.MathNode.prototype.doArcSin,$2);}
    | ARCCOS e              {$$ = addNode(yy.MathNode.prototype.doArcCos,$2);}
    | ARCTAN e              {$$ = addNode(yy.MathNode.prototype.doArcTan,$2);}
    | ARCCSC e              {$$ = addNode(yy.MathNode.prototype.doArcCsc,$2);}
    | ARCSEC e              {$$ = addNode(yy.MathNode.prototype.doArcSec,$2);}
    | ARCCOT e              {$$ = addNode(yy.MathNode.prototype.doArcCot,$2);}
    | SINH e              {$$ = addNode(yy.MathNode.prototype.doSinh,$2);}
    | COSH e              {$$ = addNode(yy.MathNode.prototype.doCosh,$2);}
    | TANH e              {$$ = addNode(yy.MathNode.prototype.doTanh,$2);}
    | CSCH e              {$$ = addNode(yy.MathNode.prototype.doCsch,$2);}
    | SECH e              {$$ = addNode(yy.MathNode.prototype.doSech,$2);}
    | COTH e              {$$ = addNode(yy.MathNode.prototype.doCoth,$2);}

    // Logic
    | e EQUAL e          {$$ = addNode(yy.MathNode.prototype.doAssign,$1,$3);}
    
    // Basics
    | NUMBER              {$$ = addNode(yy.MathNode.prototype.doNumber, yytext);}
    | VAR                 {$$ = addNode(yy.MathNode.prototype.doVar, yytext);}
    ;
    
    
    %%

    