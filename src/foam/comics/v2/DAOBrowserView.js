/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOBrowserView',
  extends: 'foam.u2.View',
  mixins: ['foam.nanos.controller.MementoMixin'],

  requires: [
    'foam.comics.SearchMode',
    'foam.comics.v2.DAOControllerConfig',
    'foam.log.LogLevel',
    'foam.nanos.controller.Memento',
    'foam.u2.ActionView',
    'foam.u2.dialog.Popup',
    'foam.u2.filter.FilterView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.view.ScrollTableView',
    'foam.u2.view.SimpleSearch',
    'foam.u2.view.TabChoiceView'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A scrolling table view customized for the inline DAOController
    with canned queries and a searchbar
  `,

  css: `
    ^export {
      margin-left: 16px;
    }

    ^export img {
      margin-right: 0;
    }

    .foam-u2-ActionView-refreshTable > img {
      margin-right: 0;
    }

    ^top-bar {
      border-bottom: solid 1px #e7eaec;
      align-items: center;
      padding-top: 16px;
    }

    ^query-bar {
      padding: 32px 16px;
    }

    ^toolbar {
      flex-grow: 1;
    }

    ^browse-view-container {
      box-sizing: border-box;
      height: 100%;
      margin-bottom: 20px;
      padding: 0 16px;
      overflow: hidden;
    }

    ^canned-queries {
      padding: 0 16px;
    }

    ^ .foam-u2-view-TableView th {
      background: #ffffff
    }

    ^ .foam-u2-view-TableView td {
      padding-left: 16px;
    }

    ^ .foam-u2-view-SimpleSearch {
      flex-grow: 1;
    }

    ^ .foam-u2-view-SimpleSearch input {
      width: 100%;
      height: 34px;
      border-radius: 0 5px 5px 0;
      border: 1px solid;
    }
  `,

  messages: [
    { name: 'REFRESH_MSG', message: 'Refresh Requested... ' }
  ],

  imports: [
    'ctrl',
    'exportDriverRegistryDAO',
    'stack?'
  ],

  exports: [
    'click',
    'config',
    'filteredTableColumns',
    'serviceName'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'filteredTableColumns'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      expression: function(config$summaryView) {
        return config$summaryView;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'cannedQueriesView',
      factory: function() {
        return {
          class: 'foam.u2.view.TabChoiceView'
        };
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'cannedPredicate',
      expression: function(config$cannedQueries) {
        return config$cannedQueries && config$cannedQueries.length
          ? config$cannedQueries[0].predicate
          : foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'searchPredicate',
      expression: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, cannedPredicate, searchPredicate) {
        return config.dao$proxy.where(this.AND(cannedPredicate, searchPredicate));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchFilterDAO',
      expression: function(config, cannedPredicate) {
        return config.dao$proxy.where(cannedPredicate);
      }
    },
    {
      name: 'serviceName',
      class: 'String',
      factory: function() {
        return this.data && this.data.serviceName ? this.data.serviceName : this.config.daoKey;
      }
    },
    {
      name: 'importModal',
      factory: function() {
        return {
          class: 'foam.nanos.google.api.sheets.ImportFromGoogleSheetsForm',
          of: this.config.of,
          dao: this.serviceName || this.data.delegate.serviceName
        };
      }
    }
  ],

  actions: [
    {
      name: 'export',
      label: '',
      toolTip: 'Export Table Data',
      icon: 'images/export-arrow-icon.svg',
      isAvailable: async function() {
        var records = await this.exportDriverRegistryDAO.select();
        return records && records.array && records.array.length != 0;
      },
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'foam.u2.ExportModal',
          exportData: this.predicatedDAO$proxy,
          predicate: this.config.filterExportPredicate
        }));
      }
    },
    {
      name: 'refreshTable',
      label: '',
      toolTip: 'Refresh Table',
      icon: 'images/refresh-icon-black.svg',
      code: function(X) {
        this.config.dao.cmd_(X, foam.dao.CachingDAO.PURGE);
        this.config.dao.cmd_(X, foam.dao.AbstractDAO.RESET_CMD);
        this.ctrl.notify(this.REFRESH_MSG, '', this.LogLevel.INFO, true, '/images/Progress.svg');
      }
    },
    {
      name: 'import',
      label: '',
      availablePermissions: [ "data.import.googleSheets" ],
      toolTip: 'Import From Google Sheet',
      // icon: 'images/export-arrow-icon.svg',//need find out where we're getting the icons
      code: function() {
        this.add(this.Popup.create().tag(this.importModal));
      }
    }
  ],

  methods: [
    function init() {
      // Reset the search filters when a different canned query is selected
      this.onDetach(this.cannedPredicate$.sub(() => {
        this.searchPredicate = foam.mlang.predicate.True.create();
      }));
    },
    function click(obj, id) {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: this.config,
        idOfRecord: id
      }, this.__subContext__);
    },
    function initE() {
      var self = this;
      var filterView;
      var simpleSearch;

      this.initMemento();

      this.addClass(this.myClass());
      this.SUPER();

      this
        .add(this.slot(function(config$cannedQueries, config$hideQueryBar, searchFilterDAO) {

          // to manage memento imports for filter view (if any)
          if ( self.config.searchMode === self.SearchMode.SIMPLE ) {
            var simpleSearch = foam.u2.ViewSpec.createView(self.SimpleSearch, {
              showCount: false,
              data$: self.searchPredicate$,
            }, this, self.__subSubContext__.createSubContext({ memento: self.currentMemento_ }));
    
            var filterView = foam.u2.ViewSpec.createView(self.FilterView, {
              dao$: self.searchFilterDAO$,
              data$: self.searchPredicate$
            }, this, simpleSearch.__subContext__.createSubContext());
          } else {
            var filterView = foam.u2.ViewSpec.createView(self.FilterView, {
              dao$: self.searchFilterDAO$,
              data$: self.searchPredicate$
            }, this, self.__subContext__.createSubContext({ memento: self.currentMemento_ }));
          }

          summaryView = foam.u2.ViewSpec.createView(self.summaryView ,{
            data: self.predicatedDAO$proxy,
            config: self.config
          },  this, filterView.__subContext__.createSubContext());
          
          return self.E()
            .start(self.Rows)
            .style({ height: '100%', 'justify-content': 'flex-start' })
              .callIf(config$cannedQueries.length >= 1, function() {
                this
                  .start(self.Cols)
                    .addClass(self.myClass('top-bar'))
                    .start(self.Cols)
                      .callIf(config$cannedQueries.length > 1, function() {
                        this
                          .start(self.cannedQueriesView, {
                            choices: config$cannedQueries.map((o) => [o.predicate, o.label]),
                            data$: self.cannedPredicate$
                          })
                            .addClass(self.myClass('canned-queries'))
                          .end();
                      })
                    .end()
                  .end();
              })
              .callIf( ! config$hideQueryBar, function() {
                this
                  .start(self.Cols).addClass(self.myClass('query-bar'))
                    .startContext({
                      dao: searchFilterDAO,
                      controllerMode: foam.u2.ControllerMode.EDIT
                    })
                      .callIf(self.config.searchMode === self.SearchMode.SIMPLE, function() {
                        this.add(simpleSearch);
                      })
                      .callIf(self.config.searchMode === self.SearchMode.FULL, function() {
                        this.add(filterView);
                    })
                    .endContext()
                    .start()
                      .startContext({ data: self })
                        .start(self.EXPORT, { buttonStyle: 'SECONDARY', size: 'SMALL' })
                          .addClass(self.myClass('export'))
                        .end()
                        .start(self.IMPORT, { buttonStyle: 'SECONDARY', size: 'SMALL', icon: 'images/export-arrow-icon.svg', css: {'transform': 'rotate(180deg)'} })
                          .addClass(self.myClass('export'))
                        .end()
                        .start(self.REFRESH_TABLE, { buttonStyle: 'SECONDARY', size: 'SMALL' })
                          .addClass(self.myClass('refresh'))
                        .end()
                      .endContext()
                    .end()
                  .end();
              })
              .start()
                .add(summaryView)
                .addClass(self.myClass('browse-view-container'))
              .end()
            .end();
        }));
    }
  ]
});
