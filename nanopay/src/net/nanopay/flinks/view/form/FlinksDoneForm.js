foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksDoneForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  messages: [
    { name: 'Step', message: 'Step5: You\'re all set! Connection is successful.'}
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      
      */}
    })
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'See Accounts';
    },
    function initE() {
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
    }
  ]
})