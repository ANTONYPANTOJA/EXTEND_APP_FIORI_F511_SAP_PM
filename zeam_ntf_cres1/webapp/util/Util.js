/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "sap/ui/base/Object",
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/IconPool",
    ],
    function (C, O, J, I) {
      "use strict";
      return O.extend("i2d.eam.pmnotification.create.zeamntfcres1.util.Util", {
        _aDialogs: [],
        _iCounter: 1,
        constructor: function () {
          this._aDialogs = [];
        },
        getFragmentDialog: function (p, d) {
          var u = d + p.getView().getId();
          d = "i2d.eam.pmnotification.create.zeamntfcres1.view.fragments." + d;
          if (!this._aDialogs[u]) {
            this._aDialogs[u] = sap.ui.xmlfragment(u, d, p);
            this._aDialogs[u].sUniqueId = u;
            p.getView().addDependent(this._aDialogs[u]);
            jQuery.sap.syncStyleClass(
              "sapUiSizeCompact",
              p.getView(),
              this._aDialogs[u]
            );
          }
          return this._aDialogs[u];
        },
        launchPopoverCurrentNotifications: function (n, f, s, p) {
          var d = p
            .getController()
            .getOwnerComponent()
            .oRootView.getController()
            .getODataHelper();
          var b = function (i) {
            var N = sap.ui.core.Fragment.byId(i, "pmNotifListNotifications");
            N.getBinding("items").filter(f, sap.ui.model.FilterType.Application);
            d.countHistoryNotifications(
              n,
              p.getController().getModel(C.MODEL.VIEW_PROP.NAME),
              p.getModel()
            );
          };
          var P = this._launchPopover({
            sFragmentName: "CurrentNotifications",
            oParentView: p,
            oModel: s.getModel(),
            fnBeforeOpen: b,
            oSourceInt: s,
            bDelayedOpen: false,
          });
          return P;
        },
        launchPopoverTechnicalObjectOverview: function (t, T, s, S, p) {
          var i = "";
          var c;
          if (!T) {
            T = t;
          }
          switch (s) {
            case C.MODEL.ODATA.TECH_OBJECT_TYPE_EQUI:
              i = "icon-equipment";
              c = "BusinessSuiteInAppSymbols";
              break;
            case C.MODEL.ODATA.TECH_OBJECT_TYPE_FLOC:
              i = "functional-location";
              break;
            default:
              i = "machine";
              break;
          }
          var m = p.getModel();
          var l = new sap.ui.model.odata.v2.ODataModel({
            serviceUrl: m.sServiceUrl,
          });
          sap.ui.getCore().getMessageManager().unregisterMessageProcessor(l);
          var o = new sap.ui.model.json.JSONModel();
          o.setProperty("/url", I.getIconURI(i, c));
          var f = function (r) {
            var g = r.__metadata.media_src;
            o.setProperty("/url", g);
          };
          var d = p
            .getController()
            .getOwnerComponent()
            .oRootView.getController()
            .getODataHelper();
          var a = d.getPathForTechnicalObjectThumbnailSet(T, s);
          l.read(a, { success: f });
          var b = function (g, P) {
            P.setModel(o, "thumbnail");
            P.refreshAttachments = function () {
              var A = sap.ui.core.Fragment.byId(
                g,
                "pmNotifViewTechnicalObjectOverviewAttachmentsSimple"
              );
              A.data("technicalObjectNumber", T);
              A.data("technicalObjectType", s);
              A.getController().refresh();
            };
            P.refreshAttachments();
          };
          var e = d.getPathForTechnicalObjectSet(t, s);
          var P = this._launchPopover({
            sFragmentName: "TechnicalObjectOverview",
            oParentView: p,
            oModel: S.getModel(),
            fnBeforeOpen: b,
            sContextPath: e,
            oSourceInt: S,
            bDelayedOpen: false,
          });
          return P;
        },
        launchPopoverEmployeeQuickView: function (u, s, p) {
          var d = p
            .getController()
            .getOwnerComponent()
            .oRootView.getController()
            .getODataHelper();
          var b = function (i, P) {
            var e = {
              phone: sap.m.QuickViewGroupElementType.phone,
              mobile: sap.m.QuickViewGroupElementType.mobile,
              email: sap.m.QuickViewGroupElementType.email,
            };
            P.setModel(new J(e), "elementType");
          };
          var c = s.getBindingContext().getPath();
          if (c.indexOf("/ContactSet(") !== 0) {
            c = d.getPathForUserId(u);
          }
          var P = this._launchPopover({
            sFragmentName: "EmployeeQuickView",
            oParentView: p,
            oModel: s.getModel(),
            fnBeforeOpen: b,
            sContextPath: c,
            oSourceInt: s,
            bDelayedOpen: true,
          });
          return P;
        },
        _launchPopover: function (p) {
          var P = {};
          var i = this.getUniqueId();
          var o = function () {
            if (typeof p.fnBeforeOpen !== "undefined") {
              p.fnBeforeOpen(i, P);
            }
            jQuery.sap.delayedCall(0, p.oParentView.getController(), function () {
              P.openBy(p.oSourceInt);
            });
          };
          P = sap.ui.xmlfragment(
            i,
            "i2d.eam.pmnotification.create.zeamntfcres1.view.fragments." + p.sFragmentName,
            p.oParentView.getController()
          );
          P.setModel(p.oModel);
          if (typeof p.sContextPath === "string" && p.sContextPath.length > 0) {
            P.bindElement(p.sContextPath);
          }
          if (typeof p.bDelayedOpen === "undefined" || p.bDelayedOpen === true) {
            var b = P.getElementBinding();
            b.attachDataReceived(o, P);
            if (b && b.getBoundContext()) {
              o();
            }
          } else {
            o();
          }
          p.oParentView.addDependent(P);
          return P;
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
        getUniqueId: function () {
          var d = new Date(),
            m = d.getMilliseconds() + "",
            u =
              "id" +
              ++d +
              m +
              (++this._iCounter === 10000
                ? (this._iCounter = 1)
                : this._iCounter);
          return u;
        },
      });
    }
  );
  