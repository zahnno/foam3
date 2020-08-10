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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SummaryTransactionLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'lineItems',
      hidden: true
    },
    {
      class: 'String',
      name: 'summaryType',
      hidden: true
    },
    {
      name: 'id',
      visibility: 'HIDDEN'
    },
    {
      name: 'type',
      visibility: 'HIDDEN'
    },
    {
      name: 'group',
      visibility: 'HIDDEN'
    },
    {
      name: 'amount',
      visibility: 'HIDDEN'
    },
    {
      name: 'note',
      visibility: 'HIDDEN'
    },
    {
      name: 'reversable',
      hidden: true
    }
  ],

});
