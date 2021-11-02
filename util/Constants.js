/**
 * Constants class maintains all the constants
 * that are used in Labor Order app.
 *
 * @class
 * @public
 * @file com.amat.spg.labord.util.Constants
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

sap.ui.define([], function() {
  "use strict";

  return {

    /*~~~ Cross App Navigation Keys ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    CAN_SRV: "CrossApplicationNavigation",

    /*~~~ Color Codes ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    SUCCESS_COLOR_CODE: "#bada71",
    ERROR_COLOR_CODE: "#cc1919",
    WARNING_COLOR_CODE: "#d14900",
    CONFIRM_COLOR_CODE: "#32363A",

    /*~~~ Controller References ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    CONT_WODETAILS: "com.amat.spg.labord.controller.WorkOrderDetails",
    CONT_SUMMARY: "com.amat.spg.labord.controller.summary.Summary",
    CONT_SPLITAPP: "com.amat.spg.labord.controller.SplitApp", //PCR032047++
    CONT_WORKORDERS: "com.amat.spg.labord.controller.WorkOrders", //PCR032047++

    /*~~~ Custom Events ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    CUSTEVT_ADD: "ADD",
    CUSTEVT_EDIT: "EDIT",
    CUSTEVT_INIT: "INIT",
    CUSTEVT_SELECT: "SELECT",
    CUSTEVT_UPLOAD: "UPLOAD",
    CUSTEVT_CANCEL: "CANCEL",

    /*~~~ Project Master View Events ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    EM_ERR_HNDLR: "onRequestCompleted",
    EM_UPDT_FNSHD: "updateFinished",
    EM_DATA_RCVD: "dataReceived",
    EM_FLTKEY_STAT: "status",
    EM_FLTKEY_PIRO: "priority",
    
    /*~~~ Filters & Sorters ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    EM_FLT_SRVORDNO: "InServiceCaseNumber",
    EM_FLT_SRLNO: "InSerialNumber",
    EM_FLT_CREATEDBY: "CreatedBy",
    EM_FLT_FRSTNM: "Firstname",
    EM_FLT_LSTNM: "Lastname",
    EM_FLT_USERID: "Userid",
    
    FIL_SERV_NO: "IvServiceCaseNo",
    FIL_QCK_SRH: "IvQuickSearch",
    FIL_CATEGORY: "IvCategory",
	FIL_TITLE: "IvPrjname",
	FIL_SERIALNO: "IvSerialNumber",
	FIL_CREATEDBY: "IvCreatedBy",
	FIL_STATUS: "IvStatus",
	
	FIL_PROCESS_TYP: "IvProcessType",
	FIL_EQUIPMENT: "IvEquipment",
	FIL_FABNAME: "Fabnamedescription",
	FIL_EQUIPMENT1: "Equipment",
	FIL_CUSTTOOLID: "Customertoolid",
	FIL_SERIALNUMBER: "Serialnumber",
	FIL_SRV_CASE_TYP: "ServiceCaseType",
	FIL_FABID: "Fabid",
	FIL_TIMESTAMP: "Timestamp",
	FIL_ISERV_CASE_NO: "IServiceCaseNo",
	//Start of PCR032047++ changes
	FIL_TOOL_DESC: "ToolDesc",
	FIL_TOOL_ID: "ToolId",
	FIL_CUSTTOOL_ID: "IvCustToolId",
	FIL_PBG: "Pbg",
	//End of PCR032047++ changes
	FIL_TOOLNAME: "ToolName", //PCR033677++

    /*~~~ Docx Extensions ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    EXTN_PNG: "PNG",
    EXTN_JPG: "JPG",
    EXTN_TXT: "TXT",
    EXTN_PPTX: "PPTX",
    EXTN_DOC: "DOC",
    EXTN_DOCX: "DOCX",
    EXTN_XLS: "XLS",
    EXTN_XLSX: "XLSX",
    EXTN_PDF: "PDF",
    
    /*~~~ Event Bus ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    EVT_CNF: "spgLabOrdConfirmation",
    EVT_LBRCNF: "spgLabOrdLaborConfirmation",
    EVT_PARTSCNF: "spgLabOrdPartsConfirmation",
    EVT_ASSIGNMENT: "spgLabOrdAssignment",
    EVT_ATTACHMENTS: "spgLabOrdAttachments",
    EVT_PARTSREQ: "spgLabOrdPartsRequired",
    EVT_PASSDOWN: "spgLabOrdPassdownLog",
    EVT_SUMMARY: "spgLabOrdSummary",
    

    /*~~~ Fragments ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    FRAG_REF: "com.amat.spg.labord.fragments.", 
    FRAG_SUMM: "com.amat.spg.labord.fragments.summary.",
    FRAG_ADVSRH: "com.amat.spg.labord.fragments.AdvanceSearch",
    FRAG_BUSYDIALOG: "com.amat.spg.labord.fragments.BusyDialogExt",
    FRAG_CONFIRM: "com.amat.spg.labord.fragments.ConfirmDialog",
    FRAG_INFODIALOG: "com.amat.spg.labord.fragments.InfoDialog",
	FRAG_TOOLID: "com.amat.spg.labord.fragments.ToolId",
	FRAG_RESPONSE: "com.amat.spg.labord.fragments.DisplayResponse",
	FRAG_PARTNERS: "com.amat.spg.labord.fragments.summary.AddPartners",
	FRAG_PARTHIST: "com.amat.spg.labord.fragments.summary.PartHistory",
	FRAG_ADDLABOR: "com.amat.spg.labord.fragments.confirmation.AddLabor",

    /*~~~ Formats ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    DATETIME_FORMAT: "dd-MMM-yyyy HH:mm:ss",
    READ_DATE_FORMAT: "dd-MMM-yyyy",
    POST_DATETIME_FORMAT: "yyyyMMddHHmmss",
    POST_DATE_FORMAT: "yyyyMMdd",
    TIME_READ_FORMAT: "PTHH'H'mm'M'ss'S'", //PCR033677++// changed hh to HH

    /*~~~ IconTabBar filters ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    TAB_SPGLABORD: "spgLabOrd",

    /*~~~ Model Names ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	
    MDL_DIALOG: "dialog",
    MDL_INTRNLZN: "i18n",
    MDL_LABORD: "labOrd",
    MDL_TOOLID: "toolIdModel",
    MDL_CNFVIEW: "confirmationView",
    MDL_LBRVIEW: "laborView",
    MDL_PARTSVIEW: "partsView",
    MDL_ASGNMTVIEW: "assignmentView",
    MDL_ATTACHVIEW: "attachmentsView",
    MDL_PARTSREQVIEW: "partsReqView",
    MDL_PASSDOWNVIEW: "passdownView",
    MDL_SUMMARYVIEW: "summaryView",
    MDL_ATT_CRT: "attCrtModel",
    MDL_APPVIEW: "appView",
    MDL_WODETAILSVIEW: "detailView",
    MDL_WOVIEW: "workOrdersView",
    MDL_CRTVIEW: "createView",
    MDL_WORKORDERS: "workOrdersList", //PCR032047++
    MDL_TOOLDATA: "toolList", //PCR032047++
    MDL_SUG_ITEMS: "sugItems", //PCR033677++

    /*~~~ Model Objects ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    MOBJ_OEVENT: "oEvent",
    MOBJ_ODIALOG: "oDialogProperties",
    MOBJ_WOORDCRT: "oWorkOrdCrtPayload",
    MOBJ_PRETASK_CHECKLIST: "PreTaskCheckList",
    MOBJ_LBRCNF: "oLaborConfirmation",
    
    /*~~~ Partners ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    PARTNER_SHIFT_LEAD: "(Shift Lead)",
    PARTNER_LAB_MNGR: "(Lab Manager)",
    PARTNER_TOOL_MNGR: "(Tool Manager)",

    /*~~~ Object Properties ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    PROP_ITEMS: "items",
    PROP_SUGITEMS: "suggestionItems",
    PROP_LISTITEM: "listItem",
    PROP_DATA: "data", 
    PROP_NONE: "None",
    PROP_TOTAL: "total",
    PROP_ARGS: "arguments",
    PROP_QUERY: "?query",
    PROP_STATCODE: "statusCode",
    PROP_SLCTDKEY: "selectedKey",
    PROP_CANBTN: "canBtn",
    PROP_STATUS: "status",
    PROP_VALUE: "value",
    PROP_OBJECT: "object",
    PROP_NUMBER: "number",
    PROP_MEDIUM: "medium",
    PROP_L_MULSEL: "MultiSelect",
    PROP_L_NONE: "None",
    PROP_STRING: "string",
    PROP_PRSNLZN_SRV: "Personalization",
    PROP_ESCMGMT_VRNTSET: "PseEscMgmt",
    PROP_SINGLE_CHOICE: "SingleChoice",
    PROP_VRNTMGMT_TITLE: "VARIANT_MANAGEMENT_MANAGEDIALOG",
    PROP_CONTENT: "content",
    PROP_PARTS_TEMPLATE: "CRM Lab Parts Template.xls",
    PROP_PARTS_FILENAME: "CRM Lab Parts Template",
    PROP_YES: "YES",
    PROP_NO: "NO",
    PROP_PASSDOWN: "$*sknSLvdlSDFxdflbIHfd*$",
    PROP_CNF_NO: "Confirmation Number",
    PROP_PSDN_NOTE: "Pass Down Note",
    PROP_CRT_FRAG: "CreateWorkOrder",
    PROP_VIEW_FRAG: "ViewWorkOrder",
    PROP_ONTRACK: "ON-TRACK",
    PROP_DELAYED: "DELAYED",
    //Start of PCR032047++ changes
    WORK_ORD_FILENAME: "Work Orders.xls",
    WORK_ORD_TEMPLATE: "Work Orders",
	PROP_SPG_VRNTSET: "SPGLabOrd",
	PROP_AUTHOR: "Author",
	PROP_FILTER: "Filter",
	PROP_VAR_NAME: "FilterData",
	PROP_BLANK: "BLANK",
	//End of PCR032047++ changes
	PROP_LAB_CAT1: "LAB", //PCR033677++
	PROP_LESS: "LESS", //PCR035112++
    
    
    /*~~~ Regular Expressions ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    INP_VALID_REGEX: /^[0-9]*\d$/,
    EMAIL_REGEX: /^\w+([\.-]?\w+)+@\w+([\.-]?\w+)+(\.\w{2,4})+$/,
    DATEFORMAT_REGEX: /^([012]?\d|3[01])-([Jj][Aa][Nn]|[Ff][Ee][bB]|[Mm][Aa][Rr]|[Aa][Pp][Rr]|[Mm][Aa][Yy]|[Jj][Uu][Nn]|[Jj][u]l|[aA][Uu][gG]|[Ss][eE][pP]|[Oo][Cc][Tt]|[Nn][oO][Vv]|[Dd][Ee][Cc])-(19|20)\d\d$/,

    /*~~~ Request Types ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    BATCH: "BATCH",

    /*~~~ Route names ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	
	ROUTE_NOTFOUND: "detailObjectNotFound",
    ROUTE_NOOBJAVAIL: "detailNoObjectsAvailable",
    ROUTE_WOAVAIL: "noWorkOrdersAvailable",
    ROUTE_NOTAVAIL: "notAvailable",
    ROUTE_WORKORDERS: "workOrders",
    ROUTE_WODETAILS: "workOrderDetails",
    ROUTE_WOCREATION: "workOrderCreation",

    /*~~~ Semantic Objects ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    SEMOBJ_SHELL: "#Shell-home",

    /*~~~ Status State ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    STATE_ERROR: "Error",
    STATE_SUCCESS: "Success",
    STATE_WARNING: "Warning",
    STATE_NONE: "None",
    STATE_PENDING: "Pending",
    STATE_APPROVED: "Approved",
    
    /*~~~ Status ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    // Start of PCR035112++ changes
    /*STATUS_OPEN: "Open",
    STATUS_RELEASED: "Released",*/
    STATUS_OPEN: "In Progress",
    STATUS_RELEASED: "In Progress",
    // End of PCR035112++ changes
    STATUS_WORKCOMPLETED: "Work Completed",
    STATUS_CANCELLED: "Cancelled",
    STATUS_DELAYED: "DELAYED",
    STATUS_ONTRACK: "ON-TRACK",
    STATUS_COMPLETED: "Completed",
    STATUS_INPROGRESS: "In Progress", //PCR032047++
    STATUS_CLOSED: "Closed", //PCR033677++
    // Start of PCR035112++ changes
    STATUS_APPRD: "Approved",
    STATUS_REJECTED: "Rejected",
    STATUS_SCHEDULED: "Scheduled",
    STATUS_SUBMITTED: "Submitted",
    // End of PCR035112++ changes

    /*~~~ CSS Styles ~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    STYLE_SPG_LABORD: "spgLabOrd",
    STYLE_SIZECOMP: "sapUiSizeCompact",
    STYLE_ASTERISK: "asterisk",
    STYLE_HIDEREASON: "spgLabOrdHideReason",
    STYLE_HIDETOOL: "spgLabOrdHideToolStatus",
    STYLE_PARTS_HDR: "spgLabOrdPartReqHeaderTable",
    STYLE_PARTS_HDR1: "spgLabOrdPartReqHeaderTable1",
    //Start of PCR032047++ changes
    STYLE_MSTLIST_HDRBOX: "spgLabOrdMstListHdrBox", 
    STYLE_MSTLIST_DSHBRDBOX: "spgLabOrdMstListDashboardHdrBox",
    STYLE_SCRL_H1: "spgLabOrdMstListScrollContH1",
    STYLE_SCRL_H2: "spgLabOrdMstListScrollContH2",
    STYLE_SCRL_H3: "spgLabOrdMstListScrollContH3",
    STYLE_SCRL_H4: "spgLabOrdMstListScrollContH4",
    //End of PCR032047++ changes
    //Start of PCR033677++ changes
    STYLE_SCRL_CNT1: "spgLabOrdMstListScrollCont1",
    STYLE_SCRL_CNT2: "spgLabOrdMstListScrollCont2",
    STYLE_SCRL_CNT3: "spgLabOrdMstListScrollCont3",
    //End of PCR033677++ changes
    // Start of PCR035112++ changes
    STYLE_REJ_REA_HIDE: "spgLabOrdRejReaHide",
    STYLE_REJ_REA_SHOW: "spgLabOrdRejReaShow",
    // End of PCR035112++ chnages
    
    
    /*~~~ Parts Required Table Column ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    TABCOL_PARTNO: "Part #",
    TABCOL_DESCR: "Description",
    TABCOL_NSO: "NSO (Y/N)",
    TABCOL_SERIALIZED: "Serialized (Y/N)",
    TABCOL_SERIALNO: "Serial Number",
    TABCOL_QTYREQ: "Qty Required",
    TABCOL_QTYSUP: "Qty Supplied",
    
    /*~~~ Work Order Status ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    
    WO_OPEN_STAT: "E0001",
    WO_REL_STAT: "E0002",
    WO_CLOSED_STAT: "E0004",
    // Start of PCR035112++ changes
    WO_SUB_STAT: "E0011",
    WO_REJ_STAT: "E0012",
    WO_APPR_STAT: "E0002",
    // End of PCR035112++ changes
    WO_WC_STAT: "E0005",
    WO_CANCEL_STAT: "E0006",
    
    // Start of PCR035112++ changes
    
    WO_ACT_APPR: "approved",
    WO_ACT_REJ: "rejected",
    WO_ACT_COMP: "completed",
    WO_ACT_CANCEL: "cancelled",
    
   // End of PCR035112++ changes
    
  };

});