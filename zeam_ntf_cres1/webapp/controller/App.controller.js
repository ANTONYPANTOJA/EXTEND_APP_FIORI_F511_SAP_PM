//@ts-nocheck
/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Notifications",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Util",
    ],
    function (C, B, J, N, U) {
      "use strict";
      return B.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.App", {
        _oAppModel: {},
        _oDataHelper: {},
        _oUtil: {},
        _oMessagePopover: null,
        _oLastSavedInnerAppData: null,
        onInit: function () {
          var a;
          var s;
          var o = this.getView().getBusyIndicatorDelay();
          a = this._oAppModel = this.getModel(C.MODEL.APP_MODEL.NAME);
          this.setAppBusy();
          a.setProperty(
            C.MODEL.APP_MODEL.PROPERTIES.CAMERA_AVAILABLE,
            this.isFunctionAvailable("navigator.camera")
          );
          a.setProperty(
            C.MODEL.APP_MODEL.PROPERTIES.GPS_AVAILABLE,
            this.isFunctionAvailable("navigator.geolocation")
          );
          a.setProperty(
            C.MODEL.APP_MODEL.PROPERTIES.BARCODE_AVAILABLE,
            this.isFunctionAvailable("cordova.plugins.barcodeScanner")
          );
          a.setProperty(
            C.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE,
            this.isAttachmentSwitchOn()
          );
          s = function () {
            this.setAppBusyComplex({ setBusy: false, delay: o });
          };
          this.getModel().metadataLoaded().then(s.bind(this), s.bind(this));
          this.getView()
            .loaded()
            .then(
              function () {
                this._oDataHelper = new N(
                  this.getOwnerComponent(),
                  this.getView()
                );
              }.bind(this)
            );
          this._oUtil = new U();
          this._oMessagePopover = new sap.m.MessagePopover({
            items: {
              path: "message>/",
              template: new sap.m.MessagePopoverItem({
                description: "{message>description}",
                type: "{message>type}",
                title: "{message>message}",
              }),
            },
          });
          this._oMessagePopover.setModel(
            sap.ui.getCore().getMessageManager().getMessageModel(),
            "message"
          );
          this.getOwnerComponent().setModel(
            sap.ui.getCore().getMessageManager().getMessageModel(),
            "message"
          );
        },
        onExit: function () {
          this._oUtil = null;
        },
        getUtil: function () {
          return this._oUtil;
        },
        getMessagePopover: function () {
          return this._oMessagePopover;
        },
        getODataHelper: function () {
          return this._oDataHelper;
        },
        isAttachmentSwitchOn: function () {
          if (this.extHookAttachmentSwitch) {
            return this.extHookAttachmentSwitch();
          } else {
            return true;
          }
        },
        setPropUserValid: function () {
          var v;
          var n;
          v = this.getModel(C.MODEL.VIEW_PROP.NAME);
          if (!this.getView().getBindingContext()) {
            return;
          }
          n = this.getView().getBindingContext().getObject();
          var u = this.isUserIDValid(n.ReporterUserId);
          v.setProperty(C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.VALID_USER_GIVEN, u);
        },
        buildFilterForNotifications: function (n, t) {
          var f = [];
          switch (t) {
            case C.GENERAL.COUNT_OPEN_NOTIFICATIONS:
              f = this._buildFilterCriteriaForCurrentNotifications(n);
              break;
            case C.GENERAL.COUNT_HISTORY_NOTIFICATIONS:
              f = this._buildFilterCriteriaForHistoryNotifications(n);
              break;
            default:
              f = this._buildFilterCriteriaForNotifications(n);
          }
          if (this.extHookFilterOpenNotifications) {
            f = this.extHookFilterOpenNotifications(f, t);
          }
          return f;
        },
        _buildFilterCriteriaForCurrentNotifications: function (n) {
          var f = [];
          f = [
            new sap.ui.model.Filter(
              n.TechnicalObjectNumber !== "" && n.TechnicalObjectType !== ""
                ? {
                    filters: [
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectNumber",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectNumber,
                      }),
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectType",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectType,
                      }),
                      new sap.ui.model.Filter({
                        path: "NotificationPhase",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: "1",
                        value2: "3",
                      }),
                    ],
                    and: true,
                  }
                : []
            ),
          ];
          return f;
        },
        _buildFilterCriteriaForNotifications: function (n) {
          var f = [];
          f = [
            new sap.ui.model.Filter(
              n.TechnicalObjectNumber !== "" && n.TechnicalObjectType !== ""
                ? {
                    filters: [
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectNumber",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectNumber,
                      }),
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectType",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectType,
                      }),
                    ],
                    and: true,
                  }
                : []
            ),
          ];
          return f;
        },
        _buildFilterCriteriaForHistoryNotifications: function (n) {
          var f = [];
          f = [
            new sap.ui.model.Filter(
              n.TechnicalObjectNumber !== "" && n.TechnicalObjectType !== ""
                ? {
                    filters: [
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectNumber",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectNumber,
                      }),
                      new sap.ui.model.Filter({
                        path: "TechnicalObjectType",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: n.TechnicalObjectType,
                      }),
                      new sap.ui.model.Filter({
                        path: "NotificationPhase",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: "4",
                        value2: "5",
                      }),
                    ],
                    and: true,
                  }
                : []
            ),
          ];
          return f;
        },
      });
    }
  );
  