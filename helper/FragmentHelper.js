/**
 * Handles all the fragment related interactions and 
 * also creates respective model for it.
 * 
 * @class
 * @public
 * @extends sap.ui.base.Object
 * @file com.amat.spg.labord.helper.FragmentHelper
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"../util/IdHelper",
	"../model/ResponseHandler",
	"../model/ModelObjects",
	"../util/Constants"
], function (Object, JSONModel, MessageBox, Device, IDH, ResponseHandler, ModelObj, Constants) {
	"use strict";

	var that = this;
	var FragmentHelper = Object.extend("com.amat.spg.labord.helper.FragmentHelper", {

		/**
		 * Handles all the fragment related interactions and also creates respective model for it.
		 * @class
		 * @param {sap.ui.core.mvc.Controller} oController - current controller reference
		 * @public
		 * @alias com.amat.spg.labord.helper.FragmentHelper
		 */
		constructor: function (oController) {
			that = this;
			var oComponent = oController.getComponent(),
				oDialogModel = oComponent.getModel(Constants.MDL_DIALOG);

			if (!oDialogModel) {
				var oModel = new JSONModel();
				oModel.setData({
					title: "",
					iconSrc: "",
					iconColor: "",
					dialogDescription: "",
					bMessageOpen: false,
					state: "",
					statusText: "",
					statusState: "None"
				});
				oComponent.setModel(oModel, Constants.MDL_DIALOG);
			}
		},

		/**
		 * This method is to create dialog fragment .
		 * @name createDialogFragment
		 * @param {Object} oFragment - fragment reference
		 * @returns {Object} this._oDialog - fragment reference
		 */
		createDialogFragment: function (oFragment) {
			var oView = this.getView();
			var oDialog;

			if (typeof oFragment === "object") {
				if (oFragment.sModelName) {
					this.getModel(oFragment.sModelName).setProperty("/sFragRef", oFragment.oFragRef);
				}

				if (!this[oFragment.oFragRef]) {
					this[oFragment.oFragRef] = sap.ui.xmlfragment(oView.getId(), oFragment.sFragRef, this);
				} else {
					this[oFragment.oFragRef].open();
					return this[oFragment.oFragRef];
				}

				oDialog = this[oFragment.oFragRef];
			} else {
				oDialog = this._oDialog = sap.ui.xmlfragment(oView.getId(), oFragment, this);
			}

			oView.addDependent(oDialog);
			jQuery.sap.syncStyleClass(Constants.STYLE_SIZECOMP, oView, oDialog);
			return oDialog;
		},

		/**
		 * This method holds all information to make dialog object .
		 * @name dialogFragmentContent
		 * @param {Object} oProperties - DialogFragment properties
		 */
		dialogFragmentContent: function (oProperties) {
			var oComponent = this.getOwnerComponent(),
				oDialogModel = oComponent.getModel(Constants.MDL_DIALOG);
			var oModelData;

			if (oDialogModel) {
				oModelData = oDialogModel.getData().dialogDescription = {};
				oModelData.infoDialogTitle = oProperties.hdr;
				oModelData.infoDialogIconSrc = oProperties.icon;
				oModelData.infoDialogIconColor = oProperties.color;
				oModelData.infoDialogDescription = oProperties.msg;
				oModelData.infoDialogStatusText = oProperties.statusText;
				oModelData.infoDialogStatusState = oProperties.statusState;
			}
		},

		/**
		 * This method helps in creating a fragment and add
		 * the content passed to it.
		 * @name openDialog
		 * @param {Object} oProperties - DialogFragment properties
		 */
		openDialog: function (oProperties) {
			that.dialogFragmentContent.call(this, oProperties);
			that.createDialogFragment.call(this, oProperties.dialogRef).open();
		},

		/**
		 * This method is to open busy dialog extension.
		 * @name openBusyDialogExt
		 * @param {string} sMsg - message to be displayed on the dialog.
		 */
		openBusyDialogExt: function (sMsg) {
			var oDialogProp = new ModelObj(Constants.MOBJ_ODIALOG);

			oDialogProp.msg = sMsg;
			that.dialogFragmentContent.call(this, oDialogProp);
			that.createDialogFragment.call(this, Constants.FRAG_BUSYDIALOG).open();
		},

		/**
		 * This method is to open confirmation dialog.
		 * @name openConfirmDialog
		 * @param {string} sMsg - message to be displayed on the dialog.
		 */
		openConfirmDialog: function (sMsg) {
			var oDialogProp = new ModelObj(Constants.MOBJ_ODIALOG);

			oDialogProp.hdr = this._oResourceBundle.getText("dialogHdrConfirm");
			oDialogProp.icon = IDH.icons.ICON_SAP_MSG_CNF;
			oDialogProp.color = Constants.CONFIRM_COLOR_CODE;
			oDialogProp.msg = sMsg;

			that.dialogFragmentContent.call(this, oDialogProp);
			that.createDialogFragment.call(this, Constants.FRAG_CONFIRM).open();
		},

		/**
		 * This method is to open Response dialog.
		 * @name openResponseDialog
		 * @param {Object} oProp - dialog properties
		 */
		openResponseDialog: function (oProp) {
			var oDialogProp = new ModelObj(Constants.MOBJ_ODIALOG);

			oDialogProp.msg = oProp.msg;
			oDialogProp.statusText = oProp.statusText;
			oDialogProp.statusState = oProp.statusState;

			that.dialogFragmentContent.call(this, oDialogProp);
			that.createDialogFragment.call(this, Constants.FRAG_RESPONSE).open();

			document.addEventListener("click", function closeDialog(oEvent) {
				if (oEvent.target.id === "sap-ui-blocklayer-popup") {
					var oDialog = sap.ui.getCore().byId($('div[id*="idDisplayResponse').attr("id"));
					
					if (oDialog) {
						oDialog.close();
					}
					document.removeEventListener("click", closeDialog);
				}
			});

			jQuery.sap.delayedCall(3000, this, function () {
				var oDialog = sap.ui.getCore().byId($('div[id*="idDisplayResponse').attr("id"));
					
				if (oDialog) {
					oDialog.close();
				}
			}.bind(this));
		},

		/**
		 * This method is to handle error response dialog.
		 * @name handleCallBackResponse
		 * @param {String} sEvent - event reference success or error
		 * @param {String} sMsg - success message i18n reference
		 */
		handleCallBackResponse: function (sEvent, sMsg) {
			var oDialogProp = new ModelObj(Constants.MOBJ_ODIALOG);
			var sSuccessEvt = this._oResourceBundle.getText("successResponseHeader");
			var sIcon = (sEvent === sSuccessEvt) ? IDH.icons.ICON_SAP_MSG_SUCCESS : IDH.icons.ICON_SAP_MSG_ERROR,
				sColorCode = (sEvent === sSuccessEvt) ? Constants.SUCCESS_COLOR_CODE : Constants.ERROR_COLOR_CODE;

			oDialogProp.hdr = sEvent;
			oDialogProp.icon = sIcon;
			oDialogProp.color = sColorCode;
			oDialogProp.msg = sMsg;

			that.dialogFragmentContent.call(this, oDialogProp);
			that.createDialogFragment.call(this, Constants.FRAG_INFODIALOG).open();
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {Object} oResponse a technical error to be displayed on request
		 * @param {fnCallback} sCallBackFn - close method
		 * @private
		 */
		showServiceError: function (oResponse, sCallBackFn) {
			var oComponent = this.getComponent(),
				oDialogModel = oComponent.getModel(Constants.MDL_DIALOG),
				bMessageOpen = oDialogModel.getProperty("/bMessageOpen"),
				sErrorText = oComponent.getModel(Constants.MDL_INTRNLZN).getResourceBundle().getText("errorText");
			var oErrorResponse = oResponse,
				sErrorMsgText = "";

			if (oDialogModel) {
				if (bMessageOpen) {
					return;
				}

				oDialogModel.setProperty("/bMessageOpen", true);
				sErrorText = oErrorResponse.hasOwnProperty("message") ? oErrorResponse.message : sErrorText;

				if (oErrorResponse.hasOwnProperty("d")) {
					sErrorMsgText = oErrorResponse.d.ErrorMessage;
				} else if (oErrorResponse.hasOwnProperty("mParameters")) {
					sErrorMsgText = oErrorResponse.getParameter("d").ErrorMessage;
				} else {
					oErrorResponse = ResponseHandler.handleErrorResponse.call(this, oResponse, this);
					sErrorMsgText = oErrorResponse.d.ErrorMessage;
				}

				MessageBox.error(
					sErrorText, {
						id: IDH.id.ERR_MSGBOX,
						details: sErrorMsgText,
						styleClass: oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: jQuery.proxy(this[sCallBackFn].bind(this))
					}
				);
			}
		},

		/**
		 * This method closes the dialog created for the controller instance.
		 * @name closeDialog
		 * @param {String} sFragRef - fragment reference
		 */
		closeDialog: function (sFragRef) {
			if (this[sFragRef]) {
				this[sFragRef].close();
			}
		},

		/**
		 * This method destroys the dialog created for the controller instance.
		 */
		destroyDialog: function () {
			var oDialogModel = this.getComponent().getModel(Constants.MDL_DIALOG);

			oDialogModel.setProperty("/bMessageOpen", false);

			if (this._oDialog) {
				if (this.getView() && this.getView().removeDependent(this._oDialog)) {
					this._oDialog.destroy(true);
					this._oDialog = null;
				}
			}
		}

	});

	return FragmentHelper;

});