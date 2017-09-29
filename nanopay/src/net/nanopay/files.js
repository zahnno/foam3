FOAM_FILES([
  { name: 'net/nanopay/client/Client' },
  { name: 'net/nanopay/dao/crypto/EncryptedObject' },
  { name: 'net/nanopay/model/Account' },
  { name: 'net/nanopay/model/AccountInfo' },
  { name: 'net/nanopay/model/AccountLimit' },
  { name: 'net/nanopay/model/Bank' },
  { name: 'net/nanopay/model/BankAccountInfo' },
  { name: 'net/nanopay/model/Currency' },
  { name: 'net/nanopay/model/BusinessSector' },
  { name: 'net/nanopay/model/BusinessType' },
  { name: 'net/nanopay/model/PadAccount' },
  { name: 'net/nanopay/model/Phone' },
  { name: 'net/nanopay/model/User' },
  { name: 'net/nanopay/model/UserAccountInfo' },
  { name: 'net/nanopay/ui/wizard/WizardView', flags: ['web'] },
  { name: 'net/nanopay/auth/ui/SignInView' , flags: ['web']},
  { name: 'net/nanopay/ui/wizard/WizardOverview', flags: ['web'] },
  { name: 'net/nanopay/ui/wizard/WizardSubView', flags: ['web'] },
  { name: 'net/nanopay/ui/NotificationActionCard', flags: ['web'] },
  { name: 'net/nanopay/ui/ContentCard', flags: ['web'] },
  { name: 'net/nanopay/ui/RadioView', flags: ['web'] },
  { name: 'net/nanopay/ui/ToggleSwitch', flags: ['web'] },

  // fx
  { name: 'net/nanopay/fx/model/ExchangeRate' },
  { name: 'net/nanopay/fx/model/ExchangeRateQuote' },
  { name: 'net/nanopay/fx/ExchangeRateInterface' },
  { name: 'net/nanopay/fx/client/ClientExchangeRateService' },
  { name: 'net/nanopay/fx/client/Client' },

  // retail
  { name: 'net/nanopay/retail/client/Client' },
  { name: 'net/nanopay/retail/model/DeviceStatus' },
  { name: 'net/nanopay/retail/model/Device' },
  { name: 'net/nanopay/retail/ui/DeviceCTACard', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/BankCTACard', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/DevicesView', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceNameForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceTypeForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceSerialForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DevicePasswordForm', flags: ['web'] },

  // tx
  { name: 'net/nanopay/tx/model/TransactionPurpose' },
  { name: 'net/nanopay/tx/model/TransactionLimitTimeFrame' },
  { name: 'net/nanopay/tx/model/TransactionLimitType' },
  { name: 'net/nanopay/tx/model/TransactionLimit' },
  { name: 'net/nanopay/tx/model/Transaction' },
  { name: 'net/nanopay/tx/model/Fee' },
  { name: 'net/nanopay/tx/model/FixedFee' },
  { name: 'net/nanopay/tx/model/PercentageFee' },
  { name: 'net/nanopay/tx/client/Client' },
  { name: 'net/nanopay/model/Broker' },

  { name: 'net/nanopay/util/ChallengeGenerator' },

  // cico
  { name: 'net/nanopay/cico/model/ServiceProvider' },
  { name: 'net/nanopay/cico/model/TransactionStatus' },
  { name: 'net/nanopay/cico/model/TransactionType' },
  { name: 'net/nanopay/cico/model/Transaction' },
  { name: 'net/nanopay/cico/ui/CicoView'},
  { name: 'net/nanopay/cico/spi/alterna/AlternaFormat' },

  // invoice
  { name: 'net/nanopay/invoice/model/Invoice'},
  { name: 'net/nanopay/invoice/dao/Dao'},
  { name: 'net/nanopay/invoice/ui/ExpensesView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SalesView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/InvoiceDashboardView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/PayableSummaryView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/ReceivableSummaryView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/MentionsView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SummaryCard', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/shared/ActionInterfaceButton', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/shared/SingleItemView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/BillDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/InvoiceDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/ExpensesDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SalesDetailView', flags: ['web'] },

  // style
  { name: 'net/nanopay/invoice/ui/styles/InvoiceStyles'},
  { name: 'net/nanopay/ui/modal/ModalStyling', flags: ['web'] },
  { name: 'net/nanopay/ui/styles/AppStyles', flags: ['web'] },

  // modal
  { name: 'net/nanopay/invoice/ui/modal/ApproveModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/DisputeModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/PayNowModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/ScheduleModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/RecordPaymentModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/SingleResolutionModal', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/EmailModal', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/ModalHeader', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/ConfirmCashInModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/ConfirmCashOutModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/CashInModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/CashOutModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/CashInSuccessModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/CashOutSuccessModal', flags: ['web'] },

  //misc
  { name: 'net/nanopay/TempMenu' },

  //util
  { name: 'net/nanopay/util/CurrencyFormatter' },

  //ui
  { name: 'net/nanopay/ui/topNavigation/TopNav', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/BusinessLogoView', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/UserTopNavView', flags: ['web'] },
  { name: 'net/nanopay/ui/FooterView', flags: ['web'] },
  { name: 'net/nanopay/ui/ActionButton', flags: ['web'] },
  { name: 'net/nanopay/ui/Placeholder', flags: ['web'] },
  { name: 'net/nanopay/ui/TransferView', flags: ['web'] },
  { name: 'net/nanopay/ui/ActionView', flags: ['web'] },
  { name: 'net/nanopay/ui/Controller', flags: ['web'] },
  { name: 'net/nanopay/model/Relationships', flags: ['web'] }
]);
