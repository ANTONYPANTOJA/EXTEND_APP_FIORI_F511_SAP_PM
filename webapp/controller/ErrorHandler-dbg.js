/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox",
		"i2d/eam/pmnotification/create/zeamntfcres1/util/Constants"
	], function (BaseObject, MessageBox, CONSTANTS) {
	"use strict";

	return BaseObject.extend("i2d.eam.pmnotification.create.zeamntfcres1.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 *
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias sap.ui.demo.mdtemplate.controller.ErrorHandler
		 */
		constructor : function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorTitle = this._oResourceBundle.getText("xtit.error");
			this._sErrorText = this._oResourceBundle.getText("ymsg.errorText");

			this._oModel.attachEvent("metadataFailed", function (oEvent) {
				var oParams = oEvent.getParameters();

				this._showMetadataError(
					oParams.statusCode + " (" + oParams.statusText + ")\r\n" +
					oParams.message + "\r\n" +
					oParams.responseText + "\r\n"
				);
			}, this);

			this._oModel.attachEvent("requestFailed", function (oEvent) {
				var oParams = oEvent.getParameters();

				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				// oParams.response.statusCode can be string or number
				if (oParams.response.statusCode !== 404 || 
					(oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {

	            	var sDetail, sText, oResponse;
					switch (oParams.response.statusCode) {
						case "412":
							sDetail = this._oResourceBundle.getText("ymsg.errorSaveRequestPrecondFailedDetail");
							sText = this._oResourceBundle.getText("ymsg.errorSaveRequestPrecondFailedMessage");
							break;
						default:
			            	try {
			            		oResponse = jQuery.parseJSON(oEvent.getParameter("responseText"));
			            	} catch (err) {
			            		oResponse = null;
			            	}
			                
			                if (oResponse === null && oParams.response && oParams.response.responseText ) {
		    	                try {
		    	            		oResponse = jQuery.parseJSON(oParams.response.responseText);
		    	            	} catch (err) {
		    	            		oResponse = null;
		    	            	}
			                }  
			            	// display error message of OData service if available
			            	if (oResponse && 
			            	    oResponse.error && 
			            	    oResponse.error.innererror && 
			            	    oResponse.error.innererror.errordetails && 
			            	    oResponse.error.innererror.errordetails[0] && 
			            	    oResponse.error.innererror.errordetails[0].message) {
		
			            		sDetail = oParams.response.statusCode + " (" + oParams.response.statusText + ")\r\n" +
			            					oResponse.error.innererror.errordetails[0].message; 
			            	    sText = oResponse.error.innererror.errordetails[0].message;
			            	} else {
			            		sDetail = oParams.response.statusCode + " (" + oParams.response.statusText + ")\r\n" +
			            					oParams.response.message + "\r\n" +
			            					oParams.response.responseText + "\r\n";
								if (oResponse && 
			            	    	oResponse.error && 
			            	    	oResponse.error.message) {
			            	    	sText = oResponse.error.message.value;	
			            	    }			            					
			            	}
							break;
					}   
					
            		this._showServiceError(sText, sDetail);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when the metadata call has failed.
		 * The user can try to refresh the metadata.
		 *
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showMetadataError : function (sDetails) {
			var oAppController = this._oComponent.oRootView.getController();
			MessageBox.show(
				this._sErrorText,
				{
					id : "metadataErrorMessageBox",
					icon: MessageBox.Icon.ERROR,
					title: this._sErrorTitle,
					details: sDetails,
					styleClass: this._oComponent.getCompactCozyClass(),
					actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.RETRY) {
							this._oModel.refreshMetadata();
							oAppController.setAppUnBusy();
						}
					}.bind(this)
				}
			);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 *
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError : function (sText, sDetails) {
		    var sErrorText;
		    var oAppController = this._oComponent.oRootView.getController();
		    
			if (!this._bMessageOpen) {
			
    			sErrorText = (typeof sText !== "undefined" && sText !== "" )? sText : this._sErrorText;
    			
    			this._bMessageOpen = true;
    			MessageBox.show(
    				sErrorText,
    				{
    					id : "serviceErrorMessageBox",
    					icon: MessageBox.Icon.ERROR,
    					title: this._sErrorTitle,
    					details: sDetails,
    					styleClass: this._oComponent.getCompactCozyClass(),
    					actions: [MessageBox.Action.CLOSE],
    					onClose: function () {
    						this._bMessageOpen = false;
    						oAppController.setAppUnBusy();
    					}.bind(this)
    				}
    			);
			}
		}

	});

});