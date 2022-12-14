sap.ui.define(
    ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants", "sap/ui/base/Object"],
    function (C, O) {
      "use strict";
      return O.extend("i2d.eam.pmnotification.create.zeamntfcres1.util.Notifications", {
        _oDataModel: null,
        _oAppModel: null,
        _oAppController: null,
        _oMainView: null,
        _oResourceBundle: null,
        _aDeleteListeners: [],
        constructor: function (c, m) {
          var d;
          this._oDataModel = c.getModel();
          this._oAppModel = c.getModel(C.MODEL.APP_MODEL.NAME);
          this._oMainView = m;
          this._oAppController = m.getController();
          this._oResourceBundle = m.getController().getResourceBundle();
          d = new jQuery.Deferred();
          this._oDraftDeletedPromise = d.promise();
          d.resolve();
        },
        getPathForNotificationNo: function (n) {
          return "/NotificationHeaderSet('" + encodeURIComponent(n) + "')";
        },
        getPathForNotificationType: function (n) {
          return "/NotificationTypeSet('" + encodeURIComponent(n) + "')";
        },
        getPathForNotificationTypeChange: function (s, t) {
          return (
            "/NotificationTypeChangeSet(SourceNotificationType='" +
            encodeURIComponent(s) +
            "',TargetNotificationType='" +
            encodeURIComponent(t) +
            "')"
          );
        },
        getPathForNotificationHeaders: function () {
          return "/NotificationHeaderSet";
        },
        getPathForLongTextSet: function () {
          return "/LongTextSet";
        },
        getPathForTechnicalObject: function (n, t) {
          return (
            "/TechnicalObject(TechnicalObjectNumber='" +
            encodeURIComponent(n) +
            "',TechnicalObjectType='" +
            encodeURIComponent(t) +
            "')"
          );
        },
        getPathForTechnicalObjectSet: function (n, t) {
          return (
            "/TechnicalObjectSet(TechnicalObjectNumber='" +
            encodeURIComponent(n) +
            "',TechnicalObjectType='" +
            encodeURIComponent(t) +
            "')"
          );
        },
        getPathForTechnicalObjectThumbnailSet: function (n, t) {
          return (
            "/TechnicalObjectThumbnailSet(TechnicalObjectNumber='" +
            encodeURIComponent(n) +
            "',TechnicalObjectType='" +
            encodeURIComponent(t) +
            "')"
          );
        },
        getNoteSet: function (n, s, e) {
          this._oDataModel.read("/NoteSet", {
            filters: [
              new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter({
                    path: "NotificationNumber",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: n,
                  }),
                ],
                and: true,
              }),
            ],
            success: s,
            error: e,
          });
        },
        getPathForUserId: function (u) {
          if (u) {
            return (
              "/PMUserDetailsSet('" + encodeURIComponent(u.toUpperCase()) + "')"
            );
          } else {
            return "/PMUserDetailsSet('')";
          }
        },
        deleteNotification: function (n, s, e) {
          var t = this;
          function S() {
            t._oMainView.getController().navBack();
            if (s) {
              s();
            }
            jQuery.sap.require("sap.m.MessageToast");
            sap.m.MessageToast.show(
              t._oResourceBundle.getText("ymsg.deleteSuccess", n),
              {
                duration: C.GENERAL.MESSAGETOAST_DELAY,
                closeOnBrowserNavigation: C.GENERAL.MESSAGETOAST_CLOSE_ON_NAV,
              }
            );
          }
          this._oDataModel.remove(this.getPathForNotificationNo(n), {
            success: S,
            error: e,
          });
        },
        cancelNotification: function (n, a, A, f) {
          var t = this;
          try {
            if (t._oDataModel.hasPendingChanges()) {
              t._oDataModel.resetChanges();
            }
            if (a) {
              a.getApplicationState(function (r) {
                if (r) {
                  a.cancel(true);
                }
              });
            }
          } catch (e) {
            if (f) {
              f();
            }
          }
          if (
            !t._oAppModel.getProperty(C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE)
          ) {
            if (A) {
              A();
            }
          } else {
            if (A) {
              A();
            }
          }
        },
        _countNotifications: function (n, v, t, d) {
          var c;
          var l = d
            ? d
            : new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: this._oDataModel.sServiceUrl,
                defaultCountMode: sap.ui.model.odata.CountMode.Request,
              });
          switch (t) {
            case C.GENERAL.COUNT_OPEN_NOTIFICATIONS:
              c = C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_CURRENT_NOTIFICATIONS;
              break;
            case C.GENERAL.COUNT_HISTORY_NOTIFICATIONS:
              c = C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_HISTORY_NOTIFICATIONS;
              break;
            default:
          }
          var f = this._oAppController.buildFilterForNotifications(n, t);
          return this._countNotificationsWithModel(
            n.TechnicalObjectNumber,
            n.TechnicalObjectType,
            v,
            c,
            l,
            f
          );
        },
        countOpenNotifications: function (n, v, d) {
          return this._countNotifications(
            n,
            v,
            C.GENERAL.COUNT_OPEN_NOTIFICATIONS,
            d
          );
        },
        countHistoryNotifications: function (n, v, d) {
          return this._countNotifications(
            n,
            v,
            C.GENERAL.COUNT_HISTORY_NOTIFICATIONS,
            d
          );
        },
        _countNotificationsWithModel: function (t, T, v, c, d, f) {
          var D = new jQuery.Deferred();
          v.setProperty(c, 0);
          if (!(t === undefined || T === undefined || t === "" || T === "")) {
            d.read("/NotificationHeaderSet/$count", {
              filters: f,
              success: jQuery.proxy(function (o) {
                if (o && typeof o !== "undefined") {
                  this.setProperty(c, o);
                }
                D.resolve();
              }, v),
            });
          } else {
            D.resolve();
          }
          return D.promise();
        },
      });
    }
  );
  