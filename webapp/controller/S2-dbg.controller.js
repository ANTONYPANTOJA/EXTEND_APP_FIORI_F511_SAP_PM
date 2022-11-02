/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/eam/pmnotification/create/s1/util/Constants",
	"i2d/eam/pmnotification/create/s1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"i2d/eam/pmnotification/create/s1/util/TextTemplateHandler",
	"i2d/eam/pmnotification/create/s1/model/formatter"
], function(CONSTANTS, BaseController, JSONModel, TextTemplateHandler, formatter) {
	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.s1.controller.S2", {

		formatter: formatter,

		_oMaintainNotificationController: null, // Controller of central MaintainNotificationView
		_oDataHelper: null,
		_oTextTemplate: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * onInit
		 * @public
		 */
		onInit: function() {

			this.getView().loaded().then(function() {
				this._oDataHelper = this.getODataHelper();
			}.bind(this));
			this._oMaintainNotificationController = this.byId("pmNotifViewEditNotification").getController();
			//now we set the view property model also on this view to have access to properties in view (busy, delay)
			var oViewProperties = this._oMaintainNotificationController.initViewPropertiesModel();
			this.setModel(oViewProperties, CONSTANTS.MODEL.VIEW_PROP.NAME);			
			this.setAppBusyComplex({
				delay: 0
			});			

			this.getRouter().getRoute(CONSTANTS.ROUTES.EDIT).attachPatternMatched(this._onRoutePatternMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the FLP screen
		 * @public
		 */
		onNavBack: function() {

			this._oMaintainNotificationController.cancelNotification();

		},

		/**
		 * Event Handler for message display: opens message in a popover
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		onMessageButtonPressed: function(oEvent) {

			this.getMessagePopover().toggle(oEvent.getSource());

		},

		/**
		 * validate the entered data and save the entity
		 *
		 * @public
		 */
		onSave: function() {

			if (this._oMaintainNotificationController.validateNewNotification()) {
				this._oMaintainNotificationController.saveNotification();
			}
		},

		/**
		 * Cancels the dialog and navigates back
		 *
		 * @public
		 */
		onCancel: function() {
			this._oMaintainNotificationController.cancelNotification();
		},

		/**
		 * Deletes current notification.
		 *
		 * @public
		 */
		onDeletePressed: function() {

			this._oMaintainNotificationController.deleteNotification();

		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {

			this._oMaintainNotificationController.onShareEmailPress({
				bImmediateHashReplace: false
			});

		},

		/**
		 * Opens the EmployeeInfo-Popover
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		onPressReporter: function(oEvent) {
			var oNotification = this._oMaintainNotificationController.getView().getBindingContext().getObject();
			this.getUtil().launchPopoverEmployeeQuickView(
				oNotification.ReporterUserId,
				oEvent.getSource(),
				this._oMaintainNotificationController.getView());

		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * process the onRoutePatternMatched event and delegates processing to the according controller
		 * @param {sap.ui.base.Event} oEvent
		 * @private
		 */
		_onRoutePatternMatched: function(oEvent) {
			this._oMaintainNotificationController.routePatternMatched(oEvent);
		}

	});

});