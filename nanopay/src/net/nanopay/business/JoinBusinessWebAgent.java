package net.nanopay.business;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.token.Token;
import foam.nanos.http.WebAgent;
import foam.nanos.notification.email.DAOResourceLoader;
import foam.nanos.notification.email.EmailTemplate;
import net.nanopay.model.Business;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.PrintWriter;
import java.util.Collections;
import java.util.Map;

import static foam.mlang.MLang.EQ;

/**
 * When an existing user is invited to join another business, they can click a
 * link in the email they get that brings them to this service. Then this
 * service will handle adding that user to the business.
 */
public class JoinBusinessWebAgent implements WebAgent {

  public EnvironmentConfiguration config_;

  @Override
  public void execute(X x) {
    String message;
    PrintWriter out = x.get(PrintWriter.class);
    JoinBusinessTokenService tokenService = (JoinBusinessTokenService) x.get("joinBusinessToken");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    String tokenUUID = request.getParameter("token");
    String redirect = request.getParameter("redirect");
    User user = null;

    try {
      // Look up the token.
      if ( tokenUUID == null || "".equals(tokenUUID) ) throw new Exception("Token not found.");
      DAO tokenDAO = (DAO) x.get("tokenDAO");
      Token token = (Token) tokenDAO.find(EQ(Token.DATA, tokenUUID));
      if ( token == null ) throw new Exception("Token not found.");

      // Look up the Business that the User is joining.
      Map<String, Object> parameters = token.getParameters();
      long businessId = (long) parameters.get("businessId");
      DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
      Business business = (Business) localBusinessDAO.inX(x).find(businessId);
      message = "You've been successfully added to " + business.label();

      // Look up the user.
      if ( token.getUserId() == 0 ) throw new Exception("User not found.");
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      user = (User) localUserDAO.inX(x).find(token.getUserId());
      if ( user == null ) throw new Exception("User not found.");

      // Check if the user has already joined the business.
      DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
      UserUserJunction dummy = new UserUserJunction.Builder(x)
        .setSourceId(token.getUserId())
        .setTargetId(businessId)
        .build();
      UserUserJunction junction = (UserUserJunction) agentJunctionDAO.inX(x).find(dummy);
      if ( junction != null ) throw new Exception("User has already been added to that business.");

      // Process the token.
      tokenService.processToken(x, user, tokenUUID);
    } catch (Throwable t) {
      message = "There was a problem adding you to the business.<br>" + t.getMessage();
    }

    if ( config_ == null ) {
      config_ = EnvironmentConfigurationBuilder
        .configuration()
        .resources()
        .resourceLoaders()
        .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, user.getGroup())))
        .and().and()
        .build();
    }

    EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(x, "join-business-splash-page", user.getGroup());
    JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config_);
    JtwigModel model = JtwigModel.newModel(Collections.singletonMap("msg", message));
    out.write(template.render(model));

    if ( ! redirect.equals("null") ) {
      try {
        response.addHeader("REFRESH", "2;URL=" + redirect);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}

