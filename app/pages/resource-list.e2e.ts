import { ElementFinder } from 'protractor';
import { ResourceListPO } from './pageObjects/resource-list.pgo'

describe('angularjs homepage', function() {

  var page = new ResourceListPO();

  beforeEach(function() {
      browser.get('');
      browser.driver.sleep(10);
  });

  it('Page should have proper title', function() {
    page.setList(1);
    expect(page.getTitle().getText()).toEqual('Properties');
  });

  it('Property add', function(){
  	var EC = protractor.ExpectedConditions;
  	page.addButton.click();
  	page.getInput("description").sendKeys("Property1");
  	let but = page.getSubmitButton();
  	browser.wait(EC.elementToBeClickable(but), 1000);
  	but.click();
    expect(page.getTitle().getText()).toEqual('Properties');
  });

  it('List should have one property', function() {
    var list = element.all(by.css('ion-list fl-property'));
    expect(list.count()).toBe(1);
  });

  it('refresh should have one item', function(){
    browser.refresh();
    browser.debugger();
    var list = element.all(by.css('ion-list fl-property'));
    expect(list.count()).toBe(1);
  })

});

