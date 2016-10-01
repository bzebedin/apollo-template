<%@page buffer="none" session="false" trimDirectiveWhitespaces="true"%>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo" %>

<fmt:setLocale value="${cms.locale}" />
<cms:bundle basename="org.opencms.apollo.template.formatters.list">
    <cms:formatter var="con" rdfa="rdfa">

        <div class="ap-list-content">
            <c:set var="textnew"><fmt:message key="apollo.list.message.new" /></c:set>
            <c:set var="textedit"><fmt:message key="apollo.list.message.edit" /></c:set>
            <apollo:init-messages textnew="${textnew}" textedit="${textedit}">

                <%-- ####### Headline ######## --%>
                <c:if test="${not cms.element.settings.hidetitle && con.value.Headline.isSet}">
                    <div class="headline headline-md">
                        <h2 ${rdfa.Headline}>
                            <c:out value="${con.value.Headline}" escapeXml="false" />
                        </h2>
                    </div>
                </c:if>

                <jsp:useBean id="parameters" class="java.util.HashMap" />
                <c:forEach var="parameter" items="${con.valueList.Parameters}">
                    <c:set target="${parameters}" property="${parameter.value.Key.stringValue}" value="${parameter.value.Value.stringValue}"/>
                </c:forEach>

                <%--
                <div>
                    <c:forEach var="parameter" items="${paramMap}">
                        <h2>${parameter.key}=${parameter.value}</h2>
                    </c:forEach>
                </div>
                --%>

                <c:set var="wrapperclass" value="${parameters.csswrapper}" />

                <div ${not empty wrapperclass ? 'class="'.concat(wrapperclass).concat('"')  : '' } id="list-${cms.element.instanceId}">

                    <%-- ####### List entries ######## --%>
                    <apollo:list-main-new 
                        source="${con.value.Folder}"
                        types="${con.value.TypesToCollect}"
                        sort="${con.value.SortOrder}"
                        count="${con.value.ItemsPerPage.isSet ? con.value.ItemsPerPage.toInteger : 5}" 
                        listid="${cms.element.instanceId}"
                        categories="${con.readCategories}" 
                        showexpired="${true eq cms.element.settings.showexpired}"
                        parameters="${parameters}"
                    />

                    <%-- ####### Create and edit new entries if empty result ######## --%>
                    <c:if test="${search.numFound == 0}">
                        <c:set var="createType">${fn:substringBefore(con.value.TypesToCollect.stringValue, ':')}</c:set>
                        <cms:edit createType="${createType}" create="true" >
                            <div class="alert alert-warning fade in">
                                <h3><fmt:message key="apollo.list.message.empty" /></h3>
                                <div><fmt:message key="apollo.list.message.newentry" /></div>
                            </div>
                        </cms:edit>
                    </c:if>

                </div>

                <c:if test="${con.value.Link.exists}">
                    <div class="bo-grey-light bo-top-1 bo-top-dotted ph-0">
                        <apollo:link link="${con.value.Link}" cssclass="btn ap-btn-${cms.element.settings.buttoncolor} ap-btn-sm" settitle="false"/>
                    </div>
                </c:if>    

            </apollo:init-messages>

        </div>

    </cms:formatter>

</cms:bundle>