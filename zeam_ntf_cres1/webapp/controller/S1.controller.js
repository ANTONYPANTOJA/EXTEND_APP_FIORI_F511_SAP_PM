/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "sap/ui/model/json/JSONModel",
    ],
    function (C, B, f, J) {
      "use strict";
      return B.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.S1", {
        formatter: f,
        _oViewReady: null,
        _oMaintainNotificationController: null,
        onInit: function () {
          this._oViewReady = Promise.all([
            this.getView().loaded(),
            this.byId("pmNotifViewCreateNotification").loaded(),
            this.getModel().metadataLoaded(),
          ]).then(
            function (p) {
              var v = p[1],
                s = p[0];
              this._oMaintainNotificationController = v.getController();
              var V =
                this._oMaintainNotificationController.initViewPropertiesModel();
              this.setModel(V, C.MODEL.VIEW_PROP.NAME);
              this.getModel(C.MODEL.APP_MODEL.NAME).setProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_METADATA_LOADED,
                true
              );
              v.attachModelContextChange(function () {
                var b = v.getBindingContext()
                    ? v.getBindingContext().getPath()
                    : null,
                  m = s
                    .byId("pmNotifCreateNotificationMessagesIndicator")
                    .getAggregation("_control"),
                  M = m && m.getBinding("text");
                if (b && M) {
                  M.setFormatter(function (a) {
                    return a.filter(function (c) {
                      return c.getTarget() === b;
                    }).length;
                  });
                }
              });
              this._oMaintainNotificationController.initializeNewNotificationData();
            }.bind(this)
          );
          this.oShareModel = new J({
            bookmarkTitle: this.getResourceBundle().getText("FULLSCREEN_TITLE"),
            bookmarkIcon: "sap-icon://S4Hana/S0012",
          });
          this.setModel(this.oShareModel, "share");
          this.byId("pmNotifButtonShareTile").setBeforePressHandler(
            this.onBeforePressBookmark.bind(this)
          );
          this.getRouter()
            .getRoute(C.ROUTES.CREATE)
            .attachPatternMatched(this._onRoutePatternMatched, this);
        },
        onNavBack: function () {
          this._oMaintainNotificationController.cancelNotification();
        },
        onSave: function () {
          if (this._oMaintainNotificationController.validateNewNotification()) {
            this._oMaintainNotificationController.saveNotification();
          }
        },
        onCancel: function () {
          this._oMaintainNotificationController.cancelNotification();
        },
        onMyNotifications: function () {
          this.navTo(C.ROUTES.LIST);
        },
        onMessageButtonPressed: function (e) {
          var m = this.getMessagePopover(),
            b = m.getBinding("items"),
            v = this.byId("pmNotifViewCreateNotification")
              .getBindingContext()
              .getPath();
          b.filter([
            new sap.ui.model.Filter({
              path: "target",
              operator: "EQ",
              value1: v,
            }),
          ]);
          m.toggle(e.getSource());
        },
        onShareEmailPress: function () {
          this._oMaintainNotificationController.onShareEmailPress({
            bImmediateHashReplace: false,
          });
        },
        onBeforePressBookmark: function () {
          this._oMaintainNotificationController.storeCurrentAppState(
            this._oMaintainNotificationController.getCurrentAppState.bind(
              this._oMaintainNotificationController
            )
          );
          var a = this.getView().byId("pmNotifButtonShareTile");
          a.setAppData({
            title: this.oShareModel.getProperty("/bookmarkTitle"),
            icon: this.oShareModel.getProperty("/bookmarkIcon"),
          });
        },
        _onRoutePatternMatched: function (e) {
          var t = this,
            E = e.getParameters();
          this._oViewReady.then(function () {
            t._oMaintainNotificationController.routePatternMatched(E);
          });
        },
      });
    }
  );
  