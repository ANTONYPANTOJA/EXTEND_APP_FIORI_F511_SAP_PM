/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
        "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
		"i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"i2d/eam/pmnotification/create/zeamntfcres1/util/Notifications",
		"i2d/eam/pmnotification/create/zeamntfcres1/util/Util"
	], function(CONSTANTS, BaseController, JSONModel, Notifications, Util) {
	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.App", {

		_oAppModel: {}, // Application-Model
		_oDataHelper: {}, // instance of util.Notifications used to perform explicit backend calls
		_oUtil: {}, // Singleton for Utility-Methods
		_oMessagePopover: null,
		_oLastSavedInnerAppData: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * onInit:
		 * @public
		 */
		onInit: function() {
			var oAppModel;
			var fnSetAppNotBusy;
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oAppModel = this._oAppModel = this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME);
			this.setAppBusy();				

 			// enable/disable camera + gps-features + barcode + attachments		
			oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.CAMERA_AVAILABLE, this.isFunctionAvailable("navigator.camera"));
			oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.GPS_AVAILABLE, this.isFunctionAvailable("navigator.geolocation"));
			oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.BARCODE_AVAILABLE, this.isFunctionAvailable(
				"cordova.plugins.barcodeScanner"));
			oAppModel.setProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.ATTACHMENTS_AVAILABLE, this.isAttachmentSwitchOn());

			fnSetAppNotBusy = function() {
				this.setAppBusyComplex({
					setBusy: false,
					delay: iOriginalBusyDelay
				});					
			};

			// stop the busy indicator as soon as metadata was loaded
			this.getModel().metadataLoaded()
				.then((fnSetAppNotBusy).bind(this), (fnSetAppNotBusy).bind(this));

			// provide Utilities
			this.getView().loaded().then(function() {
				this._oDataHelper = new Notifications(this.getOwnerComponent(), this.getView());
			}.bind(this));
			this._oUtil = new Util();

			// Create Message Popover for Error Handling => new Message Handling Concept
			this._oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: new sap.m.MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					})
				}
			});
			this._oMessagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			this.getOwnerComponent().setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

		},

		/**
		 * onExit:
		 * @public
		 */
        onExit: function() {
            this._oUtil = null;
            
        },
        
		/* ===========================================================  */
		/* Getters                                                      */
		/* ===========================================================  */

		/**
		 * Getter for the Util-Helper.
		 * @public
		 * @returns {i2d.eam.pmnotification.create.util.Util} Util-Object
		 */
		getUtil: function() {
			return this._oUtil;
		},

		/**
		 * Getter for the Message-Popover.
		 * @public
		 * @returns {sap.m.MessagePopover} Popover-Object
		 */
		getMessagePopover: function() {
			return this._oMessagePopover;
		},

		/**
		 * Returns the (singleton) helper for handling oData operations in this application
		 * @public
		 * @returns {i2d.eam.pmnotification.create.util.Notification} Util-Object
		 */
		getODataHelper: function() {
			return this._oDataHelper;
		},

		/* ===========================================================  */
		/* Helpers                                                      */
		/* ===========================================================  */

		/**
		 * Determine whether Attachments shall be used
		 * @public
		 * @returns {boolean} function active
		 */		
		isAttachmentSwitchOn: function(){
			/**    
			 * @ControllerHook Switches the attachment function on or off. 
			 * @callback i2d.eam.pmnotification.create.controller.App~extHookAttachmentSwitch
			 * @return {boolean} State of attachment function
			 */	
			 if (this.extHookAttachmentSwitch){
			     return this.extHookAttachmentSwitch();
			 }else{
                 return true;
			 }

		},
		
		/**
		 * Function to set the view property, that a valid user is given
		 * @public
		 */
		setPropUserValid: function() {

			var oViewModel;
			var oNotification;

			oViewModel = this.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME);

			if (!this.getView().getBindingContext()) {
				return;
			}
			oNotification = this.getView().getBindingContext().getObject();

			var bUserValid = this.isUserIDValid(oNotification.ReporterUserId);

			oViewModel.setProperty(
				CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.VALID_USER_GIVEN,
				bUserValid
			);

		},

       /**
		 * builds filter criteria for notifications
		 * 
		 * @param {object} oNotification Notification-Element
		 * @param {string} sType destinguish between open, history and notifications in general per Technical Object 
		 * ["open"|"history"|""]
		 * @return {sap.ui.model.Filter}  array of Filter criteria
		 * @public
		 */
		buildFilterForNotifications: function(oNotification, sType) {
			var aFilters = [];
			
			switch (sType) {
				case CONSTANTS.GENERAL.COUNT_OPEN_NOTIFICATIONS:
					aFilters = this._buildFilterCriteriaForCurrentNotifications(oNotification);
					break;
				case CONSTANTS.GENERAL.COUNT_HISTORY_NOTIFICATIONS:
					aFilters = this._buildFilterCriteriaForHistoryNotifications(oNotification);
					break;
				default:    //CONSTANTS.GENERAL.COUNT_ALL_NOTIFICATIONS
					aFilters = this._buildFilterCriteriaForNotifications(oNotification);
			}
			
			/**    
			 * @ControllerHook Allows you to influence which notifications are displayed in the "Current Notifications" quickview.
			 * @callback i2d.eam.pmnotification.create.controller.App~extHookFilterOpenNotifications
			 * @param {sap.ui.model.Filter} [aFilters] Array of filter criteria
			 * @param {string} "open", "history", or "" depending on which set of notifications are to be retrieved
			 * @return {sap.ui.model.Filter}  Array of filter criteria
			 */
			if (this.extHookFilterOpenNotifications) { // check whether any extension has implemented the hook...
				aFilters = this.extHookFilterOpenNotifications(aFilters, sType); // ...and call it
			}			
			
			return aFilters;
		},

       /**
		 * builds filter criteria for the retrieval of current notifications
		 * 
		 * @param {object} oNotification Notification-Element
		 * @return {sap.ui.model.Filter}  array of Filter criteria
		 * @private
		 */
        _buildFilterCriteriaForCurrentNotifications: function(oNotification) {
		    var aFilters = [];
		    
			aFilters = [new sap.ui.model.Filter(
			        oNotification.TechnicalObjectNumber !== "" && oNotification.TechnicalObjectType !== "" ?
			        {
    					filters: [
                                        new sap.ui.model.Filter({
    							path: "TechnicalObjectNumber",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectNumber
    						}),
            						    new sap.ui.model.Filter({
    							path: "TechnicalObjectType",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectType
    						}),
            						    new sap.ui.model.Filter({
    							path: "NotificationPhase",
    							operator: sap.ui.model.FilterOperator.BT,
    							value1: "1",
    							value2: "3"
    						})    						
                                ],
    					    and: true
				    }: [] )
                ];

			return aFilters;
			
		},

       /**
		 * builds filter criteria for the retrieval of notifications for Technical Objects
		 * 
		 * @param {object} oNotification Notification-Element
		 * @return {sap.ui.model.Filter}  array of Filter criteria
		 * @private
		 */
        _buildFilterCriteriaForNotifications: function(oNotification) {
		    var aFilters = [];
		    
			aFilters = [new sap.ui.model.Filter(
			        oNotification.TechnicalObjectNumber !== "" && oNotification.TechnicalObjectType !== "" ?
			        {
    					filters: [
                                        new sap.ui.model.Filter({
    							path: "TechnicalObjectNumber",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectNumber
    						}),
            						    new sap.ui.model.Filter({
    							path: "TechnicalObjectType",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectType
    						})   						
                                ],
    					    and: true
				    }: [] )
                ];

			return aFilters;
			
		},
		
       /**
		 * builds filter criteria for the retrieval of historical notifications
		 * 
		 * @param {object} oNotification Notification-Element
		 * @return {sap.ui.model.Filter}  array of Filter criteria
		 * @private
		 */
        _buildFilterCriteriaForHistoryNotifications: function(oNotification) {
		    var aFilters = [];
		    
			aFilters = [new sap.ui.model.Filter(
			        oNotification.TechnicalObjectNumber !== "" && oNotification.TechnicalObjectType !== "" ?
			        {
    					filters: [
                                        new sap.ui.model.Filter({
    							path: "TechnicalObjectNumber",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectNumber
    						}),
            						    new sap.ui.model.Filter({
    							path: "TechnicalObjectType",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: oNotification.TechnicalObjectType
    						}),
            						    new sap.ui.model.Filter({
    							path: "NotificationPhase",
    							operator: sap.ui.model.FilterOperator.BT,
    							value1: "4",
    							value2: "5"
    						})    						
                                ],
    					    and: true
				    }: [] )
                ];

			return aFilters;
			
		}

	});

});