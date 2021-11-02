/**
 * IdHelper class maintains all the IDs for elements 
 * that are being used in Labor Order app.
 * 
 * @class
 * @public
 * @file com.amat.spg.labord.util.IdHelper
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 Changes					*
 * 03/11/2021   Vimal Pandu				PCR033677	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([], function () {
	"use strict";

	return {
		id: {
			
			//Assignments
			PARTNERS_NAV_CONT: "idPartnersNavCon",
			SERV_TECH_GRID: "idServiceTechGrid",
			OTHER_PARTNERS_GRID: "idOtherPartnersGrid",
			
			//Labor Confirmation
			LBR_CONF_LIST: "idLaborConfirmationList",
			LBR_ITEM_BOX: "idLaborItemBox",
			START_OF_WORK_DTPKR: "idStartofWork",
			ACT_DUR_INP: "idActualDuration",
			INT_PSDN_TXTARA: "idIntPassdownTextArea",
			MEASUREMENT_TXTARA: "idMeasurementTextArea",
			START_OF_WORK_TMPCKR: "idStartofWorkTime", //PCR035112++
			
			//Parts Required
			PARTS_REQ_TABLE: "idPartsRequiredTable",
			ADD_PARTS_TABLE: "idAddRequiredPartsTable",
			PARTS_REQ_HEADER: "idPartsTableHeaderBox",
			PARTS_SCROLL_CONT: "idPartsRequiredScrollCont",
			PARTS_REQ_HEADER_CKBX: "idPartReqHeaderCheckBox",
			PARTS_REQ_HDR_TABLE: "idPartReqHeaderTable",
			
			//Passdown Notes
			PSDN_LIST: "idPassdownLogList",
			PSDN_TXTARA: "idPassdownNote",
			
			//Summary
			WO_DET_LAYOUT: "idWorkOrderDetailLayout",

			//Work Order Creation View
			CHMBTYP_CMBX: "idChamberTypeCmbx",
			ATT_LIST: "idAttachmentList",
			FILE_UPLDR: "idFileUploader",
			
			//Work Order Creation
			WO_CREATE_VIEW: "idWorkOrderCreateView",
			WO_DET_GRID: "idWorkDetailsGrid",
			TOOL_INFO_GRID: "idToolInformationGrid",
			WO_CREATE_LAYOUT: "idWorkOrderCreateLayout",
			REASON_BOX: "idReasonBox",
			ATTACHMENTS_GRID: "idAttachmentsGrid",

			//Work Orders View
			WORKORDERS_LIST: "idWOTable",
			ADV_SEARCH_NAV_CONT: "idAdvanceSearchNavCon",
			ADV_SEARCH_ASSIGNEDTO: "idAssignedToPage",
			ADV_SEARCH_ASSIGNEDTO_RESULTS: "idAssignedToResults",
			ADV_SEARCH_VIEW: "idAdvanceSearchPage",
			ADV_EMPTABLE: "idEmployeeListTable",
			ADV_CREATEDBY_INP: "idAdvCreatedByInp",
			ADSRH_STAT_MULINP: "idAdvSrhStatus",
			WORK_DESC_FEEDLISTITEM: "idWDFeedListItem",
			 //Start of PCR032047++ changes
			PBG_CMBX: "idPbgCmbx",
			TOOL_NAME_INP: "idToolNameCmbx",
			DIAL_POPUP: 'div[id*="sap-ui-blocklayer-popup"]', 
			ADV_CATE_CMBX: "idAdvCategory",
			WO_SCRL_CNT: "idWOScrollCont",
			SRH_HDR_LBL: "idSearchDetailsText",
			ADV_SRH_SEGBTN: "idAdvSrvSegBtn",
			//End of PCR032047++ changes
			SCL_CNT_MST_LIST: "idWOListScrollCont", //PCR033677++
			
			//Work Order Details
			WO_DET_PAGE: "idWorkOrderDetailsPage",
			PRETASK_CHECKLIST_TABLE: "idPreTaskChecklistTable",
			REQ_START_DATE_DTPKR: "idReqStartDate",
			CHMB_TYP_CMBX: "idChamberTypeCmbx",
			CATEGORY_CMBX: "idCateTwoCmbx",
			REASON_CMBX: "idReasonCmbx",
			PRIORITY_CMBX: "idPriorityCmbx",
			WORK_DESC_TXTARA: "idWorkDescription",
			TITLE_INP: "idTitle",
			SERIALNO_INP: "idSerialNumberInp",
			TOOL_STAT_CMBX: "idToolStatusCmbx",
			STATUS_CMBX: "idStatusCmbx",
			CREATION_DATE_INP: "idCreationDate",
			MOC_CMBX: "Moc",
			GSR_CMBX: "Gsr",
			ABATE_CMBX: "Abatement",
			CHEM_AUTH_CMBX: "ChemAuth",
			PASR_CMBX: "Pasr",
			FSR_CMBX: "Fsr",
			MOC_SWITCH: "MocMandtFlag",
			GSR_SWITCH: "GsrMandtFlag",
			ABATE_SWITCH: "AbatementMandtFlag",
			CHEM_AUTH_SWITCH: "CauthMandtFlag",
			PASR_SWITCH: "PasrMandtFlag",
			FSR_SWITCH: "FsrMandtFlag",
			WO_DET_SEGBTN: "idWODetSegBtn",
			WO_VIEW_LAYOUT: "idWorkOrderViewLayout",
			REJ_RSN_CMBX: "idRejectReasonCmbx",
			WO_DET_CNCLBTN: "idWOCancelBtn",
			SIDE_CNT_BTN: "idSideContentBtn", //PCR032047++
			//Start of PCR035112++ changes
			REQ_STRT_TM_PCKR: "idReqStartTime",
			APPR_BTN: "idWOApproveBtn",
			REJ_BTN: "idWORejectBtn",
			WO_UPDT_BTN: "idWOUpdateBtn",
			REJ_NOTES_TXTARA: "rejectionNote",
			HOURS_CMBX: "idHoursCmbx",
			MIN_CMBX: "idMinCmbx",
			REJ_REA_FLI: "idRRFeedListItem",
			VIEW_WO_GRID2: "idViewWOGrid2",
			//End of PCR035112++ changes
		},
		icons: {
			ICON_ACCEPT: "sap-icon://accept",
			ICON_REJECT: "sap-icon://decline",
			ICON_EDIT: "sap-icon://edit",
			ICON_DELETE: "sap-icon://delete",
			ICON_ADD: "sap-icon://add",
			ICON_DOWNLOAD: "sap-icon://download",           
			ICON_SAP_REFRESH: "sap-icon://refresh",
			ICON_SAP_SAVE: "sap-icon://save",
			ICON_SAP_MSG_SUCCESS: "sap-icon://message-success",
			ICON_SAP_MSG_ERROR: "sap-icon://message-error",
			ICON_SAP_MSG_INFO: "sap-icon://message-information",
			ICON_SAP_MSG_CNF: "sap-icon://message-warning",
			ICON_IMAGE: "sap-icon://background",
			ICON_CAMERA: "sap-icon://camera",
			ICON_TXT: "sap-icon://document-text",
			ICON_PPT: "sap-icon://ppt-attachment",
			ICON_DOC: "sap-icon://doc-attachment",
			ICON_EXCEL: "sap-icon://excel-attachment",
			ICON_PDF: "sap-icon://pdf-attachment",
			ICON_ATTACHMENT: "sap-icon://attachment",
			ICON_LEFT_ARROW: "sap-icon://navigation-left-arrow", //PCR032047++
			ICON_RIGHT_ARROW: "sap-icon://navigation-right-arrow" //PCR032047++
		}
	};

});