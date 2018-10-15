// TODO: add accounting export. Button/Action 'syncButton'
// TODO: add export to csv. Button/Action 'csvButton'
// TODO: dbclick changed to single click
// TODO: clicking invoice should go to invoice detail view
// TODO: Button/Action 'sendMoney'
// TODO: context Menu addition and associated actions
foam.CLASS({
  package: 'net.nanopay.invoice.ui.sme',
  name: 'PayablesView',
  extends: 'foam.u2.Controller',

  documentation: `View to display a table with a list of all Payable Invoices.
  Also Exports to Accounting Software, exports to CSV, has search capabilities on Company Name column`,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'foam.u2.PopupView',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'user'
  ],

  exports: [
    'dblclick',
    'filter',
    'filteredInvoiceDAO'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 0.3%;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      vertical-align: top;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .subTitle {
      font-size: 9pt;
      margin-left: 10%;
      margin-top: -1.5%;
      color: gray;
    }
    ^ .exportButtons {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      cursor: pointer;
      margin-top: 2%;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'Search string for company column',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Company Search',
        onKey: true
      }
    },
    {
      name: 'userExpensesArray',
      documentation: 'Array that is populated on class load with user.expenses(payable invoices)'
    },
    {
      name: 'countContact',
      documentation: 'Count field for display'
    },
    {
      name: 'filteredInvoiceDAO',
      documentation: `DAO that is filtered from Search('Property filter')`,
      expression: function(filter, userExpensesArray) {
        if ( filter === '' ) {
          this.countContact = userExpensesArray ? userExpensesArray.length : 0;
          return this.user.expenses;
        }

        var filteredByCompanyInvoices = userExpensesArray.filter((expense) => {
          var matches = (str) => str && str.toUpperCase().includes(filter.toUpperCase());
          return expense.payee.businessName ? matches(expense.payee.businessName) : matches(expense.payee.label());
        });

        this.countContact = filteredByCompanyInvoices.length;
        return foam.dao.ArrayDAO.create({
          array: filteredByCompanyInvoices,
          of: 'net.nanopay.invoice.model.Invoice'
        });
      },
      view: function() {
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            net.nanopay.invoice.model.Invoice.PAYEE.clone().copyFrom({ label: 'Company', tableCellFormatter: function(_, obj) {
              var additiveSubField = obj.payee.businessName ? obj.payee.businessName : obj.payee.label();
              this.add(additiveSubField);
            } }),
            net.nanopay.invoice.model.Invoice.INVOICE_NUMBER.clone().copyFrom({ label: 'Invoice No.' }),
            net.nanopay.invoice.model.Invoice.AMOUNT.clone().copyFrom({ tableCellFormatter: function(_, obj) {
              var additiveSubField = '- ';
              if ( obj.destinationCurrency == 'CAD' || obj.destinationCurrency == 'USD' ) additiveSubField += '$';
              additiveSubField += (obj.addCommas((obj.amount/100).toFixed(2)) + ' ' + obj.destinationCurrency);
              this.add(additiveSubField);
            } }),
            'dueDate',
            'lastModified',
            'status'
          ]
        };
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payables' },
    { name: 'SUB_TITLE', message: 'Money owed to vendors' },
    { name: 'COUNT_TEXT', message: 'invoices' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any Contacts yet. Please add Contacts by clicking the \'Add a Contact\' button above.' }
  ],

  methods: [
    function init() {
      var self = this;
      this.user.expenses.select().then(function(expensesSink) {
        self.userExpensesArray = expensesSink.array;
      });
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start().style({ 'font-size': '20pt' }).add(this.TITLE).end()
        .start().addClass('subTitle').add(this.SUB_TITLE).end()
        .start()
          .start(this.SEND_MONEY).style({ 'float': 'right' }).end()
        .end()
        .start()
          .start(this.SYNC_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .addClass('exportButtons')
          .end()
          .start(this.CSV_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .style({ 'margin-left': '2%' }).addClass('exportButtons')
          .end()
          .start().style({ 'margin': '15px 15px 15px 0px' })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
            .start(this.FILTER).addClass('filter-search').end()
          .end()
        .end()
        .start().add(this.COUNT_TEXT).add(this.countContact$).add(this.totalInvoiceCount$.map( (i) => {
          return (this.COUNT_TEXT1 + i + ( ( i > 1 ) ? this.COUNT_TEXT2 : this.COUNT_TEXT3));
        })).style({ 'font-size': '12pt', 'margin': '0px 10px 15px 2px' }).end()
        .tag(this.FILTERED_INVOICE_DAO, {
          contextMenuActions: [
            foam.core.Action.create({
              name: 'viewDetails',
              label: 'View details',
              code: function(X) {
                alert('Not implemented yet!');
                // TODO: add redirect to Invoice Detail Page once view is ready
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              label: 'Delete',
              confirmationRequired: true,
              isAvailable: function() {
                return (this.status === this.InvoiceStatus.DRAFT);
              },
              code: function(X) {
                view.user.expenses.remove(this);
                view.totalInvoiceCount--;
                view.countContact--;
              }
            }),
            foam.core.Action.create({
              name: 'payNow',
              label: 'Pay now',
              isAvailable: function() {
                return (
                  this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.OVERDUE );
              },
              code: function(X) {
                alert('Not implemented yet!');
                // TODO: add redirect to payment flow
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                return (
                  this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.OVERDUE
                );
              },
              isAvailable: function() {
                return (
                  this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.PAID ||
                  this.status === this.InvoiceStatus.PENDING ||
                  this.status === this.InvoiceStatus.OVERDUE
                );
              },
              code: function(X) {
                this.paymentMethod = view.PaymentStatus.VOID;
                view.user.expenses.put(this);
              }
            })
          ]
        })
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.filteredInvoiceDAO, message: this.PLACE_HOLDER_TEXT, image: 'images/ic-bankempty.svg' });
    },

    function dblclick(invoice) {
      // TODO: open Invoice Detail view
      // TODO: change dblclick to singleClick
    }
  ],

  actions: [
    {
      name: 'syncButton',
      label: 'sync',
      toolTip: 'Sync with accounting Software',
      code: function(X) {
        // TODO: Sync to Accounting Software
      }
    },
    {
      name: 'csvButton',
      label: 'Export as CSV',
      toolTip: 'Export list of invoices to a CSV file',
      code: function(X) {
        // TODO: Export to CSV
      }
    },
    {
      name: 'sendMoney',
      label: 'Send money',
      toolTip: 'Pay for selected invoice',
      code: function(X) {
        // TODO:
      }
    }
  ]
});
