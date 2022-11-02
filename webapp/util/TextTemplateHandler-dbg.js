/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
    "i2d/eam/pmnotification/create/s1/util/Constants"
    ],

	function(CONSTANTS) {
		"use strict";

		var _oResolveShort; // Map selection text to template-text
		var _results = []; // results from oDats
		var _sTargetPath =""; // path to set the text to ..
		var _button = []; // array of buttons for the selection-texts 
		var _actionSheet; // the actionsheet that is created
		var _oViewController;
		var _oModel;
		var _aLastFilterValues = [];

		/**
		 * If the user chose an TextTemplate from the Action sheet
		 * the text shall be filled into the description field
		 * @private
		 * @param {oEvent} Event that triggered this function
		 */        
		var _onActionSheetTextTemplatePress = function(oEvent) {
			jQuery.sap.log.info("### TextTemplateHandler -> template selected:" + oEvent.getSource().getText());
			var sButtonText = oEvent.getSource().getText();
			var sLongText = _oResolveShort[sButtonText];
            
            _oModel.setProperty(_sTargetPath, sLongText);

		};

		/**
		 * Build an Actionsheet based on the already retrieved and buffered data
		 * @private
		 * @return {sap.m.ActionSheet}  Action sheet object
		 */	         
		var _getActionSheet = function() {
			_button = [];
			_oResolveShort = {};

			jQuery.sap.log.info("### TextTemplateHandler -> ActionSheet creation for:" + _results);

			// create Pushbuttons for the entry-sheet according to the retrieved text-templates
			for (var i = 0; i < _results.length; i++) {
				_button.push(new sap.m.Button("buttonTextTemplate" + i, {
					text: _results[i].Description,
					press: _onActionSheetTextTemplatePress,
					icon: "sap-icon://document-text"
				}));
				_oResolveShort[_results[i].Description] = _results[i].Text;
			}

			// create the Actionsheet and add the buttons to it
			return new sap.m.ActionSheet("textTemplateSheet", {
				buttons: _button,
				title: _oViewController.getResourceBundle().getText("xtit.chooseTextTemplate"),
				showCancelButton: true
				//placement: "Right"
			});

		};

		/**
		 * When texttemplates were read from the backend the data is buffered for later use
		 * (if data was retrieved - else the array is cleared)
		 * @private
		 * @param {object}  oData response from request
		 */	         
		var _successReadTemplates = function(oData) {
		    
		    var bTemplatesAvailable = false;
			_results = oData.results ? oData.results : [];
			if (_results.length > 0) {
			  bTemplatesAvailable = true; 
			}
			_oViewController.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TEXTTEMPLATES_AVAILABLE, bTemplatesAvailable);

			jQuery.sap.log.info("### TextTemplateHandler -> read templates succesful:" + _results);
		};

		/**
		 * React on errors during model read (template retrieval)
		 * @private
		 * @param {oError}  error object containg error text
		 */	        
		var _errorReadTemplates = function(oError) {
			jQuery.sap.log.error("### TextTemplateHandler -> read templates failed:" + oError);
		};

		/**
		 * actually retrieve the templates via oData-model read
		 * @private
		 * @param {object}  oModel is the oData model 
		 */		        
		var _retrieveTemplates = function(oModel) {
		    
		    var aNewFilters = [];
		    var aNewFilterValues = [];

		    if (_oViewController.getObject() && _oViewController.getObject().TechnicalObjectType && _oViewController.getObject().TechnicalObjectType.length > 0) {
		        aNewFilters.push(
                            new sap.ui.model.Filter({
    							path: "TechnicalObjectType",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: _oViewController.getObject().TechnicalObjectType
    						})		            
		            );
		            
                aNewFilterValues.push(_oViewController.getObject().TechnicalObjectType);		            
		            
		    }
		    
		    if (_oViewController.getObject() && _oViewController.getObject().NotificationType && _oViewController.getObject().NotificationType.length > 0) {
		        aNewFilters.push(
                            new sap.ui.model.Filter({
    							path: "NotificationType",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: _oViewController.getObject().NotificationType
    						})		            
		            );
		            
                aNewFilterValues.push(_oViewController.getObject().NotificationType);		            
		    }        

		    if (_oViewController.getObject() && _oViewController.getObject().TechnicalObjectNumber && _oViewController.getObject().TechnicalObjectNumber.length > 0) {
		        aNewFilters.push(
                            new sap.ui.model.Filter({
    							path: "TechnicalObjectNumber",
    							operator: sap.ui.model.FilterOperator.EQ,
    							value1: _oViewController.getObject().TechnicalObjectNumber
    						})		            
		            );
		            
                aNewFilterValues.push(_oViewController.getObject().TechnicalObjectNumber);		            
		    }   

		    if (_aLastFilterValues.length === 0 || aNewFilterValues.toString() !== _aLastFilterValues.toString()) {
		        _aLastFilterValues = aNewFilterValues;
		        
    			oModel.read("/TextTemplateSet", {
    			    //filters: aNewFilters,   current version doesn't support filter for text templates
    				success: _successReadTemplates,
    				error: _errorReadTemplates
    			});		        
		    } else if (aNewFilterValues.toString() === _aLastFilterValues.toString()) {
			    var bTemplatesAvailable = false;

				if (_results.length > 0) {
				  bTemplatesAvailable = true; 
				}
				_oViewController.getModel(CONSTANTS.MODEL.VIEW_PROP.NAME).setProperty(CONSTANTS.MODEL.VIEW_PROP.PROPERTIES.GENERAL.TEXTTEMPLATES_AVAILABLE, bTemplatesAvailable);		    	
		    }

		};

		/*
            Return an object with public methods for Template Handling
        */
		return {

			/**
			 * retrieve the templates from the given model
			 * @public
			 * @param {object}  oModel is the model
			 * @param {object} view controller
			 */				
			retrieveTemplates: function(oModel, oViewController) {
				jQuery.sap.log.info("### TextTemplateHandler -> retrieveTemplates for " + oModel);
				_oViewController = oViewController;
				_oModel = oModel;
				_retrieveTemplates(oModel);
			},

			/**
			 * create an actionsheet and open it
			 * @public
			 * @param {object}  oSource is the control where event was fired 
			 * @param {object} path to set the text to
			 */			
			startTemplateSelection: function(oSource, sTargetPath) {
				jQuery.sap.log.info("### TextTemplateHandler -> startTemplateSelection");
				_sTargetPath = sTargetPath;
				if (!_actionSheet) {
					_actionSheet = _getActionSheet();
				}
				_actionSheet.openBy(oSource);
			}
		};
	}

);