import { ResourceListPO } from './pageObjects/resource-list.pgo'

describe('List - basic functions'+browser.params.user.login, function() {

  var page = new ResourceListPO();

  beforeAll(function() {
      browser.get('');
  });

  beforeEach(function() {
      browser.driver.sleep(10);
  });

  it('should have proper title'+browser.params.user.login, function() {
    page.setList(1);
    expect(page.getTitle().getText()).toEqual('Properties');
  });

  it('should have one item after adding a property and also after refres'+ browser.params.user.login, function(){
    if(browser.params.user.login == 'user2'){
      console.log('User 2 sleeping for 20 second')
      browser.driver.sleep(20000);  
    }
    browser.driver.sleep(2000);  
    page.addButton.click();
    browser.driver.sleep(2000);  
    page.addResource('properties', {p:{name:"property1"}, u:{name:"unit1", description: 'unit1', symbol:'s1'}})
    browser.sleep(3000);
    page.segment('All').click();
    browser.sleep(1000);
    expect(page.getListCount('property')).toBe(1);
    browser.refresh();
    browser.driver.sleep(4000)
    page.segment('All').click();
    browser.sleep(1000);
    expect(page.getListCount('property')).toBe(1);
  });
});
