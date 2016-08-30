import { ElementFinder } from 'protractor';

export class  ResourceListPO{
  addButton:ElementFinder;
  list:any;
  menuButton:any;
  menu:any;
  menuList:any;
  
  
  constructor(){
    this.addButton = element(by.css('button ion-icon[name="add"]')).element(by.xpath('ancestor::button'));
    this.menu = element(by.className("bar-button-menutoggle"));
  }
  
  setList(num){
    this.menu.click();
    //browser.driver.sleep(3000);
    element(by.css(`ion-menu ion-list button.item:nth-child(${num})`)).click();
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

  getInput(name){
    return element(by.css('input[formcontrolname="description"]'))
  }

  getSubmitButton(){
    return element(by.css('button[name="submit"]'))
  }

  getTitle():any{
    return element(by.css("ion-page.resource-list-page ion-title div.toolbar-title"))
  }
};