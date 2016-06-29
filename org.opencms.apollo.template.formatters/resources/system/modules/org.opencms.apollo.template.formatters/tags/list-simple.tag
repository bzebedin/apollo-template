<%@ tag display-name="list-simple"
  trimDirectiveWhitespaces="true" 
  body-content="empty"
  description="Searches for resources and displays a variable amount." %>

<%@ attribute name="source" type="org.opencms.jsp.util.CmsJspContentAccessValueWrapper" required="true" %>
<%@ attribute name="types" type="org.opencms.jsp.util.CmsJspContentAccessValueWrapper" required="true" %>
<%@ attribute name="categories" type="org.opencms.jsp.util.CmsJspCategoryAccessBean" required="false" %>
<%@ attribute name="showfacets" type="java.lang.Boolean" required="false" %>
<%@ attribute name="count" type="java.lang.Integer" required="false" %>
<%@ attribute name="showexpired" type="java.lang.Boolean" required="false" %>
<%@ attribute name="color" type="java.lang.String" required="false" %>
<%@ attribute name="teaserlength" type="java.lang.Integer" required="false" %>

<%@ variable name-given="search" scope="AT_END" declare="true" variable-class="org.opencms.jsp.search.result.I_CmsSearchResultWrapper" %>
<%@ variable name-given="searchConfig" scope="AT_END" declare="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo" %>


<%-- ####### Search items ################ --%>

<apollo:list-search source="${source}" types="${types}" count="${count}" showexpired="${showexpired}" />

<c:if test="${search.numFound > 0}">

<c:set var="buttonColor" value="red" />
<c:if test="${not empty color}">
	<c:set var="buttonColor" value="${color}" />
</c:if>

<%-- ####### The facet filters ######## --%>

	<c:if test="${showfacets}">
		<apollo:list-facetrow searchresult="${search}" color="${buttonColor}" />
	</c:if>

<%-- ####### Elements of the list ######## --%>

	<c:forEach var="result" items="${search.searchResults}">
		<div class="list-entry">
			<cms:display value="${result.xmlContent.filename}" displayFormatters="${types}" editable="true" create="true" delete="true">
				<cms:param name="teaserlength" value="${teaserlength}" />
				<cms:param name="buttoncolor">${buttonColor}</cms:param>
				<cms:param name="calendarcolor">${buttonColor}</cms:param>
				<cms:param name="showexpired">${showexpired}</cms:param>
				<cms:param name="index">${status.index}</cms:param>
				<cms:param name="last">${status.last}</cms:param>
			</cms:display>
		</div>
	</c:forEach>
	
</c:if>