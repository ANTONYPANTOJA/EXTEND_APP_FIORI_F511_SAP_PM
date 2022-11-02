/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/eam/pmnotification/create/s1/util/Constants",
	"i2d/eam/pmnotification/create/s1/controller/BaseController",
	"i2d/eam/pmnotification/create/s1/model/formatter",
	"sap/ui/model/json/JSONModel"
], function (CONSTANTS, BaseController, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.s1.controller.S1", {

		formatter: formatter,
		_oViewReady: null,
		_oMaintainNotificationController: null, // Controller of central MaintainNotificationView

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * onInit
		 * @public
		 */
		onInit: function () {
			// asynchronous processing: now need to wait for both view and metadata
			this._oViewReady = Promise.all([this.getView().loaded(), this.byId("pmNotifViewCreateNotification").loaded(), this.getModel().metadataLoaded()])
				.then(function (aPromiseReturns) {
					var oView = aPromiseReturns[1],
						oS1View = aPromiseReturns[0];

					this._oMaintainNotificationController = oView.getController();
					//now we set the view property model also on this view to have access to properties in view (busy, delay)
					var oViewProperties = this._oMaintainNotificationController.initViewPropertiesModel();
					this.setModel(oViewProperties, CONSTANTS.MODEL.VIEW_PROP.NAME);

					this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME).setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.IS_METADATA_LOADED, true);
					oView.attachModelContextChange(function () {
						var sBindingPath = oView.getBindingContext() ? oView.getBindingContext().getPath() : null,
							oMessagesIndicator = oS1View.byId("pmNotifCreateNotificationMessagesIndicator").getAggregation("_control"),
							oMessagesIndicatorTextBinding = oMessagesIndicator && oMessagesIndicator.getBinding("text");

						if (sBindingPath && oMessagesIndicatorTextBinding) {
							oMessagesIndicatorTextBinding.setFormatter(function (aMessages) {
								return aMessages.filter(function (vMessage) {
									return vMessage.getTarget() === sBindingPath;
								}).length;
							});
						}
					});
					this._oMaintainNotificationController.initializeNewNotificationData();
				}.bind(this));

			this.oShareModel = new JSONModel({
				bookmarkTitle: this.getResourceBundle().getText("FULLSCREEN_TITLE"),
				bookmarkIcon: "sap-icon://S4Hana/S0012"
			});
			this.setModel(this.oShareModel, "share");
			this.byId("pmNotifButtonShareTile").setBeforePressHandler((this.onBeforePressBookmark).bind(this));

			this.getRouter().getRoute(CONSTANTS.ROUTES.CREATE).attachPatternMatched(this._onRoutePatternMatched, this);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the list screen or FLP screen
		 * @public
		 */
		onNavBack: function () {
			this._oMaintainNotificationController.cancelNotification();
			//this.navBack("#");
		},

		/**
		 * validate the entered data and save the entity
		 * @public
		 */
		onSave: function () {

			if (this._oMaintainNotificationController.validateNewNotification()) {
				this._oMaintainNotificationController.saveNotification();
			}
		},

		/**
		 * Navigates back to the list screen
		 * @public
		 */
		onCancel: function () {
			this._oMaintainNotificationController.cancelNotification();
		},

		/**
		 * Evant Handler to navigate to the list of notifications
		 *  (cancels the current notification)
		 * @public
		 */
		onMyNotifications: function () {
			// nav to list without cancel
			this.navTo(CONSTANTS.ROUTES.LIST);
		},

		/**
		 * Event Handler for message display: opens message in a popover
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		onMessageButtonPressed: function (oEvent) {

			var oMessagePopover = this.getMessagePopover(),
				oBinding = oMessagePopover.getBinding("items"),
				sViewBindingPath = this.byId("pmNotifViewCreateNotification").getBindingContext().getPath();

			oBinding.filter([new sap.ui.model.Filter({
				path: "target",
				operator: "EQ", 
				value1: sViewBindingPath
			})]);

			oMessagePopover.toggle(oEvent.getSource());

		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {

			this._oMaintainNotificationController.onShareEmailPress({
				bImmediateHashReplace: false
			});

		},

		/**
		 * Event handler that changes the URL based on the current app state 
		 * before the bookmark button is pressed
		 * @public
		 */
		onBeforePressBookmark: function () {

			this._oMaintainNotificationController.storeCurrentAppState(
				(this._oMaintainNotificationController.getCurrentAppState).bind(this._oMaintainNotificationController)
			);

			var oAddToHome = this.getView().byId("pmNotifButtonShareTile");
			oAddToHome.setAppData({
				title: this.oShareModel.getProperty("/bookmarkTitle"),
				icon: this.oShareModel.getProperty("/bookmarkIcon")
			});
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * process the onRoutePatternMatched event and delegates processing to the according controller
		 * @param {sap.ui.base.Event} oEvent
		 * @private
		 */
		_onRoutePatternMatched: function (oEvent) {
			var that = this,
				mEventParameters = oEvent.getParameters();

			// perform subsequent steps in routePatternMatched
			// since switching to asynchronous view instantiation, have to wait until the MaintainNotification controller is actually available.
			// in the meantime, event object gets garbage-collected, hence need to save the parameter map.
			this._oViewReady.then(function () {
				that._oMaintainNotificationController.routePatternMatched(mEventParameters);
			});

		}

	});

});