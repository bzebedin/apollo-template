<%@page buffer="none" session="false" trimDirectiveWhitespaces="true"%>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo"%>

<cms:secureparams />
<fmt:setLocale value="${cms.locale}" />

<cms:formatter var="content" val="value">

<cms:bundle basename="org.opencms.apollo.template.schemas.blog">
<c:set var="inMemoryMessage"><fmt:message key="apollo.blog.message.edit" /></c:set>
<apollo:init-messages textnew="${inMemoryMessage}">

    <div class="row ${cms.element.settings.cssWrapper} ap-sec">
        <c:set var="paragraph" value="${content.valueList.Paragraph['0']}" />
        <c:set var="teaserLength" value="${cms.element.settings.teaserlength}" />
        <c:set var="buttonColor" value="${cms.element.settings.buttoncolor}" />
        <c:set var="displayOption" value="${cms.element.settings.compactform}" />
        <c:set var="showDate" value="${cms.element.settings.showdate}" />
        <c:set var="showImage" value="${paragraph.value.Image.exists && (displayOption != 'true')}" />

        <c:choose>
            <c:when test="${paragraph.value.Image.exists && (displayOption == 'false')}">
                <c:set var='imgDivStart' value='<div class="col-md-4 search-img">' />
                <c:set var='imgDivCenter' value='</div><div class="col-md-8">' />
                <c:set var='imgDivEnd' value='</div>' />
            </c:when>
            <c:when test="${paragraph.value.Image.exists && (displayOption == 'big')}">
                <c:set var='imgDivStart' value='<div class="col-xs-12"><div class="search-img">' />
                <c:set var='imgDivCenter' value='</div><div>' />
                <c:set var='imgDivEnd' value='</div></div>' />
            </c:when>
            <c:otherwise>
                <c:set var='imgDivStart' value='' />
                <c:set var='imgDivCenter' value='<div class="col-xs-12">' />
                <c:set var='imgDivEnd' value='</div>' />
            </c:otherwise>
        </c:choose>

        <c:if test="${showImage}">
            <c:out value="${imgDivStart}" escapeXml="false" />

            <c:set var="imgLink"><cms:link baseUri="${cms.element.settings.pageUri}">${content.filename}</cms:link></c:set>
            <a href="${imgLink}"><apollo:image-simple onlyimage="true" image="${paragraph.value.Image}" /></a>
        </c:if>

        <c:out value="${imgDivCenter}" escapeXml="false" />

            <c:set var="href"><cms:link baseUri="${cms.element.settings.pageUri}">${content.filename}</cms:link></c:set>
            <c:set var="text">${content.value.Teaser}</c:set>
            <c:if test="${empty text}"><c:set var="text">${cms:trimToSize(cms:stripHtml(paragraph.value.Text), teaserLength)}</c:set></c:if>

            <c:set var="buttonText"><fmt:message key="apollo.blog.message.readmore" /></c:set>

            <apollo:teaserbody
                text="${text}"
                textlength="${teaserLength}"
                title="${content.value.Title}"
                href="${href}" 
                date="${content.value.Date}"
                showdate="${showDate}"
                color="${buttonColor}"
                btntext="${buttonText}"
            />

        <c:out value="${imgDivEnd}" escapeXml="false" />

    </div>
    
</apollo:init-messages>

</cms:bundle>
</cms:formatter>
