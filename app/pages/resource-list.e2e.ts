import { ElementFinder } from 'protractor';
import { ResourceListPO } from './pageObjects/resource-list.pgo'

describe('List - basic functions'+browser.params.user.login, function() {

  var page = new ResourceListPO();

  beforeAll(function() {
      browser.get('');
  });

  beforeEach(function() {
      browser.driver.sleep(10);
  });

  it('Page should have proper title'+browser.params.user.login, function() {
    page.setList(1);
    expect(page.getTitle().getText()).toEqual('Properties');
  });

  it('Property add'+browser.params.user.login, function(){
    if(browser.params.user.login == 'user2'){
      console.log('User 2 sleeping for 20 second')
      browser.driver.sleep(20000);  
    }
  	var EC = protractor.ExpectedConditions;
  	page.addButton.click();
  	page.getInput("description").sendKeys("Property1");
  	let but = page.getSubmitButton();
  	browser.wait(EC.elementToBeClickable(but), 5000);
  	but.click();
    browser.sleep(3000);
    expect(page.getTitle().getText()).toEqual('Properties');

  });

  it('List should have one property'+browser.params.user.login, function() {
    browser.driver.sleep(3000)
    var list = element.all(by.css('ion-list fl-property'));
    expect(list.count()).toBe(1);
  });

  it('refresh should have one item'+browser.params.user.login, function(){
    browser.refresh();
    browser.driver.sleep(4000)
    var list = element.all(by.css('ion-list fl-property'));
    expect(list.count()).toBe(1);
  })

});
