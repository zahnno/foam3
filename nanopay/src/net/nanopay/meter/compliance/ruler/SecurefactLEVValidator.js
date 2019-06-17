foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'SecurefactLEVValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Validates a business using SecureFact LEV api.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          LEVResponse response = securefactService.levSearch(x, business);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.hasCloseMatches() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            requestApproval(x,
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(Long.toString(business.getId()))
                .setDaoKey("localUserDAO")
                .setCauseId(response.getId())
                .setCauseDaoKey("securefactLEVDAO")
                .setClassification("Validate Business Using SecureFact")
                .build()
            );
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("LEVValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";`
    }
  ]
});
