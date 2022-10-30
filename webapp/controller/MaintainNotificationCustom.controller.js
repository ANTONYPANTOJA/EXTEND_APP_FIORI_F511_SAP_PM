sap.ui.controller(
    
        "i2d.eam.pmnotification.create.s1.controller.MaintainNotificationCustom",

{

	extHookAdditionalSearchOptions: function() {
		// Place your hook implementation code here 
	},
    onValueHelpInputPriority: function (oEvent) {
        sap.m.MessageToast.show("Hola Mundo.. Priority");
        

        var oButton = oEvent.getSource(),
        oView = this.getView();

    if (!this._pDialog) {
        this._pDialog = sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: "i2d.eam.pmnotification.create.s1.view.fragments.PopupPriority",
            controller: this
        }).then(function(oDialog){
            oView.addDependent(oDialog);
            return oDialog;
        });
    }

    this._pDialog.then(function(oDialog){
        this._configDialog(oButton, oDialog);
        oDialog.open();
    }.bind(this));

    },
    

		_configDialog: function (oButton, oDialog) {
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			oDialog.setDraggable(bDraggable == "true");

			// Set resizable property
			var bResizable = oButton.data("resizable");
			oDialog.setResizable(bResizable == "true");

			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			oDialog.setRememberSelections(bRemember);

			var sResponsivePadding = oButton.data("responsivePadding");
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";

			if (sResponsivePadding) {
				oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// toggle compact style
			//sap.ui.core.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
		},

        handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			//var oFilter = new Filter("Maintprioritydesc", FilterOperator.Contains, sValue);
            var oFilter =  sap.ui.model.Filter("Maintprioritydesc", sap.ui.model.FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding( "items" ).filter( [oFilter] );
            
			//var oBinding = oEvent.getSource().getBinding("items");
			//oBinding.filter([oFilter]);
		},

        handleClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

            //Traer el objeto Press Item o Click
            const PressItemTable = oEvent.getParameter("selectedContexts");
            //const context = clickedItem.getBindingContext(/*modelName*/"ac"); // given items="{ac>...}" 
           // const context = PressItemTable.getBindingContext();

            var oView = this.getView();
            var oName = oView.getModel().getProperty("Maintpriority", PressItemTable.getBindingContext());


			var aContexts = oEvent.getParameter("selectedContexts");



			if (aContexts && aContexts.length) {
				//sap.m.MessageToast.show("You have chosen " + aContexts.map(function (oContext) { return oContext.getObject().Maintprioritydesc; }).join(", "));
			}
            var oItem = oEvent.getSource();
            let priok = oItem.getBindingContext().getProperty("Maintpriority");

            //let priok      =  oEvent.getParameter("selectedContexts").getBindingContext().getProperty("Maintpriority");
            //let type_priok =  oEvent.getParameter("selectedContexts").getBindingContext().getProperty("Maintprioritytype");


            var sBindingPath = "/NotificationPrioritySet";
            var productPath = oEvent.getSource().getBindingContext().getObject();
				product = productPath.split("/").slice(-1).pop();


            //let objContext = oEvent.getSource().getBindingContext(contexto).getObject();

            //var contextObject = aContexts.getObject();

     
            // var oModel = this.getView().getModel();
            //     oModel.setProperty("sBindingPath", "1"); 
          

		}

});