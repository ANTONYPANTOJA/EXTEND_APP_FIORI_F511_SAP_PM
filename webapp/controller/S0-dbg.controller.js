/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
        "i2d/eam/pmnotification/create/s1/util/Constants",
		"i2d/eam/pmnotification/create/s1/controller/BaseController",
		"i2d/eam/pmnotification/create/s1/util/Util",
		"i2d/eam/pmnotification/create/s1/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/ODataUtils"
	], function(CONSTANTS, BaseController, Util, formatter, JSONModel,ODataUtils) {
	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.s1.controller.S0", {

		formatter: formatter,

		_oDataHelper: null,
		_oViewProperties: null, // JSON model used to manipulate declarative attrivutes of the controls used in this view. Initialized in _initViewPropertiesModel
		_oResourceBundle: null, // the resource bundle to retrieve texts from
		_oAppModel: null,
		_oTextTemplate: null,
		_changeTimer: null,
		_oSearchField: null,
		_sSearchTerm: "",
		_oSmartTable:null,
		_oSmartFilterBar:null,
		_bOnInitFinished: false,
		_bFilterBarInitialized: false,
		_bSTVariantInitialized: false,
		
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * onInit
		 * @public
		 */
		onInit: function() {
			this._oAppModel = this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME);
			this.getView().loaded().then(function() {
				this._oDataHelper = this.getODataHelper();
			}.bind(this));

			this._initViewPropertiesModel();

			this.getRouter().getRoute(CONSTANTS.ROUTES.LIST).attachPatternMatched(this._onRoutePatternMatched, this);

			// Search and InlineCount doesn't work together on HANA
			this.getModel().setDefaultCountMode(sap.ui.model.odata.CountMode.None);

            this.getView().byId("pmNotifButtonShareTile").setBeforePressHandler((this.onBeforePressBookmark).bind(this));            
            this.getView().byId("pmNotifButtonShareTile").setAfterPressHandler((this.onAfterPressBookmark).bind(this));            
            this._oSmartTable = this.getView().byId("pmNotifSmartTableWorklist");
            this._oSmartFilterBar = this.byId("pmNotifSmartTableFilterWorklist");
            
            
			this.oShareModel = new JSONModel({
					// BOOKMARK START
					bookmarkTitle : this.getResourceBundle().getText("xtit.notificationList"),
					bookmarkIcon : "sap-icon://S4Hana/S0012",   
					bookmarkCustomUrl : function() {
						return this.storeCurrentAppState(); // just a dummy
					}.bind(this)
			});

			// setting the models to the view
			this.setModel(this.oShareModel, "share"); 

        	//AppState-Handling
        	this._bOnInitFinished = true;
			this.applyAppState();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Navigates back to the previous view
		 * @public
		 */
		onNavBack: function() {
			this.navBack();
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
		 * Evant Handler to navigate creation view
		 * @public
		 */
		onAddPressed: function() {
			// nav to list without cancel
			this.navTo(CONSTANTS.ROUTES.CREATE);
		},

		/**
		 * Evant Handler when clicked on row to navigate to notification
		 * @public
		 */
        onHandleRowPress: function(oEvent) {

            if (oEvent.getSource().getBindingContext() && oEvent.getSource().getBindingContext().getObject()) {
                var sNotificationNumber = oEvent.getSource().getBindingContext().getObject().NotificationNumber;
    			this.navTo(CONSTANTS.ROUTES.DISPLAY, {
    				NotificationNumber: encodeURIComponent(sNotificationNumber)
    			});                            
            }
		},
		
		/**
		 * Event-Handler called once for every link.
		 * This function starts the employeeInfo-Popover or the notification-display
		 * @param {sap.ui.base.Event} oEvent
		 *
		 * @public
		 */
		onBeforePopoverOpens: function(oEvent) {

			var oParameters = oEvent.getParameters();
			var that = this;
			var oLink = sap.ui.getCore().byId(oEvent.getParameter("originalId"));

			if (oParameters.semanticObject === "ReporterDisplay") {

				var sUserID = oParameters.semanticAttributes.ReporterUserId;
				var oView = this.getView();

				// attach directly to the Link-Event
				// else all but the first link press are ignored
				oLink.attachPress(function(oEventInner) {
					that.getUtil().launchPopoverEmployeeQuickView(
						sUserID,
						oEventInner.getSource(),
						oView);
				});

				// launch the employeeInfo Popover
				that.getUtil().launchPopoverEmployeeQuickView(
					sUserID,
					oLink,
					oView);

			}
		},

		// ---------------------------------------------
		// FILTER BAR EVENTS
		// ---------------------------------------------
		/**
		 * Event-Handler called on Init of filterbar.
		 * This function applies the App State
		 *
		 * @public
		 */		
		onInitSmartFilterBar: function() {
			this._bFilterBarInitialized = true;
			this.applyAppState();
		},
		
		/**
		 * set search value from search field
		 * set popin values for different screens sizes
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		onBeforeRebindTable: function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");

			var aColumns = this.byId("pmNotifSmartTableWorklist").getTable().getColumns();
			$.each(aColumns, function() {
				var sColumnKey = this.data().p13nData.columnKey;

				switch (sColumnKey) {
					case "NotificationNumber":
						this.setMinScreenWidth("Phone");
						break;
					case "SystemStatus":
						this.setMinScreenWidth("Tablet");
						this.setDemandPopin(false);
						break;
					case "DateMonitor":
						this.setDemandPopin(false);
						break;
					case "PriorityText":
						this.setDemandPopin(false);
						break;
					case "TechnicalObjectNumber":
						this.setMinScreenWidth("Phone");
						break;
					case "ShortText":
                        break;
					case "ReporterDisplay":
                        break;
					default:
					    //this.setDemandPopin(true);
						break;
				}

			});

			//If selection contains ReporterDisplay we also have to read the User ID (if available)
			if (mBindingParams.parameters.select.indexOf("ReporterDisplay") !== -1) {
				mBindingParams.parameters.select = mBindingParams.parameters.select + ",ReporterUserId";
			}
			
			//If selection contains NotificationTimestamp we also have to read the NotificationDate, NotificationTime and the NotificationTimezone
			if (mBindingParams.parameters.select.indexOf("NotificationTimestamp") !== -1) {
				mBindingParams.parameters.select = mBindingParams.parameters.select + ",NotificationDate,NotificationTime,NotificationTimezone";
			}
			
			// keep the filters internally available in order to be able to apply them if a tile is saved
			this._myFilters = mBindingParams.filters;
            
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * initialize the view proerties for this view
		 * @private
		 */
		_initViewPropertiesModel: function() {

			this._oViewProperties = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this._oViewProperties, CONSTANTS.MODEL.VIEW_PROP.NAME);
			this._refreshViewProperties();
		},
		
		/**
		 * refreshes the View properties
		 * @private
		 */		
		_refreshViewProperties: function(){

			this._oViewProperties.setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED,
									!this.hasPendingChangesForOtherNotification());
						
		},

		/**
		 * process the onRoutePatternMatched event (called on RoutePatternMatched in Application Controller)
		 * @private
		 */
		_onRoutePatternMatched: function() {

			this.setAppUnBusy();

			this._refreshViewProperties();
			// Checks if the binding context is already available locally. If so, refreshes the binding and retrieves the
			// data from backend again.
			var oBindingContext = this.getView().getBindingContext();
			if (oBindingContext) {
				this.getView().getElementBinding().refresh();
			}
	
		},

		/* ===========================================================  */
		/* begin: AppState-Handling                                            */
		/* ===========================================================  */	

		/**
		 * Event handler that changes the URL based on the current app state 
		 * before the bookmark button is pressed
		 * @public
		 */
		onBeforePressBookmark: function() {
		    var sFilterParams;
		    var aFilters;
		    
		    this.storeCurrentAppState((this.getCurrentAppState).bind(this));

            var sServiceUrl = this.getModel().sServiceUrl;
		    var sResolvedPath = this.getModel().resolve("/NotificationHeaderSet", this.getView().getBindingContext());

		    if( this._myFilters ){
		        
		        aFilters = this._myFilters;
		        
                var oMetadata = this.getModel().getMetaModel().oMetadata;
                var oEntityType = this.getModel().oMetadata._getEntityTypeByPath("/NotificationHeaderSet");
		        
		        sFilterParams = ODataUtils.createFilterParams(aFilters, oMetadata, oEntityType);
		         
		    }
		    
			sServiceUrl = sFilterParams ? sServiceUrl + sResolvedPath + "/$count/" +"?"+ sFilterParams : 
                                          sServiceUrl + sResolvedPath + "/$count";

		    var oAddToHome = this.getView().byId("pmNotifButtonShareTile");
		    oAddToHome.setAppData({
    			    title: this.oShareModel.getProperty("/bookmarkTitle")
    			    ,icon: this.oShareModel.getProperty("/bookmarkIcon")
    			    ,serviceUrl : sServiceUrl
    			    //,serviceRefreshInterval: 60
                });
		},
		
		/**
		* Event handler when the share by E-Mail button has been clicked
		* @public
		*/
		onShareEmailPress : function () {
		
			this.storeCurrentAppState((this.getCurrentAppState).bind(this)).done(function(){
				sap.m.URLHelper.triggerEmail(
					null,
					this.getResourceBundle().getText("xtit.notificationList"),
					location.href
				);
			}.bind(this));
		},
		
		
		/**
		 * Event handler that invalidates the app state after the bookmark button was pressed
		 * @public
		 */
		onAfterPressBookmark: function() {
		    this.invalidateAppStateForFurtherUse();
		},		
		
		onAfterSTVariantApplied: function() {
			if(!this._bSTVariantInitialized) {
				this._bSTVariantInitialized = true;
				this.applyAppState();
			}
		},
		
		onAfterSTVariantInitialised: function() {
			if(this._oSmartTable.getCurrentVariantId() === "") {
				// either no LRep available, or user doesn't have a custom default variant
				// if there is a variant ID set, we would wait until it is actually applied
				this._bSTVariantInitialized = true;
				this.applyAppState();
			}
		},
		
		/**
		 * Applying the Application State to the table
		 * @public
		 */		
		applyAppState: function() {
			// check if both init events for the controller and the SmartFilterBar have finished
			if (!(this._bFilterBarInitialized && this._bOnInitFinished && this._bSTVariantInitialized)) {
				return;
			}
 			
            this.initVars();
			var oParseNavigationPromise = this.parseNavigation();
			
			var that = this;
			oParseNavigationPromise.done(function(oAppData, oURLParameters, sNavType){
				
				if (sNavType !== CONSTANTS.ROUTES.NavType.initial) {
					// if the app is started with any parameters, then clear the filter bar variant

					that._oSmartFilterBar.clearVariantSelection();
					that._oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant);

					that.restoreCustomAppStateData(oAppData.customData);
				    that._oSmartTable.setCurrentVariantId(oAppData.tableVariantId);
		    	}
		    	that._oSmartTable.rebindTable();
	
			});
			
			oParseNavigationPromise.fail(function(){
				that.handleError();
			});
	
		},		
		
		/**
		 * Gets current App State data
		 * @public
		 * @returns {object} the current app state 
		 */
		getCurrentAppState: function(){
			
			return {
				selectionVariant: this._oSmartFilterBar.getDataSuiteFormat(),
				tableVariantId: this._oSmartTable.getCurrentVariantId(),
				customData: this._getCustomAppStateData()
			};	
	
		    
		},

		/**
		 * Gets customer App State data
		 * @private
		 * @returns {object} an object of additional custom fields defining the app state (apart from the selection variant and the table variant)  
		 */
		_getCustomAppStateData : function(){
			return {
				// add custom data if necessary
			};
		},

		/**
		 * Restores customer App State data
		 * @public
		 * @returns {object} an object of additional custom fields defining the app state (apart from the selection variant and the table variant)  
		 */
		restoreCustomAppStateData : function(){
			// perform custom logic for restoring the custom data of the app state
		}		
	});

});