/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/TextTemplateHandler",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
    ],
    function (C, B, J, T, f) {
      "use strict";
      return B.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.S2", {
        formatter: f,
        _oMaintainNotificationController: null,
        _oDataHelper: null,
        _oTextTemplate: null,
        onInit: function () {
          this.getView()
            .loaded()
            .then(
              function () {
                this._oDataHelper = this.getODataHelper();
              }.bind(this)
            );
          this._oMaintainNotificationController = this.byId(
            "pmNotifViewEditNotification"
          ).getController();
          var v = this._oMaintainNotificationController.initViewPropertiesModel();
          this.setModel(v, C.MODEL.VIEW_PROP.NAME);
          this.setAppBusyComplex({ delay: 0 });
          this.getRouter()
            .getRoute(C.ROUTES.EDIT)
            .attachPatternMatched(this._onRoutePatternMatched, this);
        },
        onNavBack: function () {
          this._oMaintainNotificationController.cancelNotification();
        },
        onMessageButtonPressed: function (e) {
          this.getMessagePopover().toggle(e.getSource());
        },
        onSave: function () {
          if (this._oMaintainNotificationController.validateNewNotification()) {
            this._oMaintainNotificationController.saveNotification();
          }
        },
        onCancel: function () {
          this._oMaintainNotificationController.cancelNotification();
        },
        onDeletePressed: function () {
          this._oMaintainNotificationController.deleteNotification();
        },
        onShareEmailPress: function () {
          this._oMaintainNotificationController.onShareEmailPress({
            bImmediateHashReplace: false,
          });
        },
        onPressReporter: function (e) {
          var n = this._oMaintainNotificationController
            .getView()
            .getBindingContext()
            .getObject();
          this.getUtil().launchPopoverEmployeeQuickView(
            n.ReporterUserId,
            e.getSource(),
            this._oMaintainNotificationController.getView()
          );
        },
        _onRoutePatternMatched: function (e) {
          this._oMaintainNotificationController.routePatternMatched(e);
        },
      });
    }
  );
  