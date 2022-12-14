sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "sap/m/GroupHeaderListItem",
    ],
    function (C, B, f, G) {
      "use strict";
      return B.extend(
        "i2d.eam.pmnotification.create.zeamntfcres1.controller.LinksForTechnicalObject",
        {
          formatter: f,
          _bCurrentEntryFound: false,
          _bHistoryEntryFound: false,
          onPressTechnicalObjectOverview: function (e) {
            var n = this.getObject();
            this.getUtil().launchPopoverTechnicalObjectOverview(
              n.TechnicalObjectNumber,
              n.TecObjNoLeadingZeros,
              n.TechnicalObjectType,
              e.getSource(),
              this.getView()
            );
          },
          onPressCurrentNotifications: function (e) {
            var n = this.getObject();
            var F = this.getAppController().buildFilterForNotifications(
              n,
              C.GENERAL.COUNT_ALL_NOTIFICATIONS
            );
            this.oCurrentNotifPopover =
              this.getUtil().launchPopoverCurrentNotifications(
                n,
                F,
                e.getSource(),
                this.getView()
              );
            this._bCurrentEntryFound = false;
            this._bHistoryEntryFound = false;
          },
          onPressNotification: function (e) {
            var c = e.getSource().getBindingContext();
            var n = c.getProperty("NotificationNumber");
            this.navTo(C.ROUTES.DISPLAY, {
              NotificationNumber: encodeURIComponent(n),
            });
            if (this.oCurrentNotifPopover) {
              this.oCurrentNotifPopover.close();
            }
          },
          getGroupHeader: function (g) {
            var t;
            var v = true;
            var c = this.getView()
              .getModel(C.MODEL.VIEW_PROP.NAME)
              .getProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_CURRENT_NOTIFICATIONS
              );
            var s = this.getView()
              .getModel(C.MODEL.VIEW_PROP.NAME)
              .getProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_HISTORY_NOTIFICATIONS
              );
            switch (g.key) {
              case "4":
                t = this.getResourceBundle().getText(
                  "xtit.groupHistoryNotifications",
                  [s]
                );
                if (this._bHistoryEntryFound) {
                  v = false;
                }
                this._bHistoryEntryFound = true;
                break;
              case "5":
                t = this.getResourceBundle().getText(
                  "xtit.groupHistoryNotifications",
                  [s]
                );
                if (this._bHistoryEntryFound) {
                  v = false;
                }
                this._bHistoryEntryFound = true;
                break;
              default:
                t = this.getResourceBundle().getText(
                  "xtit.groupCurrentNotifications",
                  [c]
                );
                if (this._bCurrentEntryFound) {
                  v = false;
                }
                this._bCurrentEntryFound = true;
            }
            return new G({ title: t, upperCase: false, visible: v });
          },
        }
      );
    }
  );
  