/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	var oMockServer,
		performUserActionSpy,
		_sAppModulePath = "i2d.eam.pmnotification.create.s1/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	var ENTITY_SETS_TO_MOCK = ["NotificationHeaderSet", "NotificationTypeSet", "NotificationTypeChangeSet", "ContactSet", "PMUserDetailsSet"];

	return {

		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */

		init: function () {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oDataSource = oManifest["sap.app"].dataSources,
				oMainDataSource = oDataSource["EAM_NTF_CREATE"],
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/",
				aAnnotations = oMainDataSource.settings.annotations;

			aAnnotations.forEach(function (sAnnotationName) {
				var oAnnotation = oDataSource[sAnnotationName],
					sUri = oAnnotation.uri,
					sLocalUri = jQuery.sap.getModulePath(_sAppModulePath + oAnnotation.settings.localUri.replace(".xml", ""), ".xml");

				///annotiaons
				new MockServer({
					rootUri: sUri,
					requests: [{
						method: "GET",
						path: new RegExp(".*"),
						response: function (oXhr) {
							jQuery.sap.require("jquery.sap.xml");

							var oAnnotations = jQuery.sap.sjax({
								url: sLocalUri,
								dataType: "xml"
							}).data;

							oXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));
							return true;
						}
					}]
				}).start();
			});

			this.createMockServerForFeatureToggleService();
			this.createMockServerForAttachmentService();

			// EAM_NTF_CREATE Mock Server
			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true,
				aEntitySetsNames: ENTITY_SETS_TO_MOCK
			});

			oMockServer.attachAfter("POST", function (oEvent) {
				/*eslint-disable sap-no-ui5base-prop */
				var oEntity = oEvent.mParameters.oEntity;
				/* eslint-enable sap-no-ui5base-prop */
				if (oEntity && oEntity.NotificationType === "Q3") {
					throw {
						// due to MockServer limitation, code has to be 400 instead of /IWBEP/CX_MGW_BUSI_EXCEPTION
						"error": {
							"code": 400,
							"message": {
								"lang": "en",
								"value": "QUnit Error Message - Notification Type Q3"
							},
							"innererror": {
								"application": {
									"component_id": "PM",
									"service_namespace": "/SAP/",
									"service_id": "EAM_NTF_CREATE",
									"service_version": "0001"
								},
								"longtext_url": "",
								"errordetails": [{
									"code": 400,
									"message": "QUnit Error Message - Notification Type Q3",
									"longtext_url": "",
									"propertyref": "",
									"severity": "error",
									"transition": false,
									"target": ""
								}]
							}
						}
					};
				} else if (oEntity) {
					jQuery.extend(oEntity, {
						"AttachmentId": "000020000000",
						"NotificationNumber": "20000000",
						"SystemStatus": "Outstanding",
						"DateMonitor": "G",
						"PriorityText": "",
						"TechnicalObjectNumber": "",
						"ReporterUserId": "",
						"NotificationDate": "\/Date(1430870400000)\/",
						"NotificationTime": "PT17H23M10S",
						"UserCanBeNotified": true,
						"NotificationPhase": "0",
						"PlantSection": "",
						"Completed": false,
						"Room": "",
						"NotificationTimezone": "CET",
						"TecObjNoLeadingZeros": "",
						"TechnicalObjectTypeDesc": "",
						"ReporterDisplay": "",
						"LastChangedTimestamp": "\/Date(1438872340000)\/",
						"TechnicalObjectType": "",
						"Deleted": false,
						"Effect": "",
						"EffectText": "",
						"NotificationTimestamp": "\/Date(1430925790000)\/",
						"TechnicalObjectDescription": "",
						"Priority": "",
						"PriorityType": "",
						"Location": ""
					});
					oEntity.__metadata.uri = oEntity.__metadata.uri.replace(/NotificationHeaderSet(.*)$/, "NotificationHeaderSet('" + oEntity.NotificationNumber +
						"')");
					oEntity.__metadata.id = oEntity.__metadata.uri;
				}
			}, "NotificationHeaderSet");

			var aRequests = oMockServer.getRequests(),
				fnResponse = function (iErrCode, sMessage, aRequest) {
					aRequest.response = function (oXhr) {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		},

		createMockServerForAttachmentService: function () {
			var oMockServerAttachmentService = new MockServer({
				rootUri: "/sap/opu/odata/sap/CV_ATTACHMENT_SRV/"
			});
			oMockServerAttachmentService.simulate(jQuery.sap.getModulePath(_sAppModulePath + "localService/CV_ATTACHMENT_SRV", ".xml"), {
				bGenerateMissingMockData: true,
				aEntitySetsNames: []
			});

			var aRequests = oMockServerAttachmentService.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("GetAllOriginals(.*)"),
				response: function (oXhr, sUrlParams) {
					jQuery.sap.log.debug("Incoming request for GetAllOriginals");
					oXhr.respond(200, {
						"Content-Type": "application/json;charset=utf-8"
					}, "{\"d\":{\"results\":[]}}");
				}
			});

			aRequests.push({
				method: "GET",
				path: new RegExp("GetArchiveLinkAttachments(.*)"),
				response: function (oXhr, sUrlParams) {
					jQuery.sap.log.debug("Incoming request for GetArchiveLinkAttachments");
					oXhr.respond(200, {
						"Content-Type": "application/json;charset=utf-8"
					}, "{\"d\":{\"results\":[]}}");
				}
			});

			oMockServerAttachmentService.setRequests(aRequests);
			oMockServerAttachmentService.start();
		},

		createMockServerForFeatureToggleService: function () {
			var oMockServerFeatureToggleService = new MockServer({
				rootUri: "/sap/opu/odata/SAP/CA_FM_FEATURE_TOGGLE_STATUS_SRV/"
			});
			oMockServerFeatureToggleService.simulate(jQuery.sap.getModulePath(_sAppModulePath + "localService/CA_FM_FEATURE_TOGGLE_STATUS_SRV",
				".xml"), {
				bGenerateMissingMockData: true,
				aEntitySetsNames: []
			});
			oMockServerFeatureToggleService.start();
		},

		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer}
		 */
		getMockServer: function () {
			if (!oMockServer) {
				this.init();
			}
			return oMockServer;
		}
	};

});