/* Translates latex equations to javascript */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY


%%


// Basic operators
<INITIAL,ARRAY>("+")                   { return 'ADD'; }
<INITIAL,ARRAY>("-")                   { return 'SUB'; }
<INITIAL,ARRAY>("\\frac")              { return 'FRAC'; }
// Exponential stuff
<INITIAL,ARRAY>("\\sqrt")              { return 'SQRT'; }
<INITIAL,ARRAY>((\\log)(\space|\:|\ )*_([0-9]))  { yytext = this.matches[4]; return 'LOGBASE1'; }
<INITIAL,ARRAY>("\\log_")  {  return 'LOGBASE'; }
<INITIAL,ARRAY>("\\log")               { return 'LOG10'; }


// Trig functions 

// Brackets 
<INITIAL,ARRAY>("\\left(")                   { return 'LPAREN'; }
<INITIAL,ARRAY>("\\right)")                   { return 'RPAREN'; }
<INITIAL,ARRAY>("{")                   { return 'LCURL'; }
<INITIAL,ARRAY>("}")                   { return 'RCURL'; }
<INITIAL,ARRAY>("[")                   { return 'LSQ'; }
<INITIAL,ARRAY>("]")                   { return 'RSQ'; }
// Logic stuff
<INITIAL,ARRAY>("=")                   {return 'EQUAL';}

//Summation and product


// Varibles numbers and constants
<INITIAL,ARRAY>([0-9]+(\.[0-9]+)?\b)   { return 'NUMBER'; }
<INITIAL,ARRAY>(([a-zA-Z][a-zA-Z0-9]*)(_[a-zA-Z0-9]|_\{[a-zA-Z0-9]{2,}\})?)       { return 'VAR'; }

// Other stuff to ignore 
<INITIAL,ARRAY>("$")                   {  }
<INITIAL,ARRAY>(\s+)                   {  }
<INITIAL,ARRAY><<EOF>>                 { return 'EOF'; }


/lex

/* operator associations and precedence */

%left ADD SUB
%left UMINUS
%left MUL FRAC
%right SQRT SQRTBASE 
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
    : e ADD e           {$$ = 'doAdd(' + $1 + ',' + $3 + ')';}
    | e SUB e           {$$ = 'doSub(' + $1 + ',' + $3 + ')';}
    | FRAC e e          {$$ = 'doDiv(' + $2 + ',' + $3 + ')';}
    | SUB e %prec UMINUS  {$$ = 'doNeg(' + $2 + ')';}
    | SQRT e            {$$ = 'doSqrt(' + $2 + ')';}
    | SQRT e e      {$$ = 'dontRoot(' + $2 + ',' + $3 + ')';}
    | LOG10 e           {$$ = 'doLog10('  + $2 + ')'; }
    | LOGBASE1 e        {$$ = 'doLogBase(' + $1 + ',' + $2 + ')';}
    | LOGBASE e e       {$$ = 'doLogBase(' + $2 + ',' + $3 + ')';}

    // Brackets
    | LPAREN  e RPAREN   {$$ = 'doParen(' +  $2 + ')';}
    | LCURL  e RCURL   {$$ = 'doCurl(' +  $2 + ')';}
    | LSQ  e RSQ   {$$ = 'doSqBracket(' +  $2 + ')';}

    
    
    // Logic
    | e EQUAL e          {$$ = 'doAssign(' + $1 + ',' + $3 + ')';}
    
    // Basics
    | NUMBER              {$$ = 'doNumber(' +   yytext + ')';}
    | VAR                 {$$ = 'doVar(' +  yytext + ')';}
    ;
    
    
    %%
 
    