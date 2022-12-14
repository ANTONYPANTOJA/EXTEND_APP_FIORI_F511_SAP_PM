/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/m/Text", "sap/ui/core/format/DateFormat"], function (T, D) {
    "use strict";
    return {
      formatCurrentNotificationLink: function (c) {
        var b = this.getModel("i18n").getResourceBundle();
        var l = b.getText("xlnk.currentNotifications", [c]);
        return l;
      },
      formatDateMonitorTooltip: function (d) {
        var t = "";
        var b = this.getModel("i18n").getResourceBundle();
        switch (d) {
          case "I":
            t = b.getText("xtol.inactive");
            break;
          case "G":
            t = b.getText("xtol.startDateNotReached");
            break;
          case "Y":
            t = b.getText("xtol.endDateNotReached");
            break;
          case "R":
            t = b.getText("xtol.endDateReached");
            break;
          default:
            break;
        }
        return t;
      },
      formatDateMonitorToIcon: function (d) {
        if (!this.getModel("device").getProperty("/system/phone")) {
          return "";
        }
        switch (d) {
          case "I":
            return sap.ui.core.IconPool.getIconURI("status-inactive");
          case "G":
            return sap.ui.core.IconPool.getIconURI("status-positive");
          case "Y":
            return sap.ui.core.IconPool.getIconURI("status-in-process");
          case "R":
            return sap.ui.core.IconPool.getIconURI("status-negative");
          default:
            return sap.ui.core.IconPool.getIconURI("status-inactive");
        }
      },
      formatDateMonitorToIconNoSizeCheck: function (d) {
        switch (d) {
          case "I":
            return sap.ui.core.IconPool.getIconURI("status-inactive");
          case "G":
            return sap.ui.core.IconPool.getIconURI("status-positive");
          case "Y":
            return sap.ui.core.IconPool.getIconURI("status-in-process");
          case "R":
            return sap.ui.core.IconPool.getIconURI("status-negative");
          default:
            return sap.ui.core.IconPool.getIconURI("status-inactive");
        }
      },
      formatDateMonitorToIconColor: function (d) {
        switch (d) {
          case "I":
            return sap.ui.core.IconColor.Default;
          case "G":
            return sap.ui.core.IconColor.Positive;
          case "Y":
            return sap.ui.core.IconColor.Critical;
          case "R":
            return sap.ui.core.IconColor.Negative;
          default:
            return sap.ui.core.IconColor.Default;
        }
      },
      formatDateMonitorToText: function (d) {
        var b = this.getModel("i18n").getResourceBundle();
        if (this.getModel("device").getProperty("/system/phone")) {
          return "";
        }
        switch (d) {
          case "I":
            return b.getText("xsel.dateMonitorStatusInactice");
          case "G":
            return b.getText("xsel.dateMonitorStatusStartDateNotReached");
          case "Y":
            return b.getText("xsel.dateMonitorStatusEndDateNotReached");
          case "R":
            return b.getText("xsel.dateMonitorStatusOverdue");
          default:
            return b.getText("xsel.dateMonitorStatusInactice");
        }
      },
      formatDateMonitorToState: function (d) {
        switch (d) {
          case "I":
            return sap.ui.core.ValueState.Warning;
          case "G":
            return sap.ui.core.ValueState.Success;
          case "Y":
            return sap.ui.core.ValueState.Warning;
          case "R":
            return sap.ui.core.ValueState.Error;
          default:
            return sap.ui.core.ValueState.None;
        }
      },
      formatDateTimeToString: function (d) {
        if (d !== null) {
          if (typeof d === "string") {
            d = d.replace("/Date(", "").replace(")/", "");
            d = parseInt(d, 10);
            d = new Date(d);
          }
          var a = D.getDateTimeInstance({ style: "medium" });
          if (d) {
            return a.format(d);
          }
        }
      },
      checkForValidValue: function (v) {
        if (v === null || typeof v === "undefined" || v === "") {
          return false;
        } else {
          return typeof v === "boolean" ? v : true;
        }
      },
      formatAttachmentIcon: function (m) {
        var a = {};
        a["application/msword"] = "sap-icon://doc-attachment";
        a[
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ] = "sap-icon://doc-attachment";
        a["application/rtf"] = "sap-icon://doc-attachment";
        a["application/pdf"] = "sap-icon://pdf-attachment";
        a["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] =
          "sap-icon://excel-attachment";
        a["application/msexcel"] = "sap-icon://excel-attachment";
        a["application/vnd.ms-powerpoint"] = "sap-icon://ppt-attachment";
        a[
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ] = "sap-icon://ppt-attachment";
        a[
          "application/vnd.openxmlformats-officedocument.presentationml.slideshow"
        ] = "sap-icon://ppt-attachment";
        a["application/mspowerpoint"] = "sap-icon://ppt-attachment";
        a["application/xml"] = "sap-icon://attachment-html";
        a["application/xhtml+xml"] = "sap-icon://attachment-html";
        a["application/x-httpd-php"] = "sap-icon://attachment-html";
        a["application/x-javascript"] = "sap-icon://attachment-html";
        a["application/gzip"] = "sap-icon://attachment-zip-file";
        a["application/x-rar-compressed"] = "sap-icon://attachment-zip-file";
        a["application/x-tar"] = "sap-icon://attachment-zip-file";
        a["application/zip"] = "sap-icon://attachment-zip-file";
        a["audio/voxware"] = "sap-icon://attachment-audio";
        a["audio/x-aiff"] = "sap-icon://attachment-audio";
        a["audio/x-midi"] = "sap-icon://attachment-audio";
        a["audio/x-mpeg"] = "sap-icon://attachment-audio";
        a["audio/x-pn-realaudio"] = "sap-icon://attachment-audio";
        a["audio/x-pn-realaudio-plugin"] = "sap-icon://attachment-audio";
        a["audio/x-qt-stream"] = "sap-icon://attachment-audio";
        a["audio/x-wav"] = "sap-icon://attachment-audio";
        a["image/png"] = "sap-icon://attachment-photo";
        a["image/tiff"] = "sap-icon://attachment-photo";
        a["image/bmp"] = "sap-icon://attachment-photo";
        a["image/jpeg"] = "sap-icon://attachment-photo";
        a["image/jpg"] = "sap-icon://attachment-photo";
        a["image/gif"] = "sap-icon://attachment-photo";
        a["text/plain"] = "sap-icon://attachment-text-file";
        a["text/comma-separated-values"] = "sap-icon://attachment-text-file";
        a["text/css"] = "sap-icon://attachment-text-file";
        a["text/html"] = "sap-icon://attachment-text-file";
        a["text/javascript"] = "sap-icon://attachment-text-file";
        a["text/plain"] = "sap-icon://attachment-text-file";
        a["text/richtext"] = "sap-icon://attachment-text-file";
        a["text/rtf"] = "sap-icon://attachment-text-file";
        a["text/tab-separated-values"] = "sap-icon://attachment-text-file";
        a["text/xml"] = "sap-icon://attachment-text-file";
        a["video/mpeg"] = "sap-icon://attachment-video";
        a["video/quicktime"] = "sap-icon://attachment-video";
        a["video/x-msvideo"] = "sap-icon://attachment-video";
        a["application/x-shockwave-flash"] = "sap-icon://attachment-video";
        return a[m] ? a[m] : "sap-icon://document";
      },
      formatNumberDescriptionAsText: function (n, d) {
        var s = "";
        if (!d === true) {
          if (!n === true) {
            s = "";
          } else {
            s = n;
          }
        } else {
          if (!n === true) {
            s = d;
          } else {
            s = n + " (" + d + ")";
          }
        }
        return s;
      },
      formatDescriptionNumberAsText: function (d, n) {
        var s = "";
        if (!d === true) {
          if (!n === true) {
            s = "";
          } else {
            s = n;
          }
        } else {
          if (!n === true) {
            s = d;
          } else {
            s = d + " (" + n + ")";
          }
        }
        return s;
      },
    };
  });
  