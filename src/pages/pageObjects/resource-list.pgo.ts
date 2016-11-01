import { ElementFinder } from 'protractor';
import { ExpectedConditions } from 'protractor';


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

  segment(name){
    return element(by.css(`ion-segment-button[value="${name}"]`))
  }
  
  setList(num){
    this.menu.click();
    //browser.driver.sleep(3000);
    element(by.css(`ion-menu ion-list button.item:nth-child(${num})`)).click();
  }

  addResource(type, obj){
    if(type == 'properties'){
      this.getInput('name',0).sendKeys(obj.p.name);
      this.getInput('name',1).sendKeys(obj.u.name);
      this.getInput('description').sendKeys(obj.u.description);
      this.getInput('symbol').sendKeys(obj.u.symbol)
      let but = this.getSubmitButton();
      browser.wait(ExpectedConditions.elementToBeClickable(but), 5000);
      but.click();
    }
  }

  getListCount(type){
    var list = element.all(by.css(`ion-list fl-${type}`));
    return list.count();
  }

  getListItem(num){

  }

  EditListItem(name){

  }

  deleteListItem(name){

  }

  getInput(name, index=null){
    if (index) 
      return element.all(by.css(`input[formcontrolname="${name}"]`)).get(index);
    else
      return element(by.css(`input[formcontrolname="${name}"]`));
  }

  getSubmitButton(){
    return element(by.css('button[name="submit"]'))
  }

  getTitle():any{
    return element(by.css("ion-page.resource-list-page ion-title div.toolbar-title"))
  }
}