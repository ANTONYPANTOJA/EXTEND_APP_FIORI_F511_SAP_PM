/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [
      "i2d/eam/pmnotification/create/zeamntfcres1/controller/BaseController",
      "i2d/eam/pmnotification/create/zeamntfcres1/model/formatter",
      "i2d/eam/pmnotification/create/zeamntfcres1/util/Constants",
      "sap/m/MessageBox",
    ],
    function (B, f, C, M) {
      "use strict";
      return B.extend(
        "i2d.eam.pmnotification.create.zeamntfcres1.controller.TechnicalObjectOverviewAttachments",
        {
          formatter: f,
          _objects: { oModel: null },
          _properties: {
            objectKey: "",
            objectType: "",
            documentPart: "",
            documentVersion: "",
            documentNumber: "",
            documentType: "",
            mode: "",
            visibleEdit: false,
            visibleDelete: false,
          },
          _ACTION: {
            DELETEATTACHMENT: "Delete",
            RENAMEATTACHMENT: "Rename",
            LISTATTACHMENT: "List",
            SAVEATTACHMENT: "Save",
            CANCELATTACHMENT: "Cancel",
            DRAFTATTACHMENT: "Draft",
            COUNTATTACHMENT: "Count",
          },
          _bAttachmentsRetrieved: false,
          onInit: function () {
            this._objects.oModel = new sap.ui.model.odata.ODataModel(
              "/sap/opu/odata/sap/CV_ATTACHMENT_SRV",
              true
            );
            this._setAttachmentModel({});
          },
          onAttachmentClicked: function (e) {
            var m = e.getSource().getBindingContext().getObject().url;
            sap.m.URLHelper.redirect(m, true);
          },
          refresh: function () {
            var t = this;
            var T = this.getView().data("technicalObjectType");
            this._properties.objectKey = this.getView().data(
              "technicalObjectNumber"
            );
            switch (T) {
              case C.MODEL.ODATA.TECH_OBJECT_TYPE_EQUI:
                this._properties.objectType = C.ATTACHMENTS.OBJECTTYPE_EQUI;
                break;
              case C.MODEL.ODATA.TECH_OBJECT_TYPE_FLOC:
                this._properties.objectType = C.ATTACHMENTS.OBJECTTYPE_FLOC;
                break;
              default:
                this._properties.objectType = null;
                break;
            }
            if (this._properties.objectKey && this._properties.objectType) {
              this._objects.oModel.read(
                "/GetAllOriginals",
                null,
                this._prepareUrlParameters(),
                false,
                function (d) {
                  t._setOriginal(d);
                  t._bAttachmentsRetrieved = true;
                },
                function (e) {
                  t._bAttachmentsRetrieved = false;
                  t._showErrorMessage(
                    JSON.parse(e.response.body).error.message.value,
                    ""
                  );
                }
              );
            }
          },
          _prepareUrlParameters: function () {
            var k = "ObjectKey='" + this._properties.objectKey + "'";
            var t = "ObjectType='" + this._properties.objectType + "'";
            return k + "&" + t;
          },
          _setAttachmentModel: function (d) {
            var D = new sap.ui.model.json.JSONModel({ Attachments: d });
            this.getView().setModel(D);
          },
          _setOriginal: function (r) {
            if (r !== null) {
              var d = [];
              var i = 0,
                l = r.results.length;
              for (i = 0; i < l; i++) {
                d.push(this._mapResult(r.results[i]));
              }
              this._setAttachmentModel(d);
            }
          },
          _mapResult: function (F) {
            F.CreatedAt = Date(F.CreatedAt).toString().substr(0, 15);
            var o = {
              content_type: F.__metadata.content_type,
              CreatedBy: F.FullName,
              CreatedAt: F.CreatedAt,
              Filename: F.Filename,
              url: F.__metadata.media_src,
              size: parseFloat(F.Filesize),
              FileId: F.FileId,
              ApplicationId: F.ApplicationId,
              Documentnumber: F.Documentnumber,
              Documenttype: F.Documenttype,
              Documentversion: F.Documentversion,
              Documentpart: F.Documentpart,
            };
            if (F.Documentnumber && this._properties.documentNumber === "") {
              this._properties.documentPart = F.Documentpart;
              this._properties.documentVersion = F.Documentversion;
              this._properties.documentNumber = F.Documentnumber;
              this._properties.documentType = F.Documenttype;
            }
            return o;
          },
          _showErrorMessage: function (m, a) {
            M.show(m, { icon: sap.m.MessageBox.Icon.ERROR, details: a });
          },
        }
      );
    }
  );
  