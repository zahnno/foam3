package net.nanopay.invoice;

import foam.core.ContextAwareSupport;
import foam.mlang.MLang;
import foam.dao.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.text.SimpleDateFormat;
import foam.core.FObject;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.BankAccount;
import net.nanopay.model.Account;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.service.BankAccountVerificationService;
import static foam.mlang.MLang.*;

public class ScheduleInvoiceCron
  extends    ContextAwareSupport
  {
    protected DAO    invoiceDAO_;
    protected DAO    localTransactionDAO_;
    protected DAO    bankAccountDAO_;
    protected DAO    standardCICOTransactionDAO_;
    protected BankAccountVerificationService bankAccountVerification;

    public void fetchInvoices() {
      try{
        System.out.println("Finding scheduled Invoices...");
        ListSink sink = (ListSink) invoiceDAO_.where(
          AND(
            EQ(Invoice.PAYMENT_ID, 0),
            EQ(Invoice.PAYMENT_METHOD, PaymentStatus.NONE),
            NEQ(Invoice.PAYMENT_DATE, null)
          )
        ).select(new ListSink());
          List invoiceList = sink.getData();
          if ( invoiceList.size() < 1 ) {
            System.out.println("No scheduled invoices found for today.");
            return;
          }
          for ( int i = 0; i < invoiceList.size(); i++ ) {
            try {
              Invoice invoice = (Invoice) invoiceList.get(i);
              SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
              Date invPaymentDate = invoice.getPaymentDate();
              System.out.println(dateFormat.format(invPaymentDate));
              System.out.println(dateFormat.format(new Date()));
              //Creates transaction only based on invoices scheduled for today.
              if( dateFormat.format(invPaymentDate).equals(dateFormat.format(new Date())) ){
                System.out.println("Scheduled Invoice for today found.");
                if ( invoice.getAccountId() != 0 ) {
                  cicoTransaction(invoice);
                } else {
                  sendValueTransaction(invoice);
                }
              }
            } catch ( Throwable e) {
              e.printStackTrace();
            }
          }
          System.out.println("Cron Completed.");
        } catch ( Throwable e ) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    public void cicoTransaction(Invoice invoice){
      try {
        BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(invoice.getAccountId());

        //Create cash in transaction.
        Transaction cashInTransaction = new Transaction();
        int invAmount = Math.round(invoice.getAmount());
        cashInTransaction.setPayeeId((Long) invoice.getPayeeId());
        cashInTransaction.setPayeeId((Long) invoice.getPayeeId());
        cashInTransaction.setAmount(invAmount);
        cashInTransaction.setInvoiceId(invoice.getId());
        cashInTransaction.setBankAccountId(invoice.getAccountId());
        cashInTransaction.setType(TransactionType.CASHIN);

        try {
          Transaction cicoTransaction = (Transaction) standardCICOTransactionDAO_.put(cashInTransaction);
          System.out.println("Starting cash in process...");
        } catch (Throwable e) {
          e.printStackTrace();
          return;
        }
        
        sendValueTransaction(invoice);

      } catch (Throwable e) {
        e.printStackTrace();
      }
    }

    public void sendValueTransaction(Invoice invoice){
      System.out.println("Starting payment process...");
      try {
        Transaction transaction = new Transaction();
        int invAmount = Math.round(invoice.getAmount());
        transaction.setPayeeId((Long) invoice.getPayeeId());
        transaction.setPayerId((Long) invoice.getPayerId());
        transaction.setInvoiceId(invoice.getId());
        transaction.setAmount(invAmount);
        try {
          Transaction completedTransaction = (Transaction) localTransactionDAO_.put(transaction);
          invoice.setPaymentId(completedTransaction.getId());
          invoice.setPaymentDate((Date) new Date());
          invoiceDAO_.put(invoice);
          // Checks to see if cico transaction and sets cashout.
          if(invoice.getAccountId() != 0) {
            completedTransaction.setBankAccountId(invoice.getAccountId());
            completedTransaction.setInvoiceId(invoice.getId());
            bankAccountVerification.addCashout(completedTransaction);
            System.out.println("Schedule CICO Transaction Completed.");
          } else {
            System.out.println("Schedule Transaction Completed.");
          }
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }

      } catch ( Throwable e ){
        e.printStackTrace();
      }
    }

    public void start() {
      System.out.println("Scheduled payments on Invoice Cron Starting...");
      localTransactionDAO_ = (DAO) getX().get("localTransactionDAO");
      invoiceDAO_     = (DAO) getX().get("invoiceDAO");
      bankAccountDAO_     = (DAO) getX().get("bankAccountDAO");
      standardCICOTransactionDAO_ = (DAO) getX().get("standardCICOTransactionDAO");
      bankAccountVerification = (BankAccountVerificationService) getX().get("bankAccountVerification");
      System.out.println("DAO's fetched...");
      fetchInvoices();
    }
  }
