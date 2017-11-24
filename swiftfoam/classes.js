global.FOAM_FLAGS.src = __dirname + '/../nanopay/src/';
require(__dirname + '/../nanopay/src/net/nanopay/files.js');

var classes = [
  'MintChipClient',
  'net.nanopay.cico.model.TransactionStatus',
  'net.nanopay.cico.model.TransactionType',
  'MintChipSession',
  'TransactionRow',
  'TransactionRowIBView',
  'foam.swift.ui.FOAMUILabel',
  'foam.swift.ui.DAOTableViewSource',

  'foam.blob.Blob',
  'foam.box.Box',
  'foam.box.LogBox',
  'foam.box.BoxRegistry',
  'foam.box.BoxService',
  'foam.box.ClientBoxRegistry',
  'foam.box.Context',
  'foam.box.HTTPBox',
  'foam.box.Message',
  'foam.box.ProxyBox',
  'foam.box.RPCMessage',
  'foam.box.RemoteException',
  'foam.box.ReplyBox',
  'foam.box.SessionClientBox',
  'foam.box.swift.FileBox',
  'foam.log.LogLevel',
  'foam.dao.ArraySink',
  'foam.dao.ClientDAO',
  'foam.mlang.Constant',
  'foam.mlang.Expr',
  'foam.mlang.predicate.Eq',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.Hours',
  'foam.nanos.auth.DayOfWeek',
  'foam.nanos.auth.AuthService',
  'foam.nanos.auth.ClientAuthService',
  'foam.nanos.auth.Country',
  'foam.nanos.auth.EnabledAware',
  'foam.nanos.auth.Language',
  'foam.nanos.auth.LastModifiedAware',
  'foam.nanos.auth.LastModifiedByAware',
  'foam.nanos.auth.Phone',
  'foam.nanos.auth.Region',
  'foam.nanos.auth.User',
  'foam.swift.box.RPCReturnBox',
  'foam.swift.parse.StringPStream',
  'foam.swift.parse.json.output.Outputter',
  'foam.swift.ui.DAOTableViewSource',
  'foam.swift.ui.DetailView',
  'foam.u2.Visibility',
  'net.nanopay.auth.email.EmailTokenService',
  'net.nanopay.auth.password.ResetPasswordTokenService',
  'net.nanopay.auth.sms.AuthyTokenService',
  'net.nanopay.auth.token.ClientTokenService',
  'net.nanopay.auth.token.Token',
  'net.nanopay.auth.token.TokenService',
  'net.nanopay.model.Account',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.client.ClientUserTransactionLimitService',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionLimitTimeFrame',
  'net.nanopay.tx.model.TransactionLimitType',
  'net.nanopay.tx.model.TransactionPurpose'
];

module.exports = {
  classes: classes,
}
