foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceOverview',
  extends: 'foam.u2.View',

  documentation: `
    Invoice detail view of Payable/Receivable for Ablii.
    Displays invoice information, transaction details and
    invoice changes (Invoice history).

    Link to spread sheet that outlines secondary actions displayed based on Invoice.status
    https://docs.google.com/spreadsheets/d/1fgcSFAxg0KgteBws6l5WrvsPXS4QyuOqZDof-Gxs01Q/edit?usp=sharing
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'accountDAO',
    'ctrl',
    'currencyDAO',
    'hasPassedCompliance',
    'invoiceDAO',
    'publicUserDAO',
    'pushMenu',
    'notify',
    'stack',
    'transactionDAO',
    'user'
  ],

  css: `
    ^ {
      width: 1024px;
      margin: auto;
      padding: 24px;
    }
    ^ .left-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 25px);
      margin-right: 5px;
    }
    ^ .right-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 40px);
      margin-left: 40px;
    }
    ^back-area {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #8e9090;
      font-size: 16px;
      font-weight: 400;
    }
    ^ .parent {
      margin-left: 15px;
    }
    ^ .payment-content {
      padding: 0px 14px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    ^ .invoice-history-content {
      padding: 14px;
      border-radius: 4px;
    }
    ^ .actions-wrapper {
      padding: 23px 0px 34px;
    }
    ^ .net-nanopay-ui-ActionView-payNow {
      width: 158px;
    }
    ^back-arrow {
      font-size: 20pt;
    }
    ^top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    ^ .invoice-row {
      margin-bottom: 24px;
    }
    ^ .invoice-text-left {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .subheading {
      margin-bottom: 16px;
      font-weight: bold;
    }
    ^ .foam-u2-history-HistoryView {
      background: none;
      padding-left: 0px;
      margin-left: -13px;
      height: auto;
      padding-top: 5px;
    }
    ^ .net-nanopay-invoice-ui-history-InvoiceHistoryView {
      height: auto;
    }
    ^ .foam-u2-history-HistoryView h2 {
      display: none;
    }
    ^align-top {
      vertical-align: top;
    }
  `,

  messages: [
    { name: 'BACK', message: 'Go back' },
    { name: 'PAYMENT_DETAILS', message: 'Payment details' },
    { name: 'EXCHANGE_RATE', message: 'Exchange rate' },
    { name: 'PAYMENT_FEE', message: 'Fee' },
    { name: 'REQUEST_AMOUNT', message: 'Requested amount' },
    { name: 'PAID_AMOUNT', message: 'Paid amount' },
    { name: 'PAID_DATE', message: 'Paid date' },
    { name: 'PAYMENT_HISTORY', message: 'History' },
    { name: 'MARK_AS_COMP_ICON', message: 'images/ablii/receivables-icon-resting.svg' },
    { name: 'MARK_AS_COMP_HOVER', message: 'images/ablii/receivables-icon-resting.svg' },
    { name: 'MARK_AS_COMP_MESSAGE', message: 'Mark as Complete' },
    { name: 'VOID_ICON', message: 'images/ic-cancel.svg' },
    { name: 'VOID_ICON_HOVER', message: 'images/ic-cancel.svg' },
    { name: 'VOID_MESSAGE', message: 'Mark as Void' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: `Denotes whether this view is for a payable
          or a receivable.`
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice',
      documentation: 'The invoice object passed from Payables/Receivables view.'
    },
    {
      class: 'FObjectProperty',
      name: 'relatedTransaction'
    },
    {
      class: 'Boolean',
      name: 'showTran'
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount'
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    },
    {
      class: 'Boolean',
      name: 'isCrossBorder'
    },
    {
      class: 'String',
      name: 'exchangeRateInfo'
    },
    {
      name: 'bankAccountLabel'
    },
    {
      class: 'Boolean',
      name: 'isPaid'
    },
    {
      class: 'Boolean',
      name: 'ismarkCompletable'
    },
    {
      class: 'Boolean',
      name: 'isVoidable'
    },
    {
      class: 'Boolean',
      name: 'isSendRemindable'
    }
  ],

  methods: [
    function init() {
      // Dynamic create top button based on 'isPayable'
      this.generateTop(this.isPayable);

      this.transactionDAO.find(this.invoice.paymentId).then((transaction) => {
        if ( transaction ) {
          this.relatedTransaction = transaction;
          this.showTran = true;

          var bankAccountId = this.isPayable ?
              transaction.sourceAccount :
              transaction.destinationAccount;

          if ( transaction.name === 'Foreign Exchange' && transaction.fxRate ) {
            this.exchangeRateInfo = `1 ${sourceCurrency} @ `
                + `${transaction.fxRate.toFixed(4)} ${transaction.destinationCurrency}`;
          }

          this.accountDAO.find(bankAccountId).then((account) => {
            this.bankAccount = account;
            this.currencyDAO.find(account.denomination).then((currency) => {
              this.formattedAmount = `${currency.format(transaction.amount)} ${currency.alphabeticCode}`;
            });

            if ( this.invoice.destinationCurrency === account.denomination ) {
              this.isCrossBorder = false;
            } else {
              this.isCrossBorder = true;
            }
          });
        }
      });
      this.bankAccountLabel = this.isPayable ? 'Withdraw from' : 'Deposit to';
      this.isPaid = this.invoice.status.label === 'Paid';
      this.ismarkCompletable = ! this.isPayable &&
                               ( this.invoice.status === this.InvoiceStatus.PENDING_APPROVAL ||
                                 this.invoice.status === this.InvoiceStatus.SCHEDULED );
      this.isVoidable = this.invoice.status === this.InvoiceStatus.UNPAID ||
                        this.invoice.status === this.InvoiceStatus.OVERDUE;
      this.isSendRemindable = this.isVoidable && ! this.isPayable;
    },

    function initE() {
      console.log(`@invoiceOverview status = ${this.invoice.status}`);
     // this.invoice$.sub(this.invoiceListener);
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass('x-large-header')
            .add('Invoice #' + this.invoice.invoiceNumber)
          .end()
        .end()

        // Secondary Actions: View link in documentation for more info
        .start()
          .addClass('actions-wrapper')
          // Void Button :
          .start().addClass('inline-block').show(this.isVoidable)
            .addClass('sme').addClass('link-button')
            .start('img').addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.VOID_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.VOID_ICON_HOVER)
            .end()
            .add(this.VOID_MESSAGE)
            .on('click', () => this.saveAsVoid())
          .end()
          // Mark as Complete Button :
          .start().addClass('inline-block').show(this.ismarkCompletable)
            .addClass('sme').addClass('link-button')
            .start('img').addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.MARK_AS_COMP_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.MARK_AS_COMP_HOVER)
            .end()
            .add(this.MARK_AS_COMP_MESSAGE)
            .on('click', () => this.markAsComplete())
          .end()
        .end()

        .start()
          .start()
            .addClass('left-block')
            .addClass('invoice-content')
            .tag({ class: 'net.nanopay.sme.ui.InvoiceDetails', invoice$: this.invoice$ })
          .end()
          .start()
            .addClass('right-block')
            .start()
              .addClass('payment-content')
              .start()
                .addClass('subheading')
                .add(this.PAYMENT_DETAILS)
              .end()

              .start().show(this.showTran$)
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left').show(this.isCrossBorder$)
                    .start().addClass('table-content').add(this.EXCHANGE_RATE).end()
                    .add(this.exchangeRateInfo$)
                  .end()
                  // Only show fee when it is a payable
                  .start().addClass('invoice-text-right').show(this.isPayable)
                    .start().addClass('table-content').add(this.PAYMENT_FEE).end()
                    .add('None')
                  .end()
                .end()
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left')
                    .start().addClass('table-content').add(this.REQUEST_AMOUNT).end()
                    .add(this.formattedAmount$)
                  .end()
                  .start().addClass('invoice-text-right')
                    .start().addClass('table-content').add(this.PAID_AMOUNT).end()
                    .start().show(this.isPaid)
                      .add(this.formattedAmount$)
                    .end()
                    .start().add('-').hide(this.isPaid).end()
                  .end()
                .end()
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left')
                    .start().addClass('table-content').add(this.bankAccountLabel).end()
                    .add(this.bankAccount$.map((account) => {
                      if ( account != null ) {
                        return `${account.name} ${'*'.repeat(account.accountNumber.length-4)} ${account.accountNumber.slice(-4)}`;
                      } else {
                        return '';
                      }
                    }))
                  .end()
                  .start().addClass('invoice-text-right')
                    .start().addClass('table-content').add(this.PAID_DATE).end()
                    .start().show(this.isPaid)
                      .add(this.relatedTransaction$.dot('completionDate'))
                    .end()
                    .start().add('-').hide(this.isPaid).end()
                  .end()
                .end()
              .end()
            .end()

            .start()
              .addClass('invoice-history-content')
              .start()
                .addClass('subheading')
                .add(this.PAYMENT_HISTORY)
              .end()
              .start({
                class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                id: this.invoice.id
              }).end()
            .end()
          .end()
        .end()
      .end();
    },

    function generateTop(isPayable) {
      var action;
      if ( isPayable ) {
        action = this.PAY_NOW;
      } else {
        action = this.SEND_REMINDER;
      }
      // 'startContext' is required to pass the context to the button
      this
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('top-bar'))
            .start()
              .addClass(this.myClass('back-area'))
              .start('span')
                .addClass(this.myClass('back-arrow'))
                .add('←')
              .end()
              .start('span')
                .addClass('parent')
                .add(this.BACK)
              .end()
              .on('click', () => {
                var menuId = this.isPayable ? 'sme.main.invoices.payables'
                  : 'sme.main.invoices.receivables';
                // This view has the same hash as the Payable/Receivable pages,
                //     thus stack back() then load the window.location.hash
                this.stack.back();
                this.pushMenu(menuId);
              })
            .end()
            .start(action)
              .addClass('sme').addClass('button').addClass('primary')
            .end()
          .end()
        .endContext();
    },
    function saveAsVoid() {
      if ( ! this.isVoidable ) return;
      this.invoice.paymentMethod = this.PaymentStatus.VOID;
        try {
          this.user.expenses.put(this.invoice);
          this.notify(`Invoice #${this.invoice.invoiceNumber} has successfully been voided`);
        } catch (error) {
          this.notify(`Invoice #${this.invoice.invoiceNumber} could not be voided at this time. Please try again later.`);
        }
    },
    function markAsComplete() {
      this.add(foam.u2.dialog.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
        invoice: this.invoice
      }));
    },
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        return this.invoice.paymentMethod === this.PaymentStatus.NONE ||
          this.invoice.draft;
        // TODO: auth.check(this.user, 'invoice.pay');
      },
      code: function(X) {
        if ( this.hasPassedCompliance() ) {
          X.menuDAO.find('sme.quickAction.send').then((menu) => {
            menu.handler.view = Object.assign(menu.handler.view, {
              isPayable: this.isPayable,
              isForm: false,
              isDetailView: true,
              hasSaveOption: false,
              invoice: this.invoice
            });
            menu.launch(X, X.controllerView);
          });
        }
      }
    },
    {
      name: 'sendReminder',
      label: 'Send a reminder',
      isAvailable: function() {
        return this.isSendRemindable;
      },
      code: function(X) {
        console.log('Sending Reminder for invoice');
        // TODO:
      }
    }
  ]
});
