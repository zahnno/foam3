/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.settings;

import static foam.mlang.MLang.EQ;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.HtmlDoc;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;

public class TermsAndConditionsWebAgent
        implements WebAgent {

  @Override
  public void execute(X x) {
    HttpServletRequest  request  = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    DAO                 tcDAO    = (DAO) x.get("htmlDocDAO");
    String              version  = request.getParameter("version");
    HtmlDoc             terms;
    PrintWriter         out      = null;

    // Query to get latest terms and conditions based on the effective date
    tcDAO = tcDAO.limit(1).orderBy(HtmlDoc.ISSUED_DATE);
    OutputStreamWriter osw = null;
    try {
      osw = new OutputStreamWriter(response.getOutputStream(), StandardCharsets.ISO_8859_1);
      out = new PrintWriter(osw, true);
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      IOUtils.closeQuietly(osw);
      IOUtils.closeQuietly(out);
    }

    if ( SafetyUtil.isEmpty(version) ) {
      ArraySink listSink = (ArraySink) tcDAO.orderBy(new foam.mlang.order.Desc(HtmlDoc.ID)).limit(1).select(new ArraySink());

      terms = (HtmlDoc) listSink.getArray().get(0);
    } else {
      terms = (HtmlDoc) tcDAO.find(EQ(HtmlDoc.ID,Long.valueOf(version)));
    }
    out.println(terms.getBody());
  }
}

