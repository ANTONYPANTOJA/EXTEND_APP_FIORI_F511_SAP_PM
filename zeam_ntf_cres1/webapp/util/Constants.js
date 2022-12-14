/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
    [],
    function () {
      "use strict";
      return Object.freeze({
        GENERAL: {
          MESSAGETOAST_DELAY: 5000,
          MESSAGETOAST_CLOSE_ON_NAV: false,
          BUSY_INDICATOR_DELAY: 1000,
          COUNT_OPEN_NOTIFICATIONS: "open",
          COUNT_HISTORY_NOTIFICATIONS: "history",
          COUNT_ALL_NOTIFICATIONS: "",
          LOCATION_GPS: "Location",
          NOTIFICATION_CHANGE_SET: "notification-change-set",
          NOTIFICATION_BATCH_GROUP: "notification-batch-group",
        },
        ROUTES: {
          CREATE: "create",
          EDIT: "edit",
          DISPLAY: "display",
          LIST: "list",
          NavType: {
            initial: "initial",
            iAppState: "iAppState",
            xAppState: "xAppState",
            URLParams: "URLParams",
          },
        },
        ATTACHMENTS: {
          ATTACHMENTMODE_DISPLAY: "D",
          ATTACHMENTMODE_CREATE: "I",
          OBJECTTYPE_NOTIFICATION: "PMQMEL",
          OBJECTTYPE_FLOC: "IFLOT",
          OBJECTTYPE_EQUI: "EQUI",
        },
        MODEL: {
          ODATA: {
            TECH_OBJECT_TYPE_EQUI: "EAMS_EQUI",
            TECH_OBJECT_TYPE_FLOC: "EAMS_FL",
          },
          APP_MODEL: {
            NAME: "appProperties",
            PROPERTIES: {
              IS_BUSY: "/busy",
              IS_METADATA_LOADED: "/isMetadataLoaded",
              DELAY: "/delay",
              CAMERA_AVAILABLE: "/hasCamera",
              GPS_AVAILABLE: "/hasGPS",
              BARCODE_AVAILABLE: "/hasScanner",
              ATTACHMENTS_AVAILABLE: "/AttachmentsAvailable",
              IS_STARTUP_CREATE: "/isStartupCreate",
              IS_CREATE_MODE: "/isCreateMode",
            },
          },
          DEVICE_MODEL: {
            NAME: "device",
            PROPERTIES: {
              IS_DESKTOP: "/system/desktop",
              IS_PHONE: "/system/phone",
            },
          },
          VIEW_PROP: {
            NAME: "viewProperties",
            PROPERTIES: {
              GENERAL: {
                GPS_DATA_AVAILABLE: "/hasGPSData",
                CNT_CURRENT_NOTIFICATIONS: "/openNotifCount",
                CNT_HISTORY_NOTIFICATIONS: "/historyNotifCount",
                TECHNICAL_OBJECT_GIVEN: "/hasTechObject",
                TECHNICAL_OBJECT_VALID: "/techObjectValid",
                TEXTTEMPLATES_AVAILABLE: "/hasTemplates",
                VALID_USER_GIVEN: "/hasValidUser",
                DISPLAY_MAP_INPLACE: "/displayMapInplace",
                CHANGE_ALLOWED: "/changeAllowed",
                NAVTOEDIT_ALLOWED: "/navToEditAllowed",
                ATTACHMENTMODE: "C",
                USER_CAN_BE_NOTIFIED: "/UserCanBeNotified",
                ADDITIONAL_SEARCH_OPTIONS_ON: "/alsoFindViaOn",
              },
              S0: { USER_ID: "/UserId" },
              S1: {},
              S2: { TITLE: "/title" },
              S3: {
                TITLE: "/title",
                TITLE_NOTES: "/NotesTitle",
                TITLE_CONTACTS: "/ContactsTitle",
              },
            },
          },
        },
      });
    },
    true
  );
  