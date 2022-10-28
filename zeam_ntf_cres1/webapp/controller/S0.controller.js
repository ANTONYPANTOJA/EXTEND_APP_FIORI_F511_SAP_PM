/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Util",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/odata/ODataUtils",
    ],
    function (C, B, U, f, J, O) {
      "use strict";
      return B.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.S0", {
        formatter: f,
        _oDataHelper: null,
        _oViewProperties: null,
        _oResourceBundle: null,
        _oAppModel: null,
        _oTextTemplate: null,
        _changeTimer: null,
        _oSearchField: null,
        _sSearchTerm: "",
        _oSmartTable: null,
        _oSmartFilterBar: null,
        _bOnInitFinished: false,
        _bFilterBarInitialized: false,
        _bSTVariantInitialized: false,
        onInit: function () {
          this._oAppModel = this.getModel(C.MODEL.APP_MODEL.NAME);
          this.getView()
            .loaded()
            .then(
              function () {
                this._oDataHelper = this.getODataHelper();
              }.bind(this)
            );
          this._initViewPropertiesModel();
          this.getRouter()
            .getRoute(C.ROUTES.LIST)
            .attachPatternMatched(this._onRoutePatternMatched, this);
          this.getModel().setDefaultCountMode(sap.ui.model.odata.CountMode.None);
          this.getView()
            .byId("pmNotifButtonShareTile")
            .setBeforePressHandler(this.onBeforePressBookmark.bind(this));
          this.getView()
            .byId("pmNotifButtonShareTile")
            .setAfterPressHandler(this.onAfterPressBookmark.bind(this));
          this._oSmartTable = this.getView().byId("pmNotifSmartTableWorklist");
          this._oSmartFilterBar = this.byId("pmNotifSmartTableFilterWorklist");
          this.oShareModel = new J({
            bookmarkTitle: this.getResourceBundle().getText(
              "xtit.notificationList"
            ),
            bookmarkIcon: "sap-icon://S4Hana/S0012",
            bookmarkCustomUrl: function () {
              return this.storeCurrentAppState();
            }.bind(this),
          });
          this.setModel(this.oShareModel, "share");
          this._bOnInitFinished = true;
          this.applyAppState();
        },
        onNavBack: function () {
          this.navBack();
        },
        onMessageButtonPressed: function (e) {
          this.getMessagePopover().toggle(e.getSource());
        },
        onAddPressed: function () {
          this.navTo(C.ROUTES.CREATE);
        },
        onHandleRowPress: function (e) {
          if (
            e.getSource().getBindingContext() &&
            e.getSource().getBindingContext().getObject()
          ) {
            var n = e
              .getSource()
              .getBindingContext()
              .getObject().NotificationNumber;
            this.navTo(C.ROUTES.DISPLAY, {
              NotificationNumber: encodeURIComponent(n),
            });
          }
        },
        onBeforePopoverOpens: function (e) {
          var p = e.getParameters();
          var t = this;
          var l = sap.ui.getCore().byId(e.getParameter("originalId"));
          if (p.semanticObject === "ReporterDisplay") {
            var u = p.semanticAttributes.ReporterUserId;
            var v = this.getView();
            l.attachPress(function (E) {
              t.getUtil().launchPopoverEmployeeQuickView(u, E.getSource(), v);
            });
            t.getUtil().launchPopoverEmployeeQuickView(u, l, v);
          }
        },
        onInitSmartFilterBar: function () {
          this._bFilterBarInitialized = true;
          this.applyAppState();
        },
        onBeforeRebindTable: function (e) {
          var b = e.getParameter("bindingParams");
          var c = this.byId("pmNotifSmartTableWorklist").getTable().getColumns();
          $.each(c, function () {
            var s = this.data().p13nData.columnKey;
            switch (s) {
              case "NotificationNumber":
                this.setMinScreenWidth("Phone");
                break;
              case "SystemStatus":
                this.setMinScreenWidth("Tablet");
                this.setDemandPopin(false);
                break;
              case "DateMonitor":
                this.setDemandPopin(false);
                break;
              case "PriorityText":
                this.setDemandPopin(false);
                break;
              case "TechnicalObjectNumber":
                this.setMinScreenWidth("Phone");
                break;
              case "ShortText":
                break;
              case "ReporterDisplay":
                break;
              default:
                break;
            }
          });
          if (b.parameters.select.indexOf("ReporterDisplay") !== -1) {
            b.parameters.select = b.parameters.select + ",ReporterUserId";
          }
          if (b.parameters.select.indexOf("NotificationTimestamp") !== -1) {
            b.parameters.select =
              b.parameters.select +
              ",NotificationDate,NotificationTime,NotificationTimezone";
          }
          this._myFilters = b.filters;
        },
        _initViewPropertiesModel: function () {
          this._oViewProperties = new sap.ui.model.json.JSONModel();
          this.getView().setModel(this._oViewProperties, C.MODEL.VIEW_PROP.NAME);
          this._refreshViewProperties();
        },
        _refreshViewProperties: function () {
          this._oViewProperties.setProperty(
            C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED,
            !this.hasPendingChangesForOtherNotification()
          );
        },
        _onRoutePatternMatched: function () {
          this.setAppUnBusy();
          this._refreshViewProperties();
          var b = this.getView().getBindingContext();
          if (b) {
            this.getView().getElementBinding().refresh();
          }
        },
        onBeforePressBookmark: function () {
          var F;
          var a;
          this.storeCurrentAppState(this.getCurrentAppState.bind(this));
          var s = this.getModel().sServiceUrl;
          var r = this.getModel().resolve(
            "/NotificationHeaderSet",
            this.getView().getBindingContext()
          );
          if (this._myFilters) {
            a = this._myFilters;
            var m = this.getModel().getMetaModel().oMetadata;
            var e = this.getModel().oMetadata._getEntityTypeByPath(
              "/NotificationHeaderSet"
            );
            F = O.createFilterParams(a, m, e);
          }
          s = F ? s + r + "/$count/" + "?" + F : s + r + "/$count";
          var A = this.getView().byId("pmNotifButtonShareTile");
          A.setAppData({
            title: this.oShareModel.getProperty("/bookmarkTitle"),
            icon: this.oShareModel.getProperty("/bookmarkIcon"),
            serviceUrl: s,
          });
        },
        onShareEmailPress: function () {
          this.storeCurrentAppState(this.getCurrentAppState.bind(this)).done(
            function () {
              sap.m.URLHelper.triggerEmail(
                null,
                this.getResourceBundle().getText("xtit.notificationList"),
                location.href
              );
            }.bind(this)
          );
        },
        onAfterPressBookmark: function () {
          this.invalidateAppStateForFurtherUse();
        },
        onAfterSTVariantApplied: function () {
          if (!this._bSTVariantInitialized) {
            this._bSTVariantInitialized = true;
            this.applyAppState();
          }
        },
        onAfterSTVariantInitialised: function () {
          if (this._oSmartTable.getCurrentVariantId() === "") {
            this._bSTVariantInitialized = true;
            this.applyAppState();
          }
        },
        applyAppState: function () {
          if (
            !(
              this._bFilterBarInitialized &&
              this._bOnInitFinished &&
              this._bSTVariantInitialized
            )
          ) {
            return;
          }
          this.initVars();
          var p = this.parseNavigation();
          var t = this;
          p.done(function (a, u, n) {
            if (n !== C.ROUTES.NavType.initial) {
              t._oSmartFilterBar.clearVariantSelection();
              t._oSmartFilterBar.setDataSuiteFormat(a.selectionVariant);
              t.restoreCustomAppStateData(a.customData);
              t._oSmartTable.setCurrentVariantId(a.tableVariantId);
            }
            t._oSmartTable.rebindTable();
          });
          p.fail(function () {
            t.handleError();
          });
        },
        getCurrentAppState: function () {
          return {
            selectionVariant: this._oSmartFilterBar.getDataSuiteFormat(),
            tableVariantId: this._oSmartTable.getCurrentVariantId(),
            customData: this._getCustomAppStateData(),
          };
        },
        _getCustomAppStateData: function () {
          return {};
        },
        restoreCustomAppStateData: function () {},
      });
    }
  );
  