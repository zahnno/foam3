foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],
  documentation: 'Updates user compliance according to approval.',
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],
  properties: [
    {
      name: 'objDaoKey',
      value: 'localUserDAO'
    }
  ],
  methods: [
    {
      name: 'updateObj',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj.fclone();
            user.setCompliance(
              ApprovalStatus.APPROVED == approvalStatus
                ? ComplianceStatus.PASSED
                : ComplianceStatus.FAILED);
            ((DAO) x.get(getObjDaoKey())).inX(x).put(user);
          }}, 
          "Setting compliance status");
      `
    }
  ]
});
