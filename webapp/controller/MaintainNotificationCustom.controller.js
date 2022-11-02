jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.model.FilterOperator");

sap.ui.controller(
    //sap.ui.core.mvc.Controller.extend(    
    "i2d.eam.pmnotification.create.zeamntfcres1.controller.MaintainNotificationCustom",

    {

        extHookAdditionalSearchOptions: function () {
            // Place your hook implementation code here 
        },
        onValueHelpInputPriority: function (oEvent) {
            //sap.m.MessageToast.show("Hola Mundo.. Priority");


            var oButton = oEvent.getSource(),
                oView = this.getView();

            if (!this._pDialog) {
                this._pDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "i2d.eam.pmnotification.create.zeamntfcres1.view.fragments.PopupPriority",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
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

            var oFilter = sap.ui.model.Filter("Maintprioritydesc", sap.ui.model.FilterOperator.EQ, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);

            //var oBinding = oEvent.getSource().getBinding("items");
            //oBinding.filter([oFilter]);
        },

        handleClose: function (oEvent) {
            // reset the filter
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);

            //===================================================================//
            //Traer el objeto Press Item o Click
            const aContexts = oEvent.getParameter("selectedContexts")

            if (aContexts && aContexts.length) {
                //Values Seleccionados
                console.log(aContexts[0].getObject().Maintpriority);
                console.log(aContexts[0].getObject().Maintprioritydesc);
                console.log(aContexts[0].getObject().Maintprioritytype);

                //===================================================================//

                
                var oSelectedItem = oEvent.getSource();
                var oContext = oSelectedItem.getBindingContext();
                var sPath = oContext.getPath();

                
                // SET INPUT TEXT VALUE //
                this.getView().byId("pmNotifInputpriority").setValue(aContexts[0].getObject().Maintpriority);
                this.getView().byId("pmNotifInputPriorityText").setValue(aContexts[0].getObject().Maintprioritydesc);
                this.getView().byId("pmNotifInputPriorityType").setValue(aContexts[0].getObject().Maintprioritytype);

                //===================================================================//
                 //===================================================================//

                 //Setear la propiedades del input Text//

                 //var inputPriority = this.byId("pmNotifInputpriority");
                 //inputPriority.bindProperty("description", aContexts[0].getObject().Maintprioritydesc); 
                 //inputPriority.bindElement("/NotificationHeaderSet");
                 //inputPriority.bindProperty(aContexts[0].getObject().Maintpriority, "/NotificationHeaderSet/Priority); 
                
                 //===================================================================//
                //===================================================================//
                var objectMain = oEvent.getSource().getBindingContext().getObject();

            }   
        },
        onValueHelpInputGrpCod: function(oEvent){

            
            var oButton = oEvent.getSource(),
                oView = this.getView();

            if (!this._pDialog2) {
                this._pDialog2 = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "i2d.eam.pmnotification.create.zeamntfcres1.view.fragments.PopupGrpCod",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog2.then(function (oDialog) {
                this._configDialog(oButton, oDialog);
                oDialog.open();
            }.bind(this));

        },

        //search=".handleSearchGrp" - grupo de Códigos Help
        handleSearchGrp: function(oEvent){

            var sValue = oEvent.getParameter("value");
            var oFilter = sap.ui.model.Filter("CodegruppeTxt", sap.ui.model.FilterOperator.EQ, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        //confirm=".handleCloseGrp" - grupo de Códigos Help 
        handleCloseGrp: function(oEvent){

          // reset the filter
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([]);

          //===================================================================//
          //Traer el objeto Press Item o Click
          const aContexts = oEvent.getParameter("selectedContexts")

          if (aContexts && aContexts.length) {

              var oSelectedItem = oEvent.getSource();
              var oContext = oSelectedItem.getBindingContext();
              var sPath = oContext.getPath();

              
              // SET INPUT TEXT VALUE //
              this.getView().byId("pmNotifInputZqmgrp2").setValue(aContexts[0].getObject().Codegruppe);
              this.getView().byId("pmNotifInputZqmcod").setValue(aContexts[0].getObject().Code);
              this.getView().byId("pmNotifLabelTxtZqmcod").setText(aContexts[0].getObject().CodeTxt);
             // this.getView().byId("pmNotifInputPriorityType").setValue(aContexts[0].getObject().Maintprioritytype);
               //===================================================================//
              //===================================================================//
              var objectMain_aux = oEvent.getSource().getBindingContext().getObject();

        }
    }

    });