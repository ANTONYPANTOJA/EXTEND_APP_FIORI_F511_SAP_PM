/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/eam/pmnotification/create/s1/util/Constants",
	"sap/ui/core/UIComponent",
	"sap/ui/model/resource/ResourceModel",
	"i2d/eam/pmnotification/create/s1/model/models",
	"sap/ui/Device",
	"i2d/eam/pmnotification/create/s1/controller/ErrorHandler"
], function(
	CONSTANTS,
	UIComponent,
	ResourceModel,
	models,
	Device,
	ErrorHandler
) {
	"use strict";

	return UIComponent.extend("i2d.eam.pmnotification.create.s1.Component", {

		metadata: {
			manifest: "json",
			"includes": ["css/style.css"]
		},

		oRootView: null,

		/**
		 * Init
		 * @public
		 */
		init: function() {
			/* 
			* Create deferred Batch Group for Long Text and Notification Header Entity 
			* This is needed for two-way model binding in order to only POST/PUT the 
			* createable/updateable Entities (Long Text, Notification Header)
			*/
			this.getModel().setDeferredGroups([CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP, "*"]);
			this.getModel().setChangeGroups({
				"NotificationHeader": {
					groupId: CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP,
					changeSetId: CONSTANTS.GENERAL.NOTIFICATION_CHANGE_SET,
					single: false
				},
				"LongText": {
					groupId: CONSTANTS.GENERAL.NOTIFICATION_BATCH_GROUP,
					changeSetId: CONSTANTS.GENERAL.NOTIFICATION_CHANGE_SET,
					single: false
				},
				"*": {
					groupId: "*",
					single: true
				}
			});

			// set the device model
			this.setModel(models.createDeviceModel(), CONSTANTS.MODEL.DEVICE_MODEL.NAME);

			// set the App model
			this.setModel(models.createAppModel(), CONSTANTS.MODEL.APP_MODEL.NAME);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			this._extractStartupParameters();

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * central methos to create App content
		 * @public
		 */
		createContent: function() {
			// call the base component's createContent function
			this.oRootView = UIComponent.prototype.createContent.apply(this, arguments);
			this.oRootView.addStyleClass(this.getCompactCozyClass());
			return this.oRootView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
		 */
		getCompactCozyClass: function() {
			if (!this._sCompactCozyClass) {
				// if (!Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
				// 	this._sCompactCozyClass = "sapUiSizeCompact";
				// } else {
				this._sCompactCozyClass = "sapUiSizeCozy"; // needed for desktop-first controls like sap.ui.table.Table
				//	}
			}
			return this._sCompactCozyClass;
		},

		/**
		 * Extract startup parameters from URL
		 * @private
		 */
		_extractStartupParameters: function() {
			var oComponentData = this.getComponentData();
			var sNotificationNumber = null;
			var bParametersExist = false;
			var sNavTarget = CONSTANTS.ROUTES.DISPLAY;
			var sIAPP_STATE = "sap-iapp-state";
			var rIAppStateNew = new RegExp("[\?&]" + sIAPP_STATE + "=([^&]+)");
			var sIAppStateKey = "";

			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sHash = oHashChanger.getHash();

			if (rIAppStateNew.test(sHash)) {
				sIAppStateKey = rIAppStateNew.exec(sHash)[0];
			}

			if (oComponentData && oComponentData.startupParameters && jQuery.isArray(oComponentData.startupParameters.navTarget) &&
				oComponentData.startupParameters.navTarget.length > 0 && sHash === "") {
				sNavTarget = oComponentData.startupParameters.navTarget;
				bParametersExist = true;
			}
			if(oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.notificationNumber) {
				sNotificationNumber = oComponentData.startupParameters.notificationNumber[0];
				bParametersExist = true;
			}
			if(oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.MaintenanceNotification) {
				sNotificationNumber = oComponentData.startupParameters.MaintenanceNotification[0];
				sNavTarget = CONSTANTS.ROUTES.DISPLAY;
				bParametersExist = true;
			}
			if (bParametersExist) {

				var sUrl = this.getRouter().getURL(sNavTarget,
					sNotificationNumber ? {
						NotificationNumber: sNotificationNumber
					} : {});

				sUrl = sUrl + sIAppStateKey;
				this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME).setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_STARTUP_CREATE, false);
				if (sUrl) {
					oHashChanger.replaceHash(sUrl);
				}
			} else {
				sUrl = oHashChanger.getHash();

				// no Hash given => create URL for Create
				if (sUrl === "") {
					sNavTarget = CONSTANTS.ROUTES.CREATE;
					sUrl = this.getRouter().getURL(sNavTarget);
					oHashChanger.replaceHash(sUrl);
				}

			}

		}

	});

});