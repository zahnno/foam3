
foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a bank account',

  requires: [
    'net.nanopay.model.BankAccount',
    'net.nanopay.ui.NotificationMessage'
  ],

  imports: [
    'bankAccountDAO',
    'closeDialog',
    'bankAccountVerification',
    'stack'
  ],

  exports: [
    'verifyAmount'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    {
      name: 'newBankAccount'
    },
    {
      name: 'verifyAmount'
    }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addBank', id: 'form-addBank-info',         label: 'Account info',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankInfoForm' } },
        { parent: 'addBank', id: 'form-addBank-verification', label: 'Verification',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankVerificationForm' } },
        { parent: 'addBank', id: 'form-addBank-cashout',      label: 'Cashout plan',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankCashoutForm' } },
        { parent: 'addBank', id: 'form-addBank-done',         label: 'Done',          view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankDoneForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function() { return false; },
      code: function() {}
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position) {
        if ( position <= this.views.length - 1 ) return true;
        return false; // Not in dialog
      },
      code: function() {
        var self = this;
        if ( this.position == 0 ) { // On Submission screen.
          // data from form
          var accountInfo = this.viewData;

          if ( ( accountInfo.accountName == null || accountInfo.accountName == '' ) || 
          ( accountInfo.transitNumber == null || accountInfo.transitNumber == '' ) || 
          ( accountInfo.accountNumber == null || accountInfo.accountNumber == '' ) ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all fields before proceeding.', type: 'error' }));
            return;
          }

          var newAccount = this.BankAccount.create({
            accountName: accountInfo.accountName,
            bankNumber: accountInfo.bankNumber,
            transitNumber: accountInfo.transitNumber,
            accountNumber: accountInfo.accountNumber
          });

          this.bankAccountDAO.put(newAccount).then(function(response) {
            console.log(response);
            self.newBankAccount = response;
            self.subStack.push(self.views[self.subStack.pos + 1].view);
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
        }

        if ( this.position == 1 ) { // On Verification screen
            this.bankAccountVerification.verify(this.newBankAccount.id, this.verifyAmount).then(function(response) {
              if(!response) {
                self.add(self.NotificationMessage.create({ message: 'Invalid amount', type: 'error' }));
              } else {
                self.add(self.NotificationMessage.create({ message: 'Account successfully verified!', type: '' }));
                self.subStack.push(self.views[self.subStack.pos + 1].view);
              }
            }).catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            });
        }

        if ( this.position == 2 ) { // On Cashout Plan Selection
          //TODO: MAKE API CALL TO SELECT DEFAULT CASHOUT PLAN
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          this.closeDialog();
          return this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
        }
      }
    }
  ]
});
