/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
		"i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
		"i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
		"i2d/eam/pmnotification/create/zeamntfcres1/util/Constants"
	], function (BaseController, formatter, CONSTANTS) {
	"use strict";

	return BaseController.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.GeoMap", {

		// formatter : formatter,
		// _oGeoMaps: {},
		// _bInitialized : false,
		// _bDisplayOnlyMap:false,
		// _bVisibleOnDesktopAtStartup:false,
		// _sLocationPropertyInContext: CONSTANTS.GENERAL.LOCATION_GPS,

		// /* =========================================================== */
		// /* lifecycle methods                                           */
		// /* =========================================================== */
		
		// /**
		//  * onInit
		//  * @public
		//  */		
  //  	onInit: function() {
    	    
  //  	    this._oGeoMaps= {};
            
  //  	},

		// /**
		//  * onBeforeRendering
		//  * @public
		//  */	
  //      onBeforeRendering: function(){

		// 	if (this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME).getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.GPS_AVAILABLE)) {
	 //   	    jQuery.sap.require("sap.ui.vbm.GeoMap");
	 //           jQuery.sap.require("sap.ui.vbm.Resource");
	 //           jQuery.sap.require("sap.ui.vbm.Spots"); 
	
	 //           this._getCustomData();
	            
	 //           if ( !this._bInitialized){
	 //              // create local Model
	 //               var oGeoModel = new sap.ui.model.json.JSONModel(this._getInitialMapData( ));
	 //               this.getView().setModel(oGeoModel,"geo");   
	 //           }
	
	 //           if (this._bDisplayOnlyMap  // display only the map
	 //                   // display map at startup if gps-data is available
	 //                   || (this._bVisibleOnDesktopAtStartup && this._isGPSDataAvailable())){
	 //               this._initGeoMap(this.getView());
		// 	        this._showMap({ updateIssueLoc: this._isUpdateOfGPSDataNecessary()});               
	 //           } 				
		// 	}

  //      },

		// /* =========================================================== */
		// /* event handlers                                              */
		// /* =========================================================== */
		
		// /**
		//  * Display the map
		//  * @public
		//  */
  //      onShowMap: function(oEvent){
            
  //          // init Map if Map shall be displayed in this view (not in a popover)
  //          if(this._isDisplayMapInPlaceActive()){
  //              this._initGeoMap(this.getView());
  //          }
		//     this._showMap(
		//             {   source: oEvent.getSource(), 
		//                 updateIssueLoc: this._isUpdateOfGPSDataNecessary()
		//             }
		//     );
  //      },

		// /**
		//  * toggles the map display
		//  * @public
		//  */
		// onToggleMapDisplay: function(oEvent) {
		    
		//     if (this._isDisplayMapInPlaceActive()){
		//         if(!this._bInitialized){
		//             this.onShowMap(oEvent);
		//         }else{
		//             this._toggleMapDisplay( );
		//         }
		//     }else { // on other devices only show map makes sense because the map is not displayed in place
		//         this.onShowMap(oEvent);
		//     }
		    
		// },

		// /**
		//  * discard the collected GPS data and hide the map
		//  * @public
		//  */
		// onDiscardGPSData: function() {
		//     this._hideMap();
		//     this._setIssuePosition("0;0;0", false);
		// },

		// /* ===========================================================  */
		// /* Internal Helpers                                             */
		// /* ===========================================================  */

		// /**
		//  * get properties via CustomData
		//  * @private
		//  */	
  //      _getCustomData:function(){
  //          // determine path to gps property in context via customdata
  //  	    if (this.getView().data("locationPropertyInContext")) {
  //  	        this._sLocationPropertyInContext = this.getView().data("locationPropertyInContext") ;
  //  	    } else {
  //  	        this._sLocationPropertyInContext = CONSTANTS.GENERAL.LOCATION_GPS ;
  //  	    }
            
  //          // distinguish inplace display and popover/dialog via customdata
  //  	    if (this.getView().data("displayMapInPopover")==="true") {
  //  	        this._bDisplayOnlyMap = true ;
  //  	    } else {
  //  	        this._bDisplayOnlyMap = false ;
  //  	    }

  //          // enforce map display via customdata?
  //          if (this.getView().data("visibleOnDesktopAtStartup")==="true") {
  //              this._bVisibleOnDesktopAtStartup = true;
  //          }            
  //      },


		// /**
		//  * Creates GeoMap
		//  * @return {object} GeoMap  
		//  * @private
		//  */
  //      _getGeoMap: function(oParentView) {

  //  		var oCurrentGeoMap = {};

		// 	if (!(this._oGeoMaps && this._oGeoMaps[oParentView.getId()])) {
			    
  //  			var fnOnSpotChanged = function(oEventSpotChanged) {
    
  //  				// remove workaround (currently used to avoid build errors due to voter)
  //  				var sPos = this.objectByString(oEventSpotChanged, "mParameters.data.Data.Merge.N[0].E[0].P");
  //  				// //this is the intended coding:
  //  				// if (oEventSpotChanged.mParameters.data.Data.Merge.N[0].E[0].P) {
  //  				// 	var sPos = oEventSpotChanged.mParameters.data.Data.Merge.N[0].E[0].P;
  //  				// 	}
  //  				if (sPos) {
  //  					this._setIssuePosition(sPos);	
  //  				}
    
  //  			};	
    			
  //              oCurrentGeoMap = new sap.ui.vbm.GeoMap(
  //                  {   
  //                      initialZoom: "{geo>/initialZoom}",
  //                      initialPosition:"{geo>/initialPos}",
  //                      scaleVisible: true,
  //                  	resources: 
  //                  	[
  //              				new sap.ui.vbm.Resource({ name: "pin_blue.png", value:"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" } )
  //               		],
  //                      vos: [
  //                              // insert the spot for the "location of the issue"
  //                              ( this._isGPSDataAvailable()
  //                                  || this._isChangeAllowed()
  //                              )? 
  //                  	    	  	new sap.ui.vbm.Spots({
  //                      	            items: { 
  //                      	             	path : "geo>/Spots",
  //                      	              	template: new sap.ui.vbm.Spot(  
  //                      	              	        {   position: "{" + this._sLocationPropertyInContext + "}"
  //                      	              	            ,tooltip: '{geo>tooltip}' 
  //                      	              	            ,image: '{geo>pin}' 
  //                      	              	            ,changeable: "{" + CONSTANTS.MODEL.VIEW_PROP.NAME + ">" + CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED + "}"
  //                      	              	            ,handleMoved : jQuery.proxy(fnOnSpotChanged, this)
  //                      	              	            //, click: jQuery.proxy(fnClick, this)
  //                      	              	        } 
  //                      	              	    )
  //                      	           	} 
  //                  	    	  	})
  //                               : new sap.ui.vbm.Spots(),
  //              	    	  	// insert the current position circle
  //              	       		new sap.ui.vbm.Circles({
  //              	      	    	items: { 
  //              	      	    	         path : "geo>/Circles",
  //              	                         template: new sap.ui.vbm.Circle(  
  //              	                            {   radius: '{geo>radius}', 
  //                  	                            position: '{geo>pos}', 
  //                  	                            tooltip: '{geo>tooltip}', 
  //                  	                            color: '{geo>color}', 
  //                  	                            colorBorder: '{geo>colorBorder}',
  //                  	                            changeable: '{geo>changeable}' 
  //              	                            } 
  //              	                        )
  //              	      	    	} 
  //              	       		})
  //              	    	]                		
  //                  });                      
                    
  //                  // distinguish width for inplace and popover/dialog ...
  //                  if (!this._isDisplayMapInPlaceActive()){
  //                  	/* eslint-disable sap-browser-api-warning */
  //                      oCurrentGeoMap.setWidth(window.innerWidth + "px");
  //                      /* eslint-enable sap-browser-api-warning */
  //                  }
                    
  //              this._oGeoMaps[oParentView.getId()] = oCurrentGeoMap;
		// 	}
			
		// 	return this._oGeoMaps[oParentView.getId()];
  //      },
		
		// /**
		//  * Center the map around the issue location and current position
		//  * @private
		//  */
		// _centerMap: function(){
		    
		//     var sILLat, sILLon, sCLLat, sCLLon, sIssueLocation;
		//     var aLat = [];
		//     var aLon = [];
            
  //          if (this.getView().getBindingContext()){
		//         sIssueLocation = this._getLocationGPS() ;
  //          }
		//     var sCurrentLocation = this.getModel("geo").getProperty( "/Circles/0/pos" );  

  //          try{
  //              sILLat = sIssueLocation ? sIssueLocation.split(";")[0] : "" ; 
  //              sILLon = sIssueLocation ? sIssueLocation.split(";")[1] : "" ;
  //          }catch(err){
  //          	//no special error handling
  //          }
            
  //          try{
  //              sCLLat = sCurrentLocation && sCurrentLocation.split(";").length > 1? sCurrentLocation.split(";")[0] : "" ; 
  //              sCLLon = sCurrentLocation && sCurrentLocation.split(";").length > 1? sCurrentLocation.split(";")[1] : ""; 
  //  		}catch(err){
  //  			//no special error handling
  //  		}
		    
		//     if (sILLat && sILLat !== "") {aLat.push(sILLat);}
		//     if (sILLon && sILLon !== "") {aLon.push(sILLon);}
		   
		//     if (sCLLat && sILLat !== sCLLat) { aLat.push(sCLLat); }
		//     if (sCLLon && sILLon !== sCLLon) { aLon.push(sCLLon); }

  //          try{
  //              this._getGeoMap(this.getView()).zoomToGeoPosition(
  //                                                      aLat,
  //                                                      aLon,
  //                                                      15
  //                                                  );
  //          }catch(err){
  //          	//no special error handling
  //          }
		// },
		
		// /**
		//  * initiate GeoMap control
		//  * @private
		//  */
  //      _initGeoMap: function() {

  //          if ( !this._bInitialized){
                
  //              var oLayout = this.byId("pmNotifHorizontalLayoutGeoMap");
                
  //              oLayout.addContent(this._getGeoMap(this.getView()));  
  //              this._bInitialized = true;
  //          }
  //      },

		// /**
		//  * fetch new GPS data and set current position and position of issue
		//  * @private
		//  */
  //      _updateCurrentPosition: function(bUpdateIssueLocation, bSuppressErrorMessage){
		// 	var oDeferred = new jQuery.Deferred();
			
		// 	if (!this.isFunctionAvailable("navigator.geolocation") && !bSuppressErrorMessage) {
		// 		jQuery.sap.require("sap.m.MessageToast");
		// 		sap.m.MessageToast.show(
		// 			this.getResourceBundle().getText("ymsg.gpsFetchFailed"), {
		// 				duration: CONSTANTS.GENERAL.MESSAGETOAST_DELAY,
		// 				closeOnBrowserNavigation: CONSTANTS.GENERAL.MESSAGETOAST_CLOSE_ON_NAV
		// 			}
		// 		);
		// 		oDeferred.resolve();
		// 		return oDeferred.promise();
		// 	}			
			
  //          var fnGPSSuccess = function(oPosition) {
  //              var sPos = oPosition.coords.longitude + ";" + oPosition.coords.latitude + ";" + "0" ;
                
  //              this._setInitialPosition(sPos);
  //              this._setCurrentPosition(sPos);
                
  //              if (bUpdateIssueLocation){
  //                  this._setIssuePosition(sPos);
  //              }
                
  //              oDeferred.resolve();
		// 	};

		// 	var fnGPSFail = function() {
                
  //              this._setCurrentPosition("0;0;0");
  //              this._setInitialPosition("0;0;0");

  //              if (bUpdateIssueLocation){
  //                  this._setIssuePosition("0;0;0");
  //              }
                
		// 		oDeferred.resolve();
				
		// 		if (!bSuppressErrorMessage) {
				    
		// 		    jQuery.sap.require("sap.m.MessageToast");
				    
  //  				sap.m.MessageToast.show(
  //  					this.getResourceBundle().getText("ymsg.gpsFetchFailed"), {
  //  						duration: CONSTANTS.GENERAL.MESSAGETOAST_DELAY,
  //  						closeOnBrowserNavigation: CONSTANTS.GENERAL.MESSAGETOAST_CLOSE_ON_NAV
  //  					}
  //  				);
		// 		}

		// 	};			
			
		// 	// Cordova API to access GPS coordinates
		// 	var navigator = this.getPlugin("navigator.geolocation");
		// 	navigator.getCurrentPosition(
		// 		jQuery.proxy(fnGPSSuccess, this),
		// 		jQuery.proxy(fnGPSFail, this)
		// 	); 
		// 	return oDeferred.promise();
  //      },

		// /**
		//  * hides map visibility
		//  * @private
		//  */
		// _hideMap: function(){
		//     if (this._isDisplayMapInPlaceActive()){
  //                  this.getModel("geo").setProperty("/isMapVisible", false);
		//     }
		// },
        
		// /**
		//  * toggle map visibility
		//  * @private
		//  */
		// _toggleMapDisplay: function(){
		//     if (this._isDisplayMapInPlaceActive()){
  //              if (this.getModel("geo").getProperty("/isMapVisible")) {
  //                  this._hideMap();
  //              } else {
  //                  this._showMap();
  //              }		    
		//     }
		// },

		// /**
		//  * set position of issue in map
		//  * @private
		//  */
  //      _setIssuePosition: function(sPosition, bGPSDataAvailable){
            
  //          if (typeof bGPSDataAvailable === "undefined"){
  //              bGPSDataAvailable = true;
  //          }
            
  //          this.getModel().setProperty( this._getPathForLocationGPS(), sPosition);
		//     this.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.GPS_DATA_AVAILABLE, bGPSDataAvailable);              
  //      },

		// /**
		//  * set current position as circle in map
		//  * @private
		//  */
  //      _setCurrentPosition: function(sPosition){
            
  //          var oGeoModel = this.getModel("geo");
  //          oGeoModel.setProperty( "/Circles/0/pos", sPosition );            

  //      },

		// /**
		//  * set initial position in map
		//  * @private
		//  */        
  //      _setInitialPosition: function(sPosition){
            
  //          var oGeoModel = this.getModel("geo");
  //          oGeoModel.setProperty( "/initialPos", sPosition );
  //      },        

		// /**
		//  * display a map inplace or as popover depending on the form factor
		//  * @param {object} mParameters
		//  * @private
		//  */
		// _showMap: function(mParameters) {
            
  //          var oSource;
  //          var bUpdateIssueLoc = this._isUpdateOfGPSDataNecessary(); // default

  //          if (mParameters){
  //              oSource = mParameters.source;
  //              bUpdateIssueLoc = mParameters.updateIssueLoc;
  //          }

		// 	if (this._isDisplayMapInPlaceActive()||this._bDisplayOnlyMap) {
		// 		this.getModel("geo").setProperty("/isMapVisible", true);
		// 	} else {

		// 		if (!this._oGeoMapPopover) {

		// 			this._oGeoMapPopover = sap.ui.xmlfragment("geoMapFrag"+this.getView().getId(),
		// 				"i2d.eam.pmnotification.create.zeamntfcres1.view.fragments.GeoMap",
		// 				this);
						
		// 			this.getView().addDependent(this._oGeoMapPopover);
		// 			this._oGeoMapView = sap.ui.core.Fragment.byId("geoMapFrag", "pmNotifViewGeoMapView");

		// 		}

		// 		jQuery.sap.delayedCall(0, this, function() {
		// 			this._oGeoMapPopover.openBy(oSource);
		// 		});
		// 	}
			
		//     //this._updateCurrentPosition();
  //          this._updateCurrentPosition(bUpdateIssueLoc).done(jQuery.proxy(function() {
  //                  if (bUpdateIssueLoc){
  //                      var sIssueLocation = this._getLocationGPS() ;
  //                      this.getModel("geo").setProperty( "/initialPos", sIssueLocation );
  //                  }
  //                  this._centerMap();
  //              }, this)); 				
		// },
        
		// /**
		//  * initiate map data
		//  * @private
		//  */
  //      _getInitialMapData: function(){
            
  //          var sTO = this.getView().getModel("i18n").getResourceBundle().getText("xfld.issueLocation");
  //          var sYourLoc = this.getView().getModel("i18n").getResourceBundle().getText("xfld.yourLocation");            
            
  //          return {
  //                  initialPos:   "0;0;0",
  //                  initialZoom: "17",
  //                  isMenueVisible: !this._bDisplayOnlyMap,
  //                  isMapVisible:   ( this._isGPSAvailable()  
  //                                      && this._isGPSDataAvailable()
  //                                      && this._bMapVisibleOnDesktop
  //                                  )
  //                                  || this._bDisplayOnlyMap,
  //  				Spots :
  //  					[
  //  						{   "key" : "technicalObject", 
  //      						"pos": "0;0;0",  
  //      						"tooltip": sTO, 
  //      						"pin": "pin_blue.png" , 
  //      						"changeable": true 
  //  						}
  //  					],
		// 			Circles :
		// 				[
		// 					{   "key" : "currentPosition", 
		// 					    "radius": "15" , 
		// 					    "pos": "0;0;0",  
		// 					    "tooltip": sYourLoc, 
		// 					    "color" : "RGBA(30,144,255,100)" , 
		// 					    "colorBorder" :"RGBA(180,255,255,100)",
		// 					    "changeable": false
		// 					}
		// 				]
  //  			};            
  //      },
        
		// /**
		//  * get location data from model
		//  * @private
		//  */        
  //      _getLocationGPS:function(){
  //         return this.getModel().getProperty( this._getPathForLocationGPS() ); 
  //      },
        
		// /**
		//  * get path to LocationGPS field from Binding Context
		//  * @private
		//  */        
  //      _getPathForLocationGPS:function(){
  //        if (this.getView().getBindingContext()){
  //          return this.getView().getBindingContext().sPath + "/" + this._sLocationPropertyInContext;  
  //        }
  //      },

		// /**
		//  * Is GPS-Data already set for the issue location and shall it be retrieved?
		//  * @return {boolean} update?
		//  * @private
		//  */
  //      _isUpdateOfGPSDataNecessary: function(){
  //          var bUpdateIssueLocation;
            
  //          if (this._isChangeAllowed()){
  //              bUpdateIssueLocation = !this._isGPSDataAvailable();
  //          }else{
  //              bUpdateIssueLocation = false;
  //          }
            
  //          return bUpdateIssueLocation;
  //      },

		// /**
		//  * Is change allowed?
		//  * @return {boolean} changeable?
		//  * @private
		//  */
		// _isChangeAllowed: function() {
		// 	return this.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).getProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.CHANGE_ALLOWED);
		// },
		
		// /**
		//  * Determines whether the map shall be displayed in place
		//  * @return {boolean} display in place?
		//  * @private
		//  */
		// _isDisplayMapInPlaceActive: function() {
		// 	return this._isDesktop();
		// },	
		
		// /**
		//  * Determines whether GPS-Data is available
		//  * @return {boolean} gps-data available
		//  * @private
		//  */
		// _isGPSDataAvailable:function(){
  //          return this.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).getProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.GPS_DATA_AVAILABLE);
		// },
		// /**
		//  * Determines whether GPS is available
		//  * @return {boolean} gps-data available
		//  * @private
		//  */
		// _isGPSAvailable:function(){
  //          return this.getModel(CONSTANTS.MODEL.APP_MODEL.NAME).getProperty(CONSTANTS.MODEL.APP_MODEL.PROPERTIES.GPS_AVAILABLE);
		// },
		
		// /**
		//  * Determines whether the form factor is Desktop
		//  * @return {boolean} form factor is desktop?
		//  * @private
		//  */
		// _isDesktop: function() {
		// 	return this.getModel(CONSTANTS.MODEL.DEVICE_MODEL.NAME).getProperty(CONSTANTS.MODEL.DEVICE_MODEL.PROPERTIES.IS_DESKTOP);
		// }       
	});

});