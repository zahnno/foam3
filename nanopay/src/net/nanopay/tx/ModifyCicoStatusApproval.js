foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoStatusApproval',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Creates an approval request when a Cico transaction is created',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.ExpediteCICOApprovalRequest',
    'net.nanopay.tx.cico.CITransaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction ci = (CITransaction) obj;
        ExpediteCICOApprovalRequest req = new ExpediteCICOApprovalRequest.Builder(x)
          .setObjId(ci.getId())
          .setGroup("payment-ops")
          .setDescription("Main Summary txn: "+ci.getSummary()+" The Id of Summary txn: "+ci.getId())
          .build();

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            requestApproval(x, req);
          }
        }, "Expedite CICO Approval On Create");
      `
    }
  ]
});
