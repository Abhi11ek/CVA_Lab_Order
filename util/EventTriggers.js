/**
 * EventTriggers class maintains all the events 
 * that are used for server related interactions.
 * 
 * @class
 * @public
 * @file com.amat.spg.labord.util.EventTriggers
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 Changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([], function() {
	"use strict";

	return {
		
		//Create Work Order
		TRIGGER_CREATE_WORKORDER: "TRIGGER_CREATE_WORKORDER",
		CREATE_WORKORDER_SUCCESS: "CREATE_WORKORDER_SUCCESS",
		CREATE_WORKORDER_FAIL: "CREATE_WORKORDER_FAIL",
		
		//Parts Required
		TRIGGER_PARTS_READ: "TRIGGER_PARTS_READ",
		READ_PARTS_SUCCESS: "READ_PARTS_SUCCESS",
		READ_PARTS_FAIL: "READ_PARTS_FAIL",
		
		TRIGGER_PARTS_VALIDATE: "TRIGGER_PARTS_VALIDATE",
		VALIDATE_PARTS_SUCCESS: "VALIDATE_PARTS_SUCCESS",
		VALIDATE_PARTS_FAIL: "VALIDATE_PARTS_FAIL",
		
		TRIGGER_PARTS_ADD: "TRIGGER_PARTS_ADD",
		ADD_PARTS_SUCCESS: "ADD_PARTS_SUCCESS",
		ADD_PARTS_FAIL: "ADD_PARTS_FAIL",
		
		TRIGGER_PARTS_DELETE: "TRIGGER_PARTS_DELETE",
		DELETE_PARTS_SUCCESS: "DELETE_PARTS_SUCCESS",
		DELETE_PARTS_FAIL: "DELETE_PARTS_FAIL",
		
		//Assignments
		TRIGGER_DELETE_PARTNER: "TRIGGER_DELETE_PARTNER",
		DELETE_PARTNER_SUCCESS: "DELETE_PARTNER_SUCCESS",
		DELETE_PARTNER_FAIL: "DELETE_PARTNER_FAIL",
		
		//Attachments
		TRIGGER_DELETE_ATTACHMENT: "TRIGGER_DELETE_ATTACHMENT",
		DELETE_ATTACHMENT_SUCCESS: "DELETE_ATTACHMENT_SUCCESS",
		DELETE_ATTACHMENT_FAIL: "DELETE_ATTACHMENT_FAIL",
		
		//Confirmation - Labor
		TRIGGER_CREATE_LBRCNF: "TRIGGER_CREATE_LBRCNF",
		CREATE_LBRCNF_SUCCESS: "CREATE_LBRCNF_SUCCESS",
		CREATE_LBRCNF_FAIL: "CREATE_LBRCNF_FAIL",
		
		TRIGGER_CANCEL_LBRCNF: "TRIGGER_CANCEL_LBRCNF",
		CANCEL_LBRCNF_SUCCESS: "CANCEL_LBRCNF_SUCCESS",
		CANCEL_LBRCNF_FAIL: "CANCEL_LBRCNF_FAIL",
		
		//Start of PCR032047++ changes
		TRIGGER_WKORD_READ: "TRIGGER_WKORD_READ",
		WKORD_READ_SUCCESS: "WKORD_READ_SUCCESS",
		WKORD_READ_FAIL: "WKORD_READ_FAIL",
		
		TRIGGER_TOOLDATA_READ: "TRIGGER_TOOLDATA_READ",
		TOOLDATA_READ_SUCCESS: "TOOLDATA_READ_SUCCESS",
		TOOLDATA_READ_FAIL: "TOOLDATA_READ_FAIL"
		//End of PCR032047++ changes
		
	};

});