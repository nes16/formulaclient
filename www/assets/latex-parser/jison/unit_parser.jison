/* Translates unit expression */

%lex
// States (by default there is also 'INITIAL'
%x ARRAY

// Some code that does stuff
%{
  applyFactor = function(type, arg) { 
  args = [];
  for(i=1;i<arguments.length;i++)
        args.push(arguments[i]);
  
  var resNode = yy.UnitNode(type, args);
  retrun resNode
  
 }; 
%}

%%

// Basic operators
// 10*-2
<INITIAL,ARRAY>("*")            { return 'TP'; } 
// J/C
<INITIAL,ARRAY>("/")            { return 'PER'; }
// J.S. 
<INITIAL,ARRAY>(".")            { return 'MUL'; }


// numbers
<INITIAL,ARRAY>(\-{0,1}[0-9]*\.{0,1}[0-9]+)   { return 'NUMBER'; }

// J , S
<INITIAL,ARRAY>([\'\"A-Za-z\[][a-zA-Z0-9\_\[\]]*)       { return 'VAR'; }



// Other stuff to ignore 
<INITIAL,ARRAY>("$")                   {  }
<INITIAL,ARRAY>(\s+)                   {  }
<INITIAL,ARRAY><<EOF>>                 { return 'EOF'; }

/lex

/* operator associations and precedence */
%left 'PER' 
%left 'MUL' 
%left 'TP'
%left 'NUMBER' 'VAR'


%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e

    : e TP e           {$$ = applyFactor(yy.UnitNode.prototype.doPow,$1,$3);}
    | e PER e          {$$ = applyFactor(yy.UnitNode.prototype.doPer,$1,$3);}
    | PER e            {$$ = applyFactor(yy.UnitNode.prototype.doPer,"1",$2);}
    | e MUL e          {$$ = applyFactor(yy.UnitNode.prototype.doMul,$1,$3);}

    // Basics
    | NUMBER            {$$ = applyFactor(yy.UnitNode.prototype.doNumber,  yytext);}
    | VAR               {$$ = applyFactor(yy.UnitNode.prototype.doVar,  yytext);}
    | CVAR              {$$ = applyFactor(yy.UnitNode.prototype.doCVar,  yytext);}
    ;
    
    
    
    
    