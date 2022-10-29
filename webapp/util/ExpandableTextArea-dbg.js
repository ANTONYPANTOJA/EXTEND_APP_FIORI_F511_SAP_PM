/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(['jquery.sap.global'],
	function() {
		"use strict";

		var oExpandableTextArea = sap.m.TextArea.extend("i2d.eam.pmnotification.create.s1.util.ExpandableTextArea", {

			_iTextAreaHeight: null,
			_bExpanded: false,

			renderer: {},

			/**
			 * Init
			 * 
			 * @public
			 * 
			 */
			init: function() {
				if (sap.m.TextArea.prototype.init) {
					sap.m.TextArea.prototype.init.apply(this, arguments);
				}
			},

			/**
			 * On focus in for input field
			 * 
			 * @public
			 * 
			 */
			onfocusin: function() {
				if (sap.m.TextArea.prototype.onfocusin) {
					sap.m.TextArea.prototype.onfocusin.apply(this, arguments);
				}

                var oTextArea = this.$().find("textArea");				
				
				if (!this._iTextAreaHeight) {
					this._iTextAreaHeight = oTextArea.height();
				}

				if (!this._bExpanded) {
					oTextArea.animate({
						height: "+=" + oTextArea.height() * 2
					}, 300);
					this._bExpanded = true;
				}
			},

			/**
			 * On focus out for input field
			 * 
			 * @public
			 * 
			 */
			onfocusout: function() {
				if (sap.m.TextArea.prototype.onfocusout) {
					sap.m.TextArea.prototype.onfocusout.apply(this, arguments);
				}
				var oTextArea = this.$().find("textArea");
				
				oTextArea.animate({
					height: this._iTextAreaHeight
				}, 300);
				this._bExpanded = false;
			}
		});

		return oExpandableTextArea;
	});