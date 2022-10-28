/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"i2deampmnotificationcreate/zeam_ntf_cres1/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
