/**
 * ServiceConfigConstants class maintains all EntitySets
 * that are being used in Labor Order app for
 * Server related interactions.
 * 
 * @class
 * @public
 * @file com.amat.spg.labord.util.ServiceConfigConstants
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([], function() {
	"use strict";

	return {

		getWorkOrdersURL: "/sap/opu/odata/sap/ZQZG_CRM_WO_SERVICES_SRV",
		
		sToolIdUrl: "https://netprdappweb.amat.com/MyLab_ToolProfile/api/ToolProfile/Get_ToolDetails_By_ToolId/",
		sMOCUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/MOC",
		sChemAuthUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/GCAApprovedData",
		sGSRUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/GSR",
		sGCAUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/GCA",
		sPASRUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/PASR",
		sFSRUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/FSR",
		sAbatReqUrl: "https://netprdappweb.amat.com/MyLab/api/ToolRelatedRequests/AbatementRequest",
		sStagingReqUrl: "https://netqaappweb.amat.com/WSOMCRMApi/api/WOSMRequest/GetWOSM", //PCR033677++

		workOrderSet: "WorkOrderSet",
		getMasterData: "MasterListSet",	
		masterListSet: "CaseCreationMasterListSet",
		attachmentListSet: "Attachment_listSet",
		attachmentSet: "WorkOrderAttachmentSet",
		workOrderAttachmentSet: "WorkOrderAttachmentSet",
		employeeSet: "EmployeeSet",
		workOrderStatusUpdateSet: "WorkOrderStatusUpdateSet",
		partsListSet: "PartsListSet",
		partsValidationSet: "PartsValidationSet",
		partsCreateSet: "PartsCreateSet",
		partsDeleteSet: "PartsDeleteSet",
		assignmentsSet: "AssignmentsSet",
		passdownLogSet: "PassdownLogSet",
		confirmLabourSet: "ConfirmLabourSet",
		confirmationsSet: "ConfirmationsSet",
		toolListSet: "ToolListSet", //PCR032047++

		put: "PUT",
		get: "GET",
		post: "POST",
		del: "DELETE"

	};

});