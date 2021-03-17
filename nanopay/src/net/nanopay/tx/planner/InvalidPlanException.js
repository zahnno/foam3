/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'InvalidPlanException',
  package: 'net.nanopay.tx.planner',
  javaExtends: 'net.nanopay.tx.TransactionException',
  implements: ['foam.core.Exception'],
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaImports: [
    'foam.core.X'
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public InvalidPlanException() {
    super("Invalid plan");
  }

  public InvalidPlanException(X x) {
    super(x, "Invalid plan");
  }

  public InvalidPlanException(X x, Exception cause) {
    super(x, "Invalid plan", cause);
  }

  public InvalidPlanException(Exception cause) {
    super("Invalid plan", cause);
  }

  public InvalidPlanException(String message) {
    super(message);
  }

  public InvalidPlanException(String message, Exception cause) {
    super(message, cause);
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'getClientRethrowException',
      type: 'RuntimeException',
      javaCode: 'return this;'
    }
  ]
});
