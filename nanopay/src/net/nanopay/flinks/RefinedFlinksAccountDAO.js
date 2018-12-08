foam.CLASS({
  package: 'net.nanopay.flinks',
  name: 'RefinedFlinksAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for refining bank account fields in Flinks
      AccountsDetail response.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.ArraySink',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'refinedFields',
      javaFactory: `
        return new String[] {
          "AccountNumber", "Balance", "Holder", "Title", "Transactions"
        };
      `,
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink refinedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject refined = refine(getX(), (FObject)obj);
              super.put(refined, sub);
            }
          };
          return super.select_(x, refinedSink.getDelegate(), skip, limit, order, predicate);
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject result = super.find_(x, id);

        if (result != null) {
          return refine(x, result);
        }
        return result;
      `
    },
    {
      name: 'refine',
      javaReturns: 'FlinksAccountsDetailResponse',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        FlinksAccountsDetailResponse result = (FlinksAccountsDetailResponse) obj.fclone();
        AccountWithDetailModel[] accounts = result.getAccounts();
        AuthService auth = (AuthService) x.get("auth");

        for (AccountWithDetailModel account : accounts) {
          for (String field : getRefinedFields()) {
            if (!auth.check(x, "AccountWithDetailModel.read." + field)) {
              reset(account, field);
            }
          }
        }
        return result;
      `
    },
    {
      name: 'reset',
      javaReturns: 'void',
      args: [
        { of: 'foam.core.FObject', name: 'obj' },
        { of: 'String', name: 'field' }
      ],
      javaCode: `
        PropertyInfo prop = (PropertyInfo) AccountWithDetailModel.getOwnClassInfo()
          .getAxiomByName(field);
        prop.set(obj, null);
      `
    }
  ]
});
