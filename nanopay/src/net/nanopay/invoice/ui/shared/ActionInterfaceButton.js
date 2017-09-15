foam.CLASS({
  package: 'net.nanopay.invoice.ui.shared',
  name: 'ActionInterfaceButton',
  extends: 'foam.u2.View',

  documentation: 'Creates interface of action buttons on invoices.',

  requires: [ 
    'foam.u2.PopupView', 
    'foam.comics.DAOCreateControllerView' 
  ],

  properties: [
    'detailActions',
    'popupMenu_',
    'openMenu',
    'invoice'
  ],

  exports: [
    'popupMenu_',
    'detailActions'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS(){/*
        ^pay-button{
          width: 157px;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          color: white;
          font-size: 14px;
          font-weight: 200;
          line-height: 2.86;
          text-align: center;
          float: right;
        }
        ^expand-button{
          width: 27px;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          border-left: 0.5px solid #ffffff;
          float: right;
        }
        ^expand-triangle{
          width: 0; 
          height: 0; 
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid white;
          margin-left: 9px;    
          position: relative;
          top: -35;
        }
        ^top-action-buttons{
          width: 685px;
          float: right;
        }
        ^ .optionsDropDown {
          padding: 0;
          z-index: 1;
          width: 157px;
          height: 60px;
          background: white;
          opacity: 1;
          box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
          position: absolute;
          text-align: left;
        }
        ^ .optionsDropDown > div {
          width: 139px;
          height: 30px;
          padding-left: 18px;
          font-size: 14px;
          font-weight: 300;
          color: #093649;
          line-height: 30px;
        }
        ^ .optionsDropDown > div:hover {
          background-color: #59aadd;
          color: white;
          cursor: pointer;
        }
        ^ .foam-u2-ActionView-popUp{
          opacity: 0.01;
          z-index: 5;
          position: relative;
          top: -15;
          right: 10;
        }
        ^ .foam-u2-ActionView-mainAction{
          opacity: 0.01;
          z-index: 1;
          position: absolute;
          height: 35px;
          width: 125px;
          right: 25px;
        }
        ^ .foam-u2-ActionView-emailModal{
          position: absolute;
          width: 75px;
          height: 35px;
          z-index: 10;
          opacity: 0.01;
        }
        ^ .foam-u2-ActionView-approveModal{
          position: absolute;
          width: 75px;
          height: 35px;
          z-index: 10;
          opacity: 0.01;
        }
        ^ .foam-u2-ActionView-resolutionModal{
          position: absolute;
          width: 75px;
          height: 35px;
          z-index: 10;
          opacity: 0.01;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
          .start().addClass(this.myClass('top-action-buttons'))
          .start({  
            class: 'net.nanopay.ui.ActionButton', 
            data: {
              image: 'images/approve.png', 
              text: 'Approve',
              invoice: this.invoice,
              title: 'Approve'
            }
          }).addClass('import-button').add(this.RESOLUTION_MODAL).end()
          .start({
            class: 'net.nanopay.ui.ActionButton', 
            data: {
              image: 'images/reject.png', 
              text: 'Reject',
              invoice: this.invoice,
              title: 'Dispute'
            }
          }).addClass('import-button').add(this.RESOLUTION_MODAL).end()
          .start(this.EMAIL_MODAL).addClass('import-button').end()
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-assign.png', text: 'Assign'}}).addClass('import-button').end()
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-export.png', text: 'Export'}}).addClass('import-button').end()
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-print.png', text: 'Print'}}).addClass('import-button').end()
          .start().addClass(this.myClass('pay-button')).add(this.detailActions.buttonLabel)
          .startContext({ data: this }).add(this.MAIN_ACTION)
            .start('span', null, this.popupMenu_$)
              .start().addClass(this.myClass('expand-button')).add(this.POP_UP)
              .start().addClass(this.myClass('expand-triangle')).end()
              .end()         
            .end()
          .end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'popUp',
      code: function(X){
        var p = this.PopupView.create({
          width: 157,
          height: 60,
          left: -117,
          top: 30
        }, X)
        p.addClass('optionsDropDown')
          .start('div').add(this.detailActions.subMenu1)
            .on('click', this.detailActions.subMenuAction1)
          .end()
          .start('div').add(this.detailActions.subMenu2)
            .on('click', this.detailActions.subMenuAction2)
          .end()
        this.popupMenu_.add(p)
      }
    },
    {
      name: 'mainAction',
      code: function(){
        this.detailActions.buttonAction()
      }
    },
    {
      name: 'emailModal',
      icon: 'images/ic-email.png',
      code: function(X){
        X.ctrl.add(foam.u2.dialog.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.EmailModal'}));
      }
    },
    {
      name: 'resolutionModal',
      code: function(X){

        X.ctrl.add(
          foam.u2.dialog.Popup.create(null, X)
            .tag({ 
              class: 'net.nanopay.invoice.ui.modal.SingleResolutionModal', 
              invoice: X.data.invoice,
              title: X.data.title
            })
        );
      }
    }
  ]
})