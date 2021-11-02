/**
 * Attachments controller helps in controlling the behaviour of all the view elements in the Attachments View.
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.Attachments
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 						PCR No.      Description of change			*
 * ----------  	--------------------		---------    ------------------------------ *
 * 07/27/2020  	Vimal Pandu					PCR030784    Initial Version				*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../util/Constants",
	"../../util/EventTriggers",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/ServiceConfigConstants",
	"../../util/Util",
	"../../helper/FragmentHelper",
	"../../model/ModelObjects",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper, ModelObj, Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.summary.Attachments", {

		formatter: Formatter,
		_workOrderAttachments: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._fnClearAttachments();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_ATTACHMENTS, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._fnInitializeAttachments();
			}, that);
		},

		/** 
		 * Hook methods used to fetch attachments for a given Work Order
		 * @name onAfterRendering
		 */
		onAfterRendering: function () {
			that._fnGetAttachments();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler to add attachment to Work Order
		 * @name handleAddAttachment
		 * @param {Object} oAttachment - attachment
		 */
		handleAddAttachment: function (oAttachment) {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

			that.getModel().createEntry("/" + ServiceConfigConstants.workOrderAttachmentSet, {
				changeSetId: ServiceConfigConstants.workOrderAttachmentSet,
				properties: {
					IFileName: oAttachment.FileName,
					Type: "",
					IFileContentXstring: oAttachment.content,
					IServiceCaseNo: oCntx.Servicecasenumber
				},
				success: that.handleRequestSuccess,
				error: that.handleRequestFail
			});

			that.getModel().submitChanges(ServiceConfigConstants.workOrderAttachmentSet);
		},

		/** 
		 * Event handler to delete attachment from Work Order
		 * @name handleDeleteAttachment
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		handleDeleteAttachment: function (oEvent) {
			var oDelBtn = oEvent.getSource(),
				oCntx = oDelBtn.getBindingContext().getObject();
			var oDelAttEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var sAttDelUrl = Formatter.formatAttDeleteUrl(oCntx.IServiceCaseNo, oCntx.LoioClass, oCntx.LoioObjid);

			that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

			oDelAttEvt.sEventType = Constants.DELETE;
			oDelAttEvt.sEvent = EventTriggers.TRIGGER_DELETE_ATTACHMENT;
			oDelAttEvt.sEventSuccss = EventTriggers.DELETE_ATTACHMENT_SUCCESS;
			oDelAttEvt.sEventError = EventTriggers.DELETE_ATTACHMENT_FAIL;
			oDelAttEvt.sDeleteEntitySetPath = sAttDelUrl;
			oDelAttEvt.sSuccessHandler = "handleRequestSuccess";
			oDelAttEvt.sErrorHandler = "handleRequestFail";

			that.finishoDataModelregistartionProcessWithParams.call(that, oDelAttEvt);
		},

		/** 
		 * Success call back function for add/delete attachments from Work Order
		 * @name handleRequestSuccess
		 * @param {Object} oSuccess - success reponse
		 * @param {Object} oResponse - request response
		 */
		handleRequestSuccess: function (oSuccess, oResponse) {
			var bDelEvt = oSuccess.hasOwnProperty("sId") && oSuccess.getId() === EventTriggers.DELETE_ATTACHMENT_SUCCESS;
			var sSucMsg = bDelEvt ?
				that._oResourceBundle.getText("attachmentDeleteSuccessMessage") :
				that._oResourceBundle.getText("attachmentAdditionSuccessMessage");
			var oSucResponse = oResponse ? oResponse : oSuccess;
			
			that.onDialogClose();
			
			if (!bDelEvt) {
				BaseController.prototype.handleEventSuccess.call(that, oSucResponse, {
					sBinding: Constants.PROP_CONTENT,
					sListId: IDH.id.ATTACHMENTS_GRID,
					hdr: that._oResourceBundle.getText("successResponseHeader"),
					sMsg: sSucMsg
				});
			} else {
				that._oFragment.handleCallBackResponse.call(that,
					that._oResourceBundle.getText("successResponseHeader"),
					sSucMsg
				);
			}
		},

		/** 
		 * Error call back function for add/delete attachments from Work Order
		 * @name handleRequestFail
		 * @param {Object} oError - error reponse
		 */
		handleRequestFail: function (oError) {
			that.onDialogClose();
			that.handleEventFail(oError);
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Internal method to instantiate view model.
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			BaseController.prototype.createViewModel.call(that, {
				sModelName: Constants.MDL_ATTACHVIEW,
				busy: false,
				delay: 0,
				bShowEditBtn: true
			});
		},

		/** 
		 * Internal method to clear and get attachments for Work Order.
		 * @name _fnInitializeAttachments
		 * @private 
		 */
		_fnInitializeAttachments: function () {
			that._fnClearAttachments();
			that._fnGetAttachments();
		},

		/** 
		 * Internal method to clear attachments for Work Order.
		 * @name _fnClearAttachments
		 * @private 
		 */
		_fnClearAttachments: function () {
			var oAttachModel = that.getModelFromComponent(Constants.MDL_ATT_CRT);
			var oAttGrid = that.getView().byId(IDH.id.ATTACHMENTS_GRID);

			that._workOrderAttachments.files = [];
			oAttachModel.setData({});
			var oFileUploader = that.getView().byId(IDH.id.FILE_UPLOADER);

			if (oFileUploader) {
				oFileUploader.setValue("");
			}
			
			oAttGrid.removeAllContent();
		},

		/** 
		 * Internal method to get attachments for Work Order.
		 * @name _fnGetAttachments
		 * @private 
		 */
		_fnGetAttachments: function () {
			var oModel = that.getModel();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oAttGrid = that.getView().byId(IDH.id.ATTACHMENTS_GRID),
				oBinding = oAttGrid.getBinding(Constants.PROP_CONTENT);
				
			if (oCntx && oBinding) {
				var aPendingRequestHandles = oModel["aPendingRequestHandles"];
				var oReq;

				for (oReq in aPendingRequestHandles) {
					aPendingRequestHandles[oReq].abort();
				}
				
				oAttGrid.setBusy(true);
				oAttGrid.setBusyIndicatorDelay(0);
				oBinding.filter([
					new Filter(Constants.FIL_ISERV_CASE_NO, FilterOperator.EQ, oCntx.Servicecasenumber)
				]);

				oBinding.attachEvent(Constants.EM_DATA_RCVD,
					function (oData, oResponse) {
						var oAttData = oData.getParameter("data");
						var bHasEmptyBox = that._fnValidateEmptyScreenBox();
						var oEmptyBox;
						
						oAttGrid.setBusy(false);
						

						if (!oAttData && !bHasEmptyBox) {
							oEmptyBox = that.setEmptyScreenTemplate(that._oResourceBundle.getText("attachmentsGridNoDataText"));
							oAttGrid.addContent(oEmptyBox);
							return;
						}
						
						if (oAttData) {
							if (!oData.getParameter("data").results.length && !bHasEmptyBox) {
								oEmptyBox = that.setEmptyScreenTemplate(that._oResourceBundle.getText("attachmentsGridNoDataText"));
								oAttGrid.addContent(oEmptyBox);
							}
						}
					}
				);
			}
		},
		
		/** 
		 * Internal method to validate if attachments grid has empty screen box
		 * @name _fnValidateEmptyScreenBox
		 * @returns {Bool} bHasEmptyBox - Empty screen box flag
		 * @private 
		 */	
		_fnValidateEmptyScreenBox: function() {
			var oAttGrid = that.getView().byId(IDH.id.ATTACHMENTS_GRID),
				aItems = oAttGrid.getContent();
			var bHasEmptyBox = false;	
			var oItem;
			
			for (oItem in aItems) {
				if (aItems[oItem].getId().indexOf("idEmptyScreenBox") > -1) {
					bHasEmptyBox = true;
					break;
				}
			}	
			
			return bHasEmptyBox;
		}

	});

});