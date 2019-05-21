/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;


import foam.dao.DAO;
import foam.dao.ReadOnlyDAO;

public class ReadOnlyDAOContext
  extends ProxyX {

  public ReadOnlyDAOContext(X x) {
    super(x);
  }

    @Override
    public Object get(Object name) {
      Object ret =  getX().get(this, name);
      if ( ret instanceof DAO ) {
        return new ReadOnlyDAO.Builder(x_).setDelegate((DAO)ret).build();
      }
      return ret;
    }
}
