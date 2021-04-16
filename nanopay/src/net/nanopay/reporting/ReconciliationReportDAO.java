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

package net.nanopay.reporting;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;

import java.util.HashMap;
import java.util.Map;

public abstract class ReconciliationReportDAO extends ReportDAO {

  protected Map<String, CITransaction> ciMap = new HashMap<>();
  protected Map<String, COTransaction> coMap = new HashMap<>();
  protected Map<String, DigitalTransaction> dtMap = new HashMap<>();
  protected Map<String, ReconciliationReport> rrCache = new HashMap<>();

  abstract protected void refreshMaps(X x);

  protected String getRoot(X x, Transaction transaction) {
    var superX = x.put("subject", new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build());

    while( transaction != null && ! (transaction instanceof SummaryTransaction) ) {
      transaction = transaction.findRoot(superX);
    }

    if ( transaction == null )
      throw new RuntimeException("CI/CO/Digital Transaction missing SummaryTransaction root");

    return transaction.getId();
  }

  @Override
  public FObject find_(X x, Object id) {
    var st = (SummaryTransaction) getDelegate().find_(x, id);
    if ( st == null ) {
      throw new RuntimeException("Couldn't find matching Summary Transaction for Reconciliation Report " + id.toString());
    }

    var rr = rrCache.get(st.getId());
    if ( rr != null && ! rr.getLastModified().before(st.getLastModified()) ) {
      return rr;
    }

    var cit = ciMap.get(st.getId());
    var cot = coMap.get(st.getId());
    var dt = dtMap.get(st.getId());

    if ( cit == null || cot == null || dt == null ) {
      refreshMaps(x);
      cit = ciMap.get(st.getId());
      cot = coMap.get(st.getId());
      dt = dtMap.get(st.getId());
    }

    var g = (ReconciliationReportGenerator) x.get(generator);

    var report = g.generateReport(x, st, cit, cot, dt);
    rrCache.put(st.getId(), report);
    return report;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    refreshMaps(x);

    // This sink is used to filter the generated reconciliation reports
    var rrSink = decorateSink(x, sink, skip, limit, order, null);
    var nSink = new ReconciliationReportSink(x, generator, rrSink, ciMap, coMap, dtMap, rrCache);

    // This sink is used to filter the underlying SummaryTransaction dao
    var stSink = decorateSink(x, nSink, 0, MAX_SAFE_INTEGER, null, adaptPredicate(predicate));
    getDelegate().select(stSink);

    return sink;
  }

  public ReconciliationReportDAO(X x, DAO delegate, String generator) {
    super(x, delegate, generator);
  }
}
