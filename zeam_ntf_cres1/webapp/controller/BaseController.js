/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/routing/History",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "sap/m/MessageBox",
    ],
    function (C, H, b, M) {
      "use strict";
      return C.extend(
        "i2d.eam.pmnotification.create.zeamntfcres1.controller.BaseController",
        {
          _oLastSavedInnerAppData: {},
          _oError: {},
          getEventBus: function () {
            return this.getOwnerComponent().getEventBus();
          },
          getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
          },
          getModel: function (n) {
            var m = this.getView().getModel(n);
            if (!m) {
              m = this.getOwnerComponent().getModel(n);
            }
            return m;
          },
          setModel: function (m, n) {
            return this.getView().setModel(m, n);
          },
          getResourceBundle: function () {
            var o = this.getOwnerComponent()
              ? this.getOwnerComponent()
              : sap.ui.getCore();
            return o.getModel("i18n").getResourceBundle();
          },
          getAppController: function () {
            return this.getOwnerComponent().oRootView.getController();
          },
          getODataHelper: function () {
            return this.getAppController().getODataHelper();
          },
          getUtil: function () {
            return this.getAppController().getUtil();
          },
          getMessagePopover: function () {
            return this.getAppController().getMessagePopover();
          },
          getObject: function () {
            return this.getView().getBindingContext()
              ? this.getView().getBindingContext().getObject()
              : null;
          },
          navBack: function (r, d, R) {
            var h = H.getInstance();
            var p = h.getPreviousHash();
            var c =
              sap.ushell &&
              sap.ushell.Container &&
              sap.ushell.Container.getService("CrossApplicationNavigation");
            if (typeof p !== "undefined") {
              history.go(-1);
            } else {
              if ((r === "" || typeof r === "undefined") && c) {
                c.toExternal({ target: { shellHash: "#" } });
              } else {
                if (typeof R === "undefined") {
                  R = true;
                }
                this.navTo(r, d, R);
              }
            }
          },
          navTo: function (r, d, R) {
            if (typeof R === "undefined") {
              R = false;
            }
            this.getRouter().navTo(r, d, R);
          },
          setAppBusyComplex: function (s) {
            this._setBusy(s);
          },
          setAppBusy: function () {
            var s = { setBusy: true };
            this._setBusy(s);
          },
          setAppUnBusy: function () {
            var s = { setBusy: false, delay: 0 };
            this._setBusy(s);
          },
          _setBusy: function (s) {
            var m = this.getModel(b.MODEL.APP_MODEL.NAME);
            var d = b.GENERAL.BUSY_INDICATOR_DELAY,
              S = true;
            if (s) {
              d = s.delay || d;
              S = typeof s.setBusy === "undefined" ? S : s.setBusy;
            }
            m.setProperty(b.MODEL.APP_MODEL.PROPERTIES.IS_BUSY, S);
            m.setProperty(b.MODEL.APP_MODEL.PROPERTIES.DELAY, d);
          },
          isFunctionAvailable: function (p) {
            try {
              return typeof this._namespaceExists(p) !== "undefined";
            } catch (e) {
              return false;
            }
          },
          getPlugin: function (p) {
            try {
              return this._namespaceExists(p);
            } catch (e) {
              return null;
            }
          },
          hasPendingChangesForOtherNotification: function (p) {
            var c;
            var h = false;
            if (this.getModel().hasPendingChanges()) {
              if (p) {
                if (p.oPaths) {
                  var P = p.oPaths;
                  if (typeof P === "undefined") {
                    h = true;
                  } else {
                    c = this.getModel().getPendingChanges();
                    for (var s in c) {
                      h = typeof P[s] === "undefined" ? true : false;
                      if (h) {
                        break;
                      }
                    }
                  }
                } else if (p.sObjectKey) {
                  var a = p.sObjectKey;
                  if (typeof a === "undefined" || a === "") {
                    h = true;
                  } else {
                    c = this.getModel().getPendingChanges();
                    for (var d in c) {
                      var o = "";
                      if (/\'(.*?)\'/.test(d)) {
                        o = /\'(.*?)\'/.exec(d)[1];
                      }
                      if (o !== a) {
                        h = true;
                        break;
                      }
                    }
                  }
                } else {
                  h = true;
                }
              } else {
                h = true;
              }
            }
            return h;
          },
          objectByString: function (o, s) {
            s = s.replace(/\[(\w+)\]/g, ".$1");
            s = s.replace(/^\./, "");
            var a = s.split(".");
            for (var i = 0, n = a.length; i < n; ++i) {
              var k = a[i];
              if (k in o) {
                o = o[k];
              } else {
                return null;
              }
            }
            return o;
          },
          isUserIDValid: function (u) {
            return typeof u !== "undefined" && u !== "" ? true : false;
          },
          _namespaceExists: function (n) {
            var t = n.split(".");
            return t.reduce(function (p, c) {
              return typeof p === "undefined" ? p : p[c];
            }, window);
          },
          onShareEmailPress: function (p) {
            var m = null;
            var i;
            if (p && typeof p.sReceiver === "string") {
              m = p.sReceiver;
            }
            if (p && typeof p.bImmediateHashReplace === "boolean") {
              i = p.bImmediateHashReplace;
            }
            var s = function () {
              var a, B;
              var n =
                this.getObject() && this.getObject().NotificationNumber
                  ? this.getObject().NotificationNumber
                  : "";
              var c =
                this.getObject() && this.getObject().ShortText
                  ? this.getObject().ShortText
                  : "";
              if (n !== "") {
                a = this.getResourceBundle().getText(
                  "xtit.shareSendEmailObjectSubjectNotification",
                  [n]
                );
                B = this.getResourceBundle().getText(
                  "ymsg.shareSendEmailObjectMessageNotification",
                  [n, c]
                );
              } else {
                a = this.getResourceBundle().getText(
                  "xtit.shareSendEmailObjectSubjectNoNotification",
                  [c]
                );
                B = this.getResourceBundle().getText(
                  "ymsg.shareSendEmailObjectMessageNoNotification",
                  [c]
                );
              }
              B = B + "\r\n";
              if (this.getObject().TechnicalObjectNumber) {
                B =
                  B +
                  (this.getObject().TechnicalObjectType === "EAMS_EQUI"
                    ? this.getResourceBundle().getText("xtit.equipment")
                    : this.getResourceBundle().getText("xtit.floc"));
                B =
                  B +
                  ": " +
                  this.getObject().TechnicalObjectNumber +
                  " (" +
                  this.getObject().TechnicalObjectDescription +
                  ") \r\n";
              }
              if (this.getObject().NotificationType) {
                B = B + this.getResourceBundle().getText("xfld.notificationType");
                if (
                  this.getModel().getObject(
                    "/NotificationTypeSet('" +
                      this.getObject().NotificationType +
                      "')"
                  )
                ) {
                  B =
                    B +
                    ": " +
                    this.getModel().getObject(
                      "/NotificationTypeSet('" +
                        this.getObject().NotificationType +
                        "')"
                    ).Description +
                    "(" +
                    this.getObject().NotificationType +
                    ") \r\n";
                } else {
                  B =
                    B +
                    ": " +
                    this.getObject().NotificationTypeText +
                    " (" +
                    this.getObject().NotificationType +
                    ") \r\n";
                }
              }
              if (this.getObject().Location) {
                B = B + this.getResourceBundle().getText("xfld.location");
                B = B + ": " + this.getObject().Location + " \r\n";
              }
              if (this.getObject().Effect && this.getObject().Effect !== "") {
                B = B + this.getResourceBundle().getText("xfld.effect");
                if (
                  this.getModel().getObject(
                    "/MalfunctionEffectSet('" + this.getObject().Effect + "')"
                  )
                ) {
                  B =
                    B +
                    ": " +
                    this.getModel().getObject(
                      "/MalfunctionEffectSet('" + this.getObject().Effect + "')"
                    ).EffectText +
                    "(" +
                    this.getObject().Effect +
                    ") \r\n";
                } else {
                  B =
                    B +
                    ": " +
                    this.getObject().EffectText +
                    " (" +
                    this.getObject().Effect +
                    ") \r\n";
                }
              }
              B = B + "\r\n" + location.href + "\r\n";
              sap.m.URLHelper.triggerEmail(m, a, B);
            }.bind(this);
            if (this.getCurrentAppState) {
              var S = this.storeCurrentAppState(
                this.getCurrentAppState.bind(this),
                i
              );
              S.fail(function () {
                s();
              });
              S.done(function () {
                s();
              });
            } else {
              s();
            }
          },
          initVars: function () {
            this.IAPP_STATE = "sap-iapp-state";
            this._oLastSavedInnerAppData = {
              sAppStateKey: "",
              oAppData: {},
              iCacheHit: 0,
              iCacheMiss: 0,
            };
            this._rIAppStateOld = new RegExp("/" + this.IAPP_STATE + "=([^/?]+)");
            this._rIAppStateOldAtStart = new RegExp(
              "^" + this.IAPP_STATE + "=([^/?]+)"
            );
            this._rIAppStateNew = new RegExp(
              "[?&]" + this.IAPP_STATE + "=([^&]+)"
            );
            if (!this._oCrossAppNavService && sap.ushell.Container) {
              this._oCrossAppNavService = sap.ushell.Container.getService(
                "CrossApplicationNavigation"
              );
            }
            this._oComponent = this.getOwnerComponent();
            this._bAppStateInitialized = true;
          },
          invalidateAppStateForFurtherUse: function () {
            if (this._oAppState) {
              this._oAppState = null;
            }
          },
          storeCurrentAppState: function (g, i) {
            if (!this._bAppStateInitialized) {
              this.initVars();
            }
            var a = this._storeInnerAppState(g(), i);
            a.fail(
              function () {
                this.handleError();
              }.bind(this)
            );
            return a;
          },
          parseNavigation: function () {
            var a = this.getRouter().oHashChanger.getHash();
            var i = this._getInnerAppStateKey(a);
            var m = jQuery.Deferred();
            if (i) {
              this._loadAppState(i, m);
            } else {
              m.resolve({}, {}, b.ROUTES.NavType.initial);
            }
            return m.promise();
          },
          handleError: function () {
            M.show(this._oError.sMessage, {
              icon: this._oError.sIcon,
              title: this.getResourceBundle().getText("xtit.error"),
              styleClass: this._oComponent.getCompactCozyClass(),
              actions: [M.Action.CLOSE],
            });
          },
          _storeInnerAppState: function (i, I) {
            if (typeof I !== "boolean") {
              I = true;
            }
            var t = this;
            var m = jQuery.Deferred();
            var r = function (s) {
              var d = t.getRouter().oHashChanger.getHash();
              var e = t._replaceInnerAppStateKey(d, s);
              t.getRouter().oHashChanger.replaceHash(e);
            };
            var a = this._oLastSavedInnerAppData.sAppStateKey;
            var c =
              JSON.stringify(i) ===
              JSON.stringify(this._oLastSavedInnerAppData.oAppData);
            if (c && a) {
              r(a);
              m.resolve(a);
              return m.promise();
            }
            var o = function (s) {
              if (!I) {
                r(s);
              }
              t._oLastSavedInnerAppData.oAppData = i;
              t._oLastSavedInnerAppData.sAppStateKey = s;
              m.resolve(s);
            };
            var O = function () {
              m.reject();
            };
            if (this._oCrossAppNavService) {
              var A = this._saveAppState(i, o, O);
            }
            if (typeof A !== "undefined" && A !== "") {
              if (I) {
                r(A);
              }
            }
            return m.promise();
          },
          _saveAppState: function (a, o, O) {
            if (!this._oAppState) {
              this._oAppState = this._oCrossAppNavService.createEmptyAppState(
                this.getOwnerComponent()
              );
            }
            var A = this._oAppState.getKey();
            var c = {};
            for (var s in a) {
              c[s] = a[s];
            }
            this._oAppState.setData(c);
            var S = this._oAppState.save();
            if (o) {
              S.done(function () {
                o(A);
              });
            }
            if (O) {
              var t = this;
              S.fail(function () {
                t._createTechnicalError(
                  this.getResourceBundle().getText("ymsg.errorSaveAppState"),
                  "AppStateSave.failed"
                );
                O();
              });
            }
            return A;
          },
          _replaceInnerAppStateKey: function (a, A) {
            var n = this.IAPP_STATE + "=" + A;
            if (!a) {
              return "?" + n;
            }
            var f = function (s) {
              if (s.indexOf("?") !== -1) {
                return s + "&" + n;
              }
              return s + "?" + n;
            };
            if (!this._getInnerAppStateKey(a)) {
              return f(a);
            }
            if (this._rIAppStateNew.test(a)) {
              return a.replace(this._rIAppStateNew, function (N) {
                return N.replace(/=.*/gi, "=" + A);
              });
            }
            var r = function (c, s) {
              s = s.replace(c, "");
              return f(s);
            };
            if (this._rIAppStateOld.test(a)) {
              return r(this._rIAppStateOld, a);
            }
            if (this._rIAppStateOldAtStart.test(a)) {
              return r(this._rIAppStateOldAtStart, a);
            }
            return "";
          },
          _getInnerAppStateKey: function (a) {
            if (!a) {
              return;
            }
            var m = this._rIAppStateNew.exec(a);
            if (m === null) {
              m = this._rIAppStateOld.exec(a);
            }
            if (m === null) {
              m = this._rIAppStateOldAtStart.exec(a);
            }
            if (m === null) {
              return;
            }
            return m[1];
          },
          _loadAppState: function (a, d) {
            if (!this._oCrossAppNavService) {
              d.resolve({}, {}, b.ROUTES.NavType.initial);
            }
            var A = this._oCrossAppNavService.getAppState(this._oComponent, a);
            var t = this;
            A.done(function (o) {
              var c = {};
              var e = o.getData();
              if (typeof e === "undefined") {
                t._createTechnicalError(
                  this.getResourceBundle().getText("ymsg.errorLoadAppState"),
                  "getDataFromAppState.failed"
                );
                d.reject({}, b.ROUTES.NavType.iAppState);
              } else {
                for (var s in e) {
                  c[s] = e[s];
                }
              }
              d.resolve(c, {}, b.ROUTES.NavType.iAppState);
            });
            A.fail(function () {
              t._createTechnicalError(
                this.getResourceBundle().getText("ymsg.errorLoadAppState"),
                "getAppState.failed"
              );
              d.reject({}, b.ROUTES.NavType.iAppState);
            });
          },
          _createTechnicalError: function (m, e) {
            this._oError.sMessage = m;
            this._oError.sIcon = M.Icon.ERROR;
            this._oError.sErrorCode = e;
          },
          _initAttachmentComponent: function (a, s, c) {
            if (!a) {
              var t = this;
              var A = this.getOwnerComponent().createComponent({
                usage: "attachmentReuseComponent",
                settings: s,
              });
              return A.then(function (o) {
                t.byId(c).setComponent(o);
                return o;
              });
            } else {
              a.setMode(s.mode);
              a.setObjectKey(s.objectKey);
              a.setObjectType(s.objectType);
              a.refresh(s.mode, s.objectType, s.objectKey);
              return Promise.resolve(a);
            }
          },
        }
      );
    }
  );
  