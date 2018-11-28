foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'SigningOfficerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fourth step in the business registration wizard,
    responsible for collecting signing officer information.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'net.nanopay.model.PersonalIdentification'
  ],

  imports: [
    'user',
    'menuDAO'
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-top: 5px;
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
      margin-top: 8px;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
    }
    ^ .inline {
      margin: 15px;
    }
    ^ .blue-box {
      width: 100%;
      padding: 15px;
      background: #e6eff5;
    }
    ^ .label-width {
      width: 200px;
      margin-left: 0px;
      margin-bottom: 20px;
    }
    ^ .question-container {
      width: 200px;
      margin-left: 0;
      margin-bottom: 40px;
    }
    ^ .radio-button {
      margin-top: 50px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton {
      margin-top: 20px;
    }

    ^ .net-nanopay-ui-ActionView-addUsers {
      height: 40px;
      width: 250px;
      background: none;
      color: #8e9090;
      font-size: 16px;
      text-align: left;
    }

    ^ .net-nanopay-ui-ActionView-addUsers:hover {
      background: none;
      color: #8e9090;
    }

  `,

  properties: [
    {
      name: 'signingOfficer',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        return this.viewData.agent.signingOfficer ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.agent.signingOfficer = n === 'Yes';
      }
    },
    {
      name: 'politicallyExposed',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ],
        value: 'No'
      },
      postSet: function(o, n) {
        this.viewData.agent.PEPHIORelated = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      documentation: 'First name field.',
      postSet: function(o, n) {
        this.viewData.agent.firstName = n;
      }
    },
    {
      class: 'String',
      name: 'lastNameField',
      documentation: 'Last name field.',
      postSet: function(o, n) {
        this.viewData.agent.lastName = n;
      }
    },
    {
      class: 'String',
      name: 'jobTitleField',
      documentation: 'Job title field.',
      postSet: function(o, n) {
        this.viewData.agent.jobTitle = n;
      }
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Phone number field.',
      postSet: function(o, n) {
        this.viewData.agent.phone.number = n;
      }
    },
    {
      class: 'String',
      name: 'emailField',
      documentation: 'Email address field.',
      postSet: function(o, n) {
        this.viewData.agent.email = n;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'addressField',
      factory: function() {
        return this.Address.create({});
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      postSet: function(o, n) {
        this.viewData.agent.address = n;
      }
    },
    // {
    //   class: 'foam.nanos.fs.FileArray',
    //   name: 'additionalDocs',
    //   documentation: 'Additional documents for compliance verification.',
    //   view: function (_, X) {
    //     return {
    //       class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
    //       additionalDocuments: this
    //     };
    //   },
    //   factory: function () {
    //     // return foam.nanos.fs.FileArray.create({});
    //     if ( this.viewData.agent.additionalDocuments ) return this.viewData.agent.additionalDocuments;
    //   },
    //   postSet: function(o, n) {
    //     this.viewData.signingOfficer.additionalDocuments = n;
    //   }
    // },
    {
      name: 'principalTypeField',
      value: 'Shareholder',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Shareholder', 'Owner', 'Officer']
      },
      postSet: function(o, n) {
        this.viewData.agent.principleType = n;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      view: { class: 'net.nanopay.ui.PersonalIdentificationView' },
      factory: function() {
        return this.PersonalIdentification.create({});
      },
      postSet: function(o, n) {
        this.viewData.agent.identification = n;
      },
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Signing officer information' },
    { name: 'SIGNING_OFFICER_QUESTION', message: 'Are you a signing officer of your company?' },
    { name: 'INFO_MESSAGE', message: `A signing officer must complete the rest of your business profile. You're all done!` },
    { name: 'INVITE_TITLE', message: 'Invite users to your business' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'PRINCIPAL_LABEL', message: 'Principal Type' },
    { name: 'JOB_LABEL', message: 'Job Title' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'IDENTIFICATION_TITLE', message: 'Identification' },
    { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
    { name: 'UPLOAD_INFORMATION', message: 'Upload the identification specified above' },
    {
      name: 'DOMESTIC_QUESTION',
      message: `Are you a domestic or foreign Politically Exposed Person (PEP),
          Head of an International Organization (HIE), or a close associate or
          family member of any such person?`
    },
    {
      name: 'INVITE_INFO',
      message: `Invite a signing officer or other employees in your business.
          Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_INFORMATION',
      message: `A signing officer is a person legally authorized to act
          on behalf of the business. (e.g. CEO, COO, board director)`
    },
    {
      name: 'ADD_USERS_LABEL',
      message: '+ Add Users'
    },
    {
      name: 'INVITE_USERS_HEADING',
      message: 'Invite users to your business'
    },
    {
      name: 'INVITE_USERS_EXP',
      message: `Invite a signing officer or other employees in your business.
              Recipients will receive a link to join your business on Ablii`
    }
  ],

  methods: [
    function initE() {
      this.signingOfficer$.sub(this.populateFields);
      if ( this.viewData.agent.signingOfficer ) this.populateFields();

      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header').add(this.TITLE).end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.SIGNING_INFORMATION })
        .start().addClass('label-input')
          .start().addClass('inline').addClass('question-container').add(this.SIGNING_OFFICER_QUESTION).end()
          .start(this.SIGNING_OFFICER).end()
        .end()
        .start().show(this.signingOfficer$.map(function(v) {
          return v == 'Yes';
        }))
          .start().addClass('label-input')
            .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
            .start(this.FIRST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.LAST_NAME_LABEL).end()
            .start(this.LAST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PRINCIPAL_LABEL).end()
            .start(this.PRINCIPAL_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.JOB_LABEL).end()
            .start(this.JOB_TITLE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .start(this.PHONE_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL_FIELD).end()
          .end()
          .start(this.ADDRESS_FIELD).end()
          .start().addClass('label-input')
            .start().addClass('inline').addClass('label-width').add(this.DOMESTIC_QUESTION).end()
            .start(this.POLITICALLY_EXPOSED).addClass('radio-button').end()
          .end()
          .start().addClass('medium-header').add(this.IDENTIFICATION_TITLE).end()
          .start(this.IDENTIFICATION).end()
          .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
          .start().add(this.UPLOAD_INFORMATION).end()
          .start(this.ADDITIONAL_DOCS).end()
        .end()
        .start().hide(this.signingOfficer$.map(function(v) {
          return v == 'Yes';
        }))
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_MESSAGE })
          // Append add user logic when implemented.
            .start().addClass('borderless-container')
              .start().addClass('medium-header').add(this.INVITE_USERS_HEADING).end()
              .start().addClass('body-paragraph').addClass('subdued-text')
                .add(this.INVITE_USERS_EXP)
              .end()
            .end()
            .start(this.ADD_USERS, { label: this.ADD_USERS_LABEL })
            .end()
        .end();
    }
  ],

  listeners: [
    function populateFields() {
      if ( this.signingOfficer == 'No' ) {
        this.identification = this.PersonalIdentification.create({});
        this.firstNameField = null;
        this.lastNameField = null;
        this.principalTypeField = 'Shareholder';
        this.jobTitleField = null;
        this.emailField = null;
        this.addressField = this.Address.create({});
        this.politicallyExposed = null;
        return;
      }
      this.identification = this.viewData.agent.identification ?
        this.viewData.agent.identification :
        this.PersonalIdentification.create({});
      this.firstNameField = this.viewData.agent.firstName;
      this.lastNameField = this.viewData.agent.lastName;
      this.principalTypeField = this.viewData.agent.principleType ?
        this.viewData.agent.principleType.trim() == '' :
        'Shareholder';
      this.jobTitleField = this.viewData.agent.jobTitle;
      this.phoneNumberField = this.viewData.agent.phone.number;
      this.emailField = this.viewData.agent.email;
      this.addressField = this.viewData.agent.address ?
        this.viewData.agent.address :
        this.Address.create({});
      this.politicallyExposed = this.viewData.agent.PEPHIORelated ? 'Yes' : 'No';
    }
  ],
  actions: [
    {
      name: 'addUsers',
      isEnabled: (signingOfficer) => signingOfficer === 'No',
      code: function() {
        this.menuDAO.find('sme.accountProfile.business-settings').then((menu) => {
          menu.handler.view.preSelectedTab = 'USER_MANAGEMENT_TAB';
          menu.launch();
        });
      }
    }
  ]
});
