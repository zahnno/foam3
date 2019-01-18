foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.integration.AccountingIntegrationTrait'
  ],

  imports: [
    'hasPassedCompliance',
    'user'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.contacts.where(this.EQ(this.Contact.ENABLED, true));
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          editColumnsEnabled: false,
          columns: [
            'organization', 'legalName', 'email', 'signUpStatus',
            foam.core.Property.create({
              name: 'warning',
              label: '',
              tableCellFormatter: function(value, obj, axiom) {
                if ( obj.bankAccount == undefined ) {
                  this.start()
                    .attrs({ title: 'Missing bank information' } )
                    .start({ class: 'foam.u2.tag.Image', data: 'images/warning.svg' }).end()
                    .end();
                }
              }
            })
          ],
          contextMenuActions: [
            this.Action.create({
              name: 'edit',
              isEnabled: function() {
                return this.signUpStatus !== self.ContactStatus.ACTIVE;
              },
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.ContactWizardModal',
                  // Setting data enables the edit flow.
                  data: this
                }));
              }
            }),
            this.Action.create({
              name: 'invite',
              isEnabled: function() {
                return this.signUpStatus === self.ContactStatus.NOT_INVITED;
              },
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.InviteContactModal',
                  data: this
                }));
              }
            }),
            this.Action.create({
              name: 'requestMoney',
              isEnabled: async function() {
                return !! await this.businessId$find;
              },
              code: function(X) {
                if ( self.hasPassedCompliance() ) {
                  X.menuDAO.find('sme.quickAction.request').then((menu) => {
                    var clone = menu.clone();
                    Object.assign(clone.handler.view, {
                      invoice: self.Invoice.create({ contactId: this.id }),
                      isPayable: false
                    });
                    clone.launch(X, X.controllerView);
                  });
                }
              }
            }),
            this.Action.create({
              name: 'sendMoney',
              isEnabled: async function() {
                return !! await this.businessId$find;
              },
              code: function(X) {
                if ( self.hasPassedCompliance() ) {
                  X.menuDAO.find('sme.quickAction.send').then((menu) => {
                    var clone = menu.clone();
                    Object.assign(clone.handler.view, {
                      invoice: self.Invoice.create({ contactId: this.id }),
                      isPayable: true
                    });
                    clone.launch(X, X.controllerView);
                  });
                }
              }
            }),
            this.Action.create({
              name: 'delete',
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.DeleteContactView',
                  data: this
                }));
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        return this.Action.create({
          name: 'addContact',
          label: 'Add a Contact',
          code: function(X) {
            this.add(this.Popup.create().tag({
              class: 'net.nanopay.contacts.ui.modal.ContactWizardModal'
            }));
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(contact) {
        // Do nothing.
      }
    }
  ]
});
