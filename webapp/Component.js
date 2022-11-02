sap.ui.define(["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants", "sap/ui/core/UIComponent", "sap/ui/model/resource/ResourceModel", "i2d/eam/pmnotification/create/zeamntfcres1/model/models", "sap/ui/Device", "i2d/eam/pmnotification/create/zeamntfcres1/controller/ErrorHandler"], function (C, U, R, m, D, E) {
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