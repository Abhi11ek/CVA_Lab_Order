/**
 * LaborConfirmation controller helps in controlling the behaviour of all the view elements in the LaborConfirmation View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.LaborConfirmation
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
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
	"../../model/ResponseHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper, ModelObj,
	ResponseHandler, JSONModel, Device,
	Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.confirmation.LaborConfirmation", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @name onInit
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._onObjectMatched();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_LBRCNF, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler to open Add Labor dialog for confirmation
		 * @name onPressAddLaborConfirmation
		 */
		onPressAddLaborConfirmation: function () {
			that._oFragment.createDialogFragment.call(that, Constants.FRAG_ADDLABOR).open();
			//Start of PCR033677++ changes
			
			jQuery.sap.delayedCall(1500, that, function () {
				$('input[id*="idStartofWork-inner').attr('disabled', true);
			});
			
			//End of PCR033677++ changes
			that._fnClearConfirmationElements();
		},
		
		/**
		 * This method will add validation to Acutal Duration Input.
		 * @name onActualDurationLiveChange
		 * @param {sap.ui.base.Event} oEvent - event handler object
		 */
		onActualDurationLiveChange: function (oEvent) {
			var oInp = oEvent.getSource(),
				sActDur = oInp.getValue(),
				iActDur = parseFloat(sActDur, 10);
			var bValueState = sap.ui.core.ValueState.None, 
				sValueStateText, sActDurDecVal;

			if (!iActDur) {
				bValueState = false;
				sValueStateText = that._oResourceBundle.getText("actualDurationEmptyError");
			} else if (sActDur || iActDur) {
				sActDurDecVal = sActDur.split(".")[1];
				
				if (sActDurDecVal && sActDurDecVal.length > 2) {
					oInp.setValue(sActDur.slice(0, -1));
				}

				if (iActDur && (iActDur < 0 || iActDur >= 24)) {
					bValueState = false;
					sValueStateText = that._oResourceBundle.getText("actualDurationValidError");
				} else if (iActDur > 0 && iActDur < 24) {
					bValueState = true;
				}
			}

			oInp.setValueState(bValueState ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error);
			oInp.setValueStateText(sValueStateText);
		},

		/** 
		 * Event handler to submit Labor Confirmation.
		 * @name onSubmitLaborConfirmation
		 */
		onSubmitLaborConfirmation: function () {
			var oView = that.getView(),
				oLaborBox = oView.byId(IDH.id.LBR_ITEM_BOX),
				oLaborItem = oLaborBox.getItems()[0].getBindingContext().getObject();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var bValidateInputs = that._oUtil.validateInputElements.call(that, [
					IDH.id.START_OF_WORK_DTPKR,
					IDH.id.ACT_DUR_INP
				]),
				bValidateComboboxes = that._oUtil.validateComboBoxElements.call(that, [
					IDH.id.TOOL_STAT_CMBX,
					IDH.id.HOURS_CMBX, //PCR035112++
					IDH.id.MIN_CMBX //PCR035112++
				]);
			var oStartDateTime = oView.byId(IDH.id.START_OF_WORK_DTPKR).getDateValue(),
				// Start of PCR035112++ changes
				sHours = oView.byId(IDH.id.HOURS_CMBX).getSelectedKey(),
				sMin = oView.byId(IDH.id.MIN_CMBX).getSelectedKey(),
				sStartTime = "PT" + sHours + "H" + sMin + "M00S",
				// End of PCR035112++ changes
				iActualDuration = parseFloat(oView.byId(IDH.id.ACT_DUR_INP).getValue(), 10);
			var oLaborConfirmationPayload = new ModelObj(Constants.MOBJ_LBRCNF);
			var oLbrCnfEvt = new ModelObj(Constants.MOBJ_OEVENT);

			if (bValidateInputs && bValidateComboboxes.valid && oStartDateTime && iActualDuration < 24) {
				oLaborConfirmationPayload.ActualDuration = oView.byId(IDH.id.ACT_DUR_INP).getValue();
				oLaborConfirmationPayload.Currency = oLaborItem.Currency;
				oLaborConfirmationPayload.Description = oLaborItem.Description;
				oLaborConfirmationPayload.DurUnit = oLaborItem.Uom;
				oLaborConfirmationPayload.InternalNotes = oView.byId(IDH.id.INT_PSDN_TXTARA).getValue();
				oLaborConfirmationPayload.ItemNumber = oLaborItem.ItemNumber;
				oLaborConfirmationPayload.LaborId = oLaborItem.LaborId;
				// oLaborConfirmationPayload.MeasurementNotes = oView.byId(IDH.id.MEASUREMENT_TXTARA).getValue(); PCR035112--
				oLaborConfirmationPayload.Servicecasenumber = oCntx.Servicecasenumber;
				oLaborConfirmationPayload.StartDate = Formatter.formatDateWithPattern(oStartDateTime, Constants.POST_DATE_FORMAT);
				// oLaborConfirmationPayload.StartTime = Formatter.formatDateWithPattern(oStartDateTime, Constants.TIME_READ_FORMAT); //PCR035112--
				oLaborConfirmationPayload.StartTime = sStartTime; //PCR035112++
				oLaborConfirmationPayload.TimeZone = oCntx.TimeZone;
				oLaborConfirmationPayload.Toolstatus = oView.byId(IDH.id.TOOL_STAT_CMBX).getSelectedKey();
				
				that.onDialogClose();
				that._oFragment.openBusyDialogExt.call(this, this._oResourceBundle.getText("busyDialogMsg"));

				oLbrCnfEvt.sEventType = Constants.POST;
				oLbrCnfEvt.sEvent = EventTriggers.TRIGGER_CREATE_LBRCNF;
				oLbrCnfEvt.sEventSuccss = EventTriggers.CREATE_LBRCNF_SUCCESS;
				oLbrCnfEvt.sEventError = EventTriggers.CREATE_LBRCNF_FAIL;
				oLbrCnfEvt.sPostEntitySetPath = ServiceConfigConstants.confirmLabourSet;
				oLbrCnfEvt.oPayload = oLaborConfirmationPayload;
				oLbrCnfEvt.sSuccessHandler = "handleLaborConfirmationSuccess";
				oLbrCnfEvt.sErrorHandler = "handleLaborConfirmationFail";

				this.finishoDataModelregistartionProcessWithParams.call(this, oLbrCnfEvt);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("provideAllDetailToContinue"));
			}
		},
		
		/** 
		 * Success call back function for Labor Confirmation
		 * @name handleLaborConfirmationSuccess
		 * @param {Object} oSuccess - success response
		 */
		handleLaborConfirmationSuccess: function(oSuccess) {
			var oView = that.getView(),
				oLaborBox = oView.byId(IDH.id.LBR_ITEM_BOX),
				oConfirmationList = oView.byId(IDH.id.LBR_CONF_LIST);
				
			that.onDialogClose();	
				
			var bError = BaseController.prototype.handleErrorResponseInSuccessEvent.call(that, oSuccess);
			
			if (!bError) {
				var oConf = oSuccess.getParameter(Constants.PROP_DATA);
				var sSucMsg = oSuccess.getId() === EventTriggers.CREATE_LBRCNF_SUCCESS ?
						  oConf.ActualDuration + " " + that._oResourceBundle.getText("laborConfirmationSuccessMessage") + " '" + oConf.ConfirmationDoc + "'" : 
						  that._oResourceBundle.getText("confirmationId") + " '" + that._sConfirmationnumber + "' " + Constants.STATUS_CANCELLED;	
						  
				that._oFragment.openResponseDialog.call(that, {
					msg: sSucMsg,
					statusText: that._oResourceBundle.getText("successStatusMessage"),
					statusState: sap.ui.core.ValueState.Success
				});
				
				oLaborBox.getBinding(Constants.PROP_ITEMS).refresh(true);
				oConfirmationList.getBinding(Constants.PROP_ITEMS).refresh(true);
				sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings.call(that); //PCR035112++
			}
		},
		
		/** 
		 * Error call back function for Labor Confirmation
		 * @name handleLaborConfirmationFail
		 * @param {Object} oError - error response
		 */
		handleLaborConfirmationFail: function(oError) {
			that.onDialogClose();
			that.handleEventFail(oError);
		},
		
		/**
		 * Event handler to cancel confirmation document
		 * @name onPressCancelConfirmationDocument
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressCancelConfirmationDocument: function(oEvent) {
			that._sConfirmationnumber = oEvent.getSource().getBindingContext().getProperty("Confirmationnumber");
			that._oFragment.openConfirmDialog.call(that, that._oResourceBundle.getText("cancelConfirmationDocumentMessage")+ " '" + that._sConfirmationnumber + "'");
		},
		
		/**
		 * Event handler for Cancel Confirmation Document Confirm Dialog button
		 * @name onPressConfirmDialogOk
		 */
		onPressConfirmDialogOk:function() {
			var oCancelConfDocxEvt = new ModelObj(Constants.MOBJ_OEVENT);
			
			that.onDialogClose();

			that.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey(ServiceConfigConstants.confirmationsSet, {
					Confirmationnumber: that._sConfirmationnumber
				});
				
				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

				oCancelConfDocxEvt.sEventType = Constants.DELETE;
				oCancelConfDocxEvt.sEvent = EventTriggers.TRIGGER_CANCEL_LBRCNF;
				oCancelConfDocxEvt.sEventSuccss = EventTriggers.CANCEL_LBRCNF_SUCCESS;
				oCancelConfDocxEvt.sEventError = EventTriggers.CANCEL_LBRCNF_FAIL;
				oCancelConfDocxEvt.sDeleteEntitySetPath = "/" + sObjectPath;
				oCancelConfDocxEvt.sSuccessHandler = "handleLaborConfirmationSuccess";
				oCancelConfDocxEvt.sErrorHandler = "handleCancelConfirmationFail";

				that.finishoDataModelregistartionProcessWithParams.call(that, oCancelConfDocxEvt);
			}.bind(that));
		},
		
		/** 
		 * Error call back function for Labor Confirmation Cancel
		 * @name handleCancelConfirmationFail
		 * @param {Object} oError - error response
		 */
		handleCancelConfirmationFail: function(oError) {
			that.onDialogClose();
			var oDialogModel = that.getModel(Constants.MDL_DIALOG);
			
			oDialogModel.setProperty("/bMessageOpen", true);
			that._oFragment.openResponseDialog.call(that, {
				msg: oError.getParameter("d").ErrorMessage,
				statusText: that._oResourceBundle.getText("errorStatusMessage"),
				statusState: sap.ui.core.ValueState.Error
			});
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
		 * Internal method helps in creating view model.
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_LBRVIEW,
				noDataText: that._oResourceBundle.getText("confirmationsListNoDataText")
			});
		},

		/** 
		 * Internal event handler to reset all the elements on Add Labor dialog
		 * @name _fnClearConfirmationElements
		 * @private
		 */
		_fnClearConfirmationElements: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oView = that.getView();
			var aElements = [
				IDH.id.TOOL_STAT_CMBX,
				IDH.id.START_OF_WORK_DTPKR,
				IDH.id.ACT_DUR_INP,
				IDH.id.MEASUREMENT_TXTARA,
				IDH.id.INT_PSDN_TXTARA
			];

			//Clear Elements State
			that._oUtil.setValueStateForElementsWithIDs.call(that, aElements, "None");

			//Clear Inputs
			that._oUtil.clearElementsWithIDs.call(that, aElements);
			
			//Set Tool status from Work Order Header
			oView.byId(IDH.id.TOOL_STAT_CMBX).setSelectedKey(oCntx.Toolstatus);
			
			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.TOOL_STAT_CMBX, Constants.PROP_ITEMS
			);
		}

	});

});