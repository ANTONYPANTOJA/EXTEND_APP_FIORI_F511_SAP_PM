/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/eam/pmnotification/create/s1/util/Constants",
	"i2d/eam/pmnotification/create/s1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"i2d/eam/pmnotification/create/s1/util/TextTemplateHandler",
	"sap/ui/core/format/DateFormat",
	"i2d/eam/pmnotification/create/s1/model/formatter",
	"sap/m/MessageBox"
], function (CONSTANTS,
	BaseController,
	JSONModel,
	TextTemplateHandler,
	DateFormat,
	formatter,
	MessageBox) {

	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.s1.controller.MaintainNotification", {

		formatter: formatter,

		_oDataHelper: null,
		_oAppModel: null,
		_oViewProperties: null, // JSON model used to manipulate declarative attrivutes of the controls used in this view. Initialized in _initViewPropertiesModel
		_oTextTemplateHelper: null,
		_oAttachmentComponent: null,
		_oNewLongText: null,
		_sAttachObjectKey: "",
		_isSubmittingChanges: false,
		_sNotificationId: null, // the Id of the notification
		_oNotifTypeControl: null,
		_isRoutePatternMatched: false,
		_isAppStateApplied: false,
		_isViewBindingDone: false,
		_isLongtextBindingDone: false,
		_bViewBindingOn: false,
		_sLastNotificationType: "",
		_bTypeChangeLoaded: false,

		// --- attributes describing the current state	
		_sContextPath: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * onInit
		 * @public
		 */
		onInit: function () {

			this._oAppModel = this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME);
			this.getView().loaded().then(function () {
				this._oDataHelper = this.getODataHelper();
			}.bind(this));

			// get TextTemplate-Helper
			this._oTextTemplateHelper = TextTemplateHandler;

			// Initialize Notification Type Combo Box 
			this._initNotificationTypeControl();

			// set the effect field value after view and items binding is complete
			var oEffectComboBox = this.getView().byId("pmNotifSelectEffect");
			oEffectComboBox.bindAggregation("items", {
				path: "/MalfunctionEffectSet",
				sorter: new sap.ui.model.Sorter("Effect"),
				template: new sap.ui.core.ListItem({
					key: "{Effect}",
					text: "{= ${Effect} === ''? '' : ${Effect} + ' (' + ${EffectText} + ')'}" //         "{Effect} ({EffectText})"
				})
			});
		},

		/**
		 * Initializes the view properties model an sets it to the parent view
		 * @public
		 * @return {sap.ui.model.json.JSONModel}  View properties model
		 */
		initViewPropertiesModel: function () {

			var bSetModel = false;

			if (!this._oViewProperties) {
				this._oViewProperties = new JSONModel();
				bSetModel = true;
			}

			this.refreshViewProperties();

			if (bSetModel) {
				this.getView().getParent().setModel(this._oViewProperties, CONSTANTS.MODEL.VIEW_PROP.NAME);
			}

			return this.getView().getParent().getModel(CONSTANTS.MODEL.VIEW_PROP.NAME);
		},

		/**
		 * refresh view properties
		 * @public
		 */
		refreshViewProperties: function () {

			var oGeneralViewPropConstants = CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL;

			this._oViewProperties.setProperty(oGeneralViewPropConstants.TECHNICAL_OBJECT_GIVEN, false);
			this._oViewProperties.setProperty(oGeneralViewPropConstants.TECHNICAL_OBJECT_VALID, false);
			this._oViewProperties.setProperty(oGeneralViewPropConstants.TEXTTEMPLATES_AVAILABLE, false);
			this._oViewProperties.setProperty(oGeneralViewPropConstants.DISPLAY_MAP_INPLACE, false);
			this._oViewProperties.setProperty(oGeneralViewPropConstants.GPS_DATA_AVAILABLE, false);
			this._oViewProperties.setProperty(oGeneralViewPropConstants.USER_CAN_BE_NOTIFIED, false);

			// set wether changes are allowed within this view (needed e.g. for the geomap-view)
			if (typeof this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE) === "undefined") {
				this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED, false);
			} else if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE)) {
				this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED, !this.hasPendingChangesForOtherNotification({
					oPaths: this._getObjectPaths()
				}));
			} else {
				this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED, !this.hasPendingChangesForOtherNotification({
					sObjectKey: this._sNotificationId
				}));
			}

			// set the visibility of additional search options 
			this._oViewProperties.setProperty(oGeneralViewPropConstants.ADDITIONAL_SEARCH_OPTIONS_ON,
				this.isLinkAdditionalSearchOptionsVisible());

			// reset notification count
			this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CNT_CURRENT_NOTIFICATIONS, 0);

		},

		/**
		 * Helper method to initialize the view with a new notification & create Attachment handler
		 * & set changing mode
		 * @public
		 */
		initializeNewNotificationData: function () {
			var sAttachmentId;
			var oNewNotification;

			this._oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE, true);

			if (!this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_METADATA_LOADED)) {
				return;
			}

			this.setAppUnBusy();

			if (this.getModel().hasPendingChanges()) {
				return; // we should already have a new entity	
			}

			if (typeof this._oNotifTypeControl !== "undefined") {
				// Bind Notification Type Control to NotificationType entity set
				this._bindNotificationTypeControl();
			}

			var oModel = this.getModel();

			// create new notification object 
			oNewNotification = oModel.createEntry(
				this._oDataHelper.getPathForNotificationHeaders(), {
					groupId: CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP,
					changeSetId: CONSTANTS.GENERAL.NOTIFICATION_CHANGE_SET
				}
			);
			// create new longtext object
			this._oNewLongText = oModel.createEntry(
				this._oDataHelper.getPathForLongTextSet(), {
					groupId: CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP,
					changeSetId: CONSTANTS.GENERAL.NOTIFICATION_CHANGE_SET
				}
			);

			// get the user ID via UserInfo service
			if (sap.ushell.Container) {
				var sUserId = sap.ushell.Container.getService("UserInfo").getId();
			}

			oModel.setProperty(oNewNotification.sPath + "/NotificationTimestamp", new Date());
			oModel.setProperty(oNewNotification.sPath + "/Reporter", sUserId);
			oModel.setProperty(this._oNewLongText.sPath + "/IsHistorical", false);

			this._bViewBindingOn = false;
			this.getView().byId("pmNotifLongTextCreate").setBindingContext(this._oNewLongText);
			this.getView().setBindingContext(oNewNotification);

			if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_STARTUP_CREATE) === true) {
				var oComponentData = this.getOwnerComponent().getComponentData();
				if (oComponentData && oComponentData.startupParameters) {
					for (var key in oComponentData.startupParameters) {
						var sValue = oComponentData.startupParameters[key][0] ? oComponentData.startupParameters[key][0] : "";
						switch (key) {
						case "NotificationType":
							oModel.setProperty(oNewNotification.sPath + "/NotificationType", sValue);
							break;
						case "TechnicalObject":
						case "TechnicalObjectLabel":
							oModel.setProperty(oNewNotification.sPath + "/TechnicalObjectNumber", sValue);
							break;
						case "TechObjIsEquipOrFuncnlLoc":
							oModel.setProperty(oNewNotification.sPath + "/TechnicalObjectType", sValue);
							break;
						}
					}
				}
			}

			this._sNotificationId = this._sAttachObjectKey = sAttachmentId = this._getObjectKey(oNewNotification.sPath);
			this._setObjectPaths(oNewNotification.sPath.substring(1), this._oNewLongText.sPath.substring(1));

			// viewproperties refreshen
			this.refreshViewProperties();

			if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE)) {
				oModel.setProperty(oNewNotification.sPath + "/AttachmentId", sAttachmentId);

				if (this._sAttachObjectKey) {

					// create Attachment Component for the notification (create + edit)
					var that = this;
					this._initAttachmentComponent(
						this._oAttachmentComponent, {
							mode: CONSTANTS.ATTACHMENTS.ATTACHMENTMODE_CREATE,
							objectType: CONSTANTS.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
							objectKey: this._sAttachObjectKey
						},
						"pmNotifContainerAttachments"
					).then(function (oAttachmentComponent) {
						that._oAttachmentComponent = oAttachmentComponent;
					});
				}
			}

			//retrieve text templates after binding, because data for filtering are taken via binding info
			this._oTextTemplateHelper.retrieveTemplates(this.getModel(), this);

			// remember the initial object
			this._unchangedNotification = JSON.stringify(oNewNotification.getObject());

			this._isViewBindingDone = true;
			this._isLongtextBindingDone = true;
			this._applyAppState();

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * called if the route was matched in the parent view (S1/S2)
		 * @param {sap.ui.base.Event|Object} vEvent Either the event object, forwarded from the S1/S2 controller, or only its parameter map.
		 * @public
		 */
		routePatternMatched: function (vEvent) {

			var that = this,
				mEventParameters;

			if (vEvent.getParameters) {
				mEventParameters = vEvent.getParameters();
			} else {
				mEventParameters = vEvent;
			}

			this._bHasPendingChanges = false; // keep track of changes before routePattern matched (is set in the switch statement)

			switch (mEventParameters.name) {

			case CONSTANTS.ROUTES.CREATE:
				this._oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE, true);

				this._bHasPendingChanges = this.hasPendingChangesForOtherNotification({
					oPaths: this._getObjectPaths()
				});

				// no pending changes for another notification 
				// init notification if appropriate
				this.initializeNewNotificationData();

				break;
			case CONSTANTS.ROUTES.EDIT:
				this._oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE, false);

				this._sNotificationId = mEventParameters["arguments"].NotificationNumber;

				// track if we had pending changes when entering the view => this is evaluated in onAfterRendering in 
				// order to display a dialog to discard other changes (this app does only allow changes of one notification ata a time)

				this._bHasPendingChanges = this.hasPendingChangesForOtherNotification({
					sObjectKey: this._sNotificationId
				});

				this._resetBindingFlags();

				// reset red-boxes around the fields
				this.resetValueStates();

				// Bind the notification to the parent view
				// data are only requested from backend when edit view was opened directly via link
				// if view opened via display view the data are already existing locally in the model
				this._bViewBindingOn = true;
				this._sContextPath = this.getODataHelper().getPathForNotificationNo(this._sNotificationId);
				this.getView().getParent().getParent().bindElement({
					path: this._sContextPath,
					events: {
						change: function () {
							that.setAppUnBusy();
						},
						dataRequested: function () {
							that.setAppBusyComplex({
								delay: 0
							});
						},
						dataReceived: this._onBindingDataReceived.bind(this)
					}
				});
				// Checks if the binding context is already available locally. If so, refreshes view properties and 
				// read dependent data					
				this._extractNotification();

				// create ListItems for the Longtext		
				if (!this.getView().byId("pmNotifLongTextEdit").isBound("content")) {
					var oCustomListItem = new sap.ui.layout.VerticalLayout({
						width: "100%",
						content: [new i2d.eam.pmnotification.create.s1.util.ExpandableTextArea( //eslint-disable-line no-undef
								{
									editable: false,
									rows: 5,
									value: "{ReadOnlyText}",
									visible: "{= ${IsHistorical} === true && ${ReadOnlyText} !== '' }",
									wrapping: "None",
									width: "100%"
								}
							),
							new i2d.eam.pmnotification.create.s1.util.ExpandableTextArea( //eslint-disable-line no-undef
								{
									change: (this.onInputChange).bind(this),
									placeholder: "{i18n>ymsg.addDetails}",
									rows: 5,
									value: "{UpdateText}",
									visible: true,
									wrapping: "None",
									width: "100%"
								}
							)
						]
					});
					this.getView().byId("pmNotifLongTextEdit").bindAggregation("content", {
						path: "LongText01",
						template: oCustomListItem
					});

					// following coding did not work due to duplicate id's in navigation/page refreshs!
					// this.getView().byId("pmNotifLongTextEdit").bindItems({ path: "LongText01", template: this.getView().byId("pmNotifLongTextEdit").getItems() });
				}

				this.byId("pmNotifLongTextEdit").getBinding("content").attachEventOnce("dataReceived",
					function () {
						this._isLongtextBindingDone = true;
						this._applyAppState();
					}, this);

				// prepare the attachment object id
				// we could also take key from field attachmentId in Enitity, but then we'd need to wait until
				// notification was loaded
				this._sAttachObjectKey = String("000000000000" + this._sNotificationId).slice(-12);

				if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE) && this._sAttachObjectKey) {

					// create Attachment Component for the notification (create + edit)
					var that = this;
					this._initAttachmentComponent(
						this._oAttachmentComponent, {
							mode: CONSTANTS.ATTACHMENTS.ATTACHMENTMODE_CREATE,
							objectType: CONSTANTS.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
							objectKey: this._sAttachObjectKey
						},
						"pmNotifContainerAttachments"
					).then(function (oAttachmentComponent) {
						that._oAttachmentComponent = oAttachmentComponent;
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

		/**
		 * Opens a Popover if details for a user are requested
		 * @param {sap.ui.base.Event} [oEvent] link for employee details clicked
		 * @public
		 */
		onShowEmployeeDetails: function (oEvent) {

			var oNotification = this.getObject();

			this.getUtil().launchPopoverEmployeeQuickView(
				oNotification.ReporterUserId,
				oEvent.getSource(),
				this.getView());
		},

		/**
		 * Called from S1 or S2 controller to trigger Email
		 * @public
		 */
		onShareEmailPress: function () {

			//call method in BaseController with same name
			if (BaseController.prototype.onShareEmailPress) {
				BaseController.prototype.onShareEmailPress.apply(this, arguments);
			}

		},

		/**
		 * sets the view property technical object valid to true, if the technical object is not empty
		 * if the technical object is valid a count of notifications for this technical object is started
		 * @public
		 */
		onTechnicalObjectChange: function () {

			if (!this.getView().getBindingContext()) {
				return;
			}
			if (this._bViewBindingOn === true) {
				// during binding within the view this event is also triggered, but in this case
				// we don't need to count as this is done after binding finished in _extractNotification
				this._bViewBindingOn = false;
				return;
			}

			var oNotification = this.getObject();

			if (oNotification.TechnicalObjectNumber !== "" && oNotification.TechnicalObjectType !== "") {
				this._setPropertyTechnicalObjectValid(true);

				this.getODataHelper().countOpenNotifications(oNotification, this._oViewProperties, this.getView().getModel());

			}

			//retrieve text templates
			// in current version text templates are not reloaded at data change
			//this._oTextTemplateHelper.retrieveTemplates(this.getModel(), this);
		},

		/**
		 * hides the links for the technical object when the technical object is invalid
		 * @public
		 */
		onTechnicalObjectInvalidated: function () {
			this.hideLinksForTechnicalObject();

			// in current version text templates are not reloaded at data change
			//this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TEXTTEMPLATES_AVAILABLE, false);
		},

		/**
		 * checks whether the reporter is valid when the reporter is changed
		 * @public
		 */
		onReporterChange: function () {
			this.getAppController().setPropUserValid.apply(this);
		},

		/**
		 * sets the view property valid user to false when the field was changed
		 * @public
		 */
		onReporterInvalidated: function () {
			this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.VALID_USER_GIVEN, false);
		},

		/**
		 * reset value state if an input field was changed
		 * @param {sap.ui.base.Event} [oEvent] an Input Field was changed
		 * @public
		 */
		onInputChange: function (oEvent) {
			var oField = oEvent.getSource();
			if (this._fieldChange) {
				this._fieldChange(oField);
			}
		},

		/**
		 * Check validity of the time stamp
		 * @param {sap.ui.base.Event} [oEvent] an Input Field was changed
		 * @public
		 */
		onTimePickerInputChange: function (oEvent) {
			var oTimePicker = oEvent.getSource();
			var bValid = oEvent.getParameter("valid");
			if (this._fieldChange) {
				this._fieldChange(oTimePicker);
			}
			if (bValid) {
				oTimePicker.setValueState(sap.ui.core.ValueState.None);
			} else {
				oTimePicker.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		/**
		 * sets the context binding based on selected notification type
		 * @param {sap.ui.base.Event} [oEvent] an Input Field was changed
		 * @public
		 */
		onNotificationTypeChange: function (oEvent) {

			var oField = oEvent.getSource();
			this._fieldChange(oField);

			this._updateDependentValuesOnNotificationTypeChange();

			this._sLastNotificationType = this.getObject().NotificationType;
			//retrieve text templates
			// in current version text templates are not reloaded at data change
			//this._oTextTemplateHelper.retrieveTemplates(this.getModel(), this);
		},

		/**
		 * Provide an ActionSheet-Popover with additional search functionalities for the technical Object
		 * if the user clicked the link.
		 * @param {sap.ui.base.Event} [oEvent] the link to display additional search options was clicked
		 * @public
		 */
		onAlsoFindVia: function (oEvent) {
			var oLink = oEvent.getSource();
			var oPopover = this.getUtil().getFragmentDialog(this, "Search");

			oPopover.openBy(oLink);
		},

		/**
		 * Provide an dialogue with overview information regarding the
		 * selected equipment respectively the functional location.
		 * @param {sap.ui.base.Event} [oEvent] the link to display technical object overview was clicked
		 * @public
		 */
		onPressTechnicalObjectOverview: function (oEvent) {
			var oNotification = this.getObject();

			this.getUtil().launchPopoverTechnicalObjectOverview(
				oNotification.TechnicalObjectNumber,
				oNotification.TecObjNoLeadingZeros, // technical object with leading zeros
				oNotification.TechnicalObjectType,
				oEvent.getSource(),
				this.getView());
		},

		/**
		 * show an popover to allow the user to choose textemplates.
		 * if selected the templates are placed into the "description"-field
		 * @param {sap.ui.base.Event} [oEvent] the link that was clicked
		 * @public
		 */
		onUseTemplates: function (oEvent) {
			var sLongTextPath = (this._oNewLongText ? this._oNewLongText.getPath() // new LongText
					: this.byId("pmNotifLongTextEdit").getBinding("content").getContexts()[0].getPath()) // first LongText-item
				+ "/UpdateText";
			this._oTextTemplateHelper.startTemplateSelection(oEvent.getSource(),
				sLongTextPath);

		},

		/*  ========================================================================*/
		/* Mobile qualities */
		/* ======================================================================== */

		/* ==== Barcode Search =========================================================*/
		/**
		 * starts barcode scanning
		 * @param {sap.ui.base.Event} [oEvent] item to start barcode scanning clicked
		 * @public
		 */
		onSearchViaBarcode: function () {
			if (!this.isFunctionAvailable("cordova.plugins.barcodeScanner")) {
				jQuery.sap.require("sap.m.MessageToast");
				sap.m.MessageToast.show(
					this.getResourceBundle().getText("ymsg.barcodeNotAvailable"), {
						duration: CONSTANTS.GENERAL.MESSAGETOAST_DELAY,
						closeOnBrowserNavigation: CONSTANTS.GENERAL.MESSAGETOAST_CLOSE_ON_NAV
					}
				);
				return;
			}

			var fnScanSuccess = function (result) {

				var sTechnObject = result.text + "";
				var oTechInput = this.getView().byId("pmNotifInputTechnicalObject");

				// invalidate the technical object
				this._setPropertyTechnicalObjectValid(true);

				//oTechInput.setObjectNumberAndTriggerSuggest(sTechnObject);
				oTechInput.setObjectNumber(sTechnObject);
			};

			var fnScanError = function () {
				jQuery.sap.require("sap.m.MessageToast");
				sap.m.MessageToast.show(
					this.getResourceBundle().getText("ymsg.barcodeScanFailed"), {
						duration: CONSTANTS.GENERAL.MESSAGETOAST_DELAY,
						closeOnBrowserNavigation: CONSTANTS.GENERAL.MESSAGETOAST_CLOSE_ON_NAV
					}
				);
			};

			var barcodeScanner = this.getPlugin("cordova.plugins.barcodeScanner");
			barcodeScanner.scan(
				jQuery.proxy(fnScanSuccess, this),
				jQuery.proxy(fnScanError, this));
		},

		/* ======================================================================== */
		/* miscellanious Helpers                                             */
		/* ======================================================================== */

		/**
		 * Returns an instance of the attachmenthandler bound in this view
		 * @return {string} object key for path
		 * @private
		 */
		_getObjectKey: function (sObjectPath) {
			var sObjectKey;

			// extract the id of the newly created entry from the context path
			if (/\'(.*?)\'/.test(sObjectPath)) {
				sObjectKey = /\'(.*?)\'/.exec(sObjectPath)[1];
			}

			return sObjectKey;
		},

		/**
		 * Returns an instance of the attachmenthandler bound in this view
		 *
		 * @return {i2d.eam.pmnotification.create.util.AttachmentHandler}
		 * @public
		 */
		getAttachmentComponent: function () {
			return this._oAttachmentComponent;
		},

		/**
		 * hides the links for the technical object
		 * @public
		 */
		hideLinksForTechnicalObject: function () {
			this._setPropertyTechnicalObjectValid(false);
		},

		/**
		 * validation of the newly created or changed notification
		 * called in S1 or S2 controller
		 *
		 * @returns {boolean} notification is valid?
		 * @public
		 */
		validateNewNotification: function () {
			var bOk = (!this._checkAndMarkEmptyMandatoryFields(true) && !this._fieldWithErrorState() && (this.getModel(CONSTANTS.MODEL.VIEW_PROP
					.NAME)
				.getProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TECHNICAL_OBJECT_VALID) || this.byId("pmNotifInputTechnicalObject").getValue() ===
				""
			));

			return bOk;
		},

		/**
		 * Values states if set are not automatically removed from the view.  For example, if there
		 * are missing mandatory fields and the user presses "save", these fields are set to value state
		 * error.  If the user then presses "cancel" and selects another notification to edit, the values states
		 * must be removed, otherwise the value states appear on the next notifiocation edit.
		 *
		 * @public
		 */
		resetValueStates: function () {

			jQuery.each($('#' + this.getView().getId()).find("*"), function (i, input) {
				if ($(input).control) {
					var oControl = $(input).control(0);
				}
				if (oControl && oControl.setValueState) { // otherwise it's a checkbox
					oControl.setValueState(sap.ui.core.ValueState.None);
				}
			});
		},

		/**
		 * save a created/updated notification from the NewNotificationView
		 * @public
		 */
		saveNotification: function () {

			if (this._isSubmittingChanges) {
				return;
			}

			function fnAfterError() {
				this._isSubmittingChanges = false;
				this.getModel().setRefreshAfterChange(true);
			}

			/**
			 * Show success message
			 * @param {Object} oData Data with a responded by backend call
			 * @param {Object} response Full response of backend call
			 */
			function fnSubmitSuccess(oData) {

				var bLeaveLoop = false;

				// reset flag for pending changes
				this._isSubmittingChanges = false;
				this.getModel().setRefreshAfterChange(true);

				if (oData.__batchResponses) {
					var i;

					for (i = 0; i < oData.__batchResponses.length && !bLeaveLoop; i++) {
						if (oData.__batchResponses[i].__changeResponses) {
							var j;
							for (j = 0; j < oData.__batchResponses[i].__changeResponses.length && !bLeaveLoop; j++) {
								if (oData.__batchResponses[i].__changeResponses[j].statusCode && oData.__batchResponses[i].__changeResponses[j].statusCode.startsWith(
										"2")) {
									//statuscode 201: save was successful    
									// statuscode:2xx => generall success message
									// created successfully
									this._afterSuccessSave();

									// we have found our response -> skip error message and leave loops
									bLeaveLoop = true;
								}
							}
						}
					}
				}
			}

			if (this.getModel().hasPendingChanges()) {
				// set flag for pending changes
				this._isSubmittingChanges = true;
				this.setAppBusy();
				this.getModel().setRefreshAfterChange(false);
				this.getModel().submitChanges({
					groupId: CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP,
					success: jQuery.proxy(fnSubmitSuccess, this),
					error: jQuery.proxy(fnAfterError, this)
				});
			}
			// were only attachments changed in edit mode?
			// set flag for pending changes
			else if (!this._isInCreateMode() && this._oAttachmentComponent) {
				this._oAttachmentComponent.getApplicationState(function (bResp) {
					if (bResp) {
						this._isSubmittingChanges = true;
						try {
							this._oAttachmentComponent.save(false);
							this._afterSuccessSave();
						} catch (err) {
							// no special error handling
						}
					} else {
						//there are no changes to save ... nevertheless display success and do the needful
						this._afterSuccessSave();
					}
				}.bind(this));
			} else {
				//there are no changes to save ... nevertheless display success and do the needful
				this._afterSuccessSave();
			}
		},

		/**
		 * cancel create/edit notification from the NotificationView
		 * @public
		 */
		cancelNotification: function () {

			var that = this;
			var sNotificationNumber = this.getObject().NotificationNumber;

			if (this._isSubmittingChanges) {
				return;
			}

			function fnAfterError() {
				that._isSubmittingChanges = false;
			}

			function fnAfterSuccess() {
				that._isSubmittingChanges = false;
				that.navBack();
			}

			if (this._isDirty() || this._oAttachmentComponent) {
				(this._oAttachmentComponent ? this._oAttachmentComponent.getApplicationState.bind(this._oAttachmentComponent) : function (
					fnCallback) {
					fnCallback(true);
				})(function (bResp) {
					if (bResp || this._isDirty()) {

						var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.show(
							this.getResourceBundle().getText("ymsg.warningConfirm"), {
								icon: MessageBox.Icon.WARNING,
								title: this.getResourceBundle().getText("xsel.messageSeverityWarning"),
								actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
								onClose: function (oAction) {
									if (oAction === MessageBox.Action.OK) {
										that.resetValueStates();
										that._isSubmittingChanges = true;
										that._oDataHelper.cancelNotification(
											sNotificationNumber,
											that._oAttachmentComponent,
											fnAfterSuccess,
											fnAfterError);
									}
								},
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							});
					} else {
						this.resetValueStates();
						this._isSubmittingChanges = true;
						this._oDataHelper.cancelNotification(sNotificationNumber, this._oAttachmentComponent, fnAfterSuccess);
					}
				}.bind(this));
			} else {
				this.resetValueStates();
				this._isSubmittingChanges = true;
				this._oDataHelper.cancelNotification(sNotificationNumber, this._oAttachmentComponent, fnAfterSuccess);
			}
		},

		/**
		 * delete the notification
		 * @public
		 */
		deleteNotification: function () {

			var that = this;
			var sNotificationNumber = this.getObject().NotificationNumber;

			function fnAfterError() {
				that._isSubmittingChanges = false;
			}

			function fnAfterSuccess() {
				that._isSubmittingChanges = false;
			}

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			// ask the user whether he really wants to delete the notification
			MessageBox.show(
				this.getResourceBundle().getText("ymsg.deleteConfirm", sNotificationNumber), {
					icon: MessageBox.Icon.WARNING,
					title: this.getResourceBundle().getText("xtit.delete"),
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							that._isSubmittingChanges = true;
							that.setAppBusy();
							that._oDataHelper.deleteNotification(sNotificationNumber, fnAfterSuccess, fnAfterError);
						}
					},
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * set view property if Technical Object is valid
		 * @public
		 * @param {boolean} valid or not
		 */
		_setPropertyTechnicalObjectValid: function (bValid) {
			this.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TECHNICAL_OBJECT_VALID,
				bValid);
			// this property controls visibility of subview for links
			// when this value is changed more than twice the view doesn't recognize to rerender automatically
			if (bValid) {
				this.getView().rerender();
			}
		},

		/**
		 * reset flags that identify if bindings were done
		 * @private
		 */
		_resetBindingFlags: function () {

			this._isViewBindingDone = false;
			this._isLongtextBindingDone = false;

		},

		/**
		 * Update dependent values when Notification Type changes
		 * @private
		 */
		_updateDependentValuesOnNotificationTypeChange: function () {

			if (!this.getObject()) {
				return;
			}

			this._setUserCanBeNotified();
			this._setNotificationTypeText();
		},

		/**
		 * Helper function to set the attribute UserCanBeNotified in NotificationHeader
		 * @private
		 */
		_setUserCanBeNotified: function () {

			var bUserCanBeNotified = false;
			var sPath = "";

			if (this.getObject().NotificationType !== "" && typeof this.getObject().NotificationType !== "undefined") {
				if (this._isInCreateMode()) {
					sPath = this._oDataHelper.getPathForNotificationType(this.getObject().NotificationType) + "/UserCanBeNotified";
				} else {
					sPath = this._oDataHelper.getPathForNotificationTypeChange(this._sLastNotificationType, this.getObject().NotificationType) +
						"/UserCanBeNotified";
				}

				bUserCanBeNotified = this.getModel().getProperty(sPath) ? this.getModel().getProperty(sPath) : false;
			}

			this.getModel().setProperty(this.getView().getBindingContext().getPath() + "/UserCanBeNotified", bUserCanBeNotified);

			// set subscribed to false if it is not visible ...
			if (!bUserCanBeNotified) {
				this.getModel().setProperty(this.getView().getBindingContext().getPath() + "/Subscribed", false);
			}

		},

		/**
		 * Helper function to set the attribute NotificationtypeText in NotificationHeader
		 * @private
		 */
		_setNotificationTypeText: function () {

			var sNotificationTypeText = false;
			var sPath = "";

			if (this.getObject().NotificationType !== "" && typeof this.getObject().NotificationType !== "undefined") {
				if (this._isInCreateMode()) {
					sPath = this._oDataHelper.getPathForNotificationType(this.getObject().NotificationType) + "/Description";
				} else {
					sPath = this._oDataHelper.getPathForNotificationTypeChange(this._sLastNotificationType, this.getObject().NotificationType) +
						"/TargetNotificationTypeName";
				}

				sNotificationTypeText = this.getModel().getProperty(sPath) ? this.getModel().getProperty(sPath) : "";
			}

			this.getModel().setProperty(this.getView().getBindingContext().getPath() + "/NotificationTypeText", sNotificationTypeText);

		},

		/**
		 * Helper function for reading the Notification from the binding context and making sure it is the requested one.
		 * Return the information whether a binding context was available.
		 * @private
		 * @return {boolean} true if notication was found in binding
		 */
		_extractNotification: function () {
			var oBindingContext = this.getView().getBindingContext();
			var oNotification = null;
			if (oBindingContext) {
				if (oBindingContext.getPath() === this._sContextPath) {

					this.setAppUnBusy();

					this._isViewBindingDone = true;
					this._bViewBindingOn = false;

					oNotification = oBindingContext.getObject();

					this._sLastNotificationType = oNotification.NotificationType;

					//load allowed Notification Type changes
					this._bindNotificationTypeControl();

					// viewproperties refreshen
					this.refreshViewProperties();

					if (oNotification.TechnicalObjectNumber !== "") {
						this._setPropertyTechnicalObjectValid(true);
					}

					this.getAppController().setPropUserValid.apply(this);

					//retrieve text templates
					this._oTextTemplateHelper.retrieveTemplates(this.getModel(), this);

					// count notifications
					this.getODataHelper().countOpenNotifications(oNotification, this._oViewProperties, this.getView().getModel());

					this._applyAppState();

					return true;
				} else {
					return false;
				}
			} else {
				return false; // The requested Notification is not available in backend
			}
		},

		/**
		 * Initialize Notification Type control
		 * @private
		 */
		_initNotificationTypeControl: function () {

			this._oNotifTypeControl = this.getView().byId("pmNotifComboBoxNotificationType");

			if (typeof this._oNotifTypeControl !== "undefined") {
				// needed in case of extension
				// prohibit keyboard entries within NotificationType-Field
				this._oNotifTypeControl.onAfterRendering = function () {
					if (sap.m.ComboBox.prototype.onAfterRendering) {
						sap.m.ComboBox.prototype.onAfterRendering.apply(this);
					}
					var oComboBoxInput = this.$();
					if (oComboBoxInput) {
						oComboBoxInput.bind("paste", function (e) {
							e.preventDefault();
						});
						oComboBoxInput.bind("drop", function (e) {
							e.preventDefault();
						});
						oComboBoxInput.keydown(function (e) {
							if (!(e.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN || e.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT || e.keyCode === jQuery
									.sap
									.KeyCodes.ARROW_RIGHT || e.keyCode === jQuery.sap.KeyCodes.ARROW_UP || e.keyCode === jQuery.sap.KeyCodes.TAB || e.keyCode ===
									jQuery.sap.KeyCodes.F1 || e.keyCode === jQuery.sap.KeyCodes.F10 || e.keyCode === jQuery.sap.KeyCodes.F11 || e.keyCode ===
									jQuery.sap.KeyCodes.F12 || e.keyCode === jQuery.sap.KeyCodes.F2 || e.keyCode === jQuery.sap.KeyCodes.F3 || e.keyCode ===
									jQuery.sap.KeyCodes.F4 || e.keyCode === jQuery.sap.KeyCodes.F5 || e.keyCode === jQuery.sap.KeyCodes.F6 || e.keyCode ===
									jQuery.sap.KeyCodes.F7 || e.keyCode === jQuery.sap.KeyCodes.F8 || e.keyCode === jQuery.sap.KeyCodes.F9 || e.keyCode ===
									jQuery.sap.KeyCodes.ESCAPE || e.keyCode === jQuery.sap.KeyCodes.ENTER
								)) {
								e.preventDefault();
								return false;
							}
						});
					}

				};
			}
		},

		/**
		 * Binding for NotificationType Control
		 * @private
		 */
		_bindNotificationTypeControl: function () {
			var that = this;
			var sCurrentType = this.getObject() ? this.getObject().NotificationType : null,
				oPermittedTypeChangeFilter = new sap.ui.model.Filter({
					path: "Type",
					test: function (sType) {
						if (that._isInCreateMode() || sType === sCurrentType) {
							return true;
						} else if (that.getModel().getProperty("/NotificationTypeChangeSet(SourceNotificationType='" + sCurrentType +
								"',TargetNotificationType='" + sType + "')")) {
							return true;
						}
						return false;
					}
				});

			if (!that._oNotifTypeControl) {
				that._initNotificationTypeControl();
			}
			
			if (!that._oNotifTypeControl) { 
				// notification type control is not on the screen
				return;	
			}

			this._oNotifTypeControl.bindAggregation("items", {
				path: "/NotificationTypeSet",

				sorter: new sap.ui.model.Sorter("Type"),

				template: new sap.ui.core.ListItem({
					key: "{Type}",
					text: "{Type} ({Description})"
				}),

				parameters: {
					operationMode: sap.ui.model.odata.OperationMode.Client
				},
				events: {
					dataReceived: function () {
						// add notification type manually if it is no longer permitted/no longer exists
						if (!that._isInCreateMode() && that.getObject()) {
							if (!that.getModel().getProperty(that.getODataHelper().getPathForNotificationType(that.getObject().NotificationType))) {
								that._oNotifTypeControl.addItem(
									new sap.ui.core.ListItem({
										key: that.getObject().NotificationType,
										text: that.getObject().NotificationType + ' (' + that.getObject().NotificationTypeText + ')'
									})
								);
							}
						}
					}
				}
			});

			if (!this._isInCreateMode()) {
				// check whether allowed type changes have already been loaded
				// note: this requires that always all possible type changes are loaded!
				if (jQuery.grep(Object.keys(this.getModel().getProperty("/")), function (sKey) {
						return sKey.indexOf("NotificationTypeChangeSet") !== -1;
					}).length === 0) {
					// Load allowed type changes; filter type dropdown as soon as data available
					this._oNotifTypeControl.setBusy(true);
					this._oNotifTypeControl.getModel().read("/NotificationTypeChangeSet", {
						success: function () {
							that._bTypeChangeLoaded = true;
							that._oNotifTypeControl.setBusy(false);
							that._oNotifTypeControl.getBinding("items").filter(oPermittedTypeChangeFilter);
						}
					});
				} else {
					// allowed type changes were already loaded; apply filter immediately
					this._oNotifTypeControl.getBinding("items").filter(oPermittedTypeChangeFilter);
				}
			}
		},

		/**
		 * when Binding data received for view
		 * @private
		 */
		_onBindingDataReceived: function () {

			if (!this.getView().getParent().getParent().getElementBinding()) {
				return;
			}
			var bNotificationDataAlreadyRead = this._extractNotification();
			if (!bNotificationDataAlreadyRead) {
				// Handles the case that the Notification cannot be retrieved remotely (such as it was already deleted).
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
		},

		/**
		 * Actions after successful saving the notification
		 * @private
		 */
		_afterSuccessSave: function () {

			var that = this;

			this._isSubmittingChanges = false;
			//this._oNewNotification = null;// to ensure that a new instance is created when reeentering this view the instance is deleted
			this._sNotificationId = "";

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
				this.getResourceBundle().getText("ymsg.saveCreateText", this.getObject().NotificationNumber), {
					title: this.getResourceBundle().getText("xtit.requestSubmitted"),
					actions: [MessageBox.Action.OK],
					onClose: function (oAction) {
						that.setAppUnBusy();
						if (oAction === MessageBox.Action.OK) {
							if (that._isInCreateMode()) {
								that.getModel().resetChanges(); // Reset all other deferred Batch Groups (*)
								that.navTo(CONSTANTS.ROUTES.LIST, {}, true);
							} else {
								that.navBack();
							}

							jQuery.sap.require("sap.m.MessageToast");
							sap.m.MessageToast.show(
								that.getResourceBundle().getText("ymsg.saveCreateText", that.getObject().NotificationNumber), {
									duration: CONSTANTS.GENERAL.MESSAGETOAST_DELAY,
									closeOnBrowserNavigation: CONSTANTS.GENERAL.MESSAGETOAST_CLOSE_ON_NAV
								}
							);
						}
					},
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		/**
		 * Determines whether the form factor is Desktop
		 * @return {boolean} form factor is desktop?
		 * @private
		 */
		_isDesktop: function () {
			return this.getModel(CONSTANTS.MODEL.DEVICE_MODEL.NAME).getProperty(CONSTANTS.MODEL.DEVICE_MODEL.PROPERTIES.IS_DESKTOP);
		},

		/**
		 * Determines whether the app is currently in create mode
		 * @return {boolean} app is in create mode?
		 * @private
		 */
		_isInCreateMode: function () {
			return this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE);
		},

		/**
		 * If flag bErrorsMarked is set to true, the empty mandatory fields are set to value state of error
		 * @param {boolean} bErrorsMarked
		 * @return {boolean} errrors were found?
		 * @private
		 */
		_checkAndMarkEmptyMandatoryFields: function (bErrorsMarked) {
			var bErrors = false;

			// Check that inputs are not empty or space.
			// This does not happen during data binding because this is only triggered by changes.
			jQuery.each(this._getMandatoryFields(), function (i, input) {
				if (input && input.getValue) {
					if (!input.getValue() || input.getValue().trim() === "") {
						bErrors = true;
						if (bErrorsMarked) {
							input.setValueState(sap.ui.core.ValueState.Error);
						}
					}
				} else if (input && input.getSelectedItem) {
					if (!input.getSelectedItem() || input.getSelectedItem().getText().trim() === "") {
						bErrors = true;
						if (bErrorsMarked) {
							// input.setValueState(sap.ui.core.ValueState.Error);
							// probably add a css class?
						}
					}
				}
			});

			return bErrors;
		},

		/**
		 * checks fields for error state
		 * @return {boolean} fields with error state?
		 * @private
		 */
		_fieldWithErrorState: function () {

			var bError = false;

			// retrieve all elements of this view and check ValueState if available		    
			jQuery.each($('#' + this.getView().getId()).find("*"), function (i, input) {
				if ($(input).control) {
					var oControl = $(input).control(0);
				}
				if (oControl && oControl.getValueState && oControl.getValueState() === sap.ui.core.ValueState.Error) {
					bError = true;
				}
			});

			return bError;

		},

		/**
		 * Internal helper method to reset the value State of the control to none
		 * @param {sap.ui.core.Control} oControl
		 * @private
		 */
		_fieldChange: function (oControl) {

			try {
				// Removes previous error state
				oControl.setValueState(sap.ui.core.ValueState.None);
			} catch (e) {
				//nothing to do
			}

		},

		/**
		 * Internal helper method to retrieve mandatory fields
		 * @return {[object]} array of mandatory fields
		 * @private
		 */
		_getMandatoryFields: function () {

			var aMandatoryFields = [];

			aMandatoryFields.push(this.byId("pmNotifInputTitle"));
			aMandatoryFields.push(this.byId("pmNotifComboBoxNotificationType"));
			if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE)) {
				aMandatoryFields.push(this.byId("pmNotifInputReporter"));
			}

			return aMandatoryFields;
		},

		/**
		 * Internal helper method to check for changes
		 * @return {boolean} is dirty?
		 * @private
		 */
		_isDirty: function () {
			return this.getModel().hasPendingChanges();
		},

		/**
		 * build object paths
		 * @param {string} notification path
		 * @param {string} longtext path
		 * @private
		 */
		_setObjectPaths: function (sNotificationPath, sLongtextPath) {
			this._myObjectPaths = {};
			this._myObjectPaths[sNotificationPath] = "";
			this._myObjectPaths[sLongtextPath] = "";
		},

		/**
		 * build object paths
		 * @return {object} object paths
		 * @private
		 */
		_getObjectPaths: function () {
			return this._myObjectPaths;
		},

		/**
		 * Extension hook for additional search options
		 * @return {boolean} Link for additional search options available or not
		 * @public
		 */
		isLinkAdditionalSearchOptionsVisible: function () {

			/**    
			 * @ControllerHook  Switches the ActionSheet for additional search options (extended using extButtonSearchOptions) on or off
			 * @callback i2d.eam.pmnotification.create.controller.MaintainNotification~extHookAdditionalSearchOptions
			 * @return {boolean}  Visibility of ActionSheet
			 */
			if (this.extHookAdditionalSearchOptions) {
				return this.extHookAdditionalSearchOptions();
			} else {
				return this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME).getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.BARCODE_AVAILABLE);
			}
		},

		/**
		 * Apply Application State
		 * @private
		 */
		_applyAppState: function () {

			// check if both init events for the controller and the SmartFilterBar have finished
			if (this._isAppStateApplied || !this._isRoutePatternMatched || !this._isViewBindingDone || !this._isLongtextBindingDone) {
				return;
			}

			this.initVars();
			var oParseNavigationPromise = this.parseNavigation();

			var that = this;
			oParseNavigationPromise.done(function (oAppData, oURLParameters, sNavType) {

				if (sNavType !== CONSTANTS.ROUTES.NavType.initial) {

					var sAttachObjectKeyBefore = that._sAttachObjectKey;

					jQuery.proxy(that._restoreAppStateData(oAppData), that);
					that.restoreCustomAppStateData(oAppData.customData);

					if (sAttachObjectKeyBefore !== that._sAttachObjectKey) {
						// refresh the Attachment Component for the new notification (create + edit)
						that._initAttachmentComponent(
							that._oAttachmentComponent, {
								mode: CONSTANTS.ATTACHMENTS.ATTACHMENTMODE_CREATE,
								objectType: CONSTANTS.ATTACHMENTS.OBJECTTYPE_NOTIFICATION,
								objectKey: this._sAttachObjectKey
							},
							"pmNotifContainerAttachments"
						).then(function (oAttachmentComponent) {
							that._oAttachmentComponent = oAttachmentComponent;
						});
					}

				}

			});

			oParseNavigationPromise.fail(function () {
				that.handleError();
			});

			this._isAppStateApplied = true;
		},

		/**
		 * Get current Application State
		 * @public
		 * @returns {object} the current app state
		 */
		getCurrentAppState: function () {

			// gets called from BaseController ...
			var oLongtextData = {};

			if (this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE)) {
				oLongtextData = this.getView().byId("pmNotifLongTextCreate").getBindingContext().getObject();
			} else {
				oLongtextData = this.getView().byId("pmNotifLongTextEdit").getContent()[0].getBindingContext().getObject();
			}

			return {
				notificationData: this.getObject(),
				longtextData: oLongtextData,
				customData: this.getCustomAppStateData()
			};
		},

		/**
		 * Get current App State data for customer data
		 * @public
		 * @returns {object} an object of additional custom fields defining the app state (apart from the object)
		 */
		getCustomAppStateData: function () {
			return {
				// to be enhanced with customData	
			};
		},

		/**
		 * Restore customer App State data
		 * @public
		 * @returns {object} an object of additional custom fields defining the app state (apart from the object)
		 */
		restoreCustomAppStateData: function () {
			// perform custom logic for restoring the custom data of the app state
		},

		/**
		 * Check if there are pending changes and ask for discard in popup
		 * @private
		 */
		_checkForPendingChangesAndAskForDiscard: function () {

			var fnCancel = function () {
				this.navBack();
			}.bind(this);

			// if the user navigates via manual URL changes or following a link, there might be unsaved changes pending
			// we do only support the change of one notification at a time . Thus the user has to decide to discard his changes or not ...
			if (this._bHasPendingChanges) {
				jQuery.sap.delayedCall(0, this, function () {
					this._messageSkipPendingChanges({
						fnCancel: fnCancel
					});
				});

			}
		},

		/**
		 * Show message and ask for discard of changes
		 * @param {object} functions for ok and not ok
		 * @private
		 */
		_messageSkipPendingChanges: function (oFunctions) {
			var that = this;

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
				this.getResourceBundle().getText("ymsg.messageWarningSkipPendingChanges"), {
					icon: MessageBox.Icon.WARNING,
					title: this.getResourceBundle().getText("xsel.messageSeverityWarning"),
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							// CHG001 is the intended coding that currently does not work ..
							//			reset changes should reset all changes but does not ...
							//			workaround: execute resetchanges as often as we have changes

							//var aPaths = [];							// CHG001 uncomment
							var oChanges = that.getModel().getPendingChanges();

							for (var sChangedEntityPath in oChanges) { //eslint-disable-line no-unused-vars
								//aPaths.push(sChangedEntityPath);		// CHG001 uncomment
								that.getModel().resetChanges(); // CHG001 comment
							}
							// if (aPaths.length > 0){					// CHG001 uncomment
							// 	that.getModel().resetChanges(aPaths);	// CHG001 uncomment
							// }										// CHG001 uncomment

							if (oFunctions) {
								if (typeof oFunctions.fnOk === 'function') {
									oFunctions.fnOk();
								}
							}
						}
						if (oAction === MessageBox.Action.CANCEL) {
							if (oFunctions) {
								if (typeof oFunctions.fnCancel === 'function') {
									oFunctions.fnCancel();
								}
							}
						}
					},
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		/**
		 * Restore Application State data
		 * @param {object} Data to restore
		 * @private
		 */
		_restoreAppStateData: function (oData) {

			var bCreatMode = this._oAppModel.getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_CREATE_MODE);
			var sPath = "";

			for (var objectName in oData) {
				var oEntity = oData[objectName];

				if (objectName.startsWith("notificationData")) {

					sPath = this.getView().getBindingContext().sPath + "/";

					for (var propertyName in oEntity) {

						switch (propertyName) {
						case "__metadata":
							break;
							// Timestamp is not set because it is going to be created "now"								
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
							this.getModel().setProperty(sPath + propertyName, oEntity[propertyName]);
							var oSelect = this.byId("pmNotifComboBoxNotificationType");

							oSelect.getBinding("items").attachEventOnce("change", function () { //eslint-disable-line no-loop-func
								oSelect.setSelectedKey(oEntity[propertyName]);
							});
							break;
						case "AttachmentId":
							this.getModel().setProperty(sPath + propertyName, oEntity[propertyName]);
							this._sAttachObjectKey = oEntity[propertyName];
							break;
						default:
							this.getModel().setProperty(sPath + propertyName, oEntity[propertyName]);
							break;
						}
					}
				} else if (objectName.startsWith("longtextData")) {

					// differentiate between edit and create
					if (bCreatMode) {
						sPath = this._oNewLongText.getPath() + "/";
					} else {
						sPath = this.byId("pmNotifLongTextEdit").getBinding("content").getContexts()[0].getPath() + "/";
					}

					// set the UpdateText as this is the only attribute that might change 
					this.getModel().setProperty(sPath + "UpdateText", oEntity.UpdateText);

				}
			}
		}

	});
});