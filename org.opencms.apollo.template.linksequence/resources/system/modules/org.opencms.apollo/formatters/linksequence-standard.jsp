<%@page
    buffer="none"
    session="false"
    trimDirectiveWhitespaces="true"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo" %>

<apollo:init-messages>

<cms:formatter var="content" val="value">
<fmt:setLocale value="${cms.locale}" />
<cms:bundle basename="org.opencms.apollo.template.linksequence.messages">

<apollo:linksequence
    wrapperclass="${cms.element.setting.linksequenceType} ${cms.element.setting.wrapperclass}"
    iconclass="${cms.element.setting.iconclass}"
    title="${content.value.Title}" 
    links="${content.valueList.LinkEntry}" 
/>

</cms:bundle>
</cms:formatter>

</apollo:init-messages>