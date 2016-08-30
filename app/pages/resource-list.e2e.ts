import { ElementFinder } from 'protractor';
import { ResourceListPO } from './pageObjects/resource-list.pgo'

describe('angularjs homepage', function() {

  var page = new ResourceListPO();

  beforeEach(function() {
  		browser.driver.sleep(10);
        browser.get('');
  });

  it('Page should have proper title', function() {
    page.setList(1);
    expect(page.getTitle().getText()).toEqual('Properties');
  });

  it('Property add', function(){
  	page.addButton.click();
  	page.getInput("description").sendKeys("Property1");
  	let but = page.getSubmitButton();
  	browser.driver.wait(protractor.until.elementIsEnabled(but));
  	but.click();
    expect(page.getTitle().getText()).toEqual('Properties');
  });

});

