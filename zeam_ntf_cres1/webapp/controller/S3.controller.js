sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "sap/m/MessageBox",
      "sap/ui/model/json/JSONModel",
    ],
    function (C, B, f, M, J) {
      "use strict";
      return B.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.S3", {
        formatter: f,
        _oDataHelper: null,
        _oViewProperties: null,
        _oAppModel: null,
        _sContextPath: null,
        _oAttachmentComponent: null,
        _sNotificationNumber: "",
        _oNotification: null,
        onInit: function () {
          this._oAppModel = this.getModel(C.MODEL.APP_MODEL.NAME);
          this._refreshViewPropertiesModel();
          this.setAppBusyComplex({ delay: 0 });
          this.getView()
            .loaded()
            .then(
              function () {
                this._oDataHelper = this.getODataHelper();
              }.bind(this)
            );
          this.oShareModel = new J({
            bookmarkTitle: this.getResourceBundle().getText(
              "xtit.displayNotification"
            ),
            bookmarkIcon: "sap-icon://S4Hana/S0012",
          });
          this.setModel(this.oShareModel, "share");
          this.getRouter()
            .getRoute(C.ROUTES.DISPLAY)
            .attachMatched(this.onRoutePatternMatched, this);
        },
        onRoutePatternMatched: function (e) {
          this._sNotificationNumber =
            e.getParameter("arguments").NotificationNumber;
          if (!this._sNotificationNumber) {
            return;
          }
          Promise.all([
            this.getView().loaded(),
            this.getModel().metadataLoaded(),
          ]).then(
            function () {
              var n = String("000000000000" + this._sNotificationNumber).slice(
                -12
              );
              this._sContextPath = this.getODataHelper().getPathForNotificationNo(
                this._sNotificationNumber
              );
              this._bindView(this._sContextPath);
              var t = this.byId("pmNotifTimelineTimelineNotes");
              var T = t.getHeaderBar();
              T.removeAllContent();
              if (!T.getModel(C.MODEL.VIEW_PROP.NAME)) {
                T.setModel(this._oViewProperties, C.MODEL.VIEW_PROP.NAME);
              }
              T.setDesign(sap.m.ToolbarDesign.Transparent);
              T.addContent(
                new sap.m.Title({ text: "{viewProperties>/NotesTitle}" })
              );
              var b = t.getBinding("content");
              b.suspend();
              b.attachDataRequested(function () {
                t.setBusy(true);
              });
              b.attachDataReceived(function () {
                t.setBusy(false);
              });
              b.attachChange(
                function () {
                  this._oViewProperties.setProperty(
                    C.MODEL.VIEW_PROP.PROPERTIES.S3.TITLE_NOTES,
                    this.getResourceBundle().getText(
                      "xtit.tabNotesCounter",
                      b.getLength().toString()
                    )
                  );
                }.bind(this)
              );
              var c = this.byId("pmNotifTableContactsTable");
              var o = c.getBinding("items");
              o.suspend();
              o.attachDataRequested(function () {
                c.setBusy(true);
              });
              o.attachDataReceived(function () {
                c.setBusy(false);
              });
              o.attachChange(
                function () {
                  this._oViewProperties.setProperty(
                    C.MODEL.VIEW_PROP.PROPERTIES.S3.TITLE_CONTACTS,
                    this.getResourceBundle().getText(
                      "xtit.tabContactsCounter",
                      o.getLength().toString()
                    )
                  );
                }.bind(this)
              );
              var a = n;
              if (
                this._oAppModel.getProperty(
                  C.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE
                )
              ) {
                var d = this;
                this._initAttachmentComponent(
                  this._oAttachmentComponent,
                  {
                    mode: C.ATTACHMENTS.ATTACHMENTMODE_DISPLAY,
                    objectType: C.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
                    objectKey: a,
                  },
                  "pmNotifContainerAttachments"
                ).then(function (A) {
                  d._oAttachmentComponent = A;
                });
              }
              var i = this.byId("pmNotifIconTab");
              i.setSelectedKey("request");
            }.bind(this)
          );
        },
        onIconTabFilterSelected: function (e) {
          switch (e.getParameter("key")) {
            case "notes":
              var n = this.byId("pmNotifTimelineTimelineNotes").getBinding(
                "content"
              );
              if (n.isSuspended()) {
                n.refresh();
                n.resume();
              }
              break;
            case "contacts":
              var c = this.byId("pmNotifTableContactsTable").getBinding("items");
              if (c.isSuspended()) {
                c.refresh();
                c.resume();
              }
              break;
          }
        },
        onPressTelephoneNumber: function (e) {
          sap.m.URLHelper.triggerTel(e.getSource().getText());
        },
        onPressEmail: function (e) {
          this.onShareEmailPress({ sReceiver: e.getSource().getText() });
        },
        onMessageButtonPressed: function (e) {
          this.getMessagePopover().toggle(e.getSource());
        },
        onPressContact: function (e) {
          var i = e.getSource();
          this.getUtil().launchPopoverEmployeeQuickView(
            i.getBindingContext().getObject().Partner,
            e.getSource(),
            this.getView()
          );
        },
        onPressReporter: function (e) {
          this.getUtil().launchPopoverEmployeeQuickView(
            this.getObject().ReporterUserId,
            e.getSource(),
            this.getView()
          );
        },
        onTimelineUserNameClicked: function (e) {
          var i = e.getSource();
          this.getUtil().launchPopoverEmployeeQuickView(
            i.getBindingContext().getObject().CreatorUsername,
            e.getSource(),
            this.getView()
          );
        },
        onEditPressed: function () {
          var n = this.getObject().NotificationNumber;
          this.getView().unbindElement();
          this.navTo(C.ROUTES.EDIT, { NotificationNumber: n });
        },
        onDeletePressed: function () {
          var t = this;
          var n = this.getObject().NotificationNumber;
          var c = !!this.getView().$().closest(".sapUiSizeCompact").length;
          M.show(this.getResourceBundle().getText("ymsg.deleteConfirm", n), {
            icon: M.Icon.WARNING,
            title: this.getResourceBundle().getText("xtit.delete"),
            actions: [M.Action.OK, M.Action.CANCEL],
            onClose: function (a) {
              if (a === M.Action.OK) {
                t.setAppBusy();
                t._oDataHelper.deleteNotification(n);
              }
            },
            styleClass: c ? "sapUiSizeCompact" : "",
          });
        },
        onNavBack: function () {
          this.getView().unbindElement();
          this.navBack();
        },
        getAttachmentComponent: function () {
          return this._oAttachmentComponent;
        },
        _refreshViewPropertiesModel: function () {
          var g = C.MODEL.VIEW_PROP.PROPERTIES.GENERAL;
          if (!this._oViewProperties) {
            this._oViewProperties = new sap.ui.model.json.JSONModel();
            this.getView().setModel(
              this._oViewProperties,
              C.MODEL.VIEW_PROP.NAME
            );
          }
          this._oViewProperties.setProperty(g.CNT_CURRENT_NOTIFICATIONS, 0);
          var n = this.getObject();
          if (n) {
            this._oViewProperties.setProperty(
              g.GPS_DATA_AVAILABLE,
              n[C.GENERAL.LOCATION_GPS.substring(1)] &&
                n[C.GENERAL.LOCATION_GPS.substring(1)] !== ""
                ? true
                : false
            );
            this._oViewProperties.setProperty(
              g.TECHNICAL_OBJECT_VALID,
              n.TechnicalObjectNumber !== "" ? true : false
            );
            this._oViewProperties.setProperty(g.VALID_USER_GIVEN, false);
            this._oViewProperties.setProperty(g.CHANGE_ALLOWED, false);
            this._oViewProperties.setProperty(
              g.NAVTOEDIT_ALLOWED,
              !this.hasPendingChangesForOtherNotification({
                sObjectKey: n.NotificationNumber,
              })
            );
            this.getAppController().setPropUserValid.apply(this);
          } else {
            this._oViewProperties.setProperty(g.GPS_DATA_AVAILABLE, false);
            this._oViewProperties.setProperty(g.VALID_USER_GIVEN, false);
            this._oViewProperties.setProperty(g.TECHNICAL_OBJECT_VALID, false);
            this._oViewProperties.setProperty(g.CHANGE_ALLOWED, false);
            this._oViewProperties.setProperty(g.NAVTOEDIT_ALLOWED, false);
          }
        },
        _bindView: function (o) {
          var t = this;
          this.getView().bindElement({
            path: o,
            parameters: { expand: "LongText01" },
            events: {
              change: function () {
                t.setAppUnBusy();
              },
              dataRequested: function () {
                t.setAppBusyComplex({ delay: 0 });
              },
              dataReceived: function () {
                t.setAppUnBusy();
                var e = t.getView().getElementBinding();
                if (!e.getBoundContext()) {
                  t.getRouter().getTargets().display("objectNotFound");
                  return;
                }
                t._refreshViewPropertiesModel();
                t.getODataHelper().countOpenNotifications(
                  t.getObject(),
                  t._oViewProperties,
                  t.getView().getModel()
                );
              },
            },
          });
          var b = this.getView().getBindingContext();
          if (b && b.getPath() === o) {
            this.getView().getElementBinding().refresh();
          }
        },
      });
    }
  );
  