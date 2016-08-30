export class  ResourceListPO{
  addButton:any;
  list:any;
  menuButton:any;
  menu:any;
  menuList:any;
  
  constructor(){
    this.addButton = element(by.css("button[ng-reflect-name*=add]"));
    this.menu = element(by.css('button[menu-toggle]'));
  }
  
  setList(num){
    this.menu.click();
    element(by.css(`ion-menu ion-list ion-item:nth-child(${num})`)).click();
  }

  addProperty(name){

  }

  getListCount(){

  }

  getListItem(num){

  }

  EditListItem(name){

  }

  deleteListItem(name){

  }

  getTitle():any{
    return element(by.className("toolbar-title"))
  }
};