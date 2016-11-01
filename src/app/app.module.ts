import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { FormulaApp } from './app.component';


//Pages
import { CategoryPage } from '../pages/category/category'
import { DetailPage } from '../pages/detail/detail'
import { ModalsPage } from '../pages/modals/modals'
import { MoreOptionsPage } from '../pages/more-options/more-options'
import { TabsPage } from '../pages/tabs/tabs'
import { TutorialPage } from '../pages/tutorial/tutorial'
import { UserPage } from '../pages/user/user'
import { ResourceListPage } from '../pages/resource-list'

//components
import { FlNavBar } from '../components/fl-nav-bar/fl-nav-bar'
import { CategoryComponent } from '../components/category/category'
import { FormulaComponent } from '../components/formula/formula'
import { GlobalComponent } from '../components/global/global'
import { PropertyComponent } from '../components/property/property'
import { UnitComponent } from '../components/unit/unit'
import { MathKeypad } from '../components/keys/keypad'
import { UnitSelector } from '../components/selectors/unit'
import { UnitValueAccessor } from '../components/selectors/unit-accessor'
import { VarComponent } from '../components/variable/variable'
import { VarvalComponent } from '../components/varval/varval'
import { BaseResource } from '../components/base-resource'
import { MathQ } from '../components/mathquill'
import { MathQValueAccessor } from '../components/mathquill-accessor'
import { FBError } from '../components/fb-error'
//providers
import { MyTokenAuth } from '../providers/token-auth/auth-service'
import { JwtHttp } from '../providers/token-auth/jwtHttp'
import { DataService } from '../providers/data-service'
import { LatexParserService } from '../providers/latex-parser-service'
import { BaseService } from '../providers/base-service'
import { MQService } from '../providers/mq-service'
import { RemoteService } from '../providers/remote-service'
import { SqlService } from '../providers/sql-service'
import { SqlCacheService } from '../providers/sqlcache-service'
import { UIStateService } from '../providers/ui-state-service'
import { Sql } from '../providers/sql'

import { FavFilterPipe } from '../components/fav-filter';



@NgModule({
  declarations: [
    BaseResource,
    CategoryComponent,
    FormulaComponent,
    GlobalComponent,
    UnitComponent,
    PropertyComponent,
    MathKeypad,
    UnitSelector,
    UnitValueAccessor,
    VarComponent,
    VarvalComponent,
    FlNavBar,
    MathQ,
    MathQValueAccessor,
    FavFilterPipe,
    FBError,
    FormulaApp,
    CategoryPage,
    DetailPage,
    ModalsPage,
    MoreOptionsPage,
    TabsPage,
    TutorialPage,
    UserPage,
    ResourceListPage,
  ],
  imports: [
    HttpModule,
    FormsModule,
    IonicModule.forRoot(FormulaApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CategoryPage,
    DetailPage,
    ModalsPage,
    MoreOptionsPage,
    TabsPage,
    TutorialPage,
    UserPage,
    ResourceListPage,
    FormulaApp
  ],
  providers: [
    MyTokenAuth,
    JwtHttp,
    DataService,
    LatexParserService,
    BaseService,
    MQService,
    RemoteService,
    SqlService,
    SqlCacheService,
    UIStateService,
    Sql,
    {provide:'ApiEndpoint', useValue: 'http://formulalab.net/api/v1'},
  ]
})
export class AppModule {}
