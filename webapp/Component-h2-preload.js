/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine('i2d/eam/pmnotification/create/zeamntfcres1/Component', ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants", "sap/ui/core/UIComponent", "sap/ui/model/resource/ResourceModel", "i2d/eam/pmnotification/create/zeamntfcres1/model/models", "sap/ui/Device", "i2d/eam/pmnotification/create/zeamntfcres1/controller/ErrorHandler"], function (C, U, R, m, D, E) {
    "use strict";
    return U.extend("i2d.eam.pmnotification.create.zeamntfcres1.Component", {
        metadata: {
            manifest: "json",
            "includes": ["css/style.css"]
        },
        oRootView: null,
        init: function () {
            this.getModel().setDeferredGroups([C.GENERAL.NOTIFICATION_BATCH_GROUP, "*"]);
            this.getModel().setChangeGroups({
                "NotificationHeader": {
                    groupId: C.GENERAL.NOTIFICATION_BATCH_GROUP,
                    changeSetId: C.GENERAL.NOTIFICATION_CHANGE_SET,
                    single: false
                },
                "LongText": {
                    groupId: C.GENERAL.NOTIFICATION_BATCH_GROUP,
                    changeSetId: C.GENERAL.NOTIFICATION_CHANGE_SET,
                    single: false
                },
                "*": {
                    groupId: "*",
                    single: true
                }
            });
            this.setModel(m.createDeviceModel(), C.MODEL.DEVICE_MODEL.NAME);
            this.setModel(m.createAppModel(), C.MODEL.APP_MODEL.NAME);
            this._oErrorHandler = new E(this);
            U.prototype.init.apply(this, arguments);
            this._extractStartupParameters();
            this.getRouter().initialize();
        },
        createContent: function () {
            this.oRootView = U.prototype.createContent.apply(this, arguments);
            this.oRootView.addStyleClass(this.getCompactCozyClass());
            return this.oRootView;
        },
        getCompactCozyClass: function () {
            if (!this._sCompactCozyClass) {
                this._sCompactCozyClass = "sapUiSizeCozy";
            }
            return this._sCompactCozyClass;
        },
        _extractStartupParameters: function () {
            var c = this.getComponentData();
            var n = null;
            var p = false;
            var N = C.ROUTES.DISPLAY;
            var i = "sap-iapp-state";
            var r = new RegExp("[\?&]" + i + "=([^&]+)");
            var I = "";
            var h = sap.ui.core.routing.HashChanger.getInstance();
            var H = h.getHash();
            if (r.test(H)) {
                I = r.exec(H)[0];
            }
            if (c && c.startupParameters && jQuery.isArray(c.startupParameters.navTarget) && c.startupParameters.navTarget.length > 0 && H === "") {
                N = c.startupParameters.navTarget;
                p = true;
            }
            if (c && c.startupParameters && c.startupParameters.notificationNumber) {
                n = c.startupParameters.notificationNumber[0];
                p = true;
            }
            if (c && c.startupParameters && c.startupParameters.MaintenanceNotification) {
                n = c.startupParameters.MaintenanceNotification[0];
                N = C.ROUTES.DISPLAY;
                p = true;
            }
            if (p) {
                var u = this.getRouter().getURL(N, n ? {
                    NotificationNumber: n
                }
                         : {});
                u = u + I;
                this.getModel(C.MODEL.APP_MODEL.NAME).setProperty(C.MODEL.APP_MODEL.PROPERTIES.IS_STARTUP_CREATE, false);
                if (u) {
                    h.replaceHash(u);
                }
            } else {
                u = h.getHash();
                if (u === "") {
                    N = C.ROUTES.CREATE;
                    u = this.getRouter().getURL(N);
                    h.replaceHash(u);
                }
            }
        }
    });
});
sap.ui.require.preload({
    "i2d/eam/pmnotification/create/zeamntfcres1/manifest.json": '{"_version":"1.7.0","sap.app":{"_version":"1.2.0","id":"i2d.eam.pmnotification.create.zeamntfcres1","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"9.0.1"},"title":"{{TILE_TITLE_CREATE}}","tags":{"keywords":["{{Create}}"]},"ach":"PM-FIO","dataSources":{"EAM_NTF_CREATE":{"uri":"/sap/opu/odata/sap/EAM_NTF_CREATE/","settings":{"localUri":"localService/metadata.xml","annotations":["annotation"]}},"annotation":{"type":"ODataAnnotation","uri":"annotation/annotation.xml","settings":{"localUri":"annotation/annotation.xml"}}},"resources":"resources.json","crossNavigation":{"inbounds":{"MaintenanceNotificationCreate":{"semanticObject":"MaintenanceNotification","action":"create_simple","title":"{{TILE_TITLE_CREATE}}","signature":{"parameters":{"navTarget":{"defaultValue":{"value":"create"},"required":false},"NotificationType":{"required":false},"TechnicalObjectLabel":{"required":false},"TechObjIsEquipOrFuncnlLoc":{"required":false},"MaintenanceObject":{"required":false,"renameTo":"TechnicalObjectLabel"},"sap-iapp-state":{"required":false}},"additionalParameters":"ignored"}},"MaintenanceNotificationList":{"semanticObject":"MaintenanceNotification","action":"list_simple","title":"{{TILE_TITLE_LIST}}","signature":{"parameters":{"navTarget":{"filter":{"value":"list"},"required":true},"MaintenanceNotification":{"required":false},"sap-iapp-state":{"required":false}},"additionalParameters":"ignored"}}}},"destination":{"name":""}},"sap.ui":{"_version":"1.1.0","technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_bluecrystal","sap_belize"]},"sap.ui5":{"_version":"1.1.0","config":{"sapFiori2Adaptation":true},"contentDensities":{"compact":true,"cozy":true},"services":{"ShellUIService":{"factoryName":"sap.ushell.ui5service.ShellUIService"}},"dependencies":{"minUI5Version":"1.90.2","libs":{"sap.m":{"lazy":false},"sap.me":{"lazy":true},"sap.ushell":{"lazy":false},"sap.i2d.eam.lib.pmnotification.s1":{"lazy":false},"sap.ui.layout":{"lazy":false},"sap.ui.table":{"lazy":true},"sap.ui.comp":{"lazy":true},"sap.suite.ui.commons":{"lazy":true},"sap.ui.unified":{"lazy":false}},"components":{"sap.se.mi.plm.lib.attachmentservice.attachment":{"lazy":true}}},"componentUsages":{"attachmentReuseComponent":{"name":"sap.se.mi.plm.lib.attachmentservice.attachment","settings":{"lazy":true}}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"":{"dataSource":"EAM_NTF_CREATE","preload":true,"settings":{"defaultBindingMode":"TwoWay","defaultCountMode":"Inline","defaultUpdateMethod":"PUT","loadMetadataAsync":false}},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"}},"rootView":{"viewName":"i2d.eam.pmnotification.create.zeamntfcres1.view.App","type":"XML","async":true},"handleValidation":true,"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","viewPath":"i2d.eam.pmnotification.create.zeamntfcres1.view","controlId":"fioriContent","controlAggregation":"pages","bypassed":{"target":"notFound"},"clearAggregation":false,"async":true},"routes":[{"pattern":"Create:?iAppState:","name":"create","target":"create"},{"pattern":"Edit/{NotificationNumber}:?iAppState:","name":"edit","target":"edit"},{"pattern":"Display/{NotificationNumber}","name":"display","target":"display"},{"pattern":"List:?iAppState:","name":"list","target":"list"}],"targets":{"create":{"viewName":"S1","viewId":"create","viewLevel":1},"edit":{"viewName":"S2","viewId":"edit","viewLevel":4},"display":{"viewName":"S3","viewId":"display","viewLevel":3,"clearAggregation":false},"list":{"viewName":"S0","viewId":"list","viewLevel":1},"objectNotFound":{"viewName":"ObjectNotFound","viewId":"objectNotFound","viewLevel":3},"notFound":{"viewName":"NotFound","viewId":"notFound"}}}},"sap.platform.abap":{"_version":"1.1.0","uri":"/sap/bc/ui5_ui5/EAM_NTF_CRES1"},"sap.fiori":{"_version":"1.1.0","registrationIds":["F1511"],"archeType":"transactional"},"sap.copilot":{"_version":"1.0.0","contextAnalysis":{"whitelistedEntityTypes":["EAM_NTF_CREATE.NotificationHeader"]}}}'
}, "i2d/eam/pmnotification/create/zeamntfcres1/Component-h2-preload");
sap.ui.loader.config({
    depCacheUI5: {
        "i2d/eam/pmnotification/create/zeamntfcres1/Component.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/ErrorHandler.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/models.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/ui/Device.js", "sap/ui/core/UIComponent.js", "sap/ui/model/resource/ResourceModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/App.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Notifications.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Util.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js": ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/m/MessageBox.js", "sap/ui/core/mvc/Controller.js", "sap/ui/core/routing/History.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/ErrorHandler.js": ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/m/MessageBox.js", "sap/ui/base/Object.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/GeoMap.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/LinksForTechnicalObject.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/m/GroupHeaderListItem.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/MaintainNotification.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/TextTemplateHandler.js", "sap/m/MessageBox.js", "sap/ui/core/format/DateFormat.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/S0.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Util.js", "sap/ui/model/json/JSONModel.js", "sap/ui/model/odata/ODataUtils.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/S1.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/S2.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/TextTemplateHandler.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/S3.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/m/MessageBox.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/controller/TechnicalObjectOverviewAttachments.controller.js": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.js", "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/m/MessageBox.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter.js": ["sap/m/Text.js", "sap/ui/core/format/DateFormat.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/model/models.js": ["sap/ui/Device.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/util/ExpandableTextArea.js": ["jquery.sap.global.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/util/Notifications.js": ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/ui/base/Object.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/util/TextTemplateHandler.js": ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/util/Util.js": ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants.js", "sap/ui/base/Object.js", "sap/ui/core/IconPool.js", "sap/ui/model/json/JSONModel.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/App.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/App.controller.js", "sap/m/App.js", "sap/ui/core/mvc/XMLView.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/NotFound.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.controller.js", "sap/m/Link.js", "sap/m/MessagePage.js", "sap/ui/core/mvc/XMLView.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/ObjectNotFound.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController.controller.js", "sap/m/Link.js", "sap/m/MessagePage.js", "sap/ui/core/mvc/XMLView.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/S0.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/S0.controller.js", "sap/m/Button.js", "sap/m/Column.js", "sap/m/ColumnListItem.js", "sap/m/FlexItemData.js", "sap/m/OverflowToolbar.js", "sap/m/Table.js", "sap/m/Text.js", "sap/m/ToolbarSpacer.js", "sap/m/semantic/FullscreenPage.js", "sap/m/semantic/MessagesIndicator.js", "sap/m/semantic/SendEmailAction.js", "sap/ui/comp/navpopover/SemanticObjectController.js", "sap/ui/comp/smartfilterbar/ControlConfiguration.js", "sap/ui/comp/smartfilterbar/SmartFilterBar.js", "sap/ui/comp/smarttable/SmartTable.js", "sap/ui/core/CustomData.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Icon.js", "sap/ui/core/mvc/XMLView.js", "sap/ushell/ui/footerbar/AddBookmarkButton.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/S1.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/S1.controller.js", "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/MaintainNotification.view.xml", "sap/m/Button.js", "sap/m/semantic/FullscreenPage.js", "sap/m/semantic/MainAction.js", "sap/m/semantic/MessagesIndicator.js", "sap/m/semantic/SendEmailAction.js", "sap/ui/core/mvc/XMLView.js", "sap/ushell/ui/footerbar/AddBookmarkButton.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/S2.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/S2.controller.js", "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/NotificationHeader.fragment.xml", "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/MaintainNotification.view.xml", "sap/m/Button.js", "sap/m/semantic/FullscreenPage.js", "sap/m/semantic/MainAction.js", "sap/m/semantic/MessagesIndicator.js", "sap/m/semantic/SendEmailAction.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Fragment.js", "sap/ui/core/mvc/XMLView.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/S3.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/S3.controller.js", "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/NotificationHeader.fragment.xml", "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/LinksForTechnicalObject.view.xml", "sap/m/Button.js", "sap/m/Column.js", "sap/m/ColumnListItem.js", "sap/m/IconTabBar.js", "sap/m/IconTabFilter.js", "sap/m/Label.js", "sap/m/Link.js", "sap/m/ObjectIdentifier.js", "sap/m/ScrollContainer.js", "sap/m/Table.js", "sap/m/Text.js", "sap/m/Title.js", "sap/m/Toolbar.js", "sap/m/semantic/FullscreenPage.js", "sap/m/semantic/MessagesIndicator.js", "sap/m/semantic/SendEmailAction.js", "sap/suite/ui/commons/Timeline.js", "sap/suite/ui/commons/TimelineItem.js", "sap/ui/core/ComponentContainer.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Fragment.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/GridData.js", "sap/ui/layout/HorizontalLayout.js", "sap/ui/layout/VerticalLayout.js", "sap/ui/layout/form/SimpleForm.js", "sap/ushell/ui/footerbar/AddBookmarkButton.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/Attachments.fragment.xml": ["sap/ui/core/ComponentContainer.js", "sap/ui/core/Fragment.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/CurrentNotifications.fragment.xml": ["sap/m/List.js", "sap/m/ObjectAttribute.js", "sap/m/ObjectListItem.js", "sap/m/ObjectStatus.js", "sap/m/ResponsivePopover.js", "sap/ui/core/Fragment.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/EmployeeQuickView.fragment.xml": ["sap/m/QuickView.js", "sap/m/QuickViewGroup.js", "sap/m/QuickViewGroupElement.js", "sap/m/QuickViewPage.js", "sap/ui/core/Fragment.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/GeoMap.fragment.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/view/subview/GeoMap.view.xml", "sap/m/Page.js", "sap/m/ResponsivePopover.js", "sap/ui/core/Fragment.js", "sap/ui/core/mvc/XMLView.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/NotificationHeader.fragment.xml": ["sap/m/ObjectAttribute.js", "sap/m/ObjectHeader.js", "sap/m/ObjectStatus.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Fragment.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/Search.fragment.xml": ["sap/m/ActionSheet.js", "sap/m/Button.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Fragment.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/fragments/TechnicalObjectOverview.fragment.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/view/subview/TechnicalObjectOverviewAttachments.view.xml", "sap/m/Label.js", "sap/m/ObjectHeader.js", "sap/m/ResponsivePopover.js", "sap/m/Text.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/Fragment.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/GridData.js", "sap/ui/layout/VerticalLayout.js", "sap/ui/layout/form/SimpleForm.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/GeoMap.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/GeoMap.controller.js", "sap/m/FlexBox.js", "sap/m/HBox.js", "sap/m/Link.js", "sap/m/Text.js", "sap/ui/core/Icon.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/HorizontalLayout.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/LinksForTechnicalObject.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/LinksForTechnicalObject.controller.js", "sap/m/Link.js", "sap/m/Text.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/HorizontalLayout.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/MaintainNotification.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/MaintainNotification.controller.js", "i2d/eam/pmnotification/create/zeamntfcres1/util/ExpandableTextArea.js", "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/LinksForTechnicalObject.view.xml", "sap/i2d/eam/lib/pmnotification/zeamntfcres1/controls/EAMValueHelp.js", "sap/i2d/eam/lib/pmnotification/s1/controls/SingleKeyInput.js", "sap/i2d/eam/lib/pmnotification/s1/controls/TechnicalObjectInput.js", "sap/m/CheckBox.js", "sap/m/ComboBox.js", "sap/m/DateTimePicker.js", "sap/m/Input.js", "sap/m/Label.js", "sap/m/Link.js", "sap/m/Select.js", "sap/ui/core/ComponentContainer.js", "sap/ui/core/ExtensionPoint.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/FixFlex.js", "sap/ui/layout/GridData.js", "sap/ui/layout/VerticalLayout.js", "sap/ui/layout/form/SimpleForm.js"],
        "i2d/eam/pmnotification/create/zeamntfcres1/view/subview/TechnicalObjectOverviewAttachments.view.xml": ["i2d/eam/pmnotification/create/zeamntfcres1/controller/TechnicalObjectOverviewAttachments.controller.js", "sap/m/ObjectAttribute.js", "sap/m/ObjectListItem.js", "sap/m/Text.js", "sap/ui/core/mvc/XMLView.js", "sap/ui/layout/ResponsiveFlowLayout.js"]
    }
});