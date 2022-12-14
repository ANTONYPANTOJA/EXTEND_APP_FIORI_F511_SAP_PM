/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "sap/ui/base/Object",
      "sap/m/MessageBox",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
    ],
    function (B, M, C) {
      "use strict";
      return B.extend(
        "i2d.eam.pmnotification.create.zeamntfcres1.controller.ErrorHandler",
        {
          constructor: function (c) {
            this._oResourceBundle = c.getModel("i18n").getResourceBundle();
            this._oComponent = c;
            this._oModel = c.getModel();
            this._bMessageOpen = false;
            this._sErrorTitle = this._oResourceBundle.getText("xtit.error");
            this._sErrorText = this._oResourceBundle.getText("ymsg.errorText");
            this._oModel.attachEvent(
              "metadataFailed",
              function (e) {
                var p = e.getParameters();
                this._showMetadataError(
                  p.statusCode +
                    " (" +
                    p.statusText +
                    ")\r\n" +
                    p.message +
                    "\r\n" +
                    p.responseText +
                    "\r\n"
                );
              },
              this
            );
            this._oModel.attachEvent(
              "requestFailed",
              function (e) {
                var p = e.getParameters();
                if (
                  p.response.statusCode !== 404 ||
                  (p.response.statusCode === 404 &&
                    p.response.responseText.indexOf("Cannot POST") === 0)
                ) {
                  var d, t, r;
                  switch (p.response.statusCode) {
                    case "412":
                      d = this._oResourceBundle.getText(
                        "ymsg.errorSaveRequestPrecondFailedDetail"
                      );
                      t = this._oResourceBundle.getText(
                        "ymsg.errorSaveRequestPrecondFailedMessage"
                      );
                      break;
                    default:
                      try {
                        r = jQuery.parseJSON(e.getParameter("responseText"));
                      } catch (a) {
                        r = null;
                      }
                      if (r === null && p.response && p.response.responseText) {
                        try {
                          r = jQuery.parseJSON(p.response.responseText);
                        } catch (a) {
                          r = null;
                        }
                      }
                      if (
                        r &&
                        r.error &&
                        r.error.innererror &&
                        r.error.innererror.errordetails &&
                        r.error.innererror.errordetails[0] &&
                        r.error.innererror.errordetails[0].message
                      ) {
                        d =
                          p.response.statusCode +
                          " (" +
                          p.response.statusText +
                          ")\r\n" +
                          r.error.innererror.errordetails[0].message;
                        t = r.error.innererror.errordetails[0].message;
                      } else {
                        d =
                          p.response.statusCode +
                          " (" +
                          p.response.statusText +
                          ")\r\n" +
                          p.response.message +
                          "\r\n" +
                          p.response.responseText +
                          "\r\n";
                        if (r && r.error && r.error.message) {
                          t = r.error.message.value;
                        }
                      }
                      break;
                  }
                  this._showServiceError(t, d);
                }
              },
              this
            );
          },
          _showMetadataError: function (d) {
            var a = this._oComponent.oRootView.getController();
            M.show(this._sErrorText, {
              id: "metadataErrorMessageBox",
              icon: M.Icon.ERROR,
              title: this._sErrorTitle,
              details: d,
              styleClass: this._oComponent.getCompactCozyClass(),
              actions: [M.Action.RETRY, M.Action.CLOSE],
              onClose: function (A) {
                if (A === M.Action.RETRY) {
                  this._oModel.refreshMetadata();
                  a.setAppUnBusy();
                }
              }.bind(this),
            });
          },
          _showServiceError: function (t, d) {
            var e;
            var a = this._oComponent.oRootView.getController();
            if (!this._bMessageOpen) {
              e = typeof t !== "undefined" && t !== "" ? t : this._sErrorText;
              this._bMessageOpen = true;
              M.show(e, {
                id: "serviceErrorMessageBox",
                icon: M.Icon.ERROR,
                title: this._sErrorTitle,
                details: d,
                styleClass: this._oComponent.getCompactCozyClass(),
                actions: [M.Action.CLOSE],
                onClose: function () {
                  this._bMessageOpen = false;
                  a.setAppUnBusy();
                }.bind(this),
              });
            }
          },
        }
      );
    }
  );
  