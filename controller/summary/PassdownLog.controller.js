/**
 * PassdownLog controller helps in controlling the behaviour of all the view elements in the PassdownLog View.
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.PassdownLog
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 05/19/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../util/Constants",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/ServiceConfigConstants",
	"../../util/Util",
	"../../helper/FragmentHelper"
], function (BaseController, Constants, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.summary.PassdownLog", {

		formatter: Formatter,

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
			that._onObjectMatched();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_PASSDOWN, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler for passdown log update finished list
		 * @name onPassdownLogUpdateFinished
		 * @param {sap.ui.base.Event} oEvent - update finished event
		 */
		onPassdownLogUpdateFinished: function (oEvent) {
			BaseController.prototype.updateListItemCount.call(that, {
				ModelName: Constants.MDL_PASSDOWNVIEW,
				ListId: oEvent.getSource().getId(),
				TotalItems: oEvent.getParameter("total"),
				StringRef: "passdownLog",
				CountRef: "passdownLogCount"
			});
		},

		/** 
		 * Event handler to update passdown log
		 * @name onPassdownLogUpdateFinished
		 */
		onPressSavePassdownLog: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oNoteTxtInp = that.getView().byId(IDH.id.PSDN_TXTARA);
			var oPassDownNote = {
				Servicecasenumber: oCntx.Servicecasenumber,
				NotesLog: oNoteTxtInp.getValue()
			};
			var bValidateInputs = that._oUtil.validateInputElements.call(that, [
				IDH.id.PSDN_TXTARA
			]);

			if (bValidateInputs) {
				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

				that.getModel().createEntry("/" + ServiceConfigConstants.passdownLogSet, {
					changeSetId: ServiceConfigConstants.passdownLogSet,
					properties: oPassDownNote,
					success: that.handleAddPassdownNoteSuccess,
					error: that.handleAddPassdownNoteErorr
				});
				this.getModel().submitChanges(ServiceConfigConstants.passdownLogSet);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("passdownLogMandMessage"));
			}
		},

		/** 
		 * Success call back function for Passdown log update
		 * @name handleAddPassdownNoteSuccess
		 * @param {Object} oSuccess - success response
		 * @param {Object} oResponse - request response 
		 */
		handleAddPassdownNoteSuccess: function (oSuccess, oResponse) {
			that.onPressClearPassdownLog();

			BaseController.prototype.handleEventSuccess.call(that, oResponse, {
				sBinding: Constants.PROP_ITEMS,
				sListId: IDH.id.PSDN_LIST,
				hdr: that._oResourceBundle.getText("successResponseHeader"),
				sMsg: that._oResourceBundle.getText("passdownLogAdditionSuccessMessage")
			});
		},

		/** 
		 * Error call back function for Passdown log update
		 * @name handleAddPassdownNoteErorr
		 * @param {Object} oError - error response 
		 */
		handleAddPassdownNoteErorr: function (oError) {
			that.onDialogClose();
			that.handleEventFail(oError);
		},

		/** 
		 * Event handler to clear passdown log input 
		 * @name onPressClearPassdownLog
		 */
		onPressClearPassdownLog: function () {
			that._oUtil.clearElementsWithIDs.call(that, [IDH.id.PSDN_TXTARA]);
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},
		
		// Start of PCR035112++ changes
		
		/**
		 * Event handler to launch PCT application in Create Mode
		 * @name onLaunchPCTCreateUrl
		 */
		onLaunchPCTCreateUrl: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var sUrlParams = "BU=" + oCntx.Pbg + "&ToolId=" + oCntx.Serialnumber + "&Chamber=" + oCntx.Assembly.replace(/ /g, "%20") + 
							 "&WONumber=" + oCntx.Servicecasenumber + "&WODescription=" + oCntx.Projname.replace(/ /g, "%20");
		
			var sBaseUrl = "";
			
			if (sap.ui.Device.system.phone) {
				sBaseUrl = oCntx.MobileURL + "Page=home&";
			} else {
				sBaseUrl = oCntx.WebURL + "home?";
			}
			
			sap.m.URLHelper.redirect(sBaseUrl + sUrlParams, true);
		},
		
		/**
		 * Event handler to launch PCT application in Display Mode
		 * @name onLaunchPCTDisplayUrl
		 */
		onLaunchPCTDisplayUrl: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var sUrlParams = "WONumber=" + oCntx.Servicecasenumber;
			var sBaseUrl = "";
			
			if (sap.ui.Device.system.phone) {
				sBaseUrl = oCntx.MobileURL + "Page=Transaction&";
			} else {
				sBaseUrl = oCntx.WebURL + "transaction?";
			}
			
			sap.m.URLHelper.redirect(sBaseUrl + sUrlParams, true);
		},
		
		// End of PCR035112++ changes

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Internal method to create view model and clear passdown log
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_PASSDOWNVIEW,
				title: that._oResourceBundle.getText("passdownLog")
			});

			//Clear Passdown Log Text Area
			that.onPressClearPassdownLog();
		}

	});

});