﻿// ReSharper disable InconsistentNaming
(function (testFns) {
  "use strict";

  /*=========== OData Module ===================*/
  var EntityQuery = breeze.EntityQuery;
  var handleFail = testFns.handleFail;
  var manager;
  var resourceName = 'ODataTodos';
  var serviceName = 'http://localhost:56337/odata/';

  module("odataTests w/ saveQueuing", {
    setup: setupODataTests,
    teardown: teardownODataTests
  });

  asyncTest("can save 2nd modify while 1st is inflight", function () {
    expect(5);

    var todo;

    EntityQuery.from(resourceName).take(1)
      .using(manager).execute()
        .then(fastUpdate)
        .then(requery)
        .then(success)
        .catch(handleFail).finally(start);

    function fastUpdate(data) {
      todo = data.results[0];
      if (todo == null) {
        return Q.reject('initial query for ODataTodoItem returned nothing');
      }
      todo.setProperty('Description', 'Modified 1');
      manager.saveChanges();

      // this second save occurs while the first save is inflight; it will be queued
      todo.setProperty('Description', 'Modified 2');
      return manager.saveChanges();
    }

    function requery(saveResult) {
      equal(saveResult.entities.length, 1, 'save op returned one saved entity');
      var saved = saveResult.entities[0];
      equal(saved.getProperty('Description'), 'Modified 2',
        "saved.Description has the modified value from the SECOND save");

      equal(todo.getProperty('Description'), 'Modified 2',
        "todo.Description has the modified value from the SECOND save");
      var state = todo.entityAspect.entityState.name;
      equal(state, 'Unchanged', 'Todo in cache should have state "Unchanged"');

      // It all looks good to here: saved entity and entity in cache are the same
      // object and have the second modified value.
      // Defect shows up after re-query which refreshes the TodoItem.
      // The value on the server is actually that of the first save, not the second save
      // Network traffic shows only one save. The second save request did not go out
      return EntityQuery.from(resourceName)
      .where('Id', 'eq', todo.getProperty('Id'))
      .using(manager).execute();
    }

    function success(data) {
      var item = data.results[0];
      if (item == null) {
        return Q.reject('post-save re-query for ODataTodoItem returned nothing');
      }
      equal(item.getProperty('Description'), 'Modified 2',
        "requeried item.Description has the modified value from the SECOND save");
      return true;
    }

  });

  ////////  HELPERS ////////

  function setupODataTests() {
    // adapter in use prior to tests
    this.origDataServiceAdapterName = breeze.config.getAdapterInstance('dataService').name;
    
    // switch to webApiOData adapter
    breeze.config.initializeAdapterInstance('dataService', 'webApiOData', true);

    var ds = new breeze.DataService({
      serviceName: serviceName,
      hasServerMetadata: false
    });

    var todoItemType = {
      shortName: 'ODataTodoItem',
      namespace: 'ODataTodo.Models',
      autoGeneratedKeyType: breeze.AutoGeneratedKeyType.Identity,
      defaultResourceName: resourceName,
      dataProperties: {
        // WAT? Id: { dataType: DT.String, isPartOfKey: true },
        Id: { dataType: breeze.DataType.Int32, isPartOfKey: true },
        Description: {}
      }
    };

    var metadataStore = new breeze.MetadataStore({
      namingConvention: breeze.NamingConvention.none
    });
    metadataStore.addDataService(ds);
    metadataStore.addEntityType(todoItemType);

    manager = new breeze.EntityManager({
      dataService: ds,
      metadataStore: metadataStore
    });

    // allow save while another save is in-flight
    manager.enableSaveQueuing(true); 
  }

  function teardownODataTests() {

    // restore adapter in-use prior to this module's tests
    breeze.config.initializeAdapterInstance('dataService', this.origDataServiceAdapterName, true);

    // reset the database with jQuery ajax
    $.ajax({
      type: 'POST',
      url: serviceName + resourceName + '/Reset'
    })
    .then(function (data) {
      var message = data.value;
      if (!/reset/i.test(message)) {
        console.error("OData reset request succeeded but w/ surprising message: " + message);
      }
    })
    .fail(function(error) {
      console.error("OData reset request failed: " + error.message);
      throw error;
    });

  }

})(docCode.testFns);