/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/TextTemplateHandler",
      "sap/ui/core/format/DateFormat",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "sap/m/MessageBox",
    ],
    function (C, B, J, T, D, f, M) {
      "use strict";
      return B.extend(
        "i2d.eam.pmnotification.create.zeamntfcres1.controller.MaintainNotification",
        {
          formatter: f,
          _oDataHelper: null,
          _oAppModel: null,
          _oViewProperties: null,
          _oTextTemplateHelper: null,
          _oAttachmentComponent: null,
          _oNewLongText: null,
          _sAttachObjectKey: "",
          _isSubmittingChanges: false,
          _sNotificationId: null,
          _oNotifTypeControl: null,
          _isRoutePatternMatched: false,
          _isAppStateApplied: false,
          _isViewBindingDone: false,
          _isLongtextBindingDone: false,
          _bViewBindingOn: false,
          _sLastNotificationType: "",
          _bTypeChangeLoaded: false,
          _sContextPath: null,
          onInit: function () {
            this._oAppModel = this.getModel(C.MODEL.APP_MODEL.NAME);
            this.getView()
              .loaded()
              .then(
                function () {
                  this._oDataHelper = this.getODataHelper();
                }.bind(this)
              );
            this._oTextTemplateHelper = T;
            this._initNotificationTypeControl();
            var e = this.getView().byId("pmNotifSelectEffect");
            e.bindAggregation("items", {
              path: "/MalfunctionEffectSet",
              sorter: new sap.ui.model.Sorter("Effect"),
              template: new sap.ui.core.ListItem({
                key: "{Effect}",
                text: "{= ${Effect} === ''? '' : ${Effect} + ' (' + ${EffectText} + ')'}",
              }),
            });
          },
          initViewPropertiesModel: function () {
            var s = false;
            if (!this._oViewProperties) {
              this._oViewProperties = new J();
              s = true;
            }
            this.refreshViewProperties();
            if (s) {
              this.getView()
                .getParent()
                .setModel(this._oViewProperties, C.MODEL.VIEW_PROP.NAME);
            }
            return this.getView().getParent().getModel(C.MODEL.VIEW_PROP.NAME);
          },
          refreshViewProperties: function () {
            var g = C.MODEL.VIEW_PROP.PROPERTIES.GENERAL;
            this._oViewProperties.setProperty(g.TECHNICAL_OBJECT_GIVEN, false);
            this._oViewProperties.setProperty(g.TECHNICAL_OBJECT_VALID, false);
            this._oViewProperties.setProperty(g.TEXTTEMPLATES_AVAILABLE, false);
            this._oViewProperties.setProperty(g.DISPLAY_MAP_INPLACE, false);
            this._oViewProperties.setProperty(g.GPS_DATA_AVAILABLE, false);
            this._oViewProperties.setProperty(g.USER_CAN_BE_NOTIFIED, false);
            if (
              typeof this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
              ) === "undefined"
            ) {
              this._oViewProperties.setProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED,
                false
              );
            } else if (
              this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
              )
            ) {
              this._oViewProperties.setProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED,
                !this.hasPendingChangesForOtherNotification({
                  oPaths: this._getObjectPaths(),
                })
              );
            } else {
              this._oViewProperties.setProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED,
                !this.hasPendingChangesForOtherNotification({
                  sObjectKey: this._sNotificationId,
                })
              );
            }
            this._oViewProperties.setProperty(
              g.ADDITIONAL_SEARCH_OPTIONS_ON,
              this.isLinkAdditionalSearchOptionsVisible()
            );
            this._oViewProperties.setProperty(
              C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_CURRENT_NOTIFICATIONS,
              0
            );
          },
          initializeNewNotificationData: function () {
            var a;
            var n;
            this._oAppModel.setProperty(
              C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE,
              true
            );
            if (
              !this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_METADATA_LOADED
              )
            ) {
              return;
            }
            this.setAppUnBusy();
            if (this.getModel().hasPendingChanges()) {
              return;
            }
            if (typeof this._oNotifTypeControl !== "undefined") {
              this._bindNotificationTypeControl();
            }
            var m = this.getModel();
            n = m.createEntry(this._oDataHelper.getPathForNotificationHeaders(), {
              groupId: C.GENERAL.NOTIFICATION_BATCH_GROUP,
              changeSetId: C.GENERAL.NOTIFICATION_CHANGE_SET,
            });
            this._oNewLongText = m.createEntry(
              this._oDataHelper.getPathForLongTextSet(),
              {
                groupId: C.GENERAL.NOTIFICATION_BATCH_GROUP,
                changeSetId: C.GENERAL.NOTIFICATION_CHANGE_SET,
              }
            );
            if (sap.ushell.Container) {
              var u = sap.ushell.Container.getService("UserInfo").getId();
            }
            m.setProperty(n.sPath + "/NotificationTimestamp", new Date());
            m.setProperty(n.sPath + "/Reporter", u);
            m.setProperty(this._oNewLongText.sPath + "/IsHistorical", false);
            this._bViewBindingOn = false;
            this.getView()
              .byId("pmNotifLongTextCreate")
              .setBindingContext(this._oNewLongText);
            this.getView().setBindingContext(n);
            if (
              this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_STARTUP_CREATE
              ) === true
            ) {
              var c = this.getOwnerComponent().getComponentData();
              if (c && c.startupParameters) {
                for (var k in c.startupParameters) {
                  var v = c.startupParameters[k][0]
                    ? c.startupParameters[k][0]
                    : "";
                  switch (k) {
                    case "NotificationType":
                      m.setProperty(n.sPath + "/NotificationType", v);
                      break;
                    case "TechnicalObject":
                    case "TechnicalObjectLabel":
                      m.setProperty(n.sPath + "/TechnicalObjectNumber", v);
                      break;
                    case "TechObjIsEquipOrFuncnlLoc":
                      m.setProperty(n.sPath + "/TechnicalObjectType", v);
                      break;
                  }
                }
              }
            }
            this._sNotificationId =
              this._sAttachObjectKey =
              a =
                this._getObjectKey(n.sPath);
            this._setObjectPaths(
              n.sPath.substring(1),
              this._oNewLongText.sPath.substring(1)
            );
            this.refreshViewProperties();
            if (
              this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE
              )
            ) {
              m.setProperty(n.sPath + "/AttachmentId", a);
              if (this._sAttachObjectKey) {
                var t = this;
                this._initAttachmentComponent(
                  this._oAttachmentComponent,
                  {
                    mode: C.ATTACHMENTS.ATTACHMENTMODE_CREATE,
                    objectType: C.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
                    objectKey: this._sAttachObjectKey,
                  },
                  "pmNotifContainerAttachments"
                ).then(function (A) {
                  t._oAttachmentComponent = A;
                });
              }
            }
            this._oTextTemplateHelper.retrieveTemplates(this.getModel(), this);
            this._unchangedNotification = JSON.stringify(n.getObject());
            this._isViewBindingDone = true;
            this._isLongtextBindingDone = true;
            this._applyAppState();
          },
          routePatternMatched: function (e) {
            var t = this,
              E;
            if (e.getParameters) {
              E = e.getParameters();
            } else {
              E = e;
            }
            this._bHasPendingChanges = false;
            switch (E.name) {
              case C.ROUTES.CREATE:
                this._oAppModel.setProperty(
                  C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE,
                  true
                );
                this._bHasPendingChanges =
                  this.hasPendingChangesForOtherNotification({
                    oPaths: this._getObjectPaths(),
                  });
                this.initializeNewNotificationData();
                break;
              case C.ROUTES.EDIT:
                this._oAppModel.setProperty(
                  C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE,
                  false
                );
                this._sNotificationId = E["arguments"].NotificationNumber;
                this._bHasPendingChanges =
                  this.hasPendingChangesForOtherNotification({
                    sObjectKey: this._sNotificationId,
                  });
                this._resetBindingFlags();
                this.resetValueStates();
                this._bViewBindingOn = true;
                this._sContextPath =
                  this.getODataHelper().getPathForNotificationNo(
                    this._sNotificationId
                  );
                this.getView()
                  .getParent()
                  .getParent()
                  .bindElement({
                    path: this._sContextPath,
                    events: {
                      change: function () {
                        t.setAppUnBusy();
                      },
                      dataRequested: function () {
                        t.setAppBusyComplex({ delay: 0 });
                      },
                      dataReceived: this._onBindingDataReceived.bind(this),
                    },
                  });
                this._extractNotification();
                if (
                  !this.getView().byId("pmNotifLongTextEdit").isBound("content")
                ) {
                  var c = new sap.ui.layout.VerticalLayout({
                    width: "100%",
                    content: [
                      new i2d.eam.pmnotification.create.zeamntfcres1.util.ExpandableTextArea(
                        {
                          editable: false,
                          rows: 5,
                          value: "{ReadOnlyText}",
                          visible:
                            "{= ${IsHistorical} === true && ${ReadOnlyText} !== '' }",
                          wrapping: "None",
                          width: "100%",
                        }
                      ),
                      new i2d.eam.pmnotification.create.zeamntfcres1.util.ExpandableTextArea(
                        {
                          change: this.onInputChange.bind(this),
                          placeholder: "{i18n>ymsg.addDetails}",
                          rows: 5,
                          value: "{UpdateText}",
                          visible: true,
                          wrapping: "None",
                          width: "100%",
                        }
                      ),
                    ],
                  });
                  this.getView()
                    .byId("pmNotifLongTextEdit")
                    .bindAggregation("content", {
                      path: "LongText01",
                      template: c,
                    });
                }
                this.byId("pmNotifLongTextEdit")
                  .getBinding("content")
                  .attachEventOnce(
                    "dataReceived",
                    function () {
                      this._isLongtextBindingDone = true;
                      this._applyAppState();
                    },
                    this
                  );
                this._sAttachObjectKey = String(
                  "000000000000" + this._sNotificationId
                ).slice(-12);
                if (
                  this._oAppModel.getProperty(
                    C.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE
                  ) &&
                  this._sAttachObjectKey
                ) {
                  var t = this;
                  this._initAttachmentComponent(
                    this._oAttachmentComponent,
                    {
                      mode: C.ATTACHMENTS.ATTACHMENTMODE_CREATE,
                      objectType: C.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
                      objectKey: this._sAttachObjectKey,
                    },
                    "pmNotifContainerAttachments"
                  ).then(function (a) {
                    t._oAttachmentComponent = a;
                  });
                }
                break;
              default:
                break;
            }
            this._isRoutePatternMatched = true;
            this._applyAppState();
            this._checkForPendingChangesAndAskForDiscard();
          },
          onShowEmployeeDetails: function (e) {
            var n = this.getObject();
            this.getUtil().launchPopoverEmployeeQuickView(
              n.ReporterUserId,
              e.getSource(),
              this.getView()
            );
          },
          onShareEmailPress: function () {
            if (B.prototype.onShareEmailPress) {
              B.prototype.onShareEmailPress.apply(this, arguments);
            }
          },
          onTechnicalObjectChange: function () {
            if (!this.getView().getBindingContext()) {
              return;
            }
            if (this._bViewBindingOn === true) {
              this._bViewBindingOn = false;
              return;
            }
            var n = this.getObject();
            if (n.TechnicalObjectNumber !== "" && n.TechnicalObjectType !== "") {
              this._setPropertyTechnicalObjectValid(true);
              this.getODataHelper().countOpenNotifications(
                n,
                this._oViewProperties,
                this.getView().getModel()
              );
            }
          },
          onTechnicalObjectInvalidated: function () {
            this.hideLinksForTechnicalObject();
          },
          onReporterChange: function () {
            this.getAppController().setPropUserValid.apply(this);
          },
          onReporterInvalidated: function () {
            this._oViewProperties.setProperty(
              C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.VALID_USER_GIVEN,
              false
            );
          },
          onInputChange: function (e) {
            var F = e.getSource();
            if (this._fieldChange) {
              this._fieldChange(F);
            }
          },
          onTimePickerInputChange: function (e) {
            var t = e.getSource();
            var v = e.getParameter("valid");
            if (this._fieldChange) {
              this._fieldChange(t);
            }
            if (v) {
              t.setValueState(sap.ui.core.ValueState.None);
            } else {
              t.setValueState(sap.ui.core.ValueState.Error);
            }
          },
          onNotificationTypeChange: function (e) {
            var F = e.getSource();
            this._fieldChange(F);
            this._updateDependentValuesOnNotificationTypeChange();
            this._sLastNotificationType = this.getObject().NotificationType;
          },
          onAlsoFindVia: function (e) {
            var l = e.getSource();
            var p = this.getUtil().getFragmentDialog(this, "Search");
            p.openBy(l);
          },
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
          onUseTemplates: function (e) {
            var l =
              (this._oNewLongText
                ? this._oNewLongText.getPath()
                : this.byId("pmNotifLongTextEdit")
                    .getBinding("content")
                    .getContexts()[0]
                    .getPath()) + "/UpdateText";
            this._oTextTemplateHelper.startTemplateSelection(e.getSource(), l);
          },
          onSearchViaBarcode: function () {
            if (!this.isFunctionAvailable("cordova.plugins.barcodeScanner")) {
              jQuery.sap.require("sap.m.MessageToast");
              sap.m.MessageToast.show(
                this.getResourceBundle().getText("ymsg.barcodeNotAvailable"),
                {
                  duration: C.GENERAL.MESSAGETOAST_DELAY,
                  closeOnBrowserNavigation: C.GENERAL.MESSAGETOAST_CLOSE_ON_NAV,
                }
              );
              return;
            }
            var s = function (r) {
              var t = r.text + "";
              var o = this.getView().byId("pmNotifInputTechnicalObject");
              this._setPropertyTechnicalObjectValid(true);
              o.setObjectNumber(t);
            };
            var S = function () {
              jQuery.sap.require("sap.m.MessageToast");
              sap.m.MessageToast.show(
                this.getResourceBundle().getText("ymsg.barcodeScanFailed"),
                {
                  duration: C.GENERAL.MESSAGETOAST_DELAY,
                  closeOnBrowserNavigation: C.GENERAL.MESSAGETOAST_CLOSE_ON_NAV,
                }
              );
            };
            var b = this.getPlugin("cordova.plugins.barcodeScanner");
            b.scan(jQuery.proxy(s, this), jQuery.proxy(S, this));
          },
          _getObjectKey: function (o) {
            var O;
            if (/\'(.*?)\'/.test(o)) {
              O = /\'(.*?)\'/.exec(o)[1];
            }
            return O;
          },
          getAttachmentComponent: function () {
            return this._oAttachmentComponent;
          },
          hideLinksForTechnicalObject: function () {
            this._setPropertyTechnicalObjectValid(false);
          },
          validateNewNotification: function () {
            var o =
              !this._checkAndMarkEmptyMandatoryFields(true) &&
              !this._fieldWithErrorState() &&
              (this.getModel(C.MODEL.VIEW_PROP.NAME).getProperty(
                C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TECHNICAL_OBJECT_VALID
              ) ||
                this.byId("pmNotifInputTechnicalObject").getValue() === "");
            return o;
          },
          resetValueStates: function () {
            jQuery.each(
              $("#" + this.getView().getId()).find("*"),
              function (i, a) {
                if ($(a).control) {
                  var c = $(a).control(0);
                }
                if (c && c.setValueState) {
                  c.setValueState(sap.ui.core.ValueState.None);
                }
              }
            );
          },
          saveNotification: function () {
            if (this._isSubmittingChanges) {
              return;
            }
            function a() {
              this._isSubmittingChanges = false;
              this.getModel().setRefreshAfterChange(true);
            }
            function s(d) {
              var l = false;
              this._isSubmittingChanges = false;
              this.getModel().setRefreshAfterChange(true);
              if (d.__batchResponses) {
                var i;
                for (i = 0; i < d.__batchResponses.length && !l; i++) {
                  if (d.__batchResponses[i].__changeResponses) {
                    var j;
                    for (
                      j = 0;
                      j < d.__batchResponses[i].__changeResponses.length && !l;
                      j++
                    ) {
                      if (
                        d.__batchResponses[i].__changeResponses[j].statusCode &&
                        d.__batchResponses[i].__changeResponses[
                          j
                        ].statusCode.startsWith("2")
                      ) {
                        this._afterSuccessSave();
                        l = true;
                      }
                    }
                  }
                }
              }
            }
            if (this.getModel().hasPendingChanges()) {
              this._isSubmittingChanges = true;
              this.setAppBusy();
              this.getModel().setRefreshAfterChange(false);
              this.getModel().submitChanges({
                groupId: C.GENERAL.NOTIFICATION_BATCH_GROUP,
                success: jQuery.proxy(s, this),
                error: jQuery.proxy(a, this),
              });
            } else if (!this._isInCreateMode() && this._oAttachmentComponent) {
              this._oAttachmentComponent.getApplicationState(
                function (r) {
                  if (r) {
                    this._isSubmittingChanges = true;
                    try {
                      this._oAttachmentComponent.save(false);
                      this._afterSuccessSave();
                    } catch (e) {}
                  } else {
                    this._afterSuccessSave();
                  }
                }.bind(this)
              );
            } else {
              this._afterSuccessSave();
            }
          },
          cancelNotification: function () {
            var t = this;
            var n = this.getObject().NotificationNumber;
            if (this._isSubmittingChanges) {
              return;
            }
            function a() {
              t._isSubmittingChanges = false;
            }
            function A() {
              t._isSubmittingChanges = false;
              t.navBack();
            }
            if (this._isDirty() || this._oAttachmentComponent) {
              (this._oAttachmentComponent
                ? this._oAttachmentComponent.getApplicationState.bind(
                    this._oAttachmentComponent
                  )
                : function (c) {
                    c(true);
                  })(
                function (r) {
                  if (r || this._isDirty()) {
                    var c = !!this.getView().$().closest(".sapUiSizeCompact")
                      .length;
                    M.show(
                      this.getResourceBundle().getText("ymsg.warningConfirm"),
                      {
                        icon: M.Icon.WARNING,
                        title: this.getResourceBundle().getText(
                          "xsel.messageSeverityWarning"
                        ),
                        actions: [M.Action.OK, M.Action.CANCEL],
                        onClose: function (o) {
                          if (o === M.Action.OK) {
                            t.resetValueStates();
                            t._isSubmittingChanges = true;
                            t._oDataHelper.cancelNotification(
                              n,
                              t._oAttachmentComponent,
                              A,
                              a
                            );
                          }
                        },
                        styleClass: c ? "sapUiSizeCompact" : "",
                      }
                    );
                  } else {
                    this.resetValueStates();
                    this._isSubmittingChanges = true;
                    this._oDataHelper.cancelNotification(
                      n,
                      this._oAttachmentComponent,
                      A
                    );
                  }
                }.bind(this)
              );
            } else {
              this.resetValueStates();
              this._isSubmittingChanges = true;
              this._oDataHelper.cancelNotification(
                n,
                this._oAttachmentComponent,
                A
              );
            }
          },
          deleteNotification: function () {
            var t = this;
            var n = this.getObject().NotificationNumber;
            function a() {
              t._isSubmittingChanges = false;
            }
            function A() {
              t._isSubmittingChanges = false;
            }
            var c = !!this.getView().$().closest(".sapUiSizeCompact").length;
            M.show(this.getResourceBundle().getText("ymsg.deleteConfirm", n), {
              icon: M.Icon.WARNING,
              title: this.getResourceBundle().getText("xtit.delete"),
              actions: [M.Action.OK, M.Action.CANCEL],
              onClose: function (o) {
                if (o === M.Action.OK) {
                  t._isSubmittingChanges = true;
                  t.setAppBusy();
                  t._oDataHelper.deleteNotification(n, A, a);
                }
              },
              styleClass: c ? "sapUiSizeCompact" : "",
            });
          },
          _setPropertyTechnicalObjectValid: function (v) {
            this.getModel(C.MODEL.VIEW_PROP.NAME).setProperty(
              C.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TECHNICAL_OBJECT_VALID,
              v
            );
            if (v) {
              this.getView().rerender();
            }
          },
          _resetBindingFlags: function () {
            this._isViewBindingDone = false;
            this._isLongtextBindingDone = false;
          },
          _updateDependentValuesOnNotificationTypeChange: function () {
            if (!this.getObject()) {
              return;
            }
            this._setUserCanBeNotified();
            this._setNotificationTypeText();
          },
          _setUserCanBeNotified: function () {
            var u = false;
            var p = "";
            if (
              this.getObject().NotificationType !== "" &&
              typeof this.getObject().NotificationType !== "undefined"
            ) {
              if (this._isInCreateMode()) {
                p =
                  this._oDataHelper.getPathForNotificationType(
                    this.getObject().NotificationType
                  ) + "/UserCanBeNotified";
              } else {
                p =
                  this._oDataHelper.getPathForNotificationTypeChange(
                    this._sLastNotificationType,
                    this.getObject().NotificationType
                  ) + "/UserCanBeNotified";
              }
              u = this.getModel().getProperty(p)
                ? this.getModel().getProperty(p)
                : false;
            }
            this.getModel().setProperty(
              this.getView().getBindingContext().getPath() + "/UserCanBeNotified",
              u
            );
            if (!u) {
              this.getModel().setProperty(
                this.getView().getBindingContext().getPath() + "/Subscribed",
                false
              );
            }
          },
          _setNotificationTypeText: function () {
            var n = false;
            var p = "";
            if (
              this.getObject().NotificationType !== "" &&
              typeof this.getObject().NotificationType !== "undefined"
            ) {
              if (this._isInCreateMode()) {
                p =
                  this._oDataHelper.getPathForNotificationType(
                    this.getObject().NotificationType
                  ) + "/Description";
              } else {
                p =
                  this._oDataHelper.getPathForNotificationTypeChange(
                    this._sLastNotificationType,
                    this.getObject().NotificationType
                  ) + "/TargetNotificationTypeName";
              }
              n = this.getModel().getProperty(p)
                ? this.getModel().getProperty(p)
                : "";
            }
            this.getModel().setProperty(
              this.getView().getBindingContext().getPath() +
                "/NotificationTypeText",
              n
            );
          },
          _extractNotification: function () {
            var b = this.getView().getBindingContext();
            var n = null;
            if (b) {
              if (b.getPath() === this._sContextPath) {
                this.setAppUnBusy();
                this._isViewBindingDone = true;
                this._bViewBindingOn = false;
                n = b.getObject();
                this._sLastNotificationType = n.NotificationType;
                this._bindNotificationTypeControl();
                this.refreshViewProperties();
                if (n.TechnicalObjectNumber !== "") {
                  this._setPropertyTechnicalObjectValid(true);
                }
                this.getAppController().setPropUserValid.apply(this);
                this._oTextTemplateHelper.retrieveTemplates(
                  this.getModel(),
                  this
                );
                this.getODataHelper().countOpenNotifications(
                  n,
                  this._oViewProperties,
                  this.getView().getModel()
                );
                this._applyAppState();
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
          _initNotificationTypeControl: function () {
            this._oNotifTypeControl = this.getView().byId(
              "pmNotifComboBoxNotificationType"
            );
            if (typeof this._oNotifTypeControl !== "undefined") {
              this._oNotifTypeControl.onAfterRendering = function () {
                if (sap.m.ComboBox.prototype.onAfterRendering) {
                  sap.m.ComboBox.prototype.onAfterRendering.apply(this);
                }
                var c = this.$();
                if (c) {
                  c.bind("paste", function (e) {
                    e.preventDefault();
                  });
                  c.bind("drop", function (e) {
                    e.preventDefault();
                  });
                  c.keydown(function (e) {
                    if (
                      !(
                        e.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
                        e.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT ||
                        e.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
                        e.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
                        e.keyCode === jQuery.sap.KeyCodes.TAB ||
                        e.keyCode === jQuery.sap.KeyCodes.F1 ||
                        e.keyCode === jQuery.sap.KeyCodes.F10 ||
                        e.keyCode === jQuery.sap.KeyCodes.F11 ||
                        e.keyCode === jQuery.sap.KeyCodes.F12 ||
                        e.keyCode === jQuery.sap.KeyCodes.F2 ||
                        e.keyCode === jQuery.sap.KeyCodes.F3 ||
                        e.keyCode === jQuery.sap.KeyCodes.F4 ||
                        e.keyCode === jQuery.sap.KeyCodes.F5 ||
                        e.keyCode === jQuery.sap.KeyCodes.F6 ||
                        e.keyCode === jQuery.sap.KeyCodes.F7 ||
                        e.keyCode === jQuery.sap.KeyCodes.F8 ||
                        e.keyCode === jQuery.sap.KeyCodes.F9 ||
                        e.keyCode === jQuery.sap.KeyCodes.ESCAPE ||
                        e.keyCode === jQuery.sap.KeyCodes.ENTER
                      )
                    ) {
                      e.preventDefault();
                      return false;
                    }
                  });
                }
              };
            }
          },
          _bindNotificationTypeControl: function () {
            var t = this;
            var c = this.getObject() ? this.getObject().NotificationType : null,
              p = new sap.ui.model.Filter({
                path: "Type",
                test: function (s) {
                  if (t._isInCreateMode() || s === c) {
                    return true;
                  } else if (
                    t
                      .getModel()
                      .getProperty(
                        "/NotificationTypeChangeSet(SourceNotificationType='" +
                          c +
                          "',TargetNotificationType='" +
                          s +
                          "')"
                      )
                  ) {
                    return true;
                  }
                  return false;
                },
              });
            if (!t._oNotifTypeControl) {
              t._initNotificationTypeControl();
            }
            if (!t._oNotifTypeControl) {
              return;
            }
            this._oNotifTypeControl.bindAggregation("items", {
              path: "/NotificationTypeSet",
              sorter: new sap.ui.model.Sorter("Type"),
              template: new sap.ui.core.ListItem({
                key: "{Type}",
                text: "{Type} ({Description})",
              }),
              parameters: {
                operationMode: sap.ui.model.odata.OperationMode.Client,
              },
              events: {
                dataReceived: function () {
                  if (!t._isInCreateMode() && t.getObject()) {
                    if (
                      !t
                        .getModel()
                        .getProperty(
                          t
                            .getODataHelper()
                            .getPathForNotificationType(
                              t.getObject().NotificationType
                            )
                        )
                    ) {
                      t._oNotifTypeControl.addItem(
                        new sap.ui.core.ListItem({
                          key: t.getObject().NotificationType,
                          text:
                            t.getObject().NotificationType +
                            " (" +
                            t.getObject().NotificationTypeText +
                            ")",
                        })
                      );
                    }
                  }
                },
              },
            });
            if (!this._isInCreateMode()) {
              if (
                jQuery.grep(
                  Object.keys(this.getModel().getProperty("/")),
                  function (k) {
                    return k.indexOf("NotificationTypeChangeSet") !== -1;
                  }
                ).length === 0
              ) {
                this._oNotifTypeControl.setBusy(true);
                this._oNotifTypeControl
                  .getModel()
                  .read("/NotificationTypeChangeSet", {
                    success: function () {
                      t._bTypeChangeLoaded = true;
                      t._oNotifTypeControl.setBusy(false);
                      t._oNotifTypeControl.getBinding("items").filter(p);
                    },
                  });
              } else {
                this._oNotifTypeControl.getBinding("items").filter(p);
              }
            }
          },
          _onBindingDataReceived: function () {
            if (!this.getView().getParent().getParent().getElementBinding()) {
              return;
            }
            var n = this._extractNotification();
            if (!n) {
              this.getRouter().getTargets().display("objectNotFound");
              return;
            }
          },
          _afterSuccessSave: function () {
            var t = this;
            this._isSubmittingChanges = false;
            this._sNotificationId = "";
            var c = !!this.getView().$().closest(".sapUiSizeCompact").length;
            M.show(
              this.getResourceBundle().getText(
                "ymsg.saveCreateText",
                this.getObject().NotificationNumber
              ),
              {
                title: this.getResourceBundle().getText("xtit.requestSubmitted"),
                actions: [M.Action.OK],
                onClose: function (a) {
                  t.setAppUnBusy();
                  if (a === M.Action.OK) {
                    if (t._isInCreateMode()) {
                      t.getModel().resetChanges();
                      t.navTo(C.ROUTES.LIST, {}, true);
                    } else {
                      t.navBack();
                    }
                    jQuery.sap.require("sap.m.MessageToast");
                    sap.m.MessageToast.show(
                      t
                        .getResourceBundle()
                        .getText(
                          "ymsg.saveCreateText",
                          t.getObject().NotificationNumber
                        ),
                      {
                        duration: C.GENERAL.MESSAGETOAST_DELAY,
                        closeOnBrowserNavigation:
                          C.GENERAL.MESSAGETOAST_CLOSE_ON_NAV,
                      }
                    );
                  }
                },
                styleClass: c ? "sapUiSizeCompact" : "",
              }
            );
          },
          _isDesktop: function () {
            return this.getModel(C.MODEL.DEVICE_MODEL.NAME).getProperty(
              C.MODEL.DEVICE_MODEL.PROPERTIES.IS_DESKTOP
            );
          },
          _isInCreateMode: function () {
            return this._oAppModel.getProperty(
              C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
            );
          },
          _checkAndMarkEmptyMandatoryFields: function (e) {
            var E = false;
            jQuery.each(this._getMandatoryFields(), function (i, a) {
              if (a && a.getValue) {
                if (!a.getValue() || a.getValue().trim() === "") {
                  E = true;
                  if (e) {
                    a.setValueState(sap.ui.core.ValueState.Error);
                  }
                }
              } else if (a && a.getSelectedItem) {
                if (
                  !a.getSelectedItem() ||
                  a.getSelectedItem().getText().trim() === ""
                ) {
                  E = true;
                  if (e) {
                  }
                }
              }
            });
            return E;
          },
          _fieldWithErrorState: function () {
            var e = false;
            jQuery.each(
              $("#" + this.getView().getId()).find("*"),
              function (i, a) {
                if ($(a).control) {
                  var c = $(a).control(0);
                }
                if (
                  c &&
                  c.getValueState &&
                  c.getValueState() === sap.ui.core.ValueState.Error
                ) {
                  e = true;
                }
              }
            );
            return e;
          },
          _fieldChange: function (c) {
            try {
              c.setValueState(sap.ui.core.ValueState.None);
            } catch (e) {}
          },
          _getMandatoryFields: function () {
            var m = [];
            m.push(this.byId("pmNotifInputTitle"));
            m.push(this.byId("pmNotifComboBoxNotificationType"));
            if (
              this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
              )
            ) {
              m.push(this.byId("pmNotifInputReporter"));
            }
            return m;
          },
          _isDirty: function () {
            return this.getModel().hasPendingChanges();
          },
          _setObjectPaths: function (n, l) {
            this._myObjectPaths = {};
            this._myObjectPaths[n] = "";
            this._myObjectPaths[l] = "";
          },
          _getObjectPaths: function () {
            return this._myObjectPaths;
          },
          isLinkAdditionalSearchOptionsVisible: function () {
            if (this.extHookAdditionalSearchOptions) {
              return this.extHookAdditionalSearchOptions();
            } else {
              return this.getModel(C.MODEL.APP_MODEL.NAME).getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.BARCODE_AVAILABLE
              );
            }
          },
          _applyAppState: function () {
            if (
              this._isAppStateApplied ||
              !this._isRoutePatternMatched ||
              !this._isViewBindingDone ||
              !this._isLongtextBindingDone
            ) {
              return;
            }
            this.initVars();
            var p = this.parseNavigation();
            var t = this;
            p.done(function (a, u, n) {
              if (n !== C.ROUTES.NavType.initial) {
                var A = t._sAttachObjectKey;
                jQuery.proxy(t._restoreAppStateData(a), t);
                t.restoreCustomAppStateData(a.customData);
                if (A !== t._sAttachObjectKey) {
                  t._initAttachmentComponent(
                    t._oAttachmentComponent,
                    {
                      mode: C.ATTACHMENTS.ATTACHMENTMODE_CREATE,
                      objectType: C.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
                      objectKey: this._sAttachObjectKey,
                    },
                    "pmNotifContainerAttachments"
                  ).then(function (o) {
                    t._oAttachmentComponent = o;
                  });
                }
              }
            });
            p.fail(function () {
              t.handleError();
            });
            this._isAppStateApplied = true;
          },
          getCurrentAppState: function () {
            var l = {};
            if (
              this._oAppModel.getProperty(
                C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
              )
            ) {
              l = this.getView()
                .byId("pmNotifLongTextCreate")
                .getBindingContext()
                .getObject();
            } else {
              l = this.getView()
                .byId("pmNotifLongTextEdit")
                .getContent()[0]
                .getBindingContext()
                .getObject();
            }
            return {
              notificationData: this.getObject(),
              longtextData: l,
              customData: this.getCustomAppStateData(),
            };
          },
          getCustomAppStateData: function () {
            return {};
          },
          restoreCustomAppStateData: function () {},
          _checkForPendingChangesAndAskForDiscard: function () {
            var c = function () {
              this.navBack();
            }.bind(this);
            if (this._bHasPendingChanges) {
              jQuery.sap.delayedCall(0, this, function () {
                this._messageSkipPendingChanges({ fnCancel: c });
              });
            }
          },
          _messageSkipPendingChanges: function (F) {
            var t = this;
            var c = !!this.getView().$().closest(".sapUiSizeCompact").length;
            M.show(
              this.getResourceBundle().getText(
                "ymsg.messageWarningSkipPendingChanges"
              ),
              {
                icon: M.Icon.WARNING,
                title: this.getResourceBundle().getText(
                  "xsel.messageSeverityWarning"
                ),
                actions: [M.Action.OK, M.Action.CANCEL],
                onClose: function (a) {
                  if (a === M.Action.OK) {
                    var o = t.getModel().getPendingChanges();
                    for (var s in o) {
                      t.getModel().resetChanges();
                    }
                    if (F) {
                      if (typeof F.fnOk === "function") {
                        F.fnOk();
                      }
                    }
                  }
                  if (a === M.Action.CANCEL) {
                    if (F) {
                      if (typeof F.fnCancel === "function") {
                        F.fnCancel();
                      }
                    }
                  }
                },
                styleClass: c ? "sapUiSizeCompact" : "",
              }
            );
          },
          _restoreAppStateData: function (d) {
            var c = this._oAppModel.getProperty(
              C.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE
            );
            var p = "";
            for (var o in d) {
              var e = d[o];
              if (o.startsWith("notificationData")) {
                p = this.getView().getBindingContext().sPath + "/";
                for (var a in e) {
                  switch (a) {
                    case "__metadata":
                      break;
                    case "NotificationTimestamp":
                      break;
                    case "NotificationTimezone":
                      break;
                    case "NotificationDate":
                      break;
                    case "NotificationTime":
                      break;
                    case "LastChangedTimestamp":
                      break;
                    case "NotificationType":
                      this.getModel().setProperty(p + a, e[a]);
                      var s = this.byId("pmNotifComboBoxNotificationType");
                      s.getBinding("items").attachEventOnce(
                        "change",
                        function () {
                          s.setSelectedKey(e[a]);
                        }
                      );
                      break;
                    case "AttachmentId":
                      this.getModel().setProperty(p + a, e[a]);
                      this._sAttachObjectKey = e[a];
                      break;
                    default:
                      this.getModel().setProperty(p + a, e[a]);
                      break;
                  }
                }
              } else if (o.startsWith("longtextData")) {
                if (c) {
                  p = this._oNewLongText.getPath() + "/";
                } else {
                  p =
                    this.byId("pmNotifLongTextEdit")
                      .getBinding("content")
                      .getContexts()[0]
                      .getPath() + "/";
                }
                this.getModel().setProperty(p + "UpdateText", e.UpdateText);
              }
            }
          },
        }
      );
    }
  );
  