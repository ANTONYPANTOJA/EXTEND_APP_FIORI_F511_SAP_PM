/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["jquery.sap.global"], function () {
    "use strict";
    var e = sap.m.TextArea.extend(
      "i2d.eam.pmnotification.create.zeamntfcres1.util.ExpandableTextArea",
      {
        _iTextAreaHeight: null,
        _bExpanded: false,
        renderer: {},
        init: function () {
          if (sap.m.TextArea.prototype.init) {
            sap.m.TextArea.prototype.init.apply(this, arguments);
          }
        },
        onfocusin: function () {
          if (sap.m.TextArea.prototype.onfocusin) {
            sap.m.TextArea.prototype.onfocusin.apply(this, arguments);
          }
          var t = this.$().find("textArea");
          if (!this._iTextAreaHeight) {
            this._iTextAreaHeight = t.height();
          }
          if (!this._bExpanded) {
            t.animate({ height: "+=" + t.height() * 2 }, 300);
            this._bExpanded = true;
          }
        },
        onfocusout: function () {
          if (sap.m.TextArea.prototype.onfocusout) {
            sap.m.TextArea.prototype.onfocusout.apply(this, arguments);
          }
          var t = this.$().find("textArea");
          t.animate({ height: this._iTextAreaHeight }, 300);
          this._bExpanded = false;
        },
      }
    );
    return e;
  });
  