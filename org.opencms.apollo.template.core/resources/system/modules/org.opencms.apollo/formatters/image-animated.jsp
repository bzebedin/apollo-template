<%@page
    buffer="none"
    session="false"
    trimDirectiveWhitespaces="true"%>

<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo" %>

<fmt:setLocale value="${cms.locale}" />
<cms:bundle basename="org.opencms.apollo.template.schemas.section">
<cms:formatter var="content" val="value" rdfa="rdfa">

<c:set var="inMemoryMessage"><fmt:message key="apollo.section.message.new" /></c:set>
<apollo:init-messages textnew="${inMemoryMessage}">

<div class="ap-section-animated ${cms.element.setting.cssclass.value}">

    <apollo:image-animated
        image="${value.Image}"
        shadowanimation="${fn:contains(cms.element.setting.ieffect.value, 'shadow')}"
        kenburnsanimation="${fn:contains(cms.element.setting.ieffect.value, 'kenburn')}">

        <c:if test="${content.value.Link.isSet and cms.element.setting.ilink.value == 'image'}">
            <div class="link">
                <apollo:link 
                    link="${value.Link}" 
                    cssclass="btn btn-xs btn-animated" />
            </div>
        </c:if>

        <c:if test="${fn:contains(cms.element.setting.itext.value, 'copy') and not empty imageCopyright}">
            <div class="copyright">
                <i>${imageCopyright}</i>
            </div>
        </c:if>

        <c:if test="${fn:contains(cms.element.setting.itext.value, 'title')}">
            <h3 class="subtitle">
                <apollo:link link="${value.Link}">
                    ${not empty imageTitle ? imageTitle : value.Headline}
                </apollo:link>
            </h3>
        </c:if>

    </apollo:image-animated>
</div>

</apollo:init-messages>

</cms:formatter>
</cms:bundle>