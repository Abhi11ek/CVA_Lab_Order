/**
 * Formatter class handles all the data formatting related methods.
 * 
 * @class
 * @public
 * @file com.amat.spg.labord.util.Formatter
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 03/15/2021   Vimal Pandu				PCR033677	 Phase - 3 changes 					*
 * 05/21/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"../util/ServiceConfigConstants",
	"../util/Constants",
	"../util/IdHelper"
], function (DateFormat, ServiceConfigConstants, Constants, IDH) {
	"use strict"; 

	return {

		/**
		 * This method is to set format for Date to display.
		 * @name formatDate
		 * @param {String} value - Holds current event parameter
		 * @returns {Object} Date Format - formatted date
		 */
		formatDate: function (value) {
			var sDate;
			var oDate = "";
			var oDateTimeFormat = DateFormat.getDateInstance({
				pattern: Constants.DATETIME_FORMAT
			});
			var oDateFormat = DateFormat.getDateInstance({
				style: Constants.PROP_MEDIUM,
				pattern: Constants.READ_DATE_FORMAT
			});

			if (value) {
				if (value.length === 14) {
					oDate = oDateTimeFormat.format(
						new Date(value.substr(4, 2) + "/" + value.substr(6, 2) + 
								"/" + value.substr(0, 4) + " " + value.substr(8, 2) + 
								":" + value.substr(10, 2) + ":" + value.substr(12, 2)));
				} else if (value.length === 19 && value.indexOf("T") > -1) {
					sDate = value.substr(5, 2) + "/" + value.substr(8, 2) + "/" + value.substr(0, 4);
					oDate = oDateFormat.format(new Date(sDate));
				}
			}

			return oDate;
		},

		/**
		 * This method is to set format for Date to display.
		 * @name formatDate1
		 * @param {String} value - Holds current event parameter
		 * @returns {Object} Date Format - formatted date
		 */
		formatDate1: function (value) {
			var sDate;
			var oDateTimeFormat = DateFormat.getDateInstance({
				pattern: Constants.READ_DATE_FORMAT
			});

			if (value) {
				if (value.length === 14) {
					sDate = oDateTimeFormat.format(new Date(value.substr(4, 2) + "/" + value.substr(6, 2) + "/" + value.substr(0, 4)));
				}
			}

			return sDate;
		},

		/**
		 * This method is to set format for Date to display.
		 * @name dateFormat
		 * @param {String} value - Holds current event parameter
		 * @returns {sDateFormat} formatted date
		 */
		dateFormat: function (value) {
			var aDate, sDateFormat;
			var oDateFormat = DateFormat.getDateInstance({
				pattern: Constants.READ_DATE_FORMAT
			});

			if ((typeof value === Constants.PROP_NUMBER) || (typeof value === Constants.PROP_OBJECT)) {
				sDateFormat = oDateFormat.format(new Date(value));
			} else if (value && value.length === 11 && typeof value === Constants.PROP_STRING) {
				if (value.indexOf("/") > -1) {
					aDate = value.split("/");
					aDate[0] = aDate[0].substring(0, 1) + aDate[0].substring(1, aDate[0].length).toLowerCase();
					sDateFormat = oDateFormat.format(new Date(aDate[1] + " " + aDate[0] + " " + aDate[2]));
				} else if (value.indexOf("-") > -1) {
					aDate = value.split("-");
					aDate[1] = aDate[1].substring(0, 1) + aDate[1].substring(1, aDate[1].length).toLowerCase();
					sDateFormat = oDateFormat.format(new Date(aDate.join(" ")));
				}
			} else if (value && value.length === 14) {
				sDateFormat = oDateFormat.format(new Date(value.substr(4, 2) + "/" + value.substr(6, 2) + "/" + value.substr(0, 4)));
			} else if (value && value.length === 8) {
				sDateFormat = oDateFormat.format(new Date(value.substr(4, 2) + "/" + value.substr(6, 2) + "/" + value.substr(0, 4)));
			} else {
				sDateFormat = null;
			}

			return sDateFormat;
		},

		/**
		 * This method is to set format for posting DateValue . 
		 * @name formatDateWithPattern
		 * @param {Object} oDate - Holds the date value
		 * @param {String} sPattern - pattern
		 * @returns {Object} Date Format - formatted dateObject 
		 */
		formatDateWithPattern: function (oDate, sPattern) {
			var oFormattedDate = "";
			var oDateFormat;

			if (oDate) {
				oDateFormat = DateFormat.getDateInstance({
					pattern: sPattern
				});
				oFormattedDate = oDateFormat.format(oDate);
			}

			return oFormattedDate;
		},

		/**
		 * This method is to set format for Time to display
		 * @name formatTime
		 * @param {String} sTime - Holds current event parameter
		 * @returns {String} formatted dateObject
		 */
		formatTime: function (sTime) {
			var sTimeVal = "";

			if (sTime && sTime.length === 14) {
				sTimeVal = sTime.substr(8, 2) + ":" + sTime.substr(10, 2);
			} else if (sTime && sTime.length === 6) {
				sTimeVal = sTime.substring(0, 2) + ":" + sTime.substring(2, 4);
			}

			return sTimeVal;
		},

		/**
		 * This method will create the download URL for an attachment.
		 * @name formatAttDownloadUrl
		 * @param {String} sWorkOrder - Work Order
		 * @param {String} sLoioClass - Attachment class
		 * @param {String} sLoioObjid - Attachment Object Id
		 * @returns {String} download URL
		 */
		formatAttDownloadUrl: function (sWorkOrder, sLoioClass, sLoioObjid) {
			return ServiceConfigConstants.getWorkOrdersURL + "/" + 
				   ServiceConfigConstants.attachmentListSet +
				   "(IServiceCaseNo='" + sWorkOrder + "',LoioClass='" + sLoioClass + "',LoioObjid='" + sLoioObjid + "')/$value";
		},

		/**
		 * This method will create the delete URL for an attachment.
		 * @name formatAttDeleteUrl
		 * @param {String} sWorkOrder - Work Order
		 * @param {String} sLoioClass - Attachment class
		 * @param {String} sLoioObjid - Attachment Object Id
		 * @returns {String} delete URL
		 */
		formatAttDeleteUrl: function (sWorkOrder, sLoioClass, sLoioObjid) {
			return "/" + ServiceConfigConstants.attachmentListSet + 
				   "(IServiceCaseNo='" + sWorkOrder + "',LoioClass='" + sLoioClass + "',LoioObjid='" + sLoioObjid + "')";
		},

		/**
		 * This method is to set the icon for appropriate 
		 * attachment in the mobile view.
		 * @name formatAttIcon
		 * @param {String} sType - Attachment extension ref
		 * @returns {String} IconSrc - attachment source 
		 */
		formatAttIcon: function (sType) {
			var sIconSrc;

			switch (sType) {
			case Constants.EXTN_PNG:
			case Constants.EXTN_JPG:
				sIconSrc = IDH.icons.ICON_IMAGE;
				break;

			case Constants.EXTN_TXT:
				sIconSrc = IDH.icons.ICON_TXT;
				break;

			case Constants.EXTN_PPTX:
				sIconSrc = IDH.icons.ICON_PPT;
				break;

			case Constants.EXTN_DOC:
			case Constants.EXTN_DOCX:
				sIconSrc = IDH.icons.ICON_DOC;
				break;

			case Constants.EXTN_XLS:
			case Constants.EXTN_XLSX:
				sIconSrc = IDH.icons.ICON_EXCEL;
				break;

			case Constants.EXTN_PDF:
				sIconSrc = IDH.icons.ICON_PDF;
				break;

			default:
				sIconSrc = IDH.icons.ICON_ATTACHMENT;
				break;
			}

			return sIconSrc;
		},
		
		/**
		 * This method is to set status of Work Order in 
		 * Work Orders view
		 * @name formatOrderStatus
		 * @param {String} sStat - work order status
		 * @returns {String} status
		 */
		formatOrderStatus: function (sStat) {
			var sStatus = "";

			if (sStat) {
				if (sStat === Constants.STATUS_OPEN) {
					sStatus = "<p class=\"workOrderStatus releasedStatus\">In Progress</p>";
				} else if (sStat === Constants.STATUS_RELEASED) {
					sStatus = "<p class=\"workOrderStatus releasedStatus\">In Progress</p>";
				} else if (sStat === Constants.STATUS_WORKCOMPLETED) {
					sStatus = "<p class=\"workOrderStatus workCompletedStatus\">Work Completed</p>";
				} else if (sStat === Constants.STATUS_CANCELLED) {
					sStatus = "<p class=\"workOrderStatus openStatus\">Cancelled</p>";
				}
				
				//Start of PCR033677++ changes
				else if (sStat === Constants.STATUS_CLOSED) {
					sStatus = "<p class=\"workOrderStatus closedStatus\">Closed</p>";
				}
				//End of PCR033677++ changes
				//Start of PCR035112++ changes
				else if (sStat === Constants.STATUS_APPRD) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdApprStat\">Approved</p>";
				} else if (sStat === Constants.STATUS_REJECTED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdRejectedStat\">Rejected</p>";
				} else if (sStat === Constants.STATUS_SUBMITTED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdSubmitStat\">Submitted</p>";
				} else if (sStat === Constants.STATUS_SCHEDULED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdScheduledStat\">Scheduled</p>";
				}
				//End of PCR035112++ changes
				
			}

			return sStatus;
		},
		
		/**
		 * This method is to set status of Work Order in 
		 * Work Order Details view
		 * @name formatOrderStatus
		 * @param {String} sStat - work order status
		 * @param {String} sWorkStat - work status
		 * @returns {String} status
		 */
		formatOrderStatusDetail: function (sStat, sWorkStat) {
			var sStatus = "";
			// Start of PCR035112++ changes
			var sDelayed = "<p class=\"spgLabOrdWorkStatus spgLabOrdDelayed\">DELAYED</p>",
				sOnTrack = "<p class=\"spgLabOrdWorkStatus spgLabOrdOnTrack\">ON TRACK</p>";
			var aStat = [
				Constants.STATUS_APPRD,
				Constants.STATUS_REJECTED,
				Constants.STATUS_SUBMITTED,
				Constants.STATUS_SCHEDULED
			];
			// End of PCR035112++ changes

			if (sStat) {
				if (sStat === Constants.STATUS_OPEN && !sWorkStat) {
					sStatus = "<p class=\"workOrderStatus releasedStatus\">In Progress</p>";
				} else if (sStat === Constants.STATUS_OPEN && sWorkStat === Constants.STATUS_DELAYED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdWorkStat releasedStatus\">In Progress</p><p class=\"spgLabOrdWorkStatus spgLabOrdDelayed\">DELAYED</p>";
				} else if (sStat === Constants.STATUS_OPEN && sWorkStat === Constants.STATUS_ONTRACK) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdWorkStat releasedStatus\">In Progress</p><p class=\"spgLabOrdWorkStatus spgLabOrdOnTrack\">ON TRACK</p>";
				} else if (sStat === Constants.STATUS_RELEASED && !sWorkStat) {
					sStatus = "<p class=\"workOrderStatus releasedStatus\">In Progress</p>";
				} else if (sStat === Constants.STATUS_RELEASED && sWorkStat === Constants.STATUS_DELAYED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdWorkStat releasedStatus\">In Progress</p><p class=\"spgLabOrdWorkStatus spgLabOrdDelayed\">DELAYED</p>";
				} else if (sStat === Constants.STATUS_RELEASED && sWorkStat === Constants.STATUS_ONTRACK) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdWorkStat releasedStatus\">In Progress</p><p class=\"spgLabOrdWorkStatus spgLabOrdOnTrack\">ON TRACK</p>";
				} else if (sStat === Constants.STATUS_WORKCOMPLETED) {
					sStatus = "<p class=\"workOrderStatus workCompletedStatus\">Work Completed</p>";
				} else if (sStat === Constants.STATUS_CANCELLED) {
					sStatus = "<p class=\"workOrderStatus openStatus\">Cancelled</p>";
				} 
				//Start of PCR033677++ changes
				else if (sStat === Constants.STATUS_CLOSED) {
					sStatus = "<p class=\"workOrderStatus closedStatus\">Closed</p>";
				}
				//End of PCR033677++ changes
				//Start of PCR035112++ changes
				else if (sStat === Constants.STATUS_APPRD) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdApprStat\">Approved</p>";
				} else if (sStat === Constants.STATUS_REJECTED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdRejectedStat\">Rejected</p>";
				} else if (sStat === Constants.STATUS_SUBMITTED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdSubmitStat\">Submitted</p>";
				} else if (sStat === Constants.STATUS_SCHEDULED) {
					sStatus = "<p class=\"workOrderStatus spgLabOrdScheduledStat\">Scheduled</p>";
				}
				
				if (sWorkStat === Constants.STATUS_DELAYED && aStat.indexOf(sStat) > -1) {
					sStatus += sDelayed;
				} else if (sWorkStat === Constants.STATUS_ONTRACK && aStat.indexOf(sStat) > -1) {
					sStatus += sOnTrack;
				}
				//End of PCR035112++ changes
			}
			
			return sStatus;
		},

		/**
		 * This method is to set the icon for appropriate
		 * attachment.
		 * @name formatAttachmentIcon
		 * @param {String} sType - Attachment extension ref
		 * @returns {String} Type icon - file type
		 */
		formatAttachmentIcon: function (sType) {
			return sap.ui.core.IconPool.getIconForMimeType(sType);
		},
		
		/**
		 * This method format Work Status
		 * @name formatTaskListStatus
		 * @param {String} sStat - work order status
		 * @returns {String} State - Work Order status
		 */
		formatTaskListStatus: function (sStat) {
			var sState = Constants.STATE_NONE;

			if (sStat === Constants.STATE_PENDING) {
				sState = Constants.STATE_ERROR;
			} else if (sStat === Constants.STATE_APPROVED) {
				sState = Constants.STATE_SUCCESS;
			}

			return sState;
		},
		
		/**
		 * This method formats Assignments Other Partners
		 * @name formatAssignments
		 * @param {String} sLead - Lead
		 * @param {String} sManager - Manager
		 * @param {String} sToolManager - Tool Manager
		 * @returns {String} Assignment Label
		 */
		formatAssignments: function(sLead, sManager, sToolManager) {
			var sAssignment = "";
			
			if (sLead) { 
				sAssignment = Constants.PARTNER_SHIFT_LEAD;
			} else if (sManager) {
				sAssignment = Constants.PARTNER_LAB_MNGR;
			} else if (sToolManager) {
				sAssignment = Constants.PARTNER_TOOL_MNGR;
			}
			
			return sAssignment;
		},
		
		/**
		 * This method formats Assignments Other Partners visibility
		 * @name formatAssignmentVisibility
		 * @param {String} sLead - Lead
		 * @param {String} sManager - Manager
		 * @param {String} sToolManager - Tool Manager
		 * @returns {Bool} Assignment visibility
		 */
		formatAssignmentVisibility: function(sLead, sManager, sToolManager) {
			return (sLead === "X" || sManager === "X" || sToolManager === "X");
		},
		
		/**
		 * This method formats Passdown Log
		 * @name formatPassdownLog
		 * @param {String} sLog - Passdown Log
		 * @returns {String} Passdown Log
		 */
		formatPassdownLog: function (sLog) {
			var sNotesLog = "";
			
			if (sLog.indexOf(Constants.PROP_PASSDOWN) > -1) {
				var aNotes = sLog.split(Constants.PROP_PASSDOWN);
				
				aNotes = aNotes.filter(function (sNote) {
					if (sNote.indexOf(Constants.PROP_CNF_NO) > -1) {
						return sNote;
					}
				});
				
				aNotes = aNotes.map(function (sNote) {
					var aNotes1 = sNote.split(Constants.PROP_PSDN_NOTE);
					
					if (aNotes1[1]) {
						var sType = (aNotes1[1].trim().indexOf("Internal") > -1) ? " " + Constants.PROP_PSDN_NOTE : "";
						
						return aNotes1[0].trim().replace(":", ": ") + "<br>" + 
							   aNotes1[1].trim() + 
							   sType + "<br><br>" + 
							   (aNotes1[2] ? aNotes1[2].trim() : "");
					}	   
				});
				
				sNotesLog = aNotes.join("<br><br>");
			} else {
				sNotesLog = sLog;
			}

			return sNotesLog;
		},
		
		/**
		 * This method formats Quantity value to a whole number
		 * @name formatQuantity
		 * @param {String} sQty - quantity
		 * @returns {String} quantity
		 */
		formatQuantity: function(sQty) {
			var sQuantity = "";
			
			if (sQty) {
				sQuantity = parseInt(sQty, 10).toString();	
			}
			
			return sQuantity;
		},
		
		/**
		 * This method formats Quantity value to a whole number
		 * @name formatDuration
		 * @param {String} sDur - Duration
		 * @returns {String} Duration
		 */
		formatDuration: function(sDur) {
			var sDuration = "";
			
			if (sDur) {
				sDuration = parseFloat(sDur, 10).toFixed(2);	
			}
			
			return sDuration;
		},
		
		/**
		 * This method is to set status of Confirmation Document
		 * @name formatConfDocxStatus
		 * @param {String} sStat - Document status
		 * @returns {String} formatted status
		 */
		formatConfDocxStatus: function(sStat) {
			var sStatus = "";

			if (sStat === Constants.STATUS_CANCELLED) {
				sStatus = "<p class=\"spgLabOrdConfDocxCancel openStatus spgLabOrdConfDocxCancelledStatus\">" + sStat + "</p>";
			}

			return sStatus;
		},
		
		// Start of PCR035112++ changes
		
		/**
		 * This method is to format Work Description
		 * @name formatWorkDescription
		 * @param {String} sValue - Description
		 * @returns {String} formatted Description
		 */
		formatWorkDescription: function (sValue) {
			var sWorkDesc = sValue;
			
			if (sValue.length > 10) {
				sWorkDesc = sWorkDesc.substring(0, 10) + "...";
			}
			
			return sWorkDesc;
		}
		
		// End of PCR035112++ changes

	};

});