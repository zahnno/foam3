/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DigitalBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for digital to bank where the owners differ`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        if ( requestTxn.getType().equals("Transaction") ) {
          txn = new SummaryTransaction(x);
          txn.copyFrom(requestTxn);
        } else {
          txn = (Transaction) requestTxn.fclone();
        }

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);

        Account destinationAccount = quote.getDestinationAccount();
        foam.nanos.auth.User bankOwner = destinationAccount.findOwner(x);

        DAO dao = (DAO) x.get("localAccountDAO");

        List digitals = ((ArraySink) dao.where(
          AND(
            EQ(Account.OWNER, destinationAccount.getOwner()),
            CLASS_OF(DigitalAccount.class)
            //TODO also add spid check
          )).select(new ArraySink())).getArray();

        for ( Object obj : digitals ) {
          Account digital = (DigitalAccount) obj;
          // Split 1: Adigital -> BDigital
          Transaction digitalTxn = new Transaction();
          digitalTxn.copyFrom(requestTxn);
          digitalTxn.setDestinationAccount(digital.getId());
          Transaction[] Ds = multiQuoteTxn(x, digitalTxn, quote);


          for ( Transaction tx1 : Ds ) {
            // Split 2: BDigital -> BBank
            Transaction co = new Transaction();
            co.copyFrom(requestTxn);
            co.setSourceAccount(digital.getId());
            co.setAmount(tx1.getTotal(x, tx1.getDestinationAccount()));
            Transaction[] COs = multiQuoteTxn(x, co, quote, false);
            for ( Transaction tx2 : COs ) {
              Transaction Digital = (Transaction) tx1.fclone();
              Digital.addNext((Transaction) tx2.fclone());
              Digital.setPlanCost(Digital.getPlanCost() + tx2.getPlanCost());
              Transaction t = (Transaction) txn.fclone();
              t.addNext(Digital);
              quote.getAlternatePlans_().add(t);
            }
          }
        }
        return null;
      `
    },
  ]
});
