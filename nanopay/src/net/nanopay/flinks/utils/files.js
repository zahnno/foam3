FOAM_FILES([
  //flinks front model(add all model)
  //{ name: 'net/nanopay/flinks/model/FlinksAccount'},
  //{ name: 'net/nanopay/flinks/model/FlinksRespMsg'},
  //
  { name: 'net/nanopay/flinks/model/FlinksCall'},
  { name: 'net/nanopay/flinks/model/FlinksRequest'},
  { name: 'net/nanopay/flinks/model/FlinksAuthRequest'},
  { name: 'net/nanopay/flinks/model/FlinksTransactionRequest'},
  { name: 'net/nanopay/flinks/model/FlinksAccountRequest'},
  { name: 'net/nanopay/flinks/model/FlinksAccountSummaryRequest'},
  { name: 'net/nanopay/flinks/model/RefreshDeltaModel'},
  { name: 'net/nanopay/flinks/model/FlinksAccountDetailRequest'},
  { name: 'net/nanopay/flinks/model/FlinksMulAuthRequest'},
  { name: 'net/nanopay/flinks/model/FlinksResponse'},
  { name: 'net/nanopay/flinks/model/SecurityChallengeModel'},
  { name: 'net/nanopay/flinks/model/LoginModel'},
  { name: 'net/nanopay/flinks/model/FlinksInvalidResponse'},
  { name: 'net/nanopay/flinks/model/FlinksMFAResponse'},
  { name: 'net/nanopay/flinks/model/BalanceModel'},
  { name: 'net/nanopay/flinks/model/AccountModel'},
  { name: 'net/nanopay/flinks/model/AddressModel'},
  { name: 'net/nanopay/flinks/model/HolderModel'},
  { name: 'net/nanopay/flinks/model/AccountTransactionModel'},
  { name: 'net/nanopay/flinks/model/AccountWithDetailModel'},
  { name: 'net/nanopay/flinks/model/AccountStatementModel'},
  { name: 'net/nanopay/flinks/model/AccountStatementContainerModel'},
  { name: 'net/nanopay/flinks/model/FlinksAccountsDetailResponse'},
  { name: 'net/nanopay/flinks/model/FlinksAccountsSummaryResponse'},
  //flinks service
  { name: 'net/nanopay/flinks/FlinksAuth'},
  { name: 'net/nanopay/flinks/ClientFlinksAuthService'},
  //flinks views
  { name: 'net/nanopay/flinks/view/FlinksView'},
  { name: 'net/nanopay/flinks/view/form/FlinksForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksInstitutionForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksAccountForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksConnectForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/element/AccountCard', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/element/CheckBoxes', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksSubHeader', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksMFAForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksDoneForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksThreeQA', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksThreeOptionForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksMultipleChoiceForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksXQuestionAnswerForm', flags: ['web'] },
  { name: 'net/nanopay/flinks/view/form/FlinksXSelectionAnswerForm', flags: ['web'] }
])
