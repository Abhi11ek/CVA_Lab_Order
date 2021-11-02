/**
 * ModelObjects class Handles all the payload related interactions.
 * 
 * @class
 * @public
 * @extends sap.ui.base.Object
 * @file com.amat.spg.labord.model.ModelObjects
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 11/06/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/base/Object",
	"../util/Constants"
], function (Object, Constants) {
	"use strict";

	var ModelObjects = Object.extend("com.amat.spg.labord.model.ModelObjects", {

		/**
		 * Handles all the payload related interactions.
		 * @class
		 * @param {String} sEvent - event reference for payload
		 * @public
		 * @alias com.amat.spg.labord.model.ModelObjects
		 */
		constructor: function (sEvent) {
			var oPayload;

			switch (sEvent) {
			case Constants.MOBJ_OEVENT:
				oPayload = {
					"sEventType": "",
					"sEvent": "",
					"sEventSuccss": "",
					"sEventError": "",
					"sGetEntitySetPath": "",
					"sPostEntitySetPath": "",
					"sDeleteEntitySetPath": "",
					"oPayload": "",
					"sSuccessHandler": "",
					"sErrorHandler": "",
					"sBatchEventType": "",
					"sModelName": "",
					"aModelNames": [],
					"aBatchEntitySets": [],
					"aFilterParams": [],
					"oBatchPayloads": {}
				};
				break;
			case Constants.MOBJ_ODIALOG:
				oPayload = {
					"hdr": "",
					"icon": "",
					"color": "",
					"msg": "",
					"dialogRef": ""
				};
				break;
			case Constants.MOBJ_WOORDCRT:
				oPayload = {
					"Assembly": "",
					"ChemAuth": "",
					"Moc": "",
					"Priority": "",
					"Projname": "",
					"RejectionReson": "",
					"RejectionResonNote": "",
					"Servicetype": "ZPRJ",
					"Serialnumber": "",
					"Customertoolid": "",
					"Equipment": "",
					"Soldtoparty": "",
					"Fabname": "",
					"Problemdescription": "",
					"Startdatetime": "00000000000000",
					"TimeZone": "",
					"Assignedto": "",
					"Category1": "LAB",
					"Category2": ""
				};
				break;
			case Constants.MOBJ_PRETASK_CHECKLIST:
				oPayload = {
					"MOC": {
						PreRequiste: "MOC",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					},
					"GSR": {
						PreRequiste: "GSR",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					},
					"Abatement": {
						PreRequiste: "Abatement",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					},
					"ChemAuth": {
						PreRequiste: "ChemAuth",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					},
					"PASR": {
						PreRequiste: "PASR",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					},
					"FSR": {
						PreRequiste: "FSR",
						Mandatory: "No",
						Number: "", //PCR032047; removed "-"
						Status: "" //PCR032047; removed "-"
					}
				};
				break;
			case Constants.MOBJ_LBRCNF:
				oPayload = {
					"ActualDuration": "",
					"Amount": "0.00",
					"ConfirmationDoc": "",
					"Currency": "",
					"Description": "",
					"DurUnit": "",
					"ErrorMessage": "",
					"InternalNotes": "",
					"ItemNumber": "",
					"IvLcldt": "",
					"IvUser": "",
					"LaborId": "",
					"MeasurementNotes": "",
					"Servicecasenumber": "",
					"StartDate": "00000000",
					"StartTime": "PT00H00M00S",
					"TimeZone": "",
					"Toolstatus": ""
				};
				break;
			case Constants.MOBJ_ADDPART: 
				oPayload = {
					"Servicecasenumber": "",
					"ItemNumber": "",
					"PartNumber": "",
					"Description": "",
					"Status": "",
					"NsoFlag": "",
					"SerializedFlag": "",
					"SerialNumber": "",
					"QuantitySupplied": "0",
					"QuantityRequired": "0",
					"LastUpdatedDate": "",
					"ErrorMessage": ""
				};
				break;
			default:
				break;
			}
			return jQuery.extend({}, oPayload);
		}

	});

	return ModelObjects;

});