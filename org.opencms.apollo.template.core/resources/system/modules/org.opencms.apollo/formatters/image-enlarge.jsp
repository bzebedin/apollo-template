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

<apollo:image-vars image="${content.value.Image}">
    <c:choose>
        <c:when test="${empty imageLink}">
            <div class="alert">
                <fmt:message key="apollo.section.message.noimage" />
            </div>
        </c:when>
        <c:otherwise>

            <c:set var="showsubtitle" value="${cms.element.setting.showsubtitle.value and (value.Headline.isSet or not empty imageTitle)}"/>
            <c:set var="showtext" value="${cms.element.setting.showtext.value and value.Text.isSet}"/>

            <div class="ap-sec ap-image-zoom ${cms.element.settings.wrapperclass}">

                <apollo:image-zoom 
                    image="${content.value.Image}"
                    headline="${content.value.Headline}" />

                <c:if test="${cms.element.setting.showcopyright.value and not empty imageCopyright}">
                    <div class="copyright">
                        <div>${imageCopyright}</div>
                    </div>
                </c:if>

                <c:if test="${showsubtitle or showtext}">
                    <div class="text-box">

                        <c:if test="${showsubtitle}">
                            <h3 class="subtitle">
                                <apollo:link link="${value.Link}">
                                    ${not empty imageTitle ? imageTitle : value.Headline}
                                </apollo:link>
                            </h3>
                        </c:if>

                        <c:if test="${showtext}">
                            <div class="text">
                                ${value.Text}
                            </div>
                        </c:if>
                    </div>
                </c:if>

            </div>
        </c:otherwise>
    </c:choose>
</apollo:image-vars>

</apollo:init-messages>

</cms:formatter>
</cms:bundle>
