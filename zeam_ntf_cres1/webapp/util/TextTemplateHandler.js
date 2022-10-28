/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    ["i2d/eam/pmnotification/create/zeamntfcres1/util/Constants"],
    function (C) {
      "use strict";
      var _;
      var a = [];
      var b = "";
      var c = [];
      var d;
      var e;
      var f;
      var g = [];
      var h = function (E) {
        jQuery.sap.log.info(
          "### TextTemplateHandler -> template selected:" +
            E.getSource().getText()
        );
        var B = E.getSource().getText();
        var L = _[B];
        f.setProperty(b, L);
      };
      var j = function () {
        c = [];
        _ = {};
        jQuery.sap.log.info(
          "### TextTemplateHandler -> ActionSheet creation for:" + a
        );
        for (var i = 0; i < a.length; i++) {
          c.push(
            new sap.m.Button("buttonTextTemplate" + i, {
              text: a[i].Description,
              press: h,
              icon: "sap-icon://document-text",
            })
          );
          _[a[i].Description] = a[i].Text;
        }
        return new sap.m.ActionSheet("textTemplateSheet", {
          buttons: c,
          title: e.getResourceBundle().getText("xtit.chooseTextTemplate"),
          showCancelButton: true,
        });
      };
      var k = function (D) {
        var t = false;
        a = D.results ? D.results : [];
        if (a.length > 0) {
          t = true;
        }
        e.getModel(C.MODEL.VIEW_PROP.NAME).setProperty(
          C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TEXTTEMPLATES_AVAILABLE,
          t
        );
        jQuery.sap.log.info(
          "### TextTemplateHandler -> read templates succesful:" + a
        );
      };
      var l = function (E) {
        jQuery.sap.log.error(
          "### TextTemplateHandler -> read templates failed:" + E
        );
      };
      var m = function (M) {
        var n = [];
        var N = [];
        if (
          e.getObject() &&
          e.getObject().TechnicalObjectType &&
          e.getObject().TechnicalObjectType.length > 0
        ) {
          n.push(
            new sap.ui.model.Filter({
              path: "TechnicalObjectType",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: e.getObject().TechnicalObjectType,
            })
          );
          N.push(e.getObject().TechnicalObjectType);
        }
        if (
          e.getObject() &&
          e.getObject().NotificationType &&
          e.getObject().NotificationType.length > 0
        ) {
          n.push(
            new sap.ui.model.Filter({
              path: "NotificationType",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: e.getObject().NotificationType,
            })
          );
          N.push(e.getObject().NotificationType);
        }
        if (
          e.getObject() &&
          e.getObject().TechnicalObjectNumber &&
          e.getObject().TechnicalObjectNumber.length > 0
        ) {
          n.push(
            new sap.ui.model.Filter({
              path: "TechnicalObjectNumber",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: e.getObject().TechnicalObjectNumber,
            })
          );
          N.push(e.getObject().TechnicalObjectNumber);
        }
        if (g.length === 0 || N.toString() !== g.toString()) {
          g = N;
          M.read("/TextTemplateSet", { success: k, error: l });
        } else if (N.toString() === g.toString()) {
          var t = false;
          if (a.length > 0) {
            t = true;
          }
          e.getModel(C.MODEL.VIEW_PROP.NAME).setProperty(
            C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TEXTTEMPLATES_AVAILABLE,
            t
          );
        }
      };
      return {
        retrieveTemplates: function (M, v) {
          jQuery.sap.log.info(
            "### TextTemplateHandler -> retrieveTemplates for " + M
          );
          e = v;
          f = M;
          m(M);
        },
        startTemplateSelection: function (s, t) {
          jQuery.sap.log.info(
            "### TextTemplateHandler -> startTemplateSelection"
          );
          b = t;
          if (!d) {
            d = j();
          }
          d.openBy(s);
        },
      };
    }
  );
  